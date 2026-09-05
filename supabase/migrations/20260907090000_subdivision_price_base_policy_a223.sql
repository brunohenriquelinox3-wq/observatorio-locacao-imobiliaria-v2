-- A223: política de preço-base por m² proveniente de fonte interna validada.
-- Não cria cliente, disponibilidade, reserva, venda, proposta, contrato, cobrança, pagamento, repasse, imposto, receita ou integração externa.

create type public.subdivision_price_base_policy_state as enum ('prepared', 'submitted', 'approved', 'expired', 'withdrawn');

create table public.subdivision_price_base_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  development_id uuid not null,
  version_reference text not null check (version_reference ~ '^PB_[A-Z0-9_]{3,72}$'),
  policy_state public.subdivision_price_base_policy_state not null default 'prepared',
  effective_from date not null,
  effective_until date,
  source_fingerprint text not null check (source_fingerprint ~ '^[a-f0-9]{64}$'),
  source_schema_version text not null default 'price-base-xlsx-v1',
  source_row_count integer not null check (source_row_count between 1 and 2000),
  exception_count integer not null check (exception_count between 0 and 2000),
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  submitted_by uuid references public.identity_subjects(user_id) on delete restrict,
  approved_at timestamptz,
  approved_by uuid references public.identity_subjects(user_id) on delete restrict,
  withdrawn_at timestamptz,
  withdrawn_by uuid references public.identity_subjects(user_id) on delete restrict,
  constraint subdivision_price_base_policy_development_fk foreign key (development_id, organization_id) references public.subdivision_developments(id, organization_id) on delete restrict,
  constraint subdivision_price_base_policy_version_unique unique (organization_id, development_id, version_reference),
  constraint subdivision_price_base_policy_dates_valid check (effective_until is null or effective_until > effective_from),
  constraint subdivision_price_base_policy_submission_valid check ((policy_state = 'prepared' and submitted_at is null and submitted_by is null and approved_at is null and approved_by is null) or (policy_state in ('submitted', 'approved', 'expired', 'withdrawn') and submitted_at is not null and submitted_by is not null)),
  constraint subdivision_price_base_policy_approval_valid check ((policy_state in ('approved', 'expired') and approved_at is not null and approved_by is not null and approved_by <> created_by) or (policy_state not in ('approved', 'expired') and approved_at is null and approved_by is null))
);

create table public.subdivision_price_base_policy_lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  policy_id uuid not null references public.subdivision_price_base_policies(id) on delete restrict,
  block_id uuid not null,
  lot_id uuid not null,
  source_area_sqm numeric(12,2) not null check (source_area_sqm between 0.01 and 1000000),
  base_price_per_sqm_brl numeric(14,2) not null check (base_price_per_sqm_brl > 0 and base_price_per_sqm_brl <= 1000000000),
  row_fingerprint text not null check (row_fingerprint ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  constraint subdivision_price_base_line_block_fk foreign key (block_id, organization_id) references public.subdivision_blocks(id, organization_id) on delete restrict,
  constraint subdivision_price_base_line_lot_fk foreign key (lot_id, organization_id) references public.subdivision_lots(id, organization_id) on delete restrict,
  constraint subdivision_price_base_line_policy_lot_unique unique (policy_id, lot_id),
  constraint subdivision_price_base_line_policy_fingerprint_unique unique (policy_id, row_fingerprint)
);

create index subdivision_price_base_policies_context_lookup on public.subdivision_price_base_policies (organization_id, development_id, policy_state, effective_from desc);
create index subdivision_price_base_policy_lines_context_lookup on public.subdivision_price_base_policy_lines (organization_id, policy_id, block_id, lot_id);

alter table public.subdivision_price_base_policies enable row level security;
alter table public.subdivision_price_base_policy_lines enable row level security;
revoke all on table public.subdivision_price_base_policies from public, anon, authenticated;
revoke all on table public.subdivision_price_base_policy_lines from public, anon, authenticated;

