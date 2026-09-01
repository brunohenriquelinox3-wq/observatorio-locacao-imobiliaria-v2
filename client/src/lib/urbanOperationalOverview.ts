export function urbanOperationalValue(input: { contextReady: boolean; loading: boolean; count?: number; pendingLabel: string }): string {
  if (!input.contextReady) return "Aguardando contexto";
  if (input.loading) return "Consultando";
  return input.count === undefined ? input.pendingLabel : `${input.count} em rascunho`;
}
