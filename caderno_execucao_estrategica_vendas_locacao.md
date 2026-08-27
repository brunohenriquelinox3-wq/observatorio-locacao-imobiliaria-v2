# Caderno de execução estratégica — Vendas Urbanas e Locação

**Versão:** `2026-08-27`  
**Status:** `documental_para_planejamento_futuro`  
**Escopo:** exclusivamente **Vendas Urbanas** e **Locação**. Este caderno transforma a estratégia em decisões rastreáveis e requisitos de preparação; não cria schema, tela, integração, automação, operação financeira, dado ou permissão operacional.

> **Recomendação central:** desenvolver futuramente por decisões verificáveis, e não por lista solta de telas. Cada pacote só avança quando seu contexto, evidência, policy, comportamento de exceção e prova de aceite estiverem completos.

## 1. Registro executivo de decisões

| ID | Decisão estratégica | Prioridade | Recomendação e razão | Owner de decisão | Dependências | Prova de aceite futura |
| --- | --- | --- | --- | --- | --- | --- |
| `EXE-01` | Contexto de organização e escopo de trabalho | `P0` | Tornar organização, coluna, módulo, papel, objeto e vigência parte explícita de todo acesso; elimina leitura por rota/ID e reduz retrabalho. | Patrocínio de negócio + arquitetura | Arquitetura canônica e matriz de grants. | Tentativas permitir/negar confirmam que a mesma rota não atravessa organização, coluna ou objeto. |
| `EXE-02` | Núcleo canônico de partes, papéis, ativos e dossiê | `P0` | Reutilizar `Party`, papel datado, ativo, evidência e vínculo em vez de duplicar cadastros por tela. | Produto + domínio | Glossário, política de qualidade e finalidade. | Uma parte pode exercer papéis distintos no tempo sem duplicação ou ampliação de acesso. |
| `EXE-03` | Jornada de Vendas Urbanas | `P1` | Materializar captação, qualificação, agenda, imóvel, proposta, contrato e pós-venda como estados distintos e auditáveis. | Gestão comercial | `EXE-01`, `EXE-02`, regras de catálogo e agenda. | Transições inválidas são negadas; transições válidas preservam motivo, owner, evidência e próximo passo. |
| `EXE-04` | Jornada de Locação e administração | `P1` | Separar angariação, disponibilidade, proposta, análise, contratação, vigência, renovação, rescisão e prestação de contas. | Gestão de locação | `EXE-01`, `EXE-02`, regras contratuais e financeiros. | Um contrato não é criado a partir de estado comercial incompleto e não se confunde com carteira. |
| `EXE-05` | Subledger e direitos econômicos | `P0` | Persistir obrigação, instrução, retorno, caixa, conciliação, direito e liquidação como fatos distintos. | Financeiro + controladoria | Eventos contratuais, calendário, alçadas e razão de exceção. | Nenhum saldo, comissão ou repasse muda por cálculo implícito ou clique sem confirmação/evidência. |
| `EXE-06` | Dossiê, privacidade e trilha | `P0` | Exigir finalidade, status de evidência, expiração, revisão e log antes de usar documento em uma decisão. | Privacidade + operação | Política de acesso a objeto/campo e armazenamento governado. | Um anexo não elegível é negado em fluxo crítico e a tentativa fica auditável. |
| `EXE-07` | Métricas, IA e recomendações | `P1` | Fazer cada métrica e sugestão explicável, datada e revisável; a IA recomenda, não muda estado sensível. | Produto + dados | Contrato de métrica, fontes, política de revisão humana. | Usuário vê fórmula, período, fonte, corte, status e motivo da recomendação. |
| `EXE-08` | Integrações e canais externos | `P1` | Adotar conectores desacoplados, com aprovação humana, idempotência, contrato, logs e contingência. | Produto + tecnologia | Avaliação de fornecedor, base legal, segurança e retorno. | Falha de fornecedor não duplica transação, não vaza dado e não altera estado interno sem reconciliação. |
| `EXE-09` | Adoção por papel e operação assistida | `P1` | Projetar treinamento, fila, ajuda contextual, exceção e suporte ao redor do trabalho real. | Operações + produto | Jornada aprovada, métricas e owners de fila. | Papéis de piloto concluem cenário essencial sem contorno inseguro e sabem encaminhar exceção. |
| `EXE-10` | Piloto, escala e revisão | `P0` | Escalar por evidência de valor, qualidade, segurança e recuperação, nunca apenas por volume de usuários. | Patrocínio + produto + risco | Hipótese, coorte, baseline, critérios de pausa/reversão. | Gate de escala reúne métricas, incidentes, decisões pendentes e aprovação registrada. |
| `EXE-11` | Workspace contextual e leitura governada | `P1` | Integrar na mesma experiência a leitura necessária de parte, ativo, jornada, dossiê, contrato, carteira e caso, preservando a fonte e a permissão de cada fato. | Produto + domínio + segurança | Read model por papel, policy de objeto/campo, origem/frescor e estados explícitos. | Papel de teste percorre a jornada sem alternar sistemas, mas não lê/escreve objeto ou campo fora do grant. |
| `EXE-12` | Catálogo de indicadores e comparabilidade de mercado | `P1` | Tratar cada índice externo como contexto versionado com proveniência, método, cobertura, período, atraso e limitação; evita falsa precisão e decisão por dado incompatível. | Produto + dados + operação | Contrato de métrica, catálogo de fontes, dados internos íntegros e política de leitura. | Cartão contextual separa fato da carteira e benchmark externo, declara `as_of`/cobertura e não automatiza preço, crédito, garantia ou prioridade. |
| `EXE-13` | Vigência normativa e evidência externa verificável | `P0` | Catalogar fonte competente, ato/documento, situação, versão, emissor, data de verificação, escopo e owner de revisão; evita que um anexo/status interno simule validade jurídica. | Produto + privacidade + risco | Dossiê classificado, registro de vigência, política de finalidade, revisão humana/profissional e contrato de capacidade. | Fonte/documento revogado, alterado, vencido, incompleto ou sem revisão não habilita automação, conector, checklist conclusivo ou alteração de estado material. |
| `EXE-14` | Adoção por cenário e prova de valor | `P1` | Medir adoção pela conclusão segura de uma jornada essencial por papel, incluindo a recuperação de exceção e o uso de ajuda contextual. | Operações + produto + suporte | Jornada definida, coorte, telemetria proporcional, material por papel, fila de suporte e critérios de pausa. | Usuário de teste conclui cenário útil sem planilha paralela, acesso excessivo ou comando material; métricas não se limitam a login/clique. |
| `EXE-15` | Portal mínimo e compartilhamento governado | `P1` | Expor recorte útil de contrato, carteira, documento, caso ou prestação de contas por grant mínimo, mantendo fonte, corte temporal e explicação. | Produto + segurança + Locação | Read model governado, policy de objeto/campo, sessão, expiração, storage privado e audit event. | Acesso válido mostra só o que foi liberado; URL, ID, link, cache ou sessão fora do grant falham sem enumerar dados. |

