-- A107.1 — negação explícita de qualquer acesso direto à estrutura urbana.
create policy urban_developments_deny_direct_access
  on public.urban_developments
  as restrictive
  for all
  to public
  using (false)
  with check (false);
