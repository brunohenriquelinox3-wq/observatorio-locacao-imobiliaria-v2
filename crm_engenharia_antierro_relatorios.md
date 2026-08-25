# Relatórios de risco, bugs, incidentes e melhoria contínua

## 1. Princípio de registro

> **Nenhum erro é fechado porque “sumiu”.** Um caso fecha quando há causa/condição suficientemente entendida, contenção documentada, correção ou aceitação de risco, prova de regressão, owner e data de revisão.

## 2. Quatro artefatos operacionais

| Artefato | Quando nasce | Conteúdo obrigatório | Critério de encerramento |
| --- | --- | --- | --- |
| Registro de risco | Antes de construir ou quando muda domínio/fornecedor/limite. | Cenário, invariante, severidade, probabilidade, detectabilidade, owner, controles e risco residual. | Controle aceito e testado, ou exceção aprovada com vencimento. |
| Bug reproduzível | Com comportamento diferente do esperado, alerta ou relato interno. | Ambiente/release, passos mínimos, dados sintéticos, esperado/observado, correlação, impacto e hipótese. | Repro não ocorre mais no teste de regressão e a causa foi classificada. |
| Incidente | Impacto em dado, segurança, disponibilidade, integração, dinheiro, documento ou operação. | Linha do tempo, impacto, escopo, decisão de contenção, owner, comunicações, evidências e estado de recuperação. | Serviço estabilizado, reconciliação concluída/planejada e postmortem aberto quando aplicável. |
| Postmortem | Incidente material, quase-incidente relevante ou padrão recorrente. | Contexto, impacto mensurado/estimado, gatilho, condições, causas técnicas/sistêmicas, resposta, aprendizado e ações. | Ações têm owner, prioridade, prazo, tracking e prova de eficácia; não atribui culpa pessoal. |

## 3. Gravidade e encaminhamento

| Nível | Exemplo no CRM | Resposta inicial | Governança |
| --- | --- | --- | --- |
| SEV-0 | Exposição ativa ampla, efeito econômico irreversível em escala, indisponibilidade da base crítica sem contingência. | Conter/pausar efeito, preservar evidência, acionar responsáveis e parceiro quando aplicável. | Liderança técnica e responsáveis por privacidade, finanças, jurídico ou segurança conforme o caso. |
| SEV-1 | Falha material em reserva, pagamento, acesso, documento, integração ou fechamento com impacto limitado/conhecido. | Isolar jornada, fila de exceção, reconciliação e comunicação dirigida. | Owner nomeado, incidente e plano de correção antes de reabrir/expandir. |
| SEV-2 | Função degradada, erro recorrente, forte risco de regressão ou quase-incidente. | Feature flag, workaround seguro, correção priorizada e teste de regressão. | Bug rastreado com SLA interno e revisão semanal. |
| SEV-3 | Defeito sem impacto sensível, dívida de qualidade ou melhoria de diagnóstico. | Triage e planejamento de correção. | Backlog com owner, prioridade e data de reavaliação. |

## 4. Linha de vida de um erro

1. **Capturar:** usuário, teste, scan, trace, alerta, revisão ou parceiro gera ocorrência com correlação e minimização de dados.
2. **Triar:** classificar jornada, versão, severidade, invariantes, reproducibilidade, sensibilidade e necessidade de contenção.
3. **Conter:** pausar flag, retirar alçada, bloquear fila, limitar endpoint, segregar arquivo ou ativar fallback sem alterar o fato histórico.
4. **Investigar:** montar reprodução segura, linha do tempo e relações entre release, migration, policy, evento, parceiro e experiência.
5. **Corrigir:** escolher prevenção de causa, não apenas remendo do sintoma; separar rollback de app, compensação de dado e replay de integração.
6. **Provar:** adicionar teste/regra/alerta; executar contra caso positivo e negativo; confirmar que não cria regressão adjacente.
7. **Aprender:** registrar ação, atualizar catálogo/arquitetura, medir repetição e revisar controles em piloto.

## 5. Modelo curto de postmortem sem culpa

| Seção | Pergunta que deve ser respondida |
| --- | --- |
| Resumo e impacto | Quem foi afetado, qual jornada, quando, por quanto tempo e qual efeito observável ocorreu? |
| Contexto e mudança | Qual era o estado normal, qual release/configuração/parceiro/regra participava e quais limites existiam? |
| Linha do tempo | Que sinais surgiram, quem decidiu o quê e quando a contenção/recovery foi confirmada? |
| Gatilho e condições | Qual combinação técnica e sistêmica tornou o caso possível? O que faltou para impedir ou detectar antes? |
| Resposta e recuperação | Como o impacto foi limitado, quais fatos ficaram pendentes e como ocorreu reconciliação/retificação? |
| Aprendizado | O que funcionou, o que não funcionou, que métrica/alerta/processo/documento era insuficiente? |
| Ações | Ação específica, tipo (prevenir/detectar/conter/recuperar), owner único, prioridade, prazo, tracking e prova de eficácia. |

## 6. Painel de melhoria contínua

O painel não mede “quantos bugs foram fechados” isoladamente. Ele separa **risco de domínio**, **qualidade de mudança**, **saúde de integração**, **segurança/acesso**, **experiência** e **aprendizado operacional**. Métricas iniciais incluem: falha por jornada e release; idade de exceção; taxa de retry/replay; backlog de fila; tempo de detecção/contenção/recuperação; cobertura de casos negar; porcentagem de ações de postmortem concluídas no prazo; recorrência após correção; e casos em que usuário tomou ação com estado parcial.

Os indicadores não devem ser usados para culpar operador ou esconder incidente. Eles servem para localizar controles frágeis, decidir se uma capacidade deve pausar e comprovar que um piloto amadureceu antes de expandir.

## 7. Fontes de diagnóstico permitidas

| Fonte | Papel | Regra de uso |
| --- | --- | --- |
| Documentação/especificação/changelog oficial | Comportamento esperado e versão. | Primeira referência para limite e correção. |
| Repositório/issue tracker/advisory oficial | Regressão, bug conhecido e compatibilidade. | Registrar versão, link e teste local. |
| Scan, trace, log e teste do próprio produto | Evidência do caso real. | Sanitizar dados; preservar correlação e ambiente. |
| SRE, OWASP, NIST, Playwright e fontes técnicas reconhecidas | Prática de controle e processo. | Adaptar ao risco; não copiar checklist cegamente. |
| Comunidade técnica, incluindo Stack Overflow | Hipótese e técnica de reprodução. | Nunca promover resposta diretamente; validar fonte, versão, licença, segurança e teste. |

## Referências de base

[1] [Google SRE — Postmortem Culture](https://sre.google/workbook/postmortem-culture/)

[2] [Stack Overflow Help — Minimal, Reproducible Example](https://stackoverflow.com/help/minimal-reproducible-example)

[3] [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
