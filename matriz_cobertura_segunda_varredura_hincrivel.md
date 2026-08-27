# Matriz de cobertura — segunda varredura do CRM de referência

**Status:** `encerrada_parcialmente_por_autorização_explícita_do_usuário_2026-08-27`
**Objetivo:** tornar verificável a segunda auditoria, listando cada superfície acessível relacionada a Vendas Urbanas ou Locação e classificando-a como **demonstrada**, **bloqueada por segurança**, **inconclusiva** ou **não demonstrável no papel/sessão atual**.

> **Critério de completude acessível:** nenhuma rota, submenu, formulário, aba, ação, estado vazio, filtro, modal ou permissão descoberta ficará sem classificação. Isso não equivale a afirmar que o software não possui superfícies ocultas por plano, feature flag, papel, dados de terceiros ou integração externa; esses limites serão registrados separadamente.

> **Encerramento parcial autorizado:** a matriz registra evidências obtidas e lacunas materiais ainda abertas, mas não comprova cobertura integral. Não é permitido declarar o estudo do CRM como completo, transformar lacunas em ausência de capacidade, nem atualizar as estratégias de Vendas Urbanas ou Locação antes de relatório de cobertura e aprovação estratégica posterior.

## 1. Legenda de evidência

| Código | Classificação | Significado |
| --- | --- | --- |
| `D` | Demonstrado | A superfície foi aberta e seus controles/estados foram observados sem efeito operacional indevido. |
| `T` | Testado sinteticamente | Um dado marcado `TESTE DE AUDITORIA — NÃO OPERACIONAL` percorreu a superfície sem contato, publicação, cobrança ou integração. |
| `B` | Bloqueado por segurança | A ação não foi concluída porque exigiria dado real, comunicação, cobrança, publicação, alteração de terceiros ou integração externa. |
| `I` | Inconclusivo | Rota/menu/modal dinâmico ou falha de carregamento impediu confirmação suficiente; requer nova tentativa ou outra evidência. |
| `N` | Não demonstrável | O ambiente/papel/dado disponível não oferece condição segura para provar o comportamento; não se infere ausência de capacidade. |

## 2. Cobertura de Vendas Urbanas

