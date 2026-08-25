# Modelo de identidade, login e bootstrap governado

## Versão 0.1 — agosto de 2026

> **Regra de projeto:** não existe login “sem erros”. Existe uma arquitetura que reduz classes conhecidas de falha, não confirma estado ambíguo, protege recuperação, limita o raio de uma credencial comprometida e permite revogar/investigar cada sessão.

## 1. Decisão central

O CRM adotará **Supabase Auth como provedor de identidade**, Supabase Postgres/RLS como autoridade de acesso aos dados e funções confiáveis como única superfície para comandos administrativos e bootstrap. A escolha de login não é única para todos; ela é descoberta por organização e risco, mas toda trilha converge em uma identidade técnica (`auth.users.id`), membership explícita, sessão de garantia conhecida e policy no dado.

| Público | Entrada padrão | Reforço | Regra de autorização |
| --- | --- | --- | --- |
| Comprador/owner da empresa-cliente | Convite de ativação para e-mail verificado; cria acesso local e registra primeiro admin da organização. | MFA obrigatório antes da primeira administração; passkey ofertada após confirmação, enquanto estiver suportada e homologada. | Recebe `organization_admin` somente na organização provisionada e dentro da vigência. |
| Funcionário/corretor/parceiro da empresa-cliente | Convite individual emitido por admin autorizado; descoberta de SSO por domínio quando a organização aderir. | MFA por risco; SSO SAML/OIDC quando contratado; passkey local somente fora da trilha SSO. | Membership e escopo são concedidos depois da autenticação; e-mail nunca cria acesso por si só. |
| Usuário local sem SSO | E-mail confirmado + senha criada pelo próprio usuário ou fluxo passwordless aprovado. | TOTP como MFA disponível de base; passkey como piloto controlado, não único caminho de P0. | `aal1` permite apenas superfícies de baixo risco; políticas críticas exigem `aal2` e contexto vigente. |
| Principal de plataforma | Convite/bootstrap externo à interface comum, em rota administrativa separada e protegida. | MFA antes de ativar privilégio, sessão reforçada, auditoria append-only, recuperação independente e recertificação. | `platform_super_admin` administra plataforma, não ignora RLS nem lê dados de locatária sem caso de suporte/JIT. |

### Escolha recomendada por maturidade

No lançamento, o caminho mais estável é **convite controlado + e-mail confirmado + senha local opcional + TOTP obrigatório por risco + RLS server-authoritative**. SSO entra por organização que tenha IdP e contrato; passkeys/WebAuthn entram como experiência de alta segurança para contas locais depois de homologação, pois o suporte atual do Supabase é experimental. [1] A equipe não deve bloquear clientes pequenos por ausência de IdP, nem oferecer uma senha compartilhada, cadastro aberto ou privilégio derivado apenas de domínio de e-mail.

## 2. Fronteiras que não podem se confundir

| Conceito | Fonte de verdade | Nunca é prova suficiente |
| --- | --- | --- |
| Identidade | UUID de `auth.users` e identidade federada quando aplicável. | E-mail, nome, cargo exibido, `user_metadata` ou estado do navegador. |
| Canal de contato | E-mail confirmado/atualizado pelo fluxo seguro. | E-mail digitado em login, convite encaminhado ou domínio parecido. |
| Acesso organizacional | `organization_memberships` + escopo + vigência + policy/RLS. | Ter conta válida, ter SSO, ser comprador ou trabalhar em empresa com o mesmo domínio. |
| Privilégio de plataforma | Registro de `platform_principals`, AAL, política de sessão e evento administrativo. | Variável de frontend, claim editável, lista local de e-mails ou papel salvo em `user_metadata`. |
| Recuperação | Processo proporcional ao risco, fator/contato verificado e nova sessão restrita. | Link de e-mail isolado, pergunta secreta, ligação informal ou ticket sem validação. |

## 3. Jornadas de login e ativação

### 3.1 Comprador/owner da empresa-cliente

1. Um principal de plataforma cria a organização em `provisioning`, com domínio e dados mínimos revisáveis.
2. A função confiável cria convite com destinatário, organização, papel inicial, expiração, uso único e correlação. Nenhuma membership fica ativa antes da aceitação.
3. O comprador confirma o e-mail, cria uma credencial local ou conclui a federação aprovada e aceita o convite.
4. Antes de administrar pessoas, unidade, SPE, exportação ou integração, a pessoa cadastra MFA e satisfaz AAL2.
5. A função transacional ativa `organization_admin`, registra `AdminAuditEvent` e abre uma lista de primeira configuração: segunda pessoa administradora, escopo, recuperação e política de sessão.

O login informa apenas que a instrução foi enviada ou que o acesso está em revisão; ele não revela se o e-mail, a organização ou a membership existem.

### 3.2 Funcionário, corretor ou parceiro

