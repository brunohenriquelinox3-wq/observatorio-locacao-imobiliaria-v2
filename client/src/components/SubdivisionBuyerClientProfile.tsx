import type { SubdivisionContext } from "@shared/subdivisionContracts";
import { BadgeCheck, CircleAlert, ClipboardCheck, ContactRound, Landmark, ShieldCheck, UserRoundCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  buyerClientCivilStatuses,
  buyerClientContactChannels,
  buyerClientContactPreferenceStates,
  buyerClientContactPurposes,
  buyerClientProfileCompletion,
  buyerClientRegistrationStates,
  buyerClientRepresentationStates,
  buyerClientRequirementCodes,
  buyerClientRequirementStates,
  recommendedBuyerClientRequirements,
} from "@/lib/subdivisionBuyerClientProfile";
import "./subdivision-buyer-client-profile.css";

type BuyerClientOption = { buyerClientId: string; displayName: string };

type SubdivisionBuyerClientProfileProps = {
  context: SubdivisionContext;
  isContextReady: boolean;
  isWorkspaceReady: boolean;
  buyerClients: BuyerClientOption[] | undefined;
  selectedBuyerClientId?: string;
  onSelectBuyerClient?: (buyerClientId: string) => void;
  presentation?: "full" | "embedded";
};

const partyKinds = { individual: "Pessoa física", legal_entity: "Pessoa jurídica" } as const;

type BuyerProfileFormState = {
  partyKind: keyof typeof partyKinds;
  registrationState: keyof typeof buyerClientRegistrationStates;
  documentReference: string;
  identityDocumentReference: string;
  primaryEmail: string;
  primaryPhone: string;
  messagingPhone: string;
  civilStatus: keyof typeof buyerClientCivilStatuses;
  representationState: keyof typeof buyerClientRepresentationStates;
};

function emptyProfile(): BuyerProfileFormState {
  return {
    partyKind: "individual",
    registrationState: "contact_pending",
    documentReference: "",
    identityDocumentReference: "",
    primaryEmail: "",
    primaryPhone: "",
    messagingPhone: "",
    civilStatus: "not_declared",
    representationState: "not_declared",
  };
}

