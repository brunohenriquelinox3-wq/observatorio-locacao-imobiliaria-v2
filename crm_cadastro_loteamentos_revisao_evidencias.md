# Revisão do cadastro de loteamentos — evidências prioritárias

**Estado:** `fontes_primárias_confrontadas`  
**Método:** fonte normativa → leitura de produto → limite preservado → owner de validação.  
**Escopo:** cadastro e gates de loteamento; não substitui análise municipal, ambiental, registral, contratual, contábil ou fiscal do caso concreto.

## 1. Parcelamento, aprovação e comercialização

A Lei nº 6.766/1979 define o parcelamento urbano, diferencia loteamento e desmembramento, admite lote como imóvel autônomo ou unidade imobiliária de condomínio de lotes, e trata loteamento de acesso controlado como modalidade regulada por ato municipal. A mesma lei deixa explícito que Estados, Distrito Federal e Municípios podem estabelecer normas complementares e que a admissão do parcelamento exige a zona definida pelo plano diretor ou aprovada por lei municipal. [1]

> “É vedado vender ou prometer vender parcela de loteamento ou desmembramento não registrado.” — Lei nº 6.766/1979, art. 37. [1]

| Achado | Decisão de produto promovida | Limite preservado | Owner |
| --- | --- | --- | --- |
| Loteamento, desmembramento, condomínio de lotes e acesso controlado não são sinônimos de cadastro. | `development_modality` deve ser declaração versionada; regras, aprovação e estoque dependem de modalidade e praça. | A interface não escolhe o regime jurídico por texto ou aparência comercial. | Jurídico imobiliário + urbanismo. |
| Município/Estado podem complementar requisitos, índices e procedimentos. | `MunicipalityRuleSet` conserva fonte, vigência, escopo, revisor e resultado; o empreendimento referencia a versão analisada. | Não codificar área, frente, faixa, percentual público, prazo ou licença como regra nacional fixa. | Urbanismo/engenharia + jurídico local. |
| Projeto, certidão atualizada de matrícula, tributos e garantia aparecem no percurso legal de aprovação/registro conforme o caso. | Evidências entram como objetos revisáveis (`RegistryEvidence`, `ApprovalCase`, `MunicipalGuarantee`) com emissor, data, escopo e status. | Campo “documentação ok” não comprova atendimento do procedimento. | Jurídico/registro + engenharia. |
| Registro é fronteira comercial legal. | `commercial_eligibility` depende de registro revisado e condições específicas do lote, não apenas de `development.status`. | Não inferir que toda unidade tem matrícula individual a partir de um campo preenchido. | Jurídico/registro + comercial. |

## 2. Matrícula, certidão e prova registral

A Lei nº 6.015/1973 dispõe que os registros públicos servem à autenticidade, segurança e eficácia dos atos jurídicos. Para o registro de imóveis, a lei prevê certidões e identifica que a certidão da situação jurídica atualizada reúne descrição, contribuinte, proprietário, direitos, ônus e restrições incidentes sobre o imóvel e titular; a certidão de inteiro teor da matrícula reproduz o conteúdo do registro e pode comprovar propriedade, direitos, ônus reais e restrições. [2]

| Achado | Decisão de produto promovida | Limite preservado | Owner |
| --- | --- | --- | --- |
| Matrícula e certidão são evidências com tipos e conteúdo distintos. | `RegistryEvidence.kind` distingue referência de matrícula, inteiro teor, situação jurídica atualizada, ato/averbação, registro de loteamento e outros documentos. | Número de matrícula digitado não equivale à certidão atualizada nem à revisão do conteúdo. | Jurídico imobiliário/registro. |
| Prova registral tem emissor e data de emissão. | Toda evidência registra cartório/emissor, data, arquivo/autenticidade, objeto, escopo, resultado de revisão e política de revalidação. | O CRM não decide “propriedade confirmada” para sempre; o responsável determina validade operacional e reconsulta. | Jurídico/registro. |
| Ônus e restrições pertencem à evidência e podem variar no tempo. | `Restriction` referencia evidência, motivo, objeto, vigência, severidade, precedente e liberação aprovada. | Ônus não vira campo de texto sem estado, nem bloqueio eterno sem revisão. | Jurídico + gestor do empreendimento. |

## 3. Quadro-resumo, distrato e reentrada de lote

Para contratos de compra, cessão ou promessa de cessão de loteamento, a Lei nº 13.786/2018 incluiu o quadro-resumo no art. 26-A da Lei nº 6.766/1979, com preço, corretagem/beneficiário, forma de pagamento, índices, consequências do desfazimento, juros, direito de arrependimento quando aplicável, prazo de quitação após termo de vistoria, ônus, referência registral e prazo/termo de obras. A lei também condiciona novo registro em situações previstas à comprovação de restituição conforme a modalidade aplicável. [3]

