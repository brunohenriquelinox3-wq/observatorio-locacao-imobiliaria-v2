# Referências técnicas — MFA, assurance e ativação A4

**Escopo:** registrar o fundamento técnico para a atestação server-side de MFA e a ativação explícita de principal administrativo. Este registro não habilita acesso, não cria usuários e não altera alçadas.

| Tema | Síntese aplicável | Decisão de implementação |
| --- | --- | --- |
| Assurance JWT | O Supabase distingue `aal1` (primeiro fator) de `aal2` (segundo fator), ambos representados na claim `aal` do JWT. [1] | Comandos administrativos não confiarão em flag de navegador; a atestação dependerá do token apresentado ao servidor. |
| MFA TOTP | O fluxo TOTP exige inscrição, challenge e verify; verificação bem-sucedida eleva a sessão. [2] | A central só oferece a jornada manual; ela não ativa principal, papel ou organização automaticamente. |
| MFA recente | O array `amr` do JWT contém método e timestamp da autenticação, permitindo avaliar se o segundo fator é recente. [1] | A atestação registrará somente resultado/tempo de validade necessários, não o token nem código TOTP. |
| RLS e grants | RLS deve ser combinado com grants mínimos; adicionar policy não revoga permissões pré-existentes. [3] | A migration manterá tabelas sem acesso do navegador e funções executáveis apenas por `service_role`. |
| Falha de MFA | Para APIs, a documentação recomenda verificar a claim `aal`; para sessões que podem elevar, a experiência deve solicitar o segundo fator em vez de presumir privilégio. [1] | Ausência, token inválido, `aal1`, MFA vencido ou claim incompatível falham fechados e retornam estado redigido. |

> **Conclusão:** a ativação só pode ocorrer após uma atestação server-side de JWT válido em `aal2`, associada ao mesmo `subject_id`, a um principal pendente e a uma correlação única. A interface explica o próximo requisito, mas não decide nem substitui a policy.

## Referências

[1] [Supabase — Multi-Factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa)

[2] [Supabase — Multi-Factor Authentication (TOTP)](https://supabase.com/docs/guides/auth/auth-mfa/totp)

[3] [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
