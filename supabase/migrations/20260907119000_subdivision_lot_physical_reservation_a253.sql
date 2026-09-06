-- A253: reserva física não comercial por Lote, segregada de disponibilidade, venda, contrato e financeiro.

create type public.subdivision_lot_physical_reservation_purpose as enum ('landowner_reserve','technical_artesian_well','technical_water_tank','technical_other');

create table public.subdivision_lot_physical_reservations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lot_id uuid not null,
  reservation_purpose public.subdivision_lot_physical_reservation_purpose not null,
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_lot_physical_reservations_lot_fk foreign key(lot_id, organization_id) references public.subdivision_lots(id, organization_id) on delete restrict,
  constraint subdivision_lot_physical_reservations_unique unique(organization_id, lot_id)
);
alter table public.subdivision_lot_physical_reservations enable row level security;
revoke all on table public.subdivision_lot_physical_reservations from public, anon, authenticated;

create or replace function public.subdivision_list_draft_physical_structure_v2(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid)
returns table (block_id uuid, block_number integer, sector_reference text, block_typology public.subdivision_block_typology, lots jsonb)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments d where d.id = p_development_id and d.organization_id = p_organization_id and d.state = 'draft'::public.party_lifecycle_state) then raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED'; end if;
  return query select block.id, block.block_number, block.sector_reference, block.block_typology,
    coalesce(jsonb_agg(jsonb_build_object('lot_number', lot.lot_number, 'area_sqm', lot.area_sqm, 'frontage_m', lot.frontage_m, 'depth_m', lot.depth_m, 'lot_typology', lot.lot_typology::text, 'position_code', lot.position_code::text, 'reservation_purpose', reservation.reservation_purpose::text) order by lot.lot_number) filter (where lot.id is not null), '[]'::jsonb)
  from public.subdivision_blocks block
  left join public.subdivision_lots lot on lot.block_id = block.id and lot.organization_id = p_organization_id and lot.state = 'draft'::public.party_lifecycle_state
  left join public.subdivision_lot_physical_reservations reservation on reservation.lot_id = lot.id and reservation.organization_id = lot.organization_id
  where block.organization_id = p_organization_id and block.development_id = p_development_id and block.state = 'draft'::public.party_lifecycle_state
  group by block.id, block.block_number, block.sector_reference, block.block_typology order by block.block_number, block.id;
end; $$;

create or replace function public.subdivision_upsert_draft_lot_physical_reservation_v1(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid, p_block_id uuid, p_lot_number integer, p_reservation_purpose public.subdivision_lot_physical_reservation_purpose, p_correlation_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_existing_result jsonb; v_lot_id uuid; v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.payload_redacted -> 'result' into v_existing_result from public.admin_audit_events event where event.command_name = 'subdivision_upsert_draft_lot_physical_reservation_v1' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_existing_result is not null then return v_existing_result; end if;
  select lot.id into v_lot_id from public.subdivision_lots lot join public.subdivision_blocks block on block.id = lot.block_id and block.organization_id = lot.organization_id where lot.organization_id = p_organization_id and lot.block_id = p_block_id and lot.lot_number = p_lot_number and lot.state = 'draft'::public.party_lifecycle_state and block.state = 'draft'::public.party_lifecycle_state and block.development_id = p_development_id;
  if v_lot_id is null then raise exception using errcode = '42501', message = 'SUBDIVISION_LOT_CONTEXT_DENIED'; end if;
  insert into public.subdivision_lot_physical_reservations(organization_id, lot_id, reservation_purpose, created_by) values(p_organization_id, v_lot_id, p_reservation_purpose, p_actor_user_id) on conflict(organization_id, lot_id) do update set reservation_purpose = excluded.reservation_purpose, created_by = excluded.created_by, updated_at = now();
  v_result := jsonb_build_object('reservation_purpose', p_reservation_purpose::text);
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_upsert_draft_lot_physical_reservation_v1', 'allowed', 'subdivision_lot', v_lot_id, jsonb_build_object('module', p_module::text, 'purpose_code', btrim(p_purpose_code), 'reservation_purpose', p_reservation_purpose::text, 'result', v_result));
  return v_result;
end; $$;

revoke all on function public.subdivision_list_draft_physical_structure_v2(uuid, uuid, public.operating_module, text, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_upsert_draft_lot_physical_reservation_v1(uuid, uuid, public.operating_module, text, uuid, uuid, integer, public.subdivision_lot_physical_reservation_purpose, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_list_draft_physical_structure_v2(uuid, uuid, public.operating_module, text, uuid) to service_role;
grant execute on function public.subdivision_upsert_draft_lot_physical_reservation_v1(uuid, uuid, public.operating_module, text, uuid, uuid, integer, public.subdivision_lot_physical_reservation_purpose, uuid) to service_role;
