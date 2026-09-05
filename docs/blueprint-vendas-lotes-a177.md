# Blueprint de Vendas de Lotes — A177

**Data:** 05 de setembro de 2026  
**Escopo:** Setor 05 da Loteadora. A evolução organiza somente rascunhos internos de trabalho; não implementa reserva, proposta, contrato, preço, cobrança, boleto, pagamento, comissão, repasse ou financeiro.

## Pesquisa e decisão

Fontes públicas de CRM imobiliário distinguem pré-cadastro de etapas posteriores e apresentam a visualização de andamento como uma forma de acompanhar onde cada registro se encontra no fluxo. [1] [2] Essas ferramentas normalmente combinam esse andamento com análise, comunicação, reserva e demais ações comerciais. O CRM adotará somente a parte segura do padrão: uma leitura clara de preparo interno, sem ações automáticas ou materialização de negócio.

| Necessidade | Decisão do CRM | Limite obrigatório |
|---|---|---|
| Visibilidade do rascunho | Exibir uma síntese não identificável por rascunho interno. | Não revelar cliente, Lote, identificador técnico, data ou dado de contato. |
| Preparação | Combinar vínculo interno, cobertura opaca, participantes internos e classificação já retornada. | Não converter a síntese em elegibilidade, crédito, aprovação, reserva ou venda. |
| Acompanhamento | Usar rótulos fechados de revisão de vínculo, cobertura privada ou revisão humana. | Não disparar tarefa, alerta, mensagem, e-mail ou integração. |
| Co-compradores | Exibir somente a contagem interna contextual. | Não mostrar Party, titularidade, percentual, prioridade ou obrigação. |
| Ações | O quadro será somente de leitura. | Não terá botões, seleção, formulário, mutation, download ou envio. |

## Próximo aprimoramento: quadro de preparação interna

O Setor 05 receberá um quadro derivado das consultas já protegidas. Cada rascunho será referenciado por ordem local, por exemplo **Rascunho interno 01**, e apresentará apenas quatro sinais: vínculo Lote–cliente registrado, cobertura privada opaca, quantidade de participantes internos e classificação de trabalho. A síntese orienta uma pessoa autorizada a revisar a preparação no setor correspondente; ela não move o rascunho para um estado comercial.

| Condição | Exibição permitida |
|---|---|
| Sem contexto | Bloqueio sem indicação de existência de rascunhos. |
| Sem rascunhos retornados | Estado vazio honesto. |
| Sem cobertura privada | “Sem intenção privada registrada”. |
| Cobertura aguardando ciclo | “Intenção privada aguardando ciclo”. |
| Cobertura registrada | “Cobertura privada registrada”. |
| Sem classificação | “Revisão humana necessária”. |
| Com participantes internos | Quantidade de co-compradores internos, sem identidade ou efeito jurídico. |

## Critérios de aceite

A implementação deve usar exclusivamente dados já retornados pelo contexto autorizado; não pode fazer nova consulta, persistência, integração ou comunicação; deve bloquear a leitura sem contexto; deve ocultar nomes, Lotes, IDs e datas; e precisa ter testes para cobertura, classificação, co-compradores, estado vazio e ausência de controles materiais.

## Referências

[1]: [CV CRM — O que é pré-cadastro e qual a importância em um software imobiliário?](https://cvcrm.com.br/blog/o-que-e-pre-cadastro/)

[2]: [CV CRM — Andamento de Pré-cadastro](https://ajuda.cvcrm.com.br/support/solutions/articles/157000363891-andamento-de-pr%C3%A9-cadastro-painel-do-corretor)
