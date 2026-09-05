-- A206 — dossiê progressivo de identificação do loteamento.
-- Amplia o rascunho interno sem endereço preciso, matrícula, processo, pessoa, preço, venda, contrato ou financeiro.

alter type public.subdivision_development_attachment_category add value if not exists 'identity';

create type public.subdivision_development_parceling_mode as enum (
  'loteamento',
  'desmembramento',
  'condominio_lotes',
  'acesso_controlado',
  'other',
  'to_review'
);

create type public.subdivision_development_territorial_context as enum (
  'urban',
  'urban_expansion',
  'specific_urbanization',
  'to_review'
);

create type public.subdivision_development_predominant_use as enum (
  'residential',
  'mixed_use',
  'commercial',
  'industrial',
  'institutional',
  'to_review'
);

alter table public.subdivision_developments
  add column parceling_mode public.subdivision_development_parceling_mode,
  add column territorial_context public.subdivision_development_territorial_context,
  add column predominant_use public.subdivision_development_predominant_use,
  add column territorial_reference text,
  add column identification_note text;

alter table public.subdivision_developments
  add constraint subdivision_developments_territorial_reference_length check (territorial_reference is null or char_length(trim(territorial_reference)) between 2 and 120),
  add constraint subdivision_developments_identification_note_length check (identification_note is null or char_length(trim(identification_note)) <= 600);

create or replace function public.subdivision_create_draft_development_v3(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_internal_reference text,
  p_display_name text,
  p_development_kind public.subdivision_development_kind,
  p_municipality text,
  p_state_code text,
  p_planned_stage_count integer,
  p_working_phase public.subdivision_development_phase,
  p_internal_note text,
  p_parceling_mode public.subdivision_development_parceling_mode,
  p_territorial_context public.subdivision_development_territorial_context,
  p_predominant_use public.subdivision_development_predominant_use,
  p_territorial_reference text,
  p_identification_note text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_target uuid;
  v_development_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'subdivision_create_draft_development_v3'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;

  insert into public.subdivision_developments (
    organization_id, internal_reference, display_name, development_kind, municipality, state_code,
    planned_stage_count, working_phase, internal_note, parceling_mode, territorial_context,
    predominant_use, territorial_reference, identification_note, state, created_by
  ) values (
    p_organization_id, trim(p_internal_reference), trim(p_display_name), p_development_kind,
    nullif(trim(p_municipality), ''), nullif(trim(p_state_code), ''), p_planned_stage_count,
    p_working_phase, nullif(trim(p_internal_note), ''), p_parceling_mode, p_territorial_context,
    p_predominant_use, nullif(trim(p_territorial_reference), ''), nullif(trim(p_identification_note), ''),
    'draft', p_actor_user_id
  ) returning id into v_development_id;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_create_draft_development_v3', 'allowed', 'subdivision_development', v_development_id,
    jsonb_build_object(
      'module', p_module::text,
      'purpose_code', trim(p_purpose_code),
      'development_kind', p_development_kind::text,
      'parceling_mode', p_parceling_mode::text,
      'territorial_context', p_territorial_context::text,
      'predominant_use', p_predominant_use::text,
      'municipality_present', p_municipality is not null,
      'territorial_reference_present', p_territorial_reference is not null,
      'planned_stage_count', p_planned_stage_count,
      'internal_note_present', p_internal_note is not null,
      'identification_note_present', p_identification_note is not null
    )
  );
  return v_development_id;
end;
$$;

