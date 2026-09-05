# Requisitos oficiais iniciais — preço-base e matriz de loteamento

> **Nota de trabalho.** Este documento traduz fontes públicas em controles de software; não é parecer jurídico, contábil ou tributário. A classificação do empreendimento, o regime tributário e qualquer obrigação acessória devem ser confirmados por advogado e contador habilitados antes de uso operacional.

## Conclusões que já orientam a arquitetura

| Tema | Leitura confirmada | Controle que o CRM deve aplicar |
|---|---|---|
| Preço-base interno | Um preço-base importado não é, por si, venda, recebimento, nota fiscal, contrato ou declaração acessória. | Manter o preço-base como política versionada, com estado de preparação, vigência e aprovação separada; nunca gerar evento de receita, estoque comercial, contrato ou cobrança. |
| DOI | A DOI abrange atos imobiliários anotados, averbados, lavrados, matriculados ou registrados; o serviço informa os cartórios como obrigados ao envio. | Não criar exportação, declaração ou transmissão DOI a partir de uma planilha de preço. Caso o CRM um dia registre atos, tratar isso em módulo próprio, com consultoria e sem uso de dados da política como declaração. |
| RET | O RET tem pressupostos e aplica-se a situações específicas; a classificação depende de fatos e requisitos legais do empreendimento. | Não presumir RET, alíquota, afetação, CNPJ de incorporação, regime ou competência a partir do cadastro do Vista do Sol. Criar somente um marcador futuro de “classificação fiscal pendente de responsável”. |
| Loteamento e incorporação | A legislação e a orientação fiscal distinguem parcelamento do solo e incorporação; determinada vinculação à construção pode alterar o enquadramento, conforme fatos e requisitos. | Proibir o CRM de deduzir classificação jurídica pelo nome do empreendimento ou pela existência de preço por m². O dossiê deve manter fatos, fonte e estado de revisão separados. |
| Dados pessoais | A fonte inicial delimitada não deve conter pessoas. O serviço DOI mostra que CPF de alienantes/adquirentes é dado pessoal tratado em obrigação própria. | Rejeitar explicitamente colunas de pessoa, documento, contato, cliente, corretor, contrato, recebível, pagamento ou qualquer identificador individual na importação inicial. |
| Matriz física e situação registral | A Lei nº 6.766/1979 trata a matriz de lotes, a aprovação e o registro em planos distintos, com requisitos também municipais e estaduais. | O CRM deve aceitar dimensões como informação de fonte e nunca inferir aprovação, registro, infraestrutura, matrícula, conformidade urbanística ou titularidade a partir da planilha. |
| Princípios de proteção de dados | A LGPD exige finalidade, necessidade, qualidade, transparência, segurança, prevenção e prestação de contas para tratamento de dados pessoais. | Mesmo que a importação inicial bloqueie pessoas, validar e rejeitar colunas pessoais antes da prévia; registrar finalidade, responsável, data, resultado e descarte do processamento. |
| Preço-base e receita | A NBC TG 47/CPC 47 trata receita de contrato com cliente e a fonte técnica descreve critérios para reconhecimento de efeitos do contrato. | Não enviar uma política de preço-base a livros, tributos, recebíveis ou relatórios de receita. Somente um módulo contratual posterior, com fatos e documentos próprios, pode avaliar seu efeito contábil. |
| Atividade imobiliária | O CFC mantém norma específica para entidades de incorporação imobiliária, além das normas gerais de receita. | Registrar o enquadramento contábil como pendente de contador responsável; o CRM não deve escolher norma, regime, competência ou lançamento pelo tipo de cadastro. |

## Escopo técnico permitido a submeter

| Campo | Finalidade interna | Regra de proteção |
|---|---|---|
| Quadra | Chave física de localização | Deve coincidir com a matriz já autorizada; divergência cria reconciliação, não inclusão automática. |
| Lote | Chave física de localização | Deve coincidir com Quadra e Lote cadastrados; não cria o 165º Lote sem fonte conciliada e confirmação específica. |
| Área | Base física já adotada pela matriz | Decimal positivo com unidade em m²; conflito preserva a estrutura atual e registra pendência de fonte. |
| Preço-base por m² | Parâmetro comercial de política, sem efeito de venda | Decimal em BRL; versão, competência, início de vigência, fim opcional, fonte, hash, criador, aprovador distinto, estado e auditoria redigida são obrigatórios. |

## Regras mínimas para o módulo formal

