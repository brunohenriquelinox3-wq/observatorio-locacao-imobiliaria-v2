-- A279: perfil cadastral privado, minimizado e aditivo por cliente comprador.
-- Não cria venda, reserva, proposta, crédito, renda, score, financiamento, contrato, registro, cobrança, pagamento ou repasse.

create type public.subdivision_buyer_client_profile_party_kind as enum ('individual', 'legal_entity');
create type public.subdivision_buyer_client_registration_state as enum ('contact_pending', 'base_data_in_progress', 'conditional_requirements_pending', 'base_data_review');
create type public.subdivision_buyer_client_civil_status as enum ('not_declared', 'single', 'married', 'stable_union', 'divorced', 'widowed', 'informed_other');
create type public.subdivision_buyer_client_representation_state as enum ('not_declared', 'self_represented', 'represented', 'legal_entity_represented');
create type public.subdivision_buyer_client_requirement_code as enum ('identity_evidence', 'fiscal_identifier', 'address_evidence', 'civil_status_evidence', 'spousal_qualification', 'representation_powers', 'legal_entity_registration', 'legal_entity_governance');
create type public.subdivision_buyer_client_requirement_state as enum ('not_applicable', 'to_confirm', 'pending_evidence', 'under_review', 'declared_complete');
create type public.subdivision_buyer_client_contact_purpose as enum ('service_contact', 'marketing_contact');
create type public.subdivision_buyer_client_contact_channel as enum ('email', 'phone_call', 'messaging');
create type public.subdivision_buyer_client_contact_preference_state as enum ('granted', 'revoked');

create table public.subdivision_buyer_client_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  buyer_client_id uuid not null,
  party_kind public.subdivision_buyer_client_profile_party_kind not null,
  registration_state public.subdivision_buyer_client_registration_state not null default 'contact_pending',
  document_reference text null check (document_reference is null or document_reference ~ '^(?:[0-9]{11}|[0-9]{14})$'),
  primary_email text null check (primary_email is null or char_length(trim(primary_email)) between 3 and 320),
  primary_phone text null check (primary_phone is null or char_length(trim(primary_phone)) between 8 and 25),
  messaging_phone text null check (messaging_phone is null or char_length(trim(messaging_phone)) between 8 and 25),
  civil_status public.subdivision_buyer_client_civil_status not null default 'not_declared',
  representation_state public.subdivision_buyer_client_representation_state not null default 'not_declared',
  state public.party_lifecycle_state not null default 'draft',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_buyer_client_profiles_client_fk foreign key (buyer_client_id, organization_id) references public.subdivision_buyer_clients(id, organization_id) on delete restrict,
  constraint subdivision_buyer_client_profiles_client_unique unique (organization_id, buyer_client_id),
  constraint subdivision_buyer_client_profiles_tenant_match unique (id, organization_id)
);
create index subdivision_buyer_client_profiles_context_lookup on public.subdivision_buyer_client_profiles (organization_id, state, registration_state, updated_at desc);

create table public.subdivision_buyer_client_requirements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  buyer_client_profile_id uuid not null,
  requirement_code public.subdivision_buyer_client_requirement_code not null,
  requirement_state public.subdivision_buyer_client_requirement_state not null default 'to_confirm',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_buyer_client_requirements_profile_fk foreign key (buyer_client_profile_id, organization_id) references public.subdivision_buyer_client_profiles(id, organization_id) on delete restrict,
  constraint subdivision_buyer_client_requirements_unique unique (organization_id, buyer_client_profile_id, requirement_code)
);
create index subdivision_buyer_client_requirements_context_lookup on public.subdivision_buyer_client_requirements (organization_id, buyer_client_profile_id, requirement_state, updated_at desc);

