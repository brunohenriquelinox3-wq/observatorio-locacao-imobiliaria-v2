# Matriz canônica de evidências — CRM imobiliário

## Objetivo

Esta matriz transforma os estudos de locação, vendas urbanas, lotes e cadastros em uma base reutilizável de decisões de produto. Ela evita que uma pesquisa vire apenas conteúdo de apresentação: cada achado passa a ter tema, fonte, período, território, limitação e impacto operacional explícitos.

> O CRM não deve “absorver números” sem contexto. Ele deve registrar **o que a fonte diz, para qual recorte ela vale, quando foi capturada e qual regra de produto pode — ou não — ser derivada dela**.

## Taxonomia do conhecimento do produto

| Domínio | Pergunta que organiza | Objetos de CRM relacionados |
| --- | --- | --- |
| Mercado de locação | Onde existe procura, oferta, variação de custo e lacuna de carteira? | Território, indicador de mercado, perfil de busca, ativo, campanha e painel. |
| Mercado de vendas | Como preço anunciado, tipologia e território influenciam captação e negociação? | Ativo, captação, referência de preço, listagem e proposta. |
| Lotes urbanos | Que atributos de empreendimento e urbanização alteram a venda? | Empreendimento, lote, fase, regra comercial, documento e proposta. |
| Proprietários | Quem afirma deter o direito e quem pode atuar pela parte vendedora? | Parte, organização, papel, relação com ativo, representação e evidência. |
| Compradores/locatários | O que a parte procura e o que precisa ocorrer para a proposta avançar? | Perfil de busca, grupo comprador/ocupante, atividade, proposta e dossiê. |
| Governança | Que dado pode ser coletado, por quem, por quanto tempo e com que estado? | Consentimento/base legal, documento, evidência, permissão, auditoria e retenção. |

## Registro mínimo de cada evidência de pesquisa

| Campo | Descrição | Regra de qualidade |
| --- | --- | --- |
| ID de evidência | Identificador estável da afirmação ou métrica | Não reutilizar para atualização; nova versão aponta para a anterior. |
| Tema e subtópico | Ex.: locação/preço, venda/preço, lote/absorção, LGPD/minimização | Vocabulário controlado. |
| Afirmação resumida | Texto fiel e curto do que pode ser usado no produto | Separar fato, interpretação e hipótese. |
| Valor e unidade | Número, moeda, percentual, volume ou regra normativa | Guardar formato bruto e valor normalizado. |
| Período e geografia | Janela de tempo, município, estado, amostra ou Brasil | Nunca exibir sem recorte. |
| Fonte e metodologia | URL, emissor, tipo de fonte e resumo metodológico | Fonte primária quando houver. |
| Capturado em / atualizado em | Datas de entrada e revisão da evidência | Permite calcular frescor. |
| Limitação e uso permitido | O que o dado não prova e que decisão pode apoiar | Impede promessa comercial indevida. |
| Estado | Vigente, substituída, em revisão, arquivada ou contestada | Fonte nova não apaga histórico. |

## Evidências canônicas já disponíveis

