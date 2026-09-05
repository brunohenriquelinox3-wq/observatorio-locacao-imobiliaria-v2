# Roteiro de homologação humana — Loteadora A178

**Objetivo:** confirmar a ordem setorial, a legibilidade e o comportamento fail-closed da coluna Loteadora antes de testes que exijam dados de rascunho.  
**Modo:** somente leitura, sem criação de massa de teste e sem interação com formulários.

> Esta homologação não autoriza criar, editar, excluir, importar ou exportar registros. Ela tampouco autoriza documentos, contratos, proposta, reserva, valores, cobrança, boletos, pagamentos, repasses, financeiro ou integrações.

## Preparação

Abra a prévia atual em uma janela regular e mantenha a organização **sem seleção**. Não escolha opções nos campos, não preencha formulários e não pressione botões. Caso um seletor esteja aberto, feche-o sem trocar a seleção.

| Item | Resultado esperado |
|---|---|
| Sessão | A sessão pode estar autenticada, mas não concede alçada. |
| Contexto | A tela informa que a leitura depende de contexto autorizado. |
| Dados | Não há nome de pessoa, contato, identificador fiscal, documento, arquivo ou informação financeira. |
| Ações | Os controles de rascunho ficam indisponíveis ou não são acionados. |

## Percurso de leitura

Abra as rotas abaixo, uma por vez, sem acionar qualquer elemento interativo. Após confirmar a tela, prossiga para a próxima rota.

| Ordem | Rota | Conferência visual mínima |
|---|---|---|
| 01 | `/loteadora` | Cadastro de Loteamentos como primeiro setor; ficha de preparação bloqueada sem contexto. |
| 02 | `/estoque-lotes` | Estoque/Mapa separado; Quadra como matriz; matriz estrutural sem estado comercial. |
| 03 | `/loteadora/clientes` | Clientes Loteadora separado; prontidão privada sem pessoa, documento ou arquivo. |
| 04 | `/loteadora/socios-parceiros` | Sócios e Parceiros separado; governança interna sem nomes, datas, valores ou percentuais. |
| 05 | `/loteadora/vendas` | Vendas de Lotes separado; preparação interna sem reserva, proposta, contrato ou financeiro. |
| 06 | Navegação lateral | Financeiro aparece como Setor 06 bloqueado e não concede acesso. |

## Critérios de aceite

O teste é aprovado se a ordem da coluna for preservada em todas as telas, se cada rota carregar sem 404, se os blocos recém-adicionados mantiverem mensagens explícitas de bloqueio sem contexto e se a navegação não exibir dados pessoais ou comerciais. Em dispositivo móvel, os mesmos blocos devem empilhar sem corte, sobreposição ou texto ilegível.

## Parada imediata

Interrompa o roteiro e informe apenas a rota e a mensagem genérica observada se qualquer uma das condições a seguir ocorrer: aparecimento de dados pessoais, documentos, dados de clientes, valores, contratos, disponibilidade comercial, cobrança ou pagamento; botão habilitado que possa registrar uma ação; erro que não seja a ausência esperada de contexto; rota 404; ou mudança inesperada de organização, contexto, módulo, finalidade ou sessão.

Não envie capturas que contenham dados de pessoas, documentos, códigos, URLs sensíveis, identificadores técnicos, dados financeiros ou mensagens completas de erro.

## Continuidade

Depois deste aceite somente de leitura, o próximo nível de teste exige ambiente isolado, dados fictícios aprovados e autorização separada por operação. Até lá, os setores permanecem prontos para navegação segura e revisão visual, não para cadastrar pessoas, Lotes, parceiros, vendas ou documentos.
