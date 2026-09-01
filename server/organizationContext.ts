import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;

export const authorizedOrganizationContextInputSchema = z.object({
  module: z.literal("loteadora"),
}).strict();

export type AuthorizedOrganizationContext = {
  organizationId: string;
  organizationLabel: string;
  purposeCode: string;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("ORGANIZATION_CONTEXT_IDENTITY_REQUIRED");
  return subjectId;
}

export async function listAuthorizedOrganizationContexts(
  subjectId: string | undefined,
  rawInput: unknown,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<AuthorizedOrganizationContext[]> {
  const actorUserId = requireSubject(subjectId);
  const input = authorizedOrganizationContextInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("organization_list_authorized_contexts", {
    p_actor_user_id: actorUserId,
    p_module: input.module,
  });
  if (error || !Array.isArray(data)) throw new Error("ORGANIZATION_CONTEXT_READ_DENIED");

  return data.map((row) => ({
    organizationId: String(row.organization_id),
    organizationLabel: String(row.organization_label),
    purposeCode: String(row.purpose_code).trim().toUpperCase(),
  }));
}
