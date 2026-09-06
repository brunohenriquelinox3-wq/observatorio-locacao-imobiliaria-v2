-- A231: regras de preço-base e condições por empreendimento, Quadra ou Lote.
-- Não cria disponibilidade, reserva, venda, proposta, contrato, cobrança, pagamento, repasse, imposto, receita ou integração externa.

create type public.subdivision_price_condition_scope as enum ('development', 'block', 'lot');
create type public.subdivision_price_condition_kind as enum ('override_per_sqm', 'percentage_adjustment', 'temporary_discount');
create type public.subdivision_price_condition_document_state as enum ('pending_evidence', 'under_review', 'declared_complete', 'review_required');

create table public.subdivision_price_conditions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  development_id uuid not null,
  base_policy_id uuid not null references public.subdivision_price_base_policies(id) on delete restrict,
  condition_reference text not null check (condition_reference ~ '^PC_[A-Z0-9_]{3,72}$'),
  scope public.subdivision_price_condition_scope not null,
  block_id uuid references public.subdivision_blocks(id) on delete restrict,
  lot_id uuid references public.subdivision_lots(id) on delete restrict,
  adjustment_kind public.subdivision_price_condition_kind not null,
  amount numeric(14,4) not null check (amount > -100 and amount <= 1000000000 and amount <> 0),
  effective_from date not null,
  effective_until date,
  reason_code text not null check (reason_code in ('internal_review', 'work_progress', 'market_response', 'campaign', 'specific_condition', 'other')),
  document_state public.subdivision_price_condition_document_state not null default 'pending_evidence',
  condition_state public.subdivision_price_base_policy_state not null default 'prepared',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  submitted_by uuid references public.identity_subjects(user_id) on delete restrict,
  approved_at timestamptz,
  approved_by uuid references public.identity_subjects(user_id) on delete restrict,
  withdrawn_at timestamptz,
  withdrawn_by uuid references public.identity_subjects(user_id) on delete restrict,
  constraint subdivision_price_condition_development_fk foreign key (development_id, organization_id) references public.subdivision_developments(id, organization_id) on delete restrict,
  constraint subdivision_price_condition_target_valid check ((scope = 'development' and block_id is null and lot_id is null) or (scope = 'block' and block_id is not null and lot_id is null) or (scope = 'lot' and block_id is not null and lot_id is not null)),
  constraint subdivision_price_condition_dates_valid check (effective_until is null or effective_until > effective_from),
  constraint subdivision_price_condition_submission_valid check ((condition_state = 'prepared' and submitted_at is null and submitted_by is null and approved_at is null and approved_by is null) or (condition_state in ('submitted', 'approved', 'expired', 'withdrawn') and submitted_at is not null and submitted_by is not null)),
  constraint subdivision_price_condition_approval_valid check ((condition_state in ('approved', 'expired') and approved_at is not null and approved_by is not null and approved_by <> created_by) or (condition_state not in ('approved', 'expired') and approved_at is null and approved_by is null)),
  constraint subdivision_price_condition_reference_unique unique (organization_id, development_id, condition_reference)
);

create index subdivision_price_conditions_context_lookup on public.subdivision_price_conditions (organization_id, development_id, condition_state, effective_from desc);
create index subdivision_price_conditions_target_lookup on public.subdivision_price_conditions (organization_id, development_id, block_id, lot_id, condition_state, effective_from desc);
alter table public.subdivision_price_conditions enable row level security;
revoke all on table public.subdivision_price_conditions from public, anon, authenticated;

