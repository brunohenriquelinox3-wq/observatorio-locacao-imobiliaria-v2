# Estratégia do núcleo financeiro, fiscal e contábil do CRM imobiliário

**Referência temporal:** agosto de 2026  
**Abrangência:** imobiliárias de locação e venda, loteadoras, SPEs, parceiros, permutantes, corretores, proprietários e sócios.

> **Aviso de trabalho:** este é um estudo de produto, processos e arquitetura, não parecer jurídico, contábil ou tributário. Enquadramento fiscal, escrituração, obrigação acessória, alíquota, documento municipal, contrato de parceria, pagamento a beneficiário e integração de cobrança precisam ser revisados pelos responsáveis técnico-contábil, fiscal, jurídico e financeiro da empresa antes de uso ou implantação.

## 1. Decisão estratégica

O coração do CRM imobiliário deve ser um **subledger de negócios com governança fiscal e contábil**, e não uma tela de “contas a receber”. Essa camada precisa explicar, por empresa/SPE, contrato, lote, competência e parte relacionada: o que originou faturamento, o que foi cobrado, o que entrou, o que ficou em carteira, o que foi destinado a terceiros, o que aguardou condição, o que foi exportado para a contabilidade e o que ainda diverge.

Essa decisão atende aos três mercados do produto. A imobiliária precisa separar receita própria de valores administrados e repasses. A loteadora precisa preservar estoque, contrato, parcelas, atualização, permuta, recebíveis, distrato e múltiplos direitos econômicos. A contabilidade precisa recuperar eventos e documentos por competência e empresa sem depender de planilhas paralelas.

| O CRM financeiro deve ser | O CRM financeiro não deve ser |
| --- | --- |
| Origem auditável de eventos econômicos e regras de negócio | Um banco, carteira digital própria ou instituição de pagamento. |
| Subledger de obrigações, cobranças, liquidações e alocações | Um razão contábil que substitui ERP/livros e contador. |
| Centro de regras versionadas para contrato, repasse e distribuição | Um motor de alíquotas definido por palpite ou campo livre. |
| Workspace de conciliação e fechamento para contadores autorizados | Acesso irrestrito do contador a toda a carteira e a toda a configuração comercial. |
| Orquestrador de instruções a parceiros habilitados | Executor direto de split sem fornecedor contratado/habilitado. |

## 2. Evidências que moldam a arquitetura

O SPED mantém módulos com escopos próprios: a ECD permite a escrituração eletrônica de Livro Diário, Livro Razão, balancetes, balanços e fichas de lançamento; a ECF informa operações com foco em IRPJ e CSLL; a EFD-Reinf recebe retenções e outras informações fiscais por eventos; a EFD-Contribuições usa documentos e dados operacionais como receitas, despesas, encargos e aquisições na escrituração de PIS/Pasep e Cofins. [1] [2] [3] [4] Isso confirma que o CRM deve produzir origem, competência, contraparte, documento, regra e retorno de integração, mas não simular sozinho a escrituração oficial.

A Lei nº 8.934/1994 atribui ao registro empresarial finalidades de garantia, publicidade, autenticidade, segurança e eficácia dos atos sujeitos a registro, além de cadastro atualizado de empresas; as Juntas Comerciais executam e administram esses serviços localmente. [5] Por isso, empresa, SPE, sócio, poder de assinatura, alteração e certidão exigem dossiê versionado, não somente um campo “sócio”.

Na atividade de loteamento em terreno de terceiro, a Solução de Consulta SRRF06/Disit nº 6.018/2018 examina parceria e repartição proporcional de receitas em cenário concreto e ressalva a possibilidade de interpretação superveniente. [6] A consequência de produto é inequívoca: contrato, base econômica, gatilho e natureza de cada beneficiário são dados de primeira classe; nenhum percentual padrão pode concluir tributação ou reconhecimento para todos os projetos.

O Banco Central descreve instituição de pagamento como pessoa jurídica que viabiliza serviços de movimentação de recursos no âmbito de arranjo de pagamento e enumera instrumentos, regras, participantes e conta de pagamento na cadeia. [7] Assim, boleto, Pix e qualquer split devem ser liquidados por banco, instituição financeira ou instituição de pagamento contratada/habilitada, enquanto o CRM calcula direitos, aprova instruções e concilia retornos.

