# Notas de pesquisa — Observatório da Locação Imobiliária

## Escopo de análise

A pesquisa aborda o mercado brasileiro de locação residencial com foco em quatro decisões de produto: leitura de demanda e preço por território; qualificação de interesse do locatário; captação de imóveis e relacionamento com proprietários; e proposta de valor comercial para imobiliárias e loteadoras. O produto recomendado será uma camada de inteligência e fluxo de captação, não uma garantia de preço ou de ocupação.

## Fontes priorizadas

| Eixo | Fonte principal | Uso analítico |
| --- | --- | --- |
| Preço, variação e yield | Índice FipeZAP / Fipe e Grupo OLX | Quantificar ritmo, dispersão por cidade e recorte de tipologia. |
| Estrutura habitacional | IBGE / Censo Demográfico | Dimensionar relevância do aluguel no parque de domicílios. |
| Operação de locação | Secovi e estudos setoriais | Identificar vacância, práticas de gestão e dores de imobiliárias. |
| Privacidade e coleta de dados | LGPD e ANPD | Definir dados mínimos, transparência e governança do formulário. |
| Usabilidade do formulário | Referências de UX e conversão | Desenhar coleta progressiva, de baixa fricção e orientada a decisão. |

## Achados registrados

### Metodologia FipeZAP

O Índice FipeZAP utiliza amostras de anúncios nos portais do Grupo OLX (Zap, Viva Real e OLX). Para venda e locação residencial, a página oficial informa que a cobertura alcança até 56 cidades, incluindo 22 capitais. O informe de julho de 2026, especificamente, reporta a série de locação baseada em anúncios de apartamentos prontos de 36 cidades, incluindo 22 capitais. Portanto, os dados representam **preços pedidos para novos aluguéis**, e não os reajustes de contratos já vigentes. [1] [2]

### Dinâmica nacional — julho de 2026

O aluguel residencial avançou **0,70%** no mês, **5,97%** no acumulado de janeiro a julho e **9,28%** em 12 meses, acima do IPCA informado no mesmo relatório (**4,44%** em 12 meses). O preço médio da amostra foi **R$ 54,17/m²** e o yield residencial médio anualizado foi **6,14% a.a.** [2]

### Segmentos prioritários

Apartamentos de **dois dormitórios** tiveram a maior alta em 12 meses (**10,21%**) entre as tipologias divulgadas. Unidades de **um dormitório** apresentaram o maior valor médio por m² (**R$ 72,08/m²**) e o maior yield (**6,78% a.a.**), sinalizando que a solução deve permitir recortes de tipologia, localização e orçamento — uma segmentação única por “interesse em aluguel” é insuficiente. [2]

### Heterogeneidade territorial

No acumulado de 12 meses até julho de 2026, Aracaju (+25,78%), Teresina (+19,16%), Fortaleza (+16,27%), Brasília (+14,80%), Natal (+14,60%) e Rio de Janeiro (+13,52%) ficaram acima do índice agregado. São Paulo registrou +5,53%, mas seguia entre os preços médios mais altos da amostra (R$ 65,18/m²). A estratégia comercial deve priorizar cidades pela combinação de **crescimento, estoque potencial e complexidade operacional**, e não apenas pelo maior preço médio. [2]

### Base estrutural do mercado de aluguel

Segundo a PNAD Contínua divulgada pelo IBGE em abril de 2026, o número de domicílios alugados passou de **12,2 milhões em 2016 para 18,9 milhões em 2025**, avanço de **54,1%** — a condição de ocupação que mais cresceu no período. O IBGE também descreve que esses imóveis já representam quase um quarto dos domicílios brasileiros. Essa expansão estabelece um mercado endereçável amplo para ferramentas que reduzem fricção entre demanda, carteira, atendimento e precificação. [3]

### Mudança no perfil de moradia

O mesmo levantamento registra crescimento de 48,7% no número de apartamentos de 2016 a 2025 e aumento das unidades domésticas unipessoais de 12,2% para 19,7% dos domicílios entre 2012 e 2025. Esses dois movimentos reforçam a necessidade de segmentar formulários por composição domiciliar, estágio da mudança e preferência de imóvel, sem presumir uma família-padrão. [3]

### Transformação da cadeia de locação

