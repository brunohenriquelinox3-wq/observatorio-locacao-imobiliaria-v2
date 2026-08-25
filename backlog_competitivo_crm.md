# Backlog competitivo do CRM imobiliário

## Requisitos derivados do benchmark e sua regra de evolução

Este backlog é uma **fila de hipótese de produto**, não um compromisso comercial. Cada item deve manter a fonte competitiva, o problema validado em piloto, o responsável e o critério de saída antes de virar escopo de desenvolvimento.

| ID | Resultado | Requisito | Prioridade | Critério de aceitação |
| --- | --- | --- | --- | --- |
| COMP-01 | Não perder oportunidade comercial | Fonte, consentimento, dono, etapa, próximo passo e transferência de lead. | Fundação | Nenhum lead ativo sem responsável e sem próxima ação. |
| COMP-02 | Eliminar conflito de disponibilidade | Estoque por empreendimento/fase/lote/unidade, reserva, expiração, fila e bloqueio. | Fundação | Reserva concorrente tem resposta determinística e auditável. |
| COMP-03 | Tornar condição comercial confiável | Tabela versionada, condição, proposta, aprovação, documento e assinatura conectados. | Fundação | Proposta aprovada aponta sua versão de tabela e documentos exigidos. |
| COMP-04 | Viabilizar trabalho de campo | Aplicativo web responsivo para corretor/parceiro, com permissão e contexto mínimo offline/online conforme integração. | Fundação | Uma reserva, proposta e upload podem ser realizados com trilha de autoria e horário. |
| COMP-05 | Dominar loteadora | Entidades de gleba, empreendimento, fase, quadra, lote, registro, obra, estoque, carteira e pós-entrega. | Diferencial | Um lote percorre estados ortogonais sem confundir disponibilidade, registro e carteira. |
| COMP-06 | Materializar cadeia de recebimento | Plano de direitos por contrato, recebedor, fórmula, base, gatilho, prioridade, vigência, teto e reversão. | Diferencial | Uma entrada gera prévia explicável de direitos sem liquidar dinheiro no CRM. |
| COMP-07 | Conectar comercial e contabilidade | Subledger, competência, aplicação de caixa, conciliação, exceção, lote de exportação e retorno. | Diferencial | Contador reconcilia evento até proposta, contrato, regra e referência de liquidação. |
| COMP-08 | Permitir ecossistema, não cópia de ERP | Contratos de integração, ownership de dados, logs, idempotência, reprocessamento e reconciliação. | Diferencial | Falha de integração fica rastreável, reprocessável e sem duplicar o evento financeiro. |
| COMP-09 | Usar IA com confiança | Assistente com fonte, contexto, política de acesso, proposta de ação e revisão humana. | Evolução | Toda recomendação de alto impacto registra o que utilizou e quem aprovou. |
| COMP-10 | Vender pela prova operacional | Biblioteca de playbooks, dados de implantação, cases datados e catálogo de integrações/limites. | Go-to-market | Cliente-piloto conclui configuração por função com métrica de ativação definida. |

## Experiência visual, dados e IA verificável

