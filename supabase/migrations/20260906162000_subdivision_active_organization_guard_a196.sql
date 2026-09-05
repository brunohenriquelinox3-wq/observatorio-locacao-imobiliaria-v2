-- A196 — Bloqueio transversal da Loteadora no Ambiente Demonstrativo.
-- Reforça o helper já usado por todos os comandos de rascunho, sem criar dados.

create or replace function private.require_subdivision_draft_authority(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_module <> 'loteadora'::public.operating_module then
    raise exception using errcode = '42501', message = 'SUBDIVISION_MODULE_DENIED';
  end if;
  perform private.require_domain_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (
    select 1 from public.organizations organization
    where organization.id = p_organization_id and organization.state = 'active'
  ) then
    raise exception using errcode = '42501', message = 'SUBDIVISION_ACTIVE_ORGANIZATION_REQUIRED';
  end if;
end;
$$;

revoke all on function private.require_subdivision_draft_authority(uuid, uuid, public.operating_module, text) from public, anon, authenticated;

comment on function private.require_subdivision_draft_authority(uuid, uuid, public.operating_module, text) is 'A196: exige módulo Loteadora, autoridade de rascunho e organização ativa antes de qualquer comando ou leitura setorial; organizações demonstrativas em rascunho permanecem isoladas.';
