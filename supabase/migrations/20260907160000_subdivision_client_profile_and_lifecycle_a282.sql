-- A282: Cliente Loteadora — identificação complementar, cadastro direto sem semântica comercial e arquivamento reversível.
-- Preserva Party, vínculos legados e anexos privados; não cria venda, crédito, preço, proposta, contrato, registro, cobrança ou financeiro.

alter table public.subdivision_buyer_clients
  add column if not exists state public.party_lifecycle_state not null default 'draft',
  add column if not exists updated_at timestamptz not null default now();
create index if not exists subdivision_buyer_clients_lifecycle_lookup
  on public.subdivision_buyer_clients (organization_id, state, updated_at desc);

alter table public.subdivision_buyer_client_profiles
  add column if not exists identity_document_reference text null
  check (identity_document_reference is null or identity_document_reference ~ '^[A-Za-z0-9.\-/[:space:]]{4,40}$');

drop function if exists public.subdivision_upsert_draft_buyer_client_profile(uuid, uuid, public.operating_module, text, uuid, public.subdivision_buyer_client_profile_party_kind, public.subdivision_buyer_client_registration_state, text, text, text, text, public.subdivision_buyer_client_civil_status, public.subdivision_buyer_client_representation_state, uuid);
create function public.subdivision_upsert_draft_buyer_client_profile(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_buyer_client_id uuid, p_party_kind public.subdivision_buyer_client_profile_party_kind,
  p_registration_state public.subdivision_buyer_client_registration_state, p_document_reference text,
  p_identity_document_reference text, p_primary_email text, p_primary_phone text, p_messaging_phone text,
  p_civil_status public.subdivision_buyer_client_civil_status, p_representation_state public.subdivision_buyer_client_representation_state,
  p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing_target uuid; v_profile_id uuid; v_party_kind public.party_kind;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select event.target_id into v_existing_target from public.admin_audit_events event
    where event.command_name = 'subdivision_upsert_draft_buyer_client_profile' and event.correlation_id = p_correlation_id and event.outcome = 'allowed'
    order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return v_existing_target; end if;
  select party.kind into v_party_kind from public.subdivision_buyer_clients client
    join public.party_role_assignments role_assignment on role_assignment.id = client.party_role_assignment_id and role_assignment.organization_id = client.organization_id
    join public.party_records party on party.id = role_assignment.party_id and party.organization_id = role_assignment.organization_id
    where client.id = p_buyer_client_id and client.organization_id = p_organization_id and client.state = 'draft'
      and role_assignment.module = 'loteadora' and role_assignment.role in ('client', 'buyer') and role_assignment.state = 'draft' and party.state = 'draft';
  if v_party_kind is null or v_party_kind::text <> p_party_kind::text then raise exception using errcode = '42501', message = 'SUBDIVISION_CLIENT_PROFILE_CONTEXT_DENIED'; end if;
  if p_document_reference is not null and ((p_party_kind = 'individual' and p_document_reference !~ '^[0-9]{11}$') or (p_party_kind = 'legal_entity' and p_document_reference !~ '^[0-9]{14}$')) then raise exception using errcode = '22023', message = 'SUBDIVISION_CLIENT_PROFILE_DOCUMENT_REFERENCE_DENIED'; end if;
  insert into public.subdivision_buyer_client_profiles (organization_id, buyer_client_id, party_kind, registration_state, document_reference, identity_document_reference, primary_email, primary_phone, messaging_phone, civil_status, representation_state, state, created_by)
  values (p_organization_id, p_buyer_client_id, p_party_kind, p_registration_state, p_document_reference, p_identity_document_reference, p_primary_email, p_primary_phone, p_messaging_phone, p_civil_status, p_representation_state, 'draft', p_actor_user_id)
  on conflict (organization_id, buyer_client_id) do update set party_kind = excluded.party_kind, registration_state = excluded.registration_state, document_reference = excluded.document_reference, identity_document_reference = excluded.identity_document_reference, primary_email = excluded.primary_email, primary_phone = excluded.primary_phone, messaging_phone = excluded.messaging_phone, civil_status = excluded.civil_status, representation_state = excluded.representation_state, updated_at = now()
  returning id into v_profile_id;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_upsert_draft_buyer_client_profile', 'allowed', 'subdivision_buyer_client_profile', v_profile_id,
    jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'party_kind', p_party_kind::text, 'registration_state', p_registration_state::text, 'document_reference_present', p_document_reference is not null, 'identity_document_reference_present', p_identity_document_reference is not null, 'primary_email_present', p_primary_email is not null, 'primary_phone_present', p_primary_phone is not null, 'messaging_phone_present', p_messaging_phone is not null, 'civil_status', p_civil_status::text, 'representation_state', p_representation_state::text));
  return v_profile_id;
