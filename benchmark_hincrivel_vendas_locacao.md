# Benchmark de referência: Hincrível — Vendas Urbanas e Locação

**Status:** `inventário_em_andamento`  
**Origem:** CRM de referência indicado pelo usuário, sessão autenticada autorizada pelo titular.  
**Escopo autorizado:** observar apenas capacidades relacionadas a **Vendas Urbanas** e **Locação**; não criar, editar, excluir, enviar, cobrar, configurar ou exportar dados.  
**Data de observação inicial:** 26/08/2026.

> Esta é uma coleta de referência de produto. Nomes de pessoas, organizações, imóveis, contagens, identificadores e quaisquer valores exibidos no ambiente autenticado não são reproduzidos aqui.

## Evidência inicial: acesso e dashboard

| Superfície observada | Evidência funcional | Relevância inicial | Limite de interpretação |
| --- | --- | --- | --- |
| Login | Entrada por e-mail/senha, recuperação de senha, alternativa por telefone e caminho separado de área do cliente. | Confirma a existência de múltiplos pontos de autenticação para operação e cliente. | Não demonstra política de MFA, recovery seguro, RLS, escopo, vigência ou proteção contra enumeração. |
| Dashboard autenticado | Navegação lateral com Dashboard, Central de Leads, Inteligência & Vendas, Central de Clientes, Central de Imóveis, Central de Serviços, Chat, Central de Negócios, Agendamentos, Formulários, Imobiliárias, Marketing, Administrativo e Configurações. | Indica organização em centrais de trabalho, com potencial de separar aquisição, cadastro, imóvel, negócio e gestão. | Menu não prova modelo de dados, permissões, estados, auditoria ou qualidade do fluxo interno. |
| Visão inicial | Cartões e gráficos de leads, imóveis da agência/rede, situação de leads, distribuição por corretor e por imóvel. | Sugere painéis de captação e estoque voltados à operação comercial. | Métricas observadas não têm fórmula, escopo, `as_of`, estado de prova ou lineage documentados no ambiente visual. |

**Nota de navegação:** o menu autenticado é dinâmico e pode expandir/atualizar elementos entre interações. O inventário será feito com snapshots renovados antes de cada abertura de seção, evitando inferir rota, conteúdo ou ação a partir de um menu desatualizado.

**Estrutura adicional observada:** a navegação lateral agrupa itens em blocos como `Principal`, `Operação`, `Financeiro` e `Sistema`. As entradas de Clientes, Imóveis, Leads, Inteligência & Vendas e Negócios aparentam expor subnavegação dinâmica; a existência de um item não será interpretada como prova de fluxo completo até a tela de leitura correspondente ser aberta.

## Hipóteses de análise a validar no ambiente

| Frente | Pergunta de benchmark | Evidência que precisa ser coletada | Não assumir sem prova |
| --- | --- | --- | --- |
| **Vendas Urbanas** | Como o CRM liga lead, cliente, proprietário, imóvel, visita, proposta, negociação, contrato e comissão? | Fluxos e telas de Leads, Clientes, Imóveis, Negócios, Agendamentos e serviços relacionados. | Que a presença de “negócios” represente contrato, reserva, comissão ou conciliação completos. |
| **Locação** | Como o CRM liga imóvel, proprietário, locatário, anúncio, atendimento, proposta, contrato, cobrança, repasse, renovação e manutenção? | Capabilidades específicas de imóveis para aluguel, Central de Serviços, financeiro/administrativo e eventuais estados de contrato. | Que o card “aluguel” implique gestão de locação, carteira ou repasse. |
| **Acesso/segurança** | Que papel, organização, equipe, corretor e cliente cada tela suporta? | Indícios de perfis, concessões, limites de ação, logs e visualização de área do cliente. | Que a autenticação visual equivalha a menor privilégio, MFA ou isolamento de tenant. |
| **Dados e dashboards** | Quais métricas respondem a decisões e permitem abrir os fatos fonte? | Filtros, drill-down, data de corte, estados vazios/erro e exportação. | Que um gráfico ou contagem seja confiável/conciliado apenas por estar no dashboard. |

