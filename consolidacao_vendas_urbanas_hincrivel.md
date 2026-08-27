# Consolidação de evidências e requisitos — Vendas Urbanas

**Status:** `base_estratégica_para_atualização_autorizada_2026-08-27`  
**Escopo:** somente a coluna **Vendas Urbanas**. Este documento converte observações verificadas em requisitos de produto, critérios de aceite e limites; não reproduz dados pessoais, não presume implementação de terceiros e não altera a arquitetura de SUPER ADM, ADM ou LOTEADORA.

> **Leitura de evidência:** controles demonstrados informam uma expectativa de operação e experiência; controles bloqueados, inconclusivos ou não demonstráveis tornam-se requisitos de prova e segurança, nunca cópias presumidas de comportamento.

## 1. Evidência consolidada

| Eixo | Evidência observada | Leitura estratégica | Limite de interpretação |
| --- | --- | --- | --- |
| Painel e aquisição | O painel reúne período, inventário, alertas de leads e série temporal; a Central de Leads oferece lista, pipeline e termômetro. | A operação precisa de uma visão de entrada que vá de sinal agregado à fila fonte, sem converter card em fonte de verdade. | Fórmulas, frescor, coorte e autorização do drill-down não foram demonstrados. |
| Lista de leads | Foram observados ordenação, limite de exibição, paginação, filtros, ações em lote, exportação e edição em linha. | Pesquisa e ação em massa são componentes distintos: qualquer ganho de eficiência deve preservar finalidade, escopo, reversão e trilha. | Controles críticos não foram confirmados além de preparação/cancelamento seguro. |
| Pipeline comercial | A interface expõe estados comerciais, filtros e visão alternativa por temperatura. | O CRM próprio precisa separar etapa, prioridade, responsável, próximo passo e motivo, preservando a história de cada transição. | Arraste, transições com dados e regras de automação não foram demonstrados. |
| Cliente e comprador | Foram observadas ficha por abas, relações, endereço, documentos, observações, tarefas, sugestão/radar e dados financeiros sensíveis. | Uma `Party` canônica, com papéis temporais e coleta progressiva, reduz redigitação e evita confundir contato, comprador, cônjuge, representante e titular. | Consulta de documento, validação de servidor e persistência não foram demonstradas. |
| Imóvel e proprietário | A estrutura apresenta inventário, estado do ativo, atributos, localização, proprietário/captador, comissão, chaves, mídia e canais. | Ativo, titularidade, captação, autorização de anúncio, chave e comissão precisam ser relações/evidências separadas, com proteção por finalidade. | Publicação, vínculo de proprietário, mídia e transições críticas não foram executados. |
| Empreendimentos | O catálogo e a entrada de inserção foram identificados; o estado observado estava vazio. | Construtora, empreendimento, torre, unidade e correspondente autorizado devem ter identidade e vínculos próprios. | O fluxo de cadastro, disponibilidade, tabela e mídia permanece prova futura. |
| Visita e agenda | Foram observados estado vazio, entrada de criação, agenda, vistas e categorias. | Visita não é mudança de estágio automática: precisa de agenda, participantes, conflito, confirmação, resultado e próxima ação independentes. | Criação, notificação, conflito e cancelamento não foram acionados. |
| Negócio, proposta e contrato | A carteira apresenta estados, filtros, importação de planilha e entrada de contrato por IA. | Proposta, reserva quando aplicável, contrato, documento e estado financeiro devem ser objetos correlacionados, não uma única tela ou campo de status. | Importação, IA, assinatura, contrato e integrações ficaram bloqueados por risco. |
| Documentos e divulgação | Há catálogo de formulários, referência a download/geração e material gráfico/portais. | Documento, mídia e anúncio exigem cofre privado, classificação, versão, aprovação, preview e auditoria; marketing não pode publicar por efeito de uma edição de cadastro. | Download, upload, geração e publicação não foram executados. |
| Inteligência comercial | Foram observadas superfícies de propensão, origem/ROI, saúde, rejeição, campanhas, migração, roleta, sincronização e ajuda; a ajuda declara priorização, distribuição, SLA e alertas. | Inteligência deve ser explicável, configurável por regra, reversível e vinculada a evidência, sem score oculto ou distribuição automática sem alçada. | Regras internas, modelos, configurações, execução e auditoria das automações não foram demonstrados. |
| Permissões e estabilidade | Configuração de recursos retornou negação de permissão; algumas rotas e controles tiveram erro transitório, carga em branco ou comportamento de navegação instável. | A estratégia deve prever policy no dado, tela de acesso negado segura, observabilidade e recuperação de erro; a UI não pode ser a única defesa. | A matriz de permissões e logs administrativos não ficaram acessíveis. |

## 2. Estratégia operacional de Vendas Urbanas