end; $$;

drop function if exists public.subdivision_get_draft_buyer_client_profile(uuid, uuid, public.operating_module, text, uuid);
create or replace function public.subdivision_get_draft_buyer_client_profile(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_buyer_client_id uuid
) returns table (profile_id uuid, buyer_client_id uuid, party_kind public.subdivision_buyer_client_profile_party_kind, registration_state public.subdivision_buyer_client_registration_state, document_reference text, identity_document_reference text, primary_email text, primary_phone text, messaging_phone text, civil_status public.subdivision_buyer_client_civil_status, representation_state public.subdivision_buyer_client_representation_state, updated_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query select profile.id, profile.buyer_client_id, profile.party_kind, profile.registration_state, profile.document_reference, profile.identity_document_reference, profile.primary_email, profile.primary_phone, profile.messaging_phone, profile.civil_status, profile.representation_state, profile.updated_at
  from public.subdivision_buyer_client_profiles profile join public.subdivision_buyer_clients client on client.id = profile.buyer_client_id and client.organization_id = profile.organization_id
  where profile.organization_id = p_organization_id and profile.buyer_client_id = p_buyer_client_id and profile.state = 'draft' and client.state = 'draft';
end; $$;

create or replace function public.subdivision_register_client_direct(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_party_kind public.party_kind, p_display_name text, p_correlation_id uuid
) returns table(client_id uuid) language plpgsql security definer set search_path = '' as $$
declare v_party_id uuid; v_role_id uuid; v_client_id uuid; v_reused boolean := false; v_reactivated boolean := false; v_existing_target uuid;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_CLIENT_DIRECT_CONTEXT_DENIED'; end if;
  if char_length(trim(p_display_name)) < 2 or char_length(trim(p_display_name)) > 160 then raise exception using errcode = '22023', message = 'SUBDIVISION_CLIENT_DIRECT_NAME_DENIED'; end if;
  select event.target_id into v_existing_target from public.admin_audit_events event where event.command_name = 'subdivision_register_client_direct' and event.correlation_id = p_correlation_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_existing_target is not null then return query select v_existing_target; return; end if;
  select party.id into v_party_id from public.party_records party where party.organization_id = p_organization_id and party.kind = p_party_kind and party.state = 'draft' and lower(trim(party.display_name)) = lower(trim(p_display_name)) order by party.created_at, party.id limit 1;
  if v_party_id is null then insert into public.party_records (organization_id, kind, display_name, source_kind, state, created_by) values (p_organization_id, p_party_kind, trim(p_display_name), 'operator_declaration', 'draft', p_actor_user_id) returning id into v_party_id; end if;
  select role_assignment.id into v_role_id from public.party_role_assignments role_assignment where role_assignment.organization_id = p_organization_id and role_assignment.party_id = v_party_id and role_assignment.module = p_module and role_assignment.role in ('client', 'buyer') and role_assignment.purpose_code = trim(p_purpose_code) and role_assignment.state = 'draft' and (role_assignment.ends_at is null or role_assignment.ends_at > now()) order by case when role_assignment.role = 'client' then 0 else 1 end, role_assignment.starts_at limit 1;
  if v_role_id is null then insert into public.party_role_assignments (organization_id, party_id, module, role, purpose_code, starts_at, state, created_by) values (p_organization_id, v_party_id, p_module, 'client', trim(p_purpose_code), now(), 'draft', p_actor_user_id) returning id into v_role_id; end if;
  select client.id, client.state = 'archived' into v_client_id, v_reactivated from public.subdivision_buyer_clients client where client.organization_id = p_organization_id and client.party_role_assignment_id = v_role_id limit 1;
  v_reused := v_client_id is not null;
  if v_client_id is null then insert into public.subdivision_buyer_clients (organization_id, party_role_assignment_id, created_by, state) values (p_organization_id, v_role_id, p_actor_user_id, 'draft') returning id into v_client_id;
  elsif v_reactivated then update public.subdivision_buyer_clients set state = 'draft', updated_at = now() where id = v_client_id and organization_id = p_organization_id; end if;
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_register_client_direct', 'allowed', 'subdivision_client', v_client_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'party_kind', p_party_kind::text, 'display_name_present', true, 'client_reused', v_reused, 'client_reactivated', v_reactivated));
  return query select v_client_id;
end; $$;

create or replace function public.subdivision_archive_client(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_client_id uuid, p_correlation_id uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_existing jsonb; v_result jsonb;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || ':' || p_client_id::text, 0));
  select event.payload_redacted -> 'result' into v_existing from public.admin_audit_events event where event.command_name = 'subdivision_archive_client' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  if not exists (select 1 from public.subdivision_buyer_clients client join public.party_role_assignments role_assignment on role_assignment.id = client.party_role_assignment_id and role_assignment.organization_id = client.organization_id where client.id = p_client_id and client.organization_id = p_organization_id and client.state = 'draft' and role_assignment.module = 'loteadora' and role_assignment.role in ('client', 'buyer') and role_assignment.state = 'draft') then raise exception using errcode = '42501', message = 'SUBDIVISION_CLIENT_ARCHIVE_CONTEXT_DENIED'; end if;
  update public.subdivision_buyer_clients set state = 'archived', updated_at = now() where id = p_client_id and organization_id = p_organization_id and state = 'draft';
  v_result := jsonb_build_object('buyer_client_id', p_client_id, 'lifecycle_state', 'archived');
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_archive_client', 'allowed', 'subdivision_client', p_client_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'result', v_result));
  return v_result;
