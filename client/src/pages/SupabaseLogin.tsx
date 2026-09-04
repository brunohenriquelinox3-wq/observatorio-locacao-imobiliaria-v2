import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import {
  resolveSupabaseLoginDestination,
  supabaseLoginErrorMessage,
} from "@/lib/supabaseLoginDestination";
import { ArrowRight, CircleAlert, KeyRound, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type ContextSessionState = "checking" | "ready" | "missing" | "unavailable";

export default function SupabaseLogin() {
  const { user, loading } = useAuth();
  const [state, setState] = useState<ContextSessionState>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const destination = useMemo(
    () => resolveSupabaseLoginDestination(new URLSearchParams(window.location.search).get("proximo")),
    [],
  );

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setState("unavailable");
      return;
    }

    let active = true;
    const refreshSessionState = async () => {
      const { data } = await client.auth.getSession();
      if (active) setState(data.session ? "ready" : "missing");
    };

    void refreshSessionState();
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      if (active) setState(session ? "ready" : "missing");
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client || !email.trim() || !password) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setPassword("");
      if (error || !data.session) throw new Error("SUPABASE_CONTEXT_SIGN_IN_DENIED");
      window.location.assign(destination);
    } catch {
      setPassword("");
      setErrorMessage(supabaseLoginErrorMessage());
      setState("missing");
      setIsSubmitting(false);
    }
  }

  async function signOutContext() {
    const client = getSupabaseBrowserClient();
    if (!client) return;

    setIsSigningOut(true);
    setErrorMessage(null);
    try {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
      setState("missing");
      setIsSigningOut(false);
    } catch {
      setErrorMessage("Não foi possível encerrar a sessão de contexto neste dispositivo. Tente novamente.");
      setState("ready");
      setIsSigningOut(false);
    }
  }

  const isPlatformReady = !loading && Boolean(user);
  const showSignInForm = isPlatformReady && state === "missing";
  const showActiveSession = isPlatformReady && state === "ready";

  return (
    <main className="min-h-screen bg-[#f4f5ee] px-4 py-10 text-[#14343e] sm:px-6 lg:py-16">
      <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[24px] border border-[#d7e2df] bg-white shadow-[0_24px_70px_rgba(9,44,52,0.10)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="bg-[#103d49] p-7 text-[#eef9f7] sm:p-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5bd9bd] text-[#103d49]"><KeyRound size={22} aria-hidden="true" /></div>
          <p className="mt-10 text-xs font-extrabold tracking-[0.18em] text-[#7ce5d0]">SESSÃO DE CONTEXTO</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Confirme sua identidade de trabalho.</h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#c9e0dc]">A sessão do contexto imobiliário é distinta da sessão da plataforma. Ela permite apenas a leitura que o servidor autorizar para a organização, módulo e finalidade vigentes.</p>
          <div className="mt-10 border-t border-white/15 pt-6 text-sm leading-6 text-[#c9e0dc]">
            <p className="font-semibold text-white">O que este acesso não faz</p>
            <p className="mt-2">Não cria organização, membership, grant, escopo, perfil administrativo ou qualquer autorização. Comandos sensíveis continuam exigindo MFA e validação do servidor.</p>
          </div>
        </aside>

        <div className="p-7 sm:p-10">
          <div className="flex items-start gap-3 rounded-xl border border-[#c8e8df] bg-[#edf9f5] p-4 text-sm leading-6 text-[#205e54]">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p><strong>Entrada separada e mínima.</strong> A senha é enviada diretamente ao provedor de identidade e permanece apenas durante este envio no navegador.</p>
          </div>

          {loading || state === "checking" ? <div className="mt-10 flex items-center gap-3 text-sm text-[#5c7478]"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Verificando se existe uma sessão de contexto neste dispositivo.</div> : null}

          {!loading && !user ? <div className="mt-10"><p className="text-xs font-extrabold tracking-[0.16em] text-[#1d8775]">ETAPA 1 DE 2</p><h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">Entre primeiro na plataforma.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#5c7478]">A autenticação da plataforma é obrigatória antes da validação do contexto. Ela ainda não concede alçada operacional.</p><button type="button" onClick={() => startLogin()} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#126f62] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0b5a50] active:scale-[0.97] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5bd9bd]/50">Entrar na plataforma <ArrowRight size={17} aria-hidden="true" /></button></div> : null}

          {state === "unavailable" && isPlatformReady ? <div className="mt-10"><p className="text-xs font-extrabold tracking-[0.16em] text-[#1d8775]">SESSÃO INDISPONÍVEL</p><h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">A validação de contexto não está disponível nesta prévia.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#5c7478]">Nenhum acesso foi liberado. Revise a configuração de ambiente antes de tentar novamente.</p></div> : null}

          {showSignInForm ? <form className="mt-10 max-w-lg" onSubmit={signIn}><p className="text-xs font-extrabold tracking-[0.16em] text-[#1d8775]">ETAPA 2 DE 2</p><h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">Entre no contexto autorizado.</h2><p className="mt-3 text-sm leading-6 text-[#5c7478]">Use a identidade já ativada para este CRM. Em caso de falha, a tela não revela se uma conta existe.</p><label className="mt-7 block text-sm font-bold text-[#294e55]" htmlFor="supabase-context-email">E-mail de acesso<input autoComplete="email" className="mt-2 min-h-11 w-full rounded-lg border border-[#bbced0] bg-white px-3 text-[#14343e] outline-none transition placeholder:text-[#7c9295] focus:border-[#1b9c87] focus:ring-4 focus:ring-[#5bd9bd]/25" id="supabase-context-email" inputMode="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label><label className="mt-5 block text-sm font-bold text-[#294e55]" htmlFor="supabase-context-password">Senha<input autoComplete="current-password" className="mt-2 min-h-11 w-full rounded-lg border border-[#bbced0] bg-white px-3 text-[#14343e] outline-none transition focus:border-[#1b9c87] focus:ring-4 focus-visible:ring-[#5bd9bd]/25" id="supabase-context-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>{errorMessage ? <p className="mt-5 flex gap-2 rounded-lg border border-[#f0c4b5] bg-[#fff5f1] p-3 text-sm leading-6 text-[#8a3f28]"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />{errorMessage}</p> : null}<button className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#126f62] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0b5a50] active:scale-[0.97] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5bd9bd]/50 disabled:cursor-wait disabled:opacity-70" disabled={isSubmitting} type="submit">{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Validando</> : <>Validar contexto <ArrowRight size={17} aria-hidden="true" /></>}</button></form> : null}

          {showActiveSession ? <div className="mt-10 max-w-lg"><p className="text-xs font-extrabold tracking-[0.16em] text-[#1d8775]">SESSÃO DE CONTEXTO ATIVA</p><h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">A identidade está pronta para validação no servidor.</h2><p className="mt-3 text-sm leading-6 text-[#5c7478]">A lista de organizações continuará vazia se não houver membership, grant, módulo, vigência e policy compatíveis. Nenhuma alçada é criada nesta tela.</p>{errorMessage ? <p className="mt-5 flex gap-2 rounded-lg border border-[#f0c4b5] bg-[#fff5f1] p-3 text-sm leading-6 text-[#8a3f28]"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />{errorMessage}</p> : null}<div className="mt-7 flex flex-wrap gap-3"><a className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#126f62] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0b5a50] active:scale-[0.97] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5bd9bd]/50" href={destination}>Continuar <ArrowRight size={17} aria-hidden="true" /></a><button className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#c3d5d4] bg-white px-4 py-2 text-sm font-bold text-[#31565b] transition hover:bg-[#f2f7f6] active:scale-[0.97] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5bd9bd]/50 disabled:cursor-wait disabled:opacity-70" disabled={isSigningOut} onClick={signOutContext} type="button">{isSigningOut ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Encerrando</> : <><LogOut size={17} aria-hidden="true" /> Encerrar só este contexto</>}</button></div></div> : null}
        </div>
      </section>
    </main>
  );
}
