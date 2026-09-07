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
    expect(component).toContain("onOpenProfilePage: () => void;");
    expect(component).toContain("Abrir ficha em página");
  });

  it("uses the maximum authorized first page so active records are not hidden by an artificial local limit", () => {
    expect(component).toContain("const pageSize = 25;");
    expect(component).toContain("const initialDirectoryInput = useMemo(() => ({ ...context, searchTerm: null, pageSize, pageOffset: 0 }), [context]);");
    expect(component).toContain("listDraftBuyerClientDirectory.invalidate(initialDirectoryInput)");
    expect(component).toContain('id="buyer-directory-more"');
    expect(component).toContain('aria-label="Carregar a próxima página de cadastros autorizados"');
    expect(component).toContain("[context.organizationId, context.purposeCode, onSelectBuyerClient]");
    expect(component).toContain("setPageOffset(0);");
	  expect(component).toContain("getDraftBuyerClientDirectoryTotal.useQuery");
	  expect(component).toContain("cadastro(s) ativo(s) no contexto");
	  expect(component).toContain("exibido(s) nesta página");
	  expect(component).toContain("Mostrando ${firstDisplayedEntry}–${lastDisplayedEntry} de ${directoryTotal}");
	  expect(component).toContain("hasMoreEntries");
	  expect(component).toContain("Ver próxima página de cadastros");
	  expect(component).toContain('className="subdivision-buyer-directory__list"');
	  expect(component).toContain("Nome, telefone, e-mail ou referência declarada");
	  expect(component).toContain("devolve somente o cartão minimizado no mesmo contexto");
  });

  it("keeps a visible, descriptive primary action for registering a new client", () => {
    expect(component).toContain("AÇÃO PRINCIPAL");
    expect(component).toContain("Cadastrar novo Cliente Loteadora");
    expect(component).toContain('className="subdivision-buyer-directory__enrollment-submit"');
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
    expect(component).toContain('id="buyer-directory-archived"');
    expect(component).toContain('window.location.hash !== "#buyer-directory-archived"');
    expect(component).toContain('document.getElementById("buyer-directory-archived")?.scrollIntoView');
    expect(component).toContain('aria-controls="buyer-directory-archived"');
    expect(component).toContain("Ver cadastros arquivados");
  });

  it("does not introduce commercial, financial, contractual, or document-view controls", () => {
    expect(component).not.toContain("createSaleMutation");
    expect(component).not.toContain("paymentMutation");
    expect(component).not.toContain("contractMutation");
    expect(component).not.toContain("downloadAttachment");
    expect(component).not.toContain("documentUrl");
  });
});
