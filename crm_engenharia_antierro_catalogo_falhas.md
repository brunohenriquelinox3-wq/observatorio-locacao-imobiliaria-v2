# Catálogo de falhas previsíveis e inesperadas — CRM imobiliário

## Versão 0.1 — agosto de 2026

> **Uso:** este catálogo não prevê o futuro por adivinhação. Ele transforma condições normais, exceções prováveis e falhas parciais em cenários que o produto precisa prevenir, detectar, conter, recuperar e testar antes de escalar.

## 1. Invariantes que não podem ser violadas

| ID | Invariante | Consequência se quebrar | Prioridade inicial |
| --- | --- | --- | --- |
| INV-01 | Uma organização/SPE não lê, altera, exporta ou assina artefato de outra organização sem relação e finalidade autorizadas. | Exposição de dados, conflito contratual e falha de confiança. | Crítica |
| INV-02 | Uma unidade/lote não alcança estado comercial incompatível com sua disponibilidade, reserva, proposta, contrato ou restrição registral. | Dupla venda, reserva falsa ou carteira inconsistente. | Crítica |
| INV-03 | Um fato econômico possui origem, moeda, competência, versão de regra, estado e trilha de reconciliação; não é “corrigido” apagando o passado. | Saldo, direito, repasse e fechamento não explicáveis. | Crítica |
| INV-04 | Um callback, job ou reenvio não cria duas vezes o mesmo efeito econômico, documento, notificação ou atualização de estado. | Duplicidade de recebimento, split ou comunicação. | Crítica |
| INV-05 | A policy é aplicada no dado/arquivo/endpoint, não presumida a partir de menu, rota ou papel exibido na interface. | Bypass de acesso e auditoria frágil. | Crítica |
| INV-06 | Documento privado preserva escopo, versão, hash/metadado, finalidade e permissão; URL/objeto não é evidência de acesso universal. | Vazamento ou evidência sem cadeia de custódia. | Alta |
| INV-07 | Um cálculo ou automação de IA não produz efeito irreversível sem dado de origem, explicação, limite e aprovação humana quando o risco exigir. | Decisão financeira, fiscal, jurídica ou comercial indevida. | Crítica |
| INV-08 | Deploy, schema, policy e integração podem ser identificados, testados, revertidos/compensados e correlacionados ao incidente. | Recuperação lenta, drift e erro sem causa rastreável. | Alta |

## 2. Cenários de falha por jornada

