# Cadastro robusto de proprietários para venda urbana e lotes

## Princípio de desenho

O cadastro de proprietário deve ser composto por **três objetos vinculados, mas independentes**: a pessoa ou empresa proprietária, o ativo imobiliário e a autoridade para conduzir a venda. Essa separação evita o erro comum de registrar o imóvel apenas no contato de uma pessoa e não conseguir distinguir titularidade, representante, coproprietário, procurador, empresa e responsável comercial.

> O sistema não deve declarar que um imóvel está “regular” ou que uma pessoa tem “poderes confirmados” por preenchimento de formulário. Ele deve registrar **o que foi declarado, qual evidência foi recebida, quem revisou e o que ainda depende de validação jurídica, registral, fiscal ou municipal**.

## Arquitetura de dados

| Entidade | Pergunta que responde | Exemplos de campos |
| --- | --- | --- |
| Proprietário | Quem afirma deter o direito econômico ou a titularidade? | Tipo de pessoa, nome/razão social, CPF/CNPJ, contatos, perfil de propriedade. |
| Parte relacionada | Quem precisa participar, autorizar ou assinar? | Coproprietário, cônjuge/companheiro quando aplicável, inventariante, procurador, administrador, diretor ou sócio. |
| Ativo | Qual imóvel ou lote será ofertado? | Endereço, matrícula, tipo, área, preço, situação de ocupação e atributos. |
| Loteamento | Em que empreendimento ou parcelamento o lote se insere? | Nome, município, aprovação declarada, registro, quadra/lote, infraestrutura e regras. |
| Autoridade | Qual o fundamento para alguém atuar na venda? | Titularidade declarada, procuração, ato societário, ata, autorização ou decisão a revisar. |
| Dossiê | Qual evidência apoia cada declaração? | Documento, versão, origem, data, validade, acesso e status de revisão. |
| Comercialização | Como o ativo será anunciado e negociado? | Preço, condições, exclusividade, canal, comissão, prazo e aprovação de anúncio. |

## Jornada comum a proprietário PF e PJ

| Etapa | Finalidade | O que se coleta | O que não se deve exigir ainda |
| --- | --- | --- | --- |
| 1. Interesse de venda | Retornar o contato e identificar o ativo | Nome de preferência, contato, cidade, tipo de imóvel/lote, faixa de valor pretendida, prazo e melhor horário | Documento de identidade, certidões, extratos ou todos os dados de coproprietários. |
| 2. Diagnóstico do ativo | Decidir se vale avançar para captação | Endereço, matrícula se disponível, tipo de propriedade, ocupação, atributos, preço/condições e autorização para aprofundar | Arquivos sem finalidade ou comprovação completa de toda a cadeia. |
| 3. Autoridade e captação | Confirmar quem participa da venda e quais evidências são necessárias | Titulares/representantes declarados, regime/estado civil quando pertinente, vínculo com o ativo, procuração ou ato societário se existir | Dados bancários de recebimento ou documentos de terceiros não envolvidos. |
| 4. Dossiê e diligência | Preparar publicação, proposta e contratação com controle | Documentos do proprietário, matrícula/certidões, situação municipal/condominial e checklist por tipo de ativo | Envio por canal público, link aberto ou acesso geral da equipe. |
| 5. Proposta e fechamento | Operar negociação e assinatura | Condições aprovadas, partes, prazos, instrumentos e evidências de assinatura | Redigitação de dados já validados. |

## Cadastro de proprietário pessoa física

O primeiro formulário não deve se confundir com a ficha completa. Uma pessoa que apenas quer estimar ou vender um imóvel não deve ser forçada a enviar CPF, identidade e certidões antes de receber contexto sobre o atendimento. No momento de captação, entretanto, a ficha deve construir um mapa de quem pode estar envolvido e do que falta para avançar.

### Camada 1 — interesse e triagem

| Grupo | Campo | Regra de desenho |
| --- | --- | --- |
| Contato | Nome de preferência, celular/WhatsApp, e-mail opcional, canal e horário de contato | Usar para retorno; apresentar aviso de privacidade conciso. |
| Intenção | Vender agora, planejar venda, avaliar captação, receber orientação ou vender lote | Não assumir urgência pelo canal de origem. |
| Ativo | Cidade, bairro, categoria, estimativa de área, lote/quadra se aplicável | Matrícula pode ser “não tenho agora”; não bloquear a captura. |
| Comercial | Faixa de valor pretendida, prazo desejado, ocupação e disponibilidade para visita técnica | Registrar como declaração, não como preço validado. |
| Origem | Indicação, placa, portal, rede social, base própria ou outro | Preservar atribuição e consentimento de contato. |

### Camada 2 — titularidade declarada e diagnóstico do imóvel

