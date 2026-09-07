-- A304: proponentes conjuntos, reconciliação de termos e calendário de parcelas.
-- Preserva o controle interno: não gera boleto bancário, linha digitável, remessa, cobrança, mensagem, baixa ou pagamento.

create type public.subdivision_sale_case_party_role as enum ('primary_proponent', 'joint_proponent');

create table public.subdivision_sale_case_parties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  sale_case_id uuid not null,
  buyer_client_id uuid not null,
  party_role public.subdivision_sale_case_party_role not null,
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_sale_case_parties_case_tenant_fk foreign key (sale_case_id, organization_id) references public.subdivision_sale_cases(id, organization_id) on delete restrict,
  constraint subdivision_sale_case_parties_buyer_tenant_fk foreign key (buyer_client_id, organization_id) references public.subdivision_buyer_clients(id, organization_id) on delete restrict,
  constraint subdivision_sale_case_parties_unique unique (organization_id, sale_case_id, buyer_client_id)
);
create unique index subdivision_sale_case_parties_primary_unique on public.subdivision_sale_case_parties(organization_id, sale_case_id) where party_role = 'primary_proponent';
alter table public.subdivision_sale_case_parties enable row level security;
revoke all on table public.subdivision_sale_case_parties from public, anon, authenticated;
comment on table public.subdivision_sale_case_parties is 'A304: proponentes de venda conjunta; sem percentual, assinatura, cobrança, banco, baixa ou pagamento.';

insert into public.subdivision_sale_case_parties (organization_id, sale_case_id, buyer_client_id, party_role, created_by)
select organization_id, id, primary_buyer_client_id, 'primary_proponent'::public.subdivision_sale_case_party_role, created_by
from public.subdivision_sale_cases
on conflict (organization_id, sale_case_id, buyer_client_id) do nothing;

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
    if v_existing_buyer_client_id = p_buyer_client_id then
      insert into public.subdivision_sale_case_parties(organization_id, sale_case_id, buyer_client_id, party_role, created_by) values (p_organization_id, v_existing_case_id, p_buyer_client_id, 'primary_proponent', p_actor_user_id) on conflict (organization_id, sale_case_id, buyer_client_id) do nothing;
      return v_existing_case_id;
    end if;
    raise exception using errcode = '23505', message = 'SUBDIVISION_SALE_CASE_LOT_BUSY';
  end if;
  insert into public.subdivision_sale_cases (organization_id, lot_id, primary_buyer_client_id, state, created_by) values (p_organization_id, p_lot_id, p_buyer_client_id, 'preparation', p_actor_user_id) returning id into v_case_id;
  insert into public.subdivision_sale_case_parties(organization_id, sale_case_id, buyer_client_id, party_role, created_by) values (p_organization_id, v_case_id, p_buyer_client_id, 'primary_proponent', p_actor_user_id);
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_open_sale_case', 'allowed', 'subdivision_sale_case', v_case_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'lot_present', true, 'buyer_client_present', true, 'primary_proponent_present', true, 'state', 'preparation'));
  return v_case_id;
end; $$;

create function public.subdivision_add_sale_case_joint_proponent(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_sale_case_id uuid, p_buyer_client_id uuid, p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_idempotent_party_id uuid; v_party_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_PARTY_CONTEXT_DENIED'; end if;
  select event.target_id into v_idempotent_party_id from public.admin_audit_events event where event.command_name = 'subdivision_add_sale_case_joint_proponent' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_idempotent_party_id is not null then return v_idempotent_party_id; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || ':' || p_sale_case_id::text, 0));
  if not exists (select 1 from public.subdivision_sale_cases sale_case where sale_case.id = p_sale_case_id and sale_case.organization_id = p_organization_id and sale_case.state = 'preparation') then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_PARTY_STATE_DENIED'; end if;
  if not exists (select 1 from public.subdivision_buyer_clients client join public.party_role_assignments role_assignment on role_assignment.id = client.party_role_assignment_id and role_assignment.organization_id = client.organization_id where client.id = p_buyer_client_id and client.organization_id = p_organization_id and client.state = 'draft'::public.party_lifecycle_state and role_assignment.module = 'loteadora' and role_assignment.role in ('client', 'buyer') and role_assignment.state = 'draft'::public.party_lifecycle_state) then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_PARTY_BUYER_DENIED'; end if;
  if exists (select 1 from public.subdivision_sale_case_parties party where party.organization_id = p_organization_id and party.sale_case_id = p_sale_case_id and party.buyer_client_id = p_buyer_client_id and party.party_role = 'primary_proponent') then raise exception using errcode = '22023', message = 'SUBDIVISION_SALE_CASE_PARTY_PRIMARY_DENIED'; end if;
  insert into public.subdivision_sale_case_parties(organization_id, sale_case_id, buyer_client_id, party_role, created_by) values(p_organization_id, p_sale_case_id, p_buyer_client_id, 'joint_proponent', p_actor_user_id) on conflict(organization_id, sale_case_id, buyer_client_id) do update set updated_at = public.subdivision_sale_case_parties.updated_at returning id into v_party_id;
  update public.subdivision_sale_case_dossier_reviews set dossier_state = 'review_required', reason_code = 'proponentes_alterados', reviewed_by = p_actor_user_id, updated_at = now() where organization_id = p_organization_id and sale_case_id = p_sale_case_id and dossier_state = 'ready_for_approval';
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_add_sale_case_joint_proponent', 'allowed', 'subdivision_sale_case_party', v_party_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'joint_proponent_linked', true));
  return v_party_id;
