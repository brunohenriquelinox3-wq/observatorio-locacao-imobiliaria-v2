# Plano estratégico de desenvolvimento por ondas — Vendas Urbanas e Locação

**Status:** `planejamento_documental_sem_implementação_2026-08-27`  
**Escopo:** somente **Vendas Urbanas** e **Locação**. Este plano não cria schema, telas, permissões, automações, integrações ou dados; ele determina a ordem de decisões, provas e gates que uma futura implementação deverá respeitar. [1]

## Recomendação executiva

> **Recomendação:** iniciar qualquer implementação futura pela fundação de identidade, organização, policy e auditoria; só então construir o núcleo compartilhado de pessoas, ativos e dossiês; depois, Vendas Urbanas e Locação; por último, financeiro, integrações e inteligência. Essa ordem reduz retrabalho, evita que listas e formulários concedam acesso indevido e protege fatos financeiros de simplificações perigosas.

| Alternativa | Por que não é o melhor caminho agora | Risco principal |
| --- | --- | --- |
| Começar por formulários e telas comerciais | Produz rapidez visual, mas congela cadastros antes de definir identidade, papéis, relações e policy. | Redigitação, relações ambíguas, refação estrutural e exposição de dados. |
| Começar pelo financeiro isolado | O financeiro depende de contrato, evento, obrigação, parte, ativo e política versionada. | Saldo editável, cobrança duplicada e repasse sem fato elegível. |
| Começar pela IA/painel executivo | Métricas e score sem fato-fonte confiável amplificam erro e opacidade. | Priorização enganosa, viés e falta de explicação. |

## Mapa de ondas e gates

| Onda | Propósito | Resultado estratégico esperado | Gate obrigatório antes de avançar |
| --- | --- | --- | --- |
| 0. Fundação governada | Definir organização, escopo, papéis, grants, auditoria e política no dado. | Acesso por menor privilégio e trilha de decisão verificável. | Matriz permitir/negar aprovada, incidentes e revogação modelados, ownership definido. |
| 1. Núcleo de relacionamento e ativo | Consolidar `Party`, papéis temporais, imóvel, dossiê, evidência, tarefa e linha do tempo. | Cadastros reutilizáveis sem duplicação ou falsa equivalência entre papéis. | Regras de identidade, finalidade, retenção, evidência e relações datadas aprovadas. |
| 2. Vendas Urbanas | Priorizar captação, lead, perfil de busca, ativo, visita, proposta e contrato. | Jornada comercial explicável, com continuidade entre equipes e proteção de partes/ativos. | Estados, alçadas, exceções, publicação e critérios de aceite aprovados. |
| 3. Locação | Estruturar administração, candidatura, garantia, contrato, padrão, renovação e rescisão. | Ciclo locatício completo sem confundir administração, contrato e cobrança. | Políticas versionadas, dossiê, garantia, partes e regras contratuais aprovados. |
| 4. Carteira e direitos econômicos | Planejar subledger, cobrança, retorno, conciliação, dedução, direito e repasse. | Visão financeira reconciliável, sem tratar boleto ou card como liquidação. | Modelo de eventos, parceiros habilitados, alçadas e cenários de exceção aprovados. |
| 5. Serviços, portais e canais | Planejar manutenção, prestadores, vistoria, sinistro, portais, documentos e divulgação. | Operação externa por casos e grants mínimos de leitura. | Políticas de evidência, comunicação, storage, autorização e privacidade aprovadas. |
| 6. Inteligência, métricas e evolução | Planejar dashboards, regras explicáveis, IA governada, integrações e melhoria contínua. | Decisão baseada em fatos e métricas rastreáveis, não em score opaco. | Contratos de métrica, limites de automação, observabilidade e rollback aprovados. |

## Onda 0 — Fundação governada

A fundação é o pré-requisito de todo o restante. Ela preserva a autoridade global já aprovada, em que SUPER ADM permanece acima do ADM e nenhum módulo de Vendas Urbanas ou Locação amplia poder por navegação, URL, e-mail, filtro ou identificador. [2]

