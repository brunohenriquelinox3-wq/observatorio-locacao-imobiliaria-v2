# Consolidação de evidências e requisitos — Locação

**Status:** `base_estratégica_para_atualização_autorizada_2026-08-27`  
**Escopo:** somente a coluna **Locação**. Este documento organiza evidências observadas em requisitos verificáveis e lacunas explícitas. Não reproduz dados individuais, não presume comportamento não demonstrado e não modifica SUPER ADM, ADM ou LOTEADORA.

> **Princípio de domínio:** administração do imóvel, locação, cobrança, caixa, dedução, direito econômico e repasse são fatos correlacionados, mas não intercambiáveis. A visibilidade de uma tela não confirma que uma operação foi concluída.

## 1. Evidência consolidada

| Eixo | Evidência observada | Leitura estratégica | Limite de interpretação |
| --- | --- | --- | --- |
| Padrões de nova locação | Foram observados defaults de pessoa, garantia, finalidade, prazo, reajuste, multa, juros, boleto, tributos, taxa, repasse e testemunhas, com aviso de precedência para novos cadastros. | A coluna precisa de políticas versionadas por organização e contrato, com data de vigência, owner e regra de precedência; default nunca altera retroativamente um contrato. | Não foram demonstrados salvamento, permissões, cálculo, vigência ou propagação. |
| Esteira de locação | A primeira etapa distingue inquilino principal, solidários e pessoa física/jurídica; a jornada apresenta passos subsequentes. | A contratação deve separar as partes e permitir composição de locatários/solidários sem duplicar a identidade canônica. | Busca, adição de partes, validação, avanço, rascunho e cancelamento não foram demonstrados. |
| Aluguéis/negócios | Foram observados estados Ativo, Aprovado, Em Análise, Vencido, Rescisão e Encerrado, além de filtros de imóvel, parte, valor, boleto e repasse. | Contrato, ciclo de administração, situação de cobrança e situação de repasse devem ser dimensões distintas, com transições comandadas e auditáveis. | Não houve transição de contrato, operação sobre linha ou comportamento com carteira preenchida. |
| Financeiro e carteira | Há lançamentos, lançamentos parcelados, estatísticas, cobranças de contrato e repasses ao proprietário; filtros cobrem período, tipo, status, categoria, vencimento e parte. | O produto deve operar um subledger: evento, obrigação, cobrança, retorno, aplicação de caixa, dedução, direito e settlement são objetos separados. | Cálculo, conciliação, baixa, cobrança, emissão, repasse, estorno e auditoria não foram executados. |
| Serviços e manutenção | Foram observados lista, métricas, filtros, estados de solicitação, formulário com imóvel, contrato, pagador, prestador, orçamento, agenda e observações. | Manutenção requer caso próprio com serviço, ativo, contrato, pagador, orçamento, aprovação, agenda, execução, evidências e decisão de custo. | Atribuição, orçamento, anexos, aprovação, pagamento, comunicação e transições não foram demonstrados. |
| Prestadores | O cadastro expõe natureza da pessoa, documento, contato, endereço, especialidades, PIX/conta, observação privada e status. | Prestador é uma `Party`/organização com credenciais operacionais e dados de pagamento separados, mínimos e privados. | Validação de documento, dados bancários, disponibilidade, preço, vínculo, inativação e pagamento permanecem prova futura. |
| Vistorias e sinistros | Vistorias não carregaram controles específicos no contexto disponível; Sinistros expôs lista, filtros, status, ocupação, usuário/responsável e ações, mas sem casos demonstrados. | Vistoria e sinistro devem ter objetos próprios, linha do tempo, evidências, responsáveis, prazos e relação contratual sem inferir culpa, cobertura ou pagamento. | Criação, laudo, mídia, comparação, seguradora, acordo, indenização e permissões não foram demonstrados. |
| Área de cliente e portais | A tela pública de cliente permitiu somente observar a entrada, sem autenticação; Portais e material gráfico também foram observados sem integração/publicação. | Portais são superfícies mínimas por finalidade: cada pessoa vê somente contratos, documentos, cobrança ou solicitações explicitamente autorizados. | Login, consentimento, revogação, dados apresentados, pagamento, documento e suporte não foram demonstrados. |
| Erros, sessão e acesso | Houve rota 404 de garantia, telas em branco, falhas transitórias, expiração de sessão e bloqueio de permissão em configuração. | A solução própria precisa de tratamento seguro de erro, acesso negado, retentativa, correlação e recuperação sem duplicar efeitos ou vazar dados. | Causas internas, logs e políticas do produto de referência não ficaram acessíveis. |

