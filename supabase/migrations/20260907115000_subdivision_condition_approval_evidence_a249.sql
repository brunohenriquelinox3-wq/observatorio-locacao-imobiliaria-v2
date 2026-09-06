-- A249: aprovação de condição submetida exige evidência privada ainda ativa; não cria venda, contrato, cobrança, pagamento, repasse ou financeiro.

create or replace function public.subdivision_approve_price_condition_v2(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_condition_id uuid,
  p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_existing uuid;
  v_condition record;
  v_overlap uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select target_id into v_existing from public.admin_audit_events where command_name = 'subdivision_approve_price_condition_v2' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed' order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  select c.*, p.policy_state as base_policy_state, p.exception_count as base_exception_count into v_condition from public.subdivision_price_conditions c join public.subdivision_price_base_policies p on p.id = c.base_policy_id and p.organization_id = c.organization_id where c.id = p_condition_id and c.organization_id = p_organization_id for update of c;
  if v_condition.id is null or v_condition.condition_state <> 'submitted'::public.subdivision_price_base_policy_state or v_condition.created_by = p_actor_user_id or v_condition.document_state <> 'declared_complete'::public.subdivision_price_condition_document_state or v_condition.base_policy_state <> 'approved'::public.subdivision_price_base_policy_state or v_condition.base_exception_count <> 0 then raise exception using errcode = '42501', message = 'PRICE_CONDITION_APPROVAL_DENIED'; end if;
  if not exists (
    select 1 from public.subdivision_price_evidence_links evidence
    join public.subdivision_development_attachments attachment on attachment.id = evidence.attachment_id and attachment.organization_id = evidence.organization_id and attachment.development_id = evidence.development_id
    where evidence.organization_id = p_organization_id and evidence.development_id = v_condition.development_id and evidence.subject_kind = 'price_condition'::public.subdivision_price_evidence_subject_kind and evidence.price_condition_id = v_condition.id and evidence.link_state = 'active'::public.subdivision_price_evidence_link_state and attachment.attachment_state = 'recorded'::public.subdivision_development_attachment_state
  ) then raise exception using errcode = '42501', message = 'PRICE_CONDITION_EVIDENCE_REQUIRED'; end if;
  select c.id into v_overlap from public.subdivision_price_conditions c where c.organization_id = p_organization_id and c.development_id = v_condition.development_id and c.condition_state = 'approved'::public.subdivision_price_base_policy_state and c.scope = v_condition.scope and c.block_id is not distinct from v_condition.block_id and c.lot_id is not distinct from v_condition.lot_id and c.effective_from < coalesce(v_condition.effective_until, 'infinity'::date) and v_condition.effective_from < coalesce(c.effective_until, 'infinity'::date) limit 1;
  if v_overlap is not null then raise exception using errcode = '23505', message = 'PRICE_CONDITION_VIGENCY_OVERLAP'; end if;
  update public.subdivision_price_conditions set condition_state = 'approved'::public.subdivision_price_base_policy_state, approved_at = now(), approved_by = p_actor_user_id where id = p_condition_id;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_approve_price_condition_v2', 'allowed', 'subdivision_price_condition', p_condition_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'state', 'approved', 'approver_distinct_from_creator', true, 'active_evidence_required', true));
  return p_condition_id;
end;
$$;

revoke all on function public.subdivision_approve_price_condition_v2(uuid, uuid, public.operating_module, text, uuid, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_approve_price_condition_v2(uuid, uuid, public.operating_module, text, uuid, uuid) to service_role;

comment on function public.subdivision_approve_price_condition_v2 is 'A249: aprovação segregada de condição requer evidência privada ativa e registrada no momento da decisão; não cria venda, contrato ou financeiro.';
