-- A66: leitura minimizada de agendas internas de Locação para seleção contextual.
-- Não retorna motivo, contato, endereço, preço, garantia, contrato, cobrança, pagamento, repasse ou integração externa.

create or replace function public.rental_list_draft_agendas(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_module public.operating_module,
  p_purpose_code text
)
returns table (
  agenda_id uuid,
  intake_id uuid,
  intake_label text,
  journey_kind public.rental_journey_kind,
  scheduled_for timestamptz,
  state public.rental_agenda_state
)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_rental_pipeline_authority(p_actor_user_id, p_organization_id, p_module, p_purpose_code);
  return query
  select agenda.id, intake.id, party.display_name, intake.journey_kind, agenda.scheduled_for, agenda.state
  from public.rental_intake_agendas agenda
  join public.rental_intakes intake on intake.id = agenda.intake_id and intake.organization_id = agenda.organization_id
  join public.party_records party on party.id = intake.party_id and party.organization_id = intake.organization_id
  where agenda.organization_id = p_organization_id and intake.state = 'draft'
  order by agenda.scheduled_for asc, agenda.created_at asc;
end; $$;

revoke all on function public.rental_list_draft_agendas(uuid, uuid, public.operating_module, text) from public, anon, authenticated;
grant execute on function public.rental_list_draft_agendas(uuid, uuid, public.operating_module, text) to service_role;
comment on function public.rental_list_draft_agendas(uuid, uuid, public.operating_module, text) is 'A66: leitura minimizada de agenda de Locação em rascunho para seleção contextual, exclusiva ao servidor.';
