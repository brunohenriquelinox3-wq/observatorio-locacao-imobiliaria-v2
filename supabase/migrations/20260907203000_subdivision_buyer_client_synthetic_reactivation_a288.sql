-- A288: reativa somente clientes sintéticos arquivados que já constem no lote por referência fiscal.
-- Não altera perfil, contato, documento, venda, lote, crédito, proposta, contrato, registro, cobrança ou pagamento.

create or replace function public.subdivision_reactivate_draft_buyer_clients_synthetic(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_rows jsonb,
  p_correlation_id uuid
) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_existing jsonb;
  v_row record;
  v_document_reference text;
  v_buyer_client_id uuid;
  v_row_correlation_id uuid;
  v_reactivated_count integer := 0;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then
    raise exception using errcode = '42501', message = 'SUBDIVISION_SYNTHETIC_REACTIVATION_CONTEXT_DENIED';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) < 1 or jsonb_array_length(p_rows) > 200 then
    raise exception using errcode = '22023', message = 'SUBDIVISION_SYNTHETIC_REACTIVATION_SIZE_DENIED';
  end if;

  select event.payload_redacted -> 'result' into v_existing
  from public.admin_audit_events event
  where event.command_name = 'subdivision_reactivate_draft_buyer_clients_synthetic'
    and event.correlation_id = p_correlation_id
    and event.actor_user_id = p_actor_user_id
    and event.organization_id = p_organization_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;
  if v_existing is not null then
    return (v_existing ->> 'reactivated_count')::integer;
  end if;

  for v_row in
    select value as entry, ordinality::integer as ordinal
    from jsonb_array_elements(p_rows) with ordinality
  loop
    v_document_reference := nullif(regexp_replace(coalesce(v_row.entry ->> 'document_reference', ''), '[^0-9]', '', 'g'), '');
    if v_document_reference is null or char_length(v_document_reference) not in (11, 14) then
      raise exception using errcode = '22023', message = 'SUBDIVISION_SYNTHETIC_REACTIVATION_DOCUMENT_DENIED';
    end if;

    select client.id into v_buyer_client_id
    from public.subdivision_buyer_client_profiles profile
    join public.subdivision_buyer_clients client on client.id = profile.buyer_client_id
      and client.organization_id = profile.organization_id
    where profile.organization_id = p_organization_id
      and profile.state = 'draft'
      and profile.document_reference = v_document_reference
      and client.state = 'archived'
    order by client.updated_at desc, client.id desc
    limit 1;

    if v_buyer_client_id is not null then
      v_row_correlation_id := (
        substr(md5(p_correlation_id::text || ':' || v_row.ordinal::text), 1, 8) || '-' ||
        substr(md5(p_correlation_id::text || ':' || v_row.ordinal::text), 9, 4) || '-' ||
        substr(md5(p_correlation_id::text || ':' || v_row.ordinal::text), 13, 4) || '-' ||
        substr(md5(p_correlation_id::text || ':' || v_row.ordinal::text), 17, 4) || '-' ||
        substr(md5(p_correlation_id::text || ':' || v_row.ordinal::text), 21, 12)
      )::uuid;
      perform public.subdivision_restore_client(
        p_actor_user_id, p_organization_id, p_module, p_purpose_code, v_buyer_client_id, v_row_correlation_id
      );
      v_reactivated_count := v_reactivated_count + 1;
    end if;
  end loop;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_reactivate_draft_buyer_clients_synthetic',
    'allowed', 'subdivision_buyer_client_batch', null,
    jsonb_build_object(
      'module', p_module::text,
      'purpose_code', trim(p_purpose_code),
      'result', jsonb_build_object('reactivated_count', v_reactivated_count)
    )
  );
  return v_reactivated_count;
end;
$$;

revoke all on function public.subdivision_reactivate_draft_buyer_clients_synthetic(uuid, uuid, public.operating_module, text, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_reactivate_draft_buyer_clients_synthetic(uuid, uuid, public.operating_module, text, jsonb, uuid) to service_role;
