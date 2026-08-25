# Análise crítica dos estudos recebidos — revisão estratégica BHL

## Status de uso

Os dois materiais recebidos são **fontes de domínio e hipótese de modelagem**, não evidência externa automaticamente validada. Eles passam a integrar a biblioteca do CRM com o estado “fornecido pelo parceiro / revisão externa em andamento”. Valores de mercado, condições de crédito, percentuais financeiros e interpretações legais só podem se tornar regra ou métrica publicada após confrontação com fonte oficial, setorial ou especializada vigente.

| Material | Escopo | Valor para a estratégia | Estado inicial |
| --- | --- | --- | --- |
| *Estudo Mercado Imobiliário BHL Formação* | Locação, venda urbana, construtora, financiamento e diligência | Acrescenta o ciclo de vida contínuo de locação e o fluxo de lançamento/construtora, ainda ausente no CRM consolidado | Integrado como referência de domínio; fatos sensíveis exigem validação. |
| *Estudo Superior Mercado Loteadoras Brasil* | Mercado, regulação, ciclo de desenvolvimento, carteira, riscos e CRM de loteamentos | Reposiciona loteadora como domínio de desenvolvimento urbano, recebíveis e risco — não como simples vertical de venda | Integrado como prioridade de desenho; fatos de mercado e legais exigem validação por item. |

## O que muda na estratégia

O estudo anterior tratava loteadoras como uma extensão futura de inteligência territorial. Essa posição fica **superada**. Loteadora deve ser um domínio de primeira classe do CRM, ao lado de locação, venda urbana e venda de construtora, porque possui um ciclo de vida, uma estrutura de risco, uma carteira de recebíveis e um inventário que não cabem no modelo de corretagem simples.

> A nova tese não obriga construir todos os módulos simultaneamente. Ela obriga que o **modelo canônico, a arquitetura e a estratégia comercial não rebaixem loteadoras a um apêndice**.

| Domínio | Paradigma operacional | Unidade de valor | Resultado que o CRM deve sustentar |
| --- | --- | --- | --- |
| Locação | Ciclo de vida contínuo | Contrato administrado e relacionamento | Cobrança, repasse, manutenção, renovação, vistoria e encerramento. |
| Venda urbana | Pipeline transacional finito | Negócio/proposta até registro | Captação, diligência, proposta, financiamento, escritura e registro. |
| Construtora/incorporação | Venda de estoque em obra | Unidade, reserva e plano de pagamento | Tabela, reserva, fluxo em obra, repasse, entrega e distrato. |
| Loteadora/desenvolvimento urbano | Desenvolvimento de projeto + carteira longa de recebíveis | Empreendimento, lote, carteira e execução de infraestrutura | Gleba, viabilidade, aprovação, registro, obras, venda, recebíveis, quitação e pós-entrega. |

## Achados que devem ser incorporados imediatamente ao desenho

| Achado do estudo | Implicação para o CRM | Nível de confiança para desenho | Ação |
| --- | --- | --- | --- |
| Locação é ciclo longo; venda é pipeline com fim | Contrato de locação não pode ser apenas “negócio ganho”; precisa de lifecycle próprio | Alto como princípio de domínio | Preservar no modelo canônico e ampliar com vistoria, garantia, apólice, cobrança e repasse. |
| Venda urbana exige separar compromisso de conclusão registral | “Vendido”, “em financiamento”, “escriturado” e “registrado” devem ser estados distintos | Alto como princípio registral | Criar máquina de estados e gates de documento. |
| Vendas de construtora possuem reserva, estoque e plano de pagamento paralelo | Unidade não pode ser reservada/vendida em duplicidade; plano possui eventos e índices | Alto para modelagem; regras financeiras exigem configuração | Criar domínio de estoque de empreendimento e planos versionados. |
| Loteadora nasce na gleba e termina com carteira quitada | Empreendimento e lote não são apenas listing; passam por viabilidade, aprovação, registro, obra, recebíveis e encerramento | Alto para arquitetura | Criar bounded context próprio de desenvolvimento de loteamentos. |
| Permuta e parceiros são parte da economia do projeto | Permutante e regra de distribuição precisam ser entidades, não observação de contrato | Alto para modelagem | Modelar participação, alocação por lote/fluxo e comprovantes. |
| Caução de lotes pode tornar lotes indisponíveis | Estoque precisa suportar disponibilidade comercial e restrição de garantia em paralelo | Alto para requisito de produto, sujeito à regra do caso | Incluir estado de restrição e gate de reserva/venda. |
| Carteira própria é essencial à loteadora | CRM precisa registrar plano, evento, parcela, índice, evidência de pagamento, inadimplência e distrato | Alto como capacidade; regras de cálculo dependem do contrato | Criar subdomínio de carteira/recebíveis com “controle only”. |
| Município define parte relevante dos parâmetros urbanísticos | Regras por praça não podem ficar fixas no código | Alto | Criar configuração versionada por município e projeto. |

