import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getFoundationReadiness } from "./foundationReadiness";
import {
  bootstrapCurrentSubject,
  activatePendingPlatformPrincipal,
  delegateMembership,
  getAdministrativeSubjectStatus,
  provisionOrganization,
  revokeMembership,
  suspendMembership,
} from "./adminCommands";
import { attestSupabaseMfa } from "./supabaseIdentity";
import {
  administrativeRequestMetaSchema,
  grantMembershipInputSchema,
  provisionOrganizationInputSchema,
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
  listDraftUrbanLeads,
  transitionDraftUrbanLead,
} from "./urbanPipeline";
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
  draftSubdivisionLotInputSchema,
  draftSubdivisionLotInventoryStateInputSchema,
  draftSubdivisionSaleDraftInputSchema,
  draftSubdivisionSaleDraftCoBuyerInputSchema,
  draftSubdivisionEconomicRuleSetInputSchema,
  draftSubdivisionSaleDraftWorkStateInputSchema,
  subdivisionContextSchema,
} from "../shared/subdivisionContracts";
import {
  createDraftSubdivisionDevelopment,
  listDraftSubdivisionDevelopments,
} from "./subdivisionDevelopment";
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
    readiness: adminProcedure.query(() => getFoundationReadiness()),
    identity: protectedProcedure.query(({ ctx }) => ({
      provider: "supabase",
      state: ctx.supabaseSubjectId ? "connected" : "not_connected",
      commandMode: "blocked" as const,
    })),
    commandStatus: adminProcedure.query(({ ctx }) => getAdministrativeSubjectStatus(ctx.supabaseSubjectId)),
  }),

  administration: router({
    bootstrap: adminProcedure
      .input(administrativeRequestMetaSchema)
      .mutation(({ ctx, input }) => bootstrapCurrentSubject(ctx.supabaseSubjectId, input.correlationId)),
    activateBootstrap: adminProcedure
      .input(administrativeRequestMetaSchema)
      .mutation(async ({ ctx, input }) => activatePendingPlatformPrincipal(
        await attestSupabaseMfa(ctx.supabaseAccessToken),
        input.correlationId,
      )),
    provisionOrganization: adminProcedure
      .input(provisionOrganizationInputSchema)
      .mutation(({ ctx, input }) => provisionOrganization(ctx.supabaseSubjectId, input)),
    delegateMembership: adminProcedure
      .input(grantMembershipInputSchema)
      .mutation(({ ctx, input }) => delegateMembership(ctx.supabaseSubjectId, input)),
    suspendMembership: adminProcedure
      .input(suspendMembershipInputSchema)
      .mutation(({ ctx, input }) => suspendMembership(ctx.supabaseSubjectId, input)),
    revokeMembership: adminProcedure
      .input(revokeMembershipInputSchema)
      .mutation(({ ctx, input }) => revokeMembership(ctx.supabaseSubjectId, input)),
  }),

  domainFoundation: router({
    listDraftParties: protectedProcedure
      .input(domainContextSchema)
      .query(({ ctx, input }) => listDraftParties(ctx.supabaseSubjectId ?? undefined, input)),
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
      .mutation(({ ctx, input }) => createDraftSubdivisionDevelopment(ctx.supabaseSubjectId ?? undefined, input)),
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
    createSaleDraft: protectedProcedure.input(draftSubdivisionSaleDraftInputSchema).mutation(({ ctx, input }) => createSubdivisionSaleDraft(ctx.supabaseSubjectId ?? undefined, input)),
    createEconomicRuleSet: protectedProcedure.input(draftSubdivisionEconomicRuleSetInputSchema).mutation(({ ctx, input }) => createSubdivisionEconomicRuleSet(ctx.supabaseSubjectId ?? undefined, input)),
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
