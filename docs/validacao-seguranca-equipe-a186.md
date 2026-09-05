# Validação de segurança — colaboradores e corretores A186

**Data:** 05 de setembro de 2026  
**Escopo:** painel SUPER ADM, Painel ADM e jornada de solicitação própria. A validação não criou solicitação, membership, grant, usuário, convite ou acesso ativo.

## Separação de autenticação e alçada

As capturas sem subject Supabase confirmaram que a sessão da plataforma, isoladamente, não habilita a solicitação própria nem a preparação de equipe. A jornada `/acesso-equipe` orienta a conexão em `/entrar` e mantém o botão bloqueado. O Painel ADM também passou a exigir `foundation.identity` em estado `connected` antes de liberar visualmente a preparação de delegação.

| Caso validado | Comportamento confirmado |
|---|---|
| Sessão de plataforma sem subject Supabase | Solicitação própria permanece bloqueada. |
| ADM sem subject Supabase | Preparação de colaborador/corretor permanece bloqueada. |
| ADM com autorização futura válida | Pode preparar somente `operator` na própria organização, com módulos contidos e vigência explícita. |
| SUPER ADM com autorização futura válida | Pode preparar os papéis organizacionais permitidos, sem criar papel de plataforma. |
| Aceite do trabalhador | É uma etapa separada pelo próprio subject, com MFA e revalidação no servidor. |
| Tela administrativa | Exibe solicitações por ordinal e estado redigido, sem dados pessoais ou identificadores técnicos. |

## Dados de esquema e acesso direto

A verificação agregada no Supabase confirmou RLS habilitado na tabela de solicitações de equipe e ausência de leitura direta para os papéis públicos e autenticados. O acesso ocorre exclusivamente pelas RPCs protegidas, que revalidam actor, subject, organização, papel, escopo, finalidade, MFA, correlação e idempotência.

O verificador de segurança listou o padrão de “RLS habilitado sem policy” em tabelas que seguem a arquitetura existente de **negação direta + RPC SECURITY DEFINER**. Esse aviso é informativo no contexto atual: a consulta independente confirmou que os papéis diretos não possuem privilégio `SELECT` sobre a nova tabela. Não foi aplicada policy permissiva apenas para remover o aviso.

## Testes e interface

Foram aprovados testes dirigidos de serviço, roteador, migração, painel de gestão, solicitação própria e elegibilidade por subject; também foram aprovados a suíte completa, a tipagem, o build local compatível com Netlify e a integridade do diff. A interface foi revisada em desktop e móvel sem dados, mostrando ações bloqueadas e textos de limite de modo inequívoco.

## Limites preservados

Não houve envio de e-mail, convite externo, senha, link sensível, comunicação, provisionamento automático, acesso financeiro, contrato, comissão, folha, dado de RH, documento, cobrança, pagamento, repasse ou integração externa. A ativação real continua a depender da sequência completa de solicitação própria, preparação autorizada e aceite pessoal com MFA.
