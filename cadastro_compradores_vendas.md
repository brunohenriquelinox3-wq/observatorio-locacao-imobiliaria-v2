# Cadastro robusto de compradores para imóveis urbanos e lotes

## Tese de desenho

O melhor cadastro de comprador não é uma ficha de crédito disfarçada de formulário comercial. Ele deve acompanhar a maturidade da compra: **interesse → qualificação → imóvel/ativo selecionado → proposta → dossiê financeiro e contratual**. Cada etapa reduz incerteza para a próxima decisão, sem exigir antecipadamente documentos de identidade, comprovantes de renda ou informações de terceiros.

> A jornada precisa informar a equipe sobre aderência, momento e viabilidade declarada. Ela não deve produzir uma aprovação automática, recusa opaca ou promessa de financiamento.

## Modelo de dados

| Entidade | Pergunta operacional | Exemplos de campos |
| --- | --- | --- |
| Comprador principal | Quem iniciou a busca e recebe o atendimento? | Nome de preferência, canal, cidade, idioma e origem. |
| Grupo comprador | Quem pretende adquirir ou participar da proposta? | Co-comprador, cônjuge/companheiro, empresa, representante e papel declarado. |
| Busca | O que procura e para qual uso? | Imóvel/lote, localização, tipo, uso, área, faixa de preço e prazo. |
| Capacidade declarada | Como a pessoa imagina viabilizar a compra? | Recursos próprios, financiamento, FGTS quando aplicável, combinação, aprovação prévia ou ainda sem definição. |
| Ativo de interesse | Qual imóvel/lote passou à fase de proposta? | ID do ativo, preço, situação, reserva, visita e aderência. |
| Proposta | Quais são as condições que precisam de aceite? | Valor, sinal, prazo, condição de crédito, ativos vinculados, validade e partes. |
| Dossiê | Que documentos e evidências são necessários para o meio escolhido? | Identidade, renda, CNPJ, atos, análise financeira e assinatura. |

## Jornada de cinco camadas

| Camada | Objetivo | Tempo alvo | Dado que entra | Dado que não entra ainda |
| --- | --- | ---: | --- | --- |
| 1. Interesse | Criar um perfil de busca utilizável | 60–90 s | Contato, uso, localização, tipo, faixa e prazo | CPF, identidade, renda comprovada, dados bancários e documentos de co-comprador. |
| 2. Qualificação | Preparar recomendação e visita | 3–5 min | Critérios, orçamento total, forma declarada de compra, participantes e restrições | Imposto de renda, extratos, holerites e documentos empresariais. |
| 3. Pré-proposta | Validar condições antes de reservar ou elaborar proposta | 5–10 min | Ativo, oferta, sinal, prazos, condição de crédito e partes declaradas | Arquivo financeiro completo antes de haver finalidade e explicação. |
| 4. Dossiê | Subsidiar financiamento, compliance e contrato quando há operação concreta | variável | Documentos exigidos pelo financiador, vendedor e instrumento | Dados que não alteram a proposta, o crédito ou o contrato. |
| 5. Fechamento | Assinar, registrar e manter trilha | variável | Assinaturas, condições finais, despachos, versão contratual e comunicação | Redigitação de dados e uploads fora do cofre. |

## Cadastro de comprador pessoa física

### Camada 1 — interesse

| Grupo | Campos | Regra de experiência e privacidade |
| --- | --- | --- |
| Contato | Nome de preferência, WhatsApp/telefone, e-mail opcional, canal e horário | Explicar que o contato será usado para encaminhar imóveis e visitas. |
| Objetivo | Moradia, investimento, terreno para construir, segunda residência, outro | Não presumir renda, composição familiar ou perfil de risco a partir do objetivo. |
| Ativo | Casa, apartamento, lote aberto, lote em condomínio/loteamento, comercial ou outro | Para lote, abrir perguntas específicas de construção e infraestrutura. |
| Território | Cidade, regiões/bairros e raio de interesse | Permitir múltiplas áreas em vez de forçar um único bairro. |
| Faixa | Valor total aproximado e teto confortável para custos recorrentes quando aplicáveis | Capturar como faixa, não como declaração formal de capacidade. |
| Momento | Até 30 dias, 31–90, 3–6 meses, mais de 6 meses ou pesquisa | Organizar cadência; não rotular como “quente” de modo invisível. |
| Origem | Portal, rede, indicação, placa, feirão, mídia ou base | Preservar atribuição comercial e preferência de comunicação. |

