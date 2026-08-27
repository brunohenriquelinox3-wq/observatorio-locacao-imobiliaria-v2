# Registro de validação de interface — ciclo de identidade administrativa

**Marco:** identidade administrativa em preparação  
**Data:** 2026-08-27  
**Contexto validado:** rota `/administracao` sem sessão administrativa no ambiente de desenvolvimento.

| Controle | Evidência observada | Resultado |
| --- | --- | --- |
| Falha segura sem sessão | A rota apresenta a camada restrita e o botão de acesso, sem renderizar dados da central, dossiês, contratos, carteira ou comandos administrativos. | `aprovado` |
| Hierarquia de acesso | O percurso visível declara autenticação → MFA → escopo vigente → policy; não apresenta sessão como alçada. | `aprovado` |
| Composição visual desktop | A nota de segurança foi movida para a área principal inferior e deixou de comprimir o texto na coluna lateral. | `aprovado` |
| MFA e recuperação | Os controles existem apenas no conteúdo autenticado da central; não puderam ser exercitados sem uma identidade de teste aprovada. | `pendente_de_teste_autenticado` |

> **Limite de evidência:** a captura confirma a rota negada por padrão e o layout desktop. Ela não comprova cadastro, conexão, TOTP, recuperação ou ativação, pois nenhuma identidade de teste foi criada nem utilizada nesta validação.

| Controle móvel | Evidência observada | Resultado |
| --- | --- | --- |
| Gate responsivo | Em 375 px, a rota mantém título, explicação, percurso de acesso, CTA e nota de segurança legíveis, sem renderizar conteúdo administrativo. | `aprovado` |

| Verificação complementar | Evidência observada | Resultado |
| --- | --- | --- |
| Validação automática | O marco concluiu com 26 arquivos de teste e 46 testes aprovados; TypeScript, build Netlify e `git diff --check` concluíram sem erro. | `aprovado` |
| Registros de navegador | Os erros de autorização identificados são anteriores ao condicionamento de consultas protegidas; não houve novo erro associado à rota após a correção. | `aprovado_com_historico_preservado` |
| Fluxo autenticado real | Não foi criado nem utilizado usuário de teste; cadastro, e-mail, TOTP e recuperação permanecem para exercício explícito por identidade autorizada. | `limite_de_validação_registrado` |
