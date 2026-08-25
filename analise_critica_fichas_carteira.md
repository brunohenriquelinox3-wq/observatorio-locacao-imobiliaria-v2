# Análise crítica — fichas cadastrais e carteira de clientes

## Integração do estudo BHL ao CRM imobiliário

O estudo recebido traz uma contribuição decisiva: cadastro não é tela de captura, mas infraestrutura de contrato, carteira, cobrança, distribuição e conformidade. A arquitetura anterior já separava `Party`, `PartyRole`, `Asset`, `Proposal` e `Evidence`; esta revisão aprofunda o conceito, adicionando **qualificação contratual**, **representação**, **grupo familiar/de assinatura**, **situação de verificação**, **perfil de risco por finalidade** e **saúde de relacionamento/carteira**.

> O material fornecido deve entrar como `partner_provided_domain_reference`. Ele orienta desenho e perguntas de validação; afirmações jurídicas, de PLD/FT, crédito e tributação precisam de fonte externa e de revisão especializada antes de virarem regra imutável do sistema.

## Requisitos absorvidos

| Área do estudo | Contribuição preservada | Decisão de produto |
| --- | --- | --- |
| Ficha como base do negócio | Um dado ausente no momento errado trava contrato, cobrança e relacionamento | Cadastro progressivo por finalidade, com checklist e gate de instrumento. |
| PF e PJ | Representação, poderes, cônjuge/parte relacionada e beneficiário final não podem ficar em texto livre | `Party` recebe relações estruturadas, e não apenas campos de formulário. |
| Papéis distintos | Crédito, titularidade, outorga e governança mudam conforme o papel | `PartyRole` recebe perfil de dossiê, revisão, risco e validade próprios. |
| Permutante e sócio | Terra/contrapartida e capital/participação são relações diferentes | Domínios `PartnerParticipation`, `LandContribution`, `DistributionRule` e `CapitalContribution`. |
| Carteira | Relação e recebível têm ciclos distintos | `RelationshipPortfolio` e `ReceivablesPortfolio` coexistem e compartilham eventos. |
| Atualização contínua | Vínculos longos ficam obsoletos sem ritual de atualização | `RecertificationCase` por tipo de vínculo, política e vencimento. |
| Compliance | Dados, origem e alertas precisam de trilha | Caso de compliance restrito, nunca uma etiqueta pública no perfil comercial. |

## Pontos que exigem correção antes de virar regra do CRM

| Afirmação ou padrão do estudo | Risco de implementação literal | Tratamento recomendado |
| --- | --- | --- |
| “Consentimento LGPD” como campo comum a todos | Consentimento não é a base padrão para toda coleta contratual; registrar apenas aceite pode ocultar a finalidade e a hipótese corretas | Criar `ProcessingPurpose` e `LegalBasisRecord`; manter consentimento como um tipo possível, não como checkbox universal. |
| “Renda ≥ 3× aluguel” | É prática/política de mercado, não requisito legal universal, e pode ignorar custo total, composição familiar e garantia | Modelar política versionada por operação, mostrando razão renda/despesa declarada e revisão humana. |
| Outorga obrigatória para todo cadastro de casado | Exceções, regime de bens, natureza do ato e análise jurídica do caso impedem automação conclusiva | Criar `SpousalConsentAssessment`: necessário/dispensado/em análise, motivo, evidência, responsável e validade. |
| Fluxo único “incompleto → completo → aprovado → ativo” | Mistura dados, documento, crédito, compliance e relação comercial em um rótulo único | Usar estados ortogonais: completude, evidência, risco, elegibilidade de contrato e relação. |
| PEP/KYC/origem de recursos expostos na ficha comercial | Pode ampliar acesso indevido e induzir tratamento incompatível com a finalidade | Separar `ComplianceCase` com acesso mínimo, origem, decisão e log; exibir ao comercial somente próximos passos autorizados. |
| “Consulta a restritivos” por padrão | É atividade de alto impacto e requer finalidade, política, transparência e responsável | Configurar como ação de política, com base, registro de consulta e nenhuma reprovação automática opaca. |
| PDD e securitização como cálculos nativos | São temas contábeis/financeiros especializados e dependem de fonte de verdade e regra aprovada | CRM preserva originador, contrato, parcela, comprovante e estado; integra ao sistema contábil/financeiro por adaptadores auditáveis. |
| Prazo de guarda fixo no formulário | Prazos dependem de obrigação, contrato, perfil e política; regra fixa pode reter demais ou apagar cedo | `RetentionSchedule` por finalidade/categoria, dono da política, gatilho e prova de descarte. |

