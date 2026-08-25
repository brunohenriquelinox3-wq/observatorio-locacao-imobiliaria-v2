# Auditoria integral — coerência e continuidade da estratégia do CRM

## Parecer executivo · agosto de 2026

A estratégia possui uma tese consistente e rara para o mercado: o produto não é uma coleção de telas de venda, mas uma infraestrutura de **relações, direitos econômicos e evidências** para imobiliárias e loteadoras. Loteadora, financeiro, dossiê, plataforma, experiência e pesquisa não aparecem como extensões desconectadas; possuem, em geral, entidades, limites e critérios próprios.

O principal risco não é falta de estudo. É a **densidade de estudo** produzir caminhos paralelos se o projeto não consolidar uma hierarquia documental, uma única sequência de ondas e gates técnicos verificáveis. A auditoria conclui que a direção está **conforme**, mas a passagem para construção ainda é **parcial** em segurança testável, confiabilidade, gestão de release, operação de incidente, contrato de integração e avaliação formal de IA.

> **Conclusão de auditoria:** a estratégia está pronta para sair de “pesquisa aprofundada” e entrar em “engenharia disciplinada”, desde que nenhum módulo de alto impacto seja desenvolvido sem o respectivo gate de domínio, segurança, integração, operação e validação profissional.

## 1. Scorecard de organização

| Eixo | Estado | Justificativa de auditoria | Decisão |
| --- | --- | --- | --- |
| Tese e posicionamento | Conforme | A proposta própria conecta campo, lote, contrato, carteira, direito e fechamento. | Preservar a tese; evitar vender como ERP genérico ou simples CRM de leads. |
| Domínio imobiliário e loteadora | Conforme | Entidades, estados paralelos e gates de loteadora foram detalhados. | Manter loteadora como linha central, não como vertical posterior. |
| Financeiro, fiscal e contábil | Parcial | Limites são corretos, mas contratos, políticas e parceiros ainda não foram homologados. | Bloquear promessa de cálculo, liquidação, imposto ou split até validação contextual. |
| Dados, dossiê e LGPD | Parcial | Há princípios sólidos de finalidade, minimização e evidência; faltam políticas executáveis/testadas. | Converter requisitos em classificação, RLS, retenção, exportação e testes. |
| Plataforma Netlify + Supabase | Parcial | Arquitetura de referência é específica e coerente. | Criar fundação técnica antes de módulos de negócio ou integração. |
| Integração e automação | Parcial | Inbox/outbox, idempotência e reconciliação foram definidos em estratégia. | Homologar fornecedor a fornecedor; nenhum adaptador é presumido pronto. |
| UX, gráficos e IA | Parcial | Sistema visual, explicabilidade e aprovação humana estão claros. | Validar por tarefa e registrar avaliação de IA antes de escala. |
| Confiabilidade e operação | Risco aberto | Observabilidade e recuperação existem como intenção, sem SLO, runbook ou teste de restauração. | Criar observabilidade, resposta a incidente e teste de recovery como requisito de fundação. |
| Ciclo de pesquisa e mudança | Conforme | O protocolo separa evidência, interpretação e decisão, com conflito preservado. | Usar o protocolo como porta de entrada obrigatória para todo novo estudo. |
| Engenharia segura e release | Risco aberto | Previews e migrations foram definidos, mas dependência, provenance, SBOM e aprovação ainda não. | Criar gates de release, segredo, vulnerabilidade e separação de deveres. |

## 2. Linha mestra única de evolução

O seguinte encadeamento substitui leituras paralelas de roteiro. Cada onda só começa quando a anterior produz evidência de uso, integridade e operação; as janelas são hipóteses de planejamento, não promessa de prazo comercial.

| Onda | Objetivo de negócio | Fundação técnica obrigatória | Gate de passagem |
| --- | --- | --- | --- |
| **0 · Constituição** | Escolher parceiros-piloto, vocabulário e casos reais. | Repositório, ambientes, migrations, catálogo de decisões, dados sintéticos e observabilidade mínima. | Três parceiros reconhecem domínio, limites e métrica de sucesso. |
| **1 · Rotina confiável** | Capturar intenção, ativo, tarefa, timeline e fila. | `organizations`, memberships, RLS, Auth/MFA por risco, audit event e views autorizadas. | Nenhum caso ativo sem owner/próxima ação; isolamento testado. |
| **2 · Proposta e evidência** | Versionar condição, proposta, dossiê e alçada. | Storage privado, metadados/versionamento, política de retenção e comando transacional. | Dossiê reduz reabertura sem expor documento ou perder versão. |
| **3 · Loteadora e carteira** | Operar empreendimento, fase, lote, reserva, contrato, parcela e exceção. | Concorrência de estoque, estados ortogonais, policy por SPE e testes de cenário. | Lote não é vendido duas vezes e a carteira aponta ao contrato/regra. |
| **4 · Subledger e integração** | Rastrear recebível, direito, retorno, conciliação e fechamento. | Inbox/outbox, idempotência, correlação, worker, SLO, caso de divergência e homologação. | Uma competência-piloto fecha por evento, regra, evidência e retorno. |
| **5 · Inteligência controlada** | Expor pesquisa, previsão assistida e IA verificável. | Catálogo de fontes, lineage de métrica, avaliação de IA, feature flag e monitoramento de qualidade. | Gestão entende o recorte; IA é aprovada/recusada com rastro e sem ação sensível autônoma. |
| **6 · Escala disciplinada** | Ampliar parceiros, regiões e integrações comprovadas. | Performance, custo, SLO, recovery, supply chain, incidentes e revisão de acesso. | Escala não reduz rastreabilidade, segurança, suporte ou conciliação. |

