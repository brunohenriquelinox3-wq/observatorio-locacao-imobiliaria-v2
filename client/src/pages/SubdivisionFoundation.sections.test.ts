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
    expect(navigation).toContain('label: "Central de Vendas", path: "/loteadora/clientes"');
    expect(navigation).toContain('label: "Sócios e Parceiros", path: "/loteadora/socios-parceiros"');
    expect(navigation).not.toContain('label: "Vendas de Lotes", path: "/loteadora/vendas"');
    expect(navigation).toContain('label: "Financeiro", path: "/loteadora/financeiro", disabled: true');
  });

  it("mantém Financeiro sem consultas ou comandos econômicos enquanto estiver bloqueado", () => {
    const page = source();

    expect(page).toContain('activeSector === "finance"');
    expect(page).toContain("Financeiro ainda não está liberado para desenvolvimento.");
    expect(page).not.toContain("listEconomicRuleSets.useQuery");
    expect(page).not.toContain("createEconomicRuleSet.useMutation");
  });

  it("mantém a Central de Vendas dependente de sessão, contexto e submissão explícita", () => {
    const page = source();

    expect(page).toContain("const isWorkspaceReady = isAuthenticated && isContextReady");
    expect(page).toContain("const selectBuyerClient = useCallback((buyerClientId: string) => {");
    expect(page).toContain('const isCentralSalesJourney = location === "/loteadora/vendas";');
    expect(page).toContain('listDraftBuyerClients.useQuery(context, { enabled: isWorkspaceReady && isCentralSalesJourney, retry: false })');
    expect(page).toContain('!isBuyerProfilePage && <details id="subdivision-buyers"');
    expect(page).toContain("Vincular cadastro existente");
    expect(page).not.toContain('directoryBuyerClients.map((client) => <article key={client.buyerClientId}');
    expect(page).toContain("onSelectBuyerClient={selectBuyerClient}");
    expect(page).toContain('"/loteadora/clientes/ficha": "clients"');
    expect(page).toContain("const isBuyerProfilePage = location === \"/loteadora/clientes/ficha\"");
    expect(page).toContain("!isBuyerProfilePage && <SubdivisionBuyerClientDirectory");
    expect(page).toContain("isBuyerProfilePage && <section id=\"buyer-profile-standalone\"");
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
    expect(page).toContain("const contextOrganizationId = effectiveOrganizationContext?.organizationId ?? \"\";");
    expect(page).toContain("[contextOrganizationId, contextPurposeCode]");
    expect(page).toContain("const profileBuyerClients = useMemo(() =>");
    expect(page).toContain("setBuyerClientIdForProfile((value) => retainAuthorizedSelection(value, profileBuyerClients");
    expect(page).toContain("setBuyerClientIdForAttachment((value) => retainAuthorizedSelection(value, directoryBuyerClients");
    expect(page).toContain("if (buyerDirectoryQuery.isFetching) return;");
    expect(page).toContain("[buyerClientsQuery.data, buyerDirectoryQuery.isFetching, directoryBuyerClients, profileBuyerClients]");
    expect(page).toContain("listDraftBuyerClientReadiness.useQuery");
  });

  it("incorpora a rota legada de Vendas de Lotes à Central sem remover a compatibilidade", () => {
    const page = source();

    expect(page).toContain('"/loteadora/vendas": "clients"');
    expect(page).toContain('aria-label="Áreas da Central de Vendas"');
    expect(page).toContain('href="/loteadora/vendas"');
    expect(page).toContain('{isCentralSalesJourney && <section id="subdivision-sales"');
    expect(page).toContain("Iniciar preparação de venda");
    expect(page).toContain("não é reserva, proposta, contrato, preço, cobrança, boleto, comissão, repasse ou financeiro");
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
    expect(page).toContain('finance: { index: "Setor 04"');
  });
});
