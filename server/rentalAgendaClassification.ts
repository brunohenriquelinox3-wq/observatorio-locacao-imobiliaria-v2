import type { SupabaseClient } from "@supabase/supabase-js";
import {
  draftRentalAgendaClassificationInputSchema,
  rentalOperatingContextSchema,
  type DraftRentalAgendaClassificationInput,
} from "../shared/rentalPipelineContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
type AgendaClassification = "intake_review" | "context_preparation" | "internal_follow_up";

export type DraftRentalAgendaClassificationSummary = {
  classificationId: string;
  agendaId: string;
  classification: AgendaClassification;
  internalCodePresent: boolean;
  updatedAt: string;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("RENTAL_IDENTITY_REQUIRED");
  return subjectId;
}

async function invokeUuidRpc(client: RpcClient, functionName: string, parameters: Record<string, unknown>): Promise<string> {
  const { data, error } = await client.rpc(functionName, parameters);
  if (error || typeof data !== "string") throw new Error("RENTAL_AGENDA_CLASSIFICATION_COMMAND_DENIED");
  return data;
}

const classifications: AgendaClassification[] = ["intake_review", "context_preparation", "internal_follow_up"];

export async function listDraftRentalAgendaClassifications(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<DraftRentalAgendaClassificationSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = rentalOperatingContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("rental_list_draft_agenda_classifications", {
    p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("RENTAL_AGENDA_CLASSIFICATION_READ_DENIED");
  return data.map((row) => ({
    classificationId: String(row.classification_id),
    agendaId: String(row.agenda_id),
    classification: classifications.includes(String(row.classification) as AgendaClassification) ? String(row.classification) as AgendaClassification : "intake_review",
    internalCodePresent: row.internal_code_present === true,
    updatedAt: String(row.updated_at),
  }));
}

export async function upsertDraftRentalAgendaClassification(subjectId: string | undefined, rawInput: DraftRentalAgendaClassificationInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ classificationId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftRentalAgendaClassificationInputSchema.parse(rawInput);
  return { classificationId: await invokeUuidRpc(client, "rental_upsert_draft_agenda_classification", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_agenda_id: input.agendaId, p_classification: input.classification, p_internal_code: input.internalCode,
    p_correlation_id: input.correlationId,
  }) };
}
