# Caderno de indicadores de mercado — Vendas Urbanas e Locação

**Status:** `estratégia_documental`  
**Atualização:** `2026-08-27`  
**Escopo:** Vendas Urbanas e Locação. Este documento especifica contratos de leitura, contexto, qualidade e decisão para indicadores externos; não autoriza coleta automática, integração, cálculo, recomendação individual, precificação, crédito ou alteração funcional no CRM.

## 1. Princípio: contexto de mercado não é fato da carteira

O CRM deve permitir que a equipe compare o próprio desempenho com sinais externos, mas sem misturar universos. Um anúncio observado, uma amostra de financiamento, um índice regional ou uma pesquisa setorial nunca substitui os fatos internos de imóvel, proposta, contrato, recebimento, manutenção ou carteira.

> **Regra estratégica:** todo indicador externo é exibido como contexto versionado; toda decisão comercial, financeira ou operacional deve permanecer ancorada no fato interno, na política aplicável e na revisão humana.

| Classe de dado | Pergunta que responde | Não pode ser usado isoladamente para |
| --- | --- | --- |
| Contexto de anúncios | Como evoluiu a oferta anunciada em determinado recorte? | Inferir preço final, disponibilidade, qualidade ou risco de um imóvel específico. |
| Contexto de contratos de plataforma | Como um provedor mede negociação em seu ecossistema? | Extrapolar para a carteira completa ou outro município sem aviso de cobertura. |
| Crédito e garantia bancária | Qual o comportamento reportado para crédito, taxa, indexador, LTV ou imóvel financiado? | Aprovar crédito, recomendar produto financeiro ou afirmar elegibilidade individual. |
| Pesquisa setorial/local | Como uma fonte descreve o mercado intermediado de sua amostra? | Tratar uma praça/amostra como retrato nacional ou como fato interno. |
| Fato da carteira | O que a organização registrou, verificou e auditou? | Ser sobrescrito por benchmark ou por modelo preditivo. |

## 2. Contrato universal de métrica

Qualquer indicador externo que, em etapa futura, seja mostrado, importado ou comparado deve ter os campos abaixo. A ausência de um campo transforma a métrica em **não exibível para decisão**, e não em valor estimado silenciosamente.

| Campo de contrato | Regra |
| --- | --- |
| `metric_key` e versão | Identificador estável e versão da definição; uma revisão preserva as leituras anteriores. |
| Fonte e URL | Instituição, publicação/dataset, URL, licença/condição conhecida e responsável pelo cadastro da fonte. |
| Universo | Anúncios, contratos, operações de crédito, imóveis financiados, domicílios, estoque novo ou amostra de imobiliárias. |
| Geografia | País, UF, município, bairro, zona ou outro recorte exatamente como descrito; nunca preencher uma granularidade ausente. |
| Segmentação | Venda/locação, novo/usado quando aplicável, tipologia, dormitórios, área, faixa, garantia ou outro recorte informado pela fonte. |
| Período e `as_of` | Competência, data de publicação, data de extração, frequência e atraso esperado. |
| Método e unidade | Definição, unidade, moeda, índice/base e transformação permitida. |
| Cobertura e qualidade | Cobertura declarada, completude, revisão, limite metodológico, confiança e estado de aprovação. |
| Exibição | Rótulo de contexto, fonte, `as_of`, atraso, aviso metodológico, link e estado de indisponibilidade. |
| Governança | Owner, revisão programada, decisão que a métrica apoia e proibição de automação sem gate específico. |

## 3. Registro inicial de indicadores externos

