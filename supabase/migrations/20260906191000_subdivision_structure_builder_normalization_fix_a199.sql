-- A199 — Corrige a normalização da finalidade nas RPCs do construtor A198.
-- Não altera tabelas, registros ou regras de autorização.

create or replace function public.subdivision_apply_draft_structure_v2(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid,
  p_blocks jsonb,
  p_replace_existing boolean,
  p_correlation_id uuid
)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_input_block_count integer;
  v_unique_block_count integer;
  v_requested_lot_count integer;
  v_existing_result jsonb;
  v_result jsonb;
  v_block record;
  v_block_id uuid;
  v_current_lot_count integer;
  v_archived_block_count integer := 0;
  v_archived_lot_count integer := 0;
  v_block_count integer := 0;
  v_lot_count integer := 0;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments development where development.id = p_development_id and development.organization_id = p_organization_id and development.state = 'draft'::public.party_lifecycle_state) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED';
  end if;
  if p_blocks is null or pg_catalog.jsonb_typeof(p_blocks) <> 'array' or pg_catalog.jsonb_array_length(p_blocks) not between 1 and 50 then
    raise exception using errcode = '22023', message = 'SUBDIVISION_STRUCTURE_INVALID';
  end if;
  select count(*)::integer, count(distinct candidate.block_number)::integer, coalesce(sum(candidate.lot_count), 0)::integer
    into v_input_block_count, v_unique_block_count, v_requested_lot_count
  from pg_catalog.jsonb_to_recordset(p_blocks) as candidate(block_number integer, lot_count integer);
  if v_input_block_count <> pg_catalog.jsonb_array_length(p_blocks) or v_input_block_count < 1 or v_unique_block_count <> v_input_block_count or v_requested_lot_count < 1
    or exists (select 1 from pg_catalog.jsonb_to_recordset(p_blocks) as candidate(block_number integer, lot_count integer) where candidate.block_number not between 1 and 999 or candidate.lot_count not between 1 and 100) then
    raise exception using errcode = '22023', message = 'SUBDIVISION_STRUCTURE_INVALID';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || ':' || p_development_id::text, 0));
  select event.payload_redacted -> 'result' into v_existing_result from public.admin_audit_events event
  where event.command_name = 'subdivision_apply_draft_structure_v2' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_result is not null then return v_existing_result; end if;
  if not p_replace_existing and exists (
    select 1 from public.subdivision_blocks block join lateral pg_catalog.jsonb_to_recordset(p_blocks) as candidate(block_number integer, lot_count integer) on candidate.block_number = block.block_number
    where block.organization_id = p_organization_id and block.development_id = p_development_id and block.state = 'draft'::public.party_lifecycle_state
      and (select count(*) from public.subdivision_lots lot where lot.organization_id = p_organization_id and lot.block_id = block.id and lot.state = 'draft'::public.party_lifecycle_state) > candidate.lot_count
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_STRUCTURE_REPLACEMENT_CONFIRMATION_REQUIRED';
  end if;
  for v_block in select candidate.block_number, candidate.lot_count from pg_catalog.jsonb_to_recordset(p_blocks) as candidate(block_number integer, lot_count integer) order by candidate.block_number asc loop
    insert into public.subdivision_blocks (organization_id, development_id, block_number, state, created_by)
    values (p_organization_id, p_development_id, v_block.block_number, 'draft'::public.party_lifecycle_state, p_actor_user_id)
    on conflict (organization_id, development_id, block_number) do update set state = 'draft'::public.party_lifecycle_state, updated_at = pg_catalog.now()
    returning id into v_block_id;
    if p_replace_existing then
      with archived as (update public.subdivision_lots lot set state = 'archived'::public.party_lifecycle_state, updated_at = pg_catalog.now() where lot.organization_id = p_organization_id and lot.block_id = v_block_id and lot.state = 'draft'::public.party_lifecycle_state and lot.lot_number > v_block.lot_count returning 1)
      select count(*)::integer into v_current_lot_count from archived;
      v_archived_lot_count := v_archived_lot_count + v_current_lot_count;
    end if;
    insert into public.subdivision_lots (organization_id, block_id, lot_number, state, created_by)
    select p_organization_id, v_block_id, series.lot_number, 'draft'::public.party_lifecycle_state, p_actor_user_id from pg_catalog.generate_series(1, v_block.lot_count) as series(lot_number)
    on conflict (organization_id, block_id, lot_number) do update set state = 'draft'::public.party_lifecycle_state, updated_at = pg_catalog.now();
  end loop;
  if p_replace_existing then
    with archived_lots as (update public.subdivision_lots lot set state = 'archived'::public.party_lifecycle_state, updated_at = pg_catalog.now() from public.subdivision_blocks block where block.id = lot.block_id and block.organization_id = p_organization_id and block.development_id = p_development_id and block.state = 'draft'::public.party_lifecycle_state and lot.organization_id = p_organization_id and lot.state = 'draft'::public.party_lifecycle_state and not exists (select 1 from pg_catalog.jsonb_to_recordset(p_blocks) as candidate(block_number integer, lot_count integer) where candidate.block_number = block.block_number) returning 1)
    select v_archived_lot_count + count(*)::integer into v_archived_lot_count from archived_lots;
    with archived_blocks as (update public.subdivision_blocks block set state = 'archived'::public.party_lifecycle_state, updated_at = pg_catalog.now() where block.organization_id = p_organization_id and block.development_id = p_development_id and block.state = 'draft'::public.party_lifecycle_state and not exists (select 1 from pg_catalog.jsonb_to_recordset(p_blocks) as candidate(block_number integer, lot_count integer) where candidate.block_number = block.block_number) returning 1)
    select count(*)::integer into v_archived_block_count from archived_blocks;
  end if;
  select count(*)::integer into v_block_count from public.subdivision_blocks block where block.organization_id = p_organization_id and block.development_id = p_development_id and block.state = 'draft'::public.party_lifecycle_state;
  select count(*)::integer into v_lot_count from public.subdivision_lots lot join public.subdivision_blocks block on block.id = lot.block_id and block.organization_id = lot.organization_id where lot.organization_id = p_organization_id and block.development_id = p_development_id and block.state = 'draft'::public.party_lifecycle_state and lot.state = 'draft'::public.party_lifecycle_state;
  v_result := pg_catalog.jsonb_build_object('block_count', v_block_count, 'lot_count', v_lot_count, 'archived_block_count', v_archived_block_count, 'archived_lot_count', v_archived_lot_count);
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_apply_draft_structure_v2', 'allowed', 'subdivision_development', p_development_id, pg_catalog.jsonb_build_object('module', p_module::text, 'purpose_code', pg_catalog.btrim(p_purpose_code), 'development_id_present', true, 'input_block_count', v_input_block_count, 'input_lot_count', v_requested_lot_count, 'replace_existing', p_replace_existing, 'result', v_result));
  return v_result;
end; $$;

create or replace function public.subdivision_archive_draft_block_v2(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid,
  p_block_id uuid,
  p_correlation_id uuid
)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_existing_result jsonb;
  v_archived_lot_count integer := 0;
  v_result jsonb;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments development where development.id = p_development_id and development.organization_id = p_organization_id and development.state = 'draft'::public.party_lifecycle_state) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || ':' || p_development_id::text, 0));
  select event.payload_redacted -> 'result' into v_existing_result from public.admin_audit_events event
  where event.command_name = 'subdivision_archive_draft_block_v2' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_result is not null then return v_existing_result; end if;
  if not exists (select 1 from public.subdivision_blocks block where block.id = p_block_id and block.organization_id = p_organization_id and block.development_id = p_development_id and block.state = 'draft'::public.party_lifecycle_state) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_BLOCK_CONTEXT_DENIED';
  end if;
  with archived_lots as (update public.subdivision_lots lot set state = 'archived'::public.party_lifecycle_state, updated_at = pg_catalog.now() where lot.organization_id = p_organization_id and lot.block_id = p_block_id and lot.state = 'draft'::public.party_lifecycle_state returning 1)
  select count(*)::integer into v_archived_lot_count from archived_lots;
  update public.subdivision_blocks block set state = 'archived'::public.party_lifecycle_state, updated_at = pg_catalog.now() where block.id = p_block_id and block.organization_id = p_organization_id and block.development_id = p_development_id and block.state = 'draft'::public.party_lifecycle_state;
  v_result := pg_catalog.jsonb_build_object('block_id', p_block_id, 'archived_lot_count', v_archived_lot_count);
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_archive_draft_block_v2', 'allowed', 'subdivision_block', p_block_id, pg_catalog.jsonb_build_object('module', p_module::text, 'purpose_code', pg_catalog.btrim(p_purpose_code), 'development_id_present', true, 'archived_lot_count', v_archived_lot_count, 'result', v_result));
  return v_result;
end; $$;

revoke all on function public.subdivision_apply_draft_structure_v2(uuid, uuid, public.operating_module, text, uuid, jsonb, boolean, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_archive_draft_block_v2(uuid, uuid, public.operating_module, text, uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_apply_draft_structure_v2(uuid, uuid, public.operating_module, text, uuid, jsonb, boolean, uuid) to service_role;
grant execute on function public.subdivision_archive_draft_block_v2(uuid, uuid, public.operating_module, text, uuid, uuid, uuid) to service_role;
