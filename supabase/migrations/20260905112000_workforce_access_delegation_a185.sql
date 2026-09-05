-- A185 — Solicitação, preparação e aceite de acesso de colaboradores e corretores.
-- Não cria credencial, convite externo, e-mail, acesso automático, contrato ou domínio financeiro.

create type public.workforce_profile as enum ('collaborator', 'broker');
create type public.workforce_access_request_state as enum ('requested', 'prepared', 'active', 'expired', 'withdrawn', 'rejected');

create table public.workforce_access_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references public.identity_subjects(user_id) on delete restrict,
  workforce_profile public.workforce_profile not null,
  state public.workforce_access_request_state not null default 'requested',
  expires_at timestamptz not null default (now() + interval '7 days'),
  membership_id uuid references public.organization_memberships(id) on delete set null,
  grant_id uuid references public.administrative_grants(id) on delete set null,
  prepared_by uuid references public.identity_subjects(user_id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workforce_access_request_prepared_link check (
    (state in ('prepared', 'active') and membership_id is not null and grant_id is not null and prepared_by is not null)
    or state not in ('prepared', 'active')
  ),
  constraint workforce_access_request_acceptance check (
    (state = 'active' and accepted_at is not null) or state <> 'active'
  )
);

create unique index workforce_access_requests_one_open_request
  on public.workforce_access_requests (organization_id, user_id)
  where state in ('requested', 'prepared');
create index workforce_access_requests_actor_state
  on public.workforce_access_requests (user_id, state, expires_at desc);
create index workforce_access_requests_organization_state
  on public.workforce_access_requests (organization_id, state, expires_at desc);

alter table public.workforce_access_requests enable row level security;
revoke all on table public.workforce_access_requests from public, anon, authenticated;

create or replace function private.require_active_organization_admin(
  p_actor_user_id uuid,
  p_organization_id uuid
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
    where membership.organization_id = p_organization_id
      and membership.user_id = p_actor_user_id
      and membership.role = 'organization_admin'
      and membership.state = 'active'
      and (membership.expires_at is null or membership.expires_at > now())
      and grant_record.state = 'active'
      and (grant_record.expires_at is null or grant_record.expires_at > now())
      and subject.lifecycle_state = 'active'
  ) then
    raise exception using errcode = '42501', message = 'ORGANIZATION_ADMIN_DELEGATION_DENIED';
  end if;
end;
$$;

create or replace function private.validate_workforce_scope(
  p_scope_selector jsonb,
  p_expires_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if jsonb_typeof(p_scope_selector) <> 'object'
    or jsonb_typeof(p_scope_selector -> 'modules') <> 'array'
    or jsonb_array_length(p_scope_selector -> 'modules') < 1
    or jsonb_array_length(p_scope_selector -> 'modules') > 3
    or exists (
      select 1
      from jsonb_array_elements_text(p_scope_selector -> 'modules') module_name
      where module_name not in ('loteadora', 'vendas_urbanas', 'locacao')
    )
    or p_expires_at <= now()
    or p_expires_at > now() + interval '90 days'
  then
    raise exception using errcode = '42501', message = 'WORKFORCE_SCOPE_INVALID';
  end if;
end;
$$;

create or replace function public.organization_request_workforce_access(
  p_actor_user_id uuid,
  p_organization_reference text,
  p_workforce_profile public.workforce_profile,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_target uuid;
  v_organization_id uuid;
  v_request_id uuid;
begin
  select event.target_id into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'organization_request_workforce_access'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;

  if not exists (
    select 1 from public.identity_subjects subject
    where subject.user_id = p_actor_user_id and subject.lifecycle_state = 'active'
  ) then
    raise exception using errcode = '42501', message = 'WORKFORCE_REQUEST_DENIED';
  end if;

  select organization.id into v_organization_id
  from public.organizations organization
  where lower(organization.name) = lower(trim(p_organization_reference))
    and organization.state in ('draft', 'active')
  limit 1;
  if v_organization_id is null or exists (
    select 1 from public.organization_memberships membership
    where membership.organization_id = v_organization_id and membership.user_id = p_actor_user_id
  ) then
    raise exception using errcode = '42501', message = 'WORKFORCE_REQUEST_DENIED';
  end if;

  insert into public.workforce_access_requests (organization_id, user_id, workforce_profile)
  values (v_organization_id, p_actor_user_id, p_workforce_profile)
  returning id into v_request_id;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, v_organization_id, 'organization_request_workforce_access', 'allowed',
    'workforce_access_request', v_request_id, jsonb_build_object('profile', p_workforce_profile::text)
  );
  return v_request_id;
end;
$$;

create or replace function public.organization_list_own_workforce_access_requests(
  p_actor_user_id uuid
)
returns table(request_id uuid, organization_label text, workforce_profile public.workforce_profile, request_state public.workforce_access_request_state)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.identity_subjects subject where subject.user_id = p_actor_user_id and subject.lifecycle_state = 'active') then
    raise exception using errcode = '42501', message = 'WORKFORCE_REQUEST_LIST_DENIED';
  end if;
  return query
  select request.id, organization.name, request.workforce_profile, request.state
  from public.workforce_access_requests request
  join public.organizations organization on organization.id = request.organization_id
  where request.user_id = p_actor_user_id
  order by request.created_at desc
  limit 20;
