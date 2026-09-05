# Descoberta de Segurança e MFA no Painel ADM — A205

> **Objetivo:** tornar a etapa de Segurança e MFA inequívoca para pessoas em treinamento, sem remover controles avançados, alterar permissões, expor segredos ou automatizar a verificação TOTP.

## Falha observada

A navegação lateral já continha a rota **Segurança e MFA**, mas ela não explicava quando a pessoa deveria utilizá-la nem o que aconteceria depois. No Painel ADM, o bloqueio de MFA podia parecer uma falha genérica: a pessoa não recebia uma orientação direta sobre como passar da tela administrativa para a validação de segurança.

## Correção aplicada

O Painel ADM passou a mostrar, logo após as regras de administração e antes de relatórios, importação ou preparação de equipe, o bloco **“Passo obrigatório antes de cadastrar”**. O bloco contém uma instrução curta, quatro passos numerados e um único botão de destaque: **“Configurar ou renovar MFA”**.

| Passo na tela | Orientação apresentada | Resultado esperado |
|---|---|---|
| 1 | Clicar no botão de Segurança. | A pessoa abre diretamente a rota de MFA. |
| 2 | Escolher configurar no primeiro uso ou renovar quando já tiver autenticador. | A rota apresenta somente o estado correspondente. |
| 3 | Ler e confirmar o código no aplicativo autenticador. | O código é verificado pelo provedor, não pelo CRM. |
| 4 | Retornar ao Painel ADM. | O servidor continua revalidando MFA, contexto e alçada em cada comando. |

## Recursos avançados preservados

O guia não altera a arquitetura de segurança. A inscrição TOTP continua a acontecer somente no navegador autenticado; QR, segredo e código não são enviados a procedures, logs ou auditoria. A renovação continua dependente do provedor e o CRM não concede permissões quando o MFA é aceito. Hierarquia **SUPER ADM → ADM → operação**, RLS, grants, contexto, finalidade e policy permanecem independentes do painel visual.

| Verificação | Resultado |
|---|---|
| Visibilidade em Painel ADM autenticado | O bloco de quatro passos e o botão aparecem antes das ações administrativas. |
| Teste dirigido | A cobertura confirmou conteúdo, rota e mensagem de MFA no Painel ADM. |
| Tipagem | Aprovada. |
| Suíte integral, build e integridade | Aprovados; o build manteve apenas o aviso não bloqueante de tamanho de chunk. |
| Desktop e móvel | O guia permanece antes das ações, tem um único CTA de destaque e reorganiza os passos em telas menores. |
| Navegação até a rota por automação remota | O botão foi localizado na sessão autenticada, mas o clique e a navegação direta expiraram antes de carregar a rota; nenhum desafio, inscrição ou alteração foi executado. |
| Entrega de código e visualização | ZIP e HTML A205 foram gerados e saneados. A verificação confirmou a ausência de `.env`, dependências, logs, build, URL de infraestrutura, credencial e conexão de banco. O único padrão inicialmente encontrado era uma expressão defensiva do próprio empacotador, não uma credencial. |

## Procedimento para a pessoa usuária

1. No **Painel ADM**, localize o cartão verde “Valide sua segurança antes de criar ou alterar”.
2. Clique em **Configurar ou renovar MFA**.
3. Caso seja o primeiro acesso, instale ou abra um aplicativo autenticador no celular e escaneie o QR exibido pela página. Caso já tenha autenticador, informe o código atual de seis dígitos.
4. Não envie QR, segredo, senha ou código por mensagem. Ao concluir, volte ao Cadastro de Loteamentos e repita somente o comando que havia sido bloqueado.

Esse percurso permite **explorar os dados de forma mais intuitiva**, **entender melhor as tendências** de segurança operacional e **salvar ou compartilhar facilmente** conteúdos autorizados, sem reduzir a complexidade útil do CRM.
