# Fundação compartilhada — Vendas Urbanas e Locação

**Status:** `estratégia_documental_2026-08-27`  
**Escopo:** fundação comum de Vendas Urbanas e Locação. Este caderno não altera a hierarquia canônica, não implementa funcionalidades e não cria dados, políticas, integrações ou automações. [1]

## 1. Recomendação e razão de ordem

> **Recomendação:** a futura construção deve começar por contexto, identidade, relacionamento temporal, grants, evidências e eventos auditáveis. Formular uma tela primeiro parece mais rápido, mas cria cadastros que não sabem quem pode ver, mudar, compartilhar ou responder por cada fato.

A fundação não é um “módulo invisível”: ela permite que cada jornada de venda ou locação identifique o contexto em que acontece, as partes envolvidas, os dados permitidos, o estado vigente e o próximo passo que pode ser tomado. Ela não mistura Vendas Urbanas e Locação; compartilha padrões de integridade, não estados de negócio.

| Objetivo | Decisão estratégica | Risco evitado |
| --- | --- | --- |
| Isolamento de organizações | Toda ação nasce em uma organização, módulo, unidade e finalidade explícitos. | Uma busca, URL ou cache revelar informação de outro tenant. |
| Identidade duradoura | Pessoa ou empresa é uma `Party`; seus papéis e vínculos são relações datadas. | Criar clientes/proprietários/locatários duplicados ou transferir informação por homonímia. |
| Menor privilégio | Papel descreve capacidade; grant contextual e temporal concede escopo concreto. | Corretor, prestador ou portal receberem leitura/escrita além do necessário. |
| Evidência verificável | Documento e comprovação têm origem, versão, finalidade, classificação e estado próprios. | Tratar anexo como aprovação ou reutilizar documento em finalidade incompatível. |
| História imutável | Evento registra intenção, comando, resultado, autor, correlação e motivo. | “Editar o passado” e impossibilitar auditoria de operações, taxas, acessos ou contratos. |

## 2. Contexto de operação e fronteiras de acesso

O contexto é resolvido antes de qualquer leitura ou mudança futura. Ele não pode ser inferido somente por e-mail, rota, identificador de registro, nome de papel ou seleção visual. A sessão identifica quem está autenticado; a policy resolve o que a pessoa pode fazer naquele contexto.

| Elemento de contexto | Pergunta que responde | Regra |
| --- | --- | --- |
| Organização | De qual empresa contratante é este trabalho? | Toda consulta, arquivo e evento pertence a uma única organização. |
| Módulo | Trata-se de Vendas Urbanas ou Locação? | Módulo contratado/habilitado não substitui grant ou permissão de objeto. |
| Unidade/equipe | Em qual célula operacional a pessoa atua? | Escopo pode restringir carteira, região, equipe ou processo sem ampliar tenant. |
| Finalidade | Por que o dado será lido ou compartilhado? | Dados sensíveis e documentos exigem finalidade compatível e política explícita. |
| Objeto | Qual party, imóvel, contrato, caso ou evento é alvo? | Acesso se aplica ao objeto autorizado, não a uma categoria inteira por padrão. |
| Vigência | Quando o acesso começa, expira ou é revogado? | Todo grant e delegação tem tempo, owner, motivo e auditoria. |

### 2.1 Papéis de referência por módulo

Os papéis abaixo são referências de responsabilidade. Eles devem ser refinados por organização e não concedem acesso global automaticamente.

| Contexto | Papel de referência | Responsabilidade | Limite invariável |
| --- | --- | --- |
| Vendas Urbanas | Gestor comercial | Orquestrar carteira, estágio, SLA e exceções comerciais. | Não confirma caixa, não liquida comissão e não eleva acesso de terceiros. |
| Vendas Urbanas | Corretor/captador | Trabalhar leads/ativos atribuídos e registrar resultado de atividades. | Não enxerga toda a carteira por padrão nem publica/compartilha fora da política. |
| Vendas Urbanas | Assistente documental | Organizar pendências e evidências de dossiê. | Não aprova documentos, não assina contratos e não altera termos financeiros. |
| Locação | Gestor de locação | Governar administração, carteira, contratos, renovações e exceções. | Não redefine policy, não liquida caixa e não ultrapassa alçada. |
| Locação | Consultor/atendente | Conduzir candidatura, visita, proposta e comunicação autorizada. | Não aprova garantia, não altera contrato consolidado e não acessa carteiras externas. |
| Locação | Gestor de imóvel | Operar administração do ativo e ocorrências autorizadas. | Não converte contrato administrativo em contrato locatício por edição simples. |
| Locação | Coordenador de serviços | Organizar manutenção, orçamento, agenda e evidência por caso. | Não paga prestador, não responsabiliza parte e não acessa contratos fora do caso. |
| Transversal | Financeiro autorizado | Preparar leituras, conciliação, exceções e instruções conforme alçada. | Não confunde cobrança, retorno, caixa, direito e repasse. |
| Externo | Cliente/proprietário/prestador | Ler ou contribuir apenas no portal/caso expressamente concedido. | Nenhum login externo revela outros contratos, imóveis, documentos ou dados internos. |

