# Registro de validação — funil de Vendas Urbanas A7

**Escopo:** origem, qualificação, transição de etapa e agenda interna de lead em rascunho.  
**Limite:** não foram criados leads, agendas, Parties, ativos, propostas, reservas, contratos, mensagens, publicações ou operações financeiras.

| Controle | Evidência | Resultado |
| --- | --- | --- |
| Módulo e contexto | Contrato restringe o funil a `vendas_urbanas`; organização, finalidade, correlação e Party em rascunho são obrigatórias. | `aprovado` |
| Transições | Perda, cancelamento e não realização exigem motivo; as etapas permitidas são verificadas na função transacional. | `aprovado` |
| Isolamento | A7/A7.1 usam RLS, funções `security definer`, revogação para navegador e grants somente ao `service_role`. | `aprovado` |
| API e lista | A leitura retorna somente Party de exibição, origem, interesse, etapa e próxima agenda, por RPC contextual do servidor. | `aprovado` |
| Interface protegida | `/vendas-urbanas` sem sessão mostra apenas o gate de acesso, sem funil, formulário, Party, agenda ou indicação de existência de registros. | `aprovado` |
| Validação proporcional | 3 arquivos de teste/8 testes, TypeScript, build Netlify e integridade de diff executados uma única vez. | `aprovado_com_avisos_de_bundle_existentes` |

> **Limite de evidência:** o caminho de êxito depende de identidade, membership e grant ativos e não foi exercido para não inserir dados de teste. Os contratos, as funções, a API e a negação foram verificados sem bypass.
