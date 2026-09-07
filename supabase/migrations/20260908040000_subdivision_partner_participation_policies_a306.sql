-- A306: participações internas por loteamento. Não cria beneficiário bancário, split, cobrança, boleto, remessa, pagamento, baixa, transferência ou confirmação de recebimento.

create table public.subdivision_internal_party_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  party_role_assignment_id uuid not null,
  document_reference text not null check (document_reference ~ '^(?:[0-9]{11}|[0-9]{14})$'),
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_internal_party_profiles_role_tenant_fk foreign key (party_role_assignment_id, organization_id) references public.party_role_assignments(id, organization_id) on delete restrict,
  constraint subdivision_internal_party_profiles_role_unique unique (organization_id, party_role_assignment_id),
  constraint subdivision_internal_party_profiles_document_unique unique (organization_id, document_reference)
);
alter table public.subdivision_internal_party_profiles enable row level security;
revoke all on table public.subdivision_internal_party_profiles from public, anon, authenticated;

create table public.subdivision_participation_policy_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  development_id uuid not null,
  version_number integer not null check (version_number between 1 and 9999),
  state text not null check (state in ('draft', 'active', 'superseded', 'archived')) default 'draft',
  valid_from date not null,
  valid_until date null,
  require_full_allocation boolean not null default false,
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  activated_at timestamptz null,
  updated_at timestamptz not null default now(),
  constraint subdivision_participation_policy_versions_development_tenant_fk foreign key (development_id, organization_id) references public.subdivision_developments(id, organization_id) on delete restrict,
  constraint subdivision_participation_policy_versions_window check (valid_until is null or valid_until >= valid_from),
  constraint subdivision_participation_policy_versions_number_unique unique (organization_id, development_id, version_number),
  constraint subdivision_participation_policy_versions_tenant_match unique (id, organization_id)
);
alter table public.subdivision_participation_policy_versions enable row level security;
revoke all on table public.subdivision_participation_policy_versions from public, anon, authenticated;

create table public.subdivision_participation_policy_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  policy_version_id uuid not null,
  internal_party_role_link_id uuid not null,
  allocation_method text not null check (allocation_method in ('percentage_per_schedule', 'fixed_per_schedule', 'capped_total_per_lot')),
  percentage_basis_points integer null check (percentage_basis_points between 1 and 10000),
  fixed_amount_cents bigint null check (fixed_amount_cents between 1 and 100000000000000),
  cap_total_cents bigint null check (cap_total_cents between 1 and 100000000000000),
  applies_to_all_lots boolean not null default true,
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subdivision_participation_policy_rules_policy_tenant_fk foreign key (policy_version_id, organization_id) references public.subdivision_participation_policy_versions(id, organization_id) on delete restrict,
  constraint subdivision_participation_policy_rules_role_tenant_fk foreign key (internal_party_role_link_id, organization_id) references public.subdivision_internal_party_roles(id, organization_id) on delete restrict,
  constraint subdivision_participation_policy_rules_method_detail check (
    (allocation_method = 'percentage_per_schedule' and percentage_basis_points is not null and fixed_amount_cents is null and cap_total_cents is null)
    or (allocation_method = 'fixed_per_schedule' and percentage_basis_points is null and fixed_amount_cents is not null and cap_total_cents is null)
    or (allocation_method = 'capped_total_per_lot' and percentage_basis_points is null and fixed_amount_cents is null and cap_total_cents is not null)
  ),
  constraint subdivision_participation_policy_rules_tenant_match unique (id, organization_id)
);
alter table public.subdivision_participation_policy_rules enable row level security;
revoke all on table public.subdivision_participation_policy_rules from public, anon, authenticated;

create table public.subdivision_participation_rule_schedule_kinds (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  rule_id uuid not null,
  schedule_kind text not null check (schedule_kind in ('entry', 'entry_installment', 'installment', 'cash_settlement', 'supplemental_cash', 'trade_in_credit')),
  created_at timestamptz not null default now(),
  constraint subdivision_participation_rule_schedule_kinds_rule_tenant_fk foreign key (rule_id, organization_id) references public.subdivision_participation_policy_rules(id, organization_id) on delete restrict,
  constraint subdivision_participation_rule_schedule_kinds_unique unique (organization_id, rule_id, schedule_kind)
);
alter table public.subdivision_participation_rule_schedule_kinds enable row level security;
revoke all on table public.subdivision_participation_rule_schedule_kinds from public, anon, authenticated;

