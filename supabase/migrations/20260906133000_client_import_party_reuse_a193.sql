-- A193 — Reforça a deduplicação da importação A192.
-- Reutiliza Party em rascunho no mesmo contexto antes de criar novo papel; não adiciona campos pessoais ou dados de negócio.

create or replace function public.client_import_draft_parties(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_rows jsonb,
  p_file_fingerprint text,
  p_correlation_id uuid
)
returns table(accepted_rows integer, created_rows integer, duplicate_rows integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_batch_id uuid;
  v_existing_batch public.client_import_batches%rowtype;
  v_item jsonb;
  v_display_name text;
  v_kind public.party_kind;
  v_role public.party_role_kind;
  v_party_id uuid;
  v_role_id uuid;
  v_created_count integer := 0;
  v_duplicate_count integer := 0;
  v_received_count integer;
begin
  perform private.require_client_import_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);

  select * into v_existing_batch
  from public.client_import_batches batch
  where batch.created_by = p_actor_user_id
    and batch.correlation_id = p_correlation_id
  limit 1;
  if found then
    return query select v_existing_batch.received_row_count, v_existing_batch.created_row_count, v_existing_batch.duplicate_row_count;
    return;
  end if;

  if jsonb_typeof(p_rows) <> 'array' then
    raise exception using errcode = '22023', message = 'CLIENT_IMPORT_INPUT_INVALID';
  end if;
  if jsonb_array_length(p_rows) < 1
    or jsonb_array_length(p_rows) > 200
    or p_file_fingerprint !~ '^[a-f0-9]{64}$'
  then
    raise exception using errcode = '22023', message = 'CLIENT_IMPORT_INPUT_INVALID';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_rows) item
    where jsonb_typeof(item) <> 'object'
      or char_length(trim(coalesce(item ->> 'displayName', ''))) not between 2 and 160
      or item ->> 'kind' not in ('individual', 'legal_entity')
      or item ->> 'role' not in ('client', 'buyer')
  ) then
    raise exception using errcode = '22023', message = 'CLIENT_IMPORT_ROW_INVALID';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_rows) item
    group by lower(trim(item ->> 'displayName')), item ->> 'kind', item ->> 'role'
    having count(*) > 1
  ) then
    raise exception using errcode = '22023', message = 'CLIENT_IMPORT_DUPLICATE_INPUT';
  end if;

  v_received_count := jsonb_array_length(p_rows);
  insert into public.client_import_batches (
    organization_id, module, purpose_code, received_row_count, file_fingerprint, created_by, correlation_id
  ) values (
    p_organization_id, p_module, trim(p_purpose_code), v_received_count, p_file_fingerprint, p_actor_user_id, p_correlation_id
  ) returning id into v_batch_id;

  for v_item in select value from jsonb_array_elements(p_rows)
  loop
    v_display_name := trim(v_item ->> 'displayName');
    v_kind := (v_item ->> 'kind')::public.party_kind;
    v_role := (v_item ->> 'role')::public.party_role_kind;
    v_party_id := null;
    v_role_id := null;

    perform pg_advisory_xact_lock(hashtextextended(concat_ws(':', p_organization_id::text, p_module::text, trim(p_purpose_code), lower(v_display_name), v_kind::text, v_role::text), 0));

    select party.id into v_party_id
    from public.party_records party
    where party.organization_id = p_organization_id
      and party.kind = v_kind
      and lower(trim(party.display_name)) = lower(v_display_name)
      and party.state = 'draft'
    order by party.created_at asc
    limit 1;

    if v_party_id is not null then
      select role_assignment.id into v_role_id
      from public.party_role_assignments role_assignment
      where role_assignment.party_id = v_party_id
        and role_assignment.organization_id = p_organization_id
        and role_assignment.module = p_module
        and role_assignment.role = v_role
        and role_assignment.purpose_code = trim(p_purpose_code)
        and role_assignment.state = 'draft'
      limit 1;
    end if;

    if v_role_id is null then
      if v_party_id is null then
        insert into public.party_records (organization_id, kind, display_name, source_kind, state, created_by)
        values (p_organization_id, v_kind, v_display_name, 'import_preview', 'draft', p_actor_user_id)
        returning id into v_party_id;
      end if;

      insert into public.party_role_assignments (
        organization_id, party_id, module, role, purpose_code, state, created_by
      ) values (
        p_organization_id, v_party_id, p_module, v_role, trim(p_purpose_code), 'draft', p_actor_user_id
      ) returning id into v_role_id;
      v_created_count := v_created_count + 1;
    else
      v_duplicate_count := v_duplicate_count + 1;
    end if;

    if p_module = 'loteadora'::public.operating_module then
      insert into public.subdivision_buyer_clients (organization_id, party_role_assignment_id, created_by)
      values (p_organization_id, v_role_id, p_actor_user_id)
      on conflict (organization_id, party_role_assignment_id) do nothing;
    end if;
  end loop;

  update public.client_import_batches
  set created_row_count = v_created_count,
      duplicate_row_count = v_duplicate_count
  where id = v_batch_id;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'client_import_draft_parties', 'allowed', 'client_import_batch', v_batch_id,
    jsonb_build_object(
      'module', p_module::text,
      'purpose_code', trim(p_purpose_code),
      'received_row_count', v_received_count,
      'created_row_count', v_created_count,
      'duplicate_row_count', v_duplicate_count
    )
  );

  return query select v_received_count, v_created_count, v_duplicate_count;
end;
$$;

revoke all on function public.client_import_draft_parties(uuid, uuid, public.operating_module, text, jsonb, text, uuid) from public, anon, authenticated;
grant execute on function public.client_import_draft_parties(uuid, uuid, public.operating_module, text, jsonb, text, uuid) to service_role;

comment on function public.client_import_draft_parties(uuid, uuid, public.operating_module, text, jsonb, text, uuid) is 'A193: importação de Party minimizada, com reutilização canônica de rascunho, lock transacional e sem conteúdo de CSV, identificador fiscal, contato, contrato ou financeiro.';