1. A importação deve começar em **prévia privada e não persistida**, com validação de cabeçalhos, tipos, duplicidade Qn/Ln, áreas, preço-base e aderência à matriz.
2. O arquivo original deve ser processado em memória e descartado após a prévia; se futuramente a retenção for autorizada, somente referência protegida e metadados mínimos podem ser armazenados, nunca o conteúdo da planilha no banco.
3. A persistência exige organização ativa, finalidade específica, grant, MFA recente, correlation ID, idempotency key e uma aprovação de pessoa diferente da criadora. A UI nunca decide alçada.
4. Uma política aprovada não deve criar disponibilidade, reserva, proposta, venda, contrato, cobrança, recebível, imposto, nota fiscal, pagamento ou repasse.
5. Vigor e sobreposição devem ser resolvidos pelo servidor: a mesma combinação de empreendimento + escopo não pode ter duas versões aprovadas e vigentes para o mesmo período.
6. Toda alteração posterior deve ser versionada e retirada logicamente, com motivo e auditoria redigida. Exclusão física, reescrita de histórico e autoaprovação são proibidas.
7. A primeira importação não deve modificar área nem criar Quadra/Lote; diferenças físicas retornam para a fila de reconciliação já existente.
8. O cadastro de loteamento deve distinguir “dado de fonte física”, “situação declarada” e “ato comprovado”. Nenhum dos três pode ser deduzido dos demais.
9. O preço-base não deve produzir lançamento, receita, imposto, estoque comercial, saldo a receber ou agenda de cobrança. A existência de contrato, identificação das partes, obrigação, condição de pagamento e demais fatos deve ser tratada em domínio separado.

## Fontes oficiais consultadas

1. [Receita Federal — Declarar operações imobiliárias (DOI)](https://www.gov.br/pt-br/servicos/declarar-operacoes-imobiliarias), acesso e conteúdo verificados em 05 set. 2026. A página delimita o objeto da DOI, o prazo e os cartórios obrigados ao envio.
2. [Receita Federal — Optar pelo RET para incorporações imobiliárias](https://www.gov.br/pt-br/servicos/optar-pelo-regime-especial-de-incorporacoes-imobiliarias), acesso e conteúdo verificados em 05 set. 2026. A página descreve o caráter opcional/irretratável do regime e seus requisitos listados.
3. [Receita Federal — Solução de Consulta COSIT nº 24/2023](http://normas.receita.fazenda.gov.br/sijut2consulta/anexoOutros.action?idArquivoBinario=68550), acesso e conteúdo verificados em 05 set. 2026. O ato distingue parcelamento do solo e incorporação e aponta a dependência dos fatos e requisitos legais para o enquadramento.
4. [Planalto — Lei nº 6.766/1979, texto compilado](https://www.planalto.gov.br/ccivil_03/leis/l6766compilado.htm), acesso e conteúdo verificados em 05 set. 2026. A lei define loteamento e traz regras federais para projeto, aprovação e registro, sem afastar as normas estaduais e municipais.
5. [Planalto — Lei nº 13.709/2018, LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm), acesso e conteúdo verificados em 05 set. 2026. A lei define tratamento de dados pessoais e seus princípios.
6. [ANPD — Guia sobre agentes de tratamento e encarregado](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-para-definicoes-dos-agentes-de-tratamento-de-dados-pessoais-e-do-encarregado), acesso verificado em 05 set. 2026.
7. [ANPD — Guia de segurança da informação para agentes de tratamento](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte), acesso verificado em 05 set. 2026. A página disponibiliza guia, checklist de medidas de segurança e modelo de registro de operações de tratamento.
8. [CFC — Normas Brasileiras de Contabilidade completas](https://cfc.org.br/tecnica/normas-brasileiras-de-contabilidade/normas-completas/), acesso e conteúdo verificados em 05 set. 2026. A listagem identifica a NBC TG 47 e a CTG 01 para entidades de incorporação imobiliária.
9. [CFC — CTG 01, Entidades de Incorporação Imobiliária](https://www1.cfc.org.br/sisweb/sre/detalhes_sre.aspx?Codigo=2009/001154), acesso e conteúdo verificados em 05 set. 2026. A página informa que a resolução permanece em vigor e foi alterada.
10. [CPC — CPC 47, Receita de Contrato com Cliente](https://www.cpc.org.br/CPC/Documentos-Emitidos/Pronunciamentos/Pronunciamento?Id=105), acesso e conteúdo verificados em 05 set. 2026.
11. [CVM/CPC — Pronunciamento Técnico CPC 47, revisão 13](https://conteudo.cvm.gov.br/export/sites/cvm/menu/regulados/normascontabeis/cpc/CPC_47_Rev_13.pdf), acesso e conteúdo verificados em 05 set. 2026. O documento trata receita proveniente de contrato com cliente, critérios de identificação de contrato e condições de reconhecimento.