| ID | Achado | Período e recorte | Uso no CRM | Limitação |
| --- | --- | --- | --- | --- |
| LOC-001 | Domicílios alugados passaram de 12,2 mi em 2016 para 18,9 mi em 2025 | Brasil | Justificar a relevância de captação/qualificação de locação e acompanhar demanda territorial | Indicador estrutural; não mede funil ou conversão de uma imobiliária. [1] |
| LOC-002 | Preço pedido de locação cresceu 9,28% em 12 meses até jul/2026 | Amostra FipeZAP | Incluir custo total, território e momento na ficha de busca | Anúncios de novos aluguéis; não equivale a reajustes contratuais. [2] |
| VEN-001 | Preço pedido de venda subiu 5,63% em 12 meses até abr/2026 | 56 cidades da amostra FipeZAP | Contextualizar captação e referência territorial de preço | Não é preço efetivo de fechamento ou avaliação. [3] |
| LOT-001 | Vendas de lotes cresceram 40,9% no 1T/2026 | Recorte pesquisado em Minas Gerais | Priorizar módulo próprio de lote, tabela e condição comercial | Evidência regional; não deve ser generalizada para o país. [4] |
| CAD-001 | Cadastro eficaz deve ser progressivo por etapa e finalidade | Aplicável às jornadas estudadas | Modelar interesse, qualificação, proposta, dossiê e contrato como etapas distintas | Princípio de desenho; requer teste de conversão em cada operação. [5] [6] |
| GOV-001 | LGPD exige finalidade, necessidade, transparência e segurança | Brasil | Configurar campos condicionais, consentimentos/base legal, acessos e retenção | Implantação depende do inventário e da política de cada empresa. [5] [7] |
| LOT-002 | Loteamento/desmembramento e lote possuem particularidades legais e urbanísticas | Brasil, com regras locais complementares | Criar entidade Lote/Empreendimento e checklist específico | Não substitui diligência municipal, registral ou jurídica. [8] |

## Como transformar estudo em produto

| Tipo de evidência | Pode atualizar | Não deve atualizar automaticamente |
| --- | --- | --- |
| Indicador territorial de preço | Painéis de contexto, alertas de revisão de referência, inteligência de captação | Valor de anúncio já contratado, preço de proposta ou avaliação definitiva. |
| Regra legal ou de privacidade | Checklist, texto de orientação, tarefa de revisão e configuração de campo | Conclusão jurídica, aceite automático ou decisão de elegibilidade. |
| Pesquisa de comportamento | Hipóteses de jornada, prioridade de teste e segmentação de pesquisa | Perfil individual inferido ou score de pessoa. |
| Documento de operação | Estado do dossiê, pendência, validade e responsável | Declaração de regularidade sem revisão humana. |

## Cadência de atualização recomendada

| Camada | Exemplo | Cadência inicial | Responsável |
| --- | --- | --- | --- |
| Indicadores de mercado | FipeZAP, dados setoriais de loteamentos | Mensal, no ciclo de publicação da fonte | Inteligência de mercado. |
| Legislação e guias | LGPD, parcelamento do solo, locação e registro | Trimestral e por evento relevante | Jurídico/compliance. |
| Aprendizado operacional | Perdas, pendências, SLA, visita e proposta | Semanal no piloto; mensal após estabilização | Operações e produto. |
| Experimentos de UX | Conversão de formulário, abandono e completude | A cada release significativo | Produto/design. |
| Fontes e metodologias | URL, escopo, validade e licença de uso | A cada ingestão | Curadoria de pesquisa. |

## Referências

[1] [IBGE — Domicílios alugados cresceram mais de 50% desde 2016](https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/46449-domicilios-alugados-cresceram-mais-de-50-desde-2016)

[2] [FipeZAP — Informe de Locação Residencial, julho de 2026](https://imoveis.grupoolx.com.br/uploads/fipezap_202607_residencial_locacao_25996d7baf.pdf)

[3] [FipeZAP — Informe de Venda Residencial, abril de 2026](https://www.datazap.com.br/wp-content/uploads/2026/05/fipezap-202604-residencial-venda-compressed.pdf)

[4] [Sinduscon-MG — Mercado de loteamentos no primeiro trimestre de 2026](https://sinduscon-mg.org.br/alta-nas-vendas-marca-o-1o-trimestre-de-2026do-mercado-de-loteamentos-em-minas-gerais/)

[5] [Planalto — Lei nº 13.709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

[6] [Nielsen Norman Group — Few Guesses, More Success: 4 Principles to Reduce Cognitive Load in Forms](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)

[7] [ANPD — Guia de segurança da informação para agentes de pequeno porte](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte)

[8] [Planalto — Lei nº 6.766/1979 (Parcelamento do Solo Urbano)](https://www.planalto.gov.br/ccivil_03/leis/l6766.htm)
