# Estratégia preservativa — Clientes Loteadora (A279)

> **Decisão de escopo.** Esta estratégia inicia o cadastro estruturado, minimizado e documentalmente pronto de Clientes Loteadora. Ela não cria venda, reserva, proposta, crédito, score, financiamento, contrato, escritura, registro, cobrança, pagamento, repasse, comunicação regulatória ou integração externa.

## 1. Objetivo e premissas

O setor atual já vincula um comprador ao núcleo canônico de `Party` e ao respectivo papel temporal, permitindo uma intenção privada de anexo e uma leitura agregada de prontidão. A evolução não pode duplicar a pessoa, substituir esse vínculo, alterar a matriz física de Loteamentos ou transformar o cadastro em jornada comercial. A proposta é acrescentar uma camada privada de **perfil cadastral de cliente**, exclusiva do contexto Loteadora e ligada ao `buyerClient` existente.

O ganho esperado é tornar o atendimento mais organizado e progressivo: o operador poderá **explorar os dados de forma mais intuitiva**, **entender melhor as tendências** de pendências agregadas e **salvar ou compartilhar facilmente** apenas resumos redigidos já autorizados. Nenhum desses ganhos autoriza o compartilhamento de dados pessoais, documentos, identificadores ou decisões individuais.

Esta é uma decisão de produto informada por fontes institucionais. Não substitui avaliação jurídica individual, validação de controlador/encarregado, política interna de retenção, nem definição de exigências de cartório, instituição financeira ou contrato.

## 2. Estudo consolidado e decisão de produto

As fontes públicas consultadas distinguem tratamento cadastral, obrigações relacionadas a transações, serviços registrais e bases legais de proteção de dados. A LGPD exige finalidade determinada, adequação, necessidade, transparência, segurança, prevenção, não discriminação e prestação de contas; consentimento, quando necessário, não pode ser genérico e deve ser revogável [1]. As orientações setoriais de COFECI e CRECI tratam identificação e manutenção de registros no contexto das transações imobiliárias e de prevenção a ilícitos, sem converter o simples cadastro de interesse em operação comercial [2] [3].

As referências de registros públicos e do CNJ se destinam aos atos notariais e registrais; portanto, devem orientar **gatilhos futuros de prontidão** e não ser reproduzidas como se o CRM realizasse qualificação registral [4] [5]. Da mesma forma, a situação cadastral de CPF ou CNPJ não é avaliação de crédito, e não haverá consulta, integração ou interpretação automática nesta atualização [6] [7]. Uma palestra institucional do COFECI foi usada apenas como contexto prático e foi confrontada com as fontes normativas; ela não é fundamento autônomo para regra sistêmica [8].

| Decisão | Fundamentação de produto | Limite preservado |
|---|---|---|
| Cadastro em camadas | Evita antecipar identificação extensa e documentos antes de haver finalidade concreta. | Não há pré-análise de crédito ou coleta financeira. |
| Perfil complementar 1:1 | Mantém `Party` como núcleo reutilizável e concentra a especialização no setor correto. | Não duplica pessoa, papel temporal ou cliente comprador. |
| Checklist condicional | Representação, estado civil e pessoa jurídica passam a sinalizar pendência, não exigência automática de arquivo. | Não declara documentação suficiente para contrato ou registro. |
| Finalidades de contato separadas | Preferências e permissões de contato devem ser específicas, revogáveis e auditáveis. | Não cria aceite LGPD genérico nem usa cadastro para marketing por padrão. |
| Exportação redigida preservada | Relatórios existentes permanecem agregados e sem dados pessoais. | Não há exportação de cadastro individual, arquivo ou identificador. |

## 3. Jornada por camadas

### Camada A — contato inicial mínimo

O ponto de entrada é o `Party` e o papel temporal já existentes. O perfil complementar poderá registrar o tipo de pessoa, meios de contato declarados, canal de contato preferido e situação cadastral interna. A presença de contato não representa autorização para qualquer canal; o canal somente pode ser usado quando a finalidade correspondente estiver registrada de modo específico.

### Camada B — perfil cadastral-base

Quando a finalidade cadastral estiver clara, o operador poderá preencher, de forma progressiva, informações estritamente necessárias para identificar se se trata de pessoa física ou jurídica, sem repetir o nome já mantido em `Party`. Não haverá obrigatoriedade universal de endereço completo, filiação, informações financeiras, imagem de documento, dados biométricos, estado de saúde, origem racial, religião, opinião política, filiação sindical, vida sexual, dados de criança ou adolescente, nem outros dados sensíveis.

