import type { SupabaseClient } from "@supabase/supabase-js";
import { configureSubdivisionInternalReceivableAlertsInputSchema, type ConfigureSubdivisionInternalReceivableAlertsInput } from "../shared/subdivisionSaleCaseContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
export async function configureSubdivisionInternalReceivableAlerts(subjectId: string | undefined, rawInput: ConfigureSubdivisionInternalReceivableAlertsInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ configurationId: string; leadDays: number; enabled: false; scheduleBound: false }> {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED"); const input = configureSubdivisionInternalReceivableAlertsInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_configure_internal_receivable_alerts", { p_actor_user_id: subjectId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_lead_days: input.leadDays, p_correlation_id: input.correlationId });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) throw new Error("SUBDIVISION_RECEIVABLE_ALERT_CONFIGURATION_DENIED");
  const result = data as Record<string, unknown>; if (typeof result.configuration_id !== "string" || typeof result.lead_days !== "number" || result.enabled !== false || result.schedule_bound !== false) throw new Error("SUBDIVISION_RECEIVABLE_ALERT_CONFIGURATION_DENIED");
  return { configurationId: result.configuration_id, leadDays: result.lead_days, enabled: false, scheduleBound: false };
}
