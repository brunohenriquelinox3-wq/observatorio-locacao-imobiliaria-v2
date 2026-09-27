-- A384.3: participação de uma venda multi-lote como união deduplicada de regras.
-- Capped por lote permanece bloqueado até existir alocação física por agenda/lote.

create or replace function public.subdivision_materialize_sale_participation_snapshot(
  p_actor_user_id uuid, p_organization_id uuid, p_sale_case_id uuid, p_contract_preparation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_existing uuid;
  v_lot_id uuid;
  v_lot_ids uuid[];
  v_development_id uuid;
  v_policy record;
  v_snapshot_id uuid;
  v_rule_count integer;
  v_projection_count integer;
  v_lot_count integer;
begin
  select id into v_existing from public.subdivision_sale_participation_snapshots
   where organization_id=p_organization_id and contract_preparation_id=p_contract_preparation_id;
  if v_existing is not null then return v_existing; end if;

  select coalesce(array_agg(rows.lot_id order by rows.is_primary desc,rows.lot_position,rows.lot_id),'{}'::uuid[])
    into v_lot_ids
    from private.subdivision_sale_case_lot_rows(p_organization_id,p_sale_case_id) rows;
  select count(*)::integer into v_lot_count
    from private.subdivision_sale_case_lot_rows(p_organization_id,p_sale_case_id) rows;
  if coalesce(array_length(v_lot_ids,1),0)=0 then raise exception using errcode='42501',message='SUBDIVISION_PARTICIPATION_SNAPSHOT_CONTEXT_DENIED'; end if;
  v_lot_id:=v_lot_ids[1];
  select block.development_id into v_development_id from public.subdivision_lots lot join public.subdivision_blocks block on block.id=lot.block_id and block.organization_id=lot.organization_id where lot.id=v_lot_id and lot.organization_id=p_organization_id;
  if v_development_id is null then raise exception using errcode='42501',message='SUBDIVISION_PARTICIPATION_SNAPSHOT_CONTEXT_DENIED'; end if;
  if exists(select 1 from public.subdivision_lots lot join public.subdivision_blocks block on block.id=lot.block_id and block.organization_id=lot.organization_id where lot.organization_id=p_organization_id and lot.id=any(v_lot_ids) and block.development_id<>v_development_id) then raise exception using errcode='22023',message='SUBDIVISION_PARTICIPATION_SNAPSHOT_DEVELOPMENT_MISMATCH'; end if;

  select policy.* into v_policy from public.subdivision_participation_policy_versions policy where policy.organization_id=p_organization_id and policy.development_id=v_development_id and policy.state='active' and policy.valid_from<=current_date and (policy.valid_until is null or policy.valid_until>=current_date) order by policy.version_number desc limit 1 for update;
  if v_policy.id is null then
    insert into public.subdivision_sale_participation_snapshots(organization_id,sale_case_id,contract_preparation_id,policy_version_id,snapshot_state,require_full_allocation,created_by) values(p_organization_id,p_sale_case_id,p_contract_preparation_id,null,'no_active_policy',false,p_actor_user_id) returning id into v_snapshot_id;
    return v_snapshot_id;
  end if;
  if v_lot_count>1 and exists(select 1 from public.subdivision_participation_policy_rules rule where rule.organization_id=p_organization_id and rule.policy_version_id=v_policy.id and rule.allocation_method='capped_total_per_lot' and (rule.applies_to_all_lots or exists(select 1 from public.subdivision_participation_rule_lot_scopes scope where scope.organization_id=p_organization_id and scope.rule_id=rule.id and scope.lot_id=any(v_lot_ids)))) then raise exception using errcode='22023',message='SUBDIVISION_PARTICIPATION_MULTI_LOT_ALLOCATION_DENIED'; end if;

  insert into public.subdivision_sale_participation_snapshots(organization_id,sale_case_id,contract_preparation_id,policy_version_id,snapshot_state,require_full_allocation,created_by) values(p_organization_id,p_sale_case_id,p_contract_preparation_id,v_policy.id,'projected',v_policy.require_full_allocation,p_actor_user_id) returning id into v_snapshot_id;
  insert into public.subdivision_sale_participation_snapshot_rules(organization_id,snapshot_id,source_rule_id,internal_party_role_link_id,participant_display_name,participant_role,allocation_method,percentage_basis_points,fixed_amount_cents,cap_total_cents)
  select p_organization_id,v_snapshot_id,rule.id,rule.internal_party_role_link_id,party.display_name,assignment.role,rule.allocation_method,rule.percentage_basis_points,rule.fixed_amount_cents,rule.cap_total_cents
    from public.subdivision_participation_policy_rules rule
    join public.subdivision_internal_party_roles link on link.id=rule.internal_party_role_link_id and link.organization_id=rule.organization_id
    join public.party_role_assignments assignment on assignment.id=link.party_role_assignment_id and assignment.organization_id=link.organization_id
    join public.party_records party on party.id=assignment.party_id and party.organization_id=assignment.organization_id
   where rule.organization_id=p_organization_id and rule.policy_version_id=v_policy.id
     and (rule.applies_to_all_lots or exists(select 1 from public.subdivision_participation_rule_lot_scopes scope where scope.organization_id=p_organization_id and scope.rule_id=rule.id and scope.lot_id=any(v_lot_ids)));
  select count(*)::integer into v_rule_count from public.subdivision_sale_participation_snapshot_rules where organization_id=p_organization_id and snapshot_id=v_snapshot_id;
  if v_rule_count=0 or v_rule_count>100 then raise exception using errcode='22023',message='SUBDIVISION_PARTICIPATION_SNAPSHOT_RULE_LIMIT_DENIED'; end if;
  insert into public.subdivision_sale_participation_snapshot_rule_kinds(organization_id,snapshot_rule_id,schedule_kind)
  select p_organization_id,snapshot_rule.id,kind.schedule_kind from public.subdivision_sale_participation_snapshot_rules snapshot_rule join public.subdivision_participation_rule_schedule_kinds kind on kind.rule_id=snapshot_rule.source_rule_id and kind.organization_id=snapshot_rule.organization_id where snapshot_rule.organization_id=p_organization_id and snapshot_rule.snapshot_id=v_snapshot_id;
  insert into public.subdivision_sale_participation_projections(organization_id,snapshot_id,snapshot_rule_id,schedule_id,schedule_kind,due_date,projected_amount_cents)
  with candidates as (
    select snapshot_rule.id as snapshot_rule_id,schedule.id as schedule_id,schedule.installment_kind as schedule_kind,schedule.due_date,schedule.amount_cents,
      case snapshot_rule.allocation_method when 'percentage_per_schedule' then (schedule.amount_cents*snapshot_rule.percentage_basis_points/10000)::bigint when 'fixed_per_schedule' then least(schedule.amount_cents,snapshot_rule.fixed_amount_cents) when 'capped_total_per_lot' then greatest(least(schedule.amount_cents,snapshot_rule.cap_total_cents-coalesce(sum(schedule.amount_cents) over(partition by snapshot_rule.id order by schedule.due_date,schedule.installment_kind,schedule.installment_number rows between unbounded preceding and 1 preceding),0)),0) end as projected_amount_cents
      from public.subdivision_sale_participation_snapshot_rules snapshot_rule join public.subdivision_sale_participation_snapshot_rule_kinds kind on kind.snapshot_rule_id=snapshot_rule.id and kind.organization_id=snapshot_rule.organization_id join public.subdivision_sale_receivable_schedules schedule on schedule.organization_id=snapshot_rule.organization_id and schedule.contract_preparation_id=p_contract_preparation_id and schedule.installment_kind=kind.schedule_kind and schedule.bank_issuance_state<>'archived'
     where snapshot_rule.organization_id=p_organization_id and snapshot_rule.snapshot_id=v_snapshot_id
  ) select p_organization_id,v_snapshot_id,snapshot_rule_id,schedule_id,schedule_kind,due_date,projected_amount_cents from candidates where projected_amount_cents>0;
  select count(*)::integer into v_projection_count from public.subdivision_sale_participation_projections where organization_id=p_organization_id and snapshot_id=v_snapshot_id;
  if v_projection_count>50000 then raise exception using errcode='22023',message='SUBDIVISION_PARTICIPATION_SNAPSHOT_PROJECTION_LIMIT_DENIED'; end if;
  if exists(select 1 from public.subdivision_sale_participation_projections projection join public.subdivision_sale_receivable_schedules schedule on schedule.id=projection.schedule_id and schedule.organization_id=projection.organization_id where projection.organization_id=p_organization_id and projection.snapshot_id=v_snapshot_id group by projection.schedule_id,schedule.amount_cents having sum(projection.projected_amount_cents)>schedule.amount_cents) then raise exception using errcode='22023',message='SUBDIVISION_PARTICIPATION_SNAPSHOT_OVERALLOCATION_DENIED'; end if;
  if v_policy.require_full_allocation and exists(select 1 from public.subdivision_sale_receivable_schedules schedule where schedule.organization_id=p_organization_id and schedule.contract_preparation_id=p_contract_preparation_id and schedule.bank_issuance_state<>'archived' and exists(select 1 from public.subdivision_sale_participation_snapshot_rule_kinds kind join public.subdivision_sale_participation_snapshot_rules snapshot_rule on snapshot_rule.id=kind.snapshot_rule_id and snapshot_rule.organization_id=kind.organization_id where kind.organization_id=p_organization_id and snapshot_rule.snapshot_id=v_snapshot_id and kind.schedule_kind=schedule.installment_kind) and coalesce((select sum(projected_amount_cents) from public.subdivision_sale_participation_projections projection where projection.organization_id=p_organization_id and projection.snapshot_id=v_snapshot_id and projection.schedule_id=schedule.id),0)<>schedule.amount_cents) then raise exception using errcode='22023',message='SUBDIVISION_PARTICIPATION_SNAPSHOT_FULL_ALLOCATION_DENIED'; end if;
  return v_snapshot_id;
end;
$$;
revoke all on function public.subdivision_materialize_sale_participation_snapshot(uuid,uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.subdivision_materialize_sale_participation_snapshot(uuid,uuid,uuid,uuid) to service_role;
comment on function public.subdivision_materialize_sale_participation_snapshot(uuid,uuid,uuid,uuid) is 'A384.3: união deduplicada de regras por coleção física; capped_total_per_lot multi-lote bloqueado sem alocação física.';
