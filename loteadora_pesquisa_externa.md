# Pesquisa externa — loteadoras e desenvolvimento urbano

## AELO / pesquisa de mercado de loteamentos

O Boletim Informativo nº 1.061 da AELO, publicado em 29 de outubro de 2025, registra que Hamilton Leite, da Brain Inteligência Estratégica, apresentou no Comitê de Desenvolvimento Urbano os resultados da pesquisa de loteamentos referente ao segundo trimestre de 2025. O boletim informa queda de **26% no total de lotes lançados** em comparação com o segundo trimestre de 2024. [1]

O dado deve ser usado com cautela: a página não apresenta, no trecho acessível, a abrangência da amostra, o número absoluto de lotes, o recorte geográfico completo ou a metodologia da Brain. Portanto, ele entra no catálogo como **indicador setorial de contexto**, e não como base para previsão nacional ou meta de vendas do CRM. A consequência de produto é reforçar a necessidade de armazenar fonte, período, cobertura e método antes de exibir uma métrica no painel.

O mesmo boletim demonstra que loteamentos estão expostos a pautas de infraestrutura, concessionárias, regulamentação e aprovação, discutidas em conjunto por AELO, Secovi-SP e SindusCon-SP. Para o CRM, isso sustenta o domínio de acompanhamento de aprovações, obras, concessionárias, marcos e riscos regulatórios — e não apenas o módulo comercial de reserva de lote. [1]

## Referências

