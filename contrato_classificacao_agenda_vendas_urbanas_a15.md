# Contrato A15 — Classificação interna de agenda urbana

## Finalidade e corte

O corte A15 acrescenta uma finalidade interna e codificada a uma agenda de Vendas Urbanas em rascunho. A classificação organiza revisão do lead, preparação de contexto e acompanhamento interno sem converter a agenda em compromisso com terceiro.

| Elemento | Regra no corte A15 | Limite explícito |
|---|---|---|
| Agenda elegível | Agenda em rascunho, com lead em rascunho, em estado `scheduled` ou `rescheduled`. | Agendas canceladas, não realizadas ou ocorridas são negadas. |
| Finalidade | `lead_review`, `context_preparation` ou `internal_follow_up`. | Não representa visita, convite, contato, mensagem ou oferta. |
| Código interno | Opcional, curto e estruturado. | Não aceita texto livre, endereço, contato, preço, crédito, proposta ou condição. |
| Leitura | Devolve só IDs técnicos, finalidade, presença de código e atualização. | Não devolve Party, ativo, dados pessoais, horário detalhado, proposta, contrato ou financeiro. |

## Critérios de aceite

Cada comando exige contexto explícito de Vendas Urbanas, identidade, membership, grant, finalidade e vigência verificados no servidor. A operação é idempotente pela correlação, auditada de forma redigida, protegida por RLS e exclusiva a `service_role`.

> O A15 não integra calendário, dispara comunicação, confirma visita, registra presença, cria proposta, reserva, contrato, comissão, cobrança, repasse, financeiro ou dado real.
