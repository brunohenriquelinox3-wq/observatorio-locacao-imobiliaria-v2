-- A65: leitura minimizada de agendas internas urbanas para seleção contextual.
-- Não retorna motivo, nota, contato, endereço, preço, reserva, proposta, contrato, financeiro ou integração externa.

create or replace function public.urban_list_draft_agendas(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table (
  agenda_id uuid,
  lead_id uuid,
  lead_label text,
  scheduled_for timestamptz,
  state public.urban_agenda_state
)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_urban_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query
  select agenda.id, lead.id, party.display_name, agenda.scheduled_for, agenda.state
  from public.urban_lead_agendas agenda
  join public.urban_leads lead on lead.id = agenda.lead_id and lead.organization_id = agenda.organization_id
  join public.party_records party on party.id = lead.party_id and party.organization_id = lead.organization_id
  where agenda.organization_id = p_organization_id and lead.state = 'draft'
  order by agenda.scheduled_for asc, agenda.created_at asc;
end; $$;

revoke all on function public.urban_list_draft_agendas(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.urban_list_draft_agendas(uuid, uuid, public.operating_module, text) to service_role;
comment on function public.urban_list_draft_agendas(uuid, uuid, public.operating_module, text) is 'A65: leitura minimizada de agenda urbana em rascunho para seleção contextual, exclusiva ao servidor.';