## Evidência autenticada: listagem de imóveis da agência

| Elemento observado | Uso potencial para Vendas Urbanas/Locação | Limite ou lacuna ainda não comprovada |
| --- | --- | --- |
| Listagem de “imóveis anunciados / envio de anúncios” com contagem, ordenação, modo de exibição, filtros, portais configurados e opção de exportar. | Reúne inventário comercial e distribuição de anúncios em um mesmo ponto de trabalho. | Não evidencia policy de exportação, finalidade, escopo por equipe/organização ou confirmação de publicação. |
| Cartões de imóvel mostram finalidade de anúncio, código interno, tipologia, datas de cadastro/atualização, localização, proprietário, atributos, preço, encargos declarados, mídia/portal, área e referência de chaves. | Para locação, sugere um núcleo de captação e anúncio com atributos comerciais e operacionais; para vendas, a mesma estrutura pode servir à carteira de imóveis. | Não prova cadastro robusto de proprietário, autorização de anúncio, histórico, documento, disponibilidade transacional, contrato ou comissão. |
| Há finalidade de aluguel nos registros observados. | Confirma que o inventário contempla imóveis ofertados para locação. | Não confirma gestão de locação, locatário, cobrança, repasse, manutenção, renovação, garantia ou distrato. |

> O inventário exibiu dados pessoais, endereços e valores de exemplos reais. Eles não são copiados para este benchmark, nem serão usados para alimentar ou testar qualquer fluxo.

## Evidência autenticada: aquisição e negócio de locação

| Superfície observada | Capacidades visíveis | Relevância para a estratégia | Limite de interpretação |
| --- | --- | --- | --- |
| Lista de Leads | Contadores de aguardando/atribuídos/em atendimento, lista paginada, ordenação, exibição, filtro, exportação, atribuição em lote, edição, classificação de temperatura e indicação de finalidade de aluguel. | Reforça que Vendas Urbanas e Locação precisam tratar captação, fila, owner, temperatura/qualificação, origem, propósito e próxima ação como fatos separados do cadastro/contrato. | A lista expõe contatos pessoais e permite ações de lote; não prova consentimento, finalidade LGPD, audit trail, critérios de atribuição, SLA, política de exportação ou um funil semanticamente válido. |
| Navegação de Leads | Há rotas de lista, visitantes, pipeline de negócios, termômetro e sincronização de dados; a central de inteligência inclui propensão, radar, segmentação, campanhas, eficiência de origem, saúde de pipeline e roleta. | Indica uma referência para separar entrada, qualificação, priorização e análise comercial. | Rótulos de IA/propensão ou saúde não demonstram explicabilidade, limites de uso, precisão, não discriminação ou autorização sobre dados. |
| Negócios / Aluguéis | Lista de contratos/negócios por status `Ativo`, `Aprovado`, `Em Análise`, `Vencido`, `Rescisão` e `Encerrado`; tabela prevista para ID, referência externa, imóvel, tipo, cliente, proprietário, valor, início, final, status e cobranças. | Mostra uma jornada de negócio de locação que conecta imóvel, cliente, proprietário, vigência, estado e cobrança. | Uma tela vazia no escopo atual não demonstra regras de transição, cálculo, garantia, aditivo, repasse, conciliação ou tratamento de rescisão. |
| Importações no negócio de aluguel | A interface expõe importação de planilha e de contrato com IA. | Serve de alerta para projetar ingestão documental/dados com staging, evidência, validação, idempotência e revisão humana. | Não será interpretado como automação segura de contrato, extração fiel, aprovação jurídica ou autorização de acesso ao documento. |

> Os detalhes visualizados continham contatos pessoais. O benchmark registra apenas a **estrutura funcional**: lista de leads com finalidade/qualificação e negócio de aluguel com estados e colunas previstas.

## Evidência autenticada: clientes e proprietários

