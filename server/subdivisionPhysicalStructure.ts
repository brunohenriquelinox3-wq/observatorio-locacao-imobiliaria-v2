import type { SupabaseClient } from "@supabase/supabase-js";
import { subdivisionContextSchema } from "../shared/subdivisionContracts";
import {
  applySubdivisionPhysicalStructureInputSchema,
  upsertSubdivisionDevelopmentRequirementInputSchema,
  upsertSubdivisionLotPhysicalReservationInputSchema,
  upsertSubdivisionLotOperationalProfileInputSchema,
  type ApplySubdivisionPhysicalStructureInput,
  type UpsertSubdivisionDevelopmentRequirementInput,
  type UpsertSubdivisionLotPhysicalReservationInput,
  type UpsertSubdivisionLotOperationalProfileInput,
} from "../shared/subdivisionPhysicalStructureContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;

export type PhysicalStructureLot = {
  lotNumber: number;
  areaSqm: number | null;
  frontageM: number | null;
  depthM: number | null;
  lotTypology: "standard" | "corner" | "irregular" | "other";
  positionCode: "not_declared" | "internal" | "corner" | "end";
  reservationPurpose: "landowner_reserve" | "technical_artesian_well" | "technical_water_tank" | "technical_other" | null;
  internalNote: string | null;
};

export type PhysicalStructureBlock = {
  blockId: string;
  blockNumber: number;
  sectorReference: string | null;
  blockTypology: "regular" | "mixed" | "irregular" | "other";
  lots: PhysicalStructureLot[];
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

function asPositiveNumber(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function asLot(value: unknown): PhysicalStructureLot {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("SUBDIVISION_PHYSICAL_STRUCTURE_READ_DENIED");
  const lot = value as Record<string, unknown>;
  const lotNumber = Number(lot.lot_number);
  if (!Number.isInteger(lotNumber) || lotNumber < 1) throw new Error("SUBDIVISION_PHYSICAL_STRUCTURE_READ_DENIED");
  const lotTypology = String(lot.lot_typology);
  const positionCode = String(lot.position_code);
  if (!( ["standard", "corner", "irregular", "other"] as string[]).includes(lotTypology) || !( ["not_declared", "internal", "corner", "end"] as string[]).includes(positionCode)) throw new Error("SUBDIVISION_PHYSICAL_STRUCTURE_READ_DENIED");
  const reservationPurpose = lot.reservation_purpose === null || lot.reservation_purpose === undefined ? null : String(lot.reservation_purpose);
  if (reservationPurpose !== null && !(["landowner_reserve", "technical_artesian_well", "technical_water_tank", "technical_other"] as string[]).includes(reservationPurpose)) throw new Error("SUBDIVISION_PHYSICAL_STRUCTURE_READ_DENIED");
  const internalNote = lot.internal_note === null || lot.internal_note === undefined ? null : String(lot.internal_note);
  if (internalNote !== null && internalNote.length > 280) throw new Error("SUBDIVISION_PHYSICAL_STRUCTURE_READ_DENIED");
  return { lotNumber, areaSqm: asPositiveNumber(lot.area_sqm), frontageM: asPositiveNumber(lot.frontage_m), depthM: asPositiveNumber(lot.depth_m), lotTypology: lotTypology as PhysicalStructureLot["lotTypology"], positionCode: positionCode as PhysicalStructureLot["positionCode"], reservationPurpose: reservationPurpose as PhysicalStructureLot["reservationPurpose"], internalNote };
}

export async function listDraftSubdivisionPhysicalStructure(subjectId: string | undefined, rawContext: unknown, developmentId: string, client: RpcClient = getSupabaseAdminClient()): Promise<PhysicalStructureBlock[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_draft_physical_structure_v3", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode, p_development_id: developmentId });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_PHYSICAL_STRUCTURE_READ_DENIED");
  return data.map((row) => {
    const record = row as Record<string, unknown>;
    const blockNumber = Number(record.block_number);
    const blockTypology = String(record.block_typology);
    if (typeof record.block_id !== "string" || !Number.isInteger(blockNumber) || !(["regular", "mixed", "irregular", "other"] as string[]).includes(blockTypology) || !Array.isArray(record.lots)) throw new Error("SUBDIVISION_PHYSICAL_STRUCTURE_READ_DENIED");
    return { blockId: record.block_id, blockNumber, sectorReference: typeof record.sector_reference === "string" ? record.sector_reference : null, blockTypology: blockTypology as PhysicalStructureBlock["blockTypology"], lots: record.lots.map(asLot) };
  });
}

export async function applySubdivisionPhysicalStructure(subjectId: string | undefined, rawInput: ApplySubdivisionPhysicalStructureInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ blockCount: number; lotCount: number; archivedBlockCount: number; archivedLotCount: number }> {
  const actorUserId = requireSubject(subjectId);
  const input = applySubdivisionPhysicalStructureInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_apply_draft_physical_structure_v1", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
    p_blocks: input.blocks.map((block) => ({ block_number: block.blockNumber, sector_reference: block.sectorReference ?? null, block_typology: block.blockTypology, lots: block.lots.map((lot) => ({ lot_number: lot.lotNumber, area_sqm: lot.areaSqm ?? null, frontage_m: lot.frontageM ?? null, depth_m: lot.depthM ?? null, lot_typology: lot.lotTypology, position_code: lot.positionCode })) })),
    p_replace_existing: input.replaceExisting,
    p_correlation_id: input.correlationId,
  });
  if (!data || typeof data !== "object" || Array.isArray(data) || error) throw new Error("SUBDIVISION_PHYSICAL_STRUCTURE_COMMAND_DENIED");
  const result = data as Record<string, unknown>;
  const values = ["block_count", "lot_count", "archived_block_count", "archived_lot_count"].map((key) => Number(result[key]));
  if (values.some((value) => !Number.isInteger(value) || value < 0)) throw new Error("SUBDIVISION_PHYSICAL_STRUCTURE_COMMAND_DENIED");
  return { blockCount: values[0], lotCount: values[1], archivedBlockCount: values[2], archivedLotCount: values[3] };
}

