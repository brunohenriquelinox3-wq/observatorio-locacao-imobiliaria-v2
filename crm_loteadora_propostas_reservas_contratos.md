# Loteadora: Propostas, Reservas e Contratos

**Status:** `decisão_aprovada_para_estratégia`  
**Decisão LOT-A04:** **Reserva permanece como etapa dentro de Propostas, Reservas e Contratos.** Ela não será um setor de menu separado na primeira versão, mas terá objeto, estados, prazo, alçada, evidência, alertas e auditoria próprios.

> **Princípio:** proposta expressa uma intenção/condição comercial; reserva protege temporariamente a elegibilidade de um lote; contrato cria obrigação versionada. Nenhum desses estados, sozinho, comprova pagamento, conciliação, entrega, registro ou direito de repasse.

## 1. Jornada única de venda de lote

| Etapa | Objeto principal | Finalidade | Saída válida |
| --- | --- | --- | --- |
| **Qualificação** | Cliente Loteadora + interesse | Identificar partes, papéis, dossiê inicial e lote/empreendimento de interesse. | Proposta criada ou desistência registrada. |
| **Proposta** | Proposta versionada | Declarar lote(s), tabela, condição, entrada, prazo, partes, documentos e validade. | Aprovação, revisão, rejeição, expiração ou pedido de reserva. |
| **Reserva** | Reserva vinculada à proposta | Reter temporariamente o lote elegível contra concorrência, dentro de prazo e regra autorizados. | Conversão em venda/contrato, cancelamento, expiração tratada ou exceção. |
| **Venda e contrato** | Contrato versionado | Materializar a condição aprovada, partes, lote, dossiê, assinaturas e obrigações. | Contrato ativo, aditivo, cessão, distrato em análise ou encerramento. |
| **Pós-contrato** | Carteira e estoque de contratos realizados | Acompanhar agenda, cobrança, documentos, aditivos, cessões/distratos e estado do lote. | Situação contratual e de carteira explicáveis por fonte e data. |

## 2. Estados de cada objeto

| Objeto | Estados mínimos | Regra de passagem |
| --- | --- | --- |
| **Proposta** | Rascunho, submetida, em revisão, aprovada, rejeitada, expirada, substituída, cancelada. | Toda mudança registra versão, condição, ator, data, motivo e evidência aplicável. |
| **Reserva** | Solicitada, aguardando alçada, ativa, próxima do vencimento, expirada em análise, convertida, cancelada, liberada após validação, em conflito. | Reserva só pode ficar ativa se lote e proposta forem elegíveis no momento da decisão. |
| **Contrato** | Rascunho, em revisão, aprovado, aguardando assinatura, assinado/ativo, aditado, cedido, distrato em análise, encerrado. | Contrato ativo depende de requisitos/assinaturas definidos; não volta lote a disponível por simples edição de tela. |
| **Lote no estoque** | Disponível, hold, reservado, em proposta, contratado, bloqueado, devolução/distrato em análise, retornado elegível. | O Estoque/Mapa continua autoridade do estado comercial e valida cada transição vinculada à jornada. |
| **Dossiê da venda** | Sem checklist, pendente, recebido em análise, cobertura parcial, elegível, expirado, restrito. | Dossiê complementa proposta/contrato, mas não altera sua situação sem regra/alçada específica. |

## 3. Conteúdo obrigatório por etapa

| Etapa | Precisa identificar | Precisa registrar | Não deve inferir |
| --- | --- | --- | --- |
| Proposta | Cliente(s), papel, lote(s), condição, tabela, origem e validade. | Versão de condição, owner, aprovação necessária, evidências e prazo. | Reserva ativa, assinatura, pagamento, crédito aprovado ou estoque liberado. |
| Reserva | Proposta aprovada/permitida, lote, prazo, motivo, canal, owner e alçada. | Início/fim, regra de expiração, concorrência, evidência de decisão e correlação. | Contrato ativo, baixa financeira, propriedade/entrega ou direito econômico. |
| Contrato | Partes/poderes, lote, condição final, versão de dossiê, assinaturas e anexos. | Data/estado, versionamento, condição precedente, agenda prevista e relação com estoque. | Boleto pago, caixa conciliado ou distribuição automática. |
| Carteira pós-contrato | Contrato, parcela/cobrança, estado de retorno e conciliação. | Próxima ação, atraso/acordo, `as_of` e responsável. | Que contrato cancelado liberou lote ou que comprovante quitou obrigação. |

