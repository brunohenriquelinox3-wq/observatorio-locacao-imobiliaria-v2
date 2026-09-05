# Revisão visual A215 — central de Quadras e Lotes

## Estado inicial observado

Em sessão autenticada, a rota de Cadastro de Loteamentos apresentou a matriz física do cadastro selecionado, a reconciliação estrutural, a fonte física local, a gestão detalhada agrupada por Quadra, a prévia local de preço por metro quadrado, a edição de matriz e a recuperação de Quadras arquivadas.

## Ajuste em validação

O formulário completo de edição da matriz foi separado da leitura operacional em um painel expansível. A prévia local de preço recebeu um quadro visível de preparação, vigência e aprovação futura. Essas superfícies continuam sem gravação de preço, venda, contrato, cobrança ou financeiro e ainda dependem de revisão visual desktop e móvel após a recompilação.

## Leitura autenticada após recompilação

A leitura textual e a renderização inicial autenticadas confirmaram a matriz física, as 14 Quadras e os 164 Lotes já existentes, a gestão agrupada por Quadra, a recuperação de Quadras arquivadas e o novo painel fechado “Revisar matriz física”. A política preparada exibe as três etapas de governança e mantém o resultado vazio até o operador informar um valor local. Não houve interação de edição, arquivamento, restauração, aplicação de fonte ou simulação com valor.

## Verificação desktop por intenção

No navegador autenticado, a política de preço foi visualizada como cartão separado, com três etapas legíveis — Preparar, Vigência e Aprovar — antes do campo de valor local e do seletor de escopo. O painel “Revisar matriz física” apareceu fechado ao fim da leitura. Ao abri-lo, o cabeçalho de edição, os totais de estrutura e os controles de inclusão ficaram disponíveis sem acionar submissão, alteração, arquivamento ou restauração. A página também confirmou a remoção da expressão visível “rascunho” do aviso de contexto deste cadastro.

## Início da revisão A216

Após a recarga autenticada, enquanto as consultas protegidas ainda estavam em andamento, a tela apresentou contagens neutras e mensagens de confirmação de matriz e de atributos físicos. Nenhum total anterior foi reaproveitado como dado local. A verificação da completude por atributo será registrada somente depois que a leitura autorizada terminar.

## Leitura autenticada de completude

Após a conclusão da leitura autorizada, o painel mostrou a cobertura por atributo sem preencher lacunas: Área, Posição e Tipologia estavam completos para os 164 Lotes físicos; Frente e Profundidade permaneceram integralmente pendentes de fonte. A matriz continuou em 14 Quadras e 164 Lotes, e o aviso deixou explícito que a visualização não preenche, estima ou modifica Lotes. Nenhum comando de matriz, preço ou operação comercial foi acionado.

Na inspeção visual focal da central, o bloco de completude ficou entre as métricas resumidas e os filtros, preservando a ordem de leitura: total físico, qualidade da fonte e, só então, navegação por Quadra. As cinco categorias ficaram legíveis como cartões curtos, e as pendências não foram disfarçadas como dados válidos.

## Correção semântica A217

A revisão identificou que `not_declared` e `standard` são valores-padrão de estrutura, não evidência recebida de fonte física. A central foi corrigida para tratá-los como pendência. A leitura autenticada confirmou a composição corrigida: somente Área apareceu como atributo completo; Frente, Profundidade, Posição e Tipologia ficaram explicitamente pendentes de fonte. Os cartões de Lote também passaram a exibir “Tipologia pendente” para o valor-padrão, sem qualquer alteração da matriz, inclusão de dado ou comando material.

## Coerência por Quadra A218

A leitura autenticada confirmou que o resumo de cada Quadra agora usa “Lotes com pendência” em vez de uma contagem limitada à área. Na primeira Quadra, por exemplo, a quantidade exibida correspondeu aos três Lotes que ainda necessitam de atributos físicos; as demais Quadras seguiram a mesma regra. Essa leitura permanece derivada, não aciona edição e não modifica dados físicos.

## Filtro local A219

Na leitura autenticada, o novo seletor **Situação física** foi exibido junto da busca e do filtro de Quadra. As opções apresentadas são Todos os Lotes, Com pendência física e Completos na fonte; elas se referem exclusivamente a atributos físicos e não introduzem disponibilidade, preço ou estado comercial.