create table public.subdivision_buyer_client_contact_preferences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  buyer_client_profile_id uuid not null,
  contact_purpose public.subdivision_buyer_client_contact_purpose not null,
  contact_channel public.subdivision_buyer_client_contact_channel not null,
  preference_state public.subdivision_buyer_client_contact_preference_state not null,
  decided_at timestamptz not null default now(),
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  constraint subdivision_buyer_client_contact_preferences_profile_fk foreign key (buyer_client_profile_id, organization_id) references public.subdivision_buyer_client_profiles(id, organization_id) on delete restrict,
  constraint subdivision_buyer_client_contact_preferences_unique unique (organization_id, buyer_client_profile_id, contact_purpose, contact_channel)
);
create index subdivision_buyer_client_contact_preferences_context_lookup on public.subdivision_buyer_client_contact_preferences (organization_id, buyer_client_profile_id, contact_purpose, contact_channel);

alter table public.subdivision_buyer_client_profiles enable row level security;
alter table public.subdivision_buyer_client_requirements enable row level security;
alter table public.subdivision_buyer_client_contact_preferences enable row level security;
revoke all on table public.subdivision_buyer_client_profiles from public, anon, authenticated;
revoke all on table public.subdivision_buyer_client_requirements from public, anon, authenticated;
revoke all on table public.subdivision_buyer_client_contact_preferences from public, anon, authenticated;

create or replace function public.subdivision_upsert_draft_buyer_client_profile(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_buyer_client_id uuid, p_party_kind public.subdivision_buyer_client_profile_party_kind,
  p_registration_state public.subdivision_buyer_client_registration_state, p_document_reference text,
  p_primary_email text, p_primary_phone text, p_messaging_phone text,
  p_civil_status public.subdivision_buyer_client_civil_status,
  p_representation_state public.subdivision_buyer_client_representation_state, p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_profile_id uuid; v_party_kind public.party_kind;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'subdivision_upsert_draft_buyer_client_profile' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;

  select party.kind into v_party_kind from public.subdivision_buyer_clients buyer
  join public.party_role_assignments role_assignment on role_assignment.id = buyer.party_role_assignment_id and role_assignment.organization_id = buyer.organization_id
  join public.party_records party on party.id = role_assignment.party_id and party.organization_id = role_assignment.organization_id
  where buyer.id = p_buyer_client_id and buyer.organization_id = p_organization_id and role_assignment.module = 'loteadora'
    and role_assignment.role in ('client', 'buyer') and role_assignment.state = 'draft' and party.state = 'draft';
  if v_party_kind is null or v_party_kind::text <> p_party_kind::text then
    raise exception using errcode = '42501', message = 'SUBDIVISION_BUYER_CLIENT_PROFILE_CONTEXT_DENIED';
  end if;
  if p_document_reference is not null and ((p_party_kind = 'individual' and p_document_reference !~ '^[0-9]{11}$') or (p_party_kind = 'legal_entity' and p_document_reference !~ '^[0-9]{14}$')) then
    raise exception using errcode = '22023', message = 'SUBDIVISION_BUYER_CLIENT_PROFILE_DOCUMENT_REFERENCE_DENIED';
  end if;

  insert into public.subdivision_buyer_client_profiles (
    organization_id, buyer_client_id, party_kind, registration_state, document_reference, primary_email,
    primary_phone, messaging_phone, civil_status, representation_state, state, created_by
  ) values (
    p_organization_id, p_buyer_client_id, p_party_kind, p_registration_state, p_document_reference, p_primary_email,
    p_primary_phone, p_messaging_phone, p_civil_status, p_representation_state, 'draft', p_actor_user_id
  ) on conflict (organization_id, buyer_client_id) do update set
    party_kind = excluded.party_kind, registration_state = excluded.registration_state,
    document_reference = excluded.document_reference, primary_email = excluded.primary_email,
    primary_phone = excluded.primary_phone, messaging_phone = excluded.messaging_phone,
    civil_status = excluded.civil_status, representation_state = excluded.representation_state, updated_at = now()
  returning id into v_profile_id;

  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (
    p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_upsert_draft_buyer_client_profile', 'allowed',
    'subdivision_buyer_client_profile', v_profile_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'party_kind', p_party_kind::text,
      'registration_state', p_registration_state::text, 'document_reference_present', p_document_reference is not null,
      'primary_email_present', p_primary_email is not null, 'primary_phone_present', p_primary_phone is not null,
      'messaging_phone_present', p_messaging_phone is not null, 'civil_status', p_civil_status::text,
      'representation_state', p_representation_state::text)
  );
  return v_profile_id;