| Grupo | Campos robustos | Por que importa |
| --- | --- | --- |
| Identificação | Nome civil, CPF, data de nascimento, nacionalidade, profissão e endereço de correspondência | Necessário apenas quando a captação avança para contratação/dossiê. |
| Titularidade declarada | Único proprietário, copropriedade, espólio, nu-propriedade/usufruto, procuração, cessão ou outro | Direciona as partes e evidências necessárias, sem concluir validade. |
| Partes relacionadas | Nome e contato dos envolvidos; papel; participação declarada; disponibilidade | Evita descobrir coproprietário ou representante apenas na proposta. |
| Estado civil e vínculo | Estado civil declarado, regime de bens quando aplicável, existência de cônjuge/companheiro a envolver | Deve ter linguagem clara: “informação para identificar quem pode precisar participar; sujeita a conferência”. |
| Ativo urbano | Matrícula, cartório, inscrição municipal, endereço completo, área, tipologia, vagas, ocupação, IPTU e condomínio | Forma o núcleo técnico do anúncio e da diligência. |
| Lote urbano | Loteamento, fase, quadra, lote, matrícula, dimensões, confrontações declaradas, acesso, infraestrutura, associação/restrições e estágio de urbanização | Lote não pode ser modelado como “casa sem construção”. |

### Camada 3 — documentos e autoridade

Esta camada só deve ser aberta após o responsável comercial definir que há potencial de captação e explicar por que cada documento é solicitado. A Lei nº 6.015/1973 dá ao registro de imóveis função de autenticidade, segurança e eficácia de atos jurídicos; a matrícula e as certidões devem, portanto, organizar a revisão do ativo, não ser substituídas por uma declaração no CRM. [1]

| Evidência | Finalidade no processo | Status recomendados |
| --- | --- | --- |
| Documento oficial de identificação | Conferência de identidade de quem contrata/intervém | Solicitado, recebido, conferido, vencido, dispensado. |
| Comprovante de estado civil e documentos correlatos quando aplicável | Identificar partes e participações necessárias | Pendente de análise, em revisão, orientação jurídica necessária. |
| Procuração ou decisão de inventariança, se houver | Delimitar capacidade de representação | Recebida, validade a verificar, escopo insuficiente, aprovada pelo responsável. |
| Matrícula/certidão atualizada | Checar descrição, titularidade e atos que requerem leitura | Solicitada, recebida, em revisão, divergência apontada. |
| IPTU e dados municipais | Complementar identificação e condição tributária declarada | Declarado, documento recebido, pendência municipal. |
| Declaração condominial/regras aplicáveis | Qualificar venda de unidade e obrigações informadas | Não aplicável, solicitada, recebida, em revisão. |
| Autorização de anúncio/captação | Evidenciar escopo comercial, preço e canais autorizados | Rascunho, assinado, expirado, revogado. |

## Cadastro de proprietário pessoa jurídica

O fluxo para pessoa jurídica deve começar com o **CNPJ** para preencher e comparar dados cadastrais, mas precisa manter separados: empresa proprietária, representante operacional, representante que assina, beneficiário da negociação quando houver, e documentação de poderes. O serviço oficial de Consulta CNPJ disponibiliza situação cadastral e QSA, mas o QSA não é, por si só, prova de que uma pessoa pode alienar determinado imóvel. [2]

### Camada 1 — empresa e contato de captação

| Grupo | Campo | Regra de desenho |
| --- | --- | --- |
| Empresa | CNPJ, razão social, nome fantasia, natureza jurídica e endereço cadastral | Consultar/registrar fonte e data da evidência do CNPJ. |
| Contato | Nome, cargo, e-mail corporativo, telefone e preferência de canal | Separar contato comercial de representante com poderes. |
| Vínculo com o ativo | Proprietária registral declarada, incorporadora/loteadora, mandatária, cessionária, parceira ou outra relação | Não concluir titularidade apenas pelo CNPJ. |
| Ativo | Identificação do imóvel ou lote, localização, empreendimento, preço e estágio | Permitir múltiplos ativos por empresa, sem duplicar cadastro societário. |

### Camada 2 — estrutura, poderes e ativos

| Grupo | Campos robustos | Decisão que suporta |
| --- | --- | --- |
| Dados cadastrais | Situação do CNPJ, data e fonte de consulta, CNAE informado, endereço | Sinalizar divergência para revisão, sem bloquear automaticamente. |
| Estrutura e governança | Tipo societário, ato constitutivo, última alteração, QSA referencial e órgão de registro | Definir documentos esperados e responsável pela revisão. |
| Representação | Administradores/diretores declarados, assinantes, assinatura conjunta, procuradores e vigência | Mapear quem negocia e quem efetivamente pode assinar. |
| Poder específico | Ata, deliberação, contrato social, estatuto ou procuração a revisar | Verificar se há escopo para alienação/assinatura quando pertinente. |
| Relação com imóvel | Titular na matrícula, SPE, incorporadora, loteadora, proprietária original, cessionária ou mandatária | Evitar que a equipe anuncie um ativo sem compreender a cadeia declarada. |
| Conformidade comercial | Política de preço, tabela, descontos, correção, comissão, distratos e canais autorizados | Controlar versão e alçada comercial. |

