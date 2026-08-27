# Registro de validação visual — ativação A4

**Data:** 2026-08-27  
**Rota avaliada:** `/administracao` sem sessão privilegiada.  
**Objetivo:** verificar que o marco de atestação MFA não expõe console, identidade, principal, organizações, memberships, grants ou comandos antes do gate de autenticação.

| Controle | Evidência visual | Resultado |
| --- | --- | --- |
| Camada restrita | A página apresenta a mensagem de acesso governado e separa claramente plataforma de dados de clientes. | `aprovado` |
| Sem exposição de dados | Não foram renderizados contadores de domínio, identificadores, formulários transacionais, estado de principal ou dados de identidade. | `aprovado` |
| Rota de acesso | A sequência “Autenticação → MFA → escopo vigente → policy” está visível antes do CTA de acesso. | `aprovado` |
| Limite de teste | Não foi criado usuário nem usado principal ativo para executar ativação; o caminho de sucesso continua condicionado a ação explícita de identidade autorizada. | `limite_registrado` |

> A validação visual cobre o comportamento de negação. A atestação de AAL2/TOTP recente, a transição pendente→ativo e a idempotência foram cobertas nos testes selecionados e na migration; não foram simuladas por preenchimento de dados ou bypass de policy.

| Validação proporcional | Escopo executado | Resultado |
| --- | --- | --- |
| Gates críticos | Cinco arquivos de teste, com 16 testes, cobriram claims AAL2/TOTP, freshness, recovery confirmado, RPC de ativação, policy e helpers de interface. | `aprovado` |
| Integridade de entrega | TypeScript, build Netlify e `git diff --check` foram executados uma vez no marco. | `aprovado_com_avisos_de_bundle_existentes` |
| Runtime após reinício | A rota administrativa respondeu HTTP 200; os registros posteriores ao reinício contêm apenas conexão Vite/telemetria de desenvolvimento. | `aprovado` |
| Erros históricos | Erros de autorização às 22:42 antecedem o gate condicional e o marco A4; não reapareceram após o reinício às 23:22. | `histórico_classificado` |
