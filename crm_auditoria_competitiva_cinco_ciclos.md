# Auditoria competitiva em cinco ciclos — CRM imobiliário, loteadoras e locação

**Data de referência:** 26 de agosto de 2026, GMT-3.  
**Universo:** CV CRM, Jetimob, Sistemas GL/SUB100, Facilita, Imobibrasil, Supremo CRM, Lote Mobile, Airbnb Co-Host e Salesforce.  
**Método:** cada ciclo revisa a mesma base com uma pergunta distinta. Páginas comerciais provam somente o que o fornecedor declara publicamente; **lacuna pública não é ausência de capacidade**. Nenhuma promessa concorrente foi promovida como regra financeira, jurídica, fiscal ou de segurança sem evidência própria e owner especializado.

## Matriz de cinco ciclos

| Ciclo | Pergunta de pente fino | Resultado confirmado | Decisão candidata |
| --- | --- | --- | --- |
| C1 — Trabalho a resolver | Qual dor o concorrente declara resolver e para qual operador? | Loteadoras compram redução de atrito entre lead, corretor, unidade, reserva e proposta; locação compra previsibilidade de contrato, mensalidade e repasse; CRM horizontal compra unificação de dados e canais. [1] [2] [3] [4] [5] [6] [7] | Manter produto por domínio com núcleo compartilhado: **loteadora**, **locação**, **venda**, **parceiro** e **plataforma**. |
| C2 — Jornada e objeto | O que muda no ativo, estoque ou carteira durante a operação? | Espelho/mapa de disponibilidade e prevenção de duplicidade são padrão declarado para loteadoras. Vendas, documentos, propostas e reserva aparecem no mesmo fluxo comercial em múltiplas ofertas. [1] [2] [3] [4] [8] | Diferenciar não pelo mapa, mas por elegibilidade calculada: registro, alocação, restrição, compromisso, tabela e alçada. |
| C3 — Financeiro e contrato | Qual promessa envolve cobrança, repasse, comissão, pagamento ou obrigação? | Jetimob, Supremo, Facilita e Lote Mobile anunciam automações financeiras; Airbnb demonstra a mecânica mais explícita de base, aceite, ordem, insuficiência e vigência de cotas. [9] [10] [11] [12] [13] | Tratar CRM como **subledger/orquestrador**: direito, instrução, evento externo, settlement e conciliação são fatos separados. |
| C4 — Integração e governança | Como dados, permissões, documentos e eventos devem circular? | Concorrentes declaram integrações, documentos, permissões, histórico ou webhooks; Salesforce declara dados unificados, resolução de identidade e políticas de uso. [8] [14] [15] | Cada conector precisa de ownership, contrato de dados, idempotência, observabilidade, versionamento e política por finalidade. |
| C5 — Red-team | O que não se pode copiar de forma ingênua? | “Em tempo real”, “automático”, “tudo em um”, “pagamento integrado” e “IA” não revelam alçada, autorização, consistência, exceção, segurança, limite fiscal ou responsabilidade. [1] [4] [10] [15] | Rejeitar a automação opaca; promover evidência, estado, owner, limite e caminho de exceção em todo comando crítico. |

## C1 — Trabalho a resolver e posicionamento

As referências de loteadora convergem em um trabalho comercial muito claro: coordenar oferta de unidade, atendimento e corretagem em lançamentos. CV CRM, Jetimob, Sistemas GL, Facilita e Lote Mobile descrevem, com ênfases diferentes, disponibilidade visual, reserva, proposta, funil e/ou documentos. [1] [2] [3] [4] [5] O primeiro aprendizado não é copiar telas: é reconhecer que o cliente espera **tempo de resposta baixo, clareza sobre o lote e redução de conflito entre canais**.

Imobibrasil explicita a proposta de plataforma integrada para captação, site/portais, CRM, locação e IA; Supremo concentra a narrativa de locação em mensalidades, repasses, reajustes e renovações. [6] [7] Airbnb e Salesforce são referências adjacentes: o primeiro privilegia colaboração operacional e o segundo a integração de dados e funções empresariais. [13] [15] Assim, a estratégia permanece correta ao não forçar loteadora, locação e hospitalidade em uma mesma máquina de estado.

