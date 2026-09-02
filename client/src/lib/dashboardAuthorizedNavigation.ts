export type OperationalModule = "loteadora" | "vendas_urbanas" | "locacao";

function moduleForPath(path: string): OperationalModule | undefined {
  if (path === "/estoque-lotes" || path === "/loteadora" || path.startsWith("/loteadora/")) return "loteadora";
  if (path === "/vendas-urbanas" || path.startsWith("/vendas-urbanas/")) return "vendas_urbanas";
  if (path === "/locacao" || path.startsWith("/locacao/")) return "locacao";
  return undefined;
}

export function filterNavigationByAuthorizedModules<T extends { path: string }>({
  items,
  isAvailabilityResolved,
  authorizedModules,
}: {
  items: T[];
  isAvailabilityResolved: boolean;
  authorizedModules: Record<OperationalModule, boolean>;
}): T[] {
  if (!isAvailabilityResolved) return items;

  return items.filter(item => {
    const module = moduleForPath(item.path);
    return !module || authorizedModules[module];
  });
}
