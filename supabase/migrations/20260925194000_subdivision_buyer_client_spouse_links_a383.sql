-- A383 — vínculo declarado de cônjuge entre cadastros de Clientes Loteadora.
-- Estrutura aditiva: não cria nem altera boleto, cobrança, pagamento, baixa,
-- quitação, banco, Pix, transferência, split ou repasse.

create type public.subdivision_buyer_client_spouse_link_state as enum ('active', 'revoked');

create table public.subdivision_buyer_client_spouse_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  buyer_client_id uuid not null,
  spouse_buyer_client_id uuid not null,
  state public.subdivision_buyer_client_spouse_link_state not null default 'active',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_by uuid references public.identity_subjects(user_id) on delete restrict,
  constraint subdivision_buyer_client_spouse_links_canonical_order check (buyer_client_id < spouse_buyer_client_id),
  constraint subdivision_buyer_client_spouse_links_distinct check (buyer_client_id <> spouse_buyer_client_id),
  constraint subdivision_buyer_client_spouse_links_state check (
    (state = 'active' and revoked_at is null and revoked_by is null)
    or (state = 'revoked' and revoked_at is not null and revoked_by is not null)
  ),
  foreign key (buyer_client_id, organization_id)
    references public.subdivision_buyer_clients(id, organization_id) on delete restrict,
  foreign key (spouse_buyer_client_id, organization_id)
    references public.subdivision_buyer_clients(id, organization_id) on delete restrict
);
create unique index subdivision_buyer_client_spouse_links_active_pair
  on public.subdivision_buyer_client_spouse_links(organization_id, buyer_client_id, spouse_buyer_client_id)
  where state = 'active';
create index subdivision_buyer_client_spouse_links_context_lookup
  on public.subdivision_buyer_client_spouse_links(organization_id, buyer_client_id, spouse_buyer_client_id, state);
alter table public.subdivision_buyer_client_spouse_links enable row level security;

create or replace function private.subdivision_spouse_link_other_client(
  p_buyer_client_id uuid, p_first_buyer_client_id uuid, p_second_buyer_client_id uuid
) returns uuid language sql immutable security definer set search_path = '' as $$
  select case when p_buyer_client_id = p_first_buyer_client_id then p_second_buyer_client_id
              when p_buyer_client_id = p_second_buyer_client_id then p_first_buyer_client_id end;
$$;

create or replace function public.subdivision_get_draft_buyer_client_spouse_link(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_buyer_client_id uuid
) returns table(spouse_buyer_client_id uuid, spouse_display_name text, link_state text)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not private.subdivision_buyer_client_in_context(p_buyer_client_id, p_organization_id, p_purpose_code) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_BUYER_CLIENT_SPOUSE_CONTEXT_DENIED';
  end if;
  return query
  select private.subdivision_spouse_link_other_client(p_buyer_client_id, link.buyer_client_id, link.spouse_buyer_client_id), party.display_name, link.state::text
  from public.subdivision_buyer_client_spouse_links link
  join public.subdivision_buyer_clients spouse on spouse.id = private.subdivision_spouse_link_other_client(p_buyer_client_id, link.buyer_client_id, link.spouse_buyer_client_id)
    and spouse.organization_id = link.organization_id and spouse.state = 'draft'
  join public.party_role_assignments role_assignment on role_assignment.id = spouse.party_role_assignment_id and role_assignment.organization_id = spouse.organization_id
  join public.party_records party on party.id = role_assignment.party_id and party.organization_id = role_assignment.organization_id
  where link.organization_id = p_organization_id and link.state = 'active'
    and p_buyer_client_id in (link.buyer_client_id, link.spouse_buyer_client_id)
    and role_assignment.module = 'loteadora' and role_assignment.role in ('client', 'buyer')
    and lower(role_assignment.purpose_code) = lower(trim(p_purpose_code))
    and role_assignment.state = 'draft' and party.state = 'draft'
    and private.subdivision_buyer_client_in_context(spouse.id, p_organization_id, p_purpose_code)
  limit 1;
end;
$$;

