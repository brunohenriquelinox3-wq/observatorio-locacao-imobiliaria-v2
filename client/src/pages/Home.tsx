import DashboardLayout from "@/components/DashboardLayout";
import { crmNavigationItems } from "@/lib/crmNavigation";
import { Building2, ClipboardList, FileStack, Landmark, LayoutDashboard, MapPinned, ShieldCheck, UsersRound } from "lucide-react";
import "../crm-entry.css";
import "../crm-entry-overrides.css";

const columns = [
  {
    code: "01",
    title: "SUPER ADM",
    label: "Governa a plataforma",
    path: "/administracao",
    icon: ShieldCheck,
    sectors: ["Governança e evidências", "Identidade e MFA", "Organizações e delegações", "Auditoria redigida"],
  },
  {
    code: "02",
    title: "ADM",
    label: "Opera a própria organização",
    path: "/adm",
    icon: LayoutDashboard,
    sectors: ["Visão de módulos", "Contexto autorizado", "Colaboradores e escopo", "Estados bloqueados"],
  },
  {
    code: "03",
    title: "LOTEADORA",
    label: "Jornadas imobiliárias em setores",
    path: "/loteadora",
    icon: Landmark,
    sectors: ["Cadastro de Loteamentos", "Estoque/Mapa de Lotes", "Clientes Loteadora", "Sócios e Parceiros", "Vendas de Lotes", "Financeiro bloqueado"],
  },
  {
    code: "04",
    title: "VENDAS URBANAS",
    label: "Captação e estrutura urbana",
    path: "/vendas-urbanas",
    icon: Building2,
    sectors: ["Clientes e Leads", "Imóveis e Proprietários", "Agenda Interna", "Perfil de Busca", "Empreendimentos e Construtoras", "Propostas bloqueadas"],
  },
  {
    code: "05",
    title: "LOCAÇÃO",
    label: "Jornadas de atendimento e administração",
    path: "/locacao",
    icon: MapPinned,
    sectors: ["Clientes e Entradas", "Imóveis e Proprietários", "Agenda Interna", "Perfil de Busca", "Administração", "Contratos e Financeiro bloqueados"],
  },
] as const;

export default function Home() {
  return (
    <DashboardLayout navigationItems={crmNavigationItems} navigationTitle="CRM">
      <main className="crm-entry" aria-labelledby="crm-entry-title">
        <header className="crm-entry__header">
          <div className="crm-entry__header-mark" aria-hidden="true"><ClipboardList size={22} /></div>
          <div>
            <p>CRM IMOBILIÁRIO · OPERAÇÃO GOVERNADA</p>
            <h1 id="crm-entry-title">Acesso por coluna, setor e contexto.</h1>
            <span>Escolha uma camada de trabalho. A interface organiza as jornadas; servidor, membership, grant, escopo e MFA continuam decidindo a autorização.</span>
          </div>
          <div className="crm-entry__header-status"><FileStack size={17} /><span>SEM CONTEXTO SELECIONADO</span><b>Leitura segura</b></div>
        </header>

        <section className="crm-entry__guidance" aria-label="Regras de navegação">
          <article><b>01</b><span><strong>Hierarquia</strong>SUPER ADM governa; ADM atua por organização.</span></article>
          <article><b>02</b><span><strong>Contexto</strong>Uma seleção visual nunca cria alçada.</span></article>
          <article><b>03</b><span><strong>Setores</strong>Cada coluna separa suas jornadas de trabalho.</span></article>
        </section>

        <section className="crm-entry__columns" aria-labelledby="crm-columns-title">
          <div className="crm-entry__section-heading">
            <div><p>COLUNAS DO CRM</p><h2 id="crm-columns-title">Toda a operação no lugar certo.</h2></div>
            <span>Setores econômicos seguem bloqueados até autorização explícita posterior.</span>
          </div>
          <div className="crm-entry__grid">
            {columns.map((column) => {
              const Icon = column.icon;
              return (
                <a className="crm-entry__column" href={column.path} key={column.code}>
                  <div className="crm-entry__column-top"><span>{column.code}</span><Icon size={19} /></div>
                  <h3>{column.title}</h3>
                  <p>{column.label}</p>
                  <ol>{column.sectors.map((sector, index) => <li key={sector}><b>{String(index + 1).padStart(2, "0")}</b><span>{sector}</span></li>)}</ol>
                  <footer>ABRIR COLUNA <span aria-hidden="true">↗</span></footer>
                </a>
              );
            })}
          </div>
        </section>

        <footer className="crm-entry__notice"><UsersRound size={18} /><p><b>Limite operacional:</b> esta entrada não cria dados, permissões, contratos, cobranças, pagamentos ou repasses. Cada setor verifica novamente o contexto antes de permitir leitura ou comando.</p></footer>
      </main>
    </DashboardLayout>
  );
}
