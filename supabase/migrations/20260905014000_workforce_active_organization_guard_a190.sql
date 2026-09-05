-- A190 — Impede solicitações, preparo e aceite de equipe em organizações em rascunho.
-- O Ambiente Demonstrativo permanece isolado: sem membership, grant, escopo ou módulo.

create or replace function private.require_active_workforce_organization(
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
    from public.organizations organization
    where organization.id = p_organization_id
      and organization.state = 'active'
  ) then
    raise exception using errcode = '42501', message = 'WORKFORCE_ORGANIZATION_DENIED';
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
    and organization.state = 'active'
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
  perform private.require_active_workforce_organization(v_request.organization_id);

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
    or not exists (select 1 from public.organizations organization where organization.id = v_request.organization_id and organization.state = 'active')
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

revoke all on function private.require_active_workforce_organization(uuid) from public, anon, authenticated;
revoke all on function public.organization_request_workforce_access(uuid, text, public.workforce_profile, uuid), private.prepare_workforce_access(uuid, uuid, public.admin_role, jsonb, text, timestamptz, uuid, boolean), public.organization_accept_own_workforce_access(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.organization_request_workforce_access(uuid, text, public.workforce_profile, uuid), public.organization_accept_own_workforce_access(uuid, uuid, uuid) to service_role;
