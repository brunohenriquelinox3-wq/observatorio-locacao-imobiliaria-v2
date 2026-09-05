# Pesquisa de governança administrativa — A184

**Data:** 05 de setembro de 2026  
**Escopo:** referências públicas para modelar delegação de colaboradores e corretores. Nenhuma identidade, membership, grant, escopo, convite ou comunicação externa foi criada.

## Achados aplicáveis

| Fonte | Evidência aplicável | Decisão de produto |
|---|---|---|
| OWASP Authorization Cheat Sheet | Menor privilégio, negação por padrão, validação de permissão a cada requisição, logging e testes de autorização são recomendações centrais. [1] | O painel é orientativo; toda leitura e comando continuam validados no servidor/RLS/RPC. |
| NIST RBAC | Papéis representam funções; hierarquias e segregação de deveres podem tornar conflitos mais evidentes. [2] | Separar perfil de trabalho de papel de autorização e impedir que ADM delegue alçada maior que a própria. |
| NIST account provisioning | Provisionamento combina dados de identidade e políticas de controle de acesso, sob administração definida. [3] | Não criar credenciais ou identidade automaticamente; a identidade precisa existir e estar ativa antes de uma delegação. |
| OWASP testing guide | O teste de provisionamento deve verificar quem pode criar contas, que tipo de conta e se alguém pode criar privilégio superior ao próprio. [4] | Os testes deverão negar delegação entre organizações, papel superior, escopo excessivo, sujeito inativo e autoelevação. |
| CISA | Controle de acesso, MFA, contas individuais, remoção de acesso no desligamento e não uso de credenciais padrão reduzem risco operacional. [5] | Sem senha padrão, conta compartilhada ou convite automático; suspensão/revogação e MFA continuam como gates. |

## Implicações para a matriz do CRM

O modelo não deve criar “papéis de corretor” ou “papéis de colaborador” como sinônimo de privilégio. Esses são perfis de trabalho. A autorização continua expressa por papel organizacional, módulos, recursos, finalidade, vigência e relacionamento com a organização. O acesso efetivo só aparece se o servidor confirmar todos os atributos no momento da consulta ou comando.

| Perfil de trabalho | Papel organizacional admissível na primeira entrega | Delegador permitido | Limite |
|---|---|---|---|
| Colaborador | Operador ou ADM de área, com módulo e finalidade contidos. | SUPER ADM; ADM apenas para Operador contido na própria organização. | Não cria ADM organizacional ou papel de plataforma. |
| Corretor | Operador, com módulos e finalidade contidos. | SUPER ADM; ADM apenas para Operador contido na própria organização. | Não cria gestão financeira, contrato, cobrança, pagamento ou repasse. |
| ADM de área | Papel organizacional independente de ocupação. | Somente SUPER ADM. | Não delega ADM organizacional, plataforma ou permissões fora da organização. |
| ADM organizacional | Papel organizacional independente de ocupação. | Somente SUPER ADM. | Não cria papel de plataforma nem estende módulos sem decisão explícita. |

## Referências

[1]: [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

[2]: [NIST — The NIST Model for Role-Based Access Control](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=916402)

[3]: [NIST — Identity Management: User Account Provisioning](https://www.nist.gov/itl/51-identity-management-user-account-provisioning)

[4]: [OWASP WSTG — Test Account Provisioning Process](https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/03-Identity_Management_Testing/03-Test_Account_Provisioning_Process)

[5]: [CISA — Weak Security Controls and Practices Routinely Exploited for Initial Access](https://www.cisa.gov/news-events/alerts/2022/05/17/weak-security-controls-and-practices-routinely-exploited-initial-access)
