import type { SupabaseClient } from "@supabase/supabase-js";
import {
  draftUrbanAgendaInputSchema,
  draftUrbanLeadInputSchema,
  urbanLeadStageInputSchema,
  urbanSalesContextSchema,
  type DraftUrbanAgendaInput,
  type DraftUrbanLeadInput,
  type UrbanLeadStageInput,
} from "../shared/urbanPipelineContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;

export type DraftUrbanLeadSummary = {
  leadId: string;
  partyLabel: string;
  sourceCode: string;
  interestKind: "urban_asset" | "search_profile" | "unspecified";
  stage: "intake" | "qualification" | "agenda_pending" | "scheduled" | "closed_lost";
  nextAgendaFor: string | null;
  nextAgendaState: "scheduled" | "rescheduled" | null;
};

export type DraftUrbanAgendaSummary = {
  agendaId: string;
  leadId: string;
  leadLabel: string;
  scheduledFor: string;
  state: "scheduled" | "rescheduled" | "cancelled" | "occurred" | "not_held";
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("URBAN_IDENTITY_REQUIRED");
  return subjectId;
}

async function invokeUuidRpc(client: RpcClient, functionName: string, parameters: Record<string, unknown>): Promise<string> {
  const { data, error } = await client.rpc(functionName, parameters);
  if (error || typeof data !== "string") throw new Error("URBAN_COMMAND_DENIED");
  return data;
}

export async function listDraftUrbanLeads(
  subjectId: string | undefined,
  rawContext: unknown,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<DraftUrbanLeadSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = urbanSalesContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("urban_list_draft_leads", {
    p_actor_user_id: actorUserId,
    p_organization_id: context.organizationId,
    p_module: context.module,
    p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("URBAN_READ_DENIED");
  return data.map((row) => ({
    leadId: String(row.lead_id),
    partyLabel: String(row.party_label),
    sourceCode: String(row.source_code),
    interestKind: ["urban_asset", "search_profile"].includes(String(row.interest_kind))
      ? String(row.interest_kind) as DraftUrbanLeadSummary["interestKind"] : "unspecified",
    stage: ["qualification", "agenda_pending", "scheduled", "closed_lost"].includes(String(row.stage))
      ? String(row.stage) as DraftUrbanLeadSummary["stage"] : "intake",
    nextAgendaFor: typeof row.next_agenda_for === "string" ? row.next_agenda_for : null,
    nextAgendaState: ["scheduled", "rescheduled"].includes(String(row.next_agenda_state))
      ? String(row.next_agenda_state) as DraftUrbanLeadSummary["nextAgendaState"] : null,
  }));
}

export async function createDraftUrbanLead(subjectId: string | undefined, rawInput: DraftUrbanLeadInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ leadId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftUrbanLeadInputSchema.parse(rawInput);
  return { leadId: await invokeUuidRpc(client, "urban_create_draft_lead", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_party_id: input.partyId, p_source_code: input.sourceCode, p_interest_kind: input.interestKind, p_correlation_id: input.correlationId,
  }) };
}

export async function transitionDraftUrbanLead(subjectId: string | undefined, rawInput: UrbanLeadStageInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ stageEventId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = urbanLeadStageInputSchema.parse(rawInput);
  return { stageEventId: await invokeUuidRpc(client, "urban_transition_draft_lead", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_lead_id: input.leadId, p_next_stage: input.nextStage, p_reason_code: input.reasonCode ?? null, p_correlation_id: input.correlationId,
  }) };
}

export async function createDraftUrbanAgenda(subjectId: string | undefined, rawInput: DraftUrbanAgendaInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ agendaId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftUrbanAgendaInputSchema.parse(rawInput);
  return { agendaId: await invokeUuidRpc(client, "urban_create_draft_agenda", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_lead_id: input.leadId, p_scheduled_for: input.scheduledFor, p_state: input.state, p_reason_code: input.reasonCode ?? null, p_correlation_id: input.correlationId,
  }) };
}

export async function listDraftUrbanAgendas(
  subjectId: string | undefined,
  rawContext: unknown,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<DraftUrbanAgendaSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = urbanSalesContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("urban_list_draft_agendas", {
    p_actor_user_id: actorUserId,
    p_organization_id: context.organizationId,
    p_module: context.module,
    p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("URBAN_READ_DENIED");
  return data.map((row) => ({
    agendaId: String(row.agenda_id),
    leadId: String(row.lead_id),
    leadLabel: String(row.lead_label),
    scheduledFor: String(row.scheduled_for),
    state: ["scheduled", "rescheduled", "cancelled", "occurred", "not_held"].includes(String(row.state))
      ? String(row.state) as DraftUrbanAgendaSummary["state"] : "scheduled",
  }));
}
