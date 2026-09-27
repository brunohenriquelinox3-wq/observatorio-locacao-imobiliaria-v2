-- A389: prova temporal imutável de participante no snapshot da venda.
-- O Financeiro permanece nominal/read-only: não emite cobrança, boleto, pagamento,
-- baixa, quitação, Pix, banco, transferência, split ou repasse.

create table public.subdivision_sale_participation_snapshot_role_validities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  snapshot_rule_id uuid not null,
  party_role_assignment_id uuid not null,
  effective_on date not null,
  validity_state text not null check (validity_state = 'eligible'),
  created_at timestamptz not null default now(),
  constraint subdivision_snapshot_role_validities_rule_tenant_fk
    foreign key (snapshot_rule_id, organization_id)
    references public.subdivision_sale_participation_snapshot_rules(id, organization_id)
    on delete cascade,
  constraint subdivision_snapshot_role_validities_assignment_tenant_fk
    foreign key (party_role_assignment_id, organization_id)
    references public.party_role_assignments(id, organization_id)
    on delete restrict,
  constraint subdivision_snapshot_role_validities_rule_unique
    unique (organization_id, snapshot_rule_id),
  constraint subdivision_snapshot_role_validities_tenant_match
    unique (id, organization_id)
);

alter table public.subdivision_sale_participation_snapshot_role_validities enable row level security;
revoke all on table public.subdivision_sale_participation_snapshot_role_validities from public, anon, authenticated;

create index subdivision_snapshot_role_validities_snapshot_rule_lookup
  on public.subdivision_sale_participation_snapshot_role_validities
  (organization_id, snapshot_rule_id);

