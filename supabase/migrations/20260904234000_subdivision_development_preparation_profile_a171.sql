-- A171 — Ficha operacional de preparação do loteamento em rascunho.
-- Sem localização, matrícula, documento, área, custo, contrato, reserva, proposta, cobrança ou financeiro.

create type public.subdivision_planning_state as enum ('reference', 'internal_study', 'project_preparation', 'internal_review');
create type public.subdivision_compliance_preparation_state as enum ('not_started', 'internal_organization', 'evidence_for_review');
create type public.subdivision_implementation_preparation_state as enum ('not_started', 'internal_planning', 'review_required');

create table public.subdivision_development_preparation_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  development_id uuid not null,
  planning_state public.subdivision_planning_state not null default 'reference',
  municipal_preparation_state public.subdivision_compliance_preparation_state not null default 'not_started',
  registration_preparation_state public.subdivision_compliance_preparation_state not null default 'not_started',
  implementation_preparation_state public.subdivision_implementation_preparation_state not null default 'not_started',
  responsible_internal_party_role_id uuid null references public.subdivision_internal_party_roles(id) on delete restrict,
  state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_development_preparation_profile_development_fk foreign key (development_id, organization_id) references public.subdivision_developments(id, organization_id) on delete restrict,
  constraint subdivision_development_preparation_profile_unique unique (organization_id, development_id)
);
create index subdivision_development_preparation_profiles_context_lookup on public.subdivision_development_preparation_profiles (organization_id, state, development_id, updated_at desc);

alter table public.subdivision_development_preparation_profiles enable row level security;
revoke all on table public.subdivision_development_preparation_profiles from public, anon, authenticated;

create or replace function public.subdivision_upsert_draft_development_preparation_profile(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid,
  p_planning_state public.subdivision_planning_state,
  p_municipal_preparation_state public.subdivision_compliance_preparation_state,
  p_registration_preparation_state public.subdivision_compliance_preparation_state,
  p_implementation_preparation_state public.subdivision_implementation_preparation_state,
  p_responsible_internal_party_role_id uuid,
  p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_profile_id uuid;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'subdivision_upsert_draft_development_preparation_profile'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;

  if not exists (
    select 1 from public.subdivision_developments development
    where development.id = p_development_id
      and development.organization_id = p_organization_id
      and development.state = 'draft'
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_PREPARATION_DEVELOPMENT_DENIED';
  end if;

  if p_responsible_internal_party_role_id is not null and not exists (
    select 1 from public.subdivision_internal_party_roles role_link
    where role_link.id = p_responsible_internal_party_role_id
      and role_link.organization_id = p_organization_id
      and role_link.development_id = p_development_id
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_PREPARATION_RESPONSIBLE_DENIED';
  end if;

  insert into public.subdivision_development_preparation_profiles (
    organization_id, development_id, planning_state, municipal_preparation_state,
    registration_preparation_state, implementation_preparation_state,
    responsible_internal_party_role_id, state, created_by
  ) values (
    p_organization_id, p_development_id, p_planning_state, p_municipal_preparation_state,
    p_registration_preparation_state, p_implementation_preparation_state,
    p_responsible_internal_party_role_id, 'draft', p_actor_user_id
  ) on conflict (organization_id, development_id) do update set
    planning_state = excluded.planning_state,
    municipal_preparation_state = excluded.municipal_preparation_state,
    registration_preparation_state = excluded.registration_preparation_state,
    implementation_preparation_state = excluded.implementation_preparation_state,
    responsible_internal_party_role_id = excluded.responsible_internal_party_role_id,
    updated_at = now()
  returning id into v_profile_id;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, organization_id, command_name, outcome,
    target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id,
    'subdivision_upsert_draft_development_preparation_profile', 'allowed',
    'subdivision_development_preparation_profile', v_profile_id,
    jsonb_build_object(
      'module', p_module::text,
      'purpose_code', trim(p_purpose_code),
      'preparation_profile_present', true,
      'responsible_internal_party_role_present', p_responsible_internal_party_role_id is not null
    )
  );
  return v_profile_id;
end; $$;

create or replace function public.subdivision_list_draft_development_preparation_profiles(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table (
  preparation_profile_id uuid,
  development_id uuid,
  planning_state public.subdivision_planning_state,
  municipal_preparation_state public.subdivision_compliance_preparation_state,
  registration_preparation_state public.subdivision_compliance_preparation_state,
  implementation_preparation_state public.subdivision_implementation_preparation_state,
  responsible_internal_party_role_id uuid,
  updated_at timestamptz
)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query
  select profile.id, profile.development_id, profile.planning_state,
    profile.municipal_preparation_state, profile.registration_preparation_state,
    profile.implementation_preparation_state, profile.responsible_internal_party_role_id,
    profile.updated_at
  from public.subdivision_development_preparation_profiles profile
  join public.subdivision_developments development
    on development.id = profile.development_id
    and development.organization_id = profile.organization_id
  where profile.organization_id = p_organization_id
    and profile.state = 'draft'
    and development.state = 'draft'
  order by profile.updated_at desc, profile.id asc;
end; $$;

revoke all on function public.subdivision_upsert_draft_development_preparation_profile(uuid, uuid, public.operating_module, text, uuid, public.subdivision_planning_state, public.subdivision_compliance_preparation_state, public.subdivision_compliance_preparation_state, public.subdivision_implementation_preparation_state, uuid, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_draft_development_preparation_profiles(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.subdivision_upsert_draft_development_preparation_profile(uuid, uuid, public.operating_module, text, uuid, public.subdivision_planning_state, public.subdivision_compliance_preparation_state, public.subdivision_compliance_preparation_state, public.subdivision_implementation_preparation_state, uuid, uuid) to service_role;
grant execute on function public.subdivision_list_draft_development_preparation_profiles(uuid, uuid, public.operating_module, text) to service_role;

comment on table public.subdivision_development_preparation_profiles is 'A171: ficha interna de preparação operacional por loteamento em rascunho; não contém localização, matrícula, documento, área, custo, contrato, reserva, proposta, cobrança ou financeiro.';