## 2. Priorização e regra de passagem

Uma prioridade `P0` é pré-condição de segurança ou integridade. Uma prioridade `P1` pode ser preparada em paralelo documental, mas só é ativada após os `P0` que lhe dão contexto. Nenhuma prioridade expressa valor isolado: ela é sempre lida junto de dependência, risco, owner e prova.

| Passagem | Pergunta obrigatória | Não avança se… |
| --- | --- | --- |
| Estratégia → especificação | A decisão possui escopo, alternativa, risco e critério de aceite? | O requisito mistura hipótese, dado e comportamento esperado. |
| Especificação → protótipo | A jornada tem estados, permissão, exceção e retorno? | A tela antecipa ação sem policy, contexto ou trilha. |
| Protótipo → piloto | Há cenário de uso, coorte, métrica, suporte e reversão? | O piloto trata usuário real como ambiente de teste livre. |
| Piloto → escala | Valor, qualidade, segurança e recuperação foram evidenciados? | Uma métrica isolada mascara incidente, retrabalho ou falha de isolamento. |

## 3. Requisitos atômicos — Vendas Urbanas

| ID | Requisito futuro | Decisão a que pertence | Evidência/estado mínimo | Critério de aceite futuro |
| --- | --- | --- | --- | --- |
| `VU-REQ-01` | Capturar lead com origem, consentimento, owner e próximo passo. | `EXE-02`, `EXE-03`, `EXE-06` | Origem declarada, finalidade e status de contato. | Lead sem finalidade/escopo não gera comunicação ou distribuição automática. |
| `VU-REQ-02` | Qualificar interesse sem confundir declaração com verificação. | `EXE-03`, `EXE-06` | Necessidade, faixa/condição declarada, janela, restrições e data de atualização. | A UI distingue “declarado”, “em revisão” e “comprovado”. |
| `VU-REQ-03` | Tratar imóvel e empreendimento com catálogo, disponibilidade e restrições. | `EXE-02`, `EXE-03` | Ativo, versão, disponibilidade, vínculo do responsável e restrição. | Uma oportunidade não bloqueia ativo por inferência ou estado visual apenas. |
| `VU-REQ-04` | Agendar visita com participantes, confirmação e resultado. | `EXE-03` | Objetivo, data/hora, fuso, owner, participantes autorizados e resultado. | Cancelamento/remarcação mantém histórico e não dispara comunicação sem revisão. |
| `VU-REQ-05` | Registrar proposta com condições, vigência, versões e alçada. | `EXE-03`, `EXE-05` | Partes, ativo, condição, prazo, versão e evidências requeridas. | Condição aceita não pode ser alterada silenciosamente após aprovação. |
| `VU-REQ-06` | Converter para venda/contrato por comando explícito e idempotente. | `EXE-03`, `EXE-05`, `EXE-06` | Elegibilidade, dossiê, aprovação, snapshot de termos e owner. | Dupla confirmação não cria dois contratos, direitos ou agendas. |
| `VU-REQ-07` | Apurar comissão e direito sem confundir com pagamento. | `EXE-05` | Regra versionada, base, gatilho, recebedor, dedução e elegibilidade. | Direito, instrução e liquidação permanecem entidades/fatos separados. |
| `VU-REQ-08` | Oferecer inteligência explicável de pipeline, origem e saúde. | `EXE-07` | Fórmula/score, corte, fonte, versão, explicação e revisão. | Recomendação não altera fase, proprietário ou comunicação automaticamente. |
| `VU-REQ-09` | Exibir contexto de preço, oferta e crédito externo somente em recortes aprovados. | `EXE-07`, `EXE-12` | Fonte, universo, praça, tipologia, período, `as_of`, atraso, cobertura e aviso de comparabilidade. | Benchmark indisponível/incomparável não gera preço, elegibilidade, score ou recomendação automática. |
| `VU-REQ-10` | Correlacionar proposta/contrato a evidências externas sem declarar situação jurídica por inferência. | `EXE-06`, `EXE-13` | Documento/ato, emissor, origem, versão, data de consulta, status de vigência conhecido, finalidade, acesso e revisão. | Arquivo, assinatura ou status externo sem origem/revisão não torna ativo, poder, transferência ou obrigação “confirmados”. |
| `VU-REQ-11` | Conduzir gestor e corretor por ativação contextual do primeiro cenário útil. | `EXE-09`, `EXE-14` | Papel, coorte, cenário, passo, pendência, ajuda, responsável, estado de suporte e resultado observável. | Adoção é comprovada por cenário concluído e exceção recuperada, não por login, clique ou preenchimento cego. |
| `VU-REQ-12` | Preparar publicação, atualização ou retirada de ativo em canal externo como comando versionado e reversível. | `EXE-03`, `EXE-06`, `EXE-08` | Ativo elegível, autorização vigente, conteúdo/mídia versionados, campos permitidos, canal, preview, alçada, correlação, estado externo e owner da exceção. | Seleção visual, URL, falha de fornecedor ou retorno parcial não publica, retira, altera disponibilidade ou expõe mídia/dados sem comando aprovado e reconciliação. |

