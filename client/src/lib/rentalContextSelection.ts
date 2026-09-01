const partyKindLabels = { individual: "Pessoa física", legal_entity: "Pessoa jurídica" } as const;
const journeyLabels = { management_interest: "Interesse de administração", tenant_interest: "Interesse de locação" } as const;
const stageLabels = { intake: "Entrada", qualification: "Qualificação", agenda_pending: "Agenda pendente", scheduled: "Agendado", closed_lost: "Encerrado sem ganho" } as const;
const assetKindLabels = { apartment: "Apartamento", house: "Casa", kitnet: "Kitnet", commercial_unit: "Unidade comercial", urban_lot: "Lote urbano", building: "Edificação", other_urban_asset: "Outro ativo urbano" } as const;
const agendaStateLabels = { scheduled: "Agendado", rescheduled: "Reagendado", cancelled: "Cancelado", occurred: "Realizado", not_held: "Não realizado" } as const;

export type RentalPartyCandidate = { partyId: string; displayName: string; kind: keyof typeof partyKindLabels };
export type RentalIntakeCandidate = { intakeId: string; partyLabel: string; journeyKind: keyof typeof journeyLabels; stage: keyof typeof stageLabels };
export type RentalAssetCandidate = { assetId: string; referenceLabel: string; internalReference: string; kind: string };
export type RentalAgendaCandidate = { agendaId: string; intakeId: string; intakeLabel: string; journeyKind: keyof typeof journeyLabels; scheduledFor: string; state: keyof typeof agendaStateLabels };

export function rentalPartySelectionLabel(party: RentalPartyCandidate): string { return `Party em rascunho · ${party.displayName} · ${partyKindLabels[party.kind]}`; }
export function rentalIntakeSelectionLabel(intake: RentalIntakeCandidate): string { return `Entrada · ${intake.partyLabel} · ${journeyLabels[intake.journeyKind]} · ${stageLabels[intake.stage]}`; }
export function rentalAssetSelectionLabel(asset: RentalAssetCandidate): string { return `Ativo em rascunho · ${asset.referenceLabel} · ${assetKindLabels[asset.kind as keyof typeof assetKindLabels] ?? "Ativo urbano"} · ${asset.internalReference}`; }
export function rentalAgendaSelectionLabel(agenda: RentalAgendaCandidate): string { return `Agenda interna · ${agenda.intakeLabel} · ${agendaStateLabels[agenda.state]}`; }
