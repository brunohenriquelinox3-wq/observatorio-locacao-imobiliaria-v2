# Financeiro da Loteadora — lote interno de parcelas

## Finalidade

Este marco transforma a agenda de parcelas já formalizada em um **lote interno de boletos** somente depois da aprovação comercial da venda. O termo “boleto” é usado aqui como referência operacional da parcela negociada; o CRM não gera código de barras, linha digitável, remessa, registro bancário, PDF bancário, cobrança externa, mensagem, baixa ou pagamento.

## Fonte e gatilho

O lote é derivado exclusivamente das parcelas imutáveis já presentes na agenda interna do contrato aprovado. A aprovação comercial continua exigindo sessão AAL2, contexto autorizado, lote disponível, contrato em revisão e dossiê privado revisado por uma pessoa. No mesmo comando transacional que marca o lote como vendido, o sistema cria um único lote interno associado ao contrato, evitando divergência entre venda, estoque e agenda.

| Elemento | Regra de integridade |
| --- | --- |
| Origem | Agenda A293 do contrato interno aprovado. |
| Gatilho | Aprovação explícita da venda; não é criado em tela, busca ou simples visualização. |
| Itens | Uma referência interna para cada parcela existente; nenhum valor é recalculado. |
| Estado inicial | `released_internal_control`, indicando que o lote está disponível para controle humano. |
| Idempotência | Um único lote por organização e contrato; repetição do comando devolve o mesmo resultado auditado. |
| Reversão | Solicitação de reversão comercial não apaga nem libera automaticamente o lote; a revisão humana continua governada. |

## Controles e privacidade

As tabelas terão RLS habilitado e execução restrita ao caminho de serviço protegido. Toda leitura ou comando valida identidade, organização, módulo, finalidade, membership, grant, vigência, sessão AAL2, correlação e auditoria redigida. O lote expõe apenas totais, contagem, estado e referências internas necessárias ao operador autorizado; dados pessoais, arquivos do dossiê, URLs, chaves e conteúdo documental permanecem fora da superfície financeira.

## Limites inegociáveis

> O Financeiro da Loteadora é uma camada de controle interno. A equipe usa o lote para conferir a negociação, acompanhar prazos e lembrar o operador de cobrar manualmente. Nenhuma ação da camada emite boleto bancário, dispara mensagem, acessa banco, dá baixa ou reconhece pagamento.

## Migração preservativa

A implementação cria estruturas aditivas e substitui a função de aprovação somente para acrescentar a criação atômica do lote interno. Nenhuma rota, agenda, contrato, estado de estoque ou dossiê existente é removido. A superfície financeira antes bloqueada passa a mostrar lotes internos liberados e também mantém um estado vazio explícito quando ainda não houver venda aprovada.
