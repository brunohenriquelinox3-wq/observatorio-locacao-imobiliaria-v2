# Estratégia financeira — Vendas Urbanas e Locação

**Status:** `estratégia_documental_2026-08-27`  
**Escopo:** apenas Vendas Urbanas e Locação. Este caderno define fronteiras, fatos, controles, exceções, indicadores e gates; não cria cobrança, pagamento, repasse, conciliação, integração, dados ou funcionalidades do CRM. [1] [2]

## 1. Recomendação central

> **Recomendação:** modelar finanças como uma cadeia de fatos independentes e correlacionados — obrigação, instrução, retorno, aplicação de caixa, conciliação, dedução, direito econômico, instrução de repasse e liquidação. Essa separação é mais segura do que um único status de “pago”, porque permite explicar o que ocorreu, reprocessar falhas sem duplicar efeito e impedir que uma ação operacional antecipe um fato financeiro.

| Alternativa | Por que não deve ser adotada | Consequência evitada |
| --- | --- | --- |
| Um campo de status financeiro por contrato | Mistura cobrança, caixa, conciliação, direito e repasse em um só estado. | Baixa indevida, saldo impreciso, estorno opaco e pagamento antecipado. |
| Regras de comissão editáveis retroativamente | Apaga o fundamento econômico da apuração e inviabiliza auditoria. | Divergência sem reconstituição, disputa e risco de pagar regra errada. |
| Repasse automático após emissão/pagamento aparente | Ignora janela de retorno, dedução, contestação, estorno, alçada e settlement. | Repasses duplicados, sem cobertura ou sem conciliação. |
| Dashboard sem fato-fonte | Transforma projeção e instrução em caixa realizado. | Gestão baseada em valores não liquidados ou sem origem verificável. |

## 2. Vocabulário financeiro obrigatório

| Objeto | Significado estratégico | Não pode ser confundido com |
| --- | --- | --- |
| Obrigação | Valor/condição devida por contrato, política ou evento, com competência e vencimento. | Boleto, cobrança enviada, pagamento ou saldo disponível. |
| Agenda | Plano temporal de obrigações, índices, marcos, parcelamentos e revisões. | Fato financeiro realizado. |
| Instrução de cobrança | Pedido/canal de cobrança enviado ou preparado para provedor. | Confirmação de recebimento. |
| Retorno externo | Informação recebida de parceiro/arquivo/canal sobre processamento. | Aplicação definitiva de caixa ou conciliação. |
| Aplicação de caixa | Alocação de valor recebido a uma ou mais obrigações conforme regra. | Liquidação bancária final, direito ou repasse. |
| Conciliação | Confirmação e tratamento de divergência entre fatos internos e externos. | Simples anexo de comprovante ou atualização manual de status. |
| Dedução | Valor que reduz base/valor disponível conforme instrumento/política versionada. | Despesa paga, direito de terceiro ou repasse confirmado. |
| Direito econômico (`entitlement`) | Apuração de valor devido a recebedor por regra, evento e base definidos. | Instrução de pagamento ou settlement. |
| Instrução de repasse | Ordem preparada/autorizada para parceiro habilitado executar. | Liquidação na conta do recebedor. |
| Liquidação (`settlement`) | Confirmação do resultado do pagamento externo, com correlação e evidência. | Projeção, autorização ou instrução emitida. |

## 3. Subledger comum às duas colunas

O subledger é a referência financeira de cada módulo; ele preserva fatos e suas relações, enquanto telas, cards e relatórios são leituras derivadas, datadas e limitadas por escopo. A estratégia não determina plano de contas ou regra fiscal de uma empresa sem validação contábil/jurídica aplicável; determina a capacidade de registrar a origem, a versão e a evidência de cada regra usada.

### 3.1 Cadeia de estados

