const partyKindLabels = { individual: "Pessoa física", legal_entity: "Pessoa jurídica" } as const;
const urbanStageLabels = { intake: "Entrada", qualification: "Qualificação", agenda_pending: "Agenda pendente", scheduled: "Agendado", closed_lost: "Encerrado sem ganho" } as const;
const assetKindLabels = { apartment: "Apartamento", house: "Casa", kitnet: "Kitnet", commercial_unit: "Unidade comercial", urban_lot: "Lote urbano", building: "Edificação", other_urban_asset: "Outro ativo urbano" } as const;
const agendaStateLabels = { scheduled: "Agendada", rescheduled: "Remarcada", cancelled: "Cancelada", occurred: "Realizada", not_held: "Não realizada" } as const;

export type UrbanPartyCandidate = { partyId: string; displayName: string; kind: keyof typeof partyKindLabels };
export type UrbanLeadCandidate = { leadId: string; partyLabel: string; sourceCode: string; interestKind: "urban_asset" | "search_profile" | "unspecified"; stage: keyof typeof urbanStageLabels };
export type UrbanAssetCandidate = { assetId: string; referenceLabel: string; internalReference: string; kind: string };
export type UrbanAgendaCandidate = { agendaId: string; leadId: string; leadLabel: string; scheduledFor: string; state: keyof typeof agendaStateLabels };

export function urbanPartySelectionLabel(party: UrbanPartyCandidate): string {
  return `Party em rascunho · ${party.displayName} · ${partyKindLabels[party.kind]}`;
}

export function urbanLeadSelectionLabel(lead: UrbanLeadCandidate): string {
  return `Lead · ${lead.partyLabel} · ${urbanStageLabels[lead.stage]}`;
}

export function urbanAssetSelectionLabel(asset: UrbanAssetCandidate): string {
  const kindLabel = assetKindLabels[asset.kind as keyof typeof assetKindLabels] ?? "Ativo urbano";
  return `Ativo em rascunho · ${asset.referenceLabel} · ${kindLabel} · ${asset.internalReference}`;
}

export function urbanAgendaSelectionLabel(agenda: UrbanAgendaCandidate): string {
  return `Agenda interna · ${agenda.leadLabel} · ${agendaStateLabels[agenda.state]}`;
}
