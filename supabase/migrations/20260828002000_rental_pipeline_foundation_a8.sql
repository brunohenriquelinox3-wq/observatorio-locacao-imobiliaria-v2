-- A8 — Entrada, qualificação e agenda de Locação.
-- Sem contrato de administração, contrato de locação, garantia, cobrança, repasse, documento ou financeiro.

create type public.rental_journey_kind as enum ('management_interest', 'tenant_interest');
create type public.rental_intake_stage as enum ('intake', 'qualification', 'agenda_pending', 'scheduled', 'closed_lost');
create type public.rental_agenda_state as enum ('scheduled', 'rescheduled', 'cancelled', 'occurred', 'not_held');

create table public.rental_intakes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  party_id uuid not null,
  journey_kind public.rental_journey_kind not null,
  source_code text not null check (source_code ~ '^[A-Z][A-Z0-9_]{2,79}$'),
  stage public.rental_intake_stage not null default 'intake',
  state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rental_intakes_party_tenant_fk foreign key (party_id, organization_id)
    references public.party_records (id, organization_id) on delete restrict,
  constraint rental_intakes_tenant_match unique (id, organization_id)
);
create index rental_intakes_context_lookup on public.rental_intakes (organization_id, journey_kind, stage, state, created_at desc);

create table public.rental_intake_stage_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  intake_id uuid not null,
  from_stage public.rental_intake_stage,
  to_stage public.rental_intake_stage not null,
  reason_code text,
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  occurred_at timestamptz not null default now(),
  constraint rental_intake_stage_events_tenant_fk foreign key (intake_id, organization_id)
    references public.rental_intakes (id, organization_id) on delete restrict,
  constraint rental_intake_stage_events_reason check (to_stage <> 'closed_lost' or reason_code is not null)
);
create index rental_intake_stage_events_lookup on public.rental_intake_stage_events (organization_id, intake_id, occurred_at desc);

create table public.rental_intake_agendas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  intake_id uuid not null,
  scheduled_for timestamptz not null,
  state public.rental_agenda_state not null default 'scheduled',
  reason_code text,
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rental_intake_agendas_tenant_fk foreign key (intake_id, organization_id)
    references public.rental_intakes (id, organization_id) on delete restrict,
  constraint rental_intake_agendas_reason check (state not in ('cancelled', 'not_held') or reason_code is not null)
);
create index rental_intake_agendas_lookup on public.rental_intake_agendas (organization_id, intake_id, state, scheduled_for asc);

alter table public.rental_intakes enable row level security;
alter table public.rental_intake_stage_events enable row level security;
alter table public.rental_intake_agendas enable row level security;
revoke all on table public.rental_intakes from public, anon, authenticated;
revoke all on table public.rental_intake_stage_events from public, anon, authenticated;
revoke all on table public.rental_intake_agendas from public, anon, authenticated;

create or replace function private.require_rental_pipeline_authority(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_module <> 'locacao'::public.operating_module then
    raise exception using errcode = '42501', message = 'RENTAL_MODULE_DENIED';
  end if;
  perform private.require_domain_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
end; $$;

create or replace function public.rental_create_draft_intake(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_party_id uuid, p_journey_kind public.rental_journey_kind, p_source_code text, p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_intake_id uuid;
begin
  perform private.require_rental_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'rental_create_draft_intake' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  if not exists (select 1 from public.party_records party where party.id = p_party_id and party.organization_id = p_organization_id and party.state = 'draft') then
    raise exception using errcode = '42501', message = 'RENTAL_PARTY_CONTEXT_DENIED';
  end if;
  insert into public.rental_intakes (organization_id, party_id, journey_kind, source_code, stage, state, created_by)
  values (p_organization_id, p_party_id, p_journey_kind, trim(p_source_code), 'intake', 'draft', p_actor_user_id)
  returning id into v_intake_id;
  insert into public.rental_intake_stage_events (organization_id, intake_id, from_stage, to_stage, created_by)
  values (p_organization_id, v_intake_id, null, 'intake', p_actor_user_id);
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'rental_create_draft_intake', 'allowed', 'rental_intake', v_intake_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'journey_kind', p_journey_kind::text, 'source_code', trim(p_source_code)));
  return v_intake_id;
end; $$;