end; $$;

create or replace function public.subdivision_restore_client(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_client_id uuid, p_correlation_id uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_existing jsonb; v_result jsonb;
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || ':' || p_client_id::text, 0));
  select event.payload_redacted -> 'result' into v_existing from public.admin_audit_events event where event.command_name = 'subdivision_restore_client' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  if not exists (select 1 from public.subdivision_buyer_clients client join public.party_role_assignments role_assignment on role_assignment.id = client.party_role_assignment_id and role_assignment.organization_id = client.organization_id where client.id = p_client_id and client.organization_id = p_organization_id and client.state = 'archived' and role_assignment.module = 'loteadora' and role_assignment.role in ('client', 'buyer') and role_assignment.state = 'draft') then raise exception using errcode = '42501', message = 'SUBDIVISION_CLIENT_RESTORE_CONTEXT_DENIED'; end if;
  update public.subdivision_buyer_clients set state = 'draft', updated_at = now() where id = p_client_id and organization_id = p_organization_id and state = 'archived';
  v_result := jsonb_build_object('buyer_client_id', p_client_id, 'lifecycle_state', 'draft');
  insert into public.admin_audit_events (correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted) values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_restore_client', 'allowed', 'subdivision_client', p_client_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'result', v_result));
  return v_result;
end; $$;

create or replace function public.subdivision_list_archived_clients(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text
) returns table(client_id uuid, display_name text, archived_at timestamptz) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query select client.id, party.display_name, client.updated_at from public.subdivision_buyer_clients client join public.party_role_assignments role_assignment on role_assignment.id = client.party_role_assignment_id and role_assignment.organization_id = client.organization_id join public.party_records party on party.id = role_assignment.party_id and party.organization_id = role_assignment.organization_id where client.organization_id = p_organization_id and client.state = 'archived' and role_assignment.module = 'loteadora' and role_assignment.role in ('client', 'buyer') and role_assignment.state = 'draft' order by client.updated_at desc, client.id;
end; $$;

create or replace function public.subdivision_list_draft_buyer_clients(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text) returns table(buyer_client_id uuid,party_role_assignment_id uuid,created_at timestamptz) language plpgsql security definer set search_path='' as $$ begin perform private.require_subdivision_draft_authority(p_actor_user_id,p_organization_id,p_module,p_purpose_code); return query select id,party_role_assignment_id,created_at from public.subdivision_buyer_clients where organization_id=p_organization_id and state='draft' order by created_at desc; end; $$;

