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
