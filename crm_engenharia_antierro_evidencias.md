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

## Captura 03 — concorrência, política, telemetria e efeito externo

| Fonte primária | Achado verificável | Aplicação ao CRM | Limite ou conflito relevante |
| --- | --- | --- | --- |
| NIST SP 800-218 SSDF | O SSDF propõe práticas de desenvolvimento seguro para reduzir vulnerabilidades, mitigar o impacto das que permanecerem e enfrentar causas-raiz para evitar recorrência. [13] | Todo controle anti-erro passa a ter requisito, implementação, evidência de revisão, teste, monitoramento e ação corretiva; segurança não fica restrita ao fim do ciclo. | O SSDF é deliberadamente alto nível; não substitui invariantes de reserva, subledger, split, LGPD ou validação profissional de tema fiscal/jurídico. |
| CISA Secure by Design | Segurança deve ser requisito central do fabricante; MFA, logging e SSO devem ser disponibilizados de forma segura por padrão. [14] | O produto assume responsabilidade por acesso mínimo, MFA em operação sensível, logging protegido e padrões seguros de saída, em vez de transferir a proteção para a imobiliária/loteadora. | “Seguro por padrão” não elimina configuração contextual: escopo, finalidade, vigência, RLS, retenção e alçada continuam específicos da organização e da operação. |
| Google SRE — Monitoring Distributed Systems | Monitoramento combina sinais de caixa-preta e caixa-branca; alertas humanos precisam ser acionáveis e de baixo ruído; latência, tráfego, erros e saturação são sinais centrais. [15] | Painéis e alertas distinguem sintoma de causa, separam latência de êxito e de erro, e medem backlog/idade de fila como saturação de jornada. | Não se deve paginar por “algo estranho” nem usar telemetria como histórico de domínio; audit event e evidência econômica permanecem separados. |
| OpenTelemetry — Observability Primer | Traces, métricas e logs permitem investigar comportamentos novos quando a aplicação é instrumentada com contexto suficiente; tracing reconstrói o caminho de uma requisição distribuída. [16] | `correlation_id`/`trace_id`, release, ambiente, jornada, estado e referência externa conectam UI, RPC, outbox, callback e inbox sem transportar payload sensível. | Instrumentar mais não autoriza capturar segredo, PII, documento, CPF/CNPJ ou dado bancário; atributos têm classificação, allowlist e retenção. |
| PostgreSQL 18 — Transaction Isolation | Read Committed não impede todas as anomalias em comandos complexos; transações Repeatable Read/Serializable podem exigir retry integral após falha de serialização. [17] | Reserva concorrente, uso de tabela, atualização de entitlement e fechamento usam invariante, unicidade/versão e transação curta. Se houver `40001`, o CRM reexecuta somente a decisão ainda segura e sem efeito externo. | Retry de transação não pode repetir chamada de parceiro, e-mail, assinatura ou pagamento. Primeiro persiste intenção/outbox; efeito externo fica fora da transação e é idempotente. |
| Supabase RLS | Grants e policies são camadas distintas; cada operação deve ter policy e teste de permitir/negar. `service_role` ignora RLS e deve permanecer no servidor. [18] | Migration de tabela exposta inclui RLS, revogação/grant mínimo, policy por operação, teste pgTAP e índices dos filtros de escopo; views e funções recebem revisão explícita. | JWT pode ficar defasado e metadata de usuário é mutável; autorização crítica não depende de dado editável pelo usuário ou de claim sem estratégia de renovação/revalidação. |
| Stripe — Idempotent Requests | A mesma chave de idempotência retorna o resultado inicial, inclusive erro 500, mas a retenção de chave pode expirar após pelo menos 24 horas e conflitos de parâmetros exigem tratamento. [19] | Cada parceiro recebe um perfil de capacidade. O CRM mantém seu próprio `intent_id`, digest de parâmetros, outbox/inbox e reconciliação para tornar repetição, timeout e callback tardio explicáveis. | Esta semântica é específica da Stripe e não prova comportamento de boleto, Pix ou split de outro parceiro; contrato, sandbox e retorno homologado precedem produção. |

## Decisões reforçadas

1. **Teste negativo é produto, não exceção.** Toda capacidade crítica passa a provar o que pode, o que não pode e o que acontece quando há conflito, queda, repetição, atraso ou escopo inválido.
2. **O retry tem fronteira.** O banco pode reexecutar uma transação curta e pura após conflito; o CRM nunca reenvia efeito externo por tentativa genérica. Persistência, outbox, idempotência do parceiro e reconciliação decidem a repetição.
3. **Observabilidade é a trilha técnica; audit é a trilha de decisão.** Logs, métricas e traces compartilham correlação com audit event, mas não viram cópia de documento, saldo, payload, segredo ou justificativa jurídica.
4. **RLS só é considerada pronta com grant, policy, teste e desempenho.** “A policy existe” não é critério: a mudança deve provar allow/deny, integridade do alvo negado, índice do filtro e ausência de uso de privilégio de serviço no cliente.
5. **Sites de diagnóstico têm papéis diferentes.** Documentação, RFC, advisory e changelog definem comportamento; issue tracker e ferramenta de monitoramento ajudam a reproduzir; comunidade formula hipótese; nenhuma resposta é copiada para produção sem versão, teste e revisão.

## Referências atuais

[13] [NIST — SP 800-218 Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final)

[14] [CISA — Secure by Design](https://www.cisa.gov/securebydesign)

[15] [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)

[16] [OpenTelemetry — Observability Primer](https://opentelemetry.io/docs/concepts/observability-primer/)

[17] [PostgreSQL 18 — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)

[18] [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

[19] [Stripe — Idempotent Requests](https://docs.stripe.com/api/idempotent_requests)
