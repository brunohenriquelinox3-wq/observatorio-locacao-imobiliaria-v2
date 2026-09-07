-- A291: caso de venda e termos de negociação em preparação.
-- Não reserva nem vende lote, não cria contrato, título, boleto, cobrança, pagamento ou integração bancária.

create type public.subdivision_sale_case_state as enum ('preparation', 'terms_review', 'awaiting_approval', 'approved', 'cancelled', 'archived');

create table public.subdivision_sale_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lot_id uuid not null,
  primary_buyer_client_id uuid not null,
  state public.subdivision_sale_case_state not null default 'preparation',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_sale_cases_tenant_match unique (id, organization_id),
  constraint subdivision_sale_cases_lot_tenant_fk foreign key (lot_id, organization_id) references public.subdivision_lots(id, organization_id) on delete restrict,
  constraint subdivision_sale_cases_buyer_tenant_fk foreign key (primary_buyer_client_id, organization_id) references public.subdivision_buyer_clients(id, organization_id) on delete restrict
);
create unique index subdivision_sale_cases_active_lot_unique on public.subdivision_sale_cases (organization_id, lot_id) where state not in ('cancelled', 'archived');
create index subdivision_sale_cases_context_state_lookup on public.subdivision_sale_cases (organization_id, state, updated_at desc);
alter table public.subdivision_sale_cases enable row level security;
revoke all on table public.subdivision_sale_cases from public, anon, authenticated;
comment on table public.subdivision_sale_cases is 'A291: preparação comercial auditada por lote e cliente; sem reserva, venda, contrato ou financeiro.';

create table public.subdivision_sale_case_terms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  sale_case_id uuid not null,
  version_number integer not null default 1 check (version_number between 1 and 9999),
  currency_code char(3) not null default 'BRL' check (currency_code = 'BRL'),
  negotiated_total_cents bigint null check (negotiated_total_cents between 0 and 100000000000000),
  entry_amount_cents bigint null check (entry_amount_cents between 0 and 100000000000000),
  installment_count integer not null default 0 check (installment_count between 0 and 480),
  installment_amount_cents bigint null check (installment_amount_cents between 0 and 100000000000000),
  first_due_date date null,
  due_day integer null check (due_day between 1 and 31),
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_sale_case_terms_case_tenant_fk foreign key (sale_case_id, organization_id) references public.subdivision_sale_cases(id, organization_id) on delete restrict,
  constraint subdivision_sale_case_terms_case_unique unique (organization_id, sale_case_id),
  constraint subdivision_sale_case_terms_installment_detail check ((installment_count = 0 and installment_amount_cents is null and first_due_date is null and due_day is null) or (installment_count > 0 and installment_amount_cents is not null and first_due_date is not null and due_day is not null))
);
alter table public.subdivision_sale_case_terms enable row level security;
revoke all on table public.subdivision_sale_case_terms from public, anon, authenticated;
comment on table public.subdivision_sale_case_terms is 'A291: termos flexíveis em preparação; não representa plano de recebíveis, título, boleto ou obrigação ativada.';

create or replace function public.subdivision_lookup_buyer_client_by_fiscal_reference(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_document_reference text
) returns table (buyer_client_id uuid, display_name text, party_kind text, profile_registration_state text)
language plpgsql security definer set search_path = '' as $$
declare v_document_reference text;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_CONTEXT_DENIED'; end if;
  v_document_reference := pg_catalog.regexp_replace(coalesce(p_document_reference, ''), '[^0-9]', '', 'g');
  if char_length(v_document_reference) not in (11, 14) then raise exception using errcode = '22023', message = 'SUBDIVISION_SALE_CASE_FISCAL_REFERENCE_DENIED'; end if;
  return query
    select client.id, party.display_name, profile.party_kind::text, profile.registration_state::text
    from public.subdivision_buyer_clients client
    join public.party_role_assignments role_assignment on role_assignment.id = client.party_role_assignment_id and role_assignment.organization_id = client.organization_id
    join public.party_records party on party.id = role_assignment.party_id and party.organization_id = role_assignment.organization_id
    join public.subdivision_buyer_client_profiles profile on profile.buyer_client_id = client.id and profile.organization_id = client.organization_id
    where client.organization_id = p_organization_id and client.state = 'draft'::public.party_lifecycle_state
      and role_assignment.module = 'loteadora' and role_assignment.role in ('client', 'buyer') and role_assignment.state = 'draft'::public.party_lifecycle_state
      and party.state = 'draft'::public.party_lifecycle_state and profile.state = 'draft'::public.party_lifecycle_state
      and profile.document_reference = v_document_reference
    order by profile.updated_at desc, client.id
    limit 1;
