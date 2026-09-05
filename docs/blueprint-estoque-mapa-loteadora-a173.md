# Blueprint do Estoque/Mapa de Lotes — A173

**Data:** 04 de setembro de 2026  
**Escopo:** Setor 02 da coluna Loteadora, sem disponibilidade comercial, reserva, venda, proposta, contrato, cobrança, valores, pagamentos, repasses, integração geográfica ou dados de localização.

## Evidência e decisão

As apresentações públicas de produtos setoriais mostram que o mercado associa mapas de loteamento a navegação por Quadras e Lotes, visualização de estados e prevenção de conflito operacional. [1] [2] Essas mesmas referências, porém, tratam o mapa como porta de entrada para reservas, preços, propostas, vendas e integrações. Tais capacidades não serão reproduzidas neste corte.

> A primeira camada de mapa do CRM será uma **matriz estrutural, somente de leitura**, derivada exclusivamente de Quadra, Lote e estado interno já autorizados. Ela ajuda o time a conferir a organização da planta de trabalho, sem declarar estoque comercial.

| Tema | Decisão para este marco | Proteção |
|---|---|---|
| Fonte | Lotes e estados internos já devolvidos no contexto autorizado. | Nenhum dado é consultado sem sessão e contexto válidos. |
| Hierarquia | Loteamento → Quadra matriz → Lote. | A troca de loteamento limpa Quadra e Lote; nenhuma referência é inferida por URL ou nome. |
| Visualização | Células estáticas e ordenadas por número de Lote. | As células não são botões, não abrem detalhes e não acionam comando. |
| Estado | Referência confirmada, revisão de estrutura ou revisão necessária. | Os rótulos não correspondem a disponível, reservado, vendido, bloqueado comercialmente ou recebido. |
| Ausência de registros | Mensagem honesta de que não há lote retornado à Quadra selecionada. | A ausência não permite concluir área, titularidade, disponibilidade ou comercialização. |

## Regra funcional

A visualização será habilitada apenas depois de `sessão autenticada + organização autorizada + módulo Loteadora + finalidade + loteamento + Quadra`. Quando habilitada, ela fará a correlação local entre a lista minimizada de Lotes da Quadra e a lista minimizada de estados internos. Não haverá nova escrita, cálculo de estoque, filtro comercial, integração externa ou animação que represente status de venda.

| Caso | Comportamento esperado |
|---|---|
| Sem contexto | A matriz informa o bloqueio e não consulta Lotes ou estados. |
| Com contexto, sem Quadra | A matriz orienta a escolha da Quadra, sem revelar Lotes. |
| Quadra sem Lotes retornados | A matriz exibe estado vazio, sem criar Lote nem concluir disponibilidade. |
| Lote sem estado interno retornado | A célula informa que a revisão estrutural está pendente, sem atribuir estado comercial. |
| Estado interno conhecido | A célula usa o rótulo do domínio e permanece somente de leitura. |

## Critérios de aceite

A entrega será aceita somente se a ordenação de Lotes for determinística; se estados não reconhecidos forem tratados como revisão pendente; se as queries continuarem desabilitadas sem contexto; se não for incluído `fetch`, cliente Supabase no navegador, integração de mapas, reserva ou linguagem comercial; e se a matriz continuar legível em desktop e móvel.

## Referências

[1]: [LoteMap — Mapa Interativo para Loteamentos com Disponibilidade de Lotes](https://lotemap.com.br/mapa-interativo-para-loteamentos-disponibilidade-de-lotes/)

[2]: [Sistema SGL — Mapa Interativo e Espelho de Vendas para Loteamentos](https://sistemasgl.com.br/modulos/mapa-interativo/)
