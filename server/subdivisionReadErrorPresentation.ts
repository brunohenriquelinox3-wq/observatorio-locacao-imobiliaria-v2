export type SubdivisionReadErrorKind = "access" | "temporary";

type TrpcLikeError = {
  message?: unknown;
  data?: { code?: unknown };
};

const accessErrorCodes = new Set(["FORBIDDEN", "UNAUTHORIZED"]);
const accessMessages = new Set([
  "DOMAIN_CONTEXT_DENIED",
  "DOMAIN_AUTHORITY_DENIED",
  "SUBDIVISION_ACTIVE_ORGANIZATION_REQUIRED",
  "SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED",
  "SUBDIVISION_MODULE_DENIED",
  "SUBDIVISION_BLOCK_READ_DENIED",
]);

/**
 * Presents only a safe, operational classification of a read failure.
 * Technical causes remain in diagnostics; the UI never renders error payloads.
 */
export function classifySubdivisionReadError(
  error: unknown
): SubdivisionReadErrorKind {
  if (!error || typeof error !== "object") return "temporary";

  const candidate = error as TrpcLikeError;
  const code = String(candidate.data?.code ?? "");
  const message = String(candidate.message ?? "");

  if (accessErrorCodes.has(code) || accessMessages.has(message)) {
    return "access";
  }

  return "temporary";
}

export function presentSubdivisionReadError(
  kind: SubdivisionReadErrorKind
) {
  if (kind === "access") {
    return {
      title: "Esta área não está disponível para sua sessão",
      description:
        "Confira a organização selecionada ou peça a atualização do seu acesso. Nenhum dado foi alterado.",
    };
  }

  return {
    title: "Não foi possível carregar esta leitura",
    description:
      "Tente novamente. Nenhum dado foi alterado enquanto a leitura esteve indisponível.",
  };
}
