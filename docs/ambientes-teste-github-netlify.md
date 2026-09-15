# Ambientes de teste e deploy contínuo

## Objetivo

O projeto passa a usar o GitHub como fonte externa de versionamento e revisão e o Netlify como ambiente padrão de teste. A produção continua protegida: o fluxo automático não usa `--prod`, não substitui o domínio publicado e não cria deploy de produção por agendamento.

## Fluxo aprovado

| Evento | Validação | Resultado |
|---|---|---|
| Pull request para `main` | Instalação com lockfile, tipagem, testes e build Netlify | A revisão fica bloqueada quando qualquer etapa falha; o Netlify pode gerar Deploy Preview quando o site estiver conectado ao repositório. |
| Push em `main` | Instalação com lockfile, tipagem, testes e build Netlify | Deploy de rascunho no alias de teste `crm-teste`; nunca produção. |
| Execução manual | Mesma validação | Deploy de rascunho no alias de teste após sucesso. |
| Agendamento diário | 09:17 e 17:17, horário de São Paulo | Dois deploys de teste por dia, fora do início exato da hora, somente após as validações. |

## Segredos necessários no GitHub

O workflow `.github/workflows/test-deploy.yml` não contém credenciais. Para habilitar o job de deploy, o repositório deve ter estes **Repository secrets**:

- `NETLIFY_AUTH_TOKEN`: token pessoal do Netlify, criado em **Applications → Personal access tokens**.
- `NETLIFY_SITE_ID`: Project ID do site Netlify destinado ao ambiente de teste.

Os segredos não devem ser colocados em arquivos, commits, variáveis públicas, logs ou mensagens. O workflow falha de forma explícita quando algum segredo não estiver configurado.

## Por que Netlify antes do Render

O projeto já possui `netlify.toml`, funções Netlify e um comando `build:netlify` que valida o frontend e o backend serverless. Por isso, o Netlify atende o ambiente de teste sem introduzir outro serviço. O Render permanece opcional e desativado; ele só deve ser conectado caso surja uma necessidade concreta incompatível com as funções Netlify, como um processo persistente independente.

## Operação segura

A rotina deve continuar preservando dados e ambientes existentes. Nenhuma execução automática pode criar venda, contrato, parcela, boleto, mensagem externa, acesso bancário, baixa ou pagamento. O deploy é uma cópia de teste do código validado, não uma operação de negócio. Mudanças futuras nos scripts, no `netlify.toml`, nas funções ou no workflow exigem nova validação integral e atualização do Manual do Operador quando afetarem uma jornada da Loteadora.
