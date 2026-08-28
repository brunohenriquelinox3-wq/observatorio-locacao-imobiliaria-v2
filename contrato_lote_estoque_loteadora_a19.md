# Contrato A19 — Lote em rascunho no setor Estoque/Mapa de Lotes

O lote é uma unidade numerada dentro de uma **Quadra matriz** de um loteamento em rascunho. A identificação de leitura será composta como `Quadra N · Lote M`. O A19 separa o cadastro-base de lote do setor de Loteamentos e não representa disponibilidade, reserva ou venda.

| Regra | Limite |
|---|---|
| Vínculo | O lote pertence à Quadra e ao loteamento em rascunho da mesma organização. |
| Numeração | Inteiro entre 1 e 100, único por Quadra. |
| Leitura | Somente IDs técnicos, número do lote, número da Quadra e criação. |
| Exclusões | Sem área, mapa, coordenada, preço, disponibilidade, reserva, cliente, parceiro, contrato ou financeiro. |

> O máximo técnico de 100 lotes por Quadra é aplicado na fundação do lote. Qualquer mudança futura de estoque ou situação comercial exige contrato, autorização e migration próprios.