Estudo publicado em *Cadernos Metrópole* descreve plataformas digitais como estruturas centrais de organização e coordenação do mercado brasileiro de locação residencial. Na síntese da pesquisa, essas plataformas conectam locadores e locatários e combinam cadastro online, estimativa de preços, anúncio, gestão contratual, seguros e análise de crédito. A implicação para uma solução B2B não é reproduzir uma plataforma de anúncios ampla; é oferecer à imobiliária uma camada que organize **dados de procura, encaixe de carteira, preço indicativo e priorização comercial** sem forçar a substituição de seu papel local. [4]

### Critério de robustez do cadastro

“Robusto” não deve significar “longo”. Um cadastro robusto é aquele que coleta, em cada etapa, informação suficiente para a decisão seguinte, com evidência, segurança e rastreabilidade. A melhor arquitetura é uma jornada progressiva: **interesse → qualificação → proposta/dossiê → contrato**. O primeiro estágio captura demanda e consente o contato; o último reúne documentação apenas depois de haver intenção concreta e imóvel compatível. Essa separação reduz abandono e evita solicitar informação sensível antes de uma finalidade operacional clara.

### Privacidade por desenho

A LGPD estabelece, entre seus princípios, finalidade, adequação, necessidade, transparência, segurança, prevenção e responsabilização. Para o produto, isso se traduz em apresentar o propósito de cada bloco de dados, solicitar apenas o necessário em cada fase, registrar a base legal aplicável e controlar acesso por função. Documento de identidade, comprovantes de renda, extratos e dados de fiador não devem existir no formulário público de interesse; devem ser solicitados em ambiente autenticado, em fase posterior, com trilha de auditoria e retenção definida. [5]

### Garantia locatícia como escolha, não como barreira inicial

A Lei do Inquilinato lista caução, fiança, seguro-fiança e cessão fiduciária de quotas de fundo de investimento como modalidades de garantia e veda mais de uma modalidade no mesmo contrato. Logo, no primeiro cadastro a pergunta adequada é **“qual alternativa de garantia você considera viável?”**, com opção de “quero orientação”; não uma exigência antecipada de dados de fiador, renda ou documentos. A definição efetiva deve ocorrer no dossiê e na proposta, com a política da imobiliária e validação jurídica aplicáveis. [6]

### Usabilidade para cadastros longos

A Nielsen Norman Group recomenda reduzir carga cognitiva por meio de estrutura, transparência, clareza e suporte. Campos relacionados devem ser agrupados, requisitos devem ficar visíveis desde o início, e a lógica condicional deve mostrar somente as perguntas pertinentes ao que o usuário informou. Para locação, isso sustenta um fluxo com etapas nomeadas, indicador de progresso, validação no próprio campo, salvamento de rascunho e justificativas curtas para cada pedido documental. [7]

### Segurança operacional para imobiliárias de todos os portes

A ANPD disponibiliza um guia, checklist de medidas de segurança e modelo de registro das operações de tratamento para agentes de pequeno porte. Para o cadastro recomendado, esses materiais sustentam requisitos verificáveis: perfis de acesso por função, autenticação forte para quem vê documentos, registro de visualizações e exportações, armazenamento separado para arquivos, política de retenção e descarte, inventário de operações de dados, contratos com fornecedores e canal para pedidos do titular. São controles de produto e operação, não itens acessórios de TI. [8]

## Referências

[1] [Fipe — Índice FipeZAP](https://www.fipe.org.br/pt-br/indices/fipezap/)

[2] [FipeZAP — Informe de Locação Residencial, julho de 2026](https://imoveis.grupoolx.com.br/uploads/fipezap_202607_residencial_locacao_25996d7baf.pdf)

[3] [IBGE — Domicílios alugados cresceram mais de 50% desde 2016](https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/46449-domicilios-alugados-cresceram-mais-de-50-desde-2016)

[4] [Batista, L. M. T. R. — Do QuintoAndar ao topo: reestruturação do mercado de locação brasileiro via plataformas](https://www.scielo.br/j/cm/a/XtszPLPZvdHcRNsGhb5mDRr/?lang=pt)

[5] [Planalto — Lei nº 13.709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

[6] [Planalto — Lei nº 8.245/1991 (Lei do Inquilinato)](https://www.planalto.gov.br/ccivil_03/leis/l8245.htm)

[7] [Nielsen Norman Group — 4 Principles to Reduce Cognitive Load in Forms](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)

[8] [ANPD — Guia orientativo sobre segurança da informação para agentes de tratamento de pequeno porte](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte)
