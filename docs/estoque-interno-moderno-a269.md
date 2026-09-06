# Estoque interno moderno por Lote — A269

## Decisão de arquitetura

O estoque interno será uma **camada adicional, por Lote físico canônico**, e não um novo cadastro de unidades. A matriz de Quadras e Lotes já existente continua sendo a origem exclusiva de identidade, área, divisas, tipologia, posição e reserva física. Os estados e eventos de estoque existentes continuam sendo a origem da fase operacional e de sua trilha; a nova camada apenas reúne detalhes internos complementares para leitura e revisão.

| Fonte | Responsabilidade preservada | A269 acrescenta |
|---|---|---|
| Matriz física | Identidade de Quadra/Lote, área, divisas e atributos físicos | Nenhuma identidade alternativa de Lote |
| Estado de estoque | Fase operacional interna atual por Lote | Continua sem semântica comercial |
| Eventos de estoque | Histórico append-only de transições | Continua imutável e idempotente |
| Perfil interno de estoque | Não existia como entidade própria | Marcador de mapa interno, situação de revisão e nota saneada |

## Perfil interno proposto

O banco receberá uma tabela 1:1, vazia por padrão, vinculada por organização ao Lote físico já existente. Ela não terá preenchimento automático, cópia de informação física ou retropreenchimento a partir de preço, reserva ou evento. Seus campos serão limitados a uma taxonomia fechada e não comercial:

| Campo | Valores ou formato | Finalidade | Não representa |
|---|---|---|---|
| Marcador de mapa interno | padrão, atenção, técnico | Leitura visual e legenda do mapa interno | Disponibilidade, reserva comercial ou venda |
| Situação de revisão | não iniciada, em revisão, conferida | Organizar revisão humana do inventário | Aprovação comercial ou contratual |
| Nota interna saneada | Texto curto, sem dados pessoais ou econômicos | Contexto de revisão operacional | Documento, preço, cliente, contrato ou financeiro |
| Versão e instante de revisão | Controle técnico do registro | Concorrência e auditoria | Cronograma comercial ou publicação |

> Campos sem fonte permanecem vazios. A criação da estrutura não registra perfil para nenhum Lote existente e não altera a fase de estoque já cadastrada.

## Segurança e domínio

Leitura e escrita usarão apenas funções protegidas no servidor. O banco terá RLS habilitada, ausência de privilégios diretos para papéis públicos e execução de RPC restrita ao serviço autorizado. Cada escrita exigirá sujeito, organização ativa, membership, grant, escopo, finalidade, MFA recente, correlação, idempotência e auditoria redigida. A nota não seguirá para o evento de auditoria.

As funções confirmarão que o Lote pertence à organização e integra a matriz física autorizada. Uma atualização de perfil não poderá criar Lote, modificar área, alterar divisas, mudar reserva física ou tocar preço-base, condição, disponibilidade, venda, proposta, contrato, cobrança, pagamento ou financeiro.

## Experiência unificada

A seção **Estoque interno** será inserida em sequência contínua dentro de Loteamentos, após a matriz física e antes da referência interna de preço. Ela reutilizará o empreendimento, a Quadra e a unidade já selecionados; filtros e legenda serão somente de leitura. O mapa atual continua existindo na rota complementar e recebe a mesma leitura, sem uma segunda lista de Lotes e sem comandos por célula.

O cartão detalhado pode apresentar, conforme autorização, a fase existente, o marcador interno, a situação de revisão e a presença de nota. A ficha de perfil será uma ação explícita e independente da ficha física. Nenhuma interação de mapa, cartão, filtro ou legenda executará gravação.

## Fronteira externa futura

Esta entrega não cria API pública, portal, mapa público, publicação ou acesso de terceiros. Ela prepara somente o contrato interno que, no futuro, poderá alimentar uma projeção externa minimizada e versionada. Qualquer projeção futura deverá ter tabela, funções de publicação em dois níveis e lista explícita de campos permitidos; jamais fará leitura direta do perfil, da matriz, da política de preço, dos eventos, das notas ou das reservas internas.

## Critérios de aceite A269

