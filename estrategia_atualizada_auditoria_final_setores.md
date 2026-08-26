# Estratégia atualizada — auditoria final das colunas e setores

**Versão de revisão:** arquitetura canônica de cinco colunas.  
**Objetivo deste documento:** permitir que você revise a estrutura do CRM de forma simples antes de qualquer nova construção. Use as marcações **manter**, **remover**, **renomear**, **unir** ou **adicionar** para me devolver suas correções.

> **A estrutura principal do CRM passa a ser:** **SUPER ADM**, **ADM**, **LOTEADORA**, **VENDAS URBANAS** e **LOCAÇÃO**. As antigas ideias de colunas genéricas deixam de ser o modelo principal. Relatórios, documentos, marketing, configurações e automações aparecem dentro da coluna e do módulo a que pertencem.

> **Hierarquia obrigatória:** o **SUPER ADM** é a autoridade máxima de toda a plataforma CRM. O **ADM** vem abaixo dele e é a autoridade máxima somente dentro da empresa cliente que contratou o sistema. Abaixo do ADM ficam os responsáveis por módulo e colaboradores; abaixo deles, os portais mínimos de cliente e proprietário.

## 1. Mapa geral da estratégia

| Coluna | Quem usa | O que controla | O que não controla automaticamente |
| --- | --- | --- | --- |
| **SUPER ADM** | Equipe da empresa dona da plataforma; autoridade máxima do CRM. | Organizações clientes, módulos contratados, financeiro da plataforma, colaboradores internos e segurança de plataforma. | Dados internos, clientes finais, contratos, carteiras ou saldos de cada imobiliária/loteadora sem suporte controlado, escopo e auditoria. |
| **ADM** | Dono ou administrador da empresa cliente; subordinado ao SUPER ADM na cadeia da plataforma. | Sua empresa, módulos contratados, colaboradores, permissões internas, parâmetros e visão administrativa autorizada. | Outra empresa cliente, plataforma, contrato SaaS, módulo não contratado ou acesso financeiro sem alçada. |
| **LOTEADORA** | Empresa que vende empreendimentos, lotes e unidades de loteamento. | Estoque, loteamentos, parceiros, clientes, vendas, contratos, carteira e financeiro de loteadora. | Venda de lote bloqueado, baixa financeira manual ou repasse sem regra/evidência. |
| **VENDAS URBANAS** | Imobiliária que vende imóveis urbanos. | Clientes, proprietários, imóveis, construtoras, vendas, contratos e comissões. | Venda sem autorização do proprietário, comissão sem regra ou recebimento presumido. |
| **LOCAÇÃO** | Imobiliária que administra e loca imóveis. | Clientes/locatários, proprietários, imóveis, administração, locação, cobrança, carteira, repasse e renovação. | Misturar contrato de administração com contrato de locação ou considerar boleto como pagamento confirmado. |

## 2. Coluna SUPER ADM

Esta coluna é exclusiva da empresa que opera a plataforma CRM. O termo **cliente** nesta coluna significa a imobiliária, loteadora, construtora ou grupo que contratou o sistema — e não o comprador, locatário ou proprietário cadastrado por esse cliente.

