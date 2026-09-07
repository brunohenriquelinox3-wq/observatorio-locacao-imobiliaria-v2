import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const component = readFileSync(resolve(import.meta.dirname, "SubdivisionBuyerClientDirectory.tsx"), "utf8");

describe("SubdivisionBuyerClientDirectory composition", () => {
  it("keeps contextual list, quick preview, full-profile shortcut, and redacted timeline available", () => {
    expect(component).toContain("listDraftBuyerClientDirectory.useQuery");
    expect(component).toContain("listDraftBuyerClientTimeline.useQuery");
    expect(component).toContain("registerClientDirect.useMutation");
    expect(component).toContain("Novo Cliente Loteadora");
    expect(component).toContain("Editar dados cadastrais");
    expect(component).toContain("HISTÓRICO REDIGIDO");
    expect(component).toContain("evento autorizado, sem conteúdo pessoal");
    expect(component).toContain('presentation="embedded"');
    expect(component).toContain("SubdivisionBuyerClientProfile");
  });

  it("opens the complete editor as soon as a client card is selected", () => {
    expect(component).toContain("setLocalActiveEntry(entry); setIsEditorOpen(true); onSelectBuyerClient(entry.buyerClientId);");
    expect(component).toContain("Fechar edição");
  });

  it("makes protected contact editing, private documents, and reversible exclusion discoverable", () => {
    expect(component).toContain("Telefone");
    expect(component).toContain("WhatsApp");
    expect(component).toContain("CPF/CNPJ");
    expect(component).toContain("Editar dados cadastrais");
    expect(component).toContain("Documentos privados");
    expect(component).toContain("archiveClient.useMutation");
    expect(component).toContain("restoreClient.useMutation");
    expect(component).toContain("AlertDialog");
    expect(component).toContain("Confirmar arquivamento");
    expect(component).toContain("Cadastros arquivados");
  });

  it("does not introduce commercial, financial, contractual, or document-view controls", () => {
    expect(component).not.toContain("createSaleMutation");
    expect(component).not.toContain("paymentMutation");
    expect(component).not.toContain("contractMutation");
    expect(component).not.toContain("downloadAttachment");
    expect(component).not.toContain("documentUrl");
  });
});
