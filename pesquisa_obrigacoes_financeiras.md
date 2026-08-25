# Pesquisa de obrigações financeiras, fiscais e contábeis

**Referência temporal:** agosto de 2026. Este registro não substitui calendário, enquadramento ou revisão do contador da empresa.

## Evidências federais iniciais

| Tema | Achado oficial | Implicação para o CRM |
| --- | --- | --- |
| EFD-Reinf | A EFD-Reinf é módulo do SPED que recebe dados de retenções de imposto de renda e contribuições sociais, além de outras informações fiscais. Sua estrutura por eventos permite transmissões em períodos distintos de acordo com as obrigações aplicáveis. A página oficial lista, entre outros temas, serviços tomados/prestados com retenção previdenciária, CPRB e retenções de IR, CSLL, COFINS e PIS/Pasep sobre pagamentos diversos na série R-4000. [1] | O subledger deve capturar natureza de pagamento, fornecedor/beneficiário, retenções identificadas/configuráveis, competência, evidência e estado de exportação/revisão. Ele não gera ou transmite evento fiscal sem mapeamento e validação do escritório/área fiscal. |
| ECF | O serviço oficial define a ECF como obrigação acessória que informa detalhadamente as operações da empresa, com foco na apuração de IRPJ e CSLL. A regra geral apresentada é transmissão ao SPED até o último dia útil de julho do ano seguinte ao ano-calendário. [2] | A área contábil precisa consultar eventos, competência, empresa/SPE, classificação e reconciliação, além de receber lote de exportação e retorno de divergência. Prazo e aplicabilidade devem ser uma política por exercício e empresa, nunca um contador regressivo universal. |
| ECD | A ECD permite escrituração eletrônica de Livro Diário, Livro Razão, Balancetes Diários, Balanços e fichas de lançamento. A página oficial também a descreve como meio de autenticação desses documentos, nos termos da regulamentação indicada. [3] | O CRM deve manter o vínculo entre evento operacional, competência, empresa, evidência e lote de exportação/reconciliação. Os livros e o arquivo oficial pertencem ao ERP contábil e ao responsável pela escrituração. |
| DCTFWeb/MIT | A página da Receita Federal reúne a Instrução Normativa RFB nº 2.237/2024, manuais e leiautes do MIT, incluindo arquivo JSON de importação, esquema, exemplos e relatórios XML de saída. A página alerta que o leiaute pode ser retificado e que campos/regras de obrigatoriedade podem mudar. [4] | Qualquer adaptador do CRM deve ter versão de leiaute, validação de campos e retorno de integração. O CRM pode preparar dados e acompanhar pendências, mas não deve prometer envio/aceite sem conector fiscal homologado e revisão por competência. |
| Junta Comercial | A Lei nº 8.934/1994 define como finalidades do Registro Público de Empresas Mercantis dar garantia, publicidade, autenticidade, segurança e eficácia aos atos sujeitos a registro, cadastrar empresas e manter informações atualizadas. As Juntas Comerciais são órgãos locais com funções executora e administradora do serviço de registro. [5] | O CRM deve manter dossiê de atos, participação, poderes, data/versão, estado de arquivamento e referência/certidão. A base consultada não substitui instrumento, análise de poderes ou validação jurídica do ato aplicável. |
| NFS-e | O portal nacional de NFS-e oferece emissor web, consulta, documentação técnica e área de adesão/parametrização para municípios; também referencia a lista de serviços anexa à Lei Complementar nº 116/2003. [6] | O produto deve ter configuração por empresa e município, referência do documento e versão de leiaute. A classificação de serviço, incidência, retenção e obrigação municipal devem ser aprovadas na política local, não inferidas apenas pela descrição do negócio. |
| Receita contratual e recebíveis | O CPC mantém o Pronunciamento CPC 47 — Receita de Contrato com Cliente, aprovado pelos reguladores indicados na página, inclusive CFC como NBC TG 47. [7] | O CRM registra contrato, obrigações, evento, competência operacional e evidência. Reconhecimento contábil, ajuste, mensuração de recebível e lançamento permanecem em regra contábil/ERP revisados pelo contador. |
| Loteamento/parceria em terreno de terceiro | A Solução de Consulta SRRF06/Disit nº 6.018/2018 trata de cenário concreto de loteamento em terreno de terceiro, parceria e repartição de receitas. Sua ementa descreve que, no caso examinado, a empresa cuja receita operacional é participação proporcional no preço de venda das unidades tributa a parcela contratualmente cabível; o próprio documento ressalva interpretações supervenientes e remete a soluções vinculadas. [8] | O contrato deve definir papel econômico, base de distribuição, recebedores, gatilho e se existe remuneração de obra/serviço. O CRM não pode usar um único percentual para decidir tributação: registra a estrutura contratual e exige mapeamento fiscal por empresa, período e regra vigente. |
| EFD-Contribuições | A EFD-Contribuições é módulo do SPED para informações de pessoas jurídicas úteis à escrituração de PIS/Pasep e Cofins em regimes não cumulativo e/ou cumulativo. A página indica que as informações se originam de documentos e dados operacionais, como receitas, despesas, encargos e aquisições que geram créditos no regime não cumulativo. [9] | Receita, documento fiscal, natureza, contraparte, competência e referência de despesa devem ser capturados com rastreabilidade. O cálculo de contribuição, crédito e escrituração deve ser produzido/revisado no domínio fiscal conforme regime e regra vigente. |

