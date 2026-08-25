# Observatório de Vendas Urbanas e Lotes

## Mercado, cadastro de proprietários e cadastro de compradores

**Elaborado por Manus AI · Agosto de 2026**

## Síntese executiva

O mercado de venda residencial urbano segue com valorização de preços anunciados, embora os recortes sejam altamente territoriais. No Índice FipeZAP de Venda Residencial, que acompanha anúncios em 56 cidades, os preços subiram **0,51% em abril de 2026**, **1,53% no acumulado do ano** e **5,63% em 12 meses**, com preço médio de **R$ 9.769/m²** na amostra. [1] Esses são indicadores de anúncio, não preço efetivo de transação, e devem servir como referência contextual para a captação de ativos.

Lotes urbanos requerem uma lente própria. No estudo de loteamentos de Minas Gerais, o recorte pesquisado registrou **2.958 lotes vendidos no primeiro trimestre de 2026**, alta de **40,9%** sobre o mesmo trimestre do ano anterior, enquanto os lançamentos totais recuaram 15,2%. [2] Essa combinação torna indispensável separar o cadastro de lote do cadastro de imóvel construído: empreendimento, fase, quadra, lote, infraestrutura, regras de associação, aprovação e situação registral declarada precisam ter campos próprios.

> **Recomendação central:** estruturar o produto a partir do dossiê de negócio, composto por ativo, proprietário, partes relacionadas, comprador, proposta e evidências. O formulário deve avançar por etapas e jamais tentar “provar” regularidade, crédito ou poderes por resposta automática.

## Leitura de mercado

| Sinal | Evidência | Consequência para o produto |
| --- | ---: | --- |
| Venda residencial na amostra FipeZAP | +5,63% em 12 meses até abril/2026 | Precificação deve combinar referência local e atributos do ativo, sem promessa de valor de fechamento. |
| Preço médio da amostra | R$ 9.769/m² | Cidade, bairro, tipologia e estado do ativo devem entrar antes de qualquer sugestão de preço. |
| Fortaleza, Salvador e Vitória | +13,49%, +12,75% e +12,53% em 12 meses | O mercado não responde a uma lógica nacional única; a ferramenta deve ser territorial. |
| Lotes em MG no 1T/2026 | 2.958 unidades, +40,9% | Lotes têm absorção e ticket próprios, exigindo funil e cadastro específicos. |
| Loteamentos abertos em MG no 1T/2026 | +170,3% em unidades vendidas | O produto precisa captar tipo de loteamento e condições de infraestrutura/uso. |

## Modelo robusto de cadastro de proprietários

O cadastro do lado vendedor deve separar **pessoa ou empresa proprietária**, **partes relacionadas**, **ativo** e **autoridade de venda**. A matrícula é o identificador central para organizar a diligência do imóvel, mas a plataforma deve registrar a evidência e seu status — não declarar que um ativo está regular por mero preenchimento. A Lei de Registros Públicos disciplina o registro de imóveis e a emissão de certidões. [3]

| Camada | Proprietário pessoa física | Proprietário pessoa jurídica |
| --- | --- | --- |
| Interesse | Contato, tipo do ativo, cidade, faixa de valor, prazo e ocupação | CNPJ, empresa, contato, ativo, preço e vínculo declarado com o imóvel. |
| Diagnóstico | Titularidade declarada, coproprietários, estado civil/participantes quando pertinente, matrícula e descrição do ativo | Situação cadastral, QSA como referência, representantes declarados, relação com matrícula e governança. |
| Dossiê | Identidade, estado civil quando aplicável, procuração/inventariança se houver, matrícula/certidão, IPTU e autorização de anúncio | Ato constitutivo, alterações, certidão/registro aplicável, representante, procuração, ata/deliberação quando pertinente. |
| Proposta/fechamento | Partes, preço, condições, prazo, assinatura e trilha de versões | Tabela/alçadas, partes, instrumento, aprovações e assinatura. |

### Campos que não devem estar no formulário inicial de proprietário

CPF, documento de identidade, certidões, procuração, documentos de coproprietários, dados bancários e atos societários não são requisitos de um primeiro contato. Eles devem ser solicitados somente quando o ativo for elegível para captação e existir explicação clara de finalidade. A coleta progressiva reduz abandono e exposição, além de obedecer ao princípio de necessidade da LGPD. [4]

### Dados exclusivos de lote urbano

A Lei nº 6.766/1979 diferencia loteamento e desmembramento, define lote a partir de infraestrutura e permite normas complementares estaduais e municipais. [5] Assim, a ficha de lote deve ter, no mínimo, loteamento, fase, quadra, lote, matrícula/cartório, área, frente/profundidade, topografia declarada, infraestrutura declarada, regras de associação/restrições, preço e estado da documentação a verificar.

## Modelo robusto de cadastro de compradores

O cadastro de comprador deve ser uma jornada de **busca → qualificação → pré-proposta → dossiê → contrato**. Ele serve para entender intenção e reduzir visitas desaderentes, mas não pode funcionar como análise secreta de crédito ou de elegibilidade.

| Camada | Comprador pessoa física | Comprador pessoa jurídica |
| --- | --- | --- |
| Busca | Objetivo, imóvel/lote, territórios, faixa, prazo, contato e visita | CNPJ, objetivo do ativo, localização/área, contato e prazo. |
| Qualificação | Critérios, participantes declarados, recursos próprios/financiamento/FGTS declarados, entrada/parcela por faixa e dependências | Decisor, jurídico, assinante declarado, fonte de recursos declarada e aprovação interna. |
| Pré-proposta | Ativo, oferta, sinal, vigência, condições de crédito/venda de outro ativo e partes | Ativo, preço, condição, comitê/alçada, representantes e validade. |
| Dossiê | Identidade, renda e demais itens solicitados pela operação ou financiador | Atos, poderes, deliberação, documentos financeiros/contratuais solicitados na operação. |

