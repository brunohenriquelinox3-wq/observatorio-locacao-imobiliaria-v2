# Evidências oficiais — Preparação de deploy Netlify

**Finalidade:** orientar a configuração de deploy do CRM sem publicar, sem mover segredos para o repositório e sem assumir que o servidor Express atual é automaticamente compatível com runtime serverless.

## Achados relevantes

| Tema | Evidência oficial | Implicação para o CRM |
| --- | --- | --- |
| Vite | O Netlify detecta projetos Vite e sugere `npm run build` com diretório `dist`; SPAs precisam de rewrite para `index.html` em rotas de histórico. | O build de frontend deve conservar uma rota SPA de fallback, mas não pode engolir `/api/*`. |
| Express | Express roda no Netlify como **Netlify Function**; o app deve ser adaptado para handler serverless e as rotas precisam de rewrite para `/.netlify/functions/...`. | O atual processo Node persistente/tRPC precisa de adaptação explícita; não deve ser publicado como se fosse um servidor sempre ativo. |
| Redirects | Rules podem estar em `_redirects` ou `netlify.toml`, são processadas em ordem e o primeiro match vence. | A regra `/api/*` deve vir antes da regra SPA `/*`; o contrário poderia encaminhar RPC para o frontend. |
| Variáveis | O Netlify permite variáveis por contexto e escopo; valores sensíveis devem ser definidos no UI/CLI/API, não em `netlify.toml` ou commit. | `SUPABASE_SERVICE_ROLE_KEY` deve existir apenas em escopo Functions, com valor distinto em Production e Deploy Preview quando aplicável. |

## Decisão de preparo

Antes de conectar um site Netlify ou executar publicação, o projeto precisa receber uma camada de função serverless para tRPC/Express, um `netlify.toml` sem segredos, redirects ordenados e uma matriz de variáveis por ambiente. A preparação não autoriza deploy público, domínio ou cópia de secret para arquivos.

## Referências

[1] [Netlify — Vite on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)  
[2] [Netlify — Express on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/express/)  
[3] [Netlify — Redirects and rewrites](https://docs.netlify.com/manage/routing/redirects/overview/)  
[4] [Netlify — Environment variables overview](https://docs.netlify.com/build/environment-variables/overview/)