create or replace function public.subdivision_upsert_draft_buyer_client_spouse_link(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_buyer_client_id uuid, p_spouse_buyer_client_id uuid, p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_first uuid; v_second uuid; v_link_id uuid; v_idempotent uuid;
  v_civil public.subdivision_buyer_client_civil_status;
  v_source_kind public.subdivision_buyer_client_profile_party_kind;
  v_spouse_kind public.subdivision_buyer_client_profile_party_kind;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_buyer_client_id = p_spouse_buyer_client_id then raise exception using errcode = '22023', message = 'SUBDIVISION_BUYER_CLIENT_SPOUSE_SELF_LINK_DENIED'; end if;
  if not private.subdivision_buyer_client_in_context(p_buyer_client_id, p_organization_id, p_purpose_code)
    or not private.subdivision_buyer_client_in_context(p_spouse_buyer_client_id, p_organization_id, p_purpose_code) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_BUYER_CLIENT_SPOUSE_CONTEXT_DENIED';
  end if;
  select event.target_id into v_idempotent from public.admin_audit_events event
    where event.command_name = 'subdivision_upsert_draft_buyer_client_spouse_link' and event.correlation_id = p_correlation_id
      and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed'
    order by event.occurred_at desc limit 1;
  if v_idempotent is not null then return v_idempotent; end if;
  select civil_status, party_kind into v_civil, v_source_kind from public.subdivision_buyer_client_profiles
    where organization_id = p_organization_id and buyer_client_id = p_buyer_client_id and state = 'draft';
  select party_kind into v_spouse_kind from public.subdivision_buyer_client_profiles
    where organization_id = p_organization_id and buyer_client_id = p_spouse_buyer_client_id and state = 'draft';
  if coalesce(v_source_kind::text, '') <> 'individual' or coalesce(v_spouse_kind::text, '') <> 'individual'
    or v_civil not in ('married', 'stable_union') then
    raise exception using errcode = '22023', message = 'SUBDIVISION_BUYER_CLIENT_SPOUSE_PROFILE_DENIED';
  end if;
  v_first := least(p_buyer_client_id, p_spouse_buyer_client_id); v_second := greatest(p_buyer_client_id, p_spouse_buyer_client_id);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || ':' || v_first::text || ':' || v_second::text, 0));
  insert into public.subdivision_buyer_client_spouse_links(organization_id, buyer_client_id, spouse_buyer_client_id, created_by)
  values (p_organization_id, v_first, v_second, p_actor_user_id)
  on conflict (organization_id, buyer_client_id, spouse_buyer_client_id) where state = 'active'
  do update set updated_at = now()
  returning id into v_link_id;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_upsert_draft_buyer_client_spouse_link', 'allowed', 'subdivision_buyer_client_spouse_link', v_link_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'relationship', 'spouse', 'civil_status', v_civil::text));
  return v_link_id;
end;
$$;

