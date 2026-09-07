import type { SupabaseClient } from "@supabase/supabase-js";
import { subdivisionContextSchema } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
export type SubdivisionLotCommercialState = { lotId: string; commercialState: "preparation" | "contract_review" | "sold" | "reversal_review"; updatedAt: string };
export async function listSubdivisionLotCommercialStates(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionLotCommercialState[]> {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED"); const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_lot_commercial_states", { p_actor_user_id: subjectId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_LOT_COMMERCIAL_STATE_READ_DENIED");
  return data.map((raw) => { const row = raw as Record<string, unknown>; const commercialState = String(row.commercial_state); if (!( ["preparation", "contract_review", "sold", "reversal_review"] as const).includes(commercialState as SubdivisionLotCommercialState["commercialState"])) throw new Error("SUBDIVISION_LOT_COMMERCIAL_STATE_READ_DENIED"); return { lotId: String(row.lot_id), commercialState: commercialState as SubdivisionLotCommercialState["commercialState"], updatedAt: String(row.updated_at) }; });
}
