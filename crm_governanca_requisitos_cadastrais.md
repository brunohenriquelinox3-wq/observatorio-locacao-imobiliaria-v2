# Governança de requisitos cadastrais e políticas de carteira

## Objetivo

O CRM não deve codificar uma ficha de cadastro fixa. Ele deve manter um catálogo de requisitos que explica **qual dado ou evidência é necessário, para qual finalidade, em qual contexto, sob qual política, até quando e com qual revisão**. Isso permite incorporar o estudo BHL, futuras regras municipais, políticas de crédito e pareceres sem reescrever o modelo de dados a cada mudança.

## Registro de requisito

| Campo | Função |
| --- | --- |
| `requirement_id` e versão | Identificam o requisito e sua evolução sem apagar histórico. |
| `requirement_kind` | Campo, documento, declaração, relação, análise, assinatura, aprovação ou alerta. |
| `business_context` | Locação, venda urbana, construtora, loteadora, permuta, sociedade ou carteira. |
| `role_scope` | Papel a que se aplica: proprietário, comprador, locatário, fiador, permutante, sócio etc. |
| `purpose` | Interesse, qualificação, proposta, contrato, crédito, compliance, carteira ou pós-negócio. |
| `condition_expression` | Condição configurável: por exemplo, “somente se proposta exigir assinatura conjunta”, não regra universal. |
| `necessity_level` | Informativo, solicitado, necessário para revisão, gate de instrumento ou exceção aprovada. |
| `data_minimum` | Menor conjunto de dados/arquivo capaz de atender à finalidade. |
| `legal_or_policy_basis` | Fonte oficial, política interna ou hipótese de produto, cada uma com natureza distinta. |
| `owner` e `reviewer` | Responsável por propor e por aprovar a aplicação. |
| `valid_from`, `review_by`, `retention_policy` | Vigência, revisão e retenção correspondente. |
| `impact` | Formulário, contrato, acesso, métrica, integração ou gate. |

## Taxonomia de regras

| Tipo | Exemplo | Como o CRM se comporta |
| --- | --- | --- |
| Regra legal/regulatória confirmada | Obrigação de registrar e preservar dados de operação conforme escopo aplicável | Ativa checklist configurado, responsável e evidência de cumprimento. |
| Política interna aprovada | Revisar capacidade declarada em contrato de lote acima de determinada condição | Exibe política e versão; permite exceção registrada por alçada. |
| Regra contratual | Documento/assinatura exigidos no instrumento específico | Gera checklist pela versão do contrato; não aplica a outros instrumentos por analogia. |
| Configuração local | Município/empreendimento exige evidência adicional | Limita-se ao escopo e vigência da configuração. |
| Hipótese de pesquisa | Indicador de que investidor pode ter comportamento distinto em determinado ciclo | Gera análise/piloto; não bloqueia, classifica ou pontua automaticamente pessoas. |
| Experimento de UX | Perguntar prazo de mudança antes de pedir telefone alternativo | Medido em piloto e reversível. |

## Política de crédito, compliance e carteira

Cada uma dessas áreas deve ter uma política própria. A política contém escopo, entradas permitidas, decisão humana requerida, explicação, exceção, prazo de reavaliação e controles de acesso. Isso impede que um `score` oculto seja usado como resposta para assuntos de naturezas diferentes.

| Política | Entrada permitida | Saída do CRM | Quem decide |
| --- | --- | --- | --- |
| Capacidade/condição comercial | Declarações e evidências autorizadas, conforme finalidade | Condição recomendada, pendências e validade | Responsável de crédito/comercial conforme alçada. |
| Compliance | Dados e indicadores minimizados, com acesso restrito | Caso, diligência, escalonamento ou encerramento | Compliance designado. |
| Assinatura/representação | Relação de parte, instrumento, evidência e vigência | Checklist/gate em revisão | Jurídico ou responsável de contrato. |
| Carteira/atendimento | Contrato, parcela, contato, atividade e política de comunicação | Próxima ação e caso de atendimento | Financeiro/cobrança/relacionamento. |
| Retenção | Finalidade, obrigação e término do vínculo | Agenda de revisão, bloqueio, anonimização ou descarte aprovado | Privacidade/compliance. |

## Critérios para aceitar novos campos do usuário, do mercado ou de um estudo

Um novo campo só pode entrar no formulário permanente se responder a cinco questões: qual decisão ele apoia, em que etapa é necessário, qual o menor dado suficiente, quem pode acessá-lo e quando ele deve ser removido/revisto. Se não houver resposta, o campo fica como hipótese de pesquisa ou fora do produto.

| Pergunta | Se a resposta for insuficiente |
| --- | --- |
| Qual finalidade concreta existe? | Não coletar ou manter como anotação de pesquisa. |
| É necessário agora ou apenas no contrato/dossiê? | Adiar por divulgação progressiva. |
| Existe fonte legal, contratual ou política aprovada? | Criar proposta de requisito, não gate. |
| Quem revisa e pode acessar? | Não disponibilizar no perfil geral. |
| Quando expira/é atualizado/eliminado? | Não armazenar indefinidamente. |

## Notas de mudança obrigatórias

Quando uma revisão alterar ficha, checklist, política ou carteira, a nota deve informar: requisito afetado, motivo, fonte, escopo, versão anterior, versão nova, dados já existentes afetados, migração, impacto em integrações, responsável, plano de reversão e data de nova revisão. Essa prática torna a estratégia sempre aberta à melhoria, mas resistente a mudanças impensadas.