| Classe | Cenário concreto | Sintoma provável | Prevenção mínima | Detecção/recuperação |
| --- | --- | --- | --- | --- |
| Sessão e acesso | Perfil perde alçada ou muda de organização durante sessão ativa. | Tela antiga ainda oferece ação; endpoint é chamado com claim defasada. | Revalidação por policy/RPC; autorização por objeto e finalidade; token/claim com estratégia de renovação. | Teste permitir/negar; `authorization_denied` correlacionado; encerrar/renovar sessão sem apagar trabalho rascunho. |
| Cadastro e duplicidade | CPF/CNPJ, empresa, contato ou parte econômica é criado duas vezes em fluxos paralelos/importação. | Dossiês e direitos se dividem em registros distintos. | Chave normalizada, regra de deduplicação, revisão de possível match e merge auditável. | Alerta de colisão; merge com preservação de relações, versões e owner. |
| Estoque e reserva | Dois corretores reservam a mesma unidade/lote; uma aba está desatualizada. | “Disponível” na tela e indisponível no banco, ou duas confirmações. | Transação com versão/lock e transição de estado validada no servidor. | Conflito explícito ao usuário; audit event; tela recarrega estado canônico sem inventar sucesso. |
| Proposta e contrato | Proposta aprovada contra versão errada de preço, índice, documento ou parte. | Assinatura/contrato não corresponde ao que foi autorizado. | Snapshot/versionamento da proposta e regra de elegibilidade por data/estado. | Comparação de versão antes de enviar; bloqueio/retificação com causa, não sobrescrita. |
| Financeiro e split | Pagamento chega duplicado, parcial, atrasado, fora de ordem ou sem identificador confiável. | Duplo crédito, saldo divergente ou repasse incorreto. | Inbox/outbox, chave idempotente, estado pendente e regra de alocação versionada. | Conciliação por fato externo; fila de exceção; compensação/reversão controlada e aprovação. |
| Loteadora e permuta | Dono de terra, permutante, corretor e SPE têm regras de prioridade/vigência conflitantes. | Cascata paga pessoa errada ou excede base permitida. | Motor configurável com soma, teto, vigência, prioridade, aprovação e simulação. | Simulação antes da liberação; divergência bloqueia lote de repasse; parecer habilitado quando aplicável. |
| Documento privado | Upload interrompe, objeto é substituído, link expira, arquivo malicioso ou policy muda. | Documento não abre, abre indevidamente ou perde valor de evidência. | Upload retomável/verificado, bucket privado, metadado/hashing, antivírus conforme risco e policy de objeto. | Estado “recebido/validado/rejeitado”; log de download; quarentena e nova solicitação. |
| Integração | Parceiro responde 200 mas processa depois, ou timeout ocorre após o parceiro aceitar. | Aplicação não sabe se deve reenviar; efeito duplicado é possível. | Contrato de idempotência, correlação, outbox, inbox, retry com backoff e status de reconciliação. | Dashboard de pendência/idade; replay seguro; contato do parceiro e bloqueio de efeito não conciliado. |
| Relatório e exportação | Filtro ignora organization/SPE, timezone, versão de regra ou permissionamento. | Número “correto” em aparência, mas errado para fechamento/decisão. | Consulta com escopo no banco, catálogo de métrica, data de corte e teste de autorização. | Reconciliação com subledger; exportação assinada/registrada; invalidação e reemissão versionada. |
| Interface | Duplo clique, reconexão, refresh, cache obsoleto, loading infinito ou falha parcial. | Usuário tenta repetir comando ou toma decisão em estado incompleto. | Comando desabilitado após submissão, request id, estado de loading/erro/resultado, retry seguro e boundary por rota/painel. | Telemetria de UX e erro; fallback com correlação; rascunho preservado quando apropriado. |
| Migration e release | Schema/policy/função é promovida em ordem errada ou client novo fala com backend antigo. | 5xx, dado truncado, policy negando tudo ou efeito parcial. | Migration expandir/contrair, feature flag, compatibilidade temporal, preview e gate de rollback. | SLO/error budget; canário; rollback de app e migration compensatória/reconciliação distinta. |
| Capacidade | Pool, fila, Realtime, Storage, payload ou fornecedor atinge limite. | Latência, queda parcial, callback acumulado ou custo inesperado. | Limite por jornada, paginação, backpressure, fila durável e teste de carga. | Alerta por backlog/idade/erro; degradação explícita; escalonamento e revisão de arquitetura. |
| IA assistida | Resumo usa evidência errada, sugerindo ação sem fonte ou com instrução adversarial. | Corretor/confirmação toma ação com justificativa opaca. | Recuperação com fonte, escopo, policy, avaliação, review e kill switch. | Amostragem/eval; feedback rastreável; desativar automação e voltar a fluxo manual. |

## 3. Cenários inesperados obrigatórios

| Estímulo | Pergunta de teste | Resultado seguro esperado |
| --- | --- | --- |
| Rede cai depois de enviar um comando. | O comando foi recebido? Pode ser refeito? | Estado “desconhecido/em reconciliação”; não afirmar sucesso nem reenviar sem idempotência. |
| Mensagem chega duas vezes, tarde ou fora de ordem. | O segundo evento muda o estado? | Deduplicar, ordenar/validar versão e manter exceção explicável. |
| Requisição concorrente executa com dado já alterado. | A regra usa snapshot antigo? | Conflito detectado e transação rejeitada/serializada; usuário revisa o estado atual. |
| Relógios, fuso e horário de verão divergem. | Competência, vencimento e vigência mudam? | Instante normalizado, timezone de negócio explícito e data de corte auditável. |
| Operador com alçada elevada erra ou credencial é comprometida. | Existe blast radius proporcional? | Menor privilégio, step-up/aprovação, audit trail, alerta e break-glass governado. |
| Terceiro muda contrato/API/limite sem aviso suficiente. | O CRM reconhece incompatibilidade? | Contract test, versionamento, fallback, fila de exceção e comunicação sem corromper estado. |
| Observabilidade falha durante incidente. | A equipe ainda sabe o que ocorreu? | Audit event e registros locais/alternativos mínimos; incidente registra lacuna de sinal. |
| Backup existe mas restore nunca foi ensaiado. | É possível recuperar no RTO/RPO aceito? | Restore isolado, reconciliação e evidência de ensaio antes de depender do plano. |

## 4. Ordem de endurecimento

1. **Antes de dados reais:** identidade, organização, RLS, migration, backup/restore ensaiado, contrato de erro, correlação e teste de permitir/negar.
2. **Antes de dinheiro, documento ou reserva:** concorrência, idempotência, inbox/outbox, regra versionada, audit event, reconciliação e sandbox.
3. **Antes de escalar piloto:** SLOs, alertas, tracing, carga, runbooks, incidentes simulados, dependências e release canário.
4. **Antes de automação/IA de maior impacto:** fonte, escopo, avaliação, supervisão humana, limite, fallback manual e kill switch.
