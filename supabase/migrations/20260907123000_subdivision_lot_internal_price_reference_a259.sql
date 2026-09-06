-- A259: referência interna por Lote para conferência operacional sob MFA.
-- Não cria disponibilidade, reserva comercial, venda, proposta, contrato, cobrança, pagamento, receita ou repasse.
create or replace function public.subdivision_list_lot_internal_price_references_v1(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_policy record;
  v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);

  if not exists (
    select 1 from public.subdivision_developments development
    where development.id = p_development_id
      and development.organization_id = p_organization_id
      and development.state = 'draft'::public.party_lifecycle_state
  ) then
    raise exception using errcode = '42501', message = 'PRICE_BASE_INTERNAL_REFERENCE_DEVELOPMENT_DENIED';
  end if;

  select policy.id, policy.version_reference, policy.policy_state, policy.effective_from, policy.exception_count
    into v_policy
  from public.subdivision_price_base_policies policy
  where policy.organization_id = p_organization_id
    and policy.development_id = p_development_id
    and policy.policy_state in (
      'prepared'::public.subdivision_price_base_policy_state,
      'submitted'::public.subdivision_price_base_policy_state,
      'approved'::public.subdivision_price_base_policy_state
    )
  order by policy.created_at desc
  limit 1;

  if v_policy.id is null then
    return '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'block_id', source.block_id,
    'block_number', source.block_number,
    'lot_number', source.lot_number,
    'policy_id', v_policy.id,
    'policy_reference', v_policy.version_reference,
    'policy_state', v_policy.policy_state::text,
    'policy_effective_from', v_policy.effective_from,
    'exception_count', v_policy.exception_count,
    'reference_state', case
      when source.base_price_per_sqm_brl is null then 'missing_base_price'
      when v_policy.policy_state = 'prepared'::public.subdivision_price_base_policy_state then 'internal_prepared'
      when v_policy.policy_state = 'submitted'::public.subdivision_price_base_policy_state then 'submitted_pending_approval'
      else 'approved_base'
    end,
    'base_price_per_sqm_brl', source.base_price_per_sqm_brl,
    'lot_area_sqm', source.lot_area_sqm,
    'lot_total_brl', case
      when source.base_price_per_sqm_brl is not null and source.lot_area_sqm is not null
      then source.base_price_per_sqm_brl * source.lot_area_sqm
      else null
    end
  ) order by source.block_number, source.lot_number), '[]'::jsonb)
    into v_result
  from (
    select block.id as block_id, block.block_number, lot.lot_number,
      case when lot.area_sqm > 0 then lot.area_sqm else null end as lot_area_sqm,
      case when line.base_price_per_sqm_brl > 0 then line.base_price_per_sqm_brl else null end as base_price_per_sqm_brl
    from public.subdivision_blocks block
    join public.subdivision_lots lot
      on lot.organization_id = block.organization_id
      and lot.block_id = block.id
      and lot.state = 'draft'::public.party_lifecycle_state
    left join public.subdivision_price_base_policy_lines line
      on line.organization_id = block.organization_id
      and line.policy_id = v_policy.id
      and line.block_id = block.id
      and line.lot_id = lot.id
    where block.organization_id = p_organization_id
      and block.development_id = p_development_id
      and block.state = 'draft'::public.party_lifecycle_state
  ) source;

  return v_result;
end; $$;

revoke all on function public.subdivision_list_lot_internal_price_references_v1(uuid, uuid, public.operating_module, text, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_list_lot_internal_price_references_v1(uuid, uuid, public.operating_module, text, uuid) to service_role;
