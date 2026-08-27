# Fila operacional de superfícies inéditas — auditoria do CRM de referência

**Status:** `pausada_por_decisão_explícita_do_usuário_2026-08-27`
**Escopo:** exclusivamente **Vendas Urbanas** e **Locação**.  
**Objetivo:** impedir repetição de setor enquanto houver superfície inédita segura na outra coluna, sem alterar dados reais ou produzir recomendações estratégicas.

> **Pausa aprovada:** o usuário escolheu aguardar ambiente de demonstração ou papel de teste, pois exige garantia de completude antes de qualquer atualização estratégica. A auditoria não pode ser declarada completa enquanto persistirem lacunas de rolagem/paginação, permissões, detalhes, confirmações e fluxos materiais. As estratégias de Locação e Vendas Urbanas permanecem inalteradas até a conclusão comprovada e nova aprovação explícita.

> **Regra de avanço:** cada bloco encerra depois de uma única unidade verificável: um controle novo, uma lacuna nova ou um bloqueio formal. O setor recém-trabalhado entra em quarentena de fila e não pode ser reaberto no ciclo seguinte.

## Estado de partida confirmado

| Campo | Situação factual | Consequência para a fila |
| --- | --- | --- |
| Última superfície de Vendas Urbanas | `/clientes`: formulário vazio, ordenação e painel de filtros; marcador local removido e painel fechado. | `VU /clientes` fica em quarentena até surgir condição técnica nova ou lacuna específica ainda não observável. |
| Última superfície de Locação | `/financeiro`: filtro `Tipo` alterado de forma local e restaurado, sem consulta ou operação financeira. | `LC /financeiro` fica em quarentena até nova condição técnica ou lacuna distinta de controle. |
| Próxima coluna exigida | Locação. | A próxima abertura deve ocorrer em superfície diferente de `/financeiro` e `/servicos`. |
| Próxima superfície escolhida | `LC-10` — `/vistorias`. | Abertura somente para estado vazio, filtros, criação até o formulário e cancelamento, sem registrar vistoria, anexar, gerar laudo, comunicar ou alterar contrato. |

## Fila inicial anti-repetição

| Ordem | Coluna | Superfície inédita prioritária | Condição de segurança | Unidade máxima antes da troca | Estado |
| --- | --- | --- | --- | --- | --- |
| 1 | Locação | `LC-10` — `/vistorias` | Apenas leitura, filtros reversíveis, formulário sem salvar e fechamento. | Um controle novo ou bloqueio formal. | Próxima |
| 2 | Vendas Urbanas | `VU-17` — `/documentos` | Apenas lista/estado, menus e preparação de modelo; nenhum upload, geração, download ou envio. | Um controle novo ou bloqueio formal. | Aguardando alternância |
| 3 | Locação | `LC-11` — `/sinistros` | Apenas lista/estado e abertura segura de formulário; sem caso, anexo, responsável, pagamento ou comunicação. | Um controle novo ou bloqueio formal. | Aguardando alternância |
| 4 | Vendas Urbanas | `VU-19` — Cargos e permissões | Leitura da matriz, rota e erro seguro; sem alterar perfil, usuário, grant, exportação ou configuração. | Um controle novo ou bloqueio formal. | Aguardando alternância |
| 5 | Locação | `LC-15` — `/documentos` | Apenas leitura, estado vazio, filtros e preparação; sem upload, geração, download ou envio. | Um controle novo ou bloqueio formal. | Aguardando alternância |
| 6 | Vendas Urbanas | `VU-14` — `/agendamentos` | Somente vistas, categorias, filtros reversíveis e estados; sem criar evento, convite ou comunicação. | Um controle novo ou bloqueio formal. | Aguardando alternância |

## Regras de quarentena e desbloqueio

| Situação | Decisão obrigatória |
| --- | --- |
| O controle anterior foi demonstrado e limpo/cancelado | Trocar de coluna e superfície, sem reabrir o mesmo setor. |
| A automação falhou sem efeito observável | Registrar como inconclusivo e escolher a próxima superfície da fila; não repetir no mesmo ciclo. |
| O caminho seguinte mostraria dados reais, PII ou ação material | Classificar como bloqueado por segurança e trocar de superfície. |
| Há nova condição técnica ou contradição verificável | O retorno só pode ocorrer com ID de lacuna e motivo explícito, depois de ao menos uma superfície diferente em cada coluna. |
| Não existe superfície inédita segura na coluna exigida | Registrar a indisponibilidade e solicitar orientação do usuário; não reciclar setor apenas para manter a cadência. |

