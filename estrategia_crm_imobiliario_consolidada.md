# Estratégia consolidada para um CRM imobiliário evolutivo

## Locação, vendas urbanas, lotes e pesquisa contínua

**Elaborado por Manus AI · Agosto de 2026**

> **Atualização estratégica — revisão viva de agosto de 2026:** loteadoras e desenvolvimento de loteamentos deixam de ser vertical adjacente e passam a ser um domínio de primeira classe, no mesmo nível de locação, venda urbana e venda de construtora. Os estudos fornecidos pela BHL foram incorporados como referências de domínio e confrontados com fontes externas oficiais e setoriais; toda afirmação sensível mantém fonte, escopo, limitação e estado de revisão.

## Mudança de tese: loteadora é desenvolvimento urbano, não corretagem de lote

O CRM deve atender quatro linhas de negócio conectadas: locação, venda urbana, construtora/incorporação e loteadora/desenvolvimento urbano. A última possui um ciclo próprio — gleba, diligência, viabilidade, projeto, aprovação, registro, infraestrutura, estoque, venda, recebíveis, quitação e pós-entrega — e não pode ser reduzida ao funil de proposta de um imóvel usado.

| Domínio | Unidade de valor | Módulos especializados agora previstos |
| --- | --- | --- |
| Locação | Contrato e relacionamento de ciclo longo | Garantia, apólice, vistoria, cobrança, repasse e renovação. |
| Venda urbana | Transação até o registro | Diligência, proposta, financiamento, escritura e registro. |
| Construtora | Unidade/reserva e plano durante a obra | Estoque de unidade, tabela, fluxo de pagamento, repasse e distrato. |
| Loteadora | Empreendimento, lote e carteira própria | Gleba, regra municipal, aprovação, obra, garantia, lote, permutante, recebível e pós-entrega. |
| Financeiro transversal | Evento econômico, obrigação, caixa e competência | Subledger, cobrança, conciliação, distribuição, contabilidade e integração. |

O recorte mineiro divulgado para o primeiro trimestre de 2026 ilustra por que o CRM precisa separar unidades, VGV, tipo de empreendimento, ticket, praça e período: a pesquisa reportou 2.958 lotes vendidos, alta de 40,9% ante o primeiro trimestre de 2025, ao mesmo tempo que o VGV divulgado diminuiu. A pesquisa cobre municípios responsáveis por 41% da população e 57% do potencial de consumo de Minas Gerais; não é um retrato de todo o estado. [9]

## Arquitetura revisada de loteadora

O domínio de loteadora passa a usar estados ortogonais. Um empreendimento pode estar simultaneamente registrado, em obras e em vendas; um lote pode estar matriculado, caucionado e não disponível. Portanto, disponibilidade comercial, alocação, registro e carteira devem ser dimensões separadas. Gates documentais impedem venda sem registro revisado, reserva incompatível, liberação de lote caucionado ou retorno automático de lote distratado ao estoque. O contrato e seu quadro-resumo devem versionar condições de índice, juros, distrato e restituição; percentuais nunca devem ficar fixos como regra universal de software. [10] [11]

## Estratégia de revisão aberta

Toda nova fonte passa a registrar a afirmação, escopo, período, método, limitação, confiança, responsável, data de revisão e impacto potencial. A fonte pode ser oficial, setorial, fornecida por parceiro ou observação de piloto. Em caso de conflito, o sistema preserva as versões e abre proposta de mudança; não “corrige” a história substituindo um dado silenciosamente. Essa governança permite melhorar a estratégia continuamente sem transformar hipótese em regra de produto.

## 1. Decisão de produto

O produto futuro deve ser construído como um **CRM de relações imobiliárias**, e não como uma agenda de leads ou um portal de anúncios. O núcleo precisa representar, no tempo, as relações entre pessoas e empresas, ativos, território, intenção de negócio, proposta, documento e evidência. A mesma estrutura deve suportar locação residencial, vendas urbanas, lotes urbanos e loteadoras; o que muda em cada caso são os campos, checklists, regras de passagem e responsáveis.

> **Tese central:** a vantagem competitiva não vem de coletar mais dados. Ela vem de conservar o contexto correto, pedir a evidência na etapa certa e converter estudo de mercado em decisão rastreável.

### 3.1 Base técnica obrigatória: Netlify + Supabase

A estratégia passa a ter uma base de plataforma explícita. **Netlify** será a camada de entrega web, domínio, CDN, previews protegidos e funções de borda; **Supabase** será a plataforma de identidade, Postgres, autorização por linha, documentos privados, funções de domínio, migrações e eventos duráveis. Essa divisão protege a fluidez visual do produto sem deslocar a verdade operacional para o frontend ou para uma automação de deploy. [32] [33]

| Decisão de plataforma | Aplicação no CRM | Regra de segurança e operação |
| --- | --- | --- |
| Entrega Netlify | App web responsivo, previews por mudança, configuração por ambiente e endpoints de borda quando justificável. | Preview usa dados sintéticos/anonimizados e projeto de homologação separado; nenhum segredo crítico é empacotado no navegador. |
| Postgres Supabase | Relações, ativos, estoque, proposta, contrato, evento, direito, lote, evidência, auditoria e casos de exceção. | Toda tabela exposta recebe RLS, grants mínimos, índice de policy e teste de permitir/negar. |
| Supabase Auth + MFA | Sessão, usuário, membership e alçada de autenticação. | Papel não libera acesso sozinho; alçada, escopo e MFA reforçado protegem ações sensíveis. |
| Storage privado | Dossiê, evidência, versão, hash e acesso temporário a binário. | Documento não recebe URL pública persistente; download é controlado e auditável. |
| Functions, outbox e inbox | Integração com cobrança, ERP, assinatura, portais e serviços habilitados. | Saída nasce em transação com idempotência; callback é autenticado, deduplicado, correlacionado e reconciliado. |

> **Princípio de implementação:** uma tela pode ser rápida no Netlify, mas uma ação que altera disponibilidade, proposta, contrato, direito econômico, caixa, acesso ou evidência crítica só é concluída por comando transacional e auditável no Supabase.

## 2. O que os estudos revelam

O mercado de locação tem escala e crescimento: os domicílios alugados passaram de 12,2 milhões em 2016 para 18,9 milhões em 2025, e o preço pedido de locação na amostra FipeZAP avançou 9,28% em 12 meses até julho de 2026. [1] [2] Nas vendas urbanas, o índice de preço pedido acumulou alta de 5,63% em 12 meses até abril de 2026, com forte variação territorial. [3] Lotes exigem tratamento próprio: no recorte de Minas Gerais, foram 2.958 lotes vendidos no primeiro trimestre de 2026, alta de 40,9% sobre o mesmo trimestre anterior. [4]

Esses sinais não devem ser usados como promessa de retorno, avaliação definitiva ou decisão automática de preço. Eles justificam três capacidades de CRM: inteligência territorial, cadastro progressivo e rastreabilidade de dossiê.

| Domínio | Implicação de produto | Capacidade do CRM |
| --- | --- | --- |
| Locação | Perfil de busca deve capturar território, custo total, momento de mudança e critérios reais de moradia | Busca, qualificação, match explicável, visita e proposta de locação. |
| Vendas urbanas | Proprietário, ativo, autoridade de venda e comprador precisam ser objetos distintos | Captação de ativo, partes relacionadas, proposta versionada e dossiê. |
| Lotes urbanos | Empreendimento, fase, quadra, lote, infraestrutura e regra local mudam a operação | Entidade empreendimento/lote, tabela, alçada e checklist específico. |
| Governança | Dados pessoais e documentos exigem finalidade, segurança e controle | Campos condicionais, cofre, permissões, auditoria e retenção. |
| Pesquisa | Indicadores e normas mudam; contexto não pode se perder | Catálogo de fontes, snapshot, evidência, revisão e nota de mudança. |

## 3. Princípios que não podem ser negociados

| Princípio | Como aparece no produto |
| --- | --- |
| Um núcleo, várias jornadas | Parte, ativo, proposta, evidência, território, tarefa e atividade são universais; locação, venda e lote configuram regras próprias. |
| Relação antes de rótulo | Uma pessoa ou empresa pode assumir vários papéis ao longo do tempo, sem duplicação de cadastro. |
| Progressão por finalidade | Interesse, qualificação, proposta, dossiê e contrato abrem dados distintos e proporcionais à decisão. |
| Evidência antes de certeza | O CRM trabalha com declarado, recebido, em revisão, divergência e próxima ação; não declara regularidade, crédito ou poder automaticamente. |
| Prioridade explicável | Urgência declarada, aderência, completude e relacionamento organizam a fila sem criar score oculto. |
| Território estruturado | Cidade, bairro, empreendimento e lote são filtráveis, comparáveis e conectados a indicadores. |
| Mudança versionada | Fonte, regra, proposta, preço e checklist têm histórico e reversibilidade. |

## 4. Modelo de dados canônico

