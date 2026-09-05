# Blueprint de governança de colaboradores e corretores — A185

**Data:** 05 de setembro de 2026  
**Escopo:** painéis SUPER ADM e ADM, com preparação de delegações por organização. Não cria credenciais, não envia convites e não ativa qualquer acesso sem confirmação explícita e validação no servidor.

## Princípio de segurança

Autenticação e autorização são conceitos distintos: uma identidade autenticada não passa a poder acessar recursos ou criar usuários por esse fato. A OWASP recomenda menor privilégio, negação por padrão, validação de permissão em cada requisição, logging e testes de autorização. [1] O modelo NIST de RBAC também separa papéis, permissões, hierarquia e restrições de segregação de deveres. [2]

> **Colaborador** e **corretor** serão perfis de trabalho. Eles não são papéis de autorização e, por si só, não concedem módulo, recurso, leitura, escrita ou administração.

## Matriz de alçadas

| Ator | Pode preparar | Papel organizacional permitido | Escopo máximo | Não pode |
|---|---|---|---|---|
| SUPER ADM | Colaborador ou corretor de qualquer organização não suspensa. | `organization_admin`, `area_admin` ou `operator`. | Módulos da organização e finalidade explícita. | Criar papel de plataforma pelo painel de equipe, ignorar MFA, ativar sujeito inativo ou enviar convite automático. |
| ADM organizacional | Colaborador ou corretor da própria organização. | Somente `operator`. | Subconjunto explícito dos módulos que o próprio ADM possui; nunca `platform`. | Criar ou elevar ADM, criar outro SUPER ADM, delegar fora da organização, ampliar seu próprio escopo ou acessar Financeiro bloqueado. |
| ADM de área | Nenhum comando de delegação na primeira versão. | Não aplicável. | Não aplicável. | Criar usuários, alçadas ou escopos. |
| Colaborador/Corretor | Pode confirmar apenas sua própria preparação de acesso, se identidade e MFA forem válidos. | Não escolhe papel nem módulo. | O que já foi preparado e validado. | Aceitar acesso de outra pessoa, alterar alçada, organização ou vigência. |

## Modelo de identidade, perfil e acesso

| Conceito | Fonte de verdade | Regra |
|---|---|---|
| Identidade | `identity_subjects` e sessão Supabase. | Precisa existir, estar ativa e ser confirmada pelo próprio sujeito; nunca é criada pelo painel. |
| Perfil de trabalho | Atributo `collaborator` ou `broker` associado à membership. | Descreve a função no time, mas não altera alçada. |
| Membership | `organization_memberships`. | Liga identidade, organização, papel e ciclo de acesso. |
| Grant | `administrative_grants`. | Declara módulos, recursos, finalidade, vigência e estado. |
| Referência de vínculo | Código opaco e temporário, recuperado pelo próprio sujeito autenticado. | Substitui a exposição de e-mail ou UUID no painel administrativo; não é senha, convite por e-mail ou credencial. |
| Auditoria | `admin_audit_events` redigidos. | Registra ator, organização, comando, correlação, resultado e razão sem dados pessoais ou segredo. |

## Ciclo de vida proposto

1. A pessoa entra pela autenticação normal e confirma sua identidade e MFA conforme política vigente.
2. A própria pessoa recupera uma **referência temporária de vínculo**. Esse código opaco pode ser entregue presencialmente ao ADM ou SUPER ADM; o CRM não envia mensagem, e-mail ou convite.
3. O SUPER ADM ou ADM elegível prepara o perfil de trabalho, papel, módulos, finalidade e vigência. O servidor resolve a referência, revalida todas as relações e cria membership em estado pendente, com grant pendente.
4. A pessoa confirmada aceita somente a própria delegação, após nova validação de sessão e MFA. A ativação é um comando separado, idempotente e auditado.
5. SUPER ADM pode suspender ou revogar. O sistema deve negar qualquer acesso assim que o estado deixar de estar ativo.

Essa separação responde ao teste de provisionamento de contas da OWASP: verificar quem pode provisionar qual tipo de conta, impedir criação de privilégios superiores aos do delegador e manter desprovisionamento controlado. [4] A CISA também recomenda MFA, contas individuais, remoção de acessos desnecessários e ausência de credenciais padrão. [5]

## Recorte da primeira implementação

| Entrega | Incluído | Excluído |
|---|---|---|
| Painel SUPER ADM | Vista de equipe por organização, preparo explícito de colaborador/corretor, opção de papel organizacional e escopo. | Novo papel de plataforma, convite por e-mail, senha, comunicação externa, acesso financeiro ou provisionamento em massa. |
| Painel ADM | Vista da própria organização e preparo de operador com módulos contidos. | Ver outras organizações, delegar `organization_admin`/`area_admin`, autoelevação ou escopo `platform`. |
| Referência da pessoa | Geração/consulta protegida da referência opaca pelo próprio sujeito. | Mostrar e-mail, UUID, telefone, lista geral de identidades ou buscar pessoa por nome. |
| Confirmação | Aceite do próprio sujeito com sessão e MFA válidos. | Ativação automática, aceite em nome de terceiro, aceite sem MFA ou ativação de papel não permitido. |
| Histórico | Estado mínimo e auditoria redigida. | Dados de RH, dados pessoais extensos, remuneração, comissão, documentos, folha ou integração externa. |

## Controles de aceitação

O servidor deve negar qualquer comando se falta subject, MFA, organização, relacionamento, finalidade, módulo, vigência, correlação ou condição de papel. ADM não pode preparar privilégio maior, mesmo que altere dados no navegador. A referência de vínculo deve expirar, ser de uso único e não ser registrada em logs. A confirmação deve validar que o subject autenticado é o mesmo da preparação. Cada teste precisa exercitar a negação de organização cruzada, autoelevação, escopo além do delegador, subject inativo, MFA ausente, código inválido e repetição com a mesma correlação.

## Referências

[1]: [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

[2]: [NIST — The NIST Model for Role-Based Access Control](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=916402)

[3]: [NIST — Identity Management: User Account Provisioning](https://www.nist.gov/itl/51-identity-management-user-account-provisioning)

[4]: [OWASP WSTG — Test Account Provisioning Process](https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/03-Identity_Management_Testing/03-Test_Account_Provisioning_Process)

[5]: [CISA — Weak Security Controls and Practices Routinely Exploited for Initial Access](https://www.cisa.gov/news-events/alerts/2022/05/17/weak-security-controls-and-practices-routinely-exploited-initial-access)
