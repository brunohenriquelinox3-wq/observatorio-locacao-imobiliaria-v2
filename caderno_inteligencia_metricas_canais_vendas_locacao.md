# Inteligência, métricas, automação e canais — Vendas Urbanas e Locação

**Status:** `estratégia_documental_2026-08-27`  
**Escopo:** exclusivamente Vendas Urbanas e Locação. Este caderno define capacidades futuras de leitura, recomendação, alerta, comunicação, publicação e integração; não ativa modelos, campanhas, sincronizações, portais, mensagens, anúncios ou quaisquer ações externas. [1] [2]

## 1. Recomendação estratégica

> **Recomendação:** iniciar inteligência como leitura explicável e fila de trabalho, não como automação que altera dados ou toma decisões em nome da equipe. O sistema pode sinalizar prioridade, risco, prazo, falta de evidência e possível próximo passo; a pessoa responsável confirma, ajusta, rejeita ou solicita revisão. Toda ação externa — distribuição, mensagem, publicação, sincronização, cobrança ou repasse — permanece separada, aprovada e rastreável.

Essa decisão aproveita o aprendizado da referência: listas, pipeline, saúde, propensão, origem/ROI, campanhas, segmentação, sincronização e roleta indicam necessidades reais de organização comercial. O produto próprio deve superar a opacidade comum desses recursos registrando fatores, dados usados, versão, confiança, owner, limite de escopo e possibilidade de desligamento. [3] [4]

| Nível de capacidade | Pode fazer | Não pode fazer sem gate superior |
| --- | --- | --- |
| Leitura descritiva | Mostrar fatos, séries, filas, vencimentos, pendências e métricas com origem. | Inferir intenção, mudar estado, enviar mensagem ou publicar. |
| Diagnóstico explicável | Sugerir causa possível com fatores e evidência acessível. | Declarar certeza, responsabilizar parte ou modificar um registro. |
| Recomendação humana | Sugerir próxima ação, prioridade, segmento ou revisão com botão de aceitação. | Atribuir pessoa, disparar campanha, ajustar preço, cobrar ou liberar operação. |
| Automação assistida | Executar tarefa de baixo risco após política, preview e regras aprovadas. | Executar ato financeiro, jurídico, publicitário ou de acesso sem alçada. |
| Automação de efeito material | Nunca é padrão; exige decisão específica, contrato operacional, monitoramento e rollback. | Confundir comando com confirmação de resultado externo. |

## 2. Contrato de métrica e sinal

Uma métrica, score, alerta ou recomendação não existe somente para “colorir” a tela. Cada elemento precisa responder como foi calculado, de quais fatos veio, em que corte temporal, para quem é visível e qual decisão pode apoiar.

| Campo do contrato | Regra documental |
| --- | --- |
| Nome e intenção | Declara a pergunta operacional que a leitura responde, evitando indicador decorativo. |
| Fórmula/fatores | Informa cálculo, filtros, pesos, valores ausentes, regra de arredondamento e versão. |
| Fonte e linhagem | Aponta fatos/objetos permitidos, não apenas uma tabela ou card agregado. |
| Escopo | Explicita organização, módulo, unidade/equipe, carteira, objeto e policy aplicada. |
| Tempo | Informa período, coorte quando houver, `as_of`, frescor, janela de cálculo e atraso conhecido. |
| Estado da informação | Distingue previsto, declarado, recebido, calculado, conciliado, divergente, expirado e indisponível. |
| Público e finalidade | Define quem pode ler, exportar, compartilhar ou agir a partir do sinal. |
| Ação permitida | Define se o sinal só informa, recomenda, cria tarefa, pede aprovação ou pode disparar fluxo assistido. |
| Limitação | Declara viés conhecido, cobertura insuficiente, atraso, dado ausente e proibição de uso decisório. |
| Revisão | Define owner, periodicidade, condição de reavaliação, desativação e trilha de mudanças. |

> **Regra:** nenhum score pode ser apresentado como verdade sobre uma pessoa. Ele é uma hipótese operacional, limitada ao seu contexto, sujeita a revisão humana e sem efeito automático sobre crédito, garantia, contratação, cobrança, acesso, preço ou responsabilização.

## 3. Vendas Urbanas — leituras, filas e recomendações

### 3.1 Painel de operação comercial