| Entidade | Responsabilidade | Relações essenciais |
| --- | --- | --- |
| Party | Pessoa física, pessoa jurídica ou contato institucional | Assume papéis, participa de grupo, proposta, dossiê e atividades. |
| Party role | Papel temporal de uma parte | Proprietário, comprador, locatário, representante, procurador, fiador, contato comercial. |
| Asset | Imóvel, unidade ou ativo | Possui território, atributos, relação com partes, listagem, proposta e dossiê. |
| Enterprise / Lot | Empreendimento, fase, unidade/lote e regras de comercialização | Conecta lote a tabela, condição, infraestrutura e ativos. |
| Search profile | Intenção de locar, comprar, investir, vender ou construir | Relaciona parte/grupo a território, critérios, prazo e viabilização declarada. |
| Listing | Objeto de divulgação ou comercialização | Vincula ativo a preço/tabela, canal, autorização, versão e estado. |
| Proposal | Oferta versionada | Vincula ativo, partes, condições, valor, prazo, alçada e estados. |
| Dossier / Evidence | Checklist e arquivos/declarações por finalidade | Armazena origem, validade, acesso, revisão e pendências. |
| Activity / Task | Linha do tempo operacional | Registra comunicação, visita, próximo passo, responsável e prazo. |
| Market evidence | Dado ou estudo externo estruturado | Relaciona fonte, recorte, confiança, impacto e versão de regra/painel. |
| Financial event | Fato econômico imutável originado no negócio | Empresa/SPE, contrato, competência, valor, fonte, regra e evidência. |
| Receivable / Payable | Direito de receber ou obrigação de pagar/repassar | Parte, vencimento, estado, contrato, gatilho, documento e aplicação de caixa. |
| Settlement / Cash application | Liquidação externa e sua aplicação a obrigações | Identificador do provedor/banco, valor, data, diferença, conciliação e revisor. |
| Distribution plan / Entitlement | Cascata de direitos econômicos configurados | Base, versão, ordem, fórmula, beneficiário, bloqueio, alçada e reversão. |
| Accounting export batch | Lote de eventos preparado para sistema fiscal/contábil | Empresa, competência, esquema, mapeamento, itens, retorno e divergências. |

## 5. Jornadas que devem entrar em ordem

| Ordem | Jornada | Resultado mínimo |
| ---: | --- | --- |
| 1 | Captação de proprietário e ativo | Ativo identificado, responsável, próxima ação e diagnóstico inicial sem coleta excessiva. |
| 2 | Busca e qualificação | Perfil de demanda com território, faixa, prazo e critérios suficientes para orientar o atendimento. |
| 3 | Match, visita e feedback | Carteira sugerida de forma explicável e aprendizagem estruturada de recusa/interesse. |
| 4 | Pré-proposta e proposta | Ativo, partes, condições, vigência, versão e alçada em um objeto rastreável. |
| 5 | Dossiê por finalidade | Checklist, documento, evidência, acesso e responsável adequados à operação concreta. |
| 6 | Pós-contrato e inteligência | Renovação, vacância, fechamento, distrato, absorção de lote e melhoria do funil. |

### Cadastro robusto de proprietários

O proprietário PF deve iniciar com contato, ativo, cidade, faixa, prazo e relação declarada. Somente na captação/dossiê entram participantes, matrícula, identidade, estado civil quando aplicável, procuração, IPTU e autorização comercial. Para proprietário PJ, o CNPJ inicia a identificação, mas contato comercial, representante, assinante e poderes devem ser entidades distintas. A Consulta CNPJ e o QSA são evidências de checagem, e não confirmação automática de poder de venda. [5]

### Cadastro robusto de compradores

O comprador PF deve começar por objetivo, tipo de ativo, região, faixa, prazo e canal de contato. A qualificação abre grupo comprador, critérios, recursos próprios/financiamento/FGTS declarados, entrada/parcela por faixa e dependências. Apenas em pré-proposta/dossiê entram identificação e documentos solicitados pela operação ou financiador. O checklist da CAIXA ilustra que identificação, renda, documentação de FGTS e matrícula pertencem à solicitação formal de crédito, não ao primeiro contato. [6]

## 6. Segurança, LGPD e limites de automação

A LGPD determina princípios como finalidade, adequação, necessidade, transparência, segurança e prestação de contas. [7] Assim, o produto deve adotar coleta condicional, cofre documental, acesso por função, logs, retenção configurável e versão de consentimento/base legal. A ANPD oferece orientações de segurança para agentes de pequeno porte que reforçam a necessidade de controles organizacionais e técnicos. [8]

| O CRM pode fazer | O CRM não deve fazer |
| --- | --- |
| Organizar prioridade, tarefa, pendência, evidência e próxima ação | Aprovar crédito, declarar poder societário ou regularidade imobiliária automaticamente. |
| Sugerir ativos com critérios explicáveis | Excluir pessoas por score secreto ou atributos sem finalidade legítima. |
| Mostrar indicador territorial com fonte e método | Tratar preço anunciado como valor garantido ou preço de fechamento. |
| Solicitar documento na fase correta | Exigir dossiê completo no primeiro formulário de interesse. |

## 7. Atualização contínua de estudos

A pesquisa deve se tornar um módulo interno: **catálogo de fontes → snapshot → evidência estruturada → revisão → proposta de impacto → nota de mudança**. Cada evidência contém emissor, URL/arquivo, período, território, valor, método, limitação, data de captura, versão e estado. A atualização jamais substitui silenciosamente o passado.

| Abordagem | Trade-offs | Custo | Complexidade |
| --- | --- | --- |
| Curadoria guiada por formulário | Maior controle editorial; depende de disciplina e responsável | Baixo | Baixa |
| Atualização periódica assistida | Reduz trabalho repetitivo; exige manutenção quando fontes alteram formato | Moderado | Média |
| Integração por evento do emissor | Mais rápida; só existe quando a fonte oferece aviso oficial e exige validação | Variável | Média a alta |

Essas abordagens são complementares. A escolha deve ser feita depois de três ciclos de revisão realizados com sucesso, quando a operação souber o número de fontes, a frequência e o nível de interpretação necessário. Nenhuma alternativa elimina revisão humana para uso de dados legais, metodológicos ou de alto impacto.

## 8. Roteiro de desenvolvimento

| Fase | Janela | Entregável | Critério de passagem |
| --- | ---: | --- | --- |
| Fundação administrativa | 2–3 semanas | Bootstrap controlado, principal de plataforma, organização inicial, membership, RLS, MFA, revogação e `AdminAuditEvent`. | Um usuário sem grant não atravessa organização, arquivo, função ou URL; todo comando privilegiado deixa evidência. |
| Descoberta e vocabulário | 3–4 semanas | Mapa de operação de três parceiros, dicionário canônico e linha de base | Equipes reconhecem os mesmos estados e objetos. |
| Núcleo operacional | 6–8 semanas | Party, asset, perfil de busca, tarefa, timeline e fila | A equipe recupera contexto sem planilha paralela. |
| Proposta e dossiê | 6–8 semanas | Versões de proposta, checklist, evidência, cofre e permissões | Menos reabertura documental e histórico preservado. |
| Vendas e lotes | 6–8 semanas | Proprietário PF/PJ, comprador PF/PJ, lote/empreendimento, tabela e alçada | Operação de lote deixa de depender de tabela paralela. |
| Núcleo financeiro e contábil | 8–10 semanas | Subledger, cobrança, carteira, distribuição, conciliação, workspace do contador e exportação | Uma competência-piloto fecha com origem, saldo, evidência e retorno explicáveis. |
| Inteligência e pesquisa | 4–6 semanas | Biblioteca de evidências, painel territorial, calendário de fontes e notas de mudança | Gestão usa pesquisa em revisão de carteira. |
| Integrações e escala | Contínua | Adaptadores, sincronização monitorada e configuração controlada | Integração reduz retrabalho sem perder origem/versão. |

## 8.1 Revisão do núcleo cadastral e da carteira

O estudo de fichas cadastrais e carteira fornecido pelo parceiro reforça que o cadastro é uma infraestrutura de contrato e relacionamento, não uma tela isolada. A estratégia passa a adotar uma `Party` única para pessoa física ou jurídica, com papéis temporais, grupos de assinatura, relações de representação, dossiês por finalidade e evidências com origem, acesso, validade e revisão. Essa decisão permite que a mesma parte seja proprietária, compradora, locatária, representante, permutante ou sócia sem duplicação de dados. [12]

O produto não deve aplicar um único estado “aprovado”. Ele passa a expor dimensões independentes — qualificação, representação, assinatura, capacidade, compliance, dossiê e relacionamento — porque uma pendência documental não significa, por si só, que uma parte esteja inelegível em todos os contextos. A coleta inicial permanece curta; renda, documentos, estado civil, fonte de recursos e evidências societárias só são abertos quando a finalidade, o instrumento ou a política aplicável justificam a solicitação.

