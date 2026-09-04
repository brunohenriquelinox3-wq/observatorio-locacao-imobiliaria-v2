# Clientes Loteadora: leitura segura e regressão — A166

**Data:** 04 de setembro de 2026  
**Escopo:** Setor 03 da coluna Loteadora, com contexto já confirmado pelo servidor e sem executar comandos de cadastro ou anexo.

## Evidência de leitura

A estrutura da jornada preserva o cadastro-base separado do fluxo de vendas. As consultas de clientes compradores e de intenções privadas só são habilitadas quando há sessão autenticada e contexto válido. Os comandos de cliente e intenção privada permanecem vinculados a submissão explícita de formulário; não ocorrem durante o carregamento da página.

| Controle | Resultado |
|---|---|
| Ordem setorial | Preservada: Cadastro de Loteamentos, Estoque/Mapa de Lotes, Clientes Loteadora, Sócios e Parceiros e Vendas de Lotes. |
| Contexto | Necessário para leitura e rascunhos; a seleção visual não concede alçada. |
| Cadastro de cliente | Somente por submissão explícita e validação do servidor. |
| Intenção de anexo | Somente por submissão explícita; não retorna arquivo, nome, URL, chave ou conteúdo na tela. |
| Financeiro | Permanece bloqueado, sem consultas ou comandos econômicos. |

## Regressão adicionada

O teste da coluna Loteadora agora exige que as consultas de clientes e intenções privadas dependam de sessão e contexto válidos. Ele também verifica que as mutações de cliente comprador e intenção privada somente aparecem vinculadas às respectivas submissões explícitas.

A validação dirigida e a suíte completa, tipagem, build Netlify local e integridade do diff foram aprovados. Não houve criação, edição, exclusão, importação, exportação, upload, alteração de contexto, alçada, contrato, proposta material, valor, cálculo, cobrança, pagamento, repasse, integração externa ou publicação.