end; $$;

create or replace function public.subdivision_list_draft_buyer_client_profile_summaries(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text
) returns table (
  profile_id uuid, buyer_client_id uuid, party_kind public.subdivision_buyer_client_profile_party_kind,
  registration_state public.subdivision_buyer_client_registration_state, civil_status public.subdivision_buyer_client_civil_status,
  representation_state public.subdivision_buyer_client_representation_state, document_reference_present boolean,
  primary_email_present boolean, primary_phone_present boolean, messaging_phone_present boolean, updated_at timestamptz
) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query select profile.id, profile.buyer_client_id, profile.party_kind, profile.registration_state, profile.civil_status,
    profile.representation_state, profile.document_reference is not null, profile.primary_email is not null,
    profile.primary_phone is not null, profile.messaging_phone is not null, profile.updated_at
  from public.subdivision_buyer_client_profiles profile
  join public.subdivision_buyer_clients buyer on buyer.id = profile.buyer_client_id and buyer.organization_id = profile.organization_id
  where profile.organization_id = p_organization_id and profile.state = 'draft'
  order by profile.updated_at desc, profile.id asc;
end; $$;

create or replace function public.subdivision_get_draft_buyer_client_profile(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_buyer_client_id uuid
) returns table (
  profile_id uuid, buyer_client_id uuid, party_kind public.subdivision_buyer_client_profile_party_kind,
  registration_state public.subdivision_buyer_client_registration_state, document_reference text, primary_email text,
  primary_phone text, messaging_phone text, civil_status public.subdivision_buyer_client_civil_status,
  representation_state public.subdivision_buyer_client_representation_state, updated_at timestamptz
) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query select profile.id, profile.buyer_client_id, profile.party_kind, profile.registration_state, profile.document_reference,
    profile.primary_email, profile.primary_phone, profile.messaging_phone, profile.civil_status, profile.representation_state, profile.updated_at
  from public.subdivision_buyer_client_profiles profile
  join public.subdivision_buyer_clients buyer on buyer.id = profile.buyer_client_id and buyer.organization_id = profile.organization_id
  where profile.organization_id = p_organization_id and profile.buyer_client_id = p_buyer_client_id and profile.state = 'draft';
end; $$;

create or replace function public.subdivision_list_draft_buyer_client_requirements(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_buyer_client_id uuid
) returns table (requirement_code public.subdivision_buyer_client_requirement_code, requirement_state public.subdivision_buyer_client_requirement_state, updated_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query select requirement.requirement_code, requirement.requirement_state, requirement.updated_at
  from public.subdivision_buyer_client_requirements requirement
  join public.subdivision_buyer_client_profiles profile on profile.id = requirement.buyer_client_profile_id and profile.organization_id = requirement.organization_id
  where requirement.organization_id = p_organization_id and profile.buyer_client_id = p_buyer_client_id and profile.state = 'draft'
  order by requirement.requirement_code asc;
end; $$;

create or replace function public.subdivision_upsert_draft_buyer_client_requirement(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_buyer_client_id uuid, p_requirement_code public.subdivision_buyer_client_requirement_code,
  p_requirement_state public.subdivision_buyer_client_requirement_state, p_correlation_id uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_requirement_id uuid; v_profile_id uuid; v_code public.subdivision_buyer_client_requirement_code; v_state public.subdivision_buyer_client_requirement_state;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'subdivision_upsert_draft_buyer_client_requirement' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then
    select requirement.requirement_code, requirement.requirement_state into v_code, v_state from public.subdivision_buyer_client_requirements requirement
    where requirement.id = v_existing_target and requirement.organization_id = p_organization_id;
    if v_code is null then raise exception using errcode = '42501', message = 'SUBDIVISION_BUYER_CLIENT_REQUIREMENT_REPLAY_DENIED'; end if;
    return jsonb_build_object('requirement_code', v_code::text, 'requirement_state', v_state::text);
  end if;
  select profile.id into v_profile_id from public.subdivision_buyer_client_profiles profile
  join public.subdivision_buyer_clients buyer on buyer.id = profile.buyer_client_id and buyer.organization_id = profile.organization_id
  where profile.organization_id = p_organization_id and profile.buyer_client_id = p_buyer_client_id and profile.state = 'draft';
  if v_profile_id is null then raise exception using errcode = '42501', message = 'SUBDIVISION_BUYER_CLIENT_REQUIREMENT_CONTEXT_DENIED'; end if;
  insert into public.subdivision_buyer_client_requirements (organization_id, buyer_client_profile_id, requirement_code, requirement_state, created_by)
  values (p_organization_id, v_profile_id, p_requirement_code, p_requirement_state, p_actor_user_id)
  on conflict (organization_id, buyer_client_profile_id, requirement_code) do update set requirement_state = excluded.requirement_state, updated_at = now()
  returning id into v_requirement_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_upsert_draft_buyer_client_requirement', 'allowed',
    'subdivision_buyer_client_requirement', v_requirement_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'requirement_code', p_requirement_code::text, 'requirement_state', p_requirement_state::text));
  return jsonb_build_object('requirement_code', p_requirement_code::text, 'requirement_state', p_requirement_state::text);
