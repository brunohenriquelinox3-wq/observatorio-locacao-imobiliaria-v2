# Arquitetura canônica de colunas e setores do CRM

**Status:** `substitui_rascunho_anterior_de_colunas`  
**Origem:** definição direta do usuário.  
**Regra de navegação:** as cinco colunas abaixo são a arquitetura principal de produto. Setores auxiliares, relatórios, documentos, marketing e configurações aparecem **dentro do contexto da coluna/módulo contratado**, e não como colunas genéricas concorrentes.

> **Princípio:** uma coluna organiza a jornada de trabalho; ela não concede acesso. A visibilidade depende de módulo contratado, organização, papel, escopo, vigência, permissão e estado da operação.

## 1. Árvore principal

| Coluna canônica | Destinatário | Finalidade |
| --- | --- | --- |
| **SUPER ADM** | Equipe da plataforma CRM. | Governar a plataforma e as organizações contratantes, sem acesso irrestrito aos dados operacionais de cada cliente. |
| **ADM** | Dono/administrador da imobiliária ou loteadora cliente. | Administrar a própria organização, seus módulos contratados, colaboradores e visão financeira autorizada. |
| **LOTEADORA** | Operação de loteamento/empreendimento. | Conectar estoque de lotes, parceiros, clientes, vendas, contratos, carteira e financeiro por empreendimento/loteamento. |
| **VENDAS URBANAS** | Operação de vendas de imóveis urbanos. | Conectar clientes, proprietários, imóveis, construtoras/empreendimentos, vendas e comissões. |
| **LOCAÇÃO** | Operação de administração e locação imobiliária. | Conectar cliente/locatário, proprietário, imóvel, administração, contrato de locação, carteira, cobrança, repasse e renovação. |

## 2. Coluna SUPER ADM

| Setor | Conteúdo definido | Limite obrigatório |
| --- | --- | --- |
| **Dashboard geral** | Visão de organizações contratantes, situação de módulos, saúde da plataforma, pendências operacionais e indicadores agregados permitidos. | Não exibe por padrão carteira, documentos, saldo, clientes finais ou financeiro detalhado de uma organização cliente. |
| **Clientes da plataforma** | Cadastro das imobiliárias, loteadoras, construtoras ou grupos que compraram/contrataram o CRM. | `Cliente da plataforma` é a organização contratante, não o comprador/locatário/proprietário final do cliente. |
| **Financeiro do Super Adm** | Recebíveis, pagáveis, contratos, planos, faturas e situação financeira **da plataforma CRM**. | É separado do financeiro da imobiliária/loteadora; não mistura dinheiro do SaaS com carteira do cliente. |
| **Colaboradores da empresa CRM** | Equipe interna da plataforma, papéis de plataforma, escopos, vigências, suporte controlado e auditoria. | Nenhum colaborador recebe acesso indiscriminado a tenants; suporte usa JIT, justificativa, MFA/step-up e trilha append-only. |
| **Módulos e contratos** | Quais módulos cada organização contratou, situação de habilitação e limites operacionais configurados. | Habilitar módulo não cria dados, não eleva papel e não substitui contrato/policy do tenant. |

## 3. Coluna ADM

| Setor | Conteúdo definido | Regra de exibição |
| --- | --- | --- |
| **Painel ADM** | Visão gerencial da própria imobiliária/loteadora: módulos ativos, pendências, alertas e recortes autorizados. | Mostra somente a organização atual e os módulos contratados/habilitados. |
| **Setores contratados** | Entradas para Loteadora, Vendas Urbanas, Locação e setores complementares aplicáveis ao contrato. | Se o cliente não contratou ou não tem permissão para um módulo, ele não é apresentado como capacidade ativa. |
| **Financeiro ADM** | Visão administrativa/gerencial autorizada da própria organização, com recorte dos módulos contratados. | Não confunde financeiro administrativo da organização com financeiro da plataforma Super Adm; detalhamento depende de alçada. |
| **Quadro de colaboradores** | Usuários, equipes, corretores, gestores, funções, alçadas, vigências, convites, suspensão e auditoria de acesso da organização. | ADM gerencia a própria equipe dentro do teto delegado; não cria privilégios de plataforma nem acesso a outra organização. |
| **Configurações operacionais** | Dados da organização, parâmetros autorizados, modelos, notificações e integrações do tenant. | Parâmetros críticos ficam versionados, com owner, revisão e alçada; não são campos livres que alteram passado. |

## 4. Coluna LOTEADORA

