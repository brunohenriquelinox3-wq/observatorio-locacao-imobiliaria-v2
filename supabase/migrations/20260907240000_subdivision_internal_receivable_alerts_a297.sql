-- A297: lembretes internos da agenda. Não emite boleto, não cobra, não envia mensagens e não infere pagamento.
create type public.subdivision_internal_receivable_alert_kind as enum ('upcoming_due', 'past_due_unreconciled');
create table public.subdivision_internal_receivable_alert_configurations (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null unique references public.organizations(id) on delete restrict,
  lead_days integer not null default 4 check (lead_days between 1 and 14), enabled boolean not null default false,
  schedule_cron_task_uid varchar(65) null unique, created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.subdivision_internal_receivable_alert_events (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  receivable_schedule_id uuid not null, alert_kind public.subdivision_internal_receivable_alert_kind not null, attention_date date not null,
  created_at timestamptz not null default now(),
  constraint subdivision_internal_receivable_alert_events_schedule_tenant_fk foreign key (receivable_schedule_id, organization_id) references public.subdivision_sale_receivable_schedules(id, organization_id) on delete restrict,
  constraint subdivision_internal_receivable_alert_event_unique unique (organization_id, receivable_schedule_id, alert_kind, attention_date)
);
alter table public.subdivision_internal_receivable_alert_configurations enable row level security;
alter table public.subdivision_internal_receivable_alert_events enable row level security;
revoke all on table public.subdivision_internal_receivable_alert_configurations, public.subdivision_internal_receivable_alert_events from public, anon, authenticated;

create function public.subdivision_configure_internal_receivable_alerts(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_lead_days integer, p_correlation_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_existing jsonb; v_configuration_id uuid; v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' or p_lead_days not between 1 and 14 then raise exception using errcode = '42501', message = 'SUBDIVISION_RECEIVABLE_ALERT_CONFIGURATION_DENIED'; end if;
  select event.payload_redacted -> 'result' into v_existing from public.admin_audit_events event where event.command_name = 'subdivision_configure_internal_receivable_alerts' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  insert into public.subdivision_internal_receivable_alert_configurations(organization_id, lead_days, enabled, created_by) values (p_organization_id, p_lead_days, false, p_actor_user_id) on conflict(organization_id) do update set lead_days = excluded.lead_days, enabled = false, created_by = excluded.created_by, updated_at = now() returning id into v_configuration_id;
  v_result := jsonb_build_object('configuration_id', v_configuration_id, 'lead_days', p_lead_days, 'enabled', false, 'schedule_bound', false);
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_configure_internal_receivable_alerts', 'allowed', 'subdivision_internal_receivable_alert_configuration', v_configuration_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'lead_days', p_lead_days, 'enabled', false, 'result', v_result));
  return v_result;
end; $$;

create function public.subdivision_bind_internal_receivable_alert_schedule(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_schedule_cron_task_uid varchar, p_correlation_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_configuration_id uuid; v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' or p_schedule_cron_task_uid is null or char_length(trim(p_schedule_cron_task_uid)) = 0 then raise exception using errcode = '42501', message = 'SUBDIVISION_RECEIVABLE_ALERT_BIND_DENIED'; end if;
  update public.subdivision_internal_receivable_alert_configurations set schedule_cron_task_uid = trim(p_schedule_cron_task_uid), enabled = true, updated_at = now() where organization_id = p_organization_id returning id into v_configuration_id;
  if v_configuration_id is null then raise exception using errcode = '42501', message = 'SUBDIVISION_RECEIVABLE_ALERT_CONFIGURATION_DENIED'; end if;
  v_result := jsonb_build_object('configuration_id', v_configuration_id, 'enabled', true, 'schedule_bound', true);
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_bind_internal_receivable_alert_schedule', 'allowed', 'subdivision_internal_receivable_alert_configuration', v_configuration_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'enabled', true, 'schedule_bound', true, 'result', v_result));
  return v_result;
end; $$;

create function public.subdivision_run_internal_receivable_alerts(p_schedule_cron_task_uid varchar) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_configuration record; v_inserted integer;
begin
  select * into v_configuration from public.subdivision_internal_receivable_alert_configurations configuration where configuration.schedule_cron_task_uid = p_schedule_cron_task_uid and configuration.enabled = true for update;
  if v_configuration.id is null then return jsonb_build_object('ok', true, 'skipped', 'orphan_or_disabled'); end if;
  insert into public.subdivision_internal_receivable_alert_events(organization_id, receivable_schedule_id, alert_kind, attention_date)
  select schedule.organization_id, schedule.id, case when schedule.due_date < current_date then 'past_due_unreconciled'::public.subdivision_internal_receivable_alert_kind else 'upcoming_due'::public.subdivision_internal_receivable_alert_kind end, current_date
  from public.subdivision_sale_receivable_schedules schedule join public.subdivision_sale_contract_preparations contract on contract.id = schedule.contract_preparation_id and contract.organization_id = schedule.organization_id
  where schedule.organization_id = v_configuration.organization_id and schedule.bank_issuance_state = 'awaiting_bank_issue' and contract.state = 'approved' and ((schedule.due_date between current_date and current_date + v_configuration.lead_days) or schedule.due_date < current_date)
  on conflict (organization_id, receivable_schedule_id, alert_kind, attention_date) do nothing;
  get diagnostics v_inserted = row_count;
  return jsonb_build_object('ok', true, 'inserted_event_count', v_inserted, 'attention_date', current_date);
end; $$;
revoke all on function public.subdivision_configure_internal_receivable_alerts(uuid,uuid,public.operating_module,text,integer,uuid), public.subdivision_bind_internal_receivable_alert_schedule(uuid,uuid,public.operating_module,text,varchar,uuid), public.subdivision_run_internal_receivable_alerts(varchar) from public, anon, authenticated;
grant execute on function public.subdivision_configure_internal_receivable_alerts(uuid,uuid,public.operating_module,text,integer,uuid), public.subdivision_bind_internal_receivable_alert_schedule(uuid,uuid,public.operating_module,text,varchar,uuid), public.subdivision_run_internal_receivable_alerts(varchar) to service_role;
