# Auditoria integral — confronto factual de dependências e lacunas

**Data de referência:** 26 de agosto de 2026, GMT-3.  
**Estado:** `achados_validados_para_consolidação`  
**Método aplicado:** os achados dos seis trilhos foram confrontados contra estratégia, documentos especializados, código e configuração disponíveis. Um achado não foi aceito somente porque apareceu em uma revisão paralela; ele foi classificado como **confirmado**, **lacuna deliberada**, **dependência externa/especialista** ou **falso positivo/refutado**.

## 1. Veredito de completude

> A estratégia está **amplamente coberta e coerente no nível de produto e desenho**, mas não está “completa para operação” enquanto seus gates técnicos, parceiros, especialistas e provas de produção permanecem pendentes. A maior lacuna não é tema ignorado: é a passagem controlada de decisão documentada para comando, dado, integração, observabilidade e validação de campo.

| Dimensão | Cobertura estratégica | Prontidão de implementação | Veredito de auditoria |
| --- | --- | --- | --- |
| Núcleo de produto e cadastros | Alta | Baixa–média | Modelo forte; necessita normalização de vocabulário e prova de jornada/policy. |
| Loteadora, ativos e carteira | Alta | Média | Domínio robusto; regras locais, alçadas e integrações continuam dependentes de prova/owner. |
| Financeiro, split e subledger | Alta | Média | Separação conceitual correta; capacidade do parceiro e homologação ainda bloqueiam automação. |
| Identidade e administração | Alta | Média | Fundação deny-by-default provada; comandos, MFA step-up e audit runtime ainda não existem. |
| Plataforma, integração e release | Alta | Baixa | Arquitetura canônica definida; código de template e ambiente ainda não materializam autoridade Supabase. |
| UX, pesquisa e concorrência | Alta | Média | Observatório é coerente; workspace operacional, evidência viva e sidebar acessível seguem como próximas construções aprováveis. |

## 2. Achados confirmados e priorizados

| Código | Severidade | Estado | Achado validado | Impacto | Owner | Prova de fechamento |
| --- | --- | --- | --- | --- | --- | --- |
| INT-01 | Alta | `parcial` | `Workspace`, `Organization`, `Enterprise` e `Development` aparecem como vocabulários em camadas diferentes sem mapeamento canônico único. | Pode gerar duplicidade de schema, policy e relatório ao implementar organizações/SPE/empreendimento. | Arquitetura de domínio + produto. | Glossário de mapeamento, diagrama ER e teste de isolamento entre organização, entidade legal e empreendimento. |
| INT-02 | Crítica | `lacuna deliberada` | A0/A0.1 provam estrutura privada e deny-by-default, mas não existem RPCs transacionais, bootstrap seguro, MFA step-up ou eventos append-only em execução. | A administração é segura por indisponibilidade, porém ainda não opera criação, delegação, suspensão ou revogação reais. | Segurança/IAM + engenharia. | Subetapa aprovada com RPCs, testes permitir/negar, correlação, idempotência, audit event e teste AAL. |
| INT-03 | Alta | `dependência externa` | Loteamento exige evidência registral, regra municipal, alçada comercial e decisão jurídica/urbanística por contexto. | Produto pode exibir elegibilidade incorreta se reduzir regra local/documento a boolean universal. | Jurídico imobiliário + urbanismo/engenharia + comercial. | `MunicipalityRuleSet`, dossiê revisado, owner, vigência e cenários de bloqueio/liberação homologados. |
| INT-04 | Crítica | `lacuna deliberada` | Direito, instrução, settlement e conciliação estão bem separados no desenho, mas não há subledger executável ou comando de reserva/distribuição transacional. | Dupla reserva, saldo duplicado ou evento reaplicado seriam riscos se funções fossem ligadas antes da fundação. | Engenharia financeira + controladoria. | Catálogo de comandos críticos, transação, `expected_version`, idempotência, inbox/outbox, caso de divergência e teste de reordenação. |
| INT-05 | Alta | `dependência externa` | O objetivo de muitos recebedores não pode ser assumido como suporte universal de parceiro; evidência prévia aponta limites distintos por provedor. | Split pode falhar, degradar para manual ou violar contrato/limite do parceiro. | Parcerias + financeiro + arquitetura. | `ProviderCapabilityProfile`, sandbox homologado, limites versionados, fallback humano e bloqueio antes de instruir. |
| INT-06 | Alta | `parcial` | A estratégia proíbe CRM como autoridade fiscal/contábil, mas o workspace/revisão do contador e o catálogo contextual de obrigação ainda não estão implementados. | Risco de hardcode fiscal, exportação sem escopo ou acesso além da finalidade. | Contador/controladoria + DPO + engenharia. | Matriz de permissão, perfil do contador só para leitura/revisão, catálogo versionado e parecer por contexto. |
| INT-07 | Alta | `lacuna deliberada` | O código de runtime permanece um template tRPC/Drizzle/MySQL, enquanto a autoridade estratégica de domínio é Supabase/Postgres/RLS. | Implementar domínio no template sem fronteira explícita criaria duas autoridades e violaria a decisão arquitetural. | Arquitetura + engenharia. | ADR que fixa o papel temporário do template, cliente/servidor Supabase para domínio, testes RLS e proibição de criar autoridade MySQL paralela. |
| INT-08 | Alta | `risco aberto` | SLO, correlação de comandos, runbooks praticados, SBOM/provenance e política de incidente permanecem de estratégia, não de operação. | Falha de callback, documento, exportação, migration ou release pode ser detectada tarde e recuperada sem trilha suficiente. | SRE/DevOps + segurança. | Cinco SLOs iniciais, telemetria com correlação, runbooks exercitados, inventário de dependência e promoção controlada. |
| INT-09 | Média | `lacuna deliberada` | `DashboardLayout` é uma fundação simples: largura em `localStorage`, redimensionamento por mouse e navegação plana. | Não cumpre ainda a sidebar auditada em árvore, disclosure, escopo/persistência e drawer acessível. | UX + frontend + acessibilidade. | Protótipo aprovado, teclado/touch/foco testados, escopo de persistência definido e política preservada fora da UI. |
| INT-10 | Média | `lacuna deliberada` | Pesquisa/IA e observatório documentam fonte, limite e revisão, mas não possuem entidade, RLS, workflow de aprovação ou lineage de métrica em produção. | Uma futura automação pode prometer atualização/IA sem fonte, finalidade, avaliação ou kill switch. | Curadoria + IA + DPO + engenharia. | `MarketEvidence`/registro de IA versionados, policy, avaliação, feedback, feature flag e desativação. |

