# Restauração segura de Quadras arquivadas — A209

> **Princípio:** arquivar não apaga; restaurar reativa apenas o conjunto que foi arquivado junto, no mesmo rascunho autorizado, após confirmação explícita e nova validação server-side.

| Situação | Comportamento seguro |
|---|---|
| Arquivamento novo de uma Quadra | O sistema registra um retrato interno dos Lotes ativos que foram arquivados junto com a Quadra. |
| Restauração disponível | A área “Quadras arquivadas” mostra somente Quadras do rascunho e contexto atual que possuam retrato de arquivamento. |
| Restauração confirmada | O servidor reativa a Quadra e exclusivamente os Lotes do retrato; não gera numeração, área, disponibilidade ou preço. |
| Arquivo legado sem retrato | O CRM apresenta o item como histórico não restaurável automaticamente. A pessoa precisa revisar a matriz antes de uma ação controlada. |
| Tentativa fora do contexto ou com MFA vencido | O comando é negado pelo servidor, sem revelar dados de outros rascunhos. |

O fluxo não restaura vendas, reservas, contratos, preços, documentos, pessoas, cobrança, pagamento ou repasse. Todo comando exige subject ativo, MFA TOTP recente, organização ativa, contexto, grant, finalidade, correlação e policy.

## Implementação e revisão inicial

A migração A209 foi aplicada de forma aditiva no banco PostgreSQL conectado. Ela inclui uma leitura contextual de Quadras arquivadas e uma restauração idempotente, ambas com `SECURITY DEFINER`, `search_path` vazio, autoridade ativa, trava transacional, auditoria redigida e execução exclusiva de serviço. A restauração só altera o estado lógico da Quadra e dos Lotes já vinculados; não contém inserção de Lotes.

Em revisão autenticada, o módulo Estrutura passou a exibir **Quadras arquivadas** logo após as Quadras registradas. Quando não há arquivo no rascunho, a pessoa vê uma orientação explícita sobre onde o item aparecerá e que será possível restaurá-lo. Quando existir arquivo, a ação **Restaurar** exige confirmação antes do comando protegido. Nenhuma Quadra real foi arquivada ou restaurada durante o desenvolvimento.

## Validação

Os testes dirigidos cobriram a ausência de identidade, serialização contextual, listagem redigida e restauração com contagem agregada. A validação integral aprovou **208 arquivos de teste e 506 testes**, além de tipagem, build compatível com Netlify e integridade do diff. O build apresentou somente o aviso não bloqueante de chunks grandes.
