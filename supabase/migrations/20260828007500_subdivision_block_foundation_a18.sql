-- A18 — Quadras matrizes em loteamentos de rascunho.
-- Sem lotes, mapa, estoque, parceiros, clientes, contratos ou financeiro.

create table public.subdivision_blocks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  development_id uuid not null,
  block_number integer not null check (block_number between 1 and 999),
  state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_blocks_development_tenant_fk foreign key (development_id, organization_id)
    references public.subdivision_developments (id, organization_id) on delete restrict,
  constraint subdivision_blocks_number_unique unique (organization_id, development_id, block_number),
  constraint subdivision_blocks_tenant_match unique (id, organization_id)
);
create index subdivision_blocks_context_lookup on public.subdivision_blocks (organization_id, development_id, state, block_number asc);

alter table public.subdivision_blocks enable row level security;
revoke all on table public.subdivision_blocks from public, anon, authenticated;

create or replace function public.subdivision_create_draft_block(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid,
  p_block_number integer,
  p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_block_id uuid;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'subdivision_create_draft_block' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  if not exists (select 1 from public.subdivision_developments development where development.id = p_development_id and development.organization_id = p_organization_id and development.state = 'draft') then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED';
  end if;
  insert into public.subdivision_blocks (organization_id, development_id, block_number, state, created_by)
  values (p_organization_id, p_development_id, p_block_number, 'draft', p_actor_user_id)
  returning id into v_block_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_create_draft_block', 'allowed', 'subdivision_block', v_block_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'development_id_present', true, 'block_number_present', true));
  return v_block_id;
end; $$;

create or replace function public.subdivision_list_draft_blocks(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid
)
returns table (block_id uuid, development_id uuid, block_number integer, created_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments development where development.id = p_development_id and development.organization_id = p_organization_id and development.state = 'draft') then
    raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED';
  end if;
  return query select block.id, block.development_id, block.block_number, block.created_at
  from public.subdivision_blocks block
  where block.organization_id = p_organization_id and block.development_id = p_development_id and block.state = 'draft'
  order by block.block_number asc, block.id asc;
end; $$;

revoke all on function public.subdivision_create_draft_block(uuid, uuid, public.operating_module, text, uuid, integer, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_draft_blocks(uuid, uuid, public.operating_module, text, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_create_draft_block(uuid, uuid, public.operating_module, text, uuid, integer, uuid) to service_role;
grant execute on function public.subdivision_list_draft_blocks(uuid, uuid, public.operating_module, text, uuid) to service_role;

comment on table public.subdivision_blocks is 'A18: Quadra matriz numerada em loteamento de rascunho; não contém lotes, mapa, estoque, parceiros, clientes, contratos ou financeiro.';
