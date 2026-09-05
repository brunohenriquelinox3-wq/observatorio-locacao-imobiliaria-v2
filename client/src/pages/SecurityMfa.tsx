import DashboardLayout, { type DashboardAccessGate } from "@/components/DashboardLayout";
import { hasRecentTotpMfa, mfaSecurityStatusCopy, resolveMfaSecurityStatus, type MfaSecurityStatus } from "@/lib/mfaSecurityState";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { toMfaQrImageSource, validateTotpCode } from "@/lib/identityMfa";
import { ArrowRight, CircleAlert, Copy, Loader2, QrCode, ShieldCheck, ShieldAlert, Smartphone, TimerReset } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import "../security-mfa.css";

type Enrollment = { factorId: string; qrCode: string; secret: string };

const accessGate: DashboardAccessGate = {
  eyebrow: "SEGURANÇA DE SESSÃO · MFA ANTES DE COMANDOS",
  title: "Configure ou revalide sua proteção de acesso.",
  description: "A sessão de contexto é independente da plataforma. A inscrição e a verificação TOTP ocorrem somente no provedor autenticado.",
  routeTitle: "Rota de segurança",
  routeDetail: "Contexto → autenticador → TOTP → servidor",
  actionLabel: "Entrar no contexto",
  footerLabel: "CONTROLE",
  footerValue: "MFA TOTP",
  footerNote: "A interface não cria alçada nem substitui a policy do servidor.",
  railTop: "MFA",
  railBottom: "SESSÃO",
};

function genericErrorMessage() {
  return "Não foi possível concluir esta etapa de segurança. Nenhum comando protegido foi liberado.";
}