| Revisão incorporada | Resultado de produto | Proteção necessária |
| --- | --- | --- |
| `Party` + papéis temporais | Uma identidade atende a vários negócios e linhas de produto | Deduplicação assistida, origem de dado e acesso por função. |
| Dossiê progressivo | Checklist de proposta, contrato, lote, permuta ou sociedade no momento certo | Não pedir documentos sem finalidade concreta. |
| Representação e assinatura | Contato comercial deixa de ser confundido com assinante ou procurador | Avaliação humana de poderes e necessidade de participação. |
| Crédito e compliance como casos | Decisões, condições e pendências ficam explicáveis e restritas | Nenhuma decisão automática opaca ou exposição ao comercial. |
| Carteira em duas lentes | Relacionamento e recebível compartilham contexto sem se confundirem | CRM não substitui contabilidade, cobrança ou análise jurídica. |
| Política de mercado versionada | Regras operacionais podem mudar por cenário e empreendimento | Versão, dono, data, exceção e reversão visíveis. |

Na PLD/FT, a Lei nº 9.613/1998 inclui a promoção imobiliária e a compra e venda de imóveis entre atividades submetidas aos mecanismos de controle, e prevê identificação/cadastro atualizado, incluindo representantes autorizados e proprietários de pessoas jurídicas. [13] O CRM deve, portanto, sustentar casos restritos de compliance, trilha de evidências e política de retenção configurável; não deve transformar uma ficha comercial em uma conclusão de suspeita ou em uma comunicação automatizada. O Siscoaf é o ambiente oficial de comunicações e requisições às pessoas obrigadas, e qualquer integração futura requer habilitação, escopo e governança próprios. [14]

Na proteção de dados, finalidade, adequação, necessidade, transparência, segurança e prestação de contas exigem que a plataforma registre a hipótese e a finalidade de cada coleta. A LGPD prevê várias bases legais, incluindo execução de contrato/procedimentos preliminares, obrigação legal/regulatória, legítimo interesse e proteção do crédito; consentimento é uma delas, não a etiqueta universal do cadastro. [15] A necessidade de assinatura ou participação de cônjuge também deve ser registrada como avaliação com evidência e responsável, não inferida automaticamente apenas por estado civil ou por uma regra de tela. [16]

## 8.2 Revisão organizacional: sócios, parceiros e colaboradores

O CRM passa a incorporar o lado interno da operação como uma camada de **relações organizacionais**, sem assumir o papel de RH, folha, saúde ocupacional, contabilidade societária ou jurídico. A entidade `Party` permanece única, mas cada pessoa ou empresa se liga a uma `Organization` por um `Engagement`: participação societária, prestação de serviço, colaboração, associação de corretagem ou terceirização. Poderes e acessos surgem como relações próprias, com escopo, instrumento, vigência, aprovação e recertificação.

| Relação | O CRM coordena | O sistema não deve armazenar/calcular |
| --- | --- | --- |
| Sócio ou holding | Participação por empresa/SPE, poder operacional, instrumento de referência e alçada | Pró-labore, lucros, impostos, escrituração e decisão jurídica societária. |
| Parceiro profissional | Escopo, contrato, acesso mínimo, procuração, responsável interno e avaliação de dados | Parecer confidencial, faturamento fiscal detalhado ou enquadramento automático de controlador/operador. |
| Colaborador | Função, unidade, estado mínimo de elegibilidade de acesso e recertificação | Folha, prontuário, ASO, biometria, dependentes e informação clínica. |
| Corretor associado | Registro declarado, instrumento, vigência, praça/produto, acesso e participação no negócio | Folha, ponto ou qualquer suposição de vínculo de emprego. |
| Terceirizada | Empresa prestadora, escopo, local, contrato, gestor e evidências acordadas | Dados individuais da equipe, salvo necessidade/obrigação específica. |

A Lei nº 6.530/1978 permite a associação do corretor a uma ou mais imobiliárias por contrato específico registrado, preservando sua autonomia profissional no contexto previsto e condicionando o arranjo à ausência dos elementos caracterizadores do vínculo de emprego. [17] O CRM deve, portanto, tratar esse papel fora do fluxo de empregado, guardar evidência e vigência, e deixar a análise trabalhista para os responsáveis habilitados.

Para empregados, o eSocial informa que o registro deve ocorrer até a véspera do início das atividades; a NR-7 determina que o exame admissional seja realizado antes do início e que dados de exame componham prontuário médico individual. [18] [19] O produto deve integrar apenas um estado operacional mínimo para acesso/atividade, preservando o conteúdo médico e de RH em seus domínios restritos. A mesma separação vale para PGR/SST: o CRM pode coordenar uma pendência operacional autorizada, mas não se converte em prontuário, laudo ou sistema de medicina ocupacional. [20]

> **Nova regra de arquitetura:** nenhuma relação interna é, por si, uma credencial. Ser sócio, parceiro ou colaborador não concede acesso automático a carteira, dossiê, alçada, tabela ou recebível. Toda permissão precisa registrar finalidade, escopo, aprovador, vigência, política aplicada e revisão.

## 8.3 Núcleo financeiro, fiscal, contábil e de distribuição

> **Limite de responsabilidade:** o CRM é fonte operacional rastreável e workspace de reconciliação; ele não substitui contador, ERP, banco, instituição de pagamento, profissional fiscal ou validação jurídica. Regime, documento, retenção, reconhecimento, obrigação e pagamento precisam ser aprovados no contexto de cada empresa, SPE, contrato, município e competência.

O novo núcleo financeiro posiciona o CRM como um **subledger orientado por evento**, e não como um campo de saldo ou razão contábil paralelo. A ECD abrange livros como Diário, Razão, balancetes, balanços e fichas de lançamento; a ECF reúne operações voltadas à apuração de IRPJ e CSLL; EFD-Reinf, EFD-Contribuições, DCTFWeb/MIT e NFS-e possuem escopos, retornos e leiautes próprios. [21] [22] [23] [24] [25] [26] O produto deve preservar a origem de cada evento, competência, contraparte, documento, política e referência de integração, para que o fiscal e a contabilidade trabalhem com contexto verificável.

| Camada | O CRM registra | O responsável especializado valida/executa |
| --- | --- | --- |
| Contrato e subledger | Evento, receivable, payable, competência, parcela, saldo derivado e evidência | Enquadramento, reconhecimento, lançamento e escrituração. |
| Cobrança e caixa | Instrução, retorno, liquidação, aplicação, tarifa e divergência | Serviço de cobrança/liquidação contratado, extrato e conciliação bancária final. |
| Loteadora | Empreendimento, lote, contrato, entrada, parcela, índice, distrato, permuta e carteira | Tratamento contábil/fiscal e efeitos jurídicos de cada instrumento. |
| Distribuição | Base, versão de plano, percentual/fixo, faixa, recebedor, gatilho, bloqueio e alçada | Documento, pagamento, retenção, obrigação e análise da natureza econômica. |
| Fechamento | Snapshot, pendência, exportação, retorno e log por empresa/SPE e competência | ECD, ECF, declarações e demais entregas aplicáveis. |

Na loteadora, uma cascata de distribuição pode ter muitos recebedores — corretor, imobiliária, captador, permutante, proprietário da terra, parceiro, sócio ou fornecedor — em valores fixos ou percentuais. O plano precisa congelar a base, ordem, fórmula, gatilho, teto/piso, regra de arredondamento, recebedor e versão para cada evento elegível. A Solução de Consulta SRRF06/Disit nº 6.018/2018 ilustra que, em cenários concretos de loteamento em terreno de terceiro e participação em vendas, a natureza contratual e a parcela economicamente cabível importam; o documento também ressalva interpretações supervenientes. [27] Portanto, percentuais não podem ser tratados como regra fiscal universal do software.

O Banco Central define instituição de pagamento como pessoa jurídica que viabiliza movimentação de recursos no âmbito de arranjo de pagamento. [28] Por isso, o CRM deve calcular direitos, controlar alçadas e conciliar retornos, enquanto boleto, Pix e eventual split são executados por banco, instituição financeira ou instituição de pagamento contratada/habilitada. Três caminhos seguem abertos à validação: cobrança externa com repasse pós-conciliação; split nativo por um parceiro com capacidades comprovadas; ou orquestração multi-parceiro quando a escala justificar sua complexidade. Não há escolha automática antes de validar limites de recebedores, KYC, liquidação, estorno, tarifas, callbacks, contrato e governança.

Por fim, a Lei nº 8.934/1994 reforça que o registro empresarial dá publicidade, autenticidade, segurança e eficácia aos atos sujeitos a registro, além de manter informações de empresas atualizadas. [29] A área do contador e controladoria deve enxergar empresa/SPE, atos, poderes, faturamento, carteira, documento, distribuição, diferença e lote de exportação no escopo autorizado, sem poder editar a proposta, o contrato ou o retorno bancário original. Fechamento é um ritual de evidência: corte de competência, conciliação, revisão de documento/regra, lote imutável de exportação, retorno e arquivo de auditoria.

## 8.4 Revisão competitiva: o piso do mercado e nossa tese de diferenciação

O benchmark público de dez referências — Kenlo, Vista/Loft, Imobzi, Jetimob, Imoview/Universal, ImobTotal, CV CRM, Facilita, Sienge e Anapro — confirma que captura de lead, atendimento, funil, portais, estoque, reserva, proposta, documento e mobilidade não são diferenciais isolados; são expectativas já estabelecidas para diferentes segmentos do mercado. [30] A nossa estratégia passa a tratá-las como piso de entrega e não como a narrativa central de diferenciação.