## 3. Falsos positivos e achados refutados

| Código | Alegação revisada | Resultado da verificação | Decisão |
| --- | --- | --- | --- |
| FP-01 | `netlify.toml` estaria ausente. | **Refutada.** O arquivo está na raiz, define build, publish, Function, rota `/api/*`, proxy de storage e fallback SPA em ordem segura. | Não criar arquivo duplicado nem tratar configuração existente como lacuna. |
| FP-02 | Remover imediatamente `mysql2`, Drizzle e `DATABASE_URL` resolveria a arquitetura. | **Refutada como correção imediata.** Essas dependências pertencem ao template atual; removê-las sem transição quebraria runtime e não criaria a autoridade Supabase. | Registrar a fronteira/ADR e migrar somente em subetapa aprovada, sem dupla autoridade. |
| FP-03 | `localStorage` de largura de sidebar seria, por si, uma violação de acesso. | **Refutada como falha de autorização.** Armazena preferência visual de largura; é uma lacuna de escopo/acessibilidade e não deve conter contexto sensível. | Manter classificado como melhoria de UX/persistência, não como incidente de segurança. |
| FP-04 | A tela administrativa vazia provaria falha de segurança. | **Refutada.** A indisponibilidade intencional, RLS e policies de negação reduzem risco antes de existirem comandos. | Tratar como lacuna funcional planejada, não abrir bootstrap ou grant sem RPC/MFA/auditoria. |

## 4. Dependências que não pertencem ao software

| Área | Decisão que exige validação contextual | Owner externo/independente | Como o CRM deve atuar |
| --- | --- | --- | --- |
| Registro/loteamento | Vigência de certidão, registro aplicável, regra municipal, ônus, garantia, reentrada e elegibilidade de venda. | Jurídico imobiliário, registro, urbanismo/engenharia e comercial. | Guardar evidência, revisão, vigência, alçada, caso e bloqueio; não certificar regularidade. |
| Fiscal/contábil | DIMOB, retenção, competência, documento fiscal, distribuição, associação de corretor e exportação. | Contador, controladoria e jurídico. | Preservar origem/versionamento, revisão e lote de exportação; não hardcode regra/unidade/percentual. |
| Pagamentos/split | Limites de recebedores, método, prazo, callback, reversão, chargeback e liquidação. | Instituição/PSP contratado, jurídico e financeiro. | Perfil de capacidade, intenção, correlação, estado incerto, conciliação e exceção. |
| Privacidade/retencão | Finalidade, base legal, prazo, legal hold, exclusão, restauração e compartilhamento. | DPO e jurídico. | Classificação, policy, acesso mínimo, workflow de retenção e teste de ciclo de vida. |

## 5. Cobertura ainda necessária antes de declarar prontidão operacional

| Bloco de prova | Por que é necessário | Dependências de achados |
| --- | --- | --- |
| Matriz de policy e testes permitir/negar por tabela, arquivo e comando. | Princípios de acesso não equivalem a autorização testada. | INT-01, INT-02, INT-06, INT-07. |
| Catálogo de comandos críticos transacionais. | Função/rota não é especificação de concorrência, alçada, idempotência ou compensação. | INT-02, INT-04, INT-05. |
| Contrato por integração e homologação de parceiro. | Dados/efeitos externos não podem depender de promessa de API. | INT-04, INT-05, INT-06. |
| SLO, telemetria, incidente e supply chain. | Preview/build não provam recuperação, integridade nem operação confiável. | INT-08. |
| Validação por papel e dados sintéticos. | Estratégia/observatório não comprovam rotina de corretor, loteadora, gestor, contador ou suporte. | INT-03, INT-06, INT-09, INT-10. |

## 6. Fontes que sustentam o tratamento de risco

As lacunas de policy, autorização por objeto, integração, telemetria, SLO, IA e release permanecem coerentes com a auditoria externa já preservada: OWASP ASVS/API Security, NIST Zero Trust/AI RMF/SSDF, OpenTelemetry, Google SRE e SLSA. [1] Essas fontes sustentam o método de prova; não transferem ao CRM as decisões profissionais de jurídico, contador, DPO ou parceiro financeiro.

## Referências

[1] [Caderno de evidências da auditoria integral](auditoria_estrategia_crm_evidencias.md)

[2] [Relatório de auditoria integral anterior](auditoria_estrategia_crm_relatorio.md)

[3] [Inventário de auditoria desta revisão](crm_auditoria_integral_inventario_20260826.md)

[4] [Resultados paralelos dos trilhos](../auditoria_integral_trilhos.json)

[5] [Resultados do confronto de dependências](../confronto_integral_dependencias.json)