create or replace function public.subdivision_update_draft_development_v3(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid,
  p_internal_reference text,
  p_display_name text,
  p_development_kind public.subdivision_development_kind,
  p_municipality text,
  p_state_code text,
  p_planned_stage_count integer,
  p_working_phase public.subdivision_development_phase,
  p_internal_note text,
  p_parceling_mode public.subdivision_development_parceling_mode,
  p_territorial_context public.subdivision_development_territorial_context,
  p_predominant_use public.subdivision_development_predominant_use,
  p_territorial_reference text,
  p_identification_note text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_target uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'subdivision_update_draft_development_v3'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;

  update public.subdivision_developments development
  set internal_reference = trim(p_internal_reference),
      display_name = trim(p_display_name),
      development_kind = p_development_kind,
      municipality = nullif(trim(p_municipality), ''),
      state_code = nullif(trim(p_state_code), ''),
      planned_stage_count = p_planned_stage_count,
      working_phase = p_working_phase,
      internal_note = nullif(trim(p_internal_note), ''),
      parceling_mode = p_parceling_mode,
      territorial_context = p_territorial_context,
      predominant_use = p_predominant_use,
      territorial_reference = nullif(trim(p_territorial_reference), ''),
      identification_note = nullif(trim(p_identification_note), ''),
      updated_at = now()
  where development.id = p_development_id
    and development.organization_id = p_organization_id
    and development.state = 'draft';
  if not found then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED';
  end if;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_update_draft_development_v3', 'allowed', 'subdivision_development', p_development_id,
    jsonb_build_object(
      'module', p_module::text,
      'purpose_code', trim(p_purpose_code),
      'development_kind', p_development_kind::text,
      'parceling_mode', p_parceling_mode::text,
      'territorial_context', p_territorial_context::text,
      'predominant_use', p_predominant_use::text,
      'municipality_present', p_municipality is not null,
      'territorial_reference_present', p_territorial_reference is not null,
      'planned_stage_count', p_planned_stage_count,
      'internal_note_present', p_internal_note is not null,
      'identification_note_present', p_identification_note is not null
    )
  );
  return p_development_id;
end;
$$;

create or replace function public.subdivision_list_draft_developments_v3(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table(
  development_id uuid,
  internal_reference text,
  display_name text,
  development_kind public.subdivision_development_kind,
  municipality text,
  state_code text,
  planned_stage_count integer,
  working_phase public.subdivision_development_phase,
  internal_note text,
  parceling_mode public.subdivision_development_parceling_mode,
  territorial_context public.subdivision_development_territorial_context,
  predominant_use public.subdivision_development_predominant_use,
  territorial_reference text,
  identification_note text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query
  select development.id, development.internal_reference, development.display_name, development.development_kind,
    development.municipality, development.state_code, development.planned_stage_count, development.working_phase,
    development.internal_note, development.parceling_mode, development.territorial_context, development.predominant_use,
    development.territorial_reference, development.identification_note, development.created_at, development.updated_at
  from public.subdivision_developments development
  where development.organization_id = p_organization_id and development.state = 'draft'
  order by development.updated_at desc, development.id asc;
end;
$$;

revoke all on function public.subdivision_create_draft_development_v3(uuid, uuid, public.operating_module, text, text, text, public.subdivision_development_kind, text, text, integer, public.subdivision_development_phase, text, public.subdivision_development_parceling_mode, public.subdivision_development_territorial_context, public.subdivision_development_predominant_use, text, text, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_update_draft_development_v3(uuid, uuid, public.operating_module, text, uuid, text, text, public.subdivision_development_kind, text, text, integer, public.subdivision_development_phase, text, public.subdivision_development_parceling_mode, public.subdivision_development_territorial_context, public.subdivision_development_predominant_use, text, text, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_draft_developments_v3(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.subdivision_create_draft_development_v3(uuid, uuid, public.operating_module, text, text, text, public.subdivision_development_kind, text, text, integer, public.subdivision_development_phase, text, public.subdivision_development_parceling_mode, public.subdivision_development_territorial_context, public.subdivision_development_predominant_use, text, text, uuid) to service_role;
grant execute on function public.subdivision_update_draft_development_v3(uuid, uuid, public.operating_module, text, uuid, text, text, public.subdivision_development_kind, text, text, integer, public.subdivision_development_phase, text, public.subdivision_development_parceling_mode, public.subdivision_development_territorial_context, public.subdivision_development_predominant_use, text, text, uuid) to service_role;
grant execute on function public.subdivision_list_draft_developments_v3(uuid, uuid, public.operating_module, text) to service_role;

comment on column public.subdivision_developments.parceling_mode is 'A206: modalidade declarada para organização interna. Não certifica enquadramento legal.';
comment on column public.subdivision_developments.territorial_reference is 'A206: referência territorial ampla de rascunho, sem endereço preciso ou coordenada.';
comment on column public.subdivision_developments.identification_note is 'A206: nota interna de identificação, sem dados pessoais, matrícula, processo, contrato ou financeiro.';
