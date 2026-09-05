# Cadastro de Loteamentos Dinâmico — A195/A196

**Autor:** Manus AI  
**Escopo:** Setor 01 da coluna Loteadora — Cadastro de Loteamentos  
**Estado:** Implementado e validado em ambiente ativo controlado; não publicado.

## Objetivo e limites

O Setor 01 foi reconstruído para substituir o fluxo linear de referência interna e Quadra por um **estúdio de cadastro**. A nova jornada organiza criação, seleção, edição, revisão por etapas, anexos privados e arquivamento lógico de loteamentos em rascunho. O trabalho não habilita estoque, venda, proposta, contrato, cobrança, pagamento, repasse, financeiro, mapa externo, coordenada, matrícula ou dados pessoais.

> O cadastro de loteamento é um rascunho operacional. Ele não comprova aprovação, viabilidade, registro, implantação ou disponibilidade comercial.

| Capacidade | Comportamento implementado | Limite de segurança |
|---|---|---|
| Criação dinâmica | Nome de trabalho, referência interna, enquadramento, localidade opcional, etapas planejadas, situação e nota interna. | Contexto ativo, subject ativo, grant, finalidade, MFA TOTP recente, correlação e auditoria redigida. |
| Edição | O mesmo loteamento pode ser selecionado e revisado sem recriar seu identificador. | Apenas rascunho do contexto autorizado; a referência segue única na organização. |
| Arquivamento | Retira o rascunho da lista ativa e preserva a trilha de auditoria. | Recusa arquivar se existirem Quadras ativas; não há exclusão em cascata. |
| Anexos | PDF, JPEG ou PNG de até 5 MB, com categoria e estado privado. | Não mostra nome original, URL, chave, conteúdo ou download; o upload exige MFA antes de processar o multipart. |
| Remoção de anexos | Arquiva a referência e remove a chave do metadado. | O objeto torna-se inacessível pela aplicação, conforme o modelo de armazenamento; não há exclusão física exposta ao app. |

## Evidências de segurança

As funções novas utilizam `SECURITY DEFINER`, `search_path` vazio e execução exclusiva pela camada de servidor. A tabela de anexos possui RLS habilitada e não concede leitura direta a papéis público ou autenticado. O reforço A196 também reescreveu o helper compartilhado da Loteadora para exigir organização ativa em todas as jornadas que o utilizam. Portanto, o Ambiente Demonstrativo em rascunho permanece bloqueado inclusive para cadastro-base, Quadras, preparação e anexos.

| Verificação | Resultado |
|---|---|
| Catálogo da tabela de anexos | RLS habilitada e leitura direta negada para papéis público e autenticado. |
| Catálogo das RPCs novas | Nove RPCs públicas conferidas com definer, `search_path` seguro e execução negada a papéis público e autenticado. |
| Helper transversal A196 | Confirmado como definer, com `search_path` seguro, execução privada e exigência de organização ativa. |
| Verificador de segurança | Sem alerta novo de acesso permissivo para A195/A196. Os avisos de RLS sem policy são preexistentes e intencionais: as tabelas permanecem sem acesso direto, com comandos somente por RPC controlada. A proteção de senhas vazadas do provedor permanece uma configuração externa não alterada neste marco. |

## Homologação controlada

Foi executado um ciclo positivo real no ambiente conectado, usando uma única organização ativa já elegível e um registro explicitamente sintético, sem identidade pessoal, cliente, valor, contrato ou documento real. O roteiro criou um loteamento de teste, atualizou seus campos de trabalho, armazenou um PDF sintético privado, registrou os metadados mínimos, removeu logicamente a referência do anexo e arquivou o loteamento.

Após o ciclo, uma consulta agregada confirmou que não restou loteamento sintético ativo, anexo sintético ativo ou referência de armazenamento vinculada. Nenhum dado real foi inserido, alterado ou revelado. A navegação autenticada pelo navegador conectado oscilou e não concluiu uma interação visual durante a execução; por isso, a evidência positiva deste marco é a persistência controlada por RPC no ambiente ativo, enquanto a interface foi revisada em estados seguros de desktop e móvel.

## Qualidade e revisão visual

Foram aprovados 12 testes dirigidos para contratos, serviços, rota privada, migrações, MFA e guarda de organização ativa. A suíte integral aprovou **465 testes**, juntamente com tipagem, build compatível com Netlify e verificação de integridade do diff. A revisão desktop e móvel confirmou que o estúdio apresenta o contexto bloqueado de forma inequívoca, mantém campos desabilitados sem autorização e organiza a jornada em quatro etapas visuais: identificação, revisão, documentos e ciclo do cadastro.

## Não habilitado neste marco

O marco não introduz anexos de clientes, documentos pessoais, contratos, valores, disponibilidade de lotes, estoque, mapa, financeiro, cobrança, pagamentos, repasses, integrações externas ou publicação. A importação ampliada de clientes permanece pendente e separada deste trabalho.
