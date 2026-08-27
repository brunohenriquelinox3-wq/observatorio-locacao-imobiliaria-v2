# Protocolo de auditoria prática — CRM de referência

**Status:** `autorizado_pelo_usuário_para_execução_controlada`  
**Objetivo:** testar fluxos de Vendas Urbanas e Locação com dados sintéticos e, quando o usuário autorizar explicitamente, realizar leitura estrutural controlada de superfícies que contenham registros, sem alterar registros existentes, reter identificadores individuais ou gerar efeitos externos.
**Identificador de todos os registros de teste:** `TESTE DE AUDITORIA — NÃO OPERACIONAL` mais um sufixo de frente e sequência, por exemplo `VU-01` ou `LC-01`.

> **Regra de parada:** se uma tela puder enviar mensagem, publicar anúncio, disparar e-mail/SMS/WhatsApp, gerar cobrança, acionar parceiro, importar documento/planilha, alterar registro existente ou usar informação real, o teste para antes do comando e o comportamento é registrado como não testado por risco.

> **Leitura estrutural autorizada:** a autorização para leitura não transforma dados exibidos em evidência reproduzível. Durante a inspeção de listas ou fichas, registrar somente a estrutura, os controles, os estados e os riscos agregados. Não transcrever nomes, telefones, e-mails, endereços, documentos, identificadores, valores individuais, mídias ou qualquer dado que permita reconhecer uma pessoa ou um registro.

## 1. Dados sintéticos e isolamento

| Tipo de registro | Nome/rótulo permitido | Dados proibidos | Finalidade |
| --- | --- | --- | --- |
| Cliente/locatário/comprador | `TESTE DE AUDITORIA — NÃO OPERACIONAL — VU/LC` | Nome real, CPF/CNPJ real, telefone real, e-mail que entregue mensagem, endereço real ou documento de terceiro. | Avaliar campos, validações, estados e relação com fluxo. |
| Proprietário | `TESTE DE AUDITORIA — NÃO OPERACIONAL — PROPRIETÁRIO` | Qualquer parte/proprietário existente, contato real, conta bancária ou documento. | Avaliar separação entre parte interessada e proprietário. |
| Imóvel | `TESTE DE AUDITORIA — NÃO OPERACIONAL — IMÓVEL` | Endereço de imóvel real, chave real, mídia real, portal/publicação, preço comercial ou matrícula de terceiro. | Avaliar formulário, estados, vínculo de proprietário e disponibilidade. |
| Visita, atividade, negócio, proposta ou serviço | Mesmo identificador no título/observação. | Convite, agenda externa, comunicação, contrato real, cobrança, parceiro ou prestador real. | Avaliar transições e bloqueios de telas internas. |
| Prestador/financiamento/sinistro | Somente se a interface permitir registro sem dado real e sem contato externo. | CPF/CNPJ real, dados bancários, seguradora/banco real, documentos ou operações. | Avaliar campos e estados, não executar operação. |

## 2. Limites de ação

| Permitido | Proibido |
| --- | --- |
| Abrir menu, listagem, detalhe e formulário; executar leitura estrutural controlada de telas autorizadas; preencher rascunho sintético; salvar somente registro claramente sintético; cancelar/sair; testar filtros locais; registrar erro/validação; apagar exclusivamente o registro sintético identificado ao fim, quando a tela permitir. | Criar/editar/excluir dado real; transcrever ou reter identificadores individuais; clicar em publicar, portal, mídia, importação, IA de contrato, enviar proposta, exportar, criar cobrança, registrar pagamento, repassar valor, convidar usuário, alterar cargo/permissão, criar integração, importar planilha/documento ou enviar qualquer comunicação. |

## 3. Sequência de execução por fluxo

| Ordem | Frente | Teste controlado | Critério de parada |
| --- | --- | --- | --- |
| 1 | Vendas Urbanas | Cliente sintético → proprietário sintético → imóvel sintético → visita/atividade → oportunidade/proposta em rascunho. | Campo obrigatório exigir dado real, comunicação, portal ou publicação. |
| 2 | Vendas Urbanas | Examinar financiamento apenas até rascunho/simulação interna, se for possível sem integração/consulta. | Formulário enviar consulta a banco/parceiro, requer CPF real ou cria operação externa. |
| 3 | Locação | Cliente/locatário sintético → proprietário sintético → imóvel sintético → negócio/contrato de locação em rascunho. | Criar cobrança, boleto, cobrança externa, mensagem ou documento real. |
| 4 | Locação | Caso de serviço/prestador sintético e estados de manutenção sem orçamento/pagamento. | Requer prestador real, orçamento externo, comunicação ou efeito financeiro. |
| 5 | Transversal | Filtros, ordenação, estados vazios/erro, permissões visíveis, documentos, ações em lote e dashboards em leitura. | Ação alterar massa de registros, exportar ou revelar dado de terceiro fora do escopo. |
| 6 | Limpeza | Localizar e apagar somente os itens com marcador completo de teste; registrar o resultado. | Qualquer dúvida sobre identidade do registro ou efeito sobre dado existente. |

## 4. Evidência a registrar em cada teste

| Campo de auditoria | Conteúdo obrigatório |
| --- | --- |
| Caso e contexto | Frente, tela, URL, data/hora, pré-condição e identificador sintético. |
| Interface | Campos, agrupamentos, obrigatoriedade, ajuda, máscara, estados, filtros, feedback, navegação e layout. |
| Regra observada | Validação, transição, duplicidade, comportamento de salvamento, retorno, aviso ou bloqueio. |
| Segurança/privacidade | Dados solicitados, visibilidade, acesso a documentos, ação em lote, exportação e possibilidade de escopo indevido. |
| Resultado | Sucesso, bloqueio, erro, limitação, efeito colateral inexistente/observado e hipótese de produto. |
| Limite de interpretação | O que o teste não prova — por exemplo conciliação, assinatura, emissão, autorização jurídica ou política de servidor. |

## 5. Critérios de limpeza e encerramento

Todo registro criado terá o prefixo completo no campo de título/nome/observação disponível. A exclusão será feita somente após verificar visualmente que o objeto é sintético e não possui dependência externa. Se a plataforma não permitir exclusão segura ou se uma relação impedir a remoção, o registro será mantido marcado como teste e o usuário será informado; não será forçada nenhuma remoção.

## Referência

[1] [Benchmark do CRM de referência](benchmark_hincrivel_vendas_locacao.md)
