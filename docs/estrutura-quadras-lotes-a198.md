# Estrutura por Quadras e Lotes — A198/A199

> **Natureza do marco:** evolução estrutural do Cadastro de Loteamentos. A homologação utilizou somente um loteamento sintético, sem pessoas, documentos, contratos, valores, estoque comercial, reservas, vendas, cobrança, pagamento ou repasse. O registro sintético foi arquivado ao final do ciclo.

## Objetivo operacional

O módulo **Estrutura** do Cadastro de Loteamentos passou a permitir a construção realista da matriz física do empreendimento, sem tratar todas as quadras como se tivessem a mesma quantidade de lotes. A pessoa administradora pode preparar até 50 Quadras por aplicação e informar entre 1 e 100 Lotes em cada uma.

Assim, o modelo comporta a situação solicitada: um loteamento com 25 Quadras, em que a **Q1** possui 15 Lotes, a **Q2** possui 25 Lotes e as demais têm quantidades próprias segundo a tipologia definida. A nomenclatura estrutural é exibida e gravada como **Qn · Ln**; ela não contém disponibilidade comercial, preço, contrato ou qualquer estado financeiro.

| Capacidade | Regra aplicada | Resultado operacional |
|---|---|---|
| Quadras por aplicação | De 1 a 50 | Permite construir empreendimentos extensos em lotes de trabalho revisáveis. |
| Numeração de Quadra | De 1 a 999, sem repetição | Cada Quadra é a matriz única dos seus Lotes. |
| Lotes por Quadra | De 1 a 100 | Cada Quadra recebe quantidade independente. |
| Nomenclatura | `Q{quadra} · L{lote}` | Mantém a referência estrutural ordenada e objetiva. |
| Revisão | Prévia de Quadras e total de Lotes antes de gravar | A pessoa vê a matriz antes do comando protegido. |
| Ajuste de redução | Confirmação explícita | Lotes excedentes e Quadras retiradas são arquivados logicamente, nunca apagados em cascata. |

## Nova área de trabalho

O estúdio modular mantém **Estrutura** como uma etapa separada da Identificação, Preparação, Documentos e Ciclo. Ao abrir esse módulo em um loteamento salvo, a pessoa encontra um construtor de grade com ações para adicionar Quadra, editar número e quantidade de Lotes, remover uma Quadra ainda não aplicada, revisar totais e aplicar a estrutura.

Depois da gravação, o mesmo módulo mostra o resumo das Quadras já salvas — como `Q1 · 15 Lotes` e `Q2 · 25 Lotes` — e oferece acesso explícito ao **Estoque/Mapa de Lotes**. Esse acesso é apenas um encaminhamento de navegação; não ativa disponibilidade, reserva, venda, preço, proposta, contrato, cobrança, pagamento, comissão ou repasse.

| Situação | Comportamento da interface | Comportamento no servidor |
|---|---|---|
| Primeiro cadastro | A pessoa monta a matriz e aplica a prévia. | Cria Quadras e Lotes em rascunho no contexto autorizado. |
| Aumentar Lotes em uma Quadra | A pessoa altera somente a quantidade daquela Quadra. | Mantém os Lotes existentes e acrescenta os faltantes. |
| Reduzir Lotes em uma Quadra | A interface exige a confirmação de substituição. | Arquiva logicamente apenas os Lotes acima do novo limite. |
| Retirar uma Quadra da matriz salva | A interface exige confirmação de substituição. | Arquiva logicamente os Lotes da Quadra e, depois, a própria Quadra. |
| Arquivar uma Quadra individual | Ação contextual no resumo salvo. | Arquiva a Quadra e seus Lotes de rascunho; não toca nas demais Quadras. |

## Proteções preservadas

A construção da matriz não delega autorização à interface. A leitura e a aplicação exigem organização ativa, subject ativo, membership vigente, grant vigente, módulo Loteadora e finalidade compatível. A camada de aplicação exige MFA TOTP recente antes das mutações. O banco revalida a autoridade no helper privado, usa correlação para idempotência, serializa cada loteamento em transação e registra somente auditoria redigida.

| Controle | Evidência |
|---|---|
| Organização demonstrativa | A guarda ativa nega toda leitura ou mutação setorial quando a organização não está ativa. |
| Acesso direto | RLS permanece ativo nas tabelas de Loteamento, Quadra e Lote, com leitura direta negada a papéis anônimo e autenticado. |
| RPCs | As três funções do construtor usam `SECURITY DEFINER` com `search_path` definido e execução direta negada a `anon` e `authenticated`. |
| Integridade | A aplicação usa lock transacional por organização e loteamento, evitando duas alterações simultâneas da mesma matriz. |
| Arquivamento | Nenhuma redução faz exclusão física ou cascata destrutiva. |

## Homologação controlada

Foi executado um ciclo positivo no banco, em organização ativa não demonstrativa, selecionada internamente sem expor identidade ou organização. O ciclo criou apenas a referência sintética de homologação e não retornou dados de negócio.

| Etapa de homologação | Resultado agregado |
|---|---|
| Construção inicial | Q1 com 15, Q2 com 25 e Q3 com 7, totalizando 3 Quadras e 47 Lotes de rascunho. |
| Revisão com redução | Q1 passou para 10 e Q2 permaneceu com 25; o resultado ficou em 2 Quadras e 35 Lotes. |
| Arquivamento lógico | A Q3 e seus 7 Lotes, mais os 5 Lotes excedentes da Q1, foram arquivados de forma controlada. |
| Limpeza | As Quadras remanescentes e o loteamento sintético foram arquivados; a verificação agregada confirmou que não restou estrutura sintética ativa. |

Durante a primeira execução de homologação, a auditoria identificou uma referência inválida à função de normalização em duas RPCs novas. A transação foi revertida automaticamente, sem deixar registros de teste. A correção **A199** substituiu somente as RPCs afetadas por versões que usam a função de normalização compatível, preservando `SECURITY DEFINER`, `search_path`, RLS e privilégios. A segunda execução concluiu o ciclo completo com sucesso.

## Verificações executadas

| Verificação | Resultado |
|---|---|
| Testes dirigidos | 5 arquivos e 13 testes aprovados para contratos, serviço, migração, MFA, construtor e responsividade. |
| Suíte integral | 202 arquivos de teste e 477 testes aprovados. |
| Tipagem e build | TypeScript, build compatível com Netlify e integridade de diff aprovados; o build mantém somente aviso não bloqueante de tamanho de chunk. |
| Catálogo do banco | Confirmação agregada de RLS, `SECURITY DEFINER`, `search_path` e negação de `EXECUTE` direto. |
| Desktop e móvel | Revisados no estado seguro sem contexto; os módulos agora preservam largura mínima e rolagem horizontal em vez de sobrepor rótulos. |

## Limite atual e próxima validação visual

O fluxo estrutural foi validado por código, catálogo e ciclo sintético completo. A confirmação visual autenticada da matriz preenchida depende da sessão do usuário apontar para o código deste marco e de existir um contexto Loteadora ativo; nenhum registro já existente será usado ou alterado para essa verificação. Após recarregar a prévia, a sequência esperada é abrir **Cadastro de Loteamentos → Estrutura**, selecionar um rascunho já autorizado e aplicar a matriz somente quando a pessoa responsável decidir operar com dados reais.

O resultado prepara o setor para **explorar os dados de forma mais intuitiva**, **entender melhor as tendências** estruturais do empreendimento e **salvar ou compartilhar facilmente** a referência de trabalho, sempre sem transformar estrutura em dado comercial ou financeiro.
