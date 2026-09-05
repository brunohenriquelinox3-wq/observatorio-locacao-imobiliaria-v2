-- A225: restringe a listagem de política de preço-base ao cadastro selecionado.
-- Nenhuma política ou linha existente é alterada.

drop function if exists public.subdivision_list_price_base_policies_v1(uuid, uuid, public.operating_module, text);

create function public.subdivision_list_price_base_policies_v1(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid
) returns table(policy_id uuid, development_id uuid, version_reference text, policy_state text, effective_from date, line_count integer, exception_count integer, created_at timestamptz, submitted_at timestamptz, approved_at timestamptz) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments development where development.id = p_development_id and development.organization_id = p_organization_id and development.lifecycle_state = 'active'::public.subdivision_development_lifecycle_state) then
    raise exception using errcode = '42501', message = 'PRICE_BASE_DEVELOPMENT_SCOPE_DENIED';
  end if;
  return query
    select policy.id, policy.development_id, policy.version_reference, policy.policy_state::text, policy.effective_from, count(line.id)::integer, policy.exception_count, policy.created_at, policy.submitted_at, policy.approved_at
    from public.subdivision_price_base_policies policy
    left join public.subdivision_price_base_policy_lines line on line.policy_id = policy.id and line.organization_id = p_organization_id
    where policy.organization_id = p_organization_id and policy.development_id = p_development_id
    group by policy.id
    order by policy.created_at desc;
end; $$;

revoke all on function public.subdivision_list_price_base_policies_v1(uuid, uuid, public.operating_module, text, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_list_price_base_policies_v1(uuid, uuid, public.operating_module, text, uuid) to service_role;