| ID | Superfície/rota | Unidades obrigatórias de inspeção | Risco principal | 1ª varredura | 2ª varredura |
| --- | --- | --- | --- | --- | --- |
| `VU-01` | Dashboard | Cards, gráficos, filtros, drill-down, estados vazios, frescor, links aos fatos. | Métrica sem definição/escopo. | `D` parcial | Pendente |
| `VU-02` | `/leads` — Central de Leads | Lista, busca, filtros, tabs, ordenação, ações em lote, criação, detalhe, privacidade de contatos. | Exposição de PII/ação em massa. | `D` parcial | Pendente |
| `VU-03` | `/leads/cadastro` — Novo Lead | Obrigatoriedade, origem, intenção, lead/imóvel, duplicidade, mensagens, salvamento, erros. | Criar lead/comunicação indevida. | `T` parcial | Pendente |
| `VU-04` | `/leads/kanban` — Pipeline | Colunas, transição, termômetro, perda, responsável, filtros, drag/drop, auditabilidade. | Mudança material por arraste. | `D` parcial | Pendente |
| `VU-05` | `/clientes` — Clientes | Lista, filtros, busca, actions, criação, duplicidade e ficha. | PII e duplicidade. | `T` | Pendente |
| `VU-06` | Ficha de cliente | Cadastro, endereço, cônjuge/relações, documentos, contas, leads, tarefas, observações, radar, histórico e exclusão. | Dossiê/conta sem escopo. | `D` parcial | Pendente |
| `VU-07` | `/proprietarios` — Proprietários | Lista, papel, criação, validação, ficha, documentos, imóveis e captação. | Titularidade/contato expostos. | `T` parcial | Pendente |
| `VU-08` | `/imoveisagencia` — Meus Imóveis | Estado, venda/aluguel, filtros, ordenação, ações em lote, importação/exportação, cards/lista. | Alteração/publicação/PII. | `D` parcial | Pendente |
| `VU-09` | `/imoveisagencia/cadastro` — Wizard de imóvel | Localização, tipo, negociação, preço, características, proprietário, chaves, mídia, descrição, publicação, resumo e save. | Publicar/criar ativo real. | `T` parcial | Pendente |
| `VU-10` | Ficha do imóvel | Todas as abas, histórico, permissões, proprietário, chaves, preço, publicação, mídia, documentos e exclusão. | Chaves/localização/dados de proprietário. | `D` parcial | Pendente |
| `VU-11` | `/imoveisempreendimentos` — Empreendimentos | Lista, filtros, wizard, construtora, torre, unidade, tabela, disponibilidade e mídia. | Estoque/preço/publicação. | `D` parcial | Pendente |
| `VU-12` | `/imoveismapa` — Busca no mapa | Compra, aluguel, tipologia, preço, área, bounding box, ordenação, resultado e privacidade de endereço. | Exposição geográfica/endereço. | `D` parcial | Pendente |
| `VU-13` | `/visitas` — Visitas | Lista, filtros, cadastro, conflito de agenda, status, imóvel, cliente, corretor, notificação, cancelamento. | Agendamento/comunicação real. | `D` parcial | Pendente |
| `VU-14` | `/agendamentos` — Agenda | Vistas, categorias, filtros, atividades e associação ao negócio. | Evento/convite externo. | `D` parcial | Pendente |
| `VU-15` | `/negocios` — Negócios | Tipos, lista, filtros, criação, importação, etapas, proposta, contrato e pós-venda. | Importação/contrato. | `D` parcial | Pendente |
| `VU-16` | `/negocios/financiamentos` | Funil, filtros, simulação, documentos, consentimento, integração e estados. | Consulta/operação financeira externa. | `D` parcial | Pendente |
| `VU-17` | `/documentos` — Formulários | Modelos, campos, upload/download, versão, geração, IA, permissões e trilha. | Geração/baixa de documento. | `D` parcial | Pendente |
| `VU-18` | Financeiro relacionado a venda | Lançamentos, comissão, cobrança, repasse, conciliação, filtros e exportação. | Efeito financeiro. | `D` parcial | Pendente |
| `VU-19` | Cargos e permissões | Perfis, CRUD, campo/objeto, exportação, documentação e acesso a dados. | Escalada de privilégio. | `D` parcial | Pendente |

### Evidência da segunda varredura — `VU-01`

| Item observado | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Dashboard e menu autenticado | `D` | Menu lateral expõe as centrais de Leads, Clientes, Imóveis, Serviços, Negócios, Agendamentos, Formulários, Administrativo e Configurações; existem links `Acessar` e entrada de criação. | A presença do menu não comprova autorização por objeto, escopo de tenant, vigência ou auditoria de ação. |
| Métricas comerciais | `D` | Cards distinguem imóveis da agência, imóveis de rede/plataforma, composição por venda/aluguel, leads por período, leads sem atribuição, leads em atendimento, categorias, leads por corretor e leads por imóvel. | Valores reais não foram registrados; a interface não expõe no card, de forma suficiente, fórmula, escopo, data de corte, frescor, estado de conciliação ou drill-down validado. |
| Gráfico de leads | `D` | Gráfico temporal possui alternativa de visualização por meses. | Não foi alterado; não há prova ainda de filtro, exportação, acessibilidade de dados do canvas ou consistência entre gráfico e lista fonte. |

### Evidência da segunda varredura — `VU-02`

