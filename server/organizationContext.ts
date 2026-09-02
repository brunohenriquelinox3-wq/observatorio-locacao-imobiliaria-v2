import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;

export const authorizedOrganizationContextInputSchema = z.object({
  module: z.enum(["loteadora", "vendas_urbanas", "locacao"]),
}).strict();

export type AuthorizedOrganizationContext = {
  organizationId: string;
  organizationLabel: string;
  purposeCode: string;
};

export async function listAuthorizedOrganizationContexts(
  subjectId: string | undefined,
  rawInput: unknown,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<AuthorizedOrganizationContext[]> {
  const input = authorizedOrganizationContextInputSchema.parse(rawInput);
  // Sem subject Supabase não existe contexto autorizado. Retornar vazio evita
  // que telas de leitura emitam erro durante a reconexão de uma prévia em novo
  // domínio, sem consultar o banco nem relaxar as políticas dos comandos.
  if (!subjectId) return [];
  const actorUserId = subjectId;
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