| Leitura/fila | Pergunta que responde | Fatos de entrada permitidos | Próximo passo humano |
| --- | --- | --- | --- |
| Saúde do funil | Onde há acúmulo, atraso, perda de SLA ou queda de conversão por coorte? | Eventos de entrada, fase, owner, próxima ação, prazo e motivo padronizado. | Revisar capacidade, etapa, regra ou carteira; não redistribuir automaticamente. |
| Prioridade de atendimento | Quais itens têm prazo, próxima ação ou sinal de interesse a revisar primeiro? | Tempo desde interação, janela declarada, resposta consentida, estágio, SLA e pendência. | Confirmar prioridade, registrar contato/atividade ou dispensar sugestão com motivo. |
| Qualidade de oportunidade | Quais propostas/visitas precisam de documento, responsável, prazo ou decisão? | Estado de dossiê, agenda, proposta, ativo, autorização e owner. | Abrir checklist/atividade; não alterar elegibilidade ou aprovação de forma automática. |
| Eficiência de origem | Quais fontes geram eventos qualificados/conversões por período/coorte? | Origem registrada, eventos, estágio, proposta/contrato e custos somente quando autorizados. | Revisar mix, atribuição e hipótese; não concluir causalidade a partir de um card. |
| Rejeição/perda | Quais motivos padronizados aparecem por etapa/origem/perfil de busca? | Motivo registrado, fase, tempo, categoria e data. | Revisar taxonomia, oferta, processo ou qualidade de dados; nunca classificar pessoa automaticamente. |
| Cobertura de carteira | Quem está sem próxima ação, com SLA vencido ou com dependência externa? | Owner, próxima ação, prazo, estado de bloqueio e dado de ausência. | Repriorizar manualmente, criar tarefa ou ajustar capacidade mediante alçada. |

### 3.2 Score de prioridade explicável

O produto pode calcular um sinal de priorização desde que seja transparente, proporcional e não discriminatório. A recomendação é iniciar com regras configuráveis e auditáveis antes de qualquer modelo estatístico ou generativo.

| Fator permitido como hipótese | Uso recomendado | Limite |
| --- | --- | --- |
| Próxima ação vencida | Sinalizar necessidade de retorno ou revisão de owner. | Não presumir desinteresse, incapacidade ou responsabilidade individual. |
| Janela de compra declarada | Priorizar atividade quando a própria parte informou urgência. | Expira/requer confirmação; não é fato permanente. |
| Compatibilidade de busca e ativo | Sugerir candidatos por critérios escolhidos/explicáveis. | Não oculta ativos elegíveis nem força distribuição. |
| Completude de etapa | Indicar falta de informações/evidências exigidas para decisão. | Não confunde cadastro completo com aprovação ou qualidade da pessoa. |
| Histórico consentido de interação | Indicar falta de retorno e preferência de canal. | Respeita opt-out, finalidade, retenção e não usa conteúdo sensível. |

| Fator proibido sem hipótese e validação reforçadas | Motivo |
| --- | --- |
| Atributo sensível, proxy territorial/social ou conteúdo subjetivo | Pode produzir discriminação, explicação falsa ou uso inadequado. |
| Dados de documentos, renda ou garantia fora da finalidade | Aumenta exposição e não é necessário para priorização comercial inicial. |
| Ausência de informação como sinal negativo automático | Penaliza quem ainda não foi atendido/coletado corretamente. |
| Dado de outro módulo, tenant ou portal | Viola escopo e pode descontextualizar a decisão. |

### 3.3 Segmentação, campanhas e distribuição

| Capacidade futura | Decisão estratégica | Gate obrigatório |
| --- | --- | --- |
| Segmentação | Segmento é uma definição versionada de critérios e escopo, com preview de contagem agregada. | Não exibir/usar membros sem policy e finalidade; critérios sensíveis exigem revisão. |
| Campanha | Campanha nasce como rascunho com público elegível, mensagem, canal, limite e preview. | Aprovação, consentimento/preferência, deduplicação, outbox, rate limit e cancelamento. |
| Roleta/distribuição | Distribuição é recomendação/atribuição governada por capacidade, território, regra e fairness auditável. | Não redistribuir caso ativo sem política, motivo, trilha e proteção contra concentração. |
| Migração de carteira | Fluxo de simulação mostra origem, destino, escopo, conflito e reversão antes do comando. | Alçada, idempotência, confirmação contextual, auditoria e operação de compensação. |
| Sincronização | Entrada/saída externa usa contrato, mapeamento, versionamento, correlação e fila de exceção. | Autenticação, escopo, consentimento, deduplicação, retry seguro e monitoramento. |
| Publicação de imóvel | Anúncio é uma versão de conteúdo vinculada a autorização vigente, canal e ativo. | Preview, campos permitidos, mídia revisada, confirmação, estado externo e retirada rastreável. |

