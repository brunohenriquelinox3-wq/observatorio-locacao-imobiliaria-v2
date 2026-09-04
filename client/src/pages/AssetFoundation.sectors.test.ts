import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const page = readFileSync(resolve(import.meta.dirname, "AssetFoundation.tsx"), "utf8");
const styles = readFileSync(resolve(import.meta.dirname, "../asset-foundation.css"), "utf8");

describe("Ativos Urbanos setorial", () => {
  it("separa Inventário, Vínculos de Party e Prontidão por setor ativo", () => {
    expect(page).toContain('type ActiveSector = "inventory" | "relations" | "readiness"');
    expect(page).toContain('activeSector === "inventory"');
    expect(page).toContain('activeSector === "relations"');
    expect(page).toContain('activeSector === "readiness"');
  });
  it("usa a navegação operacional sem reinstalar a tipografia editorial", () => {
    expect(styles).toContain(".asset-foundation-sector-nav");
    expect(styles).not.toContain('"Fraunces"');
  });
});
