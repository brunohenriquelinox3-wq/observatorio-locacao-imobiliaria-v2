# Auditoria do Módulo 01 — Identificação de Loteamentos (A206)

> **Escopo desta auditoria:** identificação interna, territorial, urbanística, documental e de pendências de um loteamento em rascunho. O estudo não lê nem altera nenhum loteamento existente e não autoriza preço, venda, proposta, contrato, cobrança, pagamento, repasse, documento real, dado pessoal ou publicação.

## Diagnóstico da tela atual

A tela atual mostra somente **Referência interna** e **Nome de trabalho**. Embora os contratos já suportem enquadramento, município, UF, etapas planejadas, situação de trabalho e nota interna, quase todos esses elementos estão dispersos em outros módulos. Isso obriga a pessoa operadora a sair da identificação antes de formar uma visão mínima e impede que o primeiro documento seja percebido como parte do cadastro desde o início.

| Aspecto | Situação atual | Lacuna observada |
|---|---|---|
| Identificação interna | Referência e nome de trabalho. | Não há enquadramento visível da modalidade, uso predominante ou estágio de registro. |
| Referência territorial | Município e UF existem no contrato, mas aparecem em Estrutura. | A identificação não mostra zona, abrangência territorial de referência ou relação com diretrizes. |
| Base urbanística | O módulo Estrutura só trata Quadras e Lotes. | Não há visão de uso predominante, sistema viário, áreas públicas, infraestrutura ou restrições como estados de trabalho. |
| Dossiê inicial | O upload privado está somente no módulo Documentos. | A pessoa não enxerga, na Identificação, quais categorias de evidência serão necessárias nem como iniciar o primeiro anexo após salvar o rascunho. |
| Completude | O painel lateral considera a base completa com dois campos. | A conclusão visual não distingue referência mínima, dados territoriais, dossiê iniciado e pendências. |

## Dossiê proposto para a Identificação

A Lei nº 6.766/1979 distingue loteamento, desmembramento e outras condições de parcelamento urbano, atribui ao Município ou Distrito Federal a aprovação do projeto e descreve elementos de diretrizes, projeto, memorial e registro. Esses itens serão tratados no CRM apenas como **categorias de referência e pendências**; o sistema não certificará aprovação, regularidade, propriedade, registro ou conformidade jurídica. [1]

| Seção proposta | Informações de trabalho | Tratamento seguro |
|---|---|---|
| Base do cadastro | Referência interna, nome de trabalho, enquadramento e uso predominante declarado. | Campos controlados; não representam aprovação, publicidade ou estoque. |
| Situação territorial | Município, UF, zona/área de referência e enquadramento territorial declarado. | Sem endereço preciso, coordenada, matrícula ou dado de terceiros. |
| Caracterização urbanística | Sistema viário, áreas públicas, infraestrutura e restrições, sempre como “não informado”, “em referência”, “em revisão” ou “pendência”. | Não calcula índice urbanístico, não conclui adequação e não substitui análise técnica. |
| Situação do processo | Diretrizes, projeto, aprovação municipal, registro e implantação, apenas em estado de trabalho. | Nenhum número de processo, ato, matrícula ou aprovação é inferido. |
| Dossiê inicial | Acesso visível a documento de identificação, planejamento, município, registro, implantação, ambiente e outra evidência interna. | O anexo real exige rascunho salvo, subject ativo, MFA recente, contexto, grant, finalidade, auditoria redigida, tipo permitido e limite de tamanho. |
| Resumo de completude | Referência, território, enquadramento, situação e dossiê. | Mostra somente o que foi informado; não usa dados fictícios nem libera comandos. |

## Limites de segurança e de negócio

Os dados serão mantidos como rascunho interno por organização e contexto autorizado. Informações registrárias, municipais e documentais poderão ficar explicitamente pendentes, em vez de exigirem preenchimento artificial. O primeiro anexo continuará privado e fora da Identificação até existir um rascunho salvo; a Identificação receberá um encaminhamento destacado para esse passo, evitando a impressão de que o recurso não existe.

| Mantido fora deste marco | Motivo |
|---|---|
| Valor de lote, valor por metro quadrado, índices, reajustes, comissão e projeção | Conteúdo econômico e financeiro não autorizado. |
| Venda, comprador, corretor, reserva, proposta e contrato | Pertencem a setores próprios e permanecem bloqueados. |
| Dados pessoais, documentos reais, matrícula, processo ou arquivo de terceiro | Não serão usados em testes, documentação ou mensagens. |
| Aprovação, registro ou conformidade automática | Dependem de órgãos e de validação profissional; a interface exibirá somente estados de trabalho. |

## Implementação A206 e evidências

O Módulo 01 foi reorganizado em quatro blocos visíveis: **Base do cadastro**, **Enquadramento declarado**, **Território de referência** e **Situação e pendências**. A tela separa o preenchimento mínimo necessário para criar um rascunho da completude do dossiê e usa “A confirmar na revisão” quando a equipe ainda não possui informação segura.

O botão **Adicionar documento inicial** agora é exibido no fim da Identificação. Antes de existir rascunho, ele informa por que permanece bloqueado. Depois de o rascunho existir, encaminha à área de Documentos já selecionada na categoria **Identificação inicial**. O upload continua a utilizar o mesmo caminho privado e protegido: subject ativo, MFA recente, contexto autorizado, grant, finalidade, auditoria redigida, validação de tipo e limite de tamanho. Nenhum nome original, URL, chave ou conteúdo de arquivo é mostrado na tela.

| Verificação | Resultado |
|---|---|
| Persistência | A migração aditiva A206 foi aplicada no banco conectado. Ela introduz somente categorias, referências e notas internas de identificação, além da categoria documental `identity`; não criou ou atualizou loteamentos. |
| Segurança da migração | As novas RPCs exigem autoridade ativa, têm `SECURITY DEFINER` com `search_path` vazio, registram somente metadados redigidos e revogam execução direta de `anon` e `authenticated`. |
| Testes dirigidos | 17 testes em 3 arquivos passaram, cobrindo contrato, serviço, migração e a nova composição da tela. |
| Validação integral | 207 arquivos de teste e 499 testes passaram, assim como tipagem, build compatível com Netlify e integridade do diff. |
| Revisão visual | A Identificação mostrou as quatro seções e o dossiê inicial em desktop e em viewport móvel; os campos se reorganizam em uma coluna no celular e o botão não fica oculto. |
| Entrega | ZIP de código e HTML de visualização foram gerados. A verificação final confirmou ausência de `.env`, dependências, logs, build, documentos históricos, checklist, identificadores reais conhecidos, credenciais e endpoints de infraestrutura. |
| Limite remanescente | Não foi feito teste positivo de gravação ou upload porque a pessoa usuária ainda precisa concluir o MFA no próprio autenticador. Nenhum dado, documento ou anexo real foi criado. |

O verificador de segurança externo apresentou apenas os avisos históricos de RLS sem policy permissiva — configuração usada para negação direta e acesso exclusivo por RPC no servidor — e a recomendação global de proteção contra senha vazada. Não foi aplicado nenhum ajuste fora deste marco.

## Referência

[1]: https://www.planalto.gov.br/ccivil_03/leis/l6766.htm "Lei nº 6.766/1979 — Parcelamento do Solo Urbano"