## 4. Requisitos atômicos — Locação

| ID | Requisito futuro | Decisão a que pertence | Evidência/estado mínimo | Critério de aceite futuro |
| --- | --- | --- | --- | --- |
| `LC-REQ-01` | Representar proprietário, locatário, garantidor e representante por papel datado. | `EXE-01`, `EXE-02`, `EXE-06` | Papel, vigência, capacidade, finalidade e estado de verificação. | Expiração/revogação de papel nega nova ação sem apagar o histórico. |
| `LC-REQ-02` | Relacionar imóvel, administração e disponibilidade sem duplicar ficha. | `EXE-02`, `EXE-04` | Vínculo de administração, versão de ativo, disponibilidade e restrição. | Alteração de disponibilidade preserva razão, owner e transição anterior. |
| `LC-REQ-03` | Conduzir proposta e análise com checklist por finalidade. | `EXE-04`, `EXE-06` | Checklist, pendência, evidência, decisão, prazo e responsável. | Pendência bloqueante não é ocultada por preenchimento parcial. |
| `LC-REQ-04` | Gerar contrato como versão assinável, não como texto solto. | `EXE-04`, `EXE-05`, `EXE-06` | Partes, imóvel, vigência, valores/encargos, garantia, versão e aprovação. | Alteração posterior cria aditivo/versionamento e não sobrescreve contrato vigente. |
| `LC-REQ-05` | Controlar carteira e cobrança a partir de obrigações, não de status manual. | `EXE-05` | Competência, obrigação, vencimento, encargo, situação e evidência. | Ação de cobrança requer escopo, canal, template/consentimento e aprovação aplicável. |
| `LC-REQ-06` | Registrar despesa/manutenção com solicitação, orçamento, execução e aceite. | `EXE-04`, `EXE-05` | Serviço, imóvel, responsável, limites, anexos e status. | Serviço não gera obrigação, pagamento ou repasse automático. |
| `LC-REQ-07` | Apurar taxa, dedução, repasse e prestação de contas com reconciliação. | `EXE-05` | Regra, base, evento, dedução, elegibilidade, instrução e liquidação. | Prestação de contas mostra linhagem do fato sem revelar objetos sem permissão. |
| `LC-REQ-08` | Tratar renovação, reajuste, rescisão e inadimplência como esteiras próprias. | `EXE-04`, `EXE-05` | Janela, gatilho, proposta, aprovação, efeitos e data de corte. | Um alerta não executa reajuste, aviso, cobrança ou encerramento por conta própria. |
| `LC-REQ-09` | Expor portal de cliente/proprietário por grant mínimo e expiráveis. | `EXE-01`, `EXE-06`, `EXE-08` | Grant, escopo, validade, objeto/campo autorizado e registro de acesso. | URL, e-mail ou ID isolado não concede leitura de contrato, carteira ou documento. |
| `LC-REQ-10` | Contextualizar negociação e disponibilidade com índices externos de locação quando houver comparabilidade. | `EXE-07`, `EXE-12` | Métrica externa datada, praça, tipologia, método, cobertura, fonte e valor interno correspondente separado. | Anúncio, desconto externo ou contexto macro não muda aluguel, garantia, contrato, cobrança ou prioridade de parte. |
| `LC-REQ-11` | Gerir contrato, garantia e dossiê externo como fatos revisáveis e não como veredito jurídico automatizado. | `EXE-04`, `EXE-06`, `EXE-13` | Instrumento/versionamento, modalidade, vigência, aviso, evidência, origem, revisão, exceção, owner e alçada. | Garantia/documento vencido ou não revisado abre bloqueio explicado; não executa cobrança, rescisão, repasse ou comunicação. |
| `LC-REQ-12` | Onboardar proprietário e expor portal mínimo por jornada de administração. | `EXE-09`, `EXE-15` | Grant, objeto/campo, finalidade, vigência, owner, expectativa, dossiê elegível, `as_of`, origem e suporte. | Portal não replica backoffice; acesso fora do grant falha seguro e usuário identifica pendência/responsável sem ampliar escopo. |
| `LC-REQ-13` | Tratar vistoria ou sinistro como caso cronológico, versionado e contestável, separado de responsabilidade, cobrança, dedução ou pagamento. | `EXE-04`, `EXE-05`, `EXE-06` | Ativo/contrato no escopo, ambiente/item, evidência classificada, origem, cronologia, partes autorizadas, alegação, owner, alçada, prazo, contestação e decisão. | Foto, relato, mudança de status ou encerramento de caso não atribui culpa, cobertura, débito, dedução, comunicação ou efeito financeiro/contratual automaticamente. |