## 4. Locação — leituras, alertas e portais

### 4.1 Painel de administração e carteira

| Leitura/fila | Pergunta que responde | Fatos de entrada permitidos | Próximo passo humano |
| --- | --- | --- |
| Saúde da administração | Quais ativos/contratos de administração têm prazo, documento, autorização ou pendência próxima? | Vínculo de administração, vigência, pendência, owner, evidência e estado do ativo. | Revisar pendência, criar tarefa ou escalar conforme contrato. |
| Prontidão para locar | Quais imóveis estão disponíveis, bloqueados, em preparação, vistoria ou serviço? | Disponibilidade composta, caso de serviço, vistoria, autorização e owner. | Resolver bloqueio/documento; não publicar/locar automaticamente. |
| Carteira e vencimentos | Quais obrigações estão próximas do vencimento, abertas, em análise ou divergência? | Obrigação, competência, vencimento, instrução, retorno, aplicação e conciliação. | Priorizar análise/cobrança autorizada, sem chamar vencimento de inadimplência automática. |
| Garantia e contrato | Quais contratos têm garantia/prazo/aditivo em revisão ou próximos de expirar? | Vigência, estado de garantia, dossiê, contrato e decisão. | Solicitar/revisar evidência segundo finalidade e alçada. |
| Serviços e vistorias | Quais casos têm SLA, orçamento, autorização, execução ou evidência pendente? | Caso, tipo, ativo, prazo, owner, orçamento/decisão e estado. | Repriorizar/escalar; não pagar, responsabilizar ou cobrar automaticamente. |
| Renovação e saída | Quais contratos se aproximam de janela de renovação, rescisão, entrega ou apuração final? | Vigência, regra, comunicação autorizada, vistoria e obrigações. | Preparar tarefa/proposta; não renovar/rescindir por previsão. |

### 4.2 Alertas com severidade e ação

| Alerta | Severidade sugerida | Dono | Ação inicial permitida | Não faz automaticamente |
| --- | --- | --- | --- | --- |
| Obrigação vencida sem aplicação conciliada | Alta, conforme política e valor/idade | Financeiro autorizado | Abrir fila de análise/cobrança permitida. | Negativar, protestar, encerrar contrato ou bloquear portal. |
| Garantia perto do vencimento | Média/alta conforme contrato | Gestor de locação | Criar tarefa de revisão e sinalizar prazo. | Rejeitar garantia, rescindir contrato ou expor informação sensível. |
| Administração próxima do fim | Média | Gestor de imóvel | Revisar renovação/encaminhamento e autorização. | Retirar anúncio, transferir imóvel ou cortar acesso do proprietário. |
| Serviço sem owner/SLA | Média | Coordenação de serviços | Criar tarefa/escalonamento interno. | Aprovar orçamento, atribuir pagador ou pagar prestador. |
| Divergência de retorno | Alta | Financeiro/conciliação | Bloquear consequência dependente e abrir caso. | Baixar carteira, devolver valor ou repassar proprietário. |
| Vistoria/sinistro sem evidência | Média | Gestor do caso | Solicitar revisão/insumo conforme policy. | Definir culpa, cobertura, indenização ou cobrança. |

### 4.3 Portais e comunicação

Portais são produtos de finalidade limitada, não uma cópia da tela interna. O portal de cliente ou proprietário deve explicar o que está sendo exibido, de qual contrato/ativo vem o dado, de quando é a informação e o que a pessoa pode efetivamente fazer. O acesso nasce de grant por objeto/finalidade/vigência e pode expirar, ser revogado ou ser restrito sem expor outros dados.

