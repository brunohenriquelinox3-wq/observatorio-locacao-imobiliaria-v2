-- A195 — Estúdio de Cadastro de Loteamentos.
-- Amplia somente o rascunho interno: sem matrícula, coordenada, documentos pessoais, contratos, valores, cobrança, pagamento ou repasse.

create type public.subdivision_development_kind as enum ('residential', 'mixed_use', 'commercial', 'industrial', 'rural', 'other');
create type public.subdivision_development_attachment_category as enum ('planning', 'municipal', 'registry', 'implementation', 'environmental', 'other');
create type public.subdivision_development_attachment_state as enum ('awaiting_upload', 'recorded', 'archived');

alter table public.subdivision_developments
  add column display_name text,
  add column development_kind public.subdivision_development_kind,
  add column municipality text,
  add column state_code text,
  add column planned_stage_count integer,
  add column internal_note text;

alter table public.subdivision_developments
  add constraint subdivision_developments_display_name_length check (display_name is null or char_length(trim(display_name)) between 3 and 120),
  add constraint subdivision_developments_municipality_length check (municipality is null or char_length(trim(municipality)) between 2 and 80),
  add constraint subdivision_developments_state_code_format check (state_code is null or state_code ~ '^[A-Z]{2}$'),
  add constraint subdivision_developments_location_pair check ((municipality is null) = (state_code is null)),
  add constraint subdivision_developments_planned_stage_count check (planned_stage_count is null or planned_stage_count between 1 and 20),
  add constraint subdivision_developments_internal_note_length check (internal_note is null or char_length(trim(internal_note)) <= 600);

create table public.subdivision_development_attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  development_id uuid not null,
  category public.subdivision_development_attachment_category not null,
  attachment_state public.subdivision_development_attachment_state not null default 'awaiting_upload',
  storage_key text,
  content_type text,
  byte_size integer,
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_development_attachments_development_tenant_fk foreign key (development_id, organization_id)
    references public.subdivision_developments(id, organization_id) on delete restrict,
  constraint subdivision_development_attachments_content_type check (content_type is null or content_type in ('application/pdf', 'image/jpeg', 'image/png')),
  constraint subdivision_development_attachments_byte_size check (byte_size is null or byte_size between 1 and 5242880),
  constraint subdivision_development_attachments_storage_pair check ((storage_key is null) = (content_type is null) and (storage_key is null) = (byte_size is null))
);
create index subdivision_development_attachments_context_lookup on public.subdivision_development_attachments (organization_id, development_id, attachment_state, created_at desc);

alter table public.subdivision_development_attachments enable row level security;
revoke all on table public.subdivision_development_attachments from public, anon, authenticated;

