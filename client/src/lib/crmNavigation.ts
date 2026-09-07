import type { DashboardNavigationItem } from "@/components/DashboardLayout";
import { Building2, CalendarClock, ClipboardCheck, Compass, FileText, House, LandPlot, Layers3, LockKeyhole, Search, ShieldCheck, UsersRound } from "lucide-react";

export const crmNavigationItems: DashboardNavigationItem[] = [
  { icon: Compass, label: "Central de plataforma", path: "/administracao" },
  { icon: ShieldCheck, label: "Painel ADM", path: "/adm" },
  { icon: LockKeyhole, label: "Segurança e MFA", path: "/seguranca-mfa", description: "Inscrição e revalidação TOTP" },
  { icon: LandPlot, label: "Loteamentos", path: "/loteadora", description: "Loteamentos · cadastro, matriz e estoque" },
  { icon: UsersRound, label: "Central de Vendas", path: "/loteadora/clientes", description: "Loteadora · clientes, estoque e jornada de vendas" },
  { icon: Building2, label: "Sócios e Parceiros", path: "/loteadora/socios-parceiros", description: "Loteadora · setor 04" },
  { icon: LockKeyhole, label: "Financeiro", path: "/loteadora/financeiro", description: "Loteadora · lotes internos de parcelas e controle operacional" },
  { icon: UsersRound, label: "Clientes e Leads", path: "/vendas-urbanas", description: "Vendas Urbanas · setor 01" },
  { icon: House, label: "Imóveis e Proprietários", path: "/vendas-urbanas/imoveis-proprietarios", description: "Vendas Urbanas · setor 02" },
  { icon: Building2, label: "Empreendimentos e Construtoras", path: "/vendas-urbanas/empreendimentos", description: "Vendas Urbanas · setor 03" },
  { icon: CalendarClock, label: "Agenda Interna", path: "/vendas-urbanas/agenda", description: "Vendas Urbanas · setor 04" },
  { icon: Search, label: "Perfil de Busca", path: "/vendas-urbanas/perfil-busca", description: "Vendas Urbanas · setor 05" },
  { icon: FileText, label: "Propostas, Reservas e Contratos", path: "/vendas-urbanas/propostas", disabled: true, description: "Vendas Urbanas · bloqueado até nova autorização" },
  { icon: LockKeyhole, label: "Financeiro", path: "/vendas-urbanas/financeiro", disabled: true, description: "Vendas Urbanas · bloqueado até autorização explícita" },
  { icon: UsersRound, label: "Clientes e Interessados", path: "/locacao", description: "Locação · setor 01" },
  { icon: House, label: "Imóveis e Proprietários", path: "/locacao/imoveis-proprietarios", description: "Locação · setor 02" },
  { icon: Search, label: "Perfil de Busca", path: "/locacao/perfil-busca", description: "Locação · setor 03" },
  { icon: CalendarClock, label: "Agenda Interna", path: "/locacao/agenda", description: "Locação · setor 04" },
  { icon: ClipboardCheck, label: "Administração de Locação", path: "/locacao/administracao", description: "Locação · setor 05" },
  { icon: FileText, label: "Contratos e Garantias", path: "/locacao/contratos", disabled: true, description: "Locação · bloqueado até nova autorização" },
  { icon: LockKeyhole, label: "Financeiro", path: "/locacao/financeiro", disabled: true, description: "Locação · bloqueado até autorização explícita" },
  { icon: UsersRound, label: "Núcleo de cadastros", path: "/cadastro-base" },
  { icon: House, label: "Ativos urbanos", path: "/ativos-urbanos" },
];
