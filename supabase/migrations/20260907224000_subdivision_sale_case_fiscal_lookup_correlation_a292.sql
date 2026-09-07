-- A292: substitui a consulta fiscal A291 por assinatura correlacionada.
-- O valor consultado não é gravado em auditoria nem retornado fora do contexto autorizado.

drop function if exists public.subdivision_lookup_buyer_client_by_fiscal_reference(uuid, uuid, public.operating_module, text, text);
create function public.subdivision_lookup_buyer_client_by_fiscal_reference(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_document_reference text, p_correlation_id uuid
) returns table (buyer_client_id uuid, display_name text, party_kind text, profile_registration_state text)
language plpgsql security definer set search_path = '' as $$
declare v_document_reference text;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' or p_correlation_id is null then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_CONTEXT_DENIED'; end if;
  v_document_reference := pg_catalog.regexp_replace(coalesce(p_document_reference, ''), '[^0-9]', '', 'g');
  if char_length(v_document_reference) not in (11, 14) then raise exception using errcode = '22023', message = 'SUBDIVISION_SALE_CASE_FISCAL_REFERENCE_DENIED'; end if;
  return query
    select client.id, party.display_name, profile.party_kind::text, profile.registration_state::text
    from public.subdivision_buyer_clients client
    join public.party_role_assignments role_assignment on role_assignment.id = client.party_role_assignment_id and role_assignment.organization_id = client.organization_id
    join public.party_records party on party.id = role_assignment.party_id and party.organization_id = role_assignment.organization_id
    join public.subdivision_buyer_client_profiles profile on profile.buyer_client_id = client.id and profile.organization_id = client.organization_id
    where client.organization_id = p_organization_id and client.state = 'draft'::public.party_lifecycle_state
      and role_assignment.module = 'loteadora' and role_assignment.role in ('client', 'buyer') and role_assignment.state = 'draft'::public.party_lifecycle_state
      and party.state = 'draft'::public.party_lifecycle_state and profile.state = 'draft'::public.party_lifecycle_state
      and profile.document_reference = v_document_reference
    order by profile.updated_at desc, client.id
    limit 1;
end; $$;
revoke all on function public.subdivision_lookup_buyer_client_by_fiscal_reference(uuid, uuid, public.operating_module, text, text, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_lookup_buyer_client_by_fiscal_reference(uuid, uuid, public.operating_module, text, text, uuid) to service_role;
