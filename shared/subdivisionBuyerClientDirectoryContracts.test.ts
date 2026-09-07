import { describe, expect, it } from "vitest";
import { subdivisionBuyerClientDirectoryListInputSchema, subdivisionBuyerClientTimelineInputSchema } from "./subdivisionBuyerClientProfileContracts";

const context = { organizationId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8", module: "loteadora", purposeCode: "CADASTRO_INICIAL" };

describe("subdivision buyer client directory contracts", () => {
  it("requires bounded contextual pagination and a meaningful search term", () => {
    expect(subdivisionBuyerClientDirectoryListInputSchema.safeParse({ ...context, searchTerm: "al", pageSize: 18, pageOffset: 0 }).success).toBe(true);
    expect(subdivisionBuyerClientDirectoryListInputSchema.safeParse({ ...context, searchTerm: "a", pageSize: 18, pageOffset: 0 }).success).toBe(false);
    expect(subdivisionBuyerClientDirectoryListInputSchema.safeParse({ ...context, searchTerm: null, pageSize: 26, pageOffset: 0 }).success).toBe(false);
  });

  it("does not accept commercial, financial, contractual, or arbitrary directory fields", () => {
    expect(subdivisionBuyerClientDirectoryListInputSchema.safeParse({ ...context, searchTerm: null, pageSize: 18, pageOffset: 0, lotId: "7ba7b810-9dad-11d1-80b4-00c04fd430c8" }).success).toBe(false);
    expect(subdivisionBuyerClientDirectoryListInputSchema.safeParse({ ...context, searchTerm: null, pageSize: 18, pageOffset: 0, paymentState: "paid" }).success).toBe(false);
  });

  it("requires a bounded contextual identity for the redacted timeline", () => {
    expect(subdivisionBuyerClientTimelineInputSchema.safeParse({ ...context, buyerClientId: "7ba7b810-9dad-11d1-80b4-00c04fd430c8", limit: 20 }).success).toBe(true);
    expect(subdivisionBuyerClientTimelineInputSchema.safeParse({ ...context, buyerClientId: "invalid", limit: 20 }).success).toBe(false);
    expect(subdivisionBuyerClientTimelineInputSchema.safeParse({ ...context, buyerClientId: "7ba7b810-9dad-11d1-80b4-00c04fd430c8", limit: 51 }).success).toBe(false);
  });
});
