# Matriz mestre estratégica — Vendas Urbanas e Locação

**Status:** `estratégia_documental_consolidada_2026-08-27`  
**Escopo:** Vendas Urbanas e Locação. Esta matriz é um índice de decisões estratégicas e de provas futuras; não é um backlog de implementação, não modifica a arquitetura canônica e não cria funcionalidades do CRM. [1]

## 1. Como usar esta matriz

> **Recomendação:** usar a matriz como porta de entrada para qualquer decisão futura. Antes de propor tela, campo, fluxo, integração, automação ou indicador, localizar a linha do domínio correspondente, verificar as dependências e só então detalhar o requisito. Se a linha não existir, o novo item começa como hipótese com owner, evidência e critério de prova.

| Coluna | Finalidade |
| --- | --- |
| Domínio/jornada | Onde o requisito se encaixa, sem confundir Vendas Urbanas e Locação. |
| Decisão estratégica | O que o produto deve preservar como regra. |
| Prova futura | Como uma implementação demonstrará que a regra foi cumprida. |
| Risco principal | O erro que a decisão busca evitar. |
| Dependência/gate | O que precisa existir antes de a capacidade ser liberada. |
| Documento-fonte | Onde estão a intenção, a evidência, as exceções e os detalhes. |

## 2. Regras transversais

| Código | Decisão estratégica | Prova futura | Risco principal | Dependência/gate | Documento-fonte |
| --- | --- | --- | --- | --- | --- |
| `MT-01` | Resolver organização, módulo, objeto, finalidade, papel/grant, vigência e alçada antes da ação. | Testes de acesso permitido/negado cobrem URL, interface, serviço, dado, arquivo e cache. | Vazamento entre organizações, módulos ou objetos. | Fundação de contexto e policy. | [2] |
| `MT-02` | Tratar pessoa/empresa como `Party`; papéis, representação e relacionamentos são datados. | Mesma parte assume papéis distintos sem duplicação ou herança indevida de acesso. | Cadastros duplicados e confusão de titularidade/representação. | Identidade canônica e evidência mínima. | [2] |
| `MT-03` | Usar dossiê progressivo, classificado por finalidade, origem, versão, validade e acesso. | Anexo, preview, compartilhamento e expiração seguem policy; anexar não aprova. | Exposição de dados sensíveis e falsa validação documental. | Storage privado, policy e audit event. | [2] [3] |
| `MT-04` | Separar intenção, comando, fato, decisão e projeção em eventos correlacionados. | Repetição técnica não duplica efeito; correção preserva histórico e correlação. | Edição silenciosa do passado e comandos duplicados. | Modelo de eventos, idempotência e auditoria. | [2] |
| `MT-05` | Listas, filtros, ordenações, paginação e gráficos são leituras governadas. | Alterar consulta não altera dados nem amplia escopo; vazio/erro são explicáveis. | Filtro/URL como atalho de acesso e métricas opacas. | Policy no dado e contrato de métrica. | [3] [5] |
| `MT-06` | IA, automação, comunicação, publicação e integração começam em recomendação/preview. | Ação externa exige aprovação, outbox/inbox, correlação, idempotência, cancelamento e observabilidade. | Mensagem, anúncio, sincronização ou decisão automática indevida. | Contrato de dados, revisão humana e gate de efeito externo. | [5] |
| `MT-07` | Cobrança, caixa, conciliação, direito, instrução e liquidação são fatos separados. | Dashboard e operação distinguem previsto, aberto, instruído, recebido, conciliado, elegível e liquidado. | Confundir boleto, comprovante, saldo, comissão ou repasse com dinheiro realizado. | Subledger, regras versionadas e segregação de deveres. | [4] |
| `MT-08` | Integrar contexto de jornada sem fundir fontes de verdade ou permissões de escrita. | Leitura de parte, ativo, proposta, contrato, serviço e carteira informa origem, atualização e scope; comandos continuam próprios de cada domínio. | Workspace “360°” virar acesso amplo, estado implícito ou alteração fora de alçada. | Read model governado, policy por objeto/campo e eventos correlacionados. | [8] [9] |
| `MT-09` | Tratar fornecedor externo como adaptador de capacidade, com contrato, dados mínimos e confirmação/reconciliação. | Cada capacidade prova escopo, idempotência, correlação, timeout, retentativa, fila de exceção e desligamento seguro. | Token global, callback não confiável, duplicidade e transformação de status externo em fato interno. | Inventário de integrações, avaliação de fornecedor e política de efeito externo. | [8] [9] |
| `MT-10` | Manter critérios de acessibilidade e feedback de estado como parte do aceite de toda jornada. | Teclado, foco, leitor de tela, tabela, gráfico, modal, vazio e erro passam por prova de comportamento. | Painel visualmente atraente, porém incompreensível, não operável ou sem recuperação. | Design system, conteúdo semântico e plano de teste assistivo. | [8] [9] |
| `MT-11` | Tratar indicador externo como contexto versionado, separado do fato de carteira e do comando operacional. | Métrica exibe fonte, universo, geografia, segmento, método, período, `as_of`, atraso, cobertura, limitação e tabela alternativa; sem comparabilidade, exibe indisponibilidade. | Transformar anúncio, amostra, série de crédito ou índice de plataforma em preço, previsão, score ou fato interno. | Catálogo de indicadores, contrato de proveniência, policy de leitura e revisão humana. | [10] |

