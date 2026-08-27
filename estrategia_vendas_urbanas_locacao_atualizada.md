# Estratégia atualizada — Vendas Urbanas e Locação

**Versão:** `2026-08-27`  
**Status:** `atualização_estratégica_completa_autorizada`  
**Escopo:** exclusivamente as colunas **Vendas Urbanas** e **Locação**. A arquitetura global permanece **SUPER ADM → ADM → LOTEADORA → VENDAS URBANAS → LOCAÇÃO**; nenhuma decisão deste documento altera setores, políticas ou dados das outras colunas. [1]

> **Limite de execução aprovado:** esta etapa permanece estritamente documental. Ela especifica visão, domínio, jornadas, requisitos, critérios de aceite, riscos, roadmap e provas; não autoriza criar ou alterar schema, migrations, rotas, telas, integrações, permissões operacionais, automações ou dados do CRM. Qualquer implementação será uma etapa futura e exigirá recomendação prévia e autorização explícita.

> **Tese de produto:** o CRM não deve ser apenas uma lista de contatos, imóveis e contratos. Ele deve guardar o contexto correto de cada relação, pedir a evidência no momento certo e transformar o próximo trabalho da equipe em uma ação explicável, segura e reversível.

## 1. Base de decisão e limites

Esta versão combina o estudo setorial acumulado, as estratégias existentes, a arquitetura aprovada e a auditoria prática por controle do CRM de referência. A referência confirmou expectativas de mercado — como funil, listas, filtros, cadastros, imóveis, agenda, carteira, documentos, manutenção e inteligência — mas não determina nossa arquitetura. Onde houve bloqueio, erro, permissão insuficiente ou ação que não poderia ser concluída com segurança, a estratégia estabelece um requisito de prova próprio, e não uma cópia inferida. [2] [3] [4]

A conferência documental independente registrou a presença, materialidade, referências internas, limites de escopo, privacidade e checkpoints desta atualização. Essa conferência demonstra que os documentos foram realmente atualizados e preservados; ela não transforma lacunas da auditoria prática em certeza funcional. [7]

| Fundamento | Decisão de estratégia |
| --- | --- |
| Evidência demonstrada | Converte-se em requisito de experiência ou fluxo, com critério de aceite próprio. |
| Evidência sintética/reversível | Converte-se em requisito operacional, mantendo limite de escopo e restauração segura. |
| Funcionalidade declarada ou somente visível | Converte-se em hipótese de mercado e em prova futura, nunca em comportamento presumido. |
| Controle bloqueado, inconclusivo ou não demonstrável | Converte-se em requisito de segurança, observabilidade e teste; não sinaliza ausência de capacidade no produto de referência. |

## 2. Promessa de valor e experiência

O produto deve ajudar a equipe a **explorar os dados de forma mais intuitiva** por meio de contexto, filtros governados e filas orientadas à próxima ação. Deve permitir **entender melhor as tendências** usando métricas com fórmula, período, fonte, estado e data de corte explícitos. Deve também permitir **salvar ou compartilhar facilmente** uma proposta, dossiê, relatório ou evidência, mas somente pelo caminho com preview, acesso mínimo, expiração quando aplicável e trilha de auditoria.

| Princípio | Decisão aplicável às duas colunas | Critério de aceite |
| --- | --- | --- |
| Núcleo único | `Party`, ativo, evidência, tarefa, evento e regra são objetos canônicos. | A mesma pessoa/empresa pode assumir papéis datados sem duplicar cadastro ou autorização. |
| Jornada específica | Venda urbana e locação usam fases, gates e obrigações diferentes. | Um status comercial não substitui estado contratual, financeiro ou documental. |
| Progressão por finalidade | A ficha abre os dados necessários à próxima decisão, não todo o dossiê no primeiro contato. | Campo sensível e consulta externa exigem finalidade, aviso, policy e registro. |
| Evidência antes de certeza | O sistema usa declarado, recebido, em revisão, divergente, aprovado pelo responsável e expirado. | Nenhuma tela conclui poder, crédito, pagamento, cobertura ou regularidade automaticamente. |
| Ação segura | Alterações críticas passam por comando transacional e auditável. | Há pré-condição, alçada, idempotência, confirmação, erro seguro e compensação/reversão aplicável. |
| Leitura útil | Lista, gráfico e card levam ao fato-fonte autorizado, não a uma agregação opaca. | Métrica informa fórmula, escopo, `as_of`, frescor, limitação e drill-down protegido. |

## 3. Modelo canônico compartilhado