| Camada | Estados mínimos estratégicos | Owner de negócio | Evidência mínima |
| --- | --- | --- | --- |
| Obrigação | Rascunhada, prevista, emitível, aberta, renegociada, suspensa, cancelada, encerrada. | Responsável contratual/financeiro conforme regra. | Contrato/política/evento fonte, versão, competência, vencimento e motivo. |
| Cobrança | Não solicitada, preparada, instruída, comunicada, falha, expirada, substituída, cancelada. | Financeiro/comunicação autorizada. | Correlação, canal/provedor, destinatário permitido, tentativa e retorno. |
| Caixa | Não identificado, recebido a identificar, aplicado parcialmente, aplicado, revertido, em divergência. | Financeiro autorizado. | Origem, data, valor, referência externa, regra de aplicação e aprovações. |
| Conciliação | Pendente, conciliada, divergente, em análise, ajustada, encerrada. | Financeiro/contabilidade conforme alçada. | Evidências interna/externa, decisão, owner, motivo e correlação. |
| Direito | Estimado, calculado, em revisão, bloqueado, elegível, cancelado, ajustado. | Owner econômico/alçada. | Regra versionada, evento-base, recebedor, base, teto, prioridade e bloqueio. |
| Repasse | Não instruído, aguardando aprovação, instruído, aceito, falho, liquidado, estornado, contestado. | Financeiro autorizado/parceiro. | Aprovação, instrução, correlação externa, retorno e settlement. |

### 3.2 Invariantes

| Invariante | Aplicação estratégica |
| --- | --- |
| Imutabilidade lógica | Fato confirmado não é sobrescrito; correção cria ajuste, reversão, compensação ou nova versão correlacionada. |
| Idempotência | Repetição de um comando técnico não cria nova cobrança, aplicação, direito, instrução ou liquidação. |
| Fonte e versão | Toda obrigação/dedução/direito aponta a contrato, política, regra e versão efetiva. |
| Segregação de deveres | Quem propõe/apura não é automaticamente quem aprova/instrui/liquida quando risco/alçada exigirem separação. |
| Fechamento por período | Fechar competência congela leitura e exige ajuste rastreável, não edição silenciosa do passado. |
| Escopo de organização | Fato financeiro, evidência e relatório pertencem a organização/módulo/objeto autorizados. |
| Status derivado | Card/relatório calcula status a partir de fatos; usuário não edita o resultado como campo livre. |

## 4. Vendas Urbanas — comissões e direitos econômicos

### 4.1 Regra de origem

O contrato de venda pode gerar projeções e direitos para corretor, captador, imobiliária, parceiro, gestor ou outro recebedor previsto. O produto deve registrar quem é recebedor, por qual instrumento, qual base, qual evento-gatilho, qual prioridade, qual teto, qual vigência e quais bloqueios. A existência de uma porcentagem não basta para que haja pagamento.

| Componente | Decisão estratégica | Critério de aceite futuro |
| --- | --- | --- |
| Plano de remuneração | Regra é versionada por contexto, vigência, partes, papel, ativo/empreendimento e condição comercial. | Alterar uma regra preserva apurações antigas e exige reavaliação explícita das futuras. |
| Base de cálculo | Preço, sinal, parcela, comissão fixa ou base líquida devem ser definidos com exclusões/deduções. | A apuração mostra fórmula, eventos-base, moeda/unidade, versão e arredondamento aprovado. |
| Gatilho | Direito pode depender de proposta aceita, contrato, assinatura, condição, recebimento conciliado ou marco posterior. | Tela distingue “estimado” de “elegível” e não antecipa liquidação. |
| Recebedores | Cada recebedor possui papel, dados de pagamento protegidos, vigência e instrumentação. | Trocar recebedor/percentual não altera pagamentos ou direitos passados silenciosamente. |
| Prioridade/teto | Ordem, teto, parcela, retenção e limite de exposição são dados de regra. | Apuração que excede teto ou conflita com regra fica bloqueada e auditável. |
| Aprovação e exceção | Exceção econômico-financeira exige motivo, alçada, evidência e validade. | Sem aprovação não há instrução de repasse ou status de liquidação. |

