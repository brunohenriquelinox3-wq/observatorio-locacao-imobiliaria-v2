-- A387: lineage read-only Loteamento -> Quadra -> Lote(s) -> Venda -> Item nominal -> Financeiro.
-- Mantém o payload A386.1 e adiciona somente contexto físico allowlisted.
-- Não cria, atualiza ou exclui linhas operacionais; não representa pagamento.

create or replace function public.subdivision_get_internal_receivable_batch_item_detail_v4(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_batch_id uuid,
  p_item_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
  v_sale_case_id uuid;
  v_sale_state text;
  v_physical_lots jsonb := '[]'::jsonb;
  v_physical_lot_count integer := 0;
  v_development_reference text;
  v_missing_stages text[] := '{}'::text[];
  v_lineage_state text;
  v_item_number integer;
  v_schedule_kind text;
  v_amount_cents bigint;
begin
  perform private.require_active_subdivision_draft_authority(
    p_actor_user_id,
    p_organization_id,
    p_module,
    p_purpose_code
  );
  if p_module <> 'loteadora' then
    raise exception using errcode = '42501', message = 'SUBDIVISION_INTERNAL_LINEAGE_CONTEXT_DENIED';
  end if;

  v_result := public.subdivision_get_internal_receivable_batch_item_detail_v3(
    p_actor_user_id,
    p_organization_id,
    p_module,
    p_purpose_code,
    p_batch_id,
    p_item_id
  );

  if v_result->'batch' is null
     or v_result->'batch' = 'null'::jsonb
     or v_result->'item' is null
     or v_result->'item' = 'null'::jsonb then
    return pg_catalog.jsonb_set(
      v_result,
      '{lineage}',
      pg_catalog.jsonb_build_object(
        'lineage_state', 'unavailable',
        'development_reference', null,
        'physical_lots', '[]'::jsonb,
        'sale_state', null,
        'item_number', null,
        'schedule_kind', null,
        'nominal_amount_cents', null,
        'finance_surface', 'gerenciar_cobrancas',
        'missing_stages', jsonb_build_array('loteamento', 'quadra', 'lote', 'venda', 'item_nominal')
      ),
      true
    );
  end if;

  v_sale_case_id := (v_result->'batch'->>'sale_case_id')::uuid;
  v_item_number := (v_result->'item'->>'item_number')::integer;
  v_schedule_kind := v_result->'item'->>'schedule_kind';
  v_amount_cents := (v_result->'item'->>'amount_cents')::bigint;

  select sale_case.state::text
    into v_sale_state
  from public.subdivision_sale_cases sale_case
  where sale_case.id = v_sale_case_id
    and sale_case.organization_id = p_organization_id;

  select
    count(*)::integer,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'position', rows.lot_position,
          'is_primary', rows.is_primary,
          'development_reference', development.internal_reference,
          'block_number', block.block_number,
          'lot_number', lot.lot_number
        ) order by rows.is_primary desc, rows.lot_position, rows.lot_id
      ),
      '[]'::jsonb
    )
    into v_physical_lot_count, v_physical_lots
  from private.subdivision_sale_case_lot_rows(p_organization_id, v_sale_case_id) rows
  join public.subdivision_lots lot
    on lot.id = rows.lot_id
   and lot.organization_id = p_organization_id
  join public.subdivision_blocks block
    on block.id = lot.block_id
   and block.organization_id = p_organization_id
  join public.subdivision_developments development
    on development.id = block.development_id
   and development.organization_id = p_organization_id;

  if jsonb_array_length(v_physical_lots) > 0 then
    v_development_reference := v_physical_lots->0->>'development_reference';
  end if;

  if v_development_reference is null then
    v_missing_stages := array_append(v_missing_stages, 'loteamento');
  end if;
  if v_physical_lot_count = 0 then
    v_missing_stages := array_append(v_missing_stages, 'quadra');
    v_missing_stages := array_append(v_missing_stages, 'lote');
  else
    if not exists (
      select 1
      from jsonb_array_elements(v_physical_lots) physical_lot
      where physical_lot->>'block_number' is not null
    ) then
      v_missing_stages := array_append(v_missing_stages, 'quadra');
    end if;
    if not exists (
      select 1
      from jsonb_array_elements(v_physical_lots) physical_lot
      where physical_lot->>'lot_number' is not null
    ) then
      v_missing_stages := array_append(v_missing_stages, 'lote');
    end if;
  end if;
  if v_sale_case_id is null or v_sale_state is null then
    v_missing_stages := array_append(v_missing_stages, 'venda');
  end if;
  if v_item_number is null or v_schedule_kind is null or v_amount_cents is null then
    v_missing_stages := array_append(v_missing_stages, 'item_nominal');
  end if;

  v_lineage_state := case
    when cardinality(v_missing_stages) = 0 then 'complete'
    when v_sale_case_id is null then 'unavailable'
    else 'partial'
  end;

  return pg_catalog.jsonb_set(
    v_result,
    '{lineage}',
    pg_catalog.jsonb_build_object(
      'lineage_state', v_lineage_state,
      'development_reference', v_development_reference,
      'physical_lots', v_physical_lots,
      'sale_state', v_sale_state,
      'item_number', v_item_number,
      'schedule_kind', v_schedule_kind,
      'nominal_amount_cents', v_amount_cents,
      'finance_surface', 'gerenciar_cobrancas',
      'missing_stages', to_jsonb(v_missing_stages)
    ),
    true
  );
end;
$$;

revoke all on function public.subdivision_get_internal_receivable_batch_item_detail_v4(
  uuid, uuid, public.operating_module, text, uuid, uuid
) from public, anon, authenticated;
grant execute on function public.subdivision_get_internal_receivable_batch_item_detail_v4(
  uuid, uuid, public.operating_module, text, uuid, uuid
) to service_role;

comment on function public.subdivision_get_internal_receivable_batch_item_detail_v4(
  uuid, uuid, public.operating_module, text, uuid, uuid
) is 'A387: lineage físico e nominal allowlisted na ficha do item; preserva A386.1 e não executa operação financeira externa.';

-- Nenhuma linha operacional é criada, alterada ou excluída.
