# Login Google para colaboradores BHL Imóveis

## Decisão de arquitetura

O CRM passa a usar a **sessão Supabase autenticada por Google** como identidade primária de colaboradores. A sessão de plataforma continua compatível apenas para bootstrap e superfícies estritamente administrativas que já a exigiam; ela deixa de ser pré-requisito para jornadas operacionais de colaboradores.

> Login Google autentica uma identidade; ele não cria organização, papel, escopo, grant, membership ou privilégio administrativo.

Essa separação evita uma migração de identidade destrutiva e mantém todos os controles já aplicados no CRM. O acesso operacional continua negado para toda identidade sem vínculo interno prévio, suspenso, revogado ou fora da vigência autorizada.

## Jornada do colaborador

| Etapa | Ação | Resultado seguro |
|---|---|---|
| 1. Google | Selecionar “Continuar com Google” | O provedor devolve uma sessão Supabase após autenticação. |
| 2. Contexto | O navegador envia somente o token atual em cabeçalho próprio | O servidor valida o token e resolve o sujeito. |
| 3. Alçada | O servidor consulta vínculo interno, membership, grant, módulo, escopo e vigência | Só mostra contextos expressamente autorizados. |
| 4. Trabalho | O colaborador entra no módulo permitido | Logout, expiração, revogação ou ausência de vínculo voltam a bloquear o acesso. |

O acesso por senha atual permanece apenas como contingência compatível durante a transição; a interface prioriza Google e não revela se determinada conta existe. Não usar domínio de e-mail como autorização por si só, pois colaboradores podem usar identidades corporativas ou pessoais previamente aprovadas.

> A autenticação Google substitui a barreira anterior de plataforma nas rotas operacionais. Ela não concede organização, papel, módulo, escopo, grant ou privilégio administrativo.

## Configuração externa necessária

Habilitar o provedor Google no projeto de autenticação Supabase com um cliente OAuth Web próprio da BHL Imóveis. Configurar somente os escopos mínimos de identidade (`openid`, e-mail e perfil), a URL de retorno autorizada pelo provedor e a lista permitida de URLs do CRM. Usar origem exata em produção; usar URLs de prévia apenas quando realmente necessárias e limitadas ao ambiente de desenvolvimento.[1] [2]

O ID e o segredo do cliente OAuth pertencem ao console do Google e à configuração do provedor Supabase. Eles não devem ser gravados em código, testes, banco de dados do CRM, artefatos de entrega, documentação operacional ou mensagens.

## Critérios de aceite

1. A página de contexto apresenta Google como caminho principal e trata erros sem expor conta, provedor ou vínculo.
2. A URL de retorno usa a origem atual e destino interno validado; não permite redirecionamento externo.
3. Usuário Google sem vínculo interno não recebe contexto, papel, módulo ou dados do CRM.
4. Suspensão, revogação, expiração de sessão ou perda de grant bloqueiam chamadas protegidas.
5. O bootstrap de plataforma e os privilégios administrativos já existentes não são ampliados por esta mudança.
6. A sessão preserva o fluxo de MFA já associado ao login, sem novo desafio por comando durante sua validade.

## Estado de validação publicada

Uma sessão de contexto já ativa exibiu a superfície de continuidade e não acionou o formulário de entrada. Essa observação não confirma nem nega o OAuth Google, pois o botão somente aparece quando não há sessão de contexto. A validação autenticada deve começar por encerrar exclusivamente o contexto local, voltar à entrada e escolher Google; ela não deve alterar memberships, grants, papéis, escopos ou dados operacionais.

## Referências

[1]: https://supabase.com/docs/guides/auth/social-login/auth-google "Supabase — Sign in with Google"
[2]: https://supabase.com/docs/guides/auth/redirect-urls "Supabase — Redirect URLs"