### 4.2 Ciclo de comissão

| Fase | Fato que pode ocorrer | O que ainda não pode ser concluído |
| --- | --- | --- |
| Negociação | Simulação/projeção de comissão conforme proposta. | Não é direito consolidado, despesa, dívida ou pagamento. |
| Contrato | Versão contratual aceita cria base potencial de apuração. | Não confirma recebimento do comprador ou elegibilidade de repasse. |
| Evento-gatilho | Marco contratual ou financeiro registrado conforme política. | Não substitui retorno/conciliação se a regra exigir caixa realizado. |
| Apuração | Direito é calculado com regra, base, recebedor e bloqueios. | Não é instrução de pagamento nem settlement. |
| Aprovação | Alçada libera direito elegível ou determina ajuste/bloqueio. | Não cria pagamento sem ordem/correlação externa. |
| Instrução | Ordem externa é enviada/preparada com idempotência. | Não significa que recebedor recebeu. |
| Liquidação | Retorno confirmado atualiza settlement e reconcilia. | Não altera retroativamente contrato/regra sem evento de ajuste. |

### 4.3 Exceções de Vendas Urbanas

| Cenário | Tratamento recomendado | Bloqueio obrigatório |
| --- | --- | --- |
| Distrato/cancelamento de venda | Abrir reversão ou recomposição vinculada aos fatos e regras originais. | Não apagar comissão, cobrança, instrução ou settlement anterior. |
| Comissão em parcelas | Criar agenda/direitos por evento e vencimento, sem resumir em um saldo editável. | Parcela futura não vira recebida/repasse por mudança de status. |
| Alteração de preço/condição | Versionar proposta/contrato e reavaliar somente direitos afetados. | Não recalcular direito fechado sem ajuste aprovado. |
| Divergência de recebedor | Suspender instrução, abrir caso e exigir instrumento/alçada. | Não escolher recebedor por texto livre ou papel visual. |
| Estorno/chargeback | Correlacionar retorno e aplicar reversão/compensação conforme regra. | Não marcar venda ou contrato como inexistente por estorno financeiro. |
| Operação sem evidência mínima | Manter apuração em revisão/bloqueio. | Não liberar pagamento ou ocultar exceção em relatório. |

## 5. Locação — carteira, cobrança e prestação de contas

### 5.1 Regra de origem

Locação possui duas relações contratuais que não podem ser confundidas: a administração do imóvel com o proprietário e a locação com o locatário. Cada contrato pode ter prazos, encargos, partes, índices, políticas e obrigações próprios. A carteira transforma obrigações versionadas em leitura operacional; ela não substitui o contrato nem a conciliação.

| Componente | Decisão estratégica | Critério de aceite futuro |
| --- | --- | --- |
| Agenda de contrato | Vencimento, competência, índice, encargos, multas, juros, taxas e periodicidade são versionados. | Alterar padrão não muda obrigação consolidada sem aditivo/regra de transição. |
| Obrigação do locatário | Principal, encargo, acréscimo, acordo ou ajuste apontam a regra/evento que os originou. | Uma obrigação suspensa/cancelada deixa motivo e não desaparece da trilha. |
| Cobrança | Instrução e comunicação são controladas por política, canal e correlação. | Emitir/espelhar boleto não baixa carteira ou prova pagamento. |
| Recebimento e aplicação | Valor recebido pode ser identificado/aplicado parcial ou integralmente segundo regra. | Comprovante ou retorno isolado não encerra conciliação. |
| Despesa e serviço | Serviço, orçamento, autorização, despesa e pagamento são objetos distintos. | “Serviço concluído” não gera despesa paga ou dedução automática. |
| Taxa/dedução | Taxa de administração e deduções são calculadas por regra/versionamento. | Valor não pode ser editado sem fórmula, exceção aprovada ou ajuste. |
| Direito do proprietário | Crédito/repasse depende de política, fatos, deduções, bloqueios e janela de segurança. | Contrato ativo ou boleto pago não significa valor liberado para repasse. |
| Prestação de contas | Leitura por período mostra aberturas, fatos, deduções, ajustes, saldos e evidências. | Não apresenta projeção como liquidado ou oculta itens em divergência. |

