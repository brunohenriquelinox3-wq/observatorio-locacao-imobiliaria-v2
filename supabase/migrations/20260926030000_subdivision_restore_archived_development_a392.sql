-- A392 — restauração protegida de Loteamentos arquivados.
-- Restaura somente o cadastro do Loteamento para a lista principal.
-- Quadras, Lotes e referências de anexos permanecem arquivados e exigem ciclos próprios.

create or replace function public.subdivision_restore_archived_development_v1(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_target uuid;
begin
  perform private.require_active_subdivision_draft_authority(
    p_actor_user_id,
    p_organization_id,
    p_module,
    p_purpose_code
  );

  if p_module <> 'loteadora' then
    raise exception using errcode = '42501', message = 'SUBDIVISION_ARCHIVED_DEVELOPMENT_CONTEXT_DENIED';
  end if;

  select event.target_id
    into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'subdivision_restore_archived_development_v1'
    and event.correlation_id = p_correlation_id
    and event.actor_user_id = p_actor_user_id
    and event.organization_id = p_organization_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;

  if v_existing_target is not null then
    return v_existing_target;
  end if;

  if not exists (
    select 1
    from public.subdivision_developments development
    where development.id = p_development_id
      and development.organization_id = p_organization_id
      and development.state = 'archived'
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_ARCHIVED_DEVELOPMENT_CONTEXT_DENIED';
  end if;

  update public.subdivision_developments development
  set state = 'draft', updated_at = pg_catalog.now()
  where development.id = p_development_id
    and development.organization_id = p_organization_id
    and development.state = 'archived';

  if not found then
    raise exception using errcode = '42501', message = 'SUBDIVISION_ARCHIVED_DEVELOPMENT_CONTEXT_DENIED';
  end if;

  insert into public.admin_audit_events (
    correlation_id,
    actor_user_id,
    organization_id,
    command_name,
    outcome,
    target_type,
    target_id,
    payload_redacted
  ) values (
    p_correlation_id,
    p_actor_user_id,
    p_organization_id,
    'subdivision_restore_archived_development_v1',
    'allowed',
    'subdivision_development',
    p_development_id,
    pg_catalog.jsonb_build_object(
      'module', p_module::text,
      'purpose_code', pg_catalog.btrim(p_purpose_code),
      'restore_mode', 'logical',
      'physical_structures_remain_archived', true,
      'attachment_references_remain_archived', true
    )
  );

  return p_development_id;
end;
$$;

revoke all on function public.subdivision_restore_archived_development_v1(uuid, uuid, public.operating_module, text, uuid, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_restore_archived_development_v1(uuid, uuid, public.operating_module, text, uuid, uuid) to service_role;

comment on function public.subdivision_restore_archived_development_v1(uuid, uuid, public.operating_module, text, uuid, uuid)
is 'A392: restauração lógica e auditável do cadastro de Loteamento; estruturas físicas e referências de anexos permanecem arquivadas.';