1. A migração é exclusivamente aditiva, sem atualizar registros existentes.
2. A tabela tem unicidade por organização/Lote e referência ao Lote físico canônico.
3. A leitura sem contexto, escopo ou MFA é negada no servidor.
4. Uma nota ou marcador não cria estado comercial nem modifica o estado de estoque existente.
5. Cadastro, matriz, documentos, reservas, referência interna de preço e a rota Estoque/Mapa permanecem acessíveis.
6. Testes, tipagem, build, integridade do diff, revisão desktop/tablet/celular e saneamento de artefatos são aprovados antes do checkpoint.

## Evidências de implementação e validação

A migração A269 foi aplicada no PostgreSQL autorizado por procedimento de migração versionado e retornou sucesso. A consulta posterior de contagem agregada confirmou **zero perfis internos registrados** na nova tabela. Portanto, a criação da estrutura não inseriu, atualizou, classificou ou alterou qualquer Lote físico, estado de estoque, preço, reserva, venda, contrato ou informação financeira.

O contrato de leitura retorna o agregado JSONB materializado pela camada de dados e o serviço aceita somente uma lista estruturada. Respostas malformadas são negadas antes da interface receber um perfil. A gravação resolve o Lote exclusivamente no banco a partir de empreendimento, Quadra e número de Lote, sem aceitar identificador físico enviado pelo navegador.

Na revisão autenticada, a nova seção apareceu em sequência após a matriz física e antes da ficha física existente. A matriz, Cadastro e conteúdos posteriores permaneceram acessíveis. Sem uma atestação MFA recente, a leitura de perfil apresentou bloqueio explícito; os totais dependentes dessa leitura passaram a usar estado protegido, e a ficha e a gravação ficaram desabilitadas. Essa condição não altera a matriz nem confirma contagens não lidas.

Os testes dirigidos aprovados cobrem migração, leitura protegida, resolução de unidade sem identificador físico do cliente, ausência de identidade, resposta malformada, enum fora do catálogo, nota acima do limite e contexto inválido. A validação final aprovou **225 arquivos de teste e 610 testes**, tipagem, build de publicação e integridade do diff. O build emitiu apenas o aviso conhecido de divisão de pacotes grandes, sem falha de compilação.

Na inspeção visual, a jornada completa de Loteamentos foi percorrida até a seção A269 e seus conteúdos posteriores em sessão autenticada. A tela ampla confirmou a coexistência entre entrada, visão operacional, Cadastro, matriz e ficha física. Capturas complementares de referência nas larguras ampla, desktop, tablet e celular não apresentaram sobreposição, corte de texto ou transbordamento no fluxo sem empreendimento selecionado. A leitura autorizada de perfis e a inspeção responsiva desse estado continuam pendentes de uma nova confirmação de MFA diretamente pela interface de Segurança e MFA.

Após autorização explícita, foi incluída uma opção de vinculação adicional na tela de Segurança e MFA. Ela mantém o autenticador já existente, apresenta QR e segredo somente em memória na tela do navegador e exige a confirmação do primeiro código diretamente no provedor. A confirmação foi concluída pelo usuário; a sessão passou a apresentar MFA recente reconhecido. Nenhum código, QR, segredo ou identificador de fator foi registrado nesta documentação.

Com a sessão reforçada, a leitura protegida A269 foi revalidada na jornada autenticada. O painel retornou a totalidade esperada de Lotes físicos da matriz, **zero perfis internos registrados** e **zero revisões necessárias**. A lista exibiu somente a taxonomia-base não comercial para os Lotes sem perfil, declarou que mapa público não foi criado e preservou a ficha como ação independente. Nenhum item foi selecionado, salvo, classificado ou alterado durante a verificação.

O ZIP de código e o HTML autônomo A269 foram gerados após o build e validados quanto à presença, exclusões obrigatórias e saneamento. O ZIP exclui ambiente, dependências, logs, documentos internos e checklist. O HTML não contém credenciais, hosts, endpoints, URLs de banco, papel privilegiado ou marcadores de infraestrutura; o saneador foi ampliado e coberto para lidar também com URLs codificadas e padrões genéricos de host presentes no bundle. A publicação não foi executada.
