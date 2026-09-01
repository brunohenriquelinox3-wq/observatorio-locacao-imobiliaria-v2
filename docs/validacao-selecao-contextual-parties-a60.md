# Validação A60 — seleção contextual de Parties

## Objetivo

Eliminar a exigência visual de identificador técnico para a atribuição de papel temporal, reutilizando exclusivamente a leitura já autorizada pelo contexto organizacional atual.

## Evidência de interface

Na rota protegida do Núcleo de Cadastros, a organização autorizada e a finalidade foram exibidas sem revelar identificadores técnicos. Com o contexto atual sem Parties em rascunho, o seletor apresentou o estado explícito de ausência, permaneceu sem opções operacionais e informou que não revela a existência de registros em outros contextos.

O formulário de papel temporal passou a apresentar o campo `Party autorizada` e a nota de segurança correspondente. A lista de rascunhos não exibe mais o identificador técnico da Party. A tela permaneceu em estado vazio, sem criação, edição, vínculo ou uso de dados de negócio.

## Limites preservados

- A seleção visual não autoriza o comando; a validação contextual continua no servidor.
- A leitura permanece limitada a organização, módulo, finalidade, membership, grant e vigência autorizados.
- Não foram criadas Parties, papéis, documentos, contatos, contratos, dados financeiros ou acessos.
