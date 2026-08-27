# Registro técnico — fundação administrativa A1

**Data de consulta:** 2026-08-27  
**Uso:** fundamentar a implementação da fundação administrativa no ambiente Supabase de desenvolvimento. Este registro não contém credenciais, identificadores individuais, dados de clientes nem instrução para produzir efeito fora do projeto.

| Referência oficial | Ponto incorporado | Aplicação no marco A1 |
| --- | --- | --- |
| [Row Level Security — Supabase][1] | Tabelas em schema exposto requerem RLS; `anon` e `authenticated` devem ter acesso mínimo; políticas são avaliadas por acesso. | A0/A0.1 mantém RLS, revoga acesso direto e aplica negação explícita às tabelas administrativas. |
| [Securing your API — Supabase][2] | Grants definem alcance de objeto; RLS define linhas; funções precisam de `EXECUTE` explicitamente restrito. | A1 revoga execução de funções para `public`, `anon` e `authenticated`, concedendo somente a `service_role`. |
| [Database Functions — Supabase][3] | `security definer` deve definir `search_path`; funções devem ser únicas e privilegiadas precisam de execução contida. | A1 usa funções transacionais com `security definer`, `set search_path = ''` e referências qualificadas de schema. |
| [Admin invite user by email — Supabase][4] | Convite de identidade é uma ação administrativa e pode emitir comunicação por e-mail. | O marco A1 não envia convite, não usa e-mail como chave de acesso e mantém o registro de convite somente como fundação. |
| [MFA TOTP — Supabase][5] | MFA TOTP exige sessão inicial, inscrição de fator, desafio e verificação; o nível AAL informa se há fator pendente ou verificado. | O ciclo de identidade mantém principal em pendência até MFA e recuperação, e não confunde sessão com alçada. |
| [Password-based Auth — Supabase][6] | Cadastro por e-mail/senha pode exigir confirmação e URLs de redirecionamento configuradas; reset não deve enumerar contas. | A interface oferece cadastro e conexão manuais; convite, ativação automática e mensagens por recuperação permanecem fora deste marco. |

> **Decisão técnica:** comunicação, recuperação, ativação de identidade e MFA não são habilitadas por A1. Os comandos criados são uma superfície transacional futura, sem permissão de browser e sem chamadas expostas na interface enquanto os gates de identidade não estiverem concluídos.

## Referências

[1]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase — Row Level Security"

[2]: https://supabase.com/docs/guides/database/hardening-data-api "Supabase — Securing your API"

[3]: https://supabase.com/docs/guides/database/functions "Supabase — Database Functions"

[4]: https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail "Supabase — Invite user by email"

[5]: https://supabase.com/docs/guides/auth/auth-mfa/totp "Supabase — Multi-Factor Authentication (TOTP)"

[6]: https://supabase.com/docs/guides/auth/passwords "Supabase — Password-based Auth"
