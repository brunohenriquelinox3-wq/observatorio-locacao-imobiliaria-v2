# Trilha de auditoria de leitura com contexto autorizado

**Escopo:** Vendas Urbanas, Locação e controles de contexto que sustentam as jornadas operacionais.  
**Método:** navegação e leitura de rotas autorizadas, revisão estática de caminhos e testes automatizados.  
**Limite:** nenhuma tela teve campos preenchidos, nem foram criados, editados, excluídos, importados ou exportados registros. Também não foram acionados comandos administrativos, propostas, reservas, contratos, valores, cobrança, pagamentos, repasses ou integrações externas.

> A sessão da plataforma, a sessão Supabase, o contexto organizacional, a membership, o grant, o escopo e a atestação MFA permanecem controles independentes. A interface apenas reflete o resultado do servidor e não concede alçada.

## Resultado do ciclo

O ciclo confirmou a falha segura quando não há sessão Supabase e a restauração controlada após o login realizado diretamente pelo usuário. Após a confirmação de contexto, as jornadas de rascunho exibiram somente leituras permitidas ou estados vazios. Um único registro sintético pré-existente foi apenas visualizado em uma frente de rascunho; nenhum dado foi criado ou modificado.

| Bloco | Superfície lida | Evidência nova | Limite confirmado | Situação |
|---|---|---|---|---|
| Contexto | Entrada de contexto, logout e retorno à Locação | O login recupera opções autorizadas; o logout volta ao estado sem consulta | O logout preserva a sessão da plataforma; sem token Supabase, não há lista nem comandos utilizáveis | Confirmado |
| Vendas Urbanas | Financeiro, propostas/alias, clientes, imóveis, empreendimentos, perfil e agenda | O alias comercial resolve o setor bloqueado; a jornada estrutural urbana abre na rota correta | Sem proposta, reserva, contrato, preço, comissão, cobrança ou financeiro | Confirmado |
| Locação | Financeiro, contratos/garantias, clientes, imóveis, perfil, agenda e administração | Os setores 06 e 07 permanecem bloqueados com contexto autorizado | Sem garantia, contrato, preço, cobrança, pagamento, repasse ou integração externa | Confirmado |
| Loteadora | Cadastro, estoque/mapa, clientes, sócios/parceiros, vendas de lotes e financeiro | A rota canônica de inventário foi distinguida de um caminho manual não definido | Sem disponibilidade comercial, venda material, participação econômica, contrato ou financeiro | Confirmado |
| Navegação | Sidebar, caminhos canônicos e aliases | Todos os caminhos visíveis possuem registro no roteador; dois aliases permanecem intencionais e invisíveis na sidebar | Não foi criado alias especulativo nem rota de negócio adicional | Confirmado |

## Alternância e prevenção de repetição

As verificações de Vendas Urbanas e Locação foram alternadas por superfície inédita sempre que a mesma classe de controle estivesse disponível nas duas colunas: imóveis e proprietários, perfil de busca, agenda e entradas de clientes. Loteadora foi revisada entre esses blocos para confirmar a separação da terceira coluna, sem transformar sua evidência em operação comercial.

| Regra de avanço | Aplicação neste ciclo | Resultado |
|---|---|---|
| Evidência individual | Cada bloco registrou rota, setor, condição de contexto e limite funcional | Não houve encerramento por inferência visual isolada |
| Nova superfície ou lacuna | Cada mudança de bloco examinou rota inédita, alias intencional ou retorno fail-closed | Uma rota urbana ausente foi corrigida; um caminho manual não canônico foi mantido fora do roteador |
| Sem retorno circular | Rotas já confirmadas não foram repetidas sem nova condição de contexto, validação pós-login/logout ou correção de rota | Auditoria manteve avanço rastreável |
| Separação de autorização | Alterar tela, rota ou contexto visual não foi tratado como concessão | Nenhuma membership, grant, escopo ou perfil foi criado |

## Lacunas preservadas

As lacunas abaixo continuam abertas por exigirem condição futura ou autorização material separada. Elas não devem ser interpretadas como defeitos do ciclo atual.

| Lacuna | Motivo | Condição para retomar |
|---|---|---|
| Cobertura integral de formulários e controles externos | O escopo atual proíbe preencher, enviar, importar, exportar, comunicar ou alterar registros | Ambiente isolado explicitamente autorizado, com roteiro de teste e confirmação material por ação |
| Operações econômicas, contratuais e de repasse | Permanecem explicitamente fora do corte atual | Autorização posterior, validação jurídica/contábil e controles específicos |
| Ambiente Demonstrativo | Deve permanecer rascunho isolado, sem ativação, módulos, dados ou publicação | Autorização material explícita e escopo documentado |
| Sete entregas históricas sem evidência específica | Os checkpoints posteriores não comprovam a entrega histórica exata | Localização de material e checkpoint correspondentes |

## Controles preventivos adicionados

O marco A153 acrescentou um teste de regressão que percorre os caminhos canônicos declarados na navegação e exige um registro correspondente no roteador. A cobertura diferencia os aliases intencionais dos itens visíveis na sidebar, reduzindo o risco de uma rota setorial voltar a produzir erro de navegação por divergência entre as duas fontes.

## Próximo passo seguro

O próximo passo técnico possível é somente ampliar a cobertura de leitura já permitida ou corrigir uma divergência real comprovada. Qualquer fluxo que grave dados, trate documentos, execute comunicação, envolva contratos, valores, cobrança, pagamentos, repasses, integrações ou ambiente demonstrativo exige autorização específica e não deve ser iniciado por esta trilha.