### Camada 2 — qualificação

| Dimensão | Campos robustos | Próxima decisão que melhora |
| --- | --- | --- |
| Uso e imóvel | Área desejada, quartos, vaga, estado do imóvel, elevador, acessibilidade funcional, sol, segurança, condomínio e preferências | Lista de imóveis e roteiro de visita. |
| Lote urbano | Área mínima, frente, topografia declarada, lote aberto/condomínio, infraestrutura prioritária, restrições de associação aceitas e intenção de construir | Recomendação adequada a lote, sem tratá-lo como unidade construída. |
| Grupo comprador | Compra individual, com co-comprador, por empresa ou outra composição; número de participantes; contato de quem coordena | Descobrir cedo quem precisará acompanhar proposta e assinatura. |
| Recursos declarados | Recursos próprios, financiamento, FGTS quando aplicável, combinação, crédito já pré-aprovado ou precisa de orientação | Distribuir para consultor/financiamento e não perder prazo de proposta. |
| Faixa de entrada e parcela | Faixas de valor de entrada disponível e parcela confortável, sempre “declaradas” | Aferir aderência comercial; não substituir análise bancária. |
| Dependências | Venda de outro imóvel, resgate de investimento, liberação de crédito, aprovação societária ou nenhuma declarada | Identificar condição da proposta e prazo realista. |
| Visita | Presencial/remota, disponibilidade e acompanhantes | Organizar agenda e reduzir desistência. |

## Cadastro de comprador pessoa jurídica

O primeiro contato empresarial deve ser simples, mas já precisa distinguir quem pesquisa o ativo, qual empresa pretende comprar e quem possuirá poder para apresentar proposta e assinar. A Consulta CNPJ permite reunir situação cadastral e QSA como fonte de checagem, mas não substitui a verificação de representação ou de alçada interna. [1]

| Grupo | Campos na qualificação | Gatilho para dossiê |
| --- | --- | --- |
| Empresa compradora | CNPJ, razão social, tipo de entidade, setor e endereço cadastral | Empresa passa à etapa de proposta. |
| Contatos | Pessoa que busca, decisor econômico, jurídico e representante/assinante declarados | Há ativo selecionado e negociação em curso. |
| Objetivo | Sede, expansão, locação futura, estoque, SPE, desenvolvimento, loteamento ou outro | A finalidade influencia diligence, estrutura e prazo. |
| Perfil do ativo | Localização, área, zoneamento/uso declarado, lote/unidade, infraestrutura e prazo | Há correspondência com ativo real. |
| Viabilização declarada | Caixa próprio, crédito, investimento, combinação ou “a definir” | A proposta depende de condição financeira específica. |
| Governança | Aprovação necessária, comitê, conselho, sócios ou procuração declarada | A proposta precisa de deliberação ou assinatura. |

No dossiê de comprador PJ, devem entrar apenas as evidências necessárias à operação concreta: identificação do representante, atos constitutivos/alterações, certidões ou evidências solicitadas pelo financiador/contrato e documentos de poderes ou deliberação aplicáveis. A plataforma deve sinalizar “em revisão” e não concluir que o QSA ou o contato comercial autoriza sozinho uma compra.

## Da intenção à proposta: formulário de pré-proposta

Quando existe ativo definido, o sistema abre um formulário de pré-proposta separado do cadastro de busca. Ele deve gerar um quadro claro de condições, com histórico de versões e aceite de quem está apresentando a proposta.

| Grupo | Campos | Observação de governança |
| --- | --- | --- |
| Ativo | Código interno, endereço resumido, lote/unidade, preço de referência e versão da tabela | Congelar a versão consultada na data da proposta. |
| Partes | Comprador(es) declarados, empresa se houver, representantes e contatos | Identificar lacunas de participação antes de formalizar. |
| Condição econômica | Valor ofertado, sinal, fonte declarada, forma de pagamento, parcelas e correção quando aplicável | Usar validação de soma e calendário; revisar instrumento jurídico. |
| Condições | Financiamento, venda de outro ativo, aprovação societária, vistoria, documentação ou outra condição | Condições devem ser visíveis, versionadas e ter prazo. |
| Vigência | Data/hora de validade, prazo para resposta e próximos responsáveis | Evita negociação sem dono ou com condição expirada. |
| Ciência | Declaração de que proposta depende de aceite e análise aplicáveis | Não exibir como aprovação automática ou contrato concluído. |

