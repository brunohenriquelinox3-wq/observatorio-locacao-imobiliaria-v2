# PROT-RES-01 — proteção, APIs e recuperação operacional

**Captura:** 25 de agosto de 2026.  
**Estado:** `em_confronto` — referências primárias capturadas; os controles concretos dependem do modelo de ameaça, do parceiro e do ambiente homologado.

## Evidências relevantes

| Fonte | Achado verificável | Tradução prudente para o CRM |
| --- | --- | --- |
| NIST SP 800-61r3 (2025) | A resposta a incidentes deve integrar o gerenciamento de risco; o modelo usa Govern, Identify, Protect, Detect, Respond e Recover, com melhoria contínua. | Incidente não é um anexo do suporte: políticas, telemetria, owner, contenção, comunicação, recovery e aprendizagem devem estar ligados ao produto. [1] |
| OWASP API Security Top 10 (2023) | O projeto destaca autorização por objeto e função, propriedade de objeto, consumo inseguro de APIs, inventário, configuração e fluxos de negócio sensíveis. | RLS não dispensa verificação de ação; cada endpoint, exportação, webhook e comando financeiro requer escopo, rate limit, validação e prova permitir/negar. [2] |
| CISA Secure by Design | Segurança deve ser requisito de produto; MFA, logging e SSO são citados como capacidades que deveriam existir por padrão, não como ônus do cliente. | O CRM precisa produzir padrões seguros por default: menor privilégio, MFA para ação sensível, logs úteis, secrets isolados e revisão de release. [3] |
| Efí Webhooks | A documentação descreve mTLS, exigência de TLS 1.2, timeout de callback, tentativas de reentrega e reenvio específico. | Não existe “webhook universal”. O adaptador deve registrar mecanismo de autenticação, timeout, retry, replay, escopo de dados e procedimento de reconciliação por parceiro. [4] |

## Decisões propostas

| ID | Decisão revisável | Prova mínima antes de produção |
| --- | --- | --- |
| PROT-01 | Implementar modelo de ameaça por jornada: acesso, documento, financeiro, exportação, IA e webhook. | Ativo, ator, abuso, controle, owner e teste mapeados. |
| PROT-02 | Tratar autorização em três camadas: organização/tenant, objeto/dado e ação/alçada. | Testes permitir/negar por endpoint, RLS/policy e interface. |
| PROT-03 | Usar inbox imutável e processamento idempotente para eventos externos. | Reentrega, ordem invertida, payload inválido e replay controlado testados. |
| PROT-04 | Separar incidente de negócio, incidente de segurança e erro técnico, sem perder correlação. | Classificação, severidade, comunicação, evidence hold, rollback/recovery e postmortem. |
| PROT-05 | Construir inventário de APIs, segredos, versões, parceiros, webhooks, permissões e superfícies de exportação. | Dono, ambiente, data de revisão, política de rotação e desativação. |

## Cenários de recuperação prioritários

| Cenário | Contenção inicial | Recuperação e prova |
| --- | --- | --- |
| Segredo exposto | Revogar/rotacionar, bloquear chamadas e preservar investigação. | Reconfigurar ambiente, validar integridade de eventos e documentar impacto. |
| Callback comprometido ou inválido | Bloquear origem/regra, manter payload em quarentena, não aplicar efeito econômico. | Validar autenticação, reprocessar apenas eventos confirmados e reconciliar. |
| Acesso indevido | Suspender grant/sessão, congelar exportações sensíveis e preservar logs. | Reavaliar escopo, notificações aplicáveis, testes e recertificação. |
| Migration/policy defeituosa | Pausar release, evitar escrita destrutiva e fixar versão afetada. | Restore/teste de integridade, policy permitir/negar e registro de mudança. |
| Parceiro indisponível | Não confirmar sucesso local; enfileirar exceção e expor estado parcial. | Consulta/replay autorizado, conciliação por ID externo e fechamento de incidente. |

## Limite de responsabilidade

Estas referências orientam engenharia de produto, não certificação, parecer de segurança, conformidade jurídica ou aceitação de risco. Controles de dados, segurança, comunicação de incidente, retenção, obrigações de pagamento e resposta regulatória devem ser avaliados por responsáveis habilitados no contexto de cada organização, contrato e parceiro.

## Referências

[1] [NIST SP 800-61r3 — Incident Response Recommendations and Considerations for Cybersecurity Risk Management](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-61r3.pdf)  
[2] [OWASP — API Security Project](https://owasp.org/www-project-api-security/)  
[3] [CISA — Secure by Design](https://www.cisa.gov/securebydesign)  
[4] [Efí — Webhooks](https://dev.efipay.com.br/en/docs/api-pix/webhooks/)