## 3. Modelo canônico financeiro

| Camada | Objeto central | Pergunta que resolve |
| --- | --- | --- |
| Organização | Empresa, filial, SPE, empreendimento, unidade de negócio | Em qual entidade econômica, projeto e política o evento ocorreu? |
| Contrato | Proposta, contrato, aditivo, cessão, distrato e regra de remuneração | Qual instrumento e versão originaram a obrigação? |
| Subledger | Evento financeiro, receivable, payable, allocation, entitlement | Quem deve receber/pagar, quanto, quando e sob qual condição? |
| Cobrança e caixa | Cobrança, settlement, aplicação, conciliação e diferença | O pagamento ocorreu, em qual meio e a que parcela foi aplicado? |
| Distribuição | Plano, recebedor, fórmula, alçada, bloqueio e instrução | Como o valor elegível se reparte entre os participantes? |
| Fiscal e contábil | Documento, competência, mapeamento, lote de exportação e retorno | Como o evento deve ser revisado e levado a sistemas especializados? |
| Evidência e auditoria | Fonte, contrato, poder, aprovação, log e política | Por que a regra existia, quem a aprovou e o que mudou? |

### Regra de integridade

Todo lançamento operacional precisa conter, no mínimo, `legal_entity`, `business_event`, `contract_version`, `counterparty`, `amount`, `currency`, `event_date`, `competence_date`, `source`, `policy_version`, `state` e `evidence_reference`. Mudanças posteriores acontecem por novo evento compensatório, aditivo ou nova versão de regra — não por sobrescrita silenciosa.

## 4. Arquitetura para imobiliárias

Na locação administrada, o sistema começa com o contrato e as regras de cobrança/administração, cria o recebível do locatário, recebe retorno de boleto/Pix, concilia, aplica o pagamento, abre obrigações de repasse e exporta a composição para revisão fiscal-contábil. Na venda, reserva, sinal, comissão, proposta, escritura, reembolso e distrato precisam manter seu próprio ciclo e base documental.

| Evento | Subledger origina | Revisão contábil/fiscal necessária |
| --- | --- | --- |
| Contrato de locação | Agenda de cobrança e regras de administração/repasse | Natureza de receita, valores de terceiros, documento e competência. |
| Pagamento de aluguel | Settlement e aplicação à parcela | Conciliação de caixa, composição, retenção/documento se aplicável. |
| Repasse ao proprietário | Payable condicionado a regra, caixa e alçada | Classificação, natureza e referência de pagamento. |
| Comissão | Recebível/payable por papel e contrato | Documento, beneficiário, retenções e exportação aplicáveis. |
| Venda/distrato | Obrigações, condições, reversões e carteira | Origem do ajuste, documento e tratamento da competência. |

## 5. Arquitetura para loteadoras e SPEs

Loteadora precisa de quatro estados paralelos por lote: físico/urbanístico, registral/documental, comercial e econômico. A venda não pode mudar o estoque sem uma reserva/contrato válido; o recebimento não pode gerar distribuição sem conciliação e regra aprovada; o distrato não pode devolver o lote sem condições comerciais, jurídicas e financeiras explícitas.

| Objeto | Estados que precisam ser separados |
| --- | --- |
| Empreendimento | Viabilidade, aprovação, registro, obras, vendas, entrega e pós-entrega. |
| Lote | Alocação, restrição, disponibilidade, reserva, contrato, carteira e retorno ao estoque. |
| Contrato | Rascunho, aprovado, assinado, ativo, aditivado, cedido, distrato em análise, encerrado. |
| Parcela | Planejada, emitida, vencida, parcialmente liquidada, conciliada, negociada, cancelada ou transferida. |
| Permuta | Fixa/percentual, financeira/física, lote elegível, gatilho, prazo, bloqueio e reversão. |
| Distribuição | Calculada, bloqueada, aprovada, instruída, liquidada, estornada ou em divergência. |

### Permuta, terra e participação

O proprietário da terra pode receber preço, lote/unidade, crédito, entrada, parcela mensal, percentual sobre base contratual ou participação em resultado. O captador, corretor, imobiliária, executor de obra, parceiro e sócio também podem ter direitos distintos. Cada relação precisa separar **natureza econômica**, **fórmula**, **gatilho**, **instrumento**, **empresa/SPE**, **prazo**, **limite** e **responsável**. Chamar tudo de comissão destrói o controle fiscal, contratual e contábil.