create or replace function public.subdivision_revoke_draft_buyer_client_spouse_link(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_buyer_client_id uuid, p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_link_id uuid; v_other uuid; v_idempotent uuid;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not private.subdivision_buyer_client_in_context(p_buyer_client_id, p_organization_id, p_purpose_code) then raise exception using errcode = '42501', message = 'SUBDIVISION_BUYER_CLIENT_SPOUSE_CONTEXT_DENIED'; end if;
  select event.target_id into v_idempotent from public.admin_audit_events event
    where event.command_name = 'subdivision_revoke_draft_buyer_client_spouse_link' and event.correlation_id = p_correlation_id
      and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed'
    order by event.occurred_at desc limit 1;
  if v_idempotent is not null then return v_idempotent; end if;
  select link.id, private.subdivision_spouse_link_other_client(p_buyer_client_id, link.buyer_client_id, link.spouse_buyer_client_id)
    into v_link_id, v_other from public.subdivision_buyer_client_spouse_links link
    where link.organization_id = p_organization_id and link.state = 'active'
      and p_buyer_client_id in (link.buyer_client_id, link.spouse_buyer_client_id) for update;
  if v_link_id is null then raise exception using errcode = '22023', message = 'SUBDIVISION_BUYER_CLIENT_SPOUSE_LINK_NOT_FOUND'; end if;
  if exists (select 1 from public.subdivision_sale_cases sale_case
    where sale_case.organization_id = p_organization_id and sale_case.state not in ('cancelled', 'archived')
      and sale_case.primary_buyer_client_id in (p_buyer_client_id, v_other)) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_BUYER_CLIENT_SPOUSE_ACTIVE_SALE_DENIED';
  end if;
  update public.subdivision_buyer_client_spouse_links set state = 'revoked', revoked_at = now(), revoked_by = p_actor_user_id, updated_at = now()
    where id = v_link_id and state = 'active';
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_revoke_draft_buyer_client_spouse_link', 'allowed', 'subdivision_buyer_client_spouse_link', v_link_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'relationship', 'spouse'));
  return v_link_id;
end;
$$;

create or replace function private.subdivision_add_declared_spouse_to_sale_case()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_civil public.subdivision_buyer_client_civil_status; v_spouse uuid;
begin
  select civil_status into v_civil from public.subdivision_buyer_client_profiles
    where organization_id = new.organization_id and buyer_client_id = new.primary_buyer_client_id and state = 'draft';
  if v_civil not in ('married', 'stable_union') then return new; end if;
  select private.subdivision_spouse_link_other_client(new.primary_buyer_client_id, link.buyer_client_id, link.spouse_buyer_client_id)
    into v_spouse from public.subdivision_buyer_client_spouse_links link
    where link.organization_id = new.organization_id and link.state = 'active'
      and new.primary_buyer_client_id in (link.buyer_client_id, link.spouse_buyer_client_id) limit 1;
  if v_spouse is null then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_SPOUSE_LINK_REQUIRED'; end if;
  insert into public.subdivision_sale_case_parties(organization_id, sale_case_id, buyer_client_id, party_role, created_by)
  values(new.organization_id, new.id, v_spouse, 'joint_proponent', new.created_by)
  on conflict (organization_id, sale_case_id, buyer_client_id) do nothing;
  return new;
end;
$$;
create trigger subdivision_sale_case_declared_spouse_insert
  after insert on public.subdivision_sale_cases for each row execute function private.subdivision_add_declared_spouse_to_sale_case();

create or replace function private.subdivision_enforce_declared_spouse_before_finalization()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_civil public.subdivision_buyer_client_civil_status; v_spouse uuid;
begin
  if new.state not in ('awaiting_approval', 'approved') then return new; end if;
  select civil_status into v_civil from public.subdivision_buyer_client_profiles
    where organization_id = new.organization_id and buyer_client_id = new.primary_buyer_client_id and state = 'draft';
  if v_civil not in ('married', 'stable_union') then return new; end if;
  select private.subdivision_spouse_link_other_client(new.primary_buyer_client_id, link.buyer_client_id, link.spouse_buyer_client_id)
    into v_spouse from public.subdivision_buyer_client_spouse_links link
    where link.organization_id = new.organization_id and link.state = 'active'
      and new.primary_buyer_client_id in (link.buyer_client_id, link.spouse_buyer_client_id) limit 1;
  if v_spouse is null or not exists (select 1 from public.subdivision_sale_case_parties party
    where party.organization_id = new.organization_id and party.sale_case_id = new.id
      and party.buyer_client_id = v_spouse and party.party_role = 'joint_proponent') then
    raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_SPOUSE_PARTY_REQUIRED';
  end if;
  return new;
end;
$$;
create trigger subdivision_sale_case_declared_spouse_finalization
  before update of state on public.subdivision_sale_cases for each row execute function private.subdivision_enforce_declared_spouse_before_finalization();

revoke all on table public.subdivision_buyer_client_spouse_links from public, anon, authenticated;
revoke all on function public.subdivision_get_draft_buyer_client_spouse_link(uuid,uuid,public.operating_module,text,uuid) from public, anon, authenticated;
revoke all on function public.subdivision_upsert_draft_buyer_client_spouse_link(uuid,uuid,public.operating_module,text,uuid,uuid,uuid) from public, anon, authenticated;
revoke all on function public.subdivision_revoke_draft_buyer_client_spouse_link(uuid,uuid,public.operating_module,text,uuid,uuid) from public, anon, authenticated;
grant execute on function public.subdivision_get_draft_buyer_client_spouse_link(uuid,uuid,public.operating_module,text,uuid) to service_role;
grant execute on function public.subdivision_upsert_draft_buyer_client_spouse_link(uuid,uuid,public.operating_module,text,uuid,uuid,uuid) to service_role;
grant execute on function public.subdivision_revoke_draft_buyer_client_spouse_link(uuid,uuid,public.operating_module,text,uuid,uuid) to service_role;
