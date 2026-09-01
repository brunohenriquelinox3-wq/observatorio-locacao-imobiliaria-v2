export type OrganizationAdminModuleState = "loading" | "available" | "empty" | "restricted";

export function organizationAdminModuleState(input: { loading: boolean; denied: boolean; contextCount?: number }): OrganizationAdminModuleState {
  if (input.loading) return "loading";
  if (input.denied) return "restricted";
  return input.contextCount ? "available" : "empty";
}

export function organizationAdminModuleLabel(state: OrganizationAdminModuleState): string {
  return {
    loading: "Verificando acesso",
    available: "Pronto para operar",
    empty: "Sem contexto liberado",
    restricted: "Acesso não liberado",
  }[state];
}