end;
$$;

create or replace function public.platform_list_workforce_access_requests(
  p_actor_user_id uuid
)
returns table(request_id uuid, organization_label text, workforce_profile public.workforce_profile, request_state public.workforce_access_request_state)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_active_platform_role(p_actor_user_id, array['platform_super_admin']::public.admin_role[]);
  return query
  select request.id, organization.name, request.workforce_profile, request.state
  from public.workforce_access_requests request
  join public.organizations organization on organization.id = request.organization_id
  where request.state in ('requested', 'prepared')
  order by request.created_at asc
  limit 100;
end;
$$;

create or replace function public.organization_list_workforce_access_requests(
  p_actor_user_id uuid
)
returns table(request_id uuid, organization_label text, workforce_profile public.workforce_profile, request_state public.workforce_access_request_state)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select request.id, organization.name, request.workforce_profile, request.state
  from public.workforce_access_requests request
  join public.organizations organization on organization.id = request.organization_id
  where request.state in ('requested', 'prepared')
    and exists (
      select 1 from public.organization_memberships membership
      join public.administrative_grants grant_record on grant_record.membership_id = membership.id
      join public.identity_subjects subject on subject.user_id = membership.user_id
      where membership.organization_id = request.organization_id
        and membership.user_id = p_actor_user_id
        and membership.role = 'organization_admin'
        and membership.state = 'active'
        and (membership.expires_at is null or membership.expires_at > now())
        and grant_record.state = 'active'
        and (grant_record.expires_at is null or grant_record.expires_at > now())
        and subject.lifecycle_state = 'active'
    )
  order by request.created_at asc
  limit 100;
end;
$$;