| Sinal competitivo | Leitura de estratégia | Decisão de produto |
| --- | --- | --- |
| CRMs de imobiliária unem site, portais, atendimento, locação e repasse | A jornada comercial conectada é requisito de entrada. | Entregar origem, consentimento, responsável, próxima ação e contexto de ativo/parte em um núcleo único. |
| CRMs de lançamento expõem reserva, tabela, proposta, rede e documentos | Estoque e condição comercial precisam sobreviver ao ritmo do plantão e do corretor de campo. | Criar estoque por empreendimento/fase/lote/unidade, reserva com expiração/fila, tabela versionada e alçada. |
| ERPs de construção dominam obra, fiscal, contábil e suprimentos | Não é estratégico duplicar a escrituração ou a gestão física da obra. | Operar como camada de relações, direitos, eventos e evidências com integração e reconciliação de ida/volta. |
| Comissões são recorrentes em marketing de produto | A operação de loteadora ultrapassa uma simples comissão. | Diferenciar com cascatas contratuais de direitos, recebedores, gatilhos, limites, reversões e competência. |
| IA é promessa crescente na aquisição | Automação sem fonte e política degrada confiança em fluxos sensíveis. | Toda IA relevante deve apontar dados, regra, versão, permissão e responsável pela aprovação. |

O espaço mais consistente não é prometer “mais funcionalidades” que os concorrentes. É criar a infraestrutura que liga **empreendimento, lote, contrato, parte, recebível, direito econômico, documento, regra e fechamento**, mantendo a experiência comercial simples para quem está em campo e a trilha de evidências íntegra para gestão, contador e auditoria.

> **Posicionamento revisado:** o sistema operacional de relações, direitos econômicos e evidências para imobiliárias e loteadoras que precisam vender, receber, distribuir e fechar com contexto.

## 8.5 Sistema visual, gráficos e experiência de CRM

A camada visual passa a ser uma competência estratégica do produto, e não uma etapa de acabamento. A primeira impressão precisa comunicar segurança e sofisticação; o uso diário precisa reduzir a carga cognitiva de corretor, gestor, loteadora, financeiro e contador. A decisão visual central é separar duas superfícies coerentes: **o observatório editorial-cartográfico**, que ensina e explica estratégia, e **o workspace operacional**, mais neutro, denso, responsivo e orientado à próxima ação. [31]

| Regra visual | Decisão de produto | Proteção contra erro |
| --- | --- | --- |
| Pergunta antes do gráfico | Todo painel declara pergunta, período, recorte, unidade, fonte e ação possível. | Número sem contexto não vira sinal de gestão. |
| Gráfico abre o dado | Barra, linha, dispersão, mapa/planta e funil conectam à tabela/lista de casos. | Tooltip não é a única fonte de informação e nenhuma visualização fica sem drill-down. |
| Layout por trabalho | Lista compara, detalhe decide, timeline explica; painéis laterais preservam o contexto. | Filtros, empresa/SPE, período e permissões persistem na investigação. |
| Cor com significado redundante | Azul cadastral, argila de decisão, verde de governança e severidades funcionam por token. | Cor vem acompanhada de rótulo, ícone, forma, contraste e estado textual. |
| Tipografia de operação | DM Sans e números tabulares guiam campos, tabelas e valores; Fraunces fica em marcos editoriais. | Corpo e dado crítico não usam fonte decorativa nem rótulo microscópico. |
| Movimento com propósito | Hover, filtro, aba, painel e feedback usam transições curtas e reduzíveis. | Redução de movimento, teclado e foco não dependem de animação. |
| IA verificável | Insight apresenta fontes, recorte, limitação, ação proposta e aprovação humana. | IA não altera contrato, financeiro, reserva, cadastro crítico ou integração sem consentimento e alçada. |

Gráficos padrão serão barras para comparação/prioridade, linhas para tendência, dispersão para relação entre variáveis e mapas/plantas para dimensão territorial. Pizza, donut, gauge, radar e 3D deixam de ser padrão de comparação porque área e ângulo comunicam magnitude com menos precisão; quando forem úteis para contexto secundário, devem vir com total, rótulo e tabela acessível. [31] Os gráficos deverão sempre expor estado de carregamento, vazio, permissão, parcialidade, desatualização, divergência e erro recuperável, pois um “zero” sem estado pode ocultar tanto ausência de negócio quanto falha de integração.

O CRM oferecerá vistas salvas por função, densidade confortável/compacta e exportação/compartilhamento controlados. Em tela estreita, tabela passa a lista/tile orientada pela próxima tarefa; em tela larga, uma tabela pode coexistir com gráfico e painel contextual. Para cada função, a prova visual de valor será diferente: o corretor encontra a próxima ação; a loteadora investiga lote, disponibilidade e carteira; a controladoria abre a diferença até a origem; e o contador reconcilia competência, documento, evento e retorno sem transformar o CRM em ERP.

> **Nova regra de qualidade:** uma interface é aprovada quando o usuário consegue identificar a exceção, explicar o recorte, abrir a evidência e executar a próxima ação autorizada sem depender de planilha paralela ou memória individual.

## 8.6 Arquitetura Netlify + Supabase: produto fluido, dado governado

O CRM futuro não será uma SPA com dados e permissão decididos apenas no cliente. Leituras de trabalho poderão chegar diretamente do Supabase sob RLS; rascunhos de baixo risco terão política explícita; e comandos críticos, como reserva concorrente, aprovação de proposta, fechamento de cascata, aplicação de liquidação e geração de lote, serão funções/RPC transacionais que validam estado, alçada, versão, idempotência e auditoria. [32]

| Fluxo | Implementação base | Resultado que deve ser demonstrado |
| --- | --- | --- |
| Lead, carteira e fila | App Netlify → Supabase com sessão e RLS | Cada usuário lê apenas a organização/SPE/carteira autorizada, com filtro e detalhe rápidos. |
| Reserva e proposta | RPC/endpoint seguro → transação Postgres | Conflito de estoque tem resposta determinística; condição e aprovação preservam versão. |
| Documento e dossiê | Storage privado + metadado de evidência | Upload, versão, leitura e expiração obedecem finalidade, escopo e trilha de acesso. |
| Cobrança, split e ERP | Outbox/inbox + função segura + parceiro habilitado | Nenhuma chamada duplica fato econômico; retorno pode ser reprocessado sem perder origem. |
| Contador e fechamento | Snapshot, lote imutável, exportação e retorno no Supabase | Diferença abre até contrato, evento, política, documento e referência externa. |
| Dashboard e IA | Visões/materializações autorizadas, realtime apenas como sinal de interface | Dado exibido recupera o estado canônico e toda recomendação informa fonte, recorte e responsável. |

O deploy também passa a fazer parte da governança. Alteração de schema, RLS, bucket, policy, função, integração ou visualização crítica entra em migration e revisão de código; chega primeiro a preview protegido e homologação isolada; só segue para produção com teste de regressão, plano de reversão e observabilidade. Agendamentos curtos podem abrir jobs rastreáveis, mas não substituem uma fila persistida nem assumem sozinhos conciliação, fechamento ou processamento pesado. [33]

Essa arquitetura cria a superfície necessária para **explorar dados de forma mais intuitiva**, **entender melhor tendências** e **salvar ou compartilhar facilmente** recortes de gestão, preservando permissões e evidências. As regras de pagamento, fiscalidade, privacidade, retenção, KYC, assinatura e escrituração continuam configuráveis e sujeitas à validação por jurídico, DPO, contador/fiscal e parceiro financeiro habilitado.

## 8.7 Auditoria integral: da pesquisa à engenharia disciplinada

A auditoria integral confirmou a coerência da tese, dos domínios e da arquitetura, mas identificou que o próximo risco não é falta de ideias: é permitir que documentos, integrações e automações cresçam sem um único eixo de decisão. A estratégia passa a operar com uma hierarquia documental explícita: a estratégia consolidada fixa direção; modelo/jornadas/arquitetura definem constituição de produto e plataforma; protocolo/matriz/auditoria governam fonte e mudança; backlog traduz somente decisões já vinculadas a problema, dono, risco e critério de saída. [34]

| Gate de engenharia | O que precisa estar provado | Bloqueia |
| --- | --- | --- |
| Segurança verificável | RLS, grants, payload, arquivo, função e fluxo crítico possuem testes de permitir/negar. | Exposição entre organizações/SPEs, comando por URL/API e função administrativa indevida. |
| Comando transacional | Reserva, proposta, direito, fechamento e compensação declaram precondição, versão, alçada, idempotência e audit event. | Dupla reserva, direito repetido, alteração concorrente e callback reaplicado. |
| Integração confiável | Cada parceiro tem contrato de dados, ownership, inbox/outbox, correlação, tentativa, exceção e reconciliação. | “Sincronização” sem fonte de verdade, suporte ou repetição segura. |
| Operação e recuperação | SLI/SLO, log correlacionado, alerta acionável, runbook, RPO/RTO e teste de restore existem por jornada crítica. | Falha tardia de documento, callback, fila, exportação ou acesso. |
| Release íntegro | Dependência, segredo, migration, policy, configuração e artefato passam por revisão, ambiente isolado e plano de reversão. | Mudança não rastreável, vulnerabilidade de cadeia ou migração sem recuperação. |
| IA governada | Caso de uso, dado permitido, modelo/versão, medição, limite, aprovação e desligamento são registrados. | IA opaca atuando em cadastro, contrato, financeiro, acesso ou integração. |