Na revisão da faixa de filtros, a busca, o recorte de Quadra e a situação física ficaram disponíveis no mesmo ponto de decisão, após a completude e antes da lista expansível. O agrupamento preserva leitura primeiro e evita que a pessoa operadora precise entrar em edição para localizar lacunas físicas.

## Estados vazios A220

A recarga autenticada confirmou que a central manteve a matriz, os cartões de completude, os filtros e a política local separados de qualquer operação comercial. A mensagem contextual para “Completos na fonte” foi adicionada ao resultado vazio para explicar que ausência de resultado representa atributos ainda sem fonte, não disponibilidade ou ausência de Lotes.

## Nomenclatura de área A221

A revisão foi reiniciada após a alteração de cópia. A primeira captura ainda estava em carregamento da área protegida; portanto, ela não é considerada evidência da versão final. A confirmação visual deste rótulo permanece pendente de uma leitura autenticada estável, embora o teste dirigido e a tipagem tenham aprovado a alteração.

A leitura autenticada estabilizada confirmou o indicador **Área sem fonte** ao lado de Área informada e do total em m². A cobertura geral continuou apresentada exclusivamente no painel **Completude física**, preservando a distinção entre uma métrica de área e o conjunto de atributos físicos.

## Resumo de resultados A222

A revisão do novo resumo foi iniciada após a atualização. A segunda captura da área autenticada não retornou conteúdo legível; ela não será usada como evidência visual. A validação dirigida confirmou que a contagem deriva de Lotes e Quadras filtrados, e a revisão visual deverá ser repetida após a interface estabilizar.

Após reinício controlado da prévia, a leitura autenticada foi estabilizada. O resumo apareceu entre os filtros e as Quadras: **164 Lotes encontrados em 14 Quadras**, seguido da indicação de que a contagem reflete somente filtros locais. Nenhuma ação de edição, preço ou operação comercial foi acionada durante a inspeção.

## Revisão móvel de continuidade

A captura móvel atual da rota de Cadastro de Loteamentos confirmou a composição em coluna única, campos dimensionados ao viewport e navegação modular legível. Como a captura de prévia não estava em um cadastro selecionado da sessão autenticada, ela valida somente a responsividade estrutural da rota; a leitura da matriz e os controles físicos continuam validados na inspeção autenticada separada.

## A223/A224 — Política formal de preço-base e estudo contratual

Em revisão autenticada de 05 set. 2026, a nova superfície de **Política formal de preço-base** foi renderizada dentro de Estrutura, após a prévia local e antes da edição intencional da matriz. A composição apresentou quatro etapas distintas — prévia, preparação, encaminhamento e aprovação por segunda pessoa — além de fonte XLSX, estado de reconciliação, campo de versão, vigência, histórico e bloqueios de efeito comercial. A matriz permaneceu em 14 Quadras e 164 Lotes; não havia política, linha de preço-base, venda, contrato, distrato, cobrança, pagamento ou repasse registrado na interface durante essa revisão.

A leitura visível reiterou que status e totais derivados são descartados, que o arquivo é processado somente para prévia/preparação e que preço-base não é proposta, contrato, receita, recebível, lançamento tributário, cobrança, pagamento ou repasse. A interação com seleção de arquivo, prévia, preparação, encaminhamento e aprovação não foi executada nesta revisão; portanto, nenhum valor real foi enviado pelo navegador ou persistido.

Após a correção A225, a leitura autenticada continuou estável com a matriz física de 14 Quadras e 164 Lotes e com o histórico da política vazio para o cadastro selecionado. A consulta do histórico passou a receber o identificador do cadastro no servidor; a interface não depende mais de filtrar uma lista organizacional ampla no navegador. Nenhuma ação de fonte, prévia, preparação, encaminhamento ou aprovação foi acionada.

Na primeira tentativa de revisão autenticada da jornada A226 com parâmetro de consulta, a página permaneceu em esqueleto de carregamento e não apresentou conteúdo navegável. Não houve interação com formulário, arquivos ou comandos. A confirmação visual da nova jornada permanece pendente de uma recarga estabilizada por estratégia alternativa.
