export type OperationalModule = "loteadora" | "vendas_urbanas" | "locacao";

const moduleByPath: Record<string, OperationalModule | undefined> = {
  "/loteadora": "loteadora",
  "/estoque-lotes": "loteadora",
  "/vendas-urbanas": "vendas_urbanas",
  "/locacao": "locacao",
};

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
    const module = moduleByPath[item.path];
    return !module || authorizedModules[module];
  });
}
