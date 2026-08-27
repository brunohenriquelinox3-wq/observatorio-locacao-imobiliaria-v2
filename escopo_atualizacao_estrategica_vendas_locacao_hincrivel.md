# Escopo de atualização estratégica — Vendas Urbanas e Locação

**Status:** `atualização_completa_autorizada_pelo_usuário_em_2026-08-27`  
**Propósito:** orientar a atualização robusta das estratégias de **Vendas Urbanas** e **Locação**, combinando o acervo de pesquisa do projeto com a evidência prática verificável do CRM de referência. Este caderno não reproduz dados individuais, não descreve operação de terceiros e não altera a arquitetura das colunas SUPER ADM, ADM ou LOTEADORA.

> **Decisão de interpretação:** a atualização é completa no sentido de consolidar toda a estratégia das duas colunas, e não de presumir que todos os controles do CRM de referência foram tecnicamente demonstrados. Onde a observação não demonstrou comportamento, a estratégia registra um requisito verificável, critério de aceite e evidência futura — nunca uma cópia inferida de funcionalidade.

## 1. Fontes internas de decisão

| Fonte | Papel na atualização | Limite de uso |
| --- | --- | --- |
| `estrategia_vendas_urbanas.md` | Tese de mercado, produto mínimo vendável, fluxo de captação, dossiê e proposta de Vendas Urbanas. | Não absorver loteadora como parte da venda urbana. |
| `estrategia_crm_imobiliario_consolidada.md` | Núcleo compartilhado, plataforma, segurança, dados, financeiro e fronteiras de domínio. | Alterar somente seções explicitamente relacionadas a Vendas Urbanas ou Locação. |
| `crm_arquitetura_colunas_setores_canonica.md` | Limites de colunas, setores e relações definidos pelo usuário. | Não renomear, mover ou expandir SUPER ADM, ADM ou LOTEADORA. |
| `registro_auditoria_por_controle_v2.md` | Evidência individual de menus, formulários, filtros, estados, erros, permissões e limites observados. | Usar apenas fatos registrados; não reproduzir identificadores individuais. |
| `matriz_cobertura_segunda_varredura_hincrivel.md` | Cobertura demonstrada, bloqueada, inconclusiva ou não demonstrável. | Não converter `B`, `I` ou `N` em conclusão sobre inexistência de capacidade. |
| `checklist_auditoria_por_controle_crm_referencia.md` | Critérios de completude e riscos ainda a cobrir em eventual auditoria futura. | Não declarar cobertura total enquanto houver controles sem classificação individual. |

## 2. Regra de evidência e decisão

| Nível | Origem | Uso permitido na estratégia |
| --- | --- | --- |
| `E1 — demonstrado` | Controle ou estado aberto e observado sem efeito material indevido. | Converter em requisito, fluxo, estado ou critério de UX, sem assumir implementação interna. |
| `E2 — testado sinteticamente` | Entrada reversível ou fluxo sintético, com limpeza/retorno confirmado. | Converter em requisito operacional com ressalva explícita de escopo. |
| `E3 — declarado/documentado` | Texto de ajuda, interface, referência de mercado ou fonte previamente pesquisada. | Converter em hipótese/expectativa de mercado, vinculada a critério de aceite próprio. |
| `E4 — bloqueado/inconclusivo/não demonstrável` | Controle que não pôde ser concluído por risco, permissão, sessão, ambiente ou carregamento. | Converter somente em lacuna, controle futuro ou requisito de prova; não copiar comportamento presumido. |

## 3. Limites permanentes

| Limite | Aplicação obrigatória |
| --- | --- |
| Escopo | Atualização exclusiva de Vendas Urbanas e Locação. |
| Arquitetura | A ordem global permanece SUPER ADM → ADM → LOTEADORA → VENDAS URBANAS → LOCAÇÃO. |
| Segurança | Nenhuma interface, filtro, URL, score ou papel visual concede acesso sem policy, escopo, vigência e auditoria. |
| Dados e evidências | Documentos, dados pessoais, localização detalhada, dados bancários e chaves são privados, versionados e mínimos por finalidade. |
| Financeiro | Evento econômico, cobrança, retorno, aplicação de caixa, direito, instrução e liquidação continuam objetos distintos; o CRM não executa pagamento por inferência. |
| Atualização | Nenhuma afirmação sobre o CRM de referência será tratada como requisito obrigatório sem classificação de evidência e aceitação de produto própria. |

## 4. Critérios de qualidade da atualização

| Critério | Prova documental esperada |
| --- | --- |
| Separação de jornadas | Vendas Urbanas e Locação possuem objetivos, estados, responsáveis e gates próprios, embora compartilhem `Party`, ativo, evidência, tarefa e trilha. |
| Rastreabilidade | Todo requisito novo referencia fonte interna, intenção, decisão, prova esperada e limite de interpretação. |
| Aplicabilidade | Requisitos descrevem comportamento verificável, e não apenas listas genéricas de campos. |
| Segurança por desenho | Ações críticas têm alçada, confirmação, idempotência, rollback/compensação quando aplicável e audit event. |
| Utilidade operacional | Filtros, listas, indicadores e alertas ajudam a equipe a explorar os dados de forma mais intuitiva, entender melhor as tendências e salvar ou compartilhar facilmente, sem ampliar acesso. |

## Referências internas

[1] [Estratégia de Vendas Urbanas](estrategia_vendas_urbanas.md)

[2] [Estratégia CRM consolidada](estrategia_crm_imobiliario_consolidada.md)

[3] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)

[4] [Registro de auditoria por controle](registro_auditoria_por_controle_v2.md)

[5] [Matriz de cobertura da segunda varredura](matriz_cobertura_segunda_varredura_hincrivel.md)

[6] [Checklist obrigatório de auditoria](checklist_auditoria_por_controle_crm_referencia.md)