| Superfície observada | Capacidade visível | Leitura de produto | Lacuna a validar |
| --- | --- | --- | --- |
| Lista de Clientes | Contagem separada de clientes e proprietários, inserção, ordenação e filtro; nenhum cliente aparecia no recorte observado. | Há intenção de distinguir a parte interessada/compradora/locatária da parte proprietária. | Não demonstra ficha completa, composição de compradores, representação, dossiê, consentimento, perfil de locação, vínculo contratual ou deduplicação. |
| Lista de Proprietários | Lista dedicada com cadastro, contato, data/origem de inclusão, estado e área de atendimento. | Reforça a necessidade de um domínio de proprietário separado de cliente nas duas colunas, conectado ao imóvel por vínculo datado. | Não prova autoridade de anúncio/locação/venda, documentação, imóvel vinculado, conta de recebimento, repasse, permissões, auditoria ou revogação. |

> As listas revelaram informações de pessoas reais; o benchmark reteve somente a separação funcional entre `Cliente` e `Proprietário` e os controles visuais de lista/filtro/estado.

## Evidência autenticada: serviços e pipeline comercial

| Superfície observada | Capacidades/estados visíveis | Contribuição para Vendas Urbanas/Locação | Limite de interpretação |
| --- | --- | --- | --- |
| Gestão de Serviços | Indicadores de total/em andamento/concluídos/ticket médio, vínculo com imóvel e prestador, filtros por tipo, período e estado. A jornada de estado inclui solicitado, orçamento enviado/aprovado, agendado, em andamento, pausado, aguardando material, concluído, cancelado, reagendado, aguardando autorização e autorizado. | É referência útil para um domínio de manutenção de locação com caso, orçamento, autorização, execução, evidência e prestador. | Interface não prova alçada do proprietário/locatário, orçamento aprovado, contas a pagar, reembolso, SLA, anexos, auditoria ou impacto financeiro/contratual. |
| Pipeline de Negócios de Leads | Funil visual com atendimento, visita, proposta, fechamento, ganhou e perdido, além de total, ganho e conversão declarados. | Reforça uma jornada comercial separada entre captação/qualificação e avanço de oportunidade para vendas urbanas. | A configuração observada contém etapas repetidas de ganho/perdido e nenhum registro no recorte; não valida ordem de etapas, coorte, reentrada, valor, definição de ganho ou cálculo de conversão. |

> O CRM de referência mostra abordagens úteis de organização visual, mas a estratégia proposta não copiará estados, métricas ou automações sem contrato de semântica, owner, policy e prova de transição.

## Evidência autenticada: visitas e agendamentos

| Superfície observada | Capacidades visíveis | Contribuição para Vendas Urbanas/Locação | Limite de interpretação |
| --- | --- | --- | --- |
| Visitas | Lista separada de visitas cadastradas, inserção, ordenação e filtro. | Confirma que visita merece entidade/jornada própria, ligada a cliente, imóvel, corretor e oportunidade. | A lista estava vazia no recorte; não demonstra confirmação, presença, chave, acompanhante, feedback, proposta posterior, auditoria ou cancelamento. |
| Agendamentos | Visões por corretor, cliente e imóvel; calendário por hoje/mês/semana/dia; categorias como ligação, visita, reunião, envio de proposta, e-mail, notas e mudança de status. | Sugere agenda transversal para atividades de venda e locação, com a mesma ação podendo ter múltiplos contextos. | Não prova timezone, conflito de agenda, permissão de alteração, lembrete, integração externa, privacidade de notas ou se mudar status é transação governada. |

> Na estratégia do CRM, visitas e atividades devem registrar contexto, owner, horário, estado, evidência e resultado; agenda visual por si só não pode alterar contrato, estoque, carteira ou estágio de oportunidade sem policy explícita.

## Evidência autenticada: financeiro e papéis