### 2.2 Regra de negação por padrão

O produto deverá preferir negação segura quando faltar contexto, grant, policy, finalidade, vigência ou evidência necessária. Uma falha não deve enumerar identidades, registros ou permissões existentes.

| Situação futura | Comportamento recomendado | Evidência de aceite |
| --- | --- | --- |
| URL direta para objeto não autorizado | Negar sem revelar se o objeto existe. | Teste com sessão válida/objeto fora do escopo retorna resposta segura e evento de auditoria. |
| Grant expirado/revogado | Encerrar/restringir ação e exigir novo fluxo autorizado. | Leitura e mutação são negadas nos limites de vigência. |
| Arquivo sem finalidade/policy | Não gerar URL, preview ou download. | Storage e interface aplicam a mesma decisão de acesso. |
| Ação acima da alçada | Encaminhar para aprovação, sem executar parcialmente. | Não há efeito de negócio antes da aprovação registrada. |
| Falha de integração | Manter estado pendente/reprocessável com correlação. | Usuário recebe próximo passo sem dados sensíveis de fornecedor. |

## 3. Identidade, relacionamentos e papéis temporais

Uma mesma pessoa ou empresa pode aparecer em Vendas Urbanas e Locação sem que um papel implique outro. O núcleo deve registrar a relação e sua vigência, não multiplicar perfis ou presumir representação.

| Entidade estratégica | Responsabilidade | Regra de integridade |
| --- | --- | --- |
| `Party` | Pessoa física ou jurídica identificada de modo canônico. | Identidade é resolvida por evidência e política; sem usar coincidência de nome como vínculo. |
| `PartyRole` | Papel datado em um contexto: cliente, comprador, proprietário, locatário, garantidor, representante, corretor, prestador etc. | Um novo papel não duplica a parte nem herda escopo/consentimento sem regra. |
| `Representation` | Poder de agir/falar por pessoa/empresa, com instrumento e vigência. | Representante não vira titular, proprietário ou garantidor por inferência. |
| `Relationship` | Relação entre partes: grupo, coadquirência, solidariedade, contato, vínculo operacional. | Relação possui propósito, fonte, início/fim e visibilidade própria. |
| `PartySnapshot` | Retrato permitido de dados usados em proposta/contrato/evento. | Snapshot preserva contexto histórico; não é espelho mutável do cadastro atual. |

### 3.1 Dados pessoais e dossiê

Dados e documentos têm proteção proporcional à finalidade. O cadastro progressivo reduz coleta prematura e permite a evolução de interesse para análise, proposta e contratação sem confundir intenção com habilitação.

| Camada | Pode conter | Controle requerido |
| --- | --- | --- |
| Interesse inicial | Canal, busca, preferências, consentimentos e mínimo de contato. | Finalidade explícita, preferência de comunicação e retenção proporcional. |
| Qualificação | Informações necessárias para a etapa comercial, declaradas pela parte. | Fonte, data, responsável e distinção entre declarado/verificado. |
| Dossiê | Evidências privadas de identidade, representação, renda, propriedade, garantia ou contrato. | Classificação, origem, versão, validade, revisão, finalidade, policy e acesso auditado. |
| Snapshot contratual | Dados/evidências efetivamente aceitos para a transação. | Imutabilidade/versão e vínculo com contrato; não reuso automático. |

> **Regra:** anexar, visualizar ou atualizar um documento não equivale a validar, aprovar, compartilhar, contratar, emitir cobrança ou conceder acesso de portal.

## 4. Ativo, disponibilidade e relação com contratos

Vendas Urbanas e Locação usam imóvel urbano, mas cada vínculo tem estado e finalidade própria. A estratégia rejeita um “status único” que tente explicar captação, propriedade, divulgação, visita, proposta, venda, administração e locação ao mesmo tempo.

