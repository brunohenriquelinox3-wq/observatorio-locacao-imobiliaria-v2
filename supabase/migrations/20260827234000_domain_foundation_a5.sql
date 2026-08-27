-- A5 — Núcleo canônico de contexto, Party e papel temporal.
-- Não contém dados, dossiê, identificadores fiscais, financeiro, contrato ou integração externa.

create type public.operating_module as enum ('vendas_urbanas', 'locacao');
create type public.party_kind as enum ('individual', 'legal_entity');
create type public.party_lifecycle_state as enum ('draft', 'archived');
create type public.party_role_kind as enum (
  'lead', 'client', 'buyer', 'seller', 'owner', 'tenant', 'guarantor',
  'representative', 'broker', 'provider'
);

create table public.party_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  kind public.party_kind not null,
  display_name text not null check (char_length(trim(display_name)) between 2 and 160),
  source_kind text not null check (source_kind in ('operator_declaration', 'import_preview')),
  state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index party_records_organization_state_lookup
  on public.party_records (organization_id, state, created_at desc);

create table public.party_role_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  party_id uuid not null references public.party_records(id) on delete restrict,
  module public.operating_module not null,
  role public.party_role_kind not null,
  purpose_code text not null check (char_length(trim(purpose_code)) between 3 and 96),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint party_role_assignments_window check (ends_at is null or ends_at > starts_at),
  constraint party_role_assignments_tenant_match unique (id, organization_id)
);

create index party_role_assignments_context_lookup
  on public.party_role_assignments (organization_id, module, role, state, starts_at desc);
create index party_role_assignments_party_lookup
  on public.party_role_assignments (party_id, organization_id, module, state);

alter table public.party_records enable row level security;
alter table public.party_role_assignments enable row level security;
revoke all on table public.party_records from public, anon, authenticated;
revoke all on table public.party_role_assignments from public, anon, authenticated;

create or replace function private.require_domain_draft_authority(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.organization_memberships membership
    join public.administrative_grants grant_record
      on grant_record.membership_id = membership.id
      and grant_record.organization_id = membership.organization_id
      and grant_record.user_id = membership.user_id
    join public.identity_subjects subject on subject.user_id = membership.user_id
    where membership.user_id = p_actor_user_id
      and membership.organization_id = p_organization_id
      and membership.role in ('organization_admin', 'area_admin', 'operator')
      and membership.state = 'active'
      and membership.starts_at <= now()
      and (membership.expires_at is null or membership.expires_at > now())
      and grant_record.state = 'active'
      and grant_record.starts_at <= now()
      and (grant_record.expires_at is null or grant_record.expires_at > now())
      and grant_record.purpose_code = trim(p_purpose_code)
      and (grant_record.scope_selector -> 'modules') ? p_module::text
      and subject.lifecycle_state = 'active'
  ) then
    raise exception using errcode = '42501', message = 'DOMAIN_CONTEXT_DENIED';
  end if;
end;
$$;

revoke all on function private.require_domain_draft_authority(uuid, uuid, public.operating_module, text) from public, anon, authenticated;

create or replace function public.domain_create_draft_party(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_kind public.party_kind,
  p_display_name text,
  p_source_kind text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_target uuid;
  v_party_id uuid;
begin
  perform private.require_domain_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);

  select event.target_id into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'domain_create_draft_party'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;

  if p_source_kind not in ('operator_declaration', 'import_preview') then
    raise exception using errcode = '42501', message = 'PARTY_SOURCE_DENIED';
  end if;

  insert into public.party_records (organization_id, kind, display_name, source_kind, state, created_by)
  values (p_organization_id, p_kind, trim(p_display_name), p_source_kind, 'draft', p_actor_user_id)
  returning id into v_party_id;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'domain_create_draft_party', 'allowed', 'party', v_party_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'kind', p_kind::text)
  );
  return v_party_id;
end;
$$;

create or replace function public.domain_assign_draft_party_role(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_party_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_role public.party_role_kind,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_target uuid;
  v_role_id uuid;
begin
  perform private.require_domain_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);

  select event.target_id into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'domain_assign_draft_party_role'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;

  if not exists (
    select 1 from public.party_records party
    where party.id = p_party_id and party.organization_id = p_organization_id and party.state = 'draft'
  ) then
    raise exception using errcode = '42501', message = 'PARTY_CONTEXT_DENIED';
  end if;

  insert into public.party_role_assignments (
    organization_id, party_id, module, role, purpose_code, starts_at, ends_at, state, created_by
  ) values (
    p_organization_id, p_party_id, p_module, p_role, trim(p_purpose_code), coalesce(p_starts_at, now()), p_ends_at, 'draft', p_actor_user_id
  ) returning id into v_role_id;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'domain_assign_draft_party_role', 'allowed', 'party_role', v_role_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'role', p_role::text)
  );
  return v_role_id;
end;
$$;

revoke all on function public.domain_create_draft_party(uuid, uuid, public.operating_module, text, public.party_kind, text, text, uuid) from public, anon, authenticated;
revoke all on function public.domain_assign_draft_party_role(uuid, uuid, uuid, public.operating_module, text, public.party_role_kind, timestamptz, timestamptz, uuid) from public, anon, authenticated;
grant execute on function public.domain_create_draft_party(uuid, uuid, public.operating_module, text, public.party_kind, text, text, uuid) to service_role;
grant execute on function public.domain_assign_draft_party_role(uuid, uuid, uuid, public.operating_module, text, public.party_role_kind, timestamptz, timestamptz, uuid) to service_role;

comment on table public.party_records is 'A5: Party canônica minimizada; não contém dossiê, identificador fiscal, contato ou estado financeiro.';
comment on table public.party_role_assignments is 'A5: papel temporal contextual; não concede login, grant, representação ou autoridade financeira.';