| Setor | O que deve existir | Auditoria final: o que você pode ajustar |
| --- | --- | --- |
| **Dashboard geral do Super Adm** | Quantidade de clientes contratantes, módulos ativos, situação operacional da plataforma, pendências de suporte e indicadores agregados permitidos. | Quais indicadores gerais da plataforma você quer ver logo na primeira tela? |
| **Clientes da plataforma** | Cadastro das empresas que compraram o CRM: razão social, CNPJ, contatos, contrato/plano, módulos, situação e responsáveis. | O nome ideal é “Clientes da Plataforma”, “Empresas Clientes” ou outro? |
| **Financeiro do Super Adm** | Financeiro da empresa do CRM: planos, faturas, recebimentos do SaaS, custos/pagáveis autorizados e situação comercial de cada contrato. | Quais controles de cobrança da plataforma devem entrar neste setor? |
| **Colaboradores da empresa CRM** | Equipe interna: administrativo, suporte, comercial, implantação, produto e demais funções internas. | Quais funções internas devem aparecer desde o início? |
| **Módulos e contratos** | Quais módulos cada empresa contratou: ADM, Loteadora, Vendas Urbanas, Locação e futuras extensões. | Os módulos devem ser por plano, por quantidade de usuários, por empreendimento ou por outro modelo comercial? |
| **Segurança e auditoria** | Logs, suporte controlado, revisões de acesso e configurações de plataforma. | Este setor deve aparecer explicitamente na coluna ou ficar dentro de Configurações Super Adm? |

> **Limite obrigatório:** Super Adm não é acesso livre aos dados de todas as empresas. Para acessar um tenant em suporte, haverá escopo, justificativa, vigência, MFA e auditoria. Esse ponto não deve ser removido da estratégia.

## 3. Coluna ADM

Esta é a área do dono/administrador de cada imobiliária ou loteadora que contratou o CRM. Ela mostra somente os módulos que a empresa adquiriu e para os quais o usuário possui permissão.

| Setor | O que deve existir | Auditoria final: o que você pode ajustar |
| --- | --- | --- |
| **Painel ADM** | Resumo da empresa: módulos ativos, alertas, pendências, tarefas de gestão e indicadores autorizados. | Quais alertas são indispensáveis para o dono da empresa? |
| **Setores contratados** | Acesso aos módulos Loteadora, Vendas Urbanas e Locação conforme o contrato da empresa. | Há outro módulo principal que deve ser contratado junto desde o início? |
| **Financeiro ADM** | Visão administrativa do financeiro da própria empresa, com recorte por módulo, empresa/SPE, período e alçada. | Este setor deve mostrar apenas visão gerencial ou também permitir aprovações financeiras? |
| **Quadro de colaboradores** | Usuários, equipes, corretores, gestores, funções, alçadas, convites, suspensão e histórico de acesso. | Quais cargos padrão devem ser criados para cada tipo de empresa? |
| **Configurações da empresa** | Dados da empresa, modelos autorizados, notificações, integrações e parâmetros operacionais. | Quais configurações precisam ficar visíveis para ADM e quais devem ficar restritas? |
| **Relatórios da empresa** | Painéis e relatórios consolidados dos módulos contratados. | Deve ser um setor próprio no ADM ou apenas um atalho dentro de cada módulo? |

> **Regra:** contratar um módulo não dá acesso automático a todos os colaboradores. Cada pessoa precisa de função, escopo e alçada dentro da própria empresa.

## 4. Coluna LOTEADORA

Esta é a coluna central para empresas que trabalham com glebas, empreendimentos, fases, quadras, lotes, parceiros, vendas parceladas, carteira e repasses. Ela deve tratar loteadora como domínio próprio, e não como simples catálogo de imóveis.

