import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

const manual = read("docs/auditoria-manual-operador-loteadora-2026-09.md");
const report = read("docs/esteira-master/ui-state-hardening-2026-09-26.md");
const journey = read("client/src/components/SubdivisionSaleCaseWorkspace.tsx");
const participation = read(
  "client/src/components/SubdivisionPartnerParticipationWorkspace.tsx"
);

describe("endurecimento transversal dos estados da Loteadora", () => {
  it("registra no Manual caminhos de recuperação que não executam mutations", () => {
    expect(manual).toContain("Correções de estados e recuperação de leitura");
    expect(manual).toContain("Voltar ao estoque");
    expect(manual).toContain("Atualizar cartões");
    expect(manual).toContain("Tentar ler novamente");
    expect(manual).toContain("Atualizar leitura");
    expect(manual).toContain(
      "Essas recuperações são somente de leitura."
    );
  });

  it("documenta separadamente gates locais, publicação e QA do novo patch", () => {
    expect(report).toContain("390 arquivos / 1.459 testes aprovados");
    expect(report).toContain("Deploy de teste deste patch:** `ready`");
    expect(report).toContain(
      "QA publicada deste patch:** concluída em modo read-only"
    );
    expect(report).toContain("não faz backfill nem infere vigência histórica");
  });

  it("mantém as recuperações limitadas à leitura protegida", () => {
    expect(journey).toContain("onRetrySaleCaseRead: () => void;");
    expect(journey).toContain("Tentar ler novamente a venda selecionada");
    expect(participation).toContain(
      "const participationReadFailed = policiesQuery.isError || rulesQuery.isError;"
    );
    expect(participation).toContain("policiesQuery.refetch()");
    expect(participation).toContain("rulesQuery.refetch()");
  });
});