## 3. Vendas Urbanas — matriz por domínio

| Código | Domínio/jornada | Decisão estratégica | Prova futura | Risco principal | Dependência/gate | Documento-fonte |
| --- | --- | --- | --- | --- | --- | --- |
| `VU-M01` | Entrada e triagem | Registrar origem, contato permitido, intenção, owner e próxima ação mínima. | Lead entra com finalidade/consentimento; duplicidade é sinalizada e não resolvida silenciosamente. | Perda de origem, contato indevido e duplicidade. | `MT-01`, `MT-02`, `MT-03`. | [3] [6] |
| `VU-M02` | Clientes e compradores | Distinguir cliente, comprador, proponente, coadquirente, representante e assinante como papéis. | Ficha mantém relações/vigências e dossiê por finalidade sem duplicação. | Tratar contato como comprador/autorizado por inferência. | `MT-02`, `MT-03`. | [2] [3] |
| `VU-M03` | Proprietário e captação | Separar titularidade, representação, autorização comercial, exclusividade e captação. | Ativo não fica elegível para anúncio/venda sem vínculo/autorização vigentes. | Publicar ou negociar ativo sem autoridade demonstrada. | Party, representação, ativo e dossiê. | [2] [3] |
| `VU-M04` | Imóveis e empreendimentos | Modelar imóvel, construtora, empreendimento, torre, unidade e correspondente como identidades/relações próprias. | Edição de uma dimensão não altera disponibilidade, preço, mídia ou autorização de outra. | Herança opaca e inconsistência de estoque urbano. | Ativo canônico, regras versionadas e policy de campo. | [1] [3] |
| `VU-M05` | Funil, prioridade e carteira | Separar estágio, temperatura, prioridade, SLA, owner e qualidade documental. | Transição registra autor, motivo, precondição e reversão; score explica fatores/versão. | Arraste visual virar fonte de verdade e prioridade opaca. | Eventos, contrato de métrica e revisão humana. | [3] [5] |
| `VU-M06` | Visitas e agenda | Tratar visita como caso com participantes, ativo, horário, resultado e próxima ação. | Conflito, remarcação/cancelamento e comunicação passam por policy e trilha. | Agenda sem contexto ou comunicação não autorizada. | Contexto, consentimento e outbox quando houver envio. | [3] [7] |
| `VU-M07` | Proposta, reserva e contrato | Manter versões, validade, alçadas, evidências e concorrência por ativo. | Proposta aceita não é reescrita; reserva e conversão verificam elegibilidade no dado. | Dupla negociação, contrato sem prova e edição tardia opaca. | Ativo elegível, dossiê e transação idempotente. | [3] [7] |
| `VU-M08` | Publicação e canais | Publicação é fluxo separado, com conteúdo versionado e autorização ativa. | Preview, canal, campos/mídias permitidos, confirmação, estado externo e retirada ficam auditáveis. | Anúncio indevido ou publicação sem reversão. | Autorização de captação e contrato de canal. | [3] [5] |
| `VU-M09` | Financeiro e comissão | Direito econômico usa base, regra, gatilho, recebedor, teto e versão; não é pagamento. | Ciclo distingue estimativa, apuração, bloqueio, elegibilidade, instrução e settlement. | Comissão duplicada, antecipada ou sem regra. | `MT-07`, alçada e conciliação. | [4] |
| `VU-M10` | Inteligência comercial | Usar saúde do funil, origem/ROI, prioridade e perda como leituras explicáveis. | Métrica traz fórmula, período, coorte, fonte, `as_of`, limitação e ação humana. | Causalidade falsa, viés e automação comercial sem controle. | `MT-05`, `MT-06` e revisão humana. | [5] [6] |
| `VU-M11` | Contexto de mercado e crédito | Comparar preço de anúncio, oferta e sinais de crédito externos apenas por recortes aprovados e explicitamente comparáveis. | Cartão contextual separa preço interno, proposta, contrato e fonte externa; mostra praça/tipologia/período/cobertura e não altera elegibilidade ou decisão. | Precificação automática, indicação de financiamento ou leitura de mercado fora de cobertura. | `MT-11`, catálogo de indicadores e parecer humano. | [10] |

