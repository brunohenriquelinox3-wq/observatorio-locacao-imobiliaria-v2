const items = [
  { id: "loteamentos", name: "Loteamentos", scope: "Audite cadastro de loteamento, quadras, lotes, documentos, preços/condições, disponibilidade, vínculos de participantes e rotas/componentes/server/banco/testes/Manual. Rastreie Loteamento → Quadra → Lote → Central." },
  { id: "participantes", name: "Sócios e Parceiros", scope: "Audite Sócios e Parceiros, papéis, vínculos temporais, escopos por loteamento/quadra/lote, contratos privados, regras versionadas, snapshots/projeções e comunicação bidirecional com Loteamentos/Central/Financeiro. Preserve a fronteira de projeção interna." },
  { id: "clientes", name: "Clientes Loteadora", scope: "Audite cadastro de clientes, cônjuge, documentos privados, paginação, ficha, arquivamento, busca autorizada e consumo pela Central. Verifique se cliente cadastrado uma vez é reutilizado." },
  { id: "central", name: "Central de Vendas", scope: "Audite seleção de cliente/cônjuge/proponentes, múltiplos proponentes, múltiplos lotes, seleção física, negociação, entrada, agenda, documentação, finalização, idempotência, estoque e continuidade Abrir jornada." },
  { id: "financeiro", name: "Financeiro e Gerenciar Cobranças", scope: "Audite Visão geral, Alertas, Gerenciar cobranças, lotes/itens nominais, origem de venda, pagador principal se já houver contrato, recebedores previstos, projeções, ordenação/paginação e fronteira sem pagamento real." },
  { id: "rotas-seguranca", name: "Rotas, shell, autorização e testes transversais", scope: "Audite App/Wouter, sidebar, deep links, contexto, guards server-side, queries/mutations, contratos compartilhados, testes de navegação, segurança negativa, Manual e release. Encontre destinos fictícios, estados ativos errados e gaps UI→backend." }
];
const itemSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    summary: { type: "string" },
    confirmed: { type: "array", items: { type: "string" } },
    gaps: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    evidence: { type: "array", items: { type: "string" } },
    workpaper_path: { type: "string" }
  },
  required: ["id", "name", "summary", "confirmed", "gaps", "risks", "evidence", "workpaper_path"]
};
const mapped = await parallel(
  "Workpapers da esteira por setor",
  () => items.map((item, index) => agent(
    "Você é um auditor de código do CRM Loteadora. Audite SOMENTE o setor \"" + item.name + "\" no projeto /home/ubuntu/observatorio-locacao-imobiliaria-v2. Escopo: " + item.scope + "\n\nLeia AGENTS.md, o prompt master em /home/ubuntu/upload/pasted_content_76.txt e as skills aplicáveis. Trabalhe metadata-only: não use browser, banco live, SQL, API operacional, mutations, uploads ou dados reais; não leia linhas operacionais. Procure arquivos, rotas, componentes, contratos, adapters, routers, migrations, testes e Manual. Classifique cada elo como confirmed, missing, conflicting, inferred ou not_applicable. Não invente regra comercial. Preserve a fronteira Financeiro nominal/read-only e projeção interna. Escreva um workpaper saneado em docs/esteira-audit/workpapers/" + String(index + 1).padStart(2, "0") + "-" + item.id + ".md, sem PII/IDs/URLs privadas/segredos, contendo: objetivo, cadeia setor→subaba→rota→componente→função→backend→banco/entidade→destino, fatos confirmados, gaps priorizados P0/P1/P2/P3, riscos, desconhecidos, testes existentes e próximos testes. Retorne JSON com o caminho exato e os campos solicitados.",
    { brief: "Auditar setor " + item.name, sandbox: "shared", effort_level: "standard", schema: itemSchema }
  )),
  { schema: itemSchema }
);
const successful = mapped.filter(r => r.ok).map(r => r.value);
const failures = mapped.map((r, i) => r.ok ? null : { item: items[i].id, code: r.error.code, message: r.error.message }).filter(Boolean);
const synthesis = await agent(
  "Você é o auditor líder. Receba os resultados saneados dos seis workpapers da esteira abaixo:\n" + JSON.stringify(successful) + "\n\nLeia os workpapers existentes nesses caminhos e produza o mapa mestre em /home/ubuntu/observatorio-locacao-imobiliaria-v2/docs/esteira-audit/master-audit-2026-09-25.md. O documento deve conter: conclusão executiva; cadeia operacional completa; matriz por setor; mapa de rotas; mapa de dados e entidades sem linhas; mapa financeiro nominal; integrações; gaps P0/P1/P2/P3 com evidência; dependências; ordem linear de correção; critérios de parada; testes; três opções e recomendação. Distinga source-only, live não acessado, confirmado no checkout, hipótese e não aplicável. Não inclua PII, IDs individuais, URLs privadas, segredos ou valores de negócio individuais. Não declare runtime nem venda funcionando sem QA. Retorne JSON com report_path e summary.",
  { brief: "Consolidar mapa mestre da esteira", sandbox: "shared", effort_level: "standard", schema: { type: "object", properties: { report_path: { type: "string" }, summary: { type: "string" } }, required: ["report_path", "summary"] } }
);
return { workpapers: successful, failures, synthesis: synthesis.ok ? synthesis.value : null };
