# Login Google para colaboradores BHL Imóveis

## Decisão de arquitetura

O CRM mantém as duas camadas existentes, cada uma com finalidade distinta. A **sessão de plataforma** preserva as rotas, auditoria e o usuário já reconhecido pelo aplicativo. A **sessão de contexto** passa a oferecer Google como entrada principal, pois é ela que o servidor associa ao sujeito interno usado por memberships, grants, módulos, escopos e vigências.

> Login Google autentica uma identidade; ele não cria organização, papel, escopo, grant, membership ou privilégio administrativo.

Essa separação evita uma migração de identidade destrutiva e mantém todos os controles já aplicados no CRM. O acesso operacional continua negado para toda identidade sem vínculo interno prévio, suspenso, revogado ou fora da vigência autorizada.

## Jornada do colaborador

| Etapa | Ação | Resultado seguro |
|---|---|---|
| 1. Plataforma | Autenticar-se na plataforma pelo fluxo existente | Não concede alçada operacional. |
| 2. Google | Selecionar “Continuar com Google” na sessão de contexto | O provedor devolve uma sessão Supabase após autenticação. |
| 3. Contexto | O navegador envia somente o token atual em cabeçalho próprio | O servidor valida o token e resolve o sujeito. |
| 4. Alçada | O servidor consulta vínculo interno, membership, grant, módulo, escopo e vigência | Só mostra contextos expressamente autorizados. |
| 5. Trabalho | O colaborador entra no módulo permitido | Logout, expiração, revogação ou ausência de vínculo voltam a bloquear o acesso. |

O acesso por senha atual permanece apenas como contingência compatível durante a transição; a interface prioriza Google e não revela se determinada conta existe. Não usar domínio de e-mail como autorização por si só, pois colaboradores podem usar identidades corporativas ou pessoais previamente aprovadas.

## Configuração externa necessária

Habilitar o provedor Google no projeto de autenticação Supabase com um cliente OAuth Web próprio da BHL Imóveis. Configurar somente os escopos mínimos de identidade (`openid`, e-mail e perfil), a URL de retorno autorizada pelo provedor e a lista permitida de URLs do CRM. Usar origem exata em produção; usar URLs de prévia apenas quando realmente necessárias e limitadas ao ambiente de desenvolvimento.[1] [2]

O ID e o segredo do cliente OAuth pertencem ao console do Google e à configuração do provedor Supabase. Eles não devem ser gravados em código, testes, banco de dados do CRM, artefatos de entrega, documentação operacional ou mensagens.

## Critérios de aceite

1. A página de contexto apresenta Google como caminho principal e trata erros sem expor conta, provedor ou vínculo.
2. A URL de retorno usa a origem atual e destino interno validado; não permite redirecionamento externo.
3. Usuário Google sem vínculo interno não recebe contexto, papel, módulo ou dados do CRM.
4. Suspensão, revogação, expiração de sessão ou perda de grant bloqueiam chamadas protegidas.
5. A sessão preserva o fluxo de MFA já associado ao login, sem novo desafio por comando durante sua validade.

## Referências

[1]: https://supabase.com/docs/guides/auth/social-login/auth-google "Supabase — Sign in with Google"
[2]: https://supabase.com/docs/guides/auth/redirect-urls "Supabase — Redirect URLs"