| Objeto | Responsabilidade | Regra de integridade |
| --- | --- | --- |
| `Party` e papel temporal | Pessoa física, pessoa jurídica e seus papéis de negócio. | Cliente, comprador, locatário, proprietário, fiador, solidário, representante, corretor, captador e prestador são relações datadas, não cadastros duplicados. |
| Ativo | Imóvel urbano, unidade ou imóvel locável. | Titularidade, administração, disponibilidade, captação, chave, preço, anúncio e situação contratual são dimensões distintas. |
| Perfil de busca | Intenção, território, faixa, prazo e critérios declarados. | Prioridade é explicável e configurável; não usa score secreto como decisão automática. |
| Proposta/contrato | Oferta e instrumento versionados. | Proposta, reserva quando aplicável, contrato, dossiê e financeiro possuem estados e correlações próprios. |
| Dossiê/evidência | Documento, declaração, mídia, checklist e revisão. | Arquivo, metadado, origem, finalidade, versão, validade, retenção e acesso são separados; anexar não equivale a aprovar. |
| Evento financeiro | Fato econômico e suas obrigações derivadas. | Cobrança, retorno, aplicação de caixa, dedução, direito econômico, instrução e liquidação não são o mesmo estado. |
| Atividade/caso | Visita, tarefa, manutenção, vistoria, sinistro e exceção. | Todo caso tem objeto, owner, prazo, estado, evidência e histórico; não cria efeito financeiro por inferência. |

## 4. Estratégia completa de Vendas Urbanas

### 4.1 Jornada operacional

Vendas Urbanas conecta captação, proprietário, ativo, demanda, visita, proposta, contrato e pós-venda. A jornada começa com dados mínimos de origem e intenção, preserva a autoridade de quem oferece o ativo e só amplia o dossiê quando existe finalidade concreta. A equipe pode organizar rapidamente os leads e oportunidades, mas a pressão de velocidade nunca justifica edição direta sem trilha ou exposição massiva de contatos.

| Fase | Resultado de produto | Gate obrigatório | Métrica de operação |
| --- | --- | --- | --- |
| Origem e triagem | Lead com canal, intenção, contato permitido e owner. | Deduplicação assistida e finalidade de atendimento registradas. | Tempo até primeira resposta válida. |
| Captação | Proprietário e ativo em revisão. | Relação declarada, territorialidade e pendências documentais visíveis. | Ativos com autoridade comercial registrada antes de anúncio. |
| Qualificação | Comprador/proponente com perfil de busca. | Critérios de região, tipo, faixa, prazo e viabilização declarada suficientes. | Perfis completos antes de visita/proposta. |
| Match e visita | Sugestão explicável e visita agendada. | Elegibilidade do ativo, conflito de agenda, participantes e comunicação autorizada. | Visitas realizadas com feedback estruturado. |
| Proposta | Oferta versionada por ativo e parte. | Condição, vigência, alçada e evidência mínima revisadas. | Propostas com versão/owner/motivo de alteração. |
| Contrato e pós-venda | Contrato e marcos correlacionados. | Instrumento, dossiê, aprovação e obrigações de cada área concluídos. | Pendências reabertas e tempo até dossiê completo. |

### 4.2 Setores e requisitos

| Setor | Capacidade estratégica | Requisitos de segurança e experiência |
| --- | --- | --- |
| Clientes e compradores | Perfil de intenção, grupo comprador, viabilização declarada, tarefas e dossiê progressivo. | Documento, renda e conta só surgem por finalidade; busca/consulta possui log, limites e alternativa manual. |
| Proprietários e captação | Parte, representação, autorização comercial, captação e documentação do ativo. | Contato comercial não equivale a titular/assinante; poderes, vigência e revisão são próprios. |
| Imóveis | Inventário, atributos, territorialidade, preço, condições, chaves, mídia e anúncio. | Localização detalhada, chave, dados confidenciais e mídia usam permissão de campo/finalidade; publicação é fluxo separado. |
| Empreendimentos | Construtora, empreendimento, torre, unidade e correspondente autorizado. | Hierarquia e herança são explícitas; preço, disponibilidade, mídia e autorização são definidos por unidade/regra versionada. |
| Leads e funil | Lista, filtros, prioridade, estágio, temperatura, owner e SLA. | Etapa, prioridade, temperatura e SLA são dimensões independentes; transição registra autor, motivo, regra e reversão autorizada. |
| Visitas e agenda | Agenda, participantes, ativo, resultado, próxima ação e conflito. | Criar/remarcar/cancelar não envia comunicação sem preview, política e destinatário autorizado. |
| Vendas e contratos | Proposta, reserva quando aplicável, versão, aprovação, assinatura e pós-venda. | Concorrência, alçada e elegibilidade são garantidas no dado; contrato não confirma recebimento ou comissão. |
| Financeiro Vendas | Comissão, direito econômico, calendário e recebível relacionado. | Direito de corretor/imobiliária/parceiro é datado e versionado; cálculo não instrui pagamento automaticamente. |
| Inteligência comercial | Priorização, qualidade de funil, origem/ROI, saúde, campanhas e recomendações. | Regra/modelo informa fatores, frescor, limitação, owner e revisão humana; distribuição/campanha é aprovada e idempotente. |

