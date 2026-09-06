-- A244: política de preço-base só pode ser encaminhada com respaldo privado ativo.
-- A preparação continua permitida e não produz venda, contrato ou efeito financeiro.

create or replace function public.subdivision_submit_price_base_policy_v2(
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
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);

  select target_id into v_existing
  from public.admin_audit_events
  where command_name = 'subdivision_submit_price_base_policy_v2'
    and correlation_id = p_correlation_id
    and actor_user_id = p_actor_user_id
    and organization_id = p_organization_id
    and outcome = 'allowed'
  order by occurred_at desc
  limit 1;
  if v_existing is not null then return v_existing; end if;

  select * into v_policy
  from public.subdivision_price_base_policies
  where id = p_policy_id and organization_id = p_organization_id
  for update;
  if v_policy.id is null
    or v_policy.policy_state <> 'prepared'::public.subdivision_price_base_policy_state
    or v_policy.exception_count <> 0 then
    raise exception using errcode = '42501', message = 'PRICE_BASE_POLICY_SUBMISSION_DENIED';
  end if;

  if not exists (
    select 1
    from public.subdivision_price_evidence_links l
    join public.subdivision_development_attachments a
      on a.id = l.attachment_id
      and a.organization_id = l.organization_id
      and a.development_id = l.development_id
    where l.organization_id = p_organization_id
      and l.development_id = v_policy.development_id
      and l.subject_kind = 'price_base_policy'::public.subdivision_price_evidence_subject_kind
      and l.price_base_policy_id = p_policy_id
      and l.link_state = 'active'::public.subdivision_price_evidence_link_state
      and a.attachment_state = 'recorded'::public.subdivision_development_attachment_state
  ) then
    raise exception using errcode = '42501', message = 'PRICE_BASE_POLICY_EVIDENCE_REQUIRED';
  end if;

  update public.subdivision_price_base_policies
    set policy_state = 'submitted'::public.subdivision_price_base_policy_state,
        submitted_at = now(),
        submitted_by = p_actor_user_id
  where id = p_policy_id;

  insert into public.admin_audit_events(
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id,
    'subdivision_submit_price_base_policy_v2', 'allowed', 'subdivision_price_base_policy', p_policy_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'state', 'submitted', 'evidence_linked', true)
  );
  return p_policy_id;
end;
$$;

revoke all on function public.subdivision_submit_price_base_policy_v2(uuid, uuid, public.operating_module, text, uuid, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_submit_price_base_policy_v2(uuid, uuid, public.operating_module, text, uuid, uuid) to service_role;

comment on function public.subdivision_submit_price_base_policy_v2(uuid, uuid, public.operating_module, text, uuid, uuid)
  is 'A244: encaminha política-base somente com evidência privada ativa; não aprova nem cria efeito comercial.';
