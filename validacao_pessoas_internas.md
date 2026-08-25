# Validação externa — pessoas internas, parceiros e colaboradores

## Corretor associado: vínculo próprio, mas não presunção absoluta

A Lei nº 6.530/1978, com a redação incluída pela Lei nº 13.097/2015, permite ao corretor associar-se a uma ou mais imobiliárias mantendo autonomia profissional, mediante contrato específico registrado no sindicato da categoria ou, inexistindo sindicato, nas delegacias da Federação Nacional de Corretores de Imóveis. A norma também determina assistência sindical na coordenação das funções correlatas e na partilha de resultados, e condiciona o arranjo à ausência dos elementos caracterizadores do vínculo de emprego previstos na CLT. [1]

O CRM deve guardar registro profissional declarado, contrato, vigência, estado de registro, escopo comercial e participação em negócios. Ele não deve calcular automaticamente a natureza trabalhista, controlar a rotina de modo incompatível com a associação ou misturar o corretor associado em um fluxo de folha. A autoridade para concluir o enquadramento e os efeitos da relação continua fora do software.

| Controle de CRM | Finalidade | Limite |
| --- | --- | --- |
| `AssociatedBrokerEngagement` | Vínculo, contrato, período, CRECI declarado, registro e escopo | Não confirma regularidade profissional ou vínculo por um único campo. |
| `BusinessParticipation` | Participação do associado em atendimento/negócio e regra de partilha configurada | Não calcula obrigação tributária/previdenciária sem sistema e política especializados. |
| `AccessGrant` | Permissão para carteira, ativos e propostas no território designado | Não usa ponto, prontuário ou controle de empregado como componente do papel associado. |
| `TerminationChecklist` | Expiração do acesso, contrato e pendências operacionais | Não descarta o histórico que precisa ser retido por finalidade e política. |

## Empregado e saúde ocupacional: integração por estado, não armazenamento no CRM

O eSocial informa que o registro de empregado deve ser feito até a véspera do início das atividades, enquanto a anotação da carteira tem prazo próprio. [2] A NR-7 determina PCMSO para organizações com empregados CLT, vincula o programa aos riscos do PGR e estabelece que o exame admissional ocorra antes de o empregado assumir suas atividades. Ela também prevê emissão de ASO e determina que dados de exames fiquem em prontuário médico individual sob responsabilidade médica, com conservação mínima prevista na norma. [3]

O PGR é instrumento de gerenciamento contínuo de riscos ocupacionais, composto no mínimo por inventário de riscos e plano de ação, e deve refletir alterações do ambiente e dos requisitos aplicáveis. [4] Portanto, o CRM pode receber somente um **estado operacional mínimo** — por exemplo, “elegibilidade de acesso pendente/confirmada pelo sistema responsável”, data de próxima revisão e contato do responsável — sem receber ASO, resultados, diagnóstico, prontuário ou detalhes clínicos.

| Informação | Fonte de verdade recomendada | O CRM mantém |
| --- | --- | --- |
| Registro/admissão e eventos trabalhistas | eSocial / sistema de RH | Referência, estado sincronizado, data de revisão e responsável. |
| Folha, encargos e benefícios | RH/folha | Nenhum valor detalhado; apenas atribuição operacional quando necessária. |
| PCMSO, ASO, laudos e dados médicos | Saúde ocupacional / médico responsável | Estado mínimo de elegibilidade, sem documento clínico ou motivo médico. |
| PGR e ação preventiva | SST / gestor responsável | Referência de requisito por função/local e pendência operacional autorizada. |
| Acesso a sistemas | IAM / CRM | Papel, escopo, justificativa, dono, vigência, recertificação e revogação. |

## Parceiros e papéis de tratamento de dados

A LGPD distingue controlador e operador conforme quem decide as finalidades e os elementos essenciais do tratamento e quem realiza o tratamento em nome do controlador. [5] Assim, contador, advogado, TI, consultoria ou parceiro não devem ser classificados automaticamente como “operadores” apenas por profissão. O CRM deve registrar uma avaliação por relação contratual: finalidade, instruções, dados acessados, papel avaliado, fundamento, contrato, medidas de segurança, vigência, responsável e revisão. A conclusão e a redação contratual devem seguir o jurídico e a privacidade da organização.

## Referências

[1] [Planalto — Lei nº 6.530/1978, art. 6º e parágrafos](https://www.planalto.gov.br/ccivil_03/leis/l6530.htm)

[2] [eSocial — Histórico de Perguntas Frequentes](https://www.gov.br/esocial/pt-br/empresas/perguntas-frequentes/historico-de-perguntas-frequentes)

[3] [Ministério do Trabalho e Emprego — NR-7 / PCMSO](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-07-atualizada-2022-1.pdf)

[4] [Ministério do Trabalho e Emprego — Programa de Gerenciamento de Riscos](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/pgr)

[5] [Planalto — Lei nº 13.709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
