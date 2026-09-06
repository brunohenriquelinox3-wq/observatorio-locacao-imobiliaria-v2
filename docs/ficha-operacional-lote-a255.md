# Ficha operacional editável por Lote — A255

## Escopo permitido

A ficha reúne **área**, **frente**, **profundidade**, **tipologia**, **posição**, **finalidade física** e uma observação interna curta. Todos os campos são resolvidos pelo servidor a partir de empreendimento, Quadra e Lote; não há atalho por identificador técnico do banco.

| Grupo | Permitido | Bloqueado |
|---|---|---|
| Matriz física | Medidas, tipologia e posição | Estimativas automáticas |
| Finalidade física | Reserva patrimonial e infraestrutura técnica | Disponibilidade e venda |
| Observação interna | Texto operacional curto e saneado | Dados pessoais, preço, contrato, cobrança e pagamento |

## Governança

O salvamento exige alçada ativa, MFA TOTP recente, contexto de organização, finalidade autorizada, correlação idempotente e auditoria redigida. A nota não é gravada em auditoria; a auditoria registra somente que uma observação interna existe.

> A ficha não preencheu nem alterou qualquer Lote do Vista do Sol durante o desenvolvimento.

## Validação

A validação integral A255 aprovou **219 arquivos de teste** e **584 testes**, além de tipagem, build Netlify e integridade de diff. Permaneceu apenas o aviso não bloqueante de chunks grandes.
