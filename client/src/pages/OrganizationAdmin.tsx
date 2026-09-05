import DashboardLayout, { type DashboardAccessGate, type DashboardNavigationItem } from "@/components/DashboardLayout";
import { organizationAdminModuleLabel, organizationAdminModuleState, type OrganizationAdminModuleState } from "@/lib/organizationAdminPresentation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { WorkforceManagementPanel } from "@/components/WorkforceManagementPanel";
import { ReportExportActions } from "@/components/ReportExportActions";
import { ArrowUpRight, Building2, Compass, FileUp, Home, LandPlot, ShieldCheck, UsersRound, Workflow } from "lucide-react";
import { Link } from "wouter";
import "../organization-admin.css";
import "../organization-admin-import.css";

const navigationItems: DashboardNavigationItem[] = [
  { icon: Compass, label: "Central de plataforma", path: "/administracao" },
  { icon: ShieldCheck, label: "Painel ADM", path: "/adm" },
  { icon: LandPlot, label: "Loteadora", path: "/loteadora" },
  { icon: Workflow, label: "Vendas Urbanas", path: "/vendas-urbanas" },
  { icon: Home, label: "Locação", path: "/locacao" },
];

const accessGate: DashboardAccessGate = {
  eyebrow: "ADM ORGANIZACIONAL · CONTEXTO ANTES DE OPERAÇÃO",
  title: "Acesse somente os módulos liberados para sua organização.",
  description: "A coluna ADM organiza o trabalho por módulo. A sessão não revela dados nem atribui acesso por si só: cada rota confirma contexto, grant, vigência e finalidade.",
  routeTitle: "Rota de acesso", routeDetail: "Autenticação → organização → módulo → policy", actionLabel: "Acessar painel ADM", footerLabel: "ESTADO", footerValue: "ACESSO GOVERNADO", footerNote: "Nenhum registro operacional é exibido antes da confirmação de contexto.", railTop: "ADM", railBottom: "ORGANIZAÇÃO",
};

type ModuleCardProps = { code: string; title: string; description: string; path: string; state: OrganizationAdminModuleState; icon: typeof LandPlot };

function ModuleCard({ code, title, description, path, state, icon: Icon }: ModuleCardProps) {
  const available = state === "available";
  return <article className={`organization-admin-module organization-admin-module--${state}`}><div className="organization-admin-module__index"><span>{code}</span><Icon size={18} aria-hidden="true" /></div><div className="organization-admin-module__content"><p className="organization-admin-module__state">{organizationAdminModuleLabel(state)}</p><h2>{title}</h2><p>{description}</p></div><div className="organization-admin-module__footer"><span>{available ? "Sem registros de negócio" : "Contexto ainda não liberado"}</span>{available ? <Link href={path}>Abrir módulo <ArrowUpRight size={15} /></Link> : <span className="organization-admin-module__blocked" aria-label={`${title} bloqueado até existir contexto autorizado`}>Bloqueado</span>}</div></article>;
}

export default function OrganizationAdmin() {
  const { isAuthenticated } = useAuth();
  const queryOptions = { enabled: isAuthenticated, retry: false };
  const identity = trpc.foundation.identity.useQuery(undefined, queryOptions);
  const canPrepareWorkforce = isAuthenticated && identity.data?.state === "connected";
  const subdivision = trpc.organizationContext.listAuthorizedForModule.useQuery({ module: "loteadora" }, queryOptions);
  const urbanSales = trpc.organizationContext.listAuthorizedForModule.useQuery({ module: "vendas_urbanas" }, queryOptions);
  const rental = trpc.organizationContext.listAuthorizedForModule.useQuery({ module: "locacao" }, queryOptions);
  const cards: ModuleCardProps[] = [
    { code: "01", title: "Loteadora", description: "Cadastros de loteamentos, estoque/mapa de lotes, clientes e sócios/parceiros em setores próprios.", path: "/loteadora", icon: LandPlot, state: organizationAdminModuleState({ loading: subdivision.isLoading, denied: subdivision.isError, contextCount: subdivision.data?.length }) },
    { code: "02", title: "Vendas Urbanas", description: "Clientes e leads, imóveis e proprietários, agenda, busca e empreendimentos em jornadas separadas.", path: "/vendas-urbanas", icon: Workflow, state: organizationAdminModuleState({ loading: urbanSales.isLoading, denied: urbanSales.isError, contextCount: urbanSales.data?.length }) },
    { code: "03", title: "Locação", description: "Clientes, imóveis e proprietários, agenda, busca e administração em setores distintos e governados.", path: "/locacao", icon: Home, state: organizationAdminModuleState({ loading: rental.isLoading, denied: rental.isError, contextCount: rental.data?.length }) },
  ];
  const availableCount = cards.filter((card) => card.state === "available").length;
  const reportRows = cards.map((card) => ({ section: "Módulo", indicator: card.title, status: organizationAdminModuleLabel(card.state) }));

  return <DashboardLayout navigationItems={navigationItems} navigationTitle="Núcleo CRM" accessGate={accessGate}><main className="organization-admin">
    <header className="organization-admin__commandbar"><div><p className="organization-admin__eyebrow">ADM ORGANIZACIONAL · ABAIXO DO SUPER ADM</p><h1>Painel ADM</h1><p>Escolha uma frente de trabalho, confirme o contexto autorizado e avance somente pelos setores liberados.</p></div><aside aria-label="Resumo de acesso organizacional"><ShieldCheck size={18} aria-hidden="true" /><span>Módulos liberados</span><strong>{availableCount} de 3</strong><small>Sem dados de negócio cadastrados</small></aside></header>
    <section className="organization-admin__guide" aria-label="Regras operacionais"><div><span>01</span><p><b>SUPER ADM governa</b><small>O ADM atua somente na própria organização.</small></p></div><div><span>02</span><p><b>Contexto confirma</b><small>A aparência não substitui membership, grant ou policy.</small></p></div><div><span>03</span><p><b>Setores organizam</b><small>O trabalho segue separado por coluna e jornada.</small></p></div></section>
    <ReportExportActions report={{ title: "Resumo do Painel ADM", scopeLabel: "Módulos devolvidos para a sessão atual", rows: reportRows }} isAuthorized={canPrepareWorkforce && availableCount > 0} description="Exporte o quadro redigido de módulos. A exportação não inclui identidades, clientes, contratos ou dados financeiros." />
    <Link href="/importar-clientes" className="organization-admin-import"><FileUp size={16} />Importar clientes por CSV <ArrowUpRight size={15} /></Link>
    <WorkforceManagementPanel mode="organization" canPrepare={canPrepareWorkforce} />
    <section className="organization-admin__section" aria-labelledby="modules-heading"><div className="organization-admin__section-heading"><div><p className="organization-admin__eyebrow">MÓDULOS DA ORGANIZAÇÃO</p><h2 id="modules-heading">Frentes de trabalho em ordem operacional.</h2></div><p>Contextos indisponíveis continuam visíveis e bloqueados. Isso não revela dados nem cria autorização.</p></div><div className="organization-admin__grid">{cards.map((card) => <ModuleCard key={card.code} {...card} />)}</div></section>
    <section className="organization-admin__empty" aria-label="Estado inicial da operação"><Building2 size={20} aria-hidden="true" /><div><p className="organization-admin__eyebrow">ESTADO ATUAL</p><h2>Sem contexto operacional selecionado.</h2><p>Quando houver contexto autorizado, cada módulo abre seus setores próprios. Cadastros, contratos e financeiro continuam sujeitos à autorização e aos limites já estabelecidos.</p></div></section>
  </main></DashboardLayout>;
}
