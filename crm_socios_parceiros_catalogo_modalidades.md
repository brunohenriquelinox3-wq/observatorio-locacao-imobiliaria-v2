# Setor Sócios e Parceiros — catálogo completo de modalidades

**Status:** `decisão_aprovada_pelo_usuário`  
**Nome do setor:** **Sócios e Parceiros**.  
**Princípio:** o setor cadastra todas as pessoas, empresas e vínculos que participam de um empreendimento, mas **cada contrato e cada negociação permanecem independentes**. A mesma pessoa pode ter mais de uma modalidade, em empreendimentos, fases, quadras, lotes, contratos ou períodos diferentes.

> O setor não é uma lista simples de contatos. Ele é um **dossiê de participação**: quem participa, por que participa, em qual objeto, por qual contrato, com qual direito, condição, vigência, documento, aprovação e histórico.

## 1. Catálogo de modalidades de participação

| Grupo | Modalidade cadastrável | Exemplo de participação | Observação de integridade |
| --- | --- | --- | --- |
| **Societária** | Sócio fundador/controlador | Criou ou controla a empresa/SPE do empreendimento. | Participação societária não equivale automaticamente a direito sobre cada parcela. |
| **Societária** | Sócio investidor | Comprou uma porcentagem para participar do empreendimento. | Exige instrumento, classe/percentual, vigência, regra de resultado e aprovação aplicável. |
| **Societária** | Sócio operacional | Participa com trabalho, gestão ou responsabilidade operacional. | Remuneração, pró-labore, comissão e resultado são naturezas distintas. |
| **Societária** | Participante de SPE/SCP/veículo | Pessoa/PJ ligada a veículo específico do empreendimento. | O veículo, a parte e o empreendimento são objetos distintos; vínculo precisa ser datado. |
| **Terra e origem** | Dono/fazendeiro da terra | Proprietário ou possuidor que participa da origem da gleba. | A condição declarada precisa de evidência e não prova, por si só, direito econômico ou poder de venda. |
| **Terra e origem** | Coproprietário/condômino da terra | Mais de uma parte relacionada à mesma gleba/fração. | Fração, representação, consentimento e instrumento devem ficar explícitos. |
| **Terra e origem** | Permutante físico | Recebe lotes/unidades físicos como parte da negociação. | Alocação de lote físico não é payable financeiro automático. |
| **Terra e origem** | Permutante financeiro | Recebe valor fixo, percentual ou fluxo financeiro. | Base, gatilho, ordem, teto, correção, vigência e tratamento de exceção são obrigatórios. |
| **Terra e origem** | Proprietário cedente/cessionário | Cede ou recebe posição/direito vinculado à terra ou contrato. | Cessão deve preservar instrumento, data de eficácia, parte anterior, parte sucessora e aprovações. |
| **Desenvolvimento** | Parceiro de desenvolvimento | Participa da estruturação, incorporação, projeto, regularização ou implantação. | Deve separar serviço/fornecimento de eventual participação econômica. |
| **Desenvolvimento** | Parceiro de obra/infraestrutura | Participa por obra, materiais, infraestrutura, crédito ou condição técnica. | Ordem de compra/serviço não vira direito de distribuição sem contrato específico. |
| **Comercial** | Imobiliária parceira | Intermedeia, vende ou apoia a comercialização. | Comissão precisa de regra, gatilho e revisão contextual; não basta o cadastro da empresa. |
| **Comercial** | Corretor parceiro/associado | Vende, capta ou atende em operação específica. | Vínculo, contrato de associação quando aplicável, comissão e clawback são registros separados. |
| **Comercial** | Captador | Atua na captação da terra, parceiro, cliente ou oportunidade. | Origem captada, base, gatilho e prazo devem ser provados para qualquer direito. |
| **Comercial** | Coordenador/gerente comercial | Organiza equipe/canal e pode ter regra econômica própria. | Poder operacional e direito econômico não podem ser deduzidos um do outro. |
| **Financiamento/garantia** | Investidor não sócio | Aporta recursos sem necessariamente integrar o quadro societário. | Aporte, retorno, prioridade, garantia e risco exigem contrato próprio. |
| **Financiamento/garantia** | Credor/garantidor | Tem garantia, caução, cessão ou relação creditícia com o empreendimento. | Garantia pode restringir lote/fluxo; não é participação societária. |
| **Sucessão e representação** | Espólio/herdeiro/representante | Representa ou sucede participação, terra, contrato ou direito. | Exige documentação, limites de representação e decisão jurídica contextual. |
| **Beneficiário** | Beneficiário de contrato/direito | Recebe vantagem contratual sem ser proprietário, sócio ou parceiro operacional. | Deve guardar a origem do direito e não receber acesso por padrão. |