| Achado | Decisão de produto promovida | Limite preservado | Owner |
| --- | --- | --- | --- |
| Quadro-resumo é parte versionada do instrumento e não uma cópia de campos atuais da tabela. | `LotContract` referencia `ContractSummaryVersion`, preço, parcelas, índice/período, corretagem/beneficiário, ônus, registro, obra e disposições de desfazimento. | O sistema não produz opinião jurídica sobre suficiência; checklist aponta ausência e encaminha ao responsável. | Jurídico contratual + comercial. |
| Distrato/reentrada possui pré-condições e efeitos próprios. | `RescissionCase` mantém contrato, versão, posse, prova, cálculo reproduzível, restituição/compensação, owner e autorização de reentrada. | Não editar `vendido` para `disponível`; não fixar percentuais, prazos ou deduções globais. | Jurídico + financeiro + comercial. |
| Novo registro/venda pode depender de fatos de restituição ou do documento específico. | A reentrada comercial exige evidence checklist contextual; o gate bloqueia nova reserva/contrato até a aprovação da condição aplicável. | Bloqueio não substitui o procedimento registral ou contractual de cada caso. | Jurídico/registro + financeiro. |

## 3.1 Modalidade e partes comuns

O Código Civil prevê que, no condomínio de lotes, podem coexistir partes de propriedade exclusiva e partes comuns, e determina a aplicação cabível das regras de condomínio edilício, com respeito à legislação urbanística, bem como do regime de incorporações nos aspectos civis e registrais. A Lei nº 6.766/1979 também prevê que lote pode ser imóvel autônomo ou unidade integrante de condomínio de lotes e distingue loteamento de acesso controlado como modalidade cuja regulação de acesso depende de ato municipal. [1] [4]

| Decisão de produto promovida | Limite preservado | Owner |
| --- | --- | --- |
| `DevelopmentLegalRegime` registra modalidade declarada, base normativa/documental, ato municipal quando aplicável, partes comuns, infraestrutura e estado de revisão. | O CRM não requalifica o empreendimento por layout, nome comercial ou configuração de portaria. | Jurídico imobiliário + urbanismo/engenharia. |
| Lotes, áreas comuns e restrições de acesso/servidão são objetos/evidências ligados ao empreendimento, não atributos textuais do lote. | Restrições administrativas, direitos reais e regras locais exigem evidência e alcance específicos. | Jurídico/registro + gestão do empreendimento. |

## 4. Titularidade, autorização e empreendimento

O Código Civil prevê no art. 1.647 que, salvo a exceção do regime de separação absoluta e o disposto no art. 1.648, um cônjuge não pode, sem autorização do outro, alienar ou gravar de ônus real bens imóveis. Já o art. 978 prevê exceção para empresário casado quanto a imóveis integrantes do patrimônio da empresa. [4]

| Achado | Decisão de produto promovida | Limite preservado | Owner |
| --- | --- | --- | --- |
| Outorga é condição relacionada ao ato, titularidade e regime, não atributo permanente do ativo. | `AuthorizationRequirement` liga ato proposto, parte, regime declarado, instrumento/evidência, status de revisão e decisão. | Não bloquear toda operação de parte casada, nem presumir exceção/dispensa por cadastro. | Jurídico imobiliário. |
| Empreendedor pode não coincidir simplesmente com o proprietário em todas as hipóteses legais. | `DevelopmentPartyRole` conserva papel, base de atuação, instrumento, anuência/sub-rogação quando aplicável, vigência e revisão. | Origem de terra, participação econômica, representação e poder de implantar não colapsam em `owner_id`. | Jurídico + novos negócios. |

## 5. Conclusões que permanecem bloqueadas

1. **Percentuais fiscais, retenções, base CBS/IBS, IPTU/ITR e tratamento tributário** não entram em regra de produto até validação contextual do contador e do contrato/regime vigente.
2. **Licenciamento ambiental, outorga hídrica, APP, geotecnia, aceitação de obras e garantia municipal** permanecem classes de evidência/revisão; a lista exata e a autoridade variam por Município, Estado, empreendimento e órgão competente.
3. **Matrícula, registro, quadro-resumo e outorga** não autorizam o CRM a praticar ato registral, jurídico ou financeiro; organizam a evidência necessária para que o responsável habilitado decida.

## Referências

[1] [Planalto — Lei nº 6.766/1979, Parcelamento do Solo Urbano](https://www.planalto.gov.br/ccivil_03/leis/l6766.htm)

[2] [Planalto — Lei nº 6.015/1973, Registros Públicos](https://www.planalto.gov.br/ccivil_03/leis/l6015compilada.htm)

[3] [Planalto — Lei nº 13.786/2018, Distrato em loteamento e incorporação](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13786.htm)

[4] [Planalto — Código Civil, Lei nº 10.406/2002](https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm)
