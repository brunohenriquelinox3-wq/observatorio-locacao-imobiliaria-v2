import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const page = readFileSync(resolve(import.meta.dirname, "OperatorManual.tsx"), "utf8");
const navigation = readFileSync(resolve(import.meta.dirname, "../lib/crmNavigation.ts"), "utf8");
const app = readFileSync(resolve(import.meta.dirname, "../App.tsx"), "utf8");

describe("Manual do Operador", () => {
  it("oferece trilhas para todos os perfis solicitados", () => {
    expect(page).toContain('title: "Administrativo"');
    expect(page).toContain('title: "Financeiro"');
    expect(page).toContain('title: "Gerente de vendas"');
    expect(page).toContain('title: "Corretor"');
    expect(page).toContain('title: "Jurídico e contábil"');
    expect(page).toContain('title: "Permutante"');
    expect(page).toContain('title: "Sócios e parceiros"');
    expect(page).toContain('title: "Usar o painel do Permutante"');
  });

  it("mantém prática segura, dados fictícios e progresso local", () => {
    expect(page).toContain("CASO FICTÍCIO");
    expect(page).toContain("Nenhuma ação foi executada.");
    expect(page).toContain("operator-manual-completed");
    expect(page).toContain("Marcar como estudada");
    expect(page).toContain("Buscar por setor, função ou assunto");
    expect(page).toContain("GALERIA DE PRINTS GUIADOS");
    expect(page).toContain("Clique em uma tela para abrir a aula correspondente");
    expect(page).toContain("firstLessonByTrack");
  });

  it("inclui as regras internas do CRM no conteúdo didático", () => {
    expect(page).toContain("não emite boleto bancário");
    expect(page).toContain("não envia mensagem externa");
    expect(page).toContain("não acessa banco");
    expect(page).toContain("não dá baixa");
    expect(page).toContain("não registra pagamento");
  });

  it("fica abaixo do Financeiro e possui rota protegida", () => {
    expect(navigation).toContain('label: "Manual do Operador"');
    expect(navigation.indexOf('path: "/loteadora/financeiro"')).toBeLessThan(navigation.indexOf('path: "/loteadora/manual"'));
    expect(app).toContain('path={"/loteadora/manual"}');
    expect(app).toContain('lazy(() => import("./pages/OperatorManual"))');
  });
});
