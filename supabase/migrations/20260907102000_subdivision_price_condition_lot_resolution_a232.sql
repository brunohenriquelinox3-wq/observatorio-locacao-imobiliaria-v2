-- A232: o navegador informa somente número de Lote; a resolução do UUID ocorre dentro da função protegida.
-- Nenhuma condição é criada por esta migração.

create or replace function public.subdivision_create_price_condition_v2(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid, p_base_policy_id uuid, p_condition_reference text,
  p_scope public.subdivision_price_condition_scope, p_block_id uuid, p_lot_number integer, p_adjustment_kind public.subdivision_price_condition_kind, p_amount numeric, p_effective_from date, p_effective_until date,
  p_reason_code text, p_document_state public.subdivision_price_condition_document_state, p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_condition_id uuid; v_lot_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments d where d.id = p_development_id and d.organization_id = p_organization_id and d.state = 'draft'::public.party_lifecycle_state) then raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED'; end if;
  if not exists (select 1 from public.subdivision_price_base_policies p where p.id = p_base_policy_id and p.organization_id = p_organization_id and p.development_id = p_development_id) then raise exception using errcode = '42501', message = 'PRICE_CONDITION_BASE_POLICY_DENIED'; end if;
  if p_condition_reference !~ '^PC_[A-Z0-9_]{3,72}$' or p_amount <= -100 or p_amount = 0 or p_amount > 1000000000 or p_effective_from is null or (p_effective_until is not null and p_effective_until <= p_effective_from) or p_reason_code not in ('internal_review', 'work_progress', 'market_response', 'campaign', 'specific_condition', 'other') or (p_adjustment_kind = 'temporary_discount' and (p_effective_until is null or p_amount > 100)) or (p_adjustment_kind = 'override_per_sqm' and p_amount <= 0) or (p_adjustment_kind = 'percentage_adjustment' and p_amount > 1000) then raise exception using errcode = '22023', message = 'PRICE_CONDITION_INPUT_INVALID'; end if;
  if (p_scope = 'development' and (p_block_id is not null or p_lot_number is not null)) or (p_scope = 'block' and (p_block_id is null or p_lot_number is not null)) or (p_scope = 'lot' and (p_block_id is null or p_lot_number is null or p_lot_number < 1 or p_lot_number > 999)) then raise exception using errcode = '22023', message = 'PRICE_CONDITION_TARGET_INVALID'; end if;
  if p_block_id is not null and not exists (select 1 from public.subdivision_blocks b where b.id = p_block_id and b.organization_id = p_organization_id and b.development_id = p_development_id and b.state = 'draft'::public.party_lifecycle_state) then raise exception using errcode = '42501', message = 'PRICE_CONDITION_BLOCK_DENIED'; end if;
  if p_scope = 'lot' then
    select l.id into v_lot_id from public.subdivision_lots l where l.organization_id = p_organization_id and l.block_id = p_block_id and l.lot_number = p_lot_number and l.state = 'draft'::public.party_lifecycle_state;
    if v_lot_id is null then raise exception using errcode = '42501', message = 'PRICE_CONDITION_LOT_DENIED'; end if;
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_organization_id::text || ':' || p_development_id::text || ':' || trim(upper(p_condition_reference)), 0));
  select target_id into v_existing from public.admin_audit_events where command_name = 'subdivision_create_price_condition_v2' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed' order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  insert into public.subdivision_price_conditions(organization_id, development_id, base_policy_id, condition_reference, scope, block_id, lot_id, adjustment_kind, amount, effective_from, effective_until, reason_code, document_state, created_by)
  values(p_organization_id, p_development_id, p_base_policy_id, trim(upper(p_condition_reference)), p_scope, p_block_id, v_lot_id, p_adjustment_kind, p_amount, p_effective_from, p_effective_until, p_reason_code, p_document_state, p_actor_user_id) returning id into v_condition_id;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_create_price_condition_v2', 'allowed', 'subdivision_price_condition', v_condition_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'scope', p_scope::text, 'adjustment_kind', p_adjustment_kind::text, 'reason_code', p_reason_code, 'document_state', p_document_state::text, 'amount_present', true, 'effective_until_present', p_effective_until is not null, 'lot_number_present', p_lot_number is not null));
  return v_condition_id;
end; $$;

