-- A5.1 — leitura agregada e contextual de Parties em rascunho.
-- Não adiciona dados, documentos, identificadores pessoais ou acesso do navegador às tabelas.

create or replace function public.domain_list_draft_parties(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table (
  party_id uuid,
  kind text,
  display_name text,
  source_kind text,
  role_count bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_domain_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);

  return query
  select
    party.id,
    party.kind::text,
    party.display_name,
    party.source_kind,
    count(role_assignment.id)::bigint
  from public.party_records party
  left join public.party_role_assignments role_assignment
    on role_assignment.party_id = party.id
    and role_assignment.organization_id = party.organization_id
    and role_assignment.module = p_module
    and role_assignment.state = 'draft'
  where party.organization_id = p_organization_id
    and party.state = 'draft'
  group by party.id, party.kind, party.display_name, party.source_kind
  order by party.created_at desc, party.id desc;
end;
$$;

revoke all on function public.domain_list_draft_parties(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.domain_list_draft_parties(uuid, uuid, public.operating_module, text) to service_role;
