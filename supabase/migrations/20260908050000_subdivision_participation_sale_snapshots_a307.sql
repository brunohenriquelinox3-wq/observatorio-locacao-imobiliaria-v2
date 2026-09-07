-- A307: snapshots e projeções internas por venda. Não emite cobrança, não executa split, não envia remessa, não acessa banco, não transfere, não dá baixa e não registra pagamento.

create table public.subdivision_sale_participation_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  sale_case_id uuid not null,
  contract_preparation_id uuid not null,
  policy_version_id uuid null,
  snapshot_state text not null check (snapshot_state in ('projected', 'no_active_policy', 'reversal_review')),
  require_full_allocation boolean not null default false,
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_sale_participation_snapshots_case_tenant_fk foreign key (sale_case_id, organization_id) references public.subdivision_sale_cases(id, organization_id) on delete restrict,
  constraint subdivision_sale_participation_snapshots_contract_tenant_fk foreign key (contract_preparation_id, organization_id) references public.subdivision_sale_contract_preparations(id, organization_id) on delete restrict,
  constraint subdivision_sale_participation_snapshots_policy_tenant_fk foreign key (policy_version_id, organization_id) references public.subdivision_participation_policy_versions(id, organization_id) on delete restrict,
  constraint subdivision_sale_participation_snapshots_contract_unique unique (organization_id, contract_preparation_id),
  constraint subdivision_sale_participation_snapshots_tenant_match unique (id, organization_id)
);
alter table public.subdivision_sale_participation_snapshots enable row level security;
revoke all on table public.subdivision_sale_participation_snapshots from public, anon, authenticated;

create table public.subdivision_sale_participation_snapshot_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  snapshot_id uuid not null,
  source_rule_id uuid not null,
  internal_party_role_link_id uuid not null,
  participant_display_name text not null check (char_length(trim(participant_display_name)) between 2 and 160),
  participant_role public.party_role_kind not null,
  allocation_method text not null check (allocation_method in ('percentage_per_schedule', 'fixed_per_schedule', 'capped_total_per_lot')),
  percentage_basis_points integer null check (percentage_basis_points between 1 and 10000),
  fixed_amount_cents bigint null check (fixed_amount_cents between 1 and 100000000000000),
  cap_total_cents bigint null check (cap_total_cents between 1 and 100000000000000),
  created_at timestamptz not null default now(),
  constraint subdivision_sale_participation_snapshot_rules_snapshot_tenant_fk foreign key (snapshot_id, organization_id) references public.subdivision_sale_participation_snapshots(id, organization_id) on delete restrict,
  constraint subdivision_sale_participation_snapshot_rules_role_tenant_fk foreign key (internal_party_role_link_id, organization_id) references public.subdivision_internal_party_roles(id, organization_id) on delete restrict,
  constraint subdivision_sale_participation_snapshot_rules_detail check (
    (allocation_method = 'percentage_per_schedule' and percentage_basis_points is not null and fixed_amount_cents is null and cap_total_cents is null)
    or (allocation_method = 'fixed_per_schedule' and percentage_basis_points is null and fixed_amount_cents is not null and cap_total_cents is null)
    or (allocation_method = 'capped_total_per_lot' and percentage_basis_points is null and fixed_amount_cents is null and cap_total_cents is not null)
  ),
  constraint subdivision_sale_participation_snapshot_rules_source_unique unique (organization_id, snapshot_id, source_rule_id),
  constraint subdivision_sale_participation_snapshot_rules_tenant_match unique (id, organization_id)
);
alter table public.subdivision_sale_participation_snapshot_rules enable row level security;
revoke all on table public.subdivision_sale_participation_snapshot_rules from public, anon, authenticated;

