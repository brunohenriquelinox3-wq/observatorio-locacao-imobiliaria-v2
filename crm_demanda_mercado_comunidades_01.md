# DEM-CRM-01 — concorrência, comunidades e dores operacionais

**Captura:** 25 de agosto de 2026.  
**Estado:** `catalogado` — sinais públicos preservados; nenhum sinal isolado cria requisito obrigatório sem confronto e piloto.

## 1. Filtro analítico obrigatório

| Critério | Pergunta | Efeito na decisão |
| --- | --- | --- |
| Origem | É relato de operador, publicação de fornecedor, fórum moderado, suporte oficial ou pesquisa? | Define confiança inicial; marketing não vale como prova de resultado. |
| Independência | A fonte vende a própria solução ou relata problema sem vínculo conhecido? | Reduz peso de alegação comercial isolada. |
| Contexto | Segmento, país, volume, jornada, versão e canais são claros? | Evita importar dores de outro mercado como regra brasileira. |
| Recorrência | O mesmo problema aparece em fontes diferentes e em pilotos? | Aumenta prioridade quando há convergência, não apenas repetição publicitária. |
| Falsificabilidade | Há uma métrica, caso de teste ou pergunta de piloto? | Converte “dor” em hipótese mensurável. |
| Risco de cópia | A solução sugerida cria lock-in, exposição de dados ou regra financeira inadequada? | Exige avaliação técnica, jurídica e de segurança antes de adotar. |

## 2. Sinais capturados

| Fonte | Tipo/confiança | Sinal observado | Leitura limitada |
| --- | --- | --- | --- |
| Discussão em `r/RealEstateTechnology` | Comunitária, **baixa**: publicação de fundador sem respostas relevantes no recorte capturado. | O post enquadra multiplicidade de ferramentas, leads distribuídos e follow-up manual como hipóteses de dor. | Serve apenas para formular perguntas de piloto; não é prova de prevalência nem de adequação ao mercado brasileiro. [1] |
| CV CRM, artigo atualizado em 2025 | Fornecedor concorrente, **média para mensagem comercial**, baixa para eficácia independente. | Perda de leads, fluxos confusos, muitas unidades, reservas duplicadas, assinatura, pós-venda e fragmentação são listados como problemas. | Corrobora o piso de mercado já registrado; reserva concorrente e integração devem continuar com invariantes e testes, não apenas visualização. [2] |
| C2S/Contact2sale, artigo de 2026 | Fornecedor, **média para dor declarada**, baixa para causalidade. | Separação entre site, CRM e portais é associada a duplicidade, anúncio desatualizado, inconsistência e retrabalho. | Convergência com outro fornecedor indica hipótese de sincronização/linhagem; não justifica centralização cega ou eliminação de APIs externas. [3] |

## 3. Hipóteses que merecem piloto

| ID | Hipótese | Métrica e teste de piloto | Proteção contra decisão precipitada |
| --- | --- | --- | --- |
| DEM-01 | Lead sem owner, SLA ou próximo passo perde prioridade de atendimento. | Percentual de lead sem responsável, sem próxima ação e tempo até primeiro contato por canal. | Não automatizar contato sem finalidade, consentimento/política e controle de frequência. |
| DEM-02 | Divergência entre estoque interno, site e portal gera risco comercial e reputacional. | Diferença por unidade/publicação, tempo de propagação, conflito de versão e correção manual. | Tratar CRM como autoridade por objeto/política, com outbox, data de corte e exceção — não promessa vaga de “tempo real”. |
| DEM-03 | Reserva concorrente é risco operacional prioritário em vendas e loteadora. | Tentativas concorrentes, bloqueios, expiração, confirmação e reversão por unidade. | Exigir lock/versão/estado, alçada e log; interface não pode fingir disponibilidade. |
| DEM-04 | Fragmentação de ferramentas aumenta retrabalho, mas centralização excessiva pode ampliar raio de falha. | Número de reentradas, reconciliações manuais, incidentes e autonomia de cada domínio. | Manter fonte de verdade, contratos de evento e fallback manual por integração. |
| DEM-05 | Pós-venda e carteira precisam de continuidade, não apenas histórico comercial. | Pendências, solicitações, acordos, segunda via, canais e tempo de resolução por contrato. | Restringir dados por finalidade, papel e etapa; não abrir carteira completa a todos os canais. |

## 4. Conclusão de produto

Os sinais públicos reafirmam o piso competitivo já mapeado — lead, atendimento, estoque, reserva, proposta, assinatura, portais, pós-venda e integração — mas não alteram o diferencial principal do CRM proposto: **relações, direitos econômicos, evidências e exceções explicáveis**. A rotina permanente deve procurar entrevistas e pilotos com imobiliárias e loteadoras antes de elevar as hipóteses `DEM-*` a compromisso de produto.

## Referências

[1] [Reddit — Biggest Pain Points You Think Automation/Technology Can Solve](https://www.reddit.com/r/RealEstateTechnology/comments/1g8czch/biggest_pain_points_you_think/)  
[2] [CV CRM — Os 9 problemas comerciais que um CRM imobiliário pode resolver](https://cvcrm.com.br/blog/os-9-problemas-comerciais-que-um-crm-imobiliario-pode-resolver/)  
[3] [Contact2sale — Site imobiliário integrado ao CRM](https://www.contact2sale.com/blog/site-imobiliario-e-crm/)
