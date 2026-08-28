-- A6.1 — leitura contextual e minimizada do núcleo de ativos urbanos.

create or replace function public.domain_list_draft_urban_assets(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table (
  asset_id uuid,
  kind text,
  reference_label text,
  internal_reference text,
  module_state text,
  state_reason_present boolean,
  party_relation_count bigint
)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_domain_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query
  select
    asset.id,
    asset.kind::text,
    asset.reference_label,
    asset.internal_reference,
    coalesce(module_state.lifecycle_state::text, 'draft'),
    coalesce(module_state.reason_code is not null, false),
    count(relation.id)::bigint
  from public.urban_assets asset
  left join public.asset_module_states module_state
    on module_state.asset_id = asset.id
    and module_state.organization_id = asset.organization_id
    and module_state.module = p_module
  left join public.asset_party_relations relation
    on relation.asset_id = asset.id
    and relation.organization_id = asset.organization_id
    and relation.state = 'draft'
  where asset.organization_id = p_organization_id
    and asset.state = 'draft'
  group by asset.id, asset.kind, asset.reference_label, asset.internal_reference, module_state.lifecycle_state, module_state.reason_code
  order by asset.created_at desc, asset.id desc;
end; $$;

revoke all on function public.domain_list_draft_urban_assets(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.domain_list_draft_urban_assets(uuid, uuid, public.operating_module, text) to service_role;
