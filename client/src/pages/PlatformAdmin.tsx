import DashboardLayout, { type DashboardNavigationItem } from "@/components/DashboardLayout";
import { getPlatformCommandState, type PlatformCommand } from "@/lib/platformAdmin";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileSearch,
  KeyRound,
  LockKeyhole,
  ScrollText,
  ShieldCheck,
  UserRoundCog,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import "../platform-admin.css";

const navigationItems: DashboardNavigationItem[] = [
  { icon: ShieldCheck, label: "Central de Plataforma", path: "/administracao" },
];

const commandCards: Array<{
  command: PlatformCommand;
  icon: typeof Building2;
  requirement: string;
}> = [
  { command: "provisionOrganization", icon: Building2, requirement: "AAL2 · domínio validado · correlação · idempotência" },
  { command: "grantMembership", icon: UsersRound, requirement: "alçada superior · escopo contido · vigência" },
  { command: "revokeMembership", icon: LockKeyhole, requirement: "motivo · sucessor quando necessário · invalidação" },
  { command: "activateBootstrap", icon: KeyRound, requirement: "segredo interno · e-mail confirmado · MFA · recuperação" },
];

const focusPanels = {
  fundacao: {
    code: "A0",
    title: "Fundação fechada por padrão",
    text: "As tabelas administrativas existem no ambiente isolado, mas não aceitam leitura ou escrita direta do navegador.",
    evidence: "RLS habilitada · grants revogados · policies explícitas de negação · advisor sem avisos",
  },
  sessoes: {
    code: "A1",
    title: "Sessão ainda não é alçada",
    text: "Uma identidade autenticada continuará sem poder administrativo até provar membership, escopo, vigência, MFA e policy no servidor.",
    evidence: "JWT identifica · dado vigente autoriza · UI apenas projeta",
  },
  auditoria: {
    code: "A2",
    title: "Toda decisão precisa deixar rastro",
    text: "A interface exibirá eventos redigidos e correlacionados somente após os comandos transacionais escreverem o audit event no mesmo commit.",
    evidence: "append-only · correlação · alvo redigido · resultado seguro",
  },
} as const;

type FocusKey = keyof typeof focusPanels;

function unavailable(command: PlatformCommand) {
  const state = getPlatformCommandState(command);
  toast.message(`${state.label}: ainda indisponível`, {
    description: state.reason,
  });
}

