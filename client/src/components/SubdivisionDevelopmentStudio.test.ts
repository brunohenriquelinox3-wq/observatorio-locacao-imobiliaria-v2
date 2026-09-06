import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const source = () => readFileSync(path.resolve(process.cwd(), "client/src/components/SubdivisionDevelopmentStudio.tsx"), "utf8");
const priceCardStyles = () => readFileSync(path.resolve(process.cwd(), "client/src/subdivision-lot-price-reference-a260.css"), "utf8");
const operationalEntryStyles = () => readFileSync(path.resolve(process.cwd(), "client/src/subdivision-operational-entry-a261.css"), "utf8");

describe("SubdivisionDevelopmentStudio modular", () => {
  it("organiza o cadastro em cinco módulos independentes", () => {
    const studio = source();
    expect(studio).toContain('id: "identity"');
    expect(studio).toContain('id: "structure"');
    expect(studio).toContain('id: "preparation"');
    expect(studio).toContain('id: "documents"');
    expect(studio).toContain('id: "lifecycle"');
    expect(studio).toContain('const [activeModule, setActiveModule]');
  });

  it("mantém documentos e ciclo condicionados a um rascunho já salvo", () => {
    const studio = source();
    expect(studio).toContain('const requiresSavedDraft = module.id === "documents" || module.id === "lifecycle"');
    expect(studio).toContain('if ((module === "documents" || module === "lifecycle") && !selectedDevelopmentId)');
    expect(studio).toContain('disabled={!isWorkspaceReady || (requiresSavedDraft && !selectedDevelopmentId)}');
  });

  it("preserva os comandos privados de anexos e arquivamento", () => {
    const studio = source();
    expect(studio).toContain('createDevelopmentAttachmentIntent');
    expect(studio).toContain('archiveDevelopmentAttachment');
    expect(studio).toContain('archiveDevelopmentStudio');
    expect(studio).toContain('X-Supabase-Access-Token');
  });

  it("inclui o construtor de Quadras e Lotes no próprio cadastro", () => {
    const studio = source();
    expect(studio).toContain("Monte a matriz do loteamento por Quadra.");
    expect(studio).toContain("Q1 com 15 Lotes e Q2 com 25 Lotes");
    expect(studio).toContain("applyDraftStructure");
    expect(studio).toContain("archiveDraftBlock");
    expect(studio).toContain("Abrir Estoque/Mapa de Lotes");
  });

  it("exige confirmação antes de arquivar parte da estrutura já salva", () => {
    const studio = source();
    expect(studio).toContain("replaceStructureConfirmed");
    expect(studio).toContain("structureWouldArchive && !replaceStructureConfirmed");
    expect(studio).toContain("arquivados logicamente");
  });

  it("mantém módulos de cadastro como unidades navegáveis e não como formulário comprimido", () => {
    const studio = source();
    expect(studio).toContain('caption: "Quadras e Lotes"');
    expect(studio).toContain('aria-label="Matriz de Quadras e Lotes"');
  });

  it("abre o primeiro rascunho autorizado na Estrutura sem sobrescrever uma escolha explícita", () => {
    const studio = source();
    expect(studio).toContain("const [hasExplicitDraftChoice, setHasExplicitDraftChoice]");
    expect(studio).toContain("if (!isWorkspaceReady || hasExplicitDraftChoice || selectedDevelopmentId || mode !== \"create\" || !firstAuthorizedDraft) return;");
    expect(studio).toContain("setActiveModule(\"structure\")");
    expect(studio).toContain("setHasExplicitDraftChoice(true)");
  });

  it("seleciona explicitamente o cadastro recém-criado antes de invalidar a lista", () => {
    const studio = source();
    expect(studio).toContain('toast.success("Cadastro em estruturação criado"');
    expect(studio).toContain('setHasExplicitDraftChoice(true);\n      setRecordFilter("");\n      setSelectedDevelopmentId(result.developmentId);');
    expect(studio).toContain('setActiveModule("structure");');
  });

  it("exibe a leitura gráfica somente com a estrutura autorizada já salva", () => {
    const studio = source();
    expect(studio).toContain("MATRIZ FÍSICA DO CADASTRO");
    expect(studio).toContain("Quadras e Lotes já estruturados");
    expect(studio).toContain("Estruture a primeira Quadra abaixo");
    expect(studio).toContain("Matriz com ${activeSavedStructure.length} Quadras e ${savedLotCount} Lotes em estruturação");
  });

  it("não representa Quadra legada sem Lotes ativos como matriz pronta", () => {
    const studio = source();
    expect(studio).toContain("const activeSavedStructure = savedStructure.filter((block) => block.lotCount > 0)");
    expect(studio).toContain("const legacyEmptyBlocks = savedStructure.filter((block) => block.lotCount < 1)");
    expect(studio).toContain("está registrada sem Lotes ativos");
    expect(studio).toContain("Inconsistência: Quadra sem Lotes ativos");
    expect(studio).toContain("Revisão de estrutura");
  });

  it("organiza a identificação como dossiê progressivo sem campos comerciais", () => {
    const studio = source();
    expect(studio).toContain("BASE DO CADASTRO");
    expect(studio).toContain("ENQUADRAMENTO DECLARADO");
    expect(studio).toContain("TERRITÓRIO DE REFERÊNCIA");
    expect(studio).toContain("SITUAÇÃO E PENDÊNCIAS");
    expect(studio).toContain("parcelingMode");
    expect(studio).toContain("territorialContext");
    expect(studio).toContain("predominantUse");
    expect(studio).toContain("A confirmar na revisão");
    expect(studio).not.toContain('label>Preço do lote');
    expect(studio).not.toContain('label>Contrato');
  });

  it("apresenta o primeiro documento na identificação e preserva o upload privado após salvar o rascunho", () => {
    const studio = source();
    expect(studio).toContain("O primeiro documento começa aqui.");
    expect(studio).toContain("Adicionar documento inicial");
    expect(studio).toContain('setAttachmentCategory("identity")');
    expect(studio).toContain('openModule("documents")');
    expect(studio).toContain('disabled={!selectedDevelopmentId || !isWorkspaceReady || isBusy}');
  });

  it("torna a divergência estrutural visível e não cria Lotes por estimativa", () => {
    const studio = source();
    expect(studio).toContain('const structuralReconciliationState');
    expect(studio).toContain('structuralReconciliationPending');
    expect(studio).toContain("RECONCILIAÇÃO ESTRUTURAL");
    expect(studio).toContain("Não inclua Lotes por estimativa.");
    expect(studio).toContain('requirementCode: "technical_layout"');
    expect(studio).toContain('requirementState: "review_required"');
    expect(studio).not.toContain("Criar Lote faltante");
  });

  it("oferece leitura física por Lote e prévia de preço sem misturar estrutura com venda", () => {
    const studio = source();
    expect(studio).toContain("GESTÃO FÍSICA POR UNIDADE");
    expect(studio).toContain("Buscar Q1, L15, esquina ou tipologia");
    expect(studio).toContain("POLÍTICA DE PREÇO POR M² · PRÉVIA");
    expect(studio).toContain("Simule o valor-base sem misturar preço com a matriz física.");
    expect(studio).toContain("A prévia não grava, não aprova tabela");
    expect(studio).toContain("Lotes sem área não recebem valor por estimativa.");
    expect(studio).toContain("previewBaseTotal");
    expect(studio).not.toContain("Criar contrato de venda");
  });

  it("organiza a preparação contratual como roteiro sem criar atos materiais", () => {
    const studio = source();
    expect(studio).toContain("ROTEIRO CONTRATUAL · PREPARAÇÃO");
    expect(studio).toContain("Preço-base não é proposta; proposta não é contrato");
    expect(studio).toContain("Nunca reverter um Lote por atalho");
    expect(studio).toContain("cliente, proposta, contrato, parcela, assinatura, cobrança, pagamento, restituição ou disponibilidade");
    expect(studio).not.toContain("criarDistrato");
  });

  it("orienta a correção da fonte de preço por linha sem exibir valores ou identificadores físicos", () => {
    const studio = source();
    expect(studio).toContain("Referência saneada: {priceBaseSourcePreview.exceptionRows.map");
    expect(studio).toContain("Nenhum valor, Quadra, Lote ou status é exibido.");
  });

  it("permite preparar linhas válidas com pendência bloqueadora sem permitir aprovação por atalho", () => {
    const studio = source();
    expect(studio).toContain('"Pronto com pendência bloqueadora"');
    expect(studio).toContain('"Preparar com pendência"');
    expect(studio).toContain("policy.exceptionCount > 0");
  });

  it("oferece correção manual governada sem estimar preço nem liberar efeito comercial", () => {
    const studio = source();
    expect(studio).toContain("CORRIGIR PREÇO-BASE PENDENTE");
    expect(studio).toContain("Preparar nova versão com preço explícito");
    expect(studio).toContain("Linha de origem");
    expect(studio).toContain("Preço-base por m² (BRL)");
    expect(studio).toContain("Respaldo privado vinculado:");
    expect(studio).toContain("prepareManualPriceBaseCorrectionMutation");
    expect(studio).toContain('documentState: "declared_complete"');
    expect(studio).toContain("A correção não aprova nem disponibiliza o Lote.");
    expect(studio).toContain("Anexar respaldo privado");
    expect(studio).toContain('setAttachmentCategory("other"); openModule("documents");');
    expect(studio).toContain("manualCorrectionEvidenceCount === 0");
    expect(studio).toContain("Vincule um respaldo privado ativo à política-fonte antes de preparar a correção.");
  });

  it("restringe a retirada de política-base ao estado encaminhado", () => {
    const studio = source();
    expect(studio).toContain("withdrawPriceBasePolicyMutation");
    expect(studio).toContain('policy.state === "submitted" && <>');
    expect(studio).toContain("Retirar encaminhamento");
    expect(studio).toContain("Somente política encaminhada e ainda não aprovada pode ser retirada");
    expect(studio).toContain("Motivo da retirada");
    expect(studio).toContain("withdrawPriceBaseReason");
    expect(studio).toContain("Revisão de governança");
    expect(studio).toContain("policyReadyForApproval");
    expect(studio).toContain("Mantenha ao menos um respaldo privado ativo antes de aprovar.");
  });

  it("oferece condições flexíveis por escopo sem liberar preço antes de política aprovada", () => {
    const studio = source();
    expect(studio).toContain("CONDIÇÕES E AJUSTES DE PREÇO");
    expect(studio).toContain("MODALIDADES DISPONÍVEIS");
    expect(studio).toContain("ESCOPOS DISPONÍVEIS");
    expect(studio).toContain("TIPOS DISPONÍVEIS");
    expect(studio).toContain("CONTROLES OBRIGATÓRIOS");
    expect(studio).toContain("Todo o loteamento");
    expect(studio).toContain("Uma Quadra");
    expect(studio).toContain("Um Lote");
    expect(studio).toContain("Novo valor por m²");
    expect(studio).toContain("Reajuste percentual");
    expect(studio).toContain("Desconto temporário");
    expect(studio).toContain("Término");
    expect(studio).toContain("Obrigatório para desconto");
    expect(studio).toContain("Respaldo documental");
    expect(studio).toContain("anexo(s) privado(s) no cadastro");
    expect(studio).toContain("Adicionar respaldo privado");
    expect(studio).toContain("A preparação registra motivo, escopo, vigência e estado documental.");
    expect(studio).toContain("Aprovar como segunda pessoa");
    expect(studio).toContain("PREÇO-BASE INTERNO POR M²");
    expect(studio).toContain('lotNumber: priceConditionDraft.scope === "lot"');
    expect(studio).toContain("setFocusedLotPriceTarget({ blockId: lot.blockId, lotNumber: lot.lotNumber })");
    expect(studio).toContain("PREÇO POR M²");
    expect(studio).toContain("VALOR TOTAL");
    expect(studio).toContain("effectiveLotTotalBrl");
    expect(studio).toContain("Referência interna preparada. Não gera disponibilidade, venda ou preço contratual.");
    expect(studio).toContain("Revalidação de MFA necessária");
    expect(studio).toContain("Confirme a sessão em Segurança e MFA");
    expect(studio).toContain("Cada cartão reúne a ficha física, o preço-base interno por m² e o valor total calculado pela área confirmada.");
    expect(studio).toContain("Preço-base não informado");
    expect(studio).toContain("selectLotForPriceAdjustment");
    expect(studio).toContain("FINALIDADE FÍSICA RESERVADA");
    expect(studio).toContain("Reserva de proprietários da área de origem");
    expect(studio).toContain("Infraestrutura · poço artesiano");
    expect(studio).toContain("Infraestrutura · caixa d’água");
    expect(studio).toContain("Registrar finalidade física");
    expect(studio).toContain("Finalidade física");
    expect(studio).toContain("Somente reservas físicas");
    expect(studio).toContain("Reserva patrimonial");
    expect(studio).toContain("EDIÇÃO FÍSICA POR LOTE");
    expect(studio).toContain("Salvar ficha física do Lote");
    expect(studio).toContain("EDIÇÃO FÍSICA POR QUADRA");
    expect(studio).toContain("Salvar ficha física da Quadra");
    expect(studio).toContain("Observação interna");
    expect(studio).toContain("Selecione o Lote, confira as quatro divisas e salve a ficha física.");
    expect(studio).toContain("Lateral esquerda (m)");
    expect(studio).toContain("Lateral direita (m)");
    expect(studio).toContain("Fundos (m)");
    expect(studio).toContain("A área física é um atributo próprio");
    expect(studio).toContain("Motivo da retirada");
    expect(studio).toContain("upsertDraftBlockOperationalProfile");
    expect(studio).toContain("selectLotForOperationalEdit");
    expect(studio).toContain("Editar ficha física deste Lote");
    expect(studio).toContain("Preparar ajuste governado para este Lote");
    expect(studio).toContain("Ajustar");
    expect(studio).toContain("Você está revisando a unidade física selecionada.");
  });

  it("organiza a referência de preço como leitura hierárquica e responsiva, sem mensagens decorativas comprimidas", () => {
    const studio = source();
    const styles = priceCardStyles();

    expect(studio).toContain('import "../subdivision-lot-price-reference-a260.css";');
    expect(styles).toContain("grid-template-columns: repeat(auto-fill, minmax(14.5rem, 1fr))");
    expect(styles).toContain("display: contents;");
    expect(styles).toContain("A260-R1: Área, preço-base e total pertencem à mesma grade operacional do Lote.");
    expect(styles).toContain('content: "R$";');
    expect(styles).toContain(".subdivision-lot-management__lot-measures > div:nth-child(1) { order: 2; }");
    expect(styles).toContain(".subdivision-lot-management__price-values > div:first-child { order: 3; }");
    expect(styles).toContain(".subdivision-lot-management__price-values > div:last-child { order: 4; }");
    expect(styles).toContain("grid-template-columns: 1fr;");
    expect(styles).toContain("grid-template-columns: minmax(0, 1fr) auto;");
    expect(styles).toContain("margin-top: auto;");
    expect(styles).toContain("content: none;");
    expect(styles).toContain("font-variant-numeric: tabular-nums;");
    expect(styles).toContain("@media (max-width: 440px)");
  });

  it("prioriza uma entrada operacional de portfólio sem manter barras laterais concorrentes", () => {
    const studio = source();
    const styles = operationalEntryStyles();

    expect(studio).toContain('import "../subdivision-operational-entry-a261.css";');
    expect(studio).toContain('const [studioView, setStudioView] = useState<"overview" | "workspace">("overview")');
    expect(studio).toContain("EMPREENDIMENTO EM FOCO");
    expect(studio).toContain("Escolher empreendimento");
    expect(studio).toContain("Visão Operacional");
    expect(studio).toContain("Cadastro do Empreendimento");
    expect(studio).toContain('aria-selected={studioView === "overview"}');
    expect(studio).toContain('aria-selected={studioView === "workspace"}');
    expect(studio).toContain("Quadras estruturadas");
    expect(studio).toContain("Lotes físicos");
    expect(studio).toContain("ESTRUTURA POR QUADRA");
    expect(studio).toContain("COBERTURA FÍSICA");
    expect(studio).toContain("sem inferir disponibilidade");
    expect(studio).toContain("não representam preço comercial, disponibilidade, venda, contrato ou financeiro");
    expect(studio).toContain('setStudioView("overview")');
    expect(studio).toContain('setStudioView("workspace")');
    expect(styles).toContain(".subdivision-foundation-page { max-width: none; }");
    expect(styles).toContain(".subdivision-studio__workbench { display: block;");
    expect(styles).toContain('.subdivision-studio__workbench[data-view="overview"] { display: none; }');
    expect(styles).toContain(".subdivision-studio__workbench > .subdivision-studio__records, .subdivision-studio__workbench > .subdivision-studio__overview { display: none; }");
    expect(styles).toContain("@media (max-width: 780px)");
  });
});