## 5. Adoção por papel

| Papel | Resultado de trabalho esperado | Instrumento estratégico de adoção | Sinal de risco | Evidência de prontidão |
| --- | --- | --- | --- | --- |
| Administrador da organização | Configura limites e acompanha exceções sem acessar o que não precisa. | Painel de postura, recertificação, histórico e ajuda de decisão. | Exceções recorrentes ou concessões sem prazo. | Consegue revisar/recusar grant e justificar decisão com trilha. |
| Gestor de Vendas Urbanas | Prioriza carteira, remove bloqueios e governa funil. | Fila de saúde, motivos de atraso, métricas com corte e drill-down autorizado. | Uso de planilhas paralelas para priorização. | Identifica próximo passo, owner e bloqueio sem consultar dados desnecessários. |
| Corretor/atendente | Qualifica, agenda, registra resultado e encaminha proposta. | Checklist progressivo, rascunho, lembrete de pendência e retorno seguro. | Campo obrigatório sem finalidade ou repetição de cadastro. | Conclui cenário essencial e sabe quando não pode avançar. |
| Gestor de Locação | Administra disponibilidade, contratos, renovações e exceções. | Workbench por contrato/imóvel, calendário de obrigações e fila de risco. | Mistura entre estado de contrato, cobrança e manutenção. | Distingue operação comercial, contratual e financeira em um caso. |
| Financeiro | Confere fatos, resolve divergência e prepara prestação de contas. | Subledger, fila de exceção, linhagem e segregação de deveres. | Ajuste manual sem razão/evidência. | Rastreia saldo da origem à conciliação sem tratar direito como pagamento. |
| Prestador/portal externo | Visualiza e responde apenas ao objeto autorizado. | Grant mínimo, escopo explícito, prazo, recibo e revogação. | Login concede carteira/contrato além do serviço. | Acesso direto fora do grant é negado e auditado. |

