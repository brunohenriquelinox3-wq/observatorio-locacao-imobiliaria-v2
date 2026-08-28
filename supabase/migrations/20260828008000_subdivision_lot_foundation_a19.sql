-- A19 — Lotes numerados em Quadras matrizes de rascunho.
-- Sem disponibilidade, mapa, reserva, cliente, contrato ou financeiro.

create table public.subdivision_lots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  block_id uuid not null,
  lot_number integer not null check (lot_number between 1 and 100),
  state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_lots_block_tenant_fk foreign key (block_id, organization_id)
    references public.subdivision_blocks (id, organization_id) on delete restrict,
  constraint subdivision_lots_number_unique unique (organization_id, block_id, lot_number)
);
create index subdivision_lots_context_lookup on public.subdivision_lots (organization_id, block_id, state, lot_number asc);
alter table public.subdivision_lots enable row level security;
revoke all on table public.subdivision_lots from public, anon, authenticated;

create or replace function public.subdivision_create_draft_lot(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_block_id uuid, p_lot_number integer, p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_lot_id uuid;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event where event.command_name = 'subdivision_create_draft_lot' and event.correlation_id = p_correlation_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  if not exists (select 1 from public.subdivision_blocks block where block.id = p_block_id and block.organization_id = p_organization_id and block.state = 'draft') then raise exception using errcode = '42501', message = 'SUBDIVISION_BLOCK_CONTEXT_DENIED'; end if;
  insert into public.subdivision_lots (organization_id, block_id, lot_number, state, created_by) values (p_organization_id, p_block_id, p_lot_number, 'draft', p_actor_user_id) returning id into v_lot_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_create_draft_lot', 'allowed', 'subdivision_lot', v_lot_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'block_id_present', true, 'lot_number_present', true));
  return v_lot_id;
end; $$;

create or replace function public.subdivision_list_draft_lots(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_block_id uuid
) returns table (lot_id uuid, block_id uuid, lot_number integer, created_at timestamptz) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_blocks block where block.id = p_block_id and block.organization_id = p_organization_id and block.state = 'draft') then raise exception using errcode = '42501', message = 'SUBDIVISION_BLOCK_CONTEXT_DENIED'; end if;
  return query select lot.id, lot.block_id, lot.lot_number, lot.created_at from public.subdivision_lots lot where lot.organization_id = p_organization_id and lot.block_id = p_block_id and lot.state = 'draft' order by lot.lot_number asc, lot.id asc;
end; $$;

revoke all on function public.subdivision_create_draft_lot(uuid, uuid, public.operating_module, text, uuid, integer, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_draft_lots(uuid, uuid, public.operating_module, text, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_create_draft_lot(uuid, uuid, public.operating_module, text, uuid, integer, uuid) to service_role;
grant execute on function public.subdivision_list_draft_lots(uuid, uuid, public.operating_module, text, uuid) to service_role;
