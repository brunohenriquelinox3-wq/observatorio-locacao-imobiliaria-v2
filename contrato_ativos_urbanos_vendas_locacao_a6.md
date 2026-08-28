# Contrato de ativos urbanos A6 — Vendas Urbanas e Locação

**Escopo:** este contrato torna implementável o ativo urbano minimizado e suas relações contextuais. Não armazena endereço preciso, geolocalização, matrícula, fotos, chaves, anúncio, contrato, preço, comissão, pagamento ou outro dado real neste marco. [1] [2]

| Conceito | Regra A6 | Erro impedido |
| --- | --- | --- |
| Ativo urbano | O cadastro de rascunho tem tipo, referência de trabalho e código interno não semântico, sempre dentro da organização. | Uma rua, texto livre ou código visual virarem prova de disponibilidade, titularidade ou cadastro completo. |
| Titularidade | `ownership_claim` liga Party e ativo de forma datada, contextual e ainda não verificada. | Relacionar Party como proprietário provar domínio, representação ou autorização comercial. |
| Gestão | `management_authority` é vínculo distinto de titularidade, com vigência e finalidade. | Editar administração alterar propriedade, contrato de administração ou contrato de locação. |
| Estado por módulo | Cada módulo mantém seu próprio estado de trabalho: rascunho, preparação, elegível, bloqueado ou retirado. | Um status único misturar captação, locação, proposta, divulgação, venda ou financeiro. |
| Bloqueio | Um estado bloqueado exige `reason_code`, sem revelar evidência ou dossiê. | Interface ignorar a pendência ou expor documento, parte ou motivo sensível fora da finalidade. |
| Mutação | O comando é idempotente por correlação, auditável e executado apenas pelo servidor após policy contextual. | Repetição de clique, URL, filtro ou cliente web criarem ativo, vínculo ou disponibilidade duplicados. |

> **Decisão de corte:** A6 modela o ativo e a elegibilidade de trabalho, não a negociação. Titularidade, administração, disponibilidade, proposta, reserva, contrato e efeitos financeiros permanecem deliberadamente separados.

## Referências internas

[1] [Fundação compartilhada — ativo, disponibilidade e relações](caderno_fundacao_compartilhada_vendas_locacao.md)

[2] [Jornadas operacionais — Vendas Urbanas e Locação](caderno_jornadas_operacionais_vendas_locacao.md)