| ID | Resultado | Requisito | Prioridade | Critério de aceitação |
| --- | --- | --- | --- | --- |
| UX-01 | Tornar prioridade visível | Cockpit por função com pergunta de decisão, período, recorte, atualização, exceção e próxima ação. | Fundação | Usuário-piloto localiza o caso prioritário e explica o recorte sem ajuda. |
| UX-02 | Escolher gráficos honestos | Catálogo pergunta → visual → tabela → drill-down para funil, carteira, estoque, lote e financeiro. | Fundação | Todo gráfico abre a lista de registros e apresenta unidade, período, fonte e estado. |
| UX-03 | Comparar sem planilha paralela | Tabelas com visão salva, filtro, ordenação, total, ação progressiva, estado pendente e adaptação a mobile. | Fundação | A lista prioritária suporta comparação e abertura de detalhe sem perda de filtro. |
| UX-04 | Sustentar domínio de loteadora | Planta/grade de lote com estados paralelos, legenda, filtro de fase/quadra e abertura de carteira. | Diferencial | Disponibilidade, restrição, alocação, registro e carteira são distinguíveis no mesmo lote. |
| UX-05 | Fazer número explicar-se | Detalhe financeiro com evento → origem → regra → direito → retorno → exportação. | Diferencial | Usuário autorizado rastreia uma diferença até a evidência e a versão aplicável. |
| UX-06 | Garantir acessibilidade real | Tokens de contraste, alternativa não cromática, tabela acessível, foco, teclado, alto contraste e redução de movimento. | Fundação | Estados críticos passam verificação de contraste e teste de reconhecimento sem depender só de cor. |
| UX-07 | Criar identidade operacional madura | Tokens de superfície, tipografia, espaçamento, borda, densidade, ícone e número tabular para o workspace. | Fundação | Nenhuma nova tela usa cor, tamanho, sombra ou raio arbitrários fora do sistema. |
| UX-08 | Manter a interface fluida | Transições rápidas, reversíveis e focadas; skeletons realistas; metas de desempenho percebido. | Fundação | Filtro, aba e detalhe mantêm contexto, foco e função com redução de movimento ativada. |
| UX-09 | Tornar IA auditável | Cartões/painéis de IA com fonte, escopo, limitação, feedback, revisão e confirmação antes de ação. | Diferencial | Todo insight de alto impacto registra fonte, usuário aprovador e resultado da ação. |
| UX-10 | Aprender com operação | Instrumentação de tarefa, compreensão de gráfico, taxa de aceite/edição de IA e uso de densidade. | Evolução | Cada piloto produz evidência comparável para promover, ajustar ou remover um padrão visual. |

## Plataforma Netlify + Supabase

| ID | Resultado | Requisito | Prioridade | Critério de aceitação |
| --- | --- | --- | --- | --- |
| PLAT-01 | Separar ambientes sem improviso | Repositório, configuração Netlify, previews protegidos, projeto Supabase por ambiente e inventário de segredos. | Fundação | Nenhum preview consulta produção e toda variável tem owner, escopo e ambiente declarado. |
| PLAT-02 | Versionar a infraestrutura de dados | Migrations para schema, grants, RLS, buckets, funções SQL, triggers e índices. | Fundação | Um ambiente limpo é reconstruído por migrations e testes sem intervenção manual não registrada. |
| PLAT-03 | Isolar organizações e carteiras | `organizations`, entidades legais/SPE, memberships, escopos, RLS e testes de permitir/negar. | Fundação | Um usuário de uma organização não lê nem altera linha/arquivo de outra, inclusive por URL ou API direta. |
| PLAT-04 | Proteger alçadas sensíveis | Auth, MFA por risco, recertificação de acesso e auditoria de permissão. | Fundação | Alterar acesso, dado bancário, regra de split, exportação e aprovação sensível exige o nível de autenticação e alçada definidos. |
| PLAT-05 | Controlar evidências privadas | Buckets privados, metadado de evidência, URL temporária, retenção, versão, hash e política de Storage. | Fundação | Documento sensível não é público, não é enumerável e toda leitura/alteração relevante tem trilha. |
| PLAT-06 | Fechar comandos de negócio em transação | RPC/serviço de domínio para reserva, proposta, contrato, entitlement, fechamento e compensação. | Fundação | Concorrência, retry e estado inválido não criam dupla reserva, direito duplicado ou alteração silenciosa. |
| PLAT-07 | Integrar sem duplicar efeito | `outbox_message`, `inbox_event`, idempotency key, correlação externa, tentativa, erro e reprocessamento. | Diferencial | Um callback repetido não reaplica liquidação; uma saída pode ser auditada até a intenção aprovada. |
| PLAT-08 | Processar jobs de forma operável | Fila durável, estado de job, lease, backoff, limite de tentativa e alertas. | Diferencial | Importação, conciliação e relatório lento sobrevivem a falha parcial sem depender do browser aberto. |
| PLAT-09 | Fechar com evidência | Eventos imutáveis, lote de exportação, snapshot, retorno de ERP e caso de divergência. | Diferencial | Controladoria rastreia diferença até origem e não edita o passado para “fechar” saldo. |
| PLAT-10 | Tornar recuperação verificável | Política de backup de banco e Storage, RPO/RTO, restore em ambiente isolado e runbook. | Fundação | Um teste de recuperação comprova banco, documentos críticos, acesso e reconciliação pós-restore. |
| PLAT-11 | Observar risco antes da perda | Logs estruturados, métricas de RLS, integração, job, latência, erro, custo e alerta. | Fundação | Erro crítico tem correlação, owner, alerta e procedimento de resposta definidos. |
| PLAT-12 | Entregar mudanças com segurança | Pipeline de preview → homologação → produção, checklist de schema, feature flag, rollback de app e migration compensatória. | Fundação | Nenhuma mudança de dados/policy crítica alcança produção sem teste, revisão e plano de reversão. |
| PLAT-13 | Escolher conexão e runtime sem erro de ciclo de vida | Matriz Browser/Data API, pooler de transação, conexão direta, Netlify Function, Supabase Edge e serviço especializado. | Fundação | Cada caminho de banco identifica ambiente, credencial, driver, pooler, limite e proibição de segredo no cliente. |
| PLAT-14 | Tornar autorização uma prova de release | Suíte pgTAP por tabela/view/RPC/Storage, incluindo organização, SPE, carteira, papel, AAL e tentativa negada. | Fundação | Pipeline falha se uma operação sensível não provar leitura/escrita permitida e negada com linha original preservada. |
| PLAT-15 | Controlar o ciclo de documento | Intenção de upload, TUS/URL temporal, hash, tipo, tamanho, versão, validação, retenção, legal hold e revogação. | Fundação | Queda de rede, token expirado, path repetido e acesso revogado não expõem nem promovem arquivo inválido a evidência. |
| PLAT-16 | Fazer eventos sobreviverem ao runtime | Envelope versionado, correlação, `idempotency_key`, inbox/outbox, Queue, lease, retry, dead-letter/arquivamento e reconciliação. | Diferencial | Callback repetido, fora de ordem e parceiro indisponível preservam estado e abrem exceção sem efeito econômico repetido. |
| PLAT-17 | Operar com sinal e resposta segura | Catálogo de alertas, correlation ID, dashboard por jornada, owners, runbooks e exercícios de incidente. | Fundação | Toda falha crítica aponta uma ação inicial segura, responsável, rota de escalonamento e evidência pós-incidente. |
| PLAT-18 | Sustentar recuperação e capacidade | Teste de restore banco/objeto, RPO/RTO aprovados, carga sintética, orçamento de pool/fila/Storage/Realtime e regra de degradação. | Fundação | O piloto demonstra recuperação explicável e crescimento dentro de metas ou abre plano de capacidade antes da venda. |

