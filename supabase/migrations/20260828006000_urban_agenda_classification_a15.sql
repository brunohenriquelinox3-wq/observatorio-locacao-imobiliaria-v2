-- A15 — Classificação interna de agenda urbana em rascunho.
-- Sem comunicação, calendário externo, visita confirmada, proposta, reserva, contrato ou financeiro.

create type public.urban_agenda_classification as enum ('lead_review', 'context_preparation', 'internal_follow_up');

alter table public.urban_lead_agendas
  add constraint urban_lead_agendas_tenant_match unique (id, organization_id);

create table public.urban_lead_agenda_classifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  agenda_id uuid not null,
  classification public.urban_agenda_classification not null,
  internal_code text,
  state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint urban_lead_agenda_classifications_code check (internal_code is null or internal_code ~ '^[A-Z][A-Z0-9_]{2,79}$'),
  constraint urban_lead_agenda_classifications_agenda_tenant_fk foreign key (agenda_id, organization_id)
    references public.urban_lead_agendas (id, organization_id) on delete restrict,
  constraint urban_lead_agenda_classifications_agenda_unique unique (organization_id, agenda_id),
  constraint urban_lead_agenda_classifications_tenant_match unique (id, organization_id)
);
create index urban_lead_agenda_classifications_context_lookup on public.urban_lead_agenda_classifications (organization_id, state, classification, updated_at desc);

alter table public.urban_lead_agenda_classifications enable row level security;
revoke all on table public.urban_lead_agenda_classifications from public, anon, authenticated;

create or replace function public.urban_upsert_draft_agenda_classification(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_agenda_id uuid,
  p_classification public.urban_agenda_classification,
  p_internal_code text,
  p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_classification_id uuid; v_agenda_state public.urban_agenda_state;
begin
  perform private.require_urban_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'urban_upsert_draft_agenda_classification' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  select agenda.state into v_agenda_state from public.urban_lead_agendas agenda
  join public.urban_leads lead on lead.id = agenda.lead_id and lead.organization_id = agenda.organization_id
  where agenda.id = p_agenda_id and agenda.organization_id = p_organization_id and agenda.state in ('scheduled', 'rescheduled') and lead.state = 'draft';
  if v_agenda_state is null then
    raise exception using errcode = '42501', message = 'URBAN_AGENDA_CLASSIFICATION_STATE_DENIED';
  end if;
  insert into public.urban_lead_agenda_classifications (organization_id, agenda_id, classification, internal_code, state, created_by)
  values (p_organization_id, p_agenda_id, p_classification, nullif(trim(p_internal_code), ''), 'draft', p_actor_user_id)
  on conflict (organization_id, agenda_id) do update set classification = excluded.classification, internal_code = excluded.internal_code,
    updated_at = now(), created_by = excluded.created_by
  returning id into v_classification_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'urban_upsert_draft_agenda_classification', 'allowed', 'urban_lead_agenda_classification', v_classification_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'classification', p_classification::text,
      'internal_code_present', nullif(trim(p_internal_code), '') is not null));
  return v_classification_id;
end; $$;

create or replace function public.urban_list_draft_agenda_classifications(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table (
  classification_id uuid,
  agenda_id uuid,
  classification public.urban_agenda_classification,
  internal_code_present boolean,
  updated_at timestamptz
)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_urban_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query
  select classified.id, classified.agenda_id, classified.classification, classified.internal_code is not null, classified.updated_at
  from public.urban_lead_agenda_classifications classified
  join public.urban_lead_agendas agenda on agenda.id = classified.agenda_id and agenda.organization_id = classified.organization_id
  join public.urban_leads lead on lead.id = agenda.lead_id and lead.organization_id = agenda.organization_id
  where classified.organization_id = p_organization_id and classified.state = 'draft' and agenda.state in ('scheduled', 'rescheduled') and lead.state = 'draft'
  order by classified.updated_at desc, classified.id asc;
end; $$;

revoke all on function public.urban_upsert_draft_agenda_classification(uuid, uuid, public.operating_module, text, uuid, public.urban_agenda_classification, text, uuid) from public, anon, authenticated;
revoke all on function public.urban_list_draft_agenda_classifications(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.urban_upsert_draft_agenda_classification(uuid, uuid, public.operating_module, text, uuid, public.urban_agenda_classification, text, uuid) to service_role;
grant execute on function public.urban_list_draft_agenda_classifications(uuid, uuid, public.operating_module, text) to service_role;

comment on table public.urban_lead_agenda_classifications is 'A15: classificação interna de agenda urbana em rascunho; não gera comunicação, calendário externo, visita, proposta, contrato ou financeiro.';
