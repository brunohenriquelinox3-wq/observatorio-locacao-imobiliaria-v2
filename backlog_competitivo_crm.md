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

## Revisão de priorização

O backlog deve ser revisado após cada piloto mensal. Uma prioridade só sobe quando houver problema repetido, impacto mensurável, viabilidade de integração e dono operacional. Itens `AUD-*` bloqueiam mudança sensível quando seu critério não estiver comprovado; uma hipótese pode ser rebaixada ou removida sem apagar o registro da decisão anterior.
