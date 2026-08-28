# Contrato A16 — Extensão canônica de contexto para Loteadora

## Objetivo

O A16 introduz `loteadora` como módulo canônico no contexto operacional. A extensão somente permite que futuras rotinas identifiquem o módulo de forma explícita; ela não cria uma organização, membership, grant, alçada, sessão, Party, loteamento ou dado de negócio.

| Elemento | Regra A16 | Segurança preservada |
|---|---|---|
| Módulo | `loteadora` passa a ser um valor válido no contrato e no tipo PostgreSQL. | O módulo permanece explícito em cada chamada. |
| Autorização | A função canônica já exige identidade ativa, membership ativa, grant ativa, vigência, finalidade e presença do módulo no seletor de escopo. | Nenhuma identidade recebe o módulo por inferência. |
| Escopo | A alteração não cria dados de Loteadora. | Toda rotina futura precisa de RPC própria, RLS e concessão exclusiva a `service_role`. |

> A16 não eleva Super Admin, ADM, operador ou qualquer outro papel. A hierarquia administrativa continua separada de membership e grant por organização.