## Gates duros e gates de revisão

| Tipo | Evento/estado | Regra recomendada no CRM | Observação |
| --- | --- | --- | --- |
| Duro | Registro do loteamento | Não permitir proposta/contrato comercial de lote antes do registro comprovado e revisado | A regra deve refletir a documentação e a orientação jurídica vigente do projeto. |
| Duro | Lote com restrição de caução | Não permitir reserva/venda se o lote estiver marcado como indisponível por garantia não liberada | Depende do instrumento e da liberação registrada. |
| Duro | Estoque reservado/vendido | Aplicar concorrência transacional: um lote/unidade não pode ter duas reservas ativas incompatíveis | Regra de integridade do sistema. |
| Revisão | Gleba com espólio, ônus, risco ambiental ou urbanístico | Bloquear avanço de viabilidade até parecer/documento responsável registrar decisão | CRM não emite parecer; organiza o bloqueio e a evidência. |
| Revisão | Preço, desconto, índice, juros e distrato | Usar versão contratual/tabela/quadro-resumo por empreendimento | Não codificar percentuais ou índices como constantes universais. |
| Revisão | Crédito, financiamento e elegibilidade | Registrar estado da análise externa e condição declarada | Não aprovar/reprovar automaticamente. |

## Lacunas do CRM consolidado antes desta revisão

| Lacuna | Por que é crítica para loteadora | Novo bloco necessário |
| --- | --- | --- |
| Ciclo pré-comercial da gleba | Grande parte do risco e do capital é comprometida antes da primeira venda | Gleba, due diligence, viabilidade e aprovação. |
| Obra e garantia ao município | A execução da infraestrutura afeta venda, risco e disponibilidade de lotes | Cronograma físico, marco de obra, garantia/caução e recebimento. |
| Estoque de lote com restrições | Disponível, permutante, caucionado e distratado têm efeitos comerciais distintos | Inventário transacional e alocação de lote. |
| Recebíveis de longo prazo | A carteira própria é ativo central e fonte de risco de inadimplência | Contrato, plano de pagamento, parcela, índice, pagamento comprovado e cobrança. |
| Permuta/rateio | Parceiro de terra pode receber lotes, percentual de VGV ou fluxo | Participação, regra de distribuição e comprovante. |
| Distrato de lote | Retorno de estoque, cálculo contratual e devolução têm regras próprias | Processo de distrato, parâmetros contratuais, notificação e reentrada de inventário. |
| Configuração municipal | Zoneamento, parâmetros e aprovação variam por praça | Rule set municipal versionado e checklist de projeto. |

## Itens que precisam de validação externa antes de virar regra

| Tema | Afirmação recebida | Como tratar agora |
| --- | --- | --- |
| Tamanho e ritmo do mercado | Ordem de grandeza e taxas atribuídas a AELO, ADIT e outras entidades | Buscar relatório/declaração primária e registrar período, cobertura e método. |
| Distrato | Percentual de retenção, fruição e prazos | Confrontar texto legal atualizado, jurisprudência relevante e contrato/quadro-resumo de cada operação. |
| Crédito imobiliário | Tetos de SFH, MCMV, LTV, juros e condições bancárias de 2026 | Tratar como referência temporal; configurar por parceiro financeiro e data de vigência. |
| Tributação | Bases de presunção, reconhecimento de receita e imposto de ganho | Manter apenas como marcador de consulta; não calcular no CRM sem orientação contábil. |
| Mercado de capitais | CRI, FIDC, cessão e estruturas de carteira | Pesquisar fontes regulatórias e especializadas antes de oferecer funcionalidade financeira. |
| Responsabilidades legais | Deveres de corretor, loteador, incorporador e administradora | Validar diplomas oficiais e revisar com jurídico responsável. |

## Consequência para a estratégia comercial

Em vez de uma sequência “locação primeiro, loteadora depois”, o produto deve operar com **trilhas de entrada paralelas** sobre uma mesma espinha dorsal: uma imobiliária pode iniciar por demanda e locação; outra por captação/proposta de venda; uma loteadora por inventário, reserva, carteira e recebíveis. A decisão de piloto continua baseada em acesso a operação real, disposição de co-desenvolver e capacidade de medir antes/depois — não em uma hierarquia que trate loteadora como menor.
