# Guia completo — Upload no Netlify e deploy completo do CRM

**Projeto:** Observatório da Locação / CRM Imobiliário  
**Estado deste guia:** preparado para prévia estática e para futura implantação completa.  
**Regra de segurança:** não há secret key, senha, URL de banco ou `service_role` dentro do pacote estático.

> O arquivo ZIP entregue com este guia é uma **prévia estática do observatório**. Ele serve para apresentar a página pública e as rotas de estratégia. O painel administrativo e qualquer comando de API continuam deliberadamente indisponíveis nesse modo. Para o CRM com login, Functions, Supabase e operações administrativas, use o fluxo por Git descrito na segunda parte.

## 1. Escolha o caminho correto

| Objetivo | Caminho | Pode fazer agora? | O que funciona | O que permanece bloqueado |
| --- | --- | --- | --- | --- |
| Mostrar o Observatório e a estratégia em uma URL Netlify. | Upload do ZIP estático. | Sim. | Página pública, rota `/crm`, navegação SPA e materiais visuais. | tRPC, login, OAuth, Supabase server-side, Super Admin, convites, grants e qualquer comando. |
| Colocar o CRM completo em pré-produção/produção. | Importar repositório Git privado. | Somente após o gate técnico e confirmação de publicação. | Frontend, Function Netlify, API, segredos server-side e integrações aprovadas. | Comandos administrativos até migrations/RPCs/testes específicos estarem concluídos. |

## 2. Upload da prévia estática no Netlify

### 2.1 Antes de subir

Baixe o arquivo `crm-netlify-static-preview.zip` que acompanha a entrega. Não adicione `.env`, URL de banco, secret key, senha, `sb_secret_...`, `service_role` ou qualquer arquivo privado ao ZIP.

O pacote contém `index.html`, `assets/`, imagens de configuração permitidas, o arquivo `_redirects` de fallback de SPA e um README de limite operacional. O `_redirects` faz rotas de navegação voltarem a `index.html`; ele não implementa API.

### 2.2 Passo a passo no painel Netlify

1. Entre em [Netlify Projects](https://app.netlify.com/teams/brunohenriquelinox1/projects).
2. Na área **Upload your project files**, clique em **browse files to upload**.
3. Selecione `crm-netlify-static-preview.zip` sem alterar o conteúdo.
4. Aguarde a criação da URL temporária gerada pelo Netlify.
5. Abra a URL e valide as rotas `/` e `/crm` em uma janela anônima.
6. Anote a URL, data e resultado da verificação. Não use a prévia para autenticar, cadastrar principal, convidar pessoa, criar organização, liquidar pagamento ou coletar dado de cliente.

O upload manual cria uma publicação estática. Confirme visualmente que não há segredo no navegador e que a tela administrativa continua exigindo uma implementação server-side posterior.

## 3. Checagem de prévia após upload

| Verificação | Resultado esperado | Se falhar |
| --- | --- | --- |
| Página inicial | O Observatório abre com imagens e tipografia. | Refaça o upload usando o ZIP original, sem extraí-lo e recomprimir. |
| `/crm` | A estratégia abre sem erro 404. | Confirme que `_redirects` está presente no ZIP. |
| `/administracao` | O gate de acesso pode ser exibido, mas login/ações não devem funcionar no modo estático. | Não tente corrigir adicionando secret key ao frontend. Use o fluxo Git/Function. |
| Console do navegador | Não há `SUPABASE_SERVICE_ROLE_KEY`, senha, URL PostgreSQL ou token de servidor. | Suspenda a divulgação da URL, remova o segredo da origem e gere novo pacote. |

## 4. Deploy completo recomendado — Git privado + Netlify Functions

O deploy completo não usa o upload ZIP. Ele requer um repositório Git privado, pois o Netlify precisa executar o build, empacotar `netlify/functions/api.ts` e manter o histórico de cada alteração.

### 4.1 Preparar o repositório

1. No painel Manus, exporte o projeto para um repositório **privado** no GitHub.
2. Confirme que o repositório contém `netlify.toml`, `netlify/functions/api.ts`, `server/app.ts` e os arquivos de migrations em `supabase/migrations/`.
3. Confirme que `.env*` permanece ignorado e que não há nenhuma secret key no histórico.
4. No Netlify, escolha **Import a Git repository → GitHub**, autorize somente o acesso necessário e selecione esse repositório privado.

### 4.2 Configuração do site no Netlify

| Campo | Valor aprovado |
| --- | --- |
| Build command | `pnpm run build:netlify` |
| Publish directory | `dist/public` |
| Functions directory | `netlify/functions` (lido de `netlify.toml`) |
| Node | `22` (declarado no `netlify.toml`) |
| Redirect API | `/api/* → /.netlify/functions/api/:splat` |
| Redirect SPA | `/* → /index.html`, processado depois de API e storage |

Não altere a ordem dos redirects: se o fallback SPA vier antes de `/api/*`, chamadas tRPC poderão receber HTML em vez de resposta de API.

### 4.3 Variáveis de ambiente

Defina valores pela interface **Site configuration → Environment variables** do Netlify; nunca em `netlify.toml` ou commit. Marque valores sensíveis como secret quando a conta/plano permitir o controle correspondente.

| Variável | Escopo mínimo | Regra |
| --- | --- | --- |
| `SUPABASE_URL` | Functions | Use o projeto Supabase aprovado para aquele contexto. |
| `SUPABASE_SERVICE_ROLE_KEY` | Functions | Somente backend; nunca `VITE_*`; valor diferente para preview quando a preview puder mutar. |
| `JWT_SECRET` | Functions | Diferente entre produção e preview. |
| `OAUTH_SERVER_URL`, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL` | Conforme o fluxo OAuth efetivo | Validar callback no domínio Netlify antes de habilitar login. |
| `DATABASE_URL` | Não configurar como solução administrativa final | É legado do template; a autoridade aprovada para administração é Supabase. |

### 4.4 Gate antes do primeiro deploy completo

Só clique em **Deploy site** após confirmar todos os itens abaixo.

1. `pnpm test`, `pnpm check` e `pnpm run build:netlify` passaram no projeto.
2. A Function está presente em `netlify/functions/api.ts` e não contém segredos.
3. O projeto Supabase correto possui A0/A0.1, RLS, policies de negação e zero dados administrativos iniciais.
4. Variáveis de servidor foram configuradas exclusivamente no Netlify e não aparecem no repositório.
5. O callback OAuth e os cookies foram testados no domínio de preview, sem expor dados de cliente.
6. A pessoa responsável aprovou explicitamente a publicação.

## 5. Próximo passo após a prévia estática

Depois de subir e validar a prévia estática, volte com a URL gerada. A próxima construção do CRM será a migration de comandos controlados — não o bootstrap do Super Admin. Ela incluirá idempotência, alçada, `AdminAuditEvent`, testes permitir/negar e uma nova aprovação antes de ativar qualquer ação real.

## Referências

[1] [Netlify — Vite on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)  
[2] [Netlify — Express on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/express/)  
[3] [Netlify — Redirects and rewrites](https://docs.netlify.com/manage/routing/redirects/overview/)  
[4] [Netlify — Environment variables overview](https://docs.netlify.com/build/environment-variables/overview/)
