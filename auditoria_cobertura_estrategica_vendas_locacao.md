# Auditoria de cobertura estratégica — Vendas Urbanas e Locação

**Status:** `em_auditoria_documental_2026-08-27`  
**Escopo:** apenas Vendas Urbanas e Locação. Este artefato mede cobertura e rastreabilidade da estratégia; não é especificação de implementação, não cria produto e não altera a arquitetura canônica. [1]

## 1. Finalidade e fronteira

Esta auditoria responde a uma pergunta deliberadamente restrita: **cada domínio relevante possui intenção, evidência, decisão, requisito, risco, owner, dependência, exceção e prova futura de aceite de forma rastreável?** A resposta não mede maturidade do software, não certifica conformidade e não substitui validação jurídica, fiscal, contábil, de segurança ou operacional.

> **Regra de contenção:** uma lacuna só será registrada como material quando impedir uma decisão futura segura, tornar uma exceção sem owner, permitir confusão entre fato e hipótese, ampliar escopo de dados/efeitos externos ou inviabilizar uma prova objetiva de aceite. Lacunas de redação, duplicação de termos ou detalhe já documentado em fonte vinculada não criarão documentos nem módulos novos por volume.

| Unidade de auditoria | O que é observado | O que não é inferido |
| --- | --- | --- |
| Regra transversal | Contexto, identidade, dossiê, evento, leitura, efeito externo, financeiro, acessibilidade, fonte e portal. | Que uma regra transversal foi implementada ou aprovada para uso produtivo. |
| Domínio de Vendas Urbanas | Entrada, partes, imóvel, empreendimento, funil, agenda, proposta, publicação, financeiro, inteligência, mercado, dossiê e ativação. | Que o benchmark de referência demonstrou completude funcional. |
| Domínio de Locação | Administração, ativo, partes, garantia, contrato, carteira, repasse, serviço, vistoria, portal, alertas, mercado, dossiê e entrada assistida. | Que contrato, garantia, cobrança, repasse ou documento possui efeito jurídico/financeiro automático. |
| Ligação de execução futura | Requisito atômico, prioridade, owner, dependência, contingência e aceite. | Que a prioridade autoriza desenvolvimento, integração ou operação. |

## 2. Critérios obrigatórios de cobertura

| Dimensão | Pergunta de auditoria | Evidência documental mínima | Falha material típica |
| --- | --- | --- | --- |
| `I` — Intenção | O problema e o resultado protegido são compreensíveis? | Decisão estratégica do domínio e propósito de jornada. | Tela/campo futuro sem propósito ou fronteira de responsabilidade. |
| `E` — Evidência | A decisão informa fonte, hipótese, lacuna ou prova necessária? | Documento-fonte, registro de pesquisa ou limitação explícita. | Recomendação tratada como fato, norma ou comportamento comprovado. |
| `D` — Decisão | Há regra verificável, não apenas desejo genérico? | Decisão com verbo, objeto e limite. | “Completo”, “inteligente” ou “automatizado” sem regra de comportamento. |
| `R` — Requisito | A intenção tem tradução atômica para execução posterior? | Código de requisito/execução ou ponte explícita ao caderno de jornada. | Estratégia sem unidade que possa ser planejada e aceita. |
| `K` — Risco | O dano de uma interpretação incorreta está explicitado? | Risco principal, antipadrão ou condição bloqueadora. | Permissão, dado, estado ou efeito material sem risco documentado. |
| `O` — Owner | Há responsável pela decisão, revisão ou operação futura? | Papel proprietário do domínio, revisão ou aprovação. | Exceção crítica sem rota de responsabilidade. |
| `P` — Pré-condição | A dependência/gate de liberação está declarada? | Gate, policy, contrato, dado, alçada ou prova prévia. | Capacidade descrita sem condição de ativação segura. |
| `X` — Exceção | O caso incompleto, divergente, vencido, negado ou falho possui tratamento? | Bloqueio, estado, rota de escalonamento, fallback ou não-ação. | Caminho feliz documentado com erro que amplia acesso ou produz efeito. |
| `A` — Aceite | A implementação futura pode demonstrar conformidade objetivamente? | Cenário de teste, evidência, observável ou critério permitir/negar. | “Pronto” sem comportamento que possa ser testado. |

