# Inventário de integração — pagamentos, beneficiários e cadastro de ativos

**Estado:** `hipoteses_a_auditar`  
**Entradas:** *Mestrado — Dinâmicas de Pagamento a Proprietários e Parceiros* e *Curso Completo — Cadastro de Loteamentos e Imóveis no Sistema*.  
**Regra de leitura:** os materiais são referências de formação e desenho; não viram regra jurídica, fiscal, bancária ou contratual automática sem fonte primária, revisão de especialista e decisão versionada.

## 1. Síntese do novo material

| Trilha | Tese recebida | Integração provável | Limite que permanece |
| --- | --- | --- | --- |
| Pagamentos a beneficiários | A saída deve distinguir repasse de terceiro, distribuição de resultado e comissão; a cascata é contratual e cada pagamento precisa de provisão, alçada, comprovante, conciliação e estorno. | Especializa `Entitlement`, `Payable`, `Settlement`, `DistributionPlan`, conciliação e fila de divergências já estratégicos. | O CRM calcula, registra e instrui; banco/parceiro habilitado executa; contador, jurídico e contrato validam natureza, retenção e prioridade. |
| Proprietário e locação | O aluguel é de terceiro; direito, caixa, dedução e repasse líquido precisam ser distintos. | Refina subledger de locação, prestação de contas, copropriedade e modelo de garantia/antecipação. | Não inferir IRRF, responsabilidade de despesa ou garantia sem contrato, perfil de partes e revisão fiscal. |
| Permutante e loteadora | `% do VGV`, `% do fluxo` e lotes físicos são naturezas diferentes; carência, correção, distrato e cessão de recebíveis não eliminam direito contratual. | Refina origem da gleba, participação do empreendimento, direitos datados e estados de estoque. | Prioridade, base e efeitos de distrato/securitização dependem do contrato e do veículo da operação. |
| Sócios e investidores | Cascata de capital, preferencial, catch-up e split ocorre após resultado apurado e caixa disponível. | Refina distribuição de resultado e indicadores do investidor. | Não tratar pró-labore como lucro nem automatizar distribuição sem apuração contábil e governança societária. |
| Corretores e parceiros | Comissão tem fato gerador contratual, rateio ao centavo e possível clawback. | Refina motor de comissão e eventos reversíveis. | Natureza civil, trabalhista, fiscal e de retenção exige validação contextual. |
| Cadastro do ativo | Ativo é entidade de primeira classe; matrícula, titularidade, origem, ônus, situação fiscal e estado comercial são blocos mínimos. | Refina modelo unificado de imóvel, gleba, empreendimento, lote e unidade. | Cadastro não substitui matrícula atualizada, certidão, registro ou análise jurídica. |
| Loteamento e construtora | Empreendimento gera estoque; origem própria, permuta e sócios pode coexistir e alimentar distribuição. | Refina relação `gleba → empreendimento → quadra → lote` e `participação → entitlement`. | Registro, venda, caução, afetação, RET e distrato dependem de regime, documento e jurisdição. |

## 2. Alegações que exigem confronto prioritário

