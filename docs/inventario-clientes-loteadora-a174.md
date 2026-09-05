# Inventário de Clientes Loteadora — A174

**Data:** 05 de setembro de 2026  
**Escopo:** leitura de implementação e contratos. Não houve abertura de lista, consulta de registros, visualização de anexos ou uso de dados pessoais.

| Camada | Comportamento atual | Limite preservado |
|---|---|---|
| Cadastro-base | Um cliente comprador em rascunho referencia Party e um papel temporal elegível. | Não apresenta CPF/CNPJ, contato, endereço, documento ou identificador técnico. |
| Elegibilidade | A interface oferece somente papéis devolvidos para o contexto; o servidor confirma novamente o vínculo. | A escolha de um item não concede alçada, nem cria venda ou contrato. |
| Anexo privado | Há intenção separada por cliente e estado opaco para o ciclo de um arquivo. | A tela não persiste ou exibe nome, URL, chave, tipo, tamanho, conteúdo, download ou visualização. |
| Envio | Quando houver intenção autorizada, o envio exige sessão, MFA recente, subject Supabase e contexto. | Não há envio sem intenção, nem uso de anexos como requisito comercial. |
| Continuidade | A venda em rascunho consulta a cobertura opaca de anexos por vínculo interno. | Não transfere documento, dados de cadastro, titularidade, proposta, contrato ou financeiro. |

## Lacuna para a próxima melhoria

A jornada protege dados e separa intenção de arquivo, mas não oferece uma leitura sintética, não identificável e por finalidade do estado de preparação do cliente. A melhoria seguinte deve criar um **quadro de prontidão privada por rascunho**, com categorias controladas e cobertura opaca, sem conteúdos, identificadores, arquivos, decisões automáticas ou efeito sobre vendas.

> O quadro proposto não será uma pontuação de pessoa, uma análise de crédito ou uma lista de documentos. Será somente uma organização de trabalho por finalidade, visível no escopo autorizado e sempre sujeita à conferência humana.
