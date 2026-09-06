-- A243: evidência privada é obrigatória apenas para encaminhar condição preparada.
-- Preparação continua possível sem documento; não cria venda, contrato, financeiro ou disponibilidade.

create or replace function public.subdivision_submit_price_condition_v2(
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
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);

  select target_id into v_existing
  from public.admin_audit_events
  where command_name = 'subdivision_submit_price_condition_v2'
    and correlation_id = p_correlation_id
    and actor_user_id = p_actor_user_id
    and organization_id = p_organization_id
    and outcome = 'allowed'
  order by occurred_at desc
  limit 1;
  if v_existing is not null then return v_existing; end if;

  select c.*, p.policy_state as base_policy_state, p.exception_count as base_exception_count
    into v_condition
  from public.subdivision_price_conditions c
  join public.subdivision_price_base_policies p
    on p.id = c.base_policy_id and p.organization_id = c.organization_id
  where c.id = p_condition_id and c.organization_id = p_organization_id
  for update of c;

  if v_condition.id is null
    or v_condition.condition_state <> 'prepared'::public.subdivision_price_base_policy_state
    or v_condition.document_state <> 'declared_complete'::public.subdivision_price_condition_document_state
    or v_condition.base_policy_state <> 'approved'::public.subdivision_price_base_policy_state
    or v_condition.base_exception_count <> 0 then
    raise exception using errcode = '42501', message = 'PRICE_CONDITION_SUBMISSION_DENIED';
  end if;

  if not exists (
    select 1
    from public.subdivision_price_evidence_links l
    join public.subdivision_development_attachments a
      on a.id = l.attachment_id
      and a.organization_id = l.organization_id
      and a.development_id = l.development_id
    where l.organization_id = p_organization_id
      and l.development_id = v_condition.development_id
      and l.subject_kind = 'price_condition'::public.subdivision_price_evidence_subject_kind
      and l.price_condition_id = p_condition_id
      and l.link_state = 'active'::public.subdivision_price_evidence_link_state
      and a.attachment_state = 'recorded'::public.subdivision_development_attachment_state
  ) then
    raise exception using errcode = '42501', message = 'PRICE_CONDITION_EVIDENCE_REQUIRED';
  end if;

  update public.subdivision_price_conditions
    set condition_state = 'submitted'::public.subdivision_price_base_policy_state,
        submitted_at = now(),
        submitted_by = p_actor_user_id
  where id = p_condition_id;

  insert into public.admin_audit_events(
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id,
    'subdivision_submit_price_condition_v2', 'allowed', 'subdivision_price_condition', p_condition_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'state', 'submitted', 'evidence_linked', true)
  );
  return p_condition_id;
end;
$$;

revoke all on function public.subdivision_submit_price_condition_v2(uuid, uuid, public.operating_module, text, uuid, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_submit_price_condition_v2(uuid, uuid, public.operating_module, text, uuid, uuid) to service_role;

comment on function public.subdivision_submit_price_condition_v2(uuid, uuid, public.operating_module, text, uuid, uuid)
  is 'A243: encaminha condição somente com evidência privada ativa; não aprova nem cria efeito comercial.';