> **Regra de continuidade:** a linha de evolução passa a ser **constituição → rotina confiável → proposta/evidência → loteadora/carteira → subledger/integrações → inteligência controlada → escala disciplinada**. Nenhuma etapa “salta” fundação técnica, validação de domínio ou limites profissionais por urgência comercial.

As referências atuais de segurança de aplicação/API, confiança zero, telemetria, confiabilidade, incidente, IA e cadeia de software não criam uma checklist universal; elas reforçam que acesso, mudança, evento, dependência e recomendação devem ser medidos e revisados de modo proporcional ao risco. [35]

## 8.8 Revisão operacional de plataforma: segurança é uma sequência de provas

O estudo aprofundado confirma a decisão de Netlify + Supabase, mas torna a estratégia mais precisa: **Netlify entrega a aplicação e o contexto de deploy; Supabase conserva identidade, dado, policy, evento e evidência; nenhum runtime efêmero substitui a transação, a fila ou a reconciliação**. A plataforma não deverá receber dado real ou integração sensível enquanto a capacidade não passar por ambiente, schema, acesso, evidência, integração, operação, recuperação e carga.

| Eixo operacional | Decisão incorporada | Critério de prontidão |
| --- | --- | --- |
| Ambiente e segredo | Preview, homologação e produção têm projeto, credencial, callback e Storage próprios; segredo tem owner, escopo e revisão. | Nenhum preview consulta produção e nenhuma chave privilegiada chega ao browser. |
| Banco e permissão | Migration reúne schema, grant, RLS, índice, função e teste; conexão é escolhida pelo ciclo de vida do cliente. | Uma tabela, view, RPC ou Storage policy só é liberada após provas de permitir/negar e medição de impacto. |
| Documento | Dossiê usa Storage privado, upload retomável, versão, hash, finalidade e URL temporal. | Arquivo interrompido, token expirado e revogação de acesso não expõem nem tornam evidência utilizável indevidamente. |
| Evento e integração | A transação cria fato, auditoria e outbox; fila move trabalho; callback entra por inbox; reconciliação confirma estado. | Duplicata, replay, timeout, 429/5xx e fora de ordem não criam recebimento, direito ou exportação duplicados. |
| Operação | Logs de plataforma apoiam investigação; audit event de domínio conserva decisão; alertas têm owner e runbook. | Uma falha de RLS, fila, documento, migration ou parceiro tem correlação, ação inicial segura e escalonamento. |
| Recuperação e escala | Backup de banco e de objeto são trilhas distintas; RPO/RTO, capacidade, custo e carga são aprovados por jornada. | Restore e crescimento sintético são ensaiados antes de prometer SLA ou disponibilidade ao cliente. |

O padrão resolve uma ambiguidade importante: **Edge, Background Function, cron e webhook aceleram a jornada, mas não garantem a verdade do negócio**. A fila durável, o estado de job, a chave de idempotência, o lease, a tentativa, o caso de exceção e a reconciliação permanecem no modelo de dados. O CRM não confirma liquidação, cumprimento fiscal, validade jurídica ou fechamento contábil apenas por receber uma requisição.

> **Regra de implementação revisada:** toda capacidade crítica chega com contrato, teste, observabilidade, recuperação e owner. Quando qualquer um faltar, o item volta para desenho e não é promovido por urgência comercial.

Os mapas de decisão, envelopes e simulações passam a ser mantidos nos documentos de prontidão, fluxos operacionais e gates/runbooks. [36] [37] [38]

## 8.9 Engenharia anti-erro: software confiável não é software que “nunca falha”

O CRM não pode prometer execução perfeita ou ausência de bugs. A estratégia correta é mais exigente: tornar erros previsíveis difíceis de introduzir, detectar desvios cedo, limitar o raio de impacto, recuperar sem apagar fatos e converter cada incidente em controle testado. Isso é especialmente crítico onde uma falha de software pode afetar acesso entre empresas, disponibilidade de lote, documento privado, proposta, direito econômico, callback, reconciliação ou percepção de saldo.

| Disciplina | Decisão incorporada | Critério de saída |
| --- | --- | --- |
| Invariantes de domínio | Organização, estoque, fato econômico, documento, política e evento externo têm estados que não podem ser representados de forma ambígua. | Cenários de concorrência, duplicidade, estado defasado, vazio/nulo e fora de ordem são testados antes do piloto. |
| Código e mudança | Fronteiras validam payload; regra crítica vive em comando transacional; schema, policy, função e release evoluem juntos. | PR/migration apresenta tipo, teste, revisão, dependency diff, compatibilidade, rollback/compensação e owner. |
| Autorização e dado | Permitir e negar são comportamentos verificados no banco, Storage, exportação e endpoint. | UI, URL, API e arquivo não permitem bypass de organização, SPE, carteira, relação, finalidade ou alçada. |
| Diagnóstico seguro | Erro público é acionável e correlacionado; detalhe técnico fica protegido e minimizado. | Stack trace, segredo, query, token e PII indevida não chegam ao usuário nem ao log comum. |
| Teste por pergunta | Tipagem, unitário, integração, policy, contrato, E2E, carga e segurança respondem a perguntas distintas. | Nenhuma capacidade sensível é promovida por uma única tela ou teste verde isolado. |
| Incidente e melhoria | Risco, bug, incidente e postmortem possuem cenário, impacto, owner, contenção, recuperação, ação e prova de regressão. | Ação vaga ou sem responsável não encerra o caso; recorrência atualiza catálogo, arquitetura e backlog. |

> **Regra anti-erro:** uma falha não é “corrigida” porque desapareceu da tela. Ela só é encerrada quando o cenário é reprodutível de forma segura, a causa/condição é classificada, a correção ou o risco residual tem owner e um teste, alerta ou gate demonstra que a repetição foi reduzida.

As fontes de solução seguem hierarquia: documentação, especificação, changelog, advisory e issue tracker oficial definem comportamento/versionamento; OWASP, SRE e ferramentas de teste orientam controles; telemetria e teste do produto comprovam o caso real; fontes comunitárias, inclusive Stack Overflow, ajudam a montar uma hipótese ou reprodução mínima, mas nunca viram padrão de produção sem validação de versão, segurança e regressão. [39] [40] [41] [42]

### 8.9A Contrato de falha: repetir o seguro, reconciliar o ambíguo

O código do CRM separa leitura, decisão transacional e efeito externo. Uma leitura idempotente pode usar retry limitado; uma transação interna curta pode ser reexecutada integralmente após conflito, se não tiver produzido efeito externo; já uma chamada a parceiro, assinatura, instrução financeira, exportação restrita ou alteração de acesso entra em estado **em reconciliação** quando a confirmação é ambígua. O produto nunca pede que alguém clique novamente para “ver se foi”.

| Limite de engenharia | Decisão de produto | Prova de saída |
| --- | --- | --- |
| Concorrência | Reserva, aprovação, entitlement e fechamento usam estado esperado, versão/constraint e transação curta. | Duas sessões concorrentes produzem conflito explícito ou um único fato canônico, nunca duas confirmações. |
| Retry | Retry de banco não atravessa a fronteira de rede; outbox, inbox, idempotência e reconciliação governam parceiro externo. | Timeout após aceite, callback repetido e evento fora de ordem não duplicam efeito, saldo, comunicação ou documento. |
| Autorização | Grant, RLS, função, view, URL temporal e exportação são testados como superfícies distintas; JWT/claim não é fonte exclusiva de escopo. | Permitir/negar prova identidade, organização, SPE, finalidade, AAL e preservação da linha/objeto negado. |
| Erro e telemetria | Resposta pública é acionável; logs, métricas e traces preservam correlação com allowlist de atributos; audit event mantém decisão de domínio. | Usuário entende a próxima ação sem receber stack trace, segredo ou PII; operação consegue investigar por correlação. |
| Mudança | Schema, policy, função, UI e dependência evoluem por mudança pequena, compatível e reversível. | Preview, migration, rollback/compensação, dependency diff e owner existem antes da promoção. |

O catálogo aprofundado registra as contramedidas por jornada e torna explícito o limite entre retry, compensação e reconciliação. [Matriz de jornadas](crm_engenharia_antierro_02_matriz_jornadas.md) · [Evidências atualizadas](crm_engenharia_antierro_evidencias.md)

### 8.9B Pente fino contínuo: cada mudança deixa prova antes de seguir

