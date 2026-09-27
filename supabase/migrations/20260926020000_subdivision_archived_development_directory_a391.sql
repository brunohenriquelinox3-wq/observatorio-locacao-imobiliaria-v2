-- A391 — Subsetor próprio de Loteamentos arquivados.
-- Leitura agregada; não cria, restaura, remove ou altera dados operacionais.

create or replace function public.subdivision_list_archived_developments(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table(
  development_id uuid,
  internal_reference text,
  display_name text,
  development_kind public.subdivision_development_kind,
  municipality text,
  state_code text,
  planned_stage_count integer,
  working_phase public.subdivision_development_phase,
  internal_note text,
  parceling_mode public.subdivision_development_parceling_mode,
  territorial_context public.subdivision_development_territorial_context,
  predominant_use public.subdivision_development_predominant_use,
  territorial_reference text,
  identification_note text,
  created_at timestamptz,
  updated_at timestamptz,
  archived_block_count integer,
  archived_lot_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
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

  return query
  select
    development.id,
    development.internal_reference,
    development.display_name,
    development.development_kind,
    development.municipality,
    development.state_code,
    development.planned_stage_count,
    development.working_phase,
    development.internal_note,
    development.parceling_mode,
    development.territorial_context,
    development.predominant_use,
    development.territorial_reference,
    development.identification_note,
    development.created_at,
    development.updated_at,
    (
      select pg_catalog.count(*)::integer
      from public.subdivision_blocks block
      where block.organization_id = development.organization_id
        and block.development_id = development.id
        and block.state = 'archived'
    ),
    (
      select pg_catalog.count(*)::integer
      from public.subdivision_lots lot
      join public.subdivision_blocks block
        on block.id = lot.block_id
       and block.organization_id = lot.organization_id
      where lot.organization_id = development.organization_id
        and block.development_id = development.id
        and lot.state = 'archived'
    )
  from public.subdivision_developments development
  where development.organization_id = p_organization_id
    and development.state = 'archived'
  order by development.updated_at desc, development.id asc;
end;
$$;

revoke all on function public.subdivision_list_archived_developments(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.subdivision_list_archived_developments(uuid, uuid, public.operating_module, text) to service_role;

comment on function public.subdivision_list_archived_developments(uuid, uuid, public.operating_module, text)
is 'A391: leitura agregada de Loteamentos arquivados para subsetor próprio; sem mutation, restauração ou efeito comercial/financeiro.';
