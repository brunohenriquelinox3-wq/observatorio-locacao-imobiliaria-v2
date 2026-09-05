-- A202 — Perfil físico e dossiê de pendências de loteamento.
-- Não cria preço, disponibilidade, reserva, venda, proposta, contrato, cobrança, pagamento ou repasse.

create type public.subdivision_block_typology as enum ('regular', 'mixed', 'irregular', 'other');
create type public.subdivision_lot_typology as enum ('standard', 'corner', 'irregular', 'other');
create type public.subdivision_lot_position as enum ('not_declared', 'internal', 'corner', 'end');
create type public.subdivision_requirement_code as enum ('municipal_approval', 'municipal_technical_project', 'registry_matriculation', 'registry_memorial', 'legal_review', 'legal_registration', 'works_infrastructure', 'works_access', 'environmental_license', 'technical_survey', 'technical_layout');
create type public.subdivision_requirement_state as enum ('not_started', 'pending_evidence', 'under_review', 'declared_complete', 'review_required');

alter table public.subdivision_blocks
  add column sector_reference text,
  add column block_typology public.subdivision_block_typology not null default 'regular';
alter table public.subdivision_blocks
  add constraint subdivision_blocks_sector_reference_length check (sector_reference is null or char_length(trim(sector_reference)) between 1 and 80);

alter table public.subdivision_lots
  add column area_sqm numeric(12,2),
  add column frontage_m numeric(10,2),
  add column depth_m numeric(10,2),
  add column lot_typology public.subdivision_lot_typology not null default 'standard',
  add column position_code public.subdivision_lot_position not null default 'not_declared';
alter table public.subdivision_lots
  add constraint subdivision_lots_area_sqm_range check (area_sqm is null or area_sqm between 0.01 and 1000000),
  add constraint subdivision_lots_frontage_m_range check (frontage_m is null or frontage_m between 0.01 and 1000000),
  add constraint subdivision_lots_depth_m_range check (depth_m is null or depth_m between 0.01 and 1000000);

create table public.subdivision_development_requirements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  development_id uuid not null,
  requirement_code public.subdivision_requirement_code not null,
  requirement_state public.subdivision_requirement_state not null default 'not_started',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_development_requirements_development_fk foreign key (development_id, organization_id) references public.subdivision_developments(id, organization_id) on delete restrict,
  constraint subdivision_development_requirements_unique unique (organization_id, development_id, requirement_code)
);
create index subdivision_development_requirements_context_lookup on public.subdivision_development_requirements (organization_id, development_id, requirement_state);
alter table public.subdivision_development_requirements enable row level security;
revoke all on table public.subdivision_development_requirements from public, anon, authenticated;

create or replace function public.subdivision_list_draft_physical_structure_v1(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid
) returns table (block_id uuid, block_number integer, sector_reference text, block_typology public.subdivision_block_typology, lots jsonb)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments d where d.id = p_development_id and d.organization_id = p_organization_id and d.state = 'draft'::public.party_lifecycle_state) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED';
  end if;
  return query
  select block.id, block.block_number, block.sector_reference, block.block_typology,
    coalesce(jsonb_agg(jsonb_build_object('lot_number', lot.lot_number, 'area_sqm', lot.area_sqm, 'frontage_m', lot.frontage_m, 'depth_m', lot.depth_m, 'lot_typology', lot.lot_typology::text, 'position_code', lot.position_code::text) order by lot.lot_number) filter (where lot.id is not null), '[]'::jsonb)
  from public.subdivision_blocks block
  left join public.subdivision_lots lot on lot.block_id = block.id and lot.organization_id = p_organization_id and lot.state = 'draft'::public.party_lifecycle_state
  where block.organization_id = p_organization_id and block.development_id = p_development_id and block.state = 'draft'::public.party_lifecycle_state
  group by block.id, block.block_number, block.sector_reference, block.block_typology
  order by block.block_number, block.id;
end; $$;