create or replace function public.subdivision_preview_price_base_source_v1(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid, p_lines jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_line_count integer; v_reconciled_count integer; v_unreconciled_count integer;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments d where d.id = p_development_id and d.organization_id = p_organization_id and d.state = 'draft'::public.party_lifecycle_state) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED';
  end if;
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) not between 1 and 2000 then
    raise exception using errcode = '22023', message = 'PRICE_BASE_SOURCE_LINES_INVALID';
  end if;
  select count(*)::integer into v_line_count from jsonb_to_recordset(p_lines) as line(source_row integer, block_number integer, lot_number integer, area_sqm numeric, base_price_per_sqm_brl numeric, row_fingerprint text);
  if v_line_count <> jsonb_array_length(p_lines) or exists (
    select 1 from jsonb_to_recordset(p_lines) as line(source_row integer, block_number integer, lot_number integer, area_sqm numeric, base_price_per_sqm_brl numeric, row_fingerprint text)
    where line.source_row not between 2 and 5000 or line.block_number not between 1 and 999 or line.lot_number not between 1 and 100 or line.area_sqm not between 0.01 and 1000000 or line.base_price_per_sqm_brl not between 0.01 and 1000000000 or line.row_fingerprint !~ '^[a-f0-9]{64}$'
  ) or (select count(distinct (line.block_number, line.lot_number)) from jsonb_to_recordset(p_lines) as line(source_row integer, block_number integer, lot_number integer, area_sqm numeric, base_price_per_sqm_brl numeric, row_fingerprint text)) <> v_line_count then
    raise exception using errcode = '22023', message = 'PRICE_BASE_SOURCE_LINES_INVALID';
  end if;
  select count(*)::integer into v_reconciled_count
  from jsonb_to_recordset(p_lines) as source(source_row integer, block_number integer, lot_number integer, area_sqm numeric, base_price_per_sqm_brl numeric, row_fingerprint text)
  join public.subdivision_blocks block on block.organization_id = p_organization_id and block.development_id = p_development_id and block.block_number = source.block_number and block.state = 'draft'::public.party_lifecycle_state
  join public.subdivision_lots lot on lot.organization_id = p_organization_id and lot.block_id = block.id and lot.lot_number = source.lot_number and lot.state = 'draft'::public.party_lifecycle_state and lot.area_sqm = source.area_sqm;
  v_unreconciled_count := v_line_count - v_reconciled_count;
  return jsonb_build_object('reconciled_line_count', v_reconciled_count, 'unreconciled_line_count', v_unreconciled_count);
end; $$;

