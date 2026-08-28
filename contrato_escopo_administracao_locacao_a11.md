# Contrato A11 — Escopo declarado de administração em rascunho

## Finalidade e corte

O corte A11 registra o **escopo de serviço apenas declarado** por uma entrada de Locação com jornada `management_interest`. O registro cria uma referência de triagem para orientar a próxima revisão humana. Ele não comprova representação, exclusividade, autorização, disponibilidade do ativo, valor, condição comercial, direito de cobrança ou contrato de administração.

| Elemento | Regra no corte A11 | Limite explícito |
|---|---|---|
| Entrada elegível | Deve estar em rascunho e ter jornada `management_interest`. | Interesse de locatário é negado. |
| Escopo declarado | `full_administration_interest`, `tenant_search_interest` ou `undecided`. | É intenção, não aceite comercial ou instrução operacional. |
| Nota interna | Opcional e em código interno curto. | Não aceita dados pessoais, endereço, preço, documento ou narrativa livre. |
| Cardinalidade | Cada entrada mantém um único escopo ativo de rascunho, substituível por nova declaração autorizada. | Não há versão contratual, assinatura ou aprovação. |
| Leitura | Retorna IDs técnicos, escopo, presença de nota e instante de atualização. | Não retorna Party, ativo, dado pessoal, contrato, cobrança, repasse ou financeiro. |

## Critérios de aceite

O banco deve negar módulo fora de Locação, entrada de locatário, organização distinta, chamada sem identidade/grant/finalidade/vigência e correlação duplicada. RLS permanece habilitada, tabelas e funções são revogadas por padrão e as RPCs são exclusivas a `service_role`.

> O A11 não cria contrato de administração, mandato, gestão, anúncio, disponibilidade, prospecção, visita, proposta, preço, cobrança, repasse, comunicação, portal, arquivo, documento, garantia ou qualquer dado real.
