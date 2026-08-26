# Consolidação — revisão aprofundada do cadastro de loteamentos

**Estado:** `decisões_estratégicas_prontas_para_integração_documental`  
**Escopo:** cadastro, evidência, estado, restrição, origem, contrato e reentrada de loteamentos.  
**Fora de escopo desta decisão:** migrations, RPCs, mudança de RLS, bootstrap, instrução de pagamento, integração de parceiro e publicação.

## Decisões promovidas

| Código | Decisão | Evidência de suporte | Owner de validação | Limitação explícita | Impacto no produto |
| --- | --- | --- | --- | --- | --- |
| LOT-REG-01 | Substituir “matrícula como fonte única” por dossiê registral versionado. | Lei nº 6.015/1973, evidência de inventário e revisão. [1] | Jurídico imobiliário/registro. | CRM não certifica propriedade, ônus ou suficiência jurídica. | `RegistryEvidence` com tipo, emissor, data, escopo, revisão, arquivo/hash e política de revalidação. |
| LOT-REG-02 | Tornar a elegibilidade comercial uma projeção de gates. | Lei nº 6.766/1979: registro e regras locais; modelo revisado. [1] | Jurídico/registro + comercial. | Não há boolean universal de “apto a vender”. | Política versionada combina registro aplicável, alocação, restrições, compromisso, tabela e alçada. |
| LOT-REG-03 | Separar trilhas de estado do desenvolvimento e do lote. | Lei nº 6.766/1979 + domínio de loteadora. [1] | Operação de loteadora + engenharia + jurídico. | Estados não substituem decisão humana ou prova. | Estados ortogonais para aquisição, aprovação, registro, obra, alocação, restrição, disponibilidade, compromisso e carteira. |
| LOT-REG-04 | Modelar origem, participação e poder de implantar como relações distintas e temporais. | Lei nº 6.766/1979, art. 2º-A; Código Civil; modelo revisado. [1] | Jurídico + novos negócios + controladoria. | Parte, proprietário, empreendedor, representante e beneficiário podem divergir. | `DevelopmentPartyRole` e `AssetOriginInterest` preservam instrumento, objeto, fração, vigência, condição e base tipada. |
| LOT-REG-05 | Tratar permuta, garantia e ônus como alocação/restrição, não status livre. | Lei nº 6.015/1973 e evidências de loteamento. [1] | Jurídico + gestão de empreendimento + comercial. | O motivo, a vigência e a liberação variam por instrumento e praça. | `Restriction` e `LotAllocation` têm motivo, evidência, escopo, precedência, owner e evento de baixa. |
| LOT-REG-06 | Versionar quadro-resumo e elevar distrato/reentrada a caso. | Lei nº 13.786/2018. [1] | Jurídico contratual + financeiro + comercial. | Não automatizar retenção, prazo, restituição, compensação ou novo registro. | `ContractSummaryVersion` e `RescissionCase` guardam contrato, cálculo reproduzível, prova, restituição/compensação e checklist de reentrada. |
| LOT-REG-07 | Configurar regra municipal com fonte, vigência e owner. | Lei nº 6.766/1979 prevê normas complementares de Estados/DF/Municípios. [1] | Urbanismo/engenharia + jurídico local. | Parâmetro municipal não pode ser inferido de outro Município ou de material didático. | `MunicipalityRuleSet` permite registrar fontes e resultado da análise, mas não vira motor universal de aprovação. |
| LOT-REG-08 | Outorga e autorização são requisitos de ato, não atributo automático de pessoa casada. | Código Civil, arts. 1.647 e 978. [1] | Jurídico imobiliário. | Há exceções e dependência de regime, papel, ato e patrimônio. | `AuthorizationRequirement` liga ato, parte, instrumento, status de revisão e decisão. |

## Requisitos de aceite que especializam itens existentes

