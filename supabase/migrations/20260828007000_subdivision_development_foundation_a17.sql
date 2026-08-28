-- A17 — Cadastro-base de loteamento em rascunho.
-- Sem localização, quadras, lotes, estoque, parceiros, clientes, contratos ou financeiro.

create type public.subdivision_development_phase as enum ('preliminary_reference', 'structuring', 'review_required');

create table public.subdivision_developments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  internal_reference text not null check (internal_reference ~ '^[A-Z][A-Z0-9_]{2,79}$'),
  working_phase public.subdivision_development_phase not null default 'preliminary_reference',
  state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_developments_reference_tenant_unique unique (organization_id, internal_reference),
  constraint subdivision_developments_tenant_match unique (id, organization_id)
);
create index subdivision_developments_context_lookup on public.subdivision_developments (organization_id, state, working_phase, created_at desc);

alter table public.subdivision_developments enable row level security;
revoke all on table public.subdivision_developments from public, anon, authenticated;

create or replace function private.require_subdivision_draft_authority(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_module <> 'loteadora'::public.operating_module then
    raise exception using errcode = '42501', message = 'SUBDIVISION_MODULE_DENIED';
  end if;
  perform private.require_domain_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
end; $$;

create or replace function public.subdivision_create_draft_development(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_internal_reference text,
  p_working_phase public.subdivision_development_phase,
  p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_development_id uuid;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'subdivision_create_draft_development' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  insert into public.subdivision_developments (organization_id, internal_reference, working_phase, state, created_by)
  values (p_organization_id, trim(p_internal_reference), p_working_phase, 'draft', p_actor_user_id)
  returning id into v_development_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_create_draft_development', 'allowed', 'subdivision_development', v_development_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'working_phase', p_working_phase::text, 'internal_reference_present', true));
  return v_development_id;
end; $$;

create or replace function public.subdivision_list_draft_developments(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table (
  development_id uuid,
  internal_reference text,
  working_phase public.subdivision_development_phase,
  created_at timestamptz
)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query select development.id, development.internal_reference, development.working_phase, development.created_at
  from public.subdivision_developments development
  where development.organization_id = p_organization_id and development.state = 'draft'
  order by development.created_at desc, development.id asc;
end; $$;

revoke all on function private.require_subdivision_draft_authority(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
revoke all on function public.subdivision_create_draft_development(uuid, uuid, public.operating_module, text, text, public.subdivision_development_phase, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_draft_developments(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.subdivision_create_draft_development(uuid, uuid, public.operating_module, text, text, public.subdivision_development_phase, uuid) to service_role;
grant execute on function public.subdivision_list_draft_developments(uuid, uuid, public.operating_module, text) to service_role;

comment on table public.subdivision_developments is 'A17: loteamento em rascunho com referência interna e situação de trabalho; não contém localização, quadras, lotes, estoque, parceiros, clientes, contratos ou financeiro.';