## Dossiê de crédito e contratação

O checklist de documentação básica para crédito imobiliário da CAIXA ilustra que, para comprador pessoa física, identidade e comprovante de renda atualizado pertencem à solicitação formal; em uso de FGTS, há ainda declaração de imposto de renda e carteira de trabalho ou extrato do FGTS. O documento também aponta a certidão atualizada de inteiro teor da matrícula para o imóvel. [2] Portanto, esses dados devem aparecer como **solicitações com finalidade declarada**, vinculadas a proposta e meio de pagamento, e não como requisitos de um lead inicial.

| Cenário | Solicitações possíveis no dossiê | Controles necessários |
| --- | --- | --- |
| Compra PF com recursos próprios | Identidade, informações contratuais, comprovações solicitadas pela operação e evidências de assinatura | Cofre de documentos, acesso mínimo e registro de finalidade. |
| Compra PF com financiamento | Identificação, renda e outros documentos solicitados pelo agente financeiro; dados do imóvel | Separar checklist do banco de checklist interno; nunca prometer aprovação. |
| Compra com FGTS | Itens requeridos pelo agente financeiro e evidências próprias da modalidade | Mostrar que a elegibilidade é definida pela instituição competente. |
| Compra PJ | CNPJ, representação, atos, deliberação/poderes e documentos financeiros solicitados na operação | Distinguir empresa, contato, decisor e assinante. |
| Compra de lote | Além dos itens do comprador, dados urbanísticos e registrais do ativo necessários à operação | Lote deve carregar seu próprio checklist técnico/documental. |

## Proibição de score opaco e dados excessivos

Uma ferramenta de vendas pode priorizar atendimento por prazo, aderência à busca, disponibilidade para visita, completude e condição declarada. Ela não deve inferir ou classificar a elegibilidade de uma pessoa com base em características irrelevantes, dados sensíveis, comportamento externo ou regra não explicável. A aprovação de crédito, a análise documental e as condições de contrato devem permanecer em fluxos apropriados, com revisão humana e base legal definida.

| Pode ser usado para organizar atendimento | Não deve ser usado para decidir automaticamente |
| --- | --- |
| Prazo informado, tipo de ativo, região, faixa, visita e completude | Raça, religião, saúde, orientação, origem, inferências de perfil ou outros dados sem finalidade legítima. |
| Pré-aprovação **declarada** ou condição de financiamento informada | Supor capacidade de crédito ou acesso a financiamento sem a análise do agente competente. |
| Dependência de venda de outro imóvel ou aprovação interna declarada | Negar atendimento com base em regra secreta. |

## Segurança, LGPD e experiência

A LGPD requer finalidade, adequação, necessidade, transparência, segurança e prestação de contas. [3] O cadastro deve permitir que cada pessoa veja o motivo da solicitação, quais etapas ainda estão pendentes e quem recebe cada documento. A documentação deve ser armazenada com controle por função e não enviada por canais abertos.

| Controle | Implementação recomendada |
| --- | --- |
| Explicação de finalidade | Texto específico antes de dados de identidade, renda, FGTS, CNPJ ou documentos societários. |
| Mínimo necessário | Formulário inicial por faixas; evidência formal só na pré-proposta/dossiê. |
| Acesso | Corretor vê busca e proposta; analista de crédito/documental acessa apenas itens de sua etapa; gestor controla alçadas. |
| Rastreabilidade | Log de upload, visualização, download, solicitação, aceite e alteração de proposta. |
| Retenção | Política por tipo de dado e evento de descarte ou anonimização, revisada pela empresa. |
| Comunicação | Consentimento/canal de contato separado da base usada para executar proposta, contrato ou obrigação legal. |

## Referências

[1] [Gov.br / Receita Federal — Consultar CNPJ](https://www.gov.br/pt-br/servicos/consultar-cadastro-nacional-de-pessoas-juridicas)

[2] [CAIXA — Documentação básica para solicitação de crédito imobiliário](https://www.caixa.gov.br/Downloads/habitacao-documentos-gerais/Docbas-solicit-Cred-Imob.pdf)

[3] [Planalto — Lei nº 13.709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
