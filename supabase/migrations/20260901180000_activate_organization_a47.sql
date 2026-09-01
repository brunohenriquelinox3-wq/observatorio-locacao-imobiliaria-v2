-- Ativa somente uma organização em rascunho que já possua membership ADM ativa
-- para o mesmo SUPER ADM. Não cria ou amplia membership, grant, financeiro,
-- contratos, pagamentos, acessos de terceiro ou integrações externas.

create or replace function public.platform_list_activatable_organizations(
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
  where organization.state = 'draft'
    and exists (
      select 1
      from public.organization_memberships membership
      where membership.organization_id = organization.id
        and membership.user_id = p_actor_user_id
        and membership.role = 'organization_admin'
        and membership.state = 'active'
    )
  order by organization.created_at desc
  limit 50;
end;
$$;

create or replace function public.platform_activate_organization(
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
begin
  perform private.require_active_platform_role(
    p_actor_user_id,
    array['platform_super_admin']::public.admin_role[]
  );

  select event.target_id
  into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'platform_activate_organization'
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
    join public.organization_memberships membership
      on membership.organization_id = organization.id
    where organization.id = p_organization_id
      and organization.state = 'draft'
      and membership.user_id = p_actor_user_id
      and membership.role = 'organization_admin'
      and membership.state = 'active'
  ) then
    raise exception using errcode = '42501', message = 'ORGANIZATION_ACTIVATION_DENIED';
  end if;

  update public.organizations
  set state = 'active', updated_at = now()
  where id = p_organization_id
    and state = 'draft';

  if not found then
    raise exception using errcode = '42501', message = 'ORGANIZATION_ACTIVATION_DENIED';
  end if;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'platform_activate_organization', 'allowed', 'organization', p_organization_id,
    jsonb_build_object('transition', 'draft_to_active')
  );

  return p_organization_id;
end;
$$;

revoke all on function public.platform_list_activatable_organizations(uuid) from public, anon, authenticated;
revoke all on function public.platform_activate_organization(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.platform_list_activatable_organizations(uuid), public.platform_activate_organization(uuid, uuid, uuid) to service_role;
