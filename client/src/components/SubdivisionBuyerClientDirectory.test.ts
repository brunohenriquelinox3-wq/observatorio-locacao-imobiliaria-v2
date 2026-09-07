import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const component = readFileSync(resolve(import.meta.dirname, "SubdivisionBuyerClientDirectory.tsx"), "utf8");

describe("SubdivisionBuyerClientDirectory composition", () => {
  it("keeps contextual list, quick preview, full-profile shortcut, and redacted timeline available", () => {
    expect(component).toContain("listDraftBuyerClientDirectory.useQuery");
    expect(component).toContain("listDraftBuyerClientTimeline.useQuery");
    expect(component).toContain("registerBuyerClientDirect.useMutation");
    expect(component).toContain("Cadastro direto de cliente");
    expect(component).toContain("Abrir ficha e organização cadastral");
    expect(component).toContain("HISTÓRICO REDIGIDO");
    expect(component).toContain("evento autorizado, sem conteúdo pessoal");
  });

  it("does not introduce commercial, financial, contractual, or document-view controls", () => {
    expect(component).not.toContain("createSaleMutation");
    expect(component).not.toContain("paymentMutation");
    expect(component).not.toContain("contractMutation");
    expect(component).not.toContain("downloadAttachment");
    expect(component).not.toContain("documentUrl");
  });
});
