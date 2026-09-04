# A107 — Empreendimentos e Construtoras em Vendas Urbanas

## Escopo entregue

O setor **Empreendimentos e Construtoras** deixou de ser um bloqueio estrutural e passou a oferecer uma jornada de rascunho mínimo. O objeto criado contém somente referência interna em código, tipo estrutural e fase de trabalho. Ele não registra nem expõe construtora vinculada, correspondente, endereço, incorporação, torre detalhada, condomínio detalhado, unidade, estoque, preço, disponibilidade, anúncio, proposta, reserva, contrato, comissão, cobrança, pagamento, repasse ou integração externa.

## Proteções aplicadas

A persistência é exclusiva das RPCs protegidas por identidade canônica, organização, módulo `vendas_urbanas`, finalidade, membership, grant, vigência e policy. A operação possui correlação idempotente e auditoria com payload redigido. A tabela opera com RLS, privilégios diretos revogados e policy restritiva `using (false)` / `with check (false)`; assim, o único caminho permitido permanece sendo o servidor com service role e RPCs controladas.

## Verificação no banco

A migração criou somente a estrutura técnica, sem inserir, editar ou excluir registros. A verificação posterior confirmou que o novo recurso não permanece no conjunto de alertas de “RLS habilitada sem policy”. Os avisos informativos de tabelas anteriores e o aviso de proteção contra senhas vazadas pertencem a escopos preexistentes e não foram alterados neste marco.

## Revisão visual

A rota do setor foi revisada em modo de leitura e apresenta somente o painel de estrutura urbana, com referência interna, estrutura principal e fase de trabalho. Sem contexto autorizado, todos os controles permanecem indisponíveis e a tela informa que não ocorrerá leitura ou criação. A navegação continua exibindo o setor 03 como ativo, os setores contextuais separados e os setores de propostas/contratos e Financeiro bloqueados.

## Verificação complementar: camada de Construtoras

A rota passou a apresentar áreas distintas para **Estrutura em rascunho**, **Construtora em rascunho** e **Relação estrutural**. A seleção de construtora depende exclusivamente de uma Party jurídica retornada pelo contexto autorizado; sem esse contexto, nenhuma consulta útil ou comando é liberado. Não há campo de cadastro fiscal, contato, documento, procurador, correspondente, credencial, unidade, estoque, preço, anúncio, proposta, contrato ou superfície econômica.

Na leitura integral da página, os controles de estrutura, construtora e relação apareceram em blocos distintos, sem sobreposição de campos. A barra setorial permanece no setor 03, com propostas/contratos e Financeiro bloqueados. Sem contexto, os comandos permanecem desabilitados e a tela informa explicitamente que não haverá leitura ou criação.
