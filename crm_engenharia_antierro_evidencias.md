# Caderno de evidências — engenharia anti-erro do CRM

## Captura 01 — OWASP: verificação, autorização, erro e logging

| Fonte primária | Achado verificável | Aplicação ao CRM | Limite ou cuidado |
| --- | --- | --- | --- |
| OWASP ASVS 5.0.0 | O ASVS fornece requisitos para desenvolvimento seguro e uma base para testar controles técnicos de aplicações web; a própria OWASP recomenda registrar a versão ao referenciar requisitos, pois identificadores podem mudar entre versões. [1] | O catálogo anti-erro referencia requisito + versão, não uma frase genérica de segurança. Todo gate sensível terá controle, teste e evidência associados. | ASVS é referência de verificação, não substitui modelagem de domínio, revisão jurídica/fiscal ou teste de parceiro. |
| OWASP Authorization Cheat Sheet | Menor privilégio, negar por padrão, validar permissão em toda requisição, testar lógica de autorização e preferir atributos/relações quando o contexto exigir são recomendações explícitas. [2] | RLS, grants, RPC, Storage, exportação e callback terão cenário positivo e negativo por organização, SPE, carteira, relação e alçada; botão oculto não é evidência de proteção. | Papel isolado não resolve multiempresa e relações imobiliárias complexas; policy deve refletir objeto, finalidade, vigência e contexto. |
| OWASP Error Handling Cheat Sheet | Resposta inesperada deve ser genérica ao usuário, com detalhe investigável no servidor; erros não tratados podem revelar tecnologia, caminho ou ponto de injeção. A fonte distingue 4xx de problema do cliente e 5xx de erro não previsto do servidor. [3] | O CRM adota contrato de erro estável (`code`, correlação, ação segura), tela que informa sem expor internals e log protegido com contexto para investigação. | Não devolver stack trace, query, segredo, caminho, token ou dado de outra parte; não transformar qualquer falha de negócio em 500. |
| OWASP Logging Cheat Sheet | Logging de aplicação complementa infraestrutura; deve registrar contexto suficiente de quando/onde/quem/o quê, mas excluir/mascarar tokens, segredos, PII sensível, conexão e dados bancários. A fonte também aponta que logs de processo/auditoria/transação têm finalidades distintas. [4] | Correlação conecta UI, Function, RPC, Queue e parceiro. Audit event de domínio fica separado de telemetria e de log de segurança; esquema de evento, severidade, retenção e acesso são definidos. | Log é dado sensível e entrada de zonas externas é não confiável; excesso cria ruído e exposição, falta impede diagnóstico. |

## Decisões iniciais de engenharia

1. **Referência versionada, prova versionada.** Um controle de segurança ou bug conhecido só entra no backlog com URL, versão, escopo, data de captura, cenário e teste de regressão.
2. **Erro sem vazamento, falha sem silêncio.** Usuário recebe linguagem acionável e código de correlação; operador autorizado recebe contexto mínimo suficiente, sem segredos ou PII indevida.
3. **Autorização é comportamento testado.** Cada ação sensível prova permitir e negar no dado, arquivo, endpoint, exportação e função; a interface não é fronteira de segurança.
4. **Três trilhas não se confundem.** Audit event explica decisão de domínio; log de segurança explica risco/acesso; telemetria explica saúde e desempenho. Uma pode referenciar outra por correlação sem duplicar conteúdo sensível.

## Referências

[1] [OWASP — Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)

