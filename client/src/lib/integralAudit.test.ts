import { describe, expect, it } from "vitest";
import { integralAuditLenses } from "./integralAudit";

describe("integralAuditLenses", () => {
  it("mantém veredito, gates, limites e sequência de correção auditáveis", () => {
    expect(integralAuditLenses.map((lens) => lens.key)).toEqual(["verdict", "p0", "boundary", "sequence"]);
    expect(integralAuditLenses.every((lens) => lens.points.length === 3)).toBe(true);
    expect(integralAuditLenses.every((lens) => lens.sources.length === 2)).toBe(true);
    expect(integralAuditLenses.every((lens) => lens.blocked.length > 50)).toBe(true);
  });
});
