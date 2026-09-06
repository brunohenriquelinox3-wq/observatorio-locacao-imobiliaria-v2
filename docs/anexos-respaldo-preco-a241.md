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
