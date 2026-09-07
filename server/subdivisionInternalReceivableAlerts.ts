import type { SupabaseClient } from "@supabase/supabase-js";
import { subdivisionContextSchema } from "../shared/subdivisionContracts";
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

export async function getSubdivisionInternalReceivableAlertConfiguration(subjectId: string | undefined, rawInput: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<{ configurationExists: boolean; leadDays: number | null; enabled: boolean; scheduleBound: boolean }> {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  const input = subdivisionContextSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_get_internal_receivable_alert_configuration", { p_actor_user_id: subjectId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) throw new Error("SUBDIVISION_RECEIVABLE_ALERT_CONFIGURATION_READ_DENIED");
  const result = data as Record<string, unknown>;
  if (typeof result.configuration_exists !== "boolean" || (result.lead_days !== null && (typeof result.lead_days !== "number" || result.lead_days < 1 || result.lead_days > 14)) || typeof result.enabled !== "boolean" || typeof result.schedule_bound !== "boolean") throw new Error("SUBDIVISION_RECEIVABLE_ALERT_CONFIGURATION_READ_DENIED");
  return { configurationExists: result.configuration_exists, leadDays: result.lead_days as number | null, enabled: result.enabled, scheduleBound: result.schedule_bound };
}