| Item observado | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Lista recebida e paginação | `D` | A tela apresenta abas para lista, Pipeline de Negócios e Pipeline de Termômetro, contadores de aguardando/atribuído/em atendimento e paginação de resultados filtrados. | Não foi aberta ficha de terceiro, nem demonstrada a semântica dos contadores, a origem do filtro inicial ou a retenção da lista. |
| PII na listagem | `D` | Linhas de lead exibem diretamente data/hora, nome, e-mail e telefone, além de interesse e contador visual. Nenhum dado real foi copiado para o caderno. | A visibilidade não prova ausência de policy de servidor, mas a superfície visual não mostra mascaramento por finalidade/campo. |
| Ações e alterações diretas | `D` | Há modo de exclusão, atribuição em lote, exportação, ordenação, exibição, filtro, edição por linha e seletor de temperatura diretamente na listagem. | Nenhuma ação foi disparada: faltam evidências de confirmação, preview, rollback, idempotência, auditoria, reautorização e escopo por objeto. |
| Tipificação visual | `D` | Interesse comercial e temperatura aparecem como controles/listagens de rápida leitura. | Não foi provado que temperatura, interesse, atribuição ou contador têm histórico/versionamento; edição direta permanece risco a testar somente com registro sintético. |

### Evidência da segunda varredura — `VU-03`

| Item observado | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Estrutura de cadastro | `D` | Formulário expõe código, interesse venda/aluguel, origem, corretor, nome, e-mail e telefone; informa visualmente campos obrigatórios. | Nenhum valor foi preenchido/salvo nesta varredura; obrigatoriedade de cada campo e validação de servidor seguem pendentes de prova controlada. |
| Origem e atribuição | `D` | Origem possui lista de canais de captação e o corretor aparece em seletor. | A tela não torna explícita a governança de consentimento, padronização de origem, histórico de reatribuição, SLA ou permissão para trocar corretor. |
| Imóvel sugerido | `D` | O cadastro exige selecionar imóvel e oferece busca por código, negociação, tipo, cidade, bairro, atributos, faixa de valor/área e característica, além de lista de imóveis. | A mensagem de exigência não prova que o imóvel é elegível, autorizado, disponível ou compatível com o interesse; a busca não foi executada nesta passada. |
| Comando de salvamento | `B` | Há botão de salvar dados. | Foi deliberadamente bloqueado para evitar novo lead sintético enquanto a cobertura da sugestão/compatibilidade não estiver completamente revisada. |

### Evidência da segunda varredura — `VU-04`

| Item observado | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Etapas do pipeline | `D` | O kanban expõe as etapas Atendimento, Visita, Proposta, Fechamento, Ganhou e Perdido, além de uma visão alternativa de termômetro/lista. | Os estados `Ganhou` e `Perdido` aparecem também em resumo visual; não foi demonstrado se há duplicação semântica, reentrada, histórico de transição, motivo de perda ou reversão. |
| Indicadores | `D` | Mostra cards de em aberto, valor ganho, conversão, ganhos e perdidos, com filtro e limite de itens. | Na visualização acessível não há fórmula, período, coorte, denominador, moeda/fonte de valor, `as_of` ou link para fatos que sustentem cada indicador. |
| Estado vazio | `D` | Todas as etapas estavam em vazio para o recorte corrente, expondo mensagens de ausência. | Estado vazio não demonstra arraste, ordenação, bloqueios, transição, alçada ou auditoria; nenhum card real foi movido. |

### Evidência da segunda varredura — `VU-05`

| Item observado | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Separação visual | `D` | A Central apresenta abas/contadores distintos para clientes e proprietários, entrada de novo cliente, ordenação e filtro. | A separação visual não demonstra se uma mesma parte possui identidade canônica única ou se pode ser duplicada entre as listas. |
| Registros sintéticos | `T` | Os dois registros de auditoria previamente criados permanecem visíveis, marcados, ativos e com ações de atendimento/edição/exclusão por linha. | A persistência confirma o fluxo básico, mas não prova regras de duplicidade por CPF/CNPJ, histórico, relação de papéis ou permissões de objeto. |
| Ações por linha | `D` | Cada registro mostra comando de atendimento/edição e exclusão visual. | Não foram acionados nesta varredura para evitar alterar ou apagar registros antes da etapa de limpeza; não há prova de confirmação, soft delete, recuperação ou audit event. |

