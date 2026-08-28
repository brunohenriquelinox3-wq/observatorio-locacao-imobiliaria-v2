# A25 — Upload privado de anexo: contrato de corte

## Finalidade

Permitir a preparação controlada de anexos privados associados a uma intenção A24 e a um cliente comprador em rascunho, exclusivamente dentro do contexto autorizado de Loteadora.

## Limites deste corte

O upload deverá ser processado apenas no servidor. O cliente não recebe chaves de armazenamento, URL permanente, chave de objeto ou lista de arquivos de outros contextos. A validação aceita somente arquivo de teste sintético no desenvolvimento, limitado a 2 MB, em `application/pdf`, `image/jpeg` ou `image/png`.

## Exclusões

Este corte não valida documento real, não extrai conteúdo, não lê OCR, não exibe ou baixa arquivo, não permite compartilhamento externo, não cria contratos, boletos, pagamentos, repasses ou efeitos comerciais.

## Guardas obrigatórias

Toda chamada exige identidade, organização, módulo `loteadora`, finalidade, grant vigente, intenção A24 e cliente comprador no mesmo contexto. O servidor gera a chave privada, registra apenas metadados reduzidos e grava auditoria redigida. Falhas não enumeram objetos externos.