end; $$;

create or replace function public.subdivision_list_draft_buyer_client_contact_preferences(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_buyer_client_id uuid
) returns table (contact_purpose public.subdivision_buyer_client_contact_purpose, contact_channel public.subdivision_buyer_client_contact_channel, preference_state public.subdivision_buyer_client_contact_preference_state, decided_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query select preference.contact_purpose, preference.contact_channel, preference.preference_state, preference.decided_at
  from public.subdivision_buyer_client_contact_preferences preference
  join public.subdivision_buyer_client_profiles profile on profile.id = preference.buyer_client_profile_id and profile.organization_id = preference.organization_id
  where preference.organization_id = p_organization_id and profile.buyer_client_id = p_buyer_client_id and profile.state = 'draft'
  order by preference.contact_purpose asc, preference.contact_channel asc;
end; $$;

create or replace function public.subdivision_upsert_draft_buyer_client_contact_preference(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_buyer_client_id uuid, p_contact_purpose public.subdivision_buyer_client_contact_purpose,
  p_contact_channel public.subdivision_buyer_client_contact_channel,
  p_preference_state public.subdivision_buyer_client_contact_preference_state, p_correlation_id uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_preference_id uuid; v_profile_id uuid; v_purpose public.subdivision_buyer_client_contact_purpose; v_channel public.subdivision_buyer_client_contact_channel; v_state public.subdivision_buyer_client_contact_preference_state;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
  where event.command_name = 'subdivision_upsert_draft_buyer_client_contact_preference' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
  order by event.occurred_at desc limit 1;
  if v_existing_target is not null then
    select preference.contact_purpose, preference.contact_channel, preference.preference_state into v_purpose, v_channel, v_state
    from public.subdivision_buyer_client_contact_preferences preference where preference.id = v_existing_target and preference.organization_id = p_organization_id;
    if v_purpose is null then raise exception using errcode = '42501', message = 'SUBDIVISION_BUYER_CLIENT_CONTACT_PREFERENCE_REPLAY_DENIED'; end if;
    return jsonb_build_object('contact_purpose', v_purpose::text, 'contact_channel', v_channel::text, 'preference_state', v_state::text);
  end if;
  select profile.id into v_profile_id from public.subdivision_buyer_client_profiles profile
  join public.subdivision_buyer_clients buyer on buyer.id = profile.buyer_client_id and buyer.organization_id = profile.organization_id
  where profile.organization_id = p_organization_id and profile.buyer_client_id = p_buyer_client_id and profile.state = 'draft';
  if v_profile_id is null then raise exception using errcode = '42501', message = 'SUBDIVISION_BUYER_CLIENT_CONTACT_PREFERENCE_CONTEXT_DENIED'; end if;
  insert into public.subdivision_buyer_client_contact_preferences (organization_id, buyer_client_profile_id, contact_purpose, contact_channel, preference_state, decided_at, created_by)
  values (p_organization_id, v_profile_id, p_contact_purpose, p_contact_channel, p_preference_state, now(), p_actor_user_id)
  on conflict (organization_id, buyer_client_profile_id, contact_purpose, contact_channel) do update set preference_state = excluded.preference_state, decided_at = now()
  returning id into v_preference_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_upsert_draft_buyer_client_contact_preference', 'allowed',
    'subdivision_buyer_client_contact_preference', v_preference_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'contact_purpose', p_contact_purpose::text,
      'contact_channel', p_contact_channel::text, 'preference_state', p_preference_state::text));
  return jsonb_build_object('contact_purpose', p_contact_purpose::text, 'contact_channel', p_contact_channel::text, 'preference_state', p_preference_state::text);
