# Inventário — sidebar moderna para CRM

**Estado:** `hipóteses_em_auditoria`  
**Entradas:** *Curso Intensivo — Design e Construção de Barras Laterais Modernas* e `referencia-sidebar-moderna.html`, ambos fornecidos pelo usuário.  
**Regra de uso:** os materiais demonstram padrões de UX e implementação; não definem por si só a arquitetura de informação, as permissões, a política de dados ou o comportamento acessível final do CRM.

## 1. Padrões recebidos e hipótese de valor

| Código | Padrão recebido | Benefício candidato | Limite inicial |
| --- | --- | --- | --- |
| SB-01 | Shell com cabeçalho, navegação rolável, rodapé fixo e conteúdo independente. | Mantém orientação e reduz perda de espaço em jornadas de CRM extensas. | Deve coexistir com cabeçalho contextual, pesquisa, breadcrumbs e escapes de rota; não basta fixar uma barra. |
| SB-02 | Estados expandido e colapsado, com tokens de largura e transição. | Usuário escolhe entre rótulo/contexto e espaço de trabalho. | O colapso não pode converter a navegação em enigma, depender apenas de ícones ou ocultar o item atual. |
| SB-03 | Seções e grupos expansíveis em dois níveis. | Divulgação progressiva reduz ruído sem apagar a capacidade. | Nomes, prioridades e agrupamentos precisam vir do mapa de tarefas e permissões, não de departamentos ou estrutura técnica. |
| SB-04 | Pai ativo quando filho está ativo; estado aberto preservado. | Mantém “onde estou” visível e reduz desorientação em rotas internas. | O roteador, e não somente um clique local, deve determinar item atual e abrir o ancestral correto. |
| SB-05 | Tooltip para item simples e flyout para grupo no estado colapsado. | Conserva orientação quando rótulos ficam ocultos. | Hover isolado não cobre toque/teclado; abertura, fechamento, foco, Escape e leitura assistida exigem validação específica. |
| SB-06 | Drawer off-canvas no mobile, com overlay e Escape. | Evita comprimir conteúdo crítico e preserva uma navegação completa por demanda. | Precisa de foco inicial, contenção/restauração de foco, semântica modal e teste com leitor de tela. |
| SB-07 | Estrutura orientada a dados e componentes de item/grupo/seção. | Torna reordenação, personalização e teste de navegação mais confiáveis. | A árvore de navegação não concede acesso: autorização continua no servidor, RLS e comandos. |
| SB-08 | Tokens, uma cor de acento, iconografia consistente e movimento reduzido. | Reforça a identidade editorial-cartográfica sem adicionar ruído. | Deve preservar contraste, foco, sinais não cromáticos e não substituir a semântica dos estados. |

## 2. Acertos observados na referência HTML

| Área | Evidência do material | Decisão candidata |
| --- | --- | --- |
| Layout | Shell flexível, `min-width: 0`, barra em coluna e rolagem da navegação isolada. | Reutilizar o princípio de shell reativo para superfícies operacionais, mantendo conteúdo e tabela capazes de encolher. |
| Estados | Hover, item ativo, foco visível, grupo com filho ativo e ícone/alinhamento constantes. | Manter estado atual como requisito funcional, não enfeite visual. |
| Disclosure | `grid-template-rows` anima de fechado para aberto e reduz salto visual. | Adotar somente quando o componente sem animação permanece operável e legível. |
| Mobile | Drawer com overlay, clique fora e Escape. | Usar como ponto de partida, não como checklist completo de acessibilidade. |
| Movimento | Transições curtas e media query de movimento reduzido. | Preservar movimento discreto e permitir redução global. |
| Manutenibilidade | Navegação declarada em array e renderizada por tipo. | Modelar árvore por capacidade, contexto, rota, prioridade e feature flag; nunca hardcode de menu espalhado pela interface. |

## 3. Conflitos e lacunas detectados antes do confronto externo

| Código | Conflito/lacuna | Por que não pode ser promovido ainda |
| --- | --- | --- |
| SB-GAP-01 | O curso recomenda listas semânticas; a referência injeta itens, seções e grupos diretamente no `<nav>`, sem uma árvore consistente de `<ul>/<li>`. | A coerência estrutural e a experiência de leitor de tela precisam ser verificadas antes de virar padrão. |
| SB-GAP-02 | `aria-expanded` aparece no contêiner do grupo e no botão. | É necessário validar qual elemento controla o disclosure e como relacionar controle/painel sem redundância semântica. |
| SB-GAP-03 | O botão de recolher atualiza dica visual, mas seu `aria-label` inicial não acompanha a alternância. | Um comando alternável precisa anunciar o estado/ação corretos para teclado e leitor de tela. |
| SB-GAP-04 | Flyout colapsado depende de `:hover` e `:focus-within`, mas o material não define fechamento por Escape, foco inicial, clique externo ou comportamento em touch. | Navegação escondida pode ficar presa, sobrepor conteúdo ou falhar em dispositivos sem hover. |
| SB-GAP-05 | Drawer fecha com Escape e overlay, mas não trata foco, retorno ao botão de abertura, isolamento de conteúdo de fundo ou anúncio de abertura. | Overlay visual não é, por si só, uma interação modal acessível. |
| SB-GAP-06 | A regra “~5 a 9 itens” é apresentada como geral. | Deve ser tratada como heurística, nunca como limite normativo; frequência, criticidade, profundidade e tarefas reais decidem a árvore. |
| SB-GAP-07 | Persistência é sugerida em `localStorage`/backend sem política de escopo. | Preferência de dispositivo, de usuário, de organização e de papel podem divergir; não se pode gravar contexto sensível ou estado indevido. |
| SB-GAP-08 | Estado ativo é simulado por clique local. | Em CRM real, rota, deep link, permissão, feature flag, estado bloqueado e recuperação de sessão devem ser a fonte do estado. |

## 4. Critérios candidatos de não regressão

| Invariante candidato | Tentativa de falha exigida |
| --- | --- |
| Todo destino exibido leva a rota permitida e o destino atual aparece com texto, estado visual e semântica correspondente. | Abrir deep link, revogar permissão, mudar organização/SPE e retornar ao menu; não manter seleção fictícia. |
| Um grupo com rota descendente fica aberto de modo previsível no estado expandido. | Atualizar rota, usar voltar/avançar e restaurar sessão; o grupo correto não pode permanecer oculto. |
| Sidebar colapsada continua nomeável e operável por teclado, toque e tecnologia assistiva. | Navegar sem mouse, sem hover e com zoom; testar tooltip/flyout/rotulagem e Escape. |
| Drawer móvel não permite foco interagir com fundo enquanto está aberto e devolve o foco ao gatilho ao fechar. | Tab/Shift+Tab, Escape, overlay, alteração de orientação e leitor de tela. |
| Personalização da barra não concede dados ou comandos. | Forçar URL, API e comando de item oculto; policy/RLS precisam negar fora do escopo. |

## 5. Próximo confronto

O próximo ciclo confrontará estes padrões com WAI-ARIA APG, WCAG, documentação de foco/modal e boas práticas de navegação responsiva. Só então serão promovidas decisões para a estratégia, o backlog e a lâmina do observatório.
