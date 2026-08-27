# Governança, migração, qualidade e recuperação de dados — Vendas Urbanas e Locação

**Status:** `estratégia_documental_2026-08-27`  
**Escopo:** Vendas Urbanas e Locação. Este caderno especifica princípios e provas para futuras importações, sincronizações, correções, migrações e recuperações; não executa qualquer leitura, importação, exportação, exclusão, alteração ou sincronização de dados. [1] [2]

## 1. Recomendação estratégica

> **Recomendação:** toda entrada externa deve passar por um ciclo separado de descoberta, staging, validação, mapeamento, deduplicação assistida, simulação, aprovação, aplicação idempotente, reconciliação e observabilidade. O dado de origem deve permanecer rastreável e a correção não pode sobrescrever silenciosamente um fato, documento, contrato, obrigação ou decisão já aceita.

A experiência de “migração” e “sincronização” encontrada na referência reforça a importância de prever esses caminhos desde a estratégia. Contudo, a referência não demonstrou um fluxo completo com provas suficientes; por isso, o requisito abaixo define segurança e qualidade próprias, em vez de reproduzir qualquer comportamento presumido. [3]

## 2. Classificação e responsabilidade do dado

| Classe de dado | Exemplos de domínio | Owner de negócio | Regra de qualidade | Limite de acesso/uso |
| --- | --- | --- | --- | --- |
| Identidade e relacionamento | Party, papel, representação, contato e vínculo temporal. | Responsável pela relação/atendimento. | Identidade estável, papel datado, evidência de representação e status de revisão. | Finalidade definida; busca protegida e retorno mínimo. |
| Ativo e disponibilidade | Imóvel, empreendimento, unidade, atributo, chave, mídia e condição comercial. | Gestor do ativo/captação/administração. | Fonte, data, vigência, titularidade/administração e disponibilidade explicáveis. | Campos confidenciais por policy de campo e propósito. |
| Contratual | Proposta, contrato, aditivo, rescisão, cláusula, regra e assinatura. | Área contratual/gestor designado. | Versão, validade, signatário, evidência e cronologia preservadas. | Não editar documento aceito sem ato/versionamento próprio. |
| Financeiro | Obrigação, instrução, retorno, aplicação, conciliação, direito e liquidação. | Financeiro autorizado. | Estado/correlação, competência, moeda, regra, evidência e reconciliação. | Segregação de deveres e retenção reforçada; sem inferência por card. |
| Operacional | Visita, tarefa, serviço, vistoria, sinistro, agenda e ocorrência. | Owner do caso. | Objeto, prazo, responsável, estado, evidência e motivo de alteração. | Acesso pelo objeto/caso e finalidade; não deriva efeito material. |
| Analítico | Métrica, coorte, score, recomendação, segmento e alerta. | Owner da métrica/produto. | Fórmula/fatores, fonte, período, `as_of`, versão, limitação e revisão. | Não reutilizar para decisão fora da finalidade; acesso agregado/minimizado. |

## 3. Dados canônicos e fronteiras de migração

| Domínio | Registro canônico futuro | Pode ser importado/mapeado | Não pode ser presumido na migração |
| --- | --- | --- | --- |
| Partes | `Party` e relação temporal por papel. | Identificadores internos de origem, contato permitido, atributos declarados, vínculos e evidência referenciada. | Titularidade, representação válida, consentimento, elegibilidade ou perfil econômico por mera existência de linha. |
| Imóveis | Ativo, endereço/território, unidade, status composto e relações. | Atributos técnicos, origem, relações declaradas, mídias/dossiês referenciados e situação informada. | Disponibilidade, autorização de anúncio, preço vigente, chave/acesso ou administração ativa. |
| Vendas Urbanas | Lead, oportunidade, visita, proposta, contrato e atividade. | Eventos históricos com data/origem, estágio declarado, owner de origem e notas classificadas. | SLA, temperatura, prioridade, aceite de proposta, assinatura ou comissão elegível. |
| Locação | Administração, candidatura, garantia, contrato, obrigação, caso e portal. | Instrumentos/obrigações declarados, vigências, estados de origem, documentos e casos históricos classificados. | Garantia aprovada, recebimento, conciliação, repasse, inadimplência, culpa ou cobertura. |
| Financeiro | Fatos de obrigação, retorno, aplicação, dedução, direito e liquidação. | Saldos/fatos com competência, origem, correlação, estado informado e evidência disponível. | Caixa conciliado, pagamento válido, direito liberado ou liquidação apenas porque uma coluna diz “pago”. |

## 4. Pipeline seguro de ingestão e migração

