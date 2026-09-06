# Anexos privados de respaldo para preço — A241

## Escopo

O respaldo documental deve ser armazenado como objeto privado e associado à política-base em Preparação. O arquivo não se torna público, não recebe URL persistida no banco e não é interpretado pelo CRM como contrato, autorização de venda, cobrança ou lançamento financeiro.

| Camada | Regra proposta |
|---|---|
| Intenção | Uma intenção de anexo é criada somente após autoridade ativa, contexto e MFA recente. |
| Armazenamento | O arquivo passa pelo servidor, aceita somente PDF, JPEG ou PNG com assinatura compatível e fica no armazenamento privado. |
| Metadados | Persistem apenas identificador, categoria, estado, tipo, tamanho, data e vínculo de política; nome original, bytes e URL ficam fora da leitura comum. |
| Vínculo | A associação exige que anexo, política e loteamento pertençam à mesma organização e ao mesmo cadastro. |
| Acesso | A listagem retorna estado e metadados mínimos; leitura do objeto exige novo comando protegido. |
| Remoção | A remoção é lógica: elimina a referência de armazenamento e arquiva o metadado, preservando auditoria redigida. |

> O primeiro corte prepara a infraestrutura e a interface vazia. Nenhum contrato, distrato, deliberação, documento de cliente ou arquivo real será anexado durante a implantação.

## Revisão autenticada

A central de condições passou a mostrar a contagem agregada de anexos privados do cadastro e o botão **Adicionar respaldo privado**. O botão encaminha ao módulo Documentos, pré-selecionando a categoria interna `other`, que usa a rota privada existente com MFA, validação de tipo/tamanho/assinatura, armazenamento privado e metadados opacos. A revisão não selecionou nem enviou arquivo.

## Vínculo auditável A242

A revisão autenticada confirmou o painel recolhido **“Respaldo privado vinculado”** dentro da política formal. Ao abrir, ele permite associar somente um anexo privado já registrado a uma política ou condição do cadastro selecionado. A escolha apresenta rótulos opacos de documento, sem nome original, URL, chave, conteúdo ou download. Como não há anexo registrado no cadastro, o seletor permanece sem opção e nenhum vínculo foi criado durante a revisão.

## Encaminhamento condicionado à evidência A243

A revisão autenticada confirmou que o cadastro mantém **0 anexos privados**, nenhuma condição registrada e a política-base em Preparação com uma exceção. A interface deixa claro que uma condição pode ser preparada, mas o encaminhamento só fica disponível quando houver política-base aprovada sem exceções, respaldo documental declarado completo e ao menos um vínculo privado ativo. A função protegida A243 repete essa verificação no servidor; nenhum preço, condição, anexo ou vínculo foi criado durante a revisão.

| Resultado de validação A243 | Resultado |
|---|---|
| Serviço e migração | A função de encaminhamento v2 exige um vínculo ativo a anexo privado registrado. |
| Interface | A condição exibe a contagem de vínculos e o aviso de respaldo pendente antes do encaminhamento. |
| Validação integral | 219 arquivos de teste e 560 testes aprovados; tipagem, build e integridade de diff aprovados. |
| Exceção de build | Apenas o aviso não bloqueante de chunks grandes permaneceu. |

## Política-base com evidência obrigatória A244

A revisão autenticada confirmou que a política-base em Preparação exibe a contagem de **0 respaldos privados**, sua exceção pendente e a orientação **“Resolva todas as exceções antes de encaminhar.”** O botão permanece indisponível. Quando não houver exceções, a mesma função protegida exigirá ao menos um vínculo ativo de evidência privada antes do encaminhamento. Nenhum anexo, vínculo, encaminhamento ou aprovação foi acionado durante a revisão.

| Resultado de validação A244 | Resultado |
|---|---|
| Serviço e migração | A função protegida de encaminhamento v2 exige vínculo privado ativo, preservando MFA, contexto, idempotência e auditoria redigida. |
| Interface | A política mostra a contagem de respaldos e explica, sem expor arquivo ou preço, se a pendência decorre de exceção ou de evidência ausente. |
| Validação dirigida | 3 arquivos e 39 testes aprovados; tipagem e integridade de diff aprovadas. |
| Validação integral | 219 arquivos de teste e 563 testes aprovados; tipagem, build Netlify e integridade de diff aprovados. |
| Exceção de build | Apenas o aviso não bloqueante de chunks grandes permaneceu. |

A prévia foi reiniciada e a revisão autenticada repetida após o reinício. A política permaneceu em Preparação com **163 linhas**, **1 exceção** e **0 respaldos privados**; a mensagem de exceção continuou anterior ao encaminhamento e nenhum comando material foi disparado. Os registros posteriores ao reinício não apresentaram o antigo erro de exportação de correção manual. O ZIP de código e o HTML autônomo A244 foram gerados e saneados; a verificação confirmou as exclusões operacionais e a ausência de padrões concretos de credencial, conexão, chave privada ou endpoint no HTML.

## Retirada governada de política-base A245

A retirada foi restringida à política **encaminhada** e ainda não aprovada. A revisão autenticada confirmou que a política atual segue em Preparação, com sua exceção pendente, sem ação de retirada disponível e sem mutação executada. A função protegida registra somente a transição lógica de `submitted` para `withdrawn`, preserva linhas, vínculos de evidência, matriz e histórico, e depende de autoridade ativa, MFA, contexto, organização, correlação e auditoria redigida.

| Resultado de validação A245 | Resultado |
|---|---|
| Serviço e migração | A retirada chama exclusivamente a função protegida e aceita somente política submetida, ainda não aprovada e do cadastro em estruturação autorizado. |
| Interface | A ação aparece exclusivamente em política encaminhada; a política preparada com exceção permanece sem retirada e sem encaminhamento disponível. |
| Validação dirigida | 3 arquivos e 42 testes aprovados; tipagem e integridade de diff aprovadas. |
| Validação integral | 219 arquivos de teste e 566 testes aprovados; tipagem, build Netlify e integridade de diff aprovados. |
| Exceção de build | Apenas o aviso não bloqueante de chunks grandes permaneceu. |

## Evidência na política-fonte da correção manual A246

A correção manual passou a exigir, no servidor, pelo menos um vínculo ativo de anexo privado registrado na política-fonte. A interface mostra somente a contagem agregada de respaldo e mantém a preparação indisponível quando a política-fonte não tem vínculo. A revisão autenticada confirmou a política em Preparação com **0 respaldos privados** e nenhuma correção preparada; não houve anexo, vínculo, política, linha ou comando material durante a revisão.

| Resultado de validação A246 | Resultado |
|---|---|
| Serviço e migração | A correção usa a função v2, que exige evidência ativa e anexo privado registrado na política-fonte antes de criar uma nova versão. |
| Interface | O formulário mostra somente a contagem agregada de vínculos e bloqueia a preparação sem respaldo ativo. |
| Validação dirigida | 3 arquivos e 44 testes aprovados; tipagem e integridade de diff aprovadas. |
| Validação integral | 219 arquivos de teste e 568 testes aprovados; tipagem, build Netlify e integridade de diff aprovados. |
| Exceção de build | Apenas o aviso não bloqueante de chunks grandes permaneceu. |
