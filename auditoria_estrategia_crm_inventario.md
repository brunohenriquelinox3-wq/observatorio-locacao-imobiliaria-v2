# Inventário auditável — estratégia do CRM imobiliário

## Leitura de agosto de 2026

Foram identificados **49 documentos Markdown de trabalho** no diretório estratégico. O volume é um ativo de pesquisa, mas só será uma estratégia executável se houver uma hierarquia explícita. Esta auditoria separa, portanto, o que é **fonte canônica de decisão**, o que é **especificação de domínio**, o que é **evidência de apoio** e o que é **histórico de pesquisa**.

## 1. Hierarquia documental obrigatória

| Nível | Artefatos principais | Função na estratégia | Regra de precedência |
| --- | --- | --- | --- |
| **A · Direção canônica** | `estrategia_crm_imobiliario_consolidada.md` | Tese, escopo, princípios, limites, posicionamento e ordem estratégica. | Prevalece na comunicação e nas decisões de produto; aponta para documentos especializados. |
| **B · Constituição de produto** | `crm_modelo_canonico.md`, `crm_jornadas_operacoes.md`, `crm_roteiro_desenvolvimento.md` | Vocabulário, entidades, jornadas, gates e fases de entrega. | Só muda por proposta aprovada e impacto registrado. |
| **C · Constituição técnica** | `arquitetura_crm_netlify_supabase.md`, `crm_netlify_supabase_metodologia.md` | Ambiente, autenticação, RLS, Storage, transação, integração, recuperação e ondas técnicas. | Prevalece sobre conveniência de interface e integração ad hoc. |
| **D · Governança e auditoria** | `crm_protocolo_revisao_viva.md`, `crm_matriz_evidencias.md`, `auditoria_estrategia_crm_metodologia.md` | Fonte, limitação, conflito, owner, cadência, revisão e mudança. | Nenhuma evidência ou regra sensível entra sem registro e estado. |
| **E · Backlog executável** | `backlog_competitivo_crm.md` e backlog de auditoria a consolidar | Hipóteses priorizadas, resultado e critério de aceitação. | Não cria princípio novo sem vincular fonte, decisão e gate. |
| **F · Especificações de domínio** | Loteadora, cadastro, pessoas, subledger, contabilidade, split, visual e integrações. | Detalhe implementável por linha de negócio e função. | Não pode contrariar A–D; divergência abre conflito controlado. |
| **G · Pesquisa e histórico** | Relatórios iniciais, notas, análises críticas, benchmark e cadernos de evidências. | Contexto, argumento, fonte, hipótese e rastreabilidade histórica. | Não altera produto diretamente; alimenta proposta revisável. |

## 2. Cobertura por eixo de auditoria

| Eixo | Cobertura atual | Documentos de referência | Estado preliminar |
| --- | --- | --- | --- |
| Visão, mercado e posicionamento | Forte | Estratégia consolidada, benchmark, diferenciais e relatórios de mercado. | Conforme, com necessidade de recorte comercial por piloto. |
| Modelo de domínio | Forte | Modelo canônico, jornadas, núcleo cadastral, domínio organizacional e loteadora. | Conforme, com dependência de glossário de schema único. |
| Financeiro e controladoria | Forte | Subledger, recebíveis/distribuição, cobrança/split, área do contador e estratégia financeira. | Parcial: políticas requerem validação contratual, fiscal e de parceiro. |
| Privacidade, acesso e compliance | Forte em princípio | Dossiês, governança cadastral, protocolo e domínio organizacional. | Parcial: converter princípios em matriz de política/teste operacional. |
| Plataforma Netlify + Supabase | Forte em arquitetura | Arquitetura, metodologia e caderno de evidências de plataforma. | Parcial: ainda sem projeto, migrations, RLS ou ambiente implementados. |
| Integrações e automação | Boa em desenho | Arquitetura, área contábil, cobrança/split e atualização contínua. | Parcial: contrato de integração por fornecedor permanece aberto. |
| UX, visualização e IA | Forte em direção | Sistema visual, evidências visuais e backlog UX. | Parcial: padrões devem ser validados em tarefas reais. |
| Confiabilidade e resposta a incidente | Cobertura inicial | Arquitetura de plataforma e nova matriz de auditoria. | Risco aberto: runbooks, metas de recuperação e testes ainda não existem. |

