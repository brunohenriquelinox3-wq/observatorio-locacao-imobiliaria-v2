# Blueprint de Sócios e Parceiros — A176

**Data:** 05 de setembro de 2026  
**Escopo:** Setor 04 da Loteadora. Esta evolução organiza vínculos internos já autorizados e não implementa sociedade, participação econômica, contrato, portal, recebível, cobrança, pagamento ou repasse.

## Decisão de produto

O Setor 04 já modela vínculos temporais de `sócio`, `parceiro` e `cedente de terra` por loteamento. A próxima evolução será uma **visão de governança interna somente de leitura**, que explicita esses vínculos por tipo de papel e vigência declarada sem revelar Party, dados pessoais ou identificadores técnicos.

Essa decisão aproveita a prática de identificar as partes envolvidas, definir responsabilidades e acompanhar relacionamentos sem transformar um mecanismo de governança em instrumento de decisão material. [1] A literatura setorial também relaciona processos claros, rastreabilidade e responsabilidades definidas a uma governança imobiliária mais consistente. [2]

| Elemento | Comportamento permitido | Limite obrigatório |
|---|---|---|
| Loteamento | A leitura usa somente o loteamento em rascunho devolvido ao contexto atual. | Não mostra localização, registro, área ou situação legal. |
| Papel | Exibe apenas Sócio, Parceiro ou Cedente de terra. | Não revela nome, Party, contato, CPF/CNPJ ou dados de empresa. |
| Vínculo | Exibe um ordinal local e se a vigência está aberta ou encerrada. | Não exibe datas, valor, percentual, quota, recebível ou participação. |
| Governança | Informa que o vínculo exige revisão humana de responsabilidade interna. | Não define influência, decisão, conflito, aprovação ou comunicação. |
| Ação | Nenhuma ação é criada pelo quadro. | Não há botões, mutation, convite, portal, download ou integração. |

## Estados de apresentação

| Cenário | Resposta da interface |
|---|---|
| Sem contexto | Não consulta ou indica existência de vínculos. |
| Contexto, sem loteamento selecionado | Solicita a seleção de um loteamento autorizado sem revelar vínculos de outro. |
| Consulta em andamento | Informa que o contexto é confirmado antes da leitura. |
| Nenhum vínculo retornado | Exibe estado vazio honesto. |
| Vínculo vigente | Exibe “vigência declarada aberta” e “revisão humana de responsabilidade”. |
| Vínculo encerrado | Exibe “vigência declarada encerrada”, sem interpretar motivo ou efeito. |

## Critérios de aceite

O quadro deve ser derivado das consultas já protegidas; não pode criar nova persistência ou fonte de dados; não deve mostrar dados pessoais, datas, identificadores técnicos, valores ou percentuais; deve manter a seleção de loteamento sem inferência entre contextos; e precisa possuir testes para agrupamento, vigência, estados vazios e ausência de controles materiais.

## Referências

[1]: [Portal Gov.br — Mapa de Stakeholders](https://www.gov.br/ouvidorias/pt-br/governanca-de-servicos/ferramentas/mapa-de-stakeholders)

[2]: [EBM — ESG: o que é Governança e por que ela importa para o setor imobiliário](https://ebm.com.br/blog/esg/esg-o-que-e-governanca-e-por-que-ela-importa-para-o-setor-imobiliario/)