### Evidência da segunda varredura — `VU-06` (abas iniciais)

| Aba/controle | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Ficha principal | `D` | A ficha sintética possui tabs para Cliente, Cônjuge, Endereço, Leads, Observações, Radar, Documentos, Contas bancárias, Atendimento/Tarefas e Sugestão de imóveis. A aba principal combina CPF, tipo de pessoa, corretor, status, captação, tipo de cadastro, interesse e contatos. | A interface diz que CPF pode buscar dados automaticamente; não foi acionada consulta externa. Não há evidência ainda de origem/consentimento, mascaramento, política de campo, versionamento ou trilha de alteração. |
| Cônjuge | `D` | A relação conjugal é modelada como bloco de campos de nome, CPF, RG/emissor, profissão, renda, sexo, aniversário, e-mail e telefones. | O desenho aparenta um subformulário embutido, sem relação de Parte versionada/compartilhável visível; nada foi salvo nem é possível inferir a política de consentimento/necessidade. |
| Endereço | `D` | Endereço expõe CEP, cidade, estado, rua, número, complemento e bairro. | Não foi testada consulta de CEP, histórico de endereço, validação geográfica, finalidade/retention ou permissão de leitura de localização. |

### Evidência da segunda varredura — `VU-06` (dossiê e dados financeiros)

| Aba/controle | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Documentos | `D` | Dossiê oferece título opcional, observação opcional, seleção de arquivo e comando de anexar ao cadastro; a lista do cliente sintético estava vazia. | Não foram anexados arquivos. Não há no formulário visível classificação, tipo, finalidade, validade, revisão, versão, retenção, permissão, histórico, vírus/malware ou snapshot contratual. |
| Contas bancárias/PIX | `D` | A ficha concentra escolha entre PIX e conta bancária, titular pré-preenchido, CPF/CNPJ, tipo de chave e chave PIX; informa disponibilidade para repasse de contratos da pessoa. | Nenhum dado bancário foi incluído. A superfície visual não demonstra validação de titularidade, aprovação, conta por contrato, dupla checagem, criptografia, mascaramento, revogação, alçada ou auditoria de alteração. |

### Evidência da segunda varredura — `VU-06` (relacionamentos e atividades)

| Aba/controle | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Leads vinculados | `D` | A aba apresenta colunas de imóvel, negociação, data e visualização, com estado vazio para o cliente sintético. | Não demonstra criação/vínculo de lead, possibilidade de múltiplos interessados, deduplicação, lineage ou autorização de visualização. |
| Atendimento/Tarefas | `D` | A ficha tem painel de anotações/tarefas e botão para adicionar tarefa; no estado sintético está vazia. | O comando não foi aberto para não criar atividade. Permanecem não demonstrados responsáveis, prazo, lembrete, comunicação, reatribuição, conclusão, auditoria e acesso por equipe. |

### Evidência da segunda varredura — `VU-06` (notas e recomendações)

| Aba/controle | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Observações | `D` | A ficha disponibiliza apenas uma área livre de texto e salvamento geral. | Não há estrutura visível de autor, data, imutabilidade, edição, menção, classificação, retenção ou controle de conteúdo sensível; nenhum texto foi gravado. |
| Radar | `D` | O painel procura imóveis com características parecidas e exige ao menos um imóvel sugerido antes de mostrar resultado; há comando de salvar sugestões. | Não foi inserida sugestão. Não foi demonstrado algoritmo, critérios, explicabilidade, consentimento, enviesamento, histórico, cancelamento ou envio de recomendação ao cliente. |

### Evidência da segunda varredura — `VU-08`

