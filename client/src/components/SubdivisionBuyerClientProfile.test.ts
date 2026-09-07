import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const component = readFileSync(resolve(import.meta.dirname, "SubdivisionBuyerClientProfile.tsx"), "utf8");
const foundationPage = readFileSync(resolve(import.meta.dirname, "../pages/SubdivisionFoundation.tsx"), "utf8");

describe("Clientes Loteadora profile composition", () => {
  it("keeps a progressive profile, conditional requirements, and granular contact preferences", () => {
    expect(component).toContain("Dados de contato e identificação");
    expect(component).toContain("CPF ou CNPJ");
    expect(component).toContain("RG ou documento complementar");
    expect(component).toContain("Telefone");
    expect(component).toContain("WhatsApp");
    expect(component).toContain("Salvar dados do cliente");
    expect(component).toContain("PENDÊNCIAS CONDICIONAIS");
    expect(component).toContain("PREFERÊNCIAS DE CONTATO");
    expect(component).toContain("Não inclua renda, patrimônio, score, dados bancários, lote, preço, forma de pagamento, contrato ou informações sensíveis nesta etapa.");
  });

  it("keeps the compatible full profile in its own route instead of mounting it with the embedded editor", () => {
    const standaloneProfileSection = foundationPage.indexOf('isBuyerProfilePage && <section id="buyer-profile-standalone"');
    const attachmentSection = foundationPage.indexOf("id=\"subdivision-attachment-title\"");
    const readinessSection = foundationPage.indexOf("<SubdivisionBuyerReadiness");
    expect(standaloneProfileSection).toBeGreaterThan(-1);
    expect(standaloneProfileSection).toBeLessThan(attachmentSection);
    expect(readinessSection).toBeGreaterThan(attachmentSection);
    expect(foundationPage).toContain("!isBuyerProfilePage && <SubdivisionBuyerClientDirectory");
  });

  it("preserves the selected client received from the central while compatible lists refresh", () => {
    expect(component).toContain("const buyerClientId = selectedBuyerClientId ?? uncontrolledBuyerClientId;");
    expect(component).toContain("if (!isContextReady && buyerClientId) setBuyerClientId(\"\");");
    expect(component).not.toContain("buyerClients?.some((client) => client.buyerClientId === buyerClientId)");
    expect(component).toContain("Cadastro selecionado para edição.");
  });

  it("supports the same complete editor embedded in the selected client ficha", () => {
    expect(component).toContain('presentation?: "full" | "embedded"');
    expect(component).toContain('presentation === "embedded"');
    expect(component).toContain("EDIÇÃO CONTEXTUAL");
  });

  it("moves focus to the contextual editor once for each newly selected client and brings it into view accessibly", () => {
    expect(component).toContain("const editorFormRef = useRef<HTMLFormElement>(null);");
    expect(component).toContain("const lastFocusedBuyerClientId = useRef(\"\");");
    expect(component).toContain('window.matchMedia("(prefers-reduced-motion: reduce)").matches');
    expect(component).toContain('editorForm.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" })');
    expect(component).toContain("editorForm.focus({ preventScroll: true })");
    expect(component).toContain('id="buyer-profile-contextual-editor"');
    expect(component).toContain("tabIndex={-1}");
  });

  it("only updates the visible ficha after receiving the confirmed profile from the server", () => {
    expect(component).toContain("onSuccess(confirmedProfile)");
    expect(component).toContain("getDraftBuyerClientProfile.setData(selectionInput, confirmedProfile)");
    expect(component).not.toContain("getDraftBuyerClientProfile.invalidate(selectionInput)");
    expect(component).toContain("listDraftBuyerClientDirectory.invalidate(initialDirectoryInput)");
  });

  it("recovers the full-profile selector anchor only after the authorized workspace is ready", () => {
    expect(component).toContain('const restoredProfileAnchor = useRef(false);');
    expect(component).toContain('window.location.hash !== "#buyer-profile-client"');
    expect(component).toContain('document.getElementById("buyer-profile-client")?.scrollIntoView({ behavior: "auto", block: "center" })');
    expect(component).toContain("[buyerClients?.length, isWorkspaceReady, presentation]");
  });

  it("focuses the standalone selector only when it becomes ready without disrupting active editing", () => {
    expect(component).toContain("const selectorRef = useRef<HTMLSelectElement>(null);");
    expect(component).toContain("const focusedStandaloneSelector = useRef(false);");
    expect(component).toContain("if (presentation !== \"full\" || !isWorkspaceReady || buyerClientId || focusedStandaloneSelector.current || !buyerClients?.length) return;");
    expect(component).toContain("selectorRef.current?.focus({ preventScroll: true })");
    expect(component).toContain("<select ref={selectorRef} id=\"buyer-profile-client\"");
  });

  it("does not expose a direct commercial transition or individual export control", () => {
    expect(component).not.toMatch(/vincular.*lote|criar.*proposta|aprovar.*crédito|gerar.*contrato|exportar.*perfil/i);
    expect(component).not.toMatch(/storage_key|document_url|file_bytes|download.*documento/i);
  });
});
