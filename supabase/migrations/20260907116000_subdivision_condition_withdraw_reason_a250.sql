-- A250: retirada lógica de condição preparada ou submetida exige motivo interno catalogado; não altera política-base, venda, contrato ou financeiro.

create or replace function public.subdivision_withdraw_price_condition_v2(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_condition_id uuid,
  p_reason_code text,
  p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_existing uuid;
  v_condition record;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if trim(p_reason_code) not in ('source_superseded', 'governance_review', 'effective_date_reassessment', 'documentary_reconciliation') then raise exception using errcode = '22023', message = 'PRICE_CONDITION_WITHDRAW_REASON_INVALID'; end if;
  select target_id into v_existing from public.admin_audit_events where command_name = 'subdivision_withdraw_price_condition_v2' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed' order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  select * into v_condition from public.subdivision_price_conditions where id = p_condition_id and organization_id = p_organization_id for update;
  if v_condition.id is null or v_condition.condition_state not in ('prepared'::public.subdivision_price_base_policy_state, 'submitted'::public.subdivision_price_base_policy_state) then raise exception using errcode = '42501', message = 'PRICE_CONDITION_WITHDRAW_DENIED'; end if;
  update public.subdivision_price_conditions set condition_state = 'withdrawn'::public.subdivision_price_base_policy_state, withdrawn_at = now(), withdrawn_by = p_actor_user_id where id = p_condition_id;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_withdraw_price_condition_v2', 'allowed', 'subdivision_price_condition', p_condition_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'state', 'withdrawn', 'withdraw_reason_code', trim(p_reason_code)));
  return p_condition_id;
end;
$$;

revoke all on function public.subdivision_withdraw_price_condition_v2(uuid, uuid, public.operating_module, text, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_withdraw_price_condition_v2(uuid, uuid, public.operating_module, text, uuid, text, uuid) to service_role;

comment on function public.subdivision_withdraw_price_condition_v2 is 'A250: retirada lógica de condição preparada ou submetida com motivo interno catalogado e auditoria redigida; não altera política-base, venda, contrato ou financeiro.';
