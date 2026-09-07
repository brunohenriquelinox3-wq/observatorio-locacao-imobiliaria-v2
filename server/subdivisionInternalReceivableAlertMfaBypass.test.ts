import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("controles internos do Financeiro sem MFA por comando", () => {
  it("mantém procedures protegidas e remove apenas o desafio AAL2 dos lembretes", () => {
    const configureBlock = source.slice(source.indexOf("configureInternalReceivableAlerts:"), source.indexOf("getInternalReceivableAlertConfiguration:"));
    const scheduleBlock = source.slice(source.indexOf("manageInternalReceivableAlertSchedule:"), source.indexOf("createSaleCaseDocumentIntent:"));
    expect(configureBlock).toContain("protectedProcedure");
    expect(scheduleBlock).toContain("protectedProcedure");
    expect(configureBlock).not.toContain("requireVerifiedAal2Session");
    expect(scheduleBlock).not.toContain("requireVerifiedAal2Session");
  });
});
