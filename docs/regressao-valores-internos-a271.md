# Regressão de leitura de valores internos — A271

## Sintoma confirmado por captura

A captura recebida mostra cartões físicos consecutivos com **área física** preservada, mas com o campo de **Valor por m²** renderizado sem valor e o **Valor total do Lote** apresentado como indisponível. O padrão se repete nos cartões visíveis e não permite concluir, por si só, se houve falha de leitura protegida, de sessão MFA, de consulta ou de apresentação.

Nenhum valor, Lote individual, dado comercial ou conteúdo de fonte privada foi transcrito neste registro. A investigação seguirá a cadeia de leitura protegida e não executará mutações de Lote, política, referência de preço, área, disponibilidade, venda, contrato ou financeiro.

## Causa confirmada e correção de apresentação

A cadeia de referências internas permanece no servidor e exige MFA TOTP recente para a consulta protegida. A atestação aceita a sessão reforçada por uma janela curta; depois desse período, a leitura é corretamente bloqueada, enquanto a matriz física continua disponível. A inspeção autenticada confirmou esse estado: os cartões não perderam dados, mas a sessão atual exige nova confirmação de MFA antes de liberar os valores.

O comportamento visual anterior reduzia esse bloqueio a traços nos campos de valor quando a pessoa chegava diretamente aos cartões, o que podia sugerir remoção dos valores. A apresentação foi corrigida para manter a área de preço estável, exibir **Protegido por MFA** e **Aguardando revalidação** nos próprios cartões e oferecer, no aviso da matriz, uma ação direta para Segurança e MFA seguida de atualização de leitura. A alteração não exibe cache após a expiração, não enfraquece MFA e não altera fonte, política, referência, área ou cálculo.

Na revalidação aberta para a correção, a confirmação do código atual não foi aceita pelo provedor. O fluxo preservado oferece vinculação adicional sem remoção do fator já existente; a nova vinculação será gerada somente na tela do navegador, terá validade temporária e exigirá confirmação local antes de poder liberar a leitura protegida.

A primeira tentativa de nova vinculação também foi recusada antes de exibir QR. A investigação isolou uma colisão evitável: o fluxo reenviava um nome fixo de fator que pode já existir em um autenticador verificado. A inscrição adicional passou a solicitar somente o tipo TOTP, sem reutilizar esse rótulo. O QR permanece temporário, em memória e visível apenas na tela de Segurança e MFA; fatores existentes não são removidos.

Na confirmação técnica, o provedor continuou a requerer um nome único mesmo quando o nome não era enviado explicitamente. O fluxo foi ajustado para gerar um identificador amigável aleatório exclusivamente a cada nova inscrição, evitando colisão com vínculos anteriores. Essa informação não é mostrada ao usuário e não é usada para conceder acesso; a confirmação por código local continua obrigatória.

Após a correção, a tela de Segurança e MFA foi recarregada e a confirmação de uso pessoal da inscrição adicional foi selecionada. A próxima etapa é solicitar ao provedor o QR temporário corrigido; não há inscrição concluída, sessão reforçada ou comando protegido liberado antes da confirmação do primeiro código pelo usuário.

A nova inscrição temporária foi gerada após a correção e confirmada diretamente pelo usuário na tela de Segurança e MFA. A tela passou a reconhecer MFA recente para a sessão. O QR deixa de ser necessário depois da confirmação; o autenticador permanece vinculado até eventual remoção explícita, enquanto os códigos temporários continuam girando normalmente. Nenhum QR, chave, código ou identificador de fator foi registrado neste documento.

Com MFA recente, a jornada autenticada de Loteamentos voltou a exibir a leitura protegida como disponível. Os cartões físicos voltaram a apresentar preço-base interno por m² e total referencial calculado para os itens com referência explícita, mantendo a exceção intencionalmente sem valor vazia e sem estimativa. A matriz física, a área, a jornada de Cadastro, a rota interna de Estoque/Mapa, a ficha física, o perfil interno A269 e as fronteiras sem efeito comercial permaneceram acessíveis; nenhum comando material foi acionado durante a inspeção.

Uma nova leitura da jornada autenticada confirmou também que os indicadores físicos agregados, filtros locais, reservas físicas segregadas, edição física por Lote e por Quadra, política preparada e perfil interno de estoque continuam presentes após a restauração. A inspeção foi exclusivamente de leitura; não houve seleção, gravação, aprovação, publicação, ajuste de preço, reserva comercial, venda, contrato ou operação financeira.

## Validação e entrega

Os testes específicos de cartão de Lote e vinculação adicional de MFA passaram, assim como a validação integral de **226 arquivos de teste e 615 testes**, tipagem, build de publicação e integridade do diff. O build apresentou apenas o aviso conhecido de pacotes grandes, sem falha. A revisão responsiva em tela ampla, tablet e celular confirmou legibilidade, fluxo vertical e controles visíveis nas telas de Loteamentos e Segurança/MFA; a leitura de valores reais foi validada exclusivamente na sessão autenticada.

O ZIP de código e o HTML autônomo A271 foram gerados depois do build e verificados quanto à presença, exclusões e saneamento. O ZIP exclui ambiente, dependências, logs, documentação interna e checklist; o HTML não contém credenciais, URLs de banco, hosts, endpoints, papel privilegiado ou marcadores de infraestrutura. Nenhuma publicação foi executada.
