-- A194: a gravação de rascunhos de clientes só prossegue após confirmação explícita da matriz mínima e da finalidade de retenção; não recebe documentos, contratos, valores ou dados financeiros.

create or replace function public.client_import_draft_parties_v2(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_rows jsonb,
  p_file_fingerprint text,
  p_privacy_notice_version text,
  p_retention_purpose text,
  p_correlation_id uuid
) returns table(accepted_rows integer, created_rows integer, duplicate_rows integer)
language plpgsql security definer set search_path = '' as $$
declare
  v_batch_id uuid;
begin
  if p_privacy_notice_version <> 'IMPORTACAO_MINIMA_V1' or p_retention_purpose <> 'CADASTRO_RASCUNHO_COM_REVISAO_HUMANA' then
    raise exception using errcode = '22023', message = 'CLIENT_IMPORT_PRIVACY_ACK_REQUIRED';
  end if;
  return query select * from public.client_import_draft_parties(p_actor_user_id, p_organization_id, p_module, p_purpose_code, p_rows, p_file_fingerprint, p_correlation_id);
  select id into v_batch_id from public.client_import_batches where created_by = p_actor_user_id and correlation_id = p_correlation_id limit 1;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'client_import_draft_parties_v2', 'allowed', 'client_import_batch', v_batch_id, jsonb_build_object('privacy_notice_version', p_privacy_notice_version, 'retention_purpose', p_retention_purpose));
end;
$$;

revoke all on function public.client_import_draft_parties_v2(uuid, uuid, public.operating_module, text, jsonb, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.client_import_draft_parties_v2(uuid, uuid, public.operating_module, text, jsonb, text, text, text, uuid) to service_role;

comment on function public.client_import_draft_parties_v2 is 'A194: confirma matriz mínima e retenção com revisão humana antes de delegar a importação existente; não processa documentos, contatos, contratos, valores ou financeiro.';