## Administração privilegiada e delegação governada

| ID | Resultado | Requisito | Prioridade | Critério de aceitação |
| --- | --- | --- | --- | --- |
| ADM-01 | Evitar um “Super Admin” sem fronteira | `platform_principals`, bootstrap controlado, elegibilidade, MFA, recertificação, suspensão e recuperação sob procedimento registrado. | Fundação bloqueadora | Não existe papel privilegiado criado por frontend, variável, metadata editável ou claim sem validação de servidor/banco. |
| ADM-02 | Isolar plataforma de locatária | `organizations`, memberships, escopo de SPE/unidade e RLS/Storage/RPC por organização. | Fundação bloqueadora | Super Admin sem caso de suporte não lê carteira, documento, proposta, saldo ou split de cliente; Admin de organização não cruza empresa. |
| ADM-03 | Delegar sem escalar privilégio | Papéis de organização/área, alçada, vigência, delegação limitada, offboarding e recertificação. | Fundação | Admin de área não se autoeleva, não atribui `platform_*` e não delega acima do teto herdado. |
| ADM-04 | Exigir sessão proporcional ao risco | MFA/AAL2, reautenticação, `amr`, duração, sessão/contexto e política por comando crítico. | Fundação | Sessão AAL1 não altera acesso, policy, integração, exportação, alçada ou comando financeiro sensível. |
| ADM-05 | Registrar a decisão administrativa | `AdminAuditEvent` append-only com ator, sujeito, alvo, antes/depois redigido, motivo, correlação, resultado e retenção. | Fundação | Grant, revogação, convite, negação, expiração, suporte e break-glass têm evento reconstruível e não editável pela aplicação. |
| ADM-06 | Dar suporte sem quebrar isolamento | `SupportCaseAccess` just-in-time, finalidade, selector mínimo, mascaramento, aprovação, expiração e encerramento. | Alta | Suporte vê apenas o recurso aprovado durante o caso; o acesso expira mesmo se o operador não encerrar a tela. |
| ADM-07 | Operar emergência sem privilégio residual | Break-glass por incidente, MFA, duração curta, alerta, dupla revisão posterior e postmortem. | Alta | O fluxo falha quando o caminho normal existe e não deixa membership/grant persistente depois do prazo. |
| ADM-08 | Separar administração do produto e infraestrutura | Matriz CRM ↔ Supabase ↔ Netlify para pessoas, segredos, projetos, deploys e auditorias. | Fundação | Owner/Developer de hospedagem não ganha papel CRM; papel CRM não recebe segredo, deploy ou acesso de infraestrutura por padrão. |
| ADM-09 | Fazer autorização regressiva | pgTAP, RPC, Function e E2E para permitir/negar por organização, SPE, papel, AAL, vigência e suporte. | Fundação bloqueadora | CI bloqueia migration/release se isolamento, expiração, revogação, SoD ou audit atômico não estiverem provados. |