create or replace function private.prepare_workforce_access(
  p_actor_user_id uuid,
  p_request_id uuid,
  p_role public.admin_role,
  p_scope_selector jsonb,
  p_purpose_code text,
  p_expires_at timestamptz,
  p_correlation_id uuid,
  p_is_platform boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_target uuid;
  v_request public.workforce_access_requests%rowtype;
  v_membership_id uuid;
  v_grant_id uuid;
begin
  select event.target_id into v_existing_target
  from public.admin_audit_events event
  where event.command_name = case when p_is_platform then 'platform_prepare_workforce_access' else 'organization_prepare_workforce_access' end
    and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;

  select * into v_request from public.workforce_access_requests request where request.id = p_request_id for update;
  if not found or v_request.state <> 'requested' or v_request.expires_at <= now() then
    raise exception using errcode = '42501', message = 'WORKFORCE_PREPARATION_DENIED';
  end if;

  if p_is_platform then
    perform private.require_active_platform_role(p_actor_user_id, array['platform_super_admin']::public.admin_role[]);
  else
    perform private.require_active_organization_admin(p_actor_user_id, v_request.organization_id);
    if p_role <> 'operator' then raise exception using errcode = '42501', message = 'ORGANIZATION_ADMIN_ROLE_DENIED'; end if;
    if exists (
      select 1 from jsonb_array_elements_text(p_scope_selector -> 'modules') desired_module
      where not exists (
        select 1 from public.administrative_grants grant_record
        where grant_record.organization_id = v_request.organization_id
          and grant_record.user_id = p_actor_user_id
          and grant_record.state = 'active'
          and (grant_record.expires_at is null or grant_record.expires_at > now())
          and grant_record.scope_selector -> 'modules' @> jsonb_build_array(desired_module)
      )
    ) then raise exception using errcode = '42501', message = 'ORGANIZATION_ADMIN_SCOPE_DENIED'; end if;
  end if;

  if p_role in ('platform_super_admin', 'platform_security_admin', 'platform_support_operator')
    or p_purpose_code not in ('cadastro_inicial', 'operacao_interna', 'revisao_cadastral')
  then raise exception using errcode = '42501', message = 'WORKFORCE_PREPARATION_DENIED'; end if;
  perform private.validate_workforce_scope(p_scope_selector, p_expires_at);

  if not exists (select 1 from public.identity_subjects subject where subject.user_id = v_request.user_id and subject.lifecycle_state = 'active')
    or exists (select 1 from public.organization_memberships membership where membership.organization_id = v_request.organization_id and membership.user_id = v_request.user_id)
  then raise exception using errcode = '42501', message = 'WORKFORCE_PREPARATION_DENIED'; end if;

  insert into public.organization_memberships (organization_id, user_id, role, state, starts_at, expires_at, created_by)
  values (v_request.organization_id, v_request.user_id, p_role, 'invited', now(), p_expires_at, p_actor_user_id)
  returning id into v_membership_id;
  insert into public.administrative_grants (organization_id, user_id, membership_id, role, scope_selector, purpose_code, state, starts_at, expires_at, granted_by)
  values (v_request.organization_id, v_request.user_id, v_membership_id, p_role, p_scope_selector, p_purpose_code, 'pending', now(), p_expires_at, p_actor_user_id)
  returning id into v_grant_id;
  update public.workforce_access_requests
  set state = 'prepared', membership_id = v_membership_id, grant_id = v_grant_id, prepared_by = p_actor_user_id, updated_at = now()
  where id = v_request.id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (
    p_correlation_id, p_actor_user_id, v_request.organization_id,
    case when p_is_platform then 'platform_prepare_workforce_access' else 'organization_prepare_workforce_access' end,
    'allowed', 'workforce_access_request', v_request.id,
    jsonb_build_object('profile', v_request.workforce_profile::text, 'role', p_role::text, 'module_count', jsonb_array_length(p_scope_selector -> 'modules'))
  );
  return v_request.id;
end;
$$;

create or replace function public.platform_prepare_workforce_access(
  p_actor_user_id uuid, p_request_id uuid, p_role public.admin_role, p_scope_selector jsonb, p_purpose_code text, p_expires_at timestamptz, p_correlation_id uuid
)
returns uuid language sql security definer set search_path = ''
as $$ select private.prepare_workforce_access(p_actor_user_id, p_request_id, p_role, p_scope_selector, p_purpose_code, p_expires_at, p_correlation_id, true); $$;

create or replace function public.organization_prepare_workforce_access(
  p_actor_user_id uuid, p_request_id uuid, p_role public.admin_role, p_scope_selector jsonb, p_purpose_code text, p_expires_at timestamptz, p_correlation_id uuid
)
returns uuid language sql security definer set search_path = ''
as $$ select private.prepare_workforce_access(p_actor_user_id, p_request_id, p_role, p_scope_selector, p_purpose_code, p_expires_at, p_correlation_id, false); $$;

create or replace function public.organization_accept_own_workforce_access(
  p_actor_user_id uuid, p_request_id uuid, p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_target uuid;
  v_request public.workforce_access_requests%rowtype;
begin
  select event.target_id into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'organization_accept_own_workforce_access'
    and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  select * into v_request from public.workforce_access_requests request
  where request.id = p_request_id and request.user_id = p_actor_user_id for update;
  if not found or v_request.state <> 'prepared' or v_request.expires_at <= now()
    or not exists (select 1 from public.identity_subjects subject where subject.user_id = p_actor_user_id and subject.lifecycle_state = 'active')
    or not exists (select 1 from public.organization_memberships membership where membership.id = v_request.membership_id and membership.state = 'invited')
    or not exists (select 1 from public.administrative_grants grant_record where grant_record.id = v_request.grant_id and grant_record.state = 'pending')
  then raise exception using errcode = '42501', message = 'WORKFORCE_ACCEPTANCE_DENIED'; end if;
  update public.organization_memberships set state = 'active', updated_at = now() where id = v_request.membership_id;
  update public.administrative_grants set state = 'active', approved_by = p_actor_user_id, updated_at = now() where id = v_request.grant_id;
  update public.workforce_access_requests set state = 'active', accepted_at = now(), updated_at = now() where id = v_request.id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, v_request.organization_id, 'organization_accept_own_workforce_access', 'allowed', 'workforce_access_request', v_request.id, jsonb_build_object('self_accepted', true));
  return v_request.id;
end;
$$;

revoke all on function private.require_active_organization_admin(uuid, uuid), private.validate_workforce_scope(jsonb, timestamptz), private.prepare_workforce_access(uuid, uuid, public.admin_role, jsonb, text, timestamptz, uuid, boolean) from public, anon, authenticated;
revoke all on function public.organization_request_workforce_access(uuid, text, public.workforce_profile, uuid), public.organization_list_own_workforce_access_requests(uuid), public.platform_list_workforce_access_requests(uuid), public.organization_list_workforce_access_requests(uuid), public.platform_prepare_workforce_access(uuid, uuid, public.admin_role, jsonb, text, timestamptz, uuid), public.organization_prepare_workforce_access(uuid, uuid, public.admin_role, jsonb, text, timestamptz, uuid), public.organization_accept_own_workforce_access(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.organization_request_workforce_access(uuid, text, public.workforce_profile, uuid), public.organization_list_own_workforce_access_requests(uuid), public.platform_list_workforce_access_requests(uuid), public.organization_list_workforce_access_requests(uuid), public.platform_prepare_workforce_access(uuid, uuid, public.admin_role, jsonb, text, timestamptz, uuid), public.organization_prepare_workforce_access(uuid, uuid, public.admin_role, jsonb, text, timestamptz, uuid), public.organization_accept_own_workforce_access(uuid, uuid, uuid) to service_role;
