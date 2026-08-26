import { describe, expect, it } from "vitest";
import { executionDisciplineLenses } from "./executionDiscipline";

describe("executionDisciplineLenses", () => {
  it("mantém intenção, decisão, prova e aprendizado como portas rastreáveis", () => {
    expect(executionDisciplineLenses.map((lens) => lens.code)).toEqual(["D-0", "D-1", "D-2", "D-3"]);
    expect(executionDisciplineLenses.every((lens) => lens.promoted.length === 3)).toBe(true);
    expect(executionDisciplineLenses.every((lens) => lens.sources.length === 2)).toBe(true);
    expect(executionDisciplineLenses.every((lens) => lens.blocked.length > 50)).toBe(true);
  });
});