| Setor | O que deve existir | Ligação obrigatória | Auditoria final: o que você pode ajustar |
| --- | --- | --- | --- |
| **Cadastro de Loteamentos** | Glebas, empreendimentos, fases, quadras, lotes, unidades, parâmetros, documentos, evidências, registros e tabelas-base. | Gleba → empreendimento → fase → quadra → lote/unidade. | **Decisão aprovada:** este é o setor de criação e estrutura do loteamento. |
| **Estoque/Mapa de Lotes** | Mapa/espelho, lote já cadastrado, tabela vigente, disponibilidade, reserva, proposta, contrato, bloqueio, alocação e restrições. | Lote cadastrado → situação operacional diária. | **Decisão aprovada:** este é o setor de operação diária do estoque, sem recriar o cadastro. |
| **Sócios e Parceiros** | Cadastro completo de sócios, parceiros, fazendeiros/proprietários da terra, permutantes, investidores, captadores, corretores, imobiliárias, credores/garantidores e beneficiários; direitos por entrada/parcela/intermediária, grupos de participação, painéis e aportes de capital. | Cada contrato/negociação cria vínculo próprio: pessoa/PJ + modalidade + instrumento + objeto + base + condição + vigência + documentos + histórico. | **Decisão aprovada:** manter o nome `Sócios e Parceiros`; direitos são datados/versionados, grupos só compartilham escopo contratado e painel de parceiro é mínimo por finalidade. |
| **Clientes** | Proponentes, compradores, coadquirentes, representantes e empresas compradoras. | Uma parte pode estar em vários contratos e ter mais de um papel. | Quais campos de cliente são obrigatórios antes de iniciar uma proposta? |
| **Vendas e contratos** | Proposta, reserva, escolha de lote, tabela, venda, documentação, contrato e pós-venda comercial. | Estoque elegível + cliente(s) + condição + contrato. | Reserva deve ser um setor separado ou uma etapa dentro de Vendas? |
| **Financeiro Loteadora** | Boletos/instruções, parcelas, recebíveis, pagáveis, carteira, atrasos, alertas, comprovantes, acordos e filtros por empreendimento/loteamento. | Contrato → parcela/instrução → retorno → conciliação → carteira. | Quais telas financeiras precisam existir primeiro: carteira, cobrança, baixa, acordo, repasse ou relatórios? |
| **Comissões, direitos e repasses** | Direitos de corretores, imobiliária, sócios, parceiros e permutantes, por entrada, parcela regular, intermediária ou outro evento contratual, em valor fixo, percentual ou regra híbrida. | Direito datado/versionado + evento + base + gatilho + prioridade + recebedor/grupo + evidência. | Deve aparecer dentro de Financeiro ou como setor próprio chamado “Repasses e Distribuição”? |
| **Obras e infraestrutura** | Cronograma, pendências, marcos, evidências e vínculo com empreendimento. | Empreendimento/fase + owner técnico + evidência. | Deve entrar desde o início da Loteadora ou ser módulo futuro? |
| **Relatórios de loteadora** | Estoque, vendas, carteira, inadimplência, recebíveis, parceiros e desempenho por empreendimento. | Recorte por empresa, empreendimento, loteamento, fase e lote. | Quais relatórios são obrigatórios para a diretoria da loteadora? |

### Convenção aprovada de Quadras e Lotes

Cada **Quadra** é a matriz dos seus lotes. A estrutura será exibida como `Q12 · L1`, `Q12 · L2` e assim sucessivamente, até `Q12 · L100` quando a quadra possuir cem lotes. O Cadastro de Loteamentos cria essa estrutura; o Estoque/Mapa trabalha a situação comercial do mesmo lote, sem duplicar o registro.

### Financeiro da Loteadora: regra central

O setor financeiro é o coração operacional da loteadora. Após a finalização do contrato, as parcelas e instruções de cobrança ficam ligadas à carteira. O sistema deve permitir localizar rapidamente uma compra por **CPF/CNPJ**, **proponente principal**, **coadquirente**, **empreendimento**, **loteamento**, **lote**, **contrato** ou **parcela**.

No entanto, o CRM não pode afirmar que boleto emitido é boleto pago. A sequência correta é:

> **Contrato → parcela/cobrança → instrução/boleto → retorno ou comprovante → aplicação de caixa → conciliação → estado da carteira.**

### Transparência contratual de Sócios e Parceiros

O parceiro acompanha no painel somente o seu vínculo individual ou o grupo contratual do qual participa. A visão autorizada recebe dados dos setores de contratos, parcelas/boletos, cobranças/carteira, estoque/Mapa de Lotes e direitos/repasses; mostra ganhos realizados e projeções futuras, lotes ainda disponíveis/vendidos e clientes adimplentes/inadimplentes vinculados ao direito econômico. O painel não permite baixar cobrança, editar lote, alterar contrato, mudar regra, aprovar repasse ou administrar usuários. Um grupo de participação só existe por instrumento: se dois parceiros unificam glebas e recebimentos, ambos veem o mesmo pool contratado; os demais permanecem isolados.

