# Validação A61 — seletores contextuais de Ativos Urbanos

## Objetivo

Remover a dependência de identificadores técnicos visíveis nos comandos de relacionamento de Party e estado de módulo, preservando o contexto e a validação server-side.

## Evidência desktop

Na rota autenticada de Ativos Urbanos, os comandos `Relacionar Party` e `Estado no módulo` exibiram somente os campos `Ativo autorizado` e `Party autorizada`. Sem dados de negócio no contexto atual, cada seletor comunicou explicitamente que não havia registros em rascunho, sem indicar a existência de registros fora do contexto.

Os textos de proteção permaneceram visíveis: o relacionamento é apenas uma alegação contextual e o estado interno não publica, reserva, vende, loca ou contrata o ativo. A lista de ativos preserva a referência de trabalho e o código interno, sem exibir o identificador técnico do ativo.

## Limites preservados

- As listas utilizam somente respostas já minimizadas e contextualizadas pelo servidor.
- A seleção na interface não concede autorização e não substitui a confirmação server-side de identidade, membership, grant, módulo, finalidade e vigência.
- Não foram criados ativos, Parties, vínculos, mudanças de estado, documentos, contratos, dados financeiros ou acessos.
