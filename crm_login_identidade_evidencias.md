# Caderno de evidências — login, identidade e recuperação do CRM

## Captura 01 — autenticação, MFA e sessão

| Fonte primária | Achado verificável | Aplicação ao CRM | Limite ou decisão resultante |
| --- | --- | --- | --- |
| NIST SP 800-63B (revisão 2025) | AAL2 exige dois fatores e requer que serviços ofereçam ao menos uma opção resistente a phishing; o documento também trata reautenticação e timeout de sessão como controles próprios. [1] | Ações de administração, acesso privilegiado, mudança de e-mail/fator, exportação sensível e comandos financeiros exigem step-up e sessão de maior garantia. | Os limites de tempo são calibrados por risco e contrato; a AAL não concede por si só autorização de negócio ou leitura entre organizações. |
| OWASP Authentication Cheat Sheet | Reautenticação é indicada após recuperação, reset, mudança sensível ou comportamento suspeito; mensagens de login e recuperação devem ser genéricas para reduzir enumeração; contas internas sensíveis não devem autenticar pela interface pública. [2] | Login, convite e recuperação retornam linguagem neutra. Mudanças de identidade/fator invalidam ou renovam sessão; principal de plataforma tem superfície e proteção próprias. | “Mensagem genérica” não deve esconder a próxima ação legítima do usuário nem impedir observabilidade protegida para equipe autorizada. |
| OWASP Session Management Cheat Sheet | Sessão autenticada equivale temporariamente ao método de autenticação mais forte; recomenda HTTPS integral, cookies protegidos, renovação após mudança de privilégio, expiração e rastreamento do ciclo de vida. [3] | Sessão contém identificador opaco, expira por inatividade/tempo absoluto conforme risco, é rotacionada em login, elevação e recuperação e pode ser encerrada por revogação. | Navegador não transporta papel, organização ou segredo como fonte de verdade; autorização continua em RLS/RPC. |
| Supabase MFA | MFA inclui enrollment, desafio/verificação e enforcement; o JWT sinaliza `aal1`/`aal2`, mas a proteção real depende de policy no banco, API e servidor. [4] | AAL2 entra como policy restritiva para comandos críticos; UX direciona sessão AAL1 para step-up em vez de apresentar falso sucesso. | TOTP/telefone não equivalem automaticamente a resistência a phishing. Política de fator, recuperação e comandos sensíveis deve ser separada por perfil. |

## Captura 02 — recuperação, federação e credenciais modernas

| Fonte primária | Achado verificável | Aplicação ao CRM | Limite ou decisão resultante |
| --- | --- | --- | --- |
| OWASP Forgot Password Cheat Sheet | Recuperação deve responder de maneira uniforme, limitar automação e usar token aleatório, seguro, de uso único e expiração adequada; não deve alterar a conta antes da validação nem logar automaticamente após reset. [5] | Recuperação cria sessão restrita, exige novo login/step-up, registra evento e invalida/revisa sessões conforme risco. | Recuperar senha não recupera automaticamente MFA, papel, organização, alçada nem privilégio de plataforma. |
| Supabase SAML SSO | SAML suporta múltiplas conexões multi-tenant; contas SSO não têm linking automático e e-mail não é identificador único suficiente. Single Logout não é suportado como garantia, de modo que timebox/inatividade continuam necessários. [6] | O CRM relaciona membership ao UUID de `auth.users`, não ao e-mail. Descoberta de SSO por domínio é opção da organização, e revogação aplica sessão/escopo local. | SSO é trilha corporativa opcional, não exigência para cliente pequeno; remover conexão pode desligar sessões e exige runbook. |
| RFC 9700 — OAuth 2.0 Security BCP | Redirecionamentos precisam de comparação exata; clientes públicos usam PKCE; implicit grant e resource-owner password grant não são recomendados; tokens precisam de privilégio mínimo e rotação/proteção contra replay. [7] | OIDC/SSO usa fluxo de código com PKCE S256, `state`/`nonce`, redirect allowlist e sem login por captura de senha de IdP pelo CRM. | OAuth/OIDC trata autenticação/federação; não substitui criação de membership, policy de dados, alçada ou auditoria do CRM. |
| Supabase Passkeys | Passkeys WebAuthn são resistentes a phishing, mas o suporte atual é experimental; exige domínio/RP ID estável e usuários SSO não podem registrar passkeys. [8] | Passkey é piloto opt-in após confirmação de e-mail, como autenticação adicional para usuários locais; registro e revogação são auditados. | Não é a única credencial de P0 nem a base do primeiro principal enquanto a API permanece experimental; SSO e passkey formam trilhas alternativas. |

## Decisões de engenharia decorrentes

1. **Identidade não é e-mail.** E-mail é canal verificado e atributo de contato; o identificador técnico é o UUID do sujeito. A autorização consulta membership, escopo, vigência, sessão e policy.
2. **Três trilhas de entrada, uma política de dados.** Ativação de comprador/owner, convite de funcionário e SSO corporativo variam na experiência, mas convergem em `auth.users` confirmado, membership explícita, RLS, audit event e step-up por risco.
3. **Recuperação devolve acesso mínimo, não poder.** Redefinir senha, trocar dispositivo ou recuperar fator reabre uma sessão restrita e exige nova autenticação para operações sensíveis.
4. **O principal inicial é configuração de implantação, não segredo embutido.** O endereço designado pelo solicitante será fornecido como `INITIAL_PLATFORM_PRINCIPAL_EMAIL` em cofre de segredo de produção no momento do provisionamento. Ele não será colocado em frontend, migration, JWT, metadata editável, código de cliente ou documento público.
5. **“Super Admin” é responsabilidade governada.** O principal inicial só ativa `platform_super_admin` depois de confirmar o e-mail, cadastrar MFA, registrar canal de recuperação, aceitar a política e gerar audit event. Seu papel não contorna isolamento de locatária, dados financeiros, documentos ou split sem fluxo de suporte/caso autorizado.

## Referências

[1] [NIST — SP 800-63B Digital Identity Guidelines](https://pages.nist.gov/800-63-4/sp800-63b.html)

[2] [OWASP — Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

[3] [OWASP — Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

[4] [Supabase — Multi-Factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa)

[5] [OWASP — Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)

[6] [Supabase — Single Sign-On with SAML 2.0](https://supabase.com/docs/guides/auth/enterprise-sso/auth-sso-saml)

[7] [IETF — RFC 9700: Best Current Practice for OAuth 2.0 Security](https://datatracker.ietf.org/doc/html/rfc9700)

[8] [Supabase — Passkey Authentication](https://supabase.com/docs/guides/auth/passkeys)
