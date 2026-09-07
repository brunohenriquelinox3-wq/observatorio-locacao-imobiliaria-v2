export const buyerClientRegistrationStates = {
  contact_pending: "Contato pendente",
  base_data_in_progress: "Cadastro em preenchimento",
  conditional_requirements_pending: "Pendências condicionais",
  base_data_review: "Cadastro em revisão",
} as const;

export const buyerClientCivilStatuses = {
  not_declared: "A confirmar",
  single: "Solteiro(a)",
  married: "Casado(a)",
  stable_union: "União estável",
  divorced: "Divorciado(a)",
  widowed: "Viúvo(a)",
  informed_other: "Outra situação informada",
} as const;

export const buyerClientRepresentationStates = {
  not_declared: "A confirmar",
  self_represented: "Atuação própria",
  represented: "Representação declarada",
  legal_entity_represented: "Representação de pessoa jurídica",
} as const;

export const buyerClientRequirementCodes = {
  identity_evidence: "Identificação para revisão",
  fiscal_identifier: "Referência fiscal declarada",
  address_evidence: "Comprovação de endereço",
  civil_status_evidence: "Qualificação civil",
  spousal_qualification: "Qualificação de cônjuge ou companheiro",
  representation_powers: "Poderes de representação",
  legal_entity_registration: "Cadastro da pessoa jurídica",
  legal_entity_governance: "Atos de representação da pessoa jurídica",
} as const;

export const buyerClientRequirementStates = {
  not_applicable: "Não aplicável",
  to_confirm: "A confirmar",
  pending_evidence: "Pendente de evidência",
  under_review: "Em revisão",
  declared_complete: "Declarado completo",
} as const;

export const buyerClientContactPurposes = {
  service_contact: "Contato de atendimento",
  marketing_contact: "Contato de comunicação",
} as const;

export const buyerClientContactChannels = {
  email: "E-mail",
  phone_call: "Ligação",
  messaging: "Mensageria",
} as const;

export const buyerClientContactPreferenceStates = {
  granted: "Permitido",
  revoked: "Revogado",
} as const;

export type BuyerClientProfileInputSnapshot = {
  partyKind: "individual" | "legal_entity";
  civilStatus: keyof typeof buyerClientCivilStatuses;
  representationState: keyof typeof buyerClientRepresentationStates;
  documentReferencePresent: boolean;
  primaryEmailPresent: boolean;
  primaryPhonePresent: boolean;
  messagingPhonePresent: boolean;
};

export function recommendedBuyerClientRequirements(profile: BuyerClientProfileInputSnapshot): Array<keyof typeof buyerClientRequirementCodes> {
  const recommendations: Array<keyof typeof buyerClientRequirementCodes> = [];
  if (!profile.documentReferencePresent) recommendations.push("fiscal_identifier");
  recommendations.push("identity_evidence", "address_evidence");
  if (["married", "stable_union", "divorced", "widowed", "informed_other"].includes(profile.civilStatus)) {
    recommendations.push("civil_status_evidence");
  }
  if (["married", "stable_union"].includes(profile.civilStatus)) recommendations.push("spousal_qualification");
  if (profile.representationState === "represented" || profile.representationState === "legal_entity_represented") {
    recommendations.push("representation_powers");
  }
  if (profile.partyKind === "legal_entity") recommendations.push("legal_entity_registration", "legal_entity_governance");
  return Array.from(new Set(recommendations));
}

export function buyerClientProfileCompletion(profile: BuyerClientProfileInputSnapshot): { filled: number; total: number; percentage: number } {
  const fields = [profile.documentReferencePresent, profile.primaryEmailPresent, profile.primaryPhonePresent, profile.messagingPhonePresent];
  const filled = fields.filter(Boolean).length;
  return { filled, total: fields.length, percentage: Math.round((filled / fields.length) * 100) };
}