end; $$;

create or replace function public.subdivision_open_sale_case(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_lot_id uuid, p_buyer_client_id uuid, p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_idempotent_case_id uuid; v_existing_case_id uuid; v_existing_buyer_client_id uuid; v_lot_id uuid; v_case_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_CONTEXT_DENIED'; end if;
  select event.target_id into v_idempotent_case_id from public.admin_audit_events event where event.command_name = 'subdivision_open_sale_case' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_idempotent_case_id is not null then return v_idempotent_case_id; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || ':' || p_lot_id::text, 0));
  select lot.id into v_lot_id from public.subdivision_lots lot join public.subdivision_blocks block on block.id = lot.block_id and block.organization_id = lot.organization_id join public.subdivision_developments development on development.id = block.development_id and development.organization_id = block.organization_id where lot.id = p_lot_id and lot.organization_id = p_organization_id and lot.state = 'draft'::public.party_lifecycle_state and block.state = 'draft'::public.party_lifecycle_state and development.state = 'draft'::public.party_lifecycle_state for update of lot;
  if v_lot_id is null then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_LOT_CONTEXT_DENIED'; end if;
  if exists (select 1 from public.subdivision_lot_physical_reservations reservation where reservation.organization_id = p_organization_id and reservation.lot_id = p_lot_id) then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_PHYSICAL_RESTRICTION'; end if;
  if not exists (select 1 from public.subdivision_buyer_clients client join public.party_role_assignments role_assignment on role_assignment.id = client.party_role_assignment_id and role_assignment.organization_id = client.organization_id where client.id = p_buyer_client_id and client.organization_id = p_organization_id and client.state = 'draft'::public.party_lifecycle_state and role_assignment.module = 'loteadora' and role_assignment.role in ('client', 'buyer') and role_assignment.state = 'draft'::public.party_lifecycle_state) then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_BUYER_CONTEXT_DENIED'; end if;
  select sale_case.id, sale_case.primary_buyer_client_id into v_existing_case_id, v_existing_buyer_client_id from public.subdivision_sale_cases sale_case where sale_case.organization_id = p_organization_id and sale_case.lot_id = p_lot_id and sale_case.state not in ('cancelled', 'archived') order by sale_case.updated_at desc limit 1;
  if v_existing_case_id is not null then
    if v_existing_buyer_client_id = p_buyer_client_id then return v_existing_case_id; end if;
    raise exception using errcode = '23505', message = 'SUBDIVISION_SALE_CASE_LOT_BUSY';
  end if;
  insert into public.subdivision_sale_cases (organization_id, lot_id, primary_buyer_client_id, state, created_by) values (p_organization_id, p_lot_id, p_buyer_client_id, 'preparation', p_actor_user_id) returning id into v_case_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_open_sale_case', 'allowed', 'subdivision_sale_case', v_case_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'lot_present', true, 'buyer_client_present', true, 'state', 'preparation'));
  return v_case_id;
end; $$;