### 5.2 Ciclo de carteira locatícia

| Fase | Fato que pode ocorrer | Decisão/controle |
| --- | --- | --- |
| Configuração contratual | Contrato/padrão define obrigações e parâmetros por vigência. | Owner, versão, precedência e impacto de aditivo devem ser conhecidos. |
| Geração de obrigação | Agenda gera obrigação no período/regra apropriados. | Processo é idempotente e registra fonte/correlação. |
| Instrução de cobrança | Cobrança é preparada/enviada a canal habilitado. | Destinatário, opt-in/política, template, tentativa e retorno são auditáveis. |
| Retorno e aplicação | Valor/código/evento externo é recebido e proposto/aplicado. | Aplicação parcial, excedente, duplicidade ou identificação incerta abre estado próprio. |
| Conciliação | Fatos internos/externos são confirmados ou divergência é tratada. | Só a conciliação confirma leitura de realizado para efeitos definidos. |
| Dedução/taxa | Regras calculam componentes com base e versão. | Exceção requer alçada; cálculo não é edição manual de saldo. |
| Direito e repasse | Crédito do proprietário torna-se elegível e pode ser instruído. | Instrução e settlement são separados e podem falhar/ser estornados. |
| Prestação de contas | Leitura apresenta fatos e pendências do recorte autorizado. | Portal não mostra outros ativos/contratos nem dados internos não necessários. |

### 5.3 Exceções de Locação

| Cenário | Tratamento recomendado | Resultado que deve ser evitado |
| --- | --- | --- |
| Pagamento parcial | Aplicar conforme regra ou manter em análise, exibindo saldo e correlação. | Baixar integralmente a obrigação sem regra/evidência. |
| Pagamento duplicado | Identificar excesso, abrir decisão de destino/compensação/devolução. | Criar dois recebimentos realizados para a mesma referência. |
| Acordo/renegociação | Versionar obrigações substituídas, novas condições e aprovações. | Apagar atraso/histórico ou reescrever a obrigação original sem vínculo. |
| Inadimplência | Separar status, comunicação, negociação, acordo, garantia e medida posterior. | Disparar comunicação ou medida financeira automática sem política/alçada. |
| Despesa contestada | Bloquear dedução/direito relacionado, abrir caso e registrar evidências. | Repassar ao proprietário ou pagar prestador por confirmação visual de serviço. |
| Estorno/retorno tardio | Correlacionar evento, abrir reversão/ajuste e reavaliar direitos dependentes. | Mudar contrato/locação para encerrado ou apagar prestação de contas. |
| Rescisão | Separar término do contrato, apuração final, obrigações remanescentes e settlement. | Assumir que rescisão equivale a saldo zero ou prestação concluída. |

## 6. Segregação de deveres e alçadas

| Ação futura | Pode propor | Pode aprovar | Pode instruir | Pode conciliar | Não deve acumular por padrão |
| --- | --- | --- | --- | --- | --- |
| Regra de comissão/taxa | Gestor responsável | Alçada financeira/comercial | Não aplicável | Revisão posterior | Proposta e aprovação de própria exceção. |
| Cobrança | Financeiro/automação aprovada | Política/alçada aplicável | Parceiro/canal habilitado | Financeiro | Instruir e declarar recebido sem retorno. |
| Aplicação de caixa | Financeiro | Alçada para exceções | Não aplicável | Financeiro/contabilidade | Aplicar divergência e encerrá-la sozinho acima do limite. |
| Direito econômico | Motor/regras ou responsável | Alçada econômica | Financeiro autorizado | Financeiro/contabilidade | Criar regra e liquidar a própria exceção. |
| Repasse | Financeiro | Alçada definida | Parceiro habilitado | Financeiro/contabilidade | Instruir e confirmar settlement sem retorno. |
| Ajuste/estorno | Responsável pelo caso | Alçada independente | Conforme processo | Conciliação | Alterar fato passado sem evento e sem revisão. |

