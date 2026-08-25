# Auditoria aprofundada do curso de desenvolvimento do CRM

> **Estado:** ciclo de auditoria iniciado em 25 de agosto de 2026.  
> **Objeto:** `Curso_Superior_Desenvolvimento_CRM_Loteadoras_e_Imobiliarias_Manu.md`.  
> **Regra:** o curso é um insumo estratégico valioso, mas suas afirmações técnicas, jurídicas, fiscais, percentuais, padrões e exemplos só se tornam regra do CRM após confronto com fonte primária, contexto operacional, teste e responsável.

## 1. O que esta auditoria mede

O material recebido acerta ao deslocar o problema de “CRUD imobiliário” para **sistema de gestão de relações, contratos, evidências, obrigações e efeitos econômicos**. A estratégia já adotada conserva essa direção, mas corrige dois riscos de interpretação: o CRM não se torna ERP, banco, contador, escritório jurídico ou motor fiscal autônomo; e exemplos associados a uma empresa específica não definem, sozinhos, o produto SaaS multi-organização.

| Critério de admissão | Pergunta de auditoria | Saída permitida |
| --- | --- | --- |
| Aderência ao domínio | A regra mantém imobiliária e loteadora como domínios centrais, sem misturá-los? | Vocabulário, agregado, jornada ou requisito. |
| Fonte e vigência | A alegação é técnica, regulatória, contratual ou setorial? Qual fonte primária e data a sustentam? | Evidência com data, escopo e limitação. |
| Executabilidade | A regra pode ser provada por constraint, RLS, transação, teste, observabilidade ou procedimento? | Critério de aceite e caso permitir/negar. |
| Limite institucional | O que permanece com contador, jurídico, DPO, parceiro de pagamento, banco, KYC ou cartório? | Fronteira explícita de responsabilidade. |
| Reversibilidade | Como a mudança entra, é observada, falha e é corrigida sem apagar fatos econômicos? | Migration, feature flag, compensação ou runbook. |

## 2. Inventário crítico do curso

O curso possui doze módulos e anexos. Eles são reorganizados em dez ciclos para evitar a falsa ideia de que arquitetura, dado, segurança, financeiro e entrega podem ser estudados ou implementados isoladamente.

| Ciclo | Módulos/anexos de origem | Pergunta dominante | Prioridade |
| --- | --- | --- | --- |
| 1 | 1, 12 e Anexo D | Como fazer o domínio, e não a tela, governar o software? | P0 |
| 2 | 2 e Anexo A | Que fatos precisam de modelo relacional, versão, tempo e integridade no banco? | P0 |
| 3 | 3, 7 e 12 | Como isolar organização, SPE, pessoa, sessão e operação sem confiar no frontend? | P0 |
| 4 | 4 e Anexo D | Quais agregados e máquinas de estado sustentam lote, contrato, garantia, estoque e distrato? | P0 |
| 5 | 5 e Anexo D | Como preservar decimal, subledger, direitos, split, retorno e conciliação sem o CRM mover dinheiro? | P0 |
| 6 | 6 e 9 | Como expor comando, integração e evento externo sem duplicar efeito ou vazar dado? | P0 |
| 7 | 7 e partes de 3 | Como provar identidade, MFA, acesso, LGPD, suporte e auditoria? | P0 |
| 8 | 8 | Como tornar formulário, carteira, exceção e confirmação compreensíveis sem prometer efeito inexistente? | P1 |
| 9 | 10 | Como transformar invariantes em testes, sinais, incidentes e gates de release? | P0 |
| 10 | 11, 12, anexos B/C | Como escalar consulta, fila, exportação e operação sem quebrar consistência ou isolamento? | P1 com gates P0 |

## 3. Protocolo de dez ciclos

Cada ciclo produz uma ficha própria com quatro blocos: **hipótese do curso**, **contraprova externa**, **decisão de produto/arquitetura** e **teste ou limite operacional**. A pesquisa será repetida por três lentes: fonte primária, documentação técnica de fornecedor e contraponto de operação/segurança. Fórum, issue tracker e anúncio comercial podem formular hipótese, mas não fechar decisão.

