# Registro de validação — núcleo de ativos urbanos A6

**Escopo:** ativo urbano em rascunho, relações de Party e estados de trabalho por módulo.  
**Limite:** nenhum ativo, Party, relação, estado, endereço, registro, preço, contrato, publicação ou operação financeira foi criado durante esta validação.

| Controle | Evidência | Resultado |
| --- | --- | --- |
| Contrato de ativo | O contrato aceita somente tipo urbano, referência de trabalho, código interno, relação limitada e estado bloqueado com motivo. | `aprovado` |
| Isolamento de dados | A6/A6.1 mantêm RLS, revogação para browser, funções contextualizadas e execução somente por `service_role`. | `aprovado` |
| Semântica | Titularidade alegada, gestão e estado de módulo continuam separados e não implicam domínio, representação, contrato, publicação ou efeito financeiro. | `aprovado` |
| Interface protegida | `/ativos-urbanos` sem sessão mostra somente o gate de acesso; a página de ativos, listas e formulários não é renderizada. | `aprovado` |
| Validação proporcional | Três arquivos de teste, com 8 testes, além de TypeScript, build Netlify e integridade de diff. | `aprovado_com_avisos_de_bundle_existentes` |

> **Limite de evidência:** o caminho de êxito requer identidade, membership e grant ativos e não foi exercido para evitar inserir dados de teste. A validação verificou contratos, funções, APIs e negação sem contexto/autorização.
