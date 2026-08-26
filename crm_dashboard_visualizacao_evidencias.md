# Evidências prioritárias — gráficos, dados alternativos e contraste

**Estado:** `fontes_primárias_confrontadas`  
**Uso:** estas fontes sustentam requisitos de acessibilidade e interpretação de visualizações. Elas não definem a métrica imobiliária, a política de acesso, o cálculo financeiro ou a origem econômica do CRM.

## Confronto dos padrões do dashboard

| Hipótese do curso/referência | Evidência prioritária | Decisão de auditoria | Limite preservado |
| --- | --- | --- | --- |
| Um gráfico pode ser a única superfície do dado, se possuir tooltip rico. | W3C classifica gráficos/charts como imagens complexas quando carregam informação substancial e recomenda alternativa curta mais descrição longa estruturada, inclusive tabela com valores/relações/tendências. [1] | Todo gráfico material terá título/resumo e alternativa estruturada, preferencialmente tabela/detalhe acessível sob demanda. | Tooltip não substitui descrição/tabela: depende de interação e não preserva estrutura para todos os usuários. |
| O detalhe pode ser apenas visual; a tabela é opcional. | W3C mostra que tabelas acessíveis precisam de cabeçalhos e relações programáticas (`th`, `td`, `scope`, `id`/`headers` quando necessário), permitindo que tecnologia assistiva mantenha contexto. [2] | Tabela de evidência será parte do contrato de visualização, com cabeçalho, unidade, recorte, fonte e dados correspondentes ao gráfico. | Tabela não serve para layout e não resolve uma métrica sem definição/escopo/frescor. |
| Verde/vermelho e paleta de dados comunicam variação suficiente. | WCAG SC 1.4.1 exige que cor não seja o único meio visual de transmitir informação, ação, estado ou distinção. [3] | Delta, estado e série usam texto, sinal, padrão/forma ou posição além de cor; a polaridade precisa ser declarada. | Contraste de matiz/luminância não basta quando a pessoa depende de diferenciar semanticamente verde de vermelho. |
| Linhas, focos, botões e elementos de gráfico podem ser discretos em dark mode. | WCAG SC 1.4.11 estabelece 3:1 contra cores adjacentes para componentes e objetos gráficos necessários à compreensão; foco e estado autoral também precisam permanecer distinguíveis. [4] | Controle, foco, linha/série/grade essencial e objeto gráfico necessário recebem teste de contraste e não dependem de traço fino quase invisível. | Nem todo objeto decorativo precisa do mesmo contraste; o escopo é o que a pessoa precisa para compreender/operar. |

## Correções requeridas na referência HTML

| Achado | Correção candidata | Prova futura |
| --- | --- | --- |
| SVG de tendência, barras, donut e funil não possui alternativa de dados/descrição estrutural. | `figure`/título/resumo e comando “ver tabela de dados”, com tabela semanticamente marcada e mesma janela/filtro. | Leitor de tela e comparação de valores entre tabela, gráfico e exportação. |
| Tooltip ocorre apenas por `mousemove` sobre `rect` transparente. | Pontos/dados de interação acessíveis por foco e toque, ou detalhe acionável separado; aria-live somente para atualização concisa e não intrusiva. | Teclado, toque, leitor de tela e sem mouse. |
| Intervalo ativo é classe CSS, sem estado semântico, texto de recorte ou URL reproduzível. | Botões com estado anunciado, parâmetros/filtro versionado, atualização de resumo e tratamento de carregamento/erro/frescor. | Troca de período, back/forward, link compartilhado autorizado e atualização parcial. |
| Cor semântica e gradientes são a principal diferenciação de série/delta. | Rótulo, legenda direta, padrão/forma e contraste de objetos gráficos essenciais. | Simulação de percepção de cor, alto contraste e leitura sem cor. |
| Atualização de gráfico usa `innerHTML` a partir de dados em memória. | Renderização declarativa/escapada e contrato server-side para dado real; nenhum rótulo externo entra como HTML. | Fixture com caracteres especiais/hostis, política de conteúdo e teste de não injeção. |

## Referências

[1] [W3C WAI — Complex Images](https://www.w3.org/WAI/tutorials/images/complex/)

[2] [W3C WAI — Tables Tutorial](https://www.w3.org/WAI/tutorials/tables/)

[3] [W3C WCAG 2.2 — Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)

[4] [W3C WCAG 2.2 — Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
