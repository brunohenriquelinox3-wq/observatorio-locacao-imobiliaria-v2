# Contrato A9 — Vínculo de ativo à entrada de administração de Locação

## Finalidade e corte

O corte A9 permite relacionar **um ativo urbano já existente, em rascunho e no módulo Locação**, a uma entrada de Locação cuja jornada seja exclusivamente `management_interest`. O vínculo registra somente a associação interna de triagem. Ele não comprova propriedade, mandato, exclusividade, disponibilidade, elegibilidade comercial ou qualquer autorização de anunciar, administrar, alugar, reservar ou contratar.

| Elemento | Regra no corte A9 | Limite explícito |
|---|---|---|
| Entrada elegível | Deve estar em rascunho e ter jornada `management_interest`. | Entradas `tenant_interest` são negadas. |
| Ativo elegível | Deve pertencer à mesma organização, estar em rascunho e possuir estado `draft` explícito para o módulo `locacao`. | Não há endereço detalhado, preço, imagem, matrícula, anúncio ou disponibilidade. |
| Cardinalidade | Uma entrada de administração mantém um vínculo de ativo em rascunho neste corte. | Não modela portfólio, unidade, anúncio, reserva ou carteira. |
| Leitura | Retorna apenas IDs, tipo, referência interna, código interno e instante do vínculo. | Não retorna Party, documento, contato, titularidade, contrato ou financeiro. |
| Autoridade | Depende de identidade, organização, módulo, finalidade, membership, grant e vigência verificados no servidor. | O navegador não acessa tabelas nem executa RPCs diretamente. |

## Estados e não objetivos

O comando é idempotente por UUID de correlação e registra evento administrativo com payload redigido. A migration mantém RLS habilitado, revoga acesso público e concede execução somente a `service_role`.

> O A9 não cria disponibilidade, contrato de administração, contrato de locação, garantia, análise cadastral, proposta, reserva, publicação, cobrança, repasse, manutenção, vistoria, portal, comunicação, calendário externo, documento, preço ou dado real.

## Critérios de aceite

O banco deve negar módulo distinto de `locacao`, entrada que não seja de administração, ativo sem estado contextual em rascunho, organização diferente, tentativa sem identidade/grant e duplicação conflitante. A interface deve manter a consulta desabilitada sem sessão ou contexto válido e explicar bloqueios sem enumerar objetos externos.
