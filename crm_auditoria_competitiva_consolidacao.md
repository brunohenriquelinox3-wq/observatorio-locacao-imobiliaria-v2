# Consolidação da auditoria competitiva — decisões para o CRM imobiliário

**Data de referência:** 26 de agosto de 2026, GMT-3.  
**Base de decisão:** cartões de entidade, fontes oficiais de concorrentes e a auditoria em cinco ciclos.  
**Regra de promoção:** capacidade declarada por concorrente estabelece sinal de mercado, não comprovação de arquitetura, segurança, preço, operação ou conformidade. O CRM somente promove requisito que possua problema, benefício, owner, limite, teste de saída e aderência ao domínio.

## Decisões de produto promovidas

| Código | Decisão | Evidência competitiva | Backlog especializado | Owner | Limite preservado |
| --- | --- | --- | --- | --- | --- |
| BENCH-01 | Tratar espelho/mapa como expectativa de entrada para loteadora, não como diferencial isolado. | CV CRM, Jetimob, Sistemas GL, Facilita e Lote Mobile declaram mapa/espelho, disponibilidade e reserva. [1] [2] [3] [4] [5] | `COMP-02`, `COMP-05`, `UX-04`, `PLAT-06`, `ENG-12`. | Produto de loteadora + engenharia. | “Tempo real” só é declarado para transição com concorrência, idempotência, expiração e audit event. |
| BENCH-02 | Fazer elegibilidade comercial explicável a partir de dossiê, alocação, restrição, compromisso, tabela e alçada. | Concorrentes exibem disponibilidade comercial, mas as páginas não demonstram vínculo completo entre registro, origem e restrição. [1] [2] [3] [4] | `COMP-05` e `CUR-02`. | Jurídico imobiliário + gestor de empreendimento. | O CRM não certifica regularidade registral, urbanística ou ambiental. |
| BENCH-03 | Unificar a jornada comercial sem colapsar o domínio: lead → proposta → reserva → documento/assinatura → contrato → pós-venda/carteira. | Jetimob, Sistemas GL e Facilita declaram essas etapas conectadas. [2] [3] [4] | `COMP-01` a `COMP-04`, `PLAT-06`, `AUD-03`. | Produto + operação comercial. | Cada transição mantém estado e entidade própria; proposta não vira contrato e reserva não vira venda por inferência. |
| BENCH-04 | Elevar o padrão de produtividade de cadastro e publicação por IA assistida, com fonte, rascunho, validação e trilha. | Imobibrasil declara IA em cadastro/anúncio; Salesforce declara IA dependente de contexto de dados. [6] [16] | `COMP-09`, `UX-09`, `AUD-08`. | Produto de IA + DPO + operação. | IA não declara fato registral, preenche obrigação fiscal nem executa decisão/pagamento crítico. |
| BENCH-05 | Construir camada de integração com catálogo, ownership, contrato de dados, evento, idempotência, correlação, replay e reconciliação. | CV CRM, Jetimob, Facilita e Lote Mobile enfatizam ecossistemas, webhooks, assinatura, ERP/bancos e pagamentos. [8] [9] [10] [12] | `COMP-08`, `PLAT-07`, `PLAT-16`, `AUD-07`, `ENG-04`. | Arquitetura + parcerias + segurança. | Logo de parceiro não prova autoridade, disponibilidade, SLA, consistência ou cobertura contratada. |
| BENCH-06 | Operar financeiro como subledger governado: direito, instrução, retorno de parceiro, settlement e conciliação são fatos distintos. | Jetimob, Facilita, Supremo e Lote Mobile anunciam cobrança, repasse, conciliação ou contas a pagar; Airbnb demonstra base, aceite, vigência e prioridade de cotas. [9] [10] [11] [12] [13] | `COMP-06`, `COMP-07`, `FIN-01` a `FIN-04`, `CUR-01` a `CUR-04`. | Controladoria + jurídico + parceiro habilitado. | CRM não é banco, liquidante, transmissor fiscal ou autoridade para retenção/tributação. |
| BENCH-07 | Tratar autonomia de corretor, parceiro e cliente como ação limitada por contexto, escopo e aprovação, não por perfil amplo. | Facilita declara autonomia mobile/e-commerce; Airbnb declara colaboração via convite e acesso a calendário; Jetimob declara grupos de permissões. [4] [8] [13] | `COMP-04`, `ORG-01`, `ORG-02`, `ADM-03`, `IAM-03`. | Segurança + produto + operação. | Nenhuma autonomia contorna elegibilidade, alçada, segregação de deveres ou prova documental. |
| BENCH-08 | Integrar engenharia/obra a financeiro e comercial somente por objetos e evidências compartilháveis, mantendo owners distintos. | Lote Mobile declara cronograma, diário, estoque, ordem de compra, contas a pagar e permuta. [12] | `COMP-05`, `FIN-01`, `DEМ-02`, `AUD-07`. | Engenharia + suprimentos + controladoria. | Obra não decide preço, direito econômico, repasse ou elegibilidade comercial sem política e alçada próprias. |
| BENCH-09 | Usar governança de dados e política por finalidade como diferencial defensável, inspirada pela referência horizontal sem copiar sobreengenharia. | Salesforce declara dados harmonizados, identidade, políticas, consentimento, conectores e ativação por evento. [15] [16] | `PLAT-03` a `PLAT-05`, `PLAT-14`, `ADM-02`, `AUD-02`, `AUD-07`. | Segurança + arquitetura + DPO. | O CRM preserva arquitetura proporcional ao estágio e domínio brasileiro, sem tentar replicar plataforma enterprise genérica. |

