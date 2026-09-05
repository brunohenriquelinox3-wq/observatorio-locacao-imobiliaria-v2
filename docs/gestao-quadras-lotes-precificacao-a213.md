# Gestão de Quadras, Lotes e precificação controlada — A213

> **Aviso de escopo financeiro:** esta especificação trata de estrutura, governança e cálculo-base; não constitui recomendação financeira ou fixação de preço. Qualquer tabela real deve ser revisada e aprovada pela administração responsável antes de produzir efeito comercial.

## Diagnóstico da matriz atual

A matriz atual garante a numeração Qn · Ln e a quantidade por Quadra. Os dados físicos já suportados para cada Lote são área, frente, profundidade, tipologia e posição. O problema é de experiência e domínio: a pessoa operadora vê apenas uma tabela extensa de quantidade, sem um painel para compreender a composição de cada Quadra, localizar um Lote, ver a completude física ou preparar a política de preço em camada separada.

## Modelo físico proposto

| Nível | Informações operacionais | Uso permitido |
|---|---|---|
| Empreendimento | Nome operacional, contexto territorial, fase, total físico e pendências. | Identificação e acompanhamento interno. |
| Quadra | Código Qn, quantidade de Lotes, distribuição de área, Lotes com área pendente e exceções físicas. | Leitura e organização da matriz. |
| Lote | Código Qn · Ln, área em m², frente, profundidade, tipologia, posição e completude física. | Estrutura física; sem disponibilidade comercial. |
| Dossiê | Estado de pendência e referência privada de documento. | Evidência controlada; não exibe conteúdo de arquivo. |

## Camada de precificação separada

A precificação não deve ser guardada na matriz física nem liberar venda. A camada proposta é uma **tabela de preços por m²** com regras de escopo, vigência e aprovação. Ela poderá existir no cadastro como política preparada, mas somente uma regra aprovada e vigente poderá formar um valor-base de leitura.

| Campo de política | Regra de segurança |
|---|---|
| Escopo | Empreendimento inteiro ou uma Quadra específica; Lote sem preço individual por padrão. |
| Moeda e preço/m² | BRL e decimal positivo com quatro casas para cálculo; não aceita valor implícito. |
| Vigência | Início obrigatório; fim opcional e nunca anterior ao início. Sobreposições precisam de revisão explícita. |
| Situação | Em preparação, encaminhada, aprovada, expirada ou retirada. Somente aprovada e vigente é elegível para leitura de valor-base. |
| Governança | Criação e alteração exigem MFA recente, contexto, finalidade, correlação e alçada administrativa; aprovação deve ser uma transição auditada e separada da criação. |
| Auditoria | Registra regra, estado, vigência e contagem afetada; não registra dados pessoais nem cria contrato, cobrança ou financeiro. |

## Fórmula transparente de valor-base

Para uma regra aprovada e vigente, o valor-base será calculado somente como **área física em m² × preço por m² da regra aplicável**, arredondado uma única vez para duas casas decimais na apresentação. A ausência de área ou regra válida produz **“valor-base não calculado”** — nunca zero e nunca estimativa. Esse resultado é uma referência de planejamento, não uma proposta, reserva, contrato, receita, parcela ou obrigação financeira.

## Experiência a implementar

O módulo deve separar o trabalho em três superfícies claras: um resumo físico com indicadores de pendência; uma visão por Quadra que expande a lista de Lotes; e uma área de **Política de preço por m²** com estado bloqueado até existir autorização e regra formal. A matriz continuará sendo a única fonte de Quadras e Lotes. A política de preço apenas consulta área e não edita, cria, arquiva ou restaura estrutura.

## Implementação e validação

A área **Gestão física por unidade** passou a mostrar indicadores de total físico, Lotes com área e Lotes com área pendente, além de busca local por código Qn · Ln, tipologia ou posição. Cada Lote é apresentado com área, frente, profundidade, tipologia e posição, somente quando esses atributos físicos já existem no cadastro.