## 3. Escala e decisão de tratamento

| Classificação | Significado | Tratamento permitido nesta auditoria |
| --- | --- | --- |
| `C` — Coberto | As nove dimensões estão presentes diretamente ou por vínculos inequívocos para o mesmo domínio. | Manter; registrar a rastreabilidade, sem duplicar conteúdo. |
| `PC` — Parcialmente coberto | Uma dimensão existe, mas a ligação ao domínio, exceção, owner ou aceite ainda é ambígua. | Registrar lacuna material somente se afetar decisão ou gate futuro; propor complemento documental mínimo. |
| `LP` — Lacuna prioritária | Falta dimensão que impede uma decisão segura, a contenção de risco ou uma prova de aceite. | Criar decisão/requisito documental mínimo com owner, dependência, exceção e aceite; não implementar. |
| `NE` — Não elegível | Não se aplica ao estágio ou excede o escopo permitido. | Explicar motivo, gate de reabertura e não usar como ausência de qualidade. |

Para classificar `C`, o auditor deve localizar as nove dimensões sem preencher vazios por dedução. Para classificar `PC` ou `LP`, deve citar o documento e a linha/código que revela a ausência, explicar o impacto e indicar o menor tratamento que fecha a lacuna. A auditoria não poderá reabrir SUPER ADM, ADM ou Loteadora, nem converter achados em schema, migration, tela, rota, integração, permissão, automação, cobrança, pagamento, repasse, publicação ou dado.

## 4. Ordem de varredura e evidências exigidas

| Ordem | Bloco | Critério de encerramento documental |
| --- | --- | --- |
| `COV-01` | Regras transversais | Cada regra possui decisão, risco, pré-condição e prova; seus vínculos com Vendas Urbanas e Locação são localizáveis. |
| `COV-02` | Jornada de Vendas Urbanas | Todo domínio possui intenção, requisito/ponte, exceção e aceite compatíveis com os gates transversais. |
| `COV-03` | Jornada de Locação | Todo domínio possui intenção, requisito/ponte, exceção e aceite compatíveis com os gates transversais. |
| `COV-04` | Execução, adoção e portais | Prioridade, owner, dependência, contingência, adoção e acesso mínimo estão correlacionados sem prometer ativação. |
| `COV-05` | Resultado e tratamento | Somente lacunas `LP` e `PC` materialmente justificadas são registradas; os demais itens permanecem referenciados. |

## 5. Resultado do confronto documental

O confronto percorreu as regras transversais da matriz mestre, os domínios das duas jornadas, os requisitos atômicos, os owners executivos, os cadernos de fundação, financeiro, inteligência e validação. A classificação abaixo não significa que a futura capacidade está pronta: significa apenas que a **estratégia documental** contém os elementos necessários para orientar uma especificação posterior, exceto quando indicado.