### 4.3 Critérios de aceite prioritários

| ID | Critério verificável |
| --- | --- |
| `VU-A01` | Filtros e listas mostram critérios ativos, ordenação, paginação estável, vazio/erro e policy por objeto/campo, sem ampliar acesso por URL ou limite de linhas. |
| `VU-A02` | A ficha de parte não duplica pessoa/empresa em papéis diferentes e distingue contato, representante, assinante, proprietário e comprador. |
| `VU-A03` | A edição de estágio/temperatura/responsável produz evento de auditoria com estado anterior, estado novo, autor, data, motivo e precondição. |
| `VU-A04` | A publicação de imóvel exige autorização vigente, preview, canal, escopo de conteúdo, confirmação e histórico de publicação/reversão. |
| `VU-A05` | Proposta e contrato conservam versões, alçadas e evidências; alteração tardia não reescreve a versão aceita. |
| `VU-A06` | Métricas de funil, origem e conversão trazem fórmula, período, coorte, fonte, `as_of`, frescor, limitação e acesso ao fato autorizado. |
| `VU-A07` | IA, importação, exportação, roleta e campanhas têm preview, política, limite, idempotência, monitoramento, cancelamento e trilha de auditoria. |

## 5. Estratégia completa de Locação

### 5.1 Jornada operacional

Locação é uma relação de ciclo longo. Ela une administração do imóvel, seleção do ocupante, garantia, contrato, cobranças, carteira, repasses, manutenção, vistorias e renovação. A estratégia evita dois erros recorrentes: tratar administração e locação como o mesmo prazo, e tratar boleto, comprovante ou repasse exibido como confirmação de caixa/liquidação.

| Fase | Resultado de produto | Gate obrigatório | Métrica de operação |
| --- | --- | --- | --- |
| Administração | Imóvel e relação com proprietário em estado administrável. | Escopo, vigência, responsabilidades e pendências declaradas/revisadas. | Ativos administrados com documentação/owner de pendência. |
| Demanda e candidatura | Perfil de locação e composição inicial de partes. | Finalidade, contato permitido e critérios de moradia suficientes. | Tempo de triagem sem coleta documental excessiva. |
| Garantia e análise | Dossiê de candidatura e garantia com status explícito. | Política aplicável, evidências e exceções aprovadas quando necessárias. | Casos em análise por pendência e prazo. |
| Contrato | Locação e administração correlacionadas, mas independentes. | Condições, prazo, reajuste, vencimento, encargos, garantia e versão aprovados. | Contratos com regra vigente e dossiê mínimo. |
| Carteira | Obrigações e cobranças por competência. | Instrução externa habilitada, com regra, destinatário e idempotência. | Atraso, pendência, realizado e conciliado em lentes separadas. |
| Repasse | Dedução e direito de proprietário calculados/revisados. | Recebimento conciliado, políticas e bloqueios verificados, alçada concedida. | Direitos bloqueados/aptos e tempo de prestação de contas. |
| Serviços e exceções | Caso de manutenção, vistoria ou sinistro com evidência. | Owner, prazo, escopo, orçamento/autorização e acesso definidos. | SLA por caso, reabertura e custo autorizado. |
| Renovação e saída | Marcos, vistoria, pendências, negociação e encerramento. | Regra/versão contratual aplicável e decisões documentadas. | Renovações, rescisões e pendências de entrega por carteira. |

### 5.2 Setores e requisitos