| Setor | Conteúdo definido pelo usuário | Relação principal |
| --- | --- | --- |
| **Cadastro de Loteamentos** | Glebas, empreendimentos, fases, quadras, lotes, unidades, parâmetros, evidências, registros, documentos e tabelas-base. | Cria e mantém a estrutura `gleba → empreendimento → fase → quadra → lote/unidade`; a quadra é a matriz dos lotes, identificados como `Qn · Ln` até `Qn · L100`, sem duplicar a operação diária do estoque. |
| **Estoque/Mapa de Lotes** | Mapa/espelho, disponibilidade, alocação, restrição, tabela vigente, hold, reserva, proposta, contrato e situação comercial do lote já cadastrado. | Opera os lotes estruturados por quadra (`Q12 · L1`, `Q12 · L2`); não recria gleba, fase, quadra ou lote e não altera sua identidade estrutural. |
| **Sócios e Parceiros** | Cadastro completo de sócios, parceiros, fazendeiros/proprietários da terra, permutantes, investidores, captadores, corretores, imobiliárias, credores/garantidores e beneficiários quando participantes do negócio; direitos por entrada/parcela/intermediária, grupos de participação e aportes de capital. | Uma mesma parte pode ter vários vínculos independentes; cada negociação possui instrumento, objeto, modalidade, base econômica, vigência, condição, aprovação, documento e histórico próprios. Direito percentual/fixo é datado e versionado; grupo e painel só compartilham o escopo expressamente contratado e recebem dados apenas dos setores fonte autorizados. |
| **Clientes Loteadora** | Cadastro completo de proponentes, compradores, coadquirentes, representantes e empresas envolvidas na compra; ficha única, dossiê documental/fotográfico e histórico. | Uma mesma pessoa/empresa pode aparecer em vários contratos e papéis sem duplicar cadastro; CPF/CNPJ é buscado sob policy, e evidências reutilizáveis mantêm estado, validade, revisão, finalidade e versão. |
| **Propostas, Reservas e Contratos** | Jornada única de proposta versionada, reserva com prazo, venda, contrato, pós-venda e lente de contratos realizados por lote. | Proposta, reserva, contrato, lote, dossiê e carteira mantêm estados próprios; somente transação/policy cria ou converte reserva, impede concorrência incompatível e reavalia vencimento antes de liberar elegibilidade. |
| **Financeiro Loteadora** | Boletos/instruções após contrato, recebíveis, pagáveis, parcelas pagas/em atraso, alertas, comprovantes, carteira e filtros por empreendimento/loteamento. | Boleto é instrução/cobrança, não confirmação de caixa; pagamento, retorno, settlement e conciliação permanecem distintos. |
| **Busca financeira e de clientes** | Busca por CPF/CNPJ, proponente principal, coadquirentes, empreendimento, loteamento, lote, contrato e carteira. | Busca usa índice/policy e respeita escopo; CPF/CNPJ é dado protegido e nunca é liberado só porque existe filtro. |

## 5. Coluna VENDAS URBANAS

| Setor | Conteúdo definido pelo usuário | Relação principal |
| --- | --- | --- |
| **Clientes** | Pessoas e empresas interessadas, compradores, proponentes e coadquirentes. | Parte única com papéis datados; cliente pode tornar-se comprador em um contrato sem novo cadastro. |
| **Imóveis e proprietários** | Cadastro dos imóveis urbanos, de lote a kitnet, e cadastro/ligação de seus proprietários. | Imóvel e proprietário são objetos diferentes; titularidade, captação e autorização têm evidência própria. |
| **Empreendimentos de construtoras** | Construtora, seus dados, empreendimentos, torres, condomínios, unidades e correspondentes autorizados. | Construtora, empreendimento, torre e unidade possuem identidades e relações próprias; correspondente é papel autorizado e revisável. |
| **Vendas e contratos** | Propostas, reservas quando aplicáveis, venda, documentação, contrato e pós-venda comercial. | A venda conecta partes, imóvel/unidade, condição, corretor/parceiro, versão e evidências; não cria recebimento confirmado. |
| **Financeiro Vendas Urbanas** | Comissões, comissões parceladas, calendários, direitos de corretor, imobiliária, sócios e parceiros. | Cada recebedor tem direito datado, base, gatilho, prioridade, teto e evidência; percentual não é pagamento automático. |

## 6. Coluna LOCAÇÃO

| Setor | Conteúdo definido pelo usuário | Relação principal |
| --- | --- | --- |
| **Clientes** | Cadastro de locatários/clientes, preparado para espelhar dados autorizados na área do cliente. | Área do cliente é portal separado, com consentimento, escopo e dados mínimos; não espelha informação irrestrita. |
| **Imóveis e proprietários** | Cadastro de imóveis e de proprietários, vinculando o imóvel ao proprietário desde o cadastro. | Relação de propriedade/administração é datada, documentada e distinta do contrato de locação. |
| **Locação e contratos** | Processo de administração do imóvel e contrato de locação, unindo clientes, estoque/imóvel e proprietários; administração pode ter prazo próprio (ex.: 36 meses) e locação possui prazo negociado. | `Administração` e `locação` são dois contratos/obrigações relacionados, não um campo de duração único. |
| **Financeiro Locação** | Boletos/instruções após finalização da locação, parcelas pagas, atrasos, alertas, comprovantes, cobrança, inadimplência, renovação e controles financeiros. | Cobrança, caixa, dedução, taxa, repasse ao proprietário e garantia possuem natureza/estado próprio; comprovante não encerra conciliação. |
| **Área do proprietário** | Dados autorizados de imóvel, contratos, prestação de contas e ocorrências aplicáveis ao proprietário. | Portal do proprietário é mínimo por finalidade e não expõe outros imóveis, clientes, contas ou dados internos sem autorização. |