## 2. Estratégia operacional de Locação

A locação deve ser conduzida como uma cadeia de obrigações e evidências ao longo do tempo. O imóvel entra com relação de administração/titularidade declarada e revisável. O candidato entra por intenção e critérios mínimos. A locação só avança quando as partes, a garantia, as condições e o dossiê tenham atingido o estado requerido pela política aplicável. Depois da assinatura, a carteira, a manutenção, as comunicações, a renovação e a prestação de contas continuam ligadas ao contrato sem reescrever fatos passados.

| Etapa | Objeto dominante | Informação mínima | Gate de passagem | Resultado verificável |
| --- | --- | --- | --- | --- |
| Administração do imóvel | `Asset` + contrato de administração + proprietário | imóvel, relação declarada, escopo de administração, vigência e responsável. | Titularidade/administração em estado compatível e pendências visíveis. | Ativo administrável, mas não automaticamente publicável ou locável. |
| Captação e qualificação | Lead + `SearchProfile` + `Party` | finalidade, território, faixa de custo total, prazo, contato permitido e composição inicial. | Critérios suficientes para atendimento, sem coleta documental antecipada. | Fila priorizada por regra explicável e owner. |
| Análise e garantia | Candidatura + garantia + dossiê | partes, modalidade, documentos solicitados, consentimentos/base legal e pendências. | Política da operação satisfeita ou exceção aprovada e datada. | Estado de análise explicável; garantia não equivale a aprovação automática. |
| Proposta e contratação | Proposta + contrato de locação | imóvel, partes, valor, vencimento, duração, reajuste, encargos, garantia e versão. | Elegibilidade do ativo, alçada e dossiê mínimo confirmados. | Contrato versionado, correlacionado a administração e evidências. |
| Carteira e cobrança | Evento + receivable + instrução | competência, obrigação, vencimento, responsável, canal e estado. | Instrução emitida por integração habilitada e idempotente. | Retorno e aplicação de caixa registrados sem confundir boleto com pagamento. |
| Repasse e prestação de contas | Dedução + entitlement + instrução + settlement | fatos elegíveis, taxa/dedução, política vigente, destinatário e alçada. | Recebimento conciliado e regras de bloqueio revisadas. | Repasse projetado/autorizado/liquidado em estados separados e auditáveis. |
| Manutenção, vistoria e sinistro | Caso operacional + evidência | imóvel, contrato, origem, prioridade, responsável, custo/orçamento e prazo. | Evidência mínima e responsabilidade definida; decisões financeiras aprovadas separadamente. | Caso com histórico, anexos privados, status e tratamento de exceção. |
| Renovação, rescisão e entrega | Marcos contratuais + decisão | aviso, condições, vistoria, pendências, cálculos e aprovações. | Política contratual aplicada à versão correta; exceções registradas. | Estado encerrado/renovado/rescindido com fatos preservados. |

## 3. Requisitos de produto priorizados

