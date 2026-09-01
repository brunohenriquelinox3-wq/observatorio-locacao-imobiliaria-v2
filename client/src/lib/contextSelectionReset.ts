/**
 * Mantém uma seleção local enquanto a leitura autorizada ainda a contém.
 * Dados indefinidos representam carregamento: nesse estado, a escolha não é apagada.
 */
export function retainAuthorizedSelection<T>(value: string, candidates: readonly T[] | undefined, identify: (candidate: T) => string): string {
  if (!value || candidates === undefined) return value;
  return candidates.some((candidate) => identify(candidate) === value) ? value : "";
}