## 7. Objetos compartilhados que ligam as colunas

| Objeto compartilhado | Usado em | Regra de integridade |
| --- | --- | --- |
| **Parte** (pessoa física ou jurídica) | Todas as colunas operacionais. | Uma parte recebe papéis datados: cliente, comprador, proponente, coadquirente, proprietário, locatário, sócio, parceiro, corretor, construtora etc. |
| **Ativo/estoque** | Loteadora, Vendas Urbanas e Locação. | Gleba/lote, imóvel urbano, torre/unidade e imóvel locável preservam modalidade, origem, disponibilidade e evidência sem se tornarem o mesmo objeto. |
| **Contrato** | Loteadora, Vendas Urbanas e Locação. | Venda de lote, venda urbana, administração e locação têm ciclos/estados próprios, porém compartilham versões, partes, evidências e alçadas. |
| **Financeiro/subledger** | Financeiro ADM e os três módulos operacionais. | Receivable, Payable, entitlement, instrução, retorno, settlement, cash application e conciliação não se misturam; cada coluna projeta somente seu recorte permitido. |
| **Evidência** | Todas as colunas. | Documento, certidão, contrato, comprovante, regra ou revisão possuem fonte, versão, finalidade, acesso e owner; anexar não significa aprovar. |
| **Contrato realizado por lote** | Loteadora. | É uma lente de Vendas e Contratos que conecta `Qn · Ln`, venda, contrato, compradores, dossiê e carteira; não é um segundo cadastro de estoque nem permite liberar/alocar lote por edição visual. |
| **Reserva de lote** | Loteadora. | É etapa da jornada Propostas, Reservas e Contratos, com proposta, prazo, alçada, owner, evidência, idempotência e estado; o Estoque/Mapa conserva a autoridade sobre elegibilidade e situação comercial. |

### 7.1 Transparência de parceiros e grupos contratados

| Superfície | Pode apresentar | Não concede |
| --- | --- | --- |
| **Painel do parceiro** | Ganhos realizados/projetados, direitos em análise/bloqueados, contratos, parcelas/boletos, cobranças/carteira, lotes e adimplência/inadimplência vinculados ao seu contrato ou grupo autorizado; login abre diretamente o contexto válido. | Baixa de cobrança, alteração de lote, contrato, regra de direito, cadastro de terceiro, alçada ou configuração administrativa. |
| **Grupo de Participação** | Visão compartilhada de glebas, lotes, contratos, clientes e recebimentos **somente** quando esses objetos foram unidos no instrumento do grupo. | Acesso aos vínculos individuais de membros ou de terceiros que não integram o escopo comum. |
| **Painel de investidor** | Compromisso de capital, cronograma, condição, comprovantes permitidos, estado de conciliação e eventual direito econômico expressamente conectado. | Inferência de participação eficaz, distribuição de receitas ou acesso a cap table/carteira fora do contrato. |

## 8. Separações que a arquitetura não pode perder

| Separação | Regra |
| --- | --- |
| **Super Adm × ADM** | Super Adm administra a plataforma e organizações contratantes; ADM administra somente sua organização e módulos próprios. |
| **Financeiro da plataforma × Financeiro do cliente** | Faturas/receita/custos do SaaS nunca se misturam com recebíveis, pagáveis, boletos, comissões ou repasses da imobiliária/loteadora. |
| **Loteadora × Vendas Urbanas** | Ambas vendem, mas loteadora opera empreendimento/estoque/origem/parceiro; vendas urbanas opera imóvel/proprietário/construtora/unidade urbana. |
| **Administração de imóvel × Locação** | Prazo e obrigações do contrato com proprietário podem divergir do prazo e obrigações do contrato com locatário. |
| **Boleto/instrução × pagamento confirmado** | Emitir/espelhar boleto não confirma recebimento; confirmação exige retorno, evidência, conciliação e tratamento de exceção. |
| **Direito econômico × acesso de portal** | Direito contratual e grant de portal são relações independentes; ambos exigem escopo, vigência e auditoria. |
| **Aporte × titularidade × distribuição** | Compromisso de capital, caixa conciliado, efeito societário e direito econômico posterior possuem estados, evidências e owners distintos. |
| **Login × escopo de painel** | Autenticação identifica a pessoa; Grant de Portal ativo, contexto, vigência e policy determinam a visão individual/grupo. E-mail, URL, filtro ou papel exibido não liberam dados. |

## 9. Próximo passo

Esta árvore substitui o modelo anterior de colunas na estratégia. A etapa seguinte confrontará seus vínculos com contratos por módulo, RLS, alçadas, subledger, busca por CPF/CNPJ, portais e evidências, preservando que nenhuma coluna ou filtro concede acesso por si só.