create table public.subdivision_participation_rule_lot_scopes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  rule_id uuid not null,
  lot_id uuid not null,
  created_at timestamptz not null default now(),
  constraint subdivision_participation_rule_lot_scopes_rule_tenant_fk foreign key (rule_id, organization_id) references public.subdivision_participation_policy_rules(id, organization_id) on delete restrict,
  constraint subdivision_participation_rule_lot_scopes_lot_tenant_fk foreign key (lot_id, organization_id) references public.subdivision_lots(id, organization_id) on delete restrict,
  constraint subdivision_participation_rule_lot_scopes_unique unique (organization_id, rule_id, lot_id)
);
alter table public.subdivision_participation_rule_lot_scopes enable row level security;
revoke all on table public.subdivision_participation_rule_lot_scopes from public, anon, authenticated;

create or replace function public.subdivision_upsert_internal_party_profile(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_party_role_assignment_id uuid, p_document_reference text, p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_profile_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_PARTICIPATION_CONTEXT_DENIED'; end if;
  select target_id into v_existing from public.admin_audit_events where command_name = 'subdivision_upsert_internal_party_profile' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed' order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  if p_document_reference !~ '^(?:[0-9]{11}|[0-9]{14})$' or not exists (select 1 from public.party_role_assignments role_assignment where role_assignment.id = p_party_role_assignment_id and role_assignment.organization_id = p_organization_id and role_assignment.module = 'loteadora' and role_assignment.state = 'draft' and role_assignment.role::text in ('shareholder', 'partner', 'land_contributor')) then
    raise exception using errcode = '22023', message = 'SUBDIVISION_INTERNAL_PARTY_PROFILE_DENIED';
  end if;
  insert into public.subdivision_internal_party_profiles(organization_id, party_role_assignment_id, document_reference, created_by)
  values(p_organization_id, p_party_role_assignment_id, p_document_reference, p_actor_user_id)
  on conflict(organization_id, party_role_assignment_id) do update set document_reference = excluded.document_reference, created_by = excluded.created_by, updated_at = now()
  returning id into v_profile_id;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_upsert_internal_party_profile', 'allowed', 'subdivision_internal_party_profile', v_profile_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'document_reference_present', true));
  return v_profile_id;
end; $$;

create or replace function public.subdivision_lookup_internal_party_by_fiscal_reference(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_development_id uuid, p_document_reference text, p_correlation_id uuid
) returns table(internal_party_role_link_id uuid, party_role_assignment_id uuid, display_name text, role public.party_role_kind, party_kind public.party_kind) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' or p_document_reference !~ '^(?:[0-9]{11}|[0-9]{14})$' then raise exception using errcode = '22023', message = 'SUBDIVISION_INTERNAL_PARTY_LOOKUP_DENIED'; end if;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_lookup_internal_party_by_fiscal_reference', 'allowed', 'subdivision_internal_party_profile', null, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'document_reference_present', true));
  return query select link.id, assignment.id, party.display_name, assignment.role, party.kind
  from public.subdivision_internal_party_roles link
  join public.party_role_assignments assignment on assignment.id = link.party_role_assignment_id and assignment.organization_id = link.organization_id
  join public.party_records party on party.id = assignment.party_id and party.organization_id = assignment.organization_id
  join public.subdivision_internal_party_profiles profile on profile.party_role_assignment_id = assignment.id and profile.organization_id = assignment.organization_id
  where link.organization_id = p_organization_id and link.development_id = p_development_id and profile.document_reference = p_document_reference and assignment.state = 'draft' and party.state = 'draft'
  order by link.created_at desc limit 1;
end; $$;

