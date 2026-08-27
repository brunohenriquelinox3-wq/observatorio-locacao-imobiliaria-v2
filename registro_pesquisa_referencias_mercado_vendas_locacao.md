# Registro de pesquisa externa — referências de mercado para Vendas Urbanas e Locação

**Data da coleta:** `2026-08-27`  
**Status:** `fontes_primárias_coletadas_e_classificadas`  
**Uso permitido:** atualização exclusivamente documental da estratégia de Vendas Urbanas e Locação. Este registro não autoriza implementação, conexão de fornecedor, automação, operação financeira ou tratamento de dados reais.

> **Critério de leitura:** uma referência externa demonstra que uma prática é relevante para avaliação; ela não prova, por si, que a prática é adequada ao produto, à arquitetura canônica, à legislação aplicável ou ao porte dos clientes-alvo.

## 1. Matriz de evidências primárias

| ID | Fonte primária | Evidência observada | Implicação estratégica | Limite e risco de cópia | Confiança |
| --- | --- | --- | --- | --- | --- |
| `R01` | [Salesforce — Sales Pipeline](https://www.salesforce.com/sales/pipeline/) | Distingue pipeline (visão do trabalho comercial) de funil (jornada do comprador); descreve estágios, critérios de saída, próximo passo, idade do negócio, conversão, cobertura e revisão de gargalos. | Vendas Urbanas deve apresentar pipeline como uma leitura orientada a estágio, próximo passo e bloqueio, nunca como quadro decorativo. | A sequência de estágio é referência genérica; não deve sobrepor estados próprios de imóvel, proposta, contrato, elegibilidade e direito econômico. | Alta |
| `R02` | [HubSpot — Custom Object Records](https://knowledge.hubspot.com/crm-setup/use-custom-objects) | Registros de objetos personalizados podem ter propriedades, associações e pipelines; a documentação vincula criação por UI, API, importação, formulário e workflow. | A estratégia reforça modelo canônico com relações explícitas entre parte, ativo, oportunidade, proposta, contrato, documento e obrigação. | Flexibilidade de objeto sem governança amplia risco de duplicação, associação incorreta e automação sem contexto. | Alta |
| `R03` | [AppFolio — Leasing CRM](https://www.appfolio.com/services/leasingcrm) | Centraliza fluxos de locação em fila dinâmica, procura padronizar rotinas e monitora desempenho; declara foco em equipes presenciais e imóveis residenciais multifamiliares com 100+ unidades. | Locação deve operar por fila priorizada, handoff explícito e padrão de processo, com leitura de desempenho por responsável. | A referência possui recorte operacional específico; não se deve transferir sua premissa de porte ou operação para imobiliárias de todos os perfis. | Alta |
| `R04` | [Buildium — Owner Portal](https://www.buildium.com/features/property-owner-portal/) | Apresenta portal para proprietários com relatórios, documentos, tarefas e transações por propriedade. | Portal de proprietário deve ser grant mínimo, com escopo por imóvel/contrato, documentos e demonstrativos autorizados, além de trilha de acesso. | Não se deve copiar “acesso 24/7” como acesso amplo; relatório, documento, aprovação de despesa e transação exigem objeto, campo, finalidade e vigência. | Alta |
| `R05` | [Buildium — Open API](https://developer.buildium.com/) | A documentação enumera recursos de propriedades, unidades, locações, transações, manutenção, fornecedores, arquivos e callbacks; a ativação requer configuração administrativa e permissões da chave. | Integrações devem ser tratadas por capacidade, escopo e operação, nunca apenas por fornecedor ou token global. | Uma API rica também expõe operações materiais; adaptadores devem separar leitura, escrita, arquivo, comunicação e financeiro, com idempotência e reconciliação. | Alta |
| `R06` | [NIST AI RMF Playbook](https://airc.nist.gov/airmf-resources/playbook/) | Organiza sugestões voluntárias nas funções **Govern, Map, Measure e Manage**; indica que o playbook não é checklist universal nem receita completa. | IA deve ser contextualizada, governada, medida, monitorada e sujeita a supervisão humana, documentação e revisão de risco. | Não transformar o framework em alegação de conformidade; definir tolerância, owner, impacto, contestação e avaliação no contexto imobiliário. | Alta |
| `R07` | [W3C — WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/) | WCAG 2.2 estrutura critérios testáveis sob princípios de conteúdo perceptível, operável, compreensível e robusto; a W3C recomenda a versão mais recente. | Filas, tabelas, gráficos, formulários, estados, modais e portais devem ter critérios de acessibilidade testáveis desde a estratégia. | Conformidade não decorre de overlay ou de uma biblioteca de componentes; precisa de evidência por fluxo e tecnologia assistiva. | Alta |
| `R08` | [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) | Distingue grants de policies, recomenda RLS em tabelas expostas, policy por operação e testes de permitir/negar; alerta para views e metadados/JWT. | A fundação deve definir grants mínimos, policy por operação, isolamento multi-organização e testes negativos por objeto/coluna. | RLS não é substituto de modelagem de escopo, revisão de views, índices, backend protegido e recertificação de papéis. | Alta |

## 2. Referências de mercado complementares coletadas

| ID | Fonte oficial | Uso na análise | Limite declarado |
| --- | --- | --- | --- |
| `R09` | [Salesforce — Real Estate CRM](https://www.salesforce.com/crm/real-estate-crm/) | Fonte complementar para centralização de relacionamento e operação de imobiliárias. | Material comercial: capacidades devem ser confirmadas por documentação de produto antes de virarem requisito. |
| `R10` | [AppFolio Stack / parceiros e API](https://www.appfolio.com/stack/partners/api) | Referência complementar para ecossistema de parceiros e extensibilidade. | Não confirma política, preço ou capacidade para o nosso contexto sem contrato e avaliação própria. |
| `R11` | [Buildium — segurança](https://www.buildium.com/security-policy/) | Referência complementar para postura de segurança de fornecedor. | Certificação/alegação de fornecedor não transfere controle automaticamente ao CRM próprio. |
| `R12` | [Yardi CRM IQ](https://www.yardi.com/product/crm-iq/) | Referência complementar de CRM integrado a operação de portfólio. | Material de produto com recorte de ecossistema próprio; não assume interoperabilidade aberta. |
| `R13` | [OWASP API Security Top 10](https://owasp.org/API-Security/editions/2023/en/0x11-t10/) | Fonte complementar para ameaça de autorização no nível de objeto e API. | Deve ser traduzida em testes e controles específicos; não é cobertura automática. |
| `R14` | [OWASP Top 10 para aplicações de IA generativa](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/) | Fonte complementar para injeção de prompt, divulgação sensível e agência excessiva em IA. | É uma taxonomia de risco, não autorização para uso de IA em decisão sensível. |
| `R15` | [Stripe Connect](https://stripe.com/connect) | Referência complementar para onboarding/verificação e movimentação entre partes em modelo de plataforma. | Para o produto, direito econômico, instrução e liquidação continuam separados; uso futuro depende de análise regulatória, contrato e provedor. |
| `R16` | [DocuSign Rooms for Real Estate](https://www.docusign.com/products/rooms-for-real-estate) | Referência complementar para dossiê, etapas e assinatura ligada a transação. | Assinatura não substitui contrato versionado, status de evidência, escopo e política de retenção. |
| `R17` | [Nielsen Norman Group — Visibility of System Status](https://www.nngroup.com/articles/visibility-system-status/) | Referência complementar para feedback de estado e redução de incerteza em ações. | Heurística não substitui critérios de acessibilidade, autorização ou integridade transacional. |

## 3. Convergências que fortalecem a estratégia existente

As fontes de CRM comercial, gestão de locação e plataforma apontam para a mesma direção estratégica: um registro canônico com relações explícitas, trabalho organizado por fila/contexto, transições com critérios verificáveis, integração governada e visibilidade de estado. Salesforce sustenta a distinção entre pipeline e funil, enquanto HubSpot demonstra como associações entre objetos permitem organizar registros em fluxos sem transformar tudo em um contato genérico.[1][2]

Para Locação, AppFolio reforça o valor de uma fila dinâmica e de processos consistentes, mas seu foco divulgado em equipes presenciais de empreendimentos multifamiliares é uma evidência de que a estratégia precisa ser configurável por perfil de operação, e não um pacote rígido.[3] Buildium reforça a necessidade de portais para autoatendimento e transparência, porém também mostra que documentos, relatórios e transações exigem um recorte de propriedade/contrato e não um acesso amplo.[4]

As fontes técnicas confirmam que segurança, acessibilidade e IA não são camadas de acabamento. O NIST organiza a gestão de IA em governança, mapeamento, medição e gestão; o Supabase destaca que grants e RLS precisam ser definidos e testados separadamente; e a WCAG 2.2 fornece critérios testáveis para experiências dinâmicas e portais.[5][6][7]

## 4. Decisões de pesquisa que não serão copiadas automaticamente

| Padrão encontrado | Decisão documental | Razão |
| --- | --- | --- |
| IA que qualifica, agenda ou responde continuamente | **Não executar automaticamente**; manter recomendação, revisão humana, limite de autonomia, inventário e trilha. | A decisão pode afetar comunicação, discriminação, privacidade ou estado de negócio. |
| Portal com relatórios/transações amplos | **Aplicar somente por grant mínimo** e por objeto/campo. | Proprietário, locatário, parceiro ou prestador não tem o mesmo escopo do administrador. |
| API extensa para todos os módulos | **Separar capacidade de leitura, comando, arquivo, comunicação e financeiro**. | Token e integração global ampliam superfície de dano. |
| Pipeline genérico com estágio livre | **Exigir critérios de entrada/saída e transições próprias do domínio**. | Um status comercial não comprova elegibilidade documental, contratual ou financeira. |
| Automação de cobrança/repasse | **Manter em estado proposto e governado** até existir política, fornecedor, reconciliação e alçada. | Direito econômico não é instrução de pagamento nem liquidação. |
| Acessibilidade baseada em componente/overlay | **Exigir teste por jornada** de teclado, leitor de tela, foco, mensagem de erro e tabela. | Conformidade depende do comportamento real da experiência. |

## 5. Próxima etapa de confronto

O confronto deve verificar se cada fonte adiciona uma decisão nova, reforça uma decisão existente ou expõe um limite que ainda não tem critério de aceite. A atualização estratégica não deve reproduzir o marketing dos concorrentes: deve explicar a adaptação ao domínio imobiliário, o risco de não aplicar, a alternativa e a prova futura.

## 6. Referências brasileiras e capacidades complementares

| ID | Fonte oficial | Evidência observada | Adaptação estratégica recomendada | Limite |
| --- | --- | --- | --- | --- |
| `R18` | [Jetimob — sistema imobiliário](https://www.jetimob.com/) | Apresenta CRM, gestão de vendas, locação, site, funil, controle de chaves, reajuste contratual, repasses, assinatura e integração com parceiros/portais. | Manter Vendas Urbanas e Locação como domínios distintos, conectados por imóvel e parte canônicos; modelar portal, estoque externo e chave como capacidades com estado, origem, frescor e trilha. | Página de produto não comprova regra de negócio, segurança ou resultado. Não copiar automação de estoque/preço ou repasse sem contrato de integração, política e reconciliação. |
| `R19` | [Loft — CRM para imobiliárias](https://loft.com.br/para-imobiliarias/crm-para-imobiliarias/) | Declara centralização de leads, pipeline visual, relatórios, agenda, visitas, cruzamento de perfil/imóvel, portais, locação e recursos de IA/conversação. | Reforçar a priorização por próxima ação, o contexto de lead + imóvel + agenda, a visibilidade de funil e a governança de canais. | A capacidade divulgada não autoriza atendimento, qualificação, publicidade, financiamento ou comunicação automáticos; cada comando deve passar por política, consentimento e revisão. |
| `R20` | [CV CRM — CRM 8.0](https://cvcrm.com.br/) | Declara jornada do lead ao pós-venda, distribuição/acompanhamento de leads, mapa de disponibilidade, assinatura, contratos, portal, repasses, integrações e IA. | Reforçar separação entre disponibilidade, negócio, contrato, documento, direito e repasse; preservar um workspace transacional com estado e auditabilidade. | A fonte é voltada também a incorporadoras/loteadoras, que estão fora do escopo desta atualização. O uso aqui é somente como referência de padrão, não como mudança de arquitetura das demais colunas. |
| `R21` | [Yardi — CRM IQ](https://www.yardi.com/product/crm-iq/) | Apresenta visão única de prospecto, candidato e residente, renovação, histórico de comunicação, ledger e ordens de serviço a partir de ambiente integrado. | Locação deve oferecer leitura contextual entre contrato, renovação, carteira e serviço, com handoff visível e sem troca de contexto desnecessária. | O produto é nativo de ecossistema próprio e com foco amplo de portfólio. Nosso CRM deve atingir consistência por contratos de dados e não por acoplamento de fornecedor. |
| `R22` | [Stripe Connect](https://stripe.com/connect) | Descreve onboarding de contas conectadas, opções de fluxo de fundos, dashboards, disputas, reembolsos e controles de risco em plataformas. | Reforçar no financeiro que direito, instrução, retorno, ajuste e liquidação são fatos separados; qualquer repasse futuro requer onboarding, política, revisão e reconciliação. | A disponibilidade e as responsabilidades regulatórias variam por jurisdição e modelo. A fonte não substitui análise contratual, regulatória, fiscal ou de provedor. |
| `R23` | [DocuSign Rooms for Real Estate](https://www.docusign.com/products/rooms-for-real-estate) | Descreve espaço central de transação, biblioteca documental, templates, workflow, aprovações, assinatura e trilhas de auditoria. | Reforçar dossiê versionado ligado à proposta/contrato, checklist de pendência, responsáveis, prazos e evidência de assinatura. | Uma assinatura não prova por si só a validade completa do negócio nem encerra obrigações de conferência, política de retenção e permissão de acesso. |
| `R24` | [OWASP API Security Top 10 — 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/) | Identifica riscos de autorização por objeto/propriedade/função, fluxos sensíveis sem proteção, consumo irrestrito, configuração, inventário e consumo inseguro de APIs. | Exigir que cada endpoint, ação de portal, exportação, comunicação, integração, documento e operação financeira declare escopo, autorização, limite, auditoria e testes de negar. | A taxonomia deve ser convertida em ameaças e testes próprios; não se torna cobertura técnica apenas por estar documentada. |
| `R25` | [ANPD — Guia orientativo sobre segurança da informação](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte) | A página oficial disponibiliza guia, checklist de medidas de segurança e modelo de registro de operações de tratamento para agentes de pequeno porte. | A estratégia deve manter inventário de tratamentos, medidas administrativas/técnicas, evidência de revisão e trilha de acesso a dados pessoais como artefatos de governança, não como texto genérico de privacidade. | O guia é orientativo e voltado a agentes de pequeno porte; a adequação aplicável depende do contexto e de avaliação jurídica/técnica própria. |
| `R26` | [FipeZAP — Índice de preços](https://www.fipe.org.br/pt-br/indices/fipezap/) | A Fipe informa que o índice usa amostras de anúncios de venda e locação nos portais do Grupo OLX e acompanha apartamentos prontos em até 56 cidades, incluindo 22 capitais. | Painéis de precificação devem distinguir preço anunciado, preço negociado e valor contratual, declarar cidade, segmento, metodologia, cobertura, janela e data de corte. | Anúncio é intenção de oferta, não transação efetiva; o índice não mede desconto individual, disponibilidade real, liquidação ou adequação de um imóvel específico. |
| `R27` | [Banco Central — Informações do Mercado Imobiliário](https://www.bcb.gov.br/estatisticas/mercadoimobiliario) | O BCB publica mensalmente mais de 4.000 séries; os dados são divulgados após 60 dias do fechamento, e a seção de imóveis após 90 dias, podendo sofrer revisão. | Toda comparação de crédito, LTV, taxa, indexador, estoque ou característica de imóvel deve expor `as_of`, defasagem, fonte, escopo e revisão, sem produzir recomendação individual de financiamento. | As séries se referem a registros e fontes do mercado financeiro; podem conter inconsistências/defasagens e não representam todas as transações imobiliárias. |
| `R28` | [IBGE — PNAD Contínua: domicílios alugados](https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/46449-domicilios-alugados-cresceram-mais-de-50-desde-2016) | O IBGE informou que, entre 2016 e 2025, os domicílios alugados cresceram 54,1%, de 12,2 milhões para 18,9 milhões; a publicação também oferece recortes territoriais e de composição domiciliar. | Locação deve usar métricas segmentáveis por região, tipologia e composição de partes, com agregado estatístico separado de dados pessoais e de decisões individuais. | A PNAD caracteriza domicílios e moradores por amostra; ela não mede a carteira de uma imobiliária, risco de crédito, preço de contrato nem desempenho de uma operação específica. |
| `R29` | [CBIC — Indicadores Imobiliários Nacionais](https://cbic.org.br/estudos/) | A CBIC disponibiliza publicações trimestrais de indicadores imobiliários nacionais; a página de estudos divulgou a edição do 2º trimestre de 2026 em 24 de agosto de 2026. | Vendas Urbanas deve comparar estoques, oferta e ritmo de vendas em séries datadas, com segmento, abrangência e metodologia explícitos. | A página de estudos lista publicações; qualquer número de relatório precisa ser lido no documento correspondente e não deve ser generalizado para usado, locação ou município não coberto. |
| `R30` | [Secovi-SP — Pesquisas e índices](https://secovi.com.br/pesquisas-e-indices/) | A fonte lista pesquisas, índices, análises e estudos regionais de mercado; parte do conteúdo de inteligência é exclusiva de associados. | O CRM deve aceitar benchmarks locais como fonte externa versionada, informando associação/acesso, praça, período e metodologia em vez de presumir cobertura nacional. | A página é um catálogo de materiais heterogêneos e parte dos conteúdos é restrita; ela não comprova um indicador único nem pode ser usada para inferir a realidade de toda a operação. |
| `R31` | [ABECIP — Informativos mensais](https://www.abecip.org.br/imprensa/informativos-mensais) | A URL institucional confirmou a existência da área de informativos mensais, mas o conteúdo acessível nesta consulta não apresentou séries ou metodologia. | Creditar a ABECIP como fonte potencial de acompanhamento, porém exigir captura do informativo e da definição correspondente antes de persistir qualquer métrica de financiamento. | Não foi possível validar números, recorte, metodologia ou periodicidade específica apenas na página consultada; nenhum dado quantitativo foi incorporado desta fonte. |
| `R32` | [CRECISP — Pesquisas de mercado](https://www.crecisp.gov.br/comunicacao/pesquisasmercado) | O CRECISP informa consultar mensalmente mais de 1.500 imobiliárias e disponibilizar relatórios desde 2003 sobre quantidades negociadas e variação de preços de venda e locação no Estado de São Paulo, com busca por município. | A leitura de benchmark deve aceitar hierarquia geográfica e período mensal, separando mercado paulista intermediado, município, venda e locação dos dados internos da imobiliária. | A fonte representa o universo e a coleta descritos pelo CRECISP; não equivale a censo nacional, nem substitui os fatos de carteira ou transações fora de sua amostra. |
| `R33` | [Índice de Aluguel QuintoAndar Imovelweb](https://www.quintoandar.com.br/newsroom/indice-de-aluguel/) | A página diferencia valor médio por metro quadrado, tipologia, variação por período e desconto médio; este último é calculado pela diferença, para o mesmo imóvel, entre preço anunciado e valor efetivamente pago em contratos da própria plataforma. | Locação deve distinguir no modelo de métrica `preço_anunciado`, `proposta`, `valor_contratado`, tipologia, praça, janela e metodologia, impedindo que o benchmark seja confundido com dado da carteira. | A metodologia e a cobertura pertencem ao ecossistema da fonte; valores mudam por cidade, período e recorte e não devem gerar precificação ou recomendação automática de imóvel. |

## 7. Síntese comparativa incorporável

As referências brasileiras convergem com as plataformas internacionais em cinco padrões: fonte única com relações explícitas, pipeline/esteira visual, centralização de trabalho e comunicação, conexão com canais externos e leitura por indicadores. A diferença de qualidade não estará em reunir listas de funcionalidades, mas em garantir que cada automação tenha contexto, escopo, responsável, log, reversão e tratamento de exceção.[8][9][10]

Para **Vendas Urbanas**, a evidência reforça um cockpit onde lead, imóvel, visita, oportunidade, proposta, dossiê, contrato e pendência avançam por critérios próprios. Para **Locação**, reforça uma leitura contínua que conecta prospecto/locatário, imóvel, contrato, renovação, carteira, cobrança, serviço e portal, sem conceder a qualquer tela poder de mudar todos esses fatos.[11][12]

Para os dois domínios, plataformas financeiras e de assinatura sustentam a adoção de adaptadores e dossiês governados, mas não autorizam confundir fornecedor com regra de negócio. A estratégia preserva como requisito que comandos financeiros, assinaturas, mensagens, atualizações de anúncio e transferências sejam sempre capazes de explicar qual fato os sustenta, quem autorizou e como a confirmação externa é reconciliada.[13][14]

## Referências

[1] [Salesforce — What Is a Sales Pipeline?](https://www.salesforce.com/sales/pipeline/)

[2] [HubSpot — Create Custom Object Records](https://knowledge.hubspot.com/crm-setup/use-custom-objects)

[3] [AppFolio — Leasing CRM](https://www.appfolio.com/services/leasingcrm)

[4] [Buildium — Owner Portal for Property Managers](https://www.buildium.com/features/property-owner-portal/)

[5] [NIST — AI RMF Playbook](https://airc.nist.gov/airmf-resources/playbook/)

[6] [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

[7] [W3C — WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/)

[8] [Jetimob — Sistema imobiliário](https://www.jetimob.com/)

[9] [Loft — CRM para imobiliárias](https://loft.com.br/para-imobiliarias/crm-para-imobiliarias/)

[10] [CV CRM — CRM 8.0](https://cvcrm.com.br/)

[11] [Yardi — CRM IQ](https://www.yardi.com/product/crm-iq/)

[12] [Buildium — Open API](https://developer.buildium.com/)

[13] [Stripe Connect](https://stripe.com/connect)

[14] [DocuSign Rooms for Real Estate](https://www.docusign.com/products/rooms-for-real-estate)

[15] [OWASP API Security Top 10 — 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)

[16] [ANPD — Guia orientativo sobre segurança da informação para agentes de tratamento de pequeno porte](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte)

[17] [FipeZAP — Índice FipeZAP](https://www.fipe.org.br/pt-br/indices/fipezap/)

[18] [Banco Central do Brasil — Informações do Mercado Imobiliário](https://www.bcb.gov.br/estatisticas/mercadoimobiliario)

[19] [IBGE — Domicílios alugados cresceram mais de 50% desde 2016](https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/46449-domicilios-alugados-cresceram-mais-de-50-desde-2016)

[20] [CBIC — Estudos e Indicadores Imobiliários Nacionais](https://cbic.org.br/estudos/)

[21] [Secovi-SP — Pesquisas e índices](https://secovi.com.br/pesquisas-e-indices/)

[22] [ABECIP — Informativos mensais](https://www.abecip.org.br/imprensa/informativos-mensais)

[23] [CRECISP — Pesquisas de mercado](https://www.crecisp.gov.br/comunicacao/pesquisasmercado)

[24] [QuintoAndar Imovelweb — Índice de Aluguel](https://www.quintoandar.com.br/newsroom/indice-de-aluguel/)
