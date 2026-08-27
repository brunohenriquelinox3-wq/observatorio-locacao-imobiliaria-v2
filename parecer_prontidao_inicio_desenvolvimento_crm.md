# Parecer de prontidão para início do desenvolvimento do CRM

**Status:** `avaliação_documental_2026-08-27`  
**Escopo:** este parecer verifica o ponto de entrada de desenvolvimento sem implementar CRM. A estratégia funcional avaliada permanece limitada a Vendas Urbanas e Locação; SUPER ADM, ADM e Loteadora não são alterados por este documento. [1] [2]

## 1. Pergunta de decisão

> **Pergunta:** é necessário atualizar a estratégia antes de iniciar desenvolvimento?

**Resposta preliminar:** a estratégia de produto para Vendas Urbanas e Locação está materialmente coberta para orientar o planejamento. Não é recomendável reabrir funcionalidades, acrescentar telas ou expandir escopo antes de começar. Contudo, há atualizações de **entrada em desenvolvimento** que são indispensáveis porque definem o primeiro corte, o destino técnico e os limites de segurança; sem elas, a implementação começaria com risco de retrabalho e incompatibilidade de plataforma.

| Critério de prontidão | Evidência mínima exigida | Resultado desejado | Estado da avaliação |
| --- | --- | --- | --- |
| Escopo e ordem | Onda, domínio, exclusões e critérios de aceite do primeiro corte. | Um vertical pequeno, não financeiro e não externo, com início/fim verificáveis. | `requer_decisão_de_entrada` |
| Integridade de domínio | Party, papel, ativo, dossiê, evento, contexto, propósito e exceção definidos. | Requisitos futuros não duplicam identidade, contrato, dossiê ou estado financeiro. | `coberto_estrategicamente` |
| Autorização e isolamento | Organização, módulo, objeto, finalidade, grant, vigência e alçada previstos. | Matriz permitir/negar e comportamento de falha segura antecedem jornadas de negócio. | `coberto_estrategicamente` |
| Plataformas e dados | Banco, ORM, auth, storage, ambiente, migração e conexão escolhidos de modo compatível. | Uma única arquitetura de persistência, sem modelo relacional concorrente. | `bloqueio_tecnico_de_alinhamento` |
| Qualidade e operação | Testes, ambiente isolado, observabilidade, recuperação e critérios de pausa. | O primeiro corte tem prova automatizada e manual proporcional ao risco. | `requer_plano_de_execução` |
| Efeito material | Regras para comunicação, publicação, consulta externa, cobrança, pagamento, repasse e IA. | Tais efeitos ficam deliberadamente fora do primeiro corte. | `bloqueado_por_escopo` |

## 2. Diagnóstico de prontidão

| Frente | Evidência observada | Estado | Consequência de início |
| --- | --- | --- | --- |
| Estratégia de Vendas Urbanas e Locação | A auditoria de cobertura registrou intenção, evidência, decisão, requisito, risco, owner, dependência, exceção e aceite; as duas lacunas de rastreabilidade foram fechadas de forma mínima. [4] | `pronta_para_especificação_do_primeiro_corte` | Não é necessário abrir novo estudo amplo de mercado, módulos ou telas antes de planejar o primeiro corte. |
| Ordem de desenvolvimento | As ondas estabelecem fundação governada, núcleo canônico, jornadas, financeiro, serviços/portais e inteligência. [3] | `requer_congelamento_de_escopo` | O primeiro corte deve ser escolhido e documentado; não se inicia com financeiro, portais, IA, publicação, cobrança, pagamento, repasse ou integrações externas. |
| Hierarquia global | A arquitetura canônica mantém SUPER ADM → ADM → LOTEADORA → VENDAS URBANAS → LOCAÇÃO; esta frente documental não pode alterar as três primeiras colunas. [2] | `requer_fronteira_explícita` | Para desenvolver o CRM inteiro, é necessária autorização específica para reabrir a estratégia da fundação administrativa; para desenvolver apenas Vendas Urbanas/Locação, deve-se começar pelo contrato de contexto compartilhado, sem mudar as outras colunas. |
| Persistência e ORM do projeto atual | `drizzle.config.ts` declara dialeto `mysql` e `drizzle/schema.ts` importa `mysql-core`, enquanto a estratégia acumulada direciona a futura solução para Supabase/PostgreSQL. | `bloqueio_técnico_de_alinhamento` | Não criar tabelas, migrations ou rotas até registrar e aprovar **uma única** arquitetura de dados. Manter MySQL e Supabase em paralelo como fontes concorrentes é proibido. |
| Qualidade de build | A verificação executada nesta avaliação passou em 12 arquivos/16 testes e em TypeScript; o build de pré-publicação concluiu. | `base_verificável_com_alertas` | Antes de implementação real, criar baseline de qualidade e tratar como item de engenharia o aviso de chunk acima de 500 kB e a referência de asset resolvida em runtime. Não bloqueiam a decisão estratégica. |
| Ambiente local | A dependência `dotenv` está presente, embora exista registro histórico de falha de resolução no servidor local. | `revalidação_técnica_pendente` | Não alterar `server/_core` nesta etapa documental. Revalidar o runtime, com plano de correção e teste de regressão, somente quando for autorizada a preparação técnica. |