### Camada C — prontidão documental por condição

Estado civil, representação e pessoa jurídica não produzirão upload automático, exigência de conteúdo ou bloqueio comercial. Eles apenas habilitarão cartões de pendência para revisão humana, com estados claros como **não aplicável**, **a confirmar**, **pendente de evidência**, **em revisão** e **declarado completo para a finalidade indicada**. A última classificação não equivale a aprovação jurídica, contratual ou registral.

### Camada D — consentimentos e preferências

As permissões de contato serão separadas por canal e finalidade. Cada alteração deve registrar somente o escopo, a decisão, o canal de obtenção, o momento e o responsável interno, com auditoria redigida. Não haverá caixa genérica de “aceite LGPD”, nem consentimento de crédito, assinatura eletrônica ou compartilhamento de dados nesta atualização.

### Camada E — pronto para próxima etapa, sem iniciá-la

O resultado possível desta frente é **cadastro-base organizado com pendências visíveis**. A passagem a venda, proposta, crédito, contrato, registro ou pagamento continua bloqueada e deverá ser objeto de decisão, modelagem e autorização próprias em marcos futuros.

## 4. Matriz de decisão do formulário recebido

O formulário fornecido foi estudado integralmente, mas não será copiado. A matriz abaixo converte suas categorias em uma decisão de produto que preserva minimização e separação de domínios.

| Categoria do formulário | Uso na primeira camada | Condição de uso | Visibilidade | Retenção | Decisão |
|---|---|---|---|---|---|
| Identificação declarada | Nome já mantido em `Party`; tipo de pessoa e situação cadastral interna no perfil. | Vínculo de cliente comprador já autorizado. | Apenas usuários autorizados no contexto Loteadora. | Política de retenção a definir. | **Entra**, sem duplicar pessoa. |
| Identificador fiscal | Campo opcional de identificação-base; sem consulta automática ou decisão por situação fiscal. | Finalidade cadastral explícita e revisão de necessidade. | Servidor, contexto e alçada; nunca em exportação redigida. | A definir com a política de retenção. | **Entra com limite**. |
| Documento de identidade e dados de emissão | Checklist de necessidade futura; não é arquivo nem imagem nesta atualização. | Somente se a finalidade posterior justificar a identificação formal. | Estado de pendência, sem conteúdo documental. | Não aplicável enquanto não coletado. | **Checklist, não conteúdo**. |
| Contato e preferência de canal | Telefone, e-mail e mensageria podem ser cadastrados de forma opcional e separados da permissão por canal. | Finalidade de contato claramente indicada. | Usuários autorizados; não exportar dados individuais. | A definir; revogação não apaga auditoria lícita. | **Entra**. |
| Endereço e comprovante | Não compõe a entrada mínima; pode ser pendência de prontidão, sem arquivo nesta atualização. | Exigência concreta de formalização futura. | Estado agregado da pendência. | A definir. | **Posterga**. |
| Estado civil e regime de bens | Estado civil como dado de qualificação condicional; regime apenas se a condição o justificar. | Pessoa física e finalidade de formalização identificada. | Usuários autorizados; sem exportação individual. | A definir. | **Entra de forma condicional**. |
| Cônjuge ou companheiro | Não cadastrar pessoa adicional nesta camada; criar apenas pendência de qualificação quando aplicável. | Gatilho decorrente de estado civil e finalidade futura. | Estado de pendência, sem dados de terceiro. | Não aplicável enquanto não coletado. | **Checklist, não pessoa adicional**. |
| Representante e procuração | Indicar existência e tipo de representação; gerar pendência de poderes. | Declaração de representação ou pessoa jurídica. | Estado de pendência, sem documento ou dados do representante. | A definir. | **Entra de forma condicional**. |
| Pessoa jurídica e atos societários | Tipo de pessoa, referência cadastral opcional e checklist de representação/atos. | `Party` classificada como pessoa jurídica. | Usuários autorizados; dados de quadro societário ficam fora. | A definir. | **Entra com escopo mínimo**. |
| Documentos e anexos gerais | Preservar intenção de anexo e upload opaco existentes; não classificar, visualizar ou ampliar arquivos neste marco. | Fluxo já autorizado e finalidade específica. | Regras atuais de anexo privado. | Política do fluxo vigente. | **Preserva, não expande**. |
| Renda, emprego, extratos, patrimônio e score | Sem campos, anexos, cálculo, classificação ou integração. | Exige marco próprio de crédito. | Nenhuma tela nesta frente. | Não aplicável. | **Fora de escopo**. |
| Empreendimento, lote, valor, entrada, parcelas e corretor | Sem vínculo, seleção, cálculo ou condição comercial. | Exige fluxo independente de venda/proposta. | Nenhuma tela nesta frente. | Não aplicável. | **Fora de escopo**. |
| Formas de pagamento, financiamento, consórcio e FGTS | Sem coleta, decisão ou integração. | Exige autorização e modelo financeiro próprios. | Nenhuma tela nesta frente. | Não aplicável. | **Fora de escopo**. |
| Contrato, assinatura, escritura e registro | Somente estados de prontidão documental; sem ato, documento, assinatura ou declaração de aptidão. | Marco jurídico-contratual posterior. | Nenhuma decisão individual nesta frente. | Não aplicável. | **Fora de escopo**. |
| Consentimentos | Permissões granulares por finalidade de contato, revogáveis e auditadas. | Quando consentimento for a base aplicável; nunca presumido. | Usuários autorizados, sem exportação individual. | A definir. | **Entra, sem aceite genérico**. |