| Item observado | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Listagem e campos expostos | `D` | A lista apresenta estado de negociação, nota visual, tipo, datas, código, localização detalhada, proprietário, atributos, valores, impostos/condomínio, área, chaves e portais/mídias. Dados reais não foram copiados para esta matriz. | A densidade de dado em listagem não demonstra mascaramento por papel/finalidade, política de endereço/chave, frescor, origem ou qualidade. |
| Ações por imóvel | `D` | Cada linha expõe visualização, locação, atualização, duplicação, edição e exclusão; há exportação, ordem, modo de exibição e filtro na lista. | Nenhuma ação foi acionada. Confirmação, alçada, logs, rollback, idempotência, escopo de papel, proteção contra duplicação/publicação e auditoria permanecem não demonstrados. |
| Anúncios/portais | `D` | A interface relaciona imóvel a envio de anúncios, portais configurados e mídia ativa. | Não foi aberto canal, publicado, atualizado ou exportado anúncio; não há prova de preview, aprovação, consentimento do proprietário, rastreio de publicação ou reversão. |

### Evidência da segunda varredura — `VU-09` e `VU-10`

| Área observada | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Ciclo e estado de imóvel | `T` | O imóvel sintético persistido possui status como Em Captação, Ativo, Inativo e Em Locação, além de abas Principal, Histórico de alterações e Arquivos. | A simples presença de estados não prova transições permitidas, efeitos em estoque, reserva, contrato, publicação, auditoria ou reversão. |
| Caracterização e precificação | `D` | A ficha reúne tipo, negócio venda/aluguel, habite-se, destaque/lançamento, valores de aluguel/IPTU/condomínio, atributos, área, empreendimento e localização. | Campos vazios/zero do item sintético não validam obrigatoriedade, regras de valor, vigência de tabela, precisão monetária ou proteção contra alteração retroativa. |
| Proprietário/captador/comissão | `D` | Há busca para captador e proprietário e campo de comissão. | Não foi selecionado proprietário/captador. Não há evidência de representação, autorização de venda/locação, contrato de corretagem, alçada de comissão ou imutabilidade de regra. |
| Chaves e informação confidencial | `D` | A ficha inclui local/observação de chaves, códigos de tributos/registro/rede, observações públicas e confidenciais, além de flags de situação. | A superfície não mostra proteção de campo, mascaramento, acesso por papel, leitura auditada ou isolamento de conteúdo confidencial/chaves. |
| Comunicação, conteúdo e mídia | `D` | Há opções de notificação por WhatsApp, descrição com geração por IA, agenda, vídeo, iframe, características e adição/ordenação de fotos. | Nenhum conteúdo, mídia ou notificação foi criado. Faltam evidências de consentimento, preview, moderação, sanitização de iframe, direitos de mídia, aprovação de publicação e logs. |

### Evidência da segunda varredura — `VU-11`

| Item observado | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Lista e estado vazio | `D` | A tela de Empreendimentos/Condomínios estava vazia e exibe entrada de inserção, ordenação, modo de exibição e filtro. | O estado vazio impede verificar hierarquia de empreendimento, torre, unidade, construtora, tabela/preço, disponibilidade, mídia, documentos, versão ou permissão por unidade. |
| Inserção de condomínio | `B` | Há comando de inserção identificado. | Não foi aberto/criado para evitar gerar um empreendimento sintético sem caminho validado de limpeza; o wizard fica como evidência pendente controlada. |

### Evidência da segunda varredura — `VU-12`

| Item observado | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Busca e filtros | `D` | A tela oferece compra/aluguel, tipologia, localização textual, ordenação, filtros, pesquisa por área do mapa e controle de atualização ao mover o mapa. | Nenhum filtro/bounding box foi alterado nesta passada; não foram demonstrados histórico, autorização, paginação, limitação de consulta, correção de geocoding ou salvamento de busca. |
| Resultados e mapa | `D` | Mapa e cards associam código, mídia, tipo, preço, atributos e recorte geográfico; nenhum dado real foi transcrito. | A combinação de localização/atributo/valor tem risco elevado de exposição. A tela não torna visível regra de mascaramento, atraso de atualização, disponibilidade, consentimento de publicação ou escopo por papel. |
| Conhecer região | `B` | Existe comando de conhecimento de região. | Não foi acionado porque poderia disparar integração/conteúdo externo; finalidade, fonte, consentimento, rastreamento e rollback não são demonstrados. |