| Setor | Capacidade estratégica | Requisitos de segurança e experiência |
| --- | --- | --- |
| Clientes/locatários | Cadastro progressivo, coocupantes/solidários, perfil, dossiê e área de cliente mínima. | Autenticação não concede escopo; portal usa grant datado, finalidade e revogação. |
| Proprietários e imóveis | Vínculo de administração, ativo, disponibilidade e documentação. | Administração e propriedade são relações datadas; dados de pagamento/chaves têm proteção específica. |
| Locação e contratos | Esteira de partes, garantia, condição, contrato, aditivos, renovação e rescisão. | Rascunho seguro, versão, precondições, exceção, alçada e rollback/compensação aplicável. |
| Padrões de locação | Políticas de pessoa, finalidade, prazo, reajuste, cobrança, multa, juros, taxa, repasse e testemunhas. | Default é versionado, datado e futuro; não altera contrato existente sem aditivo/auditoria. |
| Financeiro Locação | Lançamentos, cobrança, estatística, carteira, comprovante e exceção. | Evento/obrigação/instrução/retorno/cash application são separados e reconciliáveis. |
| Repasses ao proprietário | Dedução, taxa, direito, aprovação, instrução, settlement e prestação de contas. | Direito não é pagamento; toda execução depende de elegibilidade, alçada, provedor e retorno conciliado. |
| Serviços e prestadores | Solicitação, orçamento, pagador, prestador, agenda, execução, evidência e decisão. | Dados bancários/documentais de prestador são mínimos/mascarados; serviço não gera pagamento por inferência. |
| Vistorias e sinistros | Caso, item/ambiente, evidência, prazo, responsável, decisão e vínculo contratual. | Não concluir culpa, cobertura, indenização ou obrigação financeira sem processo/evidência aplicáveis. |
| Portais | Cliente/proprietário vêem apenas documentos, ocorrências e obrigações autorizadas. | Grant, escopo, vigência, revogação, expiração de arquivo e audit event protegem cada leitura. |

### 5.3 Critérios de aceite prioritários

| ID | Critério verificável |
| --- | --- |
| `LC-A01` | Administração e locação mantêm contratos, partes, prazo, obrigações, versões e estados separados, mesmo quando ligados ao mesmo imóvel. |
| `LC-A02` | Política de reajuste, multa, juros, tributo, tarifa, taxa e repasse declara base, calendário, vigência, arredondamento, exceção, owner e versão. |
| `LC-A03` | Esteira de locação possui rascunho, retomada, abandono e validação por etapa; avançar sem requisito gera feedback seguro e específico. |
| `LC-A04` | Boleto/instrução, retorno, pagamento em análise, aplicação de caixa, conciliação e repasse/liquidação possuem estados distintos e correlação auditável. |
| `LC-A05` | Cobrança e avisos usam outbox, preview, consentimento/finalidade, limite de repetição, idempotência, log e suspensão. |
| `LC-A06` | Serviços possuem pagador, orçamento, autorização, agenda, execução e evidência próprios, sem converter mudança de status em obrigação financeira automática. |
| `LC-A07` | Vistoria e sinistro registram objeto, caso, ambiente/item, evidência, owner, prazo, decisão e acesso mínimo sem inferir responsabilidade ou indenização. |
| `LC-A08` | Portal de cliente/proprietário falha sem enumerar dados quando o grant expira, é revogado, não cobre o objeto ou a URL é manipulada. |

## 6. Dados, segurança, financeiro e integrações

| Domínio | Decisão obrigatória |
| --- | --- |
| Autorização | Policy é aplicada no dado/serviço, com organização, módulo contratado, papel, escopo, finalidade, vigência e objeto. Menu, URL e filtro não concedem acesso. |
| Documentos | Storage privado; metadados de tipo, origem, finalidade, validade, revisão, retenção e acesso; download temporário/auditado. |
| Dados pessoais | Coleta mínima por etapa, mascaramento adequado, busca protegida contra enumeração, logs de acesso e retenção configurável. |
| Financeiro | Subledger orientado a eventos; nenhum card, boleto, comprovante ou direito econômico confirma caixa/liquidação isoladamente. |
| Integrações | Outbox/inbox, autenticação de callback, idempotência, deduplicação, correlação, timeout, retentativa segura e fila de divergências. |
| IA e automação | Dados/fatores/versionamento explícitos, limites de autonomia, revisão humana, monitoramento de erro/viés e rollback. |
| Observabilidade | Toda falha de sessão, rota, permissão, integração ou comando crítico recebe correlação, estado seguro e instrução de recuperação. |

## 7. Roadmap de desenvolvimento e prova

