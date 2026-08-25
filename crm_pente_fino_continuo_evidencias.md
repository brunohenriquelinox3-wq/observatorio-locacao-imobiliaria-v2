# Pente fino contínuo de código — evidências e limites

> **Propósito.** Este caderno traduz a exigência de varredura contínua em controles executáveis. Ele não promete que qualquer técnica elimine todos os erros; exige que cada mudança produza evidência proporcional ao dano que poderia causar.

## 1. Decisão canônica

O CRM não adotará a leitura literal de “revisar cada linha manualmente”, pois isso é lento, inconsistente e não cobre comportamento integrado, dependências ou produção. Em seu lugar, adotará o **pente fino em camadas por alteração**: a ferramenta examina todo o diff e as regras automatizáveis; uma pessoa revisa a intenção, a fronteira de domínio e o risco; os testes verificam o comportamento; e a telemetria confirma ou refuta a hipótese depois da promoção.

| Camada | Pergunta que responde | Evidência mínima | Limite que permanece |
|---|---|---|---|
| Editor e tipo | A assinatura, o tipo e o fluxo básico são coerentes? | Diagnóstico TypeScript/linter sem erro bloqueante | Não prova integração, policy ou efeito externo |
| Diff e revisão | A intenção corresponde à mudança, ao risco e à decisão? | PR com escopo, risco, owner, checklist e revisão | Pode deixar escapar efeito em runtime |
| Segurança e dependência | A mudança introduz padrão perigoso, segredo, vulnerabilidade ou pacote inseguro? | SAST, segredo, revisão de lockfile/SBOM e exceções datadas | Alertas podem ter falso positivo ou cobertura parcial |
| Teste | O usuário, a policy, a transação e a recuperação fazem o esperado? | Testes unitário, integração, permitir/negar e E2E por risco | Não cobre todos os cenários reais |
| Preview e operação | O comportamento promovido respeita sinal, SLO e rollback? | Preview, canary quando aplicável, trace/correlação, alertas e runbook | Não substitui decisão humana em incidente |

## 2. Fontes primárias e implicações

O **NIST SSDF** recomenda incorporar práticas de desenvolvimento seguro ao ciclo de vida para reduzir vulnerabilidades, mitigar o impacto das falhas restantes e tratar causas-raiz para prevenir recorrências [1]. Para o CRM, isso se torna um requisito de processo: todo incidente material precisa de reprodução sintética, teste de regressão, owner e decisão sobre alteração do controle.

O **OWASP ASVS** fornece requisitos verificáveis de segurança de aplicação e recomenda referenciar requisito com versão, pois identificadores podem mudar entre versões [2]. Portanto, requisitos de segurança do CRM devem apontar para uma versão de baseline, e não para uma lista vaga de “boas práticas”.

O **SLSA** trata integridade de artefatos, fontes e dependências como uma cadeia progressiva de controles contra adulteração [3]. O projeto deverá preservar provenance do build, lockfile revisado e aprovação de mudança de dependência antes de promover um release sensível.

A documentação do **GitHub Code Scanning** descreve análises capazes de identificar vulnerabilidades e erros, acionáveis por eventos do repositório e utilizáveis para triagem/priorização [4]. A revisão de dependências, por sua vez, mostra em pull request alterações diretas e transitivas de manifestos/lockfiles e pode bloquear merge em presença de pacote vulnerável [5]. Esses mecanismos são guardrails, não substitutos de arquitetura ou revisão.

O **Playwright** recomenda testes isolados, orientados ao comportamento visível ao usuário, com dados controlados e execução frequente em CI [6]. No CRM, os fluxos críticos devem ter fixtures sintéticas, locators acessíveis e assertions que confirmem o estado observável: login, isolamento RLS, reserva, arquivo, callback, conciliação e divergência.

O **OpenTelemetry** define observabilidade como capacidade de investigar o sistema pela instrumentação de traces, métricas e logs, incluindo problemas inéditos [7]. O CRM deve correlacionar comando, release, ambiente, caso e referência externa sem inserir tokens, documentos, conteúdo sensível ou dados pessoais desnecessários na telemetria.

Por fim, a política de error budget do **Google SRE** apresenta uma lógica de governança: quando o serviço ultrapassa o objetivo de confiabilidade, a entrega não crítica pode ser congelada até a recuperação [8]. A estratégia adotará essa ideia como regra proporcional: falhas recorrentes em jornada crítica reduzem a tolerância para novas mudanças naquela superfície e abrem melhoria obrigatória.

## 3. Catálogo de varreduras obrigatórias

| Alteração | Varredura obrigatória | Bloqueia promoção quando | Retomada exige |
|---|---|---|---|
| UI sem dado sensível | Tipo, linter, teste de interação, acessibilidade e preview | Há regressão visual, foco inacessível ou erro de runtime | Correção e prova no preview |
| Schema, migration ou RLS | Tipo, migration em banco efêmero, teste permitir/negar, concorrência e rollback/compensação | Existe acesso cruzado, estado inválido ou migração não reexecutável | Teste negativo e plano de recuperação |
| Auth, MFA, sessão ou administração | ASVS mapeado, testes de expiração/recuperação, política no dado e audit event | Há elevação de privilégio, bypass ou ausência de rastreio | Revisão de segurança e revalidação de fluxo |
| Documento ou Storage | Policy, URL temporária, metadado, acesso por finalidade e tentativa negada | Objeto é enumerável, público ou substitui versão | Teste de isolamento e retenção |
| Financeiro, split ou parceiro | Idempotência, invariantes, transaction/RPC, outbox/inbox, webhook duplicado e reconciliação | Timeout/duplicata pode criar saldo, direito, instrução ou settlement repetido | Caso reproduzível, compensação e aceite de risco |
| Dependência ou CI | Diff de lockfile, vulnerabilidade, licença, provenance e segredo | Pacote vulnerável sem exceção aprovada, build não reproduzível ou segredo exposto | Atualização/remoção ou exceção com owner e expiração |
| Incidente | Correlation ID, fixture sintética, teste regressivo, postmortem e ação corretiva | Caso é encerrado apenas por relato ou workaround | Prova automatizada e sinal atualizado |

## 4. Limites e conflitos preservados

Uma varredura contínua pode gerar falso positivo, atrasar uma alteração urgente ou induzir falsa segurança. Para evitar esses efeitos, o CRM deverá manter **exceção explícita, datada, aprovada, com compensação e reabertura automática**. Nenhuma ferramenta de análise estática, teste ou IA pode aprovar sozinha mudança que afete saldo, pagamento, direito econômico, documento sigiloso, acesso privilegiado ou regra de contrato.

## Referências

[1]: https://csrc.nist.gov/pubs/sp/800/218/final "NIST SP 800-218 — Secure Software Development Framework"
[2]: https://owasp.org/www-project-application-security-verification-standard/ "OWASP Application Security Verification Standard 5.0"
[3]: https://slsa.dev/ "SLSA — Supply-chain Levels for Software Artifacts"
[4]: https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning "GitHub Docs — Code scanning"
[5]: https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review "GitHub Docs — Dependency review"
[6]: https://playwright.dev/docs/best-practices "Playwright — Best practices"
[7]: https://opentelemetry.io/docs/concepts/observability-primer/ "OpenTelemetry — Observability primer"
[8]: https://sre.google/workbook/error-budget-policy/ "Google SRE — Example Error Budget Policy"
