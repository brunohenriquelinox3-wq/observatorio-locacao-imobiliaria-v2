-- A4 — Atestação server-side de MFA e ativação explícita do principal inicial.
-- O browser nunca executa esta função e não informa diretamente o resultado da policy.

create or replace function public.platform_attest_and_activate_principal(
  p_subject_id uuid,
  p_aal text,
  p_amr_method text,
  p_amr_at timestamptz,
  p_verified_recovery_channel boolean,
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
  perform pg_advisory_xact_lock(hashtext('platform_attest_and_activate_principal:' || p_subject_id::text));

  select event.target_id
  into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'platform_attest_and_activate_principal'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;

  if v_existing_target is not null then
    return v_existing_target;
  end if;

  if p_aal <> 'aal2'
    or p_amr_method <> 'totp'
    or p_amr_at is null
    or p_amr_at < now() - interval '15 minutes'
    or not p_verified_recovery_channel then
    raise exception using errcode = '42501', message = 'PLATFORM_ACTIVATION_ASSURANCE_UNMET';
  end if;

  if not exists (
    select 1
    from public.identity_subjects subject
    where subject.user_id = p_subject_id
      and subject.lifecycle_state = 'active'
  ) then
    raise exception using errcode = '42501', message = 'PLATFORM_ACTIVATION_SUBJECT_INVALID';
  end if;

  update public.platform_principals principal
  set state = 'active',
      mfa_verified_at = now(),
      recovery_registered_at = now(),
      last_recertified_at = now(),
      updated_at = now()
  where principal.user_id = p_subject_id
    and principal.role = 'platform_super_admin'
    and principal.state = 'pending_activation';

  if not found then
    raise exception using errcode = '42501', message = 'PLATFORM_ACTIVATION_PRINCIPAL_INVALID';
  end if;

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, command_name, outcome, target_type, target_id, reason_code, payload_redacted
  ) values (
    p_correlation_id, p_subject_id, 'platform_attest_and_activate_principal', 'allowed', 'platform_principal', p_subject_id,
    'AAL2_TOTP_FRESH_VERIFIED_RECOVERY_CHANNEL', jsonb_build_object('assurance', 'aal2', 'amr_method', 'totp')
  );

  return p_subject_id;
end;
$$;

revoke all on function public.platform_attest_and_activate_principal(uuid, text, text, timestamptz, boolean, uuid) from public, anon, authenticated;
grant execute on function public.platform_attest_and_activate_principal(uuid, text, text, timestamptz, boolean, uuid) to service_role;
