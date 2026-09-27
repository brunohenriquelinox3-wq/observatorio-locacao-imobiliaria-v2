-- A390: reserva opaca e idempotente da chave privada antes do storage.
-- A reserva impede uma nova chave a cada retry e mantém a chave recuperável até a metadata ser registrada.
-- Não armazena bytes, nome, URL, download, conteúdo documental ou semântica financeira.

create type public.subdivision_private_upload_target_kind as enum (
  'buyer_attachment',
  'sale_case_document',
  'development_attachment'
);

create table public.subdivision_private_upload_storage_reservations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  target_kind public.subdivision_private_upload_target_kind not null,
  target_id uuid not null,
  storage_key text not null unique,
  content_type text not null check (content_type in ('application/pdf', 'image/jpeg', 'image/png')),
  byte_size integer not null check (byte_size between 1 and 5242880),
  reserved_at timestamptz not null default now(),
  constraint subdivision_private_upload_storage_reservations_target_unique
    unique (organization_id, target_kind, target_id)
);

alter table public.subdivision_private_upload_storage_reservations enable row level security;
revoke all on table public.subdivision_private_upload_storage_reservations from public, anon, authenticated;

comment on table public.subdivision_private_upload_storage_reservations is
  'A390: reserva técnica opaca da chave privada por intenção; mantém retry idempotente entre storage e metadata sem URL, nome, bytes ou conteúdo.';

