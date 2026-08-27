import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getFoundationReadiness } from "./foundationReadiness";
import {
  bootstrapCurrentSubject,
  delegateMembership,
  getAdministrativeSubjectStatus,
  provisionOrganization,
  revokeMembership,
  suspendMembership,
} from "./adminCommands";
import {
  administrativeRequestMetaSchema,
  grantMembershipInputSchema,
  provisionOrganizationInputSchema,
  revokeMembershipInputSchema,
  suspendMembershipInputSchema,
} from "../shared/adminCommandContracts";

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

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
