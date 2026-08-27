# Matriz de confronto — referências externas × estratégia de Vendas Urbanas e Locação

**Data:** `2026-08-27`  
**Status:** `confronto_documental_concluído`  
**Escopo:** Vendas Urbanas e Locação. Não altera SUPER ADM, ADM ou Loteadora, nem cria funcionalidades, integrações, permissões ou operações.

> **Método:** cada fonte é tratada como evidência de prática de mercado ou arquitetura. A estratégia só é atualizada quando a prática reforça um requisito, revela um limite ou eleva a qualidade de um critério de aceite. Alegação comercial não é prova de eficácia, conformidade ou adequação automática.

## 1. Resultado executivo do confronto

O estudo externo não identificou a necessidade de substituir a arquitetura estratégica já definida. Ele confirmou cinco teses que passam a ser reforçadas como requisitos centrais: **registro canônico com relações explícitas; trabalho em contexto de jornada; integração por capacidade e não por fornecedor; inteligência humana supervisionada; e experiência de decisão com estado, acessibilidade e compartilhamento governado.** As fontes também reforçaram que reunir vendas, locação, finanças, documentos e comunicação numa mesma experiência só é seguro quando cada domínio conserva fatos, permissões e transições próprios.[1] [2] [3] [4]

| Resultado | Decisão estratégica | Evidência de referência | Registro interno afetado |
| --- | --- | --- | --- |
| Confirmado | Manter parte, imóvel, oportunidade, proposta, contrato, documento e obrigação como objetos com associação explícita e temporalidade. | Objetos e associações suportam fluxos próprios; soluções imobiliárias destacam uma visão única de relacionamento.[1] [5] | Fundação compartilhada e matriz mestre. |
| Reforçado | Tratar pipeline/esteira como workspace de trabalho com critério de entrada, saída, idade, pendência e próximo passo. | Referências distinguem pipeline de funil e destacam visibilidade de estágio/atraso.[2] [6] [7] | Jornadas e experiência operacional. |
| Refinado | Separar leitura unificada de escrita unificada: o usuário pode ler contexto de contrato, carteira, serviço e documento sem ganhar permissão para alterar todos esses fatos. | Produtos integrados oferecem visão cruzada; OWASP evidencia o risco de autorização inadequada por objeto, propriedade e função.[3] [8] | Fundação, experiência e segurança. |
| Reforçado | Exigir adaptador por capacidade externa: leitura, comando, arquivo, comunicação, publicação, financeiro e callback possuem escopo e reconciliação próprios. | APIs imobiliárias e plataformas financeiras expõem capacidades diversas e fluxos externos de confirmação.[4] [9] | Governança de dados, financeiro e caderno executivo. |
| Refinado | IA só recomenda, resume, prioriza ou prepara rascunho até haver política específica para autonomia material. | NIST organiza IA em Govern/Map/Measure/Manage; concorrentes divulgam IA para atendimento e tarefas.[7] [10] [11] | Inteligência, métricas e canais. |
| Reforçado | Portais são grants mínimos ligados a objeto, finalidade e vigência, e não “acesso ao sistema”. | Portais de proprietário e cliente expõem documentos, relatórios e transações; a superfície deve ser limitada.[3] [12] | Locação, portais e fundação. |
| Confirmado | Dossiê digital deve ter versão, responsável, pendência, evidência e ligação com proposta/contrato. | Espaços de transação imobiliária centralizam documentos, templates, aprovações e assinaturas.[13] | Vendas Urbanas, Locação e documentos. |
| Reforçado | Acessibilidade e feedback de estado são critérios de aceite de jornadas, não acabamento visual. | WCAG 2.2 estrutura critérios testáveis; visibilidade de estado reduz incerteza operacional.[14] [15] | Experiência operacional. |

## 2. Vendas Urbanas: reforços e limites