create or replace function public.subdivision_create_price_condition_v1(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid, p_base_policy_id uuid, p_condition_reference text,
  p_scope public.subdivision_price_condition_scope, p_block_id uuid, p_lot_id uuid, p_adjustment_kind public.subdivision_price_condition_kind, p_amount numeric, p_effective_from date, p_effective_until date,
  p_reason_code text, p_document_state public.subdivision_price_condition_document_state, p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_condition_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments d where d.id = p_development_id and d.organization_id = p_organization_id and d.state = 'draft'::public.party_lifecycle_state) then raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED'; end if;
  if not exists (select 1 from public.subdivision_price_base_policies p where p.id = p_base_policy_id and p.organization_id = p_organization_id and p.development_id = p_development_id) then raise exception using errcode = '42501', message = 'PRICE_CONDITION_BASE_POLICY_DENIED'; end if;
  if p_condition_reference !~ '^PC_[A-Z0-9_]{3,72}$' or p_amount <= -100 or p_amount = 0 or p_amount > 1000000000 or p_effective_from is null or (p_effective_until is not null and p_effective_until <= p_effective_from) or p_reason_code not in ('internal_review', 'work_progress', 'market_response', 'campaign', 'specific_condition', 'other') or (p_adjustment_kind = 'temporary_discount' and (p_effective_until is null or p_amount > 100)) or (p_adjustment_kind = 'override_per_sqm' and p_amount <= 0) or (p_adjustment_kind = 'percentage_adjustment' and p_amount > 1000) then raise exception using errcode = '22023', message = 'PRICE_CONDITION_INPUT_INVALID'; end if;
  if (p_scope = 'development' and (p_block_id is not null or p_lot_id is not null)) or (p_scope = 'block' and (p_block_id is null or p_lot_id is not null)) or (p_scope = 'lot' and (p_block_id is null or p_lot_id is null)) then raise exception using errcode = '22023', message = 'PRICE_CONDITION_TARGET_INVALID'; end if;
  if p_block_id is not null and not exists (select 1 from public.subdivision_blocks b where b.id = p_block_id and b.organization_id = p_organization_id and b.development_id = p_development_id and b.state = 'draft'::public.party_lifecycle_state) then raise exception using errcode = '42501', message = 'PRICE_CONDITION_BLOCK_DENIED'; end if;
  if p_lot_id is not null and not exists (select 1 from public.subdivision_lots l where l.id = p_lot_id and l.organization_id = p_organization_id and l.block_id = p_block_id and l.state = 'draft'::public.party_lifecycle_state) then raise exception using errcode = '42501', message = 'PRICE_CONDITION_LOT_DENIED'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_organization_id::text || ':' || p_development_id::text || ':' || trim(upper(p_condition_reference)), 0));
  select target_id into v_existing from public.admin_audit_events where command_name = 'subdivision_create_price_condition_v1' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed' order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  insert into public.subdivision_price_conditions(organization_id, development_id, base_policy_id, condition_reference, scope, block_id, lot_id, adjustment_kind, amount, effective_from, effective_until, reason_code, document_state, created_by)
  values(p_organization_id, p_development_id, p_base_policy_id, trim(upper(p_condition_reference)), p_scope, p_block_id, p_lot_id, p_adjustment_kind, p_amount, p_effective_from, p_effective_until, p_reason_code, p_document_state, p_actor_user_id) returning id into v_condition_id;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_create_price_condition_v1', 'allowed', 'subdivision_price_condition', v_condition_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'scope', p_scope::text, 'adjustment_kind', p_adjustment_kind::text, 'reason_code', p_reason_code, 'document_state', p_document_state::text, 'amount_present', true, 'effective_until_present', p_effective_until is not null));
  return v_condition_id;
end; $$;

create or replace function public.subdivision_list_price_conditions_v1(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid)
returns table(condition_id uuid, development_id uuid, base_policy_id uuid, condition_reference text, scope text, adjustment_kind text, effective_from date, effective_until date, reason_code text, document_state text, condition_state text, created_at timestamptz, submitted_at timestamptz, approved_at timestamptz) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments d where d.id = p_development_id and d.organization_id = p_organization_id and d.state = 'draft'::public.party_lifecycle_state) then raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED'; end if;
  return query select c.id, c.development_id, c.base_policy_id, c.condition_reference, c.scope::text, c.adjustment_kind::text, c.effective_from, c.effective_until, c.reason_code, c.document_state::text, c.condition_state::text, c.created_at, c.submitted_at, c.approved_at from public.subdivision_price_conditions c where c.organization_id = p_organization_id and c.development_id = p_development_id order by c.created_at desc;
end; $$;

create or replace function public.subdivision_submit_price_condition_v1(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_condition_id uuid, p_correlation_id uuid) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_condition record;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select target_id into v_existing from public.admin_audit_events where command_name = 'subdivision_submit_price_condition_v1' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed' order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  select c.*, p.policy_state as base_policy_state, p.exception_count as base_exception_count into v_condition from public.subdivision_price_conditions c join public.subdivision_price_base_policies p on p.id = c.base_policy_id and p.organization_id = c.organization_id where c.id = p_condition_id and c.organization_id = p_organization_id for update of c;
  if v_condition.id is null or v_condition.condition_state <> 'prepared'::public.subdivision_price_base_policy_state or v_condition.document_state <> 'declared_complete'::public.subdivision_price_condition_document_state or v_condition.base_policy_state <> 'approved'::public.subdivision_price_base_policy_state or v_condition.base_exception_count <> 0 then raise exception using errcode = '42501', message = 'PRICE_CONDITION_SUBMISSION_DENIED'; end if;
  update public.subdivision_price_conditions set condition_state = 'submitted'::public.subdivision_price_base_policy_state, submitted_at = now(), submitted_by = p_actor_user_id where id = p_condition_id;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_submit_price_condition_v1', 'allowed', 'subdivision_price_condition', p_condition_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'state', 'submitted'));
  return p_condition_id;
