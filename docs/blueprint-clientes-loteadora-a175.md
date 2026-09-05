# Blueprint de Clientes Loteadora — A175

**Data:** 05 de setembro de 2026  
**Escopo:** Setor 03, cadastro-base em rascunho. Não inclui dados pessoais em interface ampla, análise de crédito, documento, proposta, venda, reserva, contrato, cobrança ou financeiro.

## Pesquisa e decisão

A LGPD exige finalidade, adequação, necessidade, transparência, segurança, prevenção e prestação de contas para atividades de tratamento de dados pessoais. [1] A orientação da ANPD também diferencia os agentes e responsabilidades de tratamento. [2] Em consequência, o CRM não deve converter um pré-cadastro em repositório amplo de atributos ou anexos, nem usar sinais de completude como aprovação de pessoa.

Referências de mercado demonstram que fluxos de pré-cadastro costumam misturar documentos, análise, validações e permissões em uma única esteira. [3] Elas evidenciam a utilidade de pré-requisitos por etapa, mas reforçam o risco de fundir cadastro, crédito, contrato e comunicação externa. O CRM adotará a parte segura desse padrão: **uma visão de preparação por finalidade, com estado opaco e revisão humana**, sem automação material.

| Necessidade | Decisão do CRM | Limite |
|---|---|---|
| Continuidade de cadastro | Party e papel temporal continuam como fonte de referência do cliente em rascunho. | Não replica nome, CPF/CNPJ, contato ou endereço. |
| Organização documental | O estado de intenção e cobertura privada é apresentado sem arquivo ou metadado. | Não abre, baixa, envia ou obriga documento por esta visualização. |
| Orientação de trabalho | Cada cliente recebe um quadro de preparação não identificável e somente leitura. | Não classifica risco, crédito, perfil, aprovação ou elegibilidade comercial. |
| Segurança | A visão aproveita somente as consultas já condicionadas a sessão e contexto. | Não cria nova consulta, integração ou privilégio. |
| Próxima ação | O texto orienta revisão humana no setor apropriado. | Não altera estado, não notifica, não cria tarefa externa ou desencadeia venda. |

## Próximo aprimoramento: quadro de prontidão privada

O Setor 03 receberá um quadro de leitura que sintetiza, para cada cliente comprador em rascunho devolvido pelo contexto autorizado, três sinais não identificáveis: vínculo de cadastro-base, cobertura opaca de anexo privado e necessidade de revisão humana. Cada item será rotulado apenas por ordem local de leitura, como **Cliente em rascunho 01**, sem nome, identificador técnico ou dado de contato.

| Condição | Exibição permitida | Exibição proibida |
|---|---|---|
| Sem contexto | Bloqueio; nenhuma contagem ou item. | Existência de clientes, anexos ou dados externos. |
| Contexto sem cliente | Estado vazio honesto. | Inferência sobre clientes fora do escopo. |
| Cliente sem intenção de anexo | “Sem intenção privada registrada”. | Tipo, nome, tamanho ou conteúdo de documento. |
| Intenção aguardando envio | “Intenção privada aguardando ciclo”. | Arquivo, link, URL ou ação de envio. |
| Cobertura registrada | “Cobertura privada registrada”. | Download, visualização, compartilhamento ou validação documental. |

O componente será puramente derivado, sem mutation e sem nova persistência. Ele não altera o fluxo de intenção ou envio existente; somente torna mais clara, no escopo autorizado, a diferença entre cadastro-base e preparação documental privada.

## Critérios de aceite

O quadro deve permanecer invisível como fonte de dados quando falta contexto; não pode renderizar nomes nem identificadores técnicos; deve tratar estado desconhecido como revisão pendente; não pode importar cliente Supabase no navegador, usar `fetch`, disparar mutation, abrir arquivo ou conter botões de comando; e precisa manter legibilidade em desktop e móvel.

## Referências

[1]: [Presidência da República — Lei nº 13.709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

[2]: [ANPD — Guia orientativo para definições dos agentes de tratamento de dados pessoais e do encarregado](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-para-definicoes-dos-agentes-de-tratamento-de-dados-pessoais-e-do-encarregado)

[3]: [CV CRM — Workflow de Pré-cadastro](https://ajuda.cvcrm.com.br/support/solutions/articles/157000357379-workflow-de-pr%C3%A9-cadastro-painel-do-gestor)
