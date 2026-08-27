# Decisão S0 — Fundação do CRM

**Status:** `aprovada_por_diretriz_de_execução_linear_2026-08-27`  
**Escopo desta decisão:** iniciar a criação do CRM pela fundação governada. Esta decisão não cria dados reais, não movimenta recursos e não habilita comunicação, cobrança, pagamento, repasse, publicação, IA operacional ou integração de terceiro.

> **Decisão canônica:** Supabase/PostgreSQL será a persistência transacional planejada para o CRM. A configuração MySQL/Drizzle existente no template é tratada como legado de scaffolding e não poderá receber entidades de negócio em paralelo. Antes de qualquer migration, a base Supabase será inspecionada de forma somente leitura e o contrato técnico será alinhado para uma única fonte de persistência.

## 1. Corte inicial obrigatório

| Elemento | Incluído no primeiro corte | Limite explícito |
| --- | --- | --- |
| Contexto organizacional | Organização, módulo, escopo, papel, grant, vigência e motivo de acesso. | Nenhuma organização real será criada por inferência ou com dados de terceiros. |
| Identidade de domínio | `Party` canônica e papel temporal, inicialmente sem dossiê real. | Não inclui CPF/CNPJ, documentos sensíveis, consulta externa ou dados de clientes. |
| Ativo de domínio | Estrutura mínima para imóvel/ativo, estado e relação contextual. | Não inclui publicação, chave, localização precisa, estoque produtivo ou informação comercial real. |
| Auditoria | Evento de decisão com autor, contexto, antes/depois, correlação e motivo. | Não grava segredos, conteúdo de dossiê, dados financeiros ou dados pessoais além do estritamente necessário. |
| Autorização | Negação por padrão e matriz de permitir/negar para organização, papel, objeto e finalidade. | Menu, rota, identificador ou estado de tela nunca concedem acesso. |

## 2. Exclusões deliberadas

| Fora do corte inicial | Condição de reabertura |
| --- | --- |
| Financeiro, cobrança, conciliação, pagamento, repasse e split | Fundação de contrato, evento, obrigação, alçada, parceiro habilitado e cenários de exceção aprovada. |
| Portais, mensageria, assinatura, publicação e canais externos | Policy de objeto/campo, sessão, consentimento/finalidade, idempotência, preview e retorno governado. |
| IA, score, automação material e recomendação com efeito externo | Contrato de métrica, explicação, revisão humana, monitoramento e rollback validados. |
| Mudança de arquitetura de SUPER ADM, ADM e Loteadora | Frente específica autorizada para as três colunas, sem inferência a partir de Vendas Urbanas e Locação. |

## 3. Critério de passagem para a implementação

A fundação somente inicia migrations e código de domínio depois de: **(i)** identificar o projeto Supabase correto e sua estrutura existente sem modificá-la; **(ii)** alinhar o projeto local a PostgreSQL sem coexistência de models concorrentes; **(iii)** converter o corte acima em schema, policies, testes permitir/negar e interfaces de erro; e **(iv)** criar checkpoint técnico anterior à primeira alteração estrutural.

## 4. Referências internas

[1] [Plano estratégico de desenvolvimento por ondas](plano_estrategico_ondas_vendas_locacao.md)

[2] [Parecer de prontidão para início do desenvolvimento](parecer_prontidao_inicio_desenvolvimento_crm.md)

[3] [Estratégia atualizada — Vendas Urbanas e Locação](estrategia_vendas_urbanas_locacao_atualizada.md)