create or replace function public.subdivision_create_participation_policy_version(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_development_id uuid, p_valid_from date, p_valid_until date, p_require_full_allocation boolean, p_correlation_id uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_existing jsonb; v_version_number integer; v_policy_id uuid; v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_PARTICIPATION_CONTEXT_DENIED'; end if;
  select payload_redacted -> 'result' into v_existing from public.admin_audit_events where command_name = 'subdivision_create_participation_policy_version' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed' order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  if p_valid_from is null or (p_valid_until is not null and p_valid_until < p_valid_from) or not exists(select 1 from public.subdivision_developments where id = p_development_id and organization_id = p_organization_id and state = 'draft') then raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_POLICY_DENIED'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text || ':' || p_development_id::text, 0));
  select coalesce(max(version_number), 0) + 1 into v_version_number from public.subdivision_participation_policy_versions where organization_id = p_organization_id and development_id = p_development_id;
  insert into public.subdivision_participation_policy_versions(organization_id, development_id, version_number, state, valid_from, valid_until, require_full_allocation, created_by)
  values(p_organization_id, p_development_id, v_version_number, 'draft', p_valid_from, p_valid_until, p_require_full_allocation, p_actor_user_id) returning id into v_policy_id;
  v_result := jsonb_build_object('policy_version_id', v_policy_id, 'version_number', v_version_number, 'state', 'draft');
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_create_participation_policy_version', 'allowed', 'subdivision_participation_policy_version', v_policy_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'require_full_allocation', p_require_full_allocation, 'result', v_result));
  return v_result;
end; $$;

