# Backlog competitivo do CRM imobiliário

## Requisitos derivados do benchmark e sua regra de evolução

Este backlog é uma **fila de hipótese de produto**, não um compromisso comercial. Cada item deve manter a fonte competitiva, o problema validado em piloto, o responsável e o critério de saída antes de virar escopo de desenvolvimento.

| ID | Resultado | Requisito | Prioridade | Critério de aceitação |
| --- | --- | --- | --- | --- |
| COMP-01 | Não perder oportunidade comercial | Fonte, consentimento, dono, etapa, próximo passo e transferência de lead. | Fundação | Nenhum lead ativo sem responsável e sem próxima ação. |
| COMP-02 | Eliminar conflito de disponibilidade | Estoque por empreendimento/fase/lote/unidade, reserva, expiração, fila e bloqueio. | Fundação | Reserva concorrente tem resposta determinística e auditável. |
| COMP-03 | Tornar condição comercial confiável | Tabela versionada, condição, proposta, aprovação, documento e assinatura conectados. | Fundação | Proposta aprovada aponta sua versão de tabela e documentos exigidos. |
| COMP-04 | Viabilizar trabalho de campo | Aplicativo web responsivo para corretor/parceiro, com permissão e contexto mínimo offline/online conforme integração. | Fundação | Uma reserva, proposta e upload podem ser realizados com trilha de autoria e horário. |
| COMP-05 | Dominar loteadora | Entidades de gleba, empreendimento, fase, quadra, lote, registro, obra, estoque, carteira e pós-entrega. | Diferencial | Um lote percorre estados ortogonais sem confundir disponibilidade, registro e carteira. |
| COMP-06 | Materializar cadeia de recebimento | Plano de direitos por contrato, recebedor, fórmula, base, gatilho, prioridade, vigência, teto e reversão. | Diferencial | Uma entrada gera prévia explicável de direitos sem liquidar dinheiro no CRM. |
| COMP-07 | Conectar comercial e contabilidade | Subledger, competência, aplicação de caixa, conciliação, exceção, lote de exportação e retorno. | Diferencial | Contador reconcilia evento até proposta, contrato, regra e referência de liquidação. |
| COMP-08 | Permitir ecossistema, não cópia de ERP | Contratos de integração, ownership de dados, logs, idempotência, reprocessamento e reconciliação. | Diferencial | Falha de integração fica rastreável, reprocessável e sem duplicar o evento financeiro. |
| COMP-09 | Usar IA com confiança | Assistente com fonte, contexto, política de acesso, proposta de ação e revisão humana. | Evolução | Toda recomendação de alto impacto registra o que utilizou e quem aprovou. |
| COMP-10 | Vender pela prova operacional | Biblioteca de playbooks, dados de implantação, cases datados e catálogo de integrações/limites. | Go-to-market | Cliente-piloto conclui configuração por função com métrica de ativação definida. |

## Experiência visual, dados e IA verificável

| ID | Resultado | Requisito | Prioridade | Critério de aceitação |
| --- | --- | --- | --- | --- |
| UX-01 | Tornar prioridade visível | Cockpit por função com pergunta de decisão, período, recorte, atualização, exceção e próxima ação. | Fundação | Usuário-piloto localiza o caso prioritário e explica o recorte sem ajuda. |
| UX-02 | Escolher gráficos honestos | Catálogo pergunta → visual → tabela → drill-down para funil, carteira, estoque, lote e financeiro. | Fundação | Todo gráfico abre a lista de registros e apresenta unidade, período, fonte e estado. |
| UX-03 | Comparar sem planilha paralela | Tabelas com visão salva, filtro, ordenação, total, ação progressiva, estado pendente e adaptação a mobile. | Fundação | A lista prioritária suporta comparação e abertura de detalhe sem perda de filtro. |
| UX-04 | Sustentar domínio de loteadora | Planta/grade de lote com estados paralelos, legenda, filtro de fase/quadra e abertura de carteira. | Diferencial | Disponibilidade, restrição, alocação, registro e carteira são distinguíveis no mesmo lote. |
| UX-05 | Fazer número explicar-se | Detalhe financeiro com evento → origem → regra → direito → retorno → exportação. | Diferencial | Usuário autorizado rastreia uma diferença até a evidência e a versão aplicável. |
| UX-06 | Garantir acessibilidade real | Tokens de contraste, alternativa não cromática, tabela acessível, foco, teclado, alto contraste e redução de movimento. | Fundação | Estados críticos passam verificação de contraste e teste de reconhecimento sem depender só de cor. |
| UX-07 | Criar identidade operacional madura | Tokens de superfície, tipografia, espaçamento, borda, densidade, ícone e número tabular para o workspace. | Fundação | Nenhuma nova tela usa cor, tamanho, sombra ou raio arbitrários fora do sistema. |
| UX-08 | Manter a interface fluida | Transições rápidas, reversíveis e focadas; skeletons realistas; metas de desempenho percebido. | Fundação | Filtro, aba e detalhe mantêm contexto, foco e função com redução de movimento ativada. |
| UX-09 | Tornar IA auditável | Cartões/painéis de IA com fonte, escopo, limitação, feedback, revisão e confirmação antes de ação. | Diferencial | Todo insight de alto impacto registra fonte, usuário aprovador e resultado da ação. |
| UX-10 | Aprender com operação | Instrumentação de tarefa, compreensão de gráfico, taxa de aceite/edição de IA e uso de densidade. | Evolução | Cada piloto produz evidência comparável para promover, ajustar ou remover um padrão visual. |

## Revisão de priorização

O backlog deve ser revisado após cada piloto mensal. Uma prioridade só sobe quando houver problema repetido, impacto mensurável, viabilidade de integração e dono operacional. Uma hipótese pode ser rebaixada ou removida sem apagar o registro da decisão anterior.