| Etapa | Resultado esperado | Controle obrigatório | Falha segura |
| --- | --- | --- | --- |
| Descoberta | Inventário da fonte, entidade, volume, período, dono, qualidade e finalidade. | Contrato de fonte, classificação, autorização e retenção. | Não conectar/ler fonte sem escopo e owner. |
| Staging isolado | Cópia de trabalho segregada do domínio operacional. | Criptografia, acesso mínimo, expiração, correlação e proibição de efeito material. | Erro não chega ao dado canônico; staging pode expirar/ser descartado segundo policy. |
| Profiling | Cobertura, formato, chaves, nulos, duplicidade, conflitos e anomalias observáveis. | Relatório agregado, sem expor registros desnecessários. | Classificar “incompleto/desconhecido”, não inventar valor padrão. |
| Mapeamento | Campo de origem ligado a atributo canônico e transformação versionada. | Dicionário de dados, owner, tipo, finalidade, regra e perda conhecida. | Campo sem destino fica em quarentena; não é descartado silenciosamente. |
| Deduplicação | Candidatos a mesma entidade apresentados com evidência/fatores. | Regras explicáveis, limiares, revisão humana e não destrutividade. | Ambiguidade cria caso de revisão; não funde automaticamente. |
| Simulação | Resultado previsto por entidade, conflito, criação, atualização e rejeição. | Preview, contagem, amostra mínima, logs e critérios de aceite. | Sem confirmação/aprovação, não há aplicação. |
| Aplicação | Escrita idempotente, transacional quando cabível e correlacionada. | Alçada, lote, chave idempotente, rate limit, rollback/compensação e auditoria. | Lote falho é isolado; não repete efeito já confirmado. |
| Reconciliação | Comparação entre origem, staging, objeto canônico e resultado de lote. | Totais, contagens, estados, exceções e owner de divergência. | Divergência bloqueia dependências; não é mascarada como sucesso. |
| Encerramento | Decisão de reter, depurar, reprocessar ou arquivar com trilha. | Relatório, aceite, limitações, política de retenção e revisão pós-migração. | Sem reconciliação/aceite, lote permanece pendente/segregado. |

## 5. Deduplicação, resolução e sobrevivência

O objetivo da deduplicação é reduzir cadastros duplicados sem apagar contexto. Uma correspondência provável nunca deve substituir uma prova de identidade, de representação ou de relacionamento.

| Situação | Regra estratégica | Evidência/ação futura |
| --- | --- | --- |
| Coincidência forte de identificador permitido | Criar candidato de vínculo, não mesclagem irreversível automática. | Regra, origem, confidência e aprovação ficam auditáveis. |
| Contato semelhante em múltiplas partes | Tratar como ambiguidade; contato não é identidade exclusiva. | Caso de revisão com acesso mínimo e política de busca. |
| Parte antiga + registro novo | Preservar ambos até decisão humana sobre relação/temporalidade. | Atualização cria nova versão ou vínculo, não apaga origem. |
| Imóvel semelhante | Usar combinação de atributos sem expor localização completa a quem não tem finalidade. | Quarentena e owner de conflito; não unir automaticamente. |
| Contrato/obrigação com chave de origem repetida | Bloquear duplicidade e investigar correlação/estado antes de aplicação. | Lote registra chave idempotente, origem e exceção. |
| Documento repetido | Deduplicar conteúdo/arquivo tecnicamente quando permitido, mantendo referências, versões e policies separadas. | Não ampliar acesso porque duas referências apontam ao mesmo binário. |

## 6. Regras específicas por coluna

### 6.1 Vendas Urbanas

| Área | Recomendação de qualidade/migração | Prova futura |
| --- | --- | --- |
| Leads e clientes | Migrar origem, cronologia e status declarados; recalcular SLA/prioridade apenas sob regra nova e auditável. | A carteira mostra origem do dado e diferencia estágio importado de transição realizada no sistema. |
| Proprietários e captação | Migrar relação declarada como “em revisão” quando não houver evidência suficiente de titularidade/poder. | Anúncio/captação não é liberado por registro migrado sem gate de autorização. |
| Imóveis/empreendimentos | Mapear atributos e hierarquia preservando origem; tratar disponibilidade/preço como dado com data/validação própria. | Alteração de catálogo não publica, vende ou altera autorização. |
| Visitas/propostas | Conservar fatos históricos e versões; não inferir participantes, aceite, alçada ou assinatura ausentes. | Fluxo exibe lacuna e permite revisão sem reescrever o histórico importado. |
| Comissões | Migrar declarações e regras com versão/origem; recalcular elegibilidade na nova base somente após reconciliação aprovada. | Direito importado permanece separado de instrução/settlement e pode ser bloqueado. |

### 6.2 Locação