| Onda | Entrega | Critério de passagem |
| --- | --- | --- |
| 1. Fundação compartilhada | `Party`, papéis, organização/escopo, ativo, dossiê, tarefas, auditoria, RLS e design system. | Testes permitir/negar e nenhuma leitura/escrita entre organizações ou objetos sem grant. |
| 2. Vendas Urbanas | Captação, perfil de busca, imóvel/proprietário, funil, visita, proposta e dossiê. | Fila, transições, proposta e publicação passam por critérios de acesso, evidência e reversão. |
| 3. Locação | Administração, esteira, política versionada, contrato, carteira e portais mínimos. | Um contrato de teste atravessa etapa, regra, obrigação e dossiê sem confundir estados. |
| 4. Financeiro operacional | Subledger, cobrança, retorno, conciliação, dedução e repasse. | Cenários de atraso, parcial, duplicidade, estorno, bloqueio e exceção conciliam sem perda de fatos. |
| 5. Serviços e exceções | Prestador, orçamento, manutenção, vistoria, sinistro, renovação e rescisão. | Casos preservam evidência, owner, alçada e cronologia, sem criar pagamento/culpa automáticos. |
| 6. Inteligência e canais | Métricas, regras explicáveis, alertas, publicação e integrações governadas. | Toda automação possui explicação, limite, aprovação, observabilidade e desligamento seguro. |

## 8. Governança de atualização contínua

Toda alteração futura deve carregar a cadeia **intenção → evidência → decisão → requisito → prova prática → observação → aprendizado**. A referência de mercado é fonte de hipótese e comparação; norma, política interna, dado de operação, teste e decisão de produto precisam permanecer separados e versionados. Qualquer mudança de fórmula, fluxo, permissão, formulário ou integração exige owner, impacto, teste, rollback/compensação, evidência de aceite e nota de mudança.

| Sinal de mudança | Ação obrigatória |
| --- | --- |
| Campo novo ou obrigatório | Registrar finalidade, origem, acesso, retenção, validação, dependência e teste de erro/vazio. |
| Métrica, score ou prioridade | Registrar fórmula/fatores, fonte, janela temporal, explicação, viés, owner, limite e intervenção humana. |
| Ação financeira ou externa | Definir idempotência, prévia, confirmação, alçada, correlação, retorno, conciliação e compensação. |
| Portal, lista ou exportação | Validar policy por organização/objeto/campo, minimização, expiração, logs e tentativa de acesso direto. |
| Aprendizado de piloto | Anexar evidência agregada, decidir manter/alterar/rejeitar, versionar a regra e não sobrescrever o histórico. |

## 9. Padrão permanente de recomendação antes de decisão

Antes de qualquer escolha relevante de escopo, arquitetura, modelo de dados, permissão, fluxo financeiro, integração, automação ou experiência, a liderança receberá uma recomendação objetiva. A recomendação não substitui a decisão do negócio: ela torna explícitos o melhor caminho técnico conhecido, sua evidência, as alternativas, os riscos, as dependências e o gate necessário para avançar com segurança.

| Elemento obrigatório | Pergunta que a recomendação responde |
| --- | --- |
| Decisão e objetivo | O que precisa ser decidido e qual resultado de negócio/usuário se busca? |
| Recomendação | Qual é o caminho mais seguro e completo no estado atual do conhecimento? |
| Evidência | Quais fontes, testes, normas, dados agregados ou decisões anteriores sustentam a escolha? |
| Alternativas | Que opções existem e por que ficam em segundo plano, em espera ou são rejeitadas? |
| Risco e impacto | O que pode falhar em segurança, operação, privacidade, financeiro, prazo ou experiência? |
| Pré-condições | Que schema, policy, contrato, protótipo, teste, integração ou validação precisa existir antes? |
| Critério de aceite | Qual prova prática confirma que a decisão foi implementada corretamente? |
| Owner e retorno | Quem aprova, quem executa, quando revisar e como reverter/compensar se necessário? |

> Em caso de evidência insuficiente, a recomendação deve declarar a incerteza e propor o menor experimento seguro que a reduza. Nunca deve apresentar como garantido um comportamento apenas presumido.

## 10. Reforços da pesquisa externa de mercado

A nova rodada de fontes primárias e referências de mercado confirmou que as capacidades competitivas mais recorrentes são: relação contínua entre parte e ativo, pipeline/esteira orientado a próximos passos, centralização contextual de contrato/carteira/serviço, portais, dossiê transacional, integrações de canais e leituras analíticas. A nossa diferenciação estratégica não será acumular essas capacidades; será preservá-las em um núcleo canônico, com política de objeto/campo/função, estado explícito, explicação e reversibilidade.[8] [9]

