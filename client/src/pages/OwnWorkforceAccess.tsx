import { ArrowUpRight, ShieldCheck, UserRoundCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import "../workforce-access.css";

const profileLabel = { collaborator: "Colaborador", broker: "Corretor" } as const;

export default function OwnWorkforceAccess() {
  const { isAuthenticated } = useAuth();
  const [organizationReference, setOrganizationReference] = useState("");
  const [profile, setProfile] = useState<"collaborator" | "broker">("collaborator");
  const identity = trpc.foundation.identity.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const hasSupabaseSubject = identity.data?.state === "connected";
  const canRequest = isAuthenticated && hasSupabaseSubject;
  const requests = trpc.administration.listOwnWorkforceAccessRequests.useQuery(undefined, { enabled: canRequest, retry: false });
  const requestMutation = trpc.administration.requestOwnWorkforceAccess.useMutation({
    onSuccess() { toast.success("Solicitação registrada", { description: "Nenhum acesso foi criado. Aguarde a preparação por um ADM e aceite apenas sua própria delegação com MFA." }); setOrganizationReference(""); void requests.refetch(); },
    onError() { toast.error("Solicitação não concluída", { description: "O servidor não confirmou identidade, organização ou pré-requisito. Nenhum acesso foi criado." }); },
  });
  const acceptMutation = trpc.administration.acceptOwnWorkforceAccess.useMutation({
    onSuccess() { toast.success("Aceite registrado", { description: "O servidor confirmou a própria identidade e a política. Recarregue a área administrativa para consultar os contextos autorizados." }); void requests.refetch(); },
    onError() { toast.error("Aceite não concluído", { description: "MFA recente, sessão e preparação válida continuam obrigatórios. Nenhum acesso foi ativado." }); },
  });
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canRequest || organizationReference.trim().length < 2) { toast.error("Revise a solicitação", { description: "Conecte a sessão Supabase e informe a organização de referência pelo processo interno." }); return; }
    requestMutation.mutate({ organizationReference, profile, correlationId: crypto.randomUUID() });
  }
  return <main className="workforce-self">
    <section className="workforce-self__shell" aria-labelledby="workforce-self-title">
      <header><p className="workforce-panel__eyebrow">ACESSO DE EQUIPE · IDENTIDADE ANTES DE ALÇADA</p><h1 id="workforce-self-title">Solicite apenas o seu vínculo de trabalho.</h1><p>Esta área não cria senha, não envia convite e não revela dados da equipe. A solicitação não é acesso: um ADM precisa preparar escopo e você precisa aceitar a própria delegação com MFA.</p></header>
      <div className="workforce-self__grid"><form className="workforce-panel__form" onSubmit={submit} aria-disabled={!canRequest}><div className="workforce-panel__subheading"><UserRoundCheck size={18} aria-hidden="true" /><h2>Minha solicitação</h2></div><label htmlFor="workforce-organization-reference">Organização de referência</label><input id="workforce-organization-reference" value={organizationReference} onChange={(event) => setOrganizationReference(event.target.value)} disabled={!canRequest || requestMutation.isPending} required /><fieldset><legend>Perfil de trabalho</legend><label><input type="radio" name="workforce-profile" checked={profile === "collaborator"} onChange={() => setProfile("collaborator")} disabled={!canRequest || requestMutation.isPending} /> Colaborador</label><label><input type="radio" name="workforce-profile" checked={profile === "broker"} onChange={() => setProfile("broker")} disabled={!canRequest || requestMutation.isPending} /> Corretor</label></fieldset><button type="submit" disabled={!canRequest || requestMutation.isPending}>{requestMutation.isPending ? "Validando solicitação" : "Solicitar preparação"} <ArrowUpRight size={15} /></button></form>
      <aside className="workforce-self__status" aria-live="polite"><div className="workforce-panel__subheading"><ShieldCheck size={18} aria-hidden="true" /><h2>Minhas delegações</h2></div>{!isAuthenticated ? <p>Entre com sua conta Google para iniciar a confirmação de identidade.</p> : identity.isLoading ? <p>Confirmando a sessão Google antes de liberar a solicitação.</p> : !hasSupabaseSubject ? <p>Entre com Google em <a href="/entrar?proximo=%2Facesso-equipe">/entrar</a>. Sem sessão válida, nenhuma solicitação ou leitura é liberada.</p> : requests.isLoading ? <p>Confirmando o contexto seguro.</p> : (requests.data?.length ?? 0) === 0 ? <p>Nenhuma solicitação devolvida. Isto não revela solicitações de outras pessoas.</p> : <ol className="workforce-panel__request-list">{requests.data?.map((request, index) => <li key={request.requestId}><span>Minha solicitação {String(index + 1).padStart(2, "0")}</span><strong>{profileLabel[request.profile]}</strong><small>{request.organizationLabel} · {request.state === "prepared" ? "Aguardando meu aceite" : request.state === "active" ? "Acesso ativo" : "Aguardando preparação"}</small>{request.state === "prepared" && <button type="button" onClick={() => acceptMutation.mutate({ requestId: request.requestId, correlationId: crypto.randomUUID() })} disabled={acceptMutation.isPending}>{acceptMutation.isPending ? "Validando aceite" : "Aceitar minha delegação"}</button>}</li>)}</ol>}</aside></div>
      <footer><ShieldCheck size={17} aria-hidden="true" /><p>O aceite é pessoal e não altera papel, módulos ou vigência preparados. O servidor confirma a identidade, a sessão e a policy antes de ativar qualquer acesso.</p></footer>
    </section>
  </main>;
}
