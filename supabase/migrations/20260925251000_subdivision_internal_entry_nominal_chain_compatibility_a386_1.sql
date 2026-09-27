-- A386.1: compatibilidade da cadeia nominal com itens legados.
-- A fonte da ficha é o item nominal já autorizado; a agenda só enriquece
-- recebedores previstos quando o vínculo ainda está disponível.
-- Não cria, atualiza ou exclui linhas operacionais; não representa pagamento.

create or replace function public.subdivision_get_internal_receivable_batch_item_detail_v3(
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
  v_schedule_id uuid;
  v_contract_preparation_id uuid;
  v_schedule_kind text;
  v_amount_cents bigint;
  v_snapshot_state text := 'no_active_policy';
  v_receiver_total bigint := 0;
  v_receivers jsonb := '[]'::jsonb;
  v_chain jsonb;
  v_component text;
  v_reason_code text;
  v_reason_label text;
begin
  perform private.require_active_subdivision_draft_authority(
    p_actor_user_id, p_organization_id, p_module, p_purpose_code
  );
  if p_module <> 'loteadora' then
    raise exception using errcode = '42501', message = 'SUBDIVISION_INTERNAL_ENTRY_CHAIN_CONTEXT_DENIED';
  end if;

  v_result := public.subdivision_get_internal_receivable_batch_item_detail_v2(
    p_actor_user_id, p_organization_id, p_module, p_purpose_code,
    p_batch_id, p_item_id
  );
  if v_result->'batch' is null or v_result->'batch' = 'null'::jsonb
     or v_result->'item' is null or v_result->'item' = 'null'::jsonb then
    return pg_catalog.jsonb_set(
      v_result,
      '{entry_nominal_chain}',
      pg_catalog.jsonb_build_object(
        'component', 'not_entry',
        'reason_code', 'not_entry_component',
        'reason_label', 'Item não disponível para esta leitura',
        'nominal_amount_cents', 0,
        'primary_payer_declared', false,
        'recipient_chain_state', 'not_applicable',
        'receivers', '[]'::jsonb
      ),
      true
    );
  end if;

  -- O item nominal é a fonte da composição exibida na ficha. Isso evita
  -- transformar uma ausência de enriquecimento em “item não encontrado”.
  v_schedule_kind := v_result->'item'->>'schedule_kind';
  v_amount_cents := (v_result->'item'->>'amount_cents')::bigint;
  if v_schedule_kind is null or v_amount_cents is null then
    raise exception using errcode = '42501', message = 'SUBDIVISION_INTERNAL_ENTRY_CHAIN_DENIED';
  end if;

  -- O vínculo do item para a agenda é usado somente para projeção nominal.
  -- Se a agenda não puder ser enriquecida, a ficha permanece legível com
  -- estado honesto no_active_policy e sem inventar recebedores.
  select batch_item.schedule_id, batch.contract_preparation_id
    into v_schedule_id, v_contract_preparation_id
  from public.subdivision_internal_receivable_batch_items batch_item
  join public.subdivision_internal_receivable_batches batch
    on batch.id = batch_item.batch_id
   and batch.organization_id = batch_item.organization_id
  where batch_item.id = p_item_id
    and batch_item.batch_id = p_batch_id
    and batch_item.organization_id = p_organization_id
  limit 1;

  if v_schedule_kind = 'entry' then
    v_component := 'entry';
    v_reason_code := 'entry_cash';
    v_reason_label := 'Entrada declarada';
  elsif v_schedule_kind = 'entry_installment' then
    v_component := 'entry_installment';
    v_reason_code := 'entry_installment';
    v_reason_label := 'Parcela da entrada';
  else
    v_component := 'not_entry';
    v_reason_code := 'not_entry_component';
    v_reason_label := 'Este item não pertence à entrada';
  end if;

  if v_component <> 'not_entry' and v_schedule_id is not null and v_contract_preparation_id is not null then
    select snapshot.snapshot_state::text
      into v_snapshot_state
    from public.subdivision_sale_participation_snapshots snapshot
    where snapshot.organization_id = p_organization_id
      and snapshot.contract_preparation_id = v_contract_preparation_id
    order by snapshot.created_at desc, snapshot.id desc
    limit 1;

    select
      coalesce(sum(projection.projected_amount_cents), 0)::bigint,
      coalesce(jsonb_agg(jsonb_build_object(
        'participant_role', receiver_rows.participant_role,
        'allocation_method', receiver_rows.allocation_method,
        'projected_amount_cents', receiver_rows.projected_amount_cents,
        'projected_item_count', receiver_rows.projected_item_count,
        'snapshot_state', receiver_rows.snapshot_state
      ) order by receiver_rows.participant_role, receiver_rows.allocation_method), '[]'::jsonb)
    into v_receiver_total, v_receivers
    from (
      select
        snapshot_rule.participant_role::text as participant_role,
        snapshot_rule.allocation_method::text as allocation_method,
        coalesce(sum(projection.projected_amount_cents), 0)::bigint as projected_amount_cents,
        count(distinct projection.schedule_id)::integer as projected_item_count,
        snapshot.snapshot_state::text as snapshot_state
      from public.subdivision_sale_participation_snapshots snapshot
      join public.subdivision_sale_participation_snapshot_rules snapshot_rule
        on snapshot_rule.snapshot_id = snapshot.id
       and snapshot_rule.organization_id = snapshot.organization_id
      join public.subdivision_sale_participation_projections projection
        on projection.snapshot_rule_id = snapshot_rule.id
       and projection.organization_id = snapshot_rule.organization_id
      where snapshot.organization_id = p_organization_id
        and snapshot.contract_preparation_id = v_contract_preparation_id
        and projection.schedule_id = v_schedule_id
        and snapshot.snapshot_state in ('projected', 'no_active_policy', 'reversal_review')
      group by snapshot_rule.participant_role, snapshot_rule.allocation_method, snapshot.snapshot_state
    ) receiver_rows;

    if v_receiver_total > v_amount_cents then
      raise exception using errcode = '22023', message = 'SUBDIVISION_INTERNAL_ENTRY_CHAIN_OVERALLOCATION_DENIED';
    end if;
  end if;

  v_chain := pg_catalog.jsonb_build_object(
    'component', v_component,
    'reason_code', v_reason_code,
    'reason_label', v_reason_label,
    'nominal_amount_cents', v_amount_cents,
    'primary_payer_declared', coalesce((v_result->'batch'->>'primary_payer_declared')::boolean, false),
    'recipient_chain_state', case
      when v_component = 'not_entry' then 'not_applicable'
      when v_snapshot_state = 'reversal_review' then 'reversal_review'
      when v_receiver_total > 0 then 'projected'
      else 'no_active_policy'
    end,
    'receivers', case when v_component = 'not_entry' then '[]'::jsonb else v_receivers end
  );

  return pg_catalog.jsonb_set(v_result, '{entry_nominal_chain}', v_chain, true);
end;
$$;

revoke all on function public.subdivision_get_internal_receivable_batch_item_detail_v3(
  uuid,uuid,public.operating_module,text,uuid,uuid
) from public, anon, authenticated;
grant execute on function public.subdivision_get_internal_receivable_batch_item_detail_v3(
  uuid,uuid,public.operating_module,text,uuid,uuid
) to service_role;

comment on function public.subdivision_get_internal_receivable_batch_item_detail_v3(
  uuid,uuid,public.operating_module,text,uuid,uuid
) is 'A386.1: cadeia nominal read-only compatível com item legado; sem pagamento externo.';

-- Nenhuma linha operacional é criada, alterada ou excluída.