## 5. Arquitetura aditiva proposta

### 5.1 Domínios e vínculos

O núcleo `Party` continuará contendo somente sua identidade resumida e reutilizável. O `buyerClient` continuará sendo o vínculo contextual entre o papel temporal elegível e o setor Loteadora. A atualização propõe três entidades privadas adicionais:

| Entidade proposta | Cardinalidade | Responsabilidade | Proibições explícitas |
|---|---:|---|---|
| `subdivision_buyer_client_profiles` | 1:1 com `buyerClient` no mesmo contexto organizacional | Cadastro-base, tipo de pessoa, contato, estado civil, representação e estado de preparo. | Não cria venda, lote, proposta, contrato, crédito ou preço. |
| `subdivision_buyer_client_requirements` | 0:N por perfil e código de requisito | Checklist condicional de pendências e evidências a revisar. | Não armazena bytes, imagem, URL, chave de arquivo ou documento. |
| `subdivision_buyer_client_contact_preferences` | 0:N por perfil e finalidade/canal | Decisões granulares de contato e sua revogação. | Não configura marketing por padrão nem substitui outra base legal. |

Todas as entidades serão vinculadas e resolvidas pelo servidor. Entradas do cliente poderão receber apenas o identificador do `buyerClient` devolvido pelo contexto autorizado; a função de banco deve verificar pertencimento organizacional, estado permitido e elegibilidade do vínculo antes de criar ou atualizar qualquer perfil.

### 5.2 Estados fechados

Os contratos usarão enums fechados, sem status de venda. A nomenclatura visível deverá ser operacional e curta.

| Conjunto | Valores candidatos | Significado |
|---|---|---|
| Tipo de pessoa | `individual`, `legal_entity` | Classifica a natureza cadastral sem alterar `Party`. |
| Estado cadastral | `contact_pending`, `base_data_in_progress`, `conditional_requirements_pending`, `base_data_review` | Organiza o trabalho humano; não aprova cliente. |
| Estado de pendência | `not_applicable`, `to_confirm`, `pending_evidence`, `under_review`, `declared_complete` | Marca prontidão específica; não atesta validade jurídica. |
| Representação | `not_declared`, `self_represented`, `represented`, `legal_entity_represented` | Liga apenas o gatilho de checklist. |
| Permissão de contato | `granted`, `revoked` | Registra decisão por finalidade e canal, sem inferência. |

### 5.3 Persistência, autorização e auditoria

A migração deverá seguir o precedente aditivo já usado no projeto: tabela privada por organização, integridade referencial composta, índice contextual, RLS ativada e revogação de acesso direto a `public`, `anon` e `authenticated`. As RPCs deverão usar `SECURITY DEFINER` com `search_path` vazio, conceder execução somente ao papel de serviço e chamar a função central de autoridade de Loteadora antes de ler ou escrever.

