-- A385: pagador principal declarado por venda.
-- Vínculo cadastral/comercial explícito; não registra pagamento, recebimento,
-- cobrança, baixa, quitação, banco, Pix, boleto emitido, transferência, split ou repasse.

create table public.subdivision_sale_case_primary_payers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  sale_case_id uuid not null,
  buyer_client_id uuid not null,
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_sale_case_primary_payers_case_tenant_fk
    foreign key (sale_case_id, organization_id)
    references public.subdivision_sale_cases(id, organization_id) on delete cascade,
  constraint subdivision_sale_case_primary_payers_party_tenant_fk
    foreign key (organization_id, sale_case_id, buyer_client_id)
    references public.subdivision_sale_case_parties(organization_id, sale_case_id, buyer_client_id)
    on delete restrict,
  constraint subdivision_sale_case_primary_payers_one_per_case
    unique (organization_id, sale_case_id)
);

create index subdivision_sale_case_primary_payers_lookup_idx
  on public.subdivision_sale_case_primary_payers(organization_id, sale_case_id, buyer_client_id);

alter table public.subdivision_sale_case_primary_payers enable row level security;
revoke all on table public.subdivision_sale_case_primary_payers from public, anon, authenticated;
comment on table public.subdivision_sale_case_primary_payers is
  'A385: designação declarativa de um proponente como pagador principal da venda; não representa recebimento, pagamento ou cobrança.';

