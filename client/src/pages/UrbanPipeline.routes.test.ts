import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("rotas setoriais de Vendas Urbanas", () => {
  it("resolve o alias de Empreendimentos e Construtoras para o setor estrutural correto", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/UrbanPipeline.tsx"), "utf8");

    expect(source).toContain('"/vendas-urbanas/empreendimentos-construtoras": "developments"');
    expect(source).toContain('title: "Empreendimentos e Construtoras"');
  });

  it("resolve o alias de propostas para o setor bloqueado, sem voltar a Clientes e Leads", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/UrbanPipeline.tsx"), "utf8");

    expect(source).toContain('"/vendas-urbanas/propostas-reservas-contratos": "proposals"');
    expect(source).toContain('activeUrbanSector === "proposals" || activeUrbanSector === "finance"');
  });
});
