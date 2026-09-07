import { FileCheck2, FilePlus2, ShieldCheck } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type DossierContext = { organizationId: string; module: "loteadora"; purposeCode: string };
type Props = { context: DossierContext; isWorkspaceReady: boolean; saleCaseId: string };

const categories = [
  ["buyer_identity", "Identificação do cliente"],
  ["address_evidence", "Comprovante de endereço"],
  ["representation_evidence", "Representação ou vínculo"],
  ["supporting_record", "Documento complementar"],
] as const;

export function SubdivisionSaleCaseDossier({ context, isWorkspaceReady, saleCaseId }: Props) {
  const utils = trpc.useUtils();
  const [category, setCategory] = useState<(typeof categories)[number][0]>("buyer_identity");
  const [reasonCode, setReasonCode] = useState("document_review_required");
  const [preparedIntentId, setPreparedIntentId] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const dossiers = trpc.subdivisionFoundation.listSaleCaseDossiers.useQuery(context, { enabled: isWorkspaceReady && Boolean(saleCaseId), retry: false });
  const current = dossiers.data?.find(item => item.saleCaseId === saleCaseId);
  const createIntent = trpc.subdivisionFoundation.createSaleCaseDocumentIntent.useMutation({ onSuccess(result) { setPreparedIntentId(result.attachmentIntentId); toast.success("Documento privado preparado", { description: "Selecione o arquivo local para concluir o envio opaco. Nenhum conteúdo foi exibido, enviado ou compartilhado." }); void utils.subdivisionFoundation.listSaleCaseDossiers.invalidate(context); }, onError() { toast.error("Documento não preparado", { description: "O servidor exige caso em preparação ou revisão, contexto autorizado e sessão AAL2 vigente." }); } });
  const review = trpc.subdivisionFoundation.setSaleCaseDossierReview.useMutation({ onSuccess(result) { toast.success(result.human_review_confirmed ? "Dossiê confirmado para aprovação" : "Pendência documental registrada", { description: result.human_review_confirmed ? "A confirmação é humana e não assina contrato ou efetua cobrança." : "A pendência permanece interna e não envia mensagem ao cliente." }); void utils.subdivisionFoundation.listSaleCaseDossiers.invalidate(context); }, onError() { toast.error("Revisão do dossiê não registrada", { description: "A confirmação requer ao menos um documento privado registrado; nenhuma inferência automática é aceita." }); } });
  if (!isWorkspaceReady || !saleCaseId) return null;
  async function uploadPrivateDossierAttachment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preparedIntentId || !attachment || isUploading) return;
    if (attachment.size < 1 || attachment.size > 2 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(attachment.type)) { toast.error("Arquivo não aceito", { description: "Escolha PDF, JPEG ou PNG de até 2 MB. A validação definitiva ocorre no servidor." }); return; }
    setIsUploading(true);
    try { const { data } = await getSupabaseBrowserClient()?.auth.getSession() ?? { data: { session: null } }; if (!data.session?.access_token) throw new Error("SUPABASE_SESSION_REQUIRED"); const form = new FormData(); form.set("attachment", attachment); form.set("organizationId", context.organizationId); form.set("purposeCode", context.purposeCode); form.set("correlationId", crypto.randomUUID()); const response = await fetch(`/api/private/subdivision-sale-case-attachments/${preparedIntentId}`, { method: "POST", credentials: "include", headers: { "X-Supabase-Access-Token": data.session.access_token }, body: form }); if (!response.ok) throw new Error("PRIVATE_SALE_CASE_ATTACHMENT_REJECTED"); setPreparedIntentId(""); setAttachment(null); if (attachmentInputRef.current) attachmentInputRef.current.value = ""; toast.success("Documento privado registrado", { description: "O sistema não retorna nome, URL, chave, conteúdo ou download do arquivo." }); void utils.subdivisionFoundation.listSaleCaseDossiers.invalidate(context); } catch { toast.error("Documento não registrado", { description: "O servidor exige sessão, MFA vigente, intenção autorizada, tipo e tamanho válidos, sem revelar detalhes do arquivo." }); } finally { setIsUploading(false); }
  }
  return <section className="subdivision-sale-case-dossier subdivision-foundation-card" aria-labelledby="sale-case-dossier-title">
    <div className="subdivision-foundation-card__title"><FileCheck2 size={19} /><h3 id="sale-case-dossier-title">Dossiê privado e revisão humana</h3></div>
    <p>Organize os documentos recebidos para este caso. O CRM conserva apenas estado opaco e categoria interna; não exibe conteúdo, URL, chave, nome ou download.</p>
    <div className="subdivision-sale-case-dossier__status"><span>{current?.attachmentIntentCount ?? 0} intenção(ões) preparada(s)</span><span>{current?.privateUploadCount ?? 0} arquivo(s) privado(s) registrado(s)</span><b>{current?.dossierState === "ready_for_approval" ? "Revisão humana confirmada" : current?.dossierState === "review_required" ? "Pendência em revisão" : "Aguardando documentação"}</b></div>
    <form onSubmit={event => { event.preventDefault(); createIntent.mutate({ ...context, correlationId: crypto.randomUUID(), saleCaseId, documentCategory: category }); }}>
      <label htmlFor="sale-case-document-category">Categoria interna<select id="sale-case-document-category" value={category} onChange={event => setCategory(event.target.value as typeof category)} disabled={createIntent.isPending}>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <button type="submit" disabled={createIntent.isPending}><FilePlus2 size={16} />{createIntent.isPending ? "Preparando" : "Preparar documento privado"}</button>
    </form>
    {preparedIntentId && <form onSubmit={uploadPrivateDossierAttachment}><label htmlFor="sale-case-private-file">Arquivo local privado<input ref={attachmentInputRef} id="sale-case-private-file" type="file" accept="application/pdf,image/jpeg,image/png" onChange={event => setAttachment(event.target.files?.[0] ?? null)} disabled={isUploading} required /></label><p>{attachment ? "Arquivo selecionado localmente. O nome não será exibido nem persistido nesta tela." : "Selecione o arquivo para concluir o envio privado."}</p><button type="submit" disabled={!attachment || isUploading}>{isUploading ? "Validando e enviando" : "Enviar documento privado"}</button></form>}
    <div className="subdivision-sale-case-dossier__review"><label htmlFor="sale-case-dossier-reason">Código interno da pendência<select id="sale-case-dossier-reason" value={reasonCode} onChange={event => setReasonCode(event.target.value)} disabled={review.isPending}><option value="document_review_required">Documentação em revisão</option><option value="human_validation_required">Validação humana necessária</option><option value="information_pending">Informação pendente</option></select></label><button type="button" onClick={() => review.mutate({ ...context, correlationId: crypto.randomUUID(), saleCaseId, dossierReady: false, reasonCode })} disabled={review.isPending}>Registrar pendência</button><button type="button" onClick={() => review.mutate({ ...context, correlationId: crypto.randomUUID(), saleCaseId, dossierReady: true, reasonCode: null })} disabled={review.isPending || (current?.privateUploadCount ?? 0) < 1}><ShieldCheck size={16} />Confirmar revisão humana</button></div>
    <small>A confirmação só libera a etapa interna seguinte após arquivo privado registrado. Ela não assina, registra, cobra, envia mensagem ou movimenta valores.</small>
  </section>;
}
