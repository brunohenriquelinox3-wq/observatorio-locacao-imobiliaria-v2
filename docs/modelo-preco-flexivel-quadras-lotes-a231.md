# Modelo de Preço Flexível por Empreendimento, Quadra e Lote — A231

**Status:** fundação e central de preparação implementadas; não há ajuste ou condição real criada. Este documento não cria disponibilidade, proposta, contrato, cobrança, pagamento, repasse, lançamento fiscal ou receita.

## Objetivo e fronteira

O Vista do Sol trabalha com referências de preço que podem ser revistas após decisões internas, evolução de obras, desempenho comercial ou ações promocionais. O CRM deve registrar cada decisão como uma **regra versionada, datada, auditável e reversível logicamente**, em vez de substituir valores silenciosamente. A referência de preço-base importada deve ser tratada como insumo interno: não é preço contratual, promessa ao cliente, disponibilidade, receita, recebível ou evidência fiscal.

O único registro existente no início deste desenho é uma política de preço-base em **Preparação**, com 163 linhas físicas reconciliadas e uma exceção de preço-base ausente. Por esse motivo, nenhum valor dessa política deve aparecer como preço vigente para uma pessoa operadora até que a exceção seja tratada, a política seja encaminhada e uma pessoa autorizada distinta a aprove. A matriz física permanece a autoridade para Quadra, Lote e área.

## Camadas e precedência

| Camada | Escopo permitido | Uso | Precedência | Proibições |
|---|---|---|---|---|
| Política-base | Empreendimento, com linha por Lote | Referência inicial importada da fonte interna | Menor | Não inicia venda nem substitui contrato. |
| Ajuste de empreendimento | Todo o empreendimento | Revisão geral de referência, para cima ou para baixo | Acima da base | Não pode alterar linhas físicas ou criar disponibilidade. |
| Ajuste de Quadra | Uma Quadra identificada | Condição dirigida a uma área do empreendimento | Acima do ajuste geral | Não pode selecionar Lotes fora da Quadra. |
| Exceção de Lote | Um Lote identificado | Condição excepcional individual | Maior | Não pode ser inferida, sorteada ou copiada para outro Lote. |
| Condição temporária | Empreendimento, Quadra ou Lote | Campanha, desconto ou condição com início e fim | Maior dentro do mesmo escopo enquanto vigente | Não pode vigorar sem data final, motivo e aprovação. |

Uma leitura resolve somente **uma condição efetiva por vez**. A prioridade é: condição temporária aprovada e vigente no Lote, depois condição temporária na Quadra, depois no empreendimento; em seguida exceção individual, ajuste de Quadra, ajuste do empreendimento e, por último, a linha da política-base aprovada. Regras do mesmo escopo não podem ter períodos de vigência sobrepostos. A condição de maior prioridade substitui a referência anterior; o sistema não soma descontos, percentuais ou acréscimos em cascata.

## Regra de preço e tipos de decisão

Cada decisão deve declarar se estabelece um **valor-base por m² explícito** ou uma **variação percentual única** sobre a referência imediatamente inferior. A variação percentual pode ser positiva (reajuste) ou negativa (redução), enquanto desconto temporário permanece de 0 a 100% e sempre exige termo final. O CRM deve calcular uma leitura de apoio apenas quando houver política-base aprovada, referência inferior identificável e condição aprovada/vigente. O cálculo nunca altera a política-base e não é preço contratual.

| Tipo de decisão | Campos obrigatórios | Leitura permitida | Bloqueios |
|---|---|---|---|
| Revisão de preço-base | Escopo, valor por m², início, motivo, referência documental | Valor-base interno na vigência | Sem aprovação, não entra na leitura contextual. |
| Acréscimo | Escopo, percentual ou valor por m², início, motivo e respaldo | Referência ajustada | Sem fim quando for campanha; sem sobreposição. |
| Desconto | Escopo, percentual ou valor por m², início, fim, motivo e respaldo | Condição temporária de apoio | Nunca acumula com outro desconto. |
| Condição especial de Lote | Lote, valor/variação, início, fim, justificativa e respaldo | Exceção individual no detalhe do Lote | Não pode ser criada por seleção aleatória automática. |
| Retirada | Regra de origem e motivo | Remove a regra futura; preserva o histórico | Não apaga auditoria nem reverte venda/contrato. |

