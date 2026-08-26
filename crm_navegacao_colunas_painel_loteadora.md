# Navegação canônica: colunas globais e Painel Loteadora interno

**Status:** `decisão_aprovada_para_estratégia`  
**Decisão do usuário:** a ordem global do CRM é **SUPER ADM → ADM → LOTEADORA → VENDAS URBANAS → LOCAÇÃO**. Dentro da coluna **LOTEADORA**, o **Painel Loteadora** é a primeira tela interna, antecedendo os setores operacionais da própria coluna.

> **Princípio de dois níveis:** a coluna define o domínio/módulo global; a tela inicial interna orienta o trabalho dentro daquele domínio. Um Painel Loteadora não é uma sexta coluna, não vem antes de SUPER ADM ou ADM, e não substitui Estoque, Contratos, Financeiro ou Repasses.

## 1. Ordem global obrigatória

| Ordem | Coluna | Autoridade e finalidade |
| --- | --- | --- |
| **1** | **SUPER ADM** | Governa a plataforma e organizações contratantes sob menor privilégio, MFA, JIT, justificativa e auditoria; não recebe acesso operacional irrestrito a tenants. |
| **2** | **ADM** | Governa somente a própria organização e seus módulos contratados/autorizados, incluindo colaboradores e visão gerencial permitida. |
| **3** | **LOTEADORA** | Opera empreendimento, lote, parceiros, cliente, proposta, contrato, carteira, repasses e respectivas restrições. |
| **4** | **VENDAS URBANAS** | Opera clientes, proprietários, imóveis, construtoras, vendas e comissões urbanas. |
| **5** | **LOCAÇÃO** | Opera clientes, proprietários, imóveis, administração, locação, carteira, cobrança, repasse e renovação. |

## 2. Ordem interna da coluna Loteadora

| Ordem interna | Tela/setor | Papel dentro da coluna |
| --- | --- | --- |
| **0** | **Painel Loteadora** | Porta de entrada interna: alertas, prioridades e poucos indicadores executivos que direcionam ao fato fonte. |
| **1** | Cadastro de Loteamentos | Estrutura de gleba, empreendimento, fase, quadra, lote, evidências e tabelas-base. |
| **2** | Estoque/Mapa de Lotes | Operação diária da situação comercial do lote `Qn · Ln`. |
| **3** | Sócios e Parceiros | Vínculos, instrumentos, direitos, grupos, painéis e aportes. |
| **4** | Clientes Loteadora | Ficha única, dossiê e papéis de compradores/representantes. |
| **5** | Propostas, Reservas e Contratos | Jornada comercial e lente de contratos realizados por lote. |
| **6** | Financeiro e Carteira | Parcelas, cobrança, recebíveis, acordos, conciliação e alertas. |
| **7** | Repasses e Distribuição | Planos, direitos, bloqueios, alçadas, instruções, settlement e conciliação de repasse. |
| **8** | Obras e Infraestrutura *(módulo posterior)* | Na fundação, somente marcos, evidências, restrições, owners e alertas. |

## 3. Limites do Painel Loteadora

| O Painel Loteadora pode fazer | O Painel Loteadora não faz |
| --- | --- |
| Mostrar alertas de elegibilidade, reserva, dossiê, contrato, carteira, direito bloqueado, repasse, conflito lote × contrato e restrição técnica dentro do escopo. | Substituir os setores, editar fatos, baixar parcela, liberar lote, alterar contrato, aprovar repasse ou administrar acessos. |
| Abrir o setor/caso de origem com mesmo recorte/policy. | Ampliar escopo do usuário, atravessar organização/SPE ou expor dados de parceiro/grupo sem Grant de Portal. |
| Exibir indicadores executivos com fórmula, estado, `as_of`, frescor, limitação e link de investigação. | Somar naturezas incompatíveis ou apresentar valor previsto/em análise como caixa, contrato ou repasse conciliado. |

## 4. Critérios de aceite futuros

| Cenário | Deve permitir | Deve negar |
| --- | --- | --- |
| Usuário autorizado navega na arquitetura global. | Ver as colunas na ordem SUPER ADM, ADM, LOTEADORA, VENDAS URBANAS e LOCAÇÃO, conforme módulos/papel. | Inserir Painel Loteadora como coluna global concorrente ou acima de SUPER ADM/ADM. |
| Usuário abre Loteadora. | Aterrar no Painel Loteadora interno quando possuir o módulo/escopo correspondente. | Carregar dados de todos os setores sem policy ou tornar o painel atalho de comando material. |
| Alerta de painel é selecionado. | Direcionar à lista/caso fonte no mesmo recorte e registrar contexto conforme política. | Usar ID/URL/filtro para acessar lote, contrato, carteira ou direito de terceiro. |
| Módulo Loteadora não está contratado ou usuário não tem acesso. | Ocultar/negar a coluna/tela conforme contrato e policy. | Exibir painel vazio que confirme dados, módulos ou recursos internos não autorizados. |

## Referências internas

[1] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)

[2] [Relatórios contextuais da Loteadora](crm_loteadora_relatorios_contextuais.md)

[3] [Matriz de auditoria final da Loteadora](loteadora_matriz_auditoria_final_setores.md)
