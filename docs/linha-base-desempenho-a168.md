# Linha de base de desempenho — A168

**Data:** 04 de setembro de 2026  
**Escopo:** build local de produção. Não houve alteração de código, dados, sessão, contexto ou autorização.

## Instrumentação disponível

A instrumentação de navegador para traço de desempenho não está configurada neste ambiente. Por isso, não foram inferidos indicadores de experiência real nem efetuada otimização por suposição. A análise foi limitada à composição estática gerada pelo build local.

## Linha de base observada

| Recurso de entrada | Tamanho bruto | Tamanho gzip | Leitura |
|---|---:|---:|---|
| JavaScript de entrada | 1.020.102 bytes | 282.103 bytes | Requer atribuição antes de qualquer intervenção. |
| CSS de entrada | 146.229 bytes | 24.999 bytes | Permanece contido e não justifica alteração isolada. |
| Página de estratégia em carregamento sob demanda | 587.179 bytes | Não medido neste corte | Continua fora da rota inicial por importação preguiçosa. |
| Página de Vendas Urbanas em carregamento sob demanda | 461.404 bytes | Não medido neste corte | Continua fora da rota inicial por importação preguiçosa. |

## Decisão

As páginas de estratégia e gráficos já usam importação sob demanda e não entram na rota inicial. Sem traço de navegador e sem analisador de composição disponível, não existe uma causa atribuída para mudar importações, cache, lógica de autorização ou CSS. A mudança mais segura é **não otimizar prematuramente**.

Uma intervenção só poderá ser proposta após instrumentação que separe o custo do shell global, das bibliotecas de interface e da inicialização de sessão. Até lá, preservam-se a divisão por rota, o CSS inicial reduzido, a seleção fail-closed e todos os bloqueios de domínio.
