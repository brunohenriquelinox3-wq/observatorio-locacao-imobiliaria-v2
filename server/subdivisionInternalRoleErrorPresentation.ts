import {
  classifySubdivisionInternalRoleCommandError,
  type SubdivisionInternalRoleCommandErrorCode,
} from "@shared/subdivisionInternalPartyRoleErrors";

export type SubdivisionInternalRoleErrorPresentation = {
  title: string;
  description: string;
  code: SubdivisionInternalRoleCommandErrorCode | null;
};

export function presentSubdivisionInternalRoleCommandError(
  message: unknown
): SubdivisionInternalRoleErrorPresentation {
  const code = classifySubdivisionInternalRoleCommandError(message);

  if (code === "SUBDIVISION_INTERNAL_ROLE_CONTEXT_DENIED") {
    return {
      title: "Papel não vinculado",
      description:
        "O loteamento ou o papel selecionado não está elegível para este vínculo. Selecione um loteamento em preparação e um sócio, parceiro ou cedente de terra elegível.",
      code,
    };
  }

  if (
    code === "DOMAIN_CONTEXT_DENIED" ||
    code === "SUBDIVISION_ACTIVE_ORGANIZATION_REQUIRED" ||
    code === "SUBDIVISION_MODULE_DENIED"
  ) {
    return {
      title: "Contexto não liberado",
      description:
        "A organização ou a finalidade desta sessão não está liberada para preparar vínculos. Confira a organização selecionada e retome com um contexto autorizado.",
      code,
    };
  }

  return {
    title: "Papel não vinculado",
    description:
      "Não foi possível confirmar o vínculo. Confira os campos selecionados e tente novamente quando o contexto estiver disponível.",
    code: null,
  };
}