No login, a identidade é verificada primeiro. Depois, um **Grant de Portal** ativo decide o contexto individual ou de grupo e direciona a pessoa diretamente à sua visualização; se houver mais de um contexto permitido, ela escolhe em uma lista limitada aos seus próprios acessos. E-mail, nome, URL, filtro ou código de contrato/lote não concedem acesso. Grant expirado, revogado ou sessão inválida não exibe histórico de terceiros nem confirma que o objeto solicitado existe.

Quando um investidor realiza aporte inicial e aportes futuros, o CRM registra compromisso, cronograma, condições, comprovantes, conciliação e eventual evento de titularidade como objetos separados. Aporte conciliado não cria sozinho direito sobre entradas, parcelas, intermediárias ou resultado do loteamento.

## 5. Coluna VENDAS URBANAS

Esta coluna atende venda de imóveis urbanos, desde lote urbano e casa até kitnet, apartamento, torre, condomínio e empreendimento de construtora.

| Setor | O que deve existir | Ligação obrigatória | Auditoria final: o que você pode ajustar |
| --- | --- | --- | --- |
| **Clientes** | Interessados, compradores, proponentes, coadquirentes e empresas. | Parte única + papéis por proposta/contrato. | Deve manter o mesmo cadastro de cliente usado pela Loteadora e Locação? A estratégia atual diz que sim. |
| **Imóveis e proprietários** | Imóveis urbanos, proprietários, captação, documentos, autorização, características, fotos e disponibilidade. | Imóvel ≠ proprietário; vínculo de titularidade/captação é documentado. | Você quer separar “Imóveis” e “Proprietários” visualmente? |
| **Empreendimentos de construtoras** | Construtoras, empreendimentos, torres, condomínios, unidades e correspondentes autorizados. | Construtora → empreendimento → torre/bloco → unidade. | O correspondente autorizado deve ficar dentro de Construtora ou em um setor de Parceiros? |
| **Vendas e contratos** | Propostas, condições, reservas quando aplicáveis, documentação, venda, contrato e pós-venda. | Cliente(s) + imóvel/unidade + proprietário/construtora + condição + contrato. | Quais documentos devem ser obrigatórios antes de permitir contrato? |
| **Financeiro e comissões** | Comissões fixas/percentuais, parceladas ou por calendário; direitos de corretor, imobiliária, sócios e parceiros. | Regra de comissão + gatilho + base + calendário + recebedor. | “Financeiro e Comissões” deve ficar junto ou ser dividido em dois setores? |
| **Relatórios de Vendas Urbanas** | Captação, carteira de imóveis, funil, vendas, comissão, desempenho de corretores e construtoras. | Filtros por origem, imóvel, corretor, construtora e período. | Quais relatórios devem ser obrigatórios para o gestor comercial? |

> **Regra:** comissão pode ser parcelada, mas um percentual cadastrado não é pagamento automático. Cada direito precisa saber a base, o gatilho, o calendário, o recebedor, a prioridade e o que acontece em distrato ou reversão.

## 6. Coluna LOCAÇÃO

Esta coluna atende tanto a gestão do imóvel para o proprietário quanto a locação para o cliente/locatário. São relações conectadas, porém não são o mesmo contrato.