Cada comando de criação ou edição deverá receber correlação única, ser idempotente por evento autorizado, aplicar identidade, organização, contexto, membership, grant, papel, escopo, finalidade e sessão MFA válida conforme a política A276. Auditorias registrarão apenas presença, tipo de alteração, estados e finalidades; valores de contato, identificadores fiscais e dados declarados não serão colocados no payload de auditoria.

## 6. Composição da interface sem perda da jornada atual

A rota **Clientes Loteadora** continuará exibindo, em sequência, o cadastro de comprador já existente, a intenção privada de anexo, o envio opaco quando houver intenção autorizada e a leitura agregada de prontidão. A nova seção entrará como **Perfil cadastral e pendências**, depois do cadastro-base existente e antes da síntese de prontidão. Nenhuma aba ou filtro poderá desmontar a jornada anterior.

A interface usará formulário progressivo, com blocos compactos de identificação, contato, condições declaradas, pendências condicionais e preferências de contato. Estados vazios, carregamento, bloqueio por contexto e erro deverão explicar a situação sem revelar registros de outro contexto. Os cartões de pendência usarão linguagem clara — por exemplo, “A confirmar” e “Em revisão” — e não prometem aceitação contratual.

O relatório redigido existente será preservado e poderá receber somente contagens agregadas por estado, quando autorizadas. Não serão adicionados botões de download de ficha, exportação individual, visualização de anexos ou compartilhamento de informações pessoais.

## 7. Testes e critérios de aceite

Antes de qualquer dado real, a entrega deve demonstrar por testes automatizados e jornadas não materiais que contratos rejeitam campos financeiros/comerciais, IDs externos e enums inválidos; o servidor nega contexto, organização, papel, escopo, finalidade ou sessão inválidos; a idempotência não gera segundo perfil; a auditoria permanece redigida; e a UI preserva cadastro, anexo opaco, prontidão e exportação agregada existentes.

| Critério | Evidência requerida |
|---|---|
| Preservação | Todas as seções anteriores da rota permanecem acessíveis na mesma jornada. |
| Minimização | Não há campos de renda, score, patrimônio, crédito, pagamento, lote, valor, contrato ou registro. |
| Proteção | Não há consulta externa, URL de documento, byte em banco, chave em cliente ou acesso direto à tabela. |
| Condicionalidade | Estado civil, representação e pessoa jurídica alteram somente checklist aplicável. |
| Consentimento | Contato por canal/finalidade é separado, revogável e auditado sem aceite genérico. |
| Responsividade | Revisão de página inteira em 1920, 1280, 768 e 375 pixels, com foco, contraste, rolagem e alvos táteis adequados. |
| Qualidade | Testes focais e integrais, tipagem, build, integridade do diff e artefatos saneados aprovados antes de checkpoint. |

## 8. Sequência de implementação

1. Criar contratos Zod fechados e testes de aceitação/rejeição para o perfil, pendências e preferências.
2. Criar migração aditiva privada, RPCs e wrappers server-side; aplicar somente depois de revisão do SQL, sem inserir perfil ou cliente real.
3. Integrar procedures tRPC e testes de autorização, contexto, idempotência e auditoria redigida.
4. Compor a nova interface na rota existente, preservando as seções atuais e sem disparar mutação em validações visuais.
5. Validar rolagem integral, desktop e mobile; gerar pacote saneado, checkpoint funcional e consolidação sem publicação automática.

## Referências institucionais estudadas

[1] Presidência da República — Lei nº 13.709/2018 (LGPD), com orientação pública institucional sobre princípios de proteção de dados.

[2] Conselho Federal de Corretores de Imóveis — orientações relativas à Resolução-COFECI nº 1.336/2014 e prevenção à lavagem de dinheiro.

[3] Conselho Regional de Corretores de Imóveis de São Paulo — orientação institucional sobre prevenção à lavagem de dinheiro no setor imobiliário.

[4] Presidência da República — Lei nº 6.015/1973 (Registros Públicos).

[5] Conselho Nacional de Justiça — Provimento nº 149/2023, Código Nacional de Normas do Foro Extrajudicial.

[6] Receita Federal — serviço público de consulta cadastral de pessoa física.

[7] Receita Federal — serviço público de consulta cadastral de pessoa jurídica.

[8] Conselho Federal de Corretores de Imóveis — palestra institucional sobre prevenção à lavagem de dinheiro no mercado imobiliário, usada apenas como evidência contextual e confrontada com fontes normativas.