| Bloco | Decisão a documentar | Prova de prontidão para futura implementação |
| --- | --- | --- |
| Tenant e escopo | Organização, módulos contratados, unidade, equipe e objeto são contextos distintos. | Um pedido de acesso informa organização, módulo, papel, finalidade, vigência e objeto. |
| Papéis e grants | Papel não é permissão ilimitada; grants concedem escopo temporário e revogável. | Matriz permite/negar cobre UI, rota, serviço, banco, storage, cache e exportação. |
| Auditoria | Ações materiais geram evento com autor, contexto, antes/depois, motivo e correlação. | Há padrão de evento e retenção, sem registrar dados além do necessário. |
| Sessão e recuperação | Login, MFA, step-up, expiração, revogação e recuperação usam estados explícitos. | Fluxos de sessão falham sem enumerar identidade e sem reabrir acesso por URL direta. |

## Onda 1 — Núcleo de relacionamento, ativo e evidência

O núcleo compartilhado evita a multiplicação de cadastros. A mesma parte pode ser cliente, comprador, proprietário, locatário, fiador, solidário, representante, corretor, captador ou prestador em datas e escopos diferentes. O ativo mantém separadas titularidade, administração, disponibilidade, autorização de anúncio, chaves, condições e situação contratual. [1] [3] [4]

| Decisão | Regra estratégica | Critério de aceite futuro |
| --- | --- | --- |
| Identidade | `Party` é canônica; papel é relação datada e contextual. | Uma alteração de papel não duplica identidade ou herda documentos/acesso sem regra explícita. |
| Dossiê | Documento é evidência privada com origem, finalidade, versão, validade e revisão. | Upload, visualização, compartilhamento, expiração e revogação são auditáveis; anexar não aprova. |
| Ativo | O imóvel tem atributos e relações próprias por vigência. | Publicar, reservar, negociar ou locar exige estados e autorizações distintos. |
| Histórico | Linha do tempo agrega referências sem transformar eventos em campos regraváveis. | O sistema mostra fonte, data, autor e correlação de cada mudança relevante. |

## Onda 2 — Estratégia de Vendas Urbanas

| Módulo | Decisão de desenvolvimento futura | Gate de produto |
| --- | --- | --- |
| Captação e lead | Separar origem, intenção, prioridade, temperatura, estágio, SLA e responsável. | Cada dimensão tem fonte, owner, histórico e regra de mudança próprios. |
| Cliente e comprador | Coletar progressivamente perfil, grupo, documentação e viabilização declarada. | Consulta externa/dado sensível só aparece com finalidade, policy e registro. |
| Proprietário e imóvel | Relacionar parte, captação, ativo, autorização comercial, mídia, chave e comissão. | Nenhum vínculo isolado torna o imóvel publicável ou negociável por padrão. |
| Visita e agenda | Tratar visita como caso com participantes, agenda, conflito, resultado e próxima ação. | Remarcar/cancelar não comunica sem preview, opt-in/política e destinatário autorizado. |
| Proposta e contrato | Versionar oferta, condições, aprovação, assinatura e dossiê. | Contrato aceito preserva versão e não confirma recebimento, comissão ou repasse. |

## Onda 3 — Estratégia de Locação

| Módulo | Decisão de desenvolvimento futura | Gate de produto |
| --- | --- | --- |
| Administração | Separar contrato de administração do proprietário e contrato de locação. | Prazo, parte, obrigação e estado de um não reescrevem o outro. |
| Candidatura e garantia | Organizar locatário, solidários, garantia, documentos e exceções por etapa. | Modalidade de garantia não equivale a aprovação; política e evidência são explicitadas. |
| Padrões contratuais | Versionar prazo, índice, reajuste, vencimento, multa, juros, tributos, tarifa, taxa e repasse. | Defaults têm vigência/owner/precedência e não alteram retroativamente contrato existente. |
| Ciclo de contrato | Tratar assinatura, aditivo, renovação, rescisão, entrega e pendências como marcos próprios. | Cada transição possui pré-condição, alçada, motivo, evidência e estado de exceção. |
| Portal | Conceder visão ao cliente/proprietário por grant de finalidade e objeto. | Autenticação sem grant não revela contrato, cobrança, documento, serviço ou ocorrência. |

## Onda 4 — Carteira, cobrança e direitos econômicos

