-- A300: upload privado do dossiê comercial; não retorna URL, nome, conteúdo ou download e não emite, envia, cobra, baixa ou paga.
create or replace function public.subdivision_authorize_sale_case_document_upload(p_actor_user_id uuid,p_organization_id uuid,p_module public.operating_module,p_purpose_code text,p_attachment_intent_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare v_intent_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id,p_organization_id,p_module,p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode='42501',message='SUBDIVISION_SALE_CASE_ATTACHMENT_DENIED'; end if;
  select intent.id into v_intent_id from public.subdivision_sale_case_document_intents intent join public.subdivision_sale_cases sale_case on sale_case.id=intent.sale_case_id and sale_case.organization_id=intent.organization_id where intent.id=p_attachment_intent_id and intent.organization_id=p_organization_id and intent.storage_key is null and sale_case.state in ('preparation','terms_review');
  if v_intent_id is null then raise exception using errcode='42501',message='SUBDIVISION_SALE_CASE_ATTACHMENT_DENIED'; end if;
  return v_intent_id;
end; $$;
create or replace function public.subdivision_record_sale_case_document_upload(p_actor_user_id uuid,p_organization_id uuid,p_module public.operating_module,p_purpose_code text,p_attachment_intent_id uuid,p_storage_key text,p_content_type text,p_byte_size integer,p_correlation_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare v_existing uuid; v_intent_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id,p_organization_id,p_module,p_purpose_code);
  if p_module <> 'loteadora' or p_content_type not in ('application/pdf','image/jpeg','image/png') or p_byte_size not between 1 and 2097152 then raise exception using errcode='42501',message='SUBDIVISION_SALE_CASE_ATTACHMENT_DENIED'; end if;
  select target_id into v_existing from public.admin_audit_events event where event.command_name='subdivision_record_sale_case_document_upload' and event.correlation_id=p_correlation_id and event.actor_user_id=p_actor_user_id and event.organization_id=p_organization_id and event.outcome='allowed' order by event.occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  update public.subdivision_sale_case_document_intents intent set storage_key=p_storage_key,content_type=p_content_type,byte_size=p_byte_size,dossier_state='private_upload_recorded',updated_at=now() where intent.id=p_attachment_intent_id and intent.organization_id=p_organization_id and intent.storage_key is null returning intent.id into v_intent_id;
  if v_intent_id is null then raise exception using errcode='42501',message='SUBDIVISION_SALE_CASE_ATTACHMENT_DENIED'; end if;
  insert into public.admin_audit_events(correlation_id,actor_user_id,organization_id,command_name,outcome,target_type,target_id,payload_redacted) values(p_correlation_id,p_actor_user_id,p_organization_id,'subdivision_record_sale_case_document_upload','allowed','subdivision_sale_case_document_intent',v_intent_id,jsonb_build_object('module',p_module::text,'purpose_code',trim(p_purpose_code),'private_upload_recorded',true));
  return v_intent_id;
end; $$;
revoke all on function public.subdivision_authorize_sale_case_document_upload(uuid,uuid,public.operating_module,text,uuid), public.subdivision_record_sale_case_document_upload(uuid,uuid,public.operating_module,text,uuid,text,text,integer,uuid) from public,anon,authenticated;
grant execute on function public.subdivision_authorize_sale_case_document_upload(uuid,uuid,public.operating_module,text,uuid), public.subdivision_record_sale_case_document_upload(uuid,uuid,public.operating_module,text,uuid,text,text,integer,uuid) to service_role;