| Segmento observado | Expectativa competitiva declarada | Diferenciação que o guia preserva |
| --- | --- | --- |
| Loteadora | Mapa/espelho, reserva, proposta, documentação, funil, corretores e integração. [1] [2] [3] [4] | Ativo registral, alocação, restrição, origem e direito econômico são entidades e evidências próprias. |
| Locação | Contrato, agenda de mensalidade, repasse, reajuste, renovação, conciliação e financeiro. [7] [11] | Natureza do direito, provisão, instrução, settlement e conciliação não são reduzidos a “pagamento”. |
| CRM/marketing generalista | Site, SEO, portais, automação de atendimento e produtividade de cadastro. [6] [8] | IA assiste captura e qualidade de dados, mas não declara fato registral, contrato, elegibilidade ou cálculo fiscal. |
| Plataforma/marketplace adjacente | Dados unificados, colaboração delegada, perfil/permite e integração de ecossistema. [13] [15] | Governança por organização, escopo, vigência, MFA, RLS, audit append-only e suporte JIT. |

## C2 — Jornada, estoque e carteira

O segundo ciclo confirma que disponibilidade comercial isolada é insuficiente. Os fornecedores de loteadora exibem “disponível, reservado, vendido” ou equivalentes para tornar o lançamento operável. [1] [2] [3] [4] Entretanto, esse trio não explica matrícula, registro aplicável, alocação a permutante, garantia municipal, ônus, contrato em distrato ou reentrada de estoque. O guia deve, portanto, manter a nova revisão de loteamentos: a disponibilidade é uma **projeção** de dimensões de fato e não um campo mestre editável.

| Camada | Padrão concorrencial observado | Pente fino que deve permanecer no CRM |
| --- | --- | --- |
| Vitrine comercial | Espelho/mapa e status legível de unidade. [1] [2] [4] | Exibir o status, a razão, a evidência, a data e o owner sem expor dado sensível. |
| Reserva/proposta | Fluxo mobile, documento e/ou aprovação comercial. [2] [3] [4] | `hold`, reserva, proposta e contrato têm IDs, expiração, alçada e transições incompatíveis explícitas. |
| Cadastro de ativo | Tipologia, empreendimento e mapa aparecem como foco. [2] [3] | `gleba → empreendimento → fase → quadra → lote/unidade` conserva regime/modalidade, evidência e relações de origem. |
| Pós-venda e carteira | Pós-venda e locação são frequentemente integrados à venda. [4] [6] [7] | Carteira, direito econômico, repasse e ocorrência contratual não retroeditam o ativo nem apagam fatos. |

> **Decisão do ciclo:** “tempo real” só poderá ser anunciado para uma transição que use regra de concorrência, idempotência, evidência e resposta determinística. A página comercial concorrente não prova esses mecanismos.

## C3 — Financeiro, repasse e contrato

O terceiro ciclo separa cobertura funcional de responsabilidade de liquidação. Facilita declara Pix vinculado a etapas comerciais e identifica um parceiro de processamento; Jetimob declara automação de cobrança/repasses, comissionamento, reajuste, rescisão e DIMOB; Supremo declara comissões e conciliação; Lote Mobile aproxima obras, ordem de compra e contas a pagar. [9] [10] [11] [12] Isso confirma que o financeiro é um requisito de mercado, mas não autoriza o produto a executar pagamentos ou decidir retenções por conta própria.

Airbnb fornece a referência de produto mais útil para desenho, não para copiar o regime: quem possui a autoridade configura a cota, o beneficiário aceita, a regra tem efetividade futura, a base de cálculo é definida, há ordem de prioridade e um cenário de insuficiência. [13] O CRM adotará esses **padrões de governança do entitlement** com contrato, contextualização fiscal/jurídica e parceiro habilitado, sem importar a ordem, a tributação ou as regras de hospitalidade.

| Aprendizado | Requisito estratégico resultante | Owner |
| --- | --- | --- |
| Pagamento integrado ao funil | Separar `PaymentIntent`, evento do parceiro, `CashApplication`, `Settlement` e `Reconciliation`. | Engenharia + financeiro. |
| Comissão e repasse automatizados | Congelar base, versão, prioridade, vigência, beneficiário e rateio antes da instrução. | Controladoria + jurídico. |
| Estorno/ajuste anunciado | Reversão é caso/fato compensatório com alçada e evidência; não edição de baixa confirmada. | Financeiro + auditoria. |
| Integração de obra/permuta | Obrigações, recebimento técnico, estoque de obra, lote físico e entitlement monetário permanecem objetos distintos. | Engenharia + suprimentos + controladoria. |

## C4 — Integração, dados e governança

O quarto ciclo encontra uma expectativa competitiva ampla de conectividade. CV CRM anuncia ecossistema de integrações; Jetimob lista grupos de permissão, repositório de documentos, histórico e webhooks; Facilita lista ERP, assinatura, pagamento, API/BI; Lote Mobile apresenta assinatura, bancos e mapa. [8] [9] [12] [14] Salesforce amplia a referência de plataforma ao descrever dados harmonizados, resolução de identidade, políticas, consentimento, conectores e ativação por evento. [15]

