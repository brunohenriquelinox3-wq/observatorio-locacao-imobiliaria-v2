import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const page = readFileSync(resolve(import.meta.dirname, "PlatformAdmin.tsx"), "utf8");
const styles = readFileSync(resolve(import.meta.dirname, "../platform-admin.css"), "utf8");

describe("Central de Plataforma operacional", () => {
  it("preserva a hierarquia explícita e os comandos governados", () => {
    expect(page).toContain("SUPER ADM ACIMA DO ADM");
    expect(page).toContain("COMANDOS GOVERNADOS · AÇÃO EXPLÍCITA");
    expect(page).toContain("getMfaAttestedCommandState");
  });
  it("remove a tipografia editorial da camada operacional", () => {
    expect(styles).toContain(".platform-admin-hero");
    expect(styles).not.toContain("Fraunces");
    expect(styles).not.toContain("Georgia");
  });
});