A área **Política de preço por m² · Prévia** permite informar um preço/m² e delimitar a leitura a todas as Quadras ou a uma Quadra escolhida. O resultado é calculado somente para Lotes com área física conhecida e fica explicitamente marcado como prévia local: não grava preço, não aprova tabela e não inicia qualquer operação de venda ou financeiro.

| Verificação | Resultado |
|---|---|
| Dados físicos | A visão usa exclusivamente a consulta física já autorizada, sem nova fonte ou alteração da matriz. |
| Cálculo | Área × preço/m²; Lote sem área não recebe valor estimado. |
| Segregação | Prévia não chama procedure de criação, venda, contrato, cobrança, pagamento ou repasse. |
| Teste dirigido | A cobertura confirma busca, campos físicos, prévia local e ausência de comandos comerciais. |
| Validação integral | 211 arquivos de teste e 510 testes aprovados, além de tipagem, build e integridade do diff. |

O cadastro real permanece sem preço/m², valor-base persistido, regra de reajuste ou condição comercial. A criação de tabela de preço real exige uma política formal com vigência, responsável e transição de aprovação, que deverá ser submetida e auditada separadamente.

## Revisão visual posterior

Uma revisão posterior identificou que a primeira apresentação da Gestão física por unidade ocorreu enquanto a prévia mantinha uma falha anterior de resolução de folha de estilos. O conteúdo apareceu em fluxo textual, sem cartões e sem hierarquia suficiente; essa apresentação não deve ser considerada aprovada. A prévia foi reiniciada, a folha isolada voltou a carregar e a próxima revisão deve confirmar os painéis em renderização real antes de qualquer novo empacotamento ou solicitação de aceite.

Após o reinício, a sessão autenticada voltou a carregar a camada visual e a estrutura semântica confirmou filtros de busca e Quadra, indicadores separados e grupos de Lotes por Quadra. A composição foi ainda reforçada para retirar a lista única de 164 cartões e apresentar cada Quadra como bloco próprio, com área física e pendências. A validação visual detalhada em desktop e móvel continua pendente antes de uma nova entrega.

Na confirmação autenticada após a correção, a tela apresentou a gestão agrupada por Quadra, filtro de Quadra, busca local e rótulos físicos em português, sem valores técnicos em inglês. A próxima revisão focará exclusivamente na composição visual abaixo da dobra, sem repetir comandos de estrutura ou consultar conteúdo comercial.

A revisão autenticada na área Estrutura confirmou que a matriz física continua preservada e que a Recuperação rápida permanece visível após a reorganização. Os cartões de Quadra na matriz original não foram alterados por essa revisão; a nova leitura detalhada fica separada como camada de consulta física, sem comandos de inclusão, venda, preço persistido ou financeiro.

Na inspeção de sessão após o reinício, a matriz e a Recuperação rápida permanecem visualmente separadas e o retorno da organização de Lotes não alterou os controles de estrutura. A leitura detalhada continua filtrável por Quadra e por busca local, enquanto os campos físicos sem fonte permanecem explicitamente pendentes em vez de receber dados fictícios.

Após a compactação final, a leitura detalhada apresenta uma única Quadra aberta por padrão. As demais ficam compactas com quantidade de Lotes, área física, pendências e o controle “Ver Lotes”; filtro ou busca abrem somente resultados relevantes. Assim, todos os Lotes permanecem acessíveis sem uma lista contínua que torne a área extensa e difícil de navegar.

Capturas independentes em desktop e móvel confirmaram que a área de trabalho preserva sua hierarquia em larguras reduzidas: controles se empilham, cartões ficam legíveis e a coluna lateral não cria espaços vazios. A leitura autenticada confirmou que a navegação expansível de Quadras carrega após o contexto autorizado; as capturas de layout não iniciaram comandos nem exibiram dados do cadastro real.

Após a correção de rótulos, a validação integral voltou a passar: suíte de testes, tipagem, build compatível com Netlify e integridade do diff. O build manteve somente o aviso não bloqueante sobre chunks grandes. Esta rodada não executou comando de matriz, política de preço ou operação comercial.

## Modelo formal preparado para a política de preço

