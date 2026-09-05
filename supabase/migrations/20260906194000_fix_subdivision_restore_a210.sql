-- A210: corrige apenas a normalização do código de finalidade ao auditar uma restauração já autorizada.
-- Não cria Quadras/Lotes, não modifica preços, estoque comercial, vendas, contratos ou financeiro.
create or replace function public.subdivision_restore_draft_block_v1(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_development_id uuid, p_block_id uuid, p_correlation_id uuid
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_existing jsonb; v_restored_lot_count integer := 0; v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments d where d.id = p_development_id and d.organization_id = p_organization_id and d.state = 'draft'::public.party_lifecycle_state) then raise exception using errcode = '42501', message = 'SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || ':' || p_development_id::text, 0));
  select e.payload_redacted -> 'result' into v_existing from public.admin_audit_events e where e.command_name = 'subdivision_restore_draft_block_v1' and e.correlation_id = p_correlation_id and e.actor_user_id = p_actor_user_id and e.organization_id = p_organization_id and e.outcome = 'allowed' order by e.occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  if not exists (select 1 from public.subdivision_blocks b where b.id = p_block_id and b.organization_id = p_organization_id and b.development_id = p_development_id and b.state = 'archived'::public.party_lifecycle_state) then raise exception using errcode = '42501', message = 'SUBDIVISION_ARCHIVED_BLOCK_CONTEXT_DENIED'; end if;
  update public.subdivision_blocks b set state = 'draft'::public.party_lifecycle_state, updated_at = pg_catalog.now() where b.id = p_block_id and b.organization_id = p_organization_id and b.development_id = p_development_id and b.state = 'archived'::public.party_lifecycle_state;
  with restored as (update public.subdivision_lots l set state = 'draft'::public.party_lifecycle_state, updated_at = pg_catalog.now() where l.organization_id = p_organization_id and l.block_id = p_block_id and l.state = 'archived'::public.party_lifecycle_state returning 1) select count(*)::integer into v_restored_lot_count from restored;
  v_result := pg_catalog.jsonb_build_object('block_id', p_block_id, 'restored_lot_count', v_restored_lot_count);
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_restore_draft_block_v1', 'allowed', 'subdivision_block', p_block_id, pg_catalog.jsonb_build_object('module', p_module::text, 'purpose_code', pg_catalog.btrim(p_purpose_code), 'development_id_present', true, 'restored_lot_count', v_restored_lot_count, 'result', v_result));
  return v_result;
end; $$;

revoke all on function public.subdivision_restore_draft_block_v1(uuid, uuid, public.operating_module, text, uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_restore_draft_block_v1(uuid, uuid, public.operating_module, text, uuid, uuid, uuid) to service_role;
