-- A7.1 — Leitura contextual minimizada do funil urbano.

create or replace function public.urban_list_draft_leads(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table (
  lead_id uuid,
  party_label text,
  source_code text,
  interest_kind text,
  stage public.urban_lead_stage,
  next_agenda_for timestamptz,
  next_agenda_state public.urban_agenda_state
)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_urban_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query
  select lead.id, party.display_name, lead.source_code, lead.interest_kind, lead.stage,
    agenda.scheduled_for, agenda.state
  from public.urban_leads lead
  join public.party_records party on party.id = lead.party_id and party.organization_id = lead.organization_id
  left join lateral (
    select next_agenda.scheduled_for, next_agenda.state
    from public.urban_lead_agendas next_agenda
    where next_agenda.lead_id = lead.id
      and next_agenda.organization_id = lead.organization_id
      and next_agenda.state in ('scheduled', 'rescheduled')
    order by next_agenda.scheduled_for asc, next_agenda.created_at asc
    limit 1
  ) agenda on true
  where lead.organization_id = p_organization_id and lead.state = 'draft'
  order by lead.updated_at desc, lead.id asc;
end; $$;

revoke all on function public.urban_list_draft_leads(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.urban_list_draft_leads(uuid, uuid, public.operating_module, text) to service_role;
comment on function public.urban_list_draft_leads(uuid, uuid, public.operating_module, text) is 'A7.1: leitura minimizada de lead urbano em rascunho, contextualizada e exclusiva ao servidor.';
