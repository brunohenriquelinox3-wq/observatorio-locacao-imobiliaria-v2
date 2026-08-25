# Matriz de fontes e materialidade — núcleo financeiro do CRM

**Referência temporal do estudo:** agosto de 2026. A matriz é um roteiro de pesquisa e modelagem; não determina regime tributário, contabilização ou obrigação de uma empresa específica.

## Tese de arquitetura

O CRM financeiro deve operar como um **subledger operacional e de evidências**: ele origina eventos de negócio, obrigações, regras de distribuição, estados de cobrança e referências documentais. A instituição de pagamento executa a liquidação; o banco mantém o extrato; o ERP/contabilidade mantém a escrituração e os livros; os responsáveis contábil, fiscal, financeiro e jurídico revisam as decisões que dependem de contrato, regime, município, empresa ou período.

| Camada | Pergunta que responde | Sistema de verdade predominante | O que o CRM financeiro deve preservar |
| --- | --- | --- | --- |
| Negócio | O que foi vendido, locado, reservado, cedido ou distratado? | CRM e instrumentos do negócio | Evento, ativo/lote, partes, versão de proposta/contrato, condição e evidência. |
| Obrigações | Quem deve pagar, receber ou aprovar; quanto; quando; em qual condição? | Subledger operacional | Parcela, regra, recebedor, gatilho, vencimento, estado e vinculação ao negócio. |
| Liquidação | O dinheiro foi cobrado, pago, devolvido ou estornado? | Banco / instituição de pagamento | Referência externa, evento de conciliação, status, divergência e trilha. |
| Fiscal | Como o evento deve ser documentado e reportado? | Fiscal/ERP e contador | Classificação pendente/aprovada, competência, referência da nota/declaração e exceção. |
| Contábil | Como o evento foi reconhecido no livro? | ERP contábil e contador | Mapeamento de evento, status de exportação, lote, retorno e divergência. |
| Societário | Quem representa, participa, aprova ou recebe por condição societária? | Junta/atos, jurídico e contabilidade | Poder, vigência, instrumento, centro de responsabilidade e regra aprovada. |

## Linhas de negócio e materialidade

| Linha | Eventos que precisam nascer no núcleo | Sensibilidades principais |
| --- | --- | --- |
| Imobiliária — locação | Aluguel, condomínio/IPTU quando administrados, taxa, comissão, repasse ao proprietário, garantia, cobrança e encerramento | Receita própria versus valores de terceiros; mandato; reembolso; conciliação por imóvel/contrato. |
| Imobiliária — venda | Reserva, sinal, comissão, captação, proposta, escritura, repasse, distrato e reembolso | Condição suspensiva, corretagem, retenções e repasses condicionados ao fechamento. |
| Loteadora / SPE | Reserva, contrato, entrada, parcela, correção, juros/multa, aditivo, cessão, distrato, retomada, quitação e escritura | Estoque versus carteira; recebível de longo prazo; permuta; alocação do lote; receita/tributação por configuração e período. |
| Desenvolvimento/terra | Aquisição, option, permuta física/financeira, obra, garantia, fornecedor, rateio e aprovação | Cadeia dominial, contrato, obra, custo por empreendimento e obrigações futuras. |
| Sócios/parceiros | Aporte, distribuição, remuneração contratual, partilha de resultado, crédito de permuta e acerto | Natureza econômica e contábil distinta de comissão ou pagamento comercial. |

## Matriz de fontes primárias a consultar

| Tema | Fontes de referência prioritárias | Produto da pesquisa |
| --- | --- | --- |
| Escrituração e declarações federais | Receita Federal, Portal SPED, manuais oficiais de ECD, ECF, EFD-Reinf, EFD-Contribuições, eSocial e DCTFWeb/MIT | Calendário/escopo versionados por obrigação, tipo de empresa e competência. |
| Nota fiscal e municipalidade | Portal da Nota Fiscal de Serviço eletrônica padrão nacional, prefeitura competente, legislação municipal aplicável | Matriz por município: emissor, serviço, NFS-e, retenção e integração. |
| Regimes e tributos | Planalto, Receita Federal e normas oficiais que estejam vigentes no período | Regras como configuração com fonte, vigência, empresa e revisor; nunca taxa hardcoded. |
| Contabilidade | Conselho Federal de Contabilidade, Comitê de Pronunciamentos Contábeis e normas adotadas | Mapa evento operacional → conta/reconhecimento a revisar pelo contador. |
| Junta Comercial e atos | Lei do Registro Público de Empresas Mercantis, DREI/Redesim e Junta competente | Dossiê societário, poderes, SPE, alterações e status de arquivamento. |
| Pagamentos, Pix e boleto | Banco Central, arranjos/instituições habilitadas e contratos do provedor | Fronteira entre orquestração de regra e liquidação por instituição autorizada. |
| PLD/FT e risco | COAF, normas setoriais, contrato do provedor e política interna | Casos e alertas humanos, não bloqueios decisórios cegos. |
| Recebíveis/cessão | Banco Central, CVM quando aplicável, contrato e jurídico especializado | Registro de carteira, cessão, garantia e evento, sem estruturar operação regulada no CRM. |

## Critérios de validade de uma regra

| Critério | Campo obrigatório no centro de evidências |
| --- | --- |
| Origem | Emissor, URL/arquivo e nível da fonte: legal, regulatório, fiscal, municipal, contábil, contratual ou política interna. |
| Tempo | Data de captura, vigência inicial/final, competência e próxima revisão. |
| Escopo | Empresa, CNPJ/SPE, estado/município, regime, produto, tipo de contrato e evento afetado. |
| Interpretação | Texto da regra, limitação, responsável técnico e se é fato, hipótese ou política interna. |
| Impacto | Formulário, cálculo, integração, relatório, acesso, contrato, trilha ou não aplicável. |
| Aprovação | Estado proposto/em revisão/aprovado/arquivado, aprovador e versão. |

## Convenções de modelagem financeira

1. Todo valor deve ter moeda, precisão, competência/evento, entidade econômica, empreendimento quando aplicável, origem e estado; valores monetários não podem ser apenas campos em um contrato.
2. Todo recebedor deve ser uma parte vinculada por uma base econômica explícita: comissão, preço, permuta, despesa, distribuição, reembolso ou outra categoria configurável. “Percentual” não é uma natureza contábil.
3. Todo split deve gerar uma proposta de distribuição imutável por versão, com recebedores, fórmula, arredondamento, teto/piso, gatilho, evidência e aprovadores; a execução só ocorre por parceiro de pagamento/instrução autorizada e retorno conciliado.
4. Todo lançamento operacional deve suportar reversão por evento compensatório, e não alteração silenciosa de valores liquidados ou reportados.
5. O contador não recebe acesso irrestrito por padrão; recebe uma área com escopo, empresa, período, relatórios, exportações, divergências e trilha de auditoria adequados à sua função.
