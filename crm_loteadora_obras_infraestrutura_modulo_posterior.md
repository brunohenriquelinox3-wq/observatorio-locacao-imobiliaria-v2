# Loteadora: Obras e Infraestrutura como módulo posterior

**Status:** `decisão_aprovada_para_estratégia`  
**Decisão LOT-A06:** **Obras e Infraestrutura será um módulo posterior.** A fundação da Loteadora preservará marcos, evidências, owners e restrições que sejam relevantes para empreendimento, fase, quadra, lote, contrato e comunicação comercial, sem iniciar uma operação de engenharia/obra prematuramente.

> **Princípio:** informação técnica relevante pode restringir ou contextualizar a operação comercial; ela não libera venda, altera o estoque, confirma entrega, substitui laudo ou cria obrigação financeira por si só.

## 1. O que permanece na fundação da Loteadora

| Objeto mínimo | Registro necessário agora | Ligação permitida | Limite explícito |
| --- | --- | --- | --- |
| **Marco técnico/infraestrutura** | Tipo, empreendimento/fase/quadra/lote afetado, estado declarado, data de referência, owner técnico, origem e evidência. | Pode ser exibido no Cadastro de Loteamentos, Estoque/Mapa, painel e alerta contextual. | Não é cronograma detalhado, medição, ordem de serviço ou aceite automático. |
| **Evidência de obra/infraestrutura** | Documento, foto, laudo, ata, comunicação, emissor, versão, validade operacional, acesso e revisão. | Pode apoiar contexto e análise de restrição. | Anexo não certifica conclusão, conformidade, entrega ou regularidade. |
| **Restrição técnica/comercial** | Motivo, escopo, vigência, impacto declarado, policy/alçada de criação e liberação, owner e correlação. | Pode tornar lote/fase não elegível ou exigir revisão na proposta/reserva. | Não altera o estado do lote sem transição comercial/jurídica/financeira aplicável. |
| **Alerta de marco** | Prioridade, condição, data de referência, responsável e próxima ação. | Painel Loteadora, Estoque/Mapa e Vendas/Contratos podem mostrar o alerta no objeto afetado. | Não substitui gestão de obra, notificação legal ou comunicação automática ao comprador. |
| **Histórico de impacto** | Antes/depois, evidência, ator, alçada e motivo da criação/alteração/remoção de restrição. | Explica por que uma venda/reserva foi bloqueada ou analisada. | Não reescreve o histórico de contrato, carteira ou estoque. |

## 2. Estados mínimos para leitura de marcos

| Estado | Leitura operacional | O que pode acontecer |
| --- | --- | --- |
| **Planejado/declarado** | Informação de referência ainda não confirmada por revisão aplicável. | Exibir com data/origem; não gerar elegibilidade. |
| **Em acompanhamento** | Marco possui evidência/owner, mas ainda requer atualização ou validação. | Abrir alerta contextual e próxima ação. |
| **Evidenciado em revisão** | Material foi anexado e aguarda análise competente. | Manter estado explícito; não liberar lote. |
| **Restrição ativa** | Há fato/política que exige bloqueio ou análise da operação afetada. | Propagar alerta ao estoque/proposta, por policy e escopo. |
| **Sem impacto comercial declarado** | Marco existe para contexto, sem restrição ativa informada. | Mostrar como informação, sem alterar a disponibilidade. |
| **Encerrado/revisado** | Owner competente registrou conclusão/revisão para a finalidade definida. | Reavaliar a restrição por transição auditada; não presumir entrega/registro. |

## 3. Conexões preservadas entre setores

| De | Para | Resultado correto |
| --- | --- | --- |
| Cadastro de Loteamentos | Estoque/Mapa de Lotes | Marco/restrição referencia o mesmo empreendimento/fase/quadra/lote, sem duplicar ativo. |
| Marco/restrição técnica | Estoque/Mapa | Estoque pode exibir impedimento/alerta e exigir reavaliação de elegibilidade. |
| Estoque/Mapa | Propostas, Reservas e Contratos | Proposta/reserva consulta a restrição vigente; transição de lote continua transacional e auditada. |
| Marco/restrição técnica | Painel Loteadora | Painel mostra prioridade, owner, data de referência e objetos afetados. |
| Marco técnico | Financeiro/Repasses | Sem efeito automático; qualquer impacto contratual/financeiro é caso próprio, documentado e aprovado. |

## 4. Critérios de aceite da fundação