## 6. Split configurável e carteira de direitos

O pedido de dividir um pagamento entre até 100 recebedores deve ser tratado como uma **cascata de entitlements**. Ao receber uma entrada ou parcela conciliada, o CRM não transfere valores imediatamente. Primeiro, determina base elegível, verifica condições, congela a versão do plano, calcula itens e bloqueios, registra alçada e somente então emite instruções para parceiro de pagamento ou tesouraria.

| Componente do plano | Exigência de configuração |
| --- | --- |
| Base | Bruto, líquido conciliado, receita elegível, caixa após categoria definida ou outra base contratual. |
| Ordem | Fixos, mínimos, percentuais, faixas, residuais e provisões em sequência explícita. |
| Recebedor | Parte vinculada, conta/destino habilitado, relação vigente e documento/condição revisados. |
| Gatilho | Assinatura, pagamento conciliado, marco de obra, competência, quitação, resultado definido ou outro evento. |
| Fórmula | Fixo, percentual, faixa, teto, piso, residual, rateio ou regra de período. |
| Bloqueio | Pêndencia documental, saldo, alçada, inadimplência, restrição de lote, disputa ou prazo. |
| Arredondamento | Precisão, destino de resíduo, justificativa e verificação de soma. |
| Reversão | Evento compensatório vinculado ao item original e à causa, sem alterar a história. |

### Arquiteturas de cobrança e split

| Abordagem | Quando é adequada | Ponto de atenção |
| --- | --- | --- |
| Cobrança externa e repasse pós-conciliação | Primeiro piloto, regras ainda variáveis ou necessidade de reserva antes do pagamento a terceiros | Tesouraria e conciliação precisam ser disciplinadas; não pode virar planilha paralela. |
| Split nativo por parceiro de pagamento | Regras estabilizadas, produto contratado suporta múltiplos recebedores e retornos necessários | Validar KYC, limite de itens, estorno, timing, tarifa, webhook/callback e contrato. |
| Orquestração multi-parceiro | Escala/contingência justificam reduzir dependência de um fornecedor | Aumenta custo, homologação, idempotência e governança; não é recomendação automática de início. |

## 7. Área do contador e fechamento

O contador deve receber uma área dedicada para empresa/SPE e competência, com visão de faturamento, documento, carteira, cobrança, repasse, distribuição, exportação, divergência, regra vigente e log. Esse perfil revisa e devolve exceções; não modifica proposta, contrato, extrato ou pagamento conciliado.

| Momento de fechamento | Controle essencial |
| --- | --- |
| Corte | Snapshot de empresa, competência, eventos, contratos e políticas elegíveis. |
| Conciliação | Todo settlement aplicado, pendente ou em caso de divergência com responsável. |
| Revisão fiscal | Documento, natureza, município, retenção/configuração e competência revisados. |
| Exportação | Lote imutável com esquema, mapeamento, versão e retorno de aceitação/rejeição. |
| Arquivo | Evidência, relatório de diferenças, aprovação e política disponíveis para auditoria. |

## 8. Obrigações e políticas como catálogo vivo

O CRM não deve criar um calendário “Brasil” inflexível. Cada obrigação/regra deve ser registrada por empresa, regime, município, competência, produto, vigência e responsável. A ECD, ECF, EFD-Reinf, EFD-Contribuições, DCTFWeb/MIT e NFS-e possuem escopos, leiautes e atualizações próprios. [1] [2] [3] [4] [8] [9]

| Campo de política | Exemplo de uso |
| --- | --- |
| Escopo | SPE A, município B, locação administrada ou vendas do empreendimento C. |
| Vigência | Inicio/fim e competência em que a configuração pode ser usada. |
| Fonte | Lei/norma, manual oficial, contrato, política interna ou parecer/validação. |
| Estado | Proposta, em revisão, aprovado, substituído ou arquivado. |
| Impacto | Formulário, regra de distribuição, documento fiscal, integração, relatório ou acesso. |
| Responsável | Contador, fiscal, jurídico, financeiro ou gestor que valida o campo. |

## 9. Roteiro de desenvolvimento

