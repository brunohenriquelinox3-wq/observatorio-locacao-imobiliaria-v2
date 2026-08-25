-- A0.1 — Políticas explícitas de negação.
-- O A0 já revogou privilégios e habilitou RLS. Estas policies deixam a negação
-- legível para o advisor e bloqueiam qualquer acesso de anon/authenticated
-- até que comandos e policies de escopo sejam adicionados em migrations futuras.

create policy organizations_deny_direct_access
  on public.organizations
  as permissive
  for all
  to anon, authenticated
  using (false)
  with check (false);

create policy identity_subjects_deny_direct_access
  on public.identity_subjects
  as permissive
  for all
  to anon, authenticated
  using (false)
  with check (false);

create policy organization_memberships_deny_direct_access
  on public.organization_memberships
  as permissive
  for all
  to anon, authenticated
  using (false)
  with check (false);

create policy administrative_grants_deny_direct_access
  on public.administrative_grants
  as permissive
  for all
  to anon, authenticated
  using (false)
  with check (false);

create policy platform_principals_deny_direct_access
  on public.platform_principals
  as permissive
  for all
  to anon, authenticated
  using (false)
  with check (false);

create policy access_invitations_deny_direct_access
  on public.access_invitations
  as permissive
  for all
  to anon, authenticated
  using (false)
  with check (false);

create policy admin_audit_events_deny_direct_access
  on public.admin_audit_events
  as permissive
  for all
  to anon, authenticated
  using (false)
  with check (false);