create table public.subdivision_sale_participation_snapshot_rule_kinds (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  snapshot_rule_id uuid not null,
  schedule_kind text not null check (schedule_kind in ('entry', 'entry_installment', 'installment', 'cash_settlement', 'supplemental_cash', 'trade_in_credit')),
  created_at timestamptz not null default now(),
  constraint subdivision_sale_participation_snapshot_rule_kinds_rule_tenant_fk foreign key (snapshot_rule_id, organization_id) references public.subdivision_sale_participation_snapshot_rules(id, organization_id) on delete restrict,
  constraint subdivision_sale_participation_snapshot_rule_kinds_unique unique (organization_id, snapshot_rule_id, schedule_kind)
);
alter table public.subdivision_sale_participation_snapshot_rule_kinds enable row level security;
revoke all on table public.subdivision_sale_participation_snapshot_rule_kinds from public, anon, authenticated;

create table public.subdivision_sale_participation_projections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  snapshot_id uuid not null,
  snapshot_rule_id uuid not null,
  schedule_id uuid not null,
  schedule_kind text not null check (schedule_kind in ('entry', 'entry_installment', 'installment', 'cash_settlement', 'supplemental_cash', 'trade_in_credit')),
  due_date date not null,
  projected_amount_cents bigint not null check (projected_amount_cents between 1 and 100000000000000),
  created_at timestamptz not null default now(),
  constraint subdivision_sale_participation_projections_snapshot_tenant_fk foreign key (snapshot_id, organization_id) references public.subdivision_sale_participation_snapshots(id, organization_id) on delete restrict,
  constraint subdivision_sale_participation_projections_rule_tenant_fk foreign key (snapshot_rule_id, organization_id) references public.subdivision_sale_participation_snapshot_rules(id, organization_id) on delete restrict,
  constraint subdivision_sale_participation_projections_schedule_tenant_fk foreign key (schedule_id, organization_id) references public.subdivision_sale_receivable_schedules(id, organization_id) on delete restrict,
  constraint subdivision_sale_participation_projections_unique unique (organization_id, snapshot_rule_id, schedule_id)
);
alter table public.subdivision_sale_participation_projections enable row level security;
revoke all on table public.subdivision_sale_participation_projections from public, anon, authenticated;

