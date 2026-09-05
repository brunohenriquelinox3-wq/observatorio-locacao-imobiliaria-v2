# Procedimento de Reconciliação Estrutural — A208

> **Finalidade:** tornar explícita a divergência entre a referência declarada e a matriz física legível, sem criar Lotes por estimativa, sem ler dados comerciais e sem substituir validação humana, técnica, cartorial ou jurídica.

## Evidência disponível e resultado

| Fonte de referência | Dado físico aproveitável | Resultado |
|---|---|---|
| Matriz local revisada | 14 Quadras e 164 pares Quadra–Lote legíveis. | É a única estrutura física que pode permanecer registrada. |
| Total informado para o empreendimento | 165 Lotes. | Divergência de uma unidade, não conciliada. |
| Cadastro atual | 14 Quadras e 164 Lotes físicos persistidos. | Coerente com a fonte física revisada. |

Nenhuma dessas fontes prova a numeração, a localização, a área, a titularidade, a situação comercial ou a disponibilidade de um eventual Lote adicional. Portanto, o sistema deve bloquear sua inclusão até existir uma nova fonte física conciliada.

## Fluxo de reconciliação proposto

| Etapa | Pessoa responsável | Ação permitida | Proteção obrigatória |
|---|---|---|---|
| 1. Identificar | Operação autorizada | Registrar que existe divergência entre referência declarada e matriz lida. | Nota interna redigida; sem anexo ou dado comercial. |
| 2. Solicitar fonte | Responsável técnico ou administrativo habilitado | Apresentar uma fonte física que identifique Quadra, Lote e, quando disponível, área. | Documento segue o dossiê privado; nunca é enviado pelo fluxo de matriz local. |
| 3. Pré-visualizar | Operação autorizada | Ler localmente apenas Quadra, Lote e Área, verificar duplicidade, faixas e contagem. | Arquivo permanece no navegador; status, preço, vendas e dados pessoais são descartados. |
| 4. Comparar | Revisão humana | Comparar a prévia com a matriz salva e indicar se a divergência foi realmente resolvida. | Não há correção automática nem inferência de numeração. |
| 5. Aplicar | Administrador com alçada e MFA recente | Aplicar uma nova matriz somente quando a fonte estiver sem inconsistências e a confirmação humana for expressa. | Servidor revalida subject, MFA, organização, contexto, grant, finalidade, correlação e policy. |
| 6. Registrar resultado | Sistema | Atualizar o status da pendência com metadados redigidos. | Auditoria não registra conteúdo de arquivo, número de documento, preço, pessoa ou segredo. |

## Critérios de bloqueio

O aviso deve permanecer ativo quando a matriz lida divergir do total de referência, apresentar pares duplicados, não possuir cabeçalhos físicos suficientes, exceder os limites de Quadra/Lote ou não tiver confirmação humana. A ação **não** poderá concluir ou adicionar um Lote faltante com base apenas no total declarado.

## Limites deste marco

Este procedimento não autoriza nem implementa preço, disponibilidade, reserva, venda, compradores, corretores, contratos, comissões, cobrança, pagamentos, repasses ou integração externa. Ele não certifica aprovação, registro, regularidade ou condição jurídica do empreendimento.

## Evidência de interface

A revisão autenticada em modo leitura confirmou que o módulo Estrutura apresenta a seção **Reconciliação estrutural** entre a matriz já salva e a fonte física local. O aviso explica que não há criação automática, mostra o estado de revisão separadamente e direciona a pessoa operadora para a prévia física. Nenhum botão de inclusão de Lote, ação comercial ou dado documental foi exposto ou acionado durante a revisão.

## Validação técnica

A cobertura dirigida aprovou a orientação, o estado de revisão e a ausência de criação por estimativa. A validação integral aprovou **207 arquivos de teste e 503 testes**, além da tipagem, build compatível com Netlify e integridade do diff. O build apresentou somente o aviso não bloqueante de chunks grandes, sem erro de compilação ou execução.
