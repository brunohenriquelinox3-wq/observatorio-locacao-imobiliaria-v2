import { describe, expect, it } from "vitest";
import {
  bootstrapPlatformPrincipalInputSchema,
  grantMembershipInputSchema,
  provisionOrganizationInputSchema,
} from "../shared/adminCommandContracts";

const id = "550e8400-e29b-41d4-a716-446655440000";
const correlationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

describe("admin command contracts", () => {
  it("accepts a minimal organization command without recipient data", () => {
    expect(
      provisionOrganizationInputSchema.parse({
        name: "Imobiliária Horizonte",
        correlationId,
      }),
    ).toEqual({ name: "Imobiliária Horizonte", correlationId });
  });

  it("rejects identity fields and elevated platform roles in organization delegation", () => {
    expect(() =>
      grantMembershipInputSchema.parse({
        organizationId: id,
        subjectId: id,
        role: "platform_super_admin",
        scopeSelector: { modules: ["vendas_urbanas"] },
        purposeCode: "operacao_cadastro",
        correlationId,
        email: "not-accepted@example.com",
      }),
    ).toThrow();
  });

  it("uses a Supabase subject identifier, never a hardcoded email, for bootstrap", () => {
    expect(
      bootstrapPlatformPrincipalInputSchema.parse({ subjectId: id, correlationId }),
    ).toEqual({ subjectId: id, correlationId });
    expect(() =>
      bootstrapPlatformPrincipalInputSchema.parse({ subjectId: id, correlationId, email: "x@example.com" }),
    ).toThrow();
  });
});
