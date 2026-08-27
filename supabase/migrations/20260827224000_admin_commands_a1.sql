-- A1 — Comandos administrativos controlados.
-- Funções transacionais chamadas somente pelo servidor com credencial de serviço.
-- Não concede acesso a anon/authenticated, não envia convite e não ativa principal.

create or replace function private.require_active_platform_role(
  p_actor_user_id uuid,
  p_allowed_roles public.admin_role[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.platform_principals principal
    join public.identity_subjects subject on subject.user_id = principal.user_id
    where principal.user_id = p_actor_user_id
      and principal.role = any (p_allowed_roles)
      and principal.state = 'active'
      and principal.mfa_verified_at is not null
      and subject.lifecycle_state = 'active'
  ) then
    raise exception using errcode = '42501', message = 'ADMIN_COMMAND_DENIED';
  end if;
end;
$$;

revoke all on function private.require_active_platform_role(uuid, public.admin_role[]) from public, anon, authenticated;

create or replace function public.platform_bootstrap_principal(
  p_subject_id uuid,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_target uuid;
begin
  perform pg_advisory_xact_lock(hashtext('platform_bootstrap_principal'));

  select event.target_id
  into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'platform_bootstrap_principal'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;

  if v_existing_target is not null then
    return v_existing_target;
  end if;

  if not exists (
    select 1
    from public.identity_subjects subject
    where subject.user_id = p_subject_id
      and subject.lifecycle_state = 'active'
  ) then
    raise exception using errcode = '42501', message = 'BOOTSTRAP_SUBJECT_INVALID';
  end if;

  if exists (
    select 1
    from public.platform_principals principal
    where principal.state in ('pending_activation', 'active', 'suspended')
  ) then
    raise exception using errcode = '42501', message = 'BOOTSTRAP_ALREADY_ESTABLISHED';
  end if;

  insert into public.platform_principals (user_id, role, state)
  values (p_subject_id, 'platform_super_admin', 'pending_activation');

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, command_name, outcome, target_type, target_id, reason_code, payload_redacted
  ) values (
    p_correlation_id, p_subject_id, 'platform_bootstrap_principal', 'allowed', 'platform_principal', p_subject_id,
    'PENDING_MFA_ACTIVATION', '{}'::jsonb
  );

  return p_subject_id;
end;
$$;

create or replace function public.platform_provision_organization(
  p_actor_user_id uuid,
  p_name text,
  p_domain text,
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
begin
  perform private.require_active_platform_role(p_actor_user_id, array['platform_super_admin']::public.admin_role[]);

  select event.target_id
  into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'platform_provision_organization'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;

  if v_existing_target is not null then
    return v_existing_target;
  end if;

  insert into public.organizations (name, domain, state)
  values (trim(p_name), nullif(lower(trim(p_domain)), ''), 'draft')
  returning id into v_organization_id;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, v_organization_id, 'platform_provision_organization', 'allowed', 'organization',
    v_organization_id, '{}'::jsonb
  );

  return v_organization_id;
end;
$$;

create or replace function public.platform_delegate_membership(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_subject_id uuid,
  p_role public.admin_role,
  p_scope_selector jsonb,
  p_purpose_code text,
  p_expires_at timestamptz,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_target uuid;
  v_membership_id uuid;
begin
  perform private.require_active_platform_role(p_actor_user_id, array['platform_super_admin']::public.admin_role[]);

  if p_role in ('platform_super_admin', 'platform_security_admin', 'platform_support_operator') then
    raise exception using errcode = '42501', message = 'DELEGATION_ROLE_DENIED';
  end if;

  select event.target_id
  into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'platform_delegate_membership'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;

  if v_existing_target is not null then
    return v_existing_target;
  end if;

  if not exists (
    select 1 from public.organizations organization
    where organization.id = p_organization_id and organization.state <> 'suspended'
  ) or not exists (
    select 1 from public.identity_subjects subject
    where subject.user_id = p_subject_id and subject.lifecycle_state = 'active'
  ) then
    raise exception using errcode = '42501', message = 'DELEGATION_SCOPE_INVALID';
  end if;

  insert into public.organization_memberships (
    organization_id, user_id, role, state, starts_at, expires_at, created_by
  ) values (
    p_organization_id, p_subject_id, p_role, 'invited', now(), p_expires_at, p_actor_user_id
  )
  returning id into v_membership_id;

  insert into public.administrative_grants (
    organization_id, user_id, membership_id, role, scope_selector, purpose_code, state, starts_at, expires_at, granted_by
  ) values (
    p_organization_id, p_subject_id, v_membership_id, p_role, p_scope_selector, trim(p_purpose_code), 'pending', now(),
    p_expires_at, p_actor_user_id
  );

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'platform_delegate_membership', 'allowed', 'membership',
    v_membership_id, '{}'::jsonb
  );

  return v_membership_id;
end;
$$;

create or replace function public.platform_suspend_membership(
  p_actor_user_id uuid,
  p_membership_id uuid,
  p_reason_code text,
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
begin
  perform private.require_active_platform_role(
    p_actor_user_id,
    array['platform_super_admin', 'platform_security_admin']::public.admin_role[]
  );

  select event.target_id
  into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'platform_suspend_membership'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;

  if v_existing_target is not null then
    return v_existing_target;
  end if;

  update public.organization_memberships
  set state = 'suspended', revoke_reason_code = trim(p_reason_code), updated_at = now()
  where id = p_membership_id and state in ('invited', 'active')
  returning organization_id into v_organization_id;

  if v_organization_id is null then
    raise exception using errcode = '42501', message = 'MEMBERSHIP_NOT_SUSPENDABLE';
  end if;

  update public.administrative_grants
  set state = 'revoked', revoked_at = now(), revoke_reason_code = 'MEMBERSHIP_SUSPENDED', updated_at = now()
  where membership_id = p_membership_id and state in ('pending', 'active');

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, reason_code, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, v_organization_id, 'platform_suspend_membership', 'allowed', 'membership',
    p_membership_id, trim(p_reason_code), '{}'::jsonb
  );

  return p_membership_id;
end;
$$;

create or replace function public.platform_revoke_membership(
  p_actor_user_id uuid,
  p_membership_id uuid,
  p_reason_code text,
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
begin
  perform private.require_active_platform_role(
    p_actor_user_id,
    array['platform_super_admin', 'platform_security_admin']::public.admin_role[]
  );

  select event.target_id
  into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'platform_revoke_membership'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;

  if v_existing_target is not null then
    return v_existing_target;
  end if;

  update public.organization_memberships
  set state = 'revoked', revoked_at = now(), revoke_reason_code = trim(p_reason_code), updated_at = now()
  where id = p_membership_id and state in ('invited', 'active', 'suspended')
  returning organization_id into v_organization_id;

  if v_organization_id is null then
    raise exception using errcode = '42501', message = 'MEMBERSHIP_NOT_REVOCABLE';
  end if;

  update public.administrative_grants
  set state = 'revoked', revoked_at = now(), revoke_reason_code = trim(p_reason_code), updated_at = now()
  where membership_id = p_membership_id and state in ('pending', 'active');

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, reason_code, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, v_organization_id, 'platform_revoke_membership', 'allowed', 'membership',
    p_membership_id, trim(p_reason_code), '{}'::jsonb
  );

  return p_membership_id;
end;
$$;

revoke all on function public.platform_bootstrap_principal(uuid, uuid) from public, anon, authenticated;
revoke all on function public.platform_provision_organization(uuid, text, text, uuid) from public, anon, authenticated;
revoke all on function public.platform_delegate_membership(uuid, uuid, uuid, public.admin_role, jsonb, text, timestamptz, uuid) from public, anon, authenticated;
revoke all on function public.platform_suspend_membership(uuid, uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.platform_revoke_membership(uuid, uuid, text, uuid) from public, anon, authenticated;

grant execute on function public.platform_bootstrap_principal(uuid, uuid) to service_role;
grant execute on function public.platform_provision_organization(uuid, text, text, uuid) to service_role;
grant execute on function public.platform_delegate_membership(uuid, uuid, uuid, public.admin_role, jsonb, text, timestamptz, uuid) to service_role;
grant execute on function public.platform_suspend_membership(uuid, uuid, text, uuid) to service_role;
grant execute on function public.platform_revoke_membership(uuid, uuid, text, uuid) to service_role;