| `metric_key` | Uso estratégico | Fonte e universo | Regras de exibição e decisão | Limites obrigatórios |
| --- | --- | --- | --- | --- |
| `MKT-EXT-ASKING-PRICE` | Contextualizar preço anunciado por praça/segmento em Vendas Urbanas e Locação. | FipeZAP: amostras de anúncios de venda e locação em portais do Grupo OLX; apartamentos prontos em até 56 cidades. [1] | Mostrar como **preço anunciado externo**, com cidade, segmento, competência, método e cobertura; comparar visualmente com preço anunciado interno, sem substituí-lo. | Não representa transação efetiva, desconto, proposta, valor contratual, disponibilidade ou avaliação individual. |
| `MKT-EXT-CREDIT` | Ler tendências de crédito, taxa, indexador, LTV, carteira e imóveis financiados em Vendas Urbanas. | BCB: séries mensais de mercado imobiliário com fontes de crédito e registros; possui defasagens de 60/90 dias e revisão. [2] | Exigir `as_of`, atraso e revisão; mostrar somente em painel de contexto para gestor habilitado. | Não é motor de aprovação, simulação ou recomendação de financiamento; não cobre todas as transações. |
| `MKT-EXT-HOUSING` | Contextualizar dimensão, evolução e composição da moradia alugada para planejamento de Locação. | IBGE PNAD: pesquisa amostral de domicílios e moradores, com recortes territoriais. [3] | Usar como contexto macro em planejamento e segmentação territorial, com período anual e universo informado. | Não mede carteira, contrato, inadimplência, preço ou risco individual de locatário/locador. |
| `MKT-EXT-NEW-SUPPLY` | Ler oferta e ritmo de vendas de imóveis novos em Vendas Urbanas quando a fonte cobrir o recorte. | CBIC: publicações trimestrais de indicadores imobiliários nacionais. [4] | Exigir referência ao relatório/competência, praça e segmento; exibir ausência quando não houver recorte comparável. | Não generalizar para mercado usado, locação ou município não coberto; cada número requer leitura do relatório fonte. |
| `MKT-EXT-LOCAL-BROKERAGE` | Contextualizar volume e preço de mercado intermediado por município no Estado de São Paulo. | CRECISP: pesquisa mensal baseada em mais de 1.500 imobiliárias, com venda e locação e busca municipal. [5] | Separar claramente `mercado paulista intermediado` de `carteira interna`; declarar município, mês, amostra e fonte. | Não é censo nacional nem fato transacional da organização; não extrapolar fora do universo da pesquisa. |
| `MKT-EXT-RENT-NEGOTIATION` | Distinguir oferta de fechamento e apoiar análise de negociação em Locação. | QuintoAndar Imovelweb: índice apresenta preço médio, tipologia e desconto; o desconto usa anúncio e contrato do mesmo imóvel no ecossistema do provedor. [6] | Exibir somente com praça, período, tipologia e metodologia; manter separado de desconto médio da própria carteira. | Cobertura dependente da plataforma e de seus contratos; não usar para alterar automaticamente preço, garantia ou prioridade. |
| `MKT-EXT-LOCAL-REPORT` | Incorporar estudos regionais quando o relatório e a metodologia forem disponíveis. | Secovi-SP disponibiliza pesquisas, índices e estudos regionais; parte da inteligência é restrita a associados. [7] | Incluir apenas após registrar material, período, praça, método e condição de acesso no catálogo de fontes. | Página de catálogo não prova indicador único; não preencher lacunas com inferência. |
| `MKT-EXT-FINANCE-WATCH` | Monitorar fonte potencial de financiamento sem construir dependência de dado incompleto. | ABECIP possui área institucional de informativos mensais; nesta consulta não houve série/metodologia acessível. [8] | Estado inicial: `fonte_identificada_sem_métrica_aprovada`; nenhuma leitura exibida até validação do documento fonte. | É proibido derivar número, regra ou recomendação da mera existência da página. |

## 4. Leituras estratégicas por coluna

### 4.1 Vendas Urbanas

Em Vendas Urbanas, a leitura deve combinar o fato interno da oportunidade — origem, estágio, imóvel, preço de captação, preço publicado, proposta, condição de pagamento, financiamento declarado e contrato — com o contexto externo de oferta, crédito e estoque. A comparação deve responder **“o que acontece na nossa operação neste recorte?”** antes de responder **“como o recorte externo se comporta?”**.

| Questão de decisão | Fato interno primeiro | Contexto externo permitido | Prova de leitura correta |
| --- | --- | --- | --- |
| Saúde de captação | Imóveis ativos, completude, tempo em carteira, preço de anúncio interno e alterações de preço. | `MKT-EXT-ASKING-PRICE` com praça/tipologia compatível. | Usuário visualiza fonte, `as_of`, universo e alerta de comparabilidade antes da diferença exibida. |
| Eficiência comercial | Lead → qualificação → visita → proposta → contrato, com tempos e motivos internos. | `MKT-EXT-NEW-SUPPLY` e `MKT-EXT-LOCAL-BROKERAGE` apenas como camada contextual. | Funil interno permanece íntegro quando a fonte externa está indisponível ou defasada. |
| Preparação de financiamento | Declarações e documentos da proposta, estágio de análise e pendências internas. | `MKT-EXT-CREDIT` para leitura agregada de cenário. | Nenhuma situação de crédito individual muda por leitura de série externa. |
| Avaliação de preço | Evidências do imóvel, comparáveis aprovados, proposta e decisão humana registrada. | FipeZAP/estudo regional como uma das referências externas. | Parecer informa fontes, comparabilidade, divergências e responsável; não produz preço automático. |

### 4.2 Locação

Em Locação, a leitura deve manter vinculados imóvel, proprietário, oferta, visita, proposta, garantia, contrato, reajuste, cobrança, manutenção e renovação. O mercado externo ajuda a entender a tensão de oferta e negociação, mas não altera sozinho valor, garantia, prazo ou cobrança.

