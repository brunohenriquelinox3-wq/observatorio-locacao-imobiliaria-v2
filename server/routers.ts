import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
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

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
