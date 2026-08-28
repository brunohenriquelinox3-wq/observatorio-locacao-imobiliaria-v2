import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useEffect, useState } from "react";

type ActivationState = "checking" | "ready" | "missing" | "saving" | "completed" | "failed";

export default function AccountActivation() {
  const [state, setState] = useState<ActivationState>("checking");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setState("missing");
      return;
    }

    let active = true;
    const markReadyWhenSessionExists = async () => {
      const { data } = await client.auth.getSession();
      if (!active) return;
      if (data.session) {
        window.history.replaceState({}, document.title, "/ativar-conta");
        setState("ready");
      } else {
        setState("missing");
      }
    };

    void markReadyWhenSessionExists();
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      if (!active || !session) return;
      window.history.replaceState({}, document.title, "/ativar-conta");
      setState("ready");
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 12 || password !== passwordConfirmation || state !== "ready") return;
    const client = getSupabaseBrowserClient();
    if (!client) return;

    setState("saving");
    const { error } = await client.auth.updateUser({ password });
    if (error) {
      setState("failed");
      return;
    }

    setPassword("");
    setPasswordConfirmation("");
    await client.auth.signOut({ scope: "local" });
    setState("completed");
  }

  return <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100"><section className="mx-auto max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-10"><p className="text-xs font-semibold tracking-[0.22em] text-cyan-300">IDENTIDADE ADMINISTRATIVA</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Ativação segura da conta</h1><p className="mt-4 leading-7 text-slate-300">Esta etapa cria somente a senha da identidade convidada. Ela não concede papel de Super Admin, organização, membership, grant ou qualquer acesso operacional.</p>{state === "checking" && <p className="mt-8 rounded-lg bg-slate-800 p-4 text-sm text-slate-300">Validando a sessão temporária do convite.</p>}{state === "missing" && <p className="mt-8 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">Não foi encontrada uma sessão válida de convite. Solicite um novo convite; não reutilize links ou tokens anteriores.</p>}{state === "failed" && <p className="mt-8 rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">A senha não foi criada. Tente novamente apenas nesta tela; se o convite expirou, solicite um novo.</p>}{state === "completed" && <div className="mt-8 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100"><p className="font-semibold">Senha criada e sessão temporária removida.</p><p className="mt-2">Agora entre pelo fluxo normal do CRM e ative MFA antes de solicitar bootstrap administrativo.</p><a className="mt-4 inline-flex rounded-md bg-emerald-400 px-4 py-2 font-medium text-slate-950" href="/administracao">Ir para Administração</a></div>}{state === "ready" && <form className="mt-8 space-y-5" onSubmit={handleSubmit}><label className="block text-sm font-medium" htmlFor="activation-password">Nova senha<input autoComplete="new-password" className="mt-2 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300" id="activation-password" minLength={12} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label><label className="block text-sm font-medium" htmlFor="activation-password-confirmation">Confirmar nova senha<input autoComplete="new-password" className="mt-2 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300" id="activation-password-confirmation" minLength={12} onChange={(event) => setPasswordConfirmation(event.target.value)} required type="password" value={passwordConfirmation} /></label><p className="text-sm leading-6 text-slate-400">Use uma senha única de pelo menos 12 caracteres, guardada em gerenciador de senhas. Não compartilhe a senha nem o convite.</p><button className="w-full rounded-md bg-cyan-300 px-4 py-2 font-semibold text-slate-950 transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50" disabled={password.length < 12 || password !== passwordConfirmation} type="submit">Criar senha e encerrar sessão temporária</button></form>}</section></main>;
}