create or replace function public.subdivision_reserve_private_upload_storage(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_target_kind public.subdivision_private_upload_target_kind,
  p_target_id uuid,
  p_content_type text,
  p_byte_size integer,
  p_correlation_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_storage_key text;
  v_target_exists boolean := false;
  v_max_bytes integer := 2097152;
begin
  if p_target_kind = 'buyer_attachment' then
    perform private.require_subdivision_draft_authority(
      p_actor_user_id,
      p_organization_id,
      p_module,
      p_purpose_code
    );
  else
    perform private.require_active_subdivision_draft_authority(
      p_actor_user_id,
      p_organization_id,
      p_module,
      p_purpose_code
    );
  end if;

  if p_module <> 'loteadora'
     or p_content_type not in ('application/pdf', 'image/jpeg', 'image/png')
     or p_byte_size < 1 then
    raise exception using errcode = '42501', message = 'SUBDIVISION_PRIVATE_UPLOAD_RESERVATION_DENIED';
  end if;

  if p_target_kind = 'development_attachment' then
    v_max_bytes := 5242880;
    select exists (
      select 1
      from public.subdivision_development_attachments attachment
      join public.subdivision_developments development
        on development.id = attachment.development_id
       and development.organization_id = attachment.organization_id
      where attachment.id = p_target_id
        and attachment.organization_id = p_organization_id
        and attachment.attachment_state = 'awaiting_upload'
        and development.state = 'draft'
    ) into v_target_exists;
  elsif p_target_kind = 'sale_case_document' then
    select exists (
      select 1
      from public.subdivision_sale_case_document_intents intent
      join public.subdivision_sale_cases sale_case
        on sale_case.id = intent.sale_case_id
       and sale_case.organization_id = intent.organization_id
      where intent.id = p_target_id
        and intent.organization_id = p_organization_id
        and intent.storage_key is null
        and intent.dossier_state = 'awaiting_private_upload'
        and sale_case.state in ('preparation', 'terms_review')
    ) into v_target_exists;
  else
    select exists (
      select 1
      from public.subdivision_buyer_attachment_intents intent
      where intent.id = p_target_id
        and intent.organization_id = p_organization_id
        and intent.storage_key is null
    ) into v_target_exists;
  end if;

  if not v_target_exists or p_byte_size > v_max_bytes then
    raise exception using errcode = '42501', message = 'SUBDIVISION_PRIVATE_UPLOAD_RESERVATION_DENIED';
  end if;

  select reservation.storage_key into v_storage_key
  from public.subdivision_private_upload_storage_reservations reservation
  where reservation.organization_id = p_organization_id
    and reservation.target_kind = p_target_kind
    and reservation.target_id = p_target_id;

  if v_storage_key is not null then
    return v_storage_key;
  end if;

  v_storage_key := concat(
    'private/',
    p_organization_id::text,
    '/upload-reservations/',
    p_target_kind::text,
    '/',
    p_target_id::text
  );

  insert into public.subdivision_private_upload_storage_reservations (
    organization_id,
    target_kind,
    target_id,
    storage_key,
    content_type,
    byte_size
  ) values (
    p_organization_id,
    p_target_kind,
    p_target_id,
    v_storage_key,
    p_content_type,
    p_byte_size
  ) on conflict (organization_id, target_kind, target_id)
  do update set storage_key = public.subdivision_private_upload_storage_reservations.storage_key
  returning storage_key into v_storage_key;

  insert into public.admin_audit_events (
    correlation_id,
    actor_user_id,
    organization_id,
    command_name,
    outcome,
    target_type,
    target_id,
    payload_redacted
  ) values (
    p_correlation_id,
    p_actor_user_id,
    p_organization_id,
    'subdivision_reserve_private_upload_storage',
    'allowed',
    'subdivision_private_upload_target',
    p_target_id,
    jsonb_build_object(
      'module', p_module::text,
      'purpose_code', trim(p_purpose_code),
      'target_kind', p_target_kind::text,
      'private_upload_reservation', true
    )
  );

  return v_storage_key;
end;
$$;

create or replace function private.subdivision_require_private_upload_reservation(
  p_organization_id uuid,
  p_target_kind public.subdivision_private_upload_target_kind,
  p_target_id uuid,
  p_storage_key text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.subdivision_private_upload_storage_reservations reservation
    where reservation.organization_id = p_organization_id
      and reservation.target_kind = p_target_kind
      and reservation.target_id = p_target_id
      and reservation.storage_key = p_storage_key
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_PRIVATE_UPLOAD_RESERVATION_DENIED';
  end if;
end;
$$;

create or replace function public.subdivision_record_buyer_attachment_upload(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_attachment_intent_id uuid,
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
  v_existing uuid;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  perform private.subdivision_require_private_upload_reservation(
    p_organization_id,
    'buyer_attachment',
    p_attachment_intent_id,
    p_storage_key
  );
  select target_id into v_existing
  from public.admin_audit_events
  where command_name = 'subdivision_record_buyer_attachment_upload'
    and correlation_id = p_correlation_id
    and outcome = 'allowed'
  limit 1;
  if v_existing is not null then return v_existing; end if;

  update public.subdivision_buyer_attachment_intents
  set storage_key = p_storage_key,
      content_type = p_content_type,
      byte_size = p_byte_size,
      uploaded_at = now()
  where id = p_attachment_intent_id
    and organization_id = p_organization_id
    and storage_key is null
  returning id into v_existing;

  if v_existing is null then
    raise exception using errcode = '42501', message = 'SUBDIVISION_ATTACHMENT_UPLOAD_CONTEXT_DENIED';
  end if;

  delete from public.subdivision_private_upload_storage_reservations
  where organization_id = p_organization_id
    and target_kind = 'buyer_attachment'
    and target_id = p_attachment_intent_id;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_record_buyer_attachment_upload', 'allowed',
    'subdivision_buyer_attachment_intent', v_existing,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'upload_recorded', true)
  );
  return v_existing;
end;
$$;

create or replace function public.subdivision_record_sale_case_document_upload(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_attachment_intent_id uuid,
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
  v_existing uuid;
  v_intent_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' or p_content_type not in ('application/pdf', 'image/jpeg', 'image/png') or p_byte_size not between 1 and 2097152 then
    raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_ATTACHMENT_DENIED';
  end if;
  perform private.subdivision_require_private_upload_reservation(
    p_organization_id,
    'sale_case_document',
    p_attachment_intent_id,
    p_storage_key
  );
  select target_id into v_existing
  from public.admin_audit_events event
  where event.command_name = 'subdivision_record_sale_case_document_upload'
    and event.correlation_id = p_correlation_id
    and event.actor_user_id = p_actor_user_id
    and event.organization_id = p_organization_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;
  if v_existing is not null then return v_existing; end if;

  update public.subdivision_sale_case_document_intents intent
  set storage_key = p_storage_key,
      content_type = p_content_type,
      byte_size = p_byte_size,
      dossier_state = 'private_upload_recorded',
      updated_at = now()
  where intent.id = p_attachment_intent_id
    and intent.organization_id = p_organization_id
    and intent.storage_key is null
  returning intent.id into v_intent_id;

  if v_intent_id is null then
    raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_ATTACHMENT_DENIED';
  end if;

  delete from public.subdivision_private_upload_storage_reservations
  where organization_id = p_organization_id
    and target_kind = 'sale_case_document'
    and target_id = p_attachment_intent_id;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_record_sale_case_document_upload', 'allowed',
    'subdivision_sale_case_document_intent', v_intent_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'private_upload_recorded', true)
  );
  return v_intent_id;
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
  perform private.subdivision_require_private_upload_reservation(
    p_organization_id,
    'development_attachment',
    p_attachment_id,
    p_storage_key
  );
  select event.target_id into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'subdivision_record_development_attachment_upload'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;
  if v_existing_target is not null then return v_existing_target; end if;

  update public.subdivision_development_attachments attachment
  set attachment_state = 'recorded',
      storage_key = p_storage_key,
      content_type = p_content_type,
      byte_size = p_byte_size,
      updated_at = now()
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

  delete from public.subdivision_private_upload_storage_reservations
  where organization_id = p_organization_id
    and target_kind = 'development_attachment'
    and target_id = p_attachment_id;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_record_development_attachment_upload', 'allowed',
    'subdivision_development_attachment', v_attachment_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'content_type', p_content_type, 'byte_size', p_byte_size)
  );
  return v_attachment_id;