O CRM adota **varredura contínua por alteração e risco**, não a promessa irreal de revisão manual perfeita de cada linha. Todo diff passa por tipo, lint, segredo e análise aplicável; toda mudança de dependência passa por revisão do lockfile e vulnerabilidade; e alterações em dado, acesso, dinheiro, documento, integração ou recuperação acrescentam teste negativo, fixture, invariável, owner, alçada e plano de compensação. O controle acompanha `editor → commit → PR → preview → homologação → produção → incidente`.

| Superfície | Prova contínua antes de promoção | Regra de interrupção |
|---|---|---|
| Interface e fluxo | Teste de comportamento observável, acessibilidade, responsividade e preview | Regressão de foco, estado enganoso, erro de runtime ou contraste insuficiente |
| Dado e acesso | Migration efêmera, RLS/RPC/Storage permitir-negar e compatibilidade | Qualquer bypass, estado inválido ou schema/policy em drift |
| Financeiro e externo | Idempotência, outbox/inbox, retorno duplicado, estado incerto, reconciliação e compensação | Uma tentativa pode duplicar direito, saldo, instrução, documento ou settlement |
| Cadeia e produção | SAST, dependência, provenance, release/correlação, SLO e runbook | Alerta material novo, exceção vencida ou orçamento de erro degradado |

> **Regra de promoção contínua:** não há “pular o pente fino”. Existe somente exceção datada, aprovada, compensada, rastreável e reavaliada. O item não é encerrado porque a tela parece certa: encerra quando teste, sinal e recovery sustentam a hipótese de que o risco foi reduzido.

O guia executável e as fontes rastreáveis ficam em [Modelo operacional de pente fino](crm_pente_fino_continuo_modelo.md) · [Evidências](crm_pente_fino_continuo_evidencias.md).

## 8.10 Rotina permanente: profundidade sem dispersão

A estratégia passa a operar uma rotina permanente de pesquisa que não confunde volume de leitura com maturidade de produto. Cada ciclo precisa registrar **pergunta, fonte primária, contraponto, cenário de exceção, impacto de domínio, teste de validação, decisão, owner, data de revisão e limite de responsabilidade**. A fila prioriza a possibilidade de erro econômico, vazamento entre organizações, perda de evidência, duplicidade de evento, risco regulatório e impacto ao cliente; novidades de concorrência e comunidade entram como hipótese, nunca como requisito automático. [43] [44]

| Frente do ciclo | Decisão consolidada | Prova antes de promoção |
| --- | --- | --- |
| Financeiro e split | `EconomicEvent`, `Entitlement`, `PaymentInstruction` e `Settlement` permanecem fatos distintos; regra contratual não é serializada diretamente em payload de provedor. | Base, tarifa, arredondamento, elegibilidade, KYC, callback, estorno, distrato e item individual passam por matriz de homologação. [43] |
| Parceiro de pagamento | Cada integração declara perfil de capacidade: recebedores, rede, base, tarifa, timing, parcela, reversão, evento, KYC e conciliação. | Contrato vigente, sandbox e testes reais por empresa/SPE; capacidade pública não vale como garantia. [43] |
| Setor, alçada e acesso | Papel-base orienta o workspace; política contextual avalia organização, SPE, objeto, ação, vigência, finalidade, alçada e condição de risco. | Testes permitir/negar, separação de deveres, recertificação e exceção expirada. [44] |
| Demanda e concorrência | Lead, estoque, reserva, site/portal e pós-venda seguem piso competitivo; relatos públicos são classificados por independência e recorrência. | Piloto mede owner/next step, divergência de publicação, reserva concorrente, retrabalho e continuidade de carteira. [45] |
| UX crítica | Ações financeiras mostram revisão, base, regra, recebedores, parceiro, alçada, estado e próxima consequência. | Validação de domínio no servidor, mensagem acessível, confirmação proporcional e fato compensatório/reversível quando o domínio permitir. [46] |

### Financeiro e split: regra de execução reforçada

O CRM pode receber um contrato com cerca de 100 recebedores, mas não pode assumir que um único parceiro aceita esse número, calcula sobre a mesma base ou devolve valores com a mesma semântica. A documentação pública consultada mostra limites e modelos diferentes entre provedores; por isso, a aplicação calcula o direito versionado e gera uma ou mais instruções somente depois de alçada, elegibilidade, perfil de capacidade e conciliação definidos. Um recebedor bloqueado abre exceção própria; uma devolução ou distrato cria fato compensatório e reconciliação, sem apagar pagamento ou direito anterior. [43]

> **Regra de decisão financeira:** a interface pode dizer “rascunho”, “solicitado”, “em exceção”, “parcialmente confirmado” ou “liquidado”; ela não pode chamar uma simulação de pagamento, nem transformar retorno de parceiro em certeza contábil, fiscal ou jurídica.

### Setores e espaços de trabalho

O produto deve expor superfícies distintas para comercial, lançamento/loteadora, carteira/cobrança, tesouraria/controladoria, contador/jurídico e governança/IAM. Cada superfície abre o mínimo de dado e ação para responder à pergunta de trabalho; nenhuma delas ganha acesso irrestrito por cargo, sociedade ou login. Preparar uma mudança de distribuição, instruir pagamento, reprocessar callback, exportar dado restrito e aprovar distrato são atividades de separação de deveres, poder vigente e evidência — não botões genéricos de administrador. [44]

### Mensagens, revisão e correção

Em ações que criam compromisso financeiro, legal ou alteração irreversível, a experiência deve permitir revisão, correção ou reversão compatível com o domínio. O erro informa em texto o item, a razão, a forma de correção e a consequência; cor, ícone e animação complementam, mas não substituem a descrição. A validação de cliente ajuda a operação, porém a validação de servidor é a autoridade. [46]

## 8.11 Administração de plataforma: privilégio é responsabilidade, não atalho

O primeiro painel a ser construído será a **camada administrativa de plataforma**, mas ela não será um “nível deus” com leitura invisível de todos os clientes. O Super Admin governa organizações, segurança, integrações homologadas, políticas globais, incidentes e suporte controlado; não herda por padrão carteira, dossiê, documento, proposta, saldo, distribuição ou dado de uma locatária. A cada ação, o produto avalia identidade, papel-base, organização/SPE, objeto, ação, finalidade, vigência, alçada, risco de sessão e policy; privilégio precisa ser menor, temporal e auditável. [47] [48]

| Camada | Pergunta de trabalho | Pode fazer | Proteção que impede abuso |
| --- | --- | --- | --- |
| Super Admin de plataforma | A plataforma está segura, disponível e organizada? | Provisionar/suspender organização, gerir catálogo de capacidade, revogar principal, iniciar suporte just-in-time e abrir incidente. | MFA reforçada, comando transacional, dupla aprovação para policy global, auditoria imutável e ausência de leitura cotidiana de dados da locatária. |
| Security Admin | Quem tem privilégio agora e por quê? | Gerir sessão, recertificação, suspensão, elevação e resposta a incidente. | Não opera comercial, recebível, split, carteira ou política de negócio. |
| Admin de organização | Esta empresa delegou acessos corretamente? | Gerir members, áreas, SPEs, papéis locais, vigência e alçadas delegadas. | Não cruza organização nem edita guardrail de plataforma. |
| Admin de área | A equipe local está configurada para trabalhar? | Filas, templates, delegação e workspace da área/unidade autorizada. | Não se autoeleva, não muda RLS e não aprova efeito acima do teto. |
| Suporte temporário | Qual diagnóstico mínimo resolve o caso? | Consultar metadado mascarado e usar grant JIT aprovado por caso. | Caso, finalidade, selector de recurso, expiração, redaction e evento obrigatório. |

O modelo combina RBAC para funções previsíveis e ABAC para contexto. O papel organiza o workspace; atributos decidem se uma ação pode ocorrer naquele objeto, para aquela organização, naquela hora e sob aquela finalidade. A mudança de acesso é um comando de domínio: cria/revoga membership ou grant, invalida/renova sessão conforme a policy, registra antes/depois redigido, correlation ID, motivo, aprovador e expiração. Claims de JWT aceleram a apresentação, mas não substituem o estado relacional vivo quando há revogação, delegação ou suporte temporário. [48]

> **Regra de início:** não existe Super Admin escondido em variável de ambiente, `user_metadata`, botão de frontend ou claim não verificada. O primeiro incremento produz bootstrap controlado, MFA, organização, membership, RLS, `AdminAuditEvent`, convite/revogação e testes de permitir/negar; catálogo amplo de configurações só entra após essa fronteira sobreviver a abuso, expiração e recuperação.

## 8.12 Identidade e login: acesso confiável sem tratar e-mail como autorização

O CRM terá três caminhos de entrada que convergem em uma única decisão de dados: **comprador/owner** ativa uma organização por convite e confirmação; **funcionário/corretor/parceiro** entra por convite individual ou SSO corporativo quando a empresa contratar IdP; e **principal de plataforma** completa bootstrap externo e governado. A conta autenticada não recebe acesso por e-mail, domínio ou cargo exibido. O UUID de identidade aponta para memberships, escopo, vigência, alçada, finalidade e policy que RLS/RPC reavaliam no dado vivo. [49]

