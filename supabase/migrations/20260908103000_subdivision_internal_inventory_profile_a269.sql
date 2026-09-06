-- A269: perfil interno de estoque por Lote.
-- Complementa a matriz física e o estado/evento existente; não cria disponibilidade, reserva comercial, venda, proposta, contrato ou financeiro.

create table if not exists public.subdivision_lot_internal_inventory_profiles (
  organization_id uuid not null,
  lot_id uuid not null,
  inventory_classification text not null default 'standard' check (inventory_classification in ('standard', 'attention', 'technical')),
  review_state text not null default 'not_reviewed' check (review_state in ('not_reviewed', 'reviewed', 'needs_review')),
  map_legend text not null default 'base' check (map_legend in ('base', 'attention', 'technical')),
  internal_note text null check (internal_note is null or char_length(internal_note) between 1 and 280),
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, lot_id),
  foreign key (lot_id) references public.subdivision_lots(id) on delete restrict
);

alter table public.subdivision_lot_internal_inventory_profiles enable row level security;

create or replace function public.subdivision_list_draft_lot_internal_inventory_profiles_v1(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid
) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);

  if not exists (
    select 1 from public.subdivision_developments development
    where development.id = p_development_id
      and development.organization_id = p_organization_id
      and development.state = 'draft'::public.party_lifecycle_state
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_INTERNAL_INVENTORY_DEVELOPMENT_DENIED';
  end if;

  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'block_id', block.id,
      'block_number', block.block_number,
      'lot_number', lot.lot_number,
      'profile_recorded', profile.lot_id is not null,
      'inventory_classification', coalesce(profile.inventory_classification, 'standard'),
      'review_state', coalesce(profile.review_state, 'not_reviewed'),
      'map_legend', coalesce(profile.map_legend, 'base'),
      'internal_note', profile.internal_note,
      'updated_at', profile.updated_at
    ) order by block.block_number, lot.lot_number), '[]'::jsonb)
    from public.subdivision_blocks block
    join public.subdivision_lots lot
      on lot.organization_id = block.organization_id
      and lot.block_id = block.id
      and lot.state = 'draft'::public.party_lifecycle_state
    left join public.subdivision_lot_internal_inventory_profiles profile
      on profile.organization_id = lot.organization_id
      and profile.lot_id = lot.id
    where block.organization_id = p_organization_id
      and block.development_id = p_development_id
      and block.state = 'draft'::public.party_lifecycle_state
  );
end; $$;

create or replace function public.subdivision_upsert_draft_lot_internal_inventory_profile_v1(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid,
  p_block_id uuid,
  p_lot_number integer,
  p_inventory_classification text,
  p_review_state text,
  p_map_legend text,
  p_internal_note text,
  p_correlation_id uuid
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_lot_id uuid;
  v_existing_target uuid;
  v_note text;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);

  if p_inventory_classification not in ('standard', 'attention', 'technical')
    or p_review_state not in ('not_reviewed', 'reviewed', 'needs_review')
    or p_map_legend not in ('base', 'attention', 'technical') then
    raise exception using errcode = '22023', message = 'SUBDIVISION_INTERNAL_INVENTORY_PROFILE_INVALID';
  end if;

  v_note := nullif(btrim(coalesce(p_internal_note, '')), '');
  if v_note is not null and char_length(v_note) > 280 then
    raise exception using errcode = '22023', message = 'SUBDIVISION_INTERNAL_INVENTORY_NOTE_INVALID';
  end if;

  select event.target_id into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'subdivision_upsert_draft_lot_internal_inventory_profile_v1'
    and event.correlation_id = p_correlation_id
    and event.actor_user_id = p_actor_user_id
    and event.organization_id = p_organization_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;
  if v_existing_target is not null then return v_existing_target; end if;

  select lot.id into v_lot_id
  from public.subdivision_lots lot
  join public.subdivision_blocks block
    on block.id = lot.block_id
    and block.organization_id = lot.organization_id
  join public.subdivision_developments development
    on development.id = block.development_id
    and development.organization_id = block.organization_id
  where lot.organization_id = p_organization_id
    and lot.block_id = p_block_id
    and lot.lot_number = p_lot_number
    and lot.state = 'draft'::public.party_lifecycle_state
    and block.state = 'draft'::public.party_lifecycle_state
    and development.id = p_development_id
    and development.state = 'draft'::public.party_lifecycle_state;
  if v_lot_id is null then
    raise exception using errcode = '42501', message = 'SUBDIVISION_INTERNAL_INVENTORY_LOT_CONTEXT_DENIED';
  end if;

  insert into public.subdivision_lot_internal_inventory_profiles (
    organization_id, lot_id, inventory_classification, review_state, map_legend, internal_note, created_by, updated_by
  ) values (
    p_organization_id, v_lot_id, p_inventory_classification, p_review_state, p_map_legend, v_note, p_actor_user_id, p_actor_user_id
  ) on conflict (organization_id, lot_id) do update set
    inventory_classification = excluded.inventory_classification,
    review_state = excluded.review_state,
    map_legend = excluded.map_legend,
    internal_note = excluded.internal_note,
    updated_by = excluded.updated_by,
    updated_at = now();

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id,
    'subdivision_upsert_draft_lot_internal_inventory_profile_v1', 'allowed', 'subdivision_lot', v_lot_id,
    jsonb_build_object(
      'module', p_module::text,
      'purpose_code', btrim(p_purpose_code),
      'internal_inventory_profile_updated', true,
      'classification', p_inventory_classification,
      'review_state', p_review_state,
      'map_legend', p_map_legend,
      'has_internal_note', v_note is not null
    )
  );

  return v_lot_id;
end; $$;

revoke all on table public.subdivision_lot_internal_inventory_profiles from public, anon, authenticated;
revoke all on function public.subdivision_list_draft_lot_internal_inventory_profiles_v1(uuid, uuid, public.operating_module, text, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_upsert_draft_lot_internal_inventory_profile_v1(uuid, uuid, public.operating_module, text, uuid, uuid, integer, text, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_list_draft_lot_internal_inventory_profiles_v1(uuid, uuid, public.operating_module, text, uuid) to service_role;
grant execute on function public.subdivision_upsert_draft_lot_internal_inventory_profile_v1(uuid, uuid, public.operating_module, text, uuid, uuid, integer, text, text, text, text, uuid) to service_role;