end; $$;

create function public.subdivision_remove_sale_case_joint_proponent(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_sale_case_id uuid, p_buyer_client_id uuid, p_correlation_id uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_idempotent jsonb; v_removed integer; v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_PARTY_CONTEXT_DENIED'; end if;
  select event.payload_redacted -> 'result' into v_idempotent from public.admin_audit_events event where event.command_name = 'subdivision_remove_sale_case_joint_proponent' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_idempotent is not null then return v_idempotent; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || ':' || p_sale_case_id::text, 0));
  if not exists (select 1 from public.subdivision_sale_cases sale_case where sale_case.id = p_sale_case_id and sale_case.organization_id = p_organization_id and sale_case.state = 'preparation') then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_PARTY_STATE_DENIED'; end if;
  delete from public.subdivision_sale_case_parties where organization_id = p_organization_id and sale_case_id = p_sale_case_id and buyer_client_id = p_buyer_client_id and party_role = 'joint_proponent';
  get diagnostics v_removed = row_count;
  if v_removed <> 1 then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_PARTY_REMOVAL_DENIED'; end if;
  update public.subdivision_sale_case_dossier_reviews set dossier_state = 'review_required', reason_code = 'proponentes_alterados', reviewed_by = p_actor_user_id, updated_at = now() where organization_id = p_organization_id and sale_case_id = p_sale_case_id and dossier_state = 'ready_for_approval';
  v_result := jsonb_build_object('sale_case_id', p_sale_case_id, 'joint_proponent_removed', true);
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_remove_sale_case_joint_proponent', 'allowed', 'subdivision_sale_case', p_sale_case_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'joint_proponent_removed', true, 'result', v_result));
  return v_result;
end; $$;

create function public.subdivision_list_sale_case_parties(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text
) returns table(sale_case_id uuid, buyer_client_id uuid, party_role public.subdivision_sale_case_party_role) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_PARTY_CONTEXT_DENIED'; end if;
  return query select party.sale_case_id, party.buyer_client_id, party.party_role from public.subdivision_sale_case_parties party join public.subdivision_sale_cases sale_case on sale_case.id = party.sale_case_id and sale_case.organization_id = party.organization_id where party.organization_id = p_organization_id and sale_case.state <> 'archived' order by party.sale_case_id, case when party.party_role = 'primary_proponent' then 0 else 1 end, party.created_at;
end; $$;

