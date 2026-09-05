import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { bootstrapOwnerProcedure, platformActiveProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getFoundationReadiness } from "./foundationReadiness";
import {
  activateOrganization,
  activateSelfOrganizationAdmin,
  bootstrapCurrentSubject,
  activatePendingPlatformPrincipal,
  delegateMembership,
  getAdministrativeSubjectStatus,
  listActivatableOrganizations,
  listSelfAdministrationOrganizationTargets,
  provisionOrganization,
  revokeMembership,
  suspendMembership,
} from "./adminCommands";
import {
  acceptOwnWorkforceAccess,
  listOrganizationWorkforceAccessRequests,
  listOwnWorkforceAccessRequests,
  listPlatformWorkforceAccessRequests,
  prepareOrganizationWorkforceAccess,
  preparePlatformWorkforceAccess,
  requestOwnWorkforceAccess,
} from "./adminWorkforceAccess";
import { attestSupabaseMfa } from "./supabaseIdentity";
import {
  acceptOwnWorkforceAccessInputSchema,
  activateOrganizationInputSchema,
  activateSelfOrganizationAdminInputSchema,
  administrativeRequestMetaSchema,
  grantMembershipInputSchema,
  prepareWorkforceAccessInputSchema,
  provisionOrganizationInputSchema,
  requestOwnWorkforceAccessInputSchema,
  revokeMembershipInputSchema,
  suspendMembershipInputSchema,
} from "../shared/adminCommandContracts";
import {
  domainContextSchema,
  draftPartyInputSchema,
  draftPartyRoleInputSchema,
} from "../shared/domainFoundationContracts";
import {
  assignDraftPartyRole,
  createDraftParty,
  listDraftParties,
  listDraftPartyRoles,
} from "./domainFoundation";
import {
  attachDraftAssetParty,
  createDraftUrbanAsset,
  listDraftUrbanAssets,
  setDraftAssetModuleState,
} from "./assetFoundation";
import {
  draftAssetModuleStateInputSchema,
  draftAssetPartyRelationInputSchema,
  draftUrbanAssetInputSchema,
} from "../shared/assetFoundationContracts";
import {
  draftUrbanAgendaClassificationInputSchema,
  draftUrbanAgendaInputSchema,
  draftUrbanLeadInputSchema,
  draftUrbanLeadSearchProfileInputSchema,
  urbanLeadAssetLinkInputSchema,
  urbanLeadStageInputSchema,
  urbanSalesContextSchema,
} from "../shared/urbanPipelineContracts";
import {
  createDraftUrbanAgenda,
  createDraftUrbanLead,
  listDraftUrbanAgendas,
  listDraftUrbanLeads,
  transitionDraftUrbanLead,
} from "./urbanPipeline";
import { draftUrbanDevelopmentDeveloperLinkInputSchema, draftUrbanDevelopmentInputSchema, draftUrbanDevelopmentStructureInputSchema, draftUrbanDeveloperInputSchema } from "../shared/urbanDevelopmentContracts";
import { createDraftUrbanDevelopment, createDraftUrbanDevelopmentStructure, linkDraftUrbanDevelopmentDeveloper, listDraftUrbanDevelopmentDeveloperLinks, listDraftUrbanDevelopmentStructures, listDraftUrbanDevelopments, listDraftUrbanDevelopers, registerDraftUrbanDeveloper } from "./urbanDevelopment";
import {
  linkDraftUrbanLeadAsset,
  listDraftUrbanLeadAssetLinks,
} from "./urbanLeadAssetLink";
import {
  listDraftUrbanLeadSearchProfiles,
  upsertDraftUrbanLeadSearchProfile,
} from "./urbanLeadSearchProfile";
import {
  listDraftUrbanAgendaClassifications,
  upsertDraftUrbanAgendaClassification,
} from "./urbanAgendaClassification";
import {
  draftRentalAgendaClassificationInputSchema,
  draftRentalAgendaInputSchema,
  draftRentalIntakeInputSchema,
  draftRentalManagementScopeInputSchema,
  draftRentalTenantSearchProfileInputSchema,
  rentalIntakeStageInputSchema,
  rentalManagementAssetLinkInputSchema,
  rentalOperatingContextSchema,
} from "../shared/rentalPipelineContracts";
import {
  createDraftRentalAgenda,
  createDraftRentalIntake,
  listDraftRentalAgendas,
  listDraftRentalIntakes,
  transitionDraftRentalIntake,
} from "./rentalPipeline";
import {
  linkDraftRentalManagementAsset,
  listDraftRentalManagementAssetLinks,
} from "./rentalManagementAssetLink";
import {
  listDraftRentalTenantSearchProfiles,
  upsertDraftRentalTenantSearchProfile,
} from "./rentalTenantSearchProfile";
import {
  listDraftRentalManagementDeclaredScopes,
  upsertDraftRentalManagementDeclaredScope,
} from "./rentalManagementDeclaredScope";
import {
  listDraftRentalAgendaClassifications,
  upsertDraftRentalAgendaClassification,
} from "./rentalAgendaClassification";
import {
  draftSubdivisionBlockInputSchema,
  draftSubdivisionBuyerClientInputSchema,
  draftSubdivisionBuyerAttachmentIntentInputSchema,
  draftSubdivisionDevelopmentInputSchema,
  draftSubdivisionDevelopmentPreparationProfileInputSchema,
  draftSubdivisionLotInputSchema,
  draftSubdivisionLotInventoryStateInputSchema,
  draftSubdivisionSaleDraftInputSchema,
  draftSubdivisionSaleDraftCoBuyerInputSchema,
  draftSubdivisionEconomicRuleSetInputSchema,
  draftSubdivisionEconomicRuleComponentInputSchema,
  draftSubdivisionEconomicRuleComponentRoleReferenceInputSchema,
  draftSubdivisionSaleDraftWorkStateInputSchema,
  subdivisionContextSchema,
} from "../shared/subdivisionContracts";
import {
  archiveSubdivisionDevelopmentAttachmentInputSchema,
  archiveSubdivisionDevelopmentStudioInputSchema,
  createSubdivisionDevelopmentAttachmentIntentInputSchema,
  createSubdivisionDevelopmentStudioInputSchema,
  updateSubdivisionDevelopmentStudioInputSchema,
} from "../shared/subdivisionDevelopmentStudioContracts";
import {
  createDraftSubdivisionDevelopment,
  listDraftSubdivisionDevelopments,
} from "./subdivisionDevelopment";
import {
  archiveSubdivisionDevelopmentStudio,
  createSubdivisionDevelopmentStudio,
  listSubdivisionDevelopmentStudio,
  updateSubdivisionDevelopmentStudio,
} from "./subdivisionDevelopmentStudio";
import {
  archiveSubdivisionDevelopmentAttachment,
  createSubdivisionDevelopmentAttachmentIntent,
  listSubdivisionDevelopmentAttachments,
} from "./subdivisionDevelopmentAttachment";
import {
  applyDraftSubdivisionStructure,
  archiveDraftSubdivisionBlock,
  listArchivedDraftSubdivisionStructure,
  listDraftSubdivisionStructure,
  restoreDraftSubdivisionBlock,
} from "./subdivisionStructureBuilder";
import { applySubdivisionDraftStructureInputSchema, archiveSubdivisionDraftBlockInputSchema, restoreSubdivisionDraftBlockInputSchema } from "../shared/subdivisionStructureBuilderContracts";
import {
  applySubdivisionPhysicalStructureInputSchema,
  upsertSubdivisionDevelopmentRequirementInputSchema,
} from "../shared/subdivisionPhysicalStructureContracts";
import {
  applySubdivisionPhysicalStructure,
  listDraftSubdivisionDevelopmentRequirements,
  listDraftSubdivisionPhysicalStructure,
  upsertDraftSubdivisionDevelopmentRequirement,
} from "./subdivisionPhysicalStructure";
import {
  listDraftSubdivisionDevelopmentPreparationProfiles,
  upsertDraftSubdivisionDevelopmentPreparationProfile,
} from "./subdivisionDevelopmentPreparation";
import {
  createDraftSubdivisionBlock,
  listDraftSubdivisionBlocks,
} from "./subdivisionBlock";
import {
  createDraftSubdivisionLot,
  listDraftSubdivisionLots,
} from "./subdivisionLot";
import { listDraftLotInventoryStates, upsertDraftLotInventoryState } from "./subdivisionLotInventoryState";
import { listDraftLotInventoryEvents, transitionDraftLotInventoryState } from "./subdivisionLotInventoryEvents";
import { linkDraftSubdivisionInternalPartyRole, listDraftSubdivisionInternalPartyRoles } from "./subdivisionInternalPartyRoles";
import { createDraftSubdivisionBuyerClient, listDraftSubdivisionBuyerClients } from "./subdivisionBuyerClient";
import { createBuyerAttachmentIntent, listBuyerAttachmentIntents } from "./subdivisionBuyerAttachmentIntent";
import { createSubdivisionSaleDraft, listSubdivisionSaleDraftAttachmentCoverage, listSubdivisionSaleDrafts } from "./subdivisionSaleDraft";
import { listSubdivisionSaleDraftWorkStates, upsertSubdivisionSaleDraftWorkState } from "./subdivisionSaleDraftWorkState";
import { addSubdivisionSaleDraftCoBuyer, listSubdivisionSaleDraftCoBuyers } from "./subdivisionSaleDraftCoBuyer";
import { createSubdivisionEconomicRuleSet, listSubdivisionEconomicRuleSets } from "./subdivisionEconomicRuleSet";
import { createSubdivisionEconomicRuleComponent, listSubdivisionEconomicRuleComponents } from "./subdivisionEconomicRuleComponent";
import { addSubdivisionEconomicRuleComponentRoleReference, listSubdivisionEconomicRuleComponentRoleReferences } from "./subdivisionEconomicRuleComponentRoleReference";
import {
  approveSubdivisionPriceBasePolicy,
  listSubdivisionPriceBasePolicies,
  prepareSubdivisionPriceBasePolicy,
  previewSubdivisionPriceBaseSource,
  submitSubdivisionPriceBasePolicy,
} from "./subdivisionPriceBasePolicy";
import {
  approveSubdivisionPriceBasePolicyInputSchema,
  listSubdivisionPriceBasePoliciesInputSchema,
  prepareSubdivisionPriceBasePolicyInputSchema,
  previewSubdivisionPriceBaseSourceInputSchema,
  submitSubdivisionPriceBasePolicyInputSchema,
} from "../shared/subdivisionPriceBaseContracts";
import { authorizedOrganizationContextInputSchema, listAuthorizedOrganizationContexts } from "./organizationContext";
import { clientImportCommitInputSchema } from "../shared/clientImportContracts";
import { commitClientImport } from "./clientImport";