## Auditoria, confiabilidade e engenharia segura

| ID | Resultado | Requisito | Prioridade | Critério de aceitação |
| --- | --- | --- | --- | --- |
| AUD-01 | Manter uma linha única de decisão | Índice de fontes de verdade, hierarquia documental, decisão versionada e ligação entre fonte → requisito → teste → release. | Fundação | Toda decisão ativa de alto impacto aponta documento canônico, owner, vigência, dependência e critério de revisão. |
| AUD-02 | Verificar autorização, não apenas declará-la | Matriz de escopo e suíte de testes de permitir/negar por organização, SPE, carteira, objeto, propriedade, arquivo e função. | Fundação | Testes impedem acesso/leitura/alteração fora do escopo por interface, URL, API, exportação e Storage. |
| AUD-03 | Tornar regras críticas reproduzíveis | Catálogo de comandos para reserva, proposta, contrato, direito, fechamento e compensação com precondição, versão, idempotência e audit event. | Fundação | Repetição, concorrência e estado inválido não produzem dupla reserva, direito ou efeito econômico. |
| AUD-04 | Operar por sinal de usuário | Catálogo inicial de SLI/SLO para leitura, comando, upload, callback, fila, conciliação e exportação; alerta acionável e correlação. | Fundação | Cada jornada crítica tem medida, limiar, owner, link de investigação e ação de resposta. |
| AUD-05 | Recuperar sem apagar a história | Runbooks para acesso, migration, documento, callback, fila, integração e restauração; exercícios e postmortem sem culpabilização. | Fundação | Um exercício demonstra mitigação, comunicação, recuperação e ação corretiva rastreável. |
| AUD-06 | Conhecer o que chegou à produção | Inventário/SBOM de dependências, alerta de vulnerabilidade, origem de build, branch protegida, segregação de segredo e promoção de artefato. | Fundação | Release crítico tem revisão independente, dependências inventariadas, segredo por ambiente e caminho de rollback. |
| AUD-07 | Integrar fornecedor por contrato explícito | Ficha por parceiro com ownership, payload, finalidade, dado mínimo, autenticação, idempotência, SLA, erro, replay, retenção e saída. | Diferencial | Nenhuma integração sensível entra em homologação sem contrato de dados e teste de callback/reconciliação. |
| AUD-08 | Governar IA ao longo do ciclo | Registro de caso de uso, dado permitido, modelo/versão, avaliação, erro, aprovação, feedback, limite e kill switch. | Diferencial | Nenhuma IA de risco é liberada sem avaliação documentada e reversão/pausa operável. |
| AUD-09 | Confiar nas métricas de gestão | Catálogo de métrica com pergunta, unidade, fórmula, recorte, fonte, atualização, lineage, limitação e owner. | Diferencial | Todo painel crítico abre definição e origem, e número não é usado como promessa sem contexto. |
| AUD-10 | Escalar com resposta medida | Orçamento de desempenho e custo, teste de carga por jornada, revisão de capacidade e recertificação periódica. | Evolução | Crescimento de organização, carteira e documento mantém as metas acordadas ou abre plano de capacidade. |

## Engenharia anti-erro, qualidade de código e aprendizado de falha