A política real será ligada a um contêiner econômico já existente, porém terá registros próprios para impedir que o preço seja confundido com estrutura, comissão, recebível ou contrato.

| Campo | Regra de domínio | Exposição na central |
|---|---|---|
| Escopo | Empreendimento inteiro ou uma única Quadra física do mesmo cadastro. | Exibe a abrangência; não altera Lotes. |
| Preço por m² | Decimal positivo em BRL, com quatro casas para o cálculo-base. | Editável somente enquanto em preparação. |
| Vigência | Data inicial obrigatória, término opcional e não anterior ao início. | Mostra apenas estado e período. |
| Estado | Em preparação, encaminhada, aprovada, expirada ou retirada. | Só a aprovada e vigente é elegível para prévia oficial. |
| Separação de funções | Criador não aprova a própria política; aprovação exige nova autoridade e MFA recente. | Exibe o estado sem nomear pessoas. |
| Cálculo | Área física × preço/m² da regra específica; arredondamento final em duas casas. | Lote sem área ou regra aplicável continua “não calculado”. |

O modelo não gera preço individual, proposta, reserva, venda, contrato, parcela, cobrança ou recebível. A implementação começa pela central visual e pela preparação de políticas; nenhum preço será incluído no cadastro atual sem uma regra formal submetida pela organização.

## Central operacional A215

A central passou a priorizar a leitura física antes da edição. A matriz resumida, a reconciliação, a fonte física local e a gestão detalhada permanecem expostas, enquanto o formulário completo de Quadras e Lotes é apresentado no painel expansível **Revisar matriz física**. Quando já existe uma matriz, ele inicia fechado e só revela os controles de alteração após ação intencional da pessoa operadora. A abertura não cria, arquiva, restaura ou altera qualquer registro.

A superfície **Política de preço por m² · Prévia** passou a declarar visualmente o fluxo de governança **Preparar → Vigência → Aprovar**. O campo de preço e o escopo continuam sendo cálculo local e efêmero no navegador. A sequência explica que uma futura política real deverá ter escopo, vigência, responsável, aprovação separada e auditoria, sem converter a prévia em tabela aprovada ou efeito comercial.

| Controle A215 | Evidência confirmada |
|---|---|
| Estrutura real | Mantida em leitura com 14 Quadras e 164 Lotes físicos; a pendência do 165º Lote não foi alterada. |
| Edição intencional | Painel fechado para uma matriz existente e aberto apenas em inspeção visual sem submissão. |
| Política de preço | Três etapas de governança visíveis; nenhum valor foi digitado, persistido ou aprovado. |
| Segregação | Não foi executado comando de venda, proposta, reserva, contrato, cobrança, pagamento, repasse ou financeiro. |
| Cópia | A nomenclatura residual “rascunho” foi removida do aviso de contexto do Cadastro de Loteamentos. |
| Validação técnica | Teste dirigido ampliado, suíte integral com 212 arquivos e 514 testes, tipagem, build Netlify e `git diff --check` aprovados. O build manteve somente o aviso não bloqueante de chunks grandes. |

Na revisão visual autenticada em desktop, a política preparada apareceu como cartão independente e a edição da matriz permaneceu fora do fluxo de consulta até ser aberta manualmente. A captura móvel de rota confirmou o empilhamento responsivo da experiência de Cadastro de Loteamentos; os estilos específicos de política e de revisão usam a mesma regra móvel de coluna única. A captura móvel não selecionou um cadastro autenticado e, portanto, não foi usada para declarar leitura adicional da matriz real.

## Completude física por atributo A216

A leitura operacional agora apresenta um painel de completude imediatamente após as métricas físicas. Ele mostra, para cada atributo, a razão entre Lotes com dado conhecido e o total da matriz: **Área**, **Frente**, **Profundidade**, **Posição** e **Tipologia**. A visualização é derivada exclusivamente da estrutura já autorizada e não propõe preenchimento automático, estimativa ou valor comercial.

