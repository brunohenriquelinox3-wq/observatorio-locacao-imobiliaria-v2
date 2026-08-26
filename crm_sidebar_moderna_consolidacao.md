# Consolidação — sidebar moderna, acessível e governada para CRM

**Estado:** `decisões_prontas_para_integração_documental`  
**Escopo:** arquitetura de navegação, comportamento expandido/colapsado, grupos, drawer móvel, semântica, foco, apresentação e preferências.  
**Fora de escopo:** escolher setores definitivos, conceder acesso, ativar novas rotas, salvar preferências reais por usuário ou substituir o layout administrativo existente sem aprovação de etapa executável.

## Decisões promovidas

| Código | Decisão | Evidência | Owner | Limite explícito | Impacto de produto |
| --- | --- | --- | --- | --- | --- |
| SID-01 | A árvore da sidebar será declarativa e composta por `section`, `item` e `group`, com rota, ícone, prioridade, contexto, capability e feature flag. | Referência recebida demonstra dados separados do render; WAI reforça estrutura de navegação em listas e hierarquia. [1] [2] | Produto + arquitetura. | A árvore descreve experiência; não concede acesso nem substitui policy/RLS. | Item pode ser reordenado, testado e contextualizado sem HTML disperso. |
| SID-02 | Destino é link; disclosure é botão. O botão controlador mantém `aria-expanded` e, quando aplicável, `aria-controls`; o destino atual usa `aria-current="page"`. | APG Disclosure e exemplo de navegação. [1] [2] | Engenharia frontend + acessibilidade. | Não usar role `menu`/`tree` para navegação comum apenas por estética de hierarquia. | Semântica, teclado e leitura assistiva passam a ser critério de aceite. |
| SID-03 | O estado ativo e o ancestral aberto derivam de rota, escopo, feature flag e autorização efetiva. | WCAG requer ordem e operação lógicas; o material recebido aponta pai ativo, mas a simulação local é insuficiente. [3] | Frontend + segurança de produto. | Item selecionado visualmente não é prova de autorização; deep link pode ser negado. | Back/forward, reload, troca de organização e revogação mantêm posição verdadeira. |
| SID-04 | Sidebar expandida/colapsada é preferência de apresentação, com rótulo acessível, tooltip/flyout operável e persistência escopada. | Curso/referência recebidos + regras de disclosure/foco. [1] [2] | UX + frontend + privacidade. | Preferência não armazena conteúdo sensível e não muda capacidade, papel ou permissão. | Barra expandida preserva rótulos; icon rail exige nome acessível e saída por teclado/toque. |
| SID-05 | A profundidade de sidebar fica limitada a dois níveis; o terceiro nível vira navegação contextual da tela, busca ou comando. | Heurística do curso e princípio de estrutura compreensível do APG. [2] | Produto/IA + UX research. | “5–9 itens” é sinal de revisão de IA, não limite rígido ou critério normativo. | Grupos apresentam tarefas coesas por frequência e contexto, não organograma. |
| SID-06 | Mobile usa drawer somente com comportamento modal completo: foco inicial, trap, Escape, fechamento visível, fundo inerte e retorno ao gatilho. | APG Modal Dialog. [4] | Frontend + acessibilidade. | Overlay escuro sem inércia/foco não é modal acessível. | A barra não comprime conteúdo crítico e não deixa foco escapar para o fundo. |
| SID-07 | Hover é conveniência; cada flyout possui alternativa por foco, botão/toque e Escape, com fechamento previsível. | Exemplo APG de disclosure-navigation. [2] | UX + frontend. | Não depender de mouse, hover persistente ou flyout inacessível em zoom/touch. | Tooltips/flyouts são auxiliares, e não o único caminho para uma função. |
| SID-08 | Foco, alvo de toque, contraste, rótulo e movimento recebem tokens/testes próprios. | WCAG Focus Order, Focus Appearance e Target Size. [3] [5] [6] | Design system + QA. | 44×44 px é objetivo de produto para comandos principais; o mínimo WCAG é contextual e não pode ser simplificado indevidamente. | Estado visual comunica ativo, foco e indisponibilidade sem depender apenas de cor. |
| SID-09 | Badges, contadores e itens financeiros/administrativos são dados governados por escopo e finalidade. | Estratégia de acesso e evidência; a sidebar é superfície de leitura, não isenção de RLS. | Segurança + produto de plataforma. | Ocultar item não protege endpoint, arquivo, exportação ou comando. | Contador só exibe informação que a identidade já pode ler; item sensível exige step-up/justificativa no ato. |

## Critérios de aceite obrigatórios

| Jornada | Prova exigida | Resultado de aprovação |
| --- | --- | --- |
| Navegação expandida | Tab/Shift+Tab, Enter/Espaço em grupos, destino atual e leitura de lista. | Ordem lógica; botão abre/fecha; link atual contém `aria-current`; sem foco duplicado ou salto semântico. |
| Rota e permissão | Deep link, back/forward, mudança de organização/SPE e revogação de capability. | Ancestral correto abre, item bloqueado não parece selecionado e a camada de dados continua negando fora de escopo. |
| Icon rail/flyout | Mouse, teclado, touch, zoom e Escape. | Todo ícone tem nome acessível; flyout é abrível/fechável sem hover e foco retorna previsivelmente. |
| Drawer móvel | Abrir, Tab/Shift+Tab, Escape, clique externo, fechar e mudar orientação. | Foco inicia dentro, não sai para fundo inerte, fecha de modo explícito e retorna ao gatilho. |
| Preferência | Alternar estado, recarregar, trocar dispositivo/contexto e usar conta diferente. | Preferência é restaurada apenas no escopo permitido e não cria acesso, contexto ou vazamento. |
| Visual | Tema, contraste, foco, movimento reduzido, 200% zoom, largura 375 px e desktop amplo. | Rótulo, foco, ativo, hierarquia e conteúdo continuam legíveis; transição não é requisito de compreensão. |

## Pente fino: decisões rejeitadas

| Atalho rejeitado | Razão |
| --- | --- |
| Copiar os rótulos/setores do HTML de referência. | A referência declara placeholders; arquitetura de informação depende de tarefas, domínio, permissão e pesquisa com operadores. |
| Tornar cada ícone um item de navegação sem texto acessível. | Colapso visual não pode retirar nome, foco, destino ou contexto da navegação. |
| Usar “menu” ARIA, setas e árvore por padrão. | Navegação comum é melhor como links e disclosure; widget ARIA exige contrato de teclado mais complexo. |
| Guardar todo estado em `localStorage` por conveniência. | Preferências precisam de classificação, escopo, expiração e não podem ser fonte de autorização. |
| Fazer drawer somente com CSS e overlay. | Sem foco/inércia/restituição, a experiência falha para teclado e tecnologias assistivas. |
| Permitir que um badge revele casos, saldo ou existência de objeto sem policy. | A UI também é superfície de exposição; dado de contador depende do escopo real de leitura. |

## Próxima etapa executável, somente após aprovação

A implementação não começa por uma substituição total do shell. A primeira subetapa deverá apresentar uma árvore declarativa mínima, contrato de capability/rota, matriz de estados e protótipo acessível isolado. Somente depois de aprovação poderão ser implementados componentes, persistência e integração ao layout administrativo.

## Referências

[1] [W3C WAI-ARIA APG — Disclosure Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)

[2] [W3C WAI-ARIA APG — Disclosure Navigation Example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)

[3] [W3C WCAG 2.2 — Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)

[4] [W3C WAI-ARIA APG — Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

[5] [W3C WCAG 2.2 — Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)

[6] [W3C WCAG 2.2 — Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
