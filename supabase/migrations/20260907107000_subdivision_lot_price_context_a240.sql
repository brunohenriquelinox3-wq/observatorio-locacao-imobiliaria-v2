-- A240: explica bloqueios de referência por Lote sem retornar preço não aprovado.
-- Não cria ou altera política, condição, preço, venda, contrato, cobrança ou financeiro.

create or replace function public.subdivision_get_lot_price_context_v3(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid, p_block_id uuid, p_lot_number integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_lot_id uuid; v_base record; v_condition record; v_effective numeric; v_latest record;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select l.id into v_lot_id from public.subdivision_lots l join public.subdivision_blocks b on b.id = l.block_id and b.organization_id = l.organization_id where l.organization_id = p_organization_id and l.block_id = p_block_id and l.lot_number = p_lot_number and b.development_id = p_development_id and l.state = 'draft'::public.party_lifecycle_state and b.state = 'draft'::public.party_lifecycle_state;
  if v_lot_id is null then raise exception using errcode = '42501', message = 'LOT_PRICE_CONTEXT_DENIED'; end if;
  select p.id, p.version_reference, line.base_price_per_sqm_brl into v_base from public.subdivision_price_base_policies p join public.subdivision_price_base_policy_lines line on line.policy_id = p.id and line.organization_id = p.organization_id and line.lot_id = v_lot_id where p.organization_id = p_organization_id and p.development_id = p_development_id and p.policy_state = 'approved'::public.subdivision_price_base_policy_state and p.exception_count = 0 and p.effective_from <= current_date and (p.effective_until is null or current_date < p.effective_until) order by p.effective_from desc limit 1;
  if v_base.id is null then
    select p.id, p.policy_state, p.exception_count into v_latest from public.subdivision_price_base_policies p where p.organization_id = p_organization_id and p.development_id = p_development_id order by p.created_at desc limit 1;
    if v_latest.id is null then return jsonb_build_object('state', 'unavailable', 'availability_reason', 'no_policy'); end if;
    if v_latest.policy_state = 'prepared'::public.subdivision_price_base_policy_state and v_latest.exception_count > 0 then return jsonb_build_object('state', 'unavailable', 'availability_reason', 'prepared_with_exceptions'); end if;
    if v_latest.policy_state = 'prepared'::public.subdivision_price_base_policy_state then return jsonb_build_object('state', 'unavailable', 'availability_reason', 'prepared_pending_validation'); end if;
    if v_latest.policy_state = 'submitted'::public.subdivision_price_base_policy_state then return jsonb_build_object('state', 'unavailable', 'availability_reason', 'submitted_pending_approval'); end if;
    if v_latest.policy_state = 'approved'::public.subdivision_price_base_policy_state then return jsonb_build_object('state', 'unavailable', 'availability_reason', 'approved_outside_vigency'); end if;
    return jsonb_build_object('state', 'unavailable', 'availability_reason', 'policy_not_available');
  end if;
  select c.* into v_condition from public.subdivision_price_conditions c where c.organization_id = p_organization_id and c.development_id = p_development_id and c.base_policy_id = v_base.id and c.condition_state = 'approved'::public.subdivision_price_base_policy_state and c.effective_from <= current_date and (c.effective_until is null or current_date < c.effective_until) and ((c.scope = 'lot'::public.subdivision_price_condition_scope and c.block_id = p_block_id and c.lot_id = v_lot_id) or (c.scope = 'block'::public.subdivision_price_condition_scope and c.block_id = p_block_id and c.lot_id is null) or (c.scope = 'development'::public.subdivision_price_condition_scope and c.block_id is null and c.lot_id is null)) order by case c.scope when 'lot'::public.subdivision_price_condition_scope then 3 when 'block'::public.subdivision_price_condition_scope then 2 else 1 end desc limit 1;
  v_effective := v_base.base_price_per_sqm_brl;
  if v_condition.id is not null then
    if v_condition.adjustment_kind = 'override_per_sqm'::public.subdivision_price_condition_kind then v_effective := v_condition.amount;
    elsif v_condition.adjustment_kind = 'percentage_adjustment'::public.subdivision_price_condition_kind then v_effective := v_base.base_price_per_sqm_brl * (1 + (v_condition.amount / 100));
    else v_effective := v_base.base_price_per_sqm_brl * (1 - (v_condition.amount / 100)); end if;
  end if;
  return jsonb_build_object('state', 'active', 'availability_reason', null, 'policy_reference', v_base.version_reference, 'condition_reference', case when v_condition.id is null then null else v_condition.condition_reference end, 'condition_scope', case when v_condition.id is null then null else v_condition.scope::text end, 'condition_kind', case when v_condition.id is null then null else v_condition.adjustment_kind::text end, 'effective_from', case when v_condition.id is null then null else v_condition.effective_from end, 'effective_until', case when v_condition.id is null then null else v_condition.effective_until end, 'document_state', case when v_condition.id is null then null else v_condition.document_state::text end, 'effective_price_per_sqm_brl', v_effective);
end; $$;

revoke all on function public.subdivision_get_lot_price_context_v3(uuid, uuid, public.operating_module, text, uuid, uuid, integer) from public, anon, authenticated;
grant execute on function public.subdivision_get_lot_price_context_v3(uuid, uuid, public.operating_module, text, uuid, uuid, integer) to service_role;