Na leitura autenticada, a área, a posição e a tipologia estavam completas; frente e profundidade permaneceram marcadas como pendentes de fonte. Essa distinção transforma uma lacuna técnica em fila clara de conferência, sem transformar a ausência de dado em zero ou informação presumida. O painel não tem comando de gravação e a atualização de qualquer atributo continua condicionada a uma fonte física revisada e aos controles existentes.

| Verificação A216 | Resultado |
|---|---|
| Leitura autenticada | O painel revelou os cinco atributos após o carregamento autorizado, sem reutilizar totais durante o estado transitório. |
| Ausência de inferência | Frente e profundidade foram mantidas como pendências de fonte; nenhum dado foi preenchido ou estimado. |
| Teste e build | Teste dirigido, 212 arquivos e 515 testes da suíte, tipagem, build Netlify e integridade de diff foram aprovados. O único aviso remanescente é o não bloqueante de chunks grandes. |
| Artefatos | ZIP e HTML A216 foram gerados e saneados; não incluem ambiente, dependências, logs, build, documentação, checklist, credenciais ou endereços de infraestrutura. |

## Coerência de pendências por Quadra A218

O resumo expansível de cada Quadra passou a contar **Lotes com pendência**, e não apenas Lotes sem área. O novo total considera um Lote pendente quando ao menos um atributo físico permanece sem evidência de fonte: área, frente, profundidade, posição ou tipologia. Dessa forma, o resumo de Quadra não entra em contradição com o painel de completude e com o detalhe dos Lotes.

Essa métrica é somente uma agregação da leitura autorizada. Ela não cria campos, não preenche o que está ausente e não muda a estrutura salva. A revisão autenticada confirmou a coerência entre a quantidade de Lotes da Quadra, a pendência exibida e os atributos mostrados no detalhe. A validação integral aprovou 212 arquivos e 517 testes; o build preservou somente o aviso não bloqueante de chunks grandes. O ZIP e o HTML A218 foram regenerados e verificados como saneados.

## Filtro de situação física A219

Além da busca textual e do recorte por Quadra, a central agora permite filtrar localmente a situação física em três estados: todos os Lotes, Lotes com pendência física e Lotes completos na fonte. O filtro usa exatamente os mesmos critérios do painel de completude e dos resumos por Quadra, evitando classificações paralelas ou comerciais.

O estado do filtro existe somente na memória do navegador e retorna a “Todos os Lotes” ao trocar ou iniciar um cadastro. A leitura autenticada confirmou que o seletor aparece no mesmo agrupamento dos outros filtros e que suas opções não expõem disponibilidade, valores ou vendas. A validação integral aprovou 212 arquivos e 518 testes; o build manteve somente o aviso não bloqueante de chunks grandes. ZIP e HTML A219 foram regenerados e validados como saneados.

## Estados vazios de exploração física A220

Quando a situação física selecionada não encontra Lotes, a central agora distingue o motivo. Para **Completos na fonte**, ela explica que não há Lotes com todos os atributos físicos confirmados e remete à conferência de fonte, sem sugerir preenchimento automático. Para **Com pendência física**, ela esclarece que os filtros de leitura podem ser ajustados, sem propor mudança cadastral.

As mensagens permanecem locais e não contêm comandos de gravação, disponibilidade, preço ou venda. A validação integral aprovou 212 arquivos e 519 testes; o build manteve somente o aviso não bloqueante de chunks grandes. ZIP e HTML A220 foram regenerados e validados como saneados.

## Clareza dos indicadores físicos A221

O cartão resumido de área passou a usar o rótulo **Área sem fonte**. Essa nomenclatura deixa claro que o indicador trata exclusivamente da ausência do atributo de área; a completude dos demais atributos continua sendo apresentada no painel dedicado de Completude física. A revisão autenticada confirmou ambas as superfícies visíveis e sem ambiguidade.

A validação integral aprovou 212 arquivos e 520 testes; o build manteve somente o aviso não bloqueante de chunks grandes. ZIP e HTML A221 foram gerados e validados como saneados. Nenhum Lote, preço, documento ou operação comercial foi alterado.
