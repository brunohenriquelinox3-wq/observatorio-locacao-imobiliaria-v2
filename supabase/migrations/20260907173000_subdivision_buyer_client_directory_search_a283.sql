-- A283: busca operacional escalável de Cliente Loteadora. A projeção permanece minimizada.
-- Não adiciona venda, lote, preço, crédito, proposta, contrato, registro, cobrança ou financeiro.

create index if not exists subdivision_buyer_client_profiles_search_email_prefix
  on public.subdivision_buyer_client_profiles (organization_id, (lower(coalesce(primary_email, ''))) text_pattern_ops)
  where state = 'draft';

create index if not exists subdivision_buyer_client_profiles_search_phone_prefix
  on public.subdivision_buyer_client_profiles (organization_id, (regexp_replace(coalesce(primary_phone, ''), '\D', '', 'g')) text_pattern_ops)
  where state = 'draft';

create index if not exists subdivision_buyer_client_profiles_search_messaging_prefix
  on public.subdivision_buyer_client_profiles (organization_id, (regexp_replace(coalesce(messaging_phone, ''), '\D', '', 'g')) text_pattern_ops)
  where state = 'draft';

create index if not exists subdivision_buyer_client_profiles_search_document_prefix
  on public.subdivision_buyer_client_profiles (organization_id, (coalesce(document_reference, '')) text_pattern_ops)
  where state = 'draft';

create or replace function public.subdivision_list_draft_buyer_client_directory(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_search_term text,
  p_page_size integer,
  p_page_offset integer
)
returns table(
  buyer_client_id uuid,
  display_name text,
  party_kind text,
  registration_state text,
  profile_present boolean,
  contact_channels_recorded integer,
  requirements_pending integer,
  requirements_total integer,
  attachment_summary text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_search_term text;
  v_search_digits text;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);

  if p_search_term is not null and char_length(trim(p_search_term)) < 2 then
    raise exception using errcode = '22023', message = 'SUBDIVISION_CLIENT_DIRECTORY_SEARCH_DENIED';
  end if;
  if p_page_size < 1 or p_page_size > 25 or p_page_offset < 0 or p_page_offset > 49975 then
    raise exception using errcode = '22023', message = 'SUBDIVISION_CLIENT_DIRECTORY_PAGE_DENIED';
  end if;

  v_search_term := nullif(lower(trim(p_search_term)), '');
  v_search_digits := nullif(regexp_replace(coalesce(p_search_term, ''), '\D', '', 'g'), '');

  return query
  select
    client.id,
    party.display_name,
    party.kind::text,
    coalesce(profile.registration_state::text, 'contact_pending'),
    profile.id is not null,
    ((profile.primary_email is not null)::integer + (profile.primary_phone is not null)::integer + (profile.messaging_phone is not null)::integer),
    coalesce(requirement_summary.pending_count, 0)::integer,
    coalesce(requirement_summary.total_count, 0)::integer,
    coalesce(attachment_summary.attachment_state, 'no_private_attachment'),
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
  left join lateral (
    select
      count(*) filter (where requirement.requirement_state in ('to_confirm', 'pending_evidence', 'under_review'))::integer as pending_count,
      count(*)::integer as total_count
    from public.subdivision_buyer_client_requirements requirement
    where requirement.organization_id = client.organization_id
      and requirement.buyer_client_profile_id = profile.id
  ) requirement_summary on true
  left join lateral (
    select case when intent.storage_key is null then 'awaiting_private_upload' else 'private_upload_recorded' end as attachment_state
    from public.subdivision_buyer_attachment_intents intent
    where intent.organization_id = client.organization_id
      and intent.buyer_client_id = client.id
    order by intent.created_at desc
    limit 1
  ) attachment_summary on true
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
    )
  order by greatest(client.updated_at, coalesce(profile.updated_at, client.updated_at)) desc, client.id
  limit p_page_size offset p_page_offset;
end;
$$;

revoke all on function public.subdivision_list_draft_buyer_client_directory(uuid, uuid, public.operating_module, text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.subdivision_list_draft_buyer_client_directory(uuid, uuid, public.operating_module, text, text, integer, integer) to service_role;

comment on function public.subdivision_list_draft_buyer_client_directory(uuid, uuid, public.operating_module, text, text, integer, integer) is 'A283: diretório minimizado de Cliente Loteadora com busca autorizada por nome declarado, contato ou referência declarada; não retorna valores de contato, referências, documento, arquivo, URL ou conteúdo.';
