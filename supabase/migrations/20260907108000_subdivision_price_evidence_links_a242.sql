-- A242: vínculos opacos de evidência privada. Não armazena bytes, URL, nome de arquivo, conteúdo, preço, contrato ou dado pessoal.

create type public.subdivision_price_evidence_subject_kind as enum ('price_base_policy', 'price_condition');
create type public.subdivision_price_evidence_link_state as enum ('active', 'archived');

create table public.subdivision_price_evidence_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  development_id uuid not null,
  attachment_id uuid not null references public.subdivision_development_attachments(id) on delete restrict,
  subject_kind public.subdivision_price_evidence_subject_kind not null,
  price_base_policy_id uuid references public.subdivision_price_base_policies(id) on delete restrict,
  price_condition_id uuid references public.subdivision_price_conditions(id) on delete restrict,
  link_state public.subdivision_price_evidence_link_state not null default 'active',
  created_by uuid not null references public.identity_subjects(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  archived_by uuid references public.identity_subjects(user_id) on delete restrict,
  archived_at timestamptz,
  constraint subdivision_price_evidence_development_fk foreign key (development_id, organization_id)
    references public.subdivision_developments(id, organization_id) on delete restrict,
  constraint subdivision_price_evidence_subject_valid check (
    (subject_kind = 'price_base_policy' and price_base_policy_id is not null and price_condition_id is null)
    or (subject_kind = 'price_condition' and price_base_policy_id is null and price_condition_id is not null)
  ),
  constraint subdivision_price_evidence_archive_valid check (
    (link_state = 'active' and archived_by is null and archived_at is null)
    or (link_state = 'archived' and archived_by is not null and archived_at is not null)
  )
);

create unique index subdivision_price_evidence_active_unique
  on public.subdivision_price_evidence_links (organization_id, attachment_id, subject_kind, coalesce(price_base_policy_id, price_condition_id))
  where link_state = 'active';
create index subdivision_price_evidence_subject_lookup
  on public.subdivision_price_evidence_links (organization_id, development_id, subject_kind, price_base_policy_id, price_condition_id)
  where link_state = 'active';

alter table public.subdivision_price_evidence_links enable row level security;
revoke all on table public.subdivision_price_evidence_links from public, anon, authenticated;
create policy subdivision_price_evidence_deny_anon on public.subdivision_price_evidence_links for all to anon using (false) with check (false);
create policy subdivision_price_evidence_deny_authenticated on public.subdivision_price_evidence_links for all to authenticated using (false) with check (false);

create or replace function public.subdivision_link_price_evidence_v1(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid,
  p_attachment_id uuid,
  p_subject_kind public.subdivision_price_evidence_subject_kind,
  p_subject_id uuid,
  p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_link_id uuid; v_policy_id uuid; v_condition_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select target_id into v_existing from public.admin_audit_events
    where command_name = 'subdivision_link_price_evidence_v1' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed'
    order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  if not exists (select 1 from public.subdivision_developments d where d.id = p_development_id and d.organization_id = p_organization_id and d.state = 'draft'::public.party_lifecycle_state) then
    raise exception using errcode = '42501', message = 'PRICE_EVIDENCE_DEVELOPMENT_DENIED';
  end if;
  if not exists (select 1 from public.subdivision_development_attachments a where a.id = p_attachment_id and a.organization_id = p_organization_id and a.development_id = p_development_id and a.attachment_state = 'recorded'::public.subdivision_development_attachment_state) then
    raise exception using errcode = '42501', message = 'PRICE_EVIDENCE_ATTACHMENT_DENIED';
  end if;
  if p_subject_kind = 'price_base_policy' then
    select p.id into v_policy_id from public.subdivision_price_base_policies p where p.id = p_subject_id and p.organization_id = p_organization_id and p.development_id = p_development_id;
    if v_policy_id is null then raise exception using errcode = '42501', message = 'PRICE_EVIDENCE_SUBJECT_DENIED'; end if;
  else
    select c.id into v_condition_id from public.subdivision_price_conditions c where c.id = p_subject_id and c.organization_id = p_organization_id and c.development_id = p_development_id;
    if v_condition_id is null then raise exception using errcode = '42501', message = 'PRICE_EVIDENCE_SUBJECT_DENIED'; end if;
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_organization_id::text || ':' || p_attachment_id::text || ':' || p_subject_kind::text || ':' || p_subject_id::text, 0));
  select id into v_link_id from public.subdivision_price_evidence_links l
    where l.organization_id = p_organization_id and l.attachment_id = p_attachment_id and l.subject_kind = p_subject_kind and l.link_state = 'active'
      and ((p_subject_kind = 'price_base_policy' and l.price_base_policy_id = v_policy_id) or (p_subject_kind = 'price_condition' and l.price_condition_id = v_condition_id));
  if v_link_id is null then
    insert into public.subdivision_price_evidence_links (organization_id, development_id, attachment_id, subject_kind, price_base_policy_id, price_condition_id, created_by)
      values (p_organization_id, p_development_id, p_attachment_id, p_subject_kind, v_policy_id, v_condition_id, p_actor_user_id)
      returning id into v_link_id;
  end if;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
    values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_link_price_evidence_v1', 'allowed', 'subdivision_price_evidence_link', v_link_id,
      jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'subject_kind', p_subject_kind::text, 'attachment_recorded', true));
  return v_link_id;
