-- A299: aprovação comercial exige dossiê privado revisado por humano. Não assina, emite, envia, cobra, baixa ou paga.
create or replace function public.subdivision_approve_sale_case(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_sale_case_id uuid, p_correlation_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_idempotent jsonb; v_case record; v_contract_id uuid; v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_APPROVAL_CONTEXT_DENIED'; end if;
  select event.payload_redacted -> 'result' into v_idempotent from public.admin_audit_events event where event.command_name = 'subdivision_approve_sale_case' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_idempotent is not null then return v_idempotent; end if;
  select sale_case.* into v_case from public.subdivision_sale_cases sale_case where sale_case.id = p_sale_case_id and sale_case.organization_id = p_organization_id for update;
  if v_case.id is null or v_case.state <> 'terms_review' then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_APPROVAL_STATE_DENIED'; end if;
  if not exists (select 1 from public.subdivision_sale_case_dossier_reviews review where review.sale_case_id = p_sale_case_id and review.organization_id = p_organization_id and review.dossier_state = 'ready_for_approval') then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_APPROVAL_DOSSIER_DENIED'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || ':' || v_case.lot_id::text, 0));
  select contract.id into v_contract_id from public.subdivision_sale_contract_preparations contract where contract.sale_case_id = p_sale_case_id and contract.organization_id = p_organization_id and contract.state = 'internal_review' for update;
  if v_contract_id is null then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_APPROVAL_CONTRACT_DENIED'; end if;
  update public.subdivision_sale_contract_preparations set state = 'approved', updated_at = now() where id = v_contract_id and organization_id = p_organization_id;
  update public.subdivision_sale_cases set state = 'approved', updated_at = now() where id = p_sale_case_id and organization_id = p_organization_id;
  insert into public.subdivision_lot_commercial_states(organization_id, lot_id, sale_case_id, commercial_state, created_by) values (p_organization_id, v_case.lot_id, p_sale_case_id, 'sold', p_actor_user_id) on conflict(organization_id, lot_id) do update set sale_case_id = excluded.sale_case_id, commercial_state = 'sold', created_by = excluded.created_by, updated_at = now();
  v_result := jsonb_build_object('sale_case_id', p_sale_case_id, 'lot_commercial_state', 'sold', 'contract_state', 'approved', 'dossier_reviewed', true);
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_approve_sale_case', 'allowed', 'subdivision_sale_case', p_sale_case_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'lot_commercial_state', 'sold', 'contract_state', 'approved', 'dossier_reviewed', true, 'result', v_result)); return v_result;
end; $$;
revoke all on function public.subdivision_approve_sale_case(uuid,uuid,public.operating_module,text,uuid,uuid) from public, anon, authenticated;
grant execute on function public.subdivision_approve_sale_case(uuid,uuid,public.operating_module,text,uuid,uuid) to service_role;
