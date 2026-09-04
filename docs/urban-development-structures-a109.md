# A109 — Torres e blocos de Empreendimentos Urbanos

## Escopo entregue

O setor **Empreendimentos e Construtoras** passou a separar uma estrutura interna de **torre ou bloco** de seu empreendimento-base. A estrutura contém exclusivamente uma referência interna em código e o tipo estrutural `torre` ou `bloco`. Ela não inclui unidades, pavimentos, metragem, endereço, disponibilidade, estoque, preço, anúncio, proposta, reserva, contrato, comissão, cobrança, pagamento, repasse ou integração externa.

## Proteções aplicadas

A persistência usa RPCs protegidas por identidade, organização, módulo `vendas_urbanas`, finalidade, membership, grant, vigência e policy. A criação exige que o empreendimento-base seja um rascunho da mesma organização; possui correlação idempotente e auditoria redigida. A nova tabela tem RLS habilitada, privilégios diretos revogados e policy explícita de negação direta. A verificação de segurança não emitiu alerta de RLS sem policy para o recurso A109.

## Revisão visual

Em modo de leitura e sem contexto autorizado, a rota exibe, em blocos separados, **Estrutura em rascunho**, **Construtora em rascunho**, **Relação estrutural** e **Torre ou bloco em rascunho**. A seleção de empreendimento permanece vazia, os controles não permitem operação sem contexto e os setores Propostas, Reservas e Contratos e Financeiro continuam marcados como bloqueados.
