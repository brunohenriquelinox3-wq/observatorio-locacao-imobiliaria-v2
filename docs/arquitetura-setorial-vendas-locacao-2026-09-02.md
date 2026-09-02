# Arquitetura setorial obrigatória — Vendas Urbanas e Locação

**Data:** 02 de setembro de 2026  
**Status:** requisito de interface aprovado para implementação.  
**Limite:** esta divisão organiza navegação e superfícies já existentes. Não cria dados, contratos, cobranças, pagamentos, repasses, valores, percentuais, cálculos ou integrações.

## Regra permanente

Cada coluna deve ser uma área operacional independente, com navegação lateral contextual, setor ativo identificado no cabeçalho e somente os controles daquele setor visíveis. Não será aceita página longa que misture a coluna inteira, nem tratamento visual editorial ou de jornal em telas operacionais.

| Coluna | Ordem | Setor | Situação neste marco |
|---|---:|---|---|
| Vendas Urbanas | 01 | Clientes e Leads | Implementação existente, a separar. |
| Vendas Urbanas | 02 | Imóveis e Proprietários | Vínculo interno de ativo existente; cadastro completo permanece posterior. |
| Vendas Urbanas | 03 | Empreendimentos e Construtoras | Área estrutural visível, sem formulário até modelagem própria autorizada. |
| Vendas Urbanas | 04 | Agenda Interna | Implementação existente, a separar. |
| Vendas Urbanas | 05 | Perfil de Busca | Implementação existente, a separar. |
| Vendas Urbanas | 06 | Propostas, Reservas e Contratos | Visível e bloqueado, sem comandos. |
| Vendas Urbanas | 07 | Financeiro | Visível e bloqueado, sem dados ou comandos econômicos. |
| Locação | 01 | Clientes e Interessados | Implementação de entrada existente, a separar. |
| Locação | 02 | Imóveis e Proprietários | Vínculo interno de ativo existente; cadastro completo permanece posterior. |
| Locação | 03 | Perfil de Busca | Implementação existente, a separar. |
| Locação | 04 | Agenda Interna | Implementação existente, a separar. |
| Locação | 05 | Administração de Locação | Escopo declarado existente, sem mandato ou contrato. |
| Locação | 06 | Contratos e Garantias | Visível e bloqueado, sem comandos. |
| Locação | 07 | Financeiro | Visível e bloqueado, sem dados ou comandos econômicos. |

## Ordem global e segurança

A navegação global continua na ordem **SUPER ADM → ADM → Loteadora → Vendas Urbanas → Locação**. A presença de um item nunca cria acesso: cada rota continua sujeita ao filtro de módulo, ao contexto devolvido pelo servidor, identity, membership, grant, vigência, MFA quando aplicável e policy. Itens bloqueados são informativos, não interativos e não executam consulta ou mutação.

## Verificação do marco

As rotas setoriais foram registradas e cobertas por testes de regressão. A suíte completa aprovou 349 testes, a checagem de tipos e o build de produção foram concluídos, a revisão visual confirmou as rotas principais e setoriais em desktop e mobile, e os artefatos ZIP e HTML foram auditados contra arquivos de ambiente, chaves, credenciais e URLs sensíveis.
