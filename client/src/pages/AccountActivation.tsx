import { validateTotpCode } from "@/lib/identityMfa";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { passwordFlowForActivation, recoveryStateAfterAssurance, supabasePasswordFlowFromFragment, supabasePasswordFlowStorageKey, type SupabasePasswordFlow } from "@/lib/supabaseInvitationActivation";
import { useEffect, useState } from "react";

type ActivationState = "checking" | "mfa_required" | "ready" | "missing" | "saving" | "completed";

function initialFlow(): SupabasePasswordFlow | null {
  if (typeof window === "undefined") return null;
  const detected = supabasePasswordFlowFromFragment(window.location.hash);
  if (detected) window.sessionStorage.setItem(supabasePasswordFlowStorageKey, detected);
  return passwordFlowForActivation(window.location.hash, window.sessionStorage.getItem(supabasePasswordFlowStorageKey));
}

export default function AccountActivation() {
  const [state, setState] = useState<ActivationState>("checking");
  const [flow] = useState<SupabasePasswordFlow | null>(initialFlow);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) { setState("missing"); return; }
    let active = true;
    const establishSession = async () => {
      const { data } = await client.auth.getSession();
      if (!active) return;
      if (!data.session) { setState("missing"); return; }
      window.history.replaceState({}, document.title, "/ativar-conta");
      if (flow !== "recovery") { setState("ready"); return; }
      const { data: assurance, error: assuranceError } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assuranceError) { setState("missing"); return; }
      const { data: factors, error: factorsError } = await client.auth.mfa.listFactors();
      const factor = factors?.totp.find((item) => item.status === "verified") ?? factors?.totp[0];
      const recoveryState = recoveryStateAfterAssurance(flow, assurance.currentLevel, !factorsError && Boolean(factor));
      if (recoveryState === "missing") { setState("missing"); return; }
      if (recoveryState === "mfa_required" && factor) setMfaFactorId(factor.id);
      setState(recoveryState);
    };
    void establishSession();
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => { if (active && session) void establishSession(); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [flow]);

  async function verifyRecoveryMfa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    const validationError = validateTotpCode(mfaCode);
    if (!client || !mfaFactorId || validationError) { setErrorMessage(validationError ?? "O segundo fator de recuperação não está disponível."); return; }
    setErrorMessage(null);
    try {
      const { data: challenge, error: challengeError } = await client.auth.mfa.challenge({ factorId: mfaFactorId });
      if (challengeError) throw challengeError;
      const { data: verifiedSession, error } = await client.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.id, code: mfaCode.trim() });
      if (error || !verifiedSession?.access_token || !verifiedSession.refresh_token) throw new Error("RECOVERY_MFA_NOT_VERIFIED");
      const { error: setSessionError } = await client.auth.setSession({ access_token: verifiedSession.access_token, refresh_token: verifiedSession.refresh_token });
      if (setSessionError) throw setSessionError;
      setMfaCode("");
      setState("ready");
    } catch { setErrorMessage("O código MFA não foi confirmado. Use um código atual do autenticador."); }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 12 || password !== passwordConfirmation || state !== "ready") return;
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setState("saving");
    setErrorMessage(null);
    const { error } = await client.auth.updateUser({ password });
    if (error) { setErrorMessage("A senha não foi alterada. Verifique o segundo fator e tente novamente nesta tela."); setState(flow === "recovery" ? "mfa_required" : "ready"); return; }
    setPassword("");
    setPasswordConfirmation("");
    window.sessionStorage.removeItem(supabasePasswordFlowStorageKey);
    await client.auth.signOut({ scope: "local" });
    setState("completed");
  }

  const isRecovery = flow === "recovery";
  const missingCopy = isRecovery ? "Não foi encontrada uma sessão válida de recuperação ou um segundo fator configurado. Solicite um novo link ou use o canal de recuperação institucional; não reutilize links ou tokens anteriores." : "Não foi encontrada uma sessão válida de convite. Solicite um novo convite; não reutilize links ou tokens anteriores.";
  return <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100"><section className="mx-auto max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-10"><p className="text-xs font-semibold tracking-[0.22em] text-cyan-300">IDENTIDADE ADMINISTRATIVA</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">{isRecovery ? "Recuperação segura da conta" : "Ativação segura da conta"}</h1><p className="mt-4 leading-7 text-slate-300">Esta etapa {isRecovery ? "altera somente a senha da identidade autenticada" : "cria somente a senha da identidade convidada"}. Ela não concede papel de Super Admin, organização, membership, grant ou qualquer acesso operacional.</p>{state === "checking" && <p className="mt-8 rounded-lg bg-slate-800 p-4 text-sm text-slate-300">Validando a sessão temporária de {isRecovery ? "recuperação" : "convite"}.</p>}{state === "missing" && <p className="mt-8 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">{missingCopy}</p>}{errorMessage && <p className="mt-6 rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">{errorMessage}</p>}{state === "mfa_required" && <form className="mt-8 space-y-5" onSubmit={verifyRecoveryMfa}><p className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-50">A recuperação exige o segundo fator já configurado. Informe um código atual do aplicativo autenticador antes de alterar a senha.</p><label className="block text-sm font-medium" htmlFor="recovery-totp-code">Código MFA<input autoComplete="one-time-code" className="mt-2 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300" id="recovery-totp-code" inputMode="numeric" maxLength={6} onChange={(event) => setMfaCode(event.target.value)} required value={mfaCode} /></label><button className="w-full rounded-md bg-cyan-300 px-4 py-2 font-semibold text-slate-950 transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50" disabled={validateTotpCode(mfaCode) !== null} type="submit">Verificar MFA e continuar</button></form>}{state === "completed" && <div className="mt-8 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100"><p className="font-semibold">{isRecovery ? "Senha alterada" : "Senha criada"} e sessão temporária removida.</p><p className="mt-2">Agora entre pelo fluxo normal do CRM e confirme MFA antes de solicitar comandos administrativos.</p><a className="mt-4 inline-flex rounded-md bg-emerald-400 px-4 py-2 font-medium text-slate-950" href="/administracao">Ir para Administração</a></div>}{(state === "ready" || state === "saving") && <form className="mt-8 space-y-5" onSubmit={handleSubmit}><label className="block text-sm font-medium" htmlFor="activation-password">Nova senha<input autoComplete="new-password" className="mt-2 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300" disabled={state === "saving"} id="activation-password" minLength={12} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label><label className="block text-sm font-medium" htmlFor="activation-password-confirmation">Confirmar nova senha<input autoComplete="new-password" className="mt-2 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300" disabled={state === "saving"} id="activation-password-confirmation" minLength={12} onChange={(event) => setPasswordConfirmation(event.target.value)} required type="password" value={passwordConfirmation} /></label><p className="text-sm leading-6 text-slate-400">Use uma senha única de pelo menos 12 caracteres, guardada em gerenciador de senhas. Não compartilhe a senha nem o link.</p><button className="w-full rounded-md bg-cyan-300 px-4 py-2 font-semibold text-slate-950 transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50" disabled={state === "saving" || password.length < 12 || password !== passwordConfirmation} type="submit">{state === "saving" ? "Salvando senha" : isRecovery ? "Alterar senha e encerrar sessão temporária" : "Criar senha e encerrar sessão temporária"}</button></form>}</section></main>;
}
