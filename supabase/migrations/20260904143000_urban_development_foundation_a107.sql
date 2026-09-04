-- A107 — Estrutura urbana em rascunho. Sem construtora vinculada, endereço, unidades, estoque, valores, proposta, contrato ou financeiro.
create type public.urban_development_kind as enum ('condominium', 'tower', 'mixed_use', 'single_building', 'other');
create type public.urban_development_phase as enum ('reference', 'structuring', 'review_required');
create table public.urban_developments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  internal_reference text not null check (internal_reference ~ '^[A-Z][A-Z0-9_]{2,79}$'), development_kind public.urban_development_kind not null,
  working_phase public.urban_development_phase not null default 'reference', state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint urban_developments_reference_tenant_unique unique (organization_id, internal_reference)
);
create index urban_developments_context_lookup on public.urban_developments (organization_id, state, working_phase, created_at desc);
alter table public.urban_developments enable row level security; revoke all on table public.urban_developments from public, anon, authenticated;
create or replace function public.urban_create_draft_development(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_internal_reference text, p_development_kind public.urban_development_kind, p_working_phase public.urban_development_phase, p_correlation_id uuid) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_development_id uuid; begin
  perform private.require_urban_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select target_id into v_existing_target from public.admin_audit_events where command_name = 'urban_create_draft_development' and correlation_id = p_correlation_id and outcome = 'allowed' order by occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  insert into public.urban_developments (organization_id, internal_reference, development_kind, working_phase, state, created_by) values (p_organization_id, trim(p_internal_reference), p_development_kind, p_working_phase, 'draft', p_actor_user_id) returning id into v_development_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'urban_create_draft_development', 'allowed', 'urban_development', v_development_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'development_kind', p_development_kind::text, 'working_phase', p_working_phase::text, 'internal_reference_present', true)); return v_development_id;
end; $$;
create or replace function public.urban_list_draft_developments(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text) returns table (development_id uuid, internal_reference text, development_kind public.urban_development_kind, working_phase public.urban_development_phase, created_at timestamptz) language plpgsql security definer set search_path = '' as $$ begin
  perform private.require_urban_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query select d.id, d.internal_reference, d.development_kind, d.working_phase, d.created_at from public.urban_developments d where d.organization_id = p_organization_id and d.state = 'draft' order by d.created_at desc, d.id asc;
end; $$;
revoke all on function public.urban_create_draft_development(uuid, uuid, public.operating_module, text, text, public.urban_development_kind, public.urban_development_phase, uuid) from public, anon, authenticated;
revoke all on function public.urban_list_draft_developments(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.urban_create_draft_development(uuid, uuid, public.operating_module, text, text, public.urban_development_kind, public.urban_development_phase, uuid) to service_role;
grant execute on function public.urban_list_draft_developments(uuid, uuid, public.operating_module, text) to service_role;
comment on table public.urban_developments is 'A107: estrutura urbana mínima em rascunho; sem construtora vinculada, endereço, unidades, estoque, preços, propostas, contratos ou financeiro.';