| Reforço confirmado | Atualização de estratégia | Limite obrigatório | Prova futura |
| --- | --- | --- | --- |
| Pipeline e fila contextual | Priorizar trabalho por estágio, idade, pendência, owner, próxima ação e causa de bloqueio, distinguindo pipeline de funil do comprador. | Estágio não altera contrato, disponibilidade, documento, comissão, cobrança ou repasse por inferência. | Cada item explica por que está na fila e qual pré-condição impede/permite a transição. |
| Visão contextual de ciclo longo | Permitir leitura controlada de parte, ativo, proposta, contrato, carteira, serviço e renovação no mesmo workspace de Locação. | Leitura integrada não unifica permissão de escrita nem amplia visibilidade fora do grant. | Um papel de teste enxerga apenas objetos/campos autorizados e a origem/atualização de cada fato. |
| Dossiê de transação | Ligar documentos, formulários, checklist, aprovações e assinatura a proposta/contrato por versão e responsável. | Anexo/assinatura não comprova, por si, autoridade, elegibilidade, pagamento ou liquidação. | O dossiê mostra versão vigente, pendências, owner, prazo, política e evento de decisão. |
| Integração por capacidade | Avaliar portais, assinatura, mensageria, garantia, crédito, cobrança e pagamento por contrato de capacidade. | Fornecedor, token ou callback não recebe acesso global e não se torna fonte de verdade sem reconciliação. | Cada integração demonstra escopo, dados mínimos, consentimento/base aplicável, idempotência, correlação, erro e desligamento. |
| Automação e IA responsáveis | Manter IA como explicação, síntese, priorização e rascunho até existir uma política específica para autonomia material. | A recomendação não envia mensagem, publica anúncio, altera responsável, nega garantia, cobra ou instrui repasse. | Toda saída informa fonte, versão, limitação, confiança, owner, revisão e override. |
| Portal e compartilhamento | Expor somente o necessário ao cliente, proprietário ou prestador por grant de objeto/campo/finalidade/vigência. | Link, e-mail, sessão antiga ou ID não concedem acesso; download exige política e auditoria. | Acesso fora do grant falha sem enumeração; acesso válido tem escopo, expiração e recibo auditável. |
| Segurança e acessibilidade | Transformar autorização de objeto/propriedade/função e acessibilidade por jornada em requisitos de aceite. | Componente visual, menu escondido ou validação de frontend não são controles suficientes. | Testes cobrem permitir/negar, teclado, foco, leitor de tela, estado vazio/erro, limite e rota direta. |

> **Recomendação atual:** manter a estratégia orientada a capacidades governadas, em vez de copiar a promessa de “plataforma única”. A unidade valiosa é o **contexto verificável de trabalho**; a fronteira indispensável é a separação entre leitura, decisão, comando, confirmação externa e liquidação.

## 11. Mercado brasileiro: contexto, não automatismo

Os indicadores pesquisados reforçam a necessidade de diferenciar oferta anunciada, negociação, contrato, crédito e fato de carteira. Fontes como FipeZAP, BCB, IBGE, CBIC, CRECISP e índices de plataforma têm universos, períodos, recortes e atrasos distintos. A estratégia, portanto, não adota um “preço de mercado” único: cada leitura externa precisa de proveniência, cobertura, `as_of`, método, limitação e estado de comparabilidade. [10] [11] [12] [13] [14] [15]

| Leitura estratégica | Vendas Urbanas | Locação | Regra que protege a decisão |
| --- | --- | --- | --- |
| Oferta e preço | Comparar preço de anúncio interno a índice externo somente em praça/tipologia/período comparáveis. | Separar valor anunciado, proposta, contraproposta, contrato e desconto interno antes de contextualizar a negociação. | Dados de anúncio não são preço de fechamento, avaliação individual ou valor de contrato. |
| Crédito | Usar contexto agregado de taxa, indexador, LTV e defasagem para planejamento de funil. | Usar crédito externo apenas se houver finalidade explícita; ele não substitui política de garantia/contrato. | Série externa nunca aprova crédito, muda elegibilidade ou altera prioridade de pessoa. |
| Oferta e giro | Ler estoque/ritmo externo como sinal para planejamento de captação e carteira. | Ler disponibilidade e tempo até locar a partir de fatos internos; pesquisa externa é só referência comparativa. | Métrica externa não sobrescreve disponibilidade, imóvel ativo, situação contratual ou SLA interno. |
| Territorialidade | Exigir país/UF/município/bairro segundo a granularidade real da fonte. | Permitir comparação por praça e tipologia, nunca inferir um bairro sem cobertura declarada. | Ausência de comparabilidade exibe indisponibilidade, não um ranking ou estimativa silenciosa. |
| Compartilhamento | Exportar leitura com fonte, período, universo, método, limitação e acesso ao fato interno autorizado. | Aplicar o mesmo recibo de contexto a relatórios de proprietário/gestor, respeitando grant e finalidade. | Um link, relatório ou portal não amplia o escopo de leitura nem remove o aviso metodológico. |

