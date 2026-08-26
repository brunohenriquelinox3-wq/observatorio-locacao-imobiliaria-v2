# Auditoria final de Loteadora — inventário de setores e decisões pendentes

**Estado:** `pronto_para_revisão_setor_a_setor`  
**Objetivo:** transformar a coluna LOTEADORA em uma estrutura objetiva para a sua decisão de manter, separar, unir, renomear ou adicionar. Nenhum setor abaixo está sendo ativado; trata-se da arquitetura de trabalho e de seus vínculos.

## Estrutura atual proposta para Loteadora

| Ordem | Setor atual | Classificação | O que controla | Decisão que precisa da sua auditoria |
| --- | --- | --- | --- | --- |
| 1 | **Cadastro de Loteamentos** | Fundamental. | Glebas, empreendimentos, fases, quadras, lotes, unidades, documentos, evidências, registros e tabelas-base. | **Decisão aprovada:** setor separado para criação e estrutura. |
| 2 | **Estoque/Mapa de Lotes** | Fundamental. | Mapa/espelho, tabela vigente, disponibilidade, alocação, restrição, hold, reserva, proposta e contrato dos lotes já cadastrados. | **Decisão aprovada:** setor separado para operação diária do estoque. |
| 3 | **Sócios e Parceiros** | Fundamental. | Sócios, parceiros, fazendeiros/proprietários da terra, permutantes, investidores, captadores, corretores, imobiliárias, credores/garantidores e beneficiários; direitos por evento de parcela, grupos, painéis e aportes de capital. | **Decisão aprovada:** o setor deve ser completo e minucioso; cada contrato/negociação mantém vínculo próprio, e grupo/painel só compartilha escopo expressamente contratado. |
| 4 | **Clientes Loteadora** | Fundamental. | Proponentes, compradores, coadquirentes, representantes e empresas compradoras; ficha completa e dossiê documental/fotográfico versionado. | **Decisão aprovada:** Clientes Loteadora; ficha única e busca protegida por CPF/CNPJ reutilizam dados/evidências elegíveis na venda. |
| 5 | **Propostas, Reservas e Contratos** | Fundamental. | Proposta versionada, reserva com prazo/alçada, escolha de lote, venda, documentação, contrato, pós-venda e lente de contratos realizados por lote. | **Decisão aprovada:** Reserva é etapa interna da jornada, com estados/evidências próprios e sem setor separado. |
| 6 | **Financeiro Loteadora** | Fundamental e coração financeiro. | Boletos/instruções, parcelas, recebíveis, pagáveis, atrasos, carteira, acordos, comprovantes e alertas. | Quais telas vêm primeiro: carteira, cobrança, baixa/conciliação, acordos, contas a pagar ou relatórios? |
| 7 | **Repasses e Distribuição** | Fundamental, mas pode ser setor interno do Financeiro. | Comissão, direito de parceiro, permutante, sócio, imobiliária, captador e distribuição datada. | Fica dentro de Financeiro ou como setor separado? |
| 8 | **Obras e Infraestrutura** | Opcional/faseável. | Cronograma, marcos, pendências e evidências de implantação. | Entra já na primeira versão ou vira módulo posterior? |
| 9 | **Relatórios de Loteadora** | Necessário, mas pode ser tela dentro de Financeiro/ADM. | Estoque, vendas, carteira, inadimplência, recebíveis, parceiros e desempenho por empreendimento. | Deve ser setor próprio ou atalhos dentro dos setores operacionais? |

## Conexões que nenhum ajuste de menu pode quebrar

| Origem | Destino | Regra |
| --- | --- | --- |
| Cadastro de Loteamentos | Estoque/Mapa de Lotes | Cria a estrutura de loteamento e lote; não duplica a operação diária da disponibilidade. |
| Estoque/Mapa de Lotes | Propostas, Reservas e Contratos | Um lote somente pode entrar em proposta/reserva/venda quando sua elegibilidade estiver comprovada por disponibilidade, restrição, alocação, tabela e alçada; reserva concorrente, expiração e conversão passam por transição auditada. |
| Sócios e Parceiros | Repasses e Distribuição | Sócio, parceiro, fazendeiro/proprietário da terra, permutante, investidor ou captador não recebe só por estar cadastrado; direito depende de instrumento, objeto, base, tipo de evento/parcela, condição, vigência e versão. |
| Clientes Loteadora | Vendas e Contratos | Proponente principal, coadquirente e representante podem participar de um mesmo contrato sem duplicar pessoa/empresa; a venda reutiliza ficha/dossiê e congela snapshot das evidências usadas. |
| Vendas e Contratos | Estoque/Mapa de Lotes | Contratos realizados por `Qn · Ln` formam uma lente de carteira contratual com alertas de dossiê, assinatura, agenda, carteira e conflito lote × contrato; não recriam o estoque. |
| Vendas e Contratos | Financeiro Loteadora | Contrato cria parcelas/cobranças e carteira; boleto não confirma pagamento. |
| Financeiro Loteadora | Repasses e Distribuição | Caixa/conciliação e condições da regra determinam direito elegível; repasse não é criado por etiqueta percentual isolada. |
| Repasses e Distribuição | Painel de Sócio/Parceiro | O parceiro/grupo vê projeções, realizado, contratos, lotes e inadimplência apenas no escopo concedido; painel não é setor administrativo. |
| Obras e Infraestrutura | Cadastro de Loteamentos / Estoque | Marco técnico pode gerar restrição ou alerta, mas não altera estoque nem libera venda sozinho. |

## Pontos que precisam de decisão do usuário

| Tema | Opção A | Opção B | Recomendação atual |
| --- | --- | --- | --- |
| Cadastro/estoque | Um setor único. | Dois setores: Cadastro de Loteamentos e Estoque/Mapa de Lotes. | **Decisão aprovada:** manter separado sem duplicar dados. |
| Parceiros da terra | Dentro de Sócios e Parceiros. | Setor próprio de Origem da Terra/Permuta. | **Decisão aprovada:** manter dentro de Sócios e Parceiros, com modalidades completas e vínculos contratuais independentes. |
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
| Aporte, titularidade e distribuição. | Compromisso de capital, caixa conciliado, eficácia societária e direito econômico posterior são fatos independentes e documentados. |
| Distrato com simples retorno manual do lote a disponível. | Distrato precisa de caso, contrato, cálculo, condição e autorização de reentrada. |