> **Princípio financeiro:** instrução de cobrança, retorno de provedor, aplicação de caixa, dedução, direito econômico, instrução de repasse e liquidação são fatos diferentes. A estratégia não admite que um status de tela substitua conciliação e evidência de settlement.

| Camada | Decisão | Prova futura |
| --- | --- | --- |
| Eventos e obrigações | Eventos geram obrigações versionadas por contrato/política. | Cenários de competência, vencimento, alteração, exceção e cancelamento preservam fatos. |
| Cobrança | Emissão e comunicação ocorrem por outbox idempotente. | Há preview, política, destinatário, correlação, timeout, retentativa e suspensão. |
| Caixa e conciliação | Retorno externo é correlacionado, validado e aplicado sem duplicidade. | Casos de pagamento parcial, duplicado, estorno, divergência e intervenção humana são cobertos. |
| Direitos e repasses | Taxa/dedução/direito são calculados e aprovados antes da instrução externa. | Elegibilidade, bloqueio, alçada, instrução, retorno e settlement têm estados separados. |

## Onda 5 — Serviços, portais, documentos e canais

| Capacidade | Decisão | Gate futuro |
| --- | --- | --- |
| Serviço e prestador | Caso técnico com pagador, orçamento, autorização, agenda, execução e evidência. | Mudança de status não gera pagamento; dados de prestador são privados/mascarados. |
| Vistoria e sinistro | Caso com item/ambiente, cronologia, mídia, responsável, prazo e decisão. | Não conclui culpa, cobertura ou indenização automaticamente. |
| Documentos | Cofre privado por finalidade, classificação, versão, validade e revisão. | Compartilhar usa preview, acesso mínimo, expiração e audit event. |
| Portais e divulgação | Grants mínimos por contrato/objeto; publicação e campanhas são fluxos externos próprios. | Ação externa exige aprovação, idempotência, logs e retorno/erro governados. |

## Onda 6 — Inteligência, métricas e evolução contínua

| Elemento | Regra estratégica | Critério de aceite futuro |
| --- | --- | --- |
| Métricas | Toda métrica declara fórmula, fonte, período, coorte, unidade, `as_of`, frescor e limitação. | Card agrega somente fatos autorizados e fornece drill-down protegido. |
| Regras e IA | Score/recomendação declara fatores, dados, versão, limiar, owner e revisão humana. | Nenhuma distribuição, campanha ou ação crítica ocorre sem limite, aprovação e rollback. |
| Observabilidade | Erro, sessão, permissão e integração carregam correlação e estado seguro. | Retentativa é idempotente e a tela informa próximo passo sem expor dados. |
| Aprendizado | Piloto transforma resultado agregado em decisão versionada. | Cada mudança mantém a cadeia intenção → evidência → decisão → requisito → prova → observação → aprendizado. |

## Decisões que exigirão aprovação antes de implementação

| Decisão futura | Recomendação inicial | Dependência |
| --- | --- | --- |
| Primeiro caso de uso implementado | Começar pela fundação e um fluxo vertical estreito de dados não financeiros. | Matriz de grant, modelo canônico e testes permitir/negar aprovados. |
| Dados pessoais/documentos | Coleta progressiva, storage privado, policy por finalidade e acesso auditado. | Classificação, retenção, DPA/política interna e testes de isolamento. |
| Cobrança e repasse | Integrar somente parceiro habilitado, com outbox/inbox e conciliação. | Contratos, compliance, arquitetura de eventos e cenários de exceção aprovados. |
| IA e automação | Começar com recomendação explicável e revisão humana, sem execução automática. | Contrato de métrica, dados mínimos, monitoramento e rollback definidos. |
| Portal externo | Liberar somente leitura mínima por grants datados e revogáveis. | Matriz de escopo, documento, sessão, suporte e testes de URL direta. |

## Referências internas

[1] [Estratégia atualizada — Vendas Urbanas e Locação](estrategia_vendas_urbanas_locacao_atualizada.md)

[2] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)

[3] [Consolidação de Vendas Urbanas](consolidacao_vendas_urbanas_hincrivel.md)

[4] [Consolidação de Locação](consolidacao_locacao_hincrivel.md)