| Superfície observada | Capacidades visíveis | Contribuição para a estratégia | Limite de interpretação |
| --- | --- | --- | --- |
| Financeiro / Lançamentos | Filtros por período, tipo, status, categoria, vencimento e cliente/fornecedor; resumo de receitas, despesas, saldo e cobranças de contratos; abas de lançamentos, cobranças e repasses ao proprietário; categorias de aluguel, comissão, multa, taxa de administração, impostos, manutenção, marketing e repasse. | Confirma a necessidade de manter carteira, cobranças, despesas e repasses ligados, mas com natureza e estados distintos, especialmente na Locação. | Nenhum lançamento apareceu no recorte; a tela não demonstra subledger, dupla entrada, aplicação de caixa, conciliação, split, alçadas, fiscal/contábil, origem do lançamento ou segurança de comandos. |
| Cargos e Permissões | Papéis configuráveis por imobiliária, com contagem de permissões e configuração individual de permissões. | Confirma expectativa de RBAC parametrizável para equipes comerciais/gestão. | Não demonstra escopo por organização/equipe/objeto, vigência, MFA, JIT, delegação, separação de deveres, logs append-only ou deny-by-default. |

> A referência de categorias financeiras e papéis será usada como insumo de cobertura. A estratégia mantém sua regra de que cobrança, recebível, direito econômico, instrução, settlement, caixa e conciliação são fatos diferentes.

## Evidência autenticada: negócios gerais e empreendimentos urbanos

| Superfície observada | Capacidade visível | Contribuição para Vendas Urbanas | Limite de interpretação |
| --- | --- | --- | --- |
| Negócios | Visão geral de negócio com importação de planilha/contrato por IA, estados de contrato/negócio e colunas previstas para imóvel, cliente, proprietário, valor, vigência, status e cobranças. | Aponta para um objeto transversal de negócio que pode reunir relações de imóvel e partes. | Não revela diferenciação real entre venda e locação no recorte; a mesma tela não prova proposta, comissão, financiamento, assinatura, origem, carteira, conciliação ou distrato governado. |
| Empreendimentos / Condomínios | Listagem de condomínios/empreendimentos, inclusão, ordenação, modo de exibição e filtro. | Indica que Vendas Urbanas deve acomodar empreendimentos e unidades além de imóveis isolados. | Lista vazia não prova modelo de incorporadora, torres, unidades, estoque, tabela, disponibilidade, autorização de venda ou vínculo com construtora. |

> Vendas Urbanas deverá manter `Imóvel`, `Empreendimento`, `Unidade`, `Proprietário/Construtora`, `Oferta`, `Proposta`, `Contrato` e `Comissão` como relações explícitas, não apenas como colunas de uma lista de negócios.

## Evidência autenticada: prestadores e formulários

| Superfície observada | Capacidade visível | Contribuição para a estratégia | Limite de interpretação |
| --- | --- | --- | --- |
| Prestadores de Serviços | Cadastro de pessoa física/jurídica, CPF/CNPJ, contato, especialidades por tipo de serviço e estado ativo/inativo. | Reforça um cadastro de prestador separado para manutenção de Locação, com especialidade e vínculo a serviço. | Não comprova validação cadastral, documentos, cobertura, disponibilidade, preços, contratos, segurança, permissão de acesso ou aprovação de pagamento. |
| Formulários | Modelos para autorização de locação, autorização de venda, declaração de visita, ficha de pessoa física/jurídica, proposta de compra, relação de documentos de locação e laudo de captação. | Confirma a importância de dossiês e documentos distintos por finalidade em Vendas Urbanas e Locação. | Download de modelo não prova preenchimento estruturado, versão, assinatura, consentimento, storage privado, acesso por escopo, validade ou snapshot contratual. |

> Os modelos documentais reforçam o requisito de que autorização de venda, autorização de locação, visita, proposta e dossiê são objetos/versionamentos diferentes; eles não podem ser tratados como anexos genéricos sem finalidade e estado.

## Evidência autenticada: sinistros e financiamento