O fluxo parte de um contexto mínimo e avança somente quando a próxima decisão exige mais evidência. O objetivo não é criar uma ficha extensa de uma vez, mas permitir que captação, atendimento, visita, proposta e fechamento mantenham continuidade sem coletar dados irrelevantes ou misturar estados.

| Etapa | Objeto dominante | Informação mínima | Gate de passagem | Resultado verificável |
| --- | --- | --- | --- | --- |
| Entrada de demanda | Lead + `SearchProfile` | canal, intenção, tipo de ativo, território, faixa, prazo e contato permitido. | Duplicidade assistida e finalidade de contato registradas. | Fila com prioridade explicável e owner definido. |
| Captação | Proprietário + ativo | relação declarada, ativo, território, modalidade e responsável. | Origem/titularidade declaradas e pendências visíveis. | Ativo em revisão, não publicado por padrão. |
| Qualificação | Comprador/proponente + grupo | critérios, prazo, faixa, composição e viabilização declarada. | Critérios suficientes para sugerir ativo sem inferir crédito. | Perfil de busca versionado e justificável. |
| Match e visita | Match + visita | razão de aderência, imóveis considerados, agenda, participantes e feedback. | Conflito de agenda, permissão e disponibilidade verificados. | Visita concluída, cancelada ou remarcada com motivo. |
| Proposta | Proposta versionada | ativo, partes, preço, prazo, condição, sinal e vigência. | Ativo elegível, dossiê mínimo e alçada aplicável. | Versão submetida/aceita/recusada sem apagar histórico. |
| Contrato e pós-venda | Contrato + dossiê + eventos | versão aceita, evidências, pendências, responsáveis e próximos marcos. | Revisões comercial, documental, jurídica e financeira concluídas conforme política. | Linha do tempo e estado pós-venda rastreáveis. |

## 3. Requisitos de produto priorizados

| ID | Requisito estratégico | Evidência de origem | Critério de aceite |
| --- | --- | --- | --- |
| `VU-REQ-01` | Tratar pessoa/empresa como `Party` única e permitir papéis temporais de interessado, comprador, proprietário, cônjuge, representante, captador, corretor e correspondente. | Fichas e listas distinguem várias funções, mas a separação canônica não foi demonstrada. | Um mesmo registro pode assumir papéis datados em múltiplos negócios sem duplicar dossiê ou conceder acesso adicional. |
| `VU-REQ-02` | Adotar qualificação progressiva por finalidade e bloqueio de consulta externa sem base, aviso e autorização apropriados. | Formulários expõem documento, contatos, dados financeiros e endereço; consulta de documento foi deliberadamente não acionada. | Campos sensíveis só surgem na etapa justificada; consultas possuem finalidade, origem, aviso, log e alternativa manual. |
| `VU-REQ-03` | Construir pesquisa, filtros, ordenação e paginação como consultas governadas. | A lista central combina grande volume de contatos, filtros e limites de exibição. | Toda consulta declara escopo, filtros ativos, ordenação, limite, paginação estável, vazio/erro e policy por objeto/campo. |
| `VU-REQ-04` | Separar prioridade de lead, estágio de negócio, temperatura, SLA e responsável. | Pipeline e termômetro coexistem na interface de referência. | Cada dimensão possui significado, fonte, owner, histórico e ação permitida próprios; uma alteração não reescreve as demais. |
| `VU-REQ-05` | Implementar transições de pipeline por comando auditável, e não por arraste sem validação. | Estados e cards foram visualizados; transições não foram demonstradas. | Transição registra estado anterior/novo, motivo, autor, data, pré-condição, notificação opt-in e possibilidade de reversão autorizada. |
| `VU-REQ-06` | Tratar ativo, titularidade, autorização comercial, publicação, chaves e comissão como objetos/relações independentes. | Ficha de imóvel concentra esses atributos e superfícies sensíveis. | Nenhuma relação declarada torna o ativo publicável, disponível ou negociável sem evidência, vigência e policy próprias. |
| `VU-REQ-07` | Modelar construtora, empreendimento, torre e unidade de forma hierárquica. | Catálogo de empreendimentos/condomínios e fluxo de imóvel indicam necessidade de estrutura. | Unidade herda somente atributos explicitamente versionados; disponibilidade, preço, mídia e autorização permanecem próprios. |
| `VU-REQ-08` | Disponibilizar visita e agenda com conflitos, participantes, estado e feedback. | Visitas e agendamentos foram observados em estado vazio. | Criar/remarcar/cancelar exige permissão, registra motivo e não envia comunicação sem preview/consentimento. |
| `VU-REQ-09` | Separar proposta, reserva quando aplicável, contrato, dossiê e financeiro. | Carteira de negócios, modelos e importadores foram observados; ações materiais bloqueadas. | Cada objeto possui estado, versão, owner, autorização e correlação próprios; contrato não confirma recebimento. |
| `VU-REQ-10` | Implantar cofre de evidências e documentos com classificação, validade, revisão, versão e acesso mínimo. | Fichas e formulários contêm anexos, arquivos e documentos. | Upload exige finalidade e antivírus; download é temporário/auditado; documento anexado não equivale a aprovado. |
| `VU-REQ-11` | Transformar inteligência em regras e explicações revisáveis. | Ajuda declara priorização, distribuição, SLA, alertas, campanhas e roleta; configuração foi negada no papel observado. | Toda recomendação informa fatores, dados usados, frescor, limitação e responsável; automação crítica exige aprovação, limite e rollback. |
| `VU-REQ-12` | Usar painel de métricas com contrato de medida e drill-down protegido. | Dashboard, origem/ROI, propensão, saúde e rejeição foram vistos sem fórmula suficiente. | Cada métrica informa fórmula, período, coorte, unidade, fonte, `as_of`, frescor, estado e link para fatos autorizados. |
| `VU-REQ-13` | Governar exportação, importação, IA, campanhas e publicação como ações críticas. | Menus e comandos foram identificados e bloqueados antes da confirmação. | Preview, campos mínimos, classificação, escopo, aprovação, idempotência, registro de auditoria, retenção e cancelamento são verificáveis. |
| `VU-REQ-14` | Projetar UX resiliente para vazio, erro, acesso negado e carregamento parcial. | Houve telas vazias, 403, 404, carga em branco e falhas transitórias. | O produto mostra causa segura, próximo passo e correlação de suporte sem vazar dados; a ação pode ser retomada sem duplicar efeitos. |

