# Caderno de evidências — auditoria integral do CRM

## Captura 01 — segurança de aplicação, API e autorização

| Fonte | Achado verificável | Impacto para o CRM | Estado da auditoria |
| --- | --- | --- | --- |
| OWASP ASVS 5.0 | O ASVS fornece uma base para testar controles técnicos de aplicações web e publicar requisitos de desenvolvimento seguro. [1] | A estratégia precisa transformar princípios de segurança em uma matriz de verificação por release, não apenas em diretrizes narrativas. | Lacuna registrada: criar gate AUD de verificação de aplicação. |
| OWASP API Security Top 10 (2023) | A lista inclui autorização por objeto e propriedade, autenticação, autorização por função, fluxo de negócio sensível, consumo de recursos, inventário e consumo de APIs de terceiros. [2] | RLS, RPC, MFA e inbox/outbox existentes estão alinhados em direção, mas exigem testes por objeto, payload, função, fluxo e fornecedor. | Lacuna registrada: suíte de testes de autorização e contrato de integração. |
| NIST Zero Trust | O modelo não confia implicitamente em ativos ou contas pela localização e requer autenticação/autorização explícitas em cada acesso a recurso ou comunicação. [3] | Confirma a decisão de não tratar cargo, sessão ou frontend como autorização suficiente; membership, escopo, policy e alçada permanecem verificáveis no dado. | Decisão reforçada: RLS + policy + comando transacional. |

> **Leitura de auditoria:** “tem autenticação” não é um controle completo. Para este CRM, cada endpoint, linha, propriedade, arquivo, função administrativa e fluxo de reserva, distribuição, exportação ou callback deverá provar autorização, limite de payload, registro e comportamento diante de repetição/erro.

## Referências

