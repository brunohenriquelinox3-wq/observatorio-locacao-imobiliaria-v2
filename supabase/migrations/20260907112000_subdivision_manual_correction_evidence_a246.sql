-- A246: correção manual exige evidência privada ativa na política-fonte; não cria venda, contrato, cobrança, pagamento, repasse ou financeiro.

create or replace function public.subdivision_prepare_manual_price_base_correction_v2(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid,
  p_source_policy_id uuid,
  p_version_reference text,
  p_effective_from date,
  p_source_row integer,
  p_block_number integer,
  p_lot_number integer,
  p_price_per_sqm_brl numeric,
  p_source_fingerprint text,
  p_row_fingerprint text,
  p_reason_code text,
  p_document_state text,
  p_correlation_id uuid
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_existing_result jsonb;
  v_source_policy record;
  v_existing_policy record;
  v_block_id uuid;
  v_lot_id uuid;
  v_area_sqm numeric;
  v_policy_id uuid;
  v_line_count integer;
  v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (
    select 1 from public.subdivision_developments development
    where development.id = p_development_id
      and development.organization_id = p_organization_id
      and development.state = 'draft'::public.party_lifecycle_state
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED';
  end if;
  if p_version_reference !~ '^PB_[A-Z0-9_]{3,72}$'
    or p_effective_from is null
    or p_source_row not between 2 and 5000
    or p_block_number not between 1 and 999
    or p_lot_number not between 1 and 100
    or p_price_per_sqm_brl not between 0.01 and 1000000000
    or p_source_fingerprint !~ '^[a-f0-9]{64}$'
    or p_row_fingerprint !~ '^[a-f0-9]{64}$'
    or p_reason_code not in ('source_correction', 'internal_validation', 'documented_revision')
    or p_document_state <> 'declared_complete'
  then
    raise exception using errcode = '22023', message = 'PRICE_BASE_MANUAL_CORRECTION_INPUT_INVALID';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_organization_id::text || ':' || p_development_id::text || ':' || trim(upper(p_version_reference)), 0));
  select event.payload_redacted -> 'result' into v_existing_result
  from public.admin_audit_events event
  where event.command_name = 'subdivision_prepare_manual_price_base_correction_v2'
    and event.correlation_id = p_correlation_id
    and event.actor_user_id = p_actor_user_id
    and event.organization_id = p_organization_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_result is not null then return v_existing_result; end if;
  select * into v_source_policy
  from public.subdivision_price_base_policies policy
  where policy.id = p_source_policy_id
    and policy.organization_id = p_organization_id
    and policy.development_id = p_development_id
  for update;
  if v_source_policy.id is null
    or v_source_policy.policy_state <> 'prepared'::public.subdivision_price_base_policy_state
    or v_source_policy.exception_count <> 1
    or v_source_policy.source_row_count <> (select count(*)::integer + 1 from public.subdivision_price_base_policy_lines line where line.organization_id = p_organization_id and line.policy_id = v_source_policy.id)
    or p_source_row > v_source_policy.source_row_count + 1
  then
    raise exception using errcode = '42501', message = 'PRICE_BASE_MANUAL_CORRECTION_POLICY_DENIED';
  end if;
  if not exists (
    select 1
    from public.subdivision_price_evidence_links evidence
    join public.subdivision_development_attachments attachment
      on attachment.id = evidence.attachment_id
      and attachment.organization_id = evidence.organization_id
      and attachment.development_id = evidence.development_id
    where evidence.organization_id = p_organization_id
      and evidence.development_id = p_development_id
      and evidence.subject_kind = 'price_base_policy'::public.subdivision_price_evidence_subject_kind
      and evidence.price_base_policy_id = v_source_policy.id
      and evidence.link_state = 'active'::public.subdivision_price_evidence_link_state
      and attachment.attachment_state = 'recorded'::public.subdivision_development_attachment_state
  ) then
    raise exception using errcode = '42501', message = 'PRICE_BASE_MANUAL_CORRECTION_EVIDENCE_REQUIRED';
  end if;
  select block.id, lot.id, lot.area_sqm into v_block_id, v_lot_id, v_area_sqm
  from public.subdivision_blocks block
  join public.subdivision_lots lot on lot.organization_id = p_organization_id and lot.block_id = block.id and lot.lot_number = p_lot_number and lot.state = 'draft'::public.party_lifecycle_state
  where block.organization_id = p_organization_id
    and block.development_id = p_development_id
    and block.block_number = p_block_number
    and block.state = 'draft'::public.party_lifecycle_state
  limit 1;
  if v_lot_id is null or v_area_sqm is null or v_area_sqm <= 0
    or exists (select 1 from public.subdivision_price_base_policy_lines line where line.organization_id = p_organization_id and line.policy_id = v_source_policy.id and line.lot_id = v_lot_id)
  then
    raise exception using errcode = '42501', message = 'PRICE_BASE_MANUAL_CORRECTION_PHYSICAL_DENIED';
  end if;
  select id, source_fingerprint into v_existing_policy
  from public.subdivision_price_base_policies policy
  where policy.organization_id = p_organization_id
    and policy.development_id = p_development_id
    and policy.version_reference = trim(upper(p_version_reference));
  if v_existing_policy.id is not null then
    if v_existing_policy.source_fingerprint <> p_source_fingerprint then
      raise exception using errcode = '23505', message = 'PRICE_BASE_MANUAL_CORRECTION_VERSION_CONFLICT';
    end if;
    select count(*)::integer into v_line_count from public.subdivision_price_base_policy_lines line where line.organization_id = p_organization_id and line.policy_id = v_existing_policy.id;
    return jsonb_build_object('policy_id', v_existing_policy.id, 'line_count', v_line_count, 'exception_count', 0);
  end if;
  insert into public.subdivision_price_base_policies(
    organization_id, development_id, version_reference, policy_state, effective_from, source_fingerprint,
    source_schema_version, source_row_count, exception_count, created_by
  ) values (
    p_organization_id, p_development_id, trim(upper(p_version_reference)), 'prepared'::public.subdivision_price_base_policy_state,
    p_effective_from, p_source_fingerprint, 'price-base-manual-correction-v1', v_source_policy.source_row_count, 0, p_actor_user_id
  ) returning id into v_policy_id;
  insert into public.subdivision_price_base_policy_lines(organization_id, policy_id, block_id, lot_id, source_area_sqm, base_price_per_sqm_brl, row_fingerprint)
  select p_organization_id, v_policy_id, line.block_id, line.lot_id, line.source_area_sqm, line.base_price_per_sqm_brl, line.row_fingerprint
  from public.subdivision_price_base_policy_lines line
  where line.organization_id = p_organization_id and line.policy_id = v_source_policy.id;
  insert into public.subdivision_price_base_policy_lines(organization_id, policy_id, block_id, lot_id, source_area_sqm, base_price_per_sqm_brl, row_fingerprint)
  values (p_organization_id, v_policy_id, v_block_id, v_lot_id, v_area_sqm, p_price_per_sqm_brl, p_row_fingerprint);
  select count(*)::integer into v_line_count from public.subdivision_price_base_policy_lines line where line.organization_id = p_organization_id and line.policy_id = v_policy_id;
  v_result := jsonb_build_object('policy_id', v_policy_id, 'line_count', v_line_count, 'exception_count', 0);
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_prepare_manual_price_base_correction_v2', 'allowed',
    'subdivision_price_base_policy', v_policy_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'source_policy_present', true,
      'source_evidence_linked', true, 'manual_correction', true, 'reason_code', p_reason_code, 'document_state', p_document_state,
      'source_row_declared', true, 'area_provenance', 'matrix_physical', 'result', v_result)
  );
  return v_result;
end;
$$;

revoke all on function public.subdivision_prepare_manual_price_base_correction_v2(uuid, uuid, public.operating_module, text, uuid, uuid, text, date, integer, integer, integer, numeric, text, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_prepare_manual_price_base_correction_v2(uuid, uuid, public.operating_module, text, uuid, uuid, text, date, integer, integer, integer, numeric, text, text, text, text, uuid) to service_role;

comment on function public.subdivision_prepare_manual_price_base_correction_v2 is 'A246: correção manual derivada exige vínculo ativo a anexo privado registrado na política-fonte; sem bytes, URL, preço em auditoria, venda, contrato ou financeiro.';
