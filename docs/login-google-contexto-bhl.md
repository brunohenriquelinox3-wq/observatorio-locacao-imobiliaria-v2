# Login individual com Google — notas de integração

## Estado mapeado

O CRM usa duas camadas de identidade: a autenticação de plataforma e uma sessão Supabase de contexto, usada pelo servidor para resolver o sujeito sujeito a memberships, grants, módulo, finalidade e vigência. A tela atual do contexto usa credencial local; a evolução deve substituí-la por OAuth Google no Supabase sem alterar a autoridade das permissões do CRM.

## Desenho aprovado para implementação

Cada colaborador entra por **Continuar com Google**. A autenticação somente cria ou recupera a sessão Supabase; ela não concede organização, papel, módulo, grant, escopo ou alçada. O servidor continua fail-closed: sem sujeito Supabase válido e vínculo interno já provisionado, o CRM não retorna contexto autorizado.

O fluxo requer um provedor Google habilitado no Supabase e um cliente OAuth Web criado no Google Cloud. O redirecionamento retorna à rota do CRM a partir da origem em uso, validada contra a lista permitida no provedor. O cadastro prévio ou a delegação administrativa permanece necessário para que um colaborador autenticado receba acesso operacional.

## Limites de configuração

Não armazenar no repositório, documentação, interface, teste ou artefato de entrega os segredos do cliente OAuth. Não confiar apenas em domínio de e-mail, login Google ou existência de conta como prova de permissão. Não criar alçada durante o callback OAuth.

## Fontes oficiais

[1]: https://supabase.com/docs/guides/auth/social-login/auth-google "Supabase Auth — Sign in with Google"
[2]: https://supabase.com/docs/guides/auth/redirect-urls "Supabase Auth — Redirect URLs"
