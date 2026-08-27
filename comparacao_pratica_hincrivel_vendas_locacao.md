# Comparação prática aprofundada — referência de mercado, Vendas Urbanas e Locação

**Status:** `propostas_pendentes_de_aprovação`  
**Fonte primária:** auditoria prática autenticada, com testes sintéticos controlados e sem uso de dados reais. [1]  
**Escopo:** somente **Vendas Urbanas** e **Locação**. Nenhuma regra da Loteadora é modificada por este caderno.

> A referência auditada é abrangente na superfície operacional: reúne leads, partes, imóveis, visitas, negócios, serviços, prestadores, carteira, formulários, financiamento, agenda, permissões e filtros. O diferencial do projeto não deve ser copiar telas; deve preservar essa cobertura prática enquanto torna dados, documentos, direitos, estados, acesso e efeitos financeiros explicáveis e seguros.

## 1. Síntese crítica do confronto

| Dimensão | Cobertura observada na referência | Situação estratégica atual | Proposta de evolução | Estado |
| --- | --- | --- | --- | --- |
| Parte, cliente e proprietário | Formulário único reaproveitado em listas distintas; abas de cônjuge, endereço, documentos, contas e tarefas. | Parte única com papéis datados já é princípio canônico. | Confirmar uma ficha única de `Parte`, com relações de comprador, proprietário, locatário, representante, fiador e coadquirente; substituir campos embutidos de cônjuge por relação versionada. | Proposta. |
| Dossiê e anexos | Upload simples por ficha, sem classificação/validade/versão visível. | Evidência versionada e com finalidade já é princípio canônico. | Aplicar dossiê reutilizável por parte, imóvel e negócio: tipo, finalidade, versão, validade, revisão, acesso, retenção e snapshot de contrato. | Proposta. |
| Imóvel e captação | Wizard de imóvel com localização, preços, chaves, comissão, proprietário, mídia, publicação e campos internos. | Imóvel e proprietário separados; titularidade/captação/autorização exigem evidência própria. | Criar ciclo explícito `rascunho → captação → autorização em revisão → pronto para anúncio → publicado/suspenso/retirado`, independente de locação/venda/contrato. | Proposta. |
| Lead e recomendação | Lead exige imóvel sugerido; funil visual, temperatura, filtros e recomendação por atributos. | Cliente/comprador e pré-proposta já previstos; lead não está detalhado como setor. | Criar **Central de Leads e Oportunidades** própria em Vendas Urbanas e reutilizável por Locação, com origem, consentimento, interest, owner, SLA, atividade, motivo de perda, elegibilidade e ligação segura com imóvel. | Proposta. |
| Visitas e agenda | Visita possui data/hora, cliente, corretor, imóvel e status; agenda unifica eventos. | Visita aparece como métrica/ponto de fluxo, sem contrato de dados aprofundado. | Manter **Visitas e Atividades** dentro da jornada de negócio, com agenda, conflito, confirmação, relatório, privacidade e transição auditada; não criar coluna global. | Proposta. |
| Proposta/negócio/contrato | Negócios combinam estados, cobranças e importações de planilha/IA. | Vendas e contratos são separados de recebimento confirmado; Locação separa administração de contrato locatício. | Preservar objeto de negócio como coordenação, mas separar proposta, reserva, contrato, carteira, cobrança, cash application e conciliação em estados/fatos próprios. | Princípio reforçado. |
| Financeiro e repasses | Abas de lançamentos, cobranças e repasses; valores visuais por status. | Subledger e separação de instrução, pagamento, direito e settlement já são canônicos. | Manter estas leituras contextuais, porém exigir natureza, idempotência, correlação, alçada, reconciliação e prestação de contas antes de efeitos financeiros. | Princípio reforçado. |
| Serviços e prestadores | Central de serviços com estados detalhados, pagador, contrato e prestador; cadastro inclui dados de pagamento. | Locação não possui setor explícito de manutenção/prestadores. | Criar **Manutenção e Prestadores** como setor próprio de Locação, separado de contrato, cobrança e pagamento; cada serviço terá orçamento, aprovação, responsável, SLA, evidência e alocação financeira declarada. | Proposta. |
| Vistorias, sinistros e garantias | Recursos/rotas existem, mas o perfil de auditoria não demonstrou o fluxo completo. | Locação menciona contratos, cobrança, renovação e portal; vistorias/sinistros ainda não estão explicitados no setor. | Tratar **Vistoria** como etapa do ciclo de locação e fasear **Sinistros e Garantias** como módulo posterior, preservando apenas registros mínimos de caso/restrição até o gate de domínio. | Proposta. |
| Financiamento urbano | Esteira visual de simulações e propostas, com consulta/integração externa sugerida. | Crédito declarado previsto, sem score secreto. | Criar `Financiamento e Crédito` como subfluxo de Vendas e Contratos: consentimento, documentos, propostas externas, versões, recusa, dados mínimos e nenhum score/operação automática. | Proposta. |
| Permissões e dados | Matriz CRUD por módulo; listas amplas exibem contatos, chaves, valores e ações em lote/exportação. | Organização, papel, escopo, vigência, policy, MFA/JIT e auditoria são princípios canônicos. | Reforçar ABAC/RLS por organização, objeto, campo, finalidade e vigência; exportação, documentos, chaves, bancos, PII e ações em massa precisam de políticas independentes do CRUD visual. | Princípio reforçado. |
| UX e dashboards | Navegação densa em “centrais”, filtros, mapas, kanban, cards e uma ficha de imóvel ampla. | Identidade editorial-cartográfica e métricas com definição/`as_of` já definidas. | Usar landing interna por coluna, busca contextual, mapas e kanban acessíveis; reduzir sobrecarga com progressive disclosure, definição de métricas, estados explícitos e links aos fatos fonte. | Proposta. |