create or replace function public.subdivision_prepare_price_base_policy_v1(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid, p_version_reference text, p_effective_from date, p_source_fingerprint text, p_source_row_count integer, p_exception_count integer, p_lines jsonb, p_correlation_id uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_existing_result jsonb; v_policy_id uuid; v_existing_policy record; v_line_count integer; v_reconciled_count integer; v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments d where d.id = p_development_id and d.organization_id = p_organization_id and d.state = 'draft'::public.party_lifecycle_state) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED';
  end if;
  if p_version_reference !~ '^PB_[A-Z0-9_]{3,72}$' or p_effective_from is null or p_source_fingerprint !~ '^[a-f0-9]{64}$' or p_source_row_count not between 1 and 2000 or p_exception_count not between 0 and 2000 or p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) not between 1 and 2000 then
    raise exception using errcode = '22023', message = 'PRICE_BASE_POLICY_INPUT_INVALID';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_organization_id::text || ':' || p_development_id::text || ':' || trim(upper(p_version_reference)), 0));
  select event.payload_redacted -> 'result' into v_existing_result from public.admin_audit_events event where event.command_name = 'subdivision_prepare_price_base_policy_v1' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_existing_result is not null then return v_existing_result; end if;
  select count(*)::integer into v_line_count from jsonb_to_recordset(p_lines) as line(source_row integer, block_number integer, lot_number integer, area_sqm numeric, base_price_per_sqm_brl numeric, row_fingerprint text);
  if v_line_count <> jsonb_array_length(p_lines) or exists (select 1 from jsonb_to_recordset(p_lines) as line(source_row integer, block_number integer, lot_number integer, area_sqm numeric, base_price_per_sqm_brl numeric, row_fingerprint text) where line.source_row not between 2 and 5000 or line.block_number not between 1 and 999 or line.lot_number not between 1 and 100 or line.area_sqm not between 0.01 and 1000000 or line.base_price_per_sqm_brl not between 0.01 and 1000000000 or line.row_fingerprint !~ '^[a-f0-9]{64}$') or (select count(distinct (line.block_number, line.lot_number)) from jsonb_to_recordset(p_lines) as line(source_row integer, block_number integer, lot_number integer, area_sqm numeric, base_price_per_sqm_brl numeric, row_fingerprint text)) <> v_line_count then
    raise exception using errcode = '22023', message = 'PRICE_BASE_POLICY_INPUT_INVALID';
  end if;
  select count(*)::integer into v_reconciled_count from jsonb_to_recordset(p_lines) as source(source_row integer, block_number integer, lot_number integer, area_sqm numeric, base_price_per_sqm_brl numeric, row_fingerprint text) join public.subdivision_blocks block on block.organization_id = p_organization_id and block.development_id = p_development_id and block.block_number = source.block_number and block.state = 'draft'::public.party_lifecycle_state join public.subdivision_lots lot on lot.organization_id = p_organization_id and lot.block_id = block.id and lot.lot_number = source.lot_number and lot.state = 'draft'::public.party_lifecycle_state and lot.area_sqm = source.area_sqm;
  if v_reconciled_count <> v_line_count then raise exception using errcode = '42501', message = 'PRICE_BASE_PHYSICAL_RECONCILIATION_REQUIRED'; end if;
  select id, source_fingerprint, exception_count into v_existing_policy from public.subdivision_price_base_policies where organization_id = p_organization_id and development_id = p_development_id and version_reference = trim(upper(p_version_reference));
  if v_existing_policy.id is not null then
    if v_existing_policy.source_fingerprint <> p_source_fingerprint or v_existing_policy.exception_count <> p_exception_count then raise exception using errcode = '23505', message = 'PRICE_BASE_POLICY_VERSION_CONFLICT'; end if;
    v_result := jsonb_build_object('policy_id', v_existing_policy.id, 'line_count', v_line_count, 'exception_count', p_exception_count);
    return v_result;
  end if;
  insert into public.subdivision_price_base_policies(organization_id, development_id, version_reference, policy_state, effective_from, source_fingerprint, source_row_count, exception_count, created_by) values (p_organization_id, p_development_id, trim(upper(p_version_reference)), 'prepared'::public.subdivision_price_base_policy_state, p_effective_from, p_source_fingerprint, p_source_row_count, p_exception_count, p_actor_user_id) returning id into v_policy_id;
  insert into public.subdivision_price_base_policy_lines(organization_id, policy_id, block_id, lot_id, source_area_sqm, base_price_per_sqm_brl, row_fingerprint)
  select p_organization_id, v_policy_id, block.id, lot.id, source.area_sqm, source.base_price_per_sqm_brl, source.row_fingerprint from jsonb_to_recordset(p_lines) as source(source_row integer, block_number integer, lot_number integer, area_sqm numeric, base_price_per_sqm_brl numeric, row_fingerprint text) join public.subdivision_blocks block on block.organization_id = p_organization_id and block.development_id = p_development_id and block.block_number = source.block_number and block.state = 'draft'::public.party_lifecycle_state join public.subdivision_lots lot on lot.organization_id = p_organization_id and lot.block_id = block.id and lot.lot_number = source.lot_number and lot.state = 'draft'::public.party_lifecycle_state and lot.area_sqm = source.area_sqm;
  v_result := jsonb_build_object('policy_id', v_policy_id, 'line_count', v_line_count, 'exception_count', p_exception_count);
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_prepare_price_base_policy_v1', 'allowed', 'subdivision_price_base_policy', v_policy_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'source_fingerprint_present', true, 'source_row_count', p_source_row_count, 'line_count', v_line_count, 'exception_count', p_exception_count, 'result', v_result));
  return v_result;
end; $$;