export default function SecurityMfa() {
  const [status, setStatus] = useState<MfaSecurityStatus>("checking");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [hasConfirmedEnrollment, setHasConfirmedEnrollment] = useState(false);
  const [busy, setBusy] = useState<"enroll" | "verify" | "cancel" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);

  const refreshState = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    setErrorMessage(null);
    setSecretCopied(false);
    if (!client) {
      setStatus("unavailable");
      setFactorId(null);
      return;
    }

    try {
      const [{ data: sessionData, error: sessionError }, { data: factors, error: factorsError }, { data: assurance, error: assuranceError }] = await Promise.all([
        client.auth.getSession(),
        client.auth.mfa.listFactors(),
        client.auth.mfa.getAuthenticatorAssuranceLevel(),
      ]);
      if (sessionError || factorsError || assuranceError) throw new Error("MFA_STATE_UNAVAILABLE");

      const totpFactors = factors.totp ?? [];
      const preferredFactor = totpFactors.find((factor) => factor.status === "verified") ?? totpFactors[0] ?? null;
      setFactorId(preferredFactor?.id ?? null);
      setStatus(resolveMfaSecurityStatus({
        hasSession: Boolean(sessionData.session),
        currentLevel: assurance.currentLevel,
        nextLevel: assurance.nextLevel,
        totpFactorCount: totpFactors.length,
        hasRecentTotp: hasRecentTotpMfa(sessionData.session?.access_token),
      }));
    } catch {
      setStatus("error");
      setFactorId(null);
    }
  }, []);

  useEffect(() => {
    void refreshState();
  }, [refreshState]);

  useEffect(() => {
    return () => {
      // QR e segredo permanecem apenas na memória da página e são descartados ao sair.
      setEnrollment(null);
      setCode("");
    };
  }, []);

  const presentation = useMemo(() => mfaSecurityStatusCopy(status), [status]);
  const canEnroll = status === "enrollment_required" && hasConfirmedEnrollment && !busy;
  const canVerify = (status === "challenge_required" || Boolean(enrollment)) && Boolean(factorId || enrollment?.factorId) && !busy;

  async function beginEnrollment() {
    const client = getSupabaseBrowserClient();
    if (!client || !canEnroll) return;
    setBusy("enroll");
    setErrorMessage(null);
    try {
      const { data, error } = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: "CRM · Segurança" });
      if (error || !data?.id || !data.totp?.qr_code || !data.totp.secret) throw new Error("MFA_ENROLLMENT_DENIED");
      setEnrollment({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
      setFactorId(data.id);
      setCode("");
      setStatus("challenge_required");
    } catch {
      setErrorMessage(genericErrorMessage());
    } finally {
      setBusy(null);
    }
  }

  async function verifyTotp() {
    const client = getSupabaseBrowserClient();
    const activeFactorId = enrollment?.factorId ?? factorId;
    const formatError = validateTotpCode(code);
    if (!client || !activeFactorId || formatError || !canVerify) {
      if (formatError) setErrorMessage(formatError);
      return;
    }

    setBusy("verify");
    setErrorMessage(null);
    try {
      const challenge = await client.auth.mfa.challenge({ factorId: activeFactorId });
      if (challenge.error || !challenge.data?.id) throw new Error("MFA_CHALLENGE_DENIED");
      const verification = await client.auth.mfa.verify({ factorId: activeFactorId, challengeId: challenge.data.id, code: code.trim() });
      if (verification.error) throw new Error("MFA_VERIFICATION_DENIED");
      setEnrollment(null);
      setCode("");
      await refreshState();
    } catch {
      setErrorMessage("O código não foi confirmado. Verifique o autenticador e tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  async function cancelEnrollment() {
    const client = getSupabaseBrowserClient();
    if (!client || !enrollment || busy) return;
    setBusy("cancel");
    setErrorMessage(null);
    try {
      const { error } = await client.auth.mfa.unenroll({ factorId: enrollment.factorId });
      if (error) throw new Error("MFA_UNENROLLMENT_DENIED");
      setEnrollment(null);
      setFactorId(null);
      setCode("");
      setHasConfirmedEnrollment(false);
      await refreshState();
    } catch {
      setErrorMessage(genericErrorMessage());
    } finally {
      setBusy(null);
    }
  }

  async function copySecret() {
    if (!enrollment || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(enrollment.secret);
      setSecretCopied(true);
    } catch {
      setErrorMessage("Não foi possível copiar o segredo. Use o QR code ou digite-o diretamente no autenticador.");
    }
  }

  return <DashboardLayout navigationTitle="Núcleo CRM" accessGate={accessGate}>
    <main className="security-mfa">
      <header className="security-mfa__hero">
        <div><p className="security-mfa__eyebrow">SEGURANÇA DE SESSÃO · TOTP</p><h1>Proteção visível antes de qualquer comando sensível.</h1><p>Configure ou revalide o seu autenticador. Esta tela não cria permissões, não mostra identidades e não substitui as verificações do servidor.</p></div>
        <aside className={`security-mfa__status security-mfa__status--${status}`} aria-live="polite"><ShieldCheck size={19} aria-hidden="true" /><div><span>Estado atual</span><strong>{presentation.label}</strong><small>{presentation.description}</small></div></aside>
      </header>

      <section className="security-mfa__steps" aria-label="Etapas de segurança"><div><span>01</span><b>Sessão de contexto</b><small>Identidade e sessão separadas da plataforma.</small></div><div><span>02</span><b>Autenticador TOTP</b><small>QR e segredo somente no seu dispositivo.</small></div><div><span>03</span><b>Verificação recente</b><small>O servidor revalida antes de cada comando.</small></div></section>

      {status === "unavailable" ? <section className="security-mfa__panel"><ShieldAlert size={22} aria-hidden="true" /><div><p className="security-mfa__eyebrow">CONTEXTO NECESSÁRIO</p><h2>Entre no contexto antes de configurar a proteção.</h2><p>O MFA deve ser vinculado à identidade de contexto correta. O acesso à plataforma, sozinho, não substitui essa etapa.</p><Link href="/entrar?proximo=%2Fseguranca-mfa" className="security-mfa__primary">Validar contexto <ArrowRight size={16} /></Link></div></section> : null}

      {status === "error" ? <section className="security-mfa__panel"><ShieldAlert size={22} aria-hidden="true" /><div><p className="security-mfa__eyebrow">NOVA VERIFICAÇÃO NECESSÁRIA</p><h2>Não foi possível confirmar a proteção desta sessão.</h2><p>Nenhum comando foi liberado. Atualize somente o estado de segurança ou entre novamente no contexto se a tentativa continuar indisponível.</p><div className="security-mfa__actions"><button type="button" className="security-mfa__primary" disabled={Boolean(busy)} onClick={() => void refreshState()}><TimerReset size={16} />Verificar novamente</button><Link href="/entrar?proximo=%2Fseguranca-mfa" className="security-mfa__secondary">Validar contexto <ArrowRight size={16} /></Link></div></div></section> : null}

      {status === "enrollment_required" && !enrollment ? <section className="security-mfa__panel"><Smartphone size={22} aria-hidden="true" /><div><p className="security-mfa__eyebrow">PRIMEIRA CONFIGURAÇÃO</p><h2>Associe um autenticador ao seu acesso.</h2><p>Ao iniciar, o QR code e o segredo aparecerão apenas nesta tela e não serão guardados pelo CRM. Escaneie usando um aplicativo autenticador sob seu controle.</p><label className="security-mfa__ack"><input type="checkbox" checked={hasConfirmedEnrollment} onChange={(event) => setHasConfirmedEnrollment(event.target.checked)} /> <span>Entendo que o QR code e o segredo são pessoais e não devem ser compartilhados.</span></label><button type="button" className="security-mfa__primary" disabled={!canEnroll} onClick={() => void beginEnrollment()}>{busy === "enroll" ? <><Loader2 className="animate-spin" size={16} /> Preparando</> : <><QrCode size={16} /> Iniciar configuração TOTP</>}</button></div></section> : null}

      {enrollment ? <section className="security-mfa__enrollment"><div className="security-mfa__qr"><img src={toMfaQrImageSource(enrollment.qrCode)} alt="QR code para configurar o autenticador TOTP" /><p>Mostre este QR somente ao aplicativo autenticador que você controla.</p></div><div><p className="security-mfa__eyebrow">CONFIRMAÇÃO DA INSCRIÇÃO</p><h2>Escaneie e confirme o primeiro código.</h2><p>Se não puder escanear, use a chave de configuração abaixo diretamente no autenticador. A chave desaparece quando você conclui, cancela ou sai desta página.</p><div className="security-mfa__secret"><code>{enrollment.secret}</code><button type="button" onClick={() => void copySecret()} aria-label="Copiar chave de configuração"><Copy size={16} />{secretCopied ? "Copiado" : "Copiar"}</button></div><TotpCodeForm code={code} onCodeChange={setCode} onVerify={verifyTotp} busy={busy === "verify"} /><button type="button" className="security-mfa__secondary" disabled={Boolean(busy)} onClick={() => void cancelEnrollment()}>{busy === "cancel" ? "Cancelando" : "Cancelar inscrição"}</button></div></section> : null}

      {status === "challenge_required" && !enrollment ? <section className="security-mfa__panel"><TimerReset size={22} aria-hidden="true" /><div><p className="security-mfa__eyebrow">REVALIDAÇÃO</p><h2>Confirme um código recente do autenticador.</h2><p>O código nunca é registrado pelo CRM. Uma verificação aceita atualizará a sessão do provedor; o servidor continuará exigindo a garantia reforçada.</p><TotpCodeForm code={code} onCodeChange={setCode} onVerify={verifyTotp} busy={busy === "verify"} /></div></section> : null}

      {status === "verified" ? <section className="security-mfa__panel security-mfa__panel--success"><ShieldCheck size={22} aria-hidden="true" /><div><p className="security-mfa__eyebrow">SESSÃO REFORÇADA</p><h2>O MFA desta sessão está reconhecido.</h2><p>Você pode voltar ao Cadastro de Loteamentos. A autorização continua dependente de identidade, organização ativa, grant, finalidade e policy em cada comando.</p><Link href="/loteadora" className="security-mfa__primary">Voltar ao Cadastro de Loteamentos <ArrowRight size={16} /></Link></div></section> : null}

      {errorMessage ? <p className="security-mfa__error" role="alert"><CircleAlert size={17} aria-hidden="true" />{errorMessage}</p> : null}
    </main>
  </DashboardLayout>;
}

function TotpCodeForm({ code, onCodeChange, onVerify, busy }: { code: string; onCodeChange: (value: string) => void; onVerify: () => Promise<void>; busy: boolean }) {
  return <form className="security-mfa__code" onSubmit={(event) => { event.preventDefault(); void onVerify(); }}><label htmlFor="security-mfa-code">Código do autenticador<input id="security-mfa-code" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={code} onChange={(event) => onCodeChange(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="000000" /></label><button type="submit" className="security-mfa__primary" disabled={busy}>{busy ? <><Loader2 className="animate-spin" size={16} /> Verificando</> : <><ShieldCheck size={16} /> Confirmar código</>}</button></form>;
}