## Máquina de estados e documentos

Toda regra nasce em **Preparação**, segue para **Encaminhada** e só pode tornar-se **Aprovada** por pessoa distinta de quem a criou. Uma regra aprovada pode estar **Programada** (início futuro), **Vigente**, **Expirada** (fim alcançado) ou **Retirada** (revogação lógica com motivo). A aprovação deve ser negada quando existir sobreposição, escopo físico ausente, documento obrigatório sem estado confirmado, política-base ainda não aprovada ou identidade de aprovador igual à de criador.

O requisito documental não armazena o contrato, nem torna uma decisão automaticamente regular. Ele registra somente uma categoria de respaldo e o estado de trabalho: pendente, em revisão, declarado completo ou revisão necessária. Os documentos reais serão anexados no módulo privado próprio quando esse fluxo estiver habilitado e validado.

## Visualização contextual por Lote

O cartão de Lote receberá uma área contextual acionável por foco de teclado ou passagem do cursor. Ela apresentará, quando houver referência aprovada, o estado da referência, o escopo que prevaleceu, a vigência, o tipo de condição e o status do respaldo. Quando não houver preço aprovado, a leitura mostrará claramente **“Referência de preço em preparação — não exibir valor operacional”**. A interface não mostrará clientes, status de venda, proposta, contrato, parcelas, cobrança, recebíveis ou dados pessoais.

Essa superfície responde ao fluxo de trabalho sem transformar a matriz física em estoque comercial. A condição ainda deverá ser consultada no módulo comercial adequado antes de qualquer proposta, reserva ou contrato.

## Invariantes técnicos

> Nenhum ajuste de preço pode ser criado, encaminhado, aprovado, retirado ou lido como vigente apenas pela interface. Cada ação crítica será revalidada no servidor por identidade, organização ativa, membership, grant, módulo, finalidade, contexto, MFA TOTP recente, correlação/idempotência e policy.

As tabelas serão aditivas, com RLS fail-closed, revogação de acesso direto e RPCs `SECURITY DEFINER` com `search_path` vazio. A auditoria armazenará somente ação, escopo, estado, tipo de decisão, presença de respaldo e identificadores internos necessários; valores, arquivos, clientes e conteúdo de justificativas não entrarão em payloads de auditoria. A fonte de importação continua processada de forma efêmera e não será salva como anexo.

## Implementação controlada e pendência atual

A fundação aditiva de condições foi aplicada com estados, escopos, vigência, motivos, respaldo e segregação de aprovação. A interface permite preparar uma condição por empreendimento, Quadra ou Lote, e passou a enviar apenas Quadra e número de Lote; o identificador físico é resolvido exclusivamente na função protegida do servidor. A leitura contextual por cursor ou foco é limitada a uma política aprovada e vigente.

A política de preço-base da fonte atual foi preparada com vigência em 05/09/2026 e 163 linhas reconciliadas. Existe uma exceção de preço-base ausente, portanto ela permanece em Preparação e não pode ser encaminhada nem aprovada. Consequentemente, a leitura por Lote informa a ausência de referência operacional em vez de exibir preço não aprovado. Nenhum ajuste, desconto ou condição especial real foi criado.

Qualquer operador humano poderá, no futuro, preencher a pendência comprovada e anexar o respaldo no fluxo autorizado. O CRM não estimará preço, não copiará valor entre Lotes e não usará fórmula derivada como fonte de condição comercial.

## Evidências de validação

A preparação, a recuperação do histórico no cadastro correto, a resolução server-side de Lote por Quadra e número, e a leitura contextual restrita foram verificadas em sessão autenticada. A interface móvel foi revisada no layout de uma coluna; a revisão com sessão confirmou a central de política e condições sem criar ajuste adicional. A validação integral aprovou **216 arquivos e 544 testes**, a tipagem, o build Netlify e a integridade do diff. O build registrou somente o aviso não bloqueante de chunks grandes.
