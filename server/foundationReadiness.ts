import { getSupabaseAdminClient } from "./supabase";

const foundationTables = [
  "organizations",
  "platform_principals",
  "administrative_grants",
  "admin_audit_events",
] as const;

const countColumnByTable = {
  organizations: "id",
  platform_principals: "user_id",
  administrative_grants: "id",
  admin_audit_events: "id",
} as const;

export type FoundationTable = (typeof foundationTables)[number];
export type FoundationCountReader = (table: FoundationTable) => Promise<number>;

export type FoundationReadiness = {
  environment: "development";
  directBrowserAccess: "denied";
  commandMode: "blocked";
  counts: {
    organizations: number;
    principals: number;
    grants: number;
    auditEvents: number;
  };
};

async function countFoundationRows(table: FoundationTable): Promise<number> {
  const { count, error } = await getSupabaseAdminClient()
    .from(table)
    .select(countColumnByTable[table], { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
}

/**
 * Retorna apenas contagens agregadas para leitura de prontidão. Não devolve
 * identificadores, dossiês, contratos, dados pessoais ou chaves de acesso.
 */
export async function getFoundationReadiness(
  readCount: FoundationCountReader = countFoundationRows,
): Promise<FoundationReadiness> {
  try {
    const [organizations, principals, grants, auditEvents] = await Promise.all(
      foundationTables.map(readCount),
    );

    return {
      environment: "development",
      directBrowserAccess: "denied",
      commandMode: "blocked",
      counts: { organizations, principals, grants, auditEvents },
    };
  } catch (error) {
    console.error("[FoundationReadiness] Aggregated readiness lookup failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    throw new Error("FOUNDATION_READINESS_UNAVAILABLE");
  }
}