| Código | Alegação/decisão candidata | Classe | Fonte prioritária a consultar | Risco se incorporada sem revisão |
| --- | --- | --- | --- | --- |
| PAY-01 | Pass-through, distribuição e comissão usam livros e estados distintos. | Arquitetura/controle | Contabilidade, contrato, parceiro de pagamento e subledger já aprovado. | Mistura de caixa de terceiro, receita e resultado. |
| PAY-02 | A cascata respeita prioridade contratual e não paga além da disponibilidade elegível. | Algoritmo/contrato | Contrato, política aprovada e testes de invariantes. | Pagamento indevido ou prioridade invertida. |
| PAY-03 | Rateio por maior resto fecha ao centavo. | Matemática/engenharia | Especificação versionada e testes de propriedade. | Diferença residual ou viés de rateio. |
| PAY-04 | Pagamento tem ciclo `a_apurar → provisionado → autorizado → pago → conciliado`, com retenção/suspensão/estorno. | Modelo de estado | Estratégia anti-erro, parceiro e controladoria. | Confundir obrigação, instrução e liquidação. |
| PAY-05 | `% VGV`, `% fluxo`, lotes físicos e distribuição de lucro são direitos diferentes. | Domínio/contrato | Permuta, acordo societário e contratos por empreendimento. | Base errada ou estoque vendido indevidamente. |
| PAY-06 | Garantia ou antecipação cria valor a recuperar e risco separado. | Crédito/financeiro | Contrato de garantia, política de crédito e contabilidade. | Pagar sem cobertura ou esconder inadimplência. |
| ASSET-01 | Matrícula, ônus, titularidade e documentação são gates do objeto. | Cadastro/jurídico | Registro de imóveis, documento e jurídico. | Anúncio/venda de ativo irregular. |
| ASSET-02 | `gleba → empreendimento → quadra → lote` é distinto de imóvel individual de terceiro. | Modelo de domínio | Lei aplicável, produto e operações. | Estoque e receita errados. |
| ASSET-03 | Origem da terra é estrutura de participação, não campo único. | Domínio/financeiro | Aquisição, permuta, SPE/SCP e contratos. | Distribuição e base de custo incorretas. |
| ASSET-04 | Estados `caucionado` e `permutante` retiram o item do estoque disponível. | Regra comercial/jurídica | Garantia, matrícula, contrato e aprovação operacional. | Reserva/venda duplicada. |
| ASSET-05 | Venda/locação de terceiro reconhecem comissão/taxa, não o preço integral do ativo como receita da imobiliária. | Financeiro/contábil | Contrato, plano de contas e contador. | Receita/faturamento distorcidos. |

## 3. Invariantes candidatos a testes futuros

| Invariante | Aplicação | Evidência mínima |
| --- | --- | --- |
| `soma(direitos provisionados) ≤ base elegível de entrada` | Repasse de fluxo, comissão e cascata. | Evento de caixa, regra datada, versão de contrato e cálculo reproduzível. |
| `soma(rateio) = total distribuído` em centavos | Coproprietários, corretores, investidores e múltiplos recebedores. | Pesos versionados, ordem de maior resto e log do residual. |
| Nenhum settlement confirmado sem comprovante/parceiro e correlação | Todas as naturezas de saída. | Referência externa, idempotência, evento e conciliação. |
| Unidade com estado especial não entra em disponibilidade | Lote caucionado/permutante ou unidade reservada. | Estado, origem, lock transacional e audit event. |
| Direito, instrução, settlement e conciliação não são o mesmo evento | Financeiro e pagamentos. | IDs distintos e máquinas de estado compatíveis. |

## 4. Conflitos e limites preservados

1. O material usa linguagem de “motor que paga”; a estratégia canônica mantém o CRM como **orquestrador e subledger**, não banco, liquidante ou autoridade fiscal.
2. Percentuais de retenção, distrato, benefício fiscal e calendário não serão constantes globais. Permanecem parâmetros contratados, versionados e revisados por contador/jurídico.
3. “Securitização não apaga direito” é hipótese de desenho de entitlement; cessão, coobrigação, conta de recebimento e ordem efetiva exigem documento específico.
4. A matrícula é uma âncora de evidência, não prova suficiente por si só para liberar operação sem atualização, análise de ônus e aprovação responsável.

## 5. Documentos canônicos a atualizar após auditoria

| Documento | Atualização esperada |
| --- | --- |
| `estrategia_crm_imobiliario_consolidada.md` | Direitos de saída, ativo como entidade de primeira classe, gates de venda e limites operacionais. |
| `crm_loteadora_recebiveis_distribuicao.md` | Contraste VGV/fluxo/lotes, distrato, cessão e ordem datada de cascata. |
| `crm_subledger_imobiliaria.md` | Naturezas de saída, prestação de contas, provisão/settlement/conciliação e evidência. |
| `arquitetura_crm_netlify_supabase.md` | Entidades futuras, RLS e comandos somente após a fundação administrativa. |
| `backlog_competitivo_crm.md` | Critérios de aceite e testes que especializam itens já existentes, evitando duplicidade. |

## 6. Próxima ação

O próximo ciclo confrontará `PAY-01` a `PAY-06` com fontes prioritárias. Em paralelo, `ASSET-01` a `ASSET-05` serão confrontados com fontes registrais, de loteamento, incorporação e locação. Só então cada hipótese poderá ser promovida, reescrita, adiada ou rejeitada.
