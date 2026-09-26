---
name: crm-interface-language
description: Padronização e auditoria de linguagem, nomenclatura e microcopy em CRMs BHL. Use ao revisar títulos, subtítulos, labels, placeholders, botões, estados, mensagens, validações, status e textos técnicos exibidos a operadores, especialmente entre setores da Loteadora e Financeiro nominal.
---

# Linguagem de interface do CRM BHL

## Fronteira

Use esta skill para transformar a complexidade interna do CRM em linguagem operacional clara. Ela cobre somente apresentação, vocabulário, hierarquia textual e comunicação de estados. Não altera cálculos, contratos, autorização, RLS, dados, rotas ou regras comerciais e financeiras.

Não exponha ao operador termos de implementação como `grant`, `membership`, `policy`, `server-side`, `lineage`, `persistência`, identificador interno ou contexto técnico. Se a informação for necessária para segurança ou auditoria, traduza sua consequência operacional e mantenha o detalhe técnico em documentação ou registro restrito.

## Workflow obrigatório

1. **Inventariar.** Liste por setor, rota e componente os títulos, subtítulos, labels, placeholders, dicas, botões, badges, estados, alertas, erros, sucessos e vazios. Preserve o texto atual para comparação.
2. **Ler como operador.** Para cada superfície, responda: onde estou, o que vejo, o que posso fazer, o que falta, se há problema e qual é o próximo passo.
3. **Classificar.** Marque repetição, abstração, tecnicismo, ambiguidade, nomenclatura divergente, hierarquia ruim, erro genérico, estado vazio incorreto ou texto sem finalidade.
4. **Consolidar.** Prefira um rótulo oficial por conceito. Não troque uma palavra difícil por outra palavra difícil. Remova texto repetido antes de adicionar explicações.
5. **Reescrever.** Use português brasileiro claro, profissional e direto. O título diz onde o operador está ou qual tarefa executa. O subtítulo só permanece se acrescentar objetivo, consequência ou instrução útil.
6. **Validar estados.** Diferencie falta de contexto, carregamento, zero real, filtro sem resultado, ausência de permissão, erro de serviço e ação concluída. Nunca use `0` para mascarar erro.
7. **Revisar números.** Mantenha moeda, data e percentual consistentes na apresentação. Não altere o valor ou a semântica de origem.
8. **Testar contexto.** Use textos longos e estados reais da interface. Confirme quebra de linha, foco, leitura por teclado e ausência de dependência exclusiva de cor ou posição.
9. **Registrar.** Atualize o dicionário, o relatório de auditoria e o Manual somente com mudanças comprovadas. Anote fonte, limite, telas afetadas e regressões.

## Regras de escrita

- Use frases curtas e uma ideia por sentença.
- Prefira nomes de ação específicos: “Abrir venda”, “Adicionar proponente”, “Salvar negociação”, “Finalizar venda” ou “Visualizar item nominal”, conforme o contexto real.
- Não use placeholder como documentação. A label deve continuar compreensível quando o campo estiver preenchido.
- Mensagem de erro deve explicar o que ocorreu e como corrigir, sem stack trace, endpoint, SQL ou identificador sensível.
- Mensagem de sucesso deve dizer o que aconteceu e só aparecer para uma ação relevante.
- Estado vazio deve dizer por que está vazio e qual leitura é segura; não invente registros.
- Destrutivo, arquivamento, restauração e cancelamento precisam comunicar consequência e confirmação própria.
- No Financeiro, preservar a distinção entre valor nominal, entrada, parcela, recebedor previsto, cobrança administrativa e qualquer operação externa. Esta skill não autoriza pagamento, cobrança real, baixa, quitação, Pix, banco, transferência, split ou repasse.

## Recursos sob demanda

- Leia `references/interface-language-dictionary.md` para o dicionário inicial, anti-termos e padrões de mensagens.
- Leia `references/audit-matrix-template.md` para montar a matriz tela → componente → texto → problema → correção → teste.
- Para reflow, foco, contraste e disclosure, combine com `web-design-reviewer`; não replique a skill visual.
- Para rotas e árvore da sidebar, combine com `crm-route-architecture` e `crm-sidebar-hierarchical-navigation`.
- Para Financeiro nominal, combine com `finance-internal-release-qa` e preserve seu vocabulário protegido.

## Critérios de aceite

- Cada termo alterado tem fonte, contexto e limite registrados.
- O mesmo conceito não recebe nomes conflitantes sem diferença real.
- Labels permanecem úteis sem placeholder.
- Estados vazios não confundem zero, filtro, carregamento, permissão e erro.
- Erros e ações são específicos, compreensíveis e sem detalhes internos indevidos.
- O texto não remove informação operacional importante nem cria semântica financeira nova.
- A skill e suas referências passam `quick_validate.py`, não contêm PII, segredos, URLs privadas ou exemplos que pareçam dados reais.
