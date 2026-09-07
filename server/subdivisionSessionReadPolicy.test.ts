import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(import.meta.dirname, "routers.ts"), "utf8");

function procedureSlice(name: string) {
  const procedures = [...source.matchAll(/^    ([A-Za-z0-9]+): protectedProcedure/gm)];
  const index = procedures.findIndex((match) => match[1] === name);
  const start = procedures[index]?.index ?? -1;
  const end = procedures[index + 1]?.index ?? source.length;
  return start < 0 ? "" : source.slice(start, end);
}

describe("política de leitura interna vinculada à sessão", () => {
  it("permite consultas internas durante sessão autenticada sem exigir MFA recente", () => {
    expect(procedureSlice("listLotInternalPriceReferences")).toContain("listSubdivisionLotInternalPriceReferences(ctx.supabaseSubjectId ?? undefined, input)");
    expect(procedureSlice("listLotInternalPriceReferences")).not.toContain("requireRecentTotpMfa");
    expect(procedureSlice("listInternalLotInventoryProfiles")).toContain("listSubdivisionLotInternalInventoryProfiles(ctx.supabaseSubjectId ?? undefined, input)");
    expect(procedureSlice("listInternalLotInventoryProfiles")).not.toContain("requireRecentTotpMfa");
  });

  it("mantém MFA recente em preparação e gravação material", () => {
    expect(procedureSlice("upsertInternalLotInventoryProfile")).toContain("await requireRecentTotpMfa(ctx)");
    expect(procedureSlice("createPriceCondition")).toContain("await requireRecentTotpMfa(ctx)");
    expect(procedureSlice("upsertDraftLotOperationalProfile")).toContain("await requireRecentTotpMfa(ctx)");
  });
});
