# Edição contextual e referência por Lote — A258

## Finalidade

O marco A258 transforma cada cartão de Lote em um ponto de entrada explícito para a **ficha física** da própria unidade. A ação visual é discreta, acessível por teclado e preenche a ficha já existente com o contexto de Quadra e Lote selecionado. A seleção em si não grava, não classifica e não altera qualquer registro.

## Separação de domínios

| Área | Ação permitida | Limite preservado |
|---|---|---|
| Cartão de Lote | Abrir a ficha física contextualizada | Não salva nem altera dados por clique. |
| Ficha física | Revisar atributos físicos e nota interna saneada | O comando continua exigindo contexto, alçada, MFA, correlação e auditoria. |
| Referência de preço | Consultar o estado da política por Lote | Valor por m² e total só aparecem depois de aprovação e vigência. |
| Política ainda em preparação | Encaminhar o operador à governança formal | Não exibe valor preparado, não estima o valor ausente e não cria efeito comercial. |

## Revisão visual

A revisão autenticada confirmou que os cartões exibem ações separadas para editar a ficha física e consultar a referência de preço. A matriz continuou sem qualquer gravação ou comando material. Quando não há referência aprovada e vigente, a seção de preço informa o próximo passo seguro, mantendo os campos de preço e total visíveis sem revelar valores protegidos.

Na revisão posterior, os três primeiros cartões da matriz mostraram a ação **Editar** e a ação **Consultar** ao lado da referência de preço. Também foi confirmada a nova instrução da ficha: o operador pode usar o ícone no cartão ou a seleção manual de Quadra e Lote. Nenhum controle de salvamento, finalidade física, política ou preço foi acionado durante essa conferência.

> O contexto selecionado no cartão não substitui a verificação do servidor no momento de salvar. A interface organiza a operação, mas não concede alçada.

## Limites de dados

O Lote que não possui valor-base explícito permanece sem valor. Esta entrega não modificou política, condição, preço, disponibilidade, venda, proposta, contrato, cobrança, pagamento, repasse, anexo ou dado de pessoa.

## Validação integral

A validação A258 aprovou **219 arquivos de teste e 588 testes**, além da tipagem, do build Netlify e da integridade do diff. O build preservou apenas o aviso técnico conhecido sobre chunks acima do limite de tamanho; não houve falha de compilação. A revisão visual confirmou a renderização dos controles em desktop e celular, e a leitura autenticada confirmou os atalhos na matriz real sem executar ação de edição, consulta material ou salvamento.