1. A pessoa acessa o portal e informa e-mail; a descoberta de IdP é feita sem confirmar a existência de conta ao navegador.
2. Se houver conexão SSO aprovada para a organização, a aplicação inicia fluxo de código com PKCE, `state`, `nonce` e redirect previamente cadastrado. [2]
3. Sem SSO, a pessoa aceita convite e cria/usa credencial local confirmada. Autocadastro não cria membership nem papel.
4. Após autenticação, RLS consulta o UUID, a membership, o escopo, a vigência e o risco de sessão. Uma conta com e-mail igual em outro tenant não recebe acesso por inferência.
5. Mudança de cargo, desligamento, domínio SSO removido ou revogação encerra sessões e remove o acesso no dado; a interface apenas reflete a decisão.

### 3.3 Step-up de sessão

| Situação | Sessão mínima | Próxima ação segura |
| --- | --- | --- |
| Ler fila sob escopo já aprovado | `aal1`, membership válida. | Abrir workspace autorizado. |
| Convidar/revogar pessoa; alterar e-mail, fator ou SSO; exportar dado sensível | `aal2` e reautenticação recente conforme política. | Exigir MFA e reavaliar policy antes do comando. |
| Alterar beneficiário, regra de split, integração, policy ou comando de plataforma | `aal2`, sessão recente, alçada e eventualmente segunda aprovação. | Abrir revisão de risco; negar se a prova estiver ausente. |
| Recuperação, novo dispositivo ou sinal suspeito | Sessão restrita; nenhuma ação de alto risco. | Reautenticar, registrar novo fator e revisar sessões existentes. |

## 4. Sessões e erros de login

Sessão não é “usuário logado”; é uma credencial temporária com ciclo de criação, uso, renovação, step-up e revogação. Tokens e cookies não carregam autorização de domínio como verdade suficiente. O produto usa HTTPS, só aceita origens e redirects permitidos, rotaciona/renova sessão após mudança de privilégio ou recuperação e registra criação, step-up, revogação, expiração e negação. [3]

| Evento | Comportamento público | Evento protegido | Contenção |
| --- | --- | --- | --- |
| Credencial inválida, usuário ausente ou conta suspensa | “Não foi possível concluir o acesso. Confira o e-mail ou prossiga pelo suporte.” | Tipo normalizado, correlação, taxa e origem minimizada. | Throttling/rate limit e monitoramento sem enumerar conta. |
| Convite expirado ou já usado | “Este acesso precisa de uma nova instrução.” | `invite_expired`/`invite_consumed`, tenant e emissor. | Não reativa membership; admin emite novo convite auditado. |
| AAL insuficiente | “Confirme seu segundo fator para continuar.” | `step_up_required`, comando e policy. | Não exibe sucesso nem altera recurso. |
| Sessão revogada ou expirada | “Sua sessão terminou. Entre novamente.” | `session_revoked`, causa e correlação. | Limpar estado privilegiado do cliente e buscar estado canônico ao retornar. |
| SSO indisponível/mal configurado | “Não foi possível concluir pelo acesso corporativo.” | `sso_provider_error`, conexão, release e trace. | Não faz fallback silencioso que vincule conta errada; oferece rota aprovada da organização. |

## 5. Recuperação sem escalada de privilégio

| Cenário | Caminho permitido | O que fica bloqueado até nova prova |
| --- | --- | --- |
| Esqueci senha de usuário local | Link/código de uso único por canal verificado, com resposta uniforme, expiração e limitação de automação. | Sessão prévia, mudança de e-mail/fator, administração, exportação e comando financeiro. |
| Perdi TOTP/dispositivo | Fluxo de recuperação proporcional: contato verificado + confirmação de admin de organização ou suporte JIT quando a política exigir. | Remoção automática de MFA, concessão de papel novo, troca de favorecido, política, integração ou acesso de plataforma. |
| Perdi acesso SSO | Organização restaura no IdP; CRM aplica estado local de sessão/membership e não assume identidade por e-mail isolado. | Login local alternativo, salvo se a organização houver habilitado explicitamente uma trilha local com política própria. |
| Principal de plataforma perdeu fator | Recuperação de alto risco com segundo custodiante de segurança, canal pré-registrado, período de contenção e evento imutável. | Acesso privilegiado até novo MFA, revisão de sessão, confirmação independente e recertificação. |

Link de reset não cria login completo nem restaura MFA automaticamente; ele só inicia uma sessão de recuperação restrita. Tokens são de uso único, expiram e não dependem do header `Host` recebido para montar URL. [4]

## 6. Bootstrap do principal inicial designado

O solicitante designou um endereço de e-mail específico para ser o primeiro principal da plataforma. Esse valor é dado operacional privado e **não será repetido em código, frontend, migration, JWT, `user_metadata`, arquivo público ou tela do observatório**. No provisionamento de produção, ele é cadastrado apenas no cofre de segredo como `INITIAL_PLATFORM_PRINCIPAL_EMAIL`; a função interna de bootstrap o lê no runtime confiável e nunca o devolve ao cliente.

