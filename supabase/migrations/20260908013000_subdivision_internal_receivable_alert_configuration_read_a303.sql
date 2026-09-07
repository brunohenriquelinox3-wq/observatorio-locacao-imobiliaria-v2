create function public.subdivision_get_internal_receivable_alert_configuration(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_configuration record;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then
    raise exception using errcode = '42501', message = 'SUBDIVISION_RECEIVABLE_ALERT_CONFIGURATION_READ_DENIED';
  end if;

  select configuration.id, configuration.lead_days, configuration.enabled, configuration.schedule_cron_task_uid
    into v_configuration
  from public.subdivision_internal_receivable_alert_configurations configuration
  where configuration.organization_id = p_organization_id;

  if v_configuration.id is null then
    return jsonb_build_object(
      'configuration_exists', false,
      'lead_days', null,
      'enabled', false,
      'schedule_bound', false
    );
  end if;

  return jsonb_build_object(
    'configuration_exists', true,
    'lead_days', v_configuration.lead_days,
    'enabled', v_configuration.enabled,
    'schedule_bound', v_configuration.schedule_cron_task_uid is not null
  );
end;
$$;

revoke all on function public.subdivision_get_internal_receivable_alert_configuration(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.subdivision_get_internal_receivable_alert_configuration(uuid, uuid, public.operating_module, text) to service_role;
