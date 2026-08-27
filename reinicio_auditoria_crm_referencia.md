# Reinício integral da auditoria do CRM de referência

**Status:** `auditoria_anterior_invalidada_para_decisão`  
**Motivo:** a varredura anterior abriu rotas e parte das superfícies, porém não demonstrou cada aba, estado, botão, filtro, modal, formulário e ação de maneira controlada. Seus achados permanecem apenas como histórico de tentativa e **não podem fundamentar atualização estratégica**.

> A nova auditoria só considera um controle coberto quando houver evidência individual de abertura/inspeção ou classificação explícita de bloqueado, inconclusivo ou não demonstrável.

## Limpeza dos testes sintéticos

| Item | Estado | Evidência | Próxima ação segura |
| --- | --- | --- | --- |
| Cliente sintético `LC-CLIENTE-01` | Removido com confirmação visual | O marcador integral foi verificado na lista; o modal irreversível foi aberto e confirmado sob a autorização prévia do usuário. A contagem caiu de dois para um cliente. | Nenhuma: não recriar nem pesquisar dados reais para validar a exclusão. |
| Cliente sintético `VU-CLIENTE-01` | Removido com confirmação visual | Após a primeira remoção, o último marcador integral foi novamente conferido, o modal irreversível foi aberto e confirmado sob a autorização prévia do usuário. A lista retornou a zero clientes e estado vazio. | Nenhuma: não recriar nem pesquisar dados reais para validar a exclusão. |
| Proprietário sintético de Locação | Removido com confirmação visual | O marcador integral foi localizado na lista, o modal irreversível foi aberto e confirmado sob a autorização prévia do usuário. A contagem diminuiu de cinco para quatro proprietários e o marcador deixou de ser exibido. | Nenhuma: não pesquisar nem alterar proprietários reais para validar a exclusão. |
| Imóvel sintético de Locação | Pendente de localização/remoção | A lista atual de Meus Imóveis foi aberta e uma busca foi executada somente com marcador sintético impossível no código; não houve correspondência. Nenhuma exclusão foi tentada e o catálogo foi restaurado. | Localizar o marcador integral por uma superfície apropriada antes de qualquer exclusão; não desvincular, editar ou alterar imóveis reais. |

## Regra de reinício

Nenhuma recomendação, comparação ou proposta anterior será apresentada como resultado do benchmark enquanto a matriz de controle não registrar cobertura individual de cada superfície acessível em Vendas Urbanas e Locação.