create or replace function public.subdivision_set_sale_case_primary_payer(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_sale_case_id uuid,
  p_buyer_client_id uuid,
  p_correlation_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_idempotent jsonb;
  v_result jsonb;
  v_previous_buyer_client_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(
    p_actor_user_id, p_organization_id, p_module, p_purpose_code
  );
  if p_module <> 'loteadora' then
    raise exception using errcode = '42501', message = 'SUBDIVISION_PRIMARY_PAYER_CONTEXT_DENIED';
  end if;

  select event.payload_redacted -> 'result'
    into v_idempotent
  from public.admin_audit_events event
  where event.command_name = 'subdivision_set_sale_case_primary_payer'
    and event.correlation_id = p_correlation_id
    and event.actor_user_id = p_actor_user_id
    and event.organization_id = p_organization_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;
  if v_idempotent is not null then return v_idempotent; end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_organization_id::text || ':' || p_sale_case_id::text, 0)
  );
  perform 1
  from public.subdivision_sale_cases sale_case
  where sale_case.id = p_sale_case_id
    and sale_case.organization_id = p_organization_id
    and sale_case.state = 'preparation'
  for update;
  if not found then
    raise exception using errcode = '42501', message = 'SUBDIVISION_PRIMARY_PAYER_STATE_DENIED';
  end if;
  if not exists (
    select 1
    from public.subdivision_sale_case_parties party
    where party.organization_id = p_organization_id
      and party.sale_case_id = p_sale_case_id
      and party.buyer_client_id = p_buyer_client_id
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_PRIMARY_PAYER_PARTY_DENIED';
  end if;

  select payer.buyer_client_id
    into v_previous_buyer_client_id
  from public.subdivision_sale_case_primary_payers payer
  where payer.organization_id = p_organization_id
    and payer.sale_case_id = p_sale_case_id
  for update;

  insert into public.subdivision_sale_case_primary_payers(
    organization_id, sale_case_id, buyer_client_id, created_by
  ) values (
    p_organization_id, p_sale_case_id, p_buyer_client_id, p_actor_user_id
  )
  on conflict (organization_id, sale_case_id) do update
    set buyer_client_id = excluded.buyer_client_id,
        created_by = excluded.created_by,
        updated_at = now();

  v_result := pg_catalog.jsonb_build_object(
    'sale_case_id', p_sale_case_id,
    'buyer_client_id', p_buyer_client_id,
    'primary_payer_declared', true
  );
  insert into public.admin_audit_events(
    correlation_id, actor_user_id, organization_id, command_name, outcome,
    target_type, target_id, payload_redacted
  ) values (
    p_correlation_id, p_actor_user_id, p_organization_id,
    'subdivision_set_sale_case_primary_payer', 'allowed',
    'subdivision_sale_case_primary_payer', p_sale_case_id,
    pg_catalog.jsonb_build_object(
      'module', p_module::text,
      'purpose_code', pg_catalog.btrim(p_purpose_code),
      'payer_declared', true,
      'designation_changed', v_previous_buyer_client_id is distinct from p_buyer_client_id,
      'result', v_result
    )
  );
  return v_result;
end;
$$;

create or replace function public.subdivision_list_sale_case_primary_payers(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
) returns table(sale_case_id uuid, buyer_client_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_active_subdivision_draft_authority(
    p_actor_user_id, p_organization_id, p_module, p_purpose_code
  );
  if p_module <> 'loteadora' then
    raise exception using errcode = '42501', message = 'SUBDIVISION_PRIMARY_PAYER_CONTEXT_DENIED';
  end if;
  return query
  select payer.sale_case_id, payer.buyer_client_id
  from public.subdivision_sale_case_primary_payers payer
  join public.subdivision_sale_cases sale_case
    on sale_case.id = payer.sale_case_id
   and sale_case.organization_id = payer.organization_id
  where payer.organization_id = p_organization_id
    and sale_case.state <> 'archived'
  order by payer.sale_case_id;
end;
$$;

create or replace function private.deny_removal_of_subdivision_primary_payer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.subdivision_sale_case_primary_payers payer
    where payer.organization_id = old.organization_id
      and payer.sale_case_id = old.sale_case_id
      and payer.buyer_client_id = old.buyer_client_id
  ) then
    raise exception using errcode = '22023', message = 'SUBDIVISION_PRIMARY_PAYER_REASSIGN_REQUIRED';
  end if;
  return old;
end;
$$;

drop trigger if exists subdivision_primary_payer_party_removal_guard
  on public.subdivision_sale_case_parties;
create trigger subdivision_primary_payer_party_removal_guard
before delete on public.subdivision_sale_case_parties
for each row execute function private.deny_removal_of_subdivision_primary_payer();

alter function public.subdivision_formalize_sale_case(
  uuid,uuid,public.operating_module,text,uuid,uuid
) rename to subdivision_formalize_sale_case_legacy_a385;

create or replace function public.subdivision_formalize_sale_case(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_sale_case_id uuid,
  p_correlation_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_active_subdivision_draft_authority(
    p_actor_user_id, p_organization_id, p_module, p_purpose_code
  );
  if p_module <> 'loteadora' then
    raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_FORMALIZATION_CONTEXT_DENIED';
  end if;
  if exists (
    select 1
    from public.admin_audit_events event
    where event.command_name = 'subdivision_formalize_sale_case'
      and event.correlation_id = p_correlation_id
      and event.actor_user_id = p_actor_user_id
      and event.organization_id = p_organization_id
      and event.outcome = 'allowed'
  ) then
    return public.subdivision_formalize_sale_case_legacy_a385(
      p_actor_user_id, p_organization_id, p_module, p_purpose_code,
      p_sale_case_id, p_correlation_id
    );
  end if;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_organization_id::text || ':' || p_sale_case_id::text, 0)
  );
  perform private.subdivision_lock_sale_case_lots(p_organization_id, p_sale_case_id);
  if not exists (
    select 1
    from public.subdivision_sale_case_primary_payers payer
    join public.subdivision_sale_case_parties party
      on party.organization_id = payer.organization_id
     and party.sale_case_id = payer.sale_case_id
     and party.buyer_client_id = payer.buyer_client_id
    where payer.organization_id = p_organization_id
      and payer.sale_case_id = p_sale_case_id
  ) then
    raise exception using errcode = '22023', message = 'SUBDIVISION_SALE_FORMALIZATION_PRIMARY_PAYER_REQUIRED';
  end if;
  return public.subdivision_formalize_sale_case_legacy_a385(
    p_actor_user_id, p_organization_id, p_module, p_purpose_code,
    p_sale_case_id, p_correlation_id
  );
