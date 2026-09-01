# Validação A62 — matriz contextual do inventário

## Objetivo

Remover a digitação de referências técnicas de Quadra e Lote no setor separado de Estoque e Mapa de Lotes, preservando a cadeia operacional Loteamento → Quadra → Lote.

## Evidência desktop

Na rota autenticada de Estoque e Mapa de Lotes, a área de rascunhos avançados passou a exibir uma matriz contextual com os seletores `Loteamento em rascunho` e `Quadra matriz autorizada`. Sem dados de negócio no contexto atual, a interface apresentou estados explícitos de ausência e dependência, sem revelar loteamentos, Quadras ou Lotes de outros contextos.

Os formulários recolhidos de estruturação e de situação interna não exibem mais campos para digitar identificadores técnicos. O percurso segue a convenção operacional de Loteamento, Quadra e Lote e mantém os limites de rascunho, sem disponibilidade, reserva, venda, contrato ou efeito financeiro.

## Limites preservados

- As opções derivam apenas de respostas contextualizadas e minimizadas já verificadas pelo servidor.
- Trocar loteamento limpa a Quadra e o Lote; trocar Quadra limpa o Lote, impedindo referências locais fora da cadeia escolhida.
- Seleção visual não substitui a confirmação server-side de contexto, identidade, membership, grant, finalidade, vigência e policy.
- Não foram criados loteamentos, Quadras, Lotes, estados, reservas, vendas, contratos ou dados financeiros.