| Relação | Vendas Urbanas | Locação | Decisão comum |
| --- | --- | --- | --- |
| Titularidade | Quem possui ou representa o proprietário no ativo. | Quem possui ou representa o proprietário no ativo. | Relação datada, documentada e distinta de autorização de operação. |
| Captação/administração | Acordo de intermediação, exclusividade ou autorização comercial. | Contrato de administração, obrigações, prazo e alçada. | Vínculo contratual próprio, sem assumir disponibilidade. |
| Disponibilidade | Elegibilidade para divulgação/proposta/venda conforme restrições. | Elegibilidade para anúncio/candidatura/locação conforme restrições. | Estado composto, com fonte, owner e motivo de bloqueio. |
| Negociação | Visita, proposta, reserva quando aplicável, venda e contrato. | Candidatura, garantia, contrato de locação, aditivo, renovação/rescisão. | Fluxo preserva pré-condições, versões, alçadas e eventos. |

## 5. Eventos, decisões e linha do tempo

O histórico deve preservar o que foi tentado e o que ocorreu. Um evento não é apenas uma nota de tela: ele torna auditável a sequência de decisões e separa fatos de projeções e estados derivados.

| Classe | Exemplos estratégicos | Regra |
| --- | --- | --- |
| Intenção | Iniciar captação, solicitar documento, preparar proposta, pedir aprovação. | Ainda não altera fato de negócio sem confirmação/policy. |
| Comando | Criar versão de proposta, registrar visita, solicitar serviço, gerar instrução. | Requer idempotência, autor, contexto, validação e correlação. |
| Fato | Documento recebido, proposta aceita, contrato assinado, retorno recebido, vistoria concluída. | Tem origem, data, evidência e imutabilidade lógica. |
| Decisão | Aprovar exceção, negar acesso, aceitar condição, suspender publicação. | Registra owner, motivo, alçada, versão da regra e validade. |
| Projeção | Comissão estimada, vencimento esperado, previsão de renovação, score explicável. | Não é saldo, pagamento, aprovação ou obrigação consolidada. |

## 6. Matriz de aceite e de negação

| Área | Prova positiva necessária | Prova negativa necessária |
| --- | --- | --- |
| Contexto | Usuário autorizado vê somente seu tenant, módulo, equipe e objetos permitidos. | Troca de rota, filtro, ID ou cache não cruza tenant/módulo/objeto. |
| Party e papéis | Uma parte pode assumir papéis distintos com relações datadas. | Novo papel não duplica a identidade nem expõe dossiê de outro contexto. |
| Dossiê | Acesso com finalidade e grant mostra somente evidência mínima necessária. | Anexo sem policy não aparece, não gera URL e não pode ser inferido. |
| Imóvel | Vínculos válidos exibem ativo e estados próprios. | Proprietário, captação, administração e disponibilidade não se confundem. |
| Eventos | Linha do tempo mostra fonte, autor, correlação e ordem. | Repetição de comando não cria fato/efeito econômico duplicado. |
| Exceção | Alçada aprovada executa uma decisão identificada. | Tentativa fora de alçada não tem efeito parcial nem oculta o bloqueio. |

## 7. Gate de saída da fundação

A futura implementação só deve iniciar uma jornada vertical quando todos os pontos abaixo estiverem documentados, revisados e transformados em testes de aceite.

| Gate | Pergunta de saída |
| --- | --- |
| Limite de domínio | Estão separados Party, papel, representação, imóvel, contrato, dossiê, evento e projeção? |
| Autoridade | Toda ação tem organização, módulo, objeto, finalidade, papel/grant, vigência e alçada? |
| Dados | Há classificação, minimização, origem, retenção, versionamento e acesso de dossiê definidos? |
| Histórico | Comando, fato, decisão e projeção são distinguíveis e correlacionáveis? |
| Falha | Há comportamento seguro para acesso negado, integração indisponível, duplicidade e exceção? |
| Prova | A matriz de permitir/negar, os cenários críticos e o rollback/compensação foram definidos? |

## Referências internas

[1] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)

[2] [Estratégia atualizada — Vendas Urbanas e Locação](estrategia_vendas_urbanas_locacao_atualizada.md)

[3] [Plano estratégico de ondas](plano_estrategico_ondas_vendas_locacao.md)

[4] [Protocolo de atualização estratégica linear](protocolo_atualizacao_estrategica_linear.md)
