-- A6 — Ativo urbano, relação contextual de Party e estado por módulo.
-- Sem endereço preciso, matrícula, mídia, anúncio, preço, contrato ou financeiro.

create type public.urban_asset_kind as enum (
  'apartment', 'house', 'kitnet', 'commercial_unit', 'urban_lot', 'building', 'other_urban_asset'
);
create type public.asset_lifecycle_state as enum ('draft', 'preparing', 'eligible', 'blocked', 'withdrawn');
create type public.asset_party_relation_kind as enum ('ownership_claim', 'management_authority');

alter table public.party_records
  add constraint party_records_tenant_match unique (id, organization_id);

create table public.urban_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  kind public.urban_asset_kind not null,
  reference_label text not null check (char_length(trim(reference_label)) between 2 and 160),
  internal_reference text not null check (internal_reference ~ '^[A-Z0-9][A-Z0-9_-]{1,63}$'),
  state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint urban_assets_tenant_reference_unique unique (organization_id, internal_reference),
  constraint urban_assets_tenant_match unique (id, organization_id)
);
create index urban_assets_organization_state_lookup on public.urban_assets (organization_id, state, created_at desc);

create table public.asset_party_relations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  asset_id uuid not null,
  party_id uuid not null,
  relation public.asset_party_relation_kind not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint asset_party_relations_window check (ends_at is null or ends_at > starts_at),
  constraint asset_party_relations_asset_tenant_fk foreign key (asset_id, organization_id)
    references public.urban_assets (id, organization_id) on delete restrict,
  constraint asset_party_relations_party_tenant_fk foreign key (party_id, organization_id)
    references public.party_records (id, organization_id) on delete restrict
);
create index asset_party_relations_context_lookup on public.asset_party_relations (organization_id, asset_id, relation, state);

create table public.asset_module_states (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  asset_id uuid not null,
  module public.operating_module not null,
  lifecycle_state public.asset_lifecycle_state not null default 'draft',
  reason_code text,
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint asset_module_states_blocked_reason check (lifecycle_state <> 'blocked' or reason_code is not null),
  constraint asset_module_states_asset_tenant_fk foreign key (asset_id, organization_id)
    references public.urban_assets (id, organization_id) on delete restrict,
  constraint asset_module_states_tenant_module_unique unique (organization_id, asset_id, module)
);
create index asset_module_states_context_lookup on public.asset_module_states (organization_id, module, lifecycle_state, updated_at desc);

alter table public.urban_assets enable row level security;
alter table public.asset_party_relations enable row level security;
alter table public.asset_module_states enable row level security;
revoke all on table public.urban_assets from public, anon, authenticated;
revoke all on table public.asset_party_relations from public, anon, authenticated;
revoke all on table public.asset_module_states from public, anon, authenticated;

create or replace function public.domain_create_draft_urban_asset(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_kind public.urban_asset_kind,
  p_reference_label text,
  p_internal_reference text,
  p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_asset_id uuid;
begin
  perform private.require_domain_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'domain_create_draft_urban_asset' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  insert into public.urban_assets (organization_id, kind, reference_label, internal_reference, state, created_by)
  values (p_organization_id, p_kind, trim(p_reference_label), trim(p_internal_reference), 'draft', p_actor_user_id)
  returning id into v_asset_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'domain_create_draft_urban_asset', 'allowed', 'urban_asset', v_asset_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'kind', p_kind::text));
  return v_asset_id;
end; $$;

create or replace function public.domain_attach_draft_asset_party(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_asset_id uuid,
  p_party_id uuid,
  p_relation public.asset_party_relation_kind,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_relation_id uuid;
begin
  perform private.require_domain_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'domain_attach_draft_asset_party' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  if not exists (select 1 from public.urban_assets asset where asset.id = p_asset_id and asset.organization_id = p_organization_id and asset.state = 'draft')
    or not exists (select 1 from public.party_records party where party.id = p_party_id and party.organization_id = p_organization_id and party.state = 'draft') then
    raise exception using errcode = '42501', message = 'ASSET_PARTY_CONTEXT_DENIED';
  end if;
  insert into public.asset_party_relations (organization_id, asset_id, party_id, relation, starts_at, ends_at, state, created_by)
  values (p_organization_id, p_asset_id, p_party_id, p_relation, coalesce(p_starts_at, now()), p_ends_at, 'draft', p_actor_user_id)
  returning id into v_relation_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'domain_attach_draft_asset_party', 'allowed', 'asset_party_relation', v_relation_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'relation', p_relation::text));
  return v_relation_id;
end; $$;

create or replace function public.domain_set_draft_asset_module_state(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_asset_id uuid,
  p_state public.asset_lifecycle_state,
  p_reason_code text,
  p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_state_id uuid;
begin
  perform private.require_domain_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'domain_set_draft_asset_module_state' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  if not exists (select 1 from public.urban_assets asset where asset.id = p_asset_id and asset.organization_id = p_organization_id and asset.state = 'draft') then
    raise exception using errcode = '42501', message = 'ASSET_CONTEXT_DENIED';
  end if;
  insert into public.asset_module_states (organization_id, asset_id, module, lifecycle_state, reason_code, created_by)
  values (p_organization_id, p_asset_id, p_module, p_state, nullif(trim(p_reason_code), ''), p_actor_user_id)
  on conflict (organization_id, asset_id, module) do update set lifecycle_state = excluded.lifecycle_state, reason_code = excluded.reason_code, updated_at = now(), created_by = excluded.created_by
  returning id into v_state_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'domain_set_draft_asset_module_state', 'allowed', 'asset_module_state', v_state_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'state', p_state::text, 'reason_code_present', p_reason_code is not null));
  return v_state_id;
end; $$;

revoke all on function public.domain_create_draft_urban_asset(uuid, uuid, public.operating_module, text, public.urban_asset_kind, text, text, uuid) from public, anon, authenticated;
revoke all on function public.domain_attach_draft_asset_party(uuid, uuid, public.operating_module, text, uuid, uuid, public.asset_party_relation_kind, timestamptz, timestamptz, uuid) from public, anon, authenticated;
revoke all on function public.domain_set_draft_asset_module_state(uuid, uuid, public.operating_module, text, uuid, public.asset_lifecycle_state, text, uuid) from public, anon, authenticated;
grant execute on function public.domain_create_draft_urban_asset(uuid, uuid, public.operating_module, text, public.urban_asset_kind, text, text, uuid) to service_role;
grant execute on function public.domain_attach_draft_asset_party(uuid, uuid, public.operating_module, text, uuid, uuid, public.asset_party_relation_kind, timestamptz, timestamptz, uuid) to service_role;
grant execute on function public.domain_set_draft_asset_module_state(uuid, uuid, public.operating_module, text, uuid, public.asset_lifecycle_state, text, uuid) to service_role;

comment on table public.urban_assets is 'A6: ativo urbano minimizado; sem endereço preciso, registro, mídia, anúncio, preço, contrato ou financeiro.';
comment on table public.asset_party_relations is 'A6: alegação de titularidade ou autoridade de gestão; não prova domínio, representação ou contrato.';
comment on table public.asset_module_states is 'A6: estado de trabalho por módulo; não publica, reserva, loca, vende, contrata ou gera efeito financeiro.';