| Fase | Janela indicativa | Entrega | Critério de passagem |
| --- | ---: | --- | --- |
| 0. Governança e vocabulário | 3–4 semanas | Dicionário, empresas/SPEs, políticas, dimensões, matriz de acesso e decisões em aberto | Contador, financeiro e comercial descrevem o mesmo evento com os mesmos objetos. |
| 1. Subledger básico | 6–8 semanas | Contrato, receivable, payable, cobrança, settlement, aplicação e divergência | Saldo operacional é derivado de eventos, não digitado em planilha paralela. |
| 2. Imobiliária piloto | 4–6 semanas | Locação/venda com administração, repasse, comissão e conciliação por contrato | Equipe fecha uma competência-piloto e explica cada diferença. |
| 3. Loteadora e carteira | 8–10 semanas | Empreendimento, lote, contrato, parcela, atualização, distrato, permuta e estoque paralelo | Projeto controla estoque e carteira sem venda duplicada ou saldo solto. |
| 4. Distribuição configurável | 6–8 semanas | Cascata versionada, entitlements, bloqueios, alçadas e instrução simulada | Cálculo de até 100 recebedores reconcilia à base e reproduz a versão usada. |
| 5. Contabilidade e integrações | 6–10 semanas | Workspace, lote de exportação, retorno, regra de município e adaptador de cobrança | Contador fecha período-piloto com origem, evidência e retorno visíveis. |
| 6. Automação de pagamento | Após homologação | Integração contratada para boleto/Pix/split e callbacks | Política, parceiro, segurança, estorno e contingência foram testados em ambiente controlado. |

## 10. Métricas de prova

| Métrica | Definição |
| --- | --- |
| Cobertura conciliada | Percentual de settlements aplicados, justificados ou em caso de divergência na competência. |
| Rastreabilidade de faturamento | Percentual de eventos com contrato, empresa, competência, documento/regra e responsável. |
| Carteira explicável | Percentual de saldo originado por parcelas válidas, não por ajuste manual. |
| Distribuição auditável | Percentual de entitlements com versão de plano, base, gatilho, beneficiário e aprovação. |
| Reabertura de fechamento | Quantidade/valor de exceções reabertas após exportação por causa e período. |
| Acesso recertificado | Percentual de acessos financeiros críticos revistos dentro do prazo da política. |

## 11. Limites e riscos a preservar

O produto não deve prometer “cálculo fiscal automático completo”, “contabilidade sem contador” ou “split universal”. Tributos, reconhecimento, documento fiscal, retenção, benefício, pagamento a parte relacionada, parceria, cessão de recebível e operação de pagamento variam por fato, contrato, empresa, regime, município, período e norma vigente. A força do CRM é manter tudo isso configurável, evidenciado, versionado e encaminhado para quem tem competência técnica para validar.

## Referências

[1] [Portal SPED / Receita Federal — Escrituração Contábil Digital (ECD)](https://www.gov.br/sped/pt-br/assuntos/escrituracoes-digitais/ecd)

[2] [Gov.br / Receita Federal — Entregar Escrituração Contábil Fiscal](https://www.gov.br/pt-br/servicos/entregar-escrituracao-contabil-fiscal)

[3] [Portal SPED / Receita Federal — EFD-Reinf](https://www.gov.br/sped/pt-br/assuntos/escrituracoes-digitais/efd-reinf)

[4] [Portal SPED / Receita Federal — EFD-Contribuições](https://www.gov.br/sped/pt-br/assuntos/escrituracoes-digitais/efd-contribuicoes)

[5] [Planalto — Lei nº 8.934/1994, Registro Público de Empresas Mercantis](https://www.planalto.gov.br/ccivil_03/leis/L8934compilado.htm)

[6] [Receita Federal — Solução de Consulta SRRF06/Disit nº 6.018/2018](http://normas.receita.fazenda.gov.br/sijut2consulta/anexoOutros.action?idArquivoBinario=64075)

[7] [Banco Central do Brasil — O que é instituição de pagamento?](https://www.bcb.gov.br/pre/composicao/instpagamento.asp?frame=1)

[8] [Receita Federal — DCTFWeb e MIT](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb)

[9] [Portal Gov.br — Nota Fiscal de Serviço eletrônica](https://www.gov.br/nfse/pt-br)
