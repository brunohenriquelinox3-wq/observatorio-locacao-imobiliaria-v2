export type DashboardNavigationGroupId = "platform" | "loteadora" | "urban_sales" | "rental" | "foundation" | "operation";

type NavigationItemLike = {
  path: string;
};

export type DashboardNavigationGroup<T extends NavigationItemLike> = {
  id: DashboardNavigationGroupId;
  label: string;
  items: T[];
};

const groupDefinitions: Array<Pick<DashboardNavigationGroup<NavigationItemLike>, "id" | "label">> = [
  { id: "platform", label: "Plataforma" },
  { id: "loteadora", label: "Loteadora" },
  { id: "urban_sales", label: "Vendas Urbanas" },
  { id: "rental", label: "Locação" },
  { id: "foundation", label: "Fundações" },
  { id: "operation", label: "Operação" },
];

function resolveNavigationGroup(path: string): DashboardNavigationGroupId {
  if (path === "/administracao" || path === "/adm" || path === "/seguranca-mfa") return "platform";
  if (path === "/estoque-lotes" || path === "/loteadora" || path.startsWith("/loteadora/")) return "loteadora";
  if (path === "/vendas-urbanas" || path.startsWith("/vendas-urbanas/")) return "urban_sales";
  if (path === "/locacao" || path.startsWith("/locacao/")) return "rental";
  if (path === "/cadastro-base" || path === "/ativos-urbanos") return "foundation";
  return "operation";
}

export function groupDashboardNavigation<T extends NavigationItemLike>(items: T[]): DashboardNavigationGroup<T>[] {
  const groups = groupDefinitions.map((group) => ({ ...group, items: [] as T[] }));

  for (const item of items) {
    const group = groups.find((candidate) => candidate.id === resolveNavigationGroup(item.path));
    group?.items.push(item);
  }

  return groups.filter((group) => group.items.length > 0);
}
