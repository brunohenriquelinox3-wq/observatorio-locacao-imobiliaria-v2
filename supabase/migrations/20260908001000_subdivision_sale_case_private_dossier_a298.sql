-- A298: dossiê privado do caso de venda. Não armazena bytes, nome, URL, download, assinatura, boleto ou pagamento.
create type public.subdivision_sale_case_dossier_state as enum ('awaiting_private_upload', 'private_upload_recorded', 'review_required', 'ready_for_approval');
create table public.subdivision_sale_case_document_intents (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  sale_case_id uuid not null, document_category varchar(48) not null check (document_category ~ '^[a-z][a-z0-9_]{2,47}$'), dossier_state public.subdivision_sale_case_dossier_state not null default 'awaiting_private_upload',
  storage_key text null unique, content_type text null check (content_type in ('application/pdf','image/jpeg','image/png')), byte_size integer null check (byte_size between 1 and 2097152), created_by uuid not null references public.identity_subjects(user_id) on delete restrict, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint subdivision_sale_case_document_intents_case_tenant_fk foreign key (sale_case_id, organization_id) references public.subdivision_sale_cases(id, organization_id) on delete restrict
);
create table public.subdivision_sale_case_dossier_reviews (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict, sale_case_id uuid not null, dossier_state public.subdivision_sale_case_dossier_state not null default 'review_required', reason_code varchar(48) null check (reason_code is null or reason_code ~ '^[a-z][a-z0-9_]{2,47}$'), reviewed_by uuid not null references public.identity_subjects(user_id) on delete restrict, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint subdivision_sale_case_dossier_reviews_case_tenant_fk foreign key (sale_case_id, organization_id) references public.subdivision_sale_cases(id, organization_id) on delete restrict,
  constraint subdivision_sale_case_dossier_reviews_case_unique unique (organization_id, sale_case_id),
  constraint subdivision_sale_case_dossier_reviews_state_check check ((dossier_state = 'review_required' and reason_code is not null) or (dossier_state = 'ready_for_approval' and reason_code is null))
);
alter table public.subdivision_sale_case_document_intents enable row level security; alter table public.subdivision_sale_case_dossier_reviews enable row level security;
revoke all on table public.subdivision_sale_case_document_intents, public.subdivision_sale_case_dossier_reviews from public, anon, authenticated;

create function public.subdivision_create_sale_case_document_intent(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_sale_case_id uuid, p_document_category varchar, p_correlation_id uuid) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_intent_id uuid;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  if p_module <> 'loteadora' or p_document_category !~ '^[a-z][a-z0-9_]{2,47}$' then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_DOSSIER_DENIED'; end if;
  select target_id into v_existing from public.admin_audit_events event where event.command_name = 'subdivision_create_sale_case_document_intent' and event.correlation_id = p_correlation_id and event.actor_user_id = p_actor_user_id and event.organization_id = p_organization_id and event.outcome = 'allowed' order by event.occurred_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  if not exists (select 1 from public.subdivision_sale_cases sale_case where sale_case.id = p_sale_case_id and sale_case.organization_id = p_organization_id and sale_case.state in ('preparation','terms_review')) then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_DOSSIER_STATE_DENIED'; end if;
  insert into public.subdivision_sale_case_document_intents(organization_id,sale_case_id,document_category,created_by) values(p_organization_id,p_sale_case_id,p_document_category,p_actor_user_id) returning id into v_intent_id;
  insert into public.admin_audit_events(correlation_id,actor_user_id,organization_id,command_name,outcome,target_type,target_id,payload_redacted) values(p_correlation_id,p_actor_user_id,p_organization_id,'subdivision_create_sale_case_document_intent','allowed','subdivision_sale_case_document_intent',v_intent_id,jsonb_build_object('module',p_module::text,'purpose_code',trim(p_purpose_code),'document_category',p_document_category,'private_intent',true));
  return v_intent_id;
end; $$;