| Etapa | Controle obrigatório | Resultado esperado |
| --- | --- | --- |
| 0. Pré-requisito | Segredo de implantação inserido por operador autorizado; domínio/RP ID, redirects, e-mail transacional, MFA e auditoria configurados. | Não existe principal ativo apenas por e-mail em variável. |
| 1. Criar intenção | Função administrativa interna lê o segredo, normaliza o valor e gera `bootstrap_request` com correlação/idempotência. | O endereço não chega a log, erro público ou payload de navegador. |
| 2. Convidar | Auth cria convite com prazo curto para o endereço designado; `platform_principal` nasce em `pending_activation`. | Convite isolado não concede privilégio. |
| 3. Verificar | A pessoa prova posse do e-mail, registra MFA e canal de recuperação aprovado, aceita política e encerra sessões prévias. | A conta possui identidade confirmada e AAL2 antes da ativação. |
| 4. Ativar | RPC confere o UUID convidado, o estado de bootstrap, AAL2, fator válido e evidência de aceite; escreve papel e `AdminAuditEvent` na mesma transação. | Surge um `platform_super_admin` governado, não acesso sem fronteira. |
| 5. Reduzir risco de pessoa única | O primeiro principal cria/recertifica um segundo custodiante de segurança e uma recuperação independente antes de gerir cliente real. | Não existe conta única cujo e-mail, dispositivo ou recuperação paralise toda a plataforma. |

### Limites permanentes do principal inicial

O principal inicial pode iniciar organizações, gerenciar políticas globais, revogar grants, consultar evento administrativo e abrir suporte JIT, sempre com MFA e auditoria. Ele **não** ganha leitura automática de dossiê, carteira, documento, saldo, dados bancários, split ou exportação de uma locatária. Para isso, a regra continua sendo caso de suporte com selector mínimo, finalidade, expiração, mascaramento e audit event — ou política e aprovação aplicável.

## 7. Modelo técnico mínimo

| Entidade | Campos essenciais | Propriedades de segurança |
| --- | --- | --- |
| `identity_subjects` | `auth_user_id`, estado, e-mail verificado em cache mínimo, created/updated. | UUID é chave; nenhum papel em metadata editável. |
| `organization_memberships` | `organization_id`, `auth_user_id`, papel, escopo, vigência, estado, concedente. | RLS por tenant e testes permitir/negar; expiração efetiva no banco. |
| `access_invitations` | destinatário normalizado/derivado, papel, escopo, expiração, emissor, estado, correlação. | Token armazenado de modo seguro/hachurado; uso único; não ativa membership antes de aceitação. |
| `platform_principals` | `auth_user_id`, papel de plataforma, estado de bootstrap, recertificação, fatores/recovery confirmados. | Somente RPC/serviço confiável altera; sem leitura de domínio de cliente por concessão implícita. |
| `bootstrap_requests` | hash/correlação de intenção, estado, executor técnico, tempo, idempotência. | Schema privado; endereço real fica no cofre de segredo/serviço Auth e é redigido em eventos. |
| `identity_audit_events` | ator, alvo, evento, antes/depois redigido, AAL, sessão, correlação, resultado. | Append-only, acesso administrativo mínimo, retenção e alerta por risco. |

## 8. Testes que bloqueiam promoção

1. Um e-mail não convidado, mesmo pertencendo ao domínio de cliente, não cria organization membership.
2. Uma conta SSO e uma conta local com o mesmo e-mail não são confundidas; o vínculo usa UUID e regra explícita.
3. Reset de senha, perda de fator e troca de e-mail não preservam sessão privilegiada nem elevam AAL por inferência.
4. `aal1` falha no banco/RPC ao tentar grant, exportação, integração, policy, dado bancário ou comando de plataforma.
5. Convite repetido, expirado, encaminhado ou consumido não ativa uma segunda membership e não enumera a conta.
6. O bootstrap não é invocável pelo browser, não funciona sem segredo de implantação e não ativa o principal antes de e-mail confirmado, MFA e evento transacional.
7. Principal de plataforma sem `SupportCaseAccess` não lê dado de organização locatária, documento ou informação financeira detalhada.
8. Revogar membership, fator ou conexão SSO encerra a sessão e a RLS nega nova leitura/escrita imediatamente conforme a política.

## Referências

[1] [Supabase — Passkey Authentication](https://supabase.com/docs/guides/auth/passkeys)

[2] [IETF — RFC 9700: OAuth 2.0 Security BCP](https://datatracker.ietf.org/doc/html/rfc9700)

[3] [OWASP — Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

[4] [OWASP — Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)

[5] [NIST — SP 800-63B Digital Identity Guidelines](https://pages.nist.gov/800-63-4/sp800-63b.html)

[6] [Supabase — Multi-Factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa)

[7] [Supabase — Single Sign-On with SAML 2.0](https://supabase.com/docs/guides/auth/enterprise-sso/auth-sso-saml)
