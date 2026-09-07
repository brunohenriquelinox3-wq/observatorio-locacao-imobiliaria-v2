-- A290: total agregado do diretório de Clientes Loteadora.
-- A função não retorna identidades, contatos, documentos, arquivos ou conteúdo pessoal.
-- Não cria nem altera venda, lote, preço, crédito, proposta, contrato, registro, cobrança, pagamento ou financeiro.

create or replace function public.subdivision_count_draft_buyer_client_directory(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_search_term text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_search_term text;
  v_search_digits text;
  v_total integer;
begin
  perform private.require_subdivision_draft_authority(
    p_actor_user_id,
    p_organization_id,
    p_module,
    p_purpose_code
  );

  if p_search_term is not null and char_length(trim(p_search_term)) < 2 then
    raise exception using errcode = '22023', message = 'SUBDIVISION_CLIENT_DIRECTORY_SEARCH_DENIED';
  end if;

  v_search_term := nullif(lower(trim(p_search_term)), '');
  v_search_digits := nullif(regexp_replace(coalesce(p_search_term, ''), '\D', '', 'g'), '');

  select count(*)::integer
  into v_total
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
    and (
      v_search_term is null
      or lower(party.display_name) like v_search_term || '%'
      or lower(coalesce(profile.primary_email, '')) like v_search_term || '%'
      or lower(coalesce(profile.identity_document_reference, '')) like v_search_term || '%'
      or (
        v_search_digits is not null
        and (
          regexp_replace(coalesce(profile.primary_phone, ''), '\D', '', 'g') like v_search_digits || '%'
          or regexp_replace(coalesce(profile.messaging_phone, ''), '\D', '', 'g') like v_search_digits || '%'
          or coalesce(profile.document_reference, '') like v_search_digits || '%'
        )
      )
    );

  return coalesce(v_total, 0);
end;
$$;

revoke all on function public.subdivision_count_draft_buyer_client_directory(uuid, uuid, public.operating_module, text, text) from public, anon, authenticated;
grant execute on function public.subdivision_count_draft_buyer_client_directory(uuid, uuid, public.operating_module, text, text) to service_role;

comment on function public.subdivision_count_draft_buyer_client_directory(uuid, uuid, public.operating_module, text, text) is 'A290: contagem agregada autorizada do diretório de Clientes Loteadora. Retorna somente quantidade, preserva busca contextual e não devolve dados pessoais.';
