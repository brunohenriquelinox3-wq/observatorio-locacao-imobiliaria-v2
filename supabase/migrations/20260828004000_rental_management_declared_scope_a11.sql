-- A11 — Escopo de administração declarado em rascunho.
-- Sem mandato, contrato, disponibilidade, preço, cobrança, repasse ou financeiro.

create type public.rental_management_service_scope as enum ('full_administration_interest', 'tenant_search_interest', 'undecided');

create table public.rental_management_declared_scopes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  intake_id uuid not null,
  declared_scope public.rental_management_service_scope not null,
  internal_note_code text,
  state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rental_management_declared_scopes_note_code check (internal_note_code is null or internal_note_code ~ '^[A-Z][A-Z0-9_]{2,79}$'),
  constraint rental_management_declared_scopes_intake_tenant_fk foreign key (intake_id, organization_id)
    references public.rental_intakes (id, organization_id) on delete restrict,
  constraint rental_management_declared_scopes_intake_unique unique (organization_id, intake_id),
  constraint rental_management_declared_scopes_tenant_match unique (id, organization_id)
);
create index rental_management_declared_scopes_context_lookup on public.rental_management_declared_scopes (organization_id, state, declared_scope, updated_at desc);

alter table public.rental_management_declared_scopes enable row level security;
revoke all on table public.rental_management_declared_scopes from public, anon, authenticated;

create or replace function public.rental_upsert_draft_management_declared_scope(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_intake_id uuid,
  p_declared_scope public.rental_management_service_scope,
  p_internal_note_code text,
  p_correlation_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_scope_id uuid; v_journey public.rental_journey_kind;
begin
  perform private.require_rental_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'rental_upsert_draft_management_declared_scope' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  select intake.journey_kind into v_journey from public.rental_intakes intake
  where intake.id = p_intake_id and intake.organization_id = p_organization_id and intake.state = 'draft';
  if v_journey is distinct from 'management_interest'::public.rental_journey_kind then
    raise exception using errcode = '42501', message = 'RENTAL_MANAGEMENT_INTAKE_REQUIRED';
  end if;
  insert into public.rental_management_declared_scopes (organization_id, intake_id, declared_scope, internal_note_code, state, created_by)
  values (p_organization_id, p_intake_id, p_declared_scope, nullif(trim(p_internal_note_code), ''), 'draft', p_actor_user_id)
  on conflict (organization_id, intake_id) do update set declared_scope = excluded.declared_scope,
    internal_note_code = excluded.internal_note_code, updated_at = now(), created_by = excluded.created_by
  returning id into v_scope_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'rental_upsert_draft_management_declared_scope', 'allowed', 'rental_management_declared_scope', v_scope_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'journey_kind', v_journey::text,
      'declared_scope', p_declared_scope::text, 'internal_note_present', nullif(trim(p_internal_note_code), '') is not null));
  return v_scope_id;
end; $$;

create or replace function public.rental_list_draft_management_declared_scopes(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table (
  scope_id uuid,
  intake_id uuid,
  declared_scope public.rental_management_service_scope,
  internal_note_present boolean,
  updated_at timestamptz
)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_rental_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query
  select scope.id, scope.intake_id, scope.declared_scope, scope.internal_note_code is not null, scope.updated_at
  from public.rental_management_declared_scopes scope
  join public.rental_intakes intake on intake.id = scope.intake_id and intake.organization_id = scope.organization_id
  where scope.organization_id = p_organization_id and scope.state = 'draft' and intake.state = 'draft'
    and intake.journey_kind = 'management_interest'::public.rental_journey_kind
  order by scope.updated_at desc, scope.id asc;
end; $$;

revoke all on function public.rental_upsert_draft_management_declared_scope(uuid, uuid, public.operating_module, text, uuid, public.rental_management_service_scope, text, uuid) from public, anon, authenticated;
revoke all on function public.rental_list_draft_management_declared_scopes(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.rental_upsert_draft_management_declared_scope(uuid, uuid, public.operating_module, text, uuid, public.rental_management_service_scope, text, uuid) to service_role;
grant execute on function public.rental_list_draft_management_declared_scopes(uuid, uuid, public.operating_module, text) to service_role;

comment on table public.rental_management_declared_scopes is 'A11: escopo apenas declarado para interesse de administração de Locação; não comprova mandato, contrato, disponibilidade ou financeiro.';