| Superfície observada | Capacidades/estados visíveis | Contribuição para a estratégia | Limite de interpretação |
| --- | --- | --- | --- |
| Sinistros | Lista de casos com negócio vinculado, ocupação, imobiliária, data de abertura, status, responsável e ações. | Sinaliza que Locação pode exigir uma frente de casos de risco/seguro conectada a negócio e ocupação. | Não demonstra natureza do sinistro, cobertura, apólice, evidência, comunicação, aprovação, desembolso, responsabilidade, repasse ou encerramento auditável. |
| Financiamentos | Simulações/operações/configurações, estados aguardando parceiro, em andamento, desembolsada e recusada; cliente, imóvel, entrada, prazo, propostas, negócio e responsável. | Mostra que Vendas Urbanas deve acomodar financiamento como processo específico, separado de proposta/contrato, com marcos e provas. | Interface não demonstra taxa, elegibilidade, dados bancários, consentimento, crédito, integração, contraparte, proposta vinculante, desembolso conciliado ou decisão automatizada segura. |

> Os estados de sinistro e financiamento serão tratados como referências de cobertura. Qualquer automação futura precisa de owner, evidência, alçada, política, trilha e limites de responsabilidade antes de mudar contrato, carteira ou comissão.

## Evidência autenticada: visitantes e busca geográfica

| Superfície observada | Capacidades/estados visíveis | Contribuição para Vendas Urbanas/Locação | Limite de interpretação |
| --- | --- | --- | --- |
| Visitantes | Funil de aquisição com acessos únicos, engajamento por eventos/score, intenção/propensão e conversão em lead; tabela prevista para origem, eventos, propensão, comportamento, último acesso e status. | Evidencia uma camada pré-lead para captação digital e atribuição de origem, potencialmente útil às duas colunas. | Não prova base legal, consentimento, retenção, identidade, explicabilidade de score, prevenção de perfilamento indevido, critérios de conversão ou auditoria do evento. |
| Busca no Mapa | Separação de intenção comprar/alugar, tipologias extensas, localização, ordenação por data/preço/área, filtros e busca ao mover mapa. | Reforça a importância de pesquisa de estoque urbano por finalidade, tipo, localização e ordenação, sem misturar inventário de venda e locação. | A tela não prova disponibilidade real, autorização de anúncio, precisão geográfica, filtros por escopo, tratamento de endereço sensível ou concorrência de reserva/contrato. |

> Pesquisa, evento de navegação e preferência de imóvel são dados de finalidade limitada. Eles não se convertem automaticamente em cliente, proposta, crédito, contrato ou decisão comercial.

## Cobertura do inventário autenticado

| Frente | Evidências coletadas | Aspectos ainda não demonstrados no recorte autorizado |
| --- | --- | --- |
| **Vendas Urbanas** | Aquisição pré-lead/lead, visitantes, qualificação visual, pipeline, clientes/proprietários, imóveis, condomínio/empreendimento, mapa de busca, visitas/agendamentos, formulários de autorização/proposta, financiamento, lançamentos e papéis. | Cadastro/dossiê completo, titularidade/representação, autorização de venda, regra de disponibilidade, proposta versionada, contrato, assinatura, comissão, pós-venda, conciliação e políticas de acesso por objeto. |
| **Locação** | Imóveis anunciados para aluguel, negócios de aluguel e seus estados, clientes/proprietários, visitas/agendamentos, serviços/prestadores, formulários, carteira por categorias, repasses ao proprietário, sinistros e papéis. | Contrato de administração separado, contrato de locação, garantias, vistoria, cobrança aplicada, cash application, conciliação, deduções, repasse, renovação, rescisão, portal mínimo e auditoria de cada transição. |
| **Segurança/governança** | Login, papéis customizáveis, contagem de permissões e listas/métricas visuais. | MFA, menor privilégio por objeto, tenant/RLS, vigência, JIT, logs append-only, acesso a anexos, retenção, consentimento, proteção de exportação e ação em lote. |

> **Conclusão do inventário:** as referências fornecem boa cobertura de organização comercial e operacional. Elas não constituem prova de integridade jurídico-financeira, segurança de acesso ou conciliação, por isso esses pontos permanecem como diferenciais obrigatórios da estratégia do projeto.

## Referência observada

[1] [Hincrível CRM — ambiente de login](https://app.hincrivel.com.br/login)