## 2. Uma parte, vários vínculos

| Situação | Como o CRM deve registrar |
| --- | --- |
| Um fazendeiro é dono da terra e também recebe lotes por permuta. | Uma Parte com dois vínculos distintos: `Dono/Fazendeiro da Terra` e `Permutante Físico`, cada um com instrumento/objeto/condição próprios. |
| Um sócio comprou 20% da participação e também gerencia vendas. | Uma Parte com `Sócio Investidor` e `Sócio Operacional`; participação societária e remuneração operacional não se misturam. |
| Uma imobiliária parceira recebe comissão e um de seus corretores recebe outra parcela. | Pessoa Jurídica com vínculo `Imobiliária Parceira` e Pessoa Física com vínculo `Corretor Parceiro`; cada direito tem recebedor/regra próprios. |
| Um parceiro deixou a operação e cedeu seu direito. | Vínculo anterior continua histórico; registra-se cessão, parte sucessora, data de eficácia e aprovação, sem apagar o passado. |

## 3. Estrutura mínima de cada vínculo de participação

| Bloco do dossiê | Campos e evidências mínimos |
| --- | --- |
| **Identidade da parte** | Pessoa física/PJ, CPF/CNPJ quando aplicável, representantes, contatos, documentos, status e política de acesso. |
| **Modalidade** | Tipo de participação do catálogo, função, papel operacional e natureza econômica quando houver. |
| **Escopo** | Empresa/SPE, empreendimento, fase, quadra, lote, contrato, carteira, canal ou evento ao qual o vínculo se aplica. |
| **Contrato/instrumento** | Tipo, número/referência, versão, assinaturas/evidências, vigência, condição de eficácia, anexos e owner de revisão. |
| **Direito econômico** | Valor fixo ou percentual, base, gatilho, prioridade, teto, periodicidade, correção, retenção/suspensão, reversão e recebedor. |
| **Alocação física** | Lote/unidade/fração quando aplicável, condição de entrega, bloqueio no estoque e relação com permuta física. |
| **Aprovação e alçada** | Proponente, aprovador, justificativa, data, estado, vigência, reavaliação e auditoria. |
| **Histórico** | Criação, aditivo, suspensão, cessão, revogação, distrato, divergência, revisão e documentos anteriores. |

## 4. Regras que não podem ser simplificadas

| Regra | Consequência |
| --- | --- |
| Cadastro não cria direito automático. | Cadastrar um sócio, parceiro ou fazendeiro não gera payable, repasse, lote ou acesso. |
| Percentual não é suficiente. | Todo percentual exige base: VGV, fluxo, parcela, resultado, lote físico, valor contratual ou outra base explicitamente definida. |
| Contrato não é genérico. | Cada negociação tem instrumento, objeto, partes, versões, gatilhos, alçadas e efeitos próprios. |
| Lote físico não é dinheiro. | Permuta física cria alocação/restrição no estoque; só cria obrigação financeira se houver regra própria. |
| Sócio não é sinônimo de parceiro. | Participação societária, comercial, de terra, de obra, de crédito e de benefício possuem regras distintas. |
| Passado não é reescrito. | Aditivo, cessão, distrato, ajuste ou suspensão criam fatos/versionamentos, não apagam o vínculo anterior. |
| Acesso não acompanha automaticamente o direito. | Um beneficiário pode ter direito econômico sem ter acesso ao CRM, ao estoque, à carteira ou a outros documentos. |

## Referências internas

[1] [Loteadora, recebíveis e distribuição](crm_loteadora_recebiveis_distribuicao.md)

[2] [Subledger da imobiliária](crm_subledger_imobiliaria.md)

[3] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)
