import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { resolveSupabaseSubjectId } from "../supabaseIdentity";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  supabaseSubjectId: string | null;
  supabaseAccessToken?: string;
};

export async function resolveRequestIdentity(req: CreateExpressContextOptions["req"]) {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  const supabaseHeader = req.headers["x-supabase-access-token"];
  const supabaseSubjectId = await resolveSupabaseSubjectId(
    typeof supabaseHeader === "string" ? supabaseHeader : undefined,
  );

  return {
    user,
    supabaseSubjectId,
    supabaseAccessToken: typeof supabaseHeader === "string" ? supabaseHeader : undefined,
  };
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  return {
    req: opts.req,
    res: opts.res,
    ...(await resolveRequestIdentity(opts.req)),
  };
}