> **Recomendação de sequência:** uma etapa futura deve começar por um catálogo de indicadores e cartões contextuais, não por dashboard automatizado. Primeiro se valida proveniência, comparabilidade, atraso, revisão, acessibilidade e policy; somente depois se permite uma visualização ou comparação assistida. O contrato completo está no caderno de indicadores. [10]

## 12. Contratos, dossiês e evidências externas: controle regulatório documental

A nova pesquisa em fontes oficiais reforça que uma estratégia segura não trata o CRM como autoridade jurídica, registral ou financeira. O produto deve organizar evidências, versões, contexto e revisão; atos externos, eficácia contratual, validade de garantia, registro, certidão, assinatura, oferta e consequência patrimonial continuam dependentes do instrumento, da fonte competente e da análise aplicável. [16]

| Tema | Decisão estratégica aplicável | Limite que não pode ser ultrapassado | Prova futura de aceite |
| --- | --- | --- | --- |
| Locação urbana | Registrar contrato, administração, garantia, aviso, entrega/devolução, vistoria, encargo, preferência quando aplicável e versão como fatos datados e correlacionados. | Não calcular ou impor automaticamente multa, preferência, despejo, garantia, distrato ou qualquer consequência jurídica. | Dado sintético preserva estados e evidências sem sobrescrever versão anterior ou disparar comunicação/cobrança. |
| Garantia | Manter modalidade ativa única por contrato e versão, com revisão de conflito, vigência, documento, owner e exceção. | Status interno não decide aceitação, executabilidade, suficiência ou valor de fiador, seguro, caução ou outra garantia. | Uma segunda garantia ativa produz bloqueio explicado, auditado e encaminhado à revisão humana. |
| Oferta, proposta e empreendimento | Versionar anúncio, proposta, quadro-resumo quando aplicável, aprovação, aceite, contrato e comunicação material. | Não generalizar regra de incorporação/empreendimento para toda venda urbana ou contrato de imóvel usado/intermediação. | Versão vinculada a uma negociação permanece recuperável e a alteração material abre nova revisão, nunca sobrescreve o aceite. |
| Dossiê registral/notarial | Tratar certidão, matrícula, protocolo, ato, assinatura e documento de cartório como evidência externa com emissor, fonte, consulta, validade conhecida, arquivo, integridade e status de revisão. | Arquivo anexado ou assinatura não comprovam isoladamente propriedade, ônus, registro, transferência, vigência ou eficácia do ato. | Documento externo vencido, sem origem ou sem revisão não libera o rótulo “situação confirmada”. |
| Dados e comunicação | Associar cada documento, canal, portal e compartilhamento a finalidade, minimização, acesso, retenção, política, vigência e evento de auditoria. | A existência de relacionamento comercial não autoriza marketing, consulta externa, compartilhamento amplo ou acesso a dossiê. | Teste permitir/negar prova escopo de objeto/campo/finalidade e falha segura fora da policy. |
| Vigência normativa e integrações | Catalogar fonte, ato, versão, situação, data de verificação, alcance e owner de revisão antes de tornar regra externa requisito de produto. | Fonte revogada, alterada, parcial ou sem conteúdo diretamente verificável não habilita automação, checklist definitivo, conector ou alegação de conformidade. | Referência vencida/bloqueada deixa o requisito em “revisão necessária” e impede ativação material. |

> **Recomendação atual:** introduzir o conceito de **evidência externa verificável**, e não o rótulo genérico de “documento válido”. A primeira descrição organiza o que o CRM efetivamente sabe, de onde veio, quando foi verificado e quem pode revisar; a segunda cria uma falsa certeza que não cabe ao produto declarar.

## 13. Posicionamento, adoção e portal mínimo governado

As novas referências de produto e operação imobiliária apontam que o mercado já oferece listas, funis, contratos, financeiro, portais, integrações e automação. A diferenciação sustentável não é listar mais capacidades, mas conectar o contexto de trabalho por papel sem misturar fonte de verdade, permissão, comando externo ou liquidação. Assim, a promessa de produto deve ser apresentada por jornada e cenário concluído, não por quantidade de telas ou por alegação genérica de “tudo em um”. [17] [18] [19]

