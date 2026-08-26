# Aportes parcelados, cronogramas e eventos de capital

**Status:** `requisito_estratégico_avançado`  
**Finalidade:** registrar investimento, compra/venda de participação e aportes parcelados com evidência, condição, aprovação, histórico e conciliação, sem transformar compromisso de aporte em distribuição automática de recebíveis do loteamento.

> **Separação central:** compromisso de aporte, caixa recebido, natureza societária, titularidade/percentual e direito econômico são fatos relacionados, porém **não são o mesmo fato**.

## 1. Cenário de referência solicitado

O usuário descreveu um loteamento com quatro sócios, no qual três participantes antigos negociam 25% com um novo investidor pelo valor total de R$ 400.000,00. O cronograma informado é de R$ 200.000,00 na entrada e dois valores de R$ 100.000,00 a cada seis meses.

Esse cenário será armazenado como uma **estrutura genérica de negociação**, e não como dado real ou conclusão societária. Antes de qualquer registro operacional, jurídico e contador devem classificar, pelo instrumento aplicável, se a operação é compra de participação entre partes, subscrição/aumento de capital, mútuo, adiantamento, cessão, investimento com condição, ou outro instituto. Essa classificação define titularidade, escrituração, tributação, documentos, aprovações e efeitos de cada parcela.

| Elemento do cenário | O CRM registra | O CRM não presume |
| --- | --- | --- |
| Três participantes antigos e um investidor. | Partes, papéis, documentos, representação, vigência e aprovação. | Que todos cedem frações iguais ou que os quatro possuem percentuais iguais. |
| Negociação de 25%. | Percentual objeto, denominador/base, titulares antes/depois, data de eficácia e condição. | Que 25% é sempre do empreendimento, do capital social ou do lucro; isso precisa estar no instrumento. |
| Preço total de R$ 400.000,00. | Compromisso financeiro total, moeda, devedor, beneficiário, natureza selecionada e vínculo documental. | Que o valor é receita da loteadora ou aumento de caixa societário da empresa. |
| R$ 200.000,00 iniciais + 2 x R$ 100.000,00 semestrais. | Três marcos de aporte/pagamento, vencimentos, condições, evidências e estado individual. | Que recebimento parcial transfere automaticamente participação ou libera distribuição. |

## 2. Objetos que não podem ser misturados

| Objeto | Pergunta respondida | Exemplo de estado |
| --- | --- | --- |
| **Operação de Capital** | Qual negociação conecta vendedores/cedentes, investidor, objeto, preço e instrumento? | Em elaboração, assinada, condicionada, encerrada, rescindida. |
| **Compromisso de Aporte/Pagamento** | Quem se obriga a aportar/pagar, para quem, quanto e em qual natureza declarada? | Previsto, ativo, vencido, renegociado, cancelado. |
| **Cronograma de Marcos** | Quais parcelas, vencimentos, moedas, condições e garantias compõem o compromisso? | Previsto, vencido, recebido em análise, conciliado, em atraso. |
| **Evento de Caixa** | Que valor foi efetivamente informado/recebido e com qual evidência? | Evidência pendente, em análise, conciliado, estornado, contestado. |
| **Evento de Titularidade** | Quando o percentual/participação passa a produzir efeito conforme instrumento e registro competente? | Planejado, condicionado, eficaz, suspenso, revertido. |
| **Direito Econômico Posterior** | Se, quando e como o investidor terá direito a entradas/parcelas/intermediárias ou resultado. | Ausente, projetado, elegível, conciliado, bloqueado. |

## 3. Modelo de cadastro da operação

| Campo/registro | Obrigatório | Finalidade de controle |
| --- | --- | --- |
| Identificador da operação | Sim | Rastrear a negociação de capital sem confundi-la com contrato de venda de lote. |
| Natureza jurídica/contábil declarada | Sim, com owner jurídico/contábil | Classificar a operação com base no instrumento, sem o CRM inferir sua natureza. |
| Partes e papéis | Sim | Investidor, vendedor/cedente, subscritor, beneficiário do pagamento, representante, garantidor e interveniente. |
| Objeto e percentual | Sim | Participação/fração/direito negociado, base de cálculo e foto antes/depois quando aplicável. |
| Preço ou compromisso total | Sim | Valor total, moeda, responsabilidade, beneficiário e regra de quitação. |
| Condições precedentes | Sim quando existirem | Assinatura, aprovação societária, documento, registro, garantia, entrega, aceite ou outra condição. |
| Instrumentos e evidências | Sim | Contrato, aditivo, deliberação, comprovante, nota técnica e registro de aprovação. |
| Data de eficácia | Sim quando definida | Distinguir assinatura, pagamento, condição cumprida, registro e eficácia econômica/societária. |
| Relação com direito econômico | Sempre explícita | Link para plano de direitos ou indicação formal de que não existe direito de distribuição. |

## 4. Cronograma parcelado de capital

Cada compromisso possui um ou mais marcos. O valor recebido em um marco não altera automaticamente os demais, nem cria distribuição de receitas de lote.

| Campo de cada marco | Exigência |
| --- | --- |
| Sequência e referência | Número do marco, descrição e vínculo com a operação de capital. |
| Valor/moeda | Valor exato, moeda, correção/encargos se previstos e valor líquido/bruto somente quando definido. |
| Vencimento | Data, janela, recorrência ou condição objetiva que determina a exigibilidade. |
| Condição | Condição precedente, garantia, documento, aprovação, cláusula de aceleração ou bloqueio. |
| Responsável e beneficiário | Quem aporta/paga, quem recebe e qual conta/instrução autorizada, quando aplicável. |
| Evidência | Comprovante, retorno externo, documento de aceite, conciliação e referência de auditoria. |
| Consequência contratual | Multa, juros, suspensão, vencimento antecipado, ajuste, retorno de participação ou outra consequência apenas se prevista. |
| Status e owner | Estado atual, justificativa, responsável pela análise e próxima ação. |

