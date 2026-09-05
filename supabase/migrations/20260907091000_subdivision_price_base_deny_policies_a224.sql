-- A224: reforço explícito de RLS fail-closed para tabelas de preço-base.
-- Leituras e escritas seguem exclusivas às RPCs SECURITY DEFINER executadas pelo servidor.

create policy subdivision_price_base_policies_deny_all
  on public.subdivision_price_base_policies
  as restrictive
  for all
  to public
  using (false)
  with check (false);

create policy subdivision_price_base_policy_lines_deny_all
  on public.subdivision_price_base_policy_lines
  as restrictive
  for all
  to public
  using (false)
  with check (false);