## Campos obrigatórios no registro por controle

Cada nova linha deve declarar, além dos campos usuais, **superfície anterior**, **superfície atual**, **motivo da troca**, **controle inédito/bloqueio inédito** e **próxima superfície elegível**. Dessa forma, a alternância deixa de ser apenas uma intenção e passa a ser verificável no histórico.

## Histórico de execução após a correção

| Sequência | Coluna | Superfície | Unidade obtida | Situação de retorno |
| --- | --- | --- | --- | --- |
| 1 | Locação | `/vistorias` | Lacuna nova: apenas moldura global, sem conteúdo operacional acessível. | Quarentena. |
| 2 | Vendas Urbanas | `/documentos` | Catálogo de modelos e downloads bloqueados por segurança. | Quarentena. |
| 3 | Locação | `/sinistros` | Cabeçalhos e estado sem linhas, sem conteúdo adicional rolável. | Quarentena. |
| 4 | Vendas Urbanas | `/agendamentos` | Vistas, categorias e calendário sem eventos; controle ainda não operado. | Quarentena. |
| 5 | Locação | `/cargos` | Catálogo de perfis relevante à Locação, sem abertura de matriz. | Quarentena. |
| 6 | Vendas Urbanas | `/vendas` | Estado vazio e criação bloqueada antes de qualquer vínculo/faturamento. | Quarentena. |
| 7 | Locação | `/padroes` | Configuração de padrões identificada; edição bloqueada. | Quarentena. |
| 8 | Vendas Urbanas | `/crm/inteligencia` | Painel de scoring vazio; worker não acionado. | Quarentena. |
| 9 | Locação | `/negocios/cadastro/locacao` | Primeira etapa da esteira observada; cancelamento confirmado sem inclusão. | Quarentena. |
| 10 | Vendas Urbanas | `/visitas` | Estado vazio; criação bloqueada antes de agenda e comunicação. | Quarentena. |
| 11 | Locação | `/imoveisrede` | Catálogo de terceiros exibiu identificação e contato diretamente; navegação interrompida sem interação. | Bloqueada por privacidade; removida da fila ativa. |
| 12 | Vendas Urbanas | `/crm/saude` | Indicadores e limiares de exceção em estado vazio, sem alteração. | Quarentena. |
| 13 | Locação | `/portais` | Catálogo de integrações de anúncio em leitura, sem abrir configuração ou conexão. | Quarentena. |
| 14 | Vendas Urbanas | `/crm/propensao` | Indicadores e filtros de propensão vazios; recálculo bloqueado. | Quarentena. |
| 15 | Locação | `clientes.hincrivel.com.br` | Tela pública de acesso por WhatsApp, sem identificação ou envio de código. | Quarentena. |
| 16 | Vendas Urbanas | `/crm/origemRoi` | Indicadores de origem/ROI em leitura; custos e período preservados. | Quarentena. |
| 17 | Locação | `/marketing/social_accounts` | Rota do menu retornou 404; sem controle disponível. | Não demonstrável; não repetir sem rota válida. |
| 18 | Vendas Urbanas | `/crm/rejeicaoSdr` | Indicadores e classificação por IA em estado vazio; processamento bloqueado. | Quarentena. |
| 19 | Locação | `/negocios/financiamentos` | Tela de simulações/operações vazia; integração indisponível; nenhuma configuração aberta. | Quarentena. |
| 20 | Vendas Urbanas | `/crm/campanhas` | Estado vazio de campanhas; comunicação em massa bloqueada antes de criação. | Quarentena. |
| 21 | Locação | `/garantia_locaticia` | Rota candidata retornou 404. | Não demonstrável; não repetir sem rota válida. |
| 22 | Vendas Urbanas | `/design` | Material gráfico observado em leitura; geração/download bloqueados. | Quarentena. |
| 23 | Locação | Navegação `Central de Negócios` | Subrotas expostas sem navegação; especializadas já em quarentena. | Grupo esgotado no ciclo. |
| 24 | Vendas Urbanas | Navegação `Central de Imóveis` | Subrotas expostas sem navegação; estoque/condomínios em quarentena e rede/mapa bloqueados por privacidade. | Grupo esgotado no ciclo. |
| 25 | Locação | Navegação `Central de Clientes` | Subrotas Clientes, Proprietários e Visitas expostas sem navegação; clientes/visitas em quarentena e proprietários bloqueado por risco de dados reais. | Grupo esgotado no ciclo. |
| 26 | Vendas Urbanas | Navegação `Central de Leads` | Subrotas exibidas sem navegação; apenas Sincronização de dados permanece não classificada. | Candidata condicionada a bloco prévio de Locação e a abertura sem efeito externo automático. |
| 27 | Vendas Urbanas | `/leads` | Leitura estrutural autorizada da lista; paginação identificada e rolagem sem deslocamento demonstrável. | Quarentena até método de rolagem/paginação verificável. |
| 28 | Locação | `/servicos` | Filtros, taxonomias, indicadores e tabela vazia registrados. | Quarentena. |
| 29 | Vendas Urbanas | `/visitantes` | Funil de aquisição e estado vazio registrados. | Quarentena. |
| 30 | Locação | `/negocios` | Carteira e importadores identificados, sem operação. | Quarentena. |
| 31 | Vendas Urbanas | `/crm/segmentos` | Segmentação, IA declarada e estado vazio registrados. | Quarentena. |
| 32 | Locação | `/imoveisagencia` | Cards, controles e ações identificados; rolagem sem deslocamento apesar de conteúdo abaixo. | Quarentena até método de rolagem verificável. |
| 33 | Vendas Urbanas | `/crm/migracao` | Migração de carteira mapeada em leitura, sem abrir comando. | Quarentena. |
| 34 | Locação | `/imoveisempreendimentos` | Catálogo de condomínios vazio e controles de lista registrados. | Quarentena. |
| 35 | Vendas Urbanas | `/crm/configuracoes` | Negação 403 confirmada sem configuração. | Não repetir sem mudança comprovada de papel/permissão. |
| 36 | Locação | `/servicos_prestadores` | Diretório de prestadores vazio, filtros e tabela registrados. | Quarentena. |
| 37 | Vendas Urbanas | `/crm/ajuda` | Declarações de automação e tópicos de ajuda registrados; acordeões mantidos fechados. | Quarentena; reabrir somente após bloco de Locação e por tópico individual. |