| Portal/canal | Leitura ou ação futura permitida | Gate e limite |
| --- | --- | --- |
| Cliente/locatário | Contrato/documentos autorizados, obrigações e instruções pertinentes, solicitações e histórico permitido. | Grant válido, MFA/step-up proporcional, dados mínimos e acesso auditado. |
| Proprietário | Imóvel, administração, prestação de contas, casos e documentos do escopo autorizado. | Não mostrar outros ativos, dados de terceiros, notas internas ou direito ainda não elegível. |
| Prestador | Casos/ordens que lhe foram atribuídos, escopo de serviço e evidência necessária. | Não mostrar dados de contrato, carteira, pagamento ou contatos além do necessário. |
| E-mail/mensagem | Comunicação previewada, destinada e consentida/permitida, com correlação. | Outbox, política de repetição, opt-out, rate limit, auditoria e cancelamento. |
| Publicação | Conteúdo/ativos autorizados por versão e canal. | Aprovação, preview, política de conteúdo, estado externo e retirada rastreável. |

## 5. Dados, IA e revisão humana

| Controle | Regra estratégica | Critério de aceite futuro |
| --- | --- | --- |
| Conjunto de dados | Usar somente atributos necessários, autorizados e compatíveis com a finalidade. | Amostra/teste confirma ausência de dados fora de escopo e registra versão/linhagem. |
| Explicação | Mostrar fatores, fonte, período, limitações e confiança de cada sinal. | Usuário consegue identificar por que o item entrou na fila e contestar/dispensar a sugestão. |
| Feedback humano | Aceitar, rejeitar, ajustar ou sinalizar erro sem apagar recomendação original. | Evento liga sinal, decisão humana, motivo e resultado observado. |
| Limite de autonomia | Sinal não muda fase, owner, preço, contrato, cobrança, acesso ou publicação por padrão. | Tentativa de acionar efeito material exige gate/alçada e confirma ausência de execução automática. |
| Qualidade/deriva | Comparar distribuição, cobertura, atraso e resultado por período/segmento permitido. | Mudança relevante cria revisão, versão nova ou desligamento seguro. |
| Privacidade | Não usar conteúdo de documento, atributos sensíveis ou dados externos sem necessidade/policy. | Auditoria demonstra finalidade, minimização e negação a consultas não autorizadas. |

## 6. Exceções e fila de operação

| Exceção | Estado seguro | Resposta estratégica |
| --- | --- | --- |
| Dado ausente/desatualizado | `indisponível` ou `precisa_revisão`, não “negativo”. | Indicar fonte ausente, owner e caminho de atualização. |
| Fórmula/regra alterada | Resultado anterior mantém versão e `as_of`. | Comparar versões e impedir sobrescrita silenciosa de decisão passada. |
| Integração atrasada/falha | Evento com correlação, tentativa, estado e instrução de recuperação. | Não duplicar comando, não mascarar falha como sucesso e não expor detalhes de segredo. |
| Recomendação contestada | Sinal continua auditável, mas pode ser dispensado/ajustado. | Registrar motivo e usar feedback só após governança de qualidade. |
| Conflito de policy | Ação fica bloqueada/encaminhada. | Não oferecer “atalho” administrativo nem revelar objeto não autorizado. |
| Excesso de alerta | Deduplicar, agrupar e respeitar janela/escalonamento. | Não transformar operação em ruído ou comunicação repetitiva. |

## 7. Gate de ativação futura

| Gate | Pergunta obrigatória antes de implementar/ativar |
| --- | --- |
| Questão de negócio | A leitura responde uma decisão real, com owner e ação humana definida? |
| Contrato de métrica | Fórmula/fatores, fonte, escopo, tempo, estados, limitações e revisão foram definidos? |
| Dados e policy | Os atributos são necessários, permitidos, minimizados e protegidos por escopo/finalidade? |
| Segurança | Há negação segura, segregação de deveres, logs, rate limit e proteção contra enumeração? |
| Efeito externo | Existe preview, confirmação, outbox/inbox, idempotência, correlação, retry, cancelamento e monitoramento? |
| Revisão humana | A pessoa pode entender, aceitar, corrigir, rejeitar ou suspender o comportamento? |
| Prova | Cenários de vazio, erro, atraso, duplicidade, acesso negado e reversão estão cobertos? |

## Referências internas

[1] [Estratégia atualizada — Vendas Urbanas e Locação](estrategia_vendas_urbanas_locacao_atualizada.md)

[2] [Jornadas operacionais — Vendas Urbanas e Locação](caderno_jornadas_operacionais_vendas_locacao.md)

[3] [Consolidação de Vendas Urbanas](consolidacao_vendas_urbanas_hincrivel.md)

[4] [Registro de auditoria por controle](registro_auditoria_por_controle_v2.md)
