# Protocolo de plataforma — Netlify + Supabase

## Versão 0.1 — agosto de 2026

Este estudo trata **Netlify** como camada de entrega web, borda segura e integração de frontend; e **Supabase** como plataforma de dados Postgres, autenticação, autorização, armazenamento de evidências, funções de domínio e mudanças versionadas. A decisão não transforma nenhum dos dois em banco, ERP, instituição de pagamento ou parecer jurídico/fiscal. O CRM continua sendo a camada operacional de relações, propostas, eventos, direitos e evidências; parceiros habilitados continuam responsáveis por liquidação, escrituração, obrigações e decisões profissionais.

> **Hipótese de plataforma:** Netlify + Supabase reduz a distância entre uma interface de CRM rápida e uma fonte de dados auditável, desde que o produto use RLS, funções transacionais, migrações, logs, chaves segregadas e contratos de integração desde a primeira onda.

## 1. Questões que o estudo precisa responder

| Eixo | Pergunta de decisão | Evidência necessária |
| --- | --- | --- |
| Entrega | O frontend, funções e ambiente conseguem ser entregues com preview, rollback, segredos e separação de ambientes? | Documentação oficial de deploy, variáveis, funções, identidade e observabilidade. |
| Dados | O modelo canônico de partes, ativos, contratos, eventos e direitos cabe em Postgres sem estado duplicado? | Recursos oficiais de Postgres, migrações, transações, políticas e auditoria. |
| Acesso | Uma pessoa só vê organização, SPE, carteira, documento e ação compatíveis com seu escopo? | Auth, RLS, claims, políticas testáveis e trilha de concessão/revogação. |
| Evidências | Documentos podem manter metadados, finalidade, validade, acesso e retenção sem URL pública permanente? | Storage privado, URL assinada, política por objeto e log de acesso. |
| Integrações | Webhooks e callbacks podem ser autenticados, idempotentes, reprocessáveis e reconciliáveis? | Funções seguras, fila/outbox, chaves externas únicas, logs e alertas. |
| Operação | O produto preserva resiliência diante de falha parcial, limite, deploy e mudança de esquema? | Ambientes, preview, testes, migração reversível, telemetria e runbook. |
| Custo e escala | Qual componente é uso-elástico, qual exige controle e quando uma fila/serviço especializado é necessário? | Limites, precificação vigente, métrica de consumo e teste de carga. |

## 2. Fronteiras de responsabilidade já definidas

O subledger receberá retorno de banco/parceiro de pagamento, mas a liquidação externa não será reimplementada. Cada callback deverá ter assinatura validada, chave de correlação, idempotência e reconciliação; instruções só podem nascer de direito elegível e aprovado. [1] [2] Da mesma forma, um lote contábil pode ser produzido e acompanhado, mas o CRM não substitui razão, escrituração, enquadramento tributário ou validação por contador e fiscal habilitados.

| Domínio | Fonte operacional no CRM | Plataforma de apoio | Limite não negociável |
| --- | --- | --- | --- |
| Interface e entrega | Aplicação web, previews e configuração por ambiente | Netlify | Nenhum segredo crítico no bundle do navegador. |
| Dados de domínio | Parte, ativo, contrato, evento, direito, evidência e log | Supabase Postgres | RLS e função transacional impedem acesso/escrita direta inadequada. |
| Identidade e sessão | Usuário, organização, membership e papel de produto | Supabase Auth + políticas | Autenticação não é autorização; escopo vem de política/claim validada. |
| Documento | Metadado de evidência, finalidade, revisão e retenção | Supabase Storage privado | Documento não se torna público por URL estável. |
| Integração externa | Intenção, callback, id externo, estado e divergência | Função segura + outbox/inbox | Webhook não atualiza fato econômico sem verificação/idempotência. |
| Pagamento e split | Entitlement, aprovação e instrução externa | Parceiro financeiro habilitado | CRM não liquida, não custodia e não assume papel de instituição de pagamento. |
| Fiscal e contábil | Evento, competência, mapeamento, lote e retorno | ERP/fiscal/contador integrados | Parâmetro fiscal não é regra fixa de tela. |

## 3. Critérios de decisão técnica

1. **Fonte de verdade explícita.** Para cada objeto, campo e evento, a arquitetura declara ownership, chave externa, versão e regra de reconciliação.
2. **Negócio crítico em transação.** Reserva, proposta, lote, direito, aprovação, fechamento e aplicação de caixa não dependem de múltiplas escritas frágeis pelo navegador.
3. **Segurança no dado.** A autorização não pode existir apenas na interface ou na função; políticas do banco precisam restringir leitura e escrita por organização, papel, finalidade e escopo.
4. **Arquivo privado por padrão.** Metadado e binário têm escopos distintos; acesso é temporal, auditável e revogável.
5. **Integração por evento, não por cópia.** Mudanças externas entram por inbox validado; saídas são registradas em outbox antes de chamar o terceiro; cada tentativa preserva resultado e referência.
6. **Mudança reversível.** Migração, regra de negócio, política de acesso, layout de exportação e contrato de integração possuem versão, teste e plano de rollback.
7. **Observabilidade de operação.** Falhas de callback, fila, RLS, armazenamento, latência e custo geram sinal operacional antes de virarem divergência contábil ou perda comercial.

## Referências iniciais

[1] [Área de contabilidade, integrações e fechamento — CRM imobiliário](crm_area_contabilidade_integracoes.md)

[2] [Arquiteturas de cobrança e split — requisitos de integração](arquiteturas_cobranca_split.md)
