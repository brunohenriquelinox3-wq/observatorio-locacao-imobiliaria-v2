# Contrato A14 — Classificação interna de agenda de Locação

## Finalidade e corte

O corte A14 acrescenta uma finalidade interna e codificada a uma agenda de Locação em rascunho. A classificação distingue preparação de contexto, revisão inicial e acompanhamento interno, para que o trabalho seja interpretado sem transformar uma data em confirmação externa.

| Elemento | Regra no corte A14 | Limite explícito |
|---|---|---|
| Agenda elegível | Deve estar em rascunho, vinculada a intake em rascunho e em estado `scheduled` ou `rescheduled`. | Agendas canceladas, não realizadas ou ocorridas são negadas. |
| Finalidade | `intake_review`, `context_preparation` ou `internal_follow_up`. | Não representa visita confirmada, convite, contato ou mensagem. |
| Código interno | Opcional, curto e estruturado. | Não aceita texto livre, contato, endereço, documento ou informação de negociação. |
| Cardinalidade | Uma classificação ativa por agenda, atualizável por nova ação autorizada. | Não cria histórico contratual, roteiro de visita ou tarefa externa. |
| Leitura | Retorna apenas IDs técnicos, finalidade, presença de código e atualização. | Não devolve Party, ativo, dado pessoal, horário detalhado, contrato, cobrança ou financeiro. |

## Critérios de aceite

Todo comando exige contexto explícito, identidade, membership, grant, finalidade e vigência verificados no servidor. Há idempotência por correlação, auditoria redigida, RLS, revogação padrão e execução exclusiva por `service_role`.

> O A14 não integra calendário, dispara comunicação, confirma visita, registra presença, forma contrato, cria garantia, gera cobrança, calcula direito econômico, faz repasse ou cria dado real.
