# Preparação de deploy — Netlify

**Estado:** `preparado_sem_publicacao`  
**Escopo:** build do frontend Vite, Function serverless para Express/tRPC, redirects e matriz de ambiente.  
**Fora do escopo:** criação de site Netlify, conexão de conta, domínio, publicação, variáveis com valores reais e comandos administrativos ativos.

> O Netlify serve o frontend pelo CDN. O backend não pode depender de um processo Express persistente: ele é adaptado para uma Function. A publicação só poderá avançar quando a função, a autenticação e os segredos de produção tiverem sido testados no contexto correto.

## Artefatos preparados

| Artefato | Finalidade | Salvaguarda |
| --- | --- | --- |
| `server/app.ts` | Concentra as rotas Express reaproveitáveis pelo servidor local e pela Function. | Não entrega arquivos estáticos dentro da Function. |
| `netlify/functions/api.ts` | Empacota o Express/tRPC como handler serverless. | Não contém URL, secret ou regra de privilégio. |
| `netlify.toml` | Define build, diretório publicado, Function e redirects. | `/api/*` e `/manus-storage/*` vêm antes do fallback `/* → index.html`. |
| `server/netlifyDeployment.test.ts` | Testa ordem de redirects e ausência de secret em configuração. | Falha se uma service key for gravada no arquivo. |

## Matriz de variáveis por ambiente

| Variável | Escopo Netlify | Production | Deploy Preview | Observação |
| --- | --- | --- | --- | --- |
| `SUPABASE_URL` | Functions | Projeto oficial | Projeto de preview ou valor bloqueado | URL não é secret, mas fica fora do frontend enquanto o cliente Supabase não existir. |
| `SUPABASE_SERVICE_ROLE_KEY` | Functions, marcada como secret | Secret do projeto oficial | Secret exclusivo de preview ou ausente | Nunca `VITE_*`, nunca `netlify.toml`, nunca commit. |
| `JWT_SECRET` | Functions, secret | Valor de produção | Valor distinto | Não reutilizar valores entre contextos. |
| `OAUTH_SERVER_URL`, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL` | Conforme uso real de OAuth | Configuração aprovada | Configuração de preview | O callback precisa ser validado no domínio publicado. |
| `DATABASE_URL` | Functions, secret | **Não configurar como solução final** | **Não configurar** | Dependência remanescente do template MySQL; bloquear publicação administrativa até a migração efetiva para Supabase Auth/DB. |

## Gate obrigatório antes de publicação

1. `pnpm test`, `pnpm check` e `pnpm run build:netlify` passam no repositório.
2. A Function responde no Deploy Preview, sem segredo no bundle ou no frontend.
3. O fluxo de login usa a autoridade aprovada de Supabase; a dependência transitória do template MySQL não pode ser usada para ativar administração.
4. `SUPABASE_SERVICE_ROLE_KEY` é escopo Functions, marcada como secret, e possui valor de preview diferente do valor de produção quando houver preview com mutações.
5. Os testes permitir/negar, `AdminAuditEvent`, MFA e RPCs administrativos passam antes de qualquer comando sensível ser habilitado.
6. O usuário confirma explicitamente a publicação. Preparar esta configuração **não** publica o site.

## Validação local da preparação

O repositório passou em `pnpm test`, `pnpm check` e `pnpm run build:netlify`. O último comando gerou o frontend em `dist/public` e empacotou a Function `api` para conferência local.

A CLI oficial do Netlify foi invocada sem autenticação, inicialização ou site vinculado e respondeu que não encontrou `project ID`. Isso é esperado nesta etapa: a CLI só consegue executar o build gerenciado depois de `netlify init` ou `netlify link`. Nenhum site foi criado, nenhuma conta foi conectada e nenhuma publicação foi disparada.

## Situação da conta Netlify

A sessão Netlify foi autenticada na equipe do usuário. A lista de projetos está vazia: não há site existente que possa ser vinculado por `netlify link`. O painel oferece duas rotas: importar um repositório Git (recomendada para deploys reprodutíveis e previews por mudança) ou subir arquivos manualmente (não recomendado para esta aplicação, pois perde a trilha de build e o fluxo de Function).

Nenhuma dessas rotas foi acionada. A escolha do provedor Git, a importação do repositório e a primeira publicação exigem confirmação explícita antes de qualquer clique de criação ou deploy.

## Referências

[1] [Netlify — Vite on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)  
[2] [Netlify — Express on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/express/)  
[3] [Netlify — Redirects and rewrites](https://docs.netlify.com/manage/routing/redirects/overview/)  
[4] [Netlify — Environment variables overview](https://docs.netlify.com/build/environment-variables/overview/)