| Ciclo | Bateria de estudo | Falhas que precisam ser provocadas | Artefato de saída |
| --- | --- | --- | --- |
| 1. Arquitetura e DDD | Contextos delimitados, linguagem ubíqua, agregado, invariante, regra de domínio fora de UI/adapter. | Regra duplicada em tela/API; contexto que reescreve fato de outro contexto. | Mapa de bounded contexts, ownership e ADRs. |
| 2. Dados e temporalidade | PostgreSQL, `NUMERIC`, constraints, versões, snapshots, migrations expansivas, RLS e recovery. | Dinheiro em ponto flutuante; edição retroativa; migration que rompe policy ou dado vivo. | Matriz fato → tabela → integridade → histórico → teste. |
| 3. Multi-tenancy | Organização/SPE, UUID, membership, RLS, grants, views, Storage e chamadas diretas. | Usuário de A lê B; e-mail/domínio vira autorização; conta local/SSO se confunde. | Matriz permitir/negar por superfície e escopo. |
| 4. Domínio imobiliário | Parte/papel, empreendimento, lote, reserva, contrato, garantia, carteira, distrato e retorno ao estoque. | Dupla reserva, garantia duplicada, contrato incompatível, distrato sem snapshot. | Máquinas de estado, invariantes e cenários concorrentes. |
| 5. Financeiro e fiscal | Decimal, competência/caixa, entitlement, plano de distribuição, split, correção, reconciliação e exportação. | Repetição de callback, arredondamento divergente, benefício sem base, saldo editado, tributação hardcoded. | Subledger, política de cálculo, capacidade de parceiro e reconciliação. |
| 6. API e integrações | DTO, comando, transação curta, idempotência, outbox/inbox, webhook, fila e anti-corruption layer. | Timeout ambíguo, 429/5xx, ordem invertida, payload duplicado, schema drift. | Contratos de integração e runbooks de exceção. |
| 7. Segurança e privacidade | Auth, MFA, step-up, recuperação, RBAC/ABAC, segredo, retenção, audit event, PLD como apoio. | Enumeração, sessão reaproveitada, reset que eleva poder, exportação transversal, segredo em log. | Threat model, RLS/command tests e matriz de responsabilidade. |
| 8. UX operacional | Formulário progressivo, fila, tabelas, confirmação de efeito, acessibilidade, desktop/mobile e erro acionável. | Estado ambíguo, confirmação otimista de pagamento, formulário que pede dado cedo, cor sem texto. | Jornadas críticas, conteúdo de erro e critérios de usabilidade. |
| 9. Qualidade e operação | Teste unitário/transacional/E2E, política de migration, observabilidade, incidente, rollback e postmortem. | Invariante sem teste, RLS sem negação, alerta sem owner, correção sem regressão. | Gates G0–G7, SLI/SLO e catálogo de incidentes. |
| 10. Escala e integração final | Índices, `EXPLAIN`, paginação, fila, cache, carga, custo e fluxo vertical de lote. | N+1, exportação síncrona, cache de saldo, tenant pesado, restore usado como correção de negócio. | Orçamento de capacidade, testes de carga e roteiro vertical. |

## 4. Conflitos e limites já identificados

| Hipótese do curso | Limite que a estratégia adota | Decisão de auditoria |
| --- | --- | --- |
| “CRM é um ERP financeiro” | O CRM mantém subledger, regras, evidências e reconciliação, mas ERP, banco e parceiro habilitado mantêm suas responsabilidades. | Manter a exigência de integridade; recusar transformação silenciosa em banco/ERP fiscal. |
| Percentuais de distrato e regras tributárias em exemplos | Percentuais, prazos, redutores, obrigações e classificação dependem de contrato, produto, vigência e parecer habilitado. | Tratar como dados versionados e confirmação contextual; nunca constantes de código. |
| RBAC por tabela de papéis | Papel-base não resolve organização, SPE, objeto, finalidade, vigência, risco e alçada. | Ampliar para RBAC + ABAC + RLS/RPC server-authoritative. |
| “Controle only” com comprovante | Anexo pode ser evidência, não prova universal de liquidação; parceiro/retorno e conciliação determinam estado econômico. | Preservar controle de comprovante e separar declaração, retorno e settlement. |
| Stack genérica de backend/fila | A estratégia já escolheu Netlify + Supabase como referência inicial; escolhas complementares dependem de capacidade medida. | Comparar padrões, não substituir arquitetura por preferência de framework. |
| Primeiro admin como acesso máximo | Privilégio inicial permanece bootstrap governado, MFA, recovery, audit e suporte JIT. | Nunca criar “nível deus” irrestrito ou e-mail hardcoded. |

## 5. Regra de integração na estratégia viva

Uma descoberta só entra em `estrategia_crm_imobiliario_consolidada.md`, arquitetura, backlog, roteiro ou observatório quando entregar simultaneamente: fonte ou justificativa, decisão, risco residual, owner, critério de aceite e ligação com teste/telemetria. Achados negativos permanecem no caderno como **hipótese descartada ou limitada**; não são apagados.

> **Definição de domínio:** dominar este material não significa prometer ausência de erro ou substituir profissionais habilitados. Significa conhecer a fronteira de cada regra, escolher controles verificáveis, detectar quando a evidência não basta e impedir que a incerteza vire efeito financeiro, registral, fiscal, de privacidade ou de acesso.

## 6. Saídas obrigatórias desta frente

1. Dez fichas de ciclo com fontes, contraprovas, decisões, limites e testes.
2. Matriz consolidada de lacunas e conflitos do curso, priorizada por dinheiro, acesso, dado, integração e operação.
3. Atualização dos documentos canônicos, backlog e roteiro apenas para decisões aprovadas.
4. Lâmina interativa no observatório, com **evidência → leitura → consequência**, sem divulgar segredos, dados pessoais ou configuração de produção.
