# Regressões seguras: Vendas Urbanas e Locação — A167

**Data:** 04 de setembro de 2026  
**Escopo:** cobertura automática das jornadas internas, sem criar, consultar ou alterar registros de negócio.

## Controles protegidos

As duas jornadas mantêm consultas condicionadas simultaneamente à sessão autenticada e ao contexto válido. As mutações de entrada, etapa, agenda e vínculos permanecem acionadas exclusivamente por submissões explícitas de formulário, sem efeito no carregamento das páginas.

| Jornada | Leitura condicionada | Comandos preservados | Limites explícitos |
|---|---|---|---|
| Vendas Urbanas | Sessão e contexto válidos | Lead e agenda somente por formulário | Propostas, reservas, contratos e Financeiro bloqueados. |
| Locação | Sessão e contexto válidos | Entrada e agenda somente por formulário | Contratos, garantias e Financeiro bloqueados. |

## Validação

O teste dirigido aprovou três verificações: guardas de Vendas Urbanas, guardas de Locação e bloqueio dos setores materiais. A suíte completa, tipagem, build Netlify local e integridade do diff também foram aprovados. O aviso preexistente de chunks grandes permanece informativo e não foi alterado sem medição específica.

Não houve criação, edição, exclusão, importação, exportação, comunicação, agendamento externo, contrato, proposta material, valor, cálculo, cobrança, pagamento, repasse, integração externa ou publicação.