## 4. Regras de conversão e reversão

| Transição | Deve exigir | Deve produzir | Deve impedir |
| --- | --- | --- | --- |
| Proposta → Reserva ativa | Lote elegível, condição vigente, partes mínimas, prazo, alçada/política e operação transacional. | Reserva correlacionada, prazo, owner e bloqueio comercial compatível no lote. | Duas reservas ativas incompatíveis para o mesmo lote. |
| Reserva → Contrato | Condição final aprovada, checklist aplicável, partes/poderes, lote ainda reservado para a proposta e assinaturas/marcos exigidos. | Contrato versionado, snapshot de dossiê e transição de lote para estado contratual aplicável. | Converter reserva expirada, cancelada, de outro cliente ou lote incompatível. |
| Reserva → Expirada/cancelada | Vencimento ou decisão documentada, com verificação de contrato/pendência concorrente. | Histórico, motivo, tempo de retenção e nova avaliação de elegibilidade do lote. | Liberar automaticamente lote com contrato ativo, distrato em análise, bloqueio ou outra restrição. |
| Contrato → Aditivo/cessão/distrato | Caso, instrumento, alçada, evidências e efeitos definidos sobre partes, lote e carteira. | Nova versão/estado e alertas para estoque, carteira e dossiê. | Apagar contrato, mutar histórico ou devolver lote à disponibilidade sem tratamento completo. |

## 5. Critérios de aceite futuros

| Cenário | Deve permitir | Deve negar |
| --- | --- | --- |
| Dois operadores tentam reservar o mesmo `Q12 · L1`. | Uma única transação vence conforme elegibilidade/regra e a outra recebe estado de conflito claro. | Duas reservas ativas ou contrato concorrente. |
| Reserva expira sem contrato. | Abrir tratamento de expiração, manter trilha e recalcular elegibilidade do lote. | Considerar lote automaticamente disponível se houver bloqueio, pendência ou processo de distrato. |
| Proposta é revisada após reserva. | Criar nova versão e exigir nova avaliação quando a alteração afetar condição, lote, prazo ou alçada. | Alterar condição material da reserva/contrato sem evidência e revalidação. |
| Contrato é assinado, mas a agenda ainda não existe. | Exibir alerta de agenda/carteira ausente no estoque de contratos realizados. | Declarar adimplência ou caixa conciliado. |
| Cliente atualizado na ficha após proposta. | Usar a ficha atual para nova ação e preservar snapshot usado no contrato aplicável. | Alterar silenciosamente dados/evidências históricas da proposta/contrato. |

## 6. Proteção do lote, prazo e concorrência de reserva

A reserva é uma decisão concorrente sobre um ativo escasso. Portanto, a regra não pode depender de atualização visual, cronômetro do navegador ou mensagem entre operadores. A criação, a extensão, a conversão e a liberação da reserva exigem comando transacional, chave de idempotência, avaliação da elegibilidade atual e trilha de auditoria.

| Controle | Regra estratégica | Falha que bloqueia |
| --- | --- | --- |
| **Chave de lote e escopo** | Toda reserva aponta ao lote canônico `Qn · Ln`, organização/SPE, proposta, cliente(s), versão de condição e contexto de estoque. | Reserva criada para lote inexistente, fora da organização ou sem rastrear a proposta. |
| **Exclusividade ativa** | Só pode existir uma reserva ativa incompatível por lote/escopo comercial. A garantia é aplicada no comando e no banco, não só na tela. | Dois operadores transformarem o mesmo lote em reserva ativa por requisições simultâneas. |
| **Idempotência** | Repetir a mesma intenção por retry, queda de conexão ou duplo clique retorna o mesmo resultado/correlação. | Criar duas reservas para a mesma proposta/ação. |
| **Relógio de servidor** | Início, fim e estado de atraso usam tempo confiável do servidor, com fuso de exibição separado. | Prazo controlado por relógio do dispositivo, aba aberta ou manipulação local. |
| **Alçada e condição** | Prazo, extensão, exceção, tabela e estado do lote seguem política e aprovação quando exigidas. | Operador prorrogar ou reter lote fora da política sem justificativa/evidência. |
| **Audit event** | Intenção, decisão, antes/depois, ator, motivo, alçada, hora e correlação são preservados. | Alterar prazo, lote ou estado sem explicação investigável. |