[1] [OWASP — Application Security Verification Standard 5.0](https://owasp.org/www-project-application-security-verification-standard/)

[2] [OWASP — API Security Top 10, edição 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)

[3] [NIST — Zero Trust Networks](https://www.nist.gov/programs-projects/zero-trust-networks)

## Captura 02 — confiabilidade, telemetria e incidente

| Fonte | Achado verificável | Impacto para o CRM | Estado da auditoria |
| --- | --- | --- | --- |
| OpenTelemetry | O framework organiza telemetria em traces, métricas, logs e contexto; suas convenções de mensageria descrevem correlação entre produção, consumo e processamento de mensagem. [4] [5] | Cada comando crítico e integração deve carregar `correlation_id`, `causation_id`, domínio, organização/SPE, versão e resultado, com dados pessoais minimizados na telemetria. | Lacuna registrada: padrão de observabilidade de comandos e eventos. |
| Google SRE — SLOs | SLOs orientam decisões de confiabilidade; SLIs podem medir disponibilidade, latência, frescor, correção, cobertura e durabilidade conforme o tipo de serviço. [6] | O CRM precisa de SLOs por jornada: leitura de carteira, reserva, upload de evidência, callback, conciliação e exportação, não apenas de um “uptime” genérico. | Lacuna registrada: catálogo de SLI/SLO e budget de erro por fluxo. |
| Google SRE — incidentes | Alertas devem ser oportunos, centrados em funcionalidade percebida e acionáveis; a resposta requer preparação, papéis, comunicação, mitigação e aprendizado pós-incidente. [7] | Integração financeira, acesso indevido, migration falha e documento indisponível exigem runbook, classificação, owner, comunicação e postmortem sem culpabilização. | Risco aberto: processo de incidente e readiness ainda não especificados. |

> **Leitura de auditoria:** log sem correlação não explica um erro de carteira; alerta sem ação apenas cria ruído. O primeiro conjunto de SLOs será pequeno e orientado à experiência: leitura autorizada, comando transacional, entrega de evidência, callback processado e dado de gestão fresco.

[4] [OpenTelemetry — Signals](https://opentelemetry.io/docs/concepts/signals/)

[5] [OpenTelemetry — Semantic Conventions for Messaging Spans](https://opentelemetry.io/docs/specs/semconv/messaging/messaging-spans/)

[6] [Google SRE — Implementing SLOs](https://sre.google/workbook/implementing-slos/)

[7] [Google SRE — Incident Management Guide](https://sre.google/resources/practices-and-processes/incident-management-guide/)

## Captura 03 — IA governada e evolução responsável

| Fonte | Achado verificável | Impacto para o CRM | Estado da auditoria |
| --- | --- | --- |
| NIST AI RMF | O framework é voluntário e orienta a incorporar considerações de confiança no desenho, desenvolvimento, uso e avaliação de sistemas de IA. [8] | A camada de IA deixa de ser uma funcionalidade isolada: entra no ciclo de política, contexto, risco, teste, monitoramento e revisão. | Lacuna registrada: registro de caso de uso e avaliação por capacidade de IA. |
| NIST Generative AI Profile | O perfil complementar trata riscos de IA generativa e propõe ações de gestão alinhadas às prioridades da organização. [9] | Resumo, extração, sugestão e classificação devem declarar finalidade, dados permitidos, modelo/versão, limite, avaliação, aprovação e reversão. | Decisão reforçada: IA não executa ação sensível por padrão. |
| NIST AI RMF Playbook | O playbook organiza sugestões por Govern, Map, Measure e Manage, e é um recurso vivo, não um checklist universal. [10] | O CRM adotará um protocolo proporcional ao risco: piloto controlado, medição de erro/aceite, controle humano e revisão recorrente. | Lacuna registrada: AUD para avaliação pré e pós-liberação de IA. |

> **Leitura de auditoria:** nenhum assistente recebe o status de “inteligente” apenas por gerar texto. Cada capacidade deve passar por um registro de caso de uso, avaliação com dados autorizados, medição de erro relevante, limite explícito, revisão humana e mecanismo de desligamento.

[8] [NIST — AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

[9] [NIST — Generative Artificial Intelligence Profile, AI 600-1](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence)

[10] [NIST — AI RMF Playbook](https://airc.nist.gov/airmf-resources/playbook/)

## Captura 04 — integridade de release e cadeia de software

| Fonte | Achado verificável | Impacto para o CRM | Estado da auditoria |
| --- | --- | --- | --- |
| NIST SSDF | O SSDF organiza práticas para preparar a organização, proteger software, produzir software seguro e responder a vulnerabilidades; a abordagem é baseada em risco e depende de fundações anteriores. [11] | O roadmap técnico precisa incluir requisitos de segurança rastreados, revisão de mudança, resposta a vulnerabilidade e evidência de release. | Lacuna registrada: gate de engenharia segura por onda. |
| SLSA | O framework trata integridade de artefatos e oferece níveis incrementais de garantia sobre build, fonte e dependências. [12] | Preview e deploy não são suficientes: o CRM precisa saber que código, dependência e configuração chegaram a cada ambiente. | Lacuna registrada: provenance, artefato e promoção de release. |
| OWASP Top 10 2025 — cadeia de software | A orientação destaca inventário de dependências diretas e transitivas, SBOM, atualização baseada em risco, segregação de deveres e integridade de CI/CD. [13] | O projeto deve proteger repositório, branch, segredo, pipeline, dependência e configuração; nenhuma pessoa promove sozinha uma mudança sensível. | Risco aberto: processo de dependência, SBOM e aprovação de release ainda não definido. |

> **Leitura de auditoria:** a estratégia de Netlify + Supabase exige uma estratégia de release correspondente. Preview é ambiente de revisão; não é evidência de integridade, inventário de dependência, aprovação de migration ou recuperação de incidente.

[11] [NIST — Secure Software Development Framework](https://csrc.nist.gov/projects/ssdf)

[12] [SLSA — Supply-chain Levels for Software Artifacts](https://slsa.dev/)

[13] [OWASP Top 10 2025 — Software Supply Chain Failures](https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/)
