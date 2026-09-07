-- A280: diretório contextual e linha do tempo redigida de Clientes Loteadora.
-- Não cria dados, não altera Party, não expõe referência fiscal ou contato, e não inicia venda, crédito, contrato, registro ou financeiro.

create index if not exists subdivision_buyer_clients_directory_lookup
  on public.subdivision_buyer_clients (organization_id, created_at desc);

create or replace function public.subdivision_list_draft_buyer_client_directory(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_search_term text,
  p_page_size integer,
  p_page_offset integer
) returns table(
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
) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_search_term is not null and char_length(trim(p_search_term)) < 2 then
    raise exception using errcode = '22023', message = 'SUBDIVISION_BUYER_CLIENT_DIRECTORY_SEARCH_DENIED';
  end if;
  if p_page_size < 1 or p_page_size > 25 or p_page_offset < 0 or p_page_offset > 500 then
    raise exception using errcode = '22023', message = 'SUBDIVISION_BUYER_CLIENT_DIRECTORY_PAGE_DENIED';
  end if;

  return query
  select
    buyer.id,
    party.display_name,
    party.kind::text,
    coalesce(profile.registration_state::text, 'contact_pending'),
    profile.id is not null,
    ((profile.primary_email is not null)::integer + (profile.primary_phone is not null)::integer + (profile.messaging_phone is not null)::integer),
    coalesce(requirement_summary.pending_count, 0)::integer,
    coalesce(requirement_summary.total_count, 0)::integer,
    coalesce(attachment_summary.attachment_state, 'no_private_attachment'),
    greatest(buyer.created_at, coalesce(profile.updated_at, buyer.created_at))
  from public.subdivision_buyer_clients buyer
  join public.party_role_assignments role_assignment
    on role_assignment.id = buyer.party_role_assignment_id and role_assignment.organization_id = buyer.organization_id
  join public.party_records party
    on party.id = role_assignment.party_id and party.organization_id = role_assignment.organization_id
  left join public.subdivision_buyer_client_profiles profile
    on profile.buyer_client_id = buyer.id and profile.organization_id = buyer.organization_id and profile.state = 'draft'
  left join lateral (
    select
      count(*) filter (where requirement.requirement_state in ('to_confirm', 'pending_evidence', 'under_review'))::integer as pending_count,
      count(*)::integer as total_count
    from public.subdivision_buyer_client_requirements requirement
    where requirement.organization_id = buyer.organization_id and requirement.buyer_client_profile_id = profile.id
  ) requirement_summary on true
  left join lateral (
    select case when intent.storage_key is null then 'awaiting_private_upload' else 'private_upload_recorded' end as attachment_state
    from public.subdivision_buyer_attachment_intents intent
    where intent.organization_id = buyer.organization_id and intent.buyer_client_id = buyer.id
    order by intent.created_at desc
    limit 1
  ) attachment_summary on true
  where buyer.organization_id = p_organization_id
    and role_assignment.module = 'loteadora'
    and role_assignment.role in ('client', 'buyer')
    and role_assignment.state = 'draft'
    and party.state = 'draft'
    and (p_search_term is null or party.display_name ilike '%' || trim(p_search_term) || '%')
  order by greatest(buyer.created_at, coalesce(profile.updated_at, buyer.created_at)) desc, buyer.id
  limit p_page_size offset p_page_offset;
end;
$$;

create or replace function public.subdivision_list_draft_buyer_client_timeline(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_buyer_client_id uuid,
  p_limit integer
) returns table(event_kind text, occurred_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_limit < 1 or p_limit > 50 then
    raise exception using errcode = '22023', message = 'SUBDIVISION_BUYER_CLIENT_TIMELINE_LIMIT_DENIED';
  end if;
  if not exists (
    select 1
    from public.subdivision_buyer_clients buyer
    join public.party_role_assignments role_assignment
      on role_assignment.id = buyer.party_role_assignment_id and role_assignment.organization_id = buyer.organization_id
    where buyer.id = p_buyer_client_id and buyer.organization_id = p_organization_id
      and role_assignment.module = 'loteadora' and role_assignment.role in ('client', 'buyer') and role_assignment.state = 'draft'
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_BUYER_CLIENT_TIMELINE_CONTEXT_DENIED';
  end if;

  return query
  select
    case audit.command_name
      when 'subdivision_create_draft_buyer_client' then 'buyer_client_registered'
      when 'subdivision_upsert_draft_buyer_client_profile' then 'profile_cadastral_atualizado'
      when 'subdivision_upsert_draft_buyer_client_requirement' then 'pendencia_atualizada'
      when 'subdivision_upsert_draft_buyer_client_contact_preference' then 'preferencia_atualizada'
      when 'subdivision_create_buyer_attachment_intent' then 'anexo_privado_registrado'
    end,
    audit.occurred_at
  from public.admin_audit_events audit
  where audit.organization_id = p_organization_id and audit.outcome = 'allowed'
    and audit.command_name in (
      'subdivision_create_draft_buyer_client',
      'subdivision_upsert_draft_buyer_client_profile',
      'subdivision_upsert_draft_buyer_client_requirement',
      'subdivision_upsert_draft_buyer_client_contact_preference',
      'subdivision_create_buyer_attachment_intent'
    )
    and (
      (audit.command_name = 'subdivision_create_draft_buyer_client' and audit.target_id = p_buyer_client_id)
      or exists (
        select 1 from public.subdivision_buyer_client_profiles profile
        where profile.id = audit.target_id and profile.organization_id = p_organization_id and profile.buyer_client_id = p_buyer_client_id
      )
      or exists (
        select 1 from public.subdivision_buyer_client_requirements requirement
        join public.subdivision_buyer_client_profiles profile
          on profile.id = requirement.buyer_client_profile_id and profile.organization_id = requirement.organization_id
        where requirement.id = audit.target_id and requirement.organization_id = p_organization_id and profile.buyer_client_id = p_buyer_client_id
      )
      or exists (
        select 1 from public.subdivision_buyer_client_contact_preferences preference
        join public.subdivision_buyer_client_profiles profile
          on profile.id = preference.buyer_client_profile_id and profile.organization_id = preference.organization_id
        where preference.id = audit.target_id and preference.organization_id = p_organization_id and profile.buyer_client_id = p_buyer_client_id
      )
      or exists (
        select 1 from public.subdivision_buyer_attachment_intents intent
        where intent.id = audit.target_id and intent.organization_id = p_organization_id and intent.buyer_client_id = p_buyer_client_id
      )
    )
  order by audit.occurred_at desc, audit.id desc
  limit p_limit;
end;
$$;

revoke all on function public.subdivision_list_draft_buyer_client_directory(uuid,uuid,public.operating_module,text,text,integer,integer) from public, anon, authenticated;
revoke all on function public.subdivision_list_draft_buyer_client_timeline(uuid,uuid,public.operating_module,text,uuid,integer) from public, anon, authenticated;
grant execute on function public.subdivision_list_draft_buyer_client_directory(uuid,uuid,public.operating_module,text,text,integer,integer) to service_role;
grant execute on function public.subdivision_list_draft_buyer_client_timeline(uuid,uuid,public.operating_module,text,uuid,integer) to service_role;