## 3. Atualizações indispensáveis antes de desenvolver

| ID | Atualização documental mínima | Por que é indispensável | Resultado verificável | Estado |
| --- | --- | --- | --- | --- |
| `PRONT-01` | Criar uma decisão de plataforma que escolha, sem ambiguidade, a persistência, o ORM, o mecanismo de autenticação, o storage e o caminho de migração/rollback. | O projeto atual possui configuração MySQL, mas o direcionamento estratégico é Supabase/PostgreSQL. | Uma arquitetura é marcada como canônica; a outra fica removida do plano ou explicitamente isolada, sem dados duplicados. | `necessária_antes_de_schema` |
| `PRONT-02` | Congelar o primeiro corte vertical: finalidade, partes/papéis permitidos, objetos, comandos proibidos, estados, exceções, owner, métricas e testes permitir/negar. | Evita iniciar por formulário/tela sem contexto e sem prova de isolamento. | Backlog de um corte não financeiro contém entrada, saída, falha, reversão/compensação quando aplicável e aceite. | `necessária_antes_de_implementação` |
| `PRONT-03` | Formalizar a fronteira entre a fundação administrativa já prevista e as colunas Vendas Urbanas/Locação, incluindo a autorização de escopo. | A estratégia corrente não pode alterar SUPER ADM, ADM ou Loteadora. | Há decisão expressa sobre começar pelo contrato compartilhado ou reabrir a fundação administrativa em frente própria. | `necessária_antes_de_alterar_acesso` |
| `PRONT-04` | Criar baseline de engenharia do primeiro corte: testes, tipos, build, logs, estado vazio/erro, acessibilidade, observabilidade e critério de pausa. | Um build atual bem-sucedido não substitui o contrato de qualidade de uma nova capacidade. | Pipeline do primeiro corte demonstra testes e evidências antes de mudança material. | `necessária_antes_de_piloto` |

## 4. Regra de decisão

O início seguro não exige rediscutir a visão, as jornadas nem os requisitos já auditados. Exige congelar uma **versão de entrada**, explicitar o que fica fora dela e resolver o desalinhamento técnico antes que qualquer schema ou rota seja criado. O corte de entrada deve preservar a sequência estratégia → especificação → testes → implementação → validação; ele não deve abrir financeiramente sensíveis ou integrações externas para “ganhar velocidade”. [1] [3] [4]

## 5. Sequência segura recomendada

| Ordem | Decisão ou produto documental | Resultado de saída | Proibido nesta ordem |
| --- | --- | --- | --- |
| `S0` — decisão de plataforma | Aprovar uma arquitetura canônica para Supabase/PostgreSQL, autenticação, storage, ORM e migração, e encerrar o caminho MySQL concorrente. | `PRONT-01` aprovado, com uma única fonte de persistência e um plano de reversão antes de qualquer migration. | Criar tabela nos dois bancos, espelhar dados, usar schema MySQL “provisório” ou cadastrar informação real. |
| `S1` — recorte de entrada | Fixar uma fundação vertical mínima: contexto de organização/módulo, Party, papel datado, ativo urbano básico, dossiê sem arquivo real, evento e negação por padrão. | `PRONT-02` aprovado, com limite explícito de objetos, comandos permitidos, exceções e testes. | Financeiro, cobrança, pagamento, repasse, portais, publicação, mensageria, consulta externa e IA operacional. |
| `S2` — fronteira de autoridade | Registrar se a etapa inicial apenas consome o contrato de fundação para Vendas Urbanas/Locação ou se abrirá uma frente própria, autorizada, para a camada administrativa. | `PRONT-03` aprovado, sem alterar por efeito colateral SUPER ADM, ADM ou Loteadora. | Criar papel privilegiado, grant, organização, delegação ou alteração de acesso sem frente e decisão específicas. |
| `S3` — qualidade antes de função | Converter o recorte em critérios de teste, logs, estados vazio/erro, acessibilidade, recuperação e pausa; revalidar o runtime local antes da primeira mudança de domínio. | `PRONT-04` aprovado, com baseline de testes e evidência de ambiente. | Usar build bem-sucedido como substituto de teste de autorização, exceção, regressão ou recuperação. |
| `S4` — autorização de implementação | Submeter o pacote S0–S3 e o primeiro corte para autorização específica; só então produzir schema, migration, rota, tela, integração ou dado sintético. | Autorização registrada e plano técnico separado. | Começar por uma tela, gerar migrations por antecipação ou conectar fontes externas. |

> **Recomendação de início:** após S0–S4, o primeiro desenvolvimento deve ser uma fundação vertical de baixo risco e dados não financeiros. A meta não é “entregar um CRM completo”; é comprovar que contexto, isolamento, Party/papel, ativo, evento, negação e trilha funcionam juntos. Só depois uma jornada de Vendas Urbanas ou Locação deve ampliar esse núcleo.

## 6. Referências internas

[1] [Estratégia atualizada — Vendas Urbanas e Locação](estrategia_vendas_urbanas_locacao_atualizada.md)

[2] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)

[3] [Plano estratégico de desenvolvimento por ondas](plano_estrategico_ondas_vendas_locacao.md)

[4] [Auditoria de cobertura estratégica](auditoria_cobertura_estrategica_vendas_locacao.md)
