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
| **Cadastro de loteamentos e estoque** | Glebas, empreendimentos, fases, quadras, lotes, unidades, mapa/espelho, disponibilidade, alocação, restrição, tabelas e estoque. | `gleba → empreendimento → fase → quadra → lote/unidade`; disponibilidade é projeção de registro, alocação, restrição e compromisso. |
| **Sócios e parceiros** | Sócios, parceiros e fazendeiros/proprietários da terra quando participantes do negócio. | Uma parte pode ter papel de proprietário da terra, permutante, parceiro, sócio ou beneficiário; cada vínculo possui instrumento, objeto, vigência e condição. |
| **Clientes** | Cadastro de proponentes, compradores, coadquirentes, representantes e empresas envolvidas na compra. | Uma mesma pessoa/empresa pode aparecer em vários contratos e papéis sem duplicar cadastro. |
| **Vendas e contratos** | Ligação entre estoque de lote, cliente(s), proposta, reserva, venda e novo contrato. | Um lote só avança se estiver elegível; contrato preserva versão de tabela, partes, condição, evidência e alçada. |
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

## 8. Separações que a arquitetura não pode perder

| Separação | Regra |
| --- | --- |
| **Super Adm × ADM** | Super Adm administra a plataforma e organizações contratantes; ADM administra somente sua organização e módulos próprios. |
| **Financeiro da plataforma × Financeiro do cliente** | Faturas/receita/custos do SaaS nunca se misturam com recebíveis, pagáveis, boletos, comissões ou repasses da imobiliária/loteadora. |
| **Loteadora × Vendas Urbanas** | Ambas vendem, mas loteadora opera empreendimento/estoque/origem/parceiro; vendas urbanas opera imóvel/proprietário/construtora/unidade urbana. |
| **Administração de imóvel × Locação** | Prazo e obrigações do contrato com proprietário podem divergir do prazo e obrigações do contrato com locatário. |
| **Boleto/instrução × pagamento confirmado** | Emitir/espelhar boleto não confirma recebimento; confirmação exige retorno, evidência, conciliação e tratamento de exceção. |

## 9. Próximo passo

Esta árvore substitui o modelo anterior de colunas na estratégia. A etapa seguinte confrontará seus vínculos com contratos por módulo, RLS, alçadas, subledger, busca por CPF/CNPJ, portais e evidências, preservando que nenhuma coluna ou filtro concede acesso por si só.
