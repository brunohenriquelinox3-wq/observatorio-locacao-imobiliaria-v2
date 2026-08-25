-- A0 — Fundação administrativa governada.
-- Ambiente alvo: Supabase de desenvolvimento isolado.
-- Não insere dados, não executa bootstrap e não concede privilégios de UI.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.organization_state as enum ('draft', 'provisioning', 'active', 'suspended');
create type public.membership_state as enum ('invited', 'active', 'suspended', 'revoked', 'expired');
create type public.grant_state as enum ('pending', 'active', 'expired', 'revoked');
create type public.platform_principal_state as enum ('pending_activation', 'active', 'suspended', 'revoked');
create type public.invitation_state as enum ('issued', 'accepted', 'expired', 'revoked');
create type public.invitation_target_type as enum ('platform', 'organization');
create type public.admin_role as enum (
  'platform_super_admin',
  'platform_security_admin',
  'platform_support_operator',
  'organization_admin',
  'area_admin',
  'operator'
);
create type public.admin_event_outcome as enum ('allowed', 'denied', 'failed', 'expired');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 160),
  domain text,
  state public.organization_state not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  suspended_at timestamptz,
  constraint organizations_domain_format check (domain is null or domain ~ '^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

create unique index organizations_domain_unique_when_present
  on public.organizations (lower(domain))
  where domain is not null;

create table public.identity_subjects (
  user_id uuid primary key references auth.users(id) on delete cascade,
  lifecycle_state text not null default 'active' check (lifecycle_state in ('pending', 'active', 'suspended', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references public.identity_subjects(user_id) on delete restrict,
  role public.admin_role not null,
  state public.membership_state not null default 'active',
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid references public.identity_subjects(user_id) on delete set null,
  revoked_at timestamptz,
  revoke_reason_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_memberships_active_role check (
    role not in ('platform_super_admin', 'platform_security_admin', 'platform_support_operator')
  ),
  constraint organization_memberships_time_window check (expires_at is null or expires_at > starts_at),
  constraint organization_memberships_revocation check (
    (state in ('revoked', 'expired') and revoked_at is not null)
    or (state not in ('revoked', 'expired'))
  ),
  unique (organization_id, user_id)
);

create index organization_memberships_by_organization_state
  on public.organization_memberships (organization_id, state, expires_at);
create index organization_memberships_by_subject_state
  on public.organization_memberships (user_id, state, expires_at);

create table public.administrative_grants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references public.identity_subjects(user_id) on delete restrict,
  membership_id uuid references public.organization_memberships(id) on delete set null,
  role public.admin_role not null,
  scope_selector jsonb not null default '{}'::jsonb,
  purpose_code text not null check (char_length(trim(purpose_code)) between 3 and 96),
  state public.grant_state not null default 'pending',
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  granted_by uuid references public.identity_subjects(user_id) on delete set null,
  approved_by uuid references public.identity_subjects(user_id) on delete set null,
  revoked_at timestamptz,
  revoke_reason_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint administrative_grants_not_platform_role check (
    role not in ('platform_super_admin', 'platform_security_admin', 'platform_support_operator')
  ),
  constraint administrative_grants_time_window check (expires_at is null or expires_at > starts_at),
  constraint administrative_grants_redaction_safe_scope check (jsonb_typeof(scope_selector) = 'object')
);

create index administrative_grants_subject_lookup
  on public.administrative_grants (user_id, organization_id, state, expires_at);
create index administrative_grants_expiry_lookup
  on public.administrative_grants (state, expires_at)
  where expires_at is not null;

create table public.platform_principals (
  user_id uuid primary key references public.identity_subjects(user_id) on delete restrict,
  role public.admin_role not null check (role in ('platform_super_admin', 'platform_security_admin', 'platform_support_operator')),
  state public.platform_principal_state not null default 'pending_activation',
  mfa_verified_at timestamptz,
  recovery_registered_at timestamptz,
  last_recertified_at timestamptz,
  suspended_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_principals_active_requires_mfa check (
    state <> 'active' or mfa_verified_at is not null
  )
);

create index platform_principals_state_lookup
  on public.platform_principals (state, role, last_recertified_at);

create table public.access_invitations (
  id uuid primary key default gen_random_uuid(),
  target_type public.invitation_target_type not null,
  organization_id uuid references public.organizations(id) on delete restrict,
  intended_role public.admin_role not null,
  recipient_email_digest text not null check (char_length(recipient_email_digest) between 32 and 256),
  token_digest text not null unique check (char_length(token_digest) between 32 and 256),
  state public.invitation_state not null default 'issued',
  expires_at timestamptz not null,
  used_at timestamptz,
  issued_by uuid references public.identity_subjects(user_id) on delete set null,
  correlation_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint access_invitations_target_scope check (
    (target_type = 'platform' and organization_id is null)
    or (target_type = 'organization' and organization_id is not null)
  ),
  constraint access_invitations_expiry_future check (expires_at > created_at)
);

create index access_invitations_lookup
  on public.access_invitations (target_type, organization_id, state, expires_at);
create index access_invitations_correlation_lookup
  on public.access_invitations (correlation_id);

create table public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  correlation_id uuid not null default gen_random_uuid(),
  actor_user_id uuid references public.identity_subjects(user_id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  command_name text not null check (char_length(trim(command_name)) between 3 and 120),
  outcome public.admin_event_outcome not null,
  target_type text not null check (char_length(trim(target_type)) between 3 and 80),
  target_id uuid,
  reason_code text,
  payload_redacted jsonb not null default '{}'::jsonb,
  release_ref text,
  constraint admin_audit_events_payload_object check (jsonb_typeof(payload_redacted) = 'object')
);

create index admin_audit_events_correlation_lookup
  on public.admin_audit_events (correlation_id, occurred_at desc);
create index admin_audit_events_organization_lookup
  on public.admin_audit_events (organization_id, occurred_at desc);
create index admin_audit_events_actor_lookup
  on public.admin_audit_events (actor_user_id, occurred_at desc);

alter table public.organizations enable row level security;
alter table public.identity_subjects enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.administrative_grants enable row level security;
alter table public.platform_principals enable row level security;
alter table public.access_invitations enable row level security;
alter table public.admin_audit_events enable row level security;

revoke all on table public.organizations from anon, authenticated;
revoke all on table public.identity_subjects from anon, authenticated;
revoke all on table public.organization_memberships from anon, authenticated;
revoke all on table public.administrative_grants from anon, authenticated;
revoke all on table public.platform_principals from anon, authenticated;
revoke all on table public.access_invitations from anon, authenticated;
revoke all on table public.admin_audit_events from anon, authenticated;

comment on table public.organizations is 'A0: locatárias do CRM; nenhuma política de cliente é concedida nesta migration.';
comment on table public.identity_subjects is 'A0: identidade canônica vinculada a auth.users; e-mail não é chave de autorização.';
comment on table public.organization_memberships is 'A0: vínculo de pessoa e organização; autoridade efetiva será criada por RPC posterior.';
comment on table public.administrative_grants is 'A0: alçada temporal e escopo; nenhuma gravação direta por browser.';
comment on table public.platform_principals is 'A0: principal de plataforma governado; ativação posterior exige MFA e recuperação.';
comment on table public.access_invitations is 'A0: convites com token e e-mail somente em hash/digest.';
comment on table public.admin_audit_events is 'A0: trilha append-only redigida; inserção será exclusiva de funções controladas.';