## 5. Estados do compromisso e de cada marco

| Estado | Significado | Ações permitidas no CRM |
| --- | --- | --- |
| **Previsto** | Cronograma aprovado/documentado, ainda sem exigibilidade. | Projetar, acompanhar e expor condição. |
| **Aguardando condição** | Vencimento ou efeito depende de condição precedente. | Registrar evidência e solicitar análise; não reconhecer como atraso automaticamente. |
| **Exigível** | Condições e data aplicáveis foram atendidas. | Alertar owner, receber evidência, conciliar. |
| **Vencido/em atraso** | Marco exigível não foi conciliado até a tolerância contratual/política. | Exibir atraso, abrir tratativa e preservar justificativa. |
| **Recebido em análise** | Há indicação/comprovante de pagamento, sem confirmação conclusiva. | Conciliar, identificar divergência ou pedir evidência. |
| **Conciliado** | Evento de caixa foi confirmado com a evidência definida. | Atualizar realizado do compromisso; não transferir participação automaticamente. |
| **Renegociado** | Marco sofreu aditivo aprovado. | Versionar cronograma e preservar a versão anterior. |
| **Cancelado/rescindido** | Instrumento determina encerramento ou reversão. | Bloquear novos efeitos e registrar tratamento de eventos já ocorridos. |
| **Em disputa/bloqueado** | Há conflito jurídico, documental, contábil ou operacional. | Limitar efeito automático, atribuir owner e manter trilha de auditoria. |

## 6. Titularidade e direito econômico: regras de proteção

| Regra | Por que existe |
| --- | --- |
| O recebimento de uma parcela de aporte não muda o quadro societário por padrão. | A eficácia pode depender de pagamento integral, aprovação, registro, assinatura, condição ou cronograma específico. |
| Titularidade/percentual é versão datada e aprovada. | Permite reconstruir quem tinha qual posição em cada data sem reescrever o passado. |
| Direito a entrada, parcelas regulares ou intermediárias é configurado no Plano de Direitos, não no cadastro do investidor. | Impede que “investidor” se torne automaticamente recebedor de toda a carteira. |
| Evento de caixa é conciliado antes de ser tratado como realizado. | Separa comprovante, retorno, banco/PSP, correção e efeito contábil. |
| Alteração de cronograma exige aditivo/justificativa/aprovação. | Evita que vencimentos e obrigações sejam apagados ou alterados sem trilha. |
| Natureza jurídica/fiscal/contábil tem owner especialista. | O CRM organiza fatos e evidências; não substitui contador, jurídico ou deliberação societária. |

## 7. Recorte do painel do investidor

O painel pode mostrar o próprio compromisso de investimento e seu cronograma, mantendo explícita a diferença entre aporte e remuneração futura.

| Exibir | Não exibir/presumir |
| --- | --- |
| Operação, instrumento liberado, compromisso total, marcos, vencimentos, comprovantes permitidos, estado de cada aporte, pendências e histórico. | Que o aporte é “ganho”, “recebível” ou distribuição de parcelas do loteamento. |
| Participação/percentual somente quando a eficácia e o escopo forem documentados. | Percentual de outros sócios, cap table completo ou dados não contratados. |
| Direitos econômicos apenas se houver plano de direitos conectado, com estados de projeção/realização. | Direito automático a entrada, parcelas, intermediárias, lucro ou caixa geral. |

## 8. Critérios de aceite futuros

| Cenário | Deve permitir | Deve impedir |
| --- | --- | --- |
| Aporte inicial e dois aportes futuros. | Registrar três marcos autônomos, cada um com vencimento, condição, evidência e status. | Marcar os três como recebidos quando apenas a entrada foi conciliada. |
| Marco recebido parcialmente. | Registrar valor/evidência parcial, saldo remanescente e regra de tratamento. | Declarar quitação total ou transferência automática sem regra. |
| Aditivo de prazo/valor. | Criar versão posterior com aprovação, mantendo cronograma anterior auditável. | Apagar vencimento/valor original ou reescrever o histórico. |
| Investidor com aporte conciliado, mas sem plano de direitos. | Exibir estado de capital/titularidade conforme instrumento. | Gerar percentual de entrada/parcela/intermediária automaticamente. |
| Direito econômico futuro aprovado. | Vincular o investidor ao Plano de Direitos específico, com escopo e vigência. | Abranger outros lotes, grupos ou contratos não previstos. |

## Limite profissional

Este desenho é de produto e governança de registros. A natureza do investimento, a eficácia da transferência de participação, a escrituração, a tributação, a necessidade de registro e os efeitos societários dependem do instrumento e da orientação formal de jurídico e contador responsáveis. O CRM deve bloquear inferências quando essa classificação estiver pendente.

## Referências internas

[1] [Direitos por entrada, parcela e intermediária](crm_socios_parceiros_direitos_por_parcela.md)

[2] [Grupos de participação e painéis transparentes](crm_socios_parceiros_grupos_paineis.md)

[3] [Dossiê contratual e financeiro de Sócios e Parceiros](crm_socios_parceiros_dossie_contratual.md)

[4] [Subledger da imobiliária](crm_subledger_imobiliaria.md)
