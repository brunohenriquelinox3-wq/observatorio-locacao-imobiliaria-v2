import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const page = readFileSync(resolve(import.meta.dirname, "DomainFoundation.tsx"), "utf8");
const styles = readFileSync(resolve(import.meta.dirname, "../domain-foundation.css"), "utf8");

describe("Núcleo de Cadastros setorial", () => {
  it("separa Parties, Papéis Temporais e Atributos Protegidos por setor ativo", () => {
    expect(page).toContain('type ActiveSector = "parties" | "roles" | "protected"');
    expect(page).toContain('activeSector === "parties"');
    expect(page).toContain('activeSector === "roles"');
    expect(page).toContain('activeSector === "protected"');
  });
  it("mantém o limite explícito para atributos protegidos e evita a tipografia editorial", () => {
    expect(page).toContain("Dados sensíveis permanecem bloqueados");
    expect(styles).toContain(".domain-foundation-sector-nav");
    expect(styles).not.toContain('"Fraunces"');
  });
});
