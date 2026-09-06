-- A248: aprovação de política-base submetida exige evidência privada ainda ativa; não cria venda, contrato, cobrança, pagamento, repasse ou financeiro.

create or replace function public.subdivision_approve_price_base_policy_v2(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_policy_id uuid,
  p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_existing uuid;
  v_policy record;
  v_conflicting_policy uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select target_id into v_existing
  from public.admin_audit_events
  where command_name = 'subdivision_approve_price_base_policy_v2'
    and correlation_id = p_correlation_id
    and actor_user_id = p_actor_user_id
    and organization_id = p_organization_id
    and outcome = 'allowed'
  order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  select * into v_policy
  from public.subdivision_price_base_policies
  where id = p_policy_id and organization_id = p_organization_id
  for update;
  if v_policy.id is null
    or v_policy.policy_state <> 'submitted'::public.subdivision_price_base_policy_state
    or v_policy.exception_count <> 0
    or v_policy.created_by = p_actor_user_id
  then
    raise exception using errcode = '42501', message = 'PRICE_BASE_POLICY_APPROVAL_DENIED';
  end if;
  if not exists (
    select 1
    from public.subdivision_price_evidence_links evidence
    join public.subdivision_development_attachments attachment
      on attachment.id = evidence.attachment_id
      and attachment.organization_id = evidence.organization_id
      and attachment.development_id = evidence.development_id
    where evidence.organization_id = p_organization_id
      and evidence.development_id = v_policy.development_id
      and evidence.subject_kind = 'price_base_policy'::public.subdivision_price_evidence_subject_kind
      and evidence.price_base_policy_id = v_policy.id
      and evidence.link_state = 'active'::public.subdivision_price_evidence_link_state
      and attachment.attachment_state = 'recorded'::public.subdivision_development_attachment_state
  ) then
    raise exception using errcode = '42501', message = 'PRICE_BASE_POLICY_EVIDENCE_REQUIRED';
  end if;
  select id into v_conflicting_policy
  from public.subdivision_price_base_policies
  where organization_id = p_organization_id
    and development_id = v_policy.development_id
    and policy_state = 'approved'::public.subdivision_price_base_policy_state
    and effective_from >= v_policy.effective_from
  limit 1;
  if v_conflicting_policy is not null then
    raise exception using errcode = '23505', message = 'PRICE_BASE_POLICY_VIGENCY_OVERLAP';
  end if;
  update public.subdivision_price_base_policies
  set policy_state = 'expired'::public.subdivision_price_base_policy_state,
      effective_until = v_policy.effective_from
  where organization_id = p_organization_id
    and development_id = v_policy.development_id
    and policy_state = 'approved'::public.subdivision_price_base_policy_state
    and effective_from < v_policy.effective_from;
  update public.subdivision_price_base_policies
  set policy_state = 'approved'::public.subdivision_price_base_policy_state,
      approved_at = now(),
      approved_by = p_actor_user_id
  where id = p_policy_id;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_approve_price_base_policy_v2', 'allowed', 'subdivision_price_base_policy', p_policy_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'state', 'approved', 'approver_distinct_from_creator', true, 'active_evidence_required', true));
  return p_policy_id;
end;
$$;

revoke all on function public.subdivision_approve_price_base_policy_v2(uuid, uuid, public.operating_module, text, uuid, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_approve_price_base_policy_v2(uuid, uuid, public.operating_module, text, uuid, uuid) to service_role;

comment on function public.subdivision_approve_price_base_policy_v2 is 'A248: aprovação segregada de política-base requer evidência privada ativa e registrada no momento da decisão; não cria venda, contrato ou financeiro.';