## 6. Matriz de integrações e contingências

Nenhum fornecedor é parte do núcleo canônico. A estratégia exige adaptador, contrato de dados, finalidade, aprovação, idempotência, correlação, timeout, fila de exceção, monitoramento e caminho de retorno/contingência antes de qualquer ativação.

| Capacidade | Uso estratégico futuro | Dados mínimos | Risco principal | Gate obrigatório | Contingência |
| --- | --- | --- | --- | --- | --- |
| Assinatura eletrônica | Coletar manifestação em documento versionado. | Documento/evidência autorizada, partes e contexto. | Versão errada ou assinatura atribuída indevidamente. | Validação de versão, identidade, evidência e retorno. | Manter estado pendente e permitir correção/novo envio governado. |
| Cobrança/boleto | Emitir instrução a partir de obrigação elegível. | Competência, valor, vencimento e identificador interno mínimo. | Duplicidade, instrução sem base ou retorno inconsistente. | Idempotência, política de emissão e reconciliação. | Bloquear nova instrução e encaminhar divergência. |
| Mensageria | Comunicar etapa aprovada ao destinatário autorizado. | Canal permitido, template, finalidade e objeto mínimo. | Comunicação indevida ou repetida. | Consentimento/base, preview, regras de frequência e log. | Não enviar; registrar falha e oferecer revisão humana. |
| Portais imobiliários | Publicar ativo elegível e sincronizar retorno controlado. | Campos aprovados de publicação e mídia autorizada. | Publicação de ativo indisponível ou dado excessivo. | Checklist de publicação, policy e reconciliação. | Retirar da fila; não remover/publicar externamente sem comando. |
| Garantia/crédito | Apoiar análise e proposta, sem concluir decisão automaticamente. | Finalidade, dado mínimo e consentimento/base aplicável. | Decisão opaca ou coleta excessiva. | Avaliação de fornecedor, explicação e revisão humana. | Classificar como pendência; não negar/aprovar automaticamente. |
| Atos, certidões e registro/notariado | Correlacionar pedido, evidência/ato, origem e status de revisão a um caso autorizado, sem substituir a fonte competente. | Finalidade, referência interna, emissor, origem, documento/ato mínimo, status, data de consulta e escopo. | Fonte revogada, acesso não autorizado, documento sem integridade ou status externo tomado por situação jurídica interna. | Registro de vigência, contrato de capacidade, avaliação de acesso, revisão humana/profissional e política de retenção. | Manter em revisão/pendência; não solicitar ato, transmitir dados, alterar propriedade, contrato ou carteira automaticamente. |
| Gestão de workspace/dados | Reunir contexto de trabalho por jornada, mantendo cada domínio como fonte própria. | Identificadores internos correlacionados, estado, origem e frescor. | Visão integrada expor dados/ações não autorizados ou mascarar defasagem. | Read model governado, policy de campo e indicação de fonte/atualização. | Mostrar estado seguro e encaminhar ao domínio fonte para correção autorizada. |
| Indicadores externos de mercado | Exibir benchmark contextual de preço, crédito, estoque ou negociação, quando a fonte/recorte for aprovado. | Fonte, universo, geografia, segmento, período, método, `as_of`, cobertura e aviso de limitação. | Índice incomparável, dado desatualizado, licença/termo incompatível ou preço externo tomado como fato interno. | Contrato de métrica, avaliação de acesso/licença, staging, revisão humana e policy de leitura. | Não exibir comparação; preservar fato interno e registrar a fonte como indisponível/pendente. |

## 7. Ledger de evidências pendentes — CRM de referência

O benchmark foi transformado em requisitos somente quando houve evidência demonstrada ou quando a lacuna indicou uma prova necessária. Os itens abaixo permanecem como evidência pendente, não como defeito presumido do CRM de referência nem como funcionalidade obrigatória por cópia.