| Backlog existente | Critério de aceite especializado pela revisão | Cenário de recusa obrigatório |
| --- | --- | --- |
| `COMP-05` — Dominar loteadora | O lote exibe referência/registro, alocação, restrição, disponibilidade, compromisso e carteira separadamente; cada bloqueio informa fonte, data, owner e liberação. | Usuário tenta disponibilizar lote de parceiro, garantia ou registro pendente apenas alterando status comercial. |
| `COMP-06` — Cadeia de recebimento | A origem/participação tem tipo de base (`valor contratado`, `fluxo conciliado`, `lote físico`, `resultado verificado`), instrumento e vigência; só então pode criar direito econômico. | Usuário cria percentual genérico sem base, objeto, condição ou documento. |
| `FIN-01` — Direito, execução e liquidação | Alocação física e entitlement monetário nunca são o mesmo objeto; reentrada/distrato gera fato/caso compensatório. | Usuário tenta converter lote físico em payable automático ou editar fato histórico. |
| `FIN-03` — Parcialidade e exceção | Restrição de lote e caso de distrato mantém o estado aberto, owner e próxima ação, sem declarar disponibilidade. | Usuário confirma retorno de estoque antes de checklist/restituição aplicável. |
| `CUR-02` — Regra datada | Tabela, quadro-resumo, índice, condição de venda e elegibilidade apontam versão/termo vigente. | Usuário aplica tabela ou condição atual a contrato anterior sem aditivo/fato novo. |

## Conflitos preservados e não promovidos

| Afirmação recebida | Decisão de auditoria |
| --- | --- |
| “Todo lote terá matrícula própria.” | Rebaixada para hipótese verificável por evidência/etapa. O cadastro conserva referência registral e seu estado sem presumir individualização. |
| “Matrícula é a fonte da verdade.” | Refinada: matrícula/certidão é âncora de evidência registral; sua data, conteúdo, emissão e revisão são necessários para uma decisão operacional. |
| “Espólio é bloqueio duro em qualquer caso.” | Refinada: é risco/condição jurídica crítica que deve abrir caso e gate conforme ato, título e parecer, sem regra universal de UI. |
| “Permutante e caucionado são estados do lote.” | Substituída por alocação/restrição com instrumento, vigência, escopo e baixa autorizada. |
| “Distrato tem percentual e prazo fixos.” | Não promovida: contrato, modalidade, lei aplicável, posse, garantia e decisão jurídica definem o caso; o produto preserva as versões e a memória. |
| “Origem da terra determina automaticamente distribuição e tributação.” | Refinada: origem alimenta regras candidatas; entitlement e projeção fiscal só existem com instrumento, base, condição, contrato e responsáveis. |

## Checklist de promoção futura para implementação

| Superfície futura | Prova necessária antes de implementar |
| --- | --- |
| Schema Supabase | Diagrama, invariantes, migration expandir–migrar–reconciliar, RLS permitir/negar e plano de rollback/compensação. |
| Reserva/contrato | Concorrência de duas sessões, tabela/alçada, restrição ativa, expiração e audit event. |
| Registro/evidência | Policy de objeto privado, vínculo por finalidade, revisão temporal e não enumeração de documento. |
| Distrato/reentrada | Casos de restituição/compensação, bloqueio de nova venda, autorização de reentrada e trilha de fatos. |
| Origem/distribuição | Base tipada, instrumento, vigência, limites, rateio, idempotência e testes de não misturar lote físico com pagamento. |

> **Decisão de segurança:** esta revisão reforça a estratégia do CRM, mas não autoriza a criação de dados reais, bootstrap privilegiado, comando administrativo, mutation financeira ou publicação. Uma etapa executável só começa após apresentação e aprovação explícita do usuário.

## Referências

[1] [Evidências prioritárias da revisão de cadastro de loteamentos](crm_cadastro_loteamentos_revisao_evidencias.md)

[2] [Modelo revisado de estados, restrições, origem e elegibilidade](crm_cadastro_loteamentos_modelo_revisado.md)
