import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = () => readFileSync(resolve(process.cwd(), "client/src/pages/SubdivisionFoundation.tsx"), "utf8");
const navigationSource = () => readFileSync(resolve(process.cwd(), "client/src/lib/crmNavigation.ts"), "utf8");

describe("setores da coluna Loteadora", () => {
  it("mantém setores independentes e ordenados na navegação contextual", () => {
    const navigation = navigationSource();

    expect(navigation).toContain('label: "Cadastro de Loteamentos", path: "/loteadora"');
    expect(navigation).toContain('label: "Estoque/Mapa de Lotes", path: "/estoque-lotes"');
    expect(navigation).toContain('label: "Clientes Loteadora", path: "/loteadora/clientes"');
    expect(navigation).toContain('label: "Sócios e Parceiros", path: "/loteadora/socios-parceiros"');
    expect(navigation).toContain('label: "Financeiro", path: "/loteadora/financeiro", disabled: true');
  });

  it("mantém Financeiro sem consultas ou comandos econômicos enquanto estiver bloqueado", () => {
    const page = source();

    expect(page).toContain('activeSector === "finance"');
    expect(page).toContain("Financeiro ainda não está liberado para desenvolvimento.");
    expect(page).not.toContain("listEconomicRuleSets.useQuery");
    expect(page).not.toContain("createEconomicRuleSet.useMutation");
  });

  it("mantém Clientes Loteadora dependente de sessão, contexto e submissão explícita", () => {
    const page = source();

    expect(page).toContain("const isWorkspaceReady = isAuthenticated && isContextReady");
    expect(page).toContain("listDraftBuyerClients.useQuery(context, { enabled: isWorkspaceReady, retry: false })");
    expect(page).toContain("listBuyerAttachmentIntents.useQuery(context, { enabled: isWorkspaceReady, retry: false })");
    expect(page).toContain("createBuyerClientMutation.mutate({ ...context, correlationId: crypto.randomUUID(), partyRoleAssignmentId: buyerClientRoleId })");
    expect(page).toContain("createAttachmentIntentMutation.mutate({ ...context, correlationId: crypto.randomUUID(), buyerClientId: buyerClientIdForAttachment })");
  });
});
