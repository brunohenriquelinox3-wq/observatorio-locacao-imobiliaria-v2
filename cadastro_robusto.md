# Modelo de cadastro robusto para clientes de imobiliárias de locação

## Síntese executiva

O cadastro recomendado não é um formulário único. Ele é uma **jornada progressiva de quatro camadas**, orientada a uma decisão operacional por vez: captar a intenção, qualificar a busca, formar o dossiê e sustentar a contratação. A robustez vem da completude no momento certo, da evidência documental controlada e de uma trilha auditável — não do número de perguntas apresentadas no primeiro acesso.

Esse desenho é coerente com a expansão dos domicílios alugados e com a necessidade de as imobiliárias organizarem procura, carteira e risco em um ambiente digital. Ele também reduz exposição ao pedir dados compatíveis com uma finalidade explícita e apenas quando necessários, como exige a LGPD. [1] [2] [3]

> **Regra de produto:** se um dado não altera a próxima decisão, ele não deve ser obrigatório naquela etapa.

## Arquitetura em quatro camadas

| Camada | Decisão que habilita | Tempo-alvo | Dados obrigatórios | Dados que não devem entrar nesta fase |
| --- | --- | ---: | --- | --- |
| 1. Interesse | A imobiliária consegue responder e encontrar opções iniciais? | 60–90 segundos | Cidade, região/bairro, data desejada, orçamento total aproximado, tipo de imóvel, contato e aceite do aviso de privacidade. | CPF, RG, renda comprovada, dados de fiador, documentos e histórico financeiro. |
| 2. Qualificação | Quais imóveis e condições fazem sentido para este cliente? | 3–5 minutos | Preferências, composição da moradia, restrições relevantes, faixa de renda familiar, contato preferido, disponibilidade para visita e alternativa de garantia considerada. | Arquivos financeiros, cópias de documentos e dados completos de terceiros. |
| 3. Dossiê de proposta | A análise cadastral pode começar para um imóvel específico? | 8–15 minutos + upload | Identificação, endereço atual, ocupação, renda e sua evidência, participantes do contrato, garantia escolhida, declarações e autorizações específicas. | Dados sem relação com o contrato ou com a análise autorizada. |
| 4. Contratação | O contrato pode ser formalizado e administrado? | Variável | Dados contratuais validados, vistoria, encargos, assinatura, contatos de emergência quando justificáveis e permissões operacionais. | Dados já disponíveis que possam ser referenciados com segurança, sem nova coleta. |

## Camada 1 — formulário público de interesse

Esta é a única versão que deve aparecer em anúncios, landing pages, QR codes, redes sociais e portais parceiros. O objetivo não é aprovar o cliente; é criar um perfil de demanda acionável para a imobiliária. Deve conter um indicador de que o preenchimento leva aproximadamente um minuto, opção de pausar e texto de privacidade em linguagem direta.

| Grupo de decisão | Campo proposto | Formato | Regra de uso |
| --- | --- | --- | --- |
| Localização | Cidade e até três regiões ou bairros de interesse | Busca assistida + múltipla escolha | Essencial para encaminhamento e matching. |
| Momento | Quando pretende mudar? | Até 30 dias; 31–60; 61–90; mais de 90; pesquisando | Alimenta prioridade comercial sem exigir justificativa pessoal. |
| Capacidade de pagamento | Orçamento mensal total aproximado | Faixas que incluem aluguel + condomínio + IPTU quando aplicável | A interface deve explicar “total mensal”, para reduzir incompatibilidade de expectativa. |
| Produto procurado | Tipo, quartos, mobiliado e vagas | Seletores simples | Apenas os filtros que alteram o conjunto inicial de imóveis. |
| Composição | Quantas pessoas morarão? Há pet? | Numérico + sim/não | Necessário para compatibilidade do imóvel; não coletar dados pessoais dos moradores nessa fase. |
| Contato | Nome social ou nome de preferência, WhatsApp/telefone e e-mail opcional | Campos validados | Perguntar o canal preferido e horário para contato. |
| Transparência | Ciência do aviso de privacidade e finalidade do contato | Checkbox sem pré-seleção | Guardar versão do aviso, data e origem do lead. |

## Camada 2 — qualificação conversacional