| Área | Recomendação de qualidade/migração | Prova futura |
| --- | --- | --- |
| Administração/ativo | Preservar relação, vigência e fontes; não confundir proprietário histórico com administrador vigente. | Encerramento/renovação é uma decisão própria e auditável. |
| Locatários/garantias | Importar dados mínimos autorizados e classificar documentos/estado como recebidos ou em revisão. | Garantia não é marcada aprovada pela migração e não libera contrato. |
| Contratos/aditivos | Tratar cada instrumento como versão/fato datado com origem e completude. | Cláusulas não mapeadas viram pendências, não defaults invisíveis. |
| Carteira/cobrança | Reconstruir obrigações por competência e correlacionar retornos quando evidência permitir. | Estado financeiro importado é distinguido de caixa conciliado no novo ambiente. |
| Serviços/vistorias/sinistros | Importar cronologia/evidências classificadas, mas preservar alegações e decisões como não concluídas quando aplicável. | Caso não gera cobrança, pagamento, culpa ou indenização automática. |
| Repasses | Migrar histórico e regras com origem; bloquear novos direitos/instruções até conciliação e aprovação. | Prestação de contas aponta claramente fatos verificados e pendências. |

## 7. Exceções, correções e recuperação

| Evento | Estado seguro | Conduta estratégica |
| --- | --- | --- |
| Arquivo/fonte incompatível | `rejeitado_com_motivo` | Não tentar “adivinhar” mapeamento; devolver diagnóstico agregado e contrato esperado. |
| Linha incompleta | `quarentena` | Preservar origem, motivo, owner e opção de correção/reprocessamento controlado. |
| Duplicidade ambígua | `revisão_de_identidade` | Não mesclar nem apagar; mostrar fatores permitidos e registrar decisão. |
| Lote parcialmente aplicado | `aplicação_parcial_com_correlação` | Isolar itens, impedir reenvio cego, reconciliar e compensar somente por procedimento aprovado. |
| Transformação equivocada | `incidente_de_qualidade` | Suspender regra, identificar lotes afetados, restaurar/compensar por eventos e preservar logs. |
| Dado de origem alterado após carga | `divergência_de_origem` | Avaliar sincronização incremental por chave/versão; nunca sobrescrever decisão local sem policy. |
| Exclusão solicitada | `retenção_em_revisão` | Avaliar base legal/contratual, dependências e arquivo; não apagar fato financeiro/contratual sem política. |

## 8. Gates de ativação futura

| Gate | Pergunta de aprovação | Evidência mínima |
| --- | --- | --- |
| Fonte e finalidade | A fonte é autorizada, necessária e classificada? | Contrato de fonte, owner, base/finalidade, escopo e retenção. |
| Modelo/dicionário | Cada campo tem destino, transformação, perda, política e dono? | Mapa versionado e revisão de domínio/segurança. |
| Staging/segregação | O material fica isolado de produção e expira conforme policy? | Teste de acesso negado, logs e plano de descarte. |
| Simulação/preview | O efeito previsto e as exceções são compreensíveis antes da escrita? | Relatório de lote, contagens, amostra segura e critérios de aceite. |
| Idempotência/recuperação | Repetição, falha e parcialidade são seguras? | Testes de reenvio, timeout, duplicidade, rollback/compensação e correlação. |
| Reconciliação | Origem, lote e canônico fecham dentro da tolerância aprovada? | Relatório assinado pelo owner, divergências e decisão documentada. |
| Operação contínua | A sincronização tem contrato, monitoramento, rate limit, fila de exceção e desligamento? | Alertas, runbook, dono de incidente e simulação de falha. |

## 9. Indicadores de qualidade de dados

| Indicador | Definição/documentação obrigatória | Uso permitido |
| --- | --- | --- |
| Cobertura | Proporção de atributos necessários presentes por finalidade/etapa. | Identificar pendência e priorizar correção, sem penalizar automaticamente uma parte. |
| Validade | Conformidade de formato, vigência, tipo, origem e regra aplicável. | Abrir revisão; não declarar documento, garantia ou contrato aprovado por formato válido. |
| Unicidade | Candidatos/duplicidades confirmadas e pendentes por domínio. | Direcionar revisão humana e medir qualidade de origem. |
| Consistência | Regras entre objetos, estados e temporalidade preservadas. | Bloquear consequência dependente até corrigir divergência. |
| Atualidade | Idade do dado, data de origem, data de leitura e `as_of`. | Indicar frescor/limitação da leitura. |
| Rastreabilidade | Parcela de atributos/eventos com fonte, transformação, owner e versão. | Determinar se o dado pode sustentar operação, métrica ou auditoria. |
| Recuperabilidade | Tempo/qualidade para identificar, conter e recompor uma falha. | Avaliar prontidão de migração/sincronização antes de escalar. |

## Referências internas

[1] [Matriz mestre estratégica — Vendas Urbanas e Locação](matriz_mestre_estrategica_vendas_locacao.md)

[2] [Fundação compartilhada — Vendas Urbanas e Locação](caderno_fundacao_compartilhada_vendas_locacao.md)

[3] [Registro de auditoria por controle](registro_auditoria_por_controle_v2.md)

[4] [Estratégia financeira — Vendas Urbanas e Locação](caderno_financeiro_vendas_urbanas_locacao.md)