O guia não deve responder a isso com um “hub” sem fronteiras. A decisão estratégica permanece: **cada integração recebe contrato, fonte de verdade, direção/sincronização, deduplicação, chave de idempotência, política de retry, observabilidade, owner e plano de compensação**. Dados de clientes, financeiro e split nunca serão liberados por um Super Admin genérico: acesso exige escopo, vigência, justificativa, step-up e auditoria.

| Padrão visível | Decisão que evita fragilidade |
| --- | --- |
| Lista de parceiros/integrações | Catálogo de integração não equivale a sincronização válida; cada fluxo tem contrato e teste de falha. |
| Webhook/evento | Evento externo é recebido, autenticado, deduplicado, registrado e conciliado; não muda saldo por si só. |
| Permissão/histórico | RBAC é camada de UX; autoridade real vem de RLS, políticas de dado, contexto e trilha append-only. |
| IA sobre dados | IA só recebe contexto permitido, demonstra fonte/incerteza e nunca executa comando crítico sem autorização. |

## C5 — Red-team e risco de cópia

O ciclo final questiona a tradução literal das promessas concorrentes. O mapa, o pagamento via Pix, o “automático”, a IA, a integração bancária ou a página de e-commerce podem ser excelentes experiências, mas se tornam perigosos quando substituem os respectivos controles de saldo, documento, alçada, exceção e responsabilidade profissional.

| Promessa observada | Risco de cópia superficial | Resposta do CRM estratégico |
| --- | --- | --- |
| “Evite reservas duplicadas”. [1] [2] [3] | Resolver apenas por atualização visual. | Lock/concorrência e transição transacional, com expiração, audit event e intervenção de exceção. |
| “Cobranças e repasses automáticos”. [8] [9] [11] | Confundir cálculo com liquidação e repasse de terceiro com receita própria. | Subledger, natureza de direito, parceiro habilitado, idempotência, comprovação e conciliação. |
| “Tudo em um”. [6] [7] | Generalizar o domínio e perder especialização. | Núcleo de identidade/evidência/integridade + módulos especializados interoperáveis. |
| “IA para cadastro e atendimento”. [6] [15] | Auto-preencher informação errada ou vazar dados. | Assistência com fonte, validação humana, permissão, limitação de uso e não execução financeira/jurídica. |
| “Integração com parceiros”. [9] [14] | Integrar sem definir dono do dado e caminho de falha. | Contrato de integração, ownership, replay seguro, SLA operacional e fila de divergência. |

## Resultado dos cinco ciclos

As referências confirmam que nossa estratégia deve alcançar uma experiência comercial rápida e visual, porém com uma camada de confiabilidade que não aparece demonstrada nas páginas analisadas: **evidência versionada, estados ortogonais, cálculo reproduzível, regra datada, exceção operável, autorização mínima e auditoria verificável**. O objetivo não é declarar superioridade sem teste; é transformar os pontos cegos da promessa de mercado em requisitos verificáveis antes de implementação.

## Referências

[1] [CV CRM — solução para loteadoras](https://cvcrm.com.br/cv-para-loteadora/)

[2] [Jetimob — CRM para loteadora](https://www.jetimob.com/crm-loteadora)

[3] [Sistemas GL/SUB100 — CRM para loteadoras](https://sistemasgl.com.br/modulos/crm-para-loteadoras/)

[4] [Facilita — soluções para loteadoras](https://appfacilita.com/loteadoras/)

[5] [Lote Mobile — sistema para loteamento](https://lotemobile.com.br/)

[6] [Imobibrasil — plataforma institucional](https://www.imobibrasil.com.br/)

[7] [Supremo CRM — gestão de locação](https://supremocrm.com.br/sistema-de-gestao-de-locacao/)

[8] [Jetimob — recursos](https://www.jetimob.com/recursos)

[9] [Facilita — pagamentos](https://appfacilita.com/pagamentos/)

[10] [Supremo CRM — financeiro completo](https://supremocrm.com.br/financeiro-completo/)

[11] [Lote Mobile — módulo de obras](https://lotemobile.com.br/obras)

[12] [CV CRM — integrações](https://cvcrm.com.br/integracoes/)

[13] [Airbnb — como funcionam as cotas do coanfitrião](https://www.airbnb.com.br/help/article/3389)

[14] [Imobibrasil — artigo editorial de comparativo](https://www.imobibrasil.com.br/blog/os-5-melhores-crms-imobiliarios-para-impulsionar-as-suas-vendas/)

[15] [Salesforce — Data 360](https://www.salesforce.com/br/data/)