create or replace function public.subdivision_save_sale_case_terms(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_sale_case_id uuid, p_negotiated_total_cents bigint, p_entry_amount_cents bigint, p_entry_due_date date, p_installment_count integer, p_installment_amount_cents bigint, p_first_due_date date, p_due_day integer, p_correlation_id uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_idempotent_result jsonb; v_version integer; v_result jsonb; v_composed_total bigint;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_CONTEXT_DENIED'; end if;
  select event.payload_redacted -> 'result' into v_idempotent_result from public.admin_audit_events event where event.command_name = 'subdivision_save_sale_case_terms' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_idempotent_result is not null then return v_idempotent_result; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || ':' || p_sale_case_id::text, 0));
  if not exists (select 1 from public.subdivision_sale_cases sale_case where sale_case.id = p_sale_case_id and sale_case.organization_id = p_organization_id and sale_case.state = 'preparation') then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_TERMS_CONTEXT_DENIED'; end if;
  if p_negotiated_total_cents is null or p_negotiated_total_cents <= 0 or coalesce(p_entry_amount_cents, 0) < 0 or p_installment_count not between 0 and 480 or coalesce(p_installment_amount_cents, 0) < 0 then raise exception using errcode = '22023', message = 'SUBDIVISION_SALE_CASE_TERMS_VALUE_DENIED'; end if;
  if (coalesce(p_entry_amount_cents, 0) = 0 and p_entry_due_date is not null) or (coalesce(p_entry_amount_cents, 0) > 0 and p_entry_due_date is null) then raise exception using errcode = '22023', message = 'SUBDIVISION_SALE_CASE_TERMS_ENTRY_DENIED'; end if;
  if (p_installment_count = 0 and (p_installment_amount_cents is not null or p_first_due_date is not null or p_due_day is not null)) or (p_installment_count > 0 and (p_installment_amount_cents is null or p_first_due_date is null or p_due_day is null)) then raise exception using errcode = '22023', message = 'SUBDIVISION_SALE_CASE_TERMS_INSTALLMENT_DENIED'; end if;
  if p_installment_count > 0 and extract(day from p_first_due_date)::integer <> p_due_day then raise exception using errcode = '22023', message = 'SUBDIVISION_SALE_CASE_TERMS_DUE_DAY_DENIED'; end if;
  v_composed_total := coalesce(p_entry_amount_cents, 0) + p_installment_count * coalesce(p_installment_amount_cents, 0);
  if v_composed_total <> p_negotiated_total_cents then raise exception using errcode = '22023', message = 'SUBDIVISION_SALE_CASE_TERMS_TOTAL_DENIED'; end if;
  insert into public.subdivision_sale_case_terms (organization_id, sale_case_id, version_number, negotiated_total_cents, entry_amount_cents, entry_due_date, installment_count, installment_amount_cents, first_due_date, due_day, created_by) values (p_organization_id, p_sale_case_id, 1, p_negotiated_total_cents, p_entry_amount_cents, p_entry_due_date, p_installment_count, p_installment_amount_cents, p_first_due_date, p_due_day, p_actor_user_id) on conflict (organization_id, sale_case_id) do update set version_number = public.subdivision_sale_case_terms.version_number + 1, negotiated_total_cents = excluded.negotiated_total_cents, entry_amount_cents = excluded.entry_amount_cents, entry_due_date = excluded.entry_due_date, installment_count = excluded.installment_count, installment_amount_cents = excluded.installment_amount_cents, first_due_date = excluded.first_due_date, due_day = excluded.due_day, created_by = excluded.created_by, updated_at = now() returning version_number into v_version;
  v_result := jsonb_build_object('sale_case_id', p_sale_case_id, 'terms_version', v_version, 'state', 'preparation');
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_save_sale_case_terms', 'allowed', 'subdivision_sale_case', p_sale_case_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'negotiated_total_present', true, 'entry_amount_present', coalesce(p_entry_amount_cents, 0) > 0, 'installment_count', p_installment_count, 'installment_amount_present', p_installment_count > 0, 'calendar_validated', p_installment_count = 0 or p_due_day is not null, 'total_reconciled', true, 'result', v_result));
  return v_result;
end; $$;

