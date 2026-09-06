import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const source = () => readFileSync(path.resolve(process.cwd(), "client/src/components/SubdivisionDevelopmentStudio.tsx"), "utf8");

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
    expect(studio).toContain("Respaldo declarado completo");
    expect(studio).toContain("prepareManualPriceBaseCorrectionMutation");
    expect(studio).toContain('documentState: "declared_complete"');
    expect(studio).toContain("A correção não aprova nem disponibiliza o Lote.");
    expect(studio).toContain("Anexar respaldo privado");
    expect(studio).toContain('setAttachmentCategory("other"); openModule("documents");');
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
    expect(studio).toContain("Nenhuma política aprovada e vigente libera referência de preço para este Lote.");
    expect(studio).toContain('lotNumber: priceConditionDraft.scope === "lot"');
    expect(studio).toContain("setFocusedLotPriceTarget({ blockId: lot.blockId, lotNumber: lot.lotNumber })");
  });
});
