# Inventário dos domínios materiais da Loteadora — A179

**Data:** 05 de setembro de 2026  
**Escopo:** leitura de código e arquitetura atual. Não houve leitura de dados de negócio, criação de transação, comando financeiro, contrato ou integração externa.

| Domínio futuro | Estado atual | Bloqueio preservado |
|---|---|---|
| Financeiro | Setor 06 visível na navegação, com rota e apresentação explicitamente bloqueadas. | Não há query, tabela, RPC, formulário ou comando de valores, recebíveis, gastos, lucro, boleto, cobrança, pagamento ou repasse. |
| Contratos | Não existe um domínio de contrato material na Loteadora. | Rascunhos de venda não mudam titularidade, não formalizam proposta ou contrato e não aceitam assinatura. |
| Reserva e disponibilidade comercial | Não existe estado comercial de estoque. | A matriz de Quadras/Lotes é estrutural; não apresenta disponibilidade, preço, reserva ou venda. |
| Obras, fornecedores e trabalhadores | Não existe domínio de obra, fornecedor, equipe, medição, ordem ou despesa. | A preparação de implantação é estado interno e não gera cronograma material, contratação ou custo. |
| Marketing e corretores | Não existe campanha, lead, canal, contato, comunicação externa ou atribuição comercial. | Os papéis internos não concedem login, portal, comissão ou permissão de comunicação. |
| Sócios e parceiros | Há somente papel temporal de governança interna. | Não há participação, percentual, valor, contrato, recebível, portal, pagamento ou repasse. |

## Dependências transversais já existentes

O CRM já separa identidade, organização, membership, grant, escopo, sessão e MFA. Consultas e comandos do domínio Loteadora exigem subject, organização, módulo, finalidade e correlação, e a interface não concede alçada. Essa fundação é condição necessária, mas não suficiente, para qualquer futuro domínio material.

## Conclusão do inventário

Não há base material parcialmente ativada ou endpoint oculto a ser “completado”. A futura camada contratual e financeira exigirá desenho próprio, schema aditivo, RLS/RPCs específicas, auditabilidade redigida, idempotência, reconciliação, segregação de deveres, testes de falha e validação jurídica-contábil. O setor permanece corretamente bloqueado até que essas condições sejam aprovadas.

## Evidências públicas para o desenho futuro

A Lei nº 6.766/1979 disciplina o parcelamento do solo urbano, a etapa de aprovação e o registro do loteamento, e prevê que o registro seja instruído, entre outros elementos, pelo contrato-padrão de promessa de venda ou cessão com as indicações legais aplicáveis. [1] A Lei nº 13.786/2018 introduziu exigências específicas de quadro-resumo e informações contratuais para operações de loteamento, inclusive disposições relacionadas a desfazimento e inadimplemento. [2]

Essas normas impedem que o futuro módulo seja tratado como simples gerador de texto ou calculadora: contratos devem nascer de modelos aprovados, versionados, revisados por jurídico habilitado e sujeitos a confirmação humana individual. O CRM poderá organizar evidências e workflow, mas não declarar validade, calcular consequências jurídicas ou alterar registros públicos automaticamente.

A Resolução BCB nº 443 disciplina o arranjo de pagamento do boleto, incluindo participantes autorizados, informações de emissão, apresentação e liquidação. [3] Portanto, qualquer emissão ou gestão futura de boleto deve depender de provedor habilitado, contrato de integração, controles de segurança, segregação de funções, testes de homologação e conciliação. Nenhuma emissão, baixa, cobrança, alteração de beneficiário, transferência ou integração será criada nesta fase.

## Referências

[1]: [Presidência da República — Lei nº 6.766/1979](https://www.planalto.gov.br/ccivil_03/leis/l6766compilado.htm)

[2]: [Presidência da República — Lei nº 13.786/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13786.htm)

[3]: [Banco Central do Brasil — Resolução BCB nº 443/2024](https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=443)
