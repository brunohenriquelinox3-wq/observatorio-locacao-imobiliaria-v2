-- A309 — Normalização de caixa da finalidade em contexto autorizado.
-- Corrige incompatibilidade de apresentação entre a UI e grants já vigentes.
-- Não cria memberships/grants, não amplia módulos, papéis, escopos ou vigências.

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
    join public.identity_subjects subject
      on subject.user_id = membership.user_id
    where membership.user_id = p_actor_user_id
      and membership.organization_id = p_organization_id
      and membership.role in ('organization_admin', 'area_admin', 'operator')
      and membership.state = 'active'
      and membership.starts_at <= now()
      and (membership.expires_at is null or membership.expires_at > now())
      and grant_record.state = 'active'
      and grant_record.starts_at <= now()
      and (grant_record.expires_at is null or grant_record.expires_at > now())
      and lower(grant_record.purpose_code) = lower(trim(p_purpose_code))
      and (grant_record.scope_selector -> 'modules') ? p_module::text
      and subject.lifecycle_state = 'active'
  ) then
    raise exception using errcode = '42501', message = 'DOMAIN_CONTEXT_DENIED';
  end if;
end;
$$;

revoke all on function private.require_domain_draft_authority(uuid, uuid, public.operating_module, text)
  from public, anon, authenticated;

grant execute on function private.require_domain_draft_authority(uuid, uuid, public.operating_module, text)
  to service_role;

comment on function private.require_domain_draft_authority(uuid, uuid, public.operating_module, text)
  is 'A309: exige identidade, membership, grant, escopo de módulo e vigência ativos; a finalidade é comparada sem distinção de caixa para evitar bloqueio de apresentação.';
