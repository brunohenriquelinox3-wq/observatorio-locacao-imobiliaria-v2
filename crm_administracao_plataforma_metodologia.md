# Administração de plataforma — carta de princípios e método

**Estado:** `em_construcao`  
**Escopo:** Super Admin de plataforma, Admin de organização, Admin de área, operador, suporte temporário e administração de emergência.  
**Limite:** este CRM não deve tratar “nível deus” como acesso ilimitado, invisível ou cotidiano. Administração privilegiada é uma capacidade excepcional, deliberadamente mais lenta, rastreável e revisável.

## 1. Pergunta de desenho

Como iniciar o desenvolvimento pelo painel administrativo sem construir uma porta de bypass para dados de clientes, financeiro, documentos, integrações ou permissões?

## 2. Princípios inegociáveis

| Princípio | Decisão de produto e arquitetura | Prova exigida |
| --- | --- | --- |
| **Plataforma não é locatária** | O Super Admin administra configurações, organizações, segurança e suporte; ele não herda a leitura cotidiana de dados de cada cliente. | A consulta direta de dados de organização falha sem fluxo de suporte explícito, escopo e expiração. |
| **Menor privilégio** | Papel-base nunca basta: organização, SPE, módulo, objeto, ação, finalidade, alçada, vigência e risco completam a decisão. | Testes `permitir/negar` cobrem UI, RLS, função, Storage e exportação. |
| **Segregação de deveres** | Convidar, aprovar, elevar privilégio, alterar política, reprocessar callback, instruir pagamento e exportar dados não são a mesma ação. | A matriz impede acúmulo indevido ou exige dupla aprovação quando o risco for alto. |
| **Sessão reforçada** | Ações privilegiadas usam MFA recente, reautenticação proporcional, dispositivo/sessão identificável e limite de duração. | Evento de sessão e comando crítico registram contexto, motivo e resultado. |
| **Just-in-time** | Suporte e acesso elevado são concedidos por caso, finalidade e tempo; não por preferência permanente. | Expiração automática e revisão provam revogação mesmo quando o operador não age. |
| **Auditabilidade sem apagamento** | Atos administrativos produzem audit event imutável e legível, separado de telemetria. | Alteração, aprovação, negação, expiração e correção podem ser reconstruídas em ordem temporal. |
| **Emergência controlada** | Break-glass existe para indisponibilidade ou risco material, com contato, justificativa, prazo, alerta e revisão posterior. | O uso abre incidente e não cria privilégios permanentes. |

## 3. Camadas de administração

| Camada | Pergunta que responde | Pode fazer | Não pode fazer por padrão |
| --- | --- | --- | --- |
| **Super Admin de plataforma** | A plataforma é segura, disponível e configurada corretamente? | Criar/suspender organização, administrar catálogo de capacidade, políticas globais, segurança, integrações aprovadas, incidentes e suporte temporário. | Ler carteira, dossiê, documento, proposta, valor ou split de cliente sem caso autorizado. |
| **Admin de organização** | Esta empresa usa o produto com pessoas, dados e políticas adequadas? | Gerir membros, unidades, SPEs, papéis locais, catálogos e políticas permitidas. | Alterar guardrails globais, acessar outra organização ou escapar de alçadas financeiras. |
| **Admin de área** | A operação do setor está configurada e monitorada? | Configurar vistas, filas, templates e delegações da sua área no escopo recebido. | Conceder privilégio acima da área, alterar RLS, trocar parceiro ou aprovar efeito reservado. |
| **Operador** | Qual ação de negócio precisa ocorrer agora? | Executar a jornada permitida e abrir exceção. | Administrar acessos, política, integração, auditoria ou dado fora do próprio escopo. |
| **Suporte temporário** | Como investigar um caso sem quebrar isolamento? | Acessar diagnóstico mínimo, mascarado e temporal aprovado. | Navegar livremente por dados de cliente ou reter sessão após o caso. |

## 4. Objetos administrativos mínimos

| Objeto | Finalidade | Campos de controle mínimos |
| --- | --- | --- |
| `PlatformPrincipal` | Identidade privilegiada de plataforma. | Estado, MFA, owner, elegibilidade, última recertificação e método de recuperação. |
| `OrganizationMembership` | Relação de pessoa com organização/SPE/unidade. | Papel-base, escopo, vigência, fonte, aprovador e estado. |
| `AdministrativeGrant` | Permissão excepcional ou delegada. | Ação, recursos, finalidade, motivo, início, expiração, aprovador e revogação. |
| `PrivilegeElevation` | Elevação de sessão para comando de alto risco. | Reautenticação, MFA recente, risco, motivo, duração e correlação. |
| `SupportCaseAccess` | Acesso mínimo de suporte a um caso. | Organização, objeto mascarado, finalidade, owner, expiração e consentimento/política aplicável. |
| `BreakGlassEvent` | Uso de emergência. | Incidente, gatilho, aprovador posterior, duração, evidência e ação corretiva. |
| `AdminAuditEvent` | Trilho imutável de decisão. | Ator, sujeito, organização, ação, antes/depois redigido, motivo, resultado, correlação e retenção. |

## 5. Critério de prioridade para início do desenvolvimento

O painel administrativo deve ser construído **antes** do restante apenas em seu núcleo de segurança: autenticação reforçada, bootstrap de primeira organização, memberships, escopo, RLS, audit event, revogação, convite e testes de isolamento. Catálogos, configurações visuais, analytics, suporte avançado e automação administrativa entram depois que essas fronteiras sobreviverem aos cenários de permitir/negar, expiração, concorrência e recuperação.

> **Regra de início:** não existe Super Admin “mestre” guardado em variável de ambiente, claim não verificada ou botão escondido. O privilégio é dado persistido, sujeito a policy, sessão, alçada, auditoria, expiração e teste.

## 6. Método de pesquisa e decisão

Cada decisão da camada administrativa será analisada em seis passos: **ameaça**, **fonte primária**, **contraponto**, **modelo de domínio**, **teste de abuso/falha** e **gate de promoção**. Documentação de fornecedor e padrão de segurança definem comportamento; experiência de suporte e piloto testam a operação; nenhum exemplo comunitário vira privilégio de produção sem compatibilidade, revisão de segurança e regressão.
