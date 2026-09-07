-- A286: leitura operacional privada e paginada de prontidão cadastral.
-- Projeta somente nome declarado, telefone, WhatsApp e situação; não devolve e-mail, documento, chave, URL ou conteúdo de anexo.

create or replace function public.subdivision_list_draft_buyer_client_readiness(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_page_size integer,
  p_page_offset integer
)
returns table(
  buyer_client_id uuid,
  display_name text,
  registration_state text,
  primary_phone text,
  messaging_phone text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_page_size < 1 or p_page_size > 25 or p_page_offset < 0 or p_page_offset > 49975 then
    raise exception using errcode = '22023', message = 'SUBDIVISION_BUYER_CLIENT_READINESS_PAGE_DENIED';
  end if;

  return query
  select
    client.id,
    party.display_name,
    coalesce(profile.registration_state::text, 'contact_pending'),
    profile.primary_phone,
    profile.messaging_phone,
    greatest(client.updated_at, coalesce(profile.updated_at, client.updated_at))
  from public.subdivision_buyer_clients client
  join public.party_role_assignments role_assignment
    on role_assignment.id = client.party_role_assignment_id
    and role_assignment.organization_id = client.organization_id
  join public.party_records party
    on party.id = role_assignment.party_id
    and party.organization_id = role_assignment.organization_id
  left join public.subdivision_buyer_client_profiles profile
    on profile.buyer_client_id = client.id
    and profile.organization_id = client.organization_id
    and profile.state = 'draft'
  where client.organization_id = p_organization_id
    and client.state = 'draft'
    and role_assignment.module = 'loteadora'
    and role_assignment.role in ('client', 'buyer')
    and role_assignment.state = 'draft'
    and party.state = 'draft'
  order by greatest(client.updated_at, coalesce(profile.updated_at, client.updated_at)) desc, client.id
  limit p_page_size offset p_page_offset;
end;
$$;

revoke all on function public.subdivision_list_draft_buyer_client_readiness(uuid, uuid, public.operating_module, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.subdivision_list_draft_buyer_client_readiness(uuid, uuid, public.operating_module, text, integer, integer)
  to service_role;

comment on function public.subdivision_list_draft_buyer_client_readiness(uuid, uuid, public.operating_module, text, integer, integer)
  is 'A286: estoque operacional privado e paginado de Cliente Loteadora; nome declarado, telefone, WhatsApp e situação, sem e-mail, documento, arquivo, URL ou conteúdo.';
