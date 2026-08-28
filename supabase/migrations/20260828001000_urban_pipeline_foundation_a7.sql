-- A7 — Origem, qualificação e agenda de Vendas Urbanas.
-- Sem contato, score, distribuição automática, proposta, reserva, contrato, anúncio ou financeiro.

create type public.urban_lead_stage as enum ('intake', 'qualification', 'agenda_pending', 'scheduled', 'closed_lost');
create type public.urban_agenda_state as enum ('scheduled', 'rescheduled', 'cancelled', 'occurred', 'not_held');

create table public.urban_leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  party_id uuid not null,
  source_code text not null check (source_code ~ '^[A-Z][A-Z0-9_]{2,79}$'),
  interest_kind text not null check (interest_kind in ('urban_asset', 'search_profile', 'unspecified')),
  stage public.urban_lead_stage not null default 'intake',
  state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint urban_leads_party_tenant_fk foreign key (party_id, organization_id)
    references public.party_records (id, organization_id) on delete restrict,
  constraint urban_leads_tenant_match unique (id, organization_id)
);
create index urban_leads_context_lookup on public.urban_leads (organization_id, stage, state, created_at desc);

create table public.urban_lead_stage_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid not null,
  from_stage public.urban_lead_stage,
  to_stage public.urban_lead_stage not null,
  reason_code text,
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  occurred_at timestamptz not null default now(),
  constraint urban_lead_stage_events_tenant_fk foreign key (lead_id, organization_id)
    references public.urban_leads (id, organization_id) on delete restrict,
  constraint urban_lead_stage_events_reason check (to_stage <> 'closed_lost' or reason_code is not null)
);
create index urban_lead_stage_events_lookup on public.urban_lead_stage_events (organization_id, lead_id, occurred_at desc);

create table public.urban_lead_agendas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid not null,
  scheduled_for timestamptz not null,
  state public.urban_agenda_state not null default 'scheduled',
  reason_code text,
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint urban_lead_agendas_tenant_fk foreign key (lead_id, organization_id)
    references public.urban_leads (id, organization_id) on delete restrict,
  constraint urban_lead_agendas_reason check (state not in ('cancelled', 'not_held') or reason_code is not null)
);
create index urban_lead_agendas_lookup on public.urban_lead_agendas (organization_id, lead_id, state, scheduled_for asc);

alter table public.urban_leads enable row level security;
alter table public.urban_lead_stage_events enable row level security;
alter table public.urban_lead_agendas enable row level security;
revoke all on table public.urban_leads from public, anon, authenticated;
revoke all on table public.urban_lead_stage_events from public, anon, authenticated;
revoke all on table public.urban_lead_agendas from public, anon, authenticated;

create or replace function private.require_urban_pipeline_authority(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_module <> 'vendas_urbanas'::public.operating_module then
    raise exception using errcode = '42501', message = 'URBAN_MODULE_DENIED';
  end if;
  perform private.require_domain_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
end; $$;

create or replace function public.urban_create_draft_lead(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_party_id uuid, p_source_code text, p_interest_kind text, p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_lead_id uuid;
begin
  perform private.require_urban_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'urban_create_draft_lead' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  if not exists (select 1 from public.party_records party where party.id = p_party_id and party.organization_id = p_organization_id and party.state = 'draft') then
    raise exception using errcode = '42501', message = 'URBAN_PARTY_CONTEXT_DENIED';
  end if;
  if p_interest_kind not in ('urban_asset', 'search_profile', 'unspecified') then
    raise exception using errcode = '42501', message = 'URBAN_INTEREST_DENIED';
  end if;
  insert into public.urban_leads (organization_id, party_id, source_code, interest_kind, stage, state, created_by)
  values (p_organization_id, p_party_id, trim(p_source_code), p_interest_kind, 'intake', 'draft', p_actor_user_id)
  returning id into v_lead_id;
  insert into public.urban_lead_stage_events (organization_id, lead_id, from_stage, to_stage, created_by)
  values (p_organization_id, v_lead_id, null, 'intake', p_actor_user_id);
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'urban_create_draft_lead', 'allowed', 'urban_lead', v_lead_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'source_code', trim(p_source_code), 'interest_kind', p_interest_kind));
  return v_lead_id;
end; $$;