| ID | Resultado | Requisito | Prioridade | Critério de aceitação |
| --- | --- | --- | --- | --- |
| ENG-01 | Tornar erro de domínio impossível ou explícito | Catálogo de invariantes, estados discriminados, versões, tempo/valor explícitos e bloqueio de fallback ambíguo. | Fundação | Reserva, contrato, direito, evento e documento rejeitam transição inválida, concorrente ou sem regra vigente. |
| ENG-02 | Validar toda fronteira | Schemas versionados para UI, RPC, importação, webhook, arquivo e parceiro; erro público seguro. | Fundação | Payload inválido não persiste, não vaza internals e gera correlação investigável. |
| ENG-03 | Provar segurança além da interface | Suíte de permitir/negar para RLS, grants, endpoint, exportação e Storage em todo recurso sensível. | Fundação | A mesma tentativa é bloqueada por UI, URL, API e objeto fora do escopo autorizado. |
| ENG-04 | Evitar efeito repetido | Comandos/evenos com versão, idempotency key, inbox/outbox e testes de duplicata, atraso e ordem invertida. | Fundação | Clique duplo, retry, callback repetido ou reprocessamento não duplica reserva, saldo, direito, documento ou comunicação. |
| ENG-05 | Fazer mudança ser verificável | Tipagem/lint, análise estática, scan, dependency review, lockfile, review, preview, migration e rollback por PR. | Fundação | Alteração de código/dependência não é promovida sem checks, versão, risco, owner e plano de reversão. |
| ENG-06 | Cobrir a jornada sem testes frágeis | Pirâmide de teste com unitário, integração, policy, contrato, E2E isolado, carga e segurança. | Fundação | Fluxos críticos executam com dado controlado; falha de CI preserva trace/repro e não depende de serviço externo sem fixture. |
| ENG-07 | Diagnosticar sem expor dados | Contrato de erro, correlation ID, fingerprint/release, source map protegido, logs minimizados e audit trail separado. | Fundação | Usuário recebe ação segura; equipe autorizada encontra o caso sem token, segredo, PII ou stack trace expostos. |
| ENG-08 | Responder a falha sem improviso | Registro de risco/bug/incidente, severidade, runbook, owner, contenção, reconciliação e postmortem sem culpa. | Fundação | Incidente material gera linha do tempo e ação preventiva com prioridade, tracking e prova de eficácia. |
| ENG-09 | Ensaiar o inesperado | Simulações de network drop, timeout ambíguo, migration falha, policy deny, upload incompleto, fila atrasada, restore e parceiro indisponível. | Diferencial | Cada jornada crítica tem cenário de falha parcial e resultado seguro validado antes de escalar piloto. |
| ENG-10 | Aprender sem copiar solução frágil | Registro de fonte, versão, repro mínima, hipótese, teste local, revisão de segurança e decisão. | Fundação | Resposta comunitária, issue ou IA não entra em produção sem fonte primária/compatibilidade e teste de regressão. |
| ENG-11 | Delimitar o retry seguro | Contrato por camada para leitura, transação, outbox, inbox e efeito externo; estado `reconciling` quando a confirmação é ambígua. | Fundação bloqueadora | Timeout, `40001`, callback tardio e clique repetido não acionam nova reserva, instrução, assinatura, exportação ou settlement sem prova de idempotência. |
| ENG-12 | Evitar anomalia de concorrência | Estado esperado, versão/unique constraint, transação curta, regra de isolamento e teste com duas sessões para agregados críticos. | Fundação bloqueadora | Reserva, proposta, entitlement e fechamento sobrevivem a concorrência com resultado determinístico e sem sobrescrita silenciosa. |
| ENG-13 | Provar o isolamento no banco | RLS, grant, policy por operação, view/função revisada, índice de policy e pgTAP que valida resultado permitido, negado e integridade do alvo. | Fundação bloqueadora | CI falha se uma tabela/view/RPC exposta não provar allow/deny, escopo e preservação de linha/arquivo após tentativa negada. |
| ENG-14 | Instrumentar a jornada, não o dado sensível | Taxonomia de `correlation_id`, trace, release, ambiente, jornada, estado e referência externa; allowlist/mascaramento/retenção de atributos. | Fundação | Operação correlaciona UI, RPC, outbox, callback e erro sem enviar token, payload financeiro, documento ou PII para telemetria. |
| ENG-15 | Promover mudança compatível e recuperável | Expandir–migrar–contrair, flag com owner/expiração, dependency review, preview, canário e rollback/compensação distintos. | Fundação | App novo e antigo coexistem durante a migração; flag órfã, segredo cruzado, drift de schema ou rollback sem plano bloqueiam promoção. |
| ENG-16 | Fechar bug com reprodução segura | Pacote de bug com invariante, fixture sintética, esperado/observado, correlação, versão, owner, decisão, teste e alerta. | Fundação | Nenhum incidente/bug material é encerrado sem teste que falhava antes, prova atual e risco residual aceito pelo owner correto. |

