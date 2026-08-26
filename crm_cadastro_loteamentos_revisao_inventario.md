# Revisão do cadastro de loteamentos — inventário inicial

**Estado:** `hipóteses_em_auditoria`  
**Entrada principal:** *Curso — Cadastro de Loteamentos e Imóveis no Sistema Manu*, material de formação recebido do usuário.  
**Princípio de leitura:** o estudo informa hipótese de produto. Documento registral, contrato, regra municipal, profissional habilitado e fonte normativa decidem o caso concreto.

## 1. Mapa de objeto que será revisado

| Camada | Objeto | Identidade mínima | O que não pode ser confundido |
| --- | --- | --- | --- |
| Terra | `LandParcel` / gleba | referência geográfica, matrícula/referência, município, cadeia declarada e evidências | Gleba não é empreendimento nem lote vendável. |
| Desenvolvimento | `Development` / empreendimento | modalidade declarada, geometrias/glebas, município, fases, trilhas de aprovação e responsável | Situação de projeto, registro, obra e comercial são dimensões próprias. |
| Inventário | fase, quadra, lote | localização interna, atributos físicos, área, referência registral e alocação | Identificador comercial não substitui matrícula, alocação ou disponibilidade. |
| Evidência | registro, licença, garantia, memorial, contrato, certidão | emissor, origem, data, escopo, arquivo/hash, revisão e validade operacional | Anexo não equivale a aprovação revisada. |
| Participação | aquisição, permuta, SPE/SCP, parceiro | parte, instrumento, objeto/fração, vigência, base, condição e alçada | Origem de terra, direito econômico e poder de venda não são o mesmo vínculo. |
| Operação comercial | tabela, hold, reserva, proposta, contrato | versão, canal, vigência, alçada, titular e expiração | Reserva não é venda; contrato não é quitação; carteira não é disponibilidade. |
| Carteira | plano, parcela, acordo, distrato, reentrada | contrato, versão, competência, evidência, estado e dono | Evento financeiro não altera o histórico de estoque sem transição de caso. |

## 2. Cobertura já presente na estratégia canônica

| Cobertura existente | Decisão já consolidada | Risco que já reduz |
| --- | --- | --- |
| Hierarquia de empreendimento, fase, quadra e lote | Loteadora é domínio especializado, não extensão de anúncio. | Duplicidade entre ativo territorial, anúncio e contrato. |
| Estados ortogonais | Viabilidade, regulação/registro, obra, comercial, alocação, disponibilidade, registro e carteira coexistem. | Status único que esconde restrição ou permite venda indevida. |
| Gates de integridade | Registro, estoque, tabela, contrato, pagamento e distrato têm owner e prova de liberação. | Liberação informal ou reentrada prematura de lote. |
| Parceiro/permutante | Participação, alocação e regra de distribuição são entidades próprias. | Vender lote alocado ou pagar pela base errada. |
| Evidência e revisão | Documento conserva fonte, finalidade, validade e revisor. | Tratar campo preenchido como análise jurídica ou técnica. |

## 3. Alegações do material recebido que exigem confronto