### Evidência da segunda varredura — `VU-13`

| Item observado | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Lista, ordenação e filtro | `D` | A tela de Visitas possui estado vazio, inserção, ordenação e filtro. | Sem registros sintéticos associados, não foi possível demonstrar campos de lista, estados, cliente/imóvel/corretor, conflito, cancelamento, conclusão ou auditoria. |
| Inserção de visita | `B` | A entrada de criação está disponível. | Não foi aberta nesta segunda passada para evitar gerar agenda e potencial notificação; o fluxo detalhado permanece classificado como não demonstrado em execução segura. |

### Evidência da segunda varredura — `VU-15`

| Item observado | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Estados e colunas de negócio | `D` | A Central de Negócios separa Ativo, Aprovado, Em Análise, Vencido, Rescisão e Encerrado, com colunas para código externo, imóvel, tipo, cliente, proprietário, valor, início/final, status, cobranças e ações. | Sem negócios sintéticos, não foram demonstradas regras de transição, paralelismo, contrato, renovação, rescisão, cobrança, comissão, trilha nem correlação com estoque. |
| Importar planilha e contrato por IA | `B` | Os dois comandos são visíveis na entrada da lista. | Não foram acionados para não enviar arquivo, iniciar extração de contrato ou produzir mutação. Preview, schema, duplicidade, aprovação humana, privacidade, origem, rollback e logs não foram demonstrados. |

### Evidência da segunda varredura — `VU-18`

| Item observado | Classificação | Achado verificável | Limite de interpretação |
| --- | --- | --- | --- |
| Filtros e categorias | `D` | O Financeiro filtra período, tipo receita/despesa, pendente/pago, categoria, vencimento e cliente/fornecedor; as categorias incluem comissão, aluguel, multa, administração, impostos, manutenção e repasse. | O filtro não demonstra policy, busca por escopo, integridade de dados, ordenação, paginação, timezone ou comportamento com carteira real. |
| Resumo e abas | `D` | A tela separa cards de receitas, despesas, saldo e cobranças de contratos, além de abas Lançamentos, Cobranças de contratos e Repasses ao proprietário. | Os cards no período vazio não demonstram definições, source of truth, conciliação, reversão, `as_of`, frescor ou tratamento de valor previsto versus realizado. |
| Criação financeira | `B` | Há comandos de novo lançamento e parcelado. | Não foram abertos para evitar gerar efeito financeiro. Formas de pagamento, aprovação, cobrança, retorno, cash application, entitlement, settlement, estorno e segregação de função continuam não demonstrados. |

## 3. Cobertura de Locação

