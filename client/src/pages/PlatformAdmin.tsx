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
import { getPlatformIdentityPresentation } from "@/lib/platformIdentityPresentation";
import { validateMembershipEndReason } from "@/lib/membershipEndReasonValidation";
import { getPlatformPrincipalPresentation } from "@/lib/platformPrincipalPresentation";
import { getPlatformGovernanceOverview } from "@/lib/platformGovernanceOverview";
import { WorkforceManagementPanel } from "@/components/WorkforceManagementPanel";
import { ReportExportActions } from "@/components/ReportExportActions";
import "../platform-admin.css";
import { getMfaAttestedCommandState } from "@/lib/adminMfaCommandGuard";

const navigationItems: DashboardNavigationItem[] = [
  { icon: ShieldCheck, label: "Central de Plataforma", path: "/administracao" },
  { icon: UserRoundCog, label: "Painel ADM", path: "/adm" },
  { icon: Building2, label: "Loteadora", path: "/loteadora" },
  { icon: UsersRound, label: "Vendas Urbanas", path: "/vendas-urbanas" },
  { icon: Clock3, label: "Locação", path: "/locacao" },
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
  const [selfAdministrationOrganizationId, setSelfAdministrationOrganizationId] = useState("");
  const [organizationActivationId, setOrganizationActivationId] = useState("");
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
  const selfAdministrationTargetsQuery = trpc.administration.listSelfAdministrationOrganizationTargets.useQuery(undefined, {
    retry: false,
    enabled: canLoadAdministrativeData && commandStatusQuery.data?.platformRole === "platform_super_admin",
  });
  const activatableOrganizationsQuery = trpc.administration.listActivatableOrganizations.useQuery(undefined, {
    retry: false,
    enabled: canLoadAdministrativeData && commandStatusQuery.data?.platformRole === "platform_super_admin",
  });
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
  const activateSelfOrganizationAdminMutation = trpc.administration.activateSelfOrganizationAdmin.useMutation({
    onSuccess() {
      toast.success("ADM organizacional ativado", {
        description: "A mesma identidade SUPER ADM recebeu uma membership ativa e três escopos iniciais: Loteadora, Vendas Urbanas e Locação.",
      });
      setSelfAdministrationOrganizationId("");
      void Promise.all([readinessQuery.refetch(), selfAdministrationTargetsQuery.refetch()]);
    },
    onError() {
      toast.error("ADM organizacional não ativado", {
        description: "O servidor exige SUPER ADM ativo, MFA TOTP recente, recuperação verificada e uma organização elegível sem membership anterior.",
      });
    },
  });
  const activateOrganizationMutation = trpc.administration.activateOrganization.useMutation({
    onSuccess() {
      toast.success("Organização ativada", { description: "A organização está ativa; a membership ADM e os escopos já aprovados foram preservados sem ampliação adicional." });
      setOrganizationActivationId("");
      void Promise.all([readinessQuery.refetch(), activatableOrganizationsQuery.refetch()]);
    },
    onError() {
      toast.error("Ativação não concluída", { description: "O servidor exige SUPER ADM ativo, MFA TOTP recente e uma membership ADM ativa na organização em rascunho." });
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
  const foundationStatus = commandStatusQuery.isLoading
    ? "Carregando fundação"
    : commandStatusQuery.isError
      ? "Leitura indisponível"
      : commandStatusQuery.data?.commandMode === "blocked"
        ? "Fundação conectada · comandos bloqueados"
        : commandStatusQuery.data?.commandMode === "ready_for_controlled_commands"
          ? principalPresentation.activeFoundationStatus
          : "Estado indisponível";
  const identityStatus = identityQuery.isLoading
    ? "Verificando identidade"
    : identityQuery.data?.state === "connected"
      ? principalPresentation.identityStatus
      : "Identidade Supabase ainda não conectada";
  const identityPresentation = getPlatformIdentityPresentation(identityQuery.data?.state);
  const canPrepareBootstrap = commandStatusQuery.data?.bootstrapAction === "available";
  const canActivateBootstrap = commandStatusQuery.data?.identityState === "pending_activation" && mfaVerified;
  const bootstrapPresentation = getPlatformBootstrapPresentation({
    identityState: commandStatusQuery.data?.identityState,
    bootstrapAction: commandStatusQuery.data?.bootstrapAction,
    mfaVerified,
    platformRole: commandStatusQuery.data?.platformRole,
  });
  const consoleState = deriveAdministrativeConsoleState(commandStatusQuery.data);
  const mfaAttestedCommandState = getMfaAttestedCommandState({
    consoleAvailable: consoleState.isCommandFormAvailable,
    sessionMfaVerified: mfaVerified,
  });
  const governanceOverview = getPlatformGovernanceOverview({
    isPlatformSuperAdmin: principalPresentation.isPlatformSuperAdmin,
    organizations: readiness?.counts.organizations,
    principals: readiness?.counts.principals,
    grants: readiness?.counts.grants,
  });
  const reportRows = [
    { section: "Fundação", indicator: "Estado", status: foundationStatus },
    { section: "Governança", indicator: "Organizações", status: metricValue(readiness?.counts.organizations) },
    { section: "Governança", indicator: "Principals ativos", status: metricValue(readiness?.counts.principals) },
    { section: "Governança", indicator: "Grants temporários", status: metricValue(readiness?.counts.grants) },
  ];

  function executeCommand(command: PlatformCommand) {
    if (command === "grantMembership" && principalPresentation.isPlatformSuperAdmin) {
      document.getElementById("self-administration-organization")?.focus();
      return;
    }
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
    if (!client) {
      toast.error("Não foi possível processar a solicitação", { description: "A identidade precisa estar conectada nesta sessão." });
      return;
    }
    setIsRequestingRecovery(true);
    try {
      let recoveryEmail = identityEmail.trim();
      if (!recoveryEmail) {
        const { data, error } = await client.auth.getUser();
        if (error) throw error;
        recoveryEmail = data.user?.email?.trim() ?? "";
      }
      if (!/^\S+@\S+\.\S+$/.test(recoveryEmail)) throw new Error("IDENTITY_EMAIL_UNAVAILABLE");
      const { error } = await client.auth.resetPasswordForEmail(recoveryEmail, {
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

  function activateSelfOrganizationAdmin() {
    if (!mfaAttestedCommandState.allowed) {
      toast.message(mfaAttestedCommandState.title, { description: mfaAttestedCommandState.description });
      return;
    }
    if (!selfAdministrationOrganizationId) {
      toast.error("Selecione a organização", { description: "A autoatribuição só pode atuar em uma organização elegível escolhida explicitamente." });
      return;
    }
    activateSelfOrganizationAdminMutation.mutate({
      organizationId: selfAdministrationOrganizationId,
      correlationId: crypto.randomUUID(),
    });
  }

  function submitSelfOrganizationAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    activateSelfOrganizationAdmin();
  }

  function activateOrganization() {
    if (!mfaAttestedCommandState.allowed) {
      toast.message(mfaAttestedCommandState.title, { description: mfaAttestedCommandState.description });
      return;
    }
    if (!organizationActivationId) {
      toast.error("Selecione a organização", { description: "A ativação só pode atuar em uma organização em rascunho com membership ADM ativa." });
      return;
    }
    activateOrganizationMutation.mutate({ organizationId: organizationActivationId, correlationId: crypto.randomUUID() });
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

  function submitMembershipEnd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consoleState.isCommandFormAvailable) return explainConsoleGate(event);
    const validation = validateMembershipEndReason(membershipReason);
    if (!validation.valid) { toast.error("Motivo em código inválido", { description: validation.message }); return; }
    const input = { membershipId, reasonCode: validation.value, correlationId: crypto.randomUUID() };
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
            {principalPresentation.isPlatformSuperAdmin && selfAdministrationTargetsQuery.data && selfAdministrationTargetsQuery.data.length > 0 && (
              <div className="platform-admin-session__activation">
                <label htmlFor="hero-self-administration-organization">Ativar ADM completo</label>
                <select
                  id="hero-self-administration-organization"
                  value={selfAdministrationOrganizationId}
                  onChange={(event) => setSelfAdministrationOrganizationId(event.target.value)}
                  disabled={selfAdministrationTargetsQuery.isLoading || activateSelfOrganizationAdminMutation.isPending}
                >
                  <option value="">Selecione a organização</option>
                  {selfAdministrationTargetsQuery.data?.map((organization) => (
                    <option key={organization.organizationId} value={organization.organizationId}>
                      {organization.organizationLabel} · {organization.organizationState === "draft" ? "rascunho" : "ativa"}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={activateSelfOrganizationAdmin} disabled={!selfAdministrationOrganizationId || !mfaAttestedCommandState.allowed || activateSelfOrganizationAdminMutation.isPending}>
                  {activateSelfOrganizationAdminMutation.isPending ? "Ativando ADM" : "Ativar pacote completo"}
                </button>
              </div>
            )}
            {principalPresentation.isPlatformSuperAdmin && activatableOrganizationsQuery.data && activatableOrganizationsQuery.data.length > 0 && (
              <div className="platform-admin-session__activation">
                <label htmlFor="organization-activation-target">Ativar organização</label>
                <select
                  id="organization-activation-target"
                  value={organizationActivationId}
                  onChange={(event) => setOrganizationActivationId(event.target.value)}
                  disabled={activatableOrganizationsQuery.isLoading || activateOrganizationMutation.isPending}
                >
                  <option value="">Selecione a organização</option>
                  {activatableOrganizationsQuery.data?.map((organization) => (
                    <option key={organization.organizationId} value={organization.organizationId}>{organization.organizationLabel} · rascunho</option>
                  ))}
                </select>
                <button type="button" onClick={activateOrganization} disabled={!organizationActivationId || !mfaAttestedCommandState.allowed || activateOrganizationMutation.isPending}>
                  {activateOrganizationMutation.isPending ? "Ativando organização" : "Ativar organização"}
                </button>
              </div>
            )}
          </aside>
        </header>

        <section className="platform-admin-governance" aria-labelledby="governance-title">
          <div className="platform-admin-section-heading">
            <div><p className="platform-admin-eyebrow">MAPA DE GOVERNANÇA · SUPER ADM ACIMA DO ADM</p><h2 id="governance-title">Uma hierarquia visível antes de qualquer decisão operacional.</h2></div>
            <p className="platform-admin-muted">A plataforma governa; a organização opera; o módulo limita o trabalho. Nenhuma camada substitui a outra.</p>
          </div>
          <div className="platform-admin-governance__grid">
            {governanceOverview.map((item) => <article key={item.code}><span>{item.code}</span><strong>{item.title}</strong><b>{item.value}</b><p>{item.detail}</p></article>)}
          </div>
          <div className="platform-admin-governance__route"><span>PRÓXIMA LEITURA OPERACIONAL</span><a href="/adm">Abrir Painel ADM <ArrowUpRight size={15} /></a><small>O painel ADM organiza as frentes liberadas sem receber alçada automática.</small></div>
        </section>

        <section className="platform-admin-identity" aria-labelledby="identity-title">
          <div>
            <p className="platform-admin-eyebrow">IDENTIDADE DE FUNDAÇÃO · ETAPA CONTROLADA</p>
            <h2 id="identity-title">{identityPresentation.title}</h2>
            <p>{identityPresentation.description}</p>
          </div>
          {identityPresentation.isConnected ? (
            <div className="platform-admin-identity__connected" aria-live="polite">
              <ShieldCheck size={18} />
              <span>Identidade conectada. Nenhum e-mail, senha ou identificador é exibido nesta área.</span>
            </div>
          ) : <form onSubmit={connectSupabaseIdentity} className="platform-admin-identity__form">
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
          </form>}
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

        <ReportExportActions report={{ title: "Resumo da Central de Plataforma", scopeLabel: "Leitura agregada de governança", rows: reportRows }} isAuthorized={principalPresentation.isPlatformSuperAdmin && canLoadAdministrativeData} description="Exporte somente métricas agregadas e estados redigidos da Central de Plataforma." />

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
              <p className="platform-admin-eyebrow">COMANDOS GOVERNADOS · AÇÃO EXPLÍCITA</p>
              <h2 id="platform-commands-title">Cada mudança material continua limitada por pré-requisito, policy e correlação.</h2>
            </div>
            <p className="platform-admin-muted">A interface apresenta o caminho; o servidor permanece a única autoridade que permite ou nega o comando.</p>
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
                  <h3>{isCompletedBootstrap ? principalPresentation.bootstrapCardLabel : command === "grantMembership" && principalPresentation.isPlatformSuperAdmin ? "Ativar ADM completo" : state.label}</h3>
                  <p>{isCompletedBootstrap ? principalPresentation.bootstrapCardReason : command === "grantMembership" && principalPresentation.isPlatformSuperAdmin ? "Abre a autoatribuição do ADM da organização para a mesma identidade SUPER ADM, com escopos explícitos e MFA no servidor." : state.reason}</p>
                  <small>{command === "grantMembership" && principalPresentation.isPlatformSuperAdmin ? "Loteadora · Vendas Urbanas · Locação · MFA recente" : requirement}</small>
                  <button
                    type="button"
                    onClick={() => executeCommand(command)}
                    disabled={isCompletedBootstrap || (command === "activateBootstrap" && bootstrapMutation.isPending)}
                  >
                    {isCompletedBootstrap ? "Concluído" : command === "grantMembership" && principalPresentation.isPlatformSuperAdmin ? "Abrir ativação" : command === "activateBootstrap" && canPrepareBootstrap ? "Preparar pendência" : command === "activateBootstrap" && canActivateBootstrap ? "Pedir ativação" : "Ver bloqueio"} <ArrowUpRight size={15} />
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
            <form onSubmit={submitSelfOrganizationAdmin} className="platform-admin-console__form">
              <div className="platform-admin-console__form-title"><UsersRound size={18} /><h3>Ativar ADM completo</h3></div>
              <p>Somente para a própria identidade SUPER ADM, com membership ativa e escopos iniciais em Loteadora, Vendas Urbanas e Locação.</p>
              <label htmlFor="self-administration-organization">Organização elegível</label>
              <select
                id="self-administration-organization"
                value={selfAdministrationOrganizationId}
                onChange={(event) => setSelfAdministrationOrganizationId(event.target.value)}
                disabled={!consoleState.isCommandFormAvailable || selfAdministrationTargetsQuery.isLoading || activateSelfOrganizationAdminMutation.isPending}
                required
              >
                <option value="">Selecione uma organização</option>
                {selfAdministrationTargetsQuery.data?.map((organization) => (
                  <option key={organization.organizationId} value={organization.organizationId}>
                    {organization.organizationLabel} · {organization.organizationState === "draft" ? "rascunho" : "ativa"}
                  </option>
                ))}
              </select>
              <p className="platform-admin-muted">Finalidade fixa: CADASTRO_INICIAL. Nenhum financeiro, contrato, pagamento ou acesso de terceiro é criado.</p>
              <button type="submit" disabled={!selfAdministrationOrganizationId || !mfaAttestedCommandState.allowed || activateSelfOrganizationAdminMutation.isPending}>
                {activateSelfOrganizationAdminMutation.isPending ? "Ativando ADM" : "Ativar pacote completo"} <ArrowUpRight size={15} />
              </button>
            </form>

            <form onSubmit={submitOrganization} className="platform-admin-console__form">
              <div className="platform-admin-console__form-title"><Building2 size={18} /><h3>Nova organização</h3></div>
              <p>Cria somente uma organização em rascunho quando a política do servidor permitir.</p>
              <label htmlFor="organization-name">Nome da organização</label>
              <input id="organization-name" value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="Ex.: Imobiliária Horizonte" disabled={!consoleState.isCommandFormAvailable} required />
              <label htmlFor="organization-domain">Domínio autorizado <span>opcional</span></label>
              <input id="organization-domain" value={organizationDomain} onChange={(event) => setOrganizationDomain(event.target.value)} placeholder="empresa.example" disabled={!consoleState.isCommandFormAvailable} />
              <button type="submit" disabled={!consoleState.isCommandFormAvailable || provisionOrganizationMutation.isPending}>{provisionOrganizationMutation.isPending ? "Criando rascunho" : "Validar e criar rascunho"} <ArrowUpRight size={15} /></button>
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

        <WorkforceManagementPanel mode="platform" canPrepare={principalPresentation.isPlatformSuperAdmin && mfaAttestedCommandState.allowed} />

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
