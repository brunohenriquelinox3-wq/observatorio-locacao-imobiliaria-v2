import { ShieldCheck, UserRoundCheck, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { WorkforceAccessRequest } from "../../../server/adminWorkforceAccess";
import "../workforce-access.css";

type WorkforcePanelMode = "platform" | "organization";
type WorkforceRole = "organization_admin" | "area_admin" | "operator";
type WorkforceModule = "loteadora" | "vendas_urbanas" | "locacao";
type WorkforcePurpose = "cadastro_inicial" | "operacao_interna" | "revisao_cadastral";

type WorkforceManagementPanelProps = {
  mode: WorkforcePanelMode;
  canPrepare: boolean;
};

const profileLabel = { collaborator: "Colaborador", broker: "Corretor" } as const;
const roleOptions: Array<{ value: WorkforceRole; label: string }> = [
  { value: "organization_admin", label: "ADM da organização" },
  { value: "area_admin", label: "ADM de área" },
  { value: "operator", label: "Operador" },
];
const moduleOptions: Array<{ value: WorkforceModule; label: string }> = [
  { value: "loteadora", label: "Loteadora" },
  { value: "vendas_urbanas", label: "Vendas Urbanas" },
  { value: "locacao", label: "Locação" },
];
const purposeOptions: Array<{ value: WorkforcePurpose; label: string }> = [
  { value: "cadastro_inicial", label: "Cadastro inicial" },
  { value: "operacao_interna", label: "Operação interna" },
  { value: "revisao_cadastral", label: "Revisão cadastral" },
];

function stateLabel(state: WorkforceAccessRequest["state"]) {
  return state === "requested" ? "Aguardando preparação" : state === "prepared" ? "Aguardando aceite próprio" : state === "active" ? "Acesso ativo" : "Estado indisponível";
}

function formatExpiry(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function WorkforceManagementPanel({ mode, canPrepare }: WorkforceManagementPanelProps) {
  const [requestId, setRequestId] = useState("");
  const [role, setRole] = useState<WorkforceRole | "">(mode === "organization" ? "operator" : "");
  const [modules, setModules] = useState<WorkforceModule[]>([]);
  const [purposeCode, setPurposeCode] = useState<WorkforcePurpose | "">("");
  const [expiresAt, setExpiresAt] = useState("");
  const [confirmedOffline, setConfirmedOffline] = useState(false);
  const platformRequests = trpc.administration.listPlatformWorkforceAccessRequests.useQuery(undefined, {
    enabled: mode === "platform" && canPrepare,
    retry: false,
  });
  const organizationRequests = trpc.administration.listOrganizationWorkforceAccessRequests.useQuery(undefined, {
    enabled: mode === "organization" && canPrepare,
    retry: false,
  });
  const requests = mode === "platform" ? platformRequests.data ?? [] : organizationRequests.data ?? [];
  const requested = useMemo(() => requests.filter((item) => item.state === "requested"), [requests]);
  const refresh = () => void Promise.all([platformRequests.refetch(), organizationRequests.refetch()]);
  const platformPreparation = trpc.administration.preparePlatformWorkforceAccess.useMutation({
    onSuccess() {
      toast.success("Preparação registrada", { description: "O acesso continua pendente até o aceite pessoal com MFA do próprio sujeito." });
      setRequestId(""); setModules([]); setPurposeCode(""); setExpiresAt(""); setConfirmedOffline(false); refresh();
    },
    onError() { toast.error("Preparação não concluída", { description: "O servidor recusou o papel, escopo, vigência, contexto ou pré-requisito. Nenhum acesso foi ativado." }); },
  });
  const organizationPreparation = trpc.administration.prepareOrganizationWorkforceAccess.useMutation({
    onSuccess() {
      toast.success("Preparação registrada", { description: "O acesso continua pendente até o aceite pessoal com MFA do próprio sujeito." });
      setRequestId(""); setModules([]); setPurposeCode(""); setExpiresAt(""); setConfirmedOffline(false); refresh();
    },
    onError() { toast.error("Preparação não concluída", { description: "O servidor recusou o escopo, a vigência, a organização ou a alçada. Nenhum acesso foi ativado." }); },
  });
  const isPending = platformPreparation.isPending || organizationPreparation.isPending;

  function toggleModule(module: WorkforceModule) {
    setModules((current) => current.includes(module) ? current.filter((item) => item !== module) : [...current, module]);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const expiry = formatExpiry(expiresAt);
    if (!canPrepare) { toast.message("Preparação bloqueada", { description: "A política do servidor continua obrigatória para qualquer delegação." }); return; }
    if (!requestId || !role || !purposeCode || modules.length === 0 || !expiry || !confirmedOffline) {
      toast.error("Revise a preparação", { description: "Escolha solicitação, papel, módulos, finalidade, vigência e confirme a verificação humana antes de enviar." });
      return;
    }
    const input = { requestId, role, scopeSelector: { modules }, purposeCode, expiresAt: expiry, correlationId: crypto.randomUUID() };
    if (mode === "platform") platformPreparation.mutate(input);
    else organizationPreparation.mutate(input);
  }

  return <section className="workforce-panel" aria-labelledby={`workforce-${mode}-title`}>
    <header className="workforce-panel__heading">
      <div><p className="workforce-panel__eyebrow">EQUIPE E PERMISSÕES · {mode === "platform" ? "SUPER ADM" : "ADM ORGANIZACIONAL"}</p><h2 id={`workforce-${mode}-title`}>Preparação de colaboradores e corretores.</h2><p>Perfil de trabalho não é alçada. O servidor confirma organização, papel, escopo, vigência e MFA antes de qualquer ativação.</p></div>
      <div className="workforce-panel__proof"><ShieldCheck size={18} aria-hidden="true" /><span>Sem convite externo<br />Sem acesso automático</span></div>
    </header>
    <div className="workforce-panel__grid">
      <div className="workforce-panel__requests" aria-live="polite">
        <div className="workforce-panel__subheading"><UsersRound size={18} aria-hidden="true" /><h3>Solicitações recebidas</h3></div>
        {!canPrepare ? <p className="workforce-panel__notice">A leitura permanece bloqueada até que a sessão e a alçada sejam confirmadas pelo servidor.</p>
          : requested.length === 0 ? <p className="workforce-panel__notice">Nenhuma solicitação pendente retornada no seu escopo. A pessoa interessada inicia a própria solicitação em <code>/acesso-equipe</code>.</p>
            : <ol className="workforce-panel__request-list">{requested.map((request, index) => <li key={request.requestId}><span>Solicitação {String(index + 1).padStart(2, "0")}</span><strong>{profileLabel[request.profile]}</strong><small>{request.organizationLabel} · {stateLabel(request.state)}</small></li>)}</ol>}
      </div>
      <form className="workforce-panel__form" onSubmit={submit} aria-disabled={!canPrepare}>
        <div className="workforce-panel__subheading"><UserRoundCheck size={18} aria-hidden="true" /><h3>Preparar delegação</h3></div>
        <p>Escolha uma solicitação ordinal. Não há nome, e-mail, documento ou identificador da pessoa nesta tela.</p>
        <label htmlFor={`workforce-request-${mode}`}>Solicitação pendente</label>
        <select id={`workforce-request-${mode}`} value={requestId} onChange={(event) => setRequestId(event.target.value)} disabled={!canPrepare || isPending} required>
          <option value="">Selecione uma solicitação</option>
          {requested.map((request, index) => <option key={request.requestId} value={request.requestId}>Solicitação {String(index + 1).padStart(2, "0")} · {profileLabel[request.profile]} · {request.organizationLabel}</option>)}
        </select>
        {mode === "platform" ? <><label htmlFor="workforce-role-platform">Papel organizacional</label><select id="workforce-role-platform" value={role} onChange={(event) => setRole(event.target.value as WorkforceRole)} disabled={!canPrepare || isPending} required><option value="">Escolha um papel</option>{roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></> : <div className="workforce-panel__fixed-role"><span>Papel organizacional</span><strong>Operador</strong><small>ADM não delega ADM nem eleva alçada.</small></div>}
        <fieldset><legend>Módulos mínimos</legend>{moduleOptions.map((option) => <label key={option.value}><input type="checkbox" checked={modules.includes(option.value)} onChange={() => toggleModule(option.value)} disabled={!canPrepare || isPending} /> {option.label}</label>)}</fieldset>
        <fieldset><legend>Finalidade</legend>{purposeOptions.map((option) => <label key={option.value}><input type="radio" name={`workforce-purpose-${mode}`} checked={purposeCode === option.value} onChange={() => setPurposeCode(option.value)} disabled={!canPrepare || isPending} /> {option.label}</label>)}</fieldset>
        <label htmlFor={`workforce-expiry-${mode}`}>Vigência explícita</label>
        <input id={`workforce-expiry-${mode}`} type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} disabled={!canPrepare || isPending} required />
        <label className="workforce-panel__confirm"><input type="checkbox" checked={confirmedOffline} onChange={(event) => setConfirmedOffline(event.target.checked)} disabled={!canPrepare || isPending} /> Confirmei a identificação da pessoa pelo processo interno. Isto não ativa o acesso.</label>
        <button type="submit" disabled={!canPrepare || isPending}>{isPending ? "Validando preparação" : "Preparar delegação"}</button>
      </form>
    </div>
  </section>;
}