| Cenário | Deve permitir | Deve impedir |
| --- | --- | --- |
| Fase possui evidência técnica ainda em revisão. | Registrar origem, owner, estado, data e objetos afetados. | Mostrar obra concluída, lote liberado ou entrega confirmada. |
| Restrição técnica impacta `Q12 · L1`. | Alertar Estoque/Mapa e bloquear/analisar proposta/reserva conforme policy. | Vender/reservar sem a reavaliação exigida ou apagar o motivo. |
| Owner revisa uma evidência e remove restrição. | Criar fato de revisão, preservando a restrição anterior e disparando reavaliação comercial. | Tornar lote disponível por edição direta, ignorando outras condições. |
| Usuário consulta o painel. | Ver apenas marcos/alertas próprios do seu escopo e nível de detalhe permitido. | Expor laudos, evidências restritas ou cronogramas internos para parceiros/compradores. |

## 5. Escopo futuro do módulo de Obras e Infraestrutura

Quando ativado por decisão posterior, o módulo terá um domínio próprio. Ele não deve ser construído como uma coleção de campos no Cadastro de Loteamentos ou como um atalho para alterar estoque e contratos.

| Capacidade futura | Objeto/registro esperado | Integração necessária | Não deve fazer por inferência |
| --- | --- | --- | --- |
| **Planejamento e baseline** | Programa, fases, pacotes de trabalho, marcos, dependências, baseline, versões e responsáveis. | Empreendimento/fase, calendário corporativo e documentos técnicos controlados. | Tratar cronograma declarado como data garantida de entrega. |
| **Execução e medição** | Diário, avanço físico, medição, evidência, desvio, causa e aceite competente. | Equipe/fornecedor, pacote de trabalho, evidência e owner técnico. | Converter foto/relato em percentual físico ou aceite automático. |
| **Riscos, pendências e mudanças** | Risco, impacto, decisão, change order, alçada, versão e plano de resposta. | Empreendimento, orçamento, restrição comercial e audit trail. | Alterar preço, contrato de cliente, elegibilidade ou carteira sem processo próprio. |
| **Custos e compromissos de obra** | Orçamento, compromisso, fornecedor, medição, aprovação, documento e exportação. | Financeiro/subledger, contas a pagar, controladoria e fiscal/contábil. | Criar pagamento, apropriação ou reconhecimento contábil por marco técnico isolado. |
| **Entregas e comunicações** | Marco verificável, público/segmento, conteúdo aprovado e referência de evidência. | Jurídico, atendimento, contrato e política de comunicação. | Prometer entrega, liberar posse ou notificar comprador sem aprovação aplicável. |
| **Análises e painéis** | Previsto/observado, marcos críticos, desvios, riscos, restrições e `as_of`. | Camada de leitura/linhagem e escopo de acesso. | Ocultar incerteza ou misturar métrica física, financeira e comercial. |

## 6. Gates para ativação posterior

| Gate | Deve estar demonstrado | Bloqueia |
| --- | --- | --- |
| **G-OBR-01: necessidade e owner** | Caso de uso prioritário, responsáveis técnicos, owner de dados, stakeholder comercial/financeiro e indicador de sucesso definidos. | Construir “obra” genérica sem operação que a sustente. |
| **G-OBR-02: vocabulário e evidência** | Estados, marcos, baseline, revisão, tipo de evidência, acesso, retenção e correlação documentados. | Misturar planejado, observado, entregue e regularizado em um único status. |
| **G-OBR-03: impacto transacional** | Matriz explica quando uma restrição pode afetar estoque, proposta, contrato, financeiro e comunicação, com alçadas. | Marco técnico atualizar diretamente lote, carteira, repasse ou obrigação do cliente. |
| **G-OBR-04: controle financeiro** | Integração com orçamento/compromissos/contas a pagar/subledger possui natureza, aprovação, conciliação e owner contábil. | Despesa/medição virar pagamento ou escrituração automática. |
| **G-OBR-05: segurança e continuidade** | Policies, permissões de fornecedor/equipe, evidência privada, auditoria, incidentes e testes permitir/negar estão aprovados. | Expor laudos, contratos de fornecedor, cronogramas internos ou documentos técnicos fora do escopo. |
| **G-OBR-06: operação e rollout** | Piloto delimitado, migração, treinamento, suporte, observabilidade e plano de reversão foram validados. | Ativar para toda a organização sem controle de qualidade e correção. |

## 7. Limite da decisão atual

Não foram criados módulo, telas, workflow, medição, orçamento, fornecedor, cronograma ativo, alerta automático, integração de engenharia, contas a pagar de obra, evento financeiro, migration ou dados de obra. O status de módulo posterior evita que essa frente adie a fundação comercial, contratual, financeira, de carteira e de repasses já priorizada.

## Referências internas

[1] [Cadastro e Estoque de Loteadora](crm_loteadora_recebiveis_distribuicao.md)

[2] [Propostas, Reservas e Contratos](crm_loteadora_propostas_reservas_contratos.md)

[3] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)
