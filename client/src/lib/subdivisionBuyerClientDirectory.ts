export const buyerClientDirectoryPartyKinds = {
  individual: "Pessoa física",
  legal_entity: "Pessoa jurídica",
} as const;

export const buyerClientDirectoryRegistrationStates = {
  contact_pending: "Contato a organizar",
  base_data_in_progress: "Cadastro em organização",
  conditional_requirements_pending: "Pendências condicionais",
  base_data_review: "Cadastro em revisão",
} as const;

export const buyerClientDirectoryAttachmentSummaries = {
  no_private_attachment: "Sem intenção de anexo",
  awaiting_private_upload: "Envio privado pendente",
  private_upload_recorded: "Arquivo privado registrado",
} as const;

export const buyerClientDirectoryTimelineEvents = {
  buyer_client_registered: "Cadastro-base registrado",
  profile_cadastral_atualizado: "Perfil cadastral atualizado",
  pendencia_atualizada: "Pendência atualizada",
  preferencia_atualizada: "Preferência de contato atualizada",
  anexo_privado_registrado: "Intenção de anexo registrada",
} as const;

type DirectoryMetricEntry = {
  profilePresent: boolean;
  requirementsPending: number;
  attachmentSummary: keyof typeof buyerClientDirectoryAttachmentSummaries;
};

export function summarizeBuyerClientDirectory(entries: DirectoryMetricEntry[]) {
  return {
    total: entries.length,
    profilesPresent: entries.filter((entry) => entry.profilePresent).length,
    requirementsPending: entries.reduce((total, entry) => total + entry.requirementsPending, 0),
    attachmentsRecorded: entries.filter((entry) => entry.attachmentSummary === "private_upload_recorded").length,
  };
}
