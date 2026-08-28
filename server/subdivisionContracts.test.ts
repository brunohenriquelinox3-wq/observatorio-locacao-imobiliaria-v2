import { describe, expect, it } from "vitest";
import { draftSubdivisionBlockInputSchema, draftSubdivisionDevelopmentInputSchema, subdivisionContextSchema } from "../shared/subdivisionContracts";

const organizationId = "550e8400-e29b-41d4-a716-446655440000";
const correlationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const developmentId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";

describe("subdivision foundation contracts", () => {
  it("requires the explicit loteadora module and a valid purpose", () => {
    expect(subdivisionContextSchema.safeParse({ organizationId, module: "loteadora", purposeCode: "CADASTRO_INICIAL" }).success).toBe(true);
    expect(subdivisionContextSchema.safeParse({ organizationId, module: "locacao", purposeCode: "CADASTRO_INICIAL" }).success).toBe(false);
  });

  it("accepts only the minimal coded draft development", () => {
    expect(draftSubdivisionDevelopmentInputSchema.safeParse({ organizationId, module: "loteadora", purposeCode: "CADASTRO_INICIAL", correlationId, internalReference: "LT_NORTE_01", workingPhase: "structuring" }).success).toBe(true);
    expect(draftSubdivisionDevelopmentInputSchema.safeParse({ organizationId, module: "loteadora", purposeCode: "CADASTRO_INICIAL", correlationId, internalReference: "Nome livre", workingPhase: "structuring" }).success).toBe(false);
  });

  it("accepts a numbered matrix block only in an explicit subdivision context", () => {
    expect(draftSubdivisionBlockInputSchema.safeParse({ organizationId, module: "loteadora", purposeCode: "CADASTRO_INICIAL", correlationId, developmentId, blockNumber: 12 }).success).toBe(true);
    expect(draftSubdivisionBlockInputSchema.safeParse({ organizationId, module: "loteadora", purposeCode: "CADASTRO_INICIAL", correlationId, developmentId, blockNumber: 0 }).success).toBe(false);
    expect(draftSubdivisionBlockInputSchema.safeParse({ organizationId, module: "vendas_urbanas", purposeCode: "CADASTRO_INICIAL", correlationId, developmentId, blockNumber: 12 }).success).toBe(false);
  });
});
