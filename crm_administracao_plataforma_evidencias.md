# Administração de plataforma — caderno de evidências

**Captura:** 25 de agosto de 2026.  
**Estado:** `em_confronto` — padrões e documentação técnica capturados; a tradução final para contrato, política interna, ambiente e testes do CRM ainda será validada.

## PAM, RBAC e ABAC

| Fonte | Afirmação verificável | Decisão para o CRM |
| --- | --- | --- |
| NIST NCCoE — PAM | Contas privilegiadas têm acesso elevado e são alvo relevante; monitoramento, auditoria e autenticação combinados apoiam prevenção e detecção de uso não aprovado. [1] | Super Admin não é um bypass cotidiano: cada uso privilegiado deve ter sessão, motivo, correlação, auditoria e revisão. |
| NIST — RBAC | RBAC associa autorizações a papéis e pode refletir funções e hierarquias organizacionais. [2] | Papéis fornecem o ponto de partida para Super Admin, Admin de organização, Admin de área e operador; não bastam para liberar recurso sensível. |
| NIST — ABAC | ABAC medeia o acesso por atributos de sujeito, objeto e ambiente, sob política definida. [3] | A decisão final combina papel, organização, SPE, objeto, ação, vigência, finalidade, alçada, contexto de sessão e risco. |

## Supabase Auth, MFA e RLS

| Fonte | Afirmação verificável | Decisão para o CRM |
| --- | --- | --- |
| Supabase — custom claims/RBAC | Auth Hooks podem adicionar claims antes da emissão do token; o guia mostra papel/permite em tabela controlada e leitura por RLS. [4] | Claims são uma pista de sessão de baixo volume; o banco continua a avaliar membership, grant e expiração. Alteração de papel exige refresh/revogação de sessão. |
| Supabase — MFA | Supabase expõe AAL no JWT; a documentação indica que a regra MFA precisa ser aplicada no banco, APIs e servidor, não apenas na interface. [5] | Ações privilegiadas e comandos de alto risco exigem `aal2`/reautenticação proporcional por policy e função, não somente tela de confirmação. |
| Supabase — RLS | RLS e grants compõem autorização; `service_role` ignora RLS e deve permanecer no servidor. O guia recomenda políticas por operação e testes permitir/negar. [6] | Nenhuma chave privilegiada chega ao browser; migrations unem grant, RLS, função, índice e teste. Tabela/vista/função administrativa não recebe acesso genérico. |

## Limites e riscos que permanecem abertos

1. **JWT não é banco de privilégios vivo.** A própria documentação alerta que informações de JWT podem estar defasadas até o refresh; a revogação material precisa consultar política/estado atual ou encurtar/invalidar sessão conforme o caso. [6]
2. **`raw_user_meta_data` não é fonte de autorização.** A documentação diferencia metadado de usuário, editável pelo próprio autenticado, do metadado de aplicação. Mesmo `app_metadata` não substitui modelo relacional auditável de membership e grant. [6]
3. **MFA não é suficiente sem política.** Exigir segundo fator apenas na UI deixa APIs, RLS ou função crítica expostos a uma sessão de nível inferior. [5]
4. **Break-glass precisa de trilha própria.** A conta de emergência é uma capacidade privilegiada, não um Super Admin permanente sem limite; exige incidente, duração, alerta e revisão posterior. [1]

## Administração de infraestrutura no Netlify

| Fonte | Afirmação verificável | Decisão para o CRM |
| --- | --- | --- |
| Netlify — roles and permissions | Roles de time definem capacidades sobre projetos e recursos da plataforma; Owners possuem acesso amplo ao time. [7] | Owner/Developer do Netlify não é Super Admin do CRM. Acesso a deploy, variável, site ou banco de infraestrutura recebe governança separada. |
| Netlify — project access | A plataforma suporta acesso granular por projeto para alguns papéis e recomenda escopo de projeto para onboarding de menor privilégio. [8] | Produção, homologação, sandbox, observatório e ferramentas administrativas devem ser projetos/escopos distintos, com membros e direitos revisáveis. |
| Netlify — team audit log | O log de time registra ações, quando e por quem; a retenção varia por plano. [9] | Auditoria do Netlify é evidência complementar da infraestrutura, mas não substitui `AdminAuditEvent` do produto, que deve possuir retenção e correlação próprias. |

> **Separação obrigatória:** a equipe que administra o CRM não recebe automaticamente permissão para alterar deploy, segredo ou infraestrutura. Da mesma forma, um Owner de hospedagem não recebe leitura cotidiana de dados de organizações, carteira ou documentos.

## Próxima prova

O próximo ciclo deve testar quatro relações: Super Admin sem caso de suporte não lê dados de locatária; Admin de organização não cruza empresa/SPE; Admin de área não eleva a própria alçada; e acesso emergencial expira/revoga mesmo sem ação do solicitante. Nenhuma delas é validada apenas por navegação de interface.

## Referências

[1] [NIST NCCoE — Privileged Account Management for the Financial Services Sector](https://www.nccoe.nist.gov/financial-services/privileged-account-management)  
[2] [NIST — Role-Based Access Control](https://csrc.nist.gov/glossary/term/role_based_access_control)  
[3] [NIST — Attribute-Based Access Control](https://csrc.nist.gov/glossary/term/attribute_based_access_control)  
[4] [Supabase — Custom Claims & Role-based Access Control](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac)  
[5] [Supabase — Multi-Factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa)  
[6] [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)  
[7] [Netlify — Roles and permissions](https://docs.netlify.com/manage/accounts-and-billing/team-management/roles-and-permissions/)  
[8] [Netlify — Manage project access](https://docs.netlify.com/manage/accounts-and-billing/team-management/manage-project-access/)  
[9] [Netlify — Team audit log](https://docs.netlify.com/manage/accounts-and-billing/team-management/team-audit-log/)