create or replace function public.subdivision_submit_price_base_policy_v1(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_policy_id uuid, p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_policy record;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select target_id into v_existing from public.admin_audit_events where command_name = 'subdivision_submit_price_base_policy_v1' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed' order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  select * into v_policy from public.subdivision_price_base_policies where id = p_policy_id and organization_id = p_organization_id for update;
  if v_policy.id is null or v_policy.policy_state <> 'prepared'::public.subdivision_price_base_policy_state or v_policy.exception_count <> 0 then raise exception using errcode = '42501', message = 'PRICE_BASE_POLICY_SUBMISSION_DENIED'; end if;
  update public.subdivision_price_base_policies set policy_state = 'submitted'::public.subdivision_price_base_policy_state, submitted_at = now(), submitted_by = p_actor_user_id where id = p_policy_id;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_submit_price_base_policy_v1', 'allowed', 'subdivision_price_base_policy', p_policy_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'state', 'submitted'));
  return p_policy_id;
end; $$;

create or replace function public.subdivision_approve_price_base_policy_v1(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_policy_id uuid, p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_policy record; v_conflicting_policy uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select target_id into v_existing from public.admin_audit_events where command_name = 'subdivision_approve_price_base_policy_v1' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed' order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  select * into v_policy from public.subdivision_price_base_policies where id = p_policy_id and organization_id = p_organization_id for update;
  if v_policy.id is null or v_policy.policy_state <> 'submitted'::public.subdivision_price_base_policy_state or v_policy.exception_count <> 0 or v_policy.created_by = p_actor_user_id then raise exception using errcode = '42501', message = 'PRICE_BASE_POLICY_APPROVAL_DENIED'; end if;
  select id into v_conflicting_policy from public.subdivision_price_base_policies where organization_id = p_organization_id and development_id = v_policy.development_id and policy_state = 'approved'::public.subdivision_price_base_policy_state and effective_from >= v_policy.effective_from limit 1;
  if v_conflicting_policy is not null then raise exception using errcode = '23505', message = 'PRICE_BASE_POLICY_VIGENCY_OVERLAP'; end if;
  update public.subdivision_price_base_policies set policy_state = 'expired'::public.subdivision_price_base_policy_state, effective_until = v_policy.effective_from where organization_id = p_organization_id and development_id = v_policy.development_id and policy_state = 'approved'::public.subdivision_price_base_policy_state and effective_from < v_policy.effective_from;
  update public.subdivision_price_base_policies set policy_state = 'approved'::public.subdivision_price_base_policy_state, approved_at = now(), approved_by = p_actor_user_id where id = p_policy_id;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_approve_price_base_policy_v1', 'allowed', 'subdivision_price_base_policy', p_policy_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'state', 'approved', 'approver_distinct_from_creator', true));
  return p_policy_id;
end; $$;

create or replace function public.subdivision_list_price_base_policies_v1(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text
) returns table(policy_id uuid, development_id uuid, version_reference text, policy_state text, effective_from date, line_count integer, exception_count integer, created_at timestamptz, submitted_at timestamptz, approved_at timestamptz) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query select policy.id, policy.development_id, policy.version_reference, policy.policy_state::text, policy.effective_from, count(line.id)::integer, policy.exception_count, policy.created_at, policy.submitted_at, policy.approved_at from public.subdivision_price_base_policies policy left join public.subdivision_price_base_policy_lines line on line.policy_id = policy.id and line.organization_id = p_organization_id where policy.organization_id = p_organization_id group by policy.id order by policy.created_at desc;
end; $$;

revoke all on function public.subdivision_preview_price_base_source_v1(uuid, uuid, public.operating_module, text, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.subdivision_prepare_price_base_policy_v1(uuid, uuid, public.operating_module, text, uuid, text, date, text, integer, integer, jsonb, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_submit_price_base_policy_v1(uuid, uuid, public.operating_module, text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_approve_price_base_policy_v1(uuid, uuid, public.operating_module, text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_price_base_policies_v1(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.subdivision_preview_price_base_source_v1(uuid, uuid, public.operating_module, text, uuid, jsonb) to service_role;
grant execute on function public.subdivision_prepare_price_base_policy_v1(uuid, uuid, public.operating_module, text, uuid, text, date, text, integer, integer, jsonb, uuid) to service_role;
grant execute on function public.subdivision_submit_price_base_policy_v1(uuid, uuid, public.operating_module, text, uuid, uuid) to service_role;
grant execute on function public.subdivision_approve_price_base_policy_v1(uuid, uuid, public.operating_module, text, uuid, uuid) to service_role;
grant execute on function public.subdivision_list_price_base_policies_v1(uuid, uuid, public.operating_module, text) to service_role;

comment on table public.subdivision_price_base_policies is 'A223: política versionada de preço-base por m². Sem contrato, cliente, disponibilidade, venda, receita, cobrança, pagamento ou repasse.';
comment on table public.subdivision_price_base_policy_lines is 'A223: linhas de fonte reconciliadas com a matriz física; não representam valor de contrato, recebível ou lançamento contábil.';
