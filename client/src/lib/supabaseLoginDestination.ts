const allowedDestinationPrefixes = [
  "/administracao",
  "/adm",
  "/cadastro-base",
  "/cadastros",
  "/ativos-urbanos",
  "/loteadora",
  "/estoque-lotes",
  "/vendas-urbanas",
  "/locacao",
] as const;

export const defaultSupabaseLoginDestination = "/locacao";

/**
 * Aceita apenas rotas internas conhecidas. O parâmetro de retorno nunca pode
 * transportar o navegador a outro domínio após autenticação.
 */
export function resolveSupabaseLoginDestination(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return defaultSupabaseLoginDestination;
  }

  const pathname = value.split(/[?#]/, 1)[0] ?? "";
  const isAllowed = allowedDestinationPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return isAllowed ? value : defaultSupabaseLoginDestination;
}

export function supabaseLoginErrorMessage(): string {
  return "Não foi possível validar esta sessão de contexto. Confira os dados e tente novamente.";
}
