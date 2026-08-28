# Contrato A10 — Perfil de busca de locatário em rascunho

## Finalidade e corte

O corte A10 permite estruturar um **perfil de busca interno** para uma entrada de Locação com jornada `tenant_interest`. O perfil conserva somente tipos de ativo aceitos, uma janela declarada de ocupação e um código de preferência operacional. Ele não representa uma proposta, análise, aprovação, reserva, visita ou contratação.

| Elemento | Regra no corte A10 | Limite explícito |
|---|---|---|
| Entrada elegível | Deve estar em rascunho e ter jornada `tenant_interest`. | Interesse de administração é negado. |
| Tipos aceitos | Entre um e quatro tipos canônicos de ativo urbano. | Não há inventário sugerido ou correspondência automática. |
| Ocupação declarada | `immediate`, `up_to_30_days` ou `flexible`. | Não cria prazo contratual, visita ou compromisso externo. |
| Preferência | Código interno de até 80 caracteres, sem texto livre de endereço. | Não aceita endereço, CEP, coordenada, contato ou documento. |
| Leitura | Retorna somente IDs técnicos, tipos, janela, código e instante de criação. | Não retorna Party, dados pessoais, valor, crédito, garantia ou contrato. |

## Não objetivos e critérios de aceite

O comando é idempotente por UUID de correlação, opera somente com contexto autorizado e registra apenas payload redigido. O banco deve negar módulo distinto de Locação, entrada de administração, rascunho de outra organização, tipo de ativo vazio, duplicação conflitante e chamadas sem identidade, membership, grant, finalidade ou vigência válidos.

> O A10 não coleta ou armazena endereço, CEP, geolocalização, faixa de preço, renda, contato, documento, análise de crédito, garantia, proposta, reserva, visita, contrato, cobrança, repasse, portal, publicação ou dados reais.
