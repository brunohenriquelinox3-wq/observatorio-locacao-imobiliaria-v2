# Isolamento de equipe do Ambiente Demonstrativo — A190

**Data:** 05 de setembro de 2026  
**Escopo:** endurecimento do ciclo de solicitação, preparação e aceite de equipe. Nenhuma solicitação, membership, grant, escopo, módulo ou dado foi criado no Ambiente Demonstrativo.

## Correção aplicada

Foi identificado que a primeira versão do ciclo de equipe aceitava organizações em estado `draft` na solicitação própria. Como o Ambiente Demonstrativo é isolado e permanece em rascunho, esse comportamento contrariava o bloqueio setorial definido. A migração A190 restringe a solicitação a organizações em estado `active` e revalida o estado ativo antes do preparo e do aceite.

| Etapa | Proteção atual |
|---|---|
| Solicitação própria | Resolve somente organização ativa; referência de ambiente em rascunho é negada. |
| Preparo por SUPER ADM ou ADM | Valida novamente a organização ativa antes de criar membership/grant pendente. |
| Aceite próprio | Revalida a organização ativa antes de ativar membership/grant. |
| Acesso direto | A tabela de solicitações mantém RLS habilitada, privilégios públicos revogados e execução de RPCs limitada ao servidor. |

## Evidências

O teste dirigido aprovou três casos: restrição à organização ativa, revalidação no preparo/aceite e ausência de convite, senha ou ativação automática. A migração foi aplicada no banco conectado e a função de guarda foi confirmada por consulta de esquema sem leitura de registros. A suíte completa, a tipagem, o build local compatível com Netlify e a integridade do diff foram aprovados.

## Verificação de segurança complementar

O verificador do banco apontou avisos informativos preexistentes sobre tabelas com RLS habilitada e sem policies explícitas. Para a nova tabela, esse estado é **fail-closed** porque o acesso direto está revogado e não existe policy permissiva; as operações passam exclusivamente pelas RPCs `SECURITY DEFINER` com `search_path` seguro. O verificador também apontou uma configuração de proteção de senhas comprometidas do provedor de autenticação. Essa é uma configuração externa de autenticação, não foi alterada neste marco e requer decisão operacional específica.

## Limites preservados

O Ambiente Demonstrativo não recebe membership, grant, escopo, módulo, identidade, dado, publicação ou ativação. Esta correção não altera SUPER ADM, ADM, credenciais, convites externos, documentos, contratos, valores, cobrança, pagamentos, repasses, financeiro ou integrações.