## 7. Evidência, auditoria e fechamento

| Controle | Regra estratégica | Prova futura |
| --- | --- | --- |
| Correlação | Todo comando, retorno, aplicação, ajuste e settlement compartilha identificador de correlação. | É possível reconstruir cadeia por obrigação/direito sem revelar dados desnecessários. |
| Evidência | Arquivo, retorno, nota, comprovante ou decisão é vinculado com classificação/finalidade/versão. | Visualização/compartilhamento respeita policy e gera evento. |
| Fechamento | Fechamento congela leitura de período; ajustes posteriores são fatos datados. | Relatório de período anterior explica diferença por ajuste e preserva `as_of`. |
| Exceção | Toda divergência possui tipo, impacto, owner, prazo, alçada, estado e desfecho. | Item não é escondido por edição de status e mantém origem/decisão. |
| Exportação | Exportação é leitura governada, com finalidade, escopo, minimização, data e auditoria. | Filtro/relatório não amplia acesso e download pode ser revogado/expirar. |

## 8. Indicadores financeiros com contrato de métrica

| Indicador | Definição que deve existir | Não pode ser interpretado como |
| --- | --- | --- |
| Obrigações em aberto | Obrigações no período/escopo por estado, vencimento e competência. | Caixa disponível ou inadimplência definitiva sem política. |
| Cobrança instruída | Instruções emitidas/enviadas por canal e correlação. | Recebimento confirmado. |
| Recebido e conciliado | Aplicações com retorno/evidência conciliados conforme regra. | Boleto pago visualmente, comprovante isolado ou saldo projetado. |
| Divergência financeira | Itens sem correspondência/decisão por tipo, impacto e idade. | Erro de uma pessoa, fraude ou perda sem investigação. |
| Direitos projetados/elegíveis | Direitos por estado, recebedor, base e versão. | Pagamento efetuado. |
| Repasses instruídos/liquidados | Instruções e settlements por período, parceiro e estado. | Direito devido sem retorno de liquidação. |
| Taxas/deduções | Componentes por regra, base, período e exceção. | Receita realizada ou despesa paga sem conciliação. |

## 9. Gate financeiro antes de implementação

| Gate | Pergunta de saída |
| --- | --- |
| Fatos | Obrigação, cobrança, retorno, caixa, conciliação, dedução, direito, instrução e settlement estão separados? |
| Regras | Toda taxa, comissão, prazo, índice, teto e prioridade é versionada, datada e tem owner? |
| Escopo | Organização, módulo, contrato, ativo, parte, período e finalidade estão explícitos? |
| Exceções | Há fluxo para parcial, duplicado, estorno, acordo, contestação, bloqueio e retorno tardio? |
| Alçadas | Propor, aprovar, instruir, conciliar e ajustar respeitam segregação de deveres? |
| Provas | Matriz de testes cobre idempotência, concorrência, repetir retorno, acesso negado e fechamento por período? |
| Parceiros | Qualquer provedor é tratado como sistema externo com contrato, correlação, retry, timeout e reconciliação? |

## Referências internas

[1] [Estratégia atualizada — Vendas Urbanas e Locação](estrategia_vendas_urbanas_locacao_atualizada.md)

[2] [Jornadas operacionais — Vendas Urbanas e Locação](caderno_jornadas_operacionais_vendas_locacao.md)

[3] [Plano estratégico de ondas](plano_estrategico_ondas_vendas_locacao.md)

[4] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)
