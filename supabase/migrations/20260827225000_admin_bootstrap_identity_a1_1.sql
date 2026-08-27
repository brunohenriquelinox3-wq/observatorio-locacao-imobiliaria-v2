-- A1.1 — Bootstrap vincula somente uma identidade Supabase já existente.
-- Não cria usuário Auth, não envia e-mail, não ativa principal e não concede acesso ao navegador.

create or replace function public.platform_bootstrap_principal(
  p_subject_id uuid,
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
  perform pg_advisory_xact_lock(hashtext('platform_bootstrap_principal'));

  select event.target_id
  into v_existing_target
  from public.admin_audit_events event
  where event.command_name = 'platform_bootstrap_principal'
    and event.correlation_id = p_correlation_id
    and event.outcome = 'allowed'
  order by event.occurred_at desc
  limit 1;

  if v_existing_target is not null then
    return v_existing_target;
  end if;

  if not exists (select 1 from auth.users auth_user where auth_user.id = p_subject_id) then
    raise exception using errcode = '42501', message = 'BOOTSTRAP_SUBJECT_INVALID';
  end if;

  insert into public.identity_subjects (user_id, lifecycle_state)
  values (p_subject_id, 'active')
  on conflict (user_id) do nothing;

  if exists (
    select 1
    from public.platform_principals principal
    where principal.state in ('pending_activation', 'active', 'suspended')
  ) then
    raise exception using errcode = '42501', message = 'BOOTSTRAP_ALREADY_ESTABLISHED';
  end if;

  insert into public.platform_principals (user_id, role, state)
  values (p_subject_id, 'platform_super_admin', 'pending_activation');

  insert into public.admin_audit_events (
    correlation_id, actor_user_id, command_name, outcome, target_type, target_id, reason_code, payload_redacted
  ) values (
    p_correlation_id, p_subject_id, 'platform_bootstrap_principal', 'allowed', 'platform_principal', p_subject_id,
    'PENDING_MFA_ACTIVATION', '{}'::jsonb
  );

  return p_subject_id;
end;
$$;

revoke all on function public.platform_bootstrap_principal(uuid, uuid) from public, anon, authenticated;
grant execute on function public.platform_bootstrap_principal(uuid, uuid) to service_role;
