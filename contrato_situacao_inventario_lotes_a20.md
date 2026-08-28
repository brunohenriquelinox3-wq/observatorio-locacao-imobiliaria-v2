# Contrato A20 — Situação interna de inventário de Lotes

O A20 permitirá apenas classificar o trabalho interno de um Lote em rascunho como `reference_confirmed`, `structure_review` ou `review_required`. A classificação não significa disponibilidade, reserva, venda, vínculo contratual ou estado financeiro.

| Regra | Proteção |
|---|---|
| Contexto | Mesmo Lote, Quadra, organização, módulo e finalidade autorizados. |
| Estado | Somente referência operacional interna em rascunho. |
| Exclusões | Sem preço, mapa, disponibilidade, reserva, cliente, contrato, cobrança ou repasse. |

A mutation futura deverá ser idempotente por correlação, registrar somente metadados redigidos de contexto e devolver leitura minimizada. A migration A20 ainda não foi aplicada.

> Toda alteração futura de estoque comercial dependerá de contrato, autorização e migration próprios.