## 4. Locação — matriz por domínio

| Código | Domínio/jornada | Decisão estratégica | Prova futura | Risco principal | Dependência/gate | Documento-fonte |
| --- | --- | --- | --- | --- | --- | --- |
| `LC-M01` | Administração | Manter contrato de administração com proprietário separado do contrato de locação. | Alterar prazo/obrigação de um não muda o outro sem ato/versionamento explícitos. | Fundir contratos de naturezas e prazos distintos. | Party, ativo, dossiê e contratos versionados. | [1] [3] [7] |
| `LC-M02` | Ativo e disponibilidade | Separar titularidade, administração, prontidão, vistoria, serviço, anúncio e disponibilidade para locar. | Estado de preparo explica bloqueio/owner/prazo sem alterar contrato ou financeiro. | Anunciar ou locar ativo com pendência invisível. | Ativo, caso, evidência e autorização. | [2] [3] |
| `LC-M03` | Candidatura e partes | Coletar dados progressivamente de locatário, coocupante, solidário, garantidor e representante. | Dados sensíveis aparecem somente por finalidade; vínculo de uma parte não expõe outras. | Coleta excessiva, duplicidade e exposição de dossiê. | `MT-02`, `MT-03`. | [2] [3] |
| `LC-M04` | Garantia | Separar modalidade, evidência, análise, decisão, vigência, exceção e substituição. | Garantia não é aprovada por existir; expiração abre pendência e não altera contrato automaticamente. | Falsa aprovação, cobertura presumida e rescisão indevida. | Regra/policy, dossiê, alçada e eventos. | [3] [7] |
| `LC-M05` | Contrato, aditivo e renovação | Versionar condições, prazo, índice, vencimento, encargos, garantia e marcos de saída. | Rascunho, abandono, retorno e validação por etapa são visíveis e auditáveis. | Contrato ambíguo, regra retroativa e perda de histórico. | Contratos versionados, dossiê e aprovação. | [3] [7] |
| `LC-M06` | Carteira e cobrança | Controlar obrigações por competência e distinguir instrução, retorno, aplicação e conciliação. | Pagamento parcial/duplicado, acordo, estorno e atraso preservam estados e correlações próprios. | Baixa indevida e carteira inconsistente. | `MT-07`, política de cobrança e alçada. | [4] [7] |
| `LC-M07` | Taxa, dedução e repasse | Calcular taxa, despesa, dedução, direito do proprietário, instrução e settlement separadamente. | Serviço/contrato/retorno não gera pagamento ou repasse por simples mudança visual. | Repasse sem caixa conciliado, dedução opaca e prestação incorreta. | Subledger, regras, evidências e segregação de deveres. | [4] [7] |
| `LC-M08` | Serviços e prestadores | Modelar caso, responsável, orçamento, pagador, autorização, agenda, execução e evidência. | Conclusão de serviço não confirma despesa, culpa, cobrança ou pagamento. | Efeito financeiro/contratual automático por status de caso. | Caso, alçada, dossiê e subledger. | [3] [4] |
| `LC-M09` | Vistorias e sinistros | Tratar item/ambiente, cronologia, evidência, alegação, decisão e obrigação como fatos diferentes. | Inclusão de foto/relato não atribui culpa, cobertura ou indenização. | Responsabilização sem processo/evidência. | Caso, policy, alçada e trilha de auditoria. | [3] [7] |
| `LC-M10` | Portais e canais | Portal de cliente/proprietário/prestador recebe grant por objeto, finalidade e vigência. | URL manipulada, grant expirado ou objeto fora do escopo falham sem enumeração de dados. | Vazamento de contrato, imóvel, carteira, documento ou observação interna. | `MT-01`, `MT-03`, gestão de sessão e auditoria. | [2] [5] |
| `LC-M11` | Alertas e inteligência | Alertar prazos, vencimentos, garantias, serviços e divergências com owner e ação humana. | Alerta demonstra dados/fontes/tempo/limitação e não aciona cobrança, repasse ou rescisão. | Ruído operacional e automação punitiva. | `MT-05`, `MT-06` e política de escalonamento. | [5] [6] |
| `LC-M12` | Mercado, negociação e territorialidade | Distinguir valor anunciado, proposta, contraproposta, valor contratado e desconto interno; usar índice externo somente como contexto por praça/tipologia/período. | Leitura exibe metodologia, cobertura, fonte, `as_of` e limitação; indisponibilidade não gera estimativa ou ação automática. | Confundir anúncio com contrato, desconto externo com carteira ou contexto macro com risco individual. | `MT-11`, dados internos íntegros e aprovação humana de decisão. | [10] |

