const subdivisionPurposeLabels: Record<string, string> = {
  CADASTRO_INICIAL: "Cadastro inicial",
  operacao_interna: "Operação interna",
  revisao_cadastral: "Revisão cadastral",
};

/**
 * Translates an internal context purpose into safe operator-facing copy.
 * Unknown values deliberately fall back without exposing the enum.
 */
export function formatSubdivisionPurpose(code: string) {
  return subdivisionPurposeLabels[code] ?? "Finalidade de trabalho";
}
