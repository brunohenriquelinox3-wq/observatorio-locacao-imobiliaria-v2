-- A301: ciclo de vida do cron interno. O cron só cria eventos privados de atenção; não emite, envia, cobra, baixa ou paga.
create or replace function public.subdivision_bind_internal_receivable_alert_schedule(p_actor_user_id uuid,p_organization_id uuid,p_module public.operating_module,p_purpose_code text,p_schedule_cron_task_uid varchar,p_correlation_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_configuration_id uuid; v_bound_uid varchar; v_result jsonb;
begin
 perform private.require_active_subdivision_draft_authority(p_actor_user_id,p_organization_id,p_module,p_purpose_code);
 if p_module <> 'loteadora' or p_schedule_cron_task_uid is null or char_length(trim(p_schedule_cron_task_uid))=0 then raise exception using errcode='42501',message='SUBDIVISION_RECEIVABLE_ALERT_BIND_DENIED'; end if;
 select id,schedule_cron_task_uid into v_configuration_id,v_bound_uid from public.subdivision_internal_receivable_alert_configurations where organization_id=p_organization_id for update;
 if v_configuration_id is null then raise exception using errcode='42501',message='SUBDIVISION_RECEIVABLE_ALERT_CONFIGURATION_DENIED'; end if;
 if v_bound_uid is not null and v_bound_uid <> trim(p_schedule_cron_task_uid) then raise exception using errcode='42501',message='SUBDIVISION_RECEIVABLE_ALERT_SCHEDULE_ALREADY_BOUND'; end if;
 update public.subdivision_internal_receivable_alert_configurations set schedule_cron_task_uid=trim(p_schedule_cron_task_uid),enabled=true,updated_at=now() where id=v_configuration_id;
 v_result:=jsonb_build_object('configuration_id',v_configuration_id,'enabled',true,'schedule_bound',true);
 insert into public.admin_audit_events(correlation_id,actor_user_id,organization_id,command_name,outcome,target_type,target_id,payload_redacted) values(p_correlation_id,p_actor_user_id,p_organization_id,'subdivision_bind_internal_receivable_alert_schedule','allowed','subdivision_internal_receivable_alert_configuration',v_configuration_id,jsonb_build_object('module',p_module::text,'purpose_code',trim(p_purpose_code),'enabled',true,'schedule_bound',true,'result',v_result)); return v_result;
end; $$;
create or replace function public.subdivision_set_internal_receivable_alert_schedule_enabled(p_actor_user_id uuid,p_organization_id uuid,p_module public.operating_module,p_purpose_code text,p_enabled boolean,p_correlation_id uuid) returns varchar language plpgsql security definer set search_path='' as $$
declare v_task_uid varchar;
begin
 perform private.require_active_subdivision_draft_authority(p_actor_user_id,p_organization_id,p_module,p_purpose_code);
 update public.subdivision_internal_receivable_alert_configurations set enabled=p_enabled,updated_at=now() where organization_id=p_organization_id and schedule_cron_task_uid is not null returning schedule_cron_task_uid into v_task_uid;
 if v_task_uid is null then raise exception using errcode='42501',message='SUBDIVISION_RECEIVABLE_ALERT_SCHEDULE_NOT_BOUND'; end if;
 insert into public.admin_audit_events(correlation_id,actor_user_id,organization_id,command_name,outcome,target_type,payload_redacted) values(p_correlation_id,p_actor_user_id,p_organization_id,'subdivision_set_internal_receivable_alert_schedule_enabled','allowed','subdivision_internal_receivable_alert_configuration',jsonb_build_object('module',p_module::text,'purpose_code',trim(p_purpose_code),'enabled',p_enabled)); return v_task_uid;
end; $$;
create or replace function public.subdivision_unbind_internal_receivable_alert_schedule(p_actor_user_id uuid,p_organization_id uuid,p_module public.operating_module,p_purpose_code text,p_correlation_id uuid) returns varchar language plpgsql security definer set search_path='' as $$
declare v_task_uid varchar;
begin
 perform private.require_active_subdivision_draft_authority(p_actor_user_id,p_organization_id,p_module,p_purpose_code);
 update public.subdivision_internal_receivable_alert_configurations set enabled=false,schedule_cron_task_uid=null,updated_at=now() where organization_id=p_organization_id and schedule_cron_task_uid is not null returning schedule_cron_task_uid into v_task_uid;
 if v_task_uid is null then raise exception using errcode='42501',message='SUBDIVISION_RECEIVABLE_ALERT_SCHEDULE_NOT_BOUND'; end if;
 insert into public.admin_audit_events(correlation_id,actor_user_id,organization_id,command_name,outcome,target_type,payload_redacted) values(p_correlation_id,p_actor_user_id,p_organization_id,'subdivision_unbind_internal_receivable_alert_schedule','allowed','subdivision_internal_receivable_alert_configuration',jsonb_build_object('module',p_module::text,'purpose_code',trim(p_purpose_code),'enabled',false)); return v_task_uid;
end; $$;
revoke all on function public.subdivision_bind_internal_receivable_alert_schedule(uuid,uuid,public.operating_module,text,varchar,uuid),public.subdivision_set_internal_receivable_alert_schedule_enabled(uuid,uuid,public.operating_module,text,boolean,uuid),public.subdivision_unbind_internal_receivable_alert_schedule(uuid,uuid,public.operating_module,text,uuid) from public,anon,authenticated;
grant execute on function public.subdivision_bind_internal_receivable_alert_schedule(uuid,uuid,public.operating_module,text,varchar,uuid),public.subdivision_set_internal_receivable_alert_schedule_enabled(uuid,uuid,public.operating_module,text,boolean,uuid),public.subdivision_unbind_internal_receivable_alert_schedule(uuid,uuid,public.operating_module,text,uuid) to service_role;
