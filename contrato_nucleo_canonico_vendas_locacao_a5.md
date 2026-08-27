# Contrato do núcleo canônico A5 — Vendas Urbanas e Locação

**Escopo:** este contrato torna executável a fundação estratégica de contexto, Party e papel temporal. Ele não cadastra dados reais, documentos, identificadores fiscais, localização precisa, imóveis produtivos, contratos, financeiro, portal ou integração externa. [1]

| Elemento | Contrato A5 | Negação obrigatória |
| --- | --- | --- |
| Contexto | Toda operação informa `organization_id`, módulo (`vendas_urbanas` ou `locacao`) e `purpose_code`. | URL, nome, sessão, filtro ou identificador isolado não inferem tenant, módulo ou finalidade. |
| Party | Uma Party tem somente tipo, nome de exibição, origem declarada e estado de rascunho. | Não recebe CPF/CNPJ, e-mail, telefone, dossiê, score, consentimento, representação ou status contratual neste marco. |
| Papel temporal | `PartyRole` relaciona Party, organização, módulo, papel e vigência. | Papel não concede login, grant, visibilidade global, representação, responsabilidade financeira nem portal. |
| Rascunho | Criação é idempotente por correlação e é registrada em evento redigido. | Repetir comando não duplica Party/papel; falha não revela se a Party ou a organização existe. |
| Leitura | A leitura é filtrada por organização, módulo, papel vigente e finalidade pelo servidor. | Navegador não lê tabelas diretamente nem recebe dossiê/identificador pessoal. |

> **Decisão de corte:** A5 prepara a linguagem comum de Vendas Urbanas e Locação. A estratégia continua separando Party, papel, representação, imóvel, contrato, dossiê, evento e projeção; portanto, nenhum desses conceitos é simplificado em um único cadastro.

## Referências internas

[1] [Fundação compartilhada — Vendas Urbanas e Locação](caderno_fundacao_compartilhada_vendas_locacao.md)

[2] [Estratégia atualizada — Vendas Urbanas e Locação](estrategia_vendas_urbanas_locacao_atualizada.md)
