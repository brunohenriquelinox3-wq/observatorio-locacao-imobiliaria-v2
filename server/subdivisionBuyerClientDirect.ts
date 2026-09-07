import type { SupabaseClient } from "@supabase/supabase-js";
import { registerSubdivisionBuyerClientDirectInputSchema, type RegisterSubdivisionBuyerClientDirectInput } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;

export type DirectSubdivisionBuyerClientRegistration = {
  buyerClientId: string;
  partyId: string;
  partyRoleAssignmentId: string;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

export async function registerSubdivisionBuyerClientDirect(subjectId: string | undefined, rawInput: RegisterSubdivisionBuyerClientDirectInput, client: RpcClient = getSupabaseAdminClient()): Promise<DirectSubdivisionBuyerClientRegistration> {
  const actorUserId = requireSubject(subjectId);
  const input = registerSubdivisionBuyerClientDirectInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_register_buyer_client_direct", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_party_kind: input.partyKind,
    p_display_name: input.displayName,
    p_correlation_id: input.correlationId,
  });
  if (error || !Array.isArray(data) || data.length !== 1) throw new Error("SUBDIVISION_BUYER_CLIENT_DIRECT_COMMAND_DENIED");
  const row = data[0] as Record<string, unknown> | undefined;
  if (!row || typeof row.buyer_client_id !== "string" || typeof row.party_id !== "string" || typeof row.party_role_assignment_id !== "string") {
    throw new Error("SUBDIVISION_BUYER_CLIENT_DIRECT_COMMAND_DENIED");
  }
  return { buyerClientId: row.buyer_client_id, partyId: row.party_id, partyRoleAssignmentId: row.party_role_assignment_id };
}
