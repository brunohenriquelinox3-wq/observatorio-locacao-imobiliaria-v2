# Validação de compliance e cadastro

## Achados externos aplicáveis ao futuro CRM

### PLD/FT: cadastro e casos restritos, não checklist comercial público

A Lei nº 9.613/1998 inclui, entre as pessoas sujeitas aos mecanismos de controle, pessoas físicas e jurídicas que exerçam atividades de promoção imobiliária ou compra e venda de imóveis. Ela exige identificação e cadastro atualizado de clientes, prevê que a identificação de pessoa jurídica abranja representantes autorizados e proprietários, e estabelece conservação mínima de cadastros e registros por cinco anos, sem prejuízo de prazo maior fixado por autoridade competente. [1]

O Siscoaf é o ambiente de uso das pessoas obrigadas para enviar comunicações e atender requisições do Coaf; a página oficial informa que o sistema permite integração com outros aplicativos. [2] Essa possibilidade não autoriza uma integração automática do CRM: qualquer conector futuro deve passar por definição de escopo, habilitação válida, controle de acesso, responsável de compliance, trilha de auditoria e política de escalonamento.

| Decisão de produto | Motivo | Limite obrigatório |
| --- | --- | --- |
| Criar `ComplianceCase` com acesso por necessidade | Alertas, análise e eventual comunicação não pertencem à visão geral de vendas | Não exibir rótulo de suspeita, origem de recursos ou PEP em listas comerciais. |
| Registrar `ComplianceObligation` por versão de política | A obrigação depende de papel, atividade, regulador e período | CRM não deve concluir que toda operação é suspeita, comunicável ou não comunicável. |
| Relacionar pessoa jurídica a representante e controlador declarados | A lei prevê identificação de representantes autorizados e proprietários | Relação declarada não substitui validação societária/jurídica. |
| Criar agenda anual de obrigações e evidências | A rotina precisa ser rastreável | Datas, limites e texto de comunicação ficam configuráveis e revisados pelo responsável. |
| Preservar logs e política de retenção | A lei exige manutenção de cadastro/registro em patamar mínimo | Política de retenção deve ser configurável por obrigação e não uma exclusão automática genérica. |

### LGPD: finalidade antes de consentimento

A LGPD exige finalidade, adequação, necessidade, transparência, segurança, prevenção, não discriminação e prestação de contas. O art. 7º prevê diferentes hipóteses legais, incluindo consentimento, obrigação legal/regulatória, execução de contrato ou procedimentos preliminares a pedido do titular, legítimo interesse e proteção do crédito. [3] O guia da ANPD sobre legítimo interesse reforça que essa é uma hipótese legal específica, que demanda análise e não deve ser tratada como permissão genérica. [4]

| Situação de CRM | Registro exigido no produto | Erro a evitar |
| --- | --- | --- |
| Interesse inicial | Finalidade de contato, canal, fonte e aviso de privacidade | Exigir documento/renda/estado civil antes de necessidade concreta. |
| Proposta e contrato | Finalidade contratual, campos necessários, compartilhamentos e retenção aplicável | Marcar “consentimento” quando a base real é execução de contrato. |
| Crédito e política de risco | Finalidade, política aplicada, dados mínimos, responsável e validade | Reprovar automaticamente ou esconder a lógica de uma decisão que afeta a pessoa. |
| Obrigação de compliance | Obrigação, fonte, caso de uso, acesso e retenção | Misturar registros de compliance com funil de marketing. |
| Marketing/relacionamento opcional | Consentimento específico quando necessário, preferências e revogação | Usar dado de contrato para novas finalidades incompatíveis sem transparência. |

### Estado civil e assinatura: avaliação, não automatismo

O Código Civil disciplina atos para os quais a autorização do outro cônjuge pode ser relevante, e a aplicação depende do ato, regime de bens, exceções legais, documentos e circunstâncias do caso. [5] Consequentemente, o CRM precisa registrar estado civil e regime **quando a finalidade requerer qualificação/assinatura**, relacionar as partes e abrir uma avaliação de necessidade de assinatura/outorga. Ele não deve declarar por conta própria que uma assinatura é juridicamente suficiente, dispensada ou obrigatória.

| Objeto | Registros de dados | Saída segura |
| --- | --- | --- |
| `MaritalStatusDeclaration` | Estado declarado, regime declarado, fonte, data e versão | Dado de qualificação, não conclusão jurídica. |
| `SignatoryGroup` | Parte principal, cônjuge/coproprietário/procurador, papel e instrumento | Grupo de assinatura que pode receber checklist. |
| `AuthorityOrConsentAssessment` | Ato, necessidade em análise/confirmada/dispensada, fundamento, evidência e revisor | Gate de instrumento com dono humano. |
| `RepresentationEvidence` | Procuração/ato, vigência, escopo, documento e revisão | Estado documental auditável. |

## Conclusão de validação

O estudo fornecido está correto ao elevar cadastro, relacionamento e compliance a elementos estruturais do CRM. A melhoria necessária é substituir campos absolutos por objetos de **finalidade, política, evidência, responsável e validade**. Isso reduz tanto o risco de coleta excessiva quanto o risco de uma plataforma prometer decisão jurídica, regulatória ou de crédito que precisa permanecer com responsáveis habilitados.

## Referências

[1] [Planalto — Lei nº 9.613/1998 (texto compilado)](https://www.planalto.gov.br/ccivil_03/leis/l9613compilado.htm)

[2] [COAF — Siscoaf](https://www.gov.br/coaf/pt-br/sistemas/siscoaf/siscoaf-info_nova)

[3] [Planalto — Lei nº 13.709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

[4] [ANPD — Guia orientativo sobre legítimo interesse](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_hipoteses_legais_tratamento_de_dados_pessoais_legitimo_interesse)

[5] [Planalto — Código Civil, Lei nº 10.406/2002](https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm)
