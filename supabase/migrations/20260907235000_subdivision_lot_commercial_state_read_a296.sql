-- A296: leitura minimizada do estado comercial derivado da aprovação material A295.
create function public.subdivision_list_lot_commercial_states(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text) returns table (lot_id uuid, commercial_state public.subdivision_lot_commercial_state, updated_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_LOT_COMMERCIAL_STATE_CONTEXT_DENIED'; end if;
  return query select commercial.lot_id, commercial.commercial_state, commercial.updated_at from public.subdivision_lot_commercial_states commercial join public.subdivision_lots lot on lot.id = commercial.lot_id and lot.organization_id = commercial.organization_id where commercial.organization_id = p_organization_id and lot.state = 'draft'::public.party_lifecycle_state order by commercial.updated_at desc, commercial.lot_id;
end; $$;
revoke all on function public.subdivision_list_lot_commercial_states(uuid,uuid,public.operating_module,text) from public, anon, authenticated;
grant execute on function public.subdivision_list_lot_commercial_states(uuid,uuid,public.operating_module,text) to service_role;