## Diferenciais que devem permanecer explícitos

| Frente | Padrão competitivo mínimo | Diferencial defendido pela estratégia |
| --- | --- | --- |
| Estoque de loteamento | Espelho com disponível/reservado/vendido. | Registro, modalidade, alocação, restrição, disponibilidade, compromisso e carteira como dimensões ortogonais, com evidência e owner. |
| Reserva e proposta | Fluxo visual/móvel e prevenção comercial de duplicidade. | Comando transacional, `expected_version`, expiração, policy de elegibilidade, idempotência e exceção explicável. |
| Financeiro | Cobrança, comissão, repasse, Pix, conciliação e dashboard. | Direitos datados/reproduzíveis, segregação de natureza, parceiro habilitado, reconciliação por item e fatos compensatórios. |
| Integração | Catálogo de ERP, portais, assinatura, banco, marketing e API. | Ownership por dado, contrato, evento autenticado, outbox/inbox, retry seguro, divergência e auditoria. |
| IA | Cadastro, anúncio, distribuição, recomendação e automação. | IA com fonte, escopo, dado mínimo, permissão, limite, revisão humana, avaliação e kill switch. |
| Administração | Permissões e grupos de usuário. | Menor privilégio, MFA/step-up, escopo/vigência, JIT, break-glass, RLS e audit append-only. |

## Decisões rejeitadas ou adiadas

| Proposta tentadora | Decisão | Motivo |
| --- | --- | --- |
| Copiar um “espelho em tempo real” como UI antes do comando de reserva. | Rejeitada. | A superfície visual não protege contra concorrência, duplicata, retry ou estado inválido. |
| Conectar Pix ou banco e chamar qualquer retorno de “liquidação”. | Rejeitada. | Partner event, prova, settlement e conciliação precisam ser correlacionados e podem divergir. |
| Inserir e-commerce de lote sem regras de disponibilidade, alçada, tabela, contrato e exceção. | Adiada. | Exige `COMP-02`, `COMP-03`, `COMP-05`, `PLAT-06` e testes de jornada antes de ativação. |
| Criar “split tipo Airbnb” para loteadora/locação. | Rejeitada como cópia literal. | O padrão de aceite/vigência é útil; bases, prioridade, fiscalidade, contrato e liquidação devem ser brasileiros e contextuais. |
| Transformar plataforma em Salesforce antes de provar o core. | Rejeitada. | O risco é custo e generalidade; primeiro consolidar ativo, contrato, subledger, evidência e RLS. |

## Critérios de aceite agregados para a próxima etapa executável

| Jornada futura | Critério de aceite derivado da auditoria |
| --- | --- |
| Reserva em lançamento | Duas sessões concorrentes recebem resultado determinístico; a perdedora vê motivo, próximo passo e não cria proposta/direito oculto. |
| Elegibilidade de lote | A tela mostra a dimensão impeditiva, fonte, vigência e owner; tentativa por API/RPC falha com a mesma política. |
| Repasse/comissão | Prévia mostra origem, base, regra, versão, recebedor, prioridade, arredondamento, bloqueio e parceiro; nenhum efeito financeiro é duplicado por retry. |
| Callback de parceiro | Evento repetido, tardio ou fora de ordem preserva estado, registra correlação e abre caso de reconciliação sem aplicar segunda baixa. |
| Assistência de IA | Saída declara fontes e incerteza; ação de risco exige confirmação e o modelo não recebe dados fora da finalidade autorizada. |
| Delegação de operação | Convite/grant expira, não supera teto de poder e não dá acesso a outro tenant, carteira, documento, saldo ou split. |

## Referências

[1] [CV CRM — solução para loteadoras](https://cvcrm.com.br/cv-para-loteadora/)

[2] [Jetimob — CRM para loteadora](https://www.jetimob.com/crm-loteadora)

[3] [Sistemas GL/SUB100 — CRM para loteadoras](https://sistemasgl.com.br/modulos/crm-para-loteadoras/)

[4] [Facilita — soluções para loteadoras](https://appfacilita.com/loteadoras/)

[5] [Lote Mobile — sistema para loteamento](https://lotemobile.com.br/)

[6] [Imobibrasil — plataforma institucional](https://www.imobibrasil.com.br/)

[7] [Supremo CRM — gestão de locação](https://supremocrm.com.br/sistema-de-gestao-de-locacao/)

[8] [CV CRM — integrações](https://cvcrm.com.br/integracoes/)

[9] [Jetimob — recursos](https://www.jetimob.com/recursos)

[10] [Facilita — pagamentos](https://appfacilita.com/pagamentos/)

[11] [Supremo CRM — financeiro completo](https://supremocrm.com.br/financeiro-completo/)

[12] [Lote Mobile — módulo de obras](https://lotemobile.com.br/obras)

[13] [Airbnb — como funcionam as cotas do coanfitrião](https://www.airbnb.com.br/help/article/3389)

[14] [Imobibrasil — artigo editorial de comparativo](https://www.imobibrasil.com.br/blog/os-5-melhores-crms-imobiliarios-para-impulsionar-as-suas-vendas/)

[15] [Salesforce — Data 360](https://www.salesforce.com/br/data/)

[16] [Salesforce — Customer 360](https://www.salesforce.com/br/products/what-is-customer-360/)
