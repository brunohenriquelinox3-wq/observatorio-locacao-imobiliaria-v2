import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("roteamento do estúdio de loteamentos", () => {
  it("mantém criação, edição, arquivamento e anexos atrás de MFA TOTP e procedure protegida", () => {
    expect(source).toContain("requireRecentTotpMfa");
    expect(source).toContain('message: "SUBDIVISION_COMMAND_PRECONDITIONS_UNMET"');
    expect(source).toContain("createDevelopmentStudio: protectedProcedure");
    expect(source).toContain("updateDevelopmentStudio: protectedProcedure");
    expect(source).toContain("archiveDevelopmentStudio: protectedProcedure");
    expect(source).toContain("createDevelopmentAttachmentIntent: protectedProcedure");
    expect(source).toContain("archiveDevelopmentAttachment: protectedProcedure");
  });
});
