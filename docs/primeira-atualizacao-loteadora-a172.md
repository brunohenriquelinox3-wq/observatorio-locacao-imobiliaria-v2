# Primeira atualização setorial de Loteadora — A172

**Data:** 04 de setembro de 2026  
**Status:** implementada e validada em ambiente de desenvolvimento, sem inserção de dados de negócio.

## Entrega

O **Setor 01 · Cadastro de Loteamentos** passou a contar com uma ficha de preparação operacional, separada do cadastro básico, de Quadras, Lotes, inventário, clientes, parceiros, vendas e Financeiro. Ela registra somente estados enumerados de trabalho para planejamento, preparação municipal, preparação registral e preparação de implantação, além de um responsável interno já vinculado ao mesmo loteamento.

| Camada | Implementação | Limite preservado |
|---|---|---|
| Banco de dados | Perfil único por loteamento em rascunho, tipos enumerados, chave de organização composta e RLS ativo. | Não há localização, área, registro público, documento, custo, preço, contrato, reserva, proposta, cobrança ou financeiro. |
| Autoridade | RPCs com subject, organização, módulo Loteadora, finalidade, correlação, idempotência e auditoria redigida. | Nenhuma ação ocorre por carregamento de tela; a interface não concede alçada. |
| Responsável interno | O vínculo é aceito somente quando pertence à mesma organização e ao mesmo loteamento. | Não cria login, membership, grant, escopo, participação econômica ou repasse. |
| Interface | Ficha no Setor 01, com mensagens explícitas de preparação interna e decisão humana. | Sem dados pessoais, anexos, documentos, comandos contratuais ou financeiros. |

## Evidências de validação

| Verificação | Resultado |
|---|---|
| Testes dirigidos da ficha | 7 testes aprovados. |
| Suíte completa | 168 arquivos de teste e 403 testes aprovados. |
| Tipagem | `pnpm check` aprovado. |
| Build local compatível com Netlify | Aprovado; o aviso preexistente de chunks grandes permaneceu não bloqueante. |
| Integridade de diff | Aprovada. |
| Revisão visual | Desktop e móvel revisados em estado sem contexto; não houve quebra adicional. |
| Esquema remoto | Migração aditiva aplicada no banco Supabase conectado; RLS está ativo. |
| Privilégios diretos | Papéis anônimo e autenticado não têm leitura direta da nova tabela. |

## Observação de segurança

O verificador externo classifica tabelas com RLS sem policies como informação. Na arquitetura atual, isso é deliberadamente **fail-closed**: não há privilégios diretos para papéis públicos, e a única via operacional são RPCs com autoridade validada. A nova tabela segue o mesmo padrão. O aviso global sobre proteção contra senhas vazadas pertence à configuração de autenticação e não foi alterado nesta atualização setorial.

## Limites de negócio mantidos

Contratos, documentos formais, aprovação ou registro público, obras executadas, fornecedores, gastos, lucros, boletos, parcelas, cobrança, pagamentos, recebíveis, repasses, comissões e integrações continuam fora deste marco. Esses assuntos demandam desenho próprio, validação jurídica-contábil quando aplicável e autorização material específica.

## Materiais relacionados

O racional de pesquisa e referências está em `pesquisa-loteadora-notas-fontes-a170.md`; o recorte de produto em `blueprint-loteadora-a171.md`; a revisão de interface em `revisao-visual-preparacao-loteadora-a171.md`; e a migração reproduzível em `supabase/migrations/20260904234000_subdivision_development_preparation_profile_a171.sql`.