| Tema | Convergência observada | Atualização estratégica aplicável | O que não será copiado automaticamente | Critério futuro de aceite |
| --- | --- | --- | --- | --- |
| Lead e pipeline | CRM de vendas enfatiza funil, distribuição, resposta rápida, oportunidade, próxima ação e análise de conversão.[2] [6] [7] | O cockpit de vendas deve unir origem, intenção, responsável, SLA, atividade, imóvel de interesse e bloqueio, sem esconder a causa da prioridade. | Distribuição automática ou roleta não pode mudar owner sem policy, capacidade, registro de decisão e reversão. | Em cada negócio, a equipe explica estágio, próxima ação, atraso e motivo de qualquer sugestão/atribuição. |
| Imóvel e disponibilidade | Plataformas do setor exibem estoque, disponibilidade, controle de chaves, mapas e integração com inventário externo.[6] [7] [11] | Disponibilidade precisa declarar fonte, instante de atualização, status e dependência de confirmação. | Estoque/valor de parceiro não se tornam verdade local sem contrato de sincronização, origem e tratamento de conflito. | Uma proposta identifica o imóvel/empreendimento correto, a versão da disponibilidade e a pendência que impede avanço. |
| Visita e proposta | A referência de CRM imobiliário usa agenda, visita e contexto de oportunidade no mesmo fluxo.[7] | Visita deve ligar lead, imóvel, objetivo, responsável, agenda, evidência e resultado, sem precisar criar cadastro paralelo. | Lembrete, confirmação e comunicação não são automáticos sem consentimento/canal/política. | Concluir uma visita produz próximo passo explícito, sem alterar proposta ou contrato por inferência. |
| Dossiê e contrato | Espaços de transação centralizam documentos, formulários, aprovações e assinatura.[13] | Proposta e contrato devem apontar para checklist de evidência, versão, signatário, prazo e exceção. | Assinatura eletrônica não equivale a aceite de negócio, recebimento, faturamento ou pagamento. | O dossiê mostra o que está pendente, qual versão vigora e quem pode avançar/rejeitar. |
| Financeiro comercial | Referências de plataforma destacam financiamento, pagamentos e fluxos de fundos.[9] [11] | Comissão, direito, condição, instrução, retorno e liquidação continuam separados por evento e versão. | Nenhuma “automação de comissão” pode efetuar transferência por existir venda ou status visual. | Toda projeção indica base, versão, dependência, responsável e diferença entre previsto e liquidado. |

## 3. Locação: reforços e limites

| Tema | Convergência observada | Atualização estratégica aplicável | O que não será copiado automaticamente | Critério futuro de aceite |
| --- | --- | --- | --- | --- |
| Relação contínua | Produtos de locação conectam prospecto, candidato, residente/locatário, renovação, ledger e manutenção.[5] [16] | Um read model contextual deve conectar parte, imóvel, contrato, ciclo de administração, carteira, renovação e serviço sem duplicar a fonte de verdade. | Uma ficha “única” não autoriza todos os usuários a ver campos ou documentos de todos os ciclos. | Cada papel vê somente fatos autorizados, com fonte/atualização clara e sem acesso implícito a outro contrato. |
| Esteira e renovação | Filas de locação e dashboards de renovação reforçam trabalho por vencimento, pendência e responsável.[5] [16] | A esteira deve distinguir captação/administração, proposta, análise, contrato, vigência, renovação, rescisão e pós-contrato. | Mudança de etapa não pode gerar boleto, garantia, assinatura, comunicação ou repasse automaticamente. | Uma renovação exibe prazo, documentos, proposta, pendência e decisão humana necessária. |
| Proprietário e portal | Portais concentram documentos, relatórios, tarefas e informações por propriedade.[3] | Portal precisa de grant mínimo, escopo por objeto, validade, finalidade, expiração e auditoria de download/visualização. | Não haverá painel amplo por e-mail, URL ou vínculo histórico sem grant ativo. | Toda leitura externa pode ser explicada por grant, objeto, campo e evento de acesso. |
| Manutenção e prestador | Plataformas conectam work orders, fornecedores, documentos e gestão do imóvel.[4] [5] | Serviço deve manter pedido, triagem, autorização, orçamento, execução, evidência, custo, aceite e vínculo financeiro como fatos separados. | Criar serviço ou anexar evidência não pode autorizar despesa, pagamento ou repasse. | Nenhuma despesa avança sem alçada, evidência suficiente, origem e reconciliação com obrigação. |
| Carteira e repasse | Gestão de locação no mercado enfatiza contrato, reajuste, cobrança, financeiro e prestação de contas.[6] [7] [16] | A estratégia mantém subledger com obrigação, instrução, retorno, aplicação, conciliação, direito, dedução e liquidação. | Um estado de pagamento de fornecedor/provedor não substitui retorno verificado, conciliação ou prestação de contas. | O demonstrativo diferencia aberto, instruído, retornado, aplicado, conciliado, elegível e liquidado. |

## 4. Controles transversais atualizados

