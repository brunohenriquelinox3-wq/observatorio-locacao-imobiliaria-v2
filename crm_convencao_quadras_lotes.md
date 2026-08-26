# Convenção canônica — QUADRA como matriz dos LOTES

**Status:** `decisão_aprovada_pelo_usuário`  
**Regra estrutural:** toda **QUADRA** é a matriz organizadora dos seus **LOTES**. Cada lote pertence obrigatoriamente a uma única quadra dentro de sua fase/empreendimento.

## 1. Padrão de identificação

| Elemento | Padrão | Exemplo |
| --- | --- | --- |
| Quadra | `Q` + número da quadra. | `Q12` ou exibido como `Quadra 12`. |
| Lote | `L` + número do lote dentro da sua quadra. | `L1`, `L2`, `L3` até `L100`. |
| Código exibido do lote | `Qn · Ln`. | `Q12 · L1`, `Q12 · L2`, `Q12 · L100`. |
| Caminho completo | Empreendimento → Fase → Quadra → Lote. | `Residencial Horizonte → Fase 2 → Q12 → L1`. |

> **Exemplo aprovado:** uma `Quadra 12` pode possuir `Lote 1`, `Lote 2`, `Lote 3` e assim sucessivamente até `Lote 100`. O código `Q12 · L1` identifica o primeiro lote da Quadra 12.

## 2. Regras de cadastro

| Regra | Resultado esperado |
| --- | --- |
| A quadra é criada antes dos lotes. | Não existe lote sem `Quadra` matriz. |
| O lote recebe número local dentro da quadra. | `L1` pode existir em `Q12` e em `Q13`, mas o código completo permanece único: `Q12 · L1` ≠ `Q13 · L1`. |
| Uma quadra suporta de 1 até 100 lotes na convenção atual. | O sistema não cria 100 lotes automaticamente; cria somente os lotes realmente cadastrados e impede ultrapassar o limite aprovado. |
| O número de lote não pode repetir dentro da mesma quadra. | Não há dois registros `Q12 · L1`. |
| Quadra e lote respeitam ordenação numérica. | `L2` aparece antes de `L10`, sem ordenação alfabética incorreta. |
| A identificação é estrutural, não financeira. | Alterar condição comercial, preço, reserva ou carteira não muda `Q12 · L1`. |

## 3. Separação entre Cadastro e Estoque/Mapa

| Setor | Responsabilidade sobre Quadra/Lote |
| --- | --- |
| **Cadastro de Loteamentos** | Cria empreendimento, fase, quadra e lote; registra atributos físicos, área, documentos, referências, parâmetros e vínculo estrutural. |
| **Estoque/Mapa de Lotes** | Exibe os lotes já cadastrados por quadra; opera mapa, disponibilidade, tabela vigente, hold, reserva, proposta, contrato, restrição, alocação e situação comercial. |

O Estoque/Mapa **não cria uma segunda versão** de `Q12 · L1`. Ele projeta a situação operacional do mesmo lote criado no Cadastro de Loteamentos.

## 4. Preservação de histórico

| Evento | Regra |
| --- | --- |
| Lote em proposta, reserva, contrato, carteira ou repasse. | O código estrutural da quadra/lote não é reaproveitado silenciosamente para outro objeto. |
| Correção de nomenclatura autorizada. | Mantém ID interno imutável, registra nome/código anterior, motivo, data, owner e referência de auditoria. |
| Distrato ou retorno de estoque. | O lote retorna ao Estoque/Mapa quando autorizado, conservando `Qn · Ln`, contrato, caso e histórico. |
| Alteração física/registral relevante. | Abre evidência, versão ou caso; não sobrescreve o passado apenas para atualizar o mapa. |

## 5. Critérios de aceite futuros

| Cenário | Deve permitir | Deve negar |
| --- | --- | --- |
| Criar `Q12 · L1` depois de cadastrar `Quadra 12`. | Sim, se a quadra pertence à fase/empreendimento atual e o número está livre. | Não criar sem quadra, em outra organização ou com lote duplicado. |
| Criar `Q12 · L101`. | Não. | A convenção atual limita a 100 lotes por quadra. |
| Visualizar o mapa da `Q12`. | Mostrar apenas os lotes existentes de `L1` até o último cadastrado, com situação operacional permitida. | Não inventar lotes ausentes ou expor lote de empreendimento/organização fora do escopo. |
| Reservar `Q12 · L1`. | Sim, se o lote é elegível. | Não se a restrição, alocação, reserva concorrente, contrato ou evidência impeditiva bloquear a operação. |

## Referências internas

[1] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)

[2] [Loteadora, recebíveis e distribuição](crm_loteadora_recebiveis_distribuicao.md)

[3] [Matriz da auditoria final de Loteadora](loteadora_matriz_auditoria_final_setores.md)