| Questão de decisão | Fato interno primeiro | Contexto externo permitido | Prova de leitura correta |
| --- | --- | --- | --- |
| Tempo até locar | Data de disponibilidade/oferta, visitas, propostas, retirada e assinatura; motivo de perda padronizado. | `MKT-EXT-ASKING-PRICE`, `MKT-EXT-LOCAL-BROKERAGE` e estudos locais quando comparáveis. | Painel separa `dias até proposta` e `dias até contrato`; a fonte externa mostra período e cobertura. |
| Negociação | Valor anunciado, proposta, contraproposta, valor contratado, desconto e aprovação do proprietário. | `MKT-EXT-RENT-NEGOTIATION` por praça/tipologia. | Desconto interno não é sobrescrito pelo benchmark e preserva linha temporal de cada alteração. |
| Planejamento de carteira | Inventário interno, vacância, vencimentos, manutenção, inadimplência, renovação e próximos eventos. | `MKT-EXT-HOUSING` como contexto macro e estudos locais aprovados. | O indicador macro não vira score de risco ou prioridade automática. |
| Comunicação com proprietário | Dados de contrato, carteira, manutenção e prestação de contas autorizados. | Nenhum benchmark é mostrado como fato individual sem consentimento, policy e rótulo de fonte. | Portal aplica escopo do grant, expiração e minimização de dados. |

## 5. Regras de qualidade, tendência e explicabilidade

| Regra | Decisão estratégica |
| --- | --- |
| Comparabilidade antes de cálculo | O sistema só pode calcular diferença, ranking ou tendência quando unidade, geografia, segmento, período e universo forem compatíveis e explicitamente aprovados. |
| Série externa imutável | Uma coleta futura é um snapshot com fonte, versão e `as_of`; correções da fonte geram nova versão, não substituição silenciosa. |
| Tendência não é previsão | Curvas de 3/6/12 períodos devem registrar método, lacunas e revisão; nenhuma curva é apresentada como previsão de fechamento, vacância ou inadimplência. |
| Estado de indisponibilidade honesto | Fonte sem série validada, com atraso excessivo, cobertura incompatível ou condição de acesso pendente deve exibir indisponibilidade e motivo. |
| Explicação no próprio gráfico | Toda visualização deve oferecer texto alternativo/tabela, fonte, período, cobertura, método, aviso de limitação e link para leitura aprofundada. |
| Sem ranking opaco de pessoas | Indicadores externos não classificam locatários, proprietários, corretores ou compradores; recomendações exigem dados próprios, policy, explicação e revisão humana. |

## 6. Gates documentais antes de qualquer ativação futura

| Gate | Exigência | Falha segura |
| --- | --- | --- |
| Fonte | URL, licença/condição, método, universo, cobertura, período e owner registrados. | Não criar job, integração ou painel ativo. |
| Dados | Amostra de staging, schema versionado, checagem de unidade, completude, anomalia e duplicidade. | Reter em quarentena, sem tocar fatos internos. |
| Segurança | Escopo de acesso, segredo, limite, observabilidade, teste de negar e caminho de revogação. | Desativar coleta/exibição e registrar evento. |
| Produto | Rótulos, limitações, `as_of`, estado vazio, tabela alternativa e teste de compreensão por papel. | Exibir somente indisponibilidade contextual. |
| Decisão | Owner, alternativa, risco, evidência, critério de aceite e aprovação registrada. | Não automatizar ação, preço, cobrança, garantia ou financiamento. |

## 7. Recomendação estratégica

A primeira implementação futura não deve ser um painel cheio de números externos. O caminho seguro é um **catálogo de indicadores** com dados de proveniência completos e, depois, um cartão contextual por jornada, somente onde houver comparabilidade real. Isso protege a equipe contra a falsa precisão e permite explorar os dados de forma mais intuitiva, entender melhor as tendências e salvar ou compartilhar facilmente leituras que preservem fonte e método.

## Referências

[1] [FipeZAP — Índice FipeZAP](https://www.fipe.org.br/pt-br/indices/fipezap/)

[2] [Banco Central do Brasil — Informações do Mercado Imobiliário](https://www.bcb.gov.br/estatisticas/mercadoimobiliario)

[3] [IBGE — Domicílios alugados cresceram mais de 50% desde 2016](https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/46449-domicilios-alugados-cresceram-mais-de-50-desde-2016)

[4] [CBIC — Estudos e Indicadores Imobiliários Nacionais](https://cbic.org.br/estudos/)

[5] [CRECISP — Pesquisas de mercado](https://www.crecisp.gov.br/comunicacao/pesquisasmercado)

[6] [Índice de Aluguel QuintoAndar Imovelweb](https://www.quintoandar.com.br/newsroom/indice-de-aluguel/)

[7] [Secovi-SP — Pesquisas e índices](https://secovi.com.br/pesquisas-e-indices/)

[8] [ABECIP — Informativos mensais](https://www.abecip.org.br/imprensa/informativos-mensais)