end; $$;

create or replace function public.subdivision_archive_price_evidence_link_v1(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid,
  p_evidence_link_id uuid,
  p_correlation_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_link_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  select target_id into v_existing from public.admin_audit_events
    where command_name = 'subdivision_archive_price_evidence_link_v1' and correlation_id = p_correlation_id and actor_user_id = p_actor_user_id and organization_id = p_organization_id and outcome = 'allowed'
    order by occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  if not exists (select 1 from public.subdivision_developments d where d.id = p_development_id and d.organization_id = p_organization_id and d.state = 'draft'::public.party_lifecycle_state) then
    raise exception using errcode = '42501', message = 'PRICE_EVIDENCE_DEVELOPMENT_DENIED';
  end if;
  update public.subdivision_price_evidence_links l set link_state = 'archived', archived_by = p_actor_user_id, archived_at = now()
    where l.id = p_evidence_link_id and l.organization_id = p_organization_id and l.development_id = p_development_id and l.link_state = 'active'
    returning l.id into v_link_id;
  if v_link_id is null then raise exception using errcode = '42501', message = 'PRICE_EVIDENCE_LINK_DENIED'; end if;
  insert into public.admin_audit_events(correlation_id, actor_user_id, organization_id, command_name, outcome, target_type, target_id, payload_redacted)
    values (p_correlation_id, p_actor_user_id, p_organization_id, 'subdivision_archive_price_evidence_link_v1', 'allowed', 'subdivision_price_evidence_link', v_link_id,
      jsonb_build_object('module', p_module::text, 'purpose_code', trim(p_purpose_code), 'archive_mode', 'logical'));
  return v_link_id;
end; $$;

create or replace function public.subdivision_list_price_evidence_summary_v1(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_development_id uuid
) returns table(subject_kind text, subject_id uuid, evidence_count integer) language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if not exists (select 1 from public.subdivision_developments d where d.id = p_development_id and d.organization_id = p_organization_id and d.state = 'draft'::public.party_lifecycle_state) then
    raise exception using errcode = '42501', message = 'PRICE_EVIDENCE_DEVELOPMENT_DENIED';
  end if;
  return query
    select l.subject_kind::text, coalesce(l.price_base_policy_id, l.price_condition_id), count(*)::integer
    from public.subdivision_price_evidence_links l
    join public.subdivision_development_attachments a on a.id = l.attachment_id and a.organization_id = l.organization_id and a.development_id = l.development_id
    where l.organization_id = p_organization_id and l.development_id = p_development_id and l.link_state = 'active' and a.attachment_state = 'recorded'::public.subdivision_development_attachment_state
    group by l.subject_kind, coalesce(l.price_base_policy_id, l.price_condition_id);
end; $$;

revoke all on function public.subdivision_link_price_evidence_v1(uuid, uuid, public.operating_module, text, uuid, uuid, public.subdivision_price_evidence_subject_kind, uuid, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_archive_price_evidence_link_v1(uuid, uuid, public.operating_module, text, uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.subdivision_list_price_evidence_summary_v1(uuid, uuid, public.operating_module, text, uuid) from public, anon, authenticated;
grant execute on function public.subdivision_link_price_evidence_v1(uuid, uuid, public.operating_module, text, uuid, uuid, public.subdivision_price_evidence_subject_kind, uuid, uuid) to service_role;
grant execute on function public.subdivision_archive_price_evidence_link_v1(uuid, uuid, public.operating_module, text, uuid, uuid, uuid) to service_role;
grant execute on function public.subdivision_list_price_evidence_summary_v1(uuid, uuid, public.operating_module, text, uuid) to service_role;

comment on table public.subdivision_price_evidence_links is 'A242: vínculo opaco entre anexo privado existente e política ou condição de preço; sem bytes, URL, nome, conteúdo, preço, contrato ou PII.';
