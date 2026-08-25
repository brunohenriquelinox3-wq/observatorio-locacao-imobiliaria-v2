# SET-ACC-01 — setores, alçadas e acesso contextual

**Captura:** 25 de agosto de 2026.  
**Estado:** `pronto_para_piloto` — modelo conceitual sustentado; taxonomia de cargos e alçadas deve ser validada por cada imobiliária, loteadora e SPE.

## 1. Leitura das fontes

| Fonte | Evidência | Aplicação no CRM |
| --- | --- | --- |
| NIST ABAC | ABAC media decisões de acesso por atributos de sujeito, objeto, ação e ambiente, correlacionados por política. | Combinar papel-base com organização, SPE, empreendimento, contrato, fase, dossiê, vigência, alçada, finalidade, hora e estado de risco. [1] [2] |
| NIST ABAC | A flexibilidade de atributos permite alterar decisões quando o contexto muda, sem editar cada relação usuário–objeto. | Um corretor muda de praça, um contador perde o período de fechamento ou uma procuração expira: o acesso muda por política e vigência, não por ajuste manual disperso. [2] |
| CISA Zero Trust Maturity Model | Zero trust busca decisões de menor privilégio por requisição e controles granulares entre pessoas, sistemas, dados e ativos mutáveis. | “Estar logado” ou “ser sócio” não basta; exportar carteira, aprovar split e acessar dossiê exigem contexto, ação, estado e evidência. [3] |

## 2. Modelo de decisão recomendado

O `OperationalRoleAssignment` existente continua sendo a base para navegação e linguagem de trabalho. O `AccessGrant` continua sendo a concessão auditável. A evolução é adicionar uma camada de **política contextual**, nunca substituir a revisão humana por regra opaca.

```text
permitir = papel_base
  ∧ escopo_da_organização
  ∧ escopo_do_objeto
  ∧ vigência_do_vínculo_e_poder
  ∧ alçada_da_ação
  ∧ finalidade_autorizada
  ∧ condição_de_risco
  ∧ política_de_dados
```

| Classe de atributo | Exemplos no CRM | Fonte de verdade |
| --- | --- | --- |
| Sujeito | pessoa, papel, certificação/revisão, unidade, vigência, MFA, risco de sessão | IAM, organização e AccessGrant. |
| Objeto | empresa, SPE, empreendimento, lote, contrato, parcela, dossiê, classificação | Modelo canônico e políticas de dados. |
| Ação | visualizar, editar, exportar, aprovar, assinar, instruir, reprocessar, revogar | Catálogo de capacidades e alçadas. |
| Ambiente | horário, região, dispositivo, sessão, incidente ativo, janela de fechamento | Camada de acesso, telemetria e política. |

## 3. Separação de deveres por setor

| Situação sensível | Quem pode preparar | Quem deve aprovar | Evidência e bloqueio |
| --- | --- | --- | --- |
| Alterar regra de distribuição | Financeiro autorizado | Alçada financeira + jurídico/gestor quando contrato exigir | Versão, motivo, comparação e vigência futura. |
| Instruir pagamento/repasse | Tesouraria/integração | Alçada definida, distinta do preparador quando risco justificar | Entitlement elegível, parceiro/KYC e trilha. |
| Reprocessar callback | Operação de integração | Dono da integração/segurança segundo severidade | Inbox original, chave idempotente e motivo. |
| Baixar/renegociar carteira | Cobrança | Financeiro/gestor conforme faixa e contrato | Proposta, alçada, evidência de acordo e log. |
| Exportar dados restritos | Área dona do caso | Dono de dados/compliance conforme classificação | Finalidade, recorte, expiração e registro de exportação. |
| Aprovar distrato/cessão | Operação/jurídico prepara | Poder vigente e responsável designado | Instrumento, estado de contrato, impacto econômico e checklist. |

## 4. Workspaces operacionais recomendados

| Workspace | Pergunta central | Dados mínimos | Ações proibidas por padrão |
| --- | --- | --- | --- |
| Comercial e captação | Qual ativo/cliente pode avançar? | Ativo, lead, proposta, agenda e pendência. | Ver carteira completa, alterar poder, exportar dossiê restrito. |
| Lançamento/loteadora | Qual lote/contrato/fase é elegível? | Estoque, reserva, proposta, obra e gate. | Dar baixa financeira ou alterar regra de split. |
| Carteira e cobrança | O que venceu, recebeu, divergiu ou exige acordo? | Contrato, parcela, status, acordo e exceção. | Executar repasse sem alçada/parceiro e apagar fato econômico. |
| Tesouraria/controladoria | O que foi confirmado, instruído, liquidado ou precisa reconciliar? | Subledger, instrução, settlement, tarifa e exceção. | Alterar contrato/entitlement retroativamente. |
| Contador/jurídico | Qual evidência/referência precisa ser analisada? | Lote de exportação, referência, vigência e exceção. | Operar pagamento ou editar registro operacional sem alçada. |
| Governança/IAM | Quem tem poder e acesso vigente? | Vínculo, grant, recertificação, incidentes e logs. | Ler conteúdo de dossiê sem necessidade/finalidade. |

## 5. Provas obrigatórias

1. Testes `permitir/negar` por organização, SPE, empreendimento, objeto, ação e vigência.
2. Teste de mudança de função, praça, contrato, poder, offboarding e recertificação.
3. Teste de separação de deveres em alteração de split, aprovação, reprocessamento e exportação.
4. Registro de decisão de acesso contendo política, atributos relevantes, resultado e referência de evidência — sem registrar segredo ou conteúdo excessivo.
5. Revisão humana de casos de exceção e política de emergência com expiração curta.

## Limitações

ABAC e zero trust são referências de arquitetura e não dispensam desenho de UX, LGPD, contrato, hierarquia organizacional, validação de segurança ou testes reais. Não se deve ativar controles contextuais que criem bloqueio operacional sem rota de exceção auditada.

## Referências

[1] [NIST — Attribute-based access control (ABAC)](https://csrc.nist.gov/glossary/term/attribute_based_access_control)  
[2] [NIST — Attribute Based Access Control Project](https://csrc.nist.gov/projects/attribute-based-access-control)  
[3] [CISA — Zero Trust Maturity Model](https://www.cisa.gov/zero-trust-maturity-model)