## 3. Achados priorizados

| ID | Achado | Severidade | Risco se ignorado | Resposta obrigatória |
| --- | --- | --- | --- | --- |
| AUD-01 | Há roteiros históricos com granularidade diferente. | Alta | Construir em ordem errada ou discutir “a fase atual” sem referência única. | Adotar a linha mestra deste relatório e atualizar documentos de roteiro. |
| AUD-02 | Princípios de acesso não viraram suíte de policy/teste. | Crítica | Vazamento entre organizações, SPEs, carteiras, documentos ou funções administrativas. | Definir matriz de escopo e testes de permitir/negar para cada tabela, arquivo e comando. |
| AUD-03 | Regras de domínio e integração dependem de comando transacional ainda não especificado em catálogo. | Crítica | Reserva dupla, direito repetido, contrato alterado por concorrência ou callback reaplicado. | Criar catálogo de comandos críticos, precondição, versão, idempotência, audit event e compensação. |
| AUD-04 | Observabilidade não possui SLI/SLO, runbook ou dono. | Alta | Falha de callback, documento, fila ou exportação percebida tarde e tratada manualmente. | Definir cinco SLOs iniciais, alertas acionáveis, trace/correlação e playbooks. |
| AUD-05 | Gestão de dependências e proveniência de release não foi priorizada. | Alta | Mudança de biblioteca, configuração ou CI/CD chega à produção sem inventário, revisão ou rollback. | Instituir SBOM, varredura, dependabot/alerta equivalente, branch protegida e promoção controlada. |
| AUD-06 | IA possui princípios, mas não um registro formal de caso de uso e avaliação. | Alta | Modelo sugere ou automatiza decisão sem medir erro, viés operacional, permissão ou impacto. | Criar registro de IA, dados permitidos, avaliação, proprietário, limiar, feedback e kill switch. |
| AUD-07 | Retenção, legal hold, exclusão e restauração de evidência não estão no backlog executável. | Alta | Documento fica exposto, é eliminado indevidamente ou não é recuperável quando necessário. | Criar política e teste operacional de ciclo de vida de arquivo/dado. |
| AUD-08 | Contratos de integração não têm um template único por fornecedor. | Alta | ERP, cobrança ou assinatura recebem dados sem finalidade, sem idempotência e sem suporte definido. | Adotar ficha de integração: ownership, payload, assinatura, SLA, limites, erro, replay, reversão e LGPD. |
| AUD-09 | Métricas de produto não têm catálogo único de definição e lineage. | Média | Indicadores iguais exibem números diferentes ou são tratados como promessa comercial. | Versionar métrica, recorte, fórmula, fonte, atualização, limitação e dono. |
| AUD-10 | Performance e custo aparecem somente em visão de futuro. | Média | Dashboard, busca, documento e relatórios degradam ao ampliar carteira/SPE. | Fixar orçamento de desempenho e testes de carga por jornada antes de escala. |
| AUD-11 | Decisões que exigem jurídico, DPO, contador/fiscal ou parceiro habilitado estão claras, mas precisam de agenda de validação. | Média | Configuração é tratada como regra universal e vira risco regulatório/contratual. | Criar conselho de validação por domínio e registrar parecer/limite sem copiar conteúdo profissional restrito. |
| AUD-12 | Adoção é medida por uso geral, sem plano de experimento por papel. | Média | A equipe usa parcialmente e o produto conclui valor inexistente. | Definir hipótese, tarefa, baseline, métrica e decisão por corretor, gestor, loteadora e contador. |

## 4. Decisões de continuidade

| Decisão | Estado | Justificativa |
| --- | --- | --- |
| Netlify + Supabase permanecem como base de experiência, identidade, Postgres, RLS, documentos e eventos. | Confirmada | A arquitetura separa entrega web de dado e comando autoritativo, com espaço para parceiros especializados. |
| Loteadora mantém prioridade igual a locação, venda urbana e construtora. | Confirmada | O ciclo de terra a carteira é domínio próprio e sustenta diferenciação. |
| CRM não vira banco, instituição de pagamento, ERP, contador, escritório jurídico ou motor de decisão de crédito opaco. | Confirmada | O produto organiza contexto, regra, aprovação, instrução e conciliação; profissionais e parceiros executam/validam o que lhes pertence. |
| IA é camada assistiva e verificável, não autoridade de mudança. | Confirmada | Fonte, permissão, limite, revisão e resultado devem aparecer em cada uso de risco. |
| Novas integrações entram por contrato e homologação, nunca como campo de configuração genérico. | Confirmada | Previne duplicação de efeito, exposição de segredo e perda de reconciliação. |

## 5. Fronteiras que exigem validação contextual

As decisões de retenção, base legal, consentimento, KYC, assinatura, tratamento de documento, regra municipal, tributação, retenção fiscal, reconhecimento contábil, split, cobrança, estorno, exportação e comunicação regulatória não são concluídas por este relatório. O CRM deverá registrar a configuração, a evidência, a vigência, o aprovador e a exceção; a decisão aplicável exige validação de jurídico, DPO, contador/fiscal, controladoria e parceiro financeiro habilitado conforme empresa, SPE, contrato, município e caso.

## 6. Referências de auditoria

[1] [Matriz de auditoria integral](auditoria_estrategia_crm_metodologia.md)

[2] [Inventário auditável da estratégia](auditoria_estrategia_crm_inventario.md)

[3] [Caderno de evidências da auditoria](auditoria_estrategia_crm_evidencias.md)

[4] [Arquitetura de referência Netlify + Supabase](arquitetura_crm_netlify_supabase.md)

[5] [Protocolo de revisão viva](crm_protocolo_revisao_viva.md)