| Tema | Decisão estratégica | Limite obrigatório | Prova futura de aceite |
| --- | --- | --- | --- |
| Embalagem por capacidade | Diferenciar núcleo canônico, módulos de jornada, conectores e serviços de adoção; cada capacidade tem escopo, owner, dependência e contingência. | Um fornecedor, token, menu ou lista de integração não é uma capacidade ativa nem autorização de acesso. | Catálogo por capacidade declara dados mínimos, policy, estado, suporte, contingência e métrica de adoção. |
| Primeiro valor por papel | Definir para cada papel um cenário essencial, uma exceção previsível e um resultado observável antes de medir adoção. | Login, clique, permanência na tela ou volume de registros não são prova isolada de valor. | Coorte de teste conclui cenário essencial com qualidade, sabe recuperar erro e não usa contorno inseguro. |
| Onboarding contínuo | Tratar entrada de equipe, proprietário e usuário externo como jornada com contexto, owner, material por papel, pendência, expectativa e revisão. | Ajuda, lembrete ou comunicação não são enviados automaticamente sem canal, finalidade, política e aprovação aplicáveis. | O usuário identifica o próximo responsável, o prazo e a rota de escalonamento para uma pendência crítica. |
| Portal mínimo | Expor ao cliente, proprietário ou prestador somente um recorte de objetos, campos, documentos, fatos e ações explicitamente autorizados. | Portal não é cópia do backoffice; credencial, link, sessão antiga, URL, ID ou e-mail não ampliam o grant. | Papel de teste lê o contexto permitido com `as_of` e lineage; fora do escopo, a resposta falha sem enumeração. |
| Operação conectada | Reunir, na leitura contextual, parte, ativo, contrato, carteira, caso e evidência necessários a uma jornada. | O workspace conectado não funde contrato, obrigação, dado sensível, permissão de escrita ou fonte de verdade. | A jornada de teste mostra origem/frescor de cada fato e encaminha comando ao domínio autorizado. |
| IA e automação | Usar IA e regras inicialmente para explicar, priorizar, rascunhar e sinalizar bloqueios. | Sugestão não atribui, publica, comunica, cobra, aprova, paga ou repassa sem gate humano e trilha. | A saída informa fonte, versão, limitação, confiança, owner, revisão, override e desligamento seguro. |

> **Recomendação atual:** posicionar a futura plataforma como **contexto verificável de trabalho para imobiliárias**, e não como substituta da responsabilidade comercial, contratual, financeira ou humana. O valor inicial deve ser demonstrado por uma jornada curta e segura por papel; profundidade, automação e integrações entram somente após as provas de contexto, qualidade, suporte e reversão.

## Referências internas

[1] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)

[2] [Escopo da atualização estratégica](escopo_atualizacao_estrategica_vendas_locacao_hincrivel.md)

[3] [Consolidação de Vendas Urbanas](consolidacao_vendas_urbanas_hincrivel.md)

[4] [Consolidação de Locação](consolidacao_locacao_hincrivel.md)

[5] [Estratégia de Vendas Urbanas anterior](estrategia_vendas_urbanas.md)

[6] [Estratégia CRM consolidada](estrategia_crm_imobiliario_consolidada.md)

[7] [Relatório independente de verificação da atualização estratégica](relatorio_verificacao_atualizacao_estrategica_vendas_locacao.md)

[8] [Registro de pesquisa externa de referências de mercado](registro_pesquisa_referencias_mercado_vendas_locacao.md)

[9] [Matriz de confronto — referências externas × estratégia](matriz_confronto_referencias_estrategia_vendas_locacao.md)

[10] [Caderno de indicadores de mercado — Vendas Urbanas e Locação](caderno_indicadores_mercado_vendas_locacao.md)

[16] [Registro de pesquisa regulatória — Vendas Urbanas e Locação](registro_pesquisa_regulatoria_vendas_locacao.md)

[17] [Registro de posicionamento e adoção](registro_pesquisa_posicionamento_adocao_vendas_locacao.md)

[18] [Registro complementar de adoção e operação](registro_pesquisa_adocao_operacao_vendas_locacao.md)

[19] [Registro de operação, portal e implantação](registro_pesquisa_operacao_portais_vendas_locacao.md)

## Referências externas

[11] [FipeZAP — Índice FipeZAP](https://www.fipe.org.br/pt-br/indices/fipezap/)

[12] [Banco Central do Brasil — Informações do Mercado Imobiliário](https://www.bcb.gov.br/estatisticas/mercadoimobiliario)

[13] [IBGE — Domicílios alugados cresceram mais de 50% desde 2016](https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/46449-domicilios-alugados-cresceram-mais-de-50-desde-2016)

[14] [CBIC — Estudos e Indicadores Imobiliários Nacionais](https://cbic.org.br/estudos/)

[15] [CRECISP — Pesquisas de mercado](https://www.crecisp.gov.br/comunicacao/pesquisasmercado)
