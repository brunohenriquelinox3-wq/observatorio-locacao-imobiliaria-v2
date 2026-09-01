import DashboardLayout, { type DashboardNavigationItem } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  canLoadAdministrativeState,
  canLoadIdentityState,
  getPlatformCommandState,
  type PlatformCommand,
} from "@/lib/platformAdmin";
import { trpc } from "@/lib/trpc";
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
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { validateIdentitySubmission, type IdentityFormMode } from "@/lib/identityRegistration";
import { genericRecoveryNotice, toMfaQrImageSource, validateTotpCode } from "@/lib/identityMfa";
import { deriveAdministrativeConsoleState } from "@/lib/adminConsole";
import { getPlatformBootstrapPresentation } from "@/lib/platformBootstrapPresentation";
import { getPlatformPrincipalPresentation } from "@/lib/platformPrincipalPresentation";
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
  { command: "activateBootstrap", icon: KeyRound, requirement: "identidade Supabase · MFA · recuperação · ativação posterior" },
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
  const [identityEmail, setIdentityEmail] = useState("");
  const [identityPassword, setIdentityPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [identityFormMode, setIdentityFormMode] = useState<IdentityFormMode>("sign_in");
  const [isConnectingIdentity, setIsConnectingIdentity] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaQrCode, setMfaQrCode] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [isProcessingMfa, setIsProcessingMfa] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);
  const [isRequestingRecovery, setIsRequestingRecovery] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationDomain, setOrganizationDomain] = useState("");
  const [membershipOrganizationId, setMembershipOrganizationId] = useState("");
  const [membershipSubjectId, setMembershipSubjectId] = useState("");
  const [membershipRole, setMembershipRole] = useState("organization_admin");
  const [membershipPurposeCode, setMembershipPurposeCode] = useState("");
  const [membershipModules, setMembershipModules] = useState<Array<"platform" | "vendas_urbanas" | "locacao">>([]);
  const [membershipExpiration, setMembershipExpiration] = useState("");
  const [membershipAction, setMembershipAction] = useState<"suspend" | "revoke">("suspend");
  const [membershipId, setMembershipId] = useState("");
  const [membershipReason, setMembershipReason] = useState("");
  const { isAuthenticated, user } = useAuth();
  const canLoadIdentity = canLoadIdentityState(isAuthenticated);
  const identityQuery = trpc.foundation.identity.useQuery(undefined, { retry: false, enabled: canLoadIdentity });
  const canLoadBootstrapStatus = canLoadIdentity && identityQuery.data?.state === "connected";
  const commandStatusQuery = trpc.foundation.commandStatus.useQuery(undefined, { retry: false, enabled: canLoadBootstrapStatus });
  const canLoadAdministrativeData = canLoadAdministrativeState(isAuthenticated, user?.role) || commandStatusQuery.data?.commandMode === "ready_for_controlled_commands";
  const readinessQuery = trpc.foundation.readiness.useQuery(undefined, { retry: false, enabled: canLoadAdministrativeData });
  const bootstrapMutation = trpc.administration.bootstrap.useMutation({
    onSuccess() {
      toast.success("Principal criado como pendência de ativação", {
        description: "Nenhuma alçada foi ativada. O próximo gate obrigatório é MFA e recuperação.",
      });
      void commandStatusQuery.refetch();
      void readinessQuery.refetch();
    },
    onError() {
      toast.error("Bootstrap não foi liberado", {
        description: "Confirme a identidade Supabase, a ausência de principal anterior e os requisitos de segurança.",
      });
    },
  });
  const activateBootstrapMutation = trpc.administration.activateBootstrap.useMutation({
    onSuccess() {
      toast.success("Principal de plataforma ativado", {
        description: "A ativação foi validada pelo servidor. Organizações e delegações continuam exigindo correlação e policy a cada comando.",
      });
      void commandStatusQuery.refetch();
      void readinessQuery.refetch();
    },
    onError() {
      toast.error("Ativação não liberada", {
        description: "Conclua uma sessão Supabase com MFA TOTP recente e canal de recuperação verificado. Nenhuma alçada foi ampliada.",
      });
    },
  });
  const provisionOrganizationMutation = trpc.administration.provisionOrganization.useMutation({
    onSuccess(result) {
      toast.success("Organização em rascunho criada", { description: `Referência protegida: ${result.organizationId.slice(0, 8)}…` });
      setOrganizationName("");
      setOrganizationDomain("");
      void readinessQuery.refetch();
    },
    onError() {
      toast.error("Organização não criada", { description: "A política não liberou o comando ou os dados precisam de revisão. Nenhum acesso foi ampliado." });
    },
  });
  const delegateMembershipMutation = trpc.administration.delegateMembership.useMutation({
    onSuccess() {
      toast.success("Delegação registrada", { description: "A membership permanece limitada ao escopo, finalidade e vigência enviados." });
      void readinessQuery.refetch();
    },
    onError() {
      toast.error("Delegação não concluída", { description: "Confirme os identificadores, o escopo e a política. Nenhuma alçada foi ampliada." });
    },
  });
  const suspendMembershipMutation = trpc.administration.suspendMembership.useMutation({
    onSuccess() {
      toast.success("Suspensão registrada", { description: "A transição foi controlada pelo servidor e associada a uma correlação." });
      void readinessQuery.refetch();
    },
    onError() {
      toast.error("Suspensão não concluída", { description: "A policy bloqueou o comando ou os dados precisam de revisão." });
    },
  });
  const revokeMembershipMutation = trpc.administration.revokeMembership.useMutation({
    onSuccess() {
      toast.success("Revogação registrada", { description: "A transição foi controlada pelo servidor e associada a uma correlação." });
      void readinessQuery.refetch();
    },
    onError() {
      toast.error("Revogação não concluída", { description: "A policy bloqueou o comando ou os dados precisam de revisão." });
    },
  });
  const selectedFocus = focusPanels[focus];
  const readiness = readinessQuery.data;
  const principalPresentation = getPlatformPrincipalPresentation(commandStatusQuery.data ?? {});
  const metricValue = (value: number | undefined) => {
    if (readinessQuery.isLoading) return "—";
    if (readinessQuery.isError || value === undefined) return "Indisponível";
    return String(value);
  };
  const foundationStatus = readinessQuery.isLoading
    ? "Carregando fundação"
    : readinessQuery.isError
      ? "Leitura indisponível"
      : readiness?.commandMode === "blocked"
        ? "Fundação conectada · comandos bloqueados"
        : readiness?.commandMode === "ready_for_controlled_commands"
          ? principalPresentation.activeFoundationStatus
          : "Estado indisponível";
  const identityStatus = identityQuery.isLoading
    ? "Verificando identidade"
    : identityQuery.data?.state === "connected"
      ? principalPresentation.identityStatus
      : "Identidade Supabase ainda não conectada";
  const canPrepareBootstrap = commandStatusQuery.data?.bootstrapAction === "available";
  const canActivateBootstrap = commandStatusQuery.data?.identityState === "pending_activation" && mfaVerified;
  const bootstrapPresentation = getPlatformBootstrapPresentation({
    identityState: commandStatusQuery.data?.identityState,
    bootstrapAction: commandStatusQuery.data?.bootstrapAction,
    mfaVerified,
    platformRole: commandStatusQuery.data?.platformRole,
  });
  const consoleState = deriveAdministrativeConsoleState(commandStatusQuery.data);

  function executeCommand(command: PlatformCommand) {
    if (command === "activateBootstrap" && canPrepareBootstrap) {
      bootstrapMutation.mutate({ correlationId: crypto.randomUUID() });
      return;
    }
    if (command === "activateBootstrap" && canActivateBootstrap) {
      activateBootstrapMutation.mutate({ correlationId: crypto.randomUUID() });
      return;
    }
    unavailable(command);
  }

  async function connectSupabaseIdentity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) {
      toast.error("Identidade Supabase indisponível", {
        description: "A configuração pública não está disponível neste ambiente.",
      });
      return;
    }

    const validationError = validateIdentitySubmission({
      mode: identityFormMode,
      email: identityEmail,
      password: identityPassword,
      passwordConfirmation,
    });
    if (validationError) {
      toast.error("Revise os dados de identidade", { description: validationError });
      return;
    }

    setIsConnectingIdentity(true);
    try {
      const { error } = identityFormMode === "sign_in"
        ? await client.auth.signInWithPassword({ email: identityEmail.trim(), password: identityPassword })
        : await client.auth.signUp({
            email: identityEmail.trim(),
            password: identityPassword,
            options: { emailRedirectTo: `${window.location.origin}/administracao` },
          });
      if (error) throw error;
      setIdentityPassword("");
      setPasswordConfirmation("");
      await Promise.all([identityQuery.refetch(), commandStatusQuery.refetch()]);
      toast.success(identityFormMode === "sign_in" ? "Identidade Supabase conectada" : "Cadastro iniciado", {
        description: identityFormMode === "sign_in"
          ? "A sessão não concede alçada. Bootstrap, MFA, recuperação e grant continuam obrigatórios."
          : "Se a confirmação por e-mail estiver habilitada, conclua-a no provedor. Nenhuma alçada foi criada.",
      });
    } catch {
      toast.error("Não foi possível confirmar a identidade", {
        description: "Verifique as credenciais no provedor de identidade. Nenhuma permissão foi criada ou alterada.",
      });
    } finally {
      setIsConnectingIdentity(false);
    }
  }

  async function beginMfaEnrollment() {
    const client = getSupabaseBrowserClient();
    if (!client || identityQuery.data?.state !== "connected") {
      toast.error("Conecte a identidade antes de preparar MFA.");
      return;
    }

    setIsProcessingMfa(true);
    try {
      const { data: factors, error: factorsError } = await client.auth.mfa.listFactors();
      if (factorsError) throw factorsError;
      const existingFactor = factors.totp[0];
      if (existingFactor) {
        setMfaFactorId(existingFactor.id);
        setMfaQrCode(null);
        toast.message("Fator MFA encontrado", { description: "Informe o código atual do autenticador para verificar esta sessão." });
        return;
      }

      const { data, error } = await client.auth.mfa.enroll({ factorType: "totp" });
      if (error) throw error;
      setMfaFactorId(data.id);
      setMfaQrCode(data.totp.qr_code);
      toast.message("MFA preparado", { description: "Leia o QR code no autenticador e confirme o código. A alçada continua bloqueada." });
    } catch {
      toast.error("Não foi possível preparar MFA", { description: "Nenhuma alçada ou acesso administrativo foi alterado." });
    } finally {
      setIsProcessingMfa(false);
    }
  }

  async function verifyMfa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    const validationError = validateTotpCode(mfaCode);
    if (!client || !mfaFactorId || validationError) {
      toast.error("Não foi possível verificar MFA", { description: validationError ?? "Prepare o fator MFA antes de informar o código." });
      return;
    }

    setIsProcessingMfa(true);
    try {
      const { data: challenge, error: challengeError } = await client.auth.mfa.challenge({ factorId: mfaFactorId });
      if (challengeError) throw challengeError;
      const { data: verifiedSession, error } = await client.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.id, code: mfaCode.trim() });
      if (error) throw error;
      if (!verifiedSession?.access_token || !verifiedSession.refresh_token) throw new Error("MFA_SESSION_REFRESH_REQUIRED");
      const { error: setSessionError } = await client.auth.setSession({
        access_token: verifiedSession.access_token,
        refresh_token: verifiedSession.refresh_token,
      });
      if (setSessionError) throw setSessionError;
      setMfaCode("");
      setMfaVerified(true);
      setMfaQrCode(null);
      await Promise.all([identityQuery.refetch(), commandStatusQuery.refetch()]);
      toast.success("MFA verificado", { description: "A sessão foi reforçada, mas ativação e alçadas continuam sujeitas à política do servidor." });
    } catch {
      toast.error("Código MFA não confirmado", { description: "Tente um novo código do autenticador. Nenhuma alçada foi modificada." });
    } finally {
      setIsProcessingMfa(false);
    }
  }

  async function requestRecovery() {
    const client = getSupabaseBrowserClient();
    if (!client || !/^\S+@\S+\.\S+$/.test(identityEmail.trim())) {
      toast.error("Informe o e-mail da identidade para solicitar recuperação.");
      return;
    }
    setIsRequestingRecovery(true);
    try {
      const { error } = await client.auth.resetPasswordForEmail(identityEmail.trim(), {
        redirectTo: `${window.location.origin}/ativar-conta`,
      });
      if (error) throw error;
      toast.message("Solicitação processada", { description: genericRecoveryNotice });
    } catch {
      toast.error("Não foi possível processar a solicitação", { description: "Tente novamente mais tarde. Nenhuma alçada foi modificada." });
    } finally {
      setIsRequestingRecovery(false);
    }
  }

  function explainConsoleGate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.message(consoleState.title, { description: consoleState.description });
  }

  function toggleMembershipModule(module: "platform" | "vendas_urbanas" | "locacao") {
    setMembershipModules((current) => current.includes(module) ? current.filter((item) => item !== module) : [...current, module]);
  }

  function submitOrganization(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consoleState.isCommandFormAvailable) return explainConsoleGate(event);
    provisionOrganizationMutation.mutate({
      name: organizationName,
      domain: organizationDomain.trim() || undefined,
      correlationId: crypto.randomUUID(),
    });
  }

  function submitMembership(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consoleState.isCommandFormAvailable) return explainConsoleGate(event);
    if (membershipModules.length === 0) {
      toast.error("Selecione ao menos um módulo", { description: "A delegação precisa ser limitada a um escopo explícito." });
      return;
    }
    delegateMembershipMutation.mutate({
      organizationId: membershipOrganizationId,
      subjectId: membershipSubjectId,
      role: membershipRole as "organization_admin" | "area_admin" | "operator",
      scopeSelector: { modules: membershipModules },
      purposeCode: membershipPurposeCode,
      expiresAt: membershipExpiration ? new Date(membershipExpiration).toISOString() : undefined,
      correlationId: crypto.randomUUID(),
    });
  }

  function submitMembershipEnd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consoleState.isCommandFormAvailable) return explainConsoleGate(event);
    const input = { membershipId, reasonCode: membershipReason, correlationId: crypto.randomUUID() };
    if (membershipAction === "suspend") suspendMembershipMutation.mutate(input);
    else revokeMembershipMutation.mutate(input);
  }

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
              {bootstrapPresentation.heroText}
            </p>
          </div>
          <aside className="platform-admin-session" aria-label="Estado atual da sessão">
            <div><ShieldCheck size={18} /><span>ESTADO DA FUNDAÇÃO</span></div>
            <strong>{foundationStatus}</strong>
            <p>{principalPresentation.isPlatformSuperAdmin ? "O papel de plataforma está ativo. Organizações, memberships e grants delegados continuam exigindo policy, escopo e correlação." : `${identityStatus}. O acesso privilegiado depende de convite, MFA, recuperação e alçada vigente.`}</p>
          </aside>
        </header>

        <section className="platform-admin-identity" aria-labelledby="identity-title">
          <div>
            <p className="platform-admin-eyebrow">IDENTIDADE DE FUNDAÇÃO · ETAPA CONTROLADA</p>
            <h2 id="identity-title">Conecte a identidade que poderá iniciar o bootstrap, sem ganhar privilégio automático.</h2>
            <p>
              A conexão só consulta o provedor; o cadastro é uma ação manual explícita. Nenhuma opção envia convite,
              atribui papel administrativo ou ativa alçada por e-mail.
            </p>
          </div>
          <form onSubmit={connectSupabaseIdentity} className="platform-admin-identity__form">
            <fieldset className="platform-admin-identity__mode">
              <legend>Modo de identidade</legend>
              <label><input type="radio" name="identity-mode" checked={identityFormMode === "sign_in"} onChange={() => setIdentityFormMode("sign_in")} /> Conectar</label>
              <label><input type="radio" name="identity-mode" checked={identityFormMode === "sign_up"} onChange={() => setIdentityFormMode("sign_up")} /> Criar identidade</label>
            </fieldset>
            <label htmlFor="supabase-email">E-mail da identidade Supabase</label>
            <input
              id="supabase-email"
              type="email"
              autoComplete="email"
              value={identityEmail}
              onChange={(event) => setIdentityEmail(event.target.value)}
              required
            />
            <label htmlFor="supabase-password">Senha</label>
            <input
              id="supabase-password"
              type="password"
              autoComplete="current-password"
              value={identityPassword}
              onChange={(event) => setIdentityPassword(event.target.value)}
              required
            />
            {identityFormMode === "sign_up" && (
              <>
                <label htmlFor="supabase-password-confirmation">Confirmar senha</label>
                <input
                  id="supabase-password-confirmation"
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  required
                />
              </>
            )}
            <button type="submit" disabled={isConnectingIdentity}>
              {isConnectingIdentity ? "Confirmando identidade" : identityFormMode === "sign_in" ? "Conectar identidade" : "Criar identidade"} <ArrowUpRight size={15} />
            </button>
          </form>
        </section>

        <section className="platform-admin-security" aria-labelledby="mfa-title">
          <div>
            <p className="platform-admin-eyebrow">SESSÃO REFORÇADA · MFA E RECUPERAÇÃO</p>
            <h2 id="mfa-title">A identidade deve provar o segundo fator antes de poder solicitar ativação.</h2>
            <p>MFA e recuperação pertencem à identidade autenticada; não concedem papel, organização, grant ou comando administrativo.</p>
          </div>
          <div className="platform-admin-security__actions">
            <button type="button" onClick={beginMfaEnrollment} disabled={isProcessingMfa || mfaVerified}>
              {mfaVerified ? "MFA verificado nesta sessão" : isProcessingMfa ? "Preparando MFA" : "Preparar MFA"}
            </button>
            <button type="button" className="is-quiet" onClick={requestRecovery} disabled={isRequestingRecovery}>
              {isRequestingRecovery ? "Processando" : "Solicitar recuperação"}
            </button>
          </div>
          {mfaQrCode && <img className="platform-admin-security__qr" src={toMfaQrImageSource(mfaQrCode)} alt="QR code para cadastrar o fator TOTP no aplicativo autenticador" />}
          {mfaFactorId && !mfaVerified && (
            <form onSubmit={verifyMfa} className="platform-admin-security__verify">
              <label htmlFor="supabase-mfa-code">Código do autenticador</label>
              <input id="supabase-mfa-code" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={mfaCode} onChange={(event) => setMfaCode(event.target.value)} />
              <button type="submit" disabled={isProcessingMfa}>{isProcessingMfa ? "Verificando" : "Verificar MFA"}</button>
            </form>
          )}
        </section>

        <section className="platform-admin-activation" aria-labelledby="activation-title">
          <div>
            <p className="platform-admin-eyebrow">ATIVAÇÃO EXPLÍCITA · GATE DO SERVIDOR</p>
            <h2 id="activation-title">MFA não vira privilégio sem uma atestação recente e uma decisão transacional.</h2>
            <p>O botão não interpreta código, JWT ou papel. Ele pede ao servidor que confirme AAL2, TOTP recente, identidade pendente e canal de recuperação verificado no mesmo comando.</p>
          </div>
          <div className="platform-admin-activation__action">
            <strong>{principalPresentation.isPlatformSuperAdmin ? principalPresentation.activationHeadline : bootstrapPresentation.headline}</strong>
            <button type="button" onClick={() => executeCommand("activateBootstrap")} disabled={bootstrapPresentation.actionDisabled || bootstrapMutation.isPending || activateBootstrapMutation.isPending}>
              {bootstrapMutation.isPending ? "Preparando bootstrap" : activateBootstrapMutation.isPending ? "Atestando e ativando" : bootstrapPresentation.actionLabel}
              <ArrowUpRight size={15} />
            </button>
          </div>
        </section>

        <section className="platform-admin-metrics" aria-label="Indicadores da central de plataforma">
          <article><span>ORGANIZAÇÕES</span><strong>{metricValue(readiness?.counts.organizations)}</strong><p>Leitura agregada; provisionamento permanece bloqueado.</p></article>
          <article><span>PRINCIPALS ATIVOS</span><strong>{metricValue(readiness?.counts.principals)}</strong><p>{bootstrapPresentation.principalMetricText}</p></article>
          <article><span>GRANTS TEMPORÁRIOS</span><strong>{metricValue(readiness?.counts.grants)}</strong><p>Leitura de alçada sem expor escopo individual.</p></article>
          <article><span>EVENTOS ADMIN</span><strong>{metricValue(readiness?.counts.auditEvents)}</strong><p>Audit log aguarda RPC controlada.</p></article>
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
              const isCompletedBootstrap = command === "activateBootstrap" && principalPresentation.isPlatformSuperAdmin;
              return (
                <article key={command} className="platform-admin-command-card">
                  <div className="platform-admin-command-card__top">
                    <span>0{index + 1}</span>
                    <Icon size={21} />
                  </div>
                  <h3>{isCompletedBootstrap ? principalPresentation.bootstrapCardLabel : state.label}</h3>
                  <p>{isCompletedBootstrap ? principalPresentation.bootstrapCardReason : state.reason}</p>
                  <small>{requirement}</small>
                  <button
                    type="button"
                    onClick={() => executeCommand(command)}
                    disabled={isCompletedBootstrap || (command === "activateBootstrap" && bootstrapMutation.isPending)}
                  >
                    {isCompletedBootstrap ? "Concluído" : command === "activateBootstrap" && canPrepareBootstrap ? "Preparar pendência" : command === "activateBootstrap" && canActivateBootstrap ? "Pedir ativação" : "Ver bloqueio"} <ArrowUpRight size={15} />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="platform-admin-console" aria-labelledby="console-title">
          <div className="platform-admin-section-heading">
            <div>
              <p className="platform-admin-eyebrow">CONSOLE TRANSACIONAL · GATE POR POLICY</p>
              <h2 id="console-title">Prepare o comando antes de poder enviá-lo.</h2>
            </div>
            <p className="platform-admin-muted">{consoleState.title}: {consoleState.description}</p>
          </div>
          <div className="platform-admin-console__grid" aria-disabled={!consoleState.isCommandFormAvailable}>
            <form onSubmit={submitOrganization} className="platform-admin-console__form">
              <div className="platform-admin-console__form-title"><Building2 size={18} /><h3>Nova organização</h3></div>
              <p>Cria somente uma organização em rascunho quando a política do servidor permitir.</p>
              <label htmlFor="organization-name">Nome da organização</label>
              <input id="organization-name" value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="Ex.: Imobiliária Horizonte" disabled={!consoleState.isCommandFormAvailable} required />
              <label htmlFor="organization-domain">Domínio autorizado <span>opcional</span></label>
              <input id="organization-domain" value={organizationDomain} onChange={(event) => setOrganizationDomain(event.target.value)} placeholder="empresa.example" disabled={!consoleState.isCommandFormAvailable} />
              <button type="submit" disabled={!consoleState.isCommandFormAvailable || provisionOrganizationMutation.isPending}>{provisionOrganizationMutation.isPending ? "Criando rascunho" : "Validar e criar rascunho"} <ArrowUpRight size={15} /></button>
            </form>

            <form onSubmit={submitMembership} className="platform-admin-console__form">
              <div className="platform-admin-console__form-title"><UsersRound size={18} /><h3>Delegar membership</h3></div>
              <p>Exige identidade existente, escopo limitado, finalidade, vigência e correlação.</p>
              <label htmlFor="membership-organization">ID da organização</label>
              <input id="membership-organization" value={membershipOrganizationId} onChange={(event) => setMembershipOrganizationId(event.target.value)} placeholder="UUID da organização" disabled={!consoleState.isCommandFormAvailable} required />
              <label htmlFor="membership-subject">ID da identidade</label>
              <input id="membership-subject" value={membershipSubjectId} onChange={(event) => setMembershipSubjectId(event.target.value)} placeholder="UUID autenticado" disabled={!consoleState.isCommandFormAvailable} required />
              <label htmlFor="membership-role">Papel contido</label>
              <select id="membership-role" value={membershipRole} onChange={(event) => setMembershipRole(event.target.value)} disabled={!consoleState.isCommandFormAvailable}>
                <option value="organization_admin">Administrador da organização</option>
                <option value="area_admin">Administrador de área</option>
                <option value="operator">Operador</option>
              </select>
              <label htmlFor="membership-purpose">Finalidade</label>
              <input id="membership-purpose" value={membershipPurposeCode} onChange={(event) => setMembershipPurposeCode(event.target.value)} disabled={!consoleState.isCommandFormAvailable} required />
              <fieldset className="platform-admin-console__scope">
                <legend>Módulos no escopo</legend>
                {(["platform", "vendas_urbanas", "locacao"] as const).map((module) => (
                  <label key={module}><input type="checkbox" checked={membershipModules.includes(module)} onChange={() => toggleMembershipModule(module)} disabled={!consoleState.isCommandFormAvailable} /> {module === "platform" ? "Plataforma" : module === "vendas_urbanas" ? "Vendas Urbanas" : "Locação"}</label>
                ))}
              </fieldset>
              <label htmlFor="membership-expiration">Vigência <span>opcional</span></label>
              <input id="membership-expiration" type="datetime-local" value={membershipExpiration} onChange={(event) => setMembershipExpiration(event.target.value)} disabled={!consoleState.isCommandFormAvailable} />
              <button type="submit" disabled={!consoleState.isCommandFormAvailable || delegateMembershipMutation.isPending}>{delegateMembershipMutation.isPending ? "Validando delegação" : "Validar delegação"} <ArrowUpRight size={15} /></button>
            </form>

            <form onSubmit={submitMembershipEnd} className="platform-admin-console__form">
              <div className="platform-admin-console__form-title"><LockKeyhole size={18} /><h3>Suspender ou revogar</h3></div>
              <p>O motivo é obrigatório e a ação só pode atuar em uma membership localizada pelo servidor.</p>
              <fieldset className="platform-admin-identity__mode">
                <legend>Decisão</legend>
                <label><input type="radio" name="membership-action" checked={membershipAction === "suspend"} onChange={() => setMembershipAction("suspend")} disabled={!consoleState.isCommandFormAvailable} /> Suspender</label>
                <label><input type="radio" name="membership-action" checked={membershipAction === "revoke"} onChange={() => setMembershipAction("revoke")} disabled={!consoleState.isCommandFormAvailable} /> Revogar</label>
              </fieldset>
              <label htmlFor="membership-id">ID da membership</label>
              <input id="membership-id" value={membershipId} onChange={(event) => setMembershipId(event.target.value)} placeholder="UUID da membership" disabled={!consoleState.isCommandFormAvailable} required />
              <label htmlFor="membership-reason">Motivo em código</label>
              <input id="membership-reason" value={membershipReason} onChange={(event) => setMembershipReason(event.target.value.toUpperCase())} placeholder="EX.: ACESSO_ENCERRADO" disabled={!consoleState.isCommandFormAvailable} required />
              <button type="submit" disabled={!consoleState.isCommandFormAvailable || suspendMembershipMutation.isPending || revokeMembershipMutation.isPending}>{suspendMembershipMutation.isPending || revokeMembershipMutation.isPending ? "Validando transição" : `Validar ${membershipAction === "suspend" ? "suspensão" : "revogação"}`} <ArrowUpRight size={15} /></button>
            </form>
          </div>
        </section>

        <section className="platform-admin-ledger" aria-label="Ledger de prontidão da fundação">
          <div className="platform-admin-ledger__title">
            <ScrollText size={22} />
            <div><p className="platform-admin-eyebrow">LEDGER DE PRONTIDÃO</p><h2>O painel começa com a ausência comprovada, não com números inventados.</h2></div>
          </div>
          <div className="platform-admin-ledger__rows">
            <div><Activity size={17} /><span>Organizações cadastradas</span><b>{readiness?.counts.organizations ? `${readiness.counts.organizations} registro(s)` : "Sem registros"}</b><em>Leitura agregada; o provisionamento continua protegido.</em></div>
            <div><UserRoundCog size={17} /><span>Princípios de plataforma</span><b>{readiness?.counts.principals ? `${readiness.counts.principals} ativo(s)` : "Sem registros"}</b><em>{bootstrapPresentation.ledgerPrincipalText}</em></div>
            <div><Clock3 size={17} /><span>Grants e suporte temporário</span><b>{readiness?.counts.grants ? `${readiness.counts.grants} registro(s)` : "Sem registros"}</b><em>Delegações exigem escopo, finalidade, vigência e policy.</em></div>
            <div><AlertTriangle size={17} /><span>Eventos de auditoria</span><b>{readiness?.counts.auditEvents ? `${readiness.counts.auditEvents} registro(s)` : "Sem registros"}</b><em>Contagem agregada; eventos permanecem redigidos.</em></div>
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
