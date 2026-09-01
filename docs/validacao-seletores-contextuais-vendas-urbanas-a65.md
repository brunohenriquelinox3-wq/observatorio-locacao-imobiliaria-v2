# Validação A65 — Seletores Contextuais de Vendas Urbanas

## Escopo observado

A superfície autenticada de Vendas Urbanas apresentou uma organização já autorizada e finalidade em modo somente leitura. As leituras retornaram estado vazio legítimo para Parties, Leads, Ativos, Agendas, vínculos, perfis e classificações; a ausência de registros não expôs qualquer informação de outro contexto.

| Área | Controle observado | Resultado |
| --- | --- | --- |
| Lead de entrada | Party autorizada | Sem Party em rascunho no contexto, sem campo de UUID. |
| Etapa e compromisso | Lead autorizado | Sem lead em rascunho no contexto, sem campo de UUID. |
| Ativo declarado | Lead e ativo autorizados | Sem referências elegíveis no contexto, sem identificadores técnicos. |
| Perfil de busca | Lead de perfil de busca | Sem lead elegível, com tipos canônicos e limites de rascunho preservados. |
| Agenda interna | Agenda interna autorizada | Sem agenda classificável, sem identificador técnico, comunicação externa ou integração. |

## Limites preservados

A leitura nova de agenda retorna somente identificador interno para o valor do seletor, rótulo de Party já autorizado, data operacional e estado. O rótulo exibido não contém ID, motivo, contato, endereço, preço, oferta, reserva, proposta, contrato, financeiro ou dados de terceiro. A autorização continua centralizada no servidor por identidade, contexto, módulo, finalidade, membership, grant, vigência e policy.