export default function PlatformAdmin() {
  const [focus, setFocus] = useState<FocusKey>("fundacao");
  const selectedFocus = focusPanels[focus];

  return (
    <DashboardLayout navigationItems={navigationItems} navigationTitle="Plataforma">
      <div className="platform-admin-shell">
        <header className="platform-admin-hero">
          <div className="platform-admin-hero__mark" aria-hidden="true">
            <span>ADM</span>
            <b>00</b>
          </div>
          <div className="platform-admin-hero__copy">
            <p className="platform-admin-eyebrow">CENTRAL DE PLATAFORMA · FUNDAÇÃO GOVERNADA</p>
            <h1>Administração não é atalho. É uma fronteira que precisa provar cada permissão.</h1>
            <p>
              Primeira superfície do Super Admin: pronta para orientar, negar com clareza e revelar evidências;
              ainda sem comandos ativos, dados de locatárias ou bootstrap executado.
            </p>
          </div>
          <aside className="platform-admin-session" aria-label="Estado atual da sessão">
            <div><ShieldCheck size={18} /><span>ESTADO DA FUNDAÇÃO</span></div>
            <strong>Sem principal ativo</strong>
            <p>O acesso privilegiado depende de convite, identidade confirmada, MFA e recuperação registrada.</p>
          </aside>
        </header>

        <section className="platform-admin-metrics" aria-label="Indicadores da central de plataforma">
          <article><span>ORGANIZAÇÕES</span><strong>0</strong><p>Nenhuma locatária provisionada.</p></article>
          <article><span>PRINCIPALS ATIVOS</span><strong>0</strong><p>Bootstrap ainda indisponível.</p></article>
          <article><span>GRANTS TEMPORÁRIOS</span><strong>0</strong><p>Sem alçada ou suporte aberto.</p></article>
          <article><span>EVENTOS ADMIN</span><strong>0</strong><p>Audit log aguarda RPC controlada.</p></article>
        </section>

        <section className="platform-admin-board">
          <div className="platform-admin-board__rail">
            <p>COORDENADA<br /><b>23° 33′ S · 46° 38′ W</b></p>
            <div className="platform-admin-route" aria-hidden="true"><i /><i /><i /><i /></div>
            <p>CAMADA<br /><b>PLATAFORMA</b></p>
          </div>
          <div className="platform-admin-board__body">
            <div className="platform-admin-section-heading">
              <div>
                <p className="platform-admin-eyebrow">LEITURA DE CONTROLE</p>
                <h2>O que precisa ser verdadeiro antes de qualquer botão poder mudar a plataforma.</h2>
              </div>
              <div className="platform-admin-proof"><CheckCircle2 size={18} /><span>Ambiente isolado · advisor sem avisos</span></div>
            </div>

            <div className="platform-admin-focus-tabs" role="tablist" aria-label="Camadas de controle">
              {(Object.keys(focusPanels) as FocusKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={focus === key}
                  className={focus === key ? "is-active" : ""}
                  onClick={() => setFocus(key)}
                >
                  {focusPanels[key].code}
                  <span>{key === "fundacao" ? "Fundação" : key === "sessoes" ? "Sessões" : "Auditoria"}</span>
                </button>
              ))}
            </div>

            <article className="platform-admin-focus-card">
              <div className="platform-admin-focus-card__code">{selectedFocus.code}</div>
              <div>
                <h3>{selectedFocus.title}</h3>
                <p>{selectedFocus.text}</p>
              </div>
              <div className="platform-admin-evidence"><FileSearch size={18} /><span>{selectedFocus.evidence}</span></div>
            </article>
          </div>
        </section>

        <section className="platform-admin-commands" aria-labelledby="platform-commands-title">
          <div className="platform-admin-section-heading">
            <div>
              <p className="platform-admin-eyebrow">COMANDOS SENSÍVEIS · MODO DE ENSAIO</p>
              <h2 id="platform-commands-title">Cada comando já sabe por que ainda deve permanecer bloqueado.</h2>
            </div>
            <p className="platform-admin-muted">O botão explica o pré-requisito; a futura RPC será a autoridade que permitirá ou negará.</p>
          </div>

          <div className="platform-admin-command-grid">
            {commandCards.map(({ command, icon: Icon, requirement }, index) => {
              const state = getPlatformCommandState(command);
              return (
                <article key={command} className="platform-admin-command-card">
                  <div className="platform-admin-command-card__top">
                    <span>0{index + 1}</span>
                    <Icon size={21} />
                  </div>
                  <h3>{state.label}</h3>
                  <p>{state.reason}</p>
                  <small>{requirement}</small>
                  <button type="button" onClick={() => unavailable(command)}>
                    Ver bloqueio <ArrowUpRight size={15} />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="platform-admin-ledger" aria-label="Ledger de prontidão da fundação">
          <div className="platform-admin-ledger__title">
            <ScrollText size={22} />
            <div><p className="platform-admin-eyebrow">LEDGER DE PRONTIDÃO</p><h2>O painel começa com a ausência comprovada, não com números inventados.</h2></div>
          </div>
          <div className="platform-admin-ledger__rows">
            <div><Activity size={17} /><span>Organizações provisionadas</span><b>Sem registros</b><em>Aguarda `provision_organization`</em></div>
            <div><UserRoundCog size={17} /><span>Princípios de plataforma</span><b>Sem registros</b><em>Aguarda bootstrap governado</em></div>
            <div><Clock3 size={17} /><span>Grants e suporte temporário</span><b>Sem registros</b><em>Aguarda alçada e case JIT</em></div>
            <div><AlertTriangle size={17} /><span>Eventos de auditoria</span><b>Sem registros</b><em>Aguarda comandos transacionais</em></div>
          </div>
        </section>

        <footer className="platform-admin-footer-note">
          <LockKeyhole size={17} />
          <p><b>Limite explícito:</b> esta central não lê dossiês, contratos, carteira, pagamentos ou split. Super Admin cuida da plataforma; cada organização continua dona do próprio domínio.</p>
        </footer>
      </div>
    </DashboardLayout>
  );
}