## 5. Ordem de gates estratégicos

| Ordem | Gate | Decisão de passagem | Risco se ignorado |
| --- | --- | --- | --- |
| `G0` | Contexto e negação por padrão | Escopo, role/grant, vigência, finalidade, objeto e alçada são verificáveis. | Vazar dados ou permitir ação no contexto errado. |
| `G1` | Identidade, ativo, contrato e evidência | Party/papel, ativo/vínculo, instrumento e dossiê possuem estado e versão próprios. | Duplicar cadastros e assumir autoridade/validade por inferência. |
| `G2` | Jornada operacional | Fases, owners, precondições, prazos, exceções e próximos passos estão definidos. | Formulários desconectados e estágio que não explica decisão. |
| `G3` | Financeiro | Obrigações, fatos, direitos e liquidações são separados e conciliáveis. | Perder rastreabilidade financeira ou pagar/repassar incorretamente. |
| `G4` | Inteligência e canais | Métricas, sinais, integração e ação externa têm contrato, revisão humana e desligamento. | Automação opaca, comunicação indevida ou métricas sem fonte. |
| `G5` | Prova de aceite | Testes de permitir/negar, vazio, erro, duplicidade, reversão e auditoria cobrem a capacidade. | Declarar pronto algo sem comportamento verificável. |

## 6. Decisões em espera e proibições

| Assunto | Estado estratégico | Critério para reabertura |
| --- | --- | --- |
| Implementação de CRM | Fora desta etapa documental. | Recomendação prévia, autorização específica, plano técnico, testes e ambiente apropriado. |
| Automação de efeito material | Não é padrão e permanece bloqueada por desenho. | Política, alçada, revisão humana, rollback/compensação, observabilidade e teste de falha. |
| Atualização de benchmark como prova integral | Benchmark prático encerrado com lacunas documentadas; não declarar completude operacional da referência. | Ambiente de demonstração que permita revalidar controles pendentes com segurança. |
| Alteração em SUPER ADM, ADM ou Loteadora | Fora do escopo. | Instrução futura inequívoca e análise de impacto da arquitetura canônica. |
| Uso de dado individual da referência | Proibido na documentação estratégica. | Não aplicável; o material usa apenas estrutura e evidência agregada. |

## 7. Referências internas

[1] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)

[2] [Fundação compartilhada — Vendas Urbanas e Locação](caderno_fundacao_compartilhada_vendas_locacao.md)

[3] [Jornadas operacionais — Vendas Urbanas e Locação](caderno_jornadas_operacionais_vendas_locacao.md)

[4] [Estratégia financeira — Vendas Urbanas e Locação](caderno_financeiro_vendas_urbanas_locacao.md)

[5] [Inteligência, métricas, automação e canais](caderno_inteligencia_metricas_canais_vendas_locacao.md)

[6] [Consolidação de Vendas Urbanas](consolidacao_vendas_urbanas_hincrivel.md)

[7] [Estratégia atualizada — Vendas Urbanas e Locação](estrategia_vendas_urbanas_locacao_atualizada.md)

[8] [Registro de pesquisa externa de referências de mercado](registro_pesquisa_referencias_mercado_vendas_locacao.md)

[9] [Matriz de confronto — referências externas × estratégia](matriz_confronto_referencias_estrategia_vendas_locacao.md)

[10] [Caderno de indicadores de mercado — Vendas Urbanas e Locação](caderno_indicadores_mercado_vendas_locacao.md)
