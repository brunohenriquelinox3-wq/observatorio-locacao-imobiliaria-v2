-- A284: altera somente o nome declarado da pessoa já vinculada ao Cliente Loteadora.
-- Não cria vínculo comercial, não altera perfil, documentos, crédito, contrato ou financeiro.

create or replace function public.subdivision_update_draft_buyer_client_name(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_buyer_client_id uuid,
  p_display_name text,
  p_correlation_id uuid
) returns table(buyer_client_id uuid, display_name text)
language plpgsql security definer set search_path = '' as $$
declare
  v_party_id uuid;
  v_existing_target uuid;
  v_current_name text;
  v_normalized_name text := trim(p_display_name);
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then
    raise exception using errcode = '42501', message = 'SUBDIVISION_BUYER_CLIENT_NAME_CONTEXT_DENIED';
  end if;
  if char_length(v_normalized_name) < 2 or char_length(v_normalized_name) > 160 then
    raise exception using errcode = '22023', message = 'SUBDIVISION_BUYER_CLIENT_NAME_VALUE_DENIED';
  end if;

  select audit.target_id into v_existing_target
  from public.admin_audit_events audit
  where audit.command_name = 'subdivision_update_draft_buyer_client_name'
    and audit.correlation_id = p_correlation_id and audit.outcome = 'allowed'
  order by audit.occurred_at desc limit 1;
  if v_existing_target is not null then
    return query
    select buyer.id, party.display_name
    from public.subdivision_buyer_clients buyer
    join public.party_role_assignments role_assignment on role_assignment.id = buyer.party_role_assignment_id and role_assignment.organization_id = buyer.organization_id
    join public.party_records party on party.id = role_assignment.party_id and party.organization_id = buyer.organization_id
    where buyer.id = v_existing_target and buyer.organization_id = p_organization_id;
    return;
  end if;

  select party.id, party.display_name into v_party_id, v_current_name
  from public.subdivision_buyer_clients buyer
  join public.party_role_assignments role_assignment on role_assignment.id = buyer.party_role_assignment_id and role_assignment.organization_id = buyer.organization_id
  join public.party_records party on party.id = role_assignment.party_id and party.organization_id = buyer.organization_id
  where buyer.id = p_buyer_client_id and buyer.organization_id = p_organization_id
    and role_assignment.module = 'loteadora' and role_assignment.role in ('client', 'buyer')
    and role_assignment.purpose_code = trim(p_purpose_code) and role_assignment.state = 'draft';
  if v_party_id is null then
    raise exception using errcode = '42501', message = 'SUBDIVISION_BUYER_CLIENT_NAME_CONTEXT_DENIED';
  end if;

  if lower(trim(v_current_name)) <> lower(v_normalized_name) and exists (
    select 1 from public.party_records party
    where party.organization_id = p_organization_id and party.state = 'draft' and party.id <> v_party_id
      and lower(trim(party.display_name)) = lower(v_normalized_name)
  ) then
    raise exception using errcode = '23505', message = 'SUBDIVISION_BUYER_CLIENT_NAME_DUPLICATE_DENIED';
  end if;

  update public.party_records party set display_name = v_normalized_name where party.id = v_party_id and party.organization_id = p_organization_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_update_draft_buyer_client_name', 'allowed', 'subdivision_buyer_client', p_buyer_client_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'display_name_present', true, 'changed', lower(trim(v_current_name)) <> lower(v_normalized_name)));
  return query select p_buyer_client_id, v_normalized_name;
end;
$$;

revoke all on function public.subdivision_update_draft_buyer_client_name(uuid,uuid,public.operating_module,text,uuid,text,uuid) from public, anon, authenticated;
grant execute on function public.subdivision_update_draft_buyer_client_name(uuid,uuid,public.operating_module,text,uuid,text,uuid) to service_role;
