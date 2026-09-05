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