create or replace function public.subdivision_get_lot_price_context_v2(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid, p_block_id uuid, p_lot_number integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_lot_id uuid; v_base record; v_condition record; v_effective numeric;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select l.id into v_lot_id from public.subdivision_lots l join public.subdivision_blocks b on b.id = l.block_id and b.organization_id = l.organization_id where l.organization_id = p_organization_id and l.block_id = p_block_id and l.lot_number = p_lot_number and b.development_id = p_development_id and l.state = 'draft'::public.party_lifecycle_state and b.state = 'draft'::public.party_lifecycle_state;
  if v_lot_id is null then raise exception using errcode = '42501', message = 'LOT_PRICE_CONTEXT_DENIED'; end if;
  select p.id, p.version_reference, line.base_price_per_sqm_brl into v_base from public.subdivision_price_base_policies p join public.subdivision_price_base_policy_lines line on line.policy_id = p.id and line.organization_id = p.organization_id and line.lot_id = v_lot_id where p.organization_id = p_organization_id and p.development_id = p_development_id and p.policy_state = 'approved'::public.subdivision_price_base_policy_state and p.exception_count = 0 and p.effective_from <= current_date and (p.effective_until is null or current_date < p.effective_until) order by p.effective_from desc limit 1;
  if v_base.id is null then return jsonb_build_object('state', 'unavailable'); end if;
  select c.* into v_condition from public.subdivision_price_conditions c where c.organization_id = p_organization_id and c.development_id = p_development_id and c.base_policy_id = v_base.id and c.condition_state = 'approved'::public.subdivision_price_base_policy_state and c.effective_from <= current_date and (c.effective_until is null or current_date < c.effective_until) and ((c.scope = 'lot'::public.subdivision_price_condition_scope and c.block_id = p_block_id and c.lot_id = v_lot_id) or (c.scope = 'block'::public.subdivision_price_condition_scope and c.block_id = p_block_id and c.lot_id is null) or (c.scope = 'development'::public.subdivision_price_condition_scope and c.block_id is null and c.lot_id is null)) order by case c.scope when 'lot'::public.subdivision_price_condition_scope then 3 when 'block'::public.subdivision_price_condition_scope then 2 else 1 end desc limit 1;
  v_effective := v_base.base_price_per_sqm_brl;
  if v_condition.id is not null then
    if v_condition.adjustment_kind = 'override_per_sqm'::public.subdivision_price_condition_kind then v_effective := v_condition.amount;
    elsif v_condition.adjustment_kind = 'percentage_adjustment'::public.subdivision_price_condition_kind then v_effective := v_base.base_price_per_sqm_brl * (1 + (v_condition.amount / 100));
    else v_effective := v_base.base_price_per_sqm_brl * (1 - (v_condition.amount / 100)); end if;
  end if;
  return jsonb_build_object('state', 'active', 'policy_reference', v_base.version_reference, 'condition_reference', case when v_condition.id is null then null else v_condition.condition_reference end, 'condition_scope', case when v_condition.id is null then null else v_condition.scope::text end, 'condition_kind', case when v_condition.id is null then null else v_condition.adjustment_kind::text end, 'effective_from', case when v_condition.id is null then null else v_condition.effective_from end, 'effective_until', case when v_condition.id is null then null else v_condition.effective_until end, 'document_state', case when v_condition.id is null then null else v_condition.document_state::text end, 'effective_price_per_sqm_brl', v_effective);
end; $$;

revoke all on function public.subdivision_create_price_condition_v2(uuid, uuid, public.operating_module, text, uuid, uuid, text, public.subdivision_price_condition_scope, uuid, integer, public.subdivision_price_condition_kind, numeric, date, date, text, public.subdivision_price_condition_document_state, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_get_lot_price_context_v2(uuid, uuid, public.operating_module, text, uuid, uuid, integer) from public, anon, authenticated;
grant execute on function public.subdivision_create_price_condition_v2(uuid, uuid, public.operating_module, text, uuid, uuid, text, public.subdivision_price_condition_scope, uuid, integer, public.subdivision_price_condition_kind, numeric, date, date, text, public.subdivision_price_condition_document_state, uuid) to service_role;
grant execute on function public.subdivision_get_lot_price_context_v2(uuid, uuid, public.operating_module, text, uuid, uuid, integer) to service_role;
