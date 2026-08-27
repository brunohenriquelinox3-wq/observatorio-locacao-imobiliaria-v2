# Fila operacional de superfícies inéditas — auditoria do CRM de referência

**Status:** `ativa_desde_2026-08-27`  
**Escopo:** exclusivamente **Vendas Urbanas** e **Locação**.  
**Objetivo:** impedir repetição de setor enquanto houver superfície inédita segura na outra coluna, sem alterar dados reais ou produzir recomendações estratégicas.

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

## Próximo bloco elegível

| Coluna exigida | Situação | Decisão operacional |
| --- | --- | --- |
| Locação | A antiga candidata `/negocios/cadastro/locacao` já foi auditada e cancelada com segurança. | Nenhuma rota da lista atual será reutilizada. Antes do próximo bloco, identificar uma superfície de Locação ainda não classificada a partir do menu/HTML, sem abrir listas que revelem dados de terceiros. |

> **Pausa governada de Locação:** os candidatos seguros já percorridos foram colocados em quarentena, e o catálogo de rede foi removido por privacidade. Antes de qualquer nova navegação na coluna, a fila deve selecionar uma superfície ainda não classificada e confirmar que ela não apresenta dados pessoais de terceiros ou operação material logo na carga. Não é permitido retornar a `financeiro`, `serviços`, `prestadores`, `vistorias`, `sinistros`, `padrões`, `documentos`, `negócios/alugueis`, `nova locação` ou `imóveis de rede` apenas para manter a alternância.
