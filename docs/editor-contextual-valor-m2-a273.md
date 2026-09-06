# Editor contextual de valor por m² — A273

## Objetivo

Eliminar o salto distante entre a ficha selecionada e a atualização de referência interna por m², sem fundir preço com atributos físicos e sem transformar referência interna em disponibilidade, venda, proposta, contrato ou financeiro.

## Evidência inicial

A revisão autenticada confirmou que a matriz física continua disponível e que a leitura protegida de referência interna só é exibida após MFA recente. O cartão mantém dois caminhos distintos: **Editar** para a ficha física e **Editar preço** para o domínio interno de valor por m². A nova implementação faz ambos selecionarem a mesma unidade física antes de abrir o editor contextual; nenhum valor foi digitado, preparado ou salvo durante essa verificação.

## Decisão de interface

O editor contextual aparece no mesmo fluxo da ficha do Lote. Ele contém valor por m², início de vigência, motivo interno, referência única da atualização e total referencial apenas para conferência. O total é derivado exclusivamente da área física confirmada e não aceita edição independente. A preparação continua sujeita a MFA, contexto, alçada, política, vigência, respaldo, correlação, idempotência, auditoria e aprovação segregada.

Na validação de integração, foi identificada ambiguidade entre a cópia legada do formulário distante e o editor contextual. A implementação passou a utilizar identificador exclusivo no editor inserido na ficha e seletor CSS por classe, evitando colisão de identificadores e foco no formulário legado. A automação autenticada confirmou a disponibilidade da matriz e dos controles de preço sob MFA; por limitação de rolagem da página longa, a presença no host contextual também foi coberta por teste dirigido de estrutura e tipagem. Nenhum campo de valor foi preenchido ou submetido.

Na verificação prática posterior, uma unidade física foi apenas selecionada na ficha, sem edição ou salvamento. O editor apareceu imediatamente no mesmo bloco, abaixo dos atributos físicos, com campo vazio de valor por m², vigência, motivo interno, referência única e total somente para conferência. A ficha física permaneceu completa e o total não se tornou campo editável. Não houve digitação, preparação de condição, aprovação ou alteração de dado material.

## Validação e entrega

A cobertura dirigida do editor contextual e do estúdio aprovou seus testes, e a suíte integral aprovou **227 arquivos de teste e 617 testes**. A tipagem, o build de publicação e a integridade do diff também foram aprovados. O build emitiu apenas o aviso conhecido de pacotes grandes, sem falha de compilação. A revisão visual incluiu o percurso autenticado de seleção de uma unidade sem mutação e a composição em tela ampla, tablet e celular.

O ZIP de código e o HTML autônomo A273 foram gerados após o build e verificados quanto à presença, exclusões e saneamento. O ZIP exclui ambiente, dependências, logs, documentação interna e checklist. O HTML não contém credenciais, URLs de banco, hosts, endpoints, papel privilegiado ou marcadores de infraestrutura. Não houve publicação.

## Limites preservados

Nenhum valor real, Lote, área, política, condição, disponibilidade, venda, cliente, proposta, contrato, cobrança, pagamento, repasse ou dado financeiro foi criado ou alterado neste marco.
