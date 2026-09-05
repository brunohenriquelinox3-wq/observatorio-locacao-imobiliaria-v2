import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const source = () => readFileSync(path.resolve(process.cwd(), "client/src/components/SubdivisionDevelopmentStudio.tsx"), "utf8");

describe("SubdivisionDevelopmentStudio modular", () => {
  it("organiza o cadastro em cinco módulos independentes", () => {
    const studio = source();
    expect(studio).toContain('id: "identity"');
    expect(studio).toContain('id: "structure"');
    expect(studio).toContain('id: "preparation"');
    expect(studio).toContain('id: "documents"');
    expect(studio).toContain('id: "lifecycle"');
    expect(studio).toContain('const [activeModule, setActiveModule]');
  });

  it("mantém documentos e ciclo condicionados a um rascunho já salvo", () => {
    const studio = source();
    expect(studio).toContain('const requiresSavedDraft = module.id === "documents" || module.id === "lifecycle"');
    expect(studio).toContain('if ((module === "documents" || module === "lifecycle") && !selectedDevelopmentId)');
    expect(studio).toContain('disabled={!isWorkspaceReady || (requiresSavedDraft && !selectedDevelopmentId)}');
  });

  it("preserva os comandos privados de anexos e arquivamento", () => {
    const studio = source();
    expect(studio).toContain('createDevelopmentAttachmentIntent');
    expect(studio).toContain('archiveDevelopmentAttachment');
    expect(studio).toContain('archiveDevelopmentStudio');
    expect(studio).toContain('X-Supabase-Access-Token');
  });

  it("inclui o construtor de Quadras e Lotes no próprio cadastro", () => {
    const studio = source();
    expect(studio).toContain("Monte a matriz do loteamento por Quadra.");
    expect(studio).toContain("Q1 com 15 Lotes e Q2 com 25 Lotes");
    expect(studio).toContain("applyDraftStructure");
    expect(studio).toContain("archiveDraftBlock");
    expect(studio).toContain("Abrir Estoque/Mapa de Lotes");
  });

  it("exige confirmação antes de arquivar parte da estrutura já salva", () => {
    const studio = source();
    expect(studio).toContain("replaceStructureConfirmed");
    expect(studio).toContain("structureWouldArchive && !replaceStructureConfirmed");
    expect(studio).toContain("arquivados logicamente");
  });

  it("mantém módulos de cadastro como unidades navegáveis e não como formulário comprimido", () => {
    const studio = source();
    expect(studio).toContain('caption: "Quadras e Lotes"');
    expect(studio).toContain('aria-label="Matriz de Quadras e Lotes"');
  });
});