create or replace function public.urban_transition_draft_lead(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_lead_id uuid, p_next_stage public.urban_lead_stage, p_reason_code text, p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_current_stage public.urban_lead_stage; v_event_id uuid;
begin
  perform private.require_urban_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'urban_transition_draft_lead' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  select lead.stage into v_current_stage from public.urban_leads lead where lead.id = p_lead_id and lead.organization_id = p_organization_id and lead.state = 'draft';
  if v_current_stage is null then raise exception using errcode = '42501', message = 'URBAN_LEAD_CONTEXT_DENIED'; end if;
  if not ((v_current_stage = 'intake' and p_next_stage in ('qualification', 'closed_lost'))
    or (v_current_stage = 'qualification' and p_next_stage in ('agenda_pending', 'closed_lost'))
    or (v_current_stage = 'agenda_pending' and p_next_stage in ('scheduled', 'closed_lost'))
    or (v_current_stage = 'scheduled' and p_next_stage in ('qualification', 'closed_lost'))) then
    raise exception using errcode = '42501', message = 'URBAN_STAGE_TRANSITION_DENIED';
  end if;
  if p_next_stage = 'closed_lost' and nullif(trim(p_reason_code), '') is null then raise exception using errcode = '42501', message = 'URBAN_STAGE_REASON_REQUIRED'; end if;
  update public.urban_leads set stage = p_next_stage, updated_at = now() where id = p_lead_id and organization_id = p_organization_id;
  insert into public.urban_lead_stage_events (organization_id, lead_id, from_stage, to_stage, reason_code, created_by)
  values (p_organization_id, p_lead_id, v_current_stage, p_next_stage, nullif(trim(p_reason_code), ''), p_actor_user_id) returning id into v_event_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'urban_transition_draft_lead', 'allowed', 'urban_lead_stage_event', v_event_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'from_stage', v_current_stage::text, 'to_stage', p_next_stage::text, 'reason_present', p_reason_code is not null));
  return v_event_id;
end; $$;

create or replace function public.urban_create_draft_agenda(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_lead_id uuid, p_scheduled_for timestamptz, p_state public.urban_agenda_state, p_reason_code text, p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_agenda_id uuid;
begin
  perform private.require_urban_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'urban_create_draft_agenda' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  if not exists (select 1 from public.urban_leads lead where lead.id = p_lead_id and lead.organization_id = p_organization_id and lead.state = 'draft' and lead.stage in ('qualification', 'agenda_pending', 'scheduled')) then
    raise exception using errcode = '42501', message = 'URBAN_AGENDA_LEAD_DENIED';
  end if;
  if p_state in ('cancelled', 'not_held') and nullif(trim(p_reason_code), '') is null then raise exception using errcode = '42501', message = 'URBAN_AGENDA_REASON_REQUIRED'; end if;
  insert into public.urban_lead_agendas (organization_id, lead_id, scheduled_for, state, reason_code, created_by)
  values (p_organization_id, p_lead_id, p_scheduled_for, p_state, nullif(trim(p_reason_code), ''), p_actor_user_id)
  returning id into v_agenda_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'urban_create_draft_agenda', 'allowed', 'urban_lead_agenda', v_agenda_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'state', p_state::text, 'reason_present', p_reason_code is not null));
  return v_agenda_id;
end; $$;

revoke all on function private.require_urban_pipeline_authority(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
revoke all on function public.urban_create_draft_lead(uuid, uuid, public.operating_module, text, uuid, text, text, uuid) from public, anon, authenticated;
revoke all on function public.urban_transition_draft_lead(uuid, uuid, public.operating_module, text, uuid, public.urban_lead_stage, text, uuid) from public, anon, authenticated;
revoke all on function public.urban_create_draft_agenda(uuid, uuid, public.operating_module, text, uuid, timestamptz, public.urban_agenda_state, text, uuid) from public, anon, authenticated;
grant execute on function public.urban_create_draft_lead(uuid, uuid, public.operating_module, text, uuid, text, text, uuid) to service_role;
grant execute on function public.urban_transition_draft_lead(uuid, uuid, public.operating_module, text, uuid, public.urban_lead_stage, text, uuid) to service_role;
grant execute on function public.urban_create_draft_agenda(uuid, uuid, public.operating_module, text, uuid, timestamptz, public.urban_agenda_state, text, uuid) to service_role;

comment on table public.urban_leads is 'A7: lead urbano de rascunho; não é proposta, reserva, contrato, publicação ou financeiro.';
comment on table public.urban_lead_stage_events is 'A7: histórico de etapa com motivo codificado; não armazena nota livre, score ou decisão automatizada.';
comment on table public.urban_lead_agendas is 'A7: compromisso interno de agenda; não integra calendário externo nem envia comunicação.';
