# Evidências prioritárias — sidebar moderna, disclosure e drawer

**Estado:** `fontes_primárias_confrontadas`  
**Uso:** este caderno valida padrões de interação e acessibilidade. Ele não define, por si só, conteúdo de navegação, autorização, política de dados ou estrutura de produto.

## 1. Confronto de hipóteses do material recebido

| Hipótese recebida | Evidência prioritária | Decisão de auditoria | Limite preservado |
| --- | --- | --- | --- |
| Grupo expansível usa botão, seta e estado aberto/fechado. | O padrão de disclosure exige um controle com papel de botão, `aria-expanded` refletindo visibilidade e, opcionalmente, `aria-controls`; Enter e Espaço alternam o conteúdo. [1] | Promover `button` como único controlador do disclosure, com `aria-expanded` e ID de painel consistentes. | Não aplicar `aria-expanded` redundante em contêiner sem papel/controlador; ARIA não cria teclado por si só. |
| Navegação pode agrupar destinos sob disclosure. | O exemplo WAI usa landmark de navegação, listas aninhadas, botões de disclosure e links, sem aplicar role `menu` a navegação comum. [2] | Promover árvore semântica `nav > ul > li`, link para destino e botão para expandir; usar `aria-current="page"` no destino atual. | Não transformar barra de CRM em menubar/tree widget apenas para obter setas; Tab deve continuar funcional. |
| Flyout colapsado pode abrir por hover/foco. | No exemplo de disclosure-navigation, Escape fecha dropdown e devolve foco ao botão; sair da região fecha conteúdo aberto. [2] | Flyout exige abertura por foco e pointer, Escape, retorno/previsibilidade de foco e comportamento explícito em touch. | Hover isolado não é critério de acessibilidade nem substitui controle acionável. |
| Drawer no mobile usa overlay e Escape. | Modal acessível impede interação/foco fora da janela, move foco para dentro ao abrir, prende Tab/Shift+Tab, fecha por Escape e devolve foco ao gatilho. [3] | Promover drawer móvel como diálogo/modal somente se o fundo for realmente inerte, com foco inicial, foco contido, fechamento visível e restauração ao gatilho. | Um overlay visual sem contenção de foco e sem inércia não é modal acessível; nesse caso, usar padrão não modal corretamente modelado. |
| Foco visível é requisito de qualidade. | WCAG exige ordem de foco que preserve significado/operação; a explicação de foco visível reforça indicador de tamanho e contraste suficientes. [4] [5] | Promover teste de ordem de Tab, foco ao abrir/fechar e anel visível que não dependa só de cor. | A aparência deve ser verificada sobre os temas e fundos reais; mudança sutil não é prova suficiente. |
| Alvo de toque grande melhora ativação. | WCAG 2.5.8 define mínimo de 24×24 CSS px ou espaçamento suficiente, com exceções; recomenda alvos maiores para controles importantes. [6] | Adotar 44×44 px como objetivo de produto para comandos principais de CRM e 24×24 px como piso normativo/spacing a verificar. | Não afirmar que 44 px é requisito WCAG universal; o critério mínimo e suas exceções precisam ser avaliados no contexto. |

## 2. Correções requeridas na referência HTML

| Achado | Correção candidata | Prova futura |
| --- | --- | --- |
| Árvore sem lista consistente no `<nav>`. | Renderizar seções e itens em listas semânticas, preservando relação pai/filho. | Navegação por leitor de tela e inspeção de estrutura. |
| `aria-expanded` em contêiner e botão. | Manter estado operacional no botão controlador; usar `aria-controls` para ligar ao submenu quando aplicável. | Teste de atributos ao abrir/fechar e leitura assistida. |
| Rótulo de ação do colapso não acompanha alternância. | Alternar `aria-label`/texto acessível entre “Recolher” e “Expandir”; expor estado somente quando útil. | Teste de teclado e de nome acessível após cada alternância. |
| Tooltip/flyout sem contrato de teclado completo. | Definir toggle/foco, Escape, clique/touch, perda de foco e fechamento para não prender conteúdo. | Tab, Shift+Tab, Enter, Espaço, Escape, toque e zoom. |
| Drawer sem foco/inércia. | Implementar foco inicial, trap, `aria-modal`, camada de fundo inerte e retorno ao disparador. | Teste com teclado, leitor de tela e alteração de viewport. |
| Ativo local simulado. | Derivar ativo/ancestral da rota, escopo, feature flag e autorização efetiva. | Deep link, back/forward, troca de organização e item revogado. |

## 3. Limites de produto e segurança

| Decisão de navegação | Controle de produto associado |
| --- | --- |
| Item oculto por permissão | Interface pode omitir, mas URL, RPC, arquivo, exportação e comando continuam sujeitos a RLS/policy/alçada. |
| Grupo “Financeiro” ou “Administração” | Rótulo não concede escopo; conteúdo e ação dependem de papel, organização, SPE, carteira, finalidade, MFA/step-up e vigência. |
| Preferência de colapso/expansão | Persistir apenas preferência de apresentação; nunca usar preferência como fonte de autorização ou carregar contexto sensível indevido. |
| Contador/badge | Deve indicar classe/estado permitido e origem atualizada; não expor número ou existência de caso fora de escopo. |

## Referências

[1] [W3C WAI-ARIA APG — Disclosure Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)

[2] [W3C WAI-ARIA APG — Disclosure Navigation Example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)

[3] [W3C WAI-ARIA APG — Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

[4] [W3C WCAG 2.2 — Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)

[5] [W3C WCAG 2.2 — Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)

[6] [W3C WCAG 2.2 — Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
