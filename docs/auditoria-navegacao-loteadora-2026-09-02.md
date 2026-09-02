# Auditoria de navegação — Loteadora

**Data:** 02 de setembro de 2026  
**Escopo:** estrutura visual e navegação da coluna Loteadora; sem avaliação de dados, permissões ou operações materiais.

## Evidências verificadas

As referências fornecidas mostram uma navegação lateral de aplicação: identidade e perfil no topo, grupos titulados, itens compactos com ícone, separadores claros, navegação expansível e saída persistente. A tela atual do CRM concentra cadastro de loteamento, quadras, lotes, partes, clientes e rascunhos numa única página longa, com títulos serifados, bloco editorial e cartões grandes. Essa implementação não traduz a arquitetura setorial aprovada.

## Correção confirmada

A coluna **Loteadora** deve abrir um espaço operacional próprio, com setores independentes e nesta ordem:

1. **Cadastro de Loteamentos**;
2. **Estoque/Mapa de Lotes**;
3. **Clientes Loteadora**;
4. **Sócios e Parceiros**;
5. **Financeiro** — visível apenas como setor futuro bloqueado, sem valores, percentuais, cálculos, cobrança, pagamentos, repasses, contratos ou integrações.

O redesenho deve usar uma shell de CRM densa e responsiva, com navegação contextual da Loteadora, indicador de contexto autorizado, área principal para o setor ativo e controles de leitura. Nenhuma seleção visual poderá conceder autorização, e não haverá alteração de RLS, grants, membership, escopos ou dados.

## Verificação pós-correção

As rotas de **Cadastro de Loteamentos**, **Estoque/Mapa de Lotes**, **Clientes Loteadora**, **Sócios e Parceiros** e **Financeiro** foram renderizadas sem página não encontrada. Em desktop, cada rota apresenta apenas o setor ativo, contexto de trabalho, seletor de organização e a navegação contextual de seis setores. Em mobile, a abertura e os campos permanecem em uma coluna, sem sobreposição ou rolagem horizontal na primeira viewport.

O setor Financeiro apresenta somente um aviso bloqueado; não há campos, consultas ou comandos econômicos na página. Os screenshots de validação não têm contexto autorizado porque foram capturados sem sessão autenticada, portanto a visualização de dados permaneceu vazia por segurança.

## Referências fornecidas

- Screenshot da tela atual de Loteadora, enviado pelo usuário em 02/09/2026;
- Screenshot da navegação de referência do CRM Hincrível, enviado pelo usuário em 02/09/2026.