create or replace function private.require_active_subdivision_draft_authority(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (
    select 1 from public.organizations organization
    where organization.id = p_organization_id and organization.state = 'active'
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_ACTIVE_ORGANIZATION_REQUIRED';
  end if;
end;
$$;

create or replace function public.subdivision_create_draft_development_v2(
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
  where event.command_name = 'subdivision_create_draft_development_v2'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;

  insert into public.subdivision_developments (
    organization_id, internal_reference, display_name, development_kind, municipality, state_code,
    planned_stage_count, working_phase, internal_note, state, created_by
  ) values (
    p_organization_id, trim(p_internal_reference), trim(p_display_name), p_development_kind,
    nullif(trim(p_municipality), ''), nullif(trim(p_state_code), ''), p_planned_stage_count,
    p_working_phase, nullif(trim(p_internal_note), ''), 'draft', p_actor_user_id
  ) returning id into v_development_id;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_create_draft_development_v2', 'allowed', 'subdivision_development', v_development_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'development_kind', p_development_kind::text, 'municipality_present', p_municipality is not null, 'planned_stage_count', p_planned_stage_count, 'internal_note_present', p_internal_note is not null)
  );
  return v_development_id;
end;
$$;

create or replace function public.subdivision_update_draft_development_v2(
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
  where event.command_name = 'subdivision_update_draft_development_v2'
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
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_update_draft_development_v2', 'allowed', 'subdivision_development', p_development_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'development_kind', p_development_kind::text, 'municipality_present', p_municipality is not null, 'planned_stage_count', p_planned_stage_count, 'internal_note_present', p_internal_note is not null)
  );
  return p_development_id;
end;
$$;

create or replace function public.subdivision_archive_draft_development_v2(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid,
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
  where event.command_name = 'subdivision_archive_draft_development_v2'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;

  if exists (
    select 1 from public.subdivision_blocks block
    where block.organization_id = p_organization_id
      and block.development_id = p_development_id
      and block.state = 'draft'
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_ARCHIVE_DEPENDENCY_DENIED';
  end if;

  update public.subdivision_developments development
  set state = 'archived', updated_at = now()
  where development.id = p_development_id
    and development.organization_id = p_organization_id
    and development.state = 'draft';
  if not found then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED';
  end if;

  update public.subdivision_development_attachments attachment
  set attachment_state = 'archived', storage_key = null, content_type = null, byte_size = null, updated_at = now()
  where attachment.organization_id = p_organization_id
    and attachment.development_id = p_development_id
    and attachment.attachment_state <> 'archived';

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_archive_draft_development_v2', 'allowed', 'subdivision_development', p_development_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'archive_mode', 'logical', 'attachment_references_removed', true)
  );
  return p_development_id;
end;
$$;

create or replace function public.subdivision_list_draft_developments_v2(
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
    development.internal_note, development.created_at, development.updated_at
  from public.subdivision_developments development
  where development.organization_id = p_organization_id and development.state = 'draft'
  order by development.updated_at desc, development.id asc;
end;
$$;

create or replace function public.subdivision_create_draft_development_attachment_intent(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid,
  p_category public.subdivision_development_attachment_category,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_target uuid;
  v_attachment_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'subdivision_create_draft_development_attachment_intent'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  if not exists (
    select 1 from public.subdivision_developments development
    where development.id = p_development_id and development.organization_id = p_organization_id and development.state = 'draft'
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED';
  end if;
  insert into public.subdivision_development_attachments (organization_id, development_id, category, created_by)
  values (p_organization_id, p_development_id, p_category, p_actor_user_id)
  returning id into v_attachment_id;
  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_create_draft_development_attachment_intent', 'allowed', 'subdivision_development_attachment', v_attachment_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'category', p_category::text)
  );
  return v_attachment_id;
end;
$$;

create or replace function public.subdivision_authorize_development_attachment_upload(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_attachment_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_attachment_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select attachment.id into v_attachment_id
  from public.subdivision_development_attachments attachment
  join public.subdivision_developments development
    on development.id = attachment.development_id and development.organization_id = attachment.organization_id
  where attachment.id = p_attachment_id
    and attachment.organization_id = p_organization_id
    and attachment.attachment_state = 'awaiting_upload'
    and development.state = 'draft';
  if v_attachment_id is null then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_ATTACHMENT_CONTEXT_DENIED';
  end if;
  return v_attachment_id;
end;
$$;

create or replace function public.subdivision_record_development_attachment_upload(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_attachment_id uuid,
  p_storage_key text,
  p_content_type text,
  p_byte_size integer,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_target uuid;
  v_attachment_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'subdivision_record_development_attachment_upload'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  update public.subdivision_development_attachments attachment
  set attachment_state = 'recorded', storage_key = p_storage_key, content_type = p_content_type, byte_size = p_byte_size, updated_at = now()
  from public.subdivision_developments development
  where attachment.id = p_attachment_id
    and attachment.organization_id = p_organization_id
    and attachment.development_id = development.id
    and development.organization_id = attachment.organization_id
    and development.state = 'draft'
    and attachment.attachment_state = 'awaiting_upload'
  returning attachment.id into v_attachment_id;
  if v_attachment_id is null then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_ATTACHMENT_CONTEXT_DENIED';
  end if;
  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_record_development_attachment_upload', 'allowed', 'subdivision_development_attachment', v_attachment_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'content_type', p_content_type, 'byte_size', p_byte_size)
  );
  return v_attachment_id;
end;
$$;

create or replace function public.subdivision_archive_draft_development_attachment(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid,
  p_attachment_id uuid,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_target uuid;
  v_attachment_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'subdivision_archive_draft_development_attachment'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  update public.subdivision_development_attachments attachment
  set attachment_state = 'archived', storage_key = null, content_type = null, byte_size = null, updated_at = now()
  from public.subdivision_developments development
  where attachment.id = p_attachment_id
    and attachment.development_id = p_development_id
    and attachment.organization_id = p_organization_id
    and attachment.development_id = development.id
    and development.organization_id = attachment.organization_id
    and development.state = 'draft'
    and attachment.attachment_state <> 'archived'
  returning attachment.id into v_attachment_id;
  if v_attachment_id is null then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_ATTACHMENT_CONTEXT_DENIED';
  end if;
  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_archive_draft_development_attachment', 'allowed', 'subdivision_development_attachment', v_attachment_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'archive_mode', 'logical', 'storage_reference_removed', true)
  );
  return v_attachment_id;
end;
$$;

create or replace function public.subdivision_list_draft_development_attachments(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid
)
returns table(
  attachment_id uuid,
  category public.subdivision_development_attachment_category,
  attachment_state public.subdivision_development_attachment_state,
  content_type text,
  byte_size integer,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (
    select 1 from public.subdivision_developments development
    where development.id = p_development_id and development.organization_id = p_organization_id and development.state = 'draft'
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED';
  end if;
  return query
  select attachment.id, attachment.category, attachment.attachment_state, attachment.content_type, attachment.byte_size, attachment.created_at
  from public.subdivision_development_attachments attachment
  where attachment.organization_id = p_organization_id
    and attachment.development_id = p_development_id
    and attachment.attachment_state <> 'archived'
  order by attachment.created_at desc, attachment.id asc;
end;
$$;

revoke all on function private.require_active_subdivision_draft_authority(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
revoke all on function public.subdivision_create_draft_development_v2(uuid, uuid, public.operating_module, text, text, text, public.subdivision_development_kind, text, text, integer, public.subdivision_development_phase, text, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_update_draft_development_v2(uuid, uuid, public.operating_module, text, uuid, text, text, public.subdivision_development_kind, text, text, integer, public.subdivision_development_phase, text, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_archive_draft_development_v2(uuid, uuid, public.operating_module, text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_draft_developments_v2(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
revoke all on function public.subdivision_create_draft_development_attachment_intent(uuid, uuid, public.operating_module, text, uuid, public.subdivision_development_attachment_category, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_authorize_development_attachment_upload(uuid, uuid, public.operating_module, text, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_record_development_attachment_upload(uuid, uuid, public.operating_module, text, uuid, text, text, integer, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_archive_draft_development_attachment(uuid, uuid, public.operating_module, text, uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_draft_development_attachments(uuid, uuid, public.operating_module, text, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_create_draft_development_v2(uuid, uuid, public.operating_module, text, text, text, public.subdivision_development_kind, text, text, integer, public.subdivision_development_phase, text, uuid) to service_role;
grant execute on function public.subdivision_update_draft_development_v2(uuid, uuid, public.operating_module, text, uuid, text, text, public.subdivision_development_kind, text, text, integer, public.subdivision_development_phase, text, uuid) to service_role;
grant execute on function public.subdivision_archive_draft_development_v2(uuid, uuid, public.operating_module, text, uuid, uuid) to service_role;
grant execute on function public.subdivision_list_draft_developments_v2(uuid, uuid, public.operating_module, text) to service_role;
grant execute on function public.subdivision_create_draft_development_attachment_intent(uuid, uuid, public.operating_module, text, uuid, public.subdivision_development_attachment_category, uuid) to service_role;
grant execute on function public.subdivision_authorize_development_attachment_upload(uuid, uuid, public.operating_module, text, uuid) to service_role;
grant execute on function public.subdivision_record_development_attachment_upload(uuid, uuid, public.operating_module, text, uuid, text, text, integer, uuid) to service_role;
grant execute on function public.subdivision_archive_draft_development_attachment(uuid, uuid, public.operating_module, text, uuid, uuid, uuid) to service_role;
grant execute on function public.subdivision_list_draft_development_attachments(uuid, uuid, public.operating_module, text, uuid) to service_role;

comment on table public.subdivision_development_attachments is 'A195: metadados mínimos de anexo de loteamento em rascunho; não armazena bytes, nome original, URL pública, documento pessoal, contrato ou financeiro. A remoção lógica elimina a referência ao armazenamento.';
