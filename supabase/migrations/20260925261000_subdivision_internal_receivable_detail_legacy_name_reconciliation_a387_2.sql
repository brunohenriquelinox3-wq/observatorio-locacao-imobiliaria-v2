-- A387.2: reconciliação do nome legacy usado pelo detalhe nominal.
-- A função live v2 mantinha a chamada para *_legacy_a385, enquanto o objeto
-- aplicado no catálogo é *_legacy. A correção preserva a wrapper A385 e troca
-- somente o alvo da delegação; não cria, atualiza ou exclui linhas operacionais.
-- O detalhe continua nominal/read-only e sem pagamento externo.

create or replace function public.subdivision_get_internal_receivable_batch_item_detail_v2(
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
  v_primary_payer_declared boolean := false;
begin
  v_result := public.subdivision_get_internal_receivable_batch_item_detail_v2_legacy(
    p_actor_user_id,
    p_organization_id,
    p_module,
    p_purpose_code,
    p_batch_id,
    p_item_id
  );
  if v_result->'batch' is null or v_result->'batch' = 'null'::jsonb then
    return v_result;
  end if;

  select exists(
    select 1
    from public.subdivision_internal_receivable_batches batch
    join public.subdivision_sale_case_primary_payers payer
      on payer.sale_case_id = batch.sale_case_id
     and payer.organization_id = batch.organization_id
    where batch.organization_id = p_organization_id
      and batch.id = p_batch_id
  )
  into v_primary_payer_declared;

  return pg_catalog.jsonb_set(
    v_result,
    '{batch,primary_payer_declared}',
    pg_catalog.to_jsonb(v_primary_payer_declared),
    true
  );
end;
$$;

revoke all on function public.subdivision_get_internal_receivable_batch_item_detail_v2(
  uuid, uuid, public.operating_module, text, uuid, uuid
) from public, anon, authenticated;

grant execute on function public.subdivision_get_internal_receivable_batch_item_detail_v2(
  uuid, uuid, public.operating_module, text, uuid, uuid
) to service_role;

comment on function public.subdivision_get_internal_receivable_batch_item_detail_v2(
  uuid, uuid, public.operating_module, text, uuid, uuid
) is 'A387.2: wrapper nominal reconciliada ao objeto legacy aplicado; sem pagamento externo.';
