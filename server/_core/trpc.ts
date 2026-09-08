import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { getAdministrativeSubjectStatus } from "../adminCommands";
import type { TrpcContext } from "./context";
import { ENV } from "./env";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Rotas operacionais do CRM são vinculadas ao sujeito Supabase. Essa identidade
 * pode ser autenticada pelo Google e é revalidada no servidor a cada chamada.
 * A sessão de plataforma continua restrita aos guardas de bootstrap e sistema.
 */
const requireSupabaseIdentity = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.supabaseSubjectId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      supabaseSubjectId: ctx.supabaseSubjectId,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireSupabaseIdentity);

const requireBootstrapOwner = t.middleware(async opts => {
  const { ctx, next } = opts;
  if (!ctx.user || !ctx.supabaseSubjectId || !ENV.ownerOpenId || ctx.user.openId !== ENV.ownerOpenId) {
    throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const bootstrapOwnerProcedure = t.procedure.use(requireBootstrapOwner);

export const platformActiveProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.supabaseSubjectId) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    const status = await getAdministrativeSubjectStatus(ctx.supabaseSubjectId);
    if (status.commandMode !== "ready_for_controlled_commands") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({ ctx: { ...ctx, supabaseSubjectId: ctx.supabaseSubjectId } });
  }),
);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