end; $$;

create or replace function public.subdivision_approve_price_condition_v1(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_condition_id uuid, p_correlation_id uuid) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_condition record; v_overlap uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select target_id into v_existing from public.admin_audit_events where command_name = 'subdivision_approve_price_condition_v1' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed' order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  select c.*, p.policy_state as base_policy_state, p.exception_count as base_exception_count into v_condition from public.subdivision_price_conditions c join public.subdivision_price_base_policies p on p.id = c.base_policy_id and p.organization_id = c.organization_id where c.id = p_condition_id and c.organization_id = p_organization_id for update of c;
  if v_condition.id is null or v_condition.condition_state <> 'submitted'::public.subdivision_price_base_policy_state or v_condition.created_by = p_actor_user_id or v_condition.document_state <> 'declared_complete'::public.subdivision_price_condition_document_state or v_condition.base_policy_state <> 'approved'::public.subdivision_price_base_policy_state or v_condition.base_exception_count <> 0 then raise exception using errcode = '42501', message = 'PRICE_CONDITION_APPROVAL_DENIED'; end if;
  select c.id into v_overlap from public.subdivision_price_conditions c where c.organization_id = p_organization_id and c.development_id = v_condition.development_id and c.condition_state = 'approved'::public.subdivision_price_base_policy_state and c.scope = v_condition.scope and c.block_id is not distinct from v_condition.block_id and c.lot_id is not distinct from v_condition.lot_id and c.effective_from < coalesce(v_condition.effective_until, 'infinity'::date) and v_condition.effective_from < coalesce(c.effective_until, 'infinity'::date) limit 1;
  if v_overlap is not null then raise exception using errcode = '23505', message = 'PRICE_CONDITION_VIGENCY_OVERLAP'; end if;
  update public.subdivision_price_conditions set condition_state = 'approved'::public.subdivision_price_base_policy_state, approved_at = now(), approved_by = p_actor_user_id where id = p_condition_id;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_approve_price_condition_v1', 'allowed', 'subdivision_price_condition', p_condition_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'state', 'approved', 'approver_distinct_from_creator', true));
  return p_condition_id;
end; $$;

create or replace function public.subdivision_withdraw_price_condition_v1(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_condition_id uuid, p_correlation_id uuid) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_condition record;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select target_id into v_existing from public.admin_audit_events where command_name = 'subdivision_withdraw_price_condition_v1' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed' order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  select * into v_condition from public.subdivision_price_conditions where id = p_condition_id and organization_id = p_organization_id for update;
  if v_condition.id is null or v_condition.condition_state not in ('prepared'::public.subdivision_price_base_policy_state, 'submitted'::public.subdivision_price_base_policy_state) then raise exception using errcode = '42501', message = 'PRICE_CONDITION_WITHDRAW_DENIED'; end if;
  update public.subdivision_price_conditions set condition_state = 'withdrawn'::public.subdivision_price_base_policy_state, withdrawn_at = now(), withdrawn_by = p_actor_user_id where id = p_condition_id;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_withdraw_price_condition_v1', 'allowed', 'subdivision_price_condition', p_condition_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'state', 'withdrawn'));
  return p_condition_id;
end; $$;

