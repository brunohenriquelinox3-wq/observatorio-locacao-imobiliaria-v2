import type { SubdivisionContext } from "@shared/subdivisionContracts";
import { CircleAlert, ClipboardCheck, ShieldCheck, UserRoundCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { formatSubdivisionDevelopmentLabel } from "@/lib/subdivisionOperationalReference";

type DevelopmentOption = { developmentId: string; internalReference: string };
type InternalRoleOption = { linkId: string; developmentId: string; role: string };

type SubdivisionPreparationProfileProps = {
  context: SubdivisionContext;
  isContextReady: boolean;
  isWorkspaceReady: boolean;
  developments: DevelopmentOption[] | undefined;
  internalPartyRoles: InternalRoleOption[] | undefined;
};

const planningStates = {
  reference: "Referência interna",
  internal_study: "Estudo interno",
  project_preparation: "Preparação de projeto",
  internal_review: "Revisão interna",
} as const;

const compliancePreparationStates = {
  not_started: "Não iniciada",
  internal_organization: "Organização interna",
  evidence_for_review: "Evidência para revisão",
} as const;

const implementationPreparationStates = {
  not_started: "Não iniciada",
  internal_planning: "Planejamento interno",
  review_required: "Revisão necessária",
} as const;

export function SubdivisionPreparationProfile({
  context,
  isContextReady,
  isWorkspaceReady,
  developments,
  internalPartyRoles,
}: SubdivisionPreparationProfileProps) {
  const [developmentId, setDevelopmentId] = useState("");
  const [planningState, setPlanningState] = useState<keyof typeof planningStates>("reference");
  const [municipalPreparationState, setMunicipalPreparationState] = useState<keyof typeof compliancePreparationStates>("not_started");
  const [registrationPreparationState, setRegistrationPreparationState] = useState<keyof typeof compliancePreparationStates>("not_started");
  const [implementationPreparationState, setImplementationPreparationState] = useState<keyof typeof implementationPreparationStates>("not_started");
  const [responsibleInternalPartyRoleId, setResponsibleInternalPartyRoleId] = useState("");

  const profilesQuery = trpc.subdivisionFoundation.listDraftDevelopmentPreparationProfiles.useQuery(context, {
    enabled: isWorkspaceReady,
    retry: false,
  });
  const selectedProfile = useMemo(
    () => profilesQuery.data?.find((profile) => profile.developmentId === developmentId),
    [developmentId, profilesQuery.data],
  );
  const eligibleInternalRoles = useMemo(
    () => internalPartyRoles?.filter((role) => role.developmentId === developmentId) ?? [],
    [developmentId, internalPartyRoles],
  );

  useEffect(() => {
    if (!developmentId) {
      setPlanningState("reference");
      setMunicipalPreparationState("not_started");
      setRegistrationPreparationState("not_started");
      setImplementationPreparationState("not_started");
      setResponsibleInternalPartyRoleId("");
      return;
    }
    setPlanningState(selectedProfile?.planningState ?? "reference");
    setMunicipalPreparationState(selectedProfile?.municipalPreparationState ?? "not_started");
    setRegistrationPreparationState(selectedProfile?.registrationPreparationState ?? "not_started");
    setImplementationPreparationState(selectedProfile?.implementationPreparationState ?? "not_started");
    setResponsibleInternalPartyRoleId(selectedProfile?.responsibleInternalPartyRoleId ?? "");
  }, [developmentId, selectedProfile]);

  const utils = trpc.useUtils();
  const saveMutation = trpc.subdivisionFoundation.upsertDraftDevelopmentPreparationProfile.useMutation({
    onSuccess() {
      toast.success("Ficha de preparação atualizada", {
        description: "O registro é interno e não atesta aprovação, registro, implantação, contrato ou financeiro.",
      });
      void utils.subdivisionFoundation.listDraftDevelopmentPreparationProfiles.invalidate(context);
    },
    onError() {
      toast.error("Ficha não atualizada", {
        description: "O servidor exige sessão, contexto e responsável interno elegível no mesmo loteamento.",
      });
    },
  });

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!developmentId) return;
    saveMutation.mutate({
      ...context,
      correlationId: crypto.randomUUID(),
      developmentId,
      planningState,
      municipalPreparationState,
      registrationPreparationState,
      implementationPreparationState,
      responsibleInternalPartyRoleId: responsibleInternalPartyRoleId || null,
    });
  }

  return (
    <section className="subdivision-foundation-workspace" aria-labelledby="subdivision-preparation-title">
      <div className="subdivision-foundation-heading">
        <div>
          <p className="subdivision-foundation-eyebrow">03 · PREPARAÇÃO OPERACIONAL</p>
          <h2 id="subdivision-preparation-title">A ficha separa planejamento, frentes de preparação e responsabilidade interna.</h2>
        </div>
        <p>Estados de trabalho não comprovam viabilidade, protocolo, aprovação, registro ou execução. Nenhum documento, localização, área, custo, contrato ou financeiro é tratado aqui.</p>
      </div>

      <div className="subdivision-foundation-workspace__grid">
        <form className="subdivision-foundation-card" onSubmit={saveProfile}>
          <div className="subdivision-foundation-card__title"><ClipboardCheck size={19} /><h3>Ficha de preparação operacional</h3></div>
          <p>Organize o próximo trabalho humano por loteamento em rascunho, sem antecipar decisões legais, comerciais ou econômicas.</p>

          <label htmlFor="subdivision-preparation-development">Loteamento em rascunho</label>
          <select id="subdivision-preparation-development" value={developmentId} onChange={(event) => setDevelopmentId(event.target.value)} disabled={!isWorkspaceReady || profilesQuery.isLoading} required>
            <option value="">{!isWorkspaceReady ? "Defina um contexto autorizado" : developments?.length ? "Selecione um loteamento autorizado" : "Nenhum loteamento em rascunho neste contexto"}</option>
            {developments?.map((development, index) => <option key={development.developmentId} value={development.developmentId}>{formatSubdivisionDevelopmentLabel(index)}</option>)}
          </select>

          <label htmlFor="subdivision-preparation-planning">Situação de planejamento</label>
          <select id="subdivision-preparation-planning" value={planningState} onChange={(event) => setPlanningState(event.target.value as keyof typeof planningStates)} disabled={!isWorkspaceReady || !developmentId}>
            {Object.entries(planningStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>

          <label htmlFor="subdivision-preparation-municipal">Preparação municipal</label>
          <select id="subdivision-preparation-municipal" value={municipalPreparationState} onChange={(event) => setMunicipalPreparationState(event.target.value as keyof typeof compliancePreparationStates)} disabled={!isWorkspaceReady || !developmentId}>
            {Object.entries(compliancePreparationStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>

          <label htmlFor="subdivision-preparation-registration">Preparação registral</label>
          <select id="subdivision-preparation-registration" value={registrationPreparationState} onChange={(event) => setRegistrationPreparationState(event.target.value as keyof typeof compliancePreparationStates)} disabled={!isWorkspaceReady || !developmentId}>
            {Object.entries(compliancePreparationStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>

          <label htmlFor="subdivision-preparation-implementation">Preparação de implantação</label>
          <select id="subdivision-preparation-implementation" value={implementationPreparationState} onChange={(event) => setImplementationPreparationState(event.target.value as keyof typeof implementationPreparationStates)} disabled={!isWorkspaceReady || !developmentId}>
            {Object.entries(implementationPreparationStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>

          <label htmlFor="subdivision-preparation-responsible">Responsável interno vinculado</label>
          <select id="subdivision-preparation-responsible" value={responsibleInternalPartyRoleId} onChange={(event) => setResponsibleInternalPartyRoleId(event.target.value)} disabled={!isWorkspaceReady || !developmentId}>
            <option value="">Nenhum responsável declarado</option>
            {eligibleInternalRoles.map((role) => <option key={role.linkId} value={role.linkId}>Papel interno vinculado · {role.role}</option>)}
          </select>
          <p className="subdivision-foundation-card__note">A seleção só usa vínculo interno já autorizado no mesmo loteamento. Ela não cria login, escopo, delegação, participação, valor ou repasse.</p>
          <button type="submit" disabled={!isWorkspaceReady || !developmentId || saveMutation.isPending}>{saveMutation.isPending ? "Atualizando ficha" : "Atualizar ficha de preparação"}</button>
        </form>

        <aside className="subdivision-foundation-limits" aria-label="Limites da ficha de preparação operacional">
          <ShieldCheck size={20} />
          <div>
            <h3>Estados internos, decisão humana</h3>
            <p>A ficha organiza preparo e responsabilidade. Aprovação municipal, registro, execução de obra, contratação, documentação, venda, contrato, cobrança e financeiro exigem frentes próprias e validações específicas.</p>
          </div>
        </aside>
      </div>

      {!isContextReady && <div className="subdivision-foundation-empty"><CircleAlert size={18} /><p>Sem contexto não há consulta nem edição da ficha de preparação.</p></div>}
      {isWorkspaceReady && profilesQuery.isLoading && <div className="subdivision-foundation-empty"><span className="subdivision-foundation-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de solicitar as fichas de preparação.</p></div>}
      {isWorkspaceReady && profilesQuery.isError && <div className="subdivision-foundation-empty is-error"><CircleAlert size={18} /><p>A leitura não foi liberada. Revise identidade, membership, grant, vigência e contexto sem inferir outros loteamentos.</p></div>}
      {isWorkspaceReady && developmentId && !profilesQuery.isLoading && !selectedProfile && <div className="subdivision-foundation-empty"><UserRoundCheck size={18} /><p>Nenhuma ficha foi devolvida para este loteamento. A atualização permanece dependente de submissão explícita.</p></div>}
    </section>
  );
}