| ID | Superfície/rota | Unidades obrigatórias de inspeção | Risco principal | 1ª varredura | 2ª varredura |
| --- | --- | --- | --- | --- | --- |
| `LC-01` | Dashboard e filtros de aluguel | Métricas de aluguel, lista, drill-down, estados e data de corte. | Indicador sem estado de prova. | `D` parcial | Pendente |
| `LC-02` | `/clientes` — Locatário/parte | Papel de locatário, coocupante, fiador, contato, dossiê, duplicidade e ficha. | PII/garantia. | `T` parcial | Pendente |
| `LC-03` | `/proprietarios` — Proprietário | Papel, dados de pagamento, autorização, imóveis, documentos e ficha. | Dados bancários/titularidade. | `T` parcial | Pendente |
| `LC-04` | `/imoveisagencia` — Inventário locável | Disponibilidade, negociação aluguel, preço, chaves, proprietário, mídia, estado e filtros. | Publicação/chaves. | `D` parcial | Pendente |
| `LC-05` | Wizard/ficha de imóvel locável | Todas as etapas, proprietário, comissão, chaves, documentos, anúncios e transições. | Criar/publicar ativo. | `T` parcial | Pendente |
| `LC-06` | `/negocios/alugueis` — Negócios de aluguel | Funil, etapas, criação, contrato, importação, cobrança, renovação, rescisão e estados. | Contrato/cobrança. | `D` parcial | Pendente |
| `LC-07` | `/visitas` e `/agendamentos` | Visita, agenda, conflito, atividade, status, notificação e privacidade. | Comunicação/agenda real. | `D` parcial | Pendente |
| `LC-08` | `/servicos` — Serviços | Lista, filtros, criação, contrato, imóvel, pagador, prestador, valor, agenda, status, anexos e aprovação. | Ordem/pagamento/prestador. | `D` parcial | Pendente |
| `LC-09` | `/servicos_prestadores` — Prestadores | Cadastro, especialidade, status, documentos, pagamento, vínculo, inativação e busca. | Dados bancários/PII. | `D` parcial | Pendente |
| `LC-10` | `/vistorias` — Vistorias | Lista, criação, contrato, imóvel, item/ambiente, mídia, laudo, comparação, aceite e estado vazio. | Laudo/mídia/efeito contratual. | `D` parcial | Pendente |
| `LC-11` | `/sinistros` — Sinistros | Lista, criação, caso, contrato, garantia, documentos, responsáveis, prazo, pagamento e estado vazio. | Seguro/disputa/pagamento. | `D` parcial | Pendente |
| `LC-12` | `/financeiro` — Lançamentos | Categorias, filtros, lançamento, conciliação, comprovante, estorno e exportação. | Alteração de carteira. | `D` parcial | Pendente |
| `LC-13` | Financeiro — Cobranças de contratos | Lista, atraso, acordo, boleto, retorno, filtro, ações em lote e detalhe. | Cobrança/pagamento. | `D` parcial | Pendente |
| `LC-14` | Financeiro — Repasses ao proprietário | Elegibilidade, dedução, taxa, instrução, retorno, prestação de contas e estado. | Repasse/dado bancário. | `D` parcial | Pendente |
| `LC-15` | `/documentos` — Formulários | Contrato de administração, locação, vistoria, recibo, versão, geração e permissão. | Documento/assinatura. | `D` parcial | Pendente |
| `LC-16` | Área de cliente/proprietário | Login, escopo de portal, dados, documentos, pagamentos, manutenção e revogação. | Vazamento interpartes. | `N` | Pendente |
| `LC-17` | Cargos e permissões | Políticas de administrador, corretor, financeiro, manutenção e portal. | Escalada de privilégio. | `D` parcial | Pendente |

## 4. Controles transversais obrigatórios

| ID | Controle | Evidência exigida |
| --- | --- | --- |
| `X-01` | Busca e filtros | Critério, máscara, paginação, escopo, erro/vazio e tentativa de enumeração. |
| `X-02` | Botões e ações em massa | Presença, confirmação, preview, permissão, idempotência, reversão e risco. |
| `X-03` | Formulários | Campo, tipo, help, máscara, validação local/servidor, obrigatoriedade, erro e persistência. |
| `X-04` | Documentos e mídia | Upload, classificação, download, pré-visualização, versão, validade, permissão, retenção e exclusão. |
| `X-05` | Financeiro | Instrução, comprovante, retorno, cash application, entitlement, settlement, conciliação e estorno. |
| `X-06` | Permissões | Papel, objeto, campo, menu, rota direta, ação, exportação, documento e sessão. |
| `X-07` | UX/visual | Hierarquia, responsividade, contraste, teclado, loading, erro, vazio, feedback, motion e densidade. |
| `X-08` | Integrações/automação | IA, importação, planilha, portais, comunicação, financeiro e webhooks: preview, aprovação, observabilidade e rollback. |

## Referências

[1] [Auditoria prática inicial](auditoria_pratica_hincrivel.md)

[2] [Protocolo de auditoria prática](protocolo_auditoria_pratica_crm_referencia.md)