## Matriz de cadastro por finalidade

| Finalidade | Dados de entrada mínimos | O que abre a próxima camada | Gate de saída |
| --- | --- | --- | --- |
| Interesse / relacionamento | Nome ou razão, canal, contato, objetivo e território | Interesse concreto, visita ou qualificação solicitada | Próxima ação e finalidade informadas. |
| Qualificação comercial | Critérios, prazo, grupo de decisão, faixa e forma declarada | Ativo/proposta em análise | Aderência e responsável comercial definidos. |
| Proposta / reserva | Partes necessárias, ativo, condição, vigência, alçada e versão | Aceite/contraproposta ou condição suspensiva | Proposta versionada e evidência de aceite. |
| Qualificação contratual | Dados que o instrumento exige, representação e relacionamentos relevantes | Minuta/assinatura | Checklist contratual revisado pelo responsável. |
| Crédito / risco | Dados financeiros proporcionais, fonte e autorização/política aplicável | Política exige análise | Decisão humana explicável, validade e condições registradas. |
| Compliance | Dados e evidências necessários a política/obrigação aplicável | Sinal de risco ou papel sensível | Caso restrito encerrado/escalonado conforme processo. |
| Carteira longa | Contrato, eventos, contato de cobrança, atualização e estado de vínculo | Vencimento de recertificação, atraso ou evento contratual | Próxima ação e dado crítico dentro da validade. |

## PF, PJ e relações estruturadas

| Objeto | O que evita | Campos/relacionamentos essenciais |
| --- | --- | --- |
| `NaturalPersonProfile` | Replicar dados de uma pessoa em cada papel | Identificação, contato, qualificação contratual, documento como evidência e estado de verificação. |
| `LegalEntityProfile` | Tratar empresa como um “cliente” sem poderes ou controle | CNPJ, denominação, sede, ato constitutivo, situação, representantes e relacionamentos de controle declarados. |
| `AuthorityRelationship` | Confundir contato comercial, QSA e poder de assinatura | Parte, entidade, instrumento, tipo de poder, início/fim, prova e revisão. |
| `HouseholdOrSignatoryGroup` | Esquecer cônjuge, coproprietário, fiador ou grupo comprador | Grupo, integrantes, papel, exigência contratual e estado de assinatura. |
| `BeneficialOwnershipDeclaration` | Converter beneficiário final em campo sem origem | Declaração, fonte, data, cadeia informada, revisão e responsável. |
| `SpousalConsentAssessment` | Bloquear ou liberar por estado civil sozinho | Parte, ato, regime declarado, necessidade, razão, documento e revisor. |

## Carteira: duas lentes que não podem ser confundidas

| Lente | Pergunta | Indicadores possíveis | Limite do CRM |
| --- | --- | --- | --- |
| Relacionamento | Quem pode receber uma próxima ação de valor? | Recência de interação, estágio, preferência, renovação, indicação e oportunidade | Não deve virar perfilamento oculto ou disparo indiscriminado. |
| Recebíveis | Quais obrigações futuras existem e qual seu estado operacional? | Saldo contratual, parcela, aging, acordo, distrato, concentração e safra | Não substitui contabilidade, provisão ou plataforma de cobrança. |
| Documental | Que relação tem pendência e qual seu impacto? | Vencimento de documento, checklist por finalidade, pendência crítica e tempo de revisão | Não declara validade jurídica apenas pela existência de upload. |
| Risco operacional | Onde existe próxima revisão ou escalonamento? | Caso de compliance, regra de contrato, recertificação e alçada | Não deve gerar classificação automática de pessoas sem política explicável. |

## Perguntas que o CRM deve guardar, não tentar responder sozinho

1. **Quem declarou este dado, quando, com qual documento e para qual finalidade?**
2. **Quem revisou a evidência e em qual estado ela se encontra?**
3. **Qual política e versão sustentam a próxima ação ou gate?**
4. **Quem pode acessar a informação e por quanto tempo ela deve existir?**
5. **A relação é comercial, contratual, financeira, societária, familiar/de assinatura ou de compliance?**

Essas perguntas transformam fichas estáticas em cadastro governado. O desenho evita tanto o cadastro raso — que impede contrato e carteira — quanto a coleta excessiva — que eleva risco, reduz conversão e conflita com a minimização de dados.
