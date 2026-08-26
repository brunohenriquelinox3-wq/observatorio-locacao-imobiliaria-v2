# Auditoria final de Loteadora — inventário de setores e decisões pendentes

**Estado:** `pronto_para_revisão_setor_a_setor`  
**Objetivo:** transformar a coluna LOTEADORA em uma estrutura objetiva para a sua decisão de manter, separar, unir, renomear ou adicionar. Nenhum setor abaixo está sendo ativado; trata-se da arquitetura de trabalho e de seus vínculos.

## Estrutura atual proposta para Loteadora

| Ordem | Setor atual | Classificação | O que controla | Decisão que precisa da sua auditoria |
| --- | --- | --- | --- | --- |
| 1 | **Cadastro de Loteamentos e Estoque** | Fundamental. | Glebas, empreendimentos, fases, quadras, lotes, unidades, mapa/espelho, tabelas, disponibilidade, alocação e restrições. | Manter junto ou separar em `Cadastro de Loteamentos` + `Estoque de Lotes`? |
| 2 | **Sócios, Parceiros e Origem da Terra** | Fundamental. | Sócios, parceiros, fazendeiros/proprietários da terra, permutantes e beneficiários. | Qual nome representa melhor sua operação: `Sócios e Parceiros`, `Parceiros e Origem da Terra` ou outro? |
| 3 | **Clientes** | Fundamental. | Proponentes, compradores, coadquirentes, representantes e empresas compradoras. | Manter com este nome ou usar `Clientes e Compradores`? |
| 4 | **Vendas e Contratos** | Fundamental. | Proposta, reserva, escolha de lote, venda, documentação, contrato e pós-venda comercial. | Reserva deve ser apenas etapa interna ou virar setor próprio? |
| 5 | **Financeiro Loteadora** | Fundamental e coração financeiro. | Boletos/instruções, parcelas, recebíveis, pagáveis, atrasos, carteira, acordos, comprovantes e alertas. | Quais telas vêm primeiro: carteira, cobrança, baixa/conciliação, acordos, contas a pagar ou relatórios? |
| 6 | **Repasses e Distribuição** | Fundamental, mas pode ser setor interno do Financeiro. | Comissão, direito de parceiro, permutante, sócio, imobiliária, captador e distribuição datada. | Fica dentro de Financeiro ou como setor separado? |
| 7 | **Obras e Infraestrutura** | Opcional/faseável. | Cronograma, marcos, pendências e evidências de implantação. | Entra já na primeira versão ou vira módulo posterior? |
| 8 | **Relatórios de Loteadora** | Necessário, mas pode ser tela dentro de Financeiro/ADM. | Estoque, vendas, carteira, inadimplência, recebíveis, parceiros e desempenho por empreendimento. | Deve ser setor próprio ou atalhos dentro dos setores operacionais? |

## Conexões que nenhum ajuste de menu pode quebrar

| Origem | Destino | Regra |
| --- | --- | --- |
| Cadastro de Loteamentos e Estoque | Vendas e Contratos | Um lote somente pode entrar em proposta/venda quando sua elegibilidade estiver comprovada por disponibilidade, restrição, alocação, tabela e alçada. |
| Sócios, Parceiros e Origem da Terra | Repasses e Distribuição | Parceiro/fazendeiro/permutante não recebe só por estar cadastrado; direito depende de instrumento, objeto, base, condição e vigência. |
| Clientes | Vendas e Contratos | Proponente principal, coadquirente e representante podem participar de um mesmo contrato sem duplicar pessoa/empresa. |
| Vendas e Contratos | Financeiro Loteadora | Contrato cria parcelas/cobranças e carteira; boleto não confirma pagamento. |
| Financeiro Loteadora | Repasses e Distribuição | Caixa/conciliação e condições da regra determinam direito elegível; repasse não é criado por etiqueta percentual isolada. |
| Obras e Infraestrutura | Cadastro de Loteamentos e Estoque | Marco técnico pode gerar restrição ou alerta, mas não altera estoque nem libera venda sozinho. |

## Pontos que precisam de decisão do usuário

| Tema | Opção A | Opção B | Recomendação atual |
| --- | --- | --- | --- |
| Cadastro/estoque | Um setor único. | Dois setores: cadastro de loteamento e estoque. | Começar junto se a equipe for pequena; separar quando o mapa/espelho e a carteira de lotes virarem rotina intensa. |
| Parceiros da terra | Dentro de Sócios e Parceiros. | Setor próprio de Origem da Terra/Permuta. | Manter no mesmo setor, mas com abas claras: sócios, parceiros, fazendeiros/proprietários, permutantes e beneficiários. |
| Reserva | Etapa de Vendas e Contratos. | Setor próprio de Reservas. | Etapa de Vendas inicialmente; virar setor próprio somente se houver central de reservas/canais concorrentes. |
| Repasses | Aba dentro do Financeiro. | Setor próprio. | Setor próprio dentro da coluna quando houver muitos parceiros, permutantes e cascatas; caso contrário, aba de Financeiro. |
| Obras | Já no menu inicial. | Módulo posterior. | Tratar como módulo posterior, mantendo só marcos/evidências essenciais no cadastro de empreendimento. |
| Relatórios | Coluna/setor próprio. | Atalhos por setor e consolidação no ADM. | Relatórios operacionais dentro de cada setor e visão executiva no ADM. |

## Separações que devem continuar obrigatórias

| Não misturar | Razão |
| --- | --- |
| Lote disponível com lote apenas “não vendido”. | Um lote pode estar restrito, caucionado, alocado, reservado ou sob distrato. |
| Proprietário/fazendeiro da terra com sócio genérico. | A origem da terra, a permuta, a participação societária e o direito financeiro podem ter instrumentos e bases diferentes. |
| Boleto emitido com parcela paga. | Emissão, retorno, aplicação de caixa e conciliação são fases distintas. |
| Receita, recebível, repasse e distribuição de lucro. | Cada natureza econômica tem contabilidade, base e owner próprios. |
| Distrato com simples retorno manual do lote a disponível. | Distrato precisa de caso, contrato, cálculo, condição e autorização de reentrada. |
