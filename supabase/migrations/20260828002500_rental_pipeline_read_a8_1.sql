-- A8.1 — Leitura contextual minimizada do funil de Locação.

create or replace function public.rental_list_draft_intakes(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table (
  intake_id uuid,
  party_label text,
  journey_kind public.rental_journey_kind,
  source_code text,
  stage public.rental_intake_stage,
  next_agenda_for timestamptz,
  next_agenda_state public.rental_agenda_state
)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_rental_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query
  select intake.id, party.display_name, intake.journey_kind, intake.source_code, intake.stage,
    agenda.scheduled_for, agenda.state
  from public.rental_intakes intake
  join public.party_records party on party.id = intake.party_id and party.organization_id = intake.organization_id
  left join lateral (
    select next_agenda.scheduled_for, next_agenda.state
    from public.rental_intake_agendas next_agenda
    where next_agenda.intake_id = intake.id
      and next_agenda.organization_id = intake.organization_id
      and next_agenda.state in ('scheduled', 'rescheduled')
    order by next_agenda.scheduled_for asc, next_agenda.created_at asc
    limit 1
  ) agenda on true
  where intake.organization_id = p_organization_id and intake.state = 'draft'
  order by intake.updated_at desc, intake.id asc;
end; $$;

revoke all on function public.rental_list_draft_intakes(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.rental_list_draft_intakes(uuid, uuid, public.operating_module, text) to service_role;
comment on function public.rental_list_draft_intakes(uuid, uuid, public.operating_module, text) is 'A8.1: leitura minimizada de entrada de Locação em rascunho, contextualizada e exclusiva ao servidor.';
