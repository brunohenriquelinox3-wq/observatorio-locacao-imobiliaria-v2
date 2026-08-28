# Contrato A12 — Vínculo de lead urbano e ativo em rascunho

## Finalidade e corte

O corte A12 permite relacionar **um lead urbano já existente, em rascunho e com interesse `urban_asset`**, a um ativo urbano também em rascunho no módulo `vendas_urbanas`. A relação é uma referência interna de qualificação. Não comprova proprietário, corretagem, exclusividade, disponibilidade, preço, interesse de compra, oferta, reserva, proposta ou autorização comercial.

| Elemento | Regra no corte A12 | Limite explícito |
|---|---|---|
| Lead elegível | Deve estar em rascunho com interesse `urban_asset`. | Leads de busca ou não especificados são negados. |
| Ativo elegível | Deve pertencer à mesma organização, estar em rascunho e ter estado `draft` no módulo Vendas Urbanas. | Não há preço, endereço detalhado, matrícula, mídia, anúncio ou disponibilidade. |
| Cardinalidade | Um lead mantém um vínculo de ativo de rascunho neste corte, substituível por nova operação autorizada. | Não há catálogo de opções, correspondência automática ou ranking. |
| Leitura | Retorna apenas IDs, tipo, referência interna, código interno e instante do vínculo. | Não retorna Party, dado pessoal, titularidade, contato, contrato ou financeiro. |
| Autoridade | Exige identidade, organização, módulo, finalidade, membership, grant e vigência verificados no servidor. | O navegador não acessa tabelas ou RPCs diretamente. |

## Critérios de aceite

O comando é idempotente por UUID de correlação e registra trilha administrativa com payload redigido. A migration mantém RLS, revoga acesso público e concede execução somente a `service_role`.

> O A12 não cria preço, cadastro de proprietário, autorização de venda, proposta, reserva, contrato, publicação, visita, comunicação, comissão, cobrança, repasse, financeiro, documento ou dado real.
