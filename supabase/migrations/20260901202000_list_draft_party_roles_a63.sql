-- A63: leitura minimizada de papéis temporais para seleção contextual.
-- Não cria dados, não expõe documento, contato, financeiro, contrato ou acesso direto do navegador.

create or replace function public.domain_list_draft_party_roles(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table (
  party_role_assignment_id uuid,
  party_id uuid,
  display_name text,
  role text,
  starts_at timestamptz,
  ends_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_domain_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);

  return query
  select
    assignment.id,
    party.id,
    party.display_name,
    assignment.role::text,
    assignment.starts_at,
    assignment.ends_at
  from public.party_role_assignments assignment
  join public.party_records party
    on party.id = assignment.party_id
    and party.organization_id = assignment.organization_id
  where assignment.organization_id = p_organization_id
    and assignment.module = p_module
    and assignment.purpose_code = trim(p_purpose_code)
    and assignment.state = 'draft'
    and party.state = 'draft'
  order by assignment.created_at desc, assignment.id desc;
end;
$$;

revoke all on function public.domain_list_draft_party_roles(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.domain_list_draft_party_roles(uuid, uuid, public.operating_module, text) to service_role;
