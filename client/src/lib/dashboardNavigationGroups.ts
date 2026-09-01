export type DashboardNavigationGroupId = "platform" | "operation" | "foundation";

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
  { id: "operation", label: "Operação" },
  { id: "foundation", label: "Fundações" },
];

function resolveNavigationGroup(path: string): DashboardNavigationGroupId {
  if (path === "/administracao" || path === "/adm") return "platform";
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
