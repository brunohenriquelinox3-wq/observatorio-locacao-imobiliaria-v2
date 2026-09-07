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

  it("is composed after the preserved opaque attachment flow and before the preserved readiness summary", () => {
    const attachmentSection = foundationPage.indexOf("id=\"subdivision-attachment-title\"");
    const profileSection = foundationPage.indexOf("<SubdivisionBuyerClientProfile");
    const readinessSection = foundationPage.indexOf("<SubdivisionBuyerReadiness");
    expect(attachmentSection).toBeGreaterThan(-1);
    expect(profileSection).toBeGreaterThan(attachmentSection);
    expect(readinessSection).toBeGreaterThan(profileSection);
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

  it("only updates the visible ficha after receiving the confirmed profile from the server", () => {
    expect(component).toContain("onSuccess(confirmedProfile)");
    expect(component).toContain("getDraftBuyerClientProfile.setData(selectionInput, confirmedProfile)");
    expect(component).not.toContain("getDraftBuyerClientProfile.invalidate(selectionInput)");
  });

  it("does not expose a direct commercial transition or individual export control", () => {
    expect(component).not.toMatch(/vincular.*lote|criar.*proposta|aprovar.*crédito|gerar.*contrato|exportar.*perfil/i);
    expect(component).not.toMatch(/storage_key|document_url|file_bytes|download.*documento/i);
  });
});