| Setor | O que deve existir | Ligação obrigatória | Auditoria final: o que você pode ajustar |
| --- | --- | --- | --- |
| **Clientes/locatários** | Cadastro de clientes, locatários, proponentes, documentos e informações autorizadas para a área do cliente. | Parte + papel de locatário/proponente + contrato. | Você prefere o nome “Clientes”, “Locatários” ou “Clientes e Locatários”? |
| **Imóveis e proprietários** | Cadastro de imóveis, proprietários, documentação, vínculo de administração e disponibilidade de locação. | Imóvel + proprietário + contrato de administração quando aplicável. | Deve separar “Imóveis” e “Proprietários” como em Vendas Urbanas? |
| **Administração de imóveis** | Contrato com o proprietário, prazo de administração, taxas, obrigações, regras de repasse e prestação de contas. | Proprietário + imóvel + contrato de administração. | Este setor deve ficar separado de “Locação e Contratos”? A estratégia recomenda que sim. |
| **Locação e contratos** | Proposta de locação, condições, contrato de locação, garantias, vistorias, ocupação, renovação e desocupação. | Locatário + imóvel + contrato de locação + garantias/condições. | Quais garantias precisam estar na primeira versão: caução, fiador, seguro-fiança, título de capitalização e outras? |
| **Financeiro Locação** | Cobrança, parcelas, atrasos, alertas, comprovantes, inadimplência, acordo, reajuste, controle de carteira e repasses. | Contrato → cobrança → retorno → conciliação → repasse/prestação de contas. | Quais controles precisam entrar primeiro: inadimplência, cobrança, acordo, repasse, reajuste ou renovação? |
| **Área do cliente** | Dados mínimos autorizados de contrato, cobranças, documentos e solicitações. | Portal por finalidade e por contrato. | O que o locatário deve poder ver, baixar, solicitar ou pagar? |
| **Área do proprietário** | Imóveis, contratos, prestação de contas, repasses, documentos e ocorrências autorizadas. | Portal por imóvel/contrato de administração. | O que o proprietário deve poder acompanhar ou aprovar? |
| **Relatórios de Locação** | Ocupação, contratos próximos de vencer, inadimplência, carteira, repasses, manutenção e renovação. | Recorte por carteira, proprietário, imóvel, período e responsável. | Quais alertas precisam aparecer diariamente para a equipe? |

### Separação obrigatória na Locação

| Não misturar | Motivo |
| --- | --- |
| **Contrato de administração** e **contrato de locação** | O contrato com proprietário pode ter prazo, taxa e obrigações diferentes do contrato com locatário. |
| **Cobrança/boleto** e **pagamento conciliado** | Uma cobrança pode existir, estar atrasada, ser negociada ou ter comprovante sem ainda estar conciliada. |
| **Área interna** e **portal do cliente/proprietário** | Portais mostram apenas o mínimo necessário para cada pessoa; não espelham toda a operação interna. |

## 7. Estruturas compartilhadas entre as três operações

| Estrutura | Loteadora | Vendas Urbanas | Locação |
| --- | --- | --- | --- |
| **Cadastro de pessoas e empresas** | Comprador, proponente, coadquirente, sócio, parceiro, fazendeiro/permutante. | Interessado, comprador, proprietário, corretor, construtora. | Locatário, proprietário, garantidor, prestador. |
| **Ativo/estoque** | Gleba, fase, quadra, lote, unidade. | Imóvel urbano, torre, condomínio, unidade. | Imóvel administrado, imóvel disponível, imóvel locado. |
| **Contrato** | Venda de lote/unidade e instrumentos de parceria. | Venda urbana e documentos comerciais. | Administração e locação. |
| **Financeiro** | Parcelas, carteira, recebíveis, pagáveis, direitos e repasses. | Comissões, calendários, recebíveis e direitos. | Cobrança, carteira, taxa, dedução, repasse e prestação de contas. |
| **Documentos/evidências** | Registro, mapa, contrato, parceiro, comprovante. | Propriedade, captação, construtora, venda, comissão. | Propriedade, administração, locação, garantia, vistoria e comprovante. |

## 8. Regras que não podem ser removidas na auditoria

