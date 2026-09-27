-- A393: diretório contextual paginado de participantes arquivados.
-- Leitura administrativa allowlisted; não expõe documentos, contatos, financeiro,
-- contratos, dados bancários ou qualquer efeito material.
create or replace function public.domain_list_archived_party_role_directory(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_search_term text default null,
  p_role text default null,
  p_page_size integer default 25,
  p_page_offset integer default 0
)
returns table (
  party_role_assignment_id uuid,
  party_id uuid,
  display_name text,
  role text,
  starts_at timestamptz,
  ends_at timestamptz,
  total_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_page_size integer := greatest(1, least(coalesce(p_page_size, 25), 500));
  v_page_offset integer := greatest(0, coalesce(p_page_offset, 0));
  v_search_term text := nullif(trim(coalesce(p_search_term, '')), '');
  v_role text := nullif(trim(coalesce(p_role, '')), '');
begin
  perform private.require_domain_draft_authority(
    p_actor_user_id,
    p_organization_id,
    p_module,
    p_purpose_code
  );

  return query
  with filtered as (
    select
      assignment.id as assignment_id,
      party.id as current_party_id,
      party.display_name as current_display_name,
      assignment.role::text as current_role,
      assignment.starts_at as current_starts_at,
      assignment.ends_at as current_ends_at,
      count(*) over ()::integer as current_total_count
    from public.party_role_assignments assignment
    join public.party_records party
      on party.id = assignment.party_id
      and party.organization_id = assignment.organization_id
    where assignment.organization_id = p_organization_id
      and assignment.module = p_module
      and assignment.purpose_code = trim(p_purpose_code)
      and assignment.state = 'archived'::public.party_lifecycle_state
      and party.state = 'archived'::public.party_lifecycle_state
      and assignment.role::text in ('shareholder', 'partner', 'land_contributor')
      and (v_search_term is null or party.display_name ilike '%' || v_search_term || '%')
      and (v_role is null or assignment.role::text = v_role)
    order by assignment.updated_at desc, assignment.id desc
    offset v_page_offset
    limit v_page_size
  )
  select
    filtered.assignment_id,
    filtered.current_party_id,
    filtered.current_display_name,
    filtered.current_role,
    filtered.current_starts_at,
    filtered.current_ends_at,
    filtered.current_total_count
  from filtered;
end;
$$;

revoke all on function public.domain_list_archived_party_role_directory(uuid, uuid, public.operating_module, text, text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.domain_list_archived_party_role_directory(uuid, uuid, public.operating_module, text, text, text, integer, integer) to service_role;

comment on function public.domain_list_archived_party_role_directory(uuid, uuid, public.operating_module, text, text, text, integer, integer)
is 'A393: leitura contextual paginada de participantes arquivados; sem documentos, contatos, financeiro, contrato ou efeito material.';

create index if not exists party_role_assignments_archived_directory_lookup
  on public.party_role_assignments (organization_id, module, purpose_code, updated_at desc, id desc)
  where state = 'archived'::public.party_lifecycle_state;

create index if not exists party_records_archived_directory_name_lookup
  on public.party_records (organization_id, lower(display_name))
  where state = 'archived'::public.party_lifecycle_state;
