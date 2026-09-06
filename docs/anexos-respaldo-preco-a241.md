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