### 6.1 Expiração sem liberação insegura

O vencimento de uma reserva não deve tornar o lote disponível por mudança isolada de status. Ao atingir o prazo, ela entra em `expirada em análise`; o sistema reavalia a existência de contrato, assinatura pendente, pagamento/condição aplicável, bloqueio, outra reserva válida, distrato/cessão ou disputa antes de liberar a elegibilidade comercial.

| Evento | Estado seguro | Ação obrigatória |
| --- | --- | --- |
| Prazo se aproxima. | `próxima do vencimento`. | Alertar owner e responsável comercial com prazo e contexto, sem modificar lote. |
| Prazo atinge vencimento. | `expirada em análise`. | Revalidar lote, proposta, contrato e restrições sob política/servidor. |
| Não há impedimento e política permite. | `liberada após validação`. | Atualizar o estado comercial do lote por transição auditada, preservando reserva histórica. |
| Há contrato, bloqueio, condição, disputa ou processo pendente. | `em conflito` ou estado de exceção aplicável. | Manter lote não elegível e atribuir owner/causa/próxima ação. |
| Extensão aprovada. | Nova vigência/versionamento. | Registrar justificativa, alçada, limite e correlação; não sobrescrever prazo anterior. |

> Uma implementação futura de varredura periódica de reservas vencidas será tratada como **automação sensível**: job durável, idempotente, autenticado, observável e aprovado antes de ativação. Nesta etapa não foi criado agendamento, cron, job ou liberação automática.

### 6.2 Alertas de reserva dentro da jornada comercial

| Prioridade | Gatilho | Onde aparece | Próxima ação |
| --- | --- | --- | --- |
| **Crítica** | Tentativa concorrente, conflito lote × reserva/contrato, ou transição sem elegibilidade. | Proposta, Reserva, Estoque/Mapa e carteira de exceções. | Bloquear comando; abrir caso com owner e evidência. |
| **Alta** | Reserva vencida, extensão fora de política, condição/tabela expirada, dossiê essencial pendente. | Lista de reservas e detalhe do lote/proposta. | Revisar, solicitar alçada ou encerrar/tratar reserva. |
| **Atenção** | Prazo próximo, documento perto de expirar, assinatura pendente ou alteração de condição. | Painel comercial e detalhe da proposta. | Executar próxima ação antes do vencimento. |
| **Informativa** | Reserva convertida, cancelada ou liberada após validação. | Linha do tempo, lote e contrato realizado. | Consultar trilha sem ação automática. |

### 6.3 Critérios de prova para implementação futura

| Cenário de falha | Prova exigida |
| --- | --- |
| Dois comandos simultâneos para reservar o mesmo lote. | Teste transacional prova que apenas uma reserva ativa sobrevive e que a outra recebe erro de negócio seguro. |
| Retry após timeout do cliente. | Chave de idempotência devolve o mesmo resultado, sem nova reserva/alerta/linha de auditoria indevida. |
| Reserva vencida com contrato pendente. | Reavaliação mantém lote não elegível e abre caso; não libera pela data isolada. |
| Revogação de alçada durante tentativa de extensão. | Política no servidor/banco nega extensão, mesmo que a tela estivesse aberta. |
| Alteração manual de URL/payload de lote. | Serviço/policy nega o objeto fora de escopo e não confirma a existência de outra reserva. |

## Referências internas

[1] [Clientes Loteadora: ficha e dossiê](crm_clientes_loteadora_ficha_dossie.md)

[2] [Estoque de contratos realizados e alertas](crm_loteadora_estoque_contratos_realizados_alertas.md)

[3] [Arquitetura de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)

[4] [Matriz de auditoria final da Loteadora](loteadora_matriz_auditoria_final_setores.md)