export type DevelopmentRequirement = { requirementCode: string; requirementState: string };

export async function listDraftSubdivisionDevelopmentRequirements(subjectId: string | undefined, rawContext: unknown, developmentId: string, client: RpcClient = getSupabaseAdminClient()): Promise<DevelopmentRequirement[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_draft_development_requirements_v1", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode, p_development_id: developmentId });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_REQUIREMENT_READ_DENIED");
  return data.map((row) => ({ requirementCode: String((row as Record<string, unknown>).requirement_code), requirementState: String((row as Record<string, unknown>).requirement_state) }));
}

export async function upsertDraftSubdivisionDevelopmentRequirement(subjectId: string | undefined, rawInput: UpsertSubdivisionDevelopmentRequirementInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ requirementCode: string; requirementState: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = upsertSubdivisionDevelopmentRequirementInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_upsert_draft_development_requirement_v1", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_development_id: input.developmentId, p_requirement_code: input.requirementCode, p_requirement_state: input.requirementState, p_correlation_id: input.correlationId });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) throw new Error("SUBDIVISION_REQUIREMENT_COMMAND_DENIED");
  const result = data as Record<string, unknown>;
  if (typeof result.requirement_code !== "string" || typeof result.requirement_state !== "string") throw new Error("SUBDIVISION_REQUIREMENT_COMMAND_DENIED");
  return { requirementCode: result.requirement_code, requirementState: result.requirement_state };
}

export async function upsertDraftSubdivisionLotPhysicalReservation(subjectId: string | undefined, rawInput: UpsertSubdivisionLotPhysicalReservationInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ reservationPurpose: PhysicalStructureLot["reservationPurpose"] }> {
  const actorUserId = requireSubject(subjectId);
  const input = upsertSubdivisionLotPhysicalReservationInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_upsert_draft_lot_physical_reservation_v1", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_development_id: input.developmentId, p_block_id: input.blockId, p_lot_number: input.lotNumber, p_reservation_purpose: input.reservationPurpose, p_correlation_id: input.correlationId });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) throw new Error("SUBDIVISION_LOT_PHYSICAL_RESERVATION_DENIED");
  const purpose = String((data as Record<string, unknown>).reservation_purpose);
  if (!( ["landowner_reserve", "technical_artesian_well", "technical_water_tank", "technical_other"] as string[]).includes(purpose)) throw new Error("SUBDIVISION_LOT_PHYSICAL_RESERVATION_DENIED");
  return { reservationPurpose: purpose as PhysicalStructureLot["reservationPurpose"] };
}

export async function upsertDraftSubdivisionLotOperationalProfile(subjectId: string | undefined, rawInput: UpsertSubdivisionLotOperationalProfileInput, client: RpcClient = getSupabaseAdminClient()): Promise<void> {
  const actorUserId = requireSubject(subjectId); const input = upsertSubdivisionLotOperationalProfileInputSchema.parse(rawInput);
  const { error } = await client.rpc("subdivision_upsert_draft_lot_operational_profile_v1", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_development_id: input.developmentId, p_block_id: input.blockId, p_lot_number: input.lotNumber, p_area_sqm: input.areaSqm ?? null, p_frontage_m: input.frontageM ?? null, p_depth_m: input.depthM ?? null, p_lot_typology: input.lotTypology, p_position_code: input.positionCode, p_reservation_purpose: input.reservationPurpose, p_internal_note: input.internalNote, p_correlation_id: input.correlationId });
  if (error) throw new Error("SUBDIVISION_LOT_OPERATIONAL_PROFILE_DENIED");
}