create or replace function public.subdivision_formalize_sale_case(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_sale_case_id uuid, p_correlation_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_contract_id uuid; v_terms record; v_item_count integer; v_total bigint; v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_FORMALIZATION_CONTEXT_DENIED'; end if;
  select target_id into v_existing from public.admin_audit_events event where event.command_name = 'subdivision_formalize_sale_case' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_existing is not null then select count(*)::integer into v_item_count from public.subdivision_sale_receivable_schedules where organization_id = p_organization_id and contract_preparation_id = v_existing; return jsonb_build_object('contract_preparation_id', v_existing, 'sale_case_id', p_sale_case_id, 'scheduled_item_count', v_item_count, 'bank_issuance_state', 'awaiting_bank_issue'); end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || ':' || p_sale_case_id::text, 0));
  select terms.* into v_terms from public.subdivision_sale_case_terms terms join public.subdivision_sale_cases sale_case on sale_case.id = terms.sale_case_id and sale_case.organization_id = terms.organization_id where terms.sale_case_id = p_sale_case_id and terms.organization_id = p_organization_id and sale_case.state = 'preparation' for update of terms, sale_case;
  if v_terms.id is null or v_terms.negotiated_total_cents is null then raise exception using errcode = '22023', message = 'SUBDIVISION_SALE_FORMALIZATION_TERMS_REQUIRED'; end if;
  v_total := coalesce(v_terms.entry_amount_cents, 0) + coalesce(v_terms.installment_count, 0) * coalesce(v_terms.installment_amount_cents, 0);
  if v_total <> v_terms.negotiated_total_cents or v_total = 0 then raise exception using errcode = '22023', message = 'SUBDIVISION_SALE_FORMALIZATION_TOTAL_DENIED'; end if;
  insert into public.subdivision_sale_contract_preparations(organization_id, sale_case_id, terms_version, state, created_by) values(p_organization_id, p_sale_case_id, v_terms.version_number, 'internal_review', p_actor_user_id) on conflict(organization_id, sale_case_id) do update set updated_at = public.subdivision_sale_contract_preparations.updated_at returning id into v_contract_id;
  if not exists (select 1 from public.subdivision_sale_receivable_schedules where organization_id = p_organization_id and contract_preparation_id = v_contract_id) then
    if coalesce(v_terms.entry_amount_cents, 0) > 0 then insert into public.subdivision_sale_receivable_schedules(organization_id, contract_preparation_id, installment_number, installment_kind, due_date, amount_cents, created_by) values(p_organization_id, v_contract_id, 0, 'entry', v_terms.entry_due_date, v_terms.entry_amount_cents, p_actor_user_id); end if;
    if v_terms.installment_count > 0 then
      insert into public.subdivision_sale_receivable_schedules(organization_id, contract_preparation_id, installment_number, installment_kind, due_date, amount_cents, created_by)
      select p_organization_id, v_contract_id, n, 'installment', case when n = 1 then v_terms.first_due_date else pg_catalog.make_date(extract(year from (pg_catalog.date_trunc('month', v_terms.first_due_date::timestamp) + (n - 1) * interval '1 month'))::integer, extract(month from (pg_catalog.date_trunc('month', v_terms.first_due_date::timestamp) + (n - 1) * interval '1 month'))::integer, least(v_terms.due_day, extract(day from (pg_catalog.date_trunc('month', v_terms.first_due_date::timestamp) + n * interval '1 month - 1 day'))::integer)) end, v_terms.installment_amount_cents, p_actor_user_id from generate_series(1, v_terms.installment_count) as n;
    end if;
  end if;
  select count(*)::integer into v_item_count from public.subdivision_sale_receivable_schedules where organization_id = p_organization_id and contract_preparation_id = v_contract_id;
  update public.subdivision_sale_cases set state = 'terms_review', updated_at = now() where id = p_sale_case_id and organization_id = p_organization_id;
  v_result := jsonb_build_object('contract_preparation_id', v_contract_id, 'sale_case_id', p_sale_case_id, 'scheduled_item_count', v_item_count, 'bank_issuance_state', 'awaiting_bank_issue');
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_formalize_sale_case', 'allowed', 'subdivision_sale_contract_preparation', v_contract_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'terms_version', v_terms.version_number, 'scheduled_item_count', v_item_count, 'calendar_validated', true, 'bank_issuance_state', 'awaiting_bank_issue', 'result', v_result));
  return v_result;
end; $$;

create or replace function public.subdivision_list_internal_receivable_attention(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text) returns table(contract_preparation_id uuid, due_within_four_days_count integer, past_due_unreconciled_count integer) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_INTERNAL_RECEIVABLE_ATTENTION_CONTEXT_DENIED'; end if;
  return query select contract.id, count(schedule.id) filter(where schedule.due_date between current_date and current_date + coalesce(configuration.lead_days, 4))::integer, count(schedule.id) filter(where schedule.due_date < current_date)::integer from public.subdivision_sale_contract_preparations contract left join public.subdivision_sale_receivable_schedules schedule on schedule.contract_preparation_id = contract.id and schedule.organization_id = contract.organization_id and schedule.bank_issuance_state = 'awaiting_bank_issue' left join public.subdivision_internal_receivable_alert_configurations configuration on configuration.organization_id = contract.organization_id where contract.organization_id = p_organization_id and contract.state = 'approved' group by contract.id, configuration.lead_days;
end; $$;

revoke all on function public.subdivision_add_sale_case_joint_proponent(uuid,uuid,public.operating_module,text,uuid,uuid,uuid), public.subdivision_remove_sale_case_joint_proponent(uuid,uuid,public.operating_module,text,uuid,uuid,uuid), public.subdivision_list_sale_case_parties(uuid,uuid,public.operating_module,text) from public, anon, authenticated;
grant execute on function public.subdivision_add_sale_case_joint_proponent(uuid,uuid,public.operating_module,text,uuid,uuid,uuid), public.subdivision_remove_sale_case_joint_proponent(uuid,uuid,public.operating_module,text,uuid,uuid,uuid), public.subdivision_list_sale_case_parties(uuid,uuid,public.operating_module,text) to service_role;