create or replace function public.subdivision_materialize_sale_participation_snapshot(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_sale_case_id uuid,
  p_contract_preparation_id uuid
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
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
  v_temporal_eligible_rule_count integer;
  v_temporal_rule_count integer;
begin
  select id
    into v_existing
  from public.subdivision_sale_participation_snapshots
  where organization_id = p_organization_id
    and contract_preparation_id = p_contract_preparation_id;
  if v_existing is not null then
    return v_existing;
  end if;

  select coalesce(
    array_agg(rows.lot_id order by rows.is_primary desc, rows.lot_position, rows.lot_id),
    '{}'::uuid[]
  )
    into v_lot_ids
  from private.subdivision_sale_case_lot_rows(p_organization_id, p_sale_case_id) rows;

  select count(*)::integer
    into v_lot_count
  from private.subdivision_sale_case_lot_rows(p_organization_id, p_sale_case_id) rows;

  if coalesce(array_length(v_lot_ids, 1), 0) = 0 then
    raise exception using errcode = '42501', message = 'SUBDIVISION_PARTICIPATION_SNAPSHOT_CONTEXT_DENIED';
  end if;

  v_lot_id := v_lot_ids[1];
  select block.development_id
    into v_development_id
  from public.subdivision_lots lot
  join public.subdivision_blocks block
    on block.id = lot.block_id
   and block.organization_id = lot.organization_id
  where lot.id = v_lot_id
    and lot.organization_id = p_organization_id;

  if v_development_id is null then
    raise exception using errcode = '42501', message = 'SUBDIVISION_PARTICIPATION_SNAPSHOT_CONTEXT_DENIED';
  end if;

  if exists (
    select 1
    from public.subdivision_lots lot
    join public.subdivision_blocks block
      on block.id = lot.block_id
     and block.organization_id = lot.organization_id
    where lot.organization_id = p_organization_id
      and lot.id = any(v_lot_ids)
      and block.development_id <> v_development_id
  ) then
    raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_SNAPSHOT_DEVELOPMENT_MISMATCH';
  end if;

  select policy.*
    into v_policy
  from public.subdivision_participation_policy_versions policy
  where policy.organization_id = p_organization_id
    and policy.development_id = v_development_id
    and policy.state = 'active'
    and policy.valid_from <= current_date
    and (policy.valid_until is null or policy.valid_until >= current_date)
  order by policy.version_number desc
  limit 1
  for update;

  if v_policy.id is null then
    insert into public.subdivision_sale_participation_snapshots (
      organization_id, sale_case_id, contract_preparation_id, policy_version_id,
      snapshot_state, require_full_allocation, created_by
    ) values (
      p_organization_id, p_sale_case_id, p_contract_preparation_id, null,
      'no_active_policy', false, p_actor_user_id
    ) returning id into v_snapshot_id;
    return v_snapshot_id;
  end if;

  if v_lot_count > 1 and exists (
    select 1
    from public.subdivision_participation_policy_rules rule
    where rule.organization_id = p_organization_id
      and rule.policy_version_id = v_policy.id
      and rule.allocation_method = 'capped_total_per_lot'
      and (
        rule.applies_to_all_lots
        or exists (
          select 1
          from public.subdivision_participation_rule_lot_scopes scope
          where scope.organization_id = p_organization_id
            and scope.rule_id = rule.id
            and scope.lot_id = any(v_lot_ids)
        )
      )
  ) then
    raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_MULTI_LOT_ALLOCATION_DENIED';
  end if;

  insert into public.subdivision_sale_participation_snapshots (
    organization_id, sale_case_id, contract_preparation_id, policy_version_id,
    snapshot_state, require_full_allocation, created_by
  ) values (
    p_organization_id, p_sale_case_id, p_contract_preparation_id, v_policy.id,
    'projected', v_policy.require_full_allocation, p_actor_user_id
  ) returning id into v_snapshot_id;

  insert into public.subdivision_sale_participation_snapshot_rules (
    organization_id, snapshot_id, source_rule_id, internal_party_role_link_id,
    participant_display_name, participant_role, allocation_method,
    percentage_basis_points, fixed_amount_cents, cap_total_cents
  )
  select
    p_organization_id,
    v_snapshot_id,
    rule.id,
    rule.internal_party_role_link_id,
    party.display_name,
    assignment.role,
    rule.allocation_method,
    rule.percentage_basis_points,
    rule.fixed_amount_cents,
    rule.cap_total_cents
  from public.subdivision_participation_policy_rules rule
  join public.subdivision_internal_party_roles link
    on link.id = rule.internal_party_role_link_id
   and link.organization_id = rule.organization_id
  join public.party_role_assignments assignment
    on assignment.id = link.party_role_assignment_id
   and assignment.organization_id = link.organization_id
  join public.party_records party
    on party.id = assignment.party_id
   and party.organization_id = assignment.organization_id
  where rule.organization_id = p_organization_id
    and rule.policy_version_id = v_policy.id
    and (
      rule.applies_to_all_lots
      or exists (
        select 1
        from public.subdivision_participation_rule_lot_scopes scope
        where scope.organization_id = p_organization_id
          and scope.rule_id = rule.id
          and scope.lot_id = any(v_lot_ids)
      )
    );

  select count(*)::integer
    into v_rule_count
  from public.subdivision_sale_participation_snapshot_rules
  where organization_id = p_organization_id
    and snapshot_id = v_snapshot_id;

  if v_rule_count = 0 or v_rule_count > 100 then
    raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_SNAPSHOT_RULE_LIMIT_DENIED';
  end if;

  with temporal_status as (
    select
      snapshot_rule.id as snapshot_rule_id,
      link.party_role_assignment_id,
      case
        when link.id is null
          or link.development_id <> v_development_id
          or assignment.id is null
          or assignment.module <> 'loteadora'
          or assignment.role::text not in ('shareholder', 'partner', 'land_contributor')
          or assignment.state <> 'draft' then 'ineligible'
        when assignment.starts_at is null then 'ineligible'
        when assignment.starts_at::date > current_date then 'ineligible'
        when assignment.ends_at is not null and assignment.ends_at::date < current_date then 'ineligible'
        else 'eligible'
      end as temporal_state
    from public.subdivision_sale_participation_snapshot_rules snapshot_rule
    left join public.subdivision_internal_party_roles link
      on link.id = snapshot_rule.internal_party_role_link_id
     and link.organization_id = snapshot_rule.organization_id
    left join public.party_role_assignments assignment
      on assignment.id = link.party_role_assignment_id
     and assignment.organization_id = link.organization_id
    where snapshot_rule.organization_id = p_organization_id
      and snapshot_rule.snapshot_id = v_snapshot_id
  )
  select
    count(*)::integer,
    count(*) filter (where temporal_state = 'eligible')::integer
    into v_temporal_rule_count, v_temporal_eligible_rule_count
  from temporal_status;

  if v_temporal_rule_count <> v_rule_count
     or v_temporal_eligible_rule_count <> v_rule_count then
    raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_SNAPSHOT_VALIDITY_INCOMPLETE';
  end if;

  insert into public.subdivision_sale_participation_snapshot_role_validities (
    organization_id, snapshot_rule_id, party_role_assignment_id, effective_on, validity_state
  )
  select
    p_organization_id,
    snapshot_rule.id,
    link.party_role_assignment_id,
    current_date,
    'eligible'
  from public.subdivision_sale_participation_snapshot_rules snapshot_rule
  join public.subdivision_internal_party_roles link
    on link.id = snapshot_rule.internal_party_role_link_id
   and link.organization_id = snapshot_rule.organization_id
  join public.party_role_assignments assignment
    on assignment.id = link.party_role_assignment_id
   and assignment.organization_id = link.organization_id
  where snapshot_rule.organization_id = p_organization_id
    and snapshot_rule.snapshot_id = v_snapshot_id
    and assignment.module = 'loteadora'
    and assignment.role::text in ('shareholder', 'partner', 'land_contributor')
    and assignment.state = 'draft'
    and assignment.starts_at is not null
    and assignment.starts_at::date <= current_date
    and (assignment.ends_at is null or assignment.ends_at::date >= current_date);

  if (select count(*)::integer
      from public.subdivision_sale_participation_snapshot_role_validities validity
      where validity.organization_id = p_organization_id
        and validity.snapshot_rule_id in (
          select snapshot_rule.id
          from public.subdivision_sale_participation_snapshot_rules snapshot_rule
          where snapshot_rule.organization_id = p_organization_id
            and snapshot_rule.snapshot_id = v_snapshot_id
        )) <> v_rule_count then
    raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_SNAPSHOT_VALIDITY_INCOMPLETE';
  end if;

  insert into public.subdivision_sale_participation_snapshot_rule_kinds (
    organization_id, snapshot_rule_id, schedule_kind
  )
  select p_organization_id, snapshot_rule.id, kind.schedule_kind
  from public.subdivision_sale_participation_snapshot_rules snapshot_rule
  join public.subdivision_participation_rule_schedule_kinds kind
    on kind.rule_id = snapshot_rule.source_rule_id
   and kind.organization_id = snapshot_rule.organization_id
  where snapshot_rule.organization_id = p_organization_id
    and snapshot_rule.snapshot_id = v_snapshot_id;

  insert into public.subdivision_sale_participation_projections (
    organization_id, snapshot_id, snapshot_rule_id, schedule_id, schedule_kind,
    due_date, projected_amount_cents
  )
  with candidates as (
    select
      snapshot_rule.id as snapshot_rule_id,
      schedule.id as schedule_id,
      schedule.installment_kind as schedule_kind,
      schedule.due_date,
      schedule.amount_cents,
      case snapshot_rule.allocation_method
        when 'percentage_per_schedule' then (
          schedule.amount_cents * snapshot_rule.percentage_basis_points / 10000
        )::bigint
        when 'fixed_per_schedule' then least(
          schedule.amount_cents,
          snapshot_rule.fixed_amount_cents
        )
        when 'capped_total_per_lot' then greatest(
          least(
            schedule.amount_cents,
            snapshot_rule.cap_total_cents - coalesce(
              sum(schedule.amount_cents) over (
                partition by snapshot_rule.id
                order by schedule.due_date, schedule.installment_kind, schedule.installment_number
                rows between unbounded preceding and 1 preceding
              ),
              0
            )
          ),
          0
        )
      end as projected_amount_cents
    from public.subdivision_sale_participation_snapshot_rules snapshot_rule
    join public.subdivision_sale_participation_snapshot_rule_kinds kind
      on kind.snapshot_rule_id = snapshot_rule.id
     and kind.organization_id = snapshot_rule.organization_id
    join public.subdivision_sale_receivable_schedules schedule
      on schedule.organization_id = snapshot_rule.organization_id
     and schedule.contract_preparation_id = p_contract_preparation_id
     and schedule.installment_kind = kind.schedule_kind
     and schedule.bank_issuance_state <> 'archived'
    where snapshot_rule.organization_id = p_organization_id
      and snapshot_rule.snapshot_id = v_snapshot_id
  )
  select
    p_organization_id,
    v_snapshot_id,
    snapshot_rule_id,
    schedule_id,
    schedule_kind,
    due_date,
    projected_amount_cents
  from candidates
  where projected_amount_cents > 0;

  select count(*)::integer
    into v_projection_count
  from public.subdivision_sale_participation_projections
  where organization_id = p_organization_id
    and snapshot_id = v_snapshot_id;

  if v_projection_count > 50000 then
    raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_SNAPSHOT_PROJECTION_LIMIT_DENIED';
  end if;

  if exists (
    select 1
    from public.subdivision_sale_participation_projections projection
    join public.subdivision_sale_receivable_schedules schedule
      on schedule.id = projection.schedule_id
     and schedule.organization_id = projection.organization_id
    where projection.organization_id = p_organization_id
      and projection.snapshot_id = v_snapshot_id
    group by projection.schedule_id, schedule.amount_cents
    having sum(projection.projected_amount_cents) > schedule.amount_cents
  ) then
    raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_SNAPSHOT_OVERALLOCATION_DENIED';
  end if;

  if v_policy.require_full_allocation and exists (
    select 1
    from public.subdivision_sale_receivable_schedules schedule
    where schedule.organization_id = p_organization_id
      and schedule.contract_preparation_id = p_contract_preparation_id
      and schedule.bank_issuance_state <> 'archived'
      and exists (
        select 1
        from public.subdivision_sale_participation_snapshot_rule_kinds kind
        join public.subdivision_sale_participation_snapshot_rules snapshot_rule
          on snapshot_rule.id = kind.snapshot_rule_id
         and snapshot_rule.organization_id = kind.organization_id
        where kind.organization_id = p_organization_id
          and snapshot_rule.snapshot_id = v_snapshot_id
          and kind.schedule_kind = schedule.installment_kind
      )
      and coalesce((
        select sum(projection.projected_amount_cents)
        from public.subdivision_sale_participation_projections projection
        where projection.organization_id = p_organization_id
          and projection.snapshot_id = v_snapshot_id
          and projection.schedule_id = schedule.id
      ), 0) <> schedule.amount_cents
  ) then
    raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_SNAPSHOT_FULL_ALLOCATION_DENIED';
  end if;

  return v_snapshot_id;
end;
$$;

revoke all on function public.subdivision_materialize_sale_participation_snapshot(
  uuid, uuid, uuid, uuid
) from public, anon, authenticated;
grant execute on function public.subdivision_materialize_sale_participation_snapshot(
  uuid, uuid, uuid, uuid
) to service_role;

create or replace function public.subdivision_get_internal_receivable_batch_item_detail_v4(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_batch_id uuid,
  p_item_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
  v_sale_case_id uuid;
  v_sale_state text;
  v_physical_lots jsonb := '[]'::jsonb;
  v_physical_lot_count integer := 0;
  v_development_reference text;
  v_missing_stages text[] := '{}'::text[];
  v_lineage_state text;
  v_item_number integer;
  v_schedule_kind text;
  v_amount_cents bigint;
  v_snapshot_id uuid;
  v_snapshot_state text;
  v_temporal_rule_count integer := 0;
  v_temporal_verified_rule_count integer := 0;
  v_participant_temporal_lineage_state text := 'unavailable';
begin
  perform private.require_active_subdivision_draft_authority(
    p_actor_user_id,
    p_organization_id,
    p_module,
    p_purpose_code
  );
  if p_module <> 'loteadora' then
    raise exception using errcode = '42501', message = 'SUBDIVISION_INTERNAL_LINEAGE_CONTEXT_DENIED';
  end if;

  v_result := public.subdivision_get_internal_receivable_batch_item_detail_v3(
    p_actor_user_id,
    p_organization_id,
    p_module,
    p_purpose_code,
    p_batch_id,
    p_item_id
  );

  if v_result->'batch' is null
     or v_result->'batch' = 'null'::jsonb
     or v_result->'item' is null
     or v_result->'item' = 'null'::jsonb then
    return pg_catalog.jsonb_set(
      v_result,
      '{lineage}',
      pg_catalog.jsonb_build_object(
        'lineage_state', 'unavailable',
        'development_reference', null,
        'physical_lots', '[]'::jsonb,
        'sale_state', null,
        'item_number', null,
        'schedule_kind', null,
        'nominal_amount_cents', null,
        'finance_surface', 'gerenciar_cobrancas',
        'missing_stages', jsonb_build_array('loteamento', 'quadra', 'lote', 'venda', 'item_nominal'),
        'participant_temporal_lineage_state', 'unavailable',
        'participant_temporal_rule_count', 0,
        'participant_temporal_verified_rule_count', 0
      ),
      true
    );
  end if;

  v_sale_case_id := (v_result->'batch'->>'sale_case_id')::uuid;
  v_item_number := (v_result->'item'->>'item_number')::integer;
  v_schedule_kind := v_result->'item'->>'schedule_kind';
  v_amount_cents := (v_result->'item'->>'amount_cents')::bigint;

  select sale_case.state::text
    into v_sale_state
  from public.subdivision_sale_cases sale_case
  where sale_case.id = v_sale_case_id
    and sale_case.organization_id = p_organization_id;

  select
    count(*)::integer,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'position', rows.lot_position,
          'is_primary', rows.is_primary,
          'development_reference', development.internal_reference,
          'block_number', block.block_number,
          'lot_number', lot.lot_number
        ) order by rows.is_primary desc, rows.lot_position, rows.lot_id
      ),
      '[]'::jsonb
    )
    into v_physical_lot_count, v_physical_lots
  from private.subdivision_sale_case_lot_rows(p_organization_id, v_sale_case_id) rows
  join public.subdivision_lots lot
    on lot.id = rows.lot_id
   and lot.organization_id = p_organization_id
  join public.subdivision_blocks block
    on block.id = lot.block_id
   and block.organization_id = p_organization_id
  join public.subdivision_developments development
    on development.id = block.development_id
   and development.organization_id = p_organization_id;

  if jsonb_array_length(v_physical_lots) > 0 then
    v_development_reference := v_physical_lots->0->>'development_reference';
  end if;

  select snapshot.id, snapshot.snapshot_state
    into v_snapshot_id, v_snapshot_state
  from public.subdivision_sale_participation_snapshots snapshot
  where snapshot.organization_id = p_organization_id
    and snapshot.contract_preparation_id = (v_result->'batch'->>'contract_preparation_id')::uuid;

  if v_snapshot_id is not null then
    select
      count(snapshot_rule.id)::integer,
      count(validity.id)::integer
      into v_temporal_rule_count, v_temporal_verified_rule_count
    from public.subdivision_sale_participation_snapshot_rules snapshot_rule
    left join public.subdivision_sale_participation_snapshot_role_validities validity
      on validity.snapshot_rule_id = snapshot_rule.id
     and validity.organization_id = snapshot_rule.organization_id
     and validity.validity_state = 'eligible'
    where snapshot_rule.organization_id = p_organization_id
      and snapshot_rule.snapshot_id = v_snapshot_id;

    v_participant_temporal_lineage_state := case
      when v_snapshot_state = 'no_active_policy' then 'not_applicable'
      when v_temporal_rule_count = 0 then 'incomplete'
      when v_temporal_verified_rule_count = v_temporal_rule_count then 'verified_at_snapshot'
      when v_temporal_verified_rule_count = 0 then 'legacy_unrecorded'
      else 'incomplete'
    end;
  end if;

  if v_development_reference is null then
    v_missing_stages := array_append(v_missing_stages, 'loteamento');
  end if;
  if v_physical_lot_count = 0 then
    v_missing_stages := array_append(v_missing_stages, 'quadra');
    v_missing_stages := array_append(v_missing_stages, 'lote');
  else
    if not exists (
      select 1
      from jsonb_array_elements(v_physical_lots) physical_lot
      where physical_lot->>'block_number' is not null
    ) then
      v_missing_stages := array_append(v_missing_stages, 'quadra');
    end if;
    if not exists (
      select 1
      from jsonb_array_elements(v_physical_lots) physical_lot
      where physical_lot->>'lot_number' is not null
    ) then
      v_missing_stages := array_append(v_missing_stages, 'lote');
    end if;
  end if;
  if v_sale_case_id is null or v_sale_state is null then
    v_missing_stages := array_append(v_missing_stages, 'venda');
  end if;
  if v_item_number is null or v_schedule_kind is null or v_amount_cents is null then
    v_missing_stages := array_append(v_missing_stages, 'item_nominal');
  end if;

  v_lineage_state := case
    when cardinality(v_missing_stages) = 0 then 'complete'
    when v_sale_case_id is null then 'unavailable'
    else 'partial'
  end;

  return pg_catalog.jsonb_set(
    v_result,
    '{lineage}',
    pg_catalog.jsonb_build_object(
      'lineage_state', v_lineage_state,
      'development_reference', v_development_reference,
      'physical_lots', v_physical_lots,
      'sale_state', v_sale_state,
      'item_number', v_item_number,
      'schedule_kind', v_schedule_kind,
      'nominal_amount_cents', v_amount_cents,
      'finance_surface', 'gerenciar_cobrancas',
      'missing_stages', to_jsonb(v_missing_stages),
      'participant_temporal_lineage_state', v_participant_temporal_lineage_state,
      'participant_temporal_rule_count', v_temporal_rule_count,
      'participant_temporal_verified_rule_count', v_temporal_verified_rule_count
    ),
    true
  );
end;
$$;

revoke all on function public.subdivision_get_internal_receivable_batch_item_detail_v4(
  uuid, uuid, public.operating_module, text, uuid, uuid
) from public, anon, authenticated;
grant execute on function public.subdivision_get_internal_receivable_batch_item_detail_v4(
  uuid, uuid, public.operating_module, text, uuid, uuid
) to service_role;

comment on table public.subdivision_sale_participation_snapshot_role_validities is
  'A389: prova temporal imutável por regra do snapshot na data da venda; não cria direito, pagamento ou repasse.';
comment on function public.subdivision_materialize_sale_participation_snapshot(
  uuid, uuid, uuid, uuid
) is
  'A389: materializa snapshot com prova temporal elegível por regra na data da aprovação; não executa operação financeira.';
comment on function public.subdivision_get_internal_receivable_batch_item_detail_v4(
  uuid, uuid, public.operating_module, text, uuid, uuid
) is
  'A389: expõe lineage temporal agregado e redigido por snapshot no detalhe nominal; não executa operação financeira.';

notify pgrst, 'reload schema';
