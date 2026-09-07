-- A281: cadastro direto e mínimo de Cliente Loteadora na jornada autorizada.
-- Reutiliza Party, papel temporal e cliente comprador; não cria dados de contato, documento, venda, crédito, preço, contrato, registro, cobrança ou pagamento.

create or replace function public.subdivision_register_buyer_client_direct(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_party_kind public.party_kind,
  p_display_name text,
  p_correlation_id uuid
) returns table(buyer_client_id uuid, party_id uuid, party_role_assignment_id uuid)
language plpgsql security definer set search_path = '' as $$
declare
  v_party_id uuid;
  v_role_id uuid;
  v_buyer_client_id uuid;
  v_existing_target uuid;
  v_party_reused boolean := false;
  v_role_reused boolean := false;
  v_buyer_reused boolean := false;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then
    raise exception using errcode = '42501', message = 'SUBDIVISION_BUYER_CLIENT_DIRECT_CONTEXT_DENIED';
  end if;
  if char_length(trim(p_display_name)) < 2 or char_length(trim(p_display_name)) > 160 then
    raise exception using errcode = '22023', message = 'SUBDIVISION_BUYER_CLIENT_DIRECT_NAME_DENIED';
  end if;

  select event.target_id into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'subdivision_register_buyer_client_direct'
    and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;
  if v_existing_target is not null then
    return query
    select buyer.id, role_assignment.party_id, role_assignment.id
    from public.subdivision_buyer_clients buyer
    join public.party_role_assignments role_assignment
      on role_assignment.id = buyer.party_role_assignment_id and role_assignment.organization_id = buyer.organization_id
    where buyer.id = v_existing_target and buyer.organization_id = p_organization_id;
    return;
  end if;

  select party.id into v_party_id
  from public.party_records party
  where party.organization_id = p_organization_id and party.kind = p_party_kind and party.state = 'draft'
    and lower(trim(party.display_name)) = lower(trim(p_display_name))
  order by party.created_at asc, party.id asc
  limit 1;
  v_party_reused := v_party_id is not null;
  if v_party_id is null then
    insert into public.party_records (organization_id, kind, display_name, source_kind, state, created_by)
    values (p_organization_id, p_party_kind, trim(p_display_name), 'operator_declaration', 'draft', p_actor_user_id)
    returning id into v_party_id;
  end if;

  select role_assignment.id into v_role_id
  from public.party_role_assignments role_assignment
  where role_assignment.organization_id = p_organization_id and role_assignment.party_id = v_party_id
    and role_assignment.module = p_module and role_assignment.role in ('client', 'buyer')
    and role_assignment.purpose_code = trim(p_purpose_code) and role_assignment.state = 'draft'
    and (role_assignment.ends_at is null or role_assignment.ends_at > now())
  order by case when role_assignment.role = 'buyer' then 0 else 1 end, role_assignment.starts_at asc
  limit 1;
  v_role_reused := v_role_id is not null;
  if v_role_id is null then
    insert into public.party_role_assignments (organization_id, party_id, module, role, purpose_code, starts_at, state, created_by)
    values (p_organization_id, v_party_id, p_module, 'buyer', trim(p_purpose_code), now(), 'draft', p_actor_user_id)
    returning id into v_role_id;
  end if;

  select buyer.id into v_buyer_client_id
  from public.subdivision_buyer_clients buyer
  where buyer.organization_id = p_organization_id and buyer.party_role_assignment_id = v_role_id;
  v_buyer_reused := v_buyer_client_id is not null;
  if v_buyer_client_id is null then
    insert into public.subdivision_buyer_clients (organization_id, party_role_assignment_id, created_by)
    values (p_organization_id, v_role_id, p_actor_user_id)
    returning id into v_buyer_client_id;
  end if;

  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_register_buyer_client_direct', 'allowed',
    'subdivision_buyer_client', v_buyer_client_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'party_kind', p_party_kind::text,
      'display_name_present', true, 'party_reused', v_party_reused, 'role_reused', v_role_reused, 'buyer_reused', v_buyer_reused)
  );

  return query select v_buyer_client_id, v_party_id, v_role_id;
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
    select 1 from public.subdivision_buyer_clients buyer
    join public.party_role_assignments role_assignment
      on role_assignment.id = buyer.party_role_assignment_id and role_assignment.organization_id = buyer.organization_id
    where buyer.id = p_buyer_client_id and buyer.organization_id = p_organization_id
      and role_assignment.module = 'loteadora' and role_assignment.role in ('client', 'buyer') and role_assignment.state = 'draft'
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_BUYER_CLIENT_TIMELINE_CONTEXT_DENIED';
  end if;
  return query
  select case audit.command_name
      when 'subdivision_create_draft_buyer_client' then 'buyer_client_registered'
      when 'subdivision_register_buyer_client_direct' then 'buyer_client_registered'
      when 'subdivision_upsert_draft_buyer_client_profile' then 'profile_cadastral_atualizado'
      when 'subdivision_upsert_draft_buyer_client_requirement' then 'pendencia_atualizada'
      when 'subdivision_upsert_draft_buyer_client_contact_preference' then 'preferencia_atualizada'
      when 'subdivision_create_buyer_attachment_intent' then 'anexo_privado_registrado'
    end, audit.occurred_at
  from public.admin_audit_events audit
  where audit.organization_id = p_organization_id and audit.outcome = 'allowed'
    and audit.command_name in ('subdivision_create_draft_buyer_client', 'subdivision_register_buyer_client_direct', 'subdivision_upsert_draft_buyer_client_profile', 'subdivision_upsert_draft_buyer_client_requirement', 'subdivision_upsert_draft_buyer_client_contact_preference', 'subdivision_create_buyer_attachment_intent')
    and ((audit.command_name in ('subdivision_create_draft_buyer_client', 'subdivision_register_buyer_client_direct') and audit.target_id = p_buyer_client_id)
      or exists (select 1 from public.subdivision_buyer_client_profiles profile where profile.id = audit.target_id and profile.organization_id = p_organization_id and profile.buyer_client_id = p_buyer_client_id)
      or exists (select 1 from public.subdivision_buyer_client_requirements requirement join public.subdivision_buyer_client_profiles profile on profile.id = requirement.buyer_client_profile_id and profile.organization_id = requirement.organization_id where requirement.id = audit.target_id and requirement.organization_id = p_organization_id and profile.buyer_client_id = p_buyer_client_id)
      or exists (select 1 from public.subdivision_buyer_client_contact_preferences preference join public.subdivision_buyer_client_profiles profile on profile.id = preference.buyer_client_profile_id and profile.organization_id = preference.organization_id where preference.id = audit.target_id and preference.organization_id = p_organization_id and profile.buyer_client_id = p_buyer_client_id)
      or exists (select 1 from public.subdivision_buyer_attachment_intents intent where intent.id = audit.target_id and intent.organization_id = p_organization_id and intent.buyer_client_id = p_buyer_client_id))
  order by audit.occurred_at desc, audit.id desc limit p_limit;
end;
$$;

revoke all on function public.subdivision_register_buyer_client_direct(uuid,uuid,public.operating_module,text,public.party_kind,text,uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_draft_buyer_client_timeline(uuid,uuid,public.operating_module,text,uuid,integer) from public, anon, authenticated;
grant execute on function public.subdivision_register_buyer_client_direct(uuid,uuid,public.operating_module,text,public.party_kind,text,uuid) to service_role;
grant execute on function public.subdivision_list_draft_buyer_client_timeline(uuid,uuid,public.operating_module,text,uuid,integer) to service_role;
