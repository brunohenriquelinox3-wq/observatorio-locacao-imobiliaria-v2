import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const studio = () => readFileSync(path.resolve(process.cwd(), "client/src/components/SubdivisionDevelopmentStudio.tsx"), "utf8");
const styles = () => readFileSync(path.resolve(process.cwd(), "client/src/subdivision-lot-management.css"), "utf8");
const foundation = () => readFileSync(path.resolve(process.cwd(), "client/src/pages/SubdivisionFoundation.tsx"), "utf8");

describe("central de gestão territorial por Quadra e Lote", () => {
  it("mantém a matriz de edição fechada para um cadastro que já possui estrutura", () => {
    const source = studio();

    expect(source).toContain('className="subdivision-studio__matrix-editor"');
    expect(source).toContain("open={activeSavedStructure.length === 0}");
    expect(source).toContain("REVISAR MATRIZ FÍSICA");
    expect(source).toContain("Alterar Quadras e Lotes com confirmação");
  });

  it("expõe a prévia como política preparada, não como tabela aprovada", () => {
    const source = studio();

    expect(source).toContain('className="subdivision-lot-pricing__governance"');
    expect(source).toContain("Preparar");
    expect(source).toContain("Vigência");
    expect(source).toContain("Somente política aprovada orienta a operação.");
    expect(source).toContain("A prévia não grava, não aprova tabela");
  });

  it("preserva superfícies visuais e responsivas para edição intencional e política preparada", () => {
    const source = styles();

    expect(source).toContain(".subdivision-studio__matrix-editor");
    expect(source).toContain(".subdivision-lot-pricing__governance");
    expect(source).toContain("@media (max-width: 720px)");
  });

  it("não apresenta o cadastro em estruturação como rascunho no contexto da tela", () => {
    const source = foundation();

    expect(source).toContain("antes de qualquer leitura ou alteração");
    expect(source).toContain("ações do cadastro em estruturação");
    expect(source).not.toContain("antes de qualquer leitura ou rascunho");
  });

  it("deriva a completude apenas dos atributos físicos retornados e declara a ausência de inferência", () => {
    const source = studio();
    const style = styles();

    expect(source).toContain("const physicalCoverage = [");
    expect(source).toContain('key: "frontage"');
    expect(source).toContain('key: "depth"');
    expect(source).toContain("Campos pendentes continuam vazios até uma fonte física revisada ser aplicada.");
    expect(source).toContain("Esta leitura não preenche, estima nem modifica Lotes.");
    expect(style).toContain(".subdivision-lot-management__completeness-grid");
  });

  it("não transforma defaults estruturais em evidência física confirmada", () => {
    const source = studio();

    expect(source).toContain('lot.positionCode !== "not_declared"');
    expect(source).toContain('lot.lotTypology !== "standard"');
    expect(source).toContain('lot.lotTypology === "standard" ? "Tipologia pendente"');
  });

  it("alinha a pendência resumida da Quadra aos Lotes com qualquer atributo físico incompleto", () => {
    const source = studio();

    expect(source).toContain("lotsWithPhysicalPending");
    expect(source).toContain('lot.positionCode === "not_declared"');
    expect(source).toContain("Lotes com pendência");
    expect(source).toContain("block.lotsWithPhysicalPending");
  });

  it("filtra localmente por situação física sem introduzir estado comercial", () => {
    const source = studio();

    expect(source).toContain('useState<"all" | "pending" | "complete">("all")');
    expect(source).toContain("matchesPhysicalStatus");
    expect(source).toContain("Com pendência física");
    expect(source).toContain("Completos na fonte");
    expect(source).not.toContain("Disponibilidade comercial");
  });
});
