-- Amplia a leitura já protegida para os três módulos contratados da coluna ADM.
-- A função continua limitada ao próprio sujeito, à organização ativa e ao grant vigente.

create or replace function public.organization_list_authorized_contexts(
  p_actor_user_id uuid,
  p_module public.operating_module
)
returns table(organization_id uuid, organization_label text, purpose_code text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_module not in (
    'loteadora'::public.operating_module,
    'vendas_urbanas'::public.operating_module,
    'locacao'::public.operating_module
  ) then
    raise exception using errcode = '42501', message = 'ORGANIZATION_CONTEXT_DENIED';
  end if;

  return query
  select distinct organization.id, organization.name, grant_record.purpose_code
  from public.organizations organization
  join public.organization_memberships membership
    on membership.organization_id = organization.id
  join public.administrative_grants grant_record
    on grant_record.membership_id = membership.id
    and grant_record.organization_id = membership.organization_id
    and grant_record.user_id = membership.user_id
  join public.identity_subjects subject
    on subject.user_id = membership.user_id
  where organization.state = 'active'
    and membership.user_id = p_actor_user_id
    and membership.role in ('organization_admin', 'area_admin', 'operator')
    and membership.state = 'active'
    and membership.starts_at <= now()
    and (membership.expires_at is null or membership.expires_at > now())
    and grant_record.state = 'active'
    and grant_record.starts_at <= now()
    and (grant_record.expires_at is null or grant_record.expires_at > now())
    and (grant_record.scope_selector -> 'modules') ? p_module::text
    and subject.lifecycle_state = 'active'
  order by organization.name asc
  limit 50;
end;
$$;

revoke all on function public.organization_list_authorized_contexts(uuid, public.operating_module) from public, anon, authenticated;
grant execute on function public.organization_list_authorized_contexts(uuid, public.operating_module) to service_role;
