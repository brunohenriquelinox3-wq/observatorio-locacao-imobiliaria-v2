-- A9 — Vínculo de ativo urbano para entrada de administração de Locação.
-- Sem disponibilidade, exclusividade, contrato, publicação, garantia, cobrança, repasse ou financeiro.

create table public.rental_management_asset_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  intake_id uuid not null,
  asset_id uuid not null,
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint rental_management_asset_links_intake_tenant_fk foreign key (intake_id, organization_id)
    references public.rental_intakes (id, organization_id) on delete restrict,
  constraint rental_management_asset_links_asset_tenant_fk foreign key (asset_id, organization_id)
    references public.urban_assets (id, organization_id) on delete restrict,
  constraint rental_management_asset_links_intake_unique unique (organization_id, intake_id),
  constraint rental_management_asset_links_tenant_match unique (id, organization_id)
);
create index rental_management_asset_links_context_lookup on public.rental_management_asset_links (organization_id, intake_id, created_at desc);
create index rental_management_asset_links_asset_lookup on public.rental_management_asset_links (organization_id, asset_id, created_at desc);

alter table public.rental_management_asset_links enable row level security;
revoke all on table public.rental_management_asset_links from public, anon, authenticated;

create or replace function public.rental_link_draft_management_asset(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_intake_id uuid,
  p_asset_id uuid,
  p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_link_id uuid; v_journey public.rental_journey_kind;
begin
  perform private.require_rental_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'rental_link_draft_management_asset' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  select intake.journey_kind into v_journey from public.rental_intakes intake
  where intake.id = p_intake_id and intake.organization_id = p_organization_id and intake.state = 'draft';
  if v_journey is distinct from 'management_interest'::public.rental_journey_kind then
    raise exception using errcode = '42501', message = 'RENTAL_MANAGEMENT_INTAKE_REQUIRED';
  end if;
  if not exists (
    select 1 from public.urban_assets asset
    join public.asset_module_states module_state on module_state.asset_id = asset.id and module_state.organization_id = asset.organization_id
    where asset.id = p_asset_id and asset.organization_id = p_organization_id and asset.state = 'draft'
      and module_state.module = 'locacao'::public.operating_module and module_state.lifecycle_state = 'draft'::public.asset_lifecycle_state
  ) then
    raise exception using errcode = '42501', message = 'RENTAL_MANAGEMENT_ASSET_CONTEXT_DENIED';
  end if;
  insert into public.rental_management_asset_links (organization_id, intake_id, asset_id, created_by)
  values (p_organization_id, p_intake_id, p_asset_id, p_actor_user_id)
  on conflict (organization_id, intake_id) do update set asset_id = excluded.asset_id, created_by = excluded.created_by, created_at = now()
  returning id into v_link_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'rental_link_draft_management_asset', 'allowed', 'rental_management_asset_link', v_link_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'journey_kind', v_journey::text));
  return v_link_id;
end; $$;

create or replace function public.rental_list_draft_management_asset_links(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table (
  link_id uuid,
  intake_id uuid,
  asset_id uuid,
  asset_kind public.urban_asset_kind,
  asset_reference_label text,
  asset_internal_reference text,
  linked_at timestamptz
)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_rental_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query
  select link.id, link.intake_id, asset.id, asset.kind, asset.reference_label, asset.internal_reference, link.created_at
  from public.rental_management_asset_links link
  join public.rental_intakes intake on intake.id = link.intake_id and intake.organization_id = link.organization_id
  join public.urban_assets asset on asset.id = link.asset_id and asset.organization_id = link.organization_id
  join public.asset_module_states module_state on module_state.asset_id = asset.id and module_state.organization_id = asset.organization_id
  where link.organization_id = p_organization_id and intake.state = 'draft' and intake.journey_kind = 'management_interest'
    and asset.state = 'draft' and module_state.module = 'locacao'::public.operating_module and module_state.lifecycle_state = 'draft'::public.asset_lifecycle_state
  order by link.created_at desc, link.id asc;
end; $$;

revoke all on function public.rental_link_draft_management_asset(uuid, uuid, public.operating_module, text, uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.rental_list_draft_management_asset_links(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.rental_link_draft_management_asset(uuid, uuid, public.operating_module, text, uuid, uuid, uuid) to service_role;
grant execute on function public.rental_list_draft_management_asset_links(uuid, uuid, public.operating_module, text) to service_role;

comment on table public.rental_management_asset_links is 'A9: vínculo interno de ativo em rascunho para interesse de administração de Locação; não cria disponibilidade, contrato, publicação ou financeiro.';
