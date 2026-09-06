# Correção manual governada de preço-base — A238

> **Finalidade limitada.** Este fluxo atende a uma lacuna de preço-base explicitamente identificada pelo CRM. Ele não constitui proposta, preço de contrato, disponibilidade, reserva, venda, receita, cobrança, pagamento ou repasse.

## Regra de entrada

A pessoa operadora pode informar manualmente um preço-base por m² somente quando houver uma pendência explícita na política em Preparação e uma fonte interna declarada. O sistema exige Quadra, número de Lote, preço-base positivo em BRL, motivo operacional e estado do respaldo documental. Fórmulas, médias, cópia de outro Lote e estimativas ficam proibidas.

## Guardas de autoridade

| Controle | Regra aplicada |
|---|---|
| Identidade e organização | O comando exige subject atual e organização ativa. |
| Contexto e finalidade | O servidor reaplica módulo, finalidade, membership, grant e policy. |
| MFA recente | A preparação manual é negada sem MFA TOTP/AAL2 dentro da janela do servidor. |
| Físico | Quadra e Lote são resolvidos somente no servidor; a área precisa existir na matriz física. |
| Integridade | A política de origem deve estar em Preparação, ter exatamente uma exceção e não conter a linha já corrigida. |
| Auditoria | Correlação e idempotência evitam duplicação; o evento guarda apenas metadados redigidos. |
| Segregação | A nova versão permanece Preparada e segue o encaminhamento/aprovação por pessoa distinta. |

## Efeito previsto

A correção cria uma **nova versão preparada** derivada da política anterior, preservando todas as linhas existentes e acrescentando somente a linha manualmente declarada. A fonte original não é modificada. O novo estado não disponibiliza preço, não altera Lotes e não permite referência comercial até passar pelas transições normais de validação e aprovação.

## Reforço explícito de RLS — A239

As condições de preço receberam políticas RLS restritivas de negação para `anon` e `authenticated`, ambas com `using (false)` e `with check (false)`. O único caminho permitido continua sendo a função `SECURITY DEFINER`, executada pelo serviço protegido. A verificação de segurança posterior confirmou que a tabela de condições deixou de ser sinalizada por ausência de política, sem criar ou alterar condição, política, preço ou outro dado comercial.

## Validação

Os testes de serviço, migração e interface da correção manual e das condições foram aprovados. A validação integral aprovou 216 arquivos de teste e 551 testes, além da tipagem, build Netlify e integridade de diff. O build manteve apenas o aviso não bloqueante já conhecido sobre chunks grandes.