create or replace function public.subdivision_get_lot_price_context_v1(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid, p_block_id uuid, p_lot_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_base record; v_condition record; v_effective numeric;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_lots l join public.subdivision_blocks b on b.id = l.block_id and b.organization_id = l.organization_id where l.id = p_lot_id and l.organization_id = p_organization_id and l.block_id = p_block_id and b.development_id = p_development_id and l.state = 'draft'::public.party_lifecycle_state and b.state = 'draft'::public.party_lifecycle_state) then raise exception using errcode = '42501', message = 'LOT_PRICE_CONTEXT_DENIED'; end if;
  select p.id, p.version_reference, line.base_price_per_sqm_brl into v_base from public.subdivision_price_base_policies p join public.subdivision_price_base_policy_lines line on line.policy_id = p.id and line.organization_id = p.organization_id and line.lot_id = p_lot_id where p.organization_id = p_organization_id and p.development_id = p_development_id and p.policy_state = 'approved'::public.subdivision_price_base_policy_state and p.exception_count = 0 and p.effective_from <= current_date and (p.effective_until is null or current_date < p.effective_until) order by p.effective_from desc limit 1;
  if v_base.id is null then return jsonb_build_object('state', 'unavailable'); end if;
  select c.* into v_condition from public.subdivision_price_conditions c where c.organization_id = p_organization_id and c.development_id = p_development_id and c.base_policy_id = v_base.id and c.condition_state = 'approved'::public.subdivision_price_base_policy_state and c.effective_from <= current_date and (c.effective_until is null or current_date < c.effective_until) and ((c.scope = 'lot'::public.subdivision_price_condition_scope and c.block_id = p_block_id and c.lot_id = p_lot_id) or (c.scope = 'block'::public.subdivision_price_condition_scope and c.block_id = p_block_id and c.lot_id is null) or (c.scope = 'development'::public.subdivision_price_condition_scope and c.block_id is null and c.lot_id is null)) order by case c.scope when 'lot'::public.subdivision_price_condition_scope then 3 when 'block'::public.subdivision_price_condition_scope then 2 else 1 end desc limit 1;
  v_effective := v_base.base_price_per_sqm_brl;
  if v_condition.id is not null then
    if v_condition.adjustment_kind = 'override_per_sqm'::public.subdivision_price_condition_kind then v_effective := v_condition.amount;
    elsif v_condition.adjustment_kind = 'percentage_adjustment'::public.subdivision_price_condition_kind then v_effective := v_base.base_price_per_sqm_brl * (1 + (v_condition.amount / 100));
    else v_effective := v_base.base_price_per_sqm_brl * (1 - (v_condition.amount / 100)); end if;
  end if;
  return jsonb_build_object('state', 'active', 'policy_reference', v_base.version_reference, 'condition_reference', case when v_condition.id is null then null else v_condition.condition_reference end, 'condition_scope', case when v_condition.id is null then null else v_condition.scope::text end, 'condition_kind', case when v_condition.id is null then null else v_condition.adjustment_kind::text end, 'effective_from', case when v_condition.id is null then null else v_condition.effective_from end, 'effective_until', case when v_condition.id is null then null else v_condition.effective_until end, 'document_state', case when v_condition.id is null then null else v_condition.document_state::text end, 'effective_price_per_sqm_brl', v_effective);
end; $$;

revoke all on function public.subdivision_create_price_condition_v1(uuid, uuid, public.operating_module, text, uuid, uuid, text, public.subdivision_price_condition_scope, uuid, uuid, public.subdivision_price_condition_kind, numeric, date, date, text, public.subdivision_price_condition_document_state, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_price_conditions_v1(uuid, uuid, public.operating_module, text, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_submit_price_condition_v1(uuid, uuid, public.operating_module, text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_approve_price_condition_v1(uuid, uuid, public.operating_module, text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_withdraw_price_condition_v1(uuid, uuid, public.operating_module, text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_get_lot_price_context_v1(uuid, uuid, public.operating_module, text, uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_create_price_condition_v1(uuid, uuid, public.operating_module, text, uuid, uuid, text, public.subdivision_price_condition_scope, uuid, uuid, public.subdivision_price_condition_kind, numeric, date, date, text, public.subdivision_price_condition_document_state, uuid) to service_role;
grant execute on function public.subdivision_list_price_conditions_v1(uuid, uuid, public.operating_module, text, uuid) to service_role;
grant execute on function public.subdivision_submit_price_condition_v1(uuid, uuid, public.operating_module, text, uuid, uuid) to service_role;
grant execute on function public.subdivision_approve_price_condition_v1(uuid, uuid, public.operating_module, text, uuid, uuid) to service_role;
grant execute on function public.subdivision_withdraw_price_condition_v1(uuid, uuid, public.operating_module, text, uuid, uuid) to service_role;
grant execute on function public.subdivision_get_lot_price_context_v1(uuid, uuid, public.operating_module, text, uuid, uuid, uuid) to service_role;

comment on table public.subdivision_price_conditions is 'A231: condições de preço-base auditáveis por empreendimento, Quadra ou Lote. Não são venda, proposta, contrato, recebível, cobrança, pagamento, repasse ou receita.';
