# Matriz de auditoria integral — estratégia do CRM imobiliário

## Versão 0.1 — agosto de 2026

Esta auditoria não avalia apenas se há muitos documentos. Ela verifica se a estratégia forma uma cadeia coerente entre **problema de mercado → domínio → dado → regra → interface → integração → evidência → operação → revisão**. Um item só é considerado organizado quando possui propósito, fonte, dono, limite, dependência, estado e critério de revisão.

> **Regra de auditoria:** uma afirmação pode ser bem pesquisada e ainda não ser uma regra de produto; uma regra pode ser válida e ainda não estar pronta para automação; uma automação pode ser tecnicamente possível e ainda não ser segura para a operação.

## 1. Escopo de verificação

| Eixo | Pergunta de auditoria | Evidência de conformidade | Falha que a auditoria procura |
| --- | --- | --- | --- |
| Tese e mercado | O problema, o segmento e a diferenciação continuam claros? | Tese, benchmark, parceiro-piloto e métrica de valor conectados. | Promessa genérica, escopo disperso ou diferenciação sem prova. |
| Domínio | Locação, venda, construtora, loteadora e financeiro preservam suas diferenças? | Entidade, estado, jornada, gate e responsável por domínio. | Reduzir loteadora a funil de venda ou tratar financeiro como campo de saldo. |
| Dados e privacidade | A coleta, o acesso, a retenção e a evidência têm finalidade e escopo? | Modelo canônico, dossiê progressivo, política de acesso e revisão. | Documento/pessoa sem finalidade, cópia de dados sensíveis ou acesso por cargo genérico. |
| Segurança e plataforma | A arquitetura protege dados, ações e mudanças críticas? | Ambiente, RLS, MFA, migration, testes, segredo, Storage e auditoria. | Permissão só no frontend, segredo público, mudança manual ou documento exposto. |
| Integrações | O CRM sabe origem, ownership, idempotência e reconciliação? | Contrato de dados, inbox/outbox, correlação, erro e reprocessamento. | Callback aplicado duas vezes, integração sem fonte de verdade ou falha invisível. |
| Financeiro e compliance | Direito, evento, aplicação de caixa e exportação mantêm limites profissionais? | Subledger, competência, alçada, lote, retorno e exceção. | CRM prometendo liquidação, imposto, escrituração ou decisão jurídica automática. |
| Experiência e IA | Interface leva de sinal a evidência e ação autorizada? | Pergunta, recorte, método, drill-down, acessibilidade e aprovação humana. | Dashboard decorativo, IA opaca ou cor sem significado redundante. |
| Operação e confiabilidade | Mudança, incidente, backup e exceção possuem owner e resposta? | Métrica, log, runbook, RPO/RTO, rollback e teste de restauração. | “Funciona” sem observabilidade, recuperação ou processo de exceção. |
| Governança de estudo | Toda fonte e decisão permanece rastreável e revisável? | Catálogo, snapshot, limitação, conflito, vigência e nota de mudança. | Fonte sem data, interpretação tratada como fato ou passado substituído em silêncio. |

## 2. Estados de auditoria

| Estado | Significado | Ação exigida |
| --- | --- | --- |
| **Conforme** | Há decisão, material, fonte/limite e critério suficientes. | Manter owner e revisão programada. |
| **Parcial** | A direção está correta, mas falta artefato, teste, owner ou dependência. | Criar item de backlog com gate e prioridade. |
| **Conflito controlado** | Duas fontes, regras ou decisões divergem de forma conhecida. | Preservar ambas, declarar o escopo e abrir revisão. |
| **Risco aberto** | Lacuna pode afetar segurança, caixa, acesso, conformidade ou confiança. | Bloquear automação/produção até ter dono e tratamento. |
| **Fora de escopo** | Necessidade pertence a parceiro/ERP/profissional especializado. | Registrar contrato de interface; não duplicar a responsabilidade. |

## 3. Critérios de passagem

Uma onda de desenvolvimento só avança se: (1) objetos, estados e integrações tiverem owner; (2) dados críticos possuírem finalidade, acesso e versão; (3) mudança de schema/policy for reproduzível; (4) fluxo externo for idempotente e reconciliável; (5) exceção tiver fila, responsável e evidência; e (6) a interface fizer o usuário explicar o recorte e abrir a origem.

## 4. Cadência de revisão

| Evento | Revisão obrigatória | Participantes mínimos |
| --- | --- | --- |
| Nova fonte legal, fiscal, regulatória ou de mercado | Impacto na regra, evidencia e backlog. | Owner de produto + especialista responsável. |
| Novo parceiro de pagamento, ERP, assinatura ou KYC | Contrato de dados, callback, idempotência, privacidade e suporte. | Produto + engenharia + segurança + área responsável. |
| Nova jornada de loteadora ou SPE | Entidade, estado, documentos, direito econômico e fechamento. | Operação + financeiro/controladoria + jurídico conforme escopo. |
| Incidente de acesso, dado, integração ou conciliação | Linha do tempo, alcance, correção, compensação e prevenção. | Owner operacional + segurança + engenharia + responsável de negócio. |
| Piloto mensal | Valor, fricção, uso, exceção, qualidade de dado e decisão de priorização. | Parceiro-piloto + produto + operação. |