export function SubdivisionBuyerClientProfile({ context, isContextReady, isWorkspaceReady, buyerClients, selectedBuyerClientId, onSelectBuyerClient, presentation = "full" }: SubdivisionBuyerClientProfileProps) {
  const [uncontrolledBuyerClientId, setUncontrolledBuyerClientId] = useState("");
  const buyerClientId = selectedBuyerClientId ?? uncontrolledBuyerClientId;
  const editorFormRef = useRef<HTMLFormElement>(null);
  const selectorRef = useRef<HTMLSelectElement>(null);
  const selectedBuyerClientIndex = buyerClients?.findIndex((client) => client.buyerClientId === buyerClientId) ?? -1;
  const lastFocusedBuyerClientId = useRef("");
  const restoredProfileAnchor = useRef(false);
  const focusedStandaloneSelector = useRef(false);
  const setBuyerClientId = (buyerClientId: string) => {
    if (selectedBuyerClientId !== undefined) onSelectBuyerClient?.(buyerClientId);
    else setUncontrolledBuyerClientId(buyerClientId);
  };
  const [profile, setProfile] = useState(emptyProfile);
  const [requirementCode, setRequirementCode] = useState<keyof typeof buyerClientRequirementCodes>("identity_evidence");
  const [requirementState, setRequirementState] = useState<keyof typeof buyerClientRequirementStates>("to_confirm");
  const [contactPurpose, setContactPurpose] = useState<keyof typeof buyerClientContactPurposes>("service_contact");
  const [contactChannel, setContactChannel] = useState<keyof typeof buyerClientContactChannels>("email");
  const [preferenceState, setPreferenceState] = useState<keyof typeof buyerClientContactPreferenceStates>("granted");

  function selectAdjacentBuyerClient(direction: -1 | 1) {
    const adjacentBuyerClient = buyerClients?.[selectedBuyerClientIndex + direction];
    if (adjacentBuyerClient) setBuyerClientId(adjacentBuyerClient.buyerClientId);
  }

  const selectionInput = useMemo(() => ({ ...context, buyerClientId }), [buyerClientId, context]);
  const initialDirectoryInput = useMemo(() => ({ ...context, searchTerm: null, pageSize: 25, pageOffset: 0 }), [context]);
  const profileQuery = trpc.subdivisionFoundation.getDraftBuyerClientProfile.useQuery(selectionInput, { enabled: isWorkspaceReady && Boolean(buyerClientId), retry: false });
  const requirementsQuery = trpc.subdivisionFoundation.listDraftBuyerClientRequirements.useQuery(selectionInput, { enabled: isWorkspaceReady && Boolean(buyerClientId), retry: false });
  const preferencesQuery = trpc.subdivisionFoundation.listDraftBuyerClientContactPreferences.useQuery(selectionInput, { enabled: isWorkspaceReady && Boolean(buyerClientId), retry: false });

  useEffect(() => {
    if (!isContextReady && buyerClientId) setBuyerClientId("");
  }, [buyerClientId, isContextReady]);

  useEffect(() => {
    if (!buyerClientId) {
      lastFocusedBuyerClientId.current = "";
      setProfile(emptyProfile());
      return;
    }
    if (profileQuery.data) {
      setProfile({
        partyKind: profileQuery.data.partyKind,
        registrationState: profileQuery.data.registrationState,
        documentReference: profileQuery.data.documentReference ?? "",
        identityDocumentReference: profileQuery.data.identityDocumentReference ?? "",
        primaryEmail: profileQuery.data.primaryEmail ?? "",
        primaryPhone: profileQuery.data.primaryPhone ?? "",
        messagingPhone: profileQuery.data.messagingPhone ?? "",
        civilStatus: profileQuery.data.civilStatus,
        representationState: profileQuery.data.representationState,
      });
    } else if (!profileQuery.isLoading && profileQuery.data === null) {
      setProfile(emptyProfile());
    }
  }, [buyerClientId, profileQuery.data, profileQuery.isLoading]);

  useEffect(() => {
    if (presentation !== "embedded" || !buyerClientId || profileQuery.isLoading || lastFocusedBuyerClientId.current === buyerClientId) return;
    lastFocusedBuyerClientId.current = buyerClientId;
    requestAnimationFrame(() => {
      const editorForm = editorFormRef.current;
      if (!editorForm) return;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      editorForm.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      editorForm.focus({ preventScroll: true });
    });
  }, [buyerClientId, presentation, profileQuery.isLoading]);

  useEffect(() => {
    if (presentation !== "full" || !isWorkspaceReady || restoredProfileAnchor.current || typeof window === "undefined" || window.location.hash !== "#buyer-profile-client") return;
    restoredProfileAnchor.current = true;
    const animationFrame = requestAnimationFrame(() => {
      document.getElementById("buyer-profile-client")?.scrollIntoView({ behavior: "auto", block: "center" });
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [buyerClients?.length, isWorkspaceReady, presentation]);

  useEffect(() => {
    if (presentation !== "full" || !isWorkspaceReady || buyerClientId || focusedStandaloneSelector.current || !buyerClients?.length) return;
    focusedStandaloneSelector.current = true;
    const animationFrame = requestAnimationFrame(() => selectorRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(animationFrame);
  }, [buyerClientId, buyerClients?.length, isWorkspaceReady, presentation]);

  const presenceSnapshot = {
    partyKind: profile.partyKind,
    civilStatus: profile.civilStatus,
    representationState: profile.representationState,
    documentReferencePresent: profile.documentReference.length > 0,
    primaryEmailPresent: profile.primaryEmail.length > 0,
    primaryPhonePresent: profile.primaryPhone.length > 0,
    messagingPhonePresent: profile.messagingPhone.length > 0,
  };
  const completion = buyerClientProfileCompletion(presenceSnapshot);
  const recommendations = recommendedBuyerClientRequirements(presenceSnapshot);
  const utils = trpc.useUtils();
  const saveProfileMutation = trpc.subdivisionFoundation.upsertDraftBuyerClientProfile.useMutation({
    onSuccess(confirmedProfile) {
      utils.subdivisionFoundation.getDraftBuyerClientProfile.setData(selectionInput, confirmedProfile);
      toast.success("Perfil cadastral atualizado", { description: "O cadastro permanece interno, minimizado e separado de venda, crédito, contrato, registro e financeiro." });
      void utils.subdivisionFoundation.listDraftBuyerClientDirectory.invalidate(initialDirectoryInput);
    },
    onError() { toast.error("Perfil não atualizado", { description: "O servidor exige sessão, contexto, cliente comprador elegível e dados compatíveis com a natureza cadastral." }); },
  });
  const saveRequirementMutation = trpc.subdivisionFoundation.upsertDraftBuyerClientRequirement.useMutation({
    onSuccess() {
      toast.success("Pendência de prontidão atualizada", { description: "O estado organiza revisão humana e não representa aprovação jurídica, contratual ou registral." });
      void utils.subdivisionFoundation.listDraftBuyerClientRequirements.invalidate(selectionInput);
    },
    onError() { toast.error("Pendência não atualizada", { description: "O perfil precisa existir no mesmo contexto autorizado. Nenhum documento é enviado por esta ação." }); },
  });
  const savePreferenceMutation = trpc.subdivisionFoundation.upsertDraftBuyerClientContactPreference.useMutation({
    onSuccess() {
      toast.success("Preferência de contato atualizada", { description: "A decisão é específica por finalidade e canal; ela não é um consentimento genérico." });
      void utils.subdivisionFoundation.listDraftBuyerClientContactPreferences.invalidate(selectionInput);
    },
    onError() { toast.error("Preferência não atualizada", { description: "O servidor exige perfil cadastral no contexto autorizado e preserva a auditoria redigida." }); },
  });

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!buyerClientId) return;
    saveProfileMutation.mutate({
      ...context, correlationId: crypto.randomUUID(), buyerClientId,
      partyKind: profile.partyKind, registrationState: profile.registrationState,
      documentReference: profile.documentReference.trim() || null,
      identityDocumentReference: profile.identityDocumentReference.trim() || null,
      primaryEmail: profile.primaryEmail.trim() || null,
      primaryPhone: profile.primaryPhone.trim() || null,
      messagingPhone: profile.messagingPhone.trim() || null,
      civilStatus: profile.civilStatus, representationState: profile.representationState,
    });
  }

  function discardLocalProfileChanges() {
    if (profileQuery.data) {
      setProfile({
        partyKind: profileQuery.data.partyKind,
        registrationState: profileQuery.data.registrationState,
        documentReference: profileQuery.data.documentReference ?? "",
        identityDocumentReference: profileQuery.data.identityDocumentReference ?? "",
        primaryEmail: profileQuery.data.primaryEmail ?? "",
        primaryPhone: profileQuery.data.primaryPhone ?? "",
        messagingPhone: profileQuery.data.messagingPhone ?? "",
        civilStatus: profileQuery.data.civilStatus,
        representationState: profileQuery.data.representationState,
      });
      toast.message("Alterações locais descartadas", { description: "A ficha voltou ao último estado confirmado pelo servidor." });
      return;
    }
    setProfile(emptyProfile());
    toast.message("Campos limpos", { description: "Nenhuma informação foi enviada ao servidor." });
  }

  return (
    <section className={`subdivision-buyer-profile${presentation === "embedded" ? " is-embedded" : ""}`} aria-labelledby={presentation === "full" ? "buyer-profile-title" : undefined}>
      {presentation === "full" && <header className="subdivision-buyer-profile__header">
        <div>
          <p className="subdivision-foundation-eyebrow">08 · FICHA CADASTRAL DO CLIENTE</p>
          <h2 id="buyer-profile-title">Edite contatos, identificação e pendências em uma ficha única.</h2>
          <p>A ficha complementa o Cliente Loteadora já cadastrado, sem duplicar a pessoa. Preencha somente o necessário para a finalidade declarada e deixe o restante para revisão humana futura.</p>
        </div>
        <div className="subdivision-buyer-profile__guard"><ShieldCheck size={19} aria-hidden="true" /><span>Privado por contexto<br /><b>e auditado sem conteúdo</b></span></div>
      </header>}

      {presentation === "embedded" && <div className="subdivision-buyer-profile__embedded-heading"><p className="subdivision-foundation-eyebrow">EDIÇÃO CONTEXTUAL</p><h3>Ficha completa do cliente selecionado</h3><p>Edite dados declarados neste mesmo painel; a gravação só ocorre após confirmação do servidor.</p></div>}

      {presentation === "full" && <div className="subdivision-buyer-profile__selector">
        <label htmlFor="buyer-profile-client">Cliente Loteadora
          <select ref={selectorRef} id="buyer-profile-client" value={buyerClientId} onChange={(event) => setBuyerClientId(event.target.value)} disabled={!isWorkspaceReady || buyerClients === undefined}>
            <option value="">{!isWorkspaceReady ? "Defina um contexto autorizado" : buyerClients?.length ? "Selecione um cliente para editar o cadastro" : "Nenhum cliente neste contexto"}</option>
            {buyerClients?.map((client) => <option key={client.buyerClientId} value={client.buyerClientId}>{client.displayName}</option>)}
          </select>
        </label>
        <p><Landmark size={17} aria-hidden="true" /> Esta área não relaciona cliente a lote, preço, crédito, proposta, contrato, registro ou pagamento.</p>
      </div>}

      {!isContextReady && <div className="subdivision-foundation-empty"><CircleAlert size={18} /><p>Sem contexto autorizado não há consulta nem edição de perfil cadastral.</p></div>}
      {isWorkspaceReady && buyerClientId && profileQuery.isLoading && <div className="subdivision-foundation-empty"><span className="subdivision-foundation-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de solicitar o perfil cadastral.</p></div>}
      {isWorkspaceReady && buyerClientId && profileQuery.isError && <div className="subdivision-foundation-empty is-error"><CircleAlert size={18} /><p>A leitura do perfil não foi liberada. Revise identidade, membership, grant, vigência e contexto sem inferir outros clientes.</p></div>}

      {isWorkspaceReady && buyerClientId && !profileQuery.isLoading && !profileQuery.isError && <div className="subdivision-buyer-profile__workspace">
        <form ref={editorFormRef} id="buyer-profile-contextual-editor" className="subdivision-buyer-profile__form" onSubmit={saveProfile} tabIndex={-1}>
          <div className="subdivision-buyer-profile__selected-notice"><ShieldCheck size={16} aria-hidden="true" /><span>Cadastro selecionado para edição. As alterações desta ficha são confirmadas pelo servidor antes de atualizar o resumo.</span></div>
          <nav className="subdivision-buyer-profile__sequence" aria-label="Navegação entre fichas autorizadas">
            <button type="button" className="is-secondary" onClick={() => selectAdjacentBuyerClient(-1)} disabled={selectedBuyerClientIndex <= 0 || profileQuery.isLoading || saveProfileMutation.isPending}>Ficha anterior</button>
            <span aria-live="polite">Ficha {selectedBuyerClientIndex + 1} de {buyerClients?.length ?? 0}</span>
            <button type="button" className="is-secondary" onClick={() => selectAdjacentBuyerClient(1)} disabled={selectedBuyerClientIndex < 0 || selectedBuyerClientIndex >= (buyerClients?.length ?? 0) - 1 || profileQuery.isLoading || saveProfileMutation.isPending}>Próxima ficha</button>
          </nav>
          <div className="subdivision-buyer-profile__form-heading"><ContactRound size={19} aria-hidden="true" /><div><h3>Dados de contato e identificação</h3><p>Dados declarados não equivalem a validação fiscal, crédito, aprovação ou aptidão para contrato.</p></div></div>
          <div className="subdivision-buyer-profile__grid">
            <label htmlFor="buyer-profile-party-kind">Natureza cadastral<select id="buyer-profile-party-kind" value={profile.partyKind} onChange={(event) => setProfile((current) => ({ ...current, partyKind: event.target.value as keyof typeof partyKinds }))} disabled={profileQuery.isLoading}>{Object.entries(partyKinds).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label htmlFor="buyer-profile-registration-state">Situação do cadastro<select id="buyer-profile-registration-state" value={profile.registrationState} onChange={(event) => setProfile((current) => ({ ...current, registrationState: event.target.value as keyof typeof buyerClientRegistrationStates }))} disabled={profileQuery.isLoading}>{Object.entries(buyerClientRegistrationStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label htmlFor="buyer-profile-document-reference">CPF ou CNPJ<small>Opcional; informe apenas quando a finalidade cadastral justificar.</small><input id="buyer-profile-document-reference" inputMode="numeric" autoComplete="off" value={profile.documentReference} onChange={(event) => setProfile((current) => ({ ...current, documentReference: event.target.value.replace(/\D/g, "") }))} placeholder="Somente números" disabled={profileQuery.isLoading} /></label>
            <label htmlFor="buyer-profile-identity-document">RG ou documento complementar<small>Opcional; não substitui a conferência humana nem o documento privado.</small><input id="buyer-profile-identity-document" autoComplete="off" value={profile.identityDocumentReference} onChange={(event) => setProfile((current) => ({ ...current, identityDocumentReference: event.target.value }))} placeholder="Preencher quando necessário" disabled={profileQuery.isLoading} /></label>
            <label htmlFor="buyer-profile-email">E-mail de contato<small>Opcional; não é autorização automática de comunicação.</small><input id="buyer-profile-email" type="email" autoComplete="off" value={profile.primaryEmail} onChange={(event) => setProfile((current) => ({ ...current, primaryEmail: event.target.value }))} placeholder="Preencher quando necessário" disabled={profileQuery.isLoading} /></label>
            <label htmlFor="buyer-profile-phone">Telefone<input id="buyer-profile-phone" type="tel" autoComplete="off" value={profile.primaryPhone} onChange={(event) => setProfile((current) => ({ ...current, primaryPhone: event.target.value }))} placeholder="Preencher quando necessário" disabled={profileQuery.isLoading} /></label>
            <label htmlFor="buyer-profile-messaging">WhatsApp<input id="buyer-profile-messaging" type="tel" autoComplete="off" value={profile.messagingPhone} onChange={(event) => setProfile((current) => ({ ...current, messagingPhone: event.target.value }))} placeholder="Preencher quando necessário" disabled={profileQuery.isLoading} /></label>
            <label htmlFor="buyer-profile-civil-status">Situação civil declarada<select id="buyer-profile-civil-status" value={profile.civilStatus} onChange={(event) => setProfile((current) => ({ ...current, civilStatus: event.target.value as keyof typeof buyerClientCivilStatuses }))} disabled={profileQuery.isLoading}>{Object.entries(buyerClientCivilStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label htmlFor="buyer-profile-representation">Representação declarada<select id="buyer-profile-representation" value={profile.representationState} onChange={(event) => setProfile((current) => ({ ...current, representationState: event.target.value as keyof typeof buyerClientRepresentationStates }))} disabled={profileQuery.isLoading}>{Object.entries(buyerClientRepresentationStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          </div>
          <p className="subdivision-buyer-profile__notice"><ShieldCheck size={16} aria-hidden="true" /> Não inclua renda, patrimônio, score, dados bancários, lote, preço, forma de pagamento, contrato ou informações sensíveis nesta etapa.</p>
          <div className="subdivision-buyer-profile__form-actions">
            <button type="submit" disabled={profileQuery.isLoading || saveProfileMutation.isPending}>{saveProfileMutation.isPending ? "Salvando cadastro" : "Salvar dados do cliente"}</button>
            <button type="button" className="is-secondary" disabled={profileQuery.isLoading || saveProfileMutation.isPending} onClick={discardLocalProfileChanges}>Descartar alterações locais</button>
          </div>
        </form>

        <aside className="subdivision-buyer-profile__summary" aria-label="Resumo privado de preenchimento">
          <div className="subdivision-buyer-profile__summary-head"><ClipboardCheck size={18} aria-hidden="true" /><span>LEITURA PRIVADA</span></div>
          <strong>{completion.filled}/{completion.total}</strong><span>presenças de contato e referência</span>
          <div className="subdivision-buyer-profile__meter" aria-label={`${completion.percentage}% de presenças cadastradas`}><span style={{ "--buyer-profile-progress": `${completion.percentage}%` } as React.CSSProperties} /></div>
          <p>O indicador conta campos presentes. Não revela os valores e não mede aprovação, qualidade, crédito ou validade documental.</p>
          <dl>
            <div><dt>Cadastro</dt><dd>{buyerClientRegistrationStates[profile.registrationState]}</dd></div>
            <div><dt>Perfil</dt><dd>{partyKinds[profile.partyKind]}</dd></div>
            <div><dt>Representação</dt><dd>{buyerClientRepresentationStates[profile.representationState]}</dd></div>
          </dl>
        </aside>
      </div>}

      {isWorkspaceReady && buyerClientId && !profileQuery.isLoading && !profileQuery.isError && <div className="subdivision-buyer-profile__lower-grid">
        <section className="subdivision-buyer-profile__module" aria-labelledby="buyer-profile-requirements-title">
          <div className="subdivision-buyer-profile__module-head"><BadgeCheck size={18} aria-hidden="true" /><div><p className="subdivision-foundation-eyebrow">PENDÊNCIAS CONDICIONAIS</p><h3 id="buyer-profile-requirements-title">Organize o que precisa ser confirmado.</h3></div></div>
          <p>O checklist é uma trilha de trabalho. Ele não pede arquivo, não declara suficiência e não inicia formalização.</p>
          {!profileQuery.data && !profileQuery.isLoading && <div className="subdivision-buyer-profile__module-empty"><CircleAlert size={16} /><span>Salve primeiro o perfil cadastral para registrar uma pendência condicionada.</span></div>}
          {profileQuery.data && <>
            <div className="subdivision-buyer-profile__recommendations" aria-label="Pendências sugeridas pela condição declarada">
              {recommendations.map((code) => <span key={code}>{buyerClientRequirementCodes[code]}</span>)}
              {recommendations.length === 0 && <span>Nenhuma pendência sugerida; confirme as condições declaradas.</span>}
            </div>
            <form className="subdivision-buyer-profile__compact-form" onSubmit={(event) => { event.preventDefault(); saveRequirementMutation.mutate({ ...context, correlationId: crypto.randomUUID(), buyerClientId, requirementCode, requirementState }); }}>
              <label htmlFor="buyer-profile-requirement-code">Pendência<select id="buyer-profile-requirement-code" value={requirementCode} onChange={(event) => setRequirementCode(event.target.value as keyof typeof buyerClientRequirementCodes)}>{Object.entries(buyerClientRequirementCodes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label htmlFor="buyer-profile-requirement-state">Situação<select id="buyer-profile-requirement-state" value={requirementState} onChange={(event) => setRequirementState(event.target.value as keyof typeof buyerClientRequirementStates)}>{Object.entries(buyerClientRequirementStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <button type="submit" disabled={saveRequirementMutation.isPending}>{saveRequirementMutation.isPending ? "Registrando" : "Atualizar pendência"}</button>
            </form>
            {requirementsQuery.isLoading && <div className="subdivision-buyer-profile__module-empty"><span className="subdivision-foundation-spinner" aria-hidden="true" /> <span>Carregando pendências autorizadas.</span></div>}
            {requirementsQuery.isError && <div className="subdivision-buyer-profile__module-empty is-error"><CircleAlert size={16} /><span>Pendências não liberadas para leitura neste contexto.</span></div>}
            {requirementsQuery.data && <div className="subdivision-buyer-profile__status-list">{requirementsQuery.data.map((item) => <div key={item.requirementCode}><span>{buyerClientRequirementCodes[item.requirementCode]}</span><b>{buyerClientRequirementStates[item.requirementState]}</b></div>)}</div>}
          </>}
        </section>

        <section className="subdivision-buyer-profile__module" aria-labelledby="buyer-profile-preferences-title">
          <div className="subdivision-buyer-profile__module-head"><ContactRound size={18} aria-hidden="true" /><div><p className="subdivision-foundation-eyebrow">PREFERÊNCIAS DE CONTATO</p><h3 id="buyer-profile-preferences-title">Separadas por finalidade e canal.</h3></div></div>
          <p>Registre a decisão aplicável a cada contato. Atendimento e comunicação não são equivalentes; nenhuma opção representa aceite genérico.</p>
          {!profileQuery.data && !profileQuery.isLoading && <div className="subdivision-buyer-profile__module-empty"><CircleAlert size={16} /><span>Salve primeiro o perfil cadastral para registrar uma preferência específica.</span></div>}
          {profileQuery.data && <>
            <form className="subdivision-buyer-profile__compact-form" onSubmit={(event) => { event.preventDefault(); savePreferenceMutation.mutate({ ...context, correlationId: crypto.randomUUID(), buyerClientId, contactPurpose, contactChannel, preferenceState }); }}>
              <label htmlFor="buyer-profile-contact-purpose">Finalidade<select id="buyer-profile-contact-purpose" value={contactPurpose} onChange={(event) => setContactPurpose(event.target.value as keyof typeof buyerClientContactPurposes)}>{Object.entries(buyerClientContactPurposes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label htmlFor="buyer-profile-contact-channel">Canal<select id="buyer-profile-contact-channel" value={contactChannel} onChange={(event) => setContactChannel(event.target.value as keyof typeof buyerClientContactChannels)}>{Object.entries(buyerClientContactChannels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label htmlFor="buyer-profile-contact-state">Decisão<select id="buyer-profile-contact-state" value={preferenceState} onChange={(event) => setPreferenceState(event.target.value as keyof typeof buyerClientContactPreferenceStates)}>{Object.entries(buyerClientContactPreferenceStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <button type="submit" disabled={savePreferenceMutation.isPending}>{savePreferenceMutation.isPending ? "Registrando" : "Salvar preferência"}</button>
            </form>
            {preferencesQuery.isLoading && <div className="subdivision-buyer-profile__module-empty"><span className="subdivision-foundation-spinner" aria-hidden="true" /> <span>Carregando preferências autorizadas.</span></div>}
            {preferencesQuery.isError && <div className="subdivision-buyer-profile__module-empty is-error"><CircleAlert size={16} /><span>Preferências não liberadas para leitura neste contexto.</span></div>}
            {preferencesQuery.data && <div className="subdivision-buyer-profile__status-list">{preferencesQuery.data.map((item) => <div key={`${item.contactPurpose}-${item.contactChannel}`}><span>{buyerClientContactPurposes[item.contactPurpose]} · {buyerClientContactChannels[item.contactChannel]}</span><b>{buyerClientContactPreferenceStates[item.preferenceState]}</b></div>)}</div>}
          </>}
        </section>
      </div>}
      {isWorkspaceReady && !buyerClientId && buyerClients?.length === 0 && <div className="subdivision-foundation-empty"><UserRoundCheck size={18} /><p>Quando houver Cliente Loteadora autorizado neste contexto, a ficha cadastral poderá ser organizada aqui sem duplicar o cadastro-base.</p></div>}
    </section>
  );
}
