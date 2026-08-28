# Contrato A13 — Perfil de busca urbano em rascunho

## Finalidade e corte

O corte A13 registra preferências estruturadas para um lead urbano em rascunho cujo `interest_kind` seja `search_profile`. O perfil orienta a próxima análise humana; não seleciona imóvel, não calcula aderência, não recomenda oferta e não define condição comercial.

| Elemento | Regra no corte A13 | Limite explícito |
|---|---|---|
| Lead elegível | Deve estar em rascunho e ter interesse `search_profile`. | Lead de ativo específico ou não especificado é negado. |
| Tipos aceitos | Um ou mais tipos canônicos de ativo urbano. | Não cria disponibilidade, catálogo ou anúncio. |
| Horizonte declarado | `immediate`, `up_to_90_days` ou `flexible`. | Não é previsão de compra, aprovação ou reserva. |
| Preferência interna | Código curto e opcional para classificação. | Não aceita bairro, endereço, preço, renda, crédito, financiamento ou texto livre. |
| Leitura | Retorna apenas IDs técnicos, tipos, horizonte, presença de código e atualização. | Não retorna Party, contato, dados pessoais, ativo, proposta, contrato ou financeiro. |

## Critérios de aceite

O banco exige contexto explícito de Vendas Urbanas, identidade/grant/finalidade/vigência válidos e correlação UUID para idempotência. Tabelas são protegidas por RLS; as funções têm `search_path` seguro, execução revogada por padrão e grant exclusivo para `service_role`.

> O A13 não cria perfil de crédito, financiamento, preço, faixa de valor, endereço, CEP, geolocalização, ativo recomendado, visita, proposta, reserva, contrato, publicação, comissão, cobrança, repasse, documento ou dado real.
