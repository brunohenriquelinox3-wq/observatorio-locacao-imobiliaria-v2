const fronts = [
  { id: "eventos-auditoria", name: "Eventos imutáveis, auditoria e correlação", sources: "Priorize Microsoft Learn Event Sourcing Pattern e OWASP Logging Cheat Sheet; compare com a necessidade do CRM de lineage, snapshots, correlação e retenção." },
  { id: "recebiveis", name: "Receivables, agenda, vencimento e alocação nominal", sources: "Priorize fontes oficiais de contabilidade/receivables ou documentação primária de sistemas de contas a receber; separe obrigação, agenda, vencimento, item nominal, pagamento e reconciliação." },
  { id: "seguranca", name: "Menor privilégio, segregação e integridade", sources: "Priorize NIST SP 800-53, OWASP e documentação PostgreSQL/Supabase sobre RLS, privilégios, constraints, idempotência e upload seguro." },
  { id: "ux-operacional", name: "UX empresarial, tabelas e drill-down", sources: "Priorize Microsoft Power BI report drillthrough e documentação oficial de acessibilidade/interaction design; extraia padrões de contexto, busca, filtros, estados e explicação operacional." }
];
const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    sources: { type: "array", items: { type: "string" } },
    findings: { type: "array", items: { type: "string" } },
    decisions: { type: "array", items: { type: "string" } },
    limits: { type: "array", items: { type: "string" } },
    report_path: { type: "string" }
  },
  required: ["id", "name", "sources", "findings", "decisions", "limits", "report_path"]
};
const results = await parallel(
  "Frentes técnicas oficiais",
  () => fronts.map((front, index) => agent(
    "Pesquise exclusivamente a frente técnica \"" + front.name + "\". " + front.sources + "\nUse search/fetch em fontes oficiais/primárias, citando URL pública e data de consulta. Não use PII, credenciais, dados BHL ou telas autenticadas. Compare os achados com o CRM em termos gerais e escreva um relatório saneado em /home/ubuntu/observatorio-locacao-imobiliaria-v2/docs/research-esteira-2026-09/" + String(index + 1).padStart(2, "0") + "-" + front.id + ".md. O relatório deve separar fato da fonte, aplicabilidade técnica ao CRM, decisão recomendada, limite de não aplicação e itens que NÃO devem ser implementados no Financeiro nominal. Retorne JSON nos campos pedidos.",
    { brief: "Pesquisar " + front.name, sandbox: "shared", effort_level: "standard", schema }
  )),
  { schema }
);
const good = results.filter(r => r.ok).map(r => r.value);
const failures = results.map((r, i) => r.ok ? null : { front: fronts[i].id, code: r.error.code, message: r.error.message }).filter(Boolean);
const synthesis = await agent(
  "Consolide os quatro relatórios de pesquisa abaixo em /home/ubuntu/observatorio-locacao-imobiliaria-v2/docs/research-esteira-2026-09/master-research-2026-09-25.md:\n" + JSON.stringify(good) + "\nLeia os arquivos citados, mantenha URLs públicas e fontes oficiais, e produza uma tabela fato→decisão→aplicabilidade→limite. Não invente regra comercial e não recomende pagamento, cobrança externa, banco, Pix, baixa, quitação, split ou repasse no CRM. Retorne JSON com report_path e summary.",
  { brief: "Consolidar pesquisa técnica da esteira", sandbox: "shared", effort_level: "standard", schema: { type: "object", properties: { report_path: { type: "string" }, summary: { type: "string" } }, required: ["report_path", "summary"] } }
);
return { reports: good, failures, synthesis: synthesis.ok ? synthesis.value : null };