| ID | Requisito estratégico | Evidência de origem | Critério de aceite |
| --- | --- | --- | --- |
| `LC-REQ-01` | Separar contrato de administração do proprietário e contrato de locação do ocupante. | A arquitetura canônica e a estratégia prévia distinguem as vigências; a esteira e a carteira de aluguéis confirmam a relevância de ciclo contratual próprio. | Cada contrato possui partes, prazo, estado, versão, obrigações e evidências próprias, sem sincronização implícita de duração. |
| `LC-REQ-02` | Tratar locatário, solidário, fiador, proprietário, representante, prestador e pagador como papéis datados de `Party`. | A esteira distingue inquilino principal/solidários; formulários expõem pessoa física/jurídica e partes relacionadas. | Uma identidade pode assumir papéis com vigência e escopo distintos sem duplicar dossiê, permissão ou dados de pagamento. |
| `LC-REQ-03` | Versionar padrões de contrato, garantia, cobrança, reajuste, multa, juros, tributo, taxa e repasse. | A tela de padrões concentra defaults para novos cadastros e descreve precedência. | Toda política possui versão, vigência, owner, alçada, regra de precedência, simulação/preview e proibição de alteração retroativa. |
| `LC-REQ-04` | Implementar esteira de contratação por etapas, com rascunho seguro e validações proporcionais ao risco. | A jornada apresenta múltiplos passos e a primeira etapa de partes. | Cada etapa declara requisito, dados mínimos, estado de rascunho, abandono, retomada, bloqueio e audit event; avançar sem requisito gera feedback específico. |
| `LC-REQ-05` | Modelar garantia locatícia como caso próprio e não como campo definitivo de aprovação. | Foram observadas modalidades sugeridas; a rota de garantia não foi demonstrada. | Modalidade, evidências, vigência, fornecedor/fiador/caução, estado de análise e exceções possuem ciclo próprio, sem inferir cobertura ou elegibilidade. |
| `LC-REQ-06` | Usar subledger de carteira em vez de saldo editável. | Financeiro expõe lançamentos, cobranças, parcelamento e repasses, mas sem prova de liquidação. | Evento, receivable, instrução, retorno, cash application, dedução, entitlement e settlement são imutáveis/correlacionados e reconciliáveis. |
| `LC-REQ-07` | Programar cobrança e comunicação por outbox idempotente, com preview e consentimento/finalidade. | Há padrões de aviso e emissão; a interface de referência não demonstrou envio. | Nenhum aviso, boleto ou cobrança é enviado sem política, destinatário, canal, prévia, log, limite de repetição e possibilidade de suspensão. |
| `LC-REQ-08` | Separar taxa de administração, dedução, direito do proprietário, instrução e liquidação de repasse. | Padrões e abas financeiras expõem taxa/repasse e estados de situação. | O sistema calcula projeção a partir de eventos, mas exige elegibilidade, alçada e retorno externo antes de marcar repasse como liquidado. |
| `LC-REQ-09` | Criar caso de manutenção com pagador, orçamento, autorização e agenda independentes. | Novo Serviço relaciona prestador, imóvel, contrato, pagador, valor e data/hora; estados abrangem pedido até conclusão/cancelamento. | Cada mudança de status registra responsável, motivo, evidência, custo/limite, aprovação e eventual comunicação; serviço não gera pagamento por si só. |
| `LC-REQ-10` | Manter cadastro de prestadores com privacidade, qualificação e dados de pagamento protegidos. | Formulário e lista expõem natureza, documento, especialidade, PIX/conta e status. | Documento e pagamento ficam mascarados/restritos por finalidade; credencial, disponibilidade, preço e vínculo são datados e auditáveis. |
| `LC-REQ-11` | Estruturar vistoria e sinistro como casos evidenciais, não como anexo genérico. | Vistorias ficaram inconclusivas; Sinistros expõem status, ocupação, responsáveis e ações. | Caso registra objeto, evento, ambiente/item, evidência, prazo, responsável, decisão, vínculo contratual e acesso mínimo, sem concluir responsabilidade/indenização automaticamente. |
| `LC-REQ-12` | Disponibilizar portais de cliente e proprietário com grants de finalidade, escopo e vigência. | A entrada pública do portal foi observada; não houve autenticação. | Autenticação não define conteúdo: grant ativo define contratos, documentos, cobranças e solicitações visíveis, com revogação, logs e estados sem enumeração. |
| `LC-REQ-13` | Construir filtros, estatísticas e listas financeiras com contratos de métrica e policy no dado. | Filtros e painéis estatísticos foram observados em estado vazio, incluindo período, tipo, status e categoria. | Cada consulta apresenta escopo, data de corte, fonte, fórmula, estado, vazio/erro, paginação e autorização por objeto/campo. |
| `LC-REQ-14` | Projetar caminhos seguros para indisponibilidade, sessão e acesso negado. | Foram observados 404, tela em branco, falha transitória, expiração de sessão e bloqueio de permissão. | Erros têm mensagem segura, correlação, ação de retentativa idempotente, telemetria e orientação de recuperação sem divulgar dados ou alterar estado. |

