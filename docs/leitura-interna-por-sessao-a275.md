# A275 — Leitura interna vinculada à sessão autenticada

## Objetivo

Eliminar a repetição de confirmação MFA para consultas internas durante uma sessão autenticada e autorizada, sem mudar a política de comandos materiais. A mudança responde à experiência de uso observada nos cartões de Lote e no editor contextual: valores internos autorizados não devem aparentar ter sido removidos enquanto a sessão de trabalho permanece válida.

## Decisão de política

As consultas internas de referência por m², total referencial e perfil operacional passaram a usar a sessão autenticada, o contexto autorizado e as verificações de organização, identidade, membership, grant, escopo e finalidade já aplicadas pelos serviços. Não recebem alçada adicional da interface e não expõem preço comercial, disponibilidade, venda, proposta, cliente, contrato ou financeiro.

MFA TOTP recente continua obrigatório no servidor para todos os comandos materiais: criação ou alteração de estrutura, ficha física, reserva física, perfil interno, política ou condição de preço, evidência, permissão, contrato e financeiro. O login não concede alçada, e o logout ou a invalidação real da sessão encerram também a leitura.

## Implementação preservativa

O roteador mantém as mesmas rotas e serviços. Foram flexibilizadas apenas duas consultas internas de leitura; as mutações correspondentes continuam com o mesmo guarda MFA recente. O estúdio deixa de tratar uma consulta de referência interna como pendência de MFA após a confirmação de sessão e mantém o estado de indisponibilidade somente para falhas reais de consulta. O painel de estoque agora informa explicitamente: leitura na sessão, gravação sob MFA.

## Validação

A sessão autenticada confirmou que os cartões exibem novamente as referências internas e os totais referenciais após o carregamento da jornada, sem novo desafio MFA. O painel de estoque também ficou disponível para leitura. Nenhuma edição, preparação, salvamento, aprovação, publicação ou mudança de preço foi executada.

A política foi coberta por teste que exige consultas internas sem guarda de MFA recente e preserva o mesmo guarda nas mutações de perfil, condição de preço e ficha física. A validação integral aprovou **229 arquivos de teste e 621 testes**, além de tipagem, build de publicação e integridade do diff. O build apresentou apenas o aviso conhecido de pacotes grandes, sem falha.

O ZIP de código e o HTML autônomo A275 foram gerados e aprovados nas verificações de presença, exclusões e saneamento. O ZIP exclui ambiente, dependências, logs, documentos internos e checklist. O HTML não contém credenciais, URLs de banco, hosts, endpoints, papel privilegiado ou marcadores de infraestrutura. Não houve publicação.