[2] [OWASP Cheat Sheet Series — Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

[3] [OWASP Cheat Sheet Series — Error Handling](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html)

[4] [OWASP Cheat Sheet Series — Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

## Captura 02 — código, dependência, teste, incidente e diagnóstico

| Fonte | Achado verificável | Aplicação ao CRM | Limite ou cuidado |
| --- | --- | --- | --- |
| GitHub Code Scanning | A análise encontra e prioriza vulnerabilidades/erros; pode rodar por push ou agenda, e ferramentas compatíveis podem produzir SARIF. [5] | Todo repositório do produto terá análise estática, política de triagem, baseline explícito e bloqueio proporcional à severidade, sem confundir alerta com correção validada. | Scanner não prova regra de negócio, policy RLS, concorrência, contrato externo ou UX. Alertas precisam de owner, prazo e justificativa de exceção. |
| GitHub Dependency Review | A revisão de dependência mostra mudança direta e transitiva no pull request; pode falhar a checagem se encontrar pacote vulnerável e bloquear merge quando exigida. [6] | Manifesto e lockfile entram em gate; mudança de dependência recebe diff, licença, vulnerabilidade, motivação, teste e plano de rollback. | A evidência depende do ecossistema/serviço habilitado e não elimina validação de compatibilidade, bundle, licença e fornecedor. |
| Playwright | Testes isolados aumentam reprodutibilidade e evitam falhas em cascata; a fonte recomenda testar comportamento visível, controlar dados e usar trace de CI em falhas. [7] | Jornada de reserva, proposta, documento, acesso e fechamento terá dados isolados, estado controlado, seletores acessíveis, teste de erro/parcial e trace como evidência de regressão. | E2E não substitui unitário, integração, teste de RLS, carga ou sandbox de parceiro; não testar servidor externo sem controle da resposta. |
| Google SRE | Postmortem sem culpa e com ação acompanhada transforma falha em aprendizagem; ações vagas, sem owner/prioridade ou sem tracking tendem a não prevenir recorrência. [8] | Incidente reúne linha do tempo, impacto, gatilho, causas técnicas/sistêmicas, mitigação, dados de recuperação e ações preventivas com owner e prazo. | Cultura sem culpa não elimina accountability; não expõe dados pessoais, segredos ou informação de cliente fora da audiência autorizada. |
| React | Error boundaries contêm erro de renderização abaixo da árvore e mostram fallback, mas não capturam handlers de evento, código assíncrono, SSR ou erro na própria boundary. [9] | O CRM combina boundary por rota/painel com `try/catch` em comando, estado explícito de erro, retry seguro, correlação e fallback que não permite decisão financeira baseada em tela degradada. | A página consultada é legada e aponta a documentação atual; a limitação conceitual precisa ser revalidada na versão de React escolhida antes de implementar. |
| Sentry Docs | Evento é uma ocorrência capturada; issue agrupa eventos similares. Fingerprint, stack, exceção e mensagem influenciam agrupamento, e sourcemap preserva diagnóstico de JavaScript minimizado. [10] [11] | Telemetria terá correlação, release, ambiente, fluxo e fingerprint estável; alertas se ligam ao bug/risco sem registrar payload, token, documento ou PII indevida. | Agrupamento automático é auxiliar e requer revisão; serviço de observabilidade não substitui audit trail de domínio. |
| Stack Overflow Help | Um exemplo mínimo, completo e reprodutível reduz o problema ao código/dados necessários e confirma que o defeito ainda acontece. [12] | Todo bug não trivial terá repro mínima segura, versão, entrada sintética, comportamento esperado/observado, correlação e ambiente antes de buscar solução externa. | Resposta comunitária é hipótese de diagnóstico, não padrão de produção: exige fonte primária, teste, revisão de segurança e compatibilidade de versão. |

## Decisões adicionais de engenharia

1. **Pipeline em camadas:** lint/tipagem, unitário, integração, policy, contrato, E2E, carga e segurança respondem perguntas diferentes. Uma etapa verde não libera a capacidade que outra etapa ainda não provou.
2. **Falha precisa virar reprodução segura.** Ticket sem cenário, versão, dado sintético, correlação, esperado/observado e raio de impacto não é elegível para conclusão.
3. **O monitoramento é referência, não repositório de segredo.** Captura, agrupamento, trace e release são configurados com minimização, amostragem, ambiente e acesso definidos.
4. **Postmortem fecha com mudança verificável.** Ação corretiva só termina quando o controle existe, o teste/regra de alerta confirma e o risco residual é aceito pelo owner correto.

## Referências adicionais

[5] [GitHub Docs — Code Scanning](https://docs.github.com/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning)

[6] [GitHub Docs — Dependency Review](https://docs.github.com/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review)

[7] [Playwright — Best Practices](https://playwright.dev/docs/best-practices)

[8] [Google SRE — Postmortem Culture](https://sre.google/workbook/postmortem-culture/)

[9] [React — Error Boundaries (legado, com encaminhamento para documentação atual)](https://legacy.reactjs.org/docs/error-boundaries.html)

[10] [Sentry Docs — Capturing Errors](https://docs.sentry.io/platforms/javascript/usage/)

[11] [Sentry Docs — Issue Grouping](https://docs.sentry.io/concepts/data-management/event-grouping/)

[12] [Stack Overflow Help — Minimal, Reproducible Example](https://stackoverflow.com/help/minimal-reproducible-example)