create or replace function public.subdivision_apply_draft_physical_structure_v1(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid, p_blocks jsonb, p_replace_existing boolean, p_correlation_id uuid
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_block record; v_lot record; v_block_id uuid; v_existing_result jsonb; v_result jsonb;
  v_input_block_count integer; v_unique_block_count integer; v_input_lot_count integer := 0;
  v_archived_block_count integer := 0; v_archived_lot_count integer := 0; v_changed_lot_count integer;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments d where d.id = p_development_id and d.organization_id = p_organization_id and d.state = 'draft'::public.party_lifecycle_state) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED';
  end if;
  if p_blocks is null or jsonb_typeof(p_blocks) <> 'array' or jsonb_array_length(p_blocks) not between 1 and 50 then raise exception using errcode = '22023', message = 'SUBDIVISION_PHYSICAL_STRUCTURE_INVALID'; end if;
  select count(*)::integer, count(distinct b.block_number)::integer into v_input_block_count, v_unique_block_count from jsonb_to_recordset(p_blocks) as b(block_number integer);
  if v_input_block_count <> jsonb_array_length(p_blocks) or v_unique_block_count <> v_input_block_count or exists (select 1 from jsonb_to_recordset(p_blocks) as b(block_number integer, sector_reference text, block_typology text, lots jsonb) where b.block_number not between 1 and 999 or b.block_typology not in ('regular','mixed','irregular','other') or b.lots is null or jsonb_typeof(b.lots) <> 'array' or jsonb_array_length(b.lots) not between 1 and 100 or (b.sector_reference is not null and char_length(trim(b.sector_reference)) not between 1 and 80)) then
    raise exception using errcode = '22023', message = 'SUBDIVISION_PHYSICAL_STRUCTURE_INVALID';
  end if;
  for v_block in select * from jsonb_to_recordset(p_blocks) as b(block_number integer, sector_reference text, block_typology text, lots jsonb) loop
    if exists (select 1 from jsonb_to_recordset(v_block.lots) as l(lot_number integer, area_sqm numeric, frontage_m numeric, depth_m numeric, lot_typology text, position_code text) where l.lot_number not between 1 and 100 or l.lot_typology not in ('standard','corner','irregular','other') or l.position_code not in ('not_declared','internal','corner','end') or (l.area_sqm is not null and l.area_sqm not between 0.01 and 1000000) or (l.frontage_m is not null and l.frontage_m not between 0.01 and 1000000) or (l.depth_m is not null and l.depth_m not between 0.01 and 1000000)) or (select count(*) from jsonb_to_recordset(v_block.lots) as l(lot_number integer)) <> (select count(distinct l.lot_number) from jsonb_to_recordset(v_block.lots) as l(lot_number integer)) then
      raise exception using errcode = '22023', message = 'SUBDIVISION_PHYSICAL_STRUCTURE_INVALID';
    end if;
    v_input_lot_count := v_input_lot_count + jsonb_array_length(v_block.lots);
  end loop;
  if v_input_lot_count > 2000 then raise exception using errcode = '22023', message = 'SUBDIVISION_PHYSICAL_STRUCTURE_INVALID'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_organization_id::text || ':' || p_development_id::text, 0));
  select event.payload_redacted -> 'result' into v_existing_result from public.admin_audit_events event where event.command_name = 'subdivision_apply_draft_physical_structure_v1' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_existing_result is not null then return v_existing_result; end if;
  if not p_replace_existing and (
    exists (select 1 from public.subdivision_blocks b where b.organization_id = p_organization_id and b.development_id = p_development_id and b.state = 'draft'::public.party_lifecycle_state and not exists (select 1 from jsonb_to_recordset(p_blocks) as x(block_number integer) where x.block_number = b.block_number))
    or exists (
      select 1 from public.subdivision_lots lot
      join public.subdivision_blocks b on b.id = lot.block_id and b.organization_id = lot.organization_id
      join lateral jsonb_to_recordset(p_blocks) as incoming(block_number integer, lots jsonb) on incoming.block_number = b.block_number
      where lot.organization_id = p_organization_id and lot.state = 'draft'::public.party_lifecycle_state
        and b.development_id = p_development_id and b.state = 'draft'::public.party_lifecycle_state
        and not exists (select 1 from jsonb_to_recordset(incoming.lots) as candidate(lot_number integer) where candidate.lot_number = lot.lot_number)
    )
  ) then raise exception using errcode = '42501', message = 'SUBDIVISION_PHYSICAL_STRUCTURE_REPLACEMENT_CONFIRMATION_REQUIRED'; end if;
  for v_block in select * from jsonb_to_recordset(p_blocks) as b(block_number integer, sector_reference text, block_typology text, lots jsonb) order by b.block_number loop
    insert into public.subdivision_blocks (organization_id, development_id, block_number, sector_reference, block_typology, state, created_by) values (p_organization_id, p_development_id, v_block.block_number, nullif(trim(v_block.sector_reference), ''), v_block.block_typology::public.subdivision_block_typology, 'draft'::public.party_lifecycle_state, p_actor_user_id)
    on conflict (organization_id, development_id, block_number) do update set sector_reference = excluded.sector_reference, block_typology = excluded.block_typology, state = 'draft'::public.party_lifecycle_state, updated_at = now() returning id into v_block_id;
    if p_replace_existing then with archived as (update public.subdivision_lots lot set state = 'archived'::public.party_lifecycle_state, updated_at = now() where lot.organization_id = p_organization_id and lot.block_id = v_block_id and lot.state = 'draft'::public.party_lifecycle_state and not exists (select 1 from jsonb_to_recordset(v_block.lots) as x(lot_number integer) where x.lot_number = lot.lot_number) returning 1) select count(*)::integer into v_changed_lot_count from archived; v_archived_lot_count := v_archived_lot_count + v_changed_lot_count; end if;
    for v_lot in select * from jsonb_to_recordset(v_block.lots) as l(lot_number integer, area_sqm numeric, frontage_m numeric, depth_m numeric, lot_typology text, position_code text) loop
      insert into public.subdivision_lots (organization_id, block_id, lot_number, area_sqm, frontage_m, depth_m, lot_typology, position_code, state, created_by) values (p_organization_id, v_block_id, v_lot.lot_number, v_lot.area_sqm, v_lot.frontage_m, v_lot.depth_m, v_lot.lot_typology::public.subdivision_lot_typology, v_lot.position_code::public.subdivision_lot_position, 'draft'::public.party_lifecycle_state, p_actor_user_id)
      on conflict (organization_id, block_id, lot_number) do update set area_sqm = coalesce(excluded.area_sqm, subdivision_lots.area_sqm), frontage_m = coalesce(excluded.frontage_m, subdivision_lots.frontage_m), depth_m = coalesce(excluded.depth_m, subdivision_lots.depth_m), lot_typology = excluded.lot_typology, position_code = excluded.position_code, state = 'draft'::public.party_lifecycle_state, updated_at = now();
    end loop;
  end loop;
  if p_replace_existing then
    with archived_lots as (update public.subdivision_lots lot set state = 'archived'::public.party_lifecycle_state, updated_at = now() from public.subdivision_blocks b where b.id = lot.block_id and b.organization_id = p_organization_id and b.development_id = p_development_id and b.state = 'draft'::public.party_lifecycle_state and lot.organization_id = p_organization_id and lot.state = 'draft'::public.party_lifecycle_state and not exists (select 1 from jsonb_to_recordset(p_blocks) as x(block_number integer) where x.block_number = b.block_number) returning 1) select v_archived_lot_count + count(*)::integer into v_archived_lot_count from archived_lots;
    with archived_blocks as (update public.subdivision_blocks b set state = 'archived'::public.party_lifecycle_state, updated_at = now() where b.organization_id = p_organization_id and b.development_id = p_development_id and b.state = 'draft'::public.party_lifecycle_state and not exists (select 1 from jsonb_to_recordset(p_blocks) as x(block_number integer) where x.block_number = b.block_number) returning 1) select count(*)::integer into v_archived_block_count from archived_blocks;
  end if;
  select jsonb_build_object('block_count', count(distinct b.id), 'lot_count', count(lot.id), 'archived_block_count', v_archived_block_count, 'archived_lot_count', v_archived_lot_count) into v_result from public.subdivision_blocks b left join public.subdivision_lots lot on lot.block_id = b.id and lot.organization_id = p_organization_id and lot.state = 'draft'::public.party_lifecycle_state where b.organization_id = p_organization_id and b.development_id = p_development_id and b.state = 'draft'::public.party_lifecycle_state;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_apply_draft_physical_structure_v1', 'allowed', 'subdivision_development', p_development_id, jsonb_build_object('module', p_module::text, 'purpose_code', btrim(p_purpose_code), 'input_block_count', v_input_block_count, 'input_lot_count', v_input_lot_count, 'replace_existing', p_replace_existing, 'result', v_result));
  return v_result;
