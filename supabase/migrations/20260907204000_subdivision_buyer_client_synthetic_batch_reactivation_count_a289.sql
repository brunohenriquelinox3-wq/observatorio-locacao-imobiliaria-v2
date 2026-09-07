-- A289: corrige somente a métrica de reativação futura da importação sintética A287.
-- Não cria venda, lote, preço, crédito, proposta, contrato, registro, cobrança, pagamento ou financeiro.

create or replace function public.subdivision_import_draft_buyer_clients_synthetic(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_rows jsonb,
  p_correlation_id uuid
) returns table (
  input_count integer,
  client_count integer,
  profile_count integer,
  reactivated_count integer
)
language plpgsql security definer set search_path = '' as $$
declare
  v_existing jsonb;
  v_row record;
  v_display_name text;
  v_document_reference text;
  v_primary_phone text;
  v_messaging_phone text;
  v_party_kind public.party_kind;
  v_buyer_client_id uuid;
  v_existing_document_reference text;
  v_existing_primary_email text;
  v_existing_primary_phone text;
  v_existing_messaging_phone text;
  v_existing_identity_document_reference text;
  v_existing_civil_status public.subdivision_buyer_client_civil_status;
  v_existing_representation_state public.subdivision_buyer_client_representation_state;
  v_existing_registration_state public.subdivision_buyer_client_registration_state;
  v_existing_lifecycle_state public.party_lifecycle_state;
  v_direct_registration_was_archived boolean := false;
  v_row_correlation_id uuid;
  v_input_count integer := 0;
  v_client_count integer := 0;
  v_profile_count integer := 0;
  v_reactivated_count integer := 0;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then
    raise exception using errcode = '42501', message = 'SUBDIVISION_SYNTHETIC_BATCH_CONTEXT_DENIED';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) < 1 or jsonb_array_length(p_rows) > 200 then
    raise exception using errcode = '22023', message = 'SUBDIVISION_SYNTHETIC_BATCH_SIZE_DENIED';
  end if;

  select event.payload_redacted -> 'result' into v_existing
  from public.admin_audit_events event
  where event.command_name = 'subdivision_import_draft_buyer_clients_synthetic'
    and event.correlation_id = p_correlation_id
    and event.actor_user_id = p_actor_user_id
    and event.organization_id = p_organization_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;
  if v_existing is not null then
    return query select
      (v_existing ->> 'input_count')::integer,
      (v_existing ->> 'client_count')::integer,
      (v_existing ->> 'profile_count')::integer,
      (v_existing ->> 'reactivated_count')::integer;
    return;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_organization_id::text || ':synthetic-batch:' || p_correlation_id::text, 0)
  );

  for v_row in
    select value as entry, ordinality::integer as ordinal
    from jsonb_array_elements(p_rows) with ordinality
  loop
    v_input_count := v_input_count + 1;
    v_display_name := nullif(trim(v_row.entry ->> 'display_name'), '');
    v_document_reference := nullif(regexp_replace(coalesce(v_row.entry ->> 'document_reference', ''), '[^0-9]', '', 'g'), '');
    v_primary_phone := nullif(trim(v_row.entry ->> 'primary_phone'), '');
    v_messaging_phone := nullif(trim(v_row.entry ->> 'messaging_phone'), '');

    if v_display_name is null or char_length(v_display_name) < 2 or char_length(v_display_name) > 160 then
      raise exception using errcode = '22023', message = 'SUBDIVISION_SYNTHETIC_BATCH_NAME_DENIED';
    end if;
    if v_document_reference is null or char_length(v_document_reference) not in (11, 14) then
      raise exception using errcode = '22023', message = 'SUBDIVISION_SYNTHETIC_BATCH_DOCUMENT_DENIED';
    end if;
    if (v_primary_phone is not null and v_primary_phone !~ '^[0-9+().\-[:space:]]{8,25}$')
      or (v_messaging_phone is not null and v_messaging_phone !~ '^[0-9+().\-[:space:]]{8,25}$') then
      raise exception using errcode = '22023', message = 'SUBDIVISION_SYNTHETIC_BATCH_PHONE_DENIED';
    end if;
    v_party_kind := case when char_length(v_document_reference) = 14 then 'legal_entity'::public.party_kind else 'individual'::public.party_kind end;
    v_row_correlation_id := (
      substr(md5(p_correlation_id::text || ':' || v_row.ordinal::text), 1, 8) || '-' ||
      substr(md5(p_correlation_id::text || ':' || v_row.ordinal::text), 9, 4) || '-' ||
      substr(md5(p_correlation_id::text || ':' || v_row.ordinal::text), 13, 4) || '-' ||
      substr(md5(p_correlation_id::text || ':' || v_row.ordinal::text), 17, 4) || '-' ||
      substr(md5(p_correlation_id::text || ':' || v_row.ordinal::text), 21, 12)
    )::uuid;

    select profile.buyer_client_id, profile.document_reference, profile.primary_email, profile.primary_phone,
      profile.messaging_phone, profile.identity_document_reference, profile.civil_status,
      profile.representation_state, profile.registration_state, client.state
    into v_buyer_client_id, v_existing_document_reference, v_existing_primary_email, v_existing_primary_phone,
      v_existing_messaging_phone, v_existing_identity_document_reference, v_existing_civil_status,
      v_existing_representation_state, v_existing_registration_state, v_existing_lifecycle_state
    from public.subdivision_buyer_client_profiles profile
    join public.subdivision_buyer_clients client on client.id = profile.buyer_client_id
      and client.organization_id = profile.organization_id
    where profile.organization_id = p_organization_id
      and profile.state = 'draft'
      and profile.document_reference = v_document_reference
    order by profile.updated_at desc, profile.id desc
    limit 1;

    if v_buyer_client_id is null then
      select profile.document_reference, client.state = 'archived'
      into v_existing_document_reference, v_direct_registration_was_archived
      from public.subdivision_buyer_clients client
      join public.party_role_assignments role_assignment on role_assignment.id = client.party_role_assignment_id
        and role_assignment.organization_id = client.organization_id
      join public.party_records party on party.id = role_assignment.party_id
        and party.organization_id = role_assignment.organization_id
      left join public.subdivision_buyer_client_profiles profile on profile.buyer_client_id = client.id
        and profile.organization_id = client.organization_id and profile.state = 'draft'
      where client.organization_id = p_organization_id
        and role_assignment.module = 'loteadora'
        and role_assignment.role in ('client', 'buyer')
        and role_assignment.state = 'draft'
        and party.state = 'draft'
        and lower(trim(party.display_name)) = lower(v_display_name)
      order by client.updated_at desc, client.id desc
      limit 1;
      if v_existing_document_reference is not null and v_existing_document_reference <> v_document_reference then
        raise exception using errcode = '23505', message = 'SUBDIVISION_SYNTHETIC_BATCH_NAME_DOCUMENT_CONFLICT';
      end if;

      select registered.client_id into v_buyer_client_id
      from public.subdivision_register_client_direct(
        p_actor_user_id, p_organization_id, p_module, p_purpose_code, v_party_kind, v_display_name, v_row_correlation_id
      ) registered;
      if coalesce(v_direct_registration_was_archived, false) then
        v_reactivated_count := v_reactivated_count + 1;
      end if;

      select profile.document_reference, profile.primary_email, profile.primary_phone, profile.messaging_phone,
        profile.identity_document_reference, profile.civil_status, profile.representation_state,
        profile.registration_state, client.state
      into v_existing_document_reference, v_existing_primary_email, v_existing_primary_phone, v_existing_messaging_phone,
        v_existing_identity_document_reference, v_existing_civil_status, v_existing_representation_state,
        v_existing_registration_state, v_existing_lifecycle_state
      from public.subdivision_buyer_clients client
      left join public.subdivision_buyer_client_profiles profile on profile.buyer_client_id = client.id
        and profile.organization_id = client.organization_id and profile.state = 'draft'
      where client.id = v_buyer_client_id and client.organization_id = p_organization_id;
    end if;

    perform public.subdivision_upsert_draft_buyer_client_profile(
      p_actor_user_id,
      p_organization_id,
      p_module,
      p_purpose_code,
      v_buyer_client_id,
      case when v_party_kind = 'legal_entity' then 'legal_entity'::public.subdivision_buyer_client_profile_party_kind else 'individual'::public.subdivision_buyer_client_profile_party_kind end,
      coalesce(v_existing_registration_state, 'base_data_in_progress'::public.subdivision_buyer_client_registration_state),
      v_document_reference,
      v_existing_identity_document_reference,
      v_existing_primary_email,
      coalesce(v_primary_phone, v_existing_primary_phone),
      coalesce(v_messaging_phone, v_existing_messaging_phone),
      coalesce(v_existing_civil_status, 'not_declared'::public.subdivision_buyer_client_civil_status),
      coalesce(v_existing_representation_state, 'self_represented'::public.subdivision_buyer_client_representation_state),
      (
        substr(md5(p_correlation_id::text || ':profile:' || v_row.ordinal::text), 1, 8) || '-' ||
        substr(md5(p_correlation_id::text || ':profile:' || v_row.ordinal::text), 9, 4) || '-' ||
        substr(md5(p_correlation_id::text || ':profile:' || v_row.ordinal::text), 13, 4) || '-' ||
        substr(md5(p_correlation_id::text || ':profile:' || v_row.ordinal::text), 17, 4) || '-' ||
        substr(md5(p_correlation_id::text || ':profile:' || v_row.ordinal::text), 21, 12)
      )::uuid
    );
    v_client_count := v_client_count + 1;
    v_profile_count := v_profile_count + 1;
  end loop;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_import_draft_buyer_clients_synthetic',
    'allowed', 'subdivision_buyer_client_batch', null,
    jsonb_build_object(
      'module', p_module::text,
      'purpose_code', trim(p_purpose_code),
      'input_count', v_input_count,
      'result', jsonb_build_object(
        'input_count', v_input_count,
        'client_count', v_client_count,
        'profile_count', v_profile_count,
        'reactivated_count', v_reactivated_count
      )
    )
  );

  return query select v_input_count, v_client_count, v_profile_count, v_reactivated_count;
end;
$$;

revoke all on function public.subdivision_import_draft_buyer_clients_synthetic(uuid, uuid, public.operating_module, text, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_import_draft_buyer_clients_synthetic(uuid, uuid, public.operating_module, text, jsonb, uuid) to service_role;
