# Estabilidade da referência interna de preço — A263

## Escopo preservado

Esta atualização trata apenas de leitura, cálculo e apresentação de referência interna por Lote. Não altera fonte, área, preço-base, política, condição, reserva, disponibilidade, venda, proposta, contrato ou financeiro.

## Diagnóstico técnico

A consulta de referências internas exige MFA TOTP recente no servidor. A cadeia válida é: sessão MFA recente → consulta autorizada → preço-base interno por m² → área física confirmada → total calculado no servidor → apresentação no cartão. A função de cálculo só retorna total quando preço-base e área confirmada existem; a ausência intencional de preço continua sem total e sem estimativa.

O problema de experiência identificado não é um cálculo apagado. A interface atual trata qualquer erro da consulta como “Revalidação de MFA necessária”, confundindo expiração de MFA, erro transitório, contexto negado e outros bloqueios. O estado de segurança também substitui visualmente os valores no cartão, o que pode aparentar que a referência foi removida.

## Direção de correção

1. Preservar MFA recente e consulta no servidor, sem cache de valores protegidos após expiração.
2. Separar claramente quatro estados: consulta em andamento; MFA recente necessária; leitura indisponível por outro bloqueio; preço-base ausente por decisão humana.
3. Reservar a mesma área visual para preço por m² e total em todos os estados, sem reordenar o cartão.
4. Fornecer um comando explícito de **atualizar leitura interna** que apenas refaz a consulta após o usuário confirmar MFA diretamente na interface de Segurança e MFA.
5. Exibir o cálculo autorizado no mesmo local estável, com fonte e limite interno claros; nunca converter referência em preço comercial.

## Correção de grade para valores extensos

A inspeção autenticada confirmou o estado de MFA e mostrou que a grade anterior deixava os três cartões de uma Quadra estreitos demais, comprimindo a célula de preço e criando quebra visual. A camada A263 passa a usar, em telas amplas, três cartões com largura mínima maior e células internas proporcionais. A área de preço por m² e a do total referencial continuam fixas na sequência do cartão, com tipografia numérica tabular e espaço reservado para valores extensos. Em telas menores, a grade conserva a transição responsiva existente.

Nenhuma interação de edição, ajuste, política ou dado foi acionada durante a inspeção. A sessão atual ainda requer MFA recente para expor números internos; o estado agora preserva as células de preço e explica que o cálculo não foi removido.

## Refinamento final da leitura protegida

O cartão não repete mais uma explicação de MFA em cada unidade. Quando a leitura interna estiver bloqueada, a orientação permanece centralizada no cabeçalho da matriz; as duas células reservadas de valor ficam no fluxo da grade e usam marcador neutro até a nova leitura autorizada. Com MFA recente, esses mesmos espaços apresentam o valor por m² e o valor total calculado.

Essa decisão elimina a área branca paralela e evita transformar bloqueio de segurança em aparência de valor perdido. Não há estimativa local, persistência de número protegido após expiração ou alteração de fonte de preço.

Na revisão autenticada após reinicialização, a navegação até a matriz estrutural permaneceu contínua e sem corte horizontal visível. A conferência dos números reais continua condicionada à confirmação MFA na interface; ela será feita antes do encerramento do marco.

Na inspeção visual da primeira Quadra expandida, três cartões passaram a ocupar a largura útil com proporções uniformes. A área branca paralela não apareceu; o valor por m² ficou integrado à mesma grade de área, posição e divisas, e a orientação MFA não se repetiu no corpo do cartão. A leitura de números reais permanece aguardando MFA recente, sem estimativas ou alteração de dados.

## Confirmação autenticada

Após a revalidação direta de MFA, a matriz exibiu preço-base interno por m² e valor total referencial calculado em células nativas da grade física. A apresentação permaneceu estável, sem painel branco, e a leitura não criou disponibilidade, venda, proposta, contrato ou efeito financeiro. A fonte e a política correspondente foram posteriormente reconciliadas em processamento privado; a ausência intencional de preço-base permanece vazia, sem total calculado.

## Princípios estudados

Referências de UX financeira apontam que transições de segurança devem explicar propósito e próximo passo de forma curta, mantendo contexto e continuidade após a verificação. Também reforçam que estados de conexão ou sessão vencida precisam ser apresentados honestamente, pois um número sem estado confiável reduz confiança. Em cálculo de preço, a leitura deve separar preço-base, ajustes e resultado, sem criar pedido ou efeito comercial.

### Referências

1. [Mastercard Open Finance — Account Opening UX Design Guidelines](https://developer.mastercard.com/open-finance-data/documentation/ux-design-guidelines/ac-opening-ux-design-guidelines/)
2. [Microsoft Dynamics 365 — Pricing Calculation API](https://learn.microsoft.com/en-us/dynamics365/supply-chain/unified-pricing-management/upm-pricing-calculation-api)
3. [The Skins Factory — The Definitive Fintech UI/UX Design Guide](https://www.theskinsfactory.com/definitive-fintech-ui-ux-design-guide)