## Ciclos permanentes: financeiro, acesso, demanda e UX crítica

| ID | Resultado | Requisito | Prioridade | Critério de aceitação |
| --- | --- | --- | --- | --- |
| FIN-01 | Separar direito de execução e liquidação | `EconomicEvent`, entitlement, instrução e settlement individual, com versão, correlação e fato compensatório. | Fundação | Alteração de regra, callback ou estorno não reescreve fato, direito, instrução ou settlement já registrado. |
| FIN-02 | Escolher parceiro por capacidade comprovada | `ProviderCapabilityProfile` com recebedores, rede, base, tarifa, timing, parcelas, reversão, evento, KYC e conciliação. | Fundação | Split nativo não é ativado sem contrato, sandbox e matriz de homologação por empresa/SPE/caso de uso. |
| FIN-03 | Tratar parcialidade como estado, não erro genérico | Exceção individual por entitlement/instrução/settlement, com bloqueio, dono, próxima ação e reconciliação. | Diferencial | Recebedor bloqueado, callback tardio e devolução não declaram distribuição total nem reduzem direito de terceiros silenciosamente. |
| FIN-04 | Evitar erro humano em comando financeiro | Cartão de revisão com base, tarifa, regra, destinatários, parceiro, alçada, efeito e próximo estado. | Fundação | Usuário autorizado revisa/corrige antes da instrução; o servidor valida novamente e o log conserva a decisão. |
| ORG-01 | Permitir trabalho por contexto, não por rótulo | Papel-base + atributos de organização, SPE, objeto, ação, vigência, finalidade, alçada e risco. | Fundação | Suíte permitir/negar prova escopo e mudança de papel/poder/offboarding sem ajuste manual disseminado. |
| ORG-02 | Separar deveres materiais | Política para preparar, aprovar, instruir, reprocessar, exportar e compensar ações sensíveis. | Fundação | A mesma pessoa não contorna alçada definida; exceção exige motivo, aprovador, expiração e auditoria. |
| DEM-01 | Transformar dor pública em hipótese testável | Registro de origem, independência, contexto, recorrência, métrica e risco de cópia. | Evolução | Sinal comunitário/concorrente só sobe após convergência e piloto com métrica de operação. |
| DEM-02 | Reduzir fragmentação sem ampliar raio de falha | Fonte de verdade por objeto, outbox, tempo de propagação, conflito e fallback manual. | Diferencial | CRM, site e portal exibem versão/estado; divergência abre caso rastreável, não edição ad hoc. |
| UX-11 | Explicar incerteza financeira de forma acessível | Estados textuais de rascunho, solicitado, parcial, exceção e confirmado; erro navegável, não cromático e acionável. | Fundação | Teste de fluxo crítico comprova revisão, correção, foco, leitor de tela e não confunde simulação com liquidação. |
| OPS-01 | Manter pesquisa contínua sem dispersão | Carta, fila, ciclo de evidência/contraponto/exceção/teste/decisão, owner e revisão periódica. | Fundação | Toda mudança estratégica de alto risco referencia fonte, impacto, decisão, backlog e critério de reabertura. |

## Revisão de priorização

O backlog deve ser revisado após cada piloto mensal. Uma prioridade só sobe quando houver problema repetido, impacto mensurável, viabilidade de integração e dono operacional. Itens `AUD-*` bloqueiam mudança sensível quando seu critério não estiver comprovado; uma hipótese pode ser rebaixada ou removida sem apagar o registro da decisão anterior.