end; $$;

create or replace function public.subdivision_list_draft_development_requirements_v1(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid
) returns table(requirement_code public.subdivision_requirement_code, requirement_state public.subdivision_requirement_state)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments d where d.id = p_development_id and d.organization_id = p_organization_id and d.state = 'draft'::public.party_lifecycle_state) then raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED'; end if;
  return query select r.requirement_code, r.requirement_state from public.subdivision_development_requirements r where r.organization_id = p_organization_id and r.development_id = p_development_id order by r.requirement_code;
end; $$;

create or replace function public.subdivision_upsert_draft_development_requirement_v1(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid, p_requirement_code public.subdivision_requirement_code, p_requirement_state public.subdivision_requirement_state, p_correlation_id uuid
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_existing_result jsonb; v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments d where d.id = p_development_id and d.organization_id = p_organization_id and d.state = 'draft'::public.party_lifecycle_state) then raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED'; end if;
  select event.payload_redacted -> 'result' into v_existing_result from public.admin_audit_events event where event.command_name = 'subdivision_upsert_draft_development_requirement_v1' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_existing_result is not null then return v_existing_result; end if;
  insert into public.subdivision_development_requirements (organization_id, development_id, requirement_code, requirement_state, created_by) values (p_organization_id, p_development_id, p_requirement_code, p_requirement_state, p_actor_user_id) on conflict (organization_id, development_id, requirement_code) do update set requirement_state = excluded.requirement_state, updated_at = now();
  v_result := jsonb_build_object('requirement_code', p_requirement_code::text, 'requirement_state', p_requirement_state::text);
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_upsert_draft_development_requirement_v1', 'allowed', 'subdivision_development', p_development_id, jsonb_build_object('module', p_module::text, 'purpose_code', btrim(p_purpose_code), 'requirement_code', p_requirement_code::text, 'requirement_state', p_requirement_state::text, 'result', v_result));
  return v_result;
end; $$;

revoke all on function public.subdivision_list_draft_physical_structure_v1(uuid, uuid, public.operating_module, text, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_apply_draft_physical_structure_v1(uuid, uuid, public.operating_module, text, uuid, jsonb, boolean, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_draft_development_requirements_v1(uuid, uuid, public.operating_module, text, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_upsert_draft_development_requirement_v1(uuid, uuid, public.operating_module, text, uuid, public.subdivision_requirement_code, public.subdivision_requirement_state, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_list_draft_physical_structure_v1(uuid, uuid, public.operating_module, text, uuid) to service_role;
grant execute on function public.subdivision_apply_draft_physical_structure_v1(uuid, uuid, public.operating_module, text, uuid, jsonb, boolean, uuid) to service_role;
grant execute on function public.subdivision_list_draft_development_requirements_v1(uuid, uuid, public.operating_module, text, uuid) to service_role;
grant execute on function public.subdivision_upsert_draft_development_requirement_v1(uuid, uuid, public.operating_module, text, uuid, public.subdivision_requirement_code, public.subdivision_requirement_state, uuid) to service_role;

comment on table public.subdivision_development_requirements is 'A202: dossiê de pendências estruturado sem documentos, dados pessoais, preço, venda, contrato ou financeiro.';
