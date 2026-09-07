-- A302: lote interno de parcelas. Não gera boleto bancário, linha digitável, remessa, cobrança, mensagem, baixa ou pagamento.
create type public.subdivision_internal_receivable_batch_state as enum ('released_internal_control', 'reversal_review', 'archived');

create table public.subdivision_internal_receivable_batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  sale_case_id uuid not null,
  contract_preparation_id uuid not null,
  batch_state public.subdivision_internal_receivable_batch_state not null default 'released_internal_control',
  released_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  released_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_internal_receivable_batches_tenant_match unique (id, organization_id),
  constraint subdivision_internal_receivable_batches_case_tenant_fk foreign key (sale_case_id, organization_id) references public.subdivision_sale_cases(id, organization_id) on delete restrict,
  constraint subdivision_internal_receivable_batches_contract_tenant_fk foreign key (contract_preparation_id, organization_id) references public.subdivision_sale_contract_preparations(id, organization_id) on delete restrict,
  constraint subdivision_internal_receivable_batches_contract_unique unique (organization_id, contract_preparation_id),
  constraint subdivision_internal_receivable_batches_case_unique unique (organization_id, sale_case_id)
);
alter table public.subdivision_internal_receivable_batches enable row level security;
revoke all on table public.subdivision_internal_receivable_batches from public, anon, authenticated;

create table public.subdivision_internal_receivable_batch_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  batch_id uuid not null,
  schedule_id uuid not null,
  item_number integer not null check (item_number between 0 and 480),
  due_date date not null,
  amount_cents bigint not null check (amount_cents between 1 and 100000000000000),
  created_at timestamptz not null default now(),
  constraint subdivision_internal_receivable_batch_items_tenant_match unique (id, organization_id),
  constraint subdivision_internal_receivable_batch_items_batch_tenant_fk foreign key (batch_id, organization_id) references public.subdivision_internal_receivable_batches(id, organization_id) on delete restrict,
  constraint subdivision_internal_receivable_batch_items_schedule_tenant_fk foreign key (schedule_id, organization_id) references public.subdivision_sale_receivable_schedules(id, organization_id) on delete restrict,
  constraint subdivision_internal_receivable_batch_items_schedule_unique unique (organization_id, schedule_id),
  constraint subdivision_internal_receivable_batch_items_number_unique unique (organization_id, batch_id, item_number)
);
alter table public.subdivision_internal_receivable_batch_items enable row level security;
revoke all on table public.subdivision_internal_receivable_batch_items from public, anon, authenticated;

