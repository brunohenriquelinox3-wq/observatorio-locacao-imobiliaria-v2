import DashboardLayout, { type DashboardAccessGate, type DashboardNavigationItem } from "@/components/DashboardLayout";
import { organizationAdminModuleLabel, organizationAdminModuleState, type OrganizationAdminModuleState } from "@/lib/organizationAdminPresentation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowUpRight, Building2, Compass, Home, LandPlot, ShieldCheck, UsersRound, Workflow } from "lucide-react";
import { Link } from "wouter";
import "../organization-admin.css";

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
  routeTitle: "Rota de acesso",
  routeDetail: "Autenticação → organização → módulo → policy",
  actionLabel: "Acessar painel ADM",
  footerLabel: "ESTADO",
  footerValue: "ACESSO GOVERNADO",
  footerNote: "Nenhum registro operacional é exibido antes da confirmação de contexto.",
  railTop: "ADM",
  railBottom: "ORGANIZAÇÃO",
};

type ModuleCardProps = {
  code: string;
  title: string;
  description: string;
  path: string;
  state: OrganizationAdminModuleState;
  icon: typeof LandPlot;
};

function ModuleCard({ code, title, description, path, state, icon: Icon }: ModuleCardProps) {
  const available = state === "available";
  return (
    <article className={`organization-admin-module organization-admin-module--${state}`}>
      <div className="organization-admin-module__top"><span>{code}</span><Icon size={20} aria-hidden="true" /></div>
      <p className="organization-admin-module__state">{organizationAdminModuleLabel(state)}</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="organization-admin-module__footer">
        <span>{available ? "Sem registros de negócio" : "Aguardando contexto"}</span>
        {available ? <Link href={path}>Abrir módulo <ArrowUpRight size={16} /></Link> : <span className="organization-admin-module__blocked">Sem atalho</span>}
      </div>
    </article>
  );
}

export default function OrganizationAdmin() {
  const { isAuthenticated } = useAuth();
  const queryOptions = { enabled: isAuthenticated, retry: false };
  const subdivision = trpc.organizationContext.listAuthorizedForModule.useQuery({ module: "loteadora" }, queryOptions);
  const urbanSales = trpc.organizationContext.listAuthorizedForModule.useQuery({ module: "vendas_urbanas" }, queryOptions);
  const rental = trpc.organizationContext.listAuthorizedForModule.useQuery({ module: "locacao" }, queryOptions);

  const cards: ModuleCardProps[] = [
    { code: "01", title: "Loteadora", description: "Estruture loteamentos, quadras e o futuro mapa de lotes dentro de um contexto autorizado.", path: "/loteadora", icon: LandPlot, state: organizationAdminModuleState({ loading: subdivision.isLoading, denied: subdivision.isError, contextCount: subdivision.data?.length }) },
    { code: "02", title: "Vendas Urbanas", description: "Organize interesse, agenda e próximos passos sem transformar rascunhos em compromisso comercial.", path: "/vendas-urbanas", icon: Workflow, state: organizationAdminModuleState({ loading: urbanSales.isLoading, denied: urbanSales.isError, contextCount: urbanSales.data?.length }) },
    { code: "03", title: "Locação", description: "Separe jornada de administração e locação antes de qualquer contrato, garantia ou financeiro.", path: "/locacao", icon: Home, state: organizationAdminModuleState({ loading: rental.isLoading, denied: rental.isError, contextCount: rental.data?.length }) },
  ];
  const availableCount = cards.filter((card) => card.state === "available").length;

  return (
    <DashboardLayout navigationItems={navigationItems} navigationTitle="Núcleo CRM" accessGate={accessGate}>
      <main className="organization-admin">
        <header className="organization-admin__hero">
          <div>
            <p className="organization-admin__eyebrow">PAINEL ADM · OPERAÇÃO ORGANIZADA</p>
            <h1>Uma operação clara antes do primeiro cadastro.</h1>
            <p>Este painel reúne apenas os módulos autorizados para sua organização. Ele mostra onde começar, o que ainda está vazio e qual limite protege cada jornada.</p>
          </div>
          <aside aria-label="Resumo de acesso organizacional">
            <ShieldCheck size={20} aria-hidden="true" />
            <span>Módulos liberados</span>
            <strong>{availableCount} de 3</strong>
            <small>Sem dados de negócio cadastrados</small>
          </aside>
        </header>

        <section className="organization-admin__guide" aria-label="Guia de início">
          <div><span>01</span><p><b>Escolha o módulo</b><small>Acesso é demonstrado por contexto, não por promessa visual.</small></p></div>
          <div><span>02</span><p><b>Comece em rascunho</b><small>Nenhum formulário cria contrato, financeiro ou efeito externo.</small></p></div>
          <div><span>03</span><p><b>Avance com evidência</b><small>Permissões e dados continuam verificados pelo servidor.</small></p></div>
        </section>

        <section className="organization-admin__section" aria-labelledby="modules-heading">
          <div className="organization-admin__section-heading"><p className="organization-admin__eyebrow">MÓDULOS CONTRATADOS</p><h2 id="modules-heading">Sua operação, organizada por frente de trabalho.</h2></div>
          <div className="organization-admin__grid">{cards.map((card) => <ModuleCard key={card.code} {...card} />)}</div>
        </section>

        <section className="organization-admin__empty" aria-label="Estado inicial da operação">
          <Building2 size={22} aria-hidden="true" />
          <div><p className="organization-admin__eyebrow">PRÓXIMO MARCO</p><h2>O ambiente está pronto para desenvolvimento, sem registros operacionais.</h2><p>O avanço recomendado é aprimorar as jornadas e painéis de cada módulo; cadastros reais continuam aguardando uma decisão operacional específica.</p></div>
        </section>
      </main>
    </DashboardLayout>
  );
}