## Próximo bloco elegível

| Coluna exigida | Situação | Decisão operacional |
| --- | --- | --- |
| Locação | A autorização expressa passou a permitir leitura estrutural, mas não operações materiais nem retenção de identificadores. Os principais candidatos de operação já foram reclassificados e colocados em quarentena. | Antes do próximo bloco, localizar no menu uma superfície de Locação ainda não classificada; se não houver, registrar formalmente o esgotamento em vez de reciclar setor. |

> **Pausa governada de Locação:** os candidatos já percorridos, inclusive sob leitura estrutural autorizada, permanecem em quarentena. A autorização não permite operação, transcrição de identificadores ou retorno circular. Antes de qualquer nova navegação na coluna, a fila deve selecionar uma superfície ainda não classificada; se a lista estiver esgotada, deve registrar o fato e aguardar condição nova. Não é permitido retornar a `financeiro`, `serviços`, `prestadores`, `vistorias`, `sinistros`, `padrões`, `documentos`, `negócios/alugueis`, `nova locação`, `imóveis de rede`, `imóveis da agência` ou `empreendimentos` apenas para manter a alternância.

> **Guard de navegação lateral:** depois de qualquer rolagem, expansão ou mudança visual do menu, não usar o índice de elemento previamente observado para navegar. Primeiro retornar ao Dashboard, confirmar a nova numeração dos itens visíveis e só então acionar um alvo que possa ser validado imediatamente. Se o submenu exibido não corresponder ao destino pretendido, não navegar por ele; registrar o desvio e retomar a fila.