## 4. Princípios de segurança, finanças e experiência

Uma tela de cobrança não confirma recebimento e uma tela de repasse não confirma liquidação. O CRM deve ajudar a explorar os dados de forma mais intuitiva por meio de filtros rastreáveis, carteira por exceção e linha do tempo. Deve ajudar a entender melhor as tendências com métricas que diferenciam projeção, pendência, realizado e conciliado. Para salvar ou compartilhar facilmente documentos, boletos, extratos ou vistorias, deve usar arquivos privados, preview, finalidade, permissão mínima, expiração e audit event.

| Área | Regra inegociável | Prova de aceite |
| --- | --- | --- |
| Dados pessoais e documentos | Coleta progressiva, classificação, acesso mínimo, retenção e logs. | Testes permitir/negar por papel, contrato, documento, campo e download. |
| Reajuste e encargos | Fórmula, índice, vigência, base, exceção e arredondamento devem ser explícitos. | Casos de teste para contrato novo, legado, prorrogação, intervalo inválido e exceção aprovada. |
| Cobrança e pagamento | Instrução, retorno e aplicação de caixa são estados separados. | Callback idempotente, divergência, baixa parcial, duplicidade, estorno e conciliação humana. |
| Repasse | Elegibilidade e direito não substituem instrução externa/settlement. | Bloqueio, dedução, alçada, compensação, retorno e prestação de contas auditáveis. |
| Manutenção e sinistro | Caso técnico não cria obrigação financeira automática. | Orçamento, autorização, evidência, responsável, prazo, recusa, cancelamento e disputa testados. |
| Portal | O portal só mostra o necessário à finalidade autorizada. | Grant expirado/revogado, múltiplos contextos, ausência de escopo e tentativa de URL direta falham sem enumeração. |

## 5. Lacunas que continuam como requisito de prova

| Lacuna | Impacto | Decisão estratégica |
| --- | --- | --- |
| Fluxos completos de locação, garantia, contrato e cancelamento | Impede inferir regras de passagem ou exceções do produto de referência. | Projetar política e estados próprios, testados de ponta a ponta em ambiente controlado. |
| Fórmulas de reajuste, multa, juros, tarifa, taxa e repasse | Alto risco financeiro, jurídico e de comunicação incorreta. | Versionar fórmulas, bases e calendários; exigir simulação, revisão e testes de arredondamento. |
| Cobrança, retorno e liquidação | Confundir instrução com pagamento distorce carteira e repasse. | Exigir correlação de provedor, idempotência, conciliação e tratamento de divergência. |
| Portais, permissões e escopo de dados | Pode gerar exposição entre locatário, proprietário, prestador e equipe. | Definir grants, RLS/policy, acesso por objeto/campo, expiração/revogação e testes permitir/negar. |
| Vistoria, sinistro e evidência de mídia | Pode produzir disputa sem contexto, prova ou privacidade adequada. | Estabelecer modelo de caso, evidência, cadeia de custódia, responsáveis, prazos e não repúdio operacional. |
| Instabilidade de rota e sessão | Pode causar duplicidade, erro operacional ou perda de rascunho. | Prever observabilidade, reentrada segura, outbox, idempotência, tolerância a falhas e suporte com correlação. |

## Referências internas

[1] [Registro de auditoria por controle](registro_auditoria_por_controle_v2.md)

[2] [Matriz de cobertura](matriz_cobertura_segunda_varredura_hincrivel.md)

[3] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)

[4] [Estratégia CRM consolidada](estrategia_crm_imobiliario_consolidada.md)

[5] [Escopo da atualização estratégica](escopo_atualizacao_estrategica_vendas_locacao_hincrivel.md)