| Código | Hipótese recebida | Decisão candidata de produto | Pergunta de auditoria | Risco de promoção sem prova |
| --- | --- | --- | --- | --- |
| LOT-CAD-01 | A matrícula é “fonte da verdade” de qualquer ativo. | Matriz de evidência registral, com estado de revisão e data de emissão. | Qual documento/ato confirma cada afirmação e por quanto tempo é operacionalmente confiável? | Cadastro declara propriedade ou ônus desatualizados. |
| LOT-CAD-02 | Registro do loteamento é o marco de autorização para vender. | Gate comercial por situação registral revisada e escopo do lote. | Quais atos/documentos, aprovações e exceções precisam compor o gate? | Comercializar estoque antes do marco legal aplicável. |
| LOT-CAD-03 | Empreendimento tem uma fase linear de viabilidade a encerrado. | Trilhas paralelas de viabilidade, aprovação, registro, infraestrutura e comercial. | Que dimensões são independentes e que precedências bloqueiam venda? | Obra/venda/registro se ocultam em uma única etiqueta. |
| LOT-CAD-04 | `caucionado` e `permutante` são estados do lote. | Alocação/restrição com motivo, instrumento, vigência e liberação. | São estados universais ou razões de indisponibilidade configuráveis? | Lote reservado/garantido parece disponível ou é liberado sem evidência. |
| LOT-CAD-05 | Origem é própria, permuta ou sócio. | Participações múltiplas e datadas, ligadas a objeto, instrumento e entitlement. | Como compor múltiplas glebas, frações, lotes físicos, VGV, fluxo e resultado sem colapsar bases? | Direito econômico e propriedade misturados. |
| LOT-CAD-06 | Município define parâmetros urbanísticos. | `MunicipalityRuleSet` versionado, com fonte e owner local. | Que parte é dado operativo e que parte exige consulta técnica/municipal? | Sistema apresenta regra municipal desatualizada como verdade. |
| LOT-CAD-07 | Licenças, APP, outorga e cronograma entram no cadastro. | Casos/evidências com status de revisão e gatilhos, não booleans genéricos. | Quais documentos são habilitadores e quais apenas informativos por modalidade/local? | Falsa conformidade ambiental ou de infraestrutura. |
| LOT-CAD-08 | Distrato devolve lote ao estoque mediante regra. | `RescissionCase` e reentrada condicionada por contrato, restituição, restrição e liberação. | Qual fato impede retorno comercial e qual owner confirma a reentrada? | Revenda concorrente ou sem restituição/condição cumprida. |

## 4. Lacunas de modelagem detectadas antes do confronto

| Lacuna | Ajuste candidato | Dono de validação |
| --- | --- | --- |
| Matrícula como texto único | Evidência registral com emissor, data, ato, escopo, revisão e ligação ao objeto. | Jurídico imobiliário/registro. |
| Estado linear de empreendimento | Máquina de estados por trilha, com precedência explícita e logs de transição. | Operação de loteadora + engenharia + jurídico. |
| Origem simplificada em enum | Participação/origem como vínculo plural, temporal e documentado; base econômica tipada. | Jurídico + controladoria. |
| Reserva, caução e permuta em status único | Alocação, restrição, disponibilidade e carteira separadas. | Comercial + gestor do empreendimento. |
| Regras municipais em JSON genérico | Catálogo de parâmetros por município, fonte, vigência, revisão, escopo e responsável. | Urbanismo/engenharia. |
| “Documentação ok” em boolean | Checklist de evidências por finalidade, com resultado da revisão e bloqueio específico. | Jurídico/registro + operação. |

## 5. Invariantes candidatos a teste futuro

| Invariante | Consequência operacional esperada |
| --- | --- |
| Um lote não fica disponível se qualquer restrição impeditiva vigente prevalecer. | Interface, API e comando recusam reserva/venda até baixa/revisão autorizada. |
| Uma transição comercial exige tabela, alçada, evidência e versão compatíveis com a data do ato. | Não há preço ou condição “atual” aplicado retroativamente ao contrato. |
| Uma participação somente gera entitlement na base, vigência e condição previstas no instrumento versionado. | VGV, fluxo, lote físico e resultado não compartilham fórmula implícita. |
| Reentrada após distrato é caso explícito, não edição de `vendido` para `disponível`. | A operação conserva contrato, restituição, condições e aprovação do retorno. |
| Nenhuma revisão registral substitui evidência de outro domínio. | Registro, ambiental, engenharia, financeiro e comercial exibem seus próprios owners/gates. |

## 6. Próximo confronto

O ciclo seguinte verificará `LOT-CAD-01` a `LOT-CAD-08` com fontes prioritárias para parcelamento do solo, registros públicos, condomínio de lotes, incorporação quando aplicável, distrato e orientações públicas correlatas. A revisão não criará regra municipal, tributária, ambiental ou contratual universal.