## 3. Dependências que não podem ficar implícitas

| Decisão ou módulo | Depende de | Bloqueio se ausente | Dono de decisão inicial |
| --- | --- | --- | --- |
| Reserva e condição de lote | Modelo de estoque, transação, alçada e versão de tabela. | Venda concorrente, condição divergente ou auditoria incompleta. | Produto + operação de loteadora. |
| Dossiê e documentos | Finalidade, RLS, Storage privado, retenção e política de acesso. | Exposição de documentos ou coleta excessiva. | Produto + DPO/jurídico conforme escopo. |
| Cascata de direitos | Contrato, elegibilidade, regra versionada, alçada e parceiro de pagamento. | Direito calculado como pagamento, rateio incorreto ou promessa indevida. | Controladoria + jurídico + parceiro habilitado. |
| Integração financeira | Contrato de dados, inbox/outbox, idempotência, retorno e reconciliação. | Duplicação de evento, saldo manual ou perda de origem. | Engenharia + controladoria. |
| Área do contador | Empresa/SPE, competência, snapshot, exportação e exceção. | CRM virar ERP informal ou fechamento sem rastro. | Controladoria + contador responsável. |
| IA e recomendação | Fonte permitida, escopo, permissão, limitação, feedback e aprovação. | Ação opaca em cadastro, contrato, financeiro ou acesso. | Produto + segurança + dono operacional. |

## 4. Conflitos, sobreposições e decisão de organização

| Tema | Constatação | Decisão de auditoria | Ação de consolidação |
| --- | --- | --- | --- |
| Roteiros de entrega | A estratégia consolidada inclui núcleo financeiro antes de inteligência; o roteiro anterior reúne vendas/lotes e não torna financeiro uma fase própria. | A estratégia consolidada e a arquitetura técnica passam a definir a sequência-mestra. | Criar roadmap unificado por ondas, gates e dependências. |
| Governança de fontes | `crm_atualizacao_continua`, matriz de evidências e protocolo de revisão tratam partes do mesmo ciclo. | O protocolo de revisão vira semântica canônica; os demais tornam-se guias especializados. | Incluir índice de governança e links cruzados. |
| Backlog | COMP, UX e PLAT estão organizados, mas faltam itens de domínio, operação e auditoria. | Um backlog único terá prefixos por tipo, sem misturar descoberta com promessa. | Acrescentar DOM, OPS e AUD com critérios verificáveis. |
| Arquitetura de produto e plataforma | Roteiro antigo usa “camada de serviços” genérica; arquitetura nova define Netlify + Supabase. | A arquitetura Netlify + Supabase é a referência de implementação. | Atualizar a estratégia e o roteiro para retirar ambiguidade. |
| Documentos históricos | Relatórios iniciais continuam úteis, mas podem ser confundidos com regra vigente. | Todo documento recebe papel documental e status de vigência. | Criar índice mestre e registrar fonte de verdade por assunto. |

## 5. Linha mestra preservada

O CRM permanece uma plataforma de **relações, direitos econômicos e evidências** para imobiliárias e loteadoras. A organização documental não muda essa tese; ela evita que a expansão para financeiro, plataforma, visualização, IA e integração transforme o produto em um conjunto disperso de módulos. A sequência válida é: **núcleo e rotina → proposta e dossiê → loteadora e carteira → subledger e integração → inteligência e escala**, sempre com evidência, autorização, versionamento e limite de responsabilidade.

## 6. Próxima saída da auditoria

A consolidação deve produzir um registro de achados `AUD-*`, uma decisão explícita de roadmap, um índice de fontes de verdade e requisitos de confiabilidade que ainda não existiam de forma priorizada: testes de RLS, contrato de eventos, SLO/alerta, backup/restore, retenção, readiness de incidente e validação de performance por jornada.
