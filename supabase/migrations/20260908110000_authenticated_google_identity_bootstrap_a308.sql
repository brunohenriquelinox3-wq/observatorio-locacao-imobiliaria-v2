-- A308 — Cria a identidade interna mínima somente após uma sessão Supabase válida.
-- Não concede organização, papel, membership, grant, módulo, escopo ou privilégio.

create or replace function public.ensure_authenticated_identity_subject(
  p_actor_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_created boolean := false;
begin
  if p_actor_user_id is null or not exists (
    select 1 from auth.users auth_user where auth_user.id = p_actor_user_id
  ) then
    raise exception using errcode = '42501', message = 'AUTHENTICATED_IDENTITY_SUBJECT_INVALID';
  end if;

  insert into public.identity_subjects (user_id, lifecycle_state)
  values (p_actor_user_id, 'active')
  on conflict (user_id) do nothing;
  get diagnostics v_created = row_count;

  if v_created then
    insert into public.admin_audit_events (
      actor_user_id,
      command_name,
      outcome,
      target_type,
      target_id,
      payload_redacted
    ) values (
      p_actor_user_id,
      'ensure_authenticated_identity_subject',
      'allowed',
      'identity_subject',
      p_actor_user_id,
      jsonb_build_object('source', 'authenticated_session')
    );
  end if;
end;
$$;

revoke all on function public.ensure_authenticated_identity_subject(uuid) from public, anon, authenticated;
grant execute on function public.ensure_authenticated_identity_subject(uuid) to service_role;

comment on function public.ensure_authenticated_identity_subject(uuid) is
  'A308: cria somente o sujeito interno de uma sessão autenticada; acesso operacional exige membership, grant, escopo e vigência próprios.';
