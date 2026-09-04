# Medição de carregamento — A115

## Hipótese verificada

A folha principal carregava estilos exclusivos das rotas preguiçosas **Vendas Urbanas** e **Estratégia CRM**, além de um estilo de página inicial substituída. Esse carregamento era um custo mensurável para a entrada operacional, embora as telas proprietárias não fossem abertas.

## Intervenção única

Foram removidas da folha global as importações exclusivas. Os estilos de Vendas Urbanas e Estratégia CRM agora são importados apenas pelas respectivas rotas lazy. A folha `field-notes.css`, que não possui consumidor na aplicação atual, deixou de ser carregada.

| Métrica | Antes | Depois | Resultado |
|---|---:|---:|---|
| CSS inicial (raw) | 241.860 B | 142.569 B | -99.291 B (-41,1%) |
| CSS inicial (gzip) | 38.200 B | 24.441 B | -13.759 B (-36,0%) |
| JavaScript inicial (gzip) | 283.280 B | 282.489 B | Dentro do ruído; não é ganho atribuído |

## Verificação

O teste que protege a divisão de estilos passou, assim como a suíte completa de 380 testes, a checagem de tipos e o build. As rotas de Vendas Urbanas e Estratégia CRM foram abertas em leitura e mantiveram a apresentação visual. A intervenção foi mantida porque reduziu a folha inicial de maneira material e não apresentou regressão observável.