| Regra | Motivo |
| --- | --- |
| Super Adm é a autoridade máxima da plataforma, mas não possui acesso irrestrito/invisível. | Administração privilegiada exige MFA, menor privilégio, escopo, vigência, justificativa, JIT/break-glass e auditoria; os dados do cliente permanecem protegidos. |
| Módulo contratado não é permissão de usuário. | A empresa pode contratar Loteadora, mas cada colaborador ainda recebe somente o acesso necessário. |
| Cliente, proprietário, parceiro e corretor usam cadastro único com papéis diferentes. | Evita duplicidade e conserva a história de cada relação. |
| Estoque não é apenas status manual. | Lote ou imóvel pode estar restrito, reservado, contratado, alocado ou indisponível por motivo documentado. |
| Boleto não é pagamento. | A operação precisa de retorno, aplicação e conciliação para confirmar o caixa. |
| Comissão, repasse e sociedade não são a mesma coisa. | Cada direito econômico tem base, condição, prioridade, vigência e tratamento próprio. |
| Portais são mínimos por finalidade. | Cliente, proprietário e parceiro veem somente o que lhes é autorizado; painel externo não concede poder operacional interno. |
| Login não é autorização de objeto. | Após autenticação, grant, escopo, vigência, finalidade e policy precisam permitir cada contrato, parcela, cobrança, lote, cliente e documento exibido. |

## 9. Checklist para sua auditoria final

Preencha ou responda pela conversa usando esta estrutura. Você pode simplesmente escrever “manter”, “remover”, “renomear”, “unir” ou “adicionar” ao lado de cada item.

| Coluna | Manter | Remover | Renomear | Unir | Adicionar | Observação sua |
| --- | --- | --- | --- | --- | --- |
| SUPER ADM |  |  |  |  |  |  |
| ADM |  |  |  |  |  |  |
| LOTEADORA |  |  |  |  |  |  |
| VENDAS URBANAS |  |  |  |  |  |  |
| LOCAÇÃO |  |  |  |  |  |  |

### Pontos específicos para você decidir

| Tema | Decisão que preciso da sua auditoria |
| --- | --- |
| Financeiro de Loteadora | Fica tudo em “Financeiro Loteadora” ou cria também “Repasses e Distribuição”? |
| Estoque de Loteadora | “Cadastro de Loteamentos” e “Estoque de Lotes” ficam juntos ou separados? |
| Obras | Obras/infraestrutura entram já como setor de Loteadora ou ficam como módulo futuro? |
| Vendas Urbanas | “Imóveis e Proprietários” e “Financeiro e Comissões” ficam juntos ou separados? |
| Locação | “Administração de Imóveis” fica separado de “Locação e Contratos”? A recomendação atual é manter separado. |
| Portais | Área do Cliente e Área do Proprietário entram já no primeiro lançamento ou em fase posterior? |
| Relatórios | Cada coluna terá seu setor de relatórios ou os relatórios ficarão apenas dentro do ADM? |
| Marketing/portais imobiliários | Entram dentro de Vendas Urbanas/Locação ou merecem um módulo comercial futuro próprio? |

## 10. Estado atual da estratégia

A arquitetura de colunas foi atualizada na estratégia, no backlog e no observatório. Ela está pronta para a sua auditoria de setores, mas **não ativou** usuários, módulos reais, boletos, contratos, portais, integrações bancárias, dados de clientes ou poderes administrativos. Esses itens continuam dependentes de etapas específicas, testes e sua aprovação.

Esta estrutura foi desenhada para **explorar os dados de forma mais intuitiva**, **entender melhor as tendências** e **salvar ou compartilhar facilmente**, sem perder segurança, contexto ou separação financeira.

## Referências internas

[1] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)

[2] [Confronto de contratos, papéis, estoque e financeiro](crm_arquitetura_colunas_setores_confronto.md)

[3] [Consolidação de módulos, owners e critérios de aceite](crm_arquitetura_colunas_setores_consolidacao.md)