create or replace function public.subdivision_add_participation_policy_rule(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_policy_version_id uuid, p_internal_party_role_link_id uuid, p_allocation_method text, p_percentage_basis_points integer,
  p_fixed_amount_cents bigint, p_cap_total_cents bigint, p_applies_to_all_lots boolean, p_schedule_kinds text[], p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_rule_id uuid; v_development_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_PARTICIPATION_CONTEXT_DENIED'; end if;
  select target_id into v_existing from public.admin_audit_events where command_name = 'subdivision_add_participation_policy_rule' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed' order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  select development_id into v_development_id from public.subdivision_participation_policy_versions where id = p_policy_version_id and organization_id = p_organization_id and state = 'draft' for update;
  if v_development_id is null or not exists(select 1 from public.subdivision_internal_party_roles where id = p_internal_party_role_link_id and organization_id = p_organization_id and development_id = v_development_id) or coalesce(array_length(p_schedule_kinds, 1), 0) = 0 or exists(select 1 from unnest(p_schedule_kinds) kind where kind not in ('entry', 'entry_installment', 'installment', 'cash_settlement', 'supplemental_cash', 'trade_in_credit')) then raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_RULE_DENIED'; end if;
  if (p_allocation_method = 'percentage_per_schedule' and (p_percentage_basis_points is null or p_percentage_basis_points not between 1 and 10000 or p_fixed_amount_cents is not null or p_cap_total_cents is not null)) or (p_allocation_method = 'fixed_per_schedule' and (p_percentage_basis_points is not null or p_fixed_amount_cents is null or p_fixed_amount_cents < 1 or p_cap_total_cents is not null)) or (p_allocation_method = 'capped_total_per_lot' and (p_percentage_basis_points is not null or p_fixed_amount_cents is not null or p_cap_total_cents is null or p_cap_total_cents < 1)) then raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_RULE_METHOD_DENIED'; end if;
  insert into public.subdivision_participation_policy_rules(organization_id, policy_version_id, internal_party_role_link_id, allocation_method, percentage_basis_points, fixed_amount_cents, cap_total_cents, applies_to_all_lots, created_by)
  values(p_organization_id, p_policy_version_id, p_internal_party_role_link_id, p_allocation_method, p_percentage_basis_points, p_fixed_amount_cents, p_cap_total_cents, coalesce(p_applies_to_all_lots, true), p_actor_user_id) returning id into v_rule_id;
  insert into public.subdivision_participation_rule_schedule_kinds(organization_id, rule_id, schedule_kind) select p_organization_id, v_rule_id, kind from (select distinct unnest(p_schedule_kinds) as kind) kinds;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_add_participation_policy_rule', 'allowed', 'subdivision_participation_policy_rule', v_rule_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'allocation_method', p_allocation_method, 'applies_to_all_lots', coalesce(p_applies_to_all_lots, true), 'schedule_kind_count', array_length(p_schedule_kinds, 1)));
  return v_rule_id;
end; $$;

create or replace function public.subdivision_add_participation_rule_lot_scope(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_rule_id uuid, p_lot_id uuid, p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_scope_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_PARTICIPATION_CONTEXT_DENIED'; end if;
  select target_id into v_existing from public.admin_audit_events where command_name = 'subdivision_add_participation_rule_lot_scope' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed' order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  if not exists(select 1 from public.subdivision_participation_policy_rules rule join public.subdivision_participation_policy_versions policy on policy.id = rule.policy_version_id and policy.organization_id = rule.organization_id join public.subdivision_lots lot on lot.id = p_lot_id and lot.organization_id = rule.organization_id join public.subdivision_blocks block on block.id = lot.block_id and block.organization_id = lot.organization_id where rule.id = p_rule_id and rule.organization_id = p_organization_id and rule.applies_to_all_lots = false and policy.state = 'draft' and block.development_id = policy.development_id) then raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_RULE_SCOPE_DENIED'; end if;
  insert into public.subdivision_participation_rule_lot_scopes(organization_id, rule_id, lot_id) values(p_organization_id, p_rule_id, p_lot_id) on conflict(organization_id, rule_id, lot_id) do update set lot_id = excluded.lot_id returning id into v_scope_id;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_add_participation_rule_lot_scope', 'allowed', 'subdivision_participation_rule_lot_scope', v_scope_id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'lot_scope_added', true));
  return v_scope_id;
end; $$;

create or replace function public.subdivision_activate_participation_policy_version(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text,
  p_policy_version_id uuid, p_correlation_id uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_existing jsonb; v_policy record; v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_PARTICIPATION_CONTEXT_DENIED'; end if;
  select payload_redacted -> 'result' into v_existing from public.admin_audit_events where command_name = 'subdivision_activate_participation_policy_version' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed' order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  select * into v_policy from public.subdivision_participation_policy_versions where id = p_policy_version_id and organization_id = p_organization_id and state = 'draft' for update;
  if v_policy.id is null or not exists(select 1 from public.subdivision_participation_policy_rules rule where rule.organization_id = p_organization_id and rule.policy_version_id = v_policy.id and (rule.applies_to_all_lots or exists(select 1 from public.subdivision_participation_rule_lot_scopes scope where scope.organization_id = p_organization_id and scope.rule_id = rule.id))) then raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_POLICY_ACTIVATION_DENIED'; end if;
  update public.subdivision_participation_policy_versions set state = 'superseded', updated_at = now() where organization_id = p_organization_id and development_id = v_policy.development_id and state = 'active';
  update public.subdivision_participation_policy_versions set state = 'active', activated_at = now(), updated_at = now() where id = v_policy.id and organization_id = p_organization_id;
  v_result := jsonb_build_object('policy_version_id', v_policy.id, 'state', 'active');
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
  values(p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_activate_participation_policy_version', 'allowed', 'subdivision_participation_policy_version', v_policy.id, jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'state', 'active', 'result', v_result));
  return v_result;
end; $$;

create or replace function public.subdivision_list_participation_policy_versions(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text
) returns table(policy_version_id uuid, development_id uuid, version_number integer, state text, valid_from date, valid_until date, require_full_allocation boolean, rule_count integer, created_at timestamptz, activated_at timestamptz) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_PARTICIPATION_CONTEXT_DENIED'; end if;
  return query select policy.id, policy.development_id, policy.version_number, policy.state, policy.valid_from, policy.valid_until, policy.require_full_allocation, count(rule.id)::integer, policy.created_at, policy.activated_at from public.subdivision_participation_policy_versions policy left join public.subdivision_participation_policy_rules rule on rule.policy_version_id = policy.id and rule.organization_id = policy.organization_id where policy.organization_id = p_organization_id and policy.state <> 'archived' group by policy.id order by policy.development_id, policy.version_number desc;
end; $$;

create or replace function public.subdivision_list_participation_policy_rules(
  p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text
) returns table(rule_id uuid, policy_version_id uuid, internal_party_role_link_id uuid, display_name text, role public.party_role_kind, allocation_method text, percentage_basis_points integer, fixed_amount_cents bigint, cap_total_cents bigint, applies_to_all_lots boolean, schedule_kinds text[], scoped_lot_count integer, created_at timestamptz) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' then raise exception using errcode = '42501', message = 'SUBDIVISION_PARTICIPATION_CONTEXT_DENIED'; end if;
  return query select rule.id, rule.policy_version_id, rule.internal_party_role_link_id, party.display_name, assignment.role, rule.allocation_method, rule.percentage_basis_points, rule.fixed_amount_cents, rule.cap_total_cents, rule.applies_to_all_lots, coalesce(array_agg(kind.schedule_kind order by kind.schedule_kind) filter (where kind.schedule_kind is not null), '{}'::text[]), count(scope.id)::integer, rule.created_at from public.subdivision_participation_policy_rules rule join public.subdivision_internal_party_roles link on link.id = rule.internal_party_role_link_id and link.organization_id = rule.organization_id join public.party_role_assignments assignment on assignment.id = link.party_role_assignment_id and assignment.organization_id = link.organization_id join public.party_records party on party.id = assignment.party_id and party.organization_id = assignment.organization_id left join public.subdivision_participation_rule_schedule_kinds kind on kind.rule_id = rule.id and kind.organization_id = rule.organization_id left join public.subdivision_participation_rule_lot_scopes scope on scope.rule_id = rule.id and scope.organization_id = rule.organization_id where rule.organization_id = p_organization_id group by rule.id, party.display_name, assignment.role order by rule.created_at desc, rule.id;
end; $$;

revoke all on function public.subdivision_upsert_internal_party_profile(uuid,uuid,public.operating_module,text,uuid,text,uuid), public.subdivision_lookup_internal_party_by_fiscal_reference(uuid,uuid,public.operating_module,text,uuid,text,uuid), public.subdivision_create_participation_policy_version(uuid,uuid,public.operating_module,text,uuid,date,date,boolean,uuid), public.subdivision_add_participation_policy_rule(uuid,uuid,public.operating_module,text,uuid,uuid,text,integer,bigint,bigint,boolean,text[],uuid), public.subdivision_add_participation_rule_lot_scope(uuid,uuid,public.operating_module,text,uuid,uuid,uuid), public.subdivision_activate_participation_policy_version(uuid,uuid,public.operating_module,text,uuid,uuid), public.subdivision_list_participation_policy_versions(uuid,uuid,public.operating_module,text), public.subdivision_list_participation_policy_rules(uuid,uuid,public.operating_module,text) from public, anon, authenticated;
grant execute on function public.subdivision_upsert_internal_party_profile(uuid,uuid,public.operating_module,text,uuid,text,uuid), public.subdivision_lookup_internal_party_by_fiscal_reference(uuid,uuid,public.operating_module,text,uuid,text,uuid), public.subdivision_create_participation_policy_version(uuid,uuid,public.operating_module,text,uuid,date,date,boolean,uuid), public.subdivision_add_participation_policy_rule(uuid,uuid,public.operating_module,text,uuid,uuid,text,integer,bigint,bigint,boolean,text[],uuid), public.subdivision_add_participation_rule_lot_scope(uuid,uuid,public.operating_module,text,uuid,uuid,uuid), public.subdivision_activate_participation_policy_version(uuid,uuid,public.operating_module,text,uuid,uuid), public.subdivision_list_participation_policy_versions(uuid,uuid,public.operating_module,text), public.subdivision_list_participation_policy_rules(uuid,uuid,public.operating_module,text) to service_role;

comment on table public.subdivision_internal_party_profiles is 'A306: identificador fiscal protegido para localizar parte interna autorizada; sem conta, chave, banco, pagamento ou repasse.';
comment on table public.subdivision_participation_policy_versions is 'A306: versão interna de política de participação por loteamento; não cria direito exigível, pagamento ou split.';
comment on table public.subdivision_participation_policy_rules is 'A306: regra interna de projeção por componente e lote; sem cobrança, transferência, baixa ou confirmação de pagamento.';