| Bloco auditado | Cobertura apurada | Justificativa rastreável | Decisão de tratamento |
| --- | --- | --- | --- |
| `COV-01` — regras transversais | `C` | `MT-01` a `MT-14` registram decisão, risco, pré-condição e prova; fundação, financeiro, inteligência e validação conectam owners, exceções e gates. [2] [3] [4] | Manter as referências existentes; não replicar controles transversais em cada requisito. |
| `COV-02` — Vendas Urbanas: entrada, partes, ativo, funil, agenda, proposta, contrato, financeiro, inteligência, mercado, dossiê e ativação | `C` | `VU-M01` a `VU-M07` e `VU-M09` a `VU-M13` possuem jornada, exceções, requisito atômico/ponte, risco e aceite vinculados. [2] [3] [4] | Manter as decisões e suas provas futuras. |
| `COV-02` — Vendas Urbanas: publicação e canais | `PC` | `VU-M08` define decisão, risco, dependência e prova; o caderno de inteligência define preview, autorização, confirmação, estado externo, retirada e contingência. Faltava um requisito atômico ligado a owner e aceite de execução. [2] [3] [6] | Registrar uma ponte documental mínima de execução e reclassificar após verificar o vínculo. |
| `COV-03` — Locação: administração, ativo, partes, garantia, contrato, carteira, repasse, serviço, portal, alertas, mercado, dossiê e entrada assistida | `C` | `LC-M01` a `LC-M08` e `LC-M10` a `LC-M14` encontram correspondência em jornada, financeiro/inteligência, requisito, exceção e aceite. [2] [3] [4] | Manter as decisões e suas provas futuras. |
| `COV-03` — Locação: vistoria e sinistro | `PC` | `LC-M09` possui decisão, risco, dependência, exceções e prova no caderno de jornadas; o requisito atômico não individualizava vistoria/sinistro, controvérsia e sua não-ação financeira/contratual. [2] [3] [4] | Registrar uma ponte documental mínima de execução e reclassificar após verificar o vínculo. |
| `COV-04` — execução, adoção, portal e evidência | `C` | `EXE-01` a `EXE-15` definem prioridade, owner, dependências e aceite; `MT-13`, `MT-14`, `VU-M13` e `LC-M14` cobrem adoção, portal e compartilhamento por grant. [2] [3] [4] | Manter leitura por cenário/papel e não medir valor por login/clique isolado. |

> **Conclusão intermediária:** foram encontradas duas lacunas **parciais e materiais de rastreabilidade**, não duas lacunas de capacidade nova. Ambas já estavam protegidas por decisões estratégicas, riscos, exceções e gates, mas não possuíam uma ponte atômica suficiente no caderno de execução. O tratamento será mínimo, documental e limitado a explicitar owner, dependência, não-ação e prova de aceite para publicação/canais de Vendas Urbanas e vistoria/sinistro de Locação.

## 6. Tratamento aplicado e classificação final

| Lacuna identificada | Complemento documental aplicado | Verificação de encerramento | Classificação final |
| --- | --- | --- | --- |
| `COV-VU-01` — publicação/canais | `VU-REQ-12` correlaciona ativo elegível, autorização, conteúdo/mídia, policy de campo, preview, alçada, correlação, retorno externo e owner da exceção a `EXE-03`, `EXE-06` e `EXE-08`. [3] | O requisito preserva a não-ação até comando aprovado, bloqueia publicação/retirada por estado visual e exige reconciliação de retorno/falha. | `C` |
| `COV-LC-01` — vistoria/sinistro | `LC-REQ-13` individualiza caso, ambiente/item, evidência, cronologia, alegação, contestação, owner, alçada e decisão, separado de consequência financeira/contratual. [3] | O requisito proíbe que foto, relato, status ou encerramento produzam culpa, cobertura, cobrança, dedução, pagamento ou efeito contratual por inferência. | `C` |

> **Conclusão da auditoria:** a cobertura documental dos domínios avaliados é `C` após dois complementos mínimos de rastreabilidade. Não foi incluído módulo, tela, integração, permissão, automação ou operação nova. Permanecem como provas futuras — e não como funcionalidades prontas — os testes de contexto, política, exceção, permitir/negar, idempotência, reversão, qualidade e aceite previstos nos cadernos vinculados.

## 7. Referências internas

[1] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)

[2] [Matriz mestre estratégica — Vendas Urbanas e Locação](matriz_mestre_estrategica_vendas_locacao.md)

[3] [Caderno de execução estratégica — Vendas Urbanas e Locação](caderno_execucao_estrategica_vendas_locacao.md)

[4] [Estratégia atualizada — Vendas Urbanas e Locação](estrategia_vendas_urbanas_locacao_atualizada.md)

[5] [Jornadas operacionais — Vendas Urbanas e Locação](caderno_jornadas_operacionais_vendas_locacao.md)

[6] [Inteligência, métricas, automação e canais](caderno_inteligencia_metricas_canais_vendas_locacao.md)
