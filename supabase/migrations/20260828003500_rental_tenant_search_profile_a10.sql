-- A10 — Perfil de busca de locatário em rascunho.
-- Sem endereço, CEP, geolocalização, preço, renda, contato, análise, garantia, contrato ou financeiro.

create type public.rental_search_occupancy_timing as enum ('immediate', 'up_to_30_days', 'flexible');

create table public.rental_tenant_search_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  intake_id uuid not null,
  accepted_asset_kinds public.urban_asset_kind[] not null check (cardinality(accepted_asset_kinds) between 1 and 4),
  occupancy_timing public.rental_search_occupancy_timing not null,
  preference_code text not null check (preference_code ~ '^[A-Z][A-Z0-9_]{2,79}$'),
  state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rental_tenant_search_profiles_intake_tenant_fk foreign key (intake_id, organization_id)
    references public.rental_intakes (id, organization_id) on delete restrict,
  constraint rental_tenant_search_profiles_intake_unique unique (organization_id, intake_id),
  constraint rental_tenant_search_profiles_tenant_match unique (id, organization_id)
);
create index rental_tenant_search_profiles_context_lookup on public.rental_tenant_search_profiles (organization_id, state, occupancy_timing, updated_at desc);

alter table public.rental_tenant_search_profiles enable row level security;
revoke all on table public.rental_tenant_search_profiles from public, anon, authenticated;

create or replace function public.rental_upsert_draft_tenant_search_profile(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_intake_id uuid,
  p_accepted_asset_kinds public.urban_asset_kind[],
  p_occupancy_timing public.rental_search_occupancy_timing,
  p_preference_code text,
  p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_profile_id uuid; v_journey public.rental_journey_kind;
begin
  perform private.require_rental_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'rental_upsert_draft_tenant_search_profile' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  select intake.journey_kind into v_journey from public.rental_intakes intake
  where intake.id = p_intake_id and intake.organization_id = p_organization_id and intake.state = 'draft';
  if v_journey is distinct from 'tenant_interest'::public.rental_journey_kind then
    raise exception using errcode = '42501', message = 'RENTAL_TENANT_INTAKE_REQUIRED';
  end if;
  if cardinality(p_accepted_asset_kinds) not between 1 and 4 then
    raise exception using errcode = '22023', message = 'RENTAL_SEARCH_ASSET_KINDS_REQUIRED';
  end if;
  insert into public.rental_tenant_search_profiles (organization_id, intake_id, accepted_asset_kinds, occupancy_timing, preference_code, state, created_by)
  values (p_organization_id, p_intake_id, p_accepted_asset_kinds, p_occupancy_timing, trim(p_preference_code), 'draft', p_actor_user_id)
  on conflict (organization_id, intake_id) do update set accepted_asset_kinds = excluded.accepted_asset_kinds,
    occupancy_timing = excluded.occupancy_timing, preference_code = excluded.preference_code, updated_at = now(), created_by = excluded.created_by
  returning id into v_profile_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'rental_upsert_draft_tenant_search_profile', 'allowed', 'rental_tenant_search_profile', v_profile_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'journey_kind', v_journey::text,
      'asset_kind_count', cardinality(p_accepted_asset_kinds), 'occupancy_timing', p_occupancy_timing::text, 'preference_code_present', nullif(trim(p_preference_code), '') is not null));
  return v_profile_id;
end; $$;

create or replace function public.rental_list_draft_tenant_search_profiles(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table (
  profile_id uuid,
  intake_id uuid,
  accepted_asset_kinds public.urban_asset_kind[],
  occupancy_timing public.rental_search_occupancy_timing,
  preference_code text,
  created_at timestamptz
)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_rental_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query
  select profile.id, profile.intake_id, profile.accepted_asset_kinds, profile.occupancy_timing, profile.preference_code, profile.created_at
  from public.rental_tenant_search_profiles profile
  join public.rental_intakes intake on intake.id = profile.intake_id and intake.organization_id = profile.organization_id
  where profile.organization_id = p_organization_id and profile.state = 'draft' and intake.state = 'draft'
    and intake.journey_kind = 'tenant_interest'::public.rental_journey_kind
  order by profile.updated_at desc, profile.id asc;
end; $$;

revoke all on function public.rental_upsert_draft_tenant_search_profile(uuid, uuid, public.operating_module, text, uuid, public.urban_asset_kind[], public.rental_search_occupancy_timing, text, uuid) from public, anon, authenticated;
revoke all on function public.rental_list_draft_tenant_search_profiles(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.rental_upsert_draft_tenant_search_profile(uuid, uuid, public.operating_module, text, uuid, public.urban_asset_kind[], public.rental_search_occupancy_timing, text, uuid) to service_role;
grant execute on function public.rental_list_draft_tenant_search_profiles(uuid, uuid, public.operating_module, text) to service_role;

comment on table public.rental_tenant_search_profiles is 'A10: perfil interno de busca em rascunho para interesse de locatário; não contém endereço, preço, dados pessoais, análise, contrato ou financeiro.';