## 4. Segurança e experiência

O desempenho da equipe não deve exigir exposição excessiva. A lista pode ajudar a explorar os dados de forma mais intuitiva, mas deve aplicar mascaramento por campo, busca com limites, paginação estável e um caminho de detalhe com finalidade. O painel deve ajudar a entender melhor as tendências, porém somente com métricas datadas, explicáveis e reconciliáveis com suas fontes. Ao salvar ou compartilhar facilmente uma proposta, documento ou relatório, o sistema deve aplicar a mesma governança: preview, escopo mínimo, registro de ação e expiração quando houver arquivo.

| Superfície crítica | Proteção obrigatória | Teste futuro |
| --- | --- | --- |
| Lista de leads/clientes | RLS/policy por organização, papel, objeto e campo; mascaramento e limite anti-enumeração. | Permitir/negar por papel, equipe, campo, filtro, paginação e exportação. |
| Ficha de parte e imóvel | Dados por finalidade, evidências privadas, histórico append-only e acesso auditado. | Campo sensível, documento, chave, representante e relação entre objetos. |
| Proposta e contrato | Versões imutáveis, alçada, evidência, assinatura e correlação de estados. | Concorrência, alteração, cancelamento, aprovação, rejeição e retomada. |
| Automação e IA | Regras versionadas, explicabilidade, aprovação, limites, monitoramento e rollback. | Recomendação, distribuição, SLA, campanha, falha e intervenção humana. |
| Exportação/publicação | Preview, finalidade, seleção mínima, arquivo privado, expiração e audit event. | Política de dados, reautorização, cancelamento, retenção e incidente. |

## 5. Lacunas que continuam como requisito de prova

| Lacuna | Impacto | Decisão estratégica |
| --- | --- | --- |
| Validações de servidor e fluxos completos de criação/salvamento | Impede copiar regras de obrigatoriedade ou duplicidade. | Definir validações próprias, testadas no domínio e não por comportamento presumido de terceiro. |
| Regras de cálculo, priorização, pontuação e conversão | Pode gerar indicador enganoso ou score opaco. | Exigir contrato de métrica e explicação de prioridade antes de qualquer automação. |
| Permissão por objeto/campo, logs e auditoria | Pode ocultar vazamento ou escalada de privilégio. | Implementar negação por padrão, policy no dado e testes permitir/negar. |
| Publicação, campanhas, IA e importadores | Possuem alto potencial de efeito externo. | Disponibilizar por preview, aprovação, outbox/idempotência e observabilidade. |
| Financeiro comercial e comissões | Estado de tela não comprova direito, caixa ou liquidação. | Usar subledger e direitos versionados, separados de instrução e settlement. |

## Referências internas

[1] [Registro de auditoria por controle](registro_auditoria_por_controle_v2.md)

[2] [Matriz de cobertura](matriz_cobertura_segunda_varredura_hincrivel.md)

[3] [Estratégia de Vendas Urbanas anterior](estrategia_vendas_urbanas.md)

[4] [Escopo da atualização estratégica](escopo_atualizacao_estrategica_vendas_locacao_hincrivel.md)