end; $$;

revoke all on function public.subdivision_upsert_draft_buyer_client_profile(uuid, uuid, public.operating_module, text, uuid, public.subdivision_buyer_client_profile_party_kind, public.subdivision_buyer_client_registration_state, text, text, text, text, public.subdivision_buyer_client_civil_status, public.subdivision_buyer_client_representation_state, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_draft_buyer_client_profile_summaries(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
revoke all on function public.subdivision_get_draft_buyer_client_profile(uuid, uuid, public.operating_module, text, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_draft_buyer_client_requirements(uuid, uuid, public.operating_module, text, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_upsert_draft_buyer_client_requirement(uuid, uuid, public.operating_module, text, uuid, public.subdivision_buyer_client_requirement_code, public.subdivision_buyer_client_requirement_state, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_draft_buyer_client_contact_preferences(uuid, uuid, public.operating_module, text, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_upsert_draft_buyer_client_contact_preference(uuid, uuid, public.operating_module, text, uuid, public.subdivision_buyer_client_contact_purpose, public.subdivision_buyer_client_contact_channel, public.subdivision_buyer_client_contact_preference_state, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_upsert_draft_buyer_client_profile(uuid, uuid, public.operating_module, text, uuid, public.subdivision_buyer_client_profile_party_kind, public.subdivision_buyer_client_registration_state, text, text, text, text, public.subdivision_buyer_client_civil_status, public.subdivision_buyer_client_representation_state, uuid) to service_role;
grant execute on function public.subdivision_list_draft_buyer_client_profile_summaries(uuid, uuid, public.operating_module, text) to service_role;
grant execute on function public.subdivision_get_draft_buyer_client_profile(uuid, uuid, public.operating_module, text, uuid) to service_role;
grant execute on function public.subdivision_list_draft_buyer_client_requirements(uuid, uuid, public.operating_module, text, uuid) to service_role;
grant execute on function public.subdivision_upsert_draft_buyer_client_requirement(uuid, uuid, public.operating_module, text, uuid, public.subdivision_buyer_client_requirement_code, public.subdivision_buyer_client_requirement_state, uuid) to service_role;
grant execute on function public.subdivision_list_draft_buyer_client_contact_preferences(uuid, uuid, public.operating_module, text, uuid) to service_role;
grant execute on function public.subdivision_upsert_draft_buyer_client_contact_preference(uuid, uuid, public.operating_module, text, uuid, public.subdivision_buyer_client_contact_purpose, public.subdivision_buyer_client_contact_channel, public.subdivision_buyer_client_contact_preference_state, uuid) to service_role;

comment on table public.subdivision_buyer_client_profiles is 'A279: perfil cadastral privado e minimizado de cliente comprador; sem venda, crédito, renda, score, lote, preço, proposta, contrato, registro, cobrança, pagamento ou repasse.';
comment on table public.subdivision_buyer_client_requirements is 'A279: pendências condicionais de prontidão; sem bytes, imagens, URLs, chaves de arquivo ou conteúdo documental.';
comment on table public.subdivision_buyer_client_contact_preferences is 'A279: decisão granular de contato por finalidade e canal; não substitui base legal nem habilita marketing por padrão.';