create or replace function public.subdivision_list_draft_buyer_client_directory(p_actor_user_id uuid,p_organization_id uuid,p_module public.operating_module,p_purpose_code text,p_search_term text,p_page_size integer,p_page_offset integer) returns table(buyer_client_id uuid,display_name text,party_kind text,registration_state text,profile_present boolean,contact_channels_recorded integer,requirements_pending integer,requirements_total integer,attachment_summary text,updated_at timestamptz) language plpgsql security definer set search_path='' as $$ begin perform private.require_subdivision_draft_authority(p_actor_user_id,p_organization_id,p_module,p_purpose_code); if p_search_term is not null and char_length(trim(p_search_term)) < 2 then raise exception using errcode='22023',message='SUBDIVISION_CLIENT_DIRECTORY_SEARCH_DENIED'; end if; if p_page_size<1 or p_page_size>25 or p_page_offset<0 or p_page_offset>500 then raise exception using errcode='22023',message='SUBDIVISION_CLIENT_DIRECTORY_PAGE_DENIED'; end if; return query select client.id,party.display_name,party.kind::text,coalesce(profile.registration_state::text,'contact_pending'),profile.id is not null,((profile.primary_email is not null)::integer+(profile.primary_phone is not null)::integer+(profile.messaging_phone is not null)::integer),coalesce(requirement_summary.pending_count,0)::integer,coalesce(requirement_summary.total_count,0)::integer,coalesce(attachment_summary.attachment_state,'no_private_attachment'),greatest(client.updated_at,coalesce(profile.updated_at,client.updated_at)) from public.subdivision_buyer_clients client join public.party_role_assignments role_assignment on role_assignment.id=client.party_role_assignment_id and role_assignment.organization_id=client.organization_id join public.party_records party on party.id=role_assignment.party_id and party.organization_id=role_assignment.organization_id left join public.subdivision_buyer_client_profiles profile on profile.buyer_client_id=client.id and profile.organization_id=client.organization_id and profile.state='draft' left join lateral(select count(*) filter(where requirement.requirement_state in ('to_confirm','pending_evidence','under_review'))::integer as pending_count,count(*)::integer as total_count from public.subdivision_buyer_client_requirements requirement where requirement.organization_id=client.organization_id and requirement.buyer_client_profile_id=profile.id) requirement_summary on true left join lateral(select case when intent.storage_key is null then 'awaiting_private_upload' else 'private_upload_recorded' end as attachment_state from public.subdivision_buyer_attachment_intents intent where intent.organization_id=client.organization_id and intent.buyer_client_id=client.id order by intent.created_at desc limit 1) attachment_summary on true where client.organization_id=p_organization_id and client.state='draft' and role_assignment.module='loteadora' and role_assignment.role in ('client','buyer') and role_assignment.state='draft' and party.state='draft' and(p_search_term is null or party.display_name ilike '%'||trim(p_search_term)||'%') order by greatest(client.updated_at,coalesce(profile.updated_at,client.updated_at)) desc,client.id limit p_page_size offset p_page_offset; end; $$;

revoke all on function public.subdivision_upsert_draft_buyer_client_profile(uuid,uuid,public.operating_module,text,uuid,public.subdivision_buyer_client_profile_party_kind,public.subdivision_buyer_client_registration_state,text,text,text,text,text,public.subdivision_buyer_client_civil_status,public.subdivision_buyer_client_representation_state,uuid) from public, anon, authenticated;
revoke all on function public.subdivision_register_client_direct(uuid,uuid,public.operating_module,text,public.party_kind,text,uuid) from public, anon, authenticated;
revoke all on function public.subdivision_archive_client(uuid,uuid,public.operating_module,text,uuid,uuid) from public, anon, authenticated;
revoke all on function public.subdivision_restore_client(uuid,uuid,public.operating_module,text,uuid,uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_archived_clients(uuid,uuid,public.operating_module,text) from public, anon, authenticated;
grant execute on function public.subdivision_upsert_draft_buyer_client_profile(uuid,uuid,public.operating_module,text,uuid,public.subdivision_buyer_client_profile_party_kind,public.subdivision_buyer_client_registration_state,text,text,text,text,text,public.subdivision_buyer_client_civil_status,public.subdivision_buyer_client_representation_state,uuid) to service_role;
grant execute on function public.subdivision_register_client_direct(uuid,uuid,public.operating_module,text,public.party_kind,text,uuid) to service_role;
grant execute on function public.subdivision_archive_client(uuid,uuid,public.operating_module,text,uuid,uuid) to service_role;
grant execute on function public.subdivision_restore_client(uuid,uuid,public.operating_module,text,uuid,uuid) to service_role;
grant execute on function public.subdivision_list_archived_clients(uuid,uuid,public.operating_module,text) to service_role;
