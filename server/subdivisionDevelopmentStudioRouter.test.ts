import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("roteamento do estúdio de loteamentos", () => {
  it("mantém criação, edição, arquivamento e anexos atrás de procedure protegida sem MFA repetido", () => {
    expect(source).not.toContain("requireRecentTotpMfa");
    expect(source).not.toContain("requireVerifiedAal2Session");
    expect(source).toContain("createDevelopmentStudio: protectedProcedure");
    expect(source).toContain("updateDevelopmentStudio: protectedProcedure");
    expect(source).toContain("archiveDevelopmentStudio: protectedProcedure");
    expect(source).toContain("createDevelopmentAttachmentIntent: protectedProcedure");
    expect(source).toContain("archiveDevelopmentAttachment: protectedProcedure");
    expect(source).toContain("applyDraftStructure: protectedProcedure");
    expect(source).toContain("archiveDraftBlock: protectedProcedure");
  });
});