A documentação de crédito não deve se misturar ao formulário de interesse. O checklist da CAIXA indica, para a solicitação formal de crédito imobiliário, identificação e comprovante de renda do comprador PF; para o uso do FGTS, declaração de imposto de renda e carteira de trabalho ou extrato de FGTS; e, para o imóvel, certidão atualizada de inteiro teor da matrícula. [6] Esses itens são referência de uma fase formal e devem ser acompanhados de finalidade, responsável e controles de acesso.

## Estados de evidência e governança

| Elemento | Estados recomendados | Risco que evita |
| --- | --- | --- |
| Titularidade | Declarada, documento recebido, em revisão, divergência apontada, confirmada pelo responsável | Anunciar imóvel sem saber quem precisa participar da venda. |
| Representação PJ | Contato comercial, representante declarado, ato recebido, poder em revisão, aprovado pelo responsável | Confundir contato ou QSA com poder automático para alienar/comprar. |
| Matrícula/certidão | Não solicitada, solicitada, recebida, fora do prazo, em revisão, pendência registrada | Tratar campo de matrícula como comprovação documental. |
| Comprador | Interesse, qualificado, ativo selecionado, pré-proposta, dossiê, contrato, perdido/adiado | Perder contexto ou solicitar documentação sem finalidade. |
| Crédito | Forma declarada, pré-aprovação declarada, análise externa, condição não atendida | Prometer financiamento ou aplicar score opaco. |

## Controles indispensáveis

A Lei Geral de Proteção de Dados exige finalidade, adequação, necessidade, transparência, segurança e prestação de contas. [4] O desenho do sistema deve conter cofre documental, acesso por função, logs de upload e visualização, data/fonte/validade de cada evidência, histórico de proposta e política de retenção/descarte. A ferramenta organiza o processo; avaliação jurídica, registral, fiscal, societária e de crédito deve seguir os responsáveis habilitados em cada operação.

| Controle | Implementação prática |
| --- | --- |
| Mínimo necessário | Formulário por faixas e campos condicionais; arquivos somente após ativo/proposta/finalidade. |
| Finalidade visível | Explicar antes de pedir identidade, renda, CNPJ, documento societário ou certidão. |
| Acesso mínimo | Corretor acessa busca e proposta; equipe documental acessa arquivos necessários; gestor controla alçada. |
| Trilha de auditoria | Registrar upload, download, mudança de preço, estado de evidência, aceite e versão de proposta. |
| Sem automação enganosa | Priorizar atendimento por dados declarados, mas não aprovar/reprovar pessoas automaticamente. |

## Estratégia de implantação e venda

O melhor ponto de entrada é um diagnóstico de qualidade de dossiê. Em vez de apresentar dezenas de recursos, a demonstração deve usar cinco ativos e cinco compradores do cliente para localizar: captações sem parte definida, lotes sem informação essencial, documentos que reaparecem, ofertas sem condição clara e propostas que não avançam.

| Fase | Janela | Entrega verificável |
| --- | ---: | --- |
| Diagnóstico | 2 semanas | Fluxo real de captação, comprador e proposta; lista de campos e pendências prioritárias. |
| Configuração | 2 semanas | Formulários curtos, checklists por tipo de ativo e estados de evidência configurados. |
| Piloto | 60 dias | Uso em carteira real; linha de base de pendências, visita, proposta e retrabalho. |
| Expansão | Trimestre seguinte | Pacote “Vendas” ou “Vendas + Lotes”, alçadas, integrações e onboarding repetível. |

## Conclusão

Uma solução robusta para vendas urbanas não deve ser apresentada como “mais um formulário”. Ela deve registrar quatro verdades operacionais em separado: **o ativo**, **quem afirma poder vender**, **quem quer comprar** e **quais condições sustentam uma proposta**. Essa separação protege a operação, melhora o atendimento e cria um caminho viável para transformar captação, venda de lote e fechamento em processos auditáveis.

## Referências

[1] [FipeZAP — Informe de Venda Residencial, abril de 2026](https://www.datazap.com.br/wp-content/uploads/2026/05/fipezap-202604-residencial-venda-compressed.pdf)

[2] [Sinduscon-MG — Alta nas vendas marca o 1º trimestre de 2026 do mercado de loteamentos em Minas Gerais](https://sinduscon-mg.org.br/alta-nas-vendas-marca-o-1o-trimestre-de-2026do-mercado-de-loteamentos-em-minas-gerais/)

[3] [Câmara dos Deputados — Lei nº 6.015/1973 (Registros Públicos)](https://www2.camara.leg.br/legin/fed/lei/1970-1979/lei-6015-31-dezembro-1973-357511-publicacaooriginal-1-pl.html)

[4] [Planalto — Lei nº 13.709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

[5] [Planalto — Lei nº 6.766/1979 (Parcelamento do Solo Urbano)](https://www.planalto.gov.br/ccivil_03/leis/l6766.htm)

[6] [CAIXA — Documentação básica para solicitação de crédito imobiliário](https://www.caixa.gov.br/Downloads/habitacao-documentos-gerais/Docbas-solicit-Cred-Imob.pdf)