create or replace function public.subdivision_approve_sale_case(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_sale_case_id uuid, p_correlation_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_idempotent jsonb; v_case record; v_contract_id uuid; v_batch_id uuid; v_item_count integer; v_result jsonb;
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
  insert into public.subdivision_internal_receivable_batches(organization_id, sale_case_id, contract_preparation_id, batch_state, released_by) values(p_organization_id, p_sale_case_id, v_contract_id, 'released_internal_control', p_actor_user_id) on conflict(organization_id, contract_preparation_id) do update set updated_at = public.subdivision_internal_receivable_batches.updated_at returning id into v_batch_id;
  insert into public.subdivision_internal_receivable_batch_items(organization_id, batch_id, schedule_id, item_number, due_date, amount_cents) select p_organization_id, v_batch_id, schedule.id, schedule.installment_number, schedule.due_date, schedule.amount_cents from public.subdivision_sale_receivable_schedules schedule where schedule.organization_id = p_organization_id and schedule.contract_preparation_id = v_contract_id and schedule.bank_issuance_state <> 'archived' on conflict(organization_id, schedule_id) do nothing;
  update public.subdivision_sale_contract_preparations set state = 'approved', updated_at = now() where id = v_contract_id and organization_id = p_organization_id;
  update public.subdivision_sale_cases set state = 'approved', updated_at = now() where id = p_sale_case_id and organization_id = p_organization_id;
  insert into public.subdivision_lot_commercial_states(organization_id, lot_id, sale_case_id, commercial_state, created_by) values (p_organization_id, v_case.lot_id, p_sale_case_id, 'sold', p_actor_user_id) on conflict(organization_id, lot_id) do update set sale_case_id = excluded.sale_case_id, commercial_state = 'sold', created_by = excluded.created_by, updated_at = now();
  v_result := jsonb_build_object('sale_case_id', p_sale_case_id, 'lot_commercial_state', 'sold', 'contract_state', 'approved', 'internal_batch_released', true, 'scheduled_item_count', v_item_count);
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_approve_sale_case', 'allowed', 'subdivision_sale_case', p_sale_case_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'lot_commercial_state', 'sold', 'contract_state', 'approved', 'dossier_reviewed', true, 'internal_batch_released', true, 'scheduled_item_count', v_item_count, 'result', v_result));
  return v_result;
end; $$;

create function public.subdivision_release_internal_receivable_batch(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_sale_case_id uuid, p_correlation_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_idempotent jsonb; v_contract_id uuid; v_batch_id uuid; v_item_count integer; v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_INTERNAL_BATCH_CONTEXT_DENIED'; end if;
  select event.payload_redacted -> 'result' into v_idempotent from public.admin_audit_events event where event.command_name = 'subdivision_release_internal_receivable_batch' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_idempotent is not null then return v_idempotent; end if;
  select contract.id into v_contract_id from public.subdivision_sale_contract_preparations contract join public.subdivision_sale_cases sale_case on sale_case.id = contract.sale_case_id and sale_case.organization_id = contract.organization_id where contract.sale_case_id = p_sale_case_id and contract.organization_id = p_organization_id and contract.state = 'approved' and sale_case.state = 'approved' for update of contract, sale_case;
  if v_contract_id is null then raise exception using errcode = '42501', message = 'SUBDIVISION_INTERNAL_BATCH_APPROVAL_DENIED'; end if;
  select count(*)::integer into v_item_count from public.subdivision_sale_receivable_schedules schedule where schedule.organization_id = p_organization_id and schedule.contract_preparation_id = v_contract_id and schedule.bank_issuance_state <> 'archived';
  if v_item_count = 0 then raise exception using errcode = '42501', message = 'SUBDIVISION_INTERNAL_BATCH_SCHEDULE_DENIED'; end if;
  insert into public.subdivision_internal_receivable_batches(organization_id, sale_case_id, contract_preparation_id, batch_state, released_by) values(p_organization_id, p_sale_case_id, v_contract_id, 'released_internal_control', p_actor_user_id) on conflict(organization_id, contract_preparation_id) do update set updated_at = public.subdivision_internal_receivable_batches.updated_at returning id into v_batch_id;
  insert into public.subdivision_internal_receivable_batch_items(organization_id, batch_id, schedule_id, item_number, due_date, amount_cents) select p_organization_id, v_batch_id, schedule.id, schedule.installment_number, schedule.due_date, schedule.amount_cents from public.subdivision_sale_receivable_schedules schedule where schedule.organization_id = p_organization_id and schedule.contract_preparation_id = v_contract_id and schedule.bank_issuance_state <> 'archived' on conflict(organization_id, schedule_id) do nothing;
  v_result := jsonb_build_object('sale_case_id', p_sale_case_id, 'internal_batch_released', true, 'scheduled_item_count', v_item_count);
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_release_internal_receivable_batch', 'allowed', 'subdivision_internal_receivable_batch', v_batch_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'internal_batch_released', true, 'scheduled_item_count', v_item_count, 'result', v_result));
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
  v_result := jsonb_build_object('sale_case_id', p_sale_case_id, 'lot_commercial_state', 'reversal_review', 'contract_state', 'approved', 'internal_batch_state', 'reversal_review');
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_request_sale_reversal', 'allowed', 'subdivision_sale_case', p_sale_case_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'lot_commercial_state', 'reversal_review', 'internal_batch_state', 'reversal_review', 'result', v_result)); return v_result;
end; $$;

create function public.subdivision_list_internal_receivable_batches(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text) returns table(batch_id uuid, sale_case_id uuid, contract_preparation_id uuid, batch_state public.subdivision_internal_receivable_batch_state, item_count integer, total_cents bigint, released_at timestamptz, updated_at timestamptz) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query select batch.id, batch.sale_case_id, batch.contract_preparation_id, batch.batch_state, count(item.id)::integer, coalesce(sum(item.amount_cents), 0)::bigint, batch.released_at, batch.updated_at from public.subdivision_internal_receivable_batches batch left join public.subdivision_internal_receivable_batch_items item on item.batch_id = batch.id and item.organization_id = batch.organization_id where batch.organization_id = p_organization_id and batch.batch_state <> 'archived' group by batch.id order by batch.released_at desc, batch.id;
end; $$;

revoke all on function public.subdivision_approve_sale_case(uuid,uuid,public.operating_module,text,uuid,uuid), public.subdivision_release_internal_receivable_batch(uuid,uuid,public.operating_module,text,uuid,uuid), public.subdivision_request_sale_reversal(uuid,uuid,public.operating_module,text,uuid,uuid), public.subdivision_list_internal_receivable_batches(uuid,uuid,public.operating_module,text) from public, anon, authenticated;
grant execute on function public.subdivision_approve_sale_case(uuid,uuid,public.operating_module,text,uuid,uuid), public.subdivision_release_internal_receivable_batch(uuid,uuid,public.operating_module,text,uuid,uuid), public.subdivision_request_sale_reversal(uuid,uuid,public.operating_module,text,uuid,uuid), public.subdivision_list_internal_receivable_batches(uuid,uuid,public.operating_module,text) to service_role;