async function requireRecentTotpMfa(ctx: { supabaseAccessToken?: string; supabaseSubjectId?: string | null }) {
  const attestation = await attestSupabaseMfa(ctx.supabaseAccessToken);
  if (!attestation || attestation.subjectId !== ctx.supabaseSubjectId || attestation.assuranceLevel !== "aal2" || attestation.method !== "totp") {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "SUBDIVISION_COMMAND_PRECONDITIONS_UNMET" });
  }
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  foundation: router({
    readiness: platformActiveProcedure.query(() => getFoundationReadiness()),
    identity: protectedProcedure.query(({ ctx }) => ({
      provider: "supabase",
      state: ctx.supabaseSubjectId ? "connected" : "not_connected",
      commandMode: "blocked" as const,
    })),
    commandStatus: bootstrapOwnerProcedure.query(({ ctx }) => getAdministrativeSubjectStatus(ctx.supabaseSubjectId)),
  }),

  administration: router({
    bootstrap: bootstrapOwnerProcedure
      .input(administrativeRequestMetaSchema)
      .mutation(async ({ ctx, input }) => {
        const attestation = await attestSupabaseMfa(ctx.supabaseAccessToken);
        if (!attestation || attestation.subjectId !== ctx.supabaseSubjectId || attestation.assuranceLevel !== "aal2" || attestation.method !== "totp") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ADMIN_COMMAND_PRECONDITIONS_UNMET" });
        }
        return bootstrapCurrentSubject(ctx.supabaseSubjectId, input.correlationId);
      }),
    activateBootstrap: bootstrapOwnerProcedure
      .input(administrativeRequestMetaSchema)
      .mutation(async ({ ctx, input }) => activatePendingPlatformPrincipal(
        await attestSupabaseMfa(ctx.supabaseAccessToken),
        input.correlationId,
      )),
    provisionOrganization: platformActiveProcedure
      .input(provisionOrganizationInputSchema)
      .mutation(({ ctx, input }) => provisionOrganization(ctx.supabaseSubjectId, input)),
    delegateMembership: platformActiveProcedure
      .input(grantMembershipInputSchema)
      .mutation(({ ctx, input }) => delegateMembership(ctx.supabaseSubjectId, input)),
    listSelfAdministrationOrganizationTargets: platformActiveProcedure
      .query(({ ctx }) => listSelfAdministrationOrganizationTargets(ctx.supabaseSubjectId)),
    activateSelfOrganizationAdmin: platformActiveProcedure
      .input(activateSelfOrganizationAdminInputSchema)
      .mutation(async ({ ctx, input }) => {
        const attestation = await attestSupabaseMfa(ctx.supabaseAccessToken);
        if (!attestation || attestation.subjectId !== ctx.supabaseSubjectId || attestation.assuranceLevel !== "aal2" || attestation.method !== "totp" || !attestation.verifiedRecoveryChannel) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ADMIN_COMMAND_PRECONDITIONS_UNMET" });
        }
        return activateSelfOrganizationAdmin(ctx.supabaseSubjectId, input);
      }),
    listActivatableOrganizations: platformActiveProcedure
      .query(({ ctx }) => listActivatableOrganizations(ctx.supabaseSubjectId)),
    activateOrganization: platformActiveProcedure
      .input(activateOrganizationInputSchema)
      .mutation(async ({ ctx, input }) => {
        const attestation = await attestSupabaseMfa(ctx.supabaseAccessToken);
        if (!attestation || attestation.subjectId !== ctx.supabaseSubjectId || attestation.assuranceLevel !== "aal2" || attestation.method !== "totp" || !attestation.verifiedRecoveryChannel) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ADMIN_COMMAND_PRECONDITIONS_UNMET" });
        }
        return activateOrganization(ctx.supabaseSubjectId, input);
      }),
    suspendMembership: platformActiveProcedure
      .input(suspendMembershipInputSchema)
      .mutation(({ ctx, input }) => suspendMembership(ctx.supabaseSubjectId, input)),
    revokeMembership: platformActiveProcedure
      .input(revokeMembershipInputSchema)
      .mutation(({ ctx, input }) => revokeMembership(ctx.supabaseSubjectId, input)),
    requestOwnWorkforceAccess: protectedProcedure
      .input(requestOwnWorkforceAccessInputSchema)
      .mutation(({ ctx, input }) => requestOwnWorkforceAccess(ctx.supabaseSubjectId ?? null, input)),
    listOwnWorkforceAccessRequests: protectedProcedure
      .query(({ ctx }) => listOwnWorkforceAccessRequests(ctx.supabaseSubjectId ?? null)),
    acceptOwnWorkforceAccess: protectedProcedure
      .input(acceptOwnWorkforceAccessInputSchema)
      .mutation(async ({ ctx, input }) => {
        const attestation = await attestSupabaseMfa(ctx.supabaseAccessToken);
        if (!attestation || attestation.subjectId !== ctx.supabaseSubjectId || attestation.assuranceLevel !== "aal2" || attestation.method !== "totp" || !attestation.verifiedRecoveryChannel) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ADMIN_COMMAND_PRECONDITIONS_UNMET" });
        }
        return acceptOwnWorkforceAccess(ctx.supabaseSubjectId ?? null, input);
      }),
    listPlatformWorkforceAccessRequests: platformActiveProcedure
      .query(({ ctx }) => listPlatformWorkforceAccessRequests(ctx.supabaseSubjectId ?? null)),
    preparePlatformWorkforceAccess: platformActiveProcedure
      .input(prepareWorkforceAccessInputSchema)
      .mutation(async ({ ctx, input }) => {
        const attestation = await attestSupabaseMfa(ctx.supabaseAccessToken);
        if (!attestation || attestation.subjectId !== ctx.supabaseSubjectId || attestation.assuranceLevel !== "aal2" || attestation.method !== "totp" || !attestation.verifiedRecoveryChannel) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ADMIN_COMMAND_PRECONDITIONS_UNMET" });
        }
        return preparePlatformWorkforceAccess(ctx.supabaseSubjectId ?? null, input);
      }),
    listOrganizationWorkforceAccessRequests: protectedProcedure
      .query(({ ctx }) => listOrganizationWorkforceAccessRequests(ctx.supabaseSubjectId ?? null)),
    prepareOrganizationWorkforceAccess: protectedProcedure
      .input(prepareWorkforceAccessInputSchema)
      .mutation(async ({ ctx, input }) => {
        const attestation = await attestSupabaseMfa(ctx.supabaseAccessToken);
        if (!attestation || attestation.subjectId !== ctx.supabaseSubjectId || attestation.assuranceLevel !== "aal2" || attestation.method !== "totp" || !attestation.verifiedRecoveryChannel) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ADMIN_COMMAND_PRECONDITIONS_UNMET" });
        }
        return prepareOrganizationWorkforceAccess(ctx.supabaseSubjectId ?? null, input);
      }),
  }),

  organizationContext: router({
    listAuthorizedForModule: protectedProcedure
      .input(authorizedOrganizationContextInputSchema)
      .query(({ ctx, input }) => listAuthorizedOrganizationContexts(ctx.supabaseSubjectId ?? undefined, input)),
  }),

  clientImport: router({
    commit: protectedProcedure
      .input(clientImportCommitInputSchema)
      .mutation(async ({ ctx, input }) => {
        const attestation = await attestSupabaseMfa(ctx.supabaseAccessToken);
        if (!attestation || attestation.subjectId !== ctx.supabaseSubjectId || attestation.assuranceLevel !== "aal2" || attestation.method !== "totp") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "CLIENT_IMPORT_PRECONDITIONS_UNMET" });
        }
        return commitClientImport(ctx.supabaseSubjectId ?? undefined, input);
      }),
  }),

  domainFoundation: router({
    listDraftParties: protectedProcedure
      .input(domainContextSchema)
      .query(({ ctx, input }) => listDraftParties(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftPartyRoles: protectedProcedure
      .input(domainContextSchema)
      .query(({ ctx, input }) => listDraftPartyRoles(ctx.supabaseSubjectId ?? undefined, input)),
    createDraftParty: protectedProcedure
      .input(draftPartyInputSchema)
      .mutation(({ ctx, input }) => createDraftParty(ctx.supabaseSubjectId ?? undefined, input)),
    assignDraftPartyRole: protectedProcedure
      .input(draftPartyRoleInputSchema)
      .mutation(({ ctx, input }) => assignDraftPartyRole(ctx.supabaseSubjectId ?? undefined, input)),
  }),

  assetFoundation: router({
    listDraftUrbanAssets: protectedProcedure
      .input(domainContextSchema)
      .query(({ ctx, input }) => listDraftUrbanAssets(ctx.supabaseSubjectId ?? undefined, input)),
    createDraftUrbanAsset: protectedProcedure
      .input(draftUrbanAssetInputSchema)
      .mutation(({ ctx, input }) => createDraftUrbanAsset(ctx.supabaseSubjectId ?? undefined, input)),
    attachDraftAssetParty: protectedProcedure
      .input(draftAssetPartyRelationInputSchema)
      .mutation(({ ctx, input }) => attachDraftAssetParty(ctx.supabaseSubjectId ?? undefined, input)),
    setDraftAssetModuleState: protectedProcedure
      .input(draftAssetModuleStateInputSchema)
      .mutation(({ ctx, input }) => setDraftAssetModuleState(ctx.supabaseSubjectId ?? undefined, input)),
  }),

  urbanPipeline: router({
    listDraftLeads: protectedProcedure
      .input(urbanSalesContextSchema)
      .query(({ ctx, input }) => listDraftUrbanLeads(ctx.supabaseSubjectId ?? undefined, input)),
    createDraftLead: protectedProcedure
      .input(draftUrbanLeadInputSchema)
      .mutation(({ ctx, input }) => createDraftUrbanLead(ctx.supabaseSubjectId ?? undefined, input)),
    transitionDraftLead: protectedProcedure
      .input(urbanLeadStageInputSchema)
      .mutation(({ ctx, input }) => transitionDraftUrbanLead(ctx.supabaseSubjectId ?? undefined, input)),
    createDraftAgenda: protectedProcedure
      .input(draftUrbanAgendaInputSchema)
      .mutation(({ ctx, input }) => createDraftUrbanAgenda(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftAgendas: protectedProcedure
      .input(urbanSalesContextSchema)
      .query(({ ctx, input }) => listDraftUrbanAgendas(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftLeadAssetLinks: protectedProcedure
      .input(urbanSalesContextSchema)
      .query(({ ctx, input }) => listDraftUrbanLeadAssetLinks(ctx.supabaseSubjectId ?? undefined, input)),
    linkDraftLeadAsset: protectedProcedure
      .input(urbanLeadAssetLinkInputSchema)
      .mutation(({ ctx, input }) => linkDraftUrbanLeadAsset(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftLeadSearchProfiles: protectedProcedure
      .input(urbanSalesContextSchema)
      .query(({ ctx, input }) => listDraftUrbanLeadSearchProfiles(ctx.supabaseSubjectId ?? undefined, input)),
    upsertDraftLeadSearchProfile: protectedProcedure
      .input(draftUrbanLeadSearchProfileInputSchema)
      .mutation(({ ctx, input }) => upsertDraftUrbanLeadSearchProfile(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftAgendaClassifications: protectedProcedure
      .input(urbanSalesContextSchema)
      .query(({ ctx, input }) => listDraftUrbanAgendaClassifications(ctx.supabaseSubjectId ?? undefined, input)),
    upsertDraftAgendaClassification: protectedProcedure
      .input(draftUrbanAgendaClassificationInputSchema)
      .mutation(({ ctx, input }) => upsertDraftUrbanAgendaClassification(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftDevelopments: protectedProcedure
      .input(urbanSalesContextSchema)
      .query(({ ctx, input }) => listDraftUrbanDevelopments(ctx.supabaseSubjectId ?? undefined, input)),
    createDraftDevelopment: protectedProcedure
      .input(draftUrbanDevelopmentInputSchema)
      .mutation(({ ctx, input }) => createDraftUrbanDevelopment(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftDevelopers: protectedProcedure.input(urbanSalesContextSchema).query(({ ctx, input }) => listDraftUrbanDevelopers(ctx.supabaseSubjectId ?? undefined, input)),
    registerDraftDeveloper: protectedProcedure.input(draftUrbanDeveloperInputSchema).mutation(({ ctx, input }) => registerDraftUrbanDeveloper(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftDevelopmentDeveloperLinks: protectedProcedure.input(urbanSalesContextSchema).query(({ ctx, input }) => listDraftUrbanDevelopmentDeveloperLinks(ctx.supabaseSubjectId ?? undefined, input)),
    linkDraftDevelopmentDeveloper: protectedProcedure.input(draftUrbanDevelopmentDeveloperLinkInputSchema).mutation(({ ctx, input }) => linkDraftUrbanDevelopmentDeveloper(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftDevelopmentStructures: protectedProcedure.input(urbanSalesContextSchema).query(({ ctx, input }) => listDraftUrbanDevelopmentStructures(ctx.supabaseSubjectId ?? undefined, input)),
    createDraftDevelopmentStructure: protectedProcedure.input(draftUrbanDevelopmentStructureInputSchema).mutation(({ ctx, input }) => createDraftUrbanDevelopmentStructure(ctx.supabaseSubjectId ?? undefined, input)),
  }),

  rentalPipeline: router({
    listDraftIntakes: protectedProcedure
      .input(rentalOperatingContextSchema)
      .query(({ ctx, input }) => listDraftRentalIntakes(ctx.supabaseSubjectId ?? undefined, input)),
    createDraftIntake: protectedProcedure
      .input(draftRentalIntakeInputSchema)
      .mutation(({ ctx, input }) => createDraftRentalIntake(ctx.supabaseSubjectId ?? undefined, input)),
    transitionDraftIntake: protectedProcedure
      .input(rentalIntakeStageInputSchema)
      .mutation(({ ctx, input }) => transitionDraftRentalIntake(ctx.supabaseSubjectId ?? undefined, input)),
    createDraftAgenda: protectedProcedure
      .input(draftRentalAgendaInputSchema)
      .mutation(({ ctx, input }) => createDraftRentalAgenda(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftAgendas: protectedProcedure
      .input(rentalOperatingContextSchema)
      .query(({ ctx, input }) => listDraftRentalAgendas(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftManagementAssetLinks: protectedProcedure
      .input(rentalOperatingContextSchema)
      .query(({ ctx, input }) => listDraftRentalManagementAssetLinks(ctx.supabaseSubjectId ?? undefined, input)),
    linkDraftManagementAsset: protectedProcedure
      .input(rentalManagementAssetLinkInputSchema)
      .mutation(({ ctx, input }) => linkDraftRentalManagementAsset(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftTenantSearchProfiles: protectedProcedure
      .input(rentalOperatingContextSchema)
      .query(({ ctx, input }) => listDraftRentalTenantSearchProfiles(ctx.supabaseSubjectId ?? undefined, input)),
    upsertDraftTenantSearchProfile: protectedProcedure
      .input(draftRentalTenantSearchProfileInputSchema)
      .mutation(({ ctx, input }) => upsertDraftRentalTenantSearchProfile(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftManagementDeclaredScopes: protectedProcedure
      .input(rentalOperatingContextSchema)
      .query(({ ctx, input }) => listDraftRentalManagementDeclaredScopes(ctx.supabaseSubjectId ?? undefined, input)),
    upsertDraftManagementDeclaredScope: protectedProcedure
      .input(draftRentalManagementScopeInputSchema)
      .mutation(({ ctx, input }) => upsertDraftRentalManagementDeclaredScope(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftAgendaClassifications: protectedProcedure
      .input(rentalOperatingContextSchema)
      .query(({ ctx, input }) => listDraftRentalAgendaClassifications(ctx.supabaseSubjectId ?? undefined, input)),
    upsertDraftAgendaClassification: protectedProcedure
      .input(draftRentalAgendaClassificationInputSchema)
      .mutation(({ ctx, input }) => upsertDraftRentalAgendaClassification(ctx.supabaseSubjectId ?? undefined, input)),
  }),

  subdivisionFoundation: router({
    listDraftDevelopments: protectedProcedure
      .input(subdivisionContextSchema)
      .query(({ ctx, input }) => listDraftSubdivisionDevelopments(ctx.supabaseSubjectId ?? undefined, input)),
    createDraftDevelopment: protectedProcedure
      .input(draftSubdivisionDevelopmentInputSchema)
      .mutation(async ({ ctx, input }) => {
        await requireRecentTotpMfa(ctx);
        return createDraftSubdivisionDevelopment(ctx.supabaseSubjectId ?? undefined, input);
      }),
    listDevelopmentStudio: protectedProcedure
      .input(subdivisionContextSchema)
      .query(({ ctx, input }) => listSubdivisionDevelopmentStudio(ctx.supabaseSubjectId ?? undefined, input)),
    createDevelopmentStudio: protectedProcedure
      .input(createSubdivisionDevelopmentStudioInputSchema)
      .mutation(async ({ ctx, input }) => {
        await requireRecentTotpMfa(ctx);
        return createSubdivisionDevelopmentStudio(ctx.supabaseSubjectId ?? undefined, input);
      }),
    updateDevelopmentStudio: protectedProcedure
      .input(updateSubdivisionDevelopmentStudioInputSchema)
      .mutation(async ({ ctx, input }) => {
        await requireRecentTotpMfa(ctx);
        return updateSubdivisionDevelopmentStudio(ctx.supabaseSubjectId ?? undefined, input);
      }),
    archiveDevelopmentStudio: protectedProcedure
      .input(archiveSubdivisionDevelopmentStudioInputSchema)
      .mutation(async ({ ctx, input }) => {
        await requireRecentTotpMfa(ctx);
        return archiveSubdivisionDevelopmentStudio(ctx.supabaseSubjectId ?? undefined, input);
      }),
    listDevelopmentAttachments: protectedProcedure
      .input(subdivisionContextSchema.extend({ developmentId: z.string().uuid() }))
      .query(({ ctx, input }) => listSubdivisionDevelopmentAttachments(ctx.supabaseSubjectId ?? undefined, input, input.developmentId)),
    createDevelopmentAttachmentIntent: protectedProcedure
      .input(createSubdivisionDevelopmentAttachmentIntentInputSchema)
      .mutation(async ({ ctx, input }) => {
        await requireRecentTotpMfa(ctx);
        return createSubdivisionDevelopmentAttachmentIntent(ctx.supabaseSubjectId ?? undefined, input);
      }),
    archiveDevelopmentAttachment: protectedProcedure
      .input(archiveSubdivisionDevelopmentAttachmentInputSchema)
      .mutation(async ({ ctx, input }) => {
        await requireRecentTotpMfa(ctx);
        return archiveSubdivisionDevelopmentAttachment(ctx.supabaseSubjectId ?? undefined, input);
      }),
    listDraftStructure: protectedProcedure
      .input(subdivisionContextSchema.extend({ developmentId: z.string().uuid() }))
      .query(({ ctx, input }) => listDraftSubdivisionStructure(ctx.supabaseSubjectId ?? undefined, input, input.developmentId)),
    applyDraftStructure: protectedProcedure
      .input(applySubdivisionDraftStructureInputSchema)
      .mutation(async ({ ctx, input }) => {
        await requireRecentTotpMfa(ctx);
        return applyDraftSubdivisionStructure(ctx.supabaseSubjectId ?? undefined, input);
      }),
    archiveDraftBlock: protectedProcedure
      .input(archiveSubdivisionDraftBlockInputSchema)
      .mutation(async ({ ctx, input }) => {
        await requireRecentTotpMfa(ctx);
        return archiveDraftSubdivisionBlock(ctx.supabaseSubjectId ?? undefined, input);
      }),
    listArchivedDraftStructure: protectedProcedure
      .input(subdivisionContextSchema.extend({ developmentId: z.string().uuid() }))
      .query(({ ctx, input }) => listArchivedDraftSubdivisionStructure(ctx.supabaseSubjectId ?? undefined, input, input.developmentId)),
    restoreDraftBlock: protectedProcedure
      .input(restoreSubdivisionDraftBlockInputSchema)
      .mutation(async ({ ctx, input }) => {
        await requireRecentTotpMfa(ctx);
        return restoreDraftSubdivisionBlock(ctx.supabaseSubjectId ?? undefined, input);
      }),
    listDraftPhysicalStructure: protectedProcedure
      .input(subdivisionContextSchema.extend({ developmentId: z.string().uuid() }))
      .query(({ ctx, input }) => listDraftSubdivisionPhysicalStructure(ctx.supabaseSubjectId ?? undefined, input, input.developmentId)),
    applyDraftPhysicalStructure: protectedProcedure
      .input(applySubdivisionPhysicalStructureInputSchema)
      .mutation(async ({ ctx, input }) => {
        await requireRecentTotpMfa(ctx);
        return applySubdivisionPhysicalStructure(ctx.supabaseSubjectId ?? undefined, input);
      }),
    listDraftDevelopmentRequirements: protectedProcedure
      .input(subdivisionContextSchema.extend({ developmentId: z.string().uuid() }))
      .query(({ ctx, input }) => listDraftSubdivisionDevelopmentRequirements(ctx.supabaseSubjectId ?? undefined, input, input.developmentId)),
    upsertDraftDevelopmentRequirement: protectedProcedure
      .input(upsertSubdivisionDevelopmentRequirementInputSchema)
      .mutation(async ({ ctx, input }) => {
        await requireRecentTotpMfa(ctx);
        return upsertDraftSubdivisionDevelopmentRequirement(ctx.supabaseSubjectId ?? undefined, input);
      }),
    listDraftDevelopmentPreparationProfiles: protectedProcedure
      .input(subdivisionContextSchema)
      .query(({ ctx, input }) => listDraftSubdivisionDevelopmentPreparationProfiles(ctx.supabaseSubjectId ?? undefined, input)),
    upsertDraftDevelopmentPreparationProfile: protectedProcedure
      .input(draftSubdivisionDevelopmentPreparationProfileInputSchema)
      .mutation(({ ctx, input }) => upsertDraftSubdivisionDevelopmentPreparationProfile(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftBlocks: protectedProcedure
      .input(subdivisionContextSchema.extend({ developmentId: z.string().uuid() }))
      .query(({ ctx, input }) => listDraftSubdivisionBlocks(ctx.supabaseSubjectId ?? undefined, input, input.developmentId)),
    createDraftBlock: protectedProcedure
      .input(draftSubdivisionBlockInputSchema)
      .mutation(({ ctx, input }) => createDraftSubdivisionBlock(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftLots: protectedProcedure
      .input(subdivisionContextSchema.extend({ blockId: z.string().uuid() }))
      .query(({ ctx, input }) => listDraftSubdivisionLots(ctx.supabaseSubjectId ?? undefined, input, input.blockId)),
    createDraftLot: protectedProcedure
      .input(draftSubdivisionLotInputSchema)
      .mutation(({ ctx, input }) => createDraftSubdivisionLot(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftLotInventoryStates: protectedProcedure.input(subdivisionContextSchema).query(({ ctx, input }) => listDraftLotInventoryStates(ctx.supabaseSubjectId ?? undefined, input)),
    upsertDraftLotInventoryState: protectedProcedure.input(draftSubdivisionLotInventoryStateInputSchema).mutation(({ ctx, input }) => upsertDraftLotInventoryState(ctx.supabaseSubjectId ?? undefined, input)),
    transitionDraftLotInventoryState: protectedProcedure.input(subdivisionContextSchema.extend({ inventoryStateId: z.string().uuid(), toPhase: z.enum(["reference_confirmed", "structure_review", "review_required"]), correlationId: z.string().uuid() })).mutation(({ ctx, input }) => transitionDraftLotInventoryState(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftLotInventoryEvents: protectedProcedure.input(subdivisionContextSchema).query(({ ctx, input }) => listDraftLotInventoryEvents(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftInternalPartyRoles: protectedProcedure.input(subdivisionContextSchema).query(({ ctx, input }) => listDraftSubdivisionInternalPartyRoles(ctx.supabaseSubjectId ?? undefined, input)),
    linkDraftInternalPartyRole: protectedProcedure.input(subdivisionContextSchema.extend({ developmentId: z.string().uuid(), partyRoleId: z.string().uuid(), correlationId: z.string().uuid() })).mutation(({ ctx, input }) => linkDraftSubdivisionInternalPartyRole(ctx.supabaseSubjectId ?? undefined, input)),
    listDraftBuyerClients: protectedProcedure.input(subdivisionContextSchema).query(({ ctx, input }) => listDraftSubdivisionBuyerClients(ctx.supabaseSubjectId ?? undefined, input)),
    createDraftBuyerClient: protectedProcedure.input(draftSubdivisionBuyerClientInputSchema).mutation(({ ctx, input }) => createDraftSubdivisionBuyerClient(ctx.supabaseSubjectId ?? undefined, input)),
    listBuyerAttachmentIntents: protectedProcedure.input(subdivisionContextSchema).query(({ ctx, input }) => listBuyerAttachmentIntents(ctx.supabaseSubjectId ?? undefined, input)),
    createBuyerAttachmentIntent: protectedProcedure.input(draftSubdivisionBuyerAttachmentIntentInputSchema).mutation(({ ctx, input }) => createBuyerAttachmentIntent(ctx.supabaseSubjectId ?? undefined, input)),
    listSaleDrafts: protectedProcedure.input(subdivisionContextSchema).query(({ ctx, input }) => listSubdivisionSaleDrafts(ctx.supabaseSubjectId ?? undefined, input)),
    listSaleDraftAttachmentCoverage: protectedProcedure.input(subdivisionContextSchema).query(({ ctx, input }) => listSubdivisionSaleDraftAttachmentCoverage(ctx.supabaseSubjectId ?? undefined, input)),
    listSaleDraftWorkStates: protectedProcedure.input(subdivisionContextSchema).query(({ ctx, input }) => listSubdivisionSaleDraftWorkStates(ctx.supabaseSubjectId ?? undefined, input)),
    listSaleDraftCoBuyers: protectedProcedure.input(subdivisionContextSchema).query(({ ctx, input }) => listSubdivisionSaleDraftCoBuyers(ctx.supabaseSubjectId ?? undefined, input)),
    listEconomicRuleSets: protectedProcedure.input(subdivisionContextSchema).query(({ ctx, input }) => listSubdivisionEconomicRuleSets(ctx.supabaseSubjectId ?? undefined, input)),
    listEconomicRuleComponents: protectedProcedure.input(subdivisionContextSchema).query(({ ctx, input }) => listSubdivisionEconomicRuleComponents(ctx.supabaseSubjectId ?? undefined, input)),
    listEconomicRuleComponentRoleReferences: protectedProcedure.input(subdivisionContextSchema).query(({ ctx, input }) => listSubdivisionEconomicRuleComponentRoleReferences(ctx.supabaseSubjectId ?? undefined, input)),
    listPriceBasePolicies: protectedProcedure.input(listSubdivisionPriceBasePoliciesInputSchema).query(({ ctx, input }) => listSubdivisionPriceBasePolicies(ctx.supabaseSubjectId ?? undefined, input)),
    previewPriceBaseSource: protectedProcedure.input(previewSubdivisionPriceBaseSourceInputSchema).mutation(async ({ ctx, input }) => {
      await requireRecentTotpMfa(ctx);
      return previewSubdivisionPriceBaseSource(ctx.supabaseSubjectId ?? undefined, input);
    }),
    preparePriceBasePolicy: protectedProcedure.input(prepareSubdivisionPriceBasePolicyInputSchema).mutation(async ({ ctx, input }) => {
      await requireRecentTotpMfa(ctx);
      return prepareSubdivisionPriceBasePolicy(ctx.supabaseSubjectId ?? undefined, input);
    }),
    submitPriceBasePolicy: protectedProcedure.input(submitSubdivisionPriceBasePolicyInputSchema).mutation(async ({ ctx, input }) => {
      await requireRecentTotpMfa(ctx);
      return submitSubdivisionPriceBasePolicy(ctx.supabaseSubjectId ?? undefined, input);
    }),
    approvePriceBasePolicy: protectedProcedure.input(approveSubdivisionPriceBasePolicyInputSchema).mutation(async ({ ctx, input }) => {
      await requireRecentTotpMfa(ctx);
      return approveSubdivisionPriceBasePolicy(ctx.supabaseSubjectId ?? undefined, input);
    }),
    createSaleDraft: protectedProcedure.input(draftSubdivisionSaleDraftInputSchema).mutation(({ ctx, input }) => createSubdivisionSaleDraft(ctx.supabaseSubjectId ?? undefined, input)),
    createEconomicRuleSet: protectedProcedure.input(draftSubdivisionEconomicRuleSetInputSchema).mutation(({ ctx, input }) => createSubdivisionEconomicRuleSet(ctx.supabaseSubjectId ?? undefined, input)),
    createEconomicRuleComponent: protectedProcedure.input(draftSubdivisionEconomicRuleComponentInputSchema).mutation(({ ctx, input }) => createSubdivisionEconomicRuleComponent(ctx.supabaseSubjectId ?? undefined, input)),
    addEconomicRuleComponentRoleReference: protectedProcedure.input(draftSubdivisionEconomicRuleComponentRoleReferenceInputSchema).mutation(({ ctx, input }) => addSubdivisionEconomicRuleComponentRoleReference(ctx.supabaseSubjectId ?? undefined, input)),
    addSaleDraftCoBuyer: protectedProcedure.input(draftSubdivisionSaleDraftCoBuyerInputSchema).mutation(({ ctx, input }) => addSubdivisionSaleDraftCoBuyer(ctx.supabaseSubjectId ?? undefined, input)),
    upsertSaleDraftWorkState: protectedProcedure.input(draftSubdivisionSaleDraftWorkStateInputSchema).mutation(({ ctx, input }) => upsertSubdivisionSaleDraftWorkState(ctx.supabaseSubjectId ?? undefined, input)),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
