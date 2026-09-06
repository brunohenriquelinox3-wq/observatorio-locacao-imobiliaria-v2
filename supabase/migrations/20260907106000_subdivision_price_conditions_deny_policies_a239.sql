-- A239: torna o fail-closed de condições de preço explícito para anon e authenticated.
-- Não altera condições, políticas, preços, matriz, contratos ou outros dados.

alter table public.subdivision_price_conditions enable row level security;

drop policy if exists subdivision_price_conditions_deny_anon on public.subdivision_price_conditions;
drop policy if exists subdivision_price_conditions_deny_authenticated on public.subdivision_price_conditions;

create policy subdivision_price_conditions_deny_anon
  on public.subdivision_price_conditions
  as restrictive
  for all
  to anon
  using (false)
  with check (false);

create policy subdivision_price_conditions_deny_authenticated
  on public.subdivision_price_conditions
  as restrictive
  for all
  to authenticated
  using (false)
  with check (false);

revoke all on table public.subdivision_price_conditions from public, anon, authenticated;

comment on policy subdivision_price_conditions_deny_anon on public.subdivision_price_conditions is 'A239: fail-closed; somente funções SECURITY DEFINER executadas pelo serviço podem operar condições.';
comment on policy subdivision_price_conditions_deny_authenticated on public.subdivision_price_conditions is 'A239: fail-closed; somente funções SECURITY DEFINER executadas pelo serviço podem operar condições.';