| Jornada | Escolha de experiência | Proteção que não pode faltar |
| --- | --- | --- |
| Ativação do comprador/owner | Convite de curta duração, e-mail confirmado, criação de credencial e MFA antes da primeira administração. | Não ativa membership parcialmente; não revela se a organização/e-mail existe; registra quem provisionou e aceitou. |
| Login de funcionário | Descoberta de SSO por organização quando configurado; caso contrário, convite e credencial local confirmada. | SSO usa PKCE/redirects fechados; e-mail de mesmo texto não vincula conta SSO/local nem cria papel. |
| Login por passkey | Opção de alta segurança para usuário local após confirmação e homologação do domínio WebAuthn. | Por estar experimental no provedor atual, não é caminho único de P0, não muda RP ID depois de cadastro e não é oferecida a usuário SSO sem regra suportada. |
| Recuperação | Sessão restrita, token de uso único, limitação de automação, nova autenticação e revisão de sessões. | Reset não restaura MFA, AAL2, privilege, suporte, escopo ou autorização financeira. |
| Comando sensível | Step-up, AAL2, recência de autenticação, alçada e policy no banco. | Mensagem acessível sem enumeração; UI não confirma efeito antes da validação transacional. |

O endereço designado para o primeiro principal de plataforma será inserido **somente no cofre de segredo de produção** sob `INITIAL_PLATFORM_PRINCIPAL_EMAIL`. O procedimento cria convite e estado `pending_activation`; a ativação exige posse do e-mail, MFA/AAL2, canal de recuperação, aceite de política e evento administrativo no mesmo comando. Não haverá endereço hardcoded em código, migration, configuração pública, JWT, metadata editável ou interface. Mesmo após ativação, o principal não é um “deus do CRM”: governa a plataforma, mas não atravessa a fronteira de dados de clientes, financeiro ou split fora de suporte JIT/caso autorizado. [49]

## 8.13 Auditoria em dez ciclos: da formação à regra verificável

O curso de desenvolvimento recebido foi submetido a dez ciclos de confronto técnico, regulatório, operacional e de exceção. A auditoria confirma que a formação é uma boa linha de partida, mas não uma especificação executável: DDD não determina microserviços, comprovante não equivale a liquidação, cadastro de recebedor não equivale a direito econômico, e regra fiscal/contratual não pode viver como constante de código. A regra ativa passa a ser um monólito modular com Postgres autoritativo, contexto/ownership explícitos, comando transacional, fatos e políticas versionados, inbox/outbox, jobs com estado, telemetria minimizada e gates de prova por jornada. [50]

| Decisão consolidada | Efeito na estratégia | Prova obrigatória |
| --- | --- | --- |
| Tempo, estado e evidência são dimensões próprias | Contrato, reserva, direito, regra, pagamento, settlement e exportação preservam versão, origem, vigência e correção. | Concorrência, reprodução histórica, retificação/compensação e reconciliação sem reescrever fato. |
| Dinheiro e parceiro têm fronteiras | `EconomicEvent`, `Entitlement`, `PaymentInstruction` e `Settlement` continuam distintos; o parceiro executa somente instrução elegível/homologada. | Duplicata, timeout, recebedor bloqueado, parcialidade, estorno e callback fora de ordem sem efeito repetido. |
| Fiscal e contábil são projeções governadas | Contratação, competência, vencimento e liquidação não colapsam numa data de receita; a exportação nasce em lote imutável. | Memória com regra datada, amostra conciliada, checksum/retorno e responsabilidade do contador/fiscal. |
| API, job e escala nascem com operação | Contrato OpenAPI, outbox/inbox, idempotência, correlação, owner, lease, prazo e exceção são parte do recurso. | Reprocessamento, cancelamento, recuperação e carga representativa não dependem do browser aberto. |
| Índice, cache e runtime são decisões medidas | Performance por jornada autorizada, plano de execução e orçamento de capacidade substituem otimização intuitiva. | `EXPLAIN` representativo, RLS, carga, fila, Storage e plano de capacidade antes de prometer escala. |

Os conflitos não foram escondidos: distrato, índice, correção, tributo, split, KYC, SSO e capacidade variam por contrato, período, empresa/SPE, parceiro e ambiente. O produto modela regra datada, evidência, exceção, alçada e reabertura; jurídico, contador/fiscal, DPO/compliance e parceiro habilitado validam o caso concreto. O mapa completo de decisões, fontes, limitações e backlog está na [consolidação dos dez ciclos](crm_auditoria_curso_10_ciclos_consolidacao.md) e no [caderno de evidências](crm_auditoria_curso_10_ciclos_evidencias.md). [50]

## 8.14 Integração auditada: beneficiários, cascatas e ativos como provas de domínio

Dois estudos de formação recentes foram confrontados com fontes primárias de registros públicos, parcelamento do solo, incorporação, distrato, locação, DIMOB e documentação técnica de idempotência. A revisão não muda a fronteira de responsabilidade do CRM; ela a torna mais precisa. O produto deve representar **direito econômico**, **instrução externa**, **tentativa/retorno de parceiro**, **settlement** e **conciliação** como objetos distintos. Do mesmo modo, deve representar **ativo**, **restrição**, **origem/participação da terra**, **registro** e **elegibilidade comercial** como dimensões diferentes. [51]

| Integração promovida | Regra estratégica | O que o produto não fará |
| --- | --- | --- |
| Natureza de saída | Repasse de terceiro, comissão/remuneração e distribuição de resultado têm tipo, base, contrato, competência e trilha próprios. | Transformar preço de imóvel de terceiro em receita própria ou tratar qualquer recebedor como “comissão”. |
| Cascata datada | O plano declara base (`valor_contratado`, `caixa_recebido`, `alocação_de_estoque` ou `resultado_verificado`), ordem, gatilho, limite, arredondamento, versão e reversão. | Aplicar prioridade, retenção, estorno ou tributo universalmente sem instrumento, regime e responsável habilitado. |
| Restrição de ativo | Disponibilidade comercial é bloqueada por razão evidenciada, como registro pendente, alocação, garantia/caução, ônus, reserva, disputa ou outra política contextual. | Tratar `permutante` ou `caucionado` como rótulo suficiente, que qualquer usuário pode remover num dropdown. |
| Dossiê registral e contratual | Matrícula/referência registral, ônus, quadro-resumo, memorial, contrato e revisão são evidências versionadas, com emissor, data, escopo e responsável. | Declarar regularidade, liberar ato sensível ou substituir diligência jurídica com campos de cadastro. |
| Distrato e garantia | Distrato, antecipação e garantia são casos com versão contratual, estados, cálculo reproduzível, saldo/exposição e alçada. | Reescrever pagamentos, direitos ou estoque já registrados, nem codificar percentuais legais/fiscais como constantes. |

> **Regra de implementação:** esta consolidação é uma mudança de estratégia e critérios de aceite. Ela não autoriza criar migrations, RPCs, bootstrap, instruções de pagamento, integrações financeiras ou publicação. A execução continua dependente de etapa apresentada, aprovação explícita, RLS, MFA, alçada, idempotência, testes permitir/negar e validação dos responsáveis de negócio.

## 8.15 Revisão de cadastro de loteamentos: evidência antes de disponibilidade

A auditoria aprofundada do cadastro de loteamentos confirma a hierarquia `gleba → empreendimento/fase → quadra → lote`, mas corrige simplificações que podem gerar venda indevida, direito econômico equivocado ou falsa sensação de regularidade. Matrícula, certidão, registro, aprovação, garantia, outorga, tabela, reserva, contrato e distrato são **provas e casos datados**, não campos que possam ser resolvidos em uma coluna de status. A estratégia passa a exigir trilhas paralelas para aquisição/viabilidade, urbanismo/aprovação, registro, infraestrutura, comercialização, alocação, restrição, compromisso e carteira. [52]

| Decisão de cadastro | Regra estratégica | Proteção de produto |
| --- | --- | --- |
| Dossiê registral | `RegistryEvidence` identifica tipo, emissor, data, objeto, escopo, arquivo/hash, revisor e política de revalidação. | Matrícula digitada não significa certidão atual, ausência de ônus ou aptidão comercial. |
| Elegibilidade comercial | A disponibilidade resulta de política versionada: registro aplicável, alocação permitida, ausência de restrição impeditiva, compromisso compatível, tabela e alçada. | Ninguém libera lote permutado, garantido, reservado ou pendente por editar um status. |
| Origem e papéis | `DevelopmentPartyRole` e `AssetOriginInterest` separam proprietário, empreendedor, representante, parte da aquisição, permutante, sócio e beneficiário econômico. | Relação de terra não cria automaticamente poder de venda, participação societária ou entitlement. |
| Contrato e reentrada | Quadro-resumo e condições versionadas ficam ligados ao contrato; distrato gera caso, restituição/compensação, revisão e autorização de reentrada. | O lote não volta ao estoque pela troca de `vendido` para `disponível`. |
| Regra local e autorização | `MunicipalityRuleSet` e `AuthorizationRequirement` preservam fonte, vigência, ato, regime/condição, evidência e owner. | Não há regra urbanística universal, nem bloqueio/outorga automática a partir de estado civil ou Município. |

