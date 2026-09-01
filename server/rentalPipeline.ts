import type { SupabaseClient } from "@supabase/supabase-js";
import {
  draftRentalAgendaInputSchema,
  draftRentalIntakeInputSchema,
  rentalIntakeStageInputSchema,
  rentalOperatingContextSchema,
  type DraftRentalAgendaInput,
  type DraftRentalIntakeInput,
  type RentalIntakeStageInput,
} from "../shared/rentalPipelineContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;

export type DraftRentalIntakeSummary = {
  intakeId: string;
  partyLabel: string;
  journeyKind: "management_interest" | "tenant_interest";
  sourceCode: string;
  stage: "intake" | "qualification" | "agenda_pending" | "scheduled" | "closed_lost";
  nextAgendaFor: string | null;
  nextAgendaState: "scheduled" | "rescheduled" | null;
};

export type DraftRentalAgendaSummary = {
  agendaId: string;
  intakeId: string;
  intakeLabel: string;
  journeyKind: "management_interest" | "tenant_interest";
  scheduledFor: string;
  state: "scheduled" | "rescheduled" | "cancelled" | "occurred" | "not_held";
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("RENTAL_IDENTITY_REQUIRED");
  return subjectId;
}

async function invokeUuidRpc(client: RpcClient, functionName: string, parameters: Record<string, unknown>): Promise<string> {
  const { data, error } = await client.rpc(functionName, parameters);
  if (error || typeof data !== "string") throw new Error("RENTAL_COMMAND_DENIED");
  return data;
}

export async function listDraftRentalIntakes(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<DraftRentalIntakeSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = rentalOperatingContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("rental_list_draft_intakes", {
    p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("RENTAL_READ_DENIED");
  return data.map((row) => ({
    intakeId: String(row.intake_id),
    partyLabel: String(row.party_label),
    journeyKind: String(row.journey_kind) === "management_interest" ? "management_interest" : "tenant_interest",
    sourceCode: String(row.source_code),
    stage: ["qualification", "agenda_pending", "scheduled", "closed_lost"].includes(String(row.stage)) ? String(row.stage) as DraftRentalIntakeSummary["stage"] : "intake",
    nextAgendaFor: typeof row.next_agenda_for === "string" ? row.next_agenda_for : null,
    nextAgendaState: ["scheduled", "rescheduled"].includes(String(row.next_agenda_state)) ? String(row.next_agenda_state) as DraftRentalIntakeSummary["nextAgendaState"] : null,
  }));
}

export async function createDraftRentalIntake(subjectId: string | undefined, rawInput: DraftRentalIntakeInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ intakeId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftRentalIntakeInputSchema.parse(rawInput);
  return { intakeId: await invokeUuidRpc(client, "rental_create_draft_intake", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_party_id: input.partyId, p_journey_kind: input.journeyKind, p_source_code: input.sourceCode, p_correlation_id: input.correlationId,
  }) };
}

export async function transitionDraftRentalIntake(subjectId: string | undefined, rawInput: RentalIntakeStageInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ stageEventId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = rentalIntakeStageInputSchema.parse(rawInput);
  return { stageEventId: await invokeUuidRpc(client, "rental_transition_draft_intake", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_intake_id: input.intakeId, p_next_stage: input.nextStage, p_reason_code: input.reasonCode ?? null, p_correlation_id: input.correlationId,
  }) };
}

export async function createDraftRentalAgenda(subjectId: string | undefined, rawInput: DraftRentalAgendaInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ agendaId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftRentalAgendaInputSchema.parse(rawInput);
  return { agendaId: await invokeUuidRpc(client, "rental_create_draft_agenda", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_intake_id: input.intakeId, p_scheduled_for: input.scheduledFor, p_state: input.state, p_reason_code: input.reasonCode ?? null, p_correlation_id: input.correlationId,
  }) };
}

export async function listDraftRentalAgendas(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<DraftRentalAgendaSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = rentalOperatingContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("rental_list_draft_agendas", {
    p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("RENTAL_READ_DENIED");
  return data.map((row) => ({
    agendaId: String(row.agenda_id), intakeId: String(row.intake_id), intakeLabel: String(row.intake_label),
    journeyKind: String(row.journey_kind) === "management_interest" ? "management_interest" : "tenant_interest",
    scheduledFor: String(row.scheduled_for),
    state: ["scheduled", "rescheduled", "cancelled", "occurred", "not_held"].includes(String(row.state)) ? String(row.state) as DraftRentalAgendaSummary["state"] : "scheduled",
  }));
}
