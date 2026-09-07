import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = () => readFileSync(resolve(process.cwd(), "client/src/pages/SubdivisionFoundation.tsx"), "utf8");
const navigationSource = () => readFileSync(resolve(process.cwd(), "client/src/lib/crmNavigation.ts"), "utf8");

describe("setores da coluna Loteadora", () => {
  it("mantém Loteamentos como única entrada lateral, preservando Estoque/Mapa como rota interna", () => {
    const navigation = navigationSource();

    expect(navigation).toContain('label: "Loteamentos", path: "/loteadora"');
    expect(navigation).not.toContain('path: "/estoque-lotes"');
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
    expect(page).toContain("const selectBuyerClient = useCallback((buyerClientId: string) => {");
    expect(page).toContain('listDraftBuyerClients.useQuery(context, { enabled: isWorkspaceReady && activeSector === "sales", retry: false })');
    expect(page).toContain("isWorkspaceReady && directoryBuyerClients && directoryBuyerClients.length > 0");
    expect(page).toContain("onSelectBuyerClient={selectBuyerClient}");
    expect(page).toContain("listBuyerAttachmentIntents.useQuery(context, { enabled: isWorkspaceReady, retry: false })");
    expect(page).toContain("createBuyerClientMutation.mutate({ ...context, correlationId: crypto.randomUUID(), partyRoleAssignmentId: buyerClientRoleId })");
    expect(page).toContain("createAttachmentIntentMutation.mutate({ ...context, correlationId: crypto.randomUUID(), buyerClientId: buyerClientIdForAttachment })");
  });

  it("preserva contexto e seleção autorizados durante refetch transitório, sem estender a retenção a outro contexto", () => {
    const page = source();

    expect(page).toContain("const [lastAuthorizedContext, setLastAuthorizedContext] = useState<{ organizationId: string; purposeCode: string } | null>(null)");
    expect(page).toContain("setLastAuthorizedContext({");
    expect(page).toContain("const effectiveOrganizationContext = selectedOrganizationContext");
    expect(page).toContain("?? (lastAuthorizedContext && (!selectedOrganizationId || lastAuthorizedContext.organizationId === selectedOrganizationId)");
    expect(page).toContain("setBuyerClientIdForProfile((value) => retainAuthorizedSelection(value, directoryBuyerClients");
    expect(page).toContain("setBuyerClientIdForAttachment((value) => retainAuthorizedSelection(value, directoryBuyerClients");
  });

  it("apresenta Cadastro e Estoque como áreas complementares sem desmontar o estúdio existente", () => {
    const page = source();

    expect(page).toContain('LOTEAMENTOS · JORNADA UNIFICADA');
    expect(page).toContain('href="#subdivision-studio"');
    expect(page).toContain('href="/estoque-lotes"');
    expect(page).toContain('<SubdivisionDevelopmentStudio context={context}');
  });

  it("deriva o seletor local apenas das rotas da coluna Loteamentos, sem depender de posições globais", () => {
    const page = source();

    expect(page).toContain('aria-label="Setores da coluna Loteamentos"');
    expect(page).toContain('item.path === "/loteadora" || item.path.startsWith("/loteadora/")');
    expect(page).not.toContain('crmNavigationItems.slice(2, 8)');
    expect(page).toContain('clients: { index: "Setor 02"');
    expect(page).toContain('finance: { index: "Setor 05"');
  });
});
