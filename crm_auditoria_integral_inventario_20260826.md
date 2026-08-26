# Auditoria integral de estratégia — inventário e critérios

**Data de referência:** 26 de agosto de 2026, GMT-3.  
**Estado:** `auditoria_em_andamento`  
**Afirmação de método:** uma estratégia extensa não é automaticamente completa. Completude nesta auditoria significa que cada decisão relevante tem escopo, modelo, evidência, owner, limite, critério de aceite, dependência e estado de implementação explicitáveis. Ausência de prova será registrada como lacuna, não inferida como cobertura.

## 1. Hierarquia documental auditada

| Camada | Artefatos de autoridade | Papel na auditoria | Falha que esta camada deve impedir |
| --- | --- | --- | --- |
| **A — Direção canônica** | `estrategia_crm_imobiliario_consolidada.md`, `backlog_competitivo_crm.md`, `crm_roteiro_desenvolvimento.md`, `todo.md` | Define tese, limites, prioridades, ondas e pendências. | Documento especializado ou tela criar decisão que contradiz a estratégia. |
| **B — Modelo de domínio** | `crm_modelo_canonico.md`, `crm_nucleo_cadastral_carteira.md`, `crm_dominio_loteadora.md`, `crm_dominio_organizacional.md`, `crm_jornadas_operacoes.md` | Define vocabulário, entidades, estados, papéis e jornadas. | Rótulo vago, duplicidade de entidade ou regra sem objeto responsável. |
| **C — Especialização de operação** | Loteadora/recebíveis, subledger, financeiro/split, cadastro, contabilidade, login, administração, sidebar e UX. | Transforma domínio em estados, controles e critérios de aceite. | Superficialidade em lote, repasse, contrato, acesso, fiscal, navegação ou exceção. |
| **D — Evidência e revisão** | Cadernos `*_evidencias.md`, matrizes de fontes, auditorias de curso/benchmark, integrações de estudos e pesquisa contínua. | Separa fonte, hipótese, conflito, decisão, limitação e revisão. | Marketing, memória ou hipótese virar regra sem prova. |
| **E — Plataforma e execução** | Arquitetura Netlify/Supabase, runbooks, prontidão, contrato administrativo, migrations, Netlify e código/testes. | Liga estratégia à realidade técnica e à prova prática. | Confundir documento aprovado com capability implementada, ou template com arquitetura canônica. |
| **F — Controles permanentes** | Engenharia anti-erro, pente fino, proteção/resiliência, diretriz sem atalhos, auditoria integral. | Classifica risco, exige prova, exceção, recuperação e aprendizado. | Pressa, teste feliz, exceção silenciosa ou histórico reescrito. |

## 2. Trilhos independentes da auditoria

| Trilha | Documentos-núcleo | Perguntas de completude |
| --- | --- | --- |
| **T1 — Produto e cadastros** | Estratégia canônica, modelo, cadastros, jornadas, backlog e UX. | Parte, ativo, papel, proposta, evidência, busca e experiência têm identidade, ciclo, autoridade, aceitação e erro? |
| **T2 — Loteadora e ativos** | Domínio de loteadora, cadastro de loteamentos, recebíveis/distribuição, distrato e evidências. | Gleba, modalidade, fase, lote, alocação, restrição, contrato, carteira e reentrada permanecem distintos e operáveis? |
| **T3 — Financeiro e subledger** | Subledger, núcleo financeiro, split, obrigações, matriz de fontes e integrações de pagamentos. | Direito, base, instrução, retorno, settlement, conciliação, reversão e reporte são segregados, datados e contextualizados? |
| **T4 — Identidade e administração** | Login/identidade, governança organizacional, contrato administrativo, administração de plataforma, RLS/migrations e evidências. | Quem vê, concede, eleva, revoga, recupera, audita e limita acesso sem bootstrap informal ou Super Admin irrestrito? |
| **T5 — Plataforma, integração e resiliência** | Arquitetura, Netlify/Supabase, runbooks, anti-erro, proteção e prontidão operacional. | Fonte de verdade, transação, idempotência, erro, observação, rollback/compensação e deploy estão definidos e testáveis? |
| **T6 — UX, pesquisa e concorrência** | Sistema visual, pesquisa contínua, benchmark, auditorias de estudo, observatório e sidebar. | Experiência traduz domínio sem ocultar limitação? Pesquisa atualiza decisão? Benchmark não copia promessa? Navegação respeita acesso? |

## 3. Matriz de critérios de completude

| Critério | Pergunta de auditoria | Evidência de completude | Severidade se ausente |
| --- | --- | --- | --- |
| **Objeto** | Que entidade, evento, documento ou comando existe? | Vocabulário canônico, ID/ligações e não-duplicidade. | Alta em dado, financeiro, ativo ou acesso. |
| **Estado** | Quais transições são permitidas, negadas, expiram ou compensam? | Máquina de estado, transição, histórico e caso de exceção. | Crítica em reserva, contrato, pagamento, privilégio e distrato. |
| **Autoridade** | Quem decide, executa, revisa e resolve conflito? | Owner, alçada, papel, escopo, vigência e escalonamento. | Crítica em acesso, jurídico, fiscal, financeiro e produção. |
| **Evidência** | O que sustenta fato, regra ou decisão? | Fonte/documento, versão, data, recorte, confiança e limitação. | Alta em estratégia, registro, cálculo e conformidade. |
| **Aceite** | Como permitir/negar e falhar será provado? | Cenário observável, teste, fixture e resultado esperado. | Alta em regra de produto; crítica em comando/integração. |
| **Integração** | Quem é fonte de verdade e o que ocorre em timeout/duplicata? | Contrato, correlação, idempotência, reconciliação e compensação. | Crítica em pagamentos, banco, ERP, assinatura e webhooks. |
| **Experiência** | A pessoa entende estado, limite, próxima ação e recuperação? | Fluxo, vazio, erro, partialidade, teclado, móvel e acessibilidade. | Média/alta, conforme a jornada. |
| **Operação** | Como detectar, conter, recuperar e aprender? | Sinal, owner, runbook, exceção, postmortem e regressão. | Crítica em produção e recuperação. |

## 4. Limites de escopo da auditoria

1. Esta auditoria examina **coerência estratégica e prontidão de desenho**, não afirma conformidade jurídica, fiscal, contábil, ambiental, registral ou bancária de qualquer operação real.
2. A presença de migration A0/A0.1, tela de administração, Function Netlify ou teste não equivale a implementação completa de organizações, convite, pagamento, acesso de clientes ou deploy publicado.
3. Documento detalhado pode ainda estar sem prova de usuário, integração homologada, owner profissional ou aprovação de construção. A auditoria registra essa diferença explicitamente.
4. O CRM preserva a responsabilidade de jurídico, contador, DPO, engenharia/urbanismo, registro e parceiro habilitado; a estratégia não deve absorver tais decisões como automação universal.

## 5. Saída obrigatória dos próximos trilhos

Cada trilho retornará achados em uma mesma ficha: `código`, `severidade`, `afirmação auditada`, `evidência encontrada`, `lacuna/conflito`, `impacto`, `owner`, `correção proposta`, `prova de fechamento` e `estado` (`confirmado`, `parcial`, `lacuna`, `não aplicável` ou `depende de especialista`).