create or replace function public.subdivision_save_sale_case_terms(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_sale_case_id uuid, p_negotiated_total_cents bigint, p_entry_amount_cents bigint, p_installment_count integer,
  p_installment_amount_cents bigint, p_first_due_date date, p_due_day integer, p_correlation_id uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_idempotent_result jsonb; v_version integer; v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_CONTEXT_DENIED'; end if;
  select event.payload_redacted -> 'result' into v_idempotent_result from public.admin_audit_events event where event.command_name = 'subdivision_save_sale_case_terms' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_idempotent_result is not null then return v_idempotent_result; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || ':' || p_sale_case_id::text, 0));
  if not exists (select 1 from public.subdivision_sale_cases sale_case where sale_case.id = p_sale_case_id and sale_case.organization_id = p_organization_id and sale_case.state = 'preparation') then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_TERMS_CONTEXT_DENIED'; end if;
  if p_negotiated_total_cents is not null and p_negotiated_total_cents < 0 or p_entry_amount_cents is not null and p_entry_amount_cents < 0 or p_installment_count not between 0 and 480 or p_installment_amount_cents is not null and p_installment_amount_cents < 0 then raise exception using errcode = '22023', message = 'SUBDIVISION_SALE_CASE_TERMS_VALUE_DENIED'; end if;
  if (p_installment_count = 0 and (p_installment_amount_cents is not null or p_first_due_date is not null or p_due_day is not null)) or (p_installment_count > 0 and (p_installment_amount_cents is null or p_first_due_date is null or p_due_day is null)) then raise exception using errcode = '22023', message = 'SUBDIVISION_SALE_CASE_TERMS_INSTALLMENT_DENIED'; end if;
  insert into public.subdivision_sale_case_terms (organization_id, sale_case_id, version_number, negotiated_total_cents, entry_amount_cents, installment_count, installment_amount_cents, first_due_date, due_day, created_by) values (p_organization_id, p_sale_case_id, 1, p_negotiated_total_cents, p_entry_amount_cents, p_installment_count, p_installment_amount_cents, p_first_due_date, p_due_day, p_actor_user_id) on conflict (organization_id, sale_case_id) do update set version_number = public.subdivision_sale_case_terms.version_number + 1, negotiated_total_cents = excluded.negotiated_total_cents, entry_amount_cents = excluded.entry_amount_cents, installment_count = excluded.installment_count, installment_amount_cents = excluded.installment_amount_cents, first_due_date = excluded.first_due_date, due_day = excluded.due_day, created_by = excluded.created_by, updated_at = now() returning version_number into v_version;
  v_result := jsonb_build_object('sale_case_id', p_sale_case_id, 'terms_version', v_version, 'state', 'preparation');
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_save_sale_case_terms', 'allowed', 'subdivision_sale_case', p_sale_case_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'negotiated_total_present', p_negotiated_total_cents is not null, 'entry_amount_present', p_entry_amount_cents is not null, 'installment_count', p_installment_count, 'installment_amount_present', p_installment_amount_cents is not null, 'first_due_date_present', p_first_due_date is not null, 'due_day_present', p_due_day is not null, 'result', v_result));
  return v_result;
end; $$;

create or replace function public.subdivision_list_sale_cases(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text
) returns table (sale_case_id uuid, lot_id uuid, buyer_client_id uuid, state public.subdivision_sale_case_state, terms_version integer, negotiated_total_cents bigint, entry_amount_cents bigint, installment_count integer, installment_amount_cents bigint, first_due_date date, due_day integer, created_at timestamptz, updated_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query select sale_case.id, sale_case.lot_id, sale_case.primary_buyer_client_id, sale_case.state, terms.version_number, terms.negotiated_total_cents, terms.entry_amount_cents, coalesce(terms.installment_count, 0), terms.installment_amount_cents, terms.first_due_date, terms.due_day, sale_case.created_at, sale_case.updated_at from public.subdivision_sale_cases sale_case left join public.subdivision_sale_case_terms terms on terms.sale_case_id = sale_case.id and terms.organization_id = sale_case.organization_id where sale_case.organization_id = p_organization_id and sale_case.state not in ('archived') order by sale_case.updated_at desc, sale_case.id;
end; $$;

revoke all on function public.subdivision_lookup_buyer_client_by_fiscal_reference(uuid, uuid, public.operating_module, text, text), public.subdivision_open_sale_case(uuid, uuid, public.operating_module, text, uuid, uuid, uuid), public.subdivision_save_sale_case_terms(uuid, uuid, public.operating_module, text, uuid, bigint, bigint, integer, bigint, date, integer, uuid), public.subdivision_list_sale_cases(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.subdivision_lookup_buyer_client_by_fiscal_reference(uuid, uuid, public.operating_module, text, text), public.subdivision_open_sale_case(uuid, uuid, public.operating_module, text, uuid, uuid, uuid), public.subdivision_save_sale_case_terms(uuid, uuid, public.operating_module, text, uuid, bigint, bigint, integer, bigint, date, integer, uuid), public.subdivision_list_sale_cases(uuid, uuid, public.operating_module, text) to service_role;
