# A276 — MFA no login e sessão autorizada

## Decisão solicitada

Por ordem explícita do proprietário, o MFA TOTP passa a ser confirmado na autenticação do login e sustenta a sessão enquanto o token AAL2 permanecer válido. O CRM não solicita novo código a cada consulta, edição, preparação, aprovação, anexo ou outro comando permitido durante essa mesma sessão.

## Limites preservados

Esta alteração não cria acesso por interface. O servidor continua verificando identidade, sessão válida, organização, contexto ativo, membership, grant, escopo, finalidade, correlação, idempotência, auditoria e policy em cada operação. Logout, expiração ou invalidação do token encerram a autorização e exigem novo login com MFA.

## Implementação

A atestação server-side continua exigindo token validado pelo provedor, identidade confirmada, AAL2 e método TOTP. Foi removido somente o limite temporal por comando; a sessão autenticada é a fronteira temporal. Os comandos existentes continuam protegidos pelo mesmo helper, agora com semântica de sessão. Os uploads privados usam a mesma atestação de token e também deixam de depender de recência por operação.

No cliente, a tela de Segurança/MFA e o estúdio passaram a reconhecer o MFA da sessão, não a recência de um código. Cartões de preço e painel de estoque refletem a leitura e a gravação permitidas durante a sessão autorizada, sem esconder informações ou exigir novo desafio.

## Validação dirigida

Os testes confirmam que token AAL2/TOTP válido, ainda que não recente, permanece atestado enquanto o provedor aceita a sessão; tokens sem AAL2/TOTP ou identidade confirmada continuam bloqueados. As rotas materiais mantêm procedure protegida e o guarda de atestação da sessão. Nenhuma mutação real foi executada durante a validação.

A sessão autenticada também confirmou que cartões de Lote, referência interna e painel operacional continuam disponíveis após navegação, sem novo desafio MFA. A validação dirigida aprovou oito arquivos e quarenta e dois testes, além da tipagem e da integridade do diff. O fluxo material foi verificado por cobertura de política e abertura segura de controles, sem preenchimento ou confirmação de qualquer comando real.

## Validação integral e entrega

A validação integral aprovou **230 arquivos de teste e 623 testes**, além de tipagem, build de publicação e integridade do diff. A tela de Segurança/MFA foi revisada em sessão autenticada e exibiu explicitamente que o MFA do login permanece reconhecido até logout, expiração ou invalidação. O build emitiu apenas o aviso conhecido de pacotes grandes, sem falha de compilação.

O ZIP de código e o HTML autônomo A276 foram gerados e verificados quanto à presença, exclusões e saneamento. O ZIP exclui ambiente, dependências, logs, documentos internos e checklist. O HTML não contém credenciais, URLs de banco, hosts, endpoints, papel privilegiado ou marcadores de infraestrutura. Não houve publicação nem mutação de dados.
