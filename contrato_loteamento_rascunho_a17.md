# Contrato A17 — Cadastro-base de loteamento em rascunho

## Finalidade

O A17 cria a menor unidade administrativa do módulo Loteadora: um loteamento em rascunho, identificado por uma referência interna codificada e uma situação de trabalho. O registro organiza preparação interna; não representa empreendimento aprovado, estoque, disponibilidade ou vínculo fundiário.

| Elemento | Regra A17 | Exclusões explícitas |
|---|---|---|
| Referência interna | Código obrigatório, único por organização e compatível com o padrão `^[A-Z][A-Z0-9_]{2,79}$`. | Não aceita nome comercial, endereço, CEP, matrícula, coordenadas ou texto livre. |
| Situação de trabalho | `preliminary_reference`, `structuring` ou `review_required`. | Não representa aprovação municipal, registro, lançamento, disponibilidade ou autorização de venda. |
| Estado | Sempre `draft` neste corte. | Não há ativação, arquivamento operacional, exclusividade, estoque, contrato ou financeiro. |
| Leitura | Devolve somente identificador técnico, referência, situação e criação. | Não devolve dados de pessoas, parceiros, clientes, localização, lotes, valores ou documentos. |

## Autorização e trilha

Todas as leituras e mutações exigem módulo `loteadora`, organização e finalidade explícitos. O servidor confere identidade, membership, grant, vigência e escopo do módulo. A correlação garante idempotência, o evento de auditoria não registra a referência interna e as funções ficam acessíveis exclusivamente a `service_role`.

> O A17 não cria quadras, lotes, mapa, estoque, parceiros, clientes, contratos, boletos, cobrança, repasse, publicação, integração externa ou dados reais.