create function public.subdivision_set_sale_case_dossier_review(p_actor_user_id uuid, p_organization_id uuid, p_module public.operating_module, p_purpose_code text, p_sale_case_id uuid, p_dossier_ready boolean, p_reason_code varchar, p_correlation_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_dossier_state public.subdivision_sale_case_dossier_state; v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id,p_organization_id,p_module,p_purpose_code);
  if p_module <> 'loteadora' or (p_dossier_ready and p_reason_code is not null) or (not p_dossier_ready and (p_reason_code is null or p_reason_code !~ '^[a-z][a-z0-9_]{2,47}$')) then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_DOSSIER_REVIEW_DENIED'; end if;
  if not exists(select 1 from public.subdivision_sale_cases sale_case where sale_case.id=p_sale_case_id and sale_case.organization_id=p_organization_id and sale_case.state='terms_review') then raise exception using errcode = '42501', message = 'SUBDIVISION_SALE_CASE_DOSSIER_STATE_DENIED'; end if;
  if p_dossier_ready and not exists(select 1 from public.subdivision_sale_case_document_intents intent where intent.sale_case_id=p_sale_case_id and intent.organization_id=p_organization_id and intent.dossier_state='private_upload_recorded') then raise exception using errcode='42501',message='SUBDIVISION_SALE_CASE_DOSSIER_EVIDENCE_REQUIRED'; end if;
  v_dossier_state := case when p_dossier_ready then 'ready_for_approval'::public.subdivision_sale_case_dossier_state else 'review_required'::public.subdivision_sale_case_dossier_state end;
  insert into public.subdivision_sale_case_dossier_reviews(organization_id,sale_case_id,dossier_state,reason_code,reviewed_by) values(p_organization_id,p_sale_case_id,v_dossier_state,case when p_dossier_ready then null else p_reason_code end,p_actor_user_id) on conflict(organization_id,sale_case_id) do update set dossier_state=excluded.dossier_state,reason_code=excluded.reason_code,reviewed_by=excluded.reviewed_by,updated_at=now();
  v_result := jsonb_build_object('sale_case_id',p_sale_case_id,'dossier_state',v_dossier_state::text,'human_review_confirmed',p_dossier_ready);
  insert into public.admin_audit_events(correlation_id,actor_user_id,organization_id,command_name,outcome,target_type,target_id,payload_redacted) values(p_correlation_id,p_actor_user_id,p_organization_id,'subdivision_set_sale_case_dossier_review','allowed','subdivision_sale_case',p_sale_case_id,jsonb_build_object('module',p_module::text,'purpose_code',trim(p_purpose_code),'dossier_state',v_dossier_state::text,'reason_present',p_reason_code is not null,'result',v_result)); return v_result;
end; $$;

create function public.subdivision_list_sale_case_dossiers(p_actor_user_id uuid,p_organization_id uuid,p_module public.operating_module,p_purpose_code text) returns table(sale_case_id uuid,attachment_intent_count integer,private_upload_count integer,dossier_state public.subdivision_sale_case_dossier_state,review_reason_present boolean) language plpgsql security definer set search_path='' as $$
begin
  perform private.require_active_subdivision_draft_authority(p_actor_user_id,p_organization_id,p_module,p_purpose_code);
  return query select sale_case.id,count(intent.id)::integer,count(intent.id) filter(where intent.dossier_state='private_upload_recorded')::integer,coalesce(review.dossier_state,'awaiting_private_upload'::public.subdivision_sale_case_dossier_state),coalesce(review.reason_code is not null,false) from public.subdivision_sale_cases sale_case left join public.subdivision_sale_case_document_intents intent on intent.sale_case_id=sale_case.id and intent.organization_id=sale_case.organization_id left join public.subdivision_sale_case_dossier_reviews review on review.sale_case_id=sale_case.id and review.organization_id=sale_case.organization_id where sale_case.organization_id=p_organization_id and sale_case.state <> 'archived' group by sale_case.id,review.dossier_state,review.reason_code;
end; $$;
revoke all on function public.subdivision_create_sale_case_document_intent(uuid,uuid,public.operating_module,text,uuid,varchar,uuid), public.subdivision_set_sale_case_dossier_review(uuid,uuid,public.operating_module,text,uuid,boolean,varchar,uuid), public.subdivision_list_sale_case_dossiers(uuid,uuid,public.operating_module,text) from public, anon, authenticated;
grant execute on function public.subdivision_create_sale_case_document_intent(uuid,uuid,public.operating_module,text,uuid,varchar,uuid), public.subdivision_set_sale_case_dossier_review(uuid,uuid,public.operating_module,text,uuid,boolean,varchar,uuid), public.subdivision_list_sale_case_dossiers(uuid,uuid,public.operating_module,text) to service_role;
