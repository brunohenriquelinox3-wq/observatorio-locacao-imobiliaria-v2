import { describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const correlationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

vi.mock("./foundationReadiness", () => ({
  getFoundationReadiness: vi.fn(),
}));

vi.mock("./adminCommands", () => ({
  bootstrapCurrentSubject: vi.fn(async (currentSubjectId: string | null) => {
    if (!currentSubjectId) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ADMIN_COMMAND_PRECONDITIONS_UNMET" });
    }
    return { principalId: currentSubjectId, state: "pending_activation" };
  }),
  delegateMembership: vi.fn(),
  activateSelfOrganizationAdmin: vi.fn(),
  getAdministrativeSubjectStatus: vi.fn(async () => ({
    identityState: "active",
    mfaVerified: true,
    bootstrapAction: "unavailable",
    commandMode: "ready_for_controlled_commands",
    platformRole: "platform_super_admin",
  })),
  listSelfAdministrationOrganizationTargets: vi.fn(),
  provisionOrganization: vi.fn(),
  revokeMembership: vi.fn(),
  suspendMembership: vi.fn(),
}));

vi.mock("./supabaseIdentity", () => ({
  attestSupabaseMfa: vi.fn(async () => ({
    subjectId,
    assuranceLevel: "aal2",
    method: "totp",
    verifiedAt: new Date().toISOString(),
    verifiedRecoveryChannel: false,
  })),
}));

vi.mock("./_core/env", () => ({ ENV: { ownerOpenId: "test-owner" } }));

import { appRouter } from "./routers";

function createContext(role: "admin" | "user", supabaseSubjectId: string | null, openId = "test-owner"): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: 1,
      openId,
      name: "Test User",
      email: null,
      loginMethod: "test",
      role,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
    supabaseSubjectId,
  };
}

describe("administration command router", () => {
  it("denies bootstrap to a non-owner app session", async () => {
    await expect(
      appRouter.createCaller(createContext("user", subjectId, "other-owner")).administration.bootstrap({ correlationId }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("requires a connected Supabase subject before controlled bootstrap", async () => {
    await expect(
      appRouter.createCaller(createContext("admin", null)).administration.bootstrap({ correlationId }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns only pending bootstrap state to the owner with a connected subject and synthetic MFA", async () => {
    await expect(
      appRouter.createCaller(createContext("user", subjectId)).administration.bootstrap({ correlationId }),
    ).resolves.toEqual({ principalId: subjectId, state: "pending_activation" });
  });

  it("requires a verified recovery channel in the server MFA attestation before active self-administration", async () => {
    await expect(
      appRouter.createCaller(createContext("user", subjectId)).administration.activateSelfOrganizationAdmin({
        organizationId: subjectId,
        correlationId,
      }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });
});