| Domínio transversal | Decisão reforçada | Fonte | Prova futura requerida |
| --- | --- | --- | --- |
| Segurança e API | Autorizar por organização, objeto, propriedade e função; limitar fluxos sensíveis, consumo e integrações externas. | OWASP API Top 10.[8] | Testes permitir/negar por rota, campo, objeto, função, volume, callback e rota direta. |
| Dados e privacidade | Inventariar tratamentos, classificar dados, registrar medidas de segurança e revisar controles. | ANPD; Supabase RLS.[17] [18] | Inventário de tratamento, política testável, retenção, exclusão/restrição, acesso mínimo e evidência de revisão. |
| IA | Governar, mapear, medir e gerir riscos; manter explicabilidade, contestação, fonte e humano no comando de ações materiais. | NIST AI RMF.[10] | Avaliação de qualidade, risco, viés, autonomia, incidentes, override e auditoria por caso de uso. |
| Acessibilidade | Testar jornadas reais com critérios de conteúdo perceptível, operável, compreensível e robusto. | WCAG 2.2.[14] | Evidência por teclado, foco, leitor de tela, erro, tabela, gráfico, modal e dispositivo. |
| Integrações | Avaliar cada fornecedor por capacidade, contrato, escopo, confirmação, erro, custo, segurança e saída. | Buildium API; Stripe Connect; DocuSign.[4] [9] [13] | Contrato de integração, idempotência, trilha, reconciliação, contingência e desligamento seguro. |

## 5. Itens explicitamente adiados ou não aplicáveis

| Item | Decisão | Motivo |
| --- | --- | --- |
| Autonomia integral de IA em atendimento, decisão, cobrança, repasse ou publicação | **Adiado.** | A evidência de mercado não substitui governança de risco, consentimento, escopo e revisão humana. |
| Repasses e pagamentos acionados pelo estado de uma venda/locação | **Não aplicar como regra de CRM.** | Direito econômico, instrução, retorno e liquidação são fatos diferentes e dependem de controles externos. |
| Portal genérico para toda a carteira | **Não aplicável.** | Portais devem operar com grants por objeto/campo/finalidade e expiração. |
| “Visão 360°” sem classificação e permissionamento | **Não aplicável.** | Centralização de leitura sem limites viola menor privilégio e amplia acesso indevido. |
| Integração por token global e acesso total | **Não aplicável.** | Capacidades distintas exigem escopo, rotação, inventário, limite, reconciliação e revogação. |

## 6. Lacunas de evidência que permanecem abertas

As fontes públicas confirmam padrões e propostas de valor, porém não demonstram regras internas, exceções, qualidade de dados, taxas reais de resultado, controles de segurança em produção ou aderência de cada fluxo a uma imobiliária brasileira específica. Portanto, as evidências públicas permanecem classificadas como **referência estratégica**, não como benchmark funcional completo. A auditoria prática do CRM de referência mantém suas lacunas próprias registradas e não é substituída por este estudo externo.

## Referências

[1] [HubSpot — Create Custom Object Records](https://knowledge.hubspot.com/crm-setup/use-custom-objects)

[2] [Salesforce — What Is a Sales Pipeline?](https://www.salesforce.com/sales/pipeline/)

[3] [Buildium — Owner Portal](https://www.buildium.com/features/property-owner-portal/)

[4] [Buildium — Open API](https://developer.buildium.com/)

[5] [Yardi — CRM IQ](https://www.yardi.com/product/crm-iq/)

[6] [Jetimob — Sistema imobiliário](https://www.jetimob.com/)

[7] [Loft — CRM para imobiliárias](https://loft.com.br/para-imobiliarias/crm-para-imobiliarias/)

[8] [OWASP API Security Top 10 — 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)

[9] [Stripe Connect](https://stripe.com/connect)

[10] [NIST — AI RMF Playbook](https://airc.nist.gov/airmf-resources/playbook/)

[11] [CV CRM — CRM 8.0](https://cvcrm.com.br/)

[12] [Buildium — Owner Portal](https://www.buildium.com/features/property-owner-portal/)

[13] [DocuSign Rooms for Real Estate](https://www.docusign.com/products/rooms-for-real-estate)

[14] [W3C — WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/)

[15] [Nielsen Norman Group — Visibility of System Status](https://www.nngroup.com/articles/visibility-system-status/)

[16] [AppFolio — Leasing CRM](https://www.appfolio.com/services/leasingcrm)

[17] [ANPD — Guia orientativo sobre segurança da informação](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte)

[18] [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