end;
$$;

revoke all on function public.subdivision_reserve_private_upload_storage(
  uuid, uuid, public.operating_module, text, public.subdivision_private_upload_target_kind, uuid, text, integer, uuid
) from public, anon, authenticated;
revoke all on function private.subdivision_require_private_upload_reservation(
  uuid, public.subdivision_private_upload_target_kind, uuid, text
) from public, anon, authenticated;
revoke all on function public.subdivision_record_buyer_attachment_upload(
  uuid, uuid, public.operating_module, text, uuid, text, text, integer, uuid
) from public, anon, authenticated;
revoke all on function public.subdivision_record_sale_case_document_upload(
  uuid, uuid, public.operating_module, text, uuid, text, text, integer, uuid
) from public, anon, authenticated;
revoke all on function public.subdivision_record_development_attachment_upload(
  uuid, uuid, public.operating_module, text, uuid, text, text, integer, uuid
) from public, anon, authenticated;

grant execute on function public.subdivision_reserve_private_upload_storage(
  uuid, uuid, public.operating_module, text, public.subdivision_private_upload_target_kind, uuid, text, integer, uuid
) to service_role;
grant execute on function private.subdivision_require_private_upload_reservation(
  uuid, public.subdivision_private_upload_target_kind, uuid, text
) to service_role;
grant execute on function public.subdivision_record_buyer_attachment_upload(
  uuid, uuid, public.operating_module, text, uuid, text, text, integer, uuid
) to service_role;
grant execute on function public.subdivision_record_sale_case_document_upload(
  uuid, uuid, public.operating_module, text, uuid, text, text, integer, uuid
) to service_role;
grant execute on function public.subdivision_record_development_attachment_upload(
  uuid, uuid, public.operating_module, text, uuid, text, text, integer, uuid
) to service_role;