[1] [AELO — Boletim Informativo nº 1.061, 29 out. 2025](https://aelo.com.br/boletins/aelo-boletim-informativo-1-061/)

## Parcelamento, registro e configuração municipal

A Lei nº 6.766/1979 confirma que parcelamento urbano pode ocorrer por loteamento ou desmembramento e que os Estados, Distrito Federal e Municípios podem estabelecer normas complementares para adequação local. A lei também define infraestrutura básica, condiciona a admissão do parcelamento a zonas urbanas, de expansão urbana ou urbanização específica e proíbe o parcelamento em hipóteses ambientais e geotécnicas determinadas. [2]

Para o produto, a consequência é objetiva: `MunicipalityRuleSet`, `ApprovalCase`, `Restriction`, `InfrastructureObligation` e `ProjectDirective` precisam ser objetos configuráveis e versionados. Eles não podem ser campos de texto soltos nem regras universais escritas no código. A lei prevê a solicitação de diretrizes municipais antes da elaboração do projeto e exige que, depois de aprovado, o loteamento seja submetido ao registro imobiliário em 180 dias, sob pena de caducidade da aprovação. [2]

O CRM deve tratar a afirmação “empreendimento registrado” como uma **evidência revisada**, com cartório, número, data, documento e responsável. A comercialização não pode usar um simples campo preenchido pelo usuário como prova de registro.

## Distrato de loteamento: variável de contrato e processo de estoque

A Lei nº 13.786/2018 inseriu o quadro-resumo obrigatório nos contratos de loteamento, que deve informar preço, forma de pagamento, índices de correção, consequências do desfazimento, juros, registro do loteamento, matrícula e outros elementos. O art. 32-A prevê, em determinadas condições, descontos por fruição, cláusula penal/despesas administrativas limitada a 10% do valor atualizado do contrato, encargos, tributos e corretagem integrada ao preço. Também trata da restituição em parcelas e impõe condições relacionadas ao registro de nova venda. [3]

Em outubro de 2025, o STJ noticiou decisão da Quarta Turma no REsp 2.104.086: para contratos submetidos à Lei do Distrato, admitiu a taxa de ocupação/fruição inclusive em lote não edificado, além da cláusula penal, no caso analisado. [4] Isso não transforma a fórmula do caso em regra universal de software. O CRM deve armazenar a versão do contrato, seu quadro-resumo, a posse, as notificações e o parecer responsável, calculando apenas quando existir regra contratual e validação de negócio/jurídica.

| Requisito de produto | Evidência externa | Implementação segura |
| --- | --- | --- |
| Quadro-resumo | Art. 26-A da Lei nº 6.766/1979, incluído pela Lei nº 13.786/2018 | Template versionado, campos originados da condição comercial e aceite específico. |
| Registro antes de venda | Art. 37 da Lei nº 6.766/1979 | Gate documental com exceção somente por política jurídica explicitamente aprovada. |
| Distrato | Art. 32-A e contrato aplicável | Caso de distrato com parâmetros versionados, revisão e trilha de restituição. |
| Nova venda de lote distratado | Art. 32-A, §2º, e art. 35 | Estoque não volta automaticamente à disponibilidade até requisitos/evidências do caso serem revisados. |
| Regra municipal | Lei nº 6.766/1979 e legislação local | Configuração por município com vigência, fonte e responsável. |

## Referências adicionais

[2] [Planalto — Lei nº 6.766/1979 (Parcelamento do Solo Urbano)](https://www.planalto.gov.br/ccivil_03/leis/l6766.htm)

[3] [Planalto — Lei nº 13.786/2018 (Distrato)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13786.htm)

[4] [STJ — Sob Lei do Distrato, é possível aplicar multa por desistência e taxa de ocupação de lote não edificado](https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2025/20102025-Sob-Lei-do-Distrato--e-possivel-aplicar-multa-por-desistencia-e-taxa-de-ocupacao-de-lote-nao-edificado.aspx)

## Minas Gerais: demanda e composição de ticket no primeiro trimestre de 2026

O *Estudo de Mercado de Loteamento de Minas Gerais*, divulgado pelo Sinduscon-MG e produzido pela Brain Inteligência Estratégica a pedido de Aelo-MG, Sinduscon-MG e Secovi-MG, cobre municípios equivalentes a 41% da população e 57% do potencial de consumo do estado. No primeiro trimestre de 2026, a divulgação reportou 2.958 lotes comercializados, 40,9% acima do mesmo período de 2025. O recorte informou crescimento de 170,3% nas unidades abertas (596 para 1.538) e recuo de 7,3% nas fechadas (1.531 para 1.420), enquanto o VGV divulgado caiu de R$ 1,02 bilhão para R$ 664 milhões. [5]

O contraste entre unidades e VGV é o dado mais útil para o CRM: não existe um único “aquecimento do mercado”. A camada de inteligência deve permitir leitura conjunta de unidades, VGV, mix de ticket, tipologia aberta/fechada, praça e período. A página também reporta concentração relevante de oferta de loteamentos abertos entre R$ 150 mil e R$ 200 mil, e de fechados entre R$ 150 mil e R$ 300 mil; esses são recortes de pesquisa, não regras de precificação. [5]

| Implicação para o CRM de loteadora | Requisito de produto |
| --- | --- |
| Vender mais unidades não implica maior VGV | Painel deve separar unidades, VGV, preço/ticket, desconto e mix por fase/canal. |
| Aberto e fechado tiveram trajetórias distintas no recorte | Tipo jurídico/comercial do empreendimento deve ser dimensão de relatório e de regra, não um rótulo no nome. |
| Pesquisa cobre parte do potencial de consumo de MG | Todo painel deve exibir cobertura e não generalizar o resultado para o estado inteiro. |
| Mix de ticket altera demanda e velocidade | Tabela, perfil de busca, condição de pagamento e estoque precisam se conectar por lote/fase. |

## Referência adicional

[5] [Sinduscon-MG — Alta nas vendas marca o 1º trimestre de 2026 do mercado de loteamentos em Minas Gerais](https://sinduscon-mg.org.br/alta-nas-vendas-marca-o-1o-trimestre-de-2026do-mercado-de-loteamentos-em-minas-gerais/)

## Recebíveis, cessão e limites do CRM

A Lei nº 14.430/2022 define regras gerais para securitização de direitos creditórios e emissão de Certificados de Recebíveis. Ela caracteriza securitização como aquisição de direitos creditórios para lastrear títulos, com pagamento condicionado primariamente aos recebimentos e ativos/garantias que os lastreiam, e atribui à CVM a disciplina das emissões públicas. A Resolução CVM nº 60 dispõe sobre companhias securitizadoras de direitos creditórios registradas na CVM e foi alterada posteriormente por outras resoluções. [6] [7]

Isso confirma que o CRM pode e deve preservar a qualidade da origem da carteira — contrato, plano de pagamento, parcela, evidência, status de cobrança, aditivo, distrato, cessão e conciliação de identificadores. Porém, ele não deve ser desenhado como emissor, custodiante, sistema de registro de valores mobiliários ou calculadora regulatória de securitização. A eventual integração com uma estrutura de cessão, FIDC ou securitizadora precisa ser tratada como módulo especializado, com responsável financeiro/jurídico e adaptadores auditáveis.

| O CRM de loteadora deve registrar | O CRM não deve presumir ou executar |
| --- | --- |
| Contrato originador, cronograma, indexação contratual, parcela, pagamento comprovado, atraso e cessão de identificador | Elegibilidade regulatória de uma carteira ou emissão de título de securitização. |
| Origem, versão e evidência da carteira cedida | Custódia, oferta pública, cálculo de lastro ou cumprimento regulatório em nome de terceiro. |
| Situação operacional da cobrança e do distrato | Decisão de crédito, recuperação ou estrutura de mercado de capitais sem responsável habilitado. |

## Referências adicionais

[6] [Planalto — Lei nº 14.430/2022](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14430.htm)

[7] [CVM — Resolução CVM nº 60](https://conteudo.cvm.gov.br/legislacao/resolucoes/resol060.html)