create or replace function public.rental_transition_draft_intake(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_intake_id uuid, p_next_stage public.rental_intake_stage, p_reason_code text, p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_current_stage public.rental_intake_stage; v_event_id uuid;
begin
  perform private.require_rental_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'rental_transition_draft_intake' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  select intake.stage into v_current_stage from public.rental_intakes intake where intake.id = p_intake_id and intake.organization_id = p_organization_id and intake.state = 'draft';
  if v_current_stage is null then raise exception using errcode = '42501', message = 'RENTAL_INTAKE_CONTEXT_DENIED'; end if;
  if not ((v_current_stage = 'intake' and p_next_stage in ('qualification', 'closed_lost'))
    or (v_current_stage = 'qualification' and p_next_stage in ('agenda_pending', 'closed_lost'))
    or (v_current_stage = 'agenda_pending' and p_next_stage in ('scheduled', 'closed_lost'))
    or (v_current_stage = 'scheduled' and p_next_stage in ('qualification', 'closed_lost'))) then
    raise exception using errcode = '42501', message = 'RENTAL_STAGE_TRANSITION_DENIED';
  end if;
  if p_next_stage = 'closed_lost' and nullif(trim(p_reason_code), '') is null then raise exception using errcode = '42501', message = 'RENTAL_STAGE_REASON_REQUIRED'; end if;
  update public.rental_intakes set stage = p_next_stage, updated_at = now() where id = p_intake_id and organization_id = p_organization_id;
  insert into public.rental_intake_stage_events (organization_id, intake_id, from_stage, to_stage, reason_code, created_by)
  values (p_organization_id, p_intake_id, v_current_stage, p_next_stage, nullif(trim(p_reason_code), ''), p_actor_user_id) returning id into v_event_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'rental_transition_draft_intake', 'allowed', 'rental_intake_stage_event', v_event_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'from_stage', v_current_stage::text, 'to_stage', p_next_stage::text, 'reason_present', p_reason_code is not null));
  return v_event_id;
end; $$;

create or replace function public.rental_create_draft_agenda(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_intake_id uuid, p_scheduled_for timestamptz, p_state public.rental_agenda_state, p_reason_code text, p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_agenda_id uuid;
begin
  perform private.require_rental_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'rental_create_draft_agenda' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  if not exists (select 1 from public.rental_intakes intake where intake.id = p_intake_id and intake.organization_id = p_organization_id and intake.state = 'draft' and intake.stage in ('qualification', 'agenda_pending', 'scheduled')) then
    raise exception using errcode = '42501', message = 'RENTAL_AGENDA_INTAKE_DENIED';
  end if;
  if p_state in ('cancelled', 'not_held') and nullif(trim(p_reason_code), '') is null then raise exception using errcode = '42501', message = 'RENTAL_AGENDA_REASON_REQUIRED'; end if;
  insert into public.rental_intake_agendas (organization_id, intake_id, scheduled_for, state, reason_code, created_by)
  values (p_organization_id, p_intake_id, p_scheduled_for, p_state, nullif(trim(p_reason_code), ''), p_actor_user_id)
  returning id into v_agenda_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'rental_create_draft_agenda', 'allowed', 'rental_intake_agenda', v_agenda_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'state', p_state::text, 'reason_present', p_reason_code is not null));
  return v_agenda_id;
end; $$;

revoke all on function private.require_rental_pipeline_authority(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
revoke all on function public.rental_create_draft_intake(uuid, uuid, public.operating_module, text, uuid, public.rental_journey_kind, text, uuid) from public, anon, authenticated;
revoke all on function public.rental_transition_draft_intake(uuid, uuid, public.operating_module, text, uuid, public.rental_intake_stage, text, uuid) from public, anon, authenticated;
revoke all on function public.rental_create_draft_agenda(uuid, uuid, public.operating_module, text, uuid, timestamptz, public.rental_agenda_state, text, uuid) from public, anon, authenticated;
grant execute on function public.rental_create_draft_intake(uuid, uuid, public.operating_module, text, uuid, public.rental_journey_kind, text, uuid) to service_role;
grant execute on function public.rental_transition_draft_intake(uuid, uuid, public.operating_module, text, uuid, public.rental_intake_stage, text, uuid) to service_role;
grant execute on function public.rental_create_draft_agenda(uuid, uuid, public.operating_module, text, uuid, timestamptz, public.rental_agenda_state, text, uuid) to service_role;

comment on table public.rental_intakes is 'A8: entrada de administração ou locatário em rascunho; não é contrato, garantia, cobrança, repasse ou financeiro.';
comment on table public.rental_intake_stage_events is 'A8: histórico de etapa com motivo codificado; não armazena dossiê, análise, score ou decisão automatizada.';
comment on table public.rental_intake_agendas is 'A8: compromisso interno de locação; não integra calendário externo, envia comunicação ou confirma visita.';