create or replace function public.subdivision_materialize_sale_participation_snapshot(
  p_actor_user_id uuid, p_organization_id uuid, p_sale_case_id uuid, p_contract_preparation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_lot_id uuid; v_development_id uuid; v_policy record; v_snapshot_id uuid; v_rule_count integer; v_projection_count integer;
begin
  select id into v_existing from public.subdivision_sale_participation_snapshots where organization_id = p_organization_id and contract_preparation_id = p_contract_preparation_id;
  if v_existing is not null then return v_existing; end if;
  select sale_case.lot_id, block.development_id into v_lot_id, v_development_id from public.subdivision_sale_cases sale_case join public.subdivision_lots lot on lot.id = sale_case.lot_id and lot.organization_id = sale_case.organization_id join public.subdivision_blocks block on block.id = lot.block_id and block.organization_id = lot.organization_id where sale_case.id = p_sale_case_id and sale_case.organization_id = p_organization_id;
  if v_lot_id is null then raise exception using errcode = '42501', message = 'SUBDIVISION_PARTICIPATION_SNAPSHOT_CONTEXT_DENIED'; end if;
  select * into v_policy from public.subdivision_participation_policy_versions policy where policy.organization_id = p_organization_id and policy.development_id = v_development_id and policy.state = 'active' and policy.valid_from <= current_date and (policy.valid_until is null or policy.valid_until >= current_date) order by policy.version_number desc limit 1 for update;
  if v_policy.id is null then
    insert into public.subdivision_sale_participation_snapshots(organization_id, sale_case_id, contract_preparation_id, policy_version_id, snapshot_state, require_full_allocation, created_by)
    values(p_organization_id, p_sale_case_id, p_contract_preparation_id, null, 'no_active_policy', false, p_actor_user_id) returning id into v_snapshot_id;
    return v_snapshot_id;
  end if;
  insert into public.subdivision_sale_participation_snapshots(organization_id, sale_case_id, contract_preparation_id, policy_version_id, snapshot_state, require_full_allocation, created_by)
  values(p_organization_id, p_sale_case_id, p_contract_preparation_id, v_policy.id, 'projected', v_policy.require_full_allocation, p_actor_user_id) returning id into v_snapshot_id;
  insert into public.subdivision_sale_participation_snapshot_rules(organization_id, snapshot_id, source_rule_id, internal_party_role_link_id, participant_display_name, participant_role, allocation_method, percentage_basis_points, fixed_amount_cents, cap_total_cents)
  select p_organization_id, v_snapshot_id, rule.id, rule.internal_party_role_link_id, party.display_name, assignment.role, rule.allocation_method, rule.percentage_basis_points, rule.fixed_amount_cents, rule.cap_total_cents
  from public.subdivision_participation_policy_rules rule
  join public.subdivision_internal_party_roles link on link.id = rule.internal_party_role_link_id and link.organization_id = rule.organization_id
  join public.party_role_assignments assignment on assignment.id = link.party_role_assignment_id and assignment.organization_id = link.organization_id
  join public.party_records party on party.id = assignment.party_id and party.organization_id = assignment.organization_id
  where rule.organization_id = p_organization_id and rule.policy_version_id = v_policy.id and (rule.applies_to_all_lots or exists(select 1 from public.subdivision_participation_rule_lot_scopes scope where scope.organization_id = p_organization_id and scope.rule_id = rule.id and scope.lot_id = v_lot_id));
  select count(*)::integer into v_rule_count from public.subdivision_sale_participation_snapshot_rules where organization_id = p_organization_id and snapshot_id = v_snapshot_id;
  if v_rule_count = 0 or v_rule_count > 100 then raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_SNAPSHOT_RULE_LIMIT_DENIED'; end if;
  insert into public.subdivision_sale_participation_snapshot_rule_kinds(organization_id, snapshot_rule_id, schedule_kind)
  select p_organization_id, snapshot_rule.id, kind.schedule_kind from public.subdivision_sale_participation_snapshot_rules snapshot_rule join public.subdivision_participation_rule_schedule_kinds kind on kind.rule_id = snapshot_rule.source_rule_id and kind.organization_id = snapshot_rule.organization_id where snapshot_rule.organization_id = p_organization_id and snapshot_rule.snapshot_id = v_snapshot_id;
  insert into public.subdivision_sale_participation_projections(organization_id, snapshot_id, snapshot_rule_id, schedule_id, schedule_kind, due_date, projected_amount_cents)
  with candidates as (
    select snapshot_rule.id as snapshot_rule_id, schedule.id as schedule_id, schedule.installment_kind as schedule_kind, schedule.due_date, schedule.amount_cents,
      case snapshot_rule.allocation_method
        when 'percentage_per_schedule' then (schedule.amount_cents * snapshot_rule.percentage_basis_points / 10000)::bigint
        when 'fixed_per_schedule' then least(schedule.amount_cents, snapshot_rule.fixed_amount_cents)
        when 'capped_total_per_lot' then greatest(least(schedule.amount_cents, snapshot_rule.cap_total_cents - coalesce(sum(schedule.amount_cents) over (partition by snapshot_rule.id order by schedule.due_date, schedule.installment_kind, schedule.installment_number rows between unbounded preceding and 1 preceding), 0)), 0)
      end as projected_amount_cents
    from public.subdivision_sale_participation_snapshot_rules snapshot_rule
    join public.subdivision_sale_participation_snapshot_rule_kinds kind on kind.snapshot_rule_id = snapshot_rule.id and kind.organization_id = snapshot_rule.organization_id
    join public.subdivision_sale_receivable_schedules schedule on schedule.organization_id = snapshot_rule.organization_id and schedule.contract_preparation_id = p_contract_preparation_id and schedule.installment_kind = kind.schedule_kind and schedule.bank_issuance_state <> 'archived'
    where snapshot_rule.organization_id = p_organization_id and snapshot_rule.snapshot_id = v_snapshot_id
  ) select p_organization_id, v_snapshot_id, snapshot_rule_id, schedule_id, schedule_kind, due_date, projected_amount_cents from candidates where projected_amount_cents > 0;
  select count(*)::integer into v_projection_count from public.subdivision_sale_participation_projections where organization_id = p_organization_id and snapshot_id = v_snapshot_id;
  if v_projection_count > 50000 then raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_SNAPSHOT_PROJECTION_LIMIT_DENIED'; end if;
  if exists(select 1 from public.subdivision_sale_participation_projections projection join public.subdivision_sale_receivable_schedules schedule on schedule.id = projection.schedule_id and schedule.organization_id = projection.organization_id where projection.organization_id = p_organization_id and projection.snapshot_id = v_snapshot_id group by projection.schedule_id, schedule.amount_cents having sum(projection.projected_amount_cents) > schedule.amount_cents) then raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_SNAPSHOT_OVERALLOCATION_DENIED'; end if;
  if v_policy.require_full_allocation and exists(select 1 from public.subdivision_sale_receivable_schedules schedule where schedule.organization_id = p_organization_id and schedule.contract_preparation_id = p_contract_preparation_id and schedule.bank_issuance_state <> 'archived' and exists(select 1 from public.subdivision_sale_participation_snapshot_rule_kinds kind join public.subdivision_sale_participation_snapshot_rules snapshot_rule on snapshot_rule.id = kind.snapshot_rule_id and snapshot_rule.organization_id = kind.organization_id where kind.organization_id = p_organization_id and snapshot_rule.snapshot_id = v_snapshot_id and kind.schedule_kind = schedule.installment_kind) and coalesce((select sum(projected_amount_cents) from public.subdivision_sale_participation_projections projection where projection.organization_id = p_organization_id and projection.snapshot_id = v_snapshot_id and projection.schedule_id = schedule.id), 0) <> schedule.amount_cents) then raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_SNAPSHOT_FULL_ALLOCATION_DENIED'; end if;
  return v_snapshot_id;
end; $$;

create or replace function public.subdivision_approve_sale_case(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_sale_case_id uuid, p_correlation_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_idempotent jsonb; v_case record; v_contract_id uuid; v_batch_id uuid; v_snapshot_id uuid; v_item_count integer; v_result jsonb;
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
  select count(*)::integer into v_item_count from public.subdivision_sale_receivable_schedules schedule where schedule.organization_id = p_organization_id and schedule.contract_preparation_id = v_contract_id and schedule.bank_issuance_state <> 'archived';
  if v_item_count = 0 then raise exception using errcode = '42501', message = 'SUBDIVISION_INTERNAL_BATCH_SCHEDULE_DENIED'; end if;
  v_snapshot_id := public.subdivision_materialize_sale_participation_snapshot(p_actor_user_id, p_organization_id, p_sale_case_id, v_contract_id);
  insert into public.subdivision_internal_receivable_batches(organization_id, sale_case_id, contract_preparation_id, batch_state, released_by) values(p_organization_id, p_sale_case_id, v_contract_id, 'released_internal_control', p_actor_user_id) on conflict(organization_id, contract_preparation_id) do update set updated_at = public.subdivision_internal_receivable_batches.updated_at returning id into v_batch_id;
  insert into public.subdivision_internal_receivable_batch_items(organization_id, batch_id, schedule_id, item_number, schedule_kind, due_date, amount_cents) select p_organization_id, v_batch_id, schedule.id, row_number() over (order by schedule.due_date, schedule.installment_kind, schedule.installment_number)::integer, schedule.installment_kind, schedule.due_date, schedule.amount_cents from public.subdivision_sale_receivable_schedules schedule where schedule.organization_id = p_organization_id and schedule.contract_preparation_id = v_contract_id and schedule.bank_issuance_state <> 'archived' on conflict(organization_id, schedule_id) do nothing;
  update public.subdivision_sale_contract_preparations set state = 'approved', updated_at = now() where id = v_contract_id and organization_id = p_organization_id;
  update public.subdivision_sale_cases set state = 'approved', updated_at = now() where id = p_sale_case_id and organization_id = p_organization_id;
  insert into public.subdivision_lot_commercial_states(organization_id, lot_id, sale_case_id, commercial_state, created_by) values (p_organization_id, v_case.lot_id, p_sale_case_id, 'sold', p_actor_user_id) on conflict(organization_id, lot_id) do update set sale_case_id = excluded.sale_case_id, commercial_state = 'sold', created_by = excluded.created_by, updated_at = now();
  v_result := jsonb_build_object('sale_case_id', p_sale_case_id, 'lot_commercial_state', 'sold', 'contract_state', 'approved', 'internal_batch_released', true, 'participation_snapshot_created', v_snapshot_id is not null, 'scheduled_item_count', v_item_count);
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_approve_sale_case', 'allowed', 'subdivision_sale_case', p_sale_case_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'lot_commercial_state', 'sold', 'contract_state', 'approved', 'dossier_reviewed', true, 'internal_batch_released', true, 'participation_snapshot_created', true, 'scheduled_item_count', v_item_count, 'result', v_result));
  return v_result;
end; $$;

create or replace function public.subdivision_request_sale_reversal(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_sale_case_id uuid, p_correlation_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_idempotent jsonb; v_case record; v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_REVERSAL_CONTEXT_DENIED'; end if;
  select event.payload_redacted -> 'result' into v_idempotent from public.admin_audit_events event where event.command_name = 'subdivision_request_sale_reversal' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_idempotent is not null then return v_idempotent; end if;
  select sale_case.* into v_case from public.subdivision_sale_cases sale_case where sale_case.id = p_sale_case_id and sale_case.organization_id = p_organization_id and sale_case.state = 'approved' for update;
  if v_case.id is null then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_REVERSAL_STATE_DENIED'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || ':' || v_case.lot_id::text, 0));
  update public.subdivision_lot_commercial_states set commercial_state = 'reversal_review', created_by = p_actor_user_id, updated_at = now() where organization_id = p_organization_id and lot_id = v_case.lot_id and sale_case_id = p_sale_case_id and commercial_state = 'sold';
  if not found then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_REVERSAL_CONTEXT_DENIED'; end if;
  update public.subdivision_internal_receivable_batches set batch_state = 'reversal_review', updated_at = now() where organization_id = p_organization_id and sale_case_id = p_sale_case_id and batch_state = 'released_internal_control';
  update public.subdivision_sale_participation_snapshots set snapshot_state = 'reversal_review', updated_at = now() where organization_id = p_organization_id and sale_case_id = p_sale_case_id and snapshot_state in ('projected', 'no_active_policy');
  v_result := jsonb_build_object('sale_case_id', p_sale_case_id, 'lot_commercial_state', 'reversal_review', 'contract_state', 'approved', 'internal_batch_state', 'reversal_review');
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_request_sale_reversal', 'allowed', 'subdivision_sale_case', p_sale_case_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'lot_commercial_state', 'reversal_review', 'internal_batch_state', 'reversal_review', 'participation_snapshot_reversal_review', true, 'result', v_result)); return v_result;
end; $$;

drop function public.subdivision_list_internal_receivable_batches(uuid,uuid,public.operating_module,text);
create function public.subdivision_list_internal_receivable_batches(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text) returns table(batch_id uuid, sale_case_id uuid, contract_preparation_id uuid, batch_state public.subdivision_internal_receivable_batch_state, item_count integer, total_cents bigint, participation_snapshot_state text, participation_rule_count integer, participation_projected_item_count integer, participation_projected_total_cents bigint, participation_unallocated_cents bigint, released_at timestamptz, updated_at timestamptz) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_INTERNAL_BATCH_CONTEXT_DENIED'; end if;
  return query
  select batch.id, batch.sale_case_id, batch.contract_preparation_id, batch.batch_state,
    items.item_count, items.total_cents, coalesce(snapshot.snapshot_state, 'no_active_policy'),
    rules.rule_count, projections.projected_item_count, projections.projected_total_cents,
    greatest(items.total_cents - projections.projected_total_cents, 0)::bigint, batch.released_at, batch.updated_at
  from public.subdivision_internal_receivable_batches batch
  left join lateral (
    select count(item.id)::integer as item_count, coalesce(sum(item.amount_cents), 0)::bigint as total_cents
    from public.subdivision_internal_receivable_batch_items item
    where item.batch_id = batch.id and item.organization_id = batch.organization_id
  ) items on true
  left join public.subdivision_sale_participation_snapshots snapshot on snapshot.contract_preparation_id = batch.contract_preparation_id and snapshot.organization_id = batch.organization_id
  left join lateral (
    select count(snapshot_rule.id)::integer as rule_count
    from public.subdivision_sale_participation_snapshot_rules snapshot_rule
    where snapshot_rule.snapshot_id = snapshot.id and snapshot_rule.organization_id = batch.organization_id
  ) rules on true
  left join lateral (
    select count(projection.id)::integer as projected_item_count, coalesce(sum(projection.projected_amount_cents), 0)::bigint as projected_total_cents
    from public.subdivision_sale_participation_projections projection
    where projection.snapshot_id = snapshot.id and projection.organization_id = batch.organization_id
  ) projections on true
  where batch.organization_id = p_organization_id and batch.batch_state <> 'archived'
  order by batch.released_at desc, batch.id;
end; $$;

create or replace function public.subdivision_list_internal_participation_projection_summaries(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text) returns table(batch_id uuid, participant_display_name text, participant_role public.party_role_kind, projected_total_cents bigint, projected_item_count integer, snapshot_state text) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_PARTICIPATION_CONTEXT_DENIED'; end if;
  return query select batch.id, snapshot_rule.participant_display_name, snapshot_rule.participant_role, coalesce(sum(projection.projected_amount_cents), 0)::bigint, count(projection.id)::integer, snapshot.snapshot_state from public.subdivision_internal_receivable_batches batch join public.subdivision_sale_participation_snapshots snapshot on snapshot.contract_preparation_id = batch.contract_preparation_id and snapshot.organization_id = batch.organization_id join public.subdivision_sale_participation_snapshot_rules snapshot_rule on snapshot_rule.snapshot_id = snapshot.id and snapshot_rule.organization_id = snapshot.organization_id left join public.subdivision_sale_participation_projections projection on projection.snapshot_rule_id = snapshot_rule.id and projection.organization_id = snapshot_rule.organization_id where batch.organization_id = p_organization_id and batch.batch_state <> 'archived' group by batch.id, snapshot_rule.id, snapshot.snapshot_state order by batch.id, snapshot_rule.participant_display_name;
end; $$;

revoke all on function public.subdivision_materialize_sale_participation_snapshot(uuid,uuid,uuid,uuid), public.subdivision_approve_sale_case(uuid,uuid,public.operating_module,text,uuid,uuid), public.subdivision_request_sale_reversal(uuid,uuid,public.operating_module,text,uuid,uuid), public.subdivision_list_internal_receivable_batches(uuid,uuid,public.operating_module,text), public.subdivision_list_internal_participation_projection_summaries(uuid,uuid,public.operating_module,text) from public, anon, authenticated;
grant execute on function public.subdivision_approve_sale_case(uuid,uuid,public.operating_module,text,uuid,uuid), public.subdivision_request_sale_reversal(uuid,uuid,public.operating_module,text,uuid,uuid), public.subdivision_list_internal_receivable_batches(uuid,uuid,public.operating_module,text), public.subdivision_list_internal_participation_projection_summaries(uuid,uuid,public.operating_module,text) to service_role;

comment on table public.subdivision_sale_participation_snapshots is 'A307: fotografia imutável de regras internas de participação por venda; não cria pagamento, crédito, transferência, split ou baixa.';
comment on table public.subdivision_sale_participation_projections is 'A307: previsão interna por item de agenda; não confirma pagamento, recebimento, obrigação liquidada ou repasse.';