A qualificação deve abrir após uma primeira resposta da imobiliária, no autoatendimento autenticado ou com um consultor. Ela transforma interesse em uma ficha de busca. A lógica condicional evita perguntas irrelevantes: quem escolhe “mobiliado” pode indicar itens essenciais; quem aponta mudança em até 30 dias recebe prioridade para agendamento; quem precisa de acessibilidade vê perguntas funcionais, sem solicitar informação de saúde.

| Bloco | Campos | Utilidade operacional |
| --- | --- | --- |
| Critérios inegociáveis | Teto do custo total, regiões, quartos, data, pet, acessibilidade funcional, vagas e itens indispensáveis | Evita visitas sem aderência e cria filtros para carteira. |
| Preferências | Andar, lazer, sol, proximidade a transporte, escolas ou trabalho, equipamentos e estilo de imóvel | Ajuda ranking de match; nunca deve bloquear automaticamente uma oportunidade. |
| Capacidade indicativa | Faixa de renda familiar mensal, tipo de vínculo de renda, quantidade de proponentes | Orienta a conversa e a previsão de elegibilidade, sem substituir análise. |
| Jornada comercial | Imóvel de interesse, disponibilidade para visita, canal preferido, origem e corretor responsável | Organiza SLA, atribuição e conversão. |
| Garantia | Preferência ou possibilidade: caução, fiador, seguro-fiança, cessão fiduciária de quotas ou “preciso de orientação” | Mapeia caminho de contratação. A Lei do Inquilinato admite uma garantia por contrato, não várias simultaneamente. [4] |

## Camada 3 — dossiê de proposta e análise

O dossiê só é habilitado depois de uma manifestação concreta de interesse por imóvel ou de uma pré-triagem declarada pela imobiliária. O usuário deve visualizar: imóvel vinculado, finalidade de cada bloco, documentos pendentes, status de revisão, prazo de retenção e responsável pelo tratamento. A coleta de documentos ocorre em cofre digital, e não em links públicos, WhatsApp pessoal ou anexos de e-mail sem controle.

| Domínio | Dados e evidências | Controle obrigatório |
| --- | --- | --- |
| Identificação | Nome civil, CPF, documento de identidade, data de nascimento, estado civil quando necessário para o contrato, endereço atual e contatos | Validação de formato, mascaramento e acesso por função. |
| Participantes | Proponente principal, co-proponentes, ocupantes adultos quando participantes do contrato e fiador se a modalidade for escolhida | Convite individual e aceite próprio; não compartilhar dados entre partes além do necessário. |
| Renda | Tipo de vínculo, renda declarada, comprovante compatível, composição de renda quando houver mais de um proponente | Separar declaração de arquivo; registrar data de validade e quem analisou. |
| Garantia | Modalidade selecionada e documentos próprios apenas da modalidade escolhida | Não abrir coleta de dados de fiador se a garantia não for fiança. |
| Imóvel e proposta | Código do imóvel, valor, encargos, início pretendido, condição negociada, aceite de proposta | Congelar versão da proposta e manter histórico de alterações. |
| Autorizações | Ciência de privacidade, bases e finalidades informadas, autorização específica quando efetivamente necessária para a análise, declarações de veracidade | Arquivar versão do texto, marca temporal, canal e evidência de aceite. |

## Camada 4 — formalização e operação

Após aprovação e aceite da proposta, o sistema cria a ficha contratual a partir do dossiê, sem redigitação. O profissional responsável deve confirmar o que foi herdado, e o cliente deve revisar os dados antes da assinatura. O produto deve separar os papéis de “captador”, “consultor de locação”, “analista cadastral”, “gestor” e “administrador do contrato”, assegurando que cada perfil veja apenas o mínimo necessário.

| Objeto | Resultado esperado |
| --- | --- |
| Contrato | Partes, condições econômicas, garantia única, prazo, reajuste, encargos e assinaturas versionadas. |
| Vistoria | Registro associado ao imóvel e ao contrato, com permissões separadas do dossiê financeiro. |
| Comunicação | Linha do tempo de avisos, consentimentos, pendências e atendimentos, sem expor arquivos sensíveis em conversas comuns. |
| Retenção e descarte | Agenda configurável por política e base legal, com descarte ou anonimização rastreáveis após o fim da finalidade. |

## Motor de priorização explicável

O cadastro deve criar uma priorização comercial, não um veredito automatizado de aprovação. O objetivo é indicar qual atendimento pode gerar mais valor agora. Cada fator precisa ser exibível ao corretor e auditável pelo gestor.

