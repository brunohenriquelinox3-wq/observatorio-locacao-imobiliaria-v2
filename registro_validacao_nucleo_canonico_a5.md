# Registro de validação — núcleo canônico A5

**Escopo:** contexto, Party e papel temporal em rascunho para Vendas Urbanas e Locação.  
**Limite:** não foram criados dados, documentos, identificadores, contratos, operações financeiras, grants ou integrações externas durante a validação.

| Controle | Evidência | Resultado |
| --- | --- | --- |
| Contrato de entrada | Organização UUID, módulo permitido, finalidade, Party minimizada e vigência coerente foram validados em contrato. | `aprovado` |
| Funções e isolamento | A5/A5.1 mantêm RLS, revogação para navegador e execução apenas por `service_role`, com grant ativo/módulo/finalidade no servidor. | `aprovado` |
| Integração de API | A leitura e as mutações de rascunho usam RPC contextual pelo servidor; identidade ausente é negada antes de acessar a credencial de serviço. | `aprovado` |
| Interface protegida | `/cadastro-base` sem sessão apresenta somente o gate de acesso e não renderiza lista, contexto, Party, papel, organização ou estado de grant. | `aprovado` |
| Validação proporcional | Quatro arquivos de teste, com 9 testes, além de TypeScript, build Netlify e integridade de diff. | `aprovado_com_avisos_de_bundle_existentes` |

> **Limite de evidência:** não foi exercido caminho de sucesso com identidade/membership/grant ativos para evitar criar dados de teste. A política de não existência e a negação por falta de contexto foram verificadas sem bypass.
