-- A46: autoatribuição controlada do primeiro ADM organizacional para o próprio SUPER ADM.
-- Cria uma membership ativa e três grants ativos somente para Loteadora, Vendas Urbanas e Locação.
-- Não cria dados financeiros, contratos, pagamentos, usuários adicionais ou concessões a terceiros.

create or replace function public.platform_list_self_admin_organizations(
  p_actor_user_id uuid
)
returns table(organization_id uuid, organization_label text, organization_state public.organization_state)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_active_platform_role(
    p_actor_user_id,
    array['platform_super_admin']::public.admin_role[]
  );

  return query
  select organization.id, organization.name, organization.state
  from public.organizations organization
  where organization.state in ('draft', 'active')
    and not exists (
      select 1
      from public.organization_memberships membership
      where membership.organization_id = organization.id
        and membership.user_id = p_actor_user_id
        and membership.state = 'active'
    )
  order by organization.created_at desc
  limit 50;
end;
$$;

create or replace function public.platform_activate_self_organization_admin(
  p_actor_user_id uuid,
  p_organization_id uuid,
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
  perform private.require_active_platform_role(
    p_actor_user_id,
    array['platform_super_admin']::public.admin_role[]
  );

  select event.target_id
  into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'platform_activate_self_organization_admin'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;

  if v_existing_target is not null then
    return v_existing_target;
  end if;

  if not exists (
    select 1
    from public.organizations organization
    where organization.id = p_organization_id
      and organization.state in ('draft', 'active')
  ) then
    raise exception using errcode = '42501', message = 'SELF_ADMIN_ORGANIZATION_DENIED';
  end if;

  if exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = p_organization_id
      and membership.user_id = p_actor_user_id
  ) then
    raise exception using errcode = '42501', message = 'SELF_ADMIN_MEMBERSHIP_EXISTS';
  end if;

  insert into public.organization_memberships (
    organization_id, user_id, role, state, starts_at, created_by
  ) values (
    p_organization_id, p_actor_user_id, 'organization_admin', 'active', now(), p_actor_user_id
  ) returning id into v_membership_id;

  insert into public.administrative_grants (
    organization_id, user_id, membership_id, role, scope_selector, purpose_code, state, starts_at, granted_by, approved_by
  ) values
    (p_organization_id, p_actor_user_id, v_membership_id, 'organization_admin', jsonb_build_object('modules', jsonb_build_array('loteadora')), 'CADASTRO_INICIAL', 'active', now(), p_actor_user_id, p_actor_user_id),
    (p_organization_id, p_actor_user_id, v_membership_id, 'organization_admin', jsonb_build_object('modules', jsonb_build_array('vendas_urbanas')), 'CADASTRO_INICIAL', 'active', now(), p_actor_user_id, p_actor_user_id),
    (p_organization_id, p_actor_user_id, v_membership_id, 'organization_admin', jsonb_build_object('modules', jsonb_build_array('locacao')), 'CADASTRO_INICIAL', 'active', now(), p_actor_user_id, p_actor_user_id);

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'platform_activate_self_organization_admin', 'allowed', 'membership',
    v_membership_id, jsonb_build_object('self_assignment', true, 'module_count', 3, 'role', 'organization_admin')
  );

  return v_membership_id;
end;
$$;

revoke all on function public.platform_list_self_admin_organizations(uuid) from public, anon, authenticated;
revoke all on function public.platform_activate_self_organization_admin(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.platform_list_self_admin_organizations(uuid), public.platform_activate_self_organization_admin(uuid, uuid, uuid) to service_role;
