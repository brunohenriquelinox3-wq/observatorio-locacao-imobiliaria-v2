-- A388: gate temporal de participantes internos.
-- Leitura e configuração administrativa apenas; sem DML operacional,
-- pagamento, cobrança, boleto, baixa, quitação, split ou repasse.

create or replace function public.subdivision_inspect_participation_policy_validity(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_policy_version_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_policy record;
  v_rule_count integer := 0;
  v_eligible_rule_count integer := 0;
  v_ineligible_rule_count integer := 0;
  v_missing_start_count integer := 0;
  v_outside_window_count integer := 0;
  v_expired_count integer := 0;
  v_validity_state text;
begin
  perform private.require_active_subdivision_draft_authority(
    p_actor_user_id,
    p_organization_id,
    p_module,
    p_purpose_code
  );

  if p_module <> 'loteadora' then
    raise exception using errcode = '42501', message = 'SUBDIVISION_PARTICIPATION_CONTEXT_DENIED';
  end if;

  select id, development_id, state, valid_from, valid_until
    into v_policy
  from public.subdivision_participation_policy_versions
  where id = p_policy_version_id
    and organization_id = p_organization_id;

  if v_policy.id is null then
    raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_VALIDITY_DENIED';
  end if;

  with rule_status as (
    select
      rule.id,
      case
        when v_policy.valid_until is not null
          and v_policy.valid_until < v_policy.valid_from then 'outside_window'
        when link.id is null
          or link.development_id <> v_policy.development_id
          or assignment.id is null
          or assignment.module <> 'loteadora'
          or assignment.role::text not in ('shareholder', 'partner', 'land_contributor')
          or assignment.state <> 'draft' then 'outside_window'
        when assignment.starts_at is null then 'missing_start'
        when assignment.starts_at::date > v_policy.valid_from then 'outside_window'
        when assignment.ends_at is not null
          and assignment.ends_at::date < v_policy.valid_from then 'expired'
        else 'eligible'
      end as status
    from public.subdivision_participation_policy_rules rule
    left join public.subdivision_internal_party_roles link
      on link.id = rule.internal_party_role_link_id
      and link.organization_id = rule.organization_id
    left join public.party_role_assignments assignment
      on assignment.id = link.party_role_assignment_id
      and assignment.organization_id = link.organization_id
    where rule.organization_id = p_organization_id
      and rule.policy_version_id = p_policy_version_id
  )
  select
    count(*)::integer,
    count(*) filter (where status = 'eligible')::integer,
    count(*) filter (where status <> 'eligible')::integer,
    count(*) filter (where status = 'missing_start')::integer,
    count(*) filter (where status = 'outside_window')::integer,
    count(*) filter (where status = 'expired')::integer
  into
    v_rule_count,
    v_eligible_rule_count,
    v_ineligible_rule_count,
    v_missing_start_count,
    v_outside_window_count,
    v_expired_count
  from rule_status;

  v_validity_state := case
    when v_policy.state <> 'draft' or v_rule_count = 0 then 'blocked'
    when v_ineligible_rule_count = 0 then 'eligible'
    else 'review_required'
  end;

  return jsonb_build_object(
    'validity_state', v_validity_state,
    'rule_count', v_rule_count,
    'eligible_rule_count', v_eligible_rule_count,
    'ineligible_rule_count', v_ineligible_rule_count,
    'missing_start_count', v_missing_start_count,
    'outside_window_count', v_outside_window_count,
    'expired_count', v_expired_count,
    'window_check_performed', true
  );
end;
$$;

-- A345 criou a assinatura final da ativação com gate de composição. A388
-- preserva essa assinatura e acrescenta o gate temporal obrigatório.
drop function if exists public.subdivision_activate_participation_policy_version(
  uuid, uuid, public.operating_module, text, uuid, uuid, boolean
);

create or replace function public.subdivision_activate_participation_policy_version(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text,
  p_policy_version_id uuid,
  p_correlation_id uuid,
  p_require_complete_installment_composition boolean
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing jsonb;
  v_policy record;
  v_composition jsonb;
  v_validity jsonb;
  v_result jsonb;
begin
  perform private.require_active_subdivision_draft_authority(
    p_actor_user_id,
    p_organization_id,
    p_module,
    p_purpose_code
  );

  if p_module <> 'loteadora' then
    raise exception using errcode = '42501', message = 'SUBDIVISION_PARTICIPATION_CONTEXT_DENIED';
  end if;

  select payload_redacted -> 'result'
    into v_existing
  from public.admin_audit_events
  where command_name = 'subdivision_activate_participation_policy_version'
    and correlation_id = p_correlation_id
    and actor_user_id = p_actor_user_id
    and organization_id = p_organization_id
    and outcome = 'allowed'
  order by occurred_at desc
  limit 1;

  if v_existing is not null then
    return v_existing;
  end if;

  select *
    into v_policy
  from public.subdivision_participation_policy_versions
  where id = p_policy_version_id
    and organization_id = p_organization_id
    and state = 'draft'
  for update;

  if v_policy.id is null or not exists(
    select 1
    from public.subdivision_participation_policy_rules rule
    where rule.organization_id = p_organization_id
      and rule.policy_version_id = v_policy.id
      and (
        rule.applies_to_all_lots
        or exists(
          select 1
          from public.subdivision_participation_rule_lot_scopes scope
          where scope.organization_id = p_organization_id
            and scope.rule_id = rule.id
        )
      )
  ) then
    raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_POLICY_ACTIVATION_DENIED';
  end if;

  v_validity := public.subdivision_inspect_participation_policy_validity(
    p_actor_user_id,
    p_organization_id,
    p_module,
    p_purpose_code,
    p_policy_version_id
  );

  if coalesce((v_validity ->> 'validity_state'), 'blocked') <> 'eligible' then
    raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_VALIDITY_INCOMPLETE';
  end if;

  if coalesce(p_require_complete_installment_composition, false) then
    v_composition := public.subdivision_inspect_participation_policy_composition(
      p_actor_user_id,
      p_organization_id,
      p_module,
      p_purpose_code,
      p_policy_version_id
    );

    if coalesce((v_composition ->> 'complete')::boolean, false) is not true then
      raise exception using errcode = '22023', message = 'SUBDIVISION_PARTICIPATION_COMPOSITION_INCOMPLETE';
    end if;
  end if;

  update public.subdivision_participation_policy_versions
  set state = 'superseded', updated_at = now()
  where organization_id = p_organization_id
    and development_id = v_policy.development_id
    and state = 'active';

  update public.subdivision_participation_policy_versions
  set state = 'active', activated_at = now(), updated_at = now()
  where id = v_policy.id
    and organization_id = p_organization_id;

  v_result := jsonb_build_object('policy_version_id', v_policy.id, 'state', 'active');

  insert into public.admin_audit_events(
    correlation_id,
    actor_user_id,
    organization_id,
    command_name,
    outcome,
    target_type,
    target_id,
    payload_redacted
  )
  values(
    p_correlation_id,
    p_actor_user_id,
    p_organization_id,
    'subdivision_activate_participation_policy_version',
    'allowed',
    'subdivision_participation_policy_version',
    v_policy.id,
    jsonb_build_object(
      'module', p_module::text,
      'purpose_code', trim(p_purpose_code),
      'require_complete_installment_composition', coalesce(p_require_complete_installment_composition, false),
      'validity_gate', 'eligible',
      'state', 'active',
      'result', v_result
    )
  );

  return v_result;
end;
$$;

revoke all on function public.subdivision_inspect_participation_policy_validity(
  uuid, uuid, public.operating_module, text, uuid
), public.subdivision_activate_participation_policy_version(
  uuid, uuid, public.operating_module, text, uuid, uuid, boolean
) from public, anon, authenticated;

grant execute on function public.subdivision_inspect_participation_policy_validity(
  uuid, uuid, public.operating_module, text, uuid
), public.subdivision_activate_participation_policy_version(
  uuid, uuid, public.operating_module, text, uuid, uuid, boolean
) to service_role;

comment on function public.subdivision_inspect_participation_policy_validity(
  uuid, uuid, public.operating_module, text, uuid
) is 'A388: inspeção administrativa da janela temporal dos papéis; não cria direito, pagamento ou repasse.';

comment on function public.subdivision_activate_participation_policy_version(
  uuid, uuid, public.operating_module, text, uuid, uuid, boolean
) is 'A388: ativação exige participantes vigentes na data inicial da política e preserva o gate de composição; não executa operação financeira.';

notify pgrst, 'reload schema';
