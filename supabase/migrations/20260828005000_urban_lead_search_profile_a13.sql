-- A13 — Perfil de busca urbano em rascunho.
-- Sem endereço, preço, contato, crédito, financiamento, proposta, reserva, contrato ou financeiro.

create type public.urban_search_timing as enum ('immediate', 'up_to_90_days', 'flexible');

create table public.urban_lead_search_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid not null,
  accepted_asset_kinds public.urban_asset_kind[] not null,
  search_timing public.urban_search_timing not null,
  preference_code text,
  state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint urban_lead_search_profiles_kind_count check (cardinality(accepted_asset_kinds) between 1 and 7),
  constraint urban_lead_search_profiles_preference_code check (preference_code is null or preference_code ~ '^[A-Z][A-Z0-9_]{2,79}$'),
  constraint urban_lead_search_profiles_lead_tenant_fk foreign key (lead_id, organization_id)
    references public.urban_leads (id, organization_id) on delete restrict,
  constraint urban_lead_search_profiles_lead_unique unique (organization_id, lead_id),
  constraint urban_lead_search_profiles_tenant_match unique (id, organization_id)
);
create index urban_lead_search_profiles_context_lookup on public.urban_lead_search_profiles (organization_id, state, search_timing, updated_at desc);

alter table public.urban_lead_search_profiles enable row level security;
revoke all on table public.urban_lead_search_profiles from public, anon, authenticated;

create or replace function public.urban_upsert_draft_lead_search_profile(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_lead_id uuid,
  p_accepted_asset_kinds public.urban_asset_kind[],
  p_search_timing public.urban_search_timing,
  p_preference_code text,
  p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_profile_id uuid; v_interest text;
begin
  perform private.require_urban_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'urban_upsert_draft_lead_search_profile' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  select lead.interest_kind into v_interest from public.urban_leads lead
  where lead.id = p_lead_id and lead.organization_id = p_organization_id and lead.state = 'draft';
  if v_interest is distinct from 'search_profile' then
    raise exception using errcode = '42501', message = 'URBAN_SEARCH_PROFILE_INTEREST_REQUIRED';
  end if;
  if cardinality(p_accepted_asset_kinds) is null or cardinality(p_accepted_asset_kinds) not between 1 and 7
    or cardinality(p_accepted_asset_kinds) <> cardinality(array(select distinct unnest(p_accepted_asset_kinds))) then
    raise exception using errcode = '42501', message = 'URBAN_SEARCH_PROFILE_KINDS_DENIED';
  end if;
  insert into public.urban_lead_search_profiles (organization_id, lead_id, accepted_asset_kinds, search_timing, preference_code, state, created_by)
  values (p_organization_id, p_lead_id, p_accepted_asset_kinds, p_search_timing, nullif(trim(p_preference_code), ''), 'draft', p_actor_user_id)
  on conflict (organization_id, lead_id) do update set accepted_asset_kinds = excluded.accepted_asset_kinds, search_timing = excluded.search_timing,
    preference_code = excluded.preference_code, updated_at = now(), created_by = excluded.created_by
  returning id into v_profile_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'urban_upsert_draft_lead_search_profile', 'allowed', 'urban_lead_search_profile', v_profile_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'interest_kind', v_interest,
      'asset_kind_count', cardinality(p_accepted_asset_kinds), 'search_timing', p_search_timing::text,
      'preference_present', nullif(trim(p_preference_code), '') is not null));
  return v_profile_id;
end; $$;

create or replace function public.urban_list_draft_lead_search_profiles(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table (
  profile_id uuid,
  lead_id uuid,
  accepted_asset_kinds public.urban_asset_kind[],
  search_timing public.urban_search_timing,
  preference_present boolean,
  updated_at timestamptz
)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_urban_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query
  select profile.id, profile.lead_id, profile.accepted_asset_kinds, profile.search_timing, profile.preference_code is not null, profile.updated_at
  from public.urban_lead_search_profiles profile
  join public.urban_leads lead on lead.id = profile.lead_id and lead.organization_id = profile.organization_id
  where profile.organization_id = p_organization_id and profile.state = 'draft' and lead.state = 'draft' and lead.interest_kind = 'search_profile'
  order by profile.updated_at desc, profile.id asc;
end; $$;

revoke all on function public.urban_upsert_draft_lead_search_profile(uuid, uuid, public.operating_module, text, uuid, public.urban_asset_kind[], public.urban_search_timing, text, uuid) from public, anon, authenticated;
revoke all on function public.urban_list_draft_lead_search_profiles(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.urban_upsert_draft_lead_search_profile(uuid, uuid, public.operating_module, text, uuid, public.urban_asset_kind[], public.urban_search_timing, text, uuid) to service_role;
grant execute on function public.urban_list_draft_lead_search_profiles(uuid, uuid, public.operating_module, text) to service_role;

comment on table public.urban_lead_search_profiles is 'A13: perfil de busca urbano em rascunho para lead com interesse de busca; não armazena preço, endereço, crédito, financiamento, proposta, reserva, contrato ou financeiro.';