## 2. Decisões propostas para Vendas Urbanas

| Código | Decisão proposta | Justificativa prática | Limite obrigatório |
| --- | --- | --- | --- |
| `VU-P01` | Criar **Central de Leads e Oportunidades** como setor próprio, primeiro ponto de trabalho dentro de Vendas Urbanas. | A referência mostra a importância operacional de captação, origem, pipeline, temperatura, atividade e recomendação de imóveis. | Lead não é cliente aprovado, comprador, proposta, contrato ou consentimento de marketing por padrão. |
| `VU-P02` | Tornar **Clientes** uma ficha de Parte única com papéis datados e dossiê reutilizável, incluindo comprador, coadquirente, proprietário, representante e cônjuge como relações. | Evita listas paralelas, duplicidade e relações embutidas sem histórico. | CPF/CNPJ, cônjuge, documentos e contas não são campos livres, nem concedem acesso ou aprovação automática. |
| `VU-P03` | Evoluir **Imóveis e Proprietários** para Captação e Inventário Urbano com ciclo próprio de autorização, anúncio, disponibilidade, chaves e publicação. | O wizard de referência ilustra cobertura ampla, mas mistura proprietário, anúncio, chave, mídia, comissão e dados internos sem fronteira visível. | Captação, autorização, publicação, reserva, contrato e entrega não são o mesmo estado; chave e localização exata têm acesso restrito. |
| `VU-P04` | Manter **Empreendimentos de Construtoras** como setor próprio, acrescentando construtora, empreendimento, torre, unidade, correspondente autorizado, estoque e versão de tabela. | A referência confirma necessidade de recorte de condomínio/empreendimento, mas a estratégia deve aprofundar unidade, autorização e disponibilidade. | Unidade não fica disponível por simples cadastro; preço/tabela/correspondente exigem vigência e alçada. |
| `VU-P05` | Manter **Vendas e Contratos** como setor próprio, com subetapas `interesse → visita/atividade → pré-proposta → revisão → reserva quando aplicável → contrato → pós-venda`. | Kanban, visita e negócios provam o valor de uma jornada visual, mas não substituem objeto de contrato. | Arrastar card não altera preço, condição, alçada, reserva, contrato, carteira ou comissão sem comando auditado. |
| `VU-P06` | Adicionar **Visitas e Atividades** como superfície interna da jornada de Vendas, não como setor global. | A referência combina calendário, visitas e tarefas, mas não demonstra conflitos, privacidade ou transições. | Evento não dispara comunicação/convite por padrão e não se torna visita concluída sem estado/evidência. |
| `VU-P07` | Adicionar `Financiamento e Crédito` como subfluxo de Vendas e Contratos, com consentimento e propostas externas versionadas. | A referência possui funil específico e mostra que crédito interfere no negócio urbano. | Não consultar CPF, criar score, enviar proposta a banco ou decidir crédito sem consentimento, integração aprovada e owner responsável. |
| `VU-P08` | Especializar **Financeiro Vendas Urbanas** para comissões e direitos por evento/condição, ligado ao subledger. | A referência apresenta lançamentos, mas não prova regras de comissão, conciliação ou split. | Percentual, previsão ou comissão parcelada não é pagamento/settlement automático. |

## 3. Decisões propostas para Locação