| ID | Lacuna de evidência | Impacto na estratégia | Tratamento futuro seguro |
| --- | --- | --- | --- |
| `EVD-01` | Paginação e conteúdo rolável não integralmente alcançados em todas as superfícies. | Não concluir que um controle não existe/é simples. | Usar ambiente de demonstração; registrar controle, alcance e motivo do bloqueio. |
| `EVD-02` | Detalhes de registros e modais de confirmação não foram abertos quando poderiam gerar efeito material. | Não inferir comportamento de edição, exclusão, comunicação ou contratos. | Exercitar com dados sintéticos controlados e restauração comprovada. |
| `EVD-03` | Perfis/permissões e rotas profundas apresentaram bloqueios de sessão ou acesso. | Não copiar ou desqualificar uma política de acesso sem prova. | Avaliar em papel/ambiente apropriado com matriz permitir/negar. |
| `EVD-04` | Fluxos de importação, exportação, cobrança, repasse, publicação e integração permaneceram bloqueados por segurança. | Estratégia exige gates próprios, não comportamento presumido. | Testar somente em sandbox com fornecedor/conta de teste e reversibilidade. |
| `EVD-05` | Alguns estados com dados não foram explorados além da leitura estrutural autorizada. | Métricas/UX futuras devem ter prova própria. | Validar casos anonimizados ou sintéticos sob mínimo privilégio. |
| `EVD-06` | A auditoria prática do CRM de referência não demonstrou a proveniência, cobertura, atualização ou licença de benchmarks externos eventualmente exibidos. | Não copiar painel ou comparação sem contrato de métrica próprio. | Validar cada fonte em catálogo independente, com método, `as_of`, comparabilidade e política de acesso antes de ativar. |
| `EVD-07` | A pesquisa regulatória identificou fontes oficiais revogadas, alteradas, parciais ou dependentes de contexto local/profissional. | Não transformar pesquisa normativa em implementação automática, promessa de conformidade ou decisão jurídica. | Manter registro de vigência, usar versão consolidada e submeter o ponto aplicável a revisão adequada antes de qualquer ativação. |

## 8. Critério de completude da estratégia de execução

Este caderno estará pronto para orientar uma futura especificação quando toda decisão `P0` tiver owner, escopo, alternativa, risco, dependência, métrica de sucesso, prova de aceite e política de exceção. A implementação, contudo, permanece proibida neste ciclo: sua entrada exigirá autorização posterior específica, revisão de contexto e um plano técnico separado.

## Referências internas

[1] [Matriz mestre estratégica — Vendas Urbanas e Locação](matriz_mestre_estrategica_vendas_locacao.md)

[2] [Fundação compartilhada — Vendas Urbanas e Locação](caderno_fundacao_compartilhada_vendas_locacao.md)

[3] [Jornadas operacionais — Vendas Urbanas e Locação](caderno_jornadas_operacionais_vendas_locacao.md)

[4] [Financeiro — Vendas Urbanas e Locação](caderno_financeiro_vendas_urbanas_locacao.md)

[5] [Inteligência, métricas e canais](caderno_inteligencia_metricas_canais_vendas_locacao.md)

[6] [Governança e migração de dados](caderno_governanca_migracao_dados_vendas_locacao.md)

[7] [Relatório independente de verificação](relatorio_verificacao_atualizacao_estrategica_vendas_locacao.md)

[8] [Registro de pesquisa externa de referências de mercado](registro_pesquisa_referencias_mercado_vendas_locacao.md)

[9] [Matriz de confronto — referências externas × estratégia](matriz_confronto_referencias_estrategia_vendas_locacao.md)

[10] [Caderno de indicadores de mercado — Vendas Urbanas e Locação](caderno_indicadores_mercado_vendas_locacao.md)

[11] [Registro de pesquisa externa de referências de mercado](registro_pesquisa_referencias_mercado_vendas_locacao.md)

[12] [Registro de pesquisa regulatória — Vendas Urbanas e Locação](registro_pesquisa_regulatoria_vendas_locacao.md)

[13] [Registro de posicionamento e adoção](registro_pesquisa_posicionamento_adocao_vendas_locacao.md)

[14] [Registro complementar de adoção e operação](registro_pesquisa_adocao_operacao_vendas_locacao.md)

[15] [Registro de operação, portal e implantação](registro_pesquisa_operacao_portais_vendas_locacao.md)