### Camada 3 — dossiê de empresa

Como referência de crédito imobiliário, a CAIXA lista, para vendedor PJ, identificação do representante e documentos de constituição/alterações ou, no caso de sociedade anônima, estatuto e ata de eleição da diretoria. A lista é um exemplo de categorias documentais de etapa formal e não um checklist universal para todas as vendas. [3]

| Tipo de empresa | Evidências a organizar no dossiê | Verificação humana requerida |
| --- | --- | --- |
| Sociedade limitada ou empresário individual | Documento de constituição, alterações registradas, certidão simplificada quando aplicável, identificação de representante | Coerência de representação e escopo de assinatura. |
| Sociedade anônima | Estatuto, alterações, ata de eleição e deliberação/autorização quando exigida pela governança | Quem representa e quais aprovações internas são necessárias. |
| SPE, loteadora ou incorporadora | CNPJ, atos constitutivos, relação declarada com empreendimento/matrícula, documentos urbanísticos e comerciais | Vínculo do veículo societário com o ativo e condições de comercialização. |
| Empresa com procurador | Procuração, identidade do procurador, prazo e poder específico declarado | Validade, abrangência e poderes para o ato. |

## Módulo de ativo: dados mínimos de imóvel urbano e lote

O imóvel deve possuir um identificador interno, uma ficha comercial e uma ficha documental. Para lotes, a Lei nº 6.766/1979 diferencia loteamento e desmembramento, e conceitua lote a partir de infraestrutura e índices urbanísticos; além disso, estados e municípios podem estabelecer regras complementares. [4] Essa particularidade justifica uma aba exclusiva de “situação urbanística declarada e documentos a verificar”.

| Grupo | Imóvel urbano construído | Lote urbano |
| --- | --- | --- |
| Identificação | Matrícula, cartório, endereço, inscrição municipal, unidade e condomínio | Matrícula, cartório, loteamento, fase, quadra, lote, endereço/referência e inscrição municipal. |
| Físico | Área privativa/total, dormitórios, banheiros, vagas, padrão, conservação e ocupação | Área, frente/profundidade, confrontações declaradas, topografia, acesso, esquina, orientação e situação de cercamento. |
| Urbanístico | Zoneamento/uso declarado, habite-se ou situação de construção a verificar | Modalidade do parcelamento, aprovação/registro declarados, infraestrutura, restrições construtivas e regras de associação. |
| Econômico | Preço, condição, IPTU, condomínio, financiamento/ônus declarado, comissão e custos de venda | Preço, condição, saldo/parcelamento, taxas de associação, IPTU e custos de transferência declarados. |
| Publicação | Fotos, texto, coordenada aproximada, canal e autorização | Implantação, mapa, fotos, coordenada controlada, memorial/itens autorizados e canal. |

## Regras de segurança e operação

| Regra | Implementação recomendada |
| --- | --- |
| Coleta progressiva | Não liberar upload de identidade, certidões e atos societários no formulário de interesse. |
| Evidência com finalidade | Todo documento precisa de propósito, data, fonte, versão, prazo e responsável por revisão. |
| Acesso mínimo | Corretores veem dados comerciais; equipe documental vê documentos necessários; gestores controlam permissões. |
| Sem rótulo enganoso | Usar “declarado”, “recebido”, “em revisão” e “verificado pelo responsável”, nunca “regularizado automaticamente”. |
| Auditoria | Registrar acesso, download, alteração de preço, mudança de status, solicitação documental e aceite. |
| Retenção | Prever prazo e descarte/anonimização conforme finalidade, contrato e orientação jurídica da empresa. |

## Checklist de produto

A solução é robusta quando consegue responder, para cada ativo: **quem afirmou ser proprietário, quem precisa participar, qual evidência sustenta essa afirmação, que documento ainda falta, quem revisou e o que pode ser feito agora — captar, publicar, receber proposta ou encaminhar para diligência**.

## Referências

[1] [Câmara dos Deputados — Lei nº 6.015/1973 (Registros Públicos)](https://www2.camara.leg.br/legin/fed/lei/1970-1979/lei-6015-31-dezembro-1973-357511-publicacaooriginal-1-pl.html)

[2] [Gov.br / Receita Federal — Consultar CNPJ](https://www.gov.br/pt-br/servicos/consultar-cadastro-nacional-de-pessoas-juridicas)

[3] [CAIXA — Documentação básica para solicitação de crédito imobiliário](https://www.caixa.gov.br/Downloads/habitacao-documentos-gerais/Docbas-solicit-Cred-Imob.pdf)

[4] [Planalto — Lei nº 6.766/1979 (Parcelamento do Solo Urbano)](https://www.planalto.gov.br/ccivil_03/leis/l6766.htm)
