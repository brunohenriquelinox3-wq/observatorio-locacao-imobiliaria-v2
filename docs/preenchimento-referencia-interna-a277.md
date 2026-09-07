# A277 — Pré-preenchimento da referência interna por Lote

## Problema corrigido

O cartão de Lote exibia a referência interna por m² e o total referencial, mas o editor contextual abria o campo de valor vazio. A referência já era retornada pela consulta autorizada; ela era descartada na montagem do rascunho do editor. Isso causava redigitação desnecessária e risco de inconsistência operacional.

## Comportamento atual

Ao abrir **Editar preço** ou selecionar o Lote na ficha física, o editor contextual carrega a referência interna atual por m² do mesmo Lote. O total de conferência é recalculado exclusivamente pela área física confirmada e permanece não editável. A exceção intencionalmente sem referência continua vazia e sem total estimado.

Os rascunhos preparados mantêm política, escopo individual, vigência, motivo, referência, correlação e controles server-side. Após respostas autorizadas de preparação, aprovação ou retirada, as consultas de referência e contexto são invalidadas para que o cartão seja renovado somente com a leitura confirmada pelo servidor. Preparar não torna a referência vigente; isso continua dependente dos controles do fluxo interno.

## Verificação prática

Na sessão autenticada, foi aberto o atalho de edição de um cartão de Lote e a ficha selecionada exibiu o editor no mesmo fluxo com o valor por m² já preenchido e o total derivado consistente. Nenhum campo foi alterado, nenhuma condição foi preparada e nenhum preço real foi salvo durante a validação.

## Validação e entrega

A validação integral aprovou **230 arquivos de teste e 623 testes**, além de tipagem, build de publicação e integridade do diff. O build apresentou apenas o aviso conhecido de pacotes grandes, sem falha. A verificação em navegador autenticado confirmou que cartão e ficha selecionada exibem a mesma referência interna, com o editor preenchido e o total calculado somente para conferência.

O ZIP de código e o HTML autônomo A277 foram gerados e verificados quanto à presença, exclusões e saneamento. O ZIP exclui ambiente, dependências, logs, documentos internos e checklist. O HTML não contém credenciais, URLs de banco, hosts, endpoints, papel privilegiado ou marcadores de infraestrutura. Nenhuma publicação ou mutação de preço foi executada.