> **Limite obrigatório:** o CRM organiza prova, estado, responsável e próxima ação. Ele não certifica regularidade registral/ambiental/urbanística, não interpreta contrato, não calcula efeito tributário universal e não pratica ato registral. A decisão concreta permanece com jurídico imobiliário, registro, urbanismo/engenharia, contador/controladoria e os órgãos ou parceiros competentes.

## 9. Validação com parceiros-piloto

O desenvolvimento deve iniciar com três parceiros complementares: uma imobiliária de locação, uma imobiliária de vendas e uma operação de lotes/loteadora. A primeira descoberta deve usar cinco ativos e cinco perfis reais de cada parceiro, para mapear campos que se perdem, documentos reabertos, visitas desaderentes, propostas paradas e regras de tabela. O piloto deve medir tempo até primeira resposta, completude na etapa certa, visitas por perfil, tempo até proposta apta, pendências reabertas e motivos estruturados de perda.

## 10. Conclusão

O caminho de ponta não é começar por inteligência artificial, integrações ou automação de documentos. É criar uma espinha dorsal confiável de partes, ativos, relações, propostas, carteira e evidências; fazer a equipe usá-la todos os dias; e permitir que pesquisa, dados territoriais e automações cresçam sobre essa base, com versão, governança e limites explícitos.

## Referências

[1] [IBGE — Domicílios alugados cresceram mais de 50% desde 2016](https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/46449-domicilios-alugados-cresceram-mais-de-50-desde-2016)

[2] [FipeZAP — Informe de Locação Residencial, julho de 2026](https://imoveis.grupoolx.com.br/uploads/fipezap_202607_residencial_locacao_25996d7baf.pdf)

[3] [FipeZAP — Informe de Venda Residencial, abril de 2026](https://www.datazap.com.br/wp-content/uploads/2026/05/fipezap-202604-residencial-venda-compressed.pdf)

[4] [Sinduscon-MG — Mercado de loteamentos no primeiro trimestre de 2026](https://sinduscon-mg.org.br/alta-nas-vendas-marca-o-1o-trimestre-de-2026do-mercado-de-loteamentos-em-minas-gerais/)

[5] [Gov.br / Receita Federal — Consultar CNPJ](https://www.gov.br/pt-br/servicos/consultar-cadastro-nacional-de-pessoas-juridicas)

[6] [CAIXA — Documentação básica para solicitação de crédito imobiliário](https://www.caixa.gov.br/Downloads/habitacao-documentos-gerais/Docbas-solicit-Cred-Imob.pdf)

[7] [Planalto — Lei nº 13.709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

[8] [ANPD — Guia orientativo sobre segurança da informação para agentes de pequeno porte](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte)

[9] [Sinduscon-MG — Alta nas vendas marca o 1º trimestre de 2026 do mercado de loteamentos em Minas Gerais](https://sinduscon-mg.org.br/alta-nas-vendas-marca-o-1o-trimestre-de-2026do-mercado-de-loteamentos-em-minas-gerais/)

[10] [Planalto — Lei nº 6.766/1979 (Parcelamento do Solo Urbano)](https://www.planalto.gov.br/ccivil_03/leis/l6766.htm)

[11] [Planalto — Lei nº 13.786/2018 (Distrato)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13786.htm)

[12] Estudo de fichas cadastrais e carteira de clientes — BHL Imóveis (arquivo fornecido pelo usuário, agosto de 2026)

[13] [Planalto — Lei nº 9.613/1998 (texto compilado)](https://www.planalto.gov.br/ccivil_03/leis/l9613compilado.htm)

[14] [COAF — Siscoaf](https://www.gov.br/coaf/pt-br/sistemas/siscoaf/siscoaf-info_nova)

[15] [Planalto — Lei nº 13.709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

[16] [Planalto — Código Civil, Lei nº 10.406/2002](https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm)

[17] [Planalto — Lei nº 6.530/1978, art. 6º e parágrafos](https://www.planalto.gov.br/ccivil_03/leis/l6530.htm)

[18] [eSocial — Histórico de Perguntas Frequentes](https://www.gov.br/esocial/pt-br/empresas/perguntas-frequentes/historico-de-perguntas-frequentes)

[19] [Ministério do Trabalho e Emprego — NR-7 / PCMSO](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-07-atualizada-2022-1.pdf)

[20] [Ministério do Trabalho e Emprego — Programa de Gerenciamento de Riscos](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/pgr)

[21] [Portal SPED / Receita Federal — Escrituração Contábil Digital (ECD)](https://www.gov.br/sped/pt-br/assuntos/escrituracoes-digitais/ecd)

[22] [Gov.br / Receita Federal — Entregar Escrituração Contábil Fiscal](https://www.gov.br/pt-br/servicos/entregar-escrituracao-contabil-fiscal)

[23] [Portal SPED / Receita Federal — EFD-Reinf](https://www.gov.br/sped/pt-br/assuntos/escrituracoes-digitais/efd-reinf)

[24] [Portal SPED / Receita Federal — EFD-Contribuições](https://www.gov.br/sped/pt-br/assuntos/escrituracoes-digitais/efd-contribuicoes)

[25] [Receita Federal — DCTFWeb e MIT](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb)

[26] [Portal Gov.br — Nota Fiscal de Serviço eletrônica](https://www.gov.br/nfse/pt-br)

[27] [Receita Federal — Solução de Consulta SRRF06/Disit nº 6.018/2018](http://normas.receita.fazenda.gov.br/sijut2consulta/anexoOutros.action?idArquivoBinario=64075)

[28] [Banco Central do Brasil — O que é instituição de pagamento?](https://www.bcb.gov.br/pre/composicao/instpagamento.asp?frame=1)

[29] [Planalto — Lei nº 8.934/1994, Registro Público de Empresas Mercantis](https://www.planalto.gov.br/ccivil_03/leis/L8934compilado.htm)

[30] [Benchmark competitivo de CRM imobiliário — dez referências públicas, agosto de 2026](benchmark_crm_analise.md)

[31] [Sistema visual do CRM imobiliário — gráficos, layout, cores, tipografia e interação](crm_sistema_visual.md)

[32] [Arquitetura de referência — CRM imobiliário sobre Netlify + Supabase](arquitetura_crm_netlify_supabase.md)

[33] [Caderno de evidências — Netlify + Supabase](crm_netlify_supabase_evidencias.md)

[34] [Auditoria integral — coerência e continuidade da estratégia](auditoria_estrategia_crm_relatorio.md)

[35] [Caderno de evidências — auditoria integral do CRM](auditoria_estrategia_crm_evidencias.md)

[36] [Matriz operacional de prontidão — Netlify + Supabase](crm_netlify_supabase_prontidao_operacional.md)

[37] [Fluxos operacionais — Netlify, Supabase e parceiros](crm_netlify_supabase_fluxos_operacionais.md)

[38] [Gates e runbooks operacionais — Netlify + Supabase](crm_netlify_supabase_gates_runbooks.md)

[39] [Disciplina anti-erro — metodologia e evidências](crm_engenharia_antierro_metodologia.md)

[40] [Catálogo de falhas previsíveis e inesperadas do CRM](crm_engenharia_antierro_catalogo_falhas.md)

[41] [Controles anti-erro — prevenção, detecção, contenção e recuperação](crm_engenharia_antierro_controles.md)

[42] [Relatórios de risco, bugs, incidentes e melhoria contínua](crm_engenharia_antierro_relatorios.md)

[43] [FIN-SPLIT-01 — cobrança, liquidação e distribuição configurável](crm_fin_split_01_evidencias.md)

[44] [SET-ACC-01 — setores, alçadas e acesso contextual](crm_setores_acessos_01_evidencias.md)

[45] [DEM-CRM-01 — concorrência, comunidades e dores operacionais](crm_demanda_mercado_comunidades_01.md)

[46] [UX-FIN-01 — experiência anti-erro para ações financeiras e críticas](crm_ux_financeiro_antierro_01.md)

[47] [Administração de plataforma — carta de princípios e método](crm_administracao_plataforma_metodologia.md)

[48] [Administração de plataforma — evidências, modelo e blueprint de implementação](crm_administracao_plataforma_evidencias.md) · [modelo de alçadas](crm_administracao_plataforma_modelo.md) · [implementação Netlify + Supabase](crm_administracao_plataforma_implementacao.md)

[49] [Identidade, login, recuperação e bootstrap governado](crm_login_identidade_modelo.md) · [caderno de evidências](crm_login_identidade_evidencias.md)

[50] [Auditoria aprofundada do curso — consolidação, conflitos e backlog](crm_auditoria_curso_10_ciclos_consolidacao.md) · [caderno de evidências e fontes primárias](crm_auditoria_curso_10_ciclos_evidencias.md)

[51] [Integração dos estudos de pagamentos e ativos — inventário, evidências, conflitos e decisões](crm_integracao_estudos_pagamentos_ativos_evidencias.md)

[52] [Revisão aprofundada do cadastro de loteamentos — inventário, evidências, modelo e consolidação](crm_cadastro_loteamentos_revisao_consolidacao.md)