## Critério de desenho

> O CRM não é o entregador de uma obrigação acessória. Ele é a camada que reduz a distância entre o evento econômico e a revisão contábil/fiscal, preservando origem, competência, contrapartes, documento, regra aplicada e retorno da integração.

## Próximas fontes a validar

| Frente | Fonte pretendida | Questão aberta |
| --- | --- | --- |
| ECD | Portal SPED/Receita Federal | Escopo, pessoas obrigadas, leiaute vigente e retorno contábil a representar. |
| DCTFWeb/MIT | Receita Federal | Quais débitos/competências exigem referência e quais ficam totalmente no sistema fiscal. |
| EFD-Contribuições | Portal SPED | Relação entre documentos, receita, créditos e exportação por empresa. |
| NFS-e | Portal nacional e município | Emissor, documento, município, serviço e integração por operação. |
| Junta Comercial | DREI/Redesim/Junta competente | Ato, poder, SPE, arquivamento e atualização societária do dossiê. |

## Referências

[1] [Portal SPED / Receita Federal — EFD-Reinf](https://www.gov.br/sped/pt-br/assuntos/escrituracoes-digitais/efd-reinf)

[2] [Gov.br / Receita Federal — Entregar Escrituração Contábil Fiscal](https://www.gov.br/pt-br/servicos/entregar-escrituracao-contabil-fiscal)

[3] [Portal SPED / Receita Federal — Escrituração Contábil Digital (ECD)](https://www.gov.br/sped/pt-br/assuntos/escrituracoes-digitais/ecd)

[4] [Receita Federal — DCTFWeb e MIT](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb)

[5] [Planalto — Lei nº 8.934/1994, Registro Público de Empresas Mercantis](https://www.planalto.gov.br/ccivil_03/leis/L8934compilado.htm)

[6] [Portal Gov.br — Nota Fiscal de Serviço eletrônica](https://www.gov.br/nfse/pt-br)

[7] [Comitê de Pronunciamentos Contábeis — CPC 47, Receita de Contrato com Cliente](https://www.cpc.org.br/CPC/Documentos-Emitidos/Pronunciamentos/Pronunciamento?Id=105)

[8] [Receita Federal — Solução de Consulta SRRF06/Disit nº 6.018/2018](http://normas.receita.fazenda.gov.br/sijut2consulta/anexoOutros.action?idArquivoBinario=64075)

[9] [Portal SPED / Receita Federal — EFD-Contribuições](https://www.gov.br/sped/pt-br/assuntos/escrituracoes-digitais/efd-contribuicoes)