| Código | Decisão proposta | Justificativa prática | Limite obrigatório |
| --- | --- | --- | --- |
| `LC-P01` | Criar **Painel Locação** como primeira tela interna da coluna, com carteira, renovações, alertas de imóvel, serviço, vistoria, cobrança e repasse. | A referência usa dashboards/centrais para priorização operacional. | Painel só abre fatos autorizados; não baixa, repassa, altera contrato ou instrui cobrança. |
| `LC-P02` | Tornar **Clientes** ficha de Parte com papéis de interessado, locatário, coocupante, fiador, representante e contato de emergência, mais dossiê/garantias por contrato. | O cadastro visual observado é completo, mas não demonstra relação datada, finalidade ou garantia. | Parte não é automaticamente locatária/fiadora em todos os contratos; dossiê não é aprovação. |
| `LC-P03` | Evoluir **Imóveis e Proprietários** para Inventário e Administração, registrando autorização de administração separada de titularidade e contrato de locação. | O imóvel da referência tem estados, chaves, comissão e proprietário, mas o proprietário pode ficar ausente/inadequado no wizard. | Imóvel não fica publicável, locável ou disponível sem escopo de administração, autorização, restrição e estado explícitos. |
| `LC-P04` | Manter **Locação e Contratos** como setor próprio e separar `Administração`, `Locação`, `Garantia`, `Vistoria`, `Renovação`, `Aditivo`, `Rescisão` e `Desocupação` em objetos/estados relacionados. | A referência agrupa negócios e cobranças, enquanto o domínio exige obrigações e ciclos distintos. | Uma mudança no negócio não altera contrato, garantia, vistoria, carteira ou estoque automaticamente. |
| `LC-P05` | Criar **Manutenção e Prestadores** como setor próprio. | A referência oferece estados e vínculo com pagador/imóvel/contrato; é operação relevante e recorrente da locação. | Serviço, orçamento, aprovação, ordem, execução, pagamento, dedução, reembolso e repasse são fatos separados. |
| `LC-P06` | Tratar **Vistorias** como etapa obrigatória configurável dentro de Locação e Contratos, com laudo, ambiente/item, mídia privada, comparação, contestação e aceite. | A referência expõe rota, porém o fluxo não foi demonstrado; a ausência de prova não justifica omitir o domínio. | Foto/laudo não confirma culpa, cobrança, abatimento, indenização ou rescisão sem revisão. |
| `LC-P07` | Fasear **Sinistros e Garantias** como módulo posterior, preservando no núcleo o caso, vínculo, documento, responsável, prazo e restrição. | Há lista de sinistros sem dados de domínio demonstrados; o tema envolve seguros, garantias, disputa e efeitos financeiros sensíveis. | Caso não aciona seguradora, cobrança, prestador, pagamento ou repasse sem aprovação/instrumento. |
| `LC-P08` | Evoluir **Financeiro Locação** em quatro trilhas: carteira do locatário, caixa/conciliação, deduções/taxas e repasse/prestação de contas ao proprietário. | A referência separa visualmente cobrança e repasse, mas não demonstra reconciliação ou direito econômico. | Boleto, comprovante, recebível, aplicação de caixa, taxa, instrução, settlement e conciliação permanecem separados. |
| `LC-P09` | Manter **Área do Proprietário** como portal mínimo, e criar Área do Locatário somente quando houver grant, contrato e finalidade explícitos. | A referência inclui área de cliente no login, mas não demonstrou escopo de portal. | Portal não recebe carteira global, documento de terceiro, manutenção interna ou comando administrativo. |

## 4. Achados transversais que diferenciam o produto

| Código | Regra proposta | Evidência prática que a motiva |
| --- | --- | --- |
| `X-P01` | Implementar catálogo de campos e regras de qualidade antes de formulários extensos: obrigatoriedade por papel/etapa, máscara, validação de identificador, origem, revisão e histórico. | Cadastros sintéticos aceitaram dados claramente inválidos ou incompletos; uma tentativa de proprietário falhou com erro genérico. |
| `X-P02` | Separar `Parte`, `Papel`, `Relação`, `Dossiê`, `Ativo`, `Negócio`, `Contrato` e `Evento Financeiro`; permitir que a interface reuna a ficha sem perder objetos próprios. | A referência centraliza muitos contextos na mesma ficha/tela e reutiliza listas de cliente/proprietário. |
| `X-P03` | Aplicar segurança em profundidade a PII, documentos, chaves, dados bancários, observações confidenciais, mídia, iFrame/URL externa, exportação e ações em lote. | Listas e formulários exibem conteúdo amplo e comandos de massa; permissões observadas são principalmente CRUD visual. |
| `X-P04` | Projetar UX de central com tela inicial por coluna, ações prioritárias, filtros consistentes, link ao fato fonte e estados de `em análise`/`bloqueado`/`parcial`. | A referência demonstra produtividade por agrupamento visual, mas mistura conceitos e não torna os estados financeiros/jurídicos suficientemente explícitos. |
| `X-P05` | Tratar automação, IA de documento, importação, portal e integração financeira como comandos governados, com alçada, preview, idempotência, rollback e auditoria. | A referência oferece importação de planilha/contrato por IA e campos de geração/integração, sem controles demonstrados no recorte visual. |

## 5. Decisões necessárias do usuário

| Bloco | Decisão a confirmar |
| --- | --- |
| **Vendas Urbanas** | Aprovar ou ajustar `VU-P01` a `VU-P08`, sobretudo a criação da Central de Leads e Oportunidades como setor próprio e a posição de Visitas/Financiamento como subfluxos. |
| **Locação** | Aprovar ou ajustar `LC-P01` a `LC-P09`, sobretudo Painel Locação, Manutenção e Prestadores como setor próprio, Vistoria interna e Sinistros/Garantias faseado. |
| **Transversal** | Aprovar `X-P01` a `X-P05` como guardrails para as duas colunas. |

## Referências

[1] [Auditoria prática aprofundada do CRM de referência](auditoria_pratica_hincrivel.md)

[2] [Estratégia de Vendas Urbanas](estrategia_vendas_urbanas.md)

[3] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)