| Dimensão | Pergunta respondida | Sinal de exemplo | Tratamento recomendado |
| --- | --- | --- |
| Intenção | Há urgência e disponibilidade para avançar? | Mudança em até 30 dias e agenda de visita disponível | Aumenta prioridade de contato. |
| Aderência | Há imóveis compatíveis com os critérios essenciais? | Região e custo total compatíveis com a carteira | Aumenta ranking de match. |
| Completude | O próximo passo dispõe de informação suficiente? | Perfil preenchido e contato verificado | Define prontidão operacional. |
| Viabilidade declarada | A modalidade de garantia e a renda declarada indicam caminho de análise? | Seguro-fiança considerado e faixa de renda informada | Direciona orientação; não substitui análise formal. |
| Relacionamento | Há resposta a contato e participação na jornada? | Confirmação de visita ou atualização recente | Apoia SLA e cadência. |

Características pessoais protegidas ou irrelevantes para o contrato não devem compor regras de prioridade. O sistema também não deve negar, aprovar ou precificar automaticamente uma pessoa com base em um score opaco. A decisão cadastral deve preservar revisão humana, justificativa interna e procedimentos compatíveis com a política da imobiliária.

## Requisitos de produto e governança

| Pilar | Requisito de implementação | Evidência de conformidade |
| --- | --- | --- |
| Minimização | Campos habilitados por etapa e por lógica condicional | Mapa de dados com justificativa por campo. |
| Transparência | Aviso curto na tela e política detalhada acessível | Versão, data, origem e texto exibido no registro. |
| Segurança | Cofre de documentos, criptografia em repouso e trânsito, autenticação forte e limitação de download | Logs de acesso, alertas e revisão periódica de permissões. |
| Prestação de contas | Registro de operações, fornecedores, responsáveis e incidentes | Inventário de tratamento e trilhas de auditoria. |
| Qualidade | Validação, deduplicação, confirmação de contato e atualização de perfil | Histórico de alterações e indicador de completude. |
| Portabilidade operacional | Integração por API ou exportação limitada e auditada para CRM, ERP ou assinatura eletrônica | Contratos de integração, escopo de dados e logs de sincronização. |

## Antipadrões a evitar

Não usar um “formulário de análise” como primeiro contato. Não solicitar CPF, RG, selfies, extratos, dados de fiador ou cópia de documentos em anúncios e chatbots abertos. Não oferecer apenas um campo livre de “renda” sem explicar o cálculo. Não usar WhatsApp pessoal como repositório de documentos. Não coletar mais de uma garantia para o mesmo contrato. Não permitir que qualquer corretor baixe todos os arquivos de uma carteira. Não esconder do cliente por que um dado é solicitado.

## Indicadores de sucesso

O piloto deve acompanhar três grupos de métricas. Na entrada: taxa de início, conclusão e tempo de cadastro. Na operação: tempo até primeiro contato, perfil qualificado, visita e proposta. Na qualidade: percentual de dossiês completos na primeira solicitação, retrabalho documental, conversão por origem e acesso indevido ou exportação fora de perfil. Métricas de recusa devem ser auditadas por política, origem e etapa, sem criar inferências sobre grupos protegidos.

## Observação de conformidade

Este modelo é uma referência estratégica e de produto, não substitui revisão jurídica, política de crédito, avaliação de segurança da informação e definição de papéis de controlador e operador aplicáveis a cada imobiliária.

## Referências

[1] [FipeZAP — Informe de Locação Residencial, julho de 2026](https://imoveis.grupoolx.com.br/uploads/fipezap_202607_residencial_locacao_25996d7baf.pdf)

[2] [IBGE — Domicílios alugados cresceram mais de 50% desde 2016](https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/46449-domicilios-alugados-cresceram-mais-de-50-desde-2016)

[3] [Planalto — Lei nº 13.709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

[4] [Planalto — Lei nº 8.245/1991 (Lei do Inquilinato)](https://www.planalto.gov.br/ccivil_03/leis/l8245.htm)

[5] [Nielsen Norman Group — 4 Principles to Reduce Cognitive Load in Forms](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)

[6] [ANPD — Guia orientativo sobre segurança da informação para agentes de tratamento de pequeno porte](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte)