end;
$$;

alter function public.subdivision_delete_archived_sale_case(
  uuid,uuid,public.operating_module,text,uuid,uuid
) rename to subdivision_delete_archived_sale_case_legacy_a385;

create or replace function public.subdivision_delete_archived_sale_case(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_sale_case_id uuid,
  p_correlation_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(
    p_actor_user_id, p_organization_id, p_module, p_purpose_code
  );
  if p_module <> 'loteadora' then
    raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_ARCHIVE_CONTEXT_DENIED';
  end if;
  if not exists (
    select 1
    from public.subdivision_sale_cases sale_case
    where sale_case.id = p_sale_case_id
      and sale_case.organization_id = p_organization_id
      and sale_case.state = 'archived'
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_PURGE_STATE_DENIED';
  end if;
  perform private.subdivision_lock_sale_case_lots(p_organization_id, p_sale_case_id);
  delete from public.subdivision_sale_case_primary_payers payer
  where payer.organization_id = p_organization_id
    and payer.sale_case_id = p_sale_case_id;
  v_result := public.subdivision_delete_archived_sale_case_legacy_a385(
    p_actor_user_id, p_organization_id, p_module, p_purpose_code,
    p_sale_case_id, p_correlation_id
  );
  return v_result;
end;
$$;

alter function public.subdivision_get_internal_receivable_batch_item_detail_v2(
  uuid,uuid,public.operating_module,text,uuid,uuid
) rename to subdivision_get_internal_receivable_batch_item_detail_v2_legacy_a385;

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
  v_result := public.subdivision_get_internal_receivable_batch_item_detail_v2_legacy_a385(
    p_actor_user_id, p_organization_id, p_module, p_purpose_code, p_batch_id, p_item_id
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
  ) into v_primary_payer_declared;
  return pg_catalog.jsonb_set(
    v_result,
    '{batch,primary_payer_declared}',
    pg_catalog.to_jsonb(v_primary_payer_declared),
    true
  );
end;
$$;

revoke all on function
  public.subdivision_set_sale_case_primary_payer(uuid,uuid,public.operating_module,text,uuid,uuid,uuid),
  public.subdivision_list_sale_case_primary_payers(uuid,uuid,public.operating_module,text),
  public.subdivision_formalize_sale_case(uuid,uuid,public.operating_module,text,uuid,uuid),
  public.subdivision_delete_archived_sale_case(uuid,uuid,public.operating_module,text,uuid,uuid),
  public.subdivision_get_internal_receivable_batch_item_detail_v2(uuid,uuid,public.operating_module,text,uuid,uuid)
from public, anon, authenticated;

grant execute on function
  public.subdivision_set_sale_case_primary_payer(uuid,uuid,public.operating_module,text,uuid,uuid,uuid),
  public.subdivision_list_sale_case_primary_payers(uuid,uuid,public.operating_module,text),
  public.subdivision_formalize_sale_case(uuid,uuid,public.operating_module,text,uuid,uuid),
  public.subdivision_delete_archived_sale_case(uuid,uuid,public.operating_module,text,uuid,uuid),
  public.subdivision_get_internal_receivable_batch_item_detail_v2(uuid,uuid,public.operating_module,text,uuid,uuid)
to service_role;

comment on function public.subdivision_set_sale_case_primary_payer(uuid,uuid,public.operating_module,text,uuid,uuid,uuid) is
  'A385: designa um proponente existente como pagador principal declarado enquanto a venda está em preparação; sem fato financeiro.';
comment on function public.subdivision_formalize_sale_case(uuid,uuid,public.operating_module,text,uuid,uuid) is
  'A385: exige pagador principal declarado antes de gerar agenda nominal; não registra pagamento.';
comment on function public.subdivision_get_internal_receivable_batch_item_detail_v2(uuid,uuid,public.operating_module,text,uuid,uuid) is
  'A385: detalhe nominal read-only com sinal redigido de pagador principal declarado; sem pagamento externo.';

-- Nenhuma linha operacional é criada, alterada ou excluída por esta migration.
