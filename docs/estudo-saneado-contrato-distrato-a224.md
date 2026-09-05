# Estudo saneado A224 — dinâmica contratual e distrato de loteamento

> **Uso permitido deste estudo.** Os documentos fornecidos foram tratados como referência de fluxo. Esta síntese não reproduz nomes, endereços, documentos de identificação, contatos, assinaturas, números de chassi/placa, valores individuais, datas individualizantes ou dados de terceiros. Ela não constitui parecer jurídico e não cria vínculo, contrato, distrato, cobrança, pagamento ou alteração de disponibilidade.

## Fonte analisada

| Documento fornecido | Abrangência consultada | Uso no CRM |
|---|---|---|
| Contrato de promessa de compra e venda de loteamento | Primeiras cinco páginas visuais de treze | Levantar a separação entre qualificação/reserva, objeto físico, preço, parcelas, corretagem, obrigações e eventos de inadimplência. |
| Distrato de compromisso de compra e venda e cessão de direitos | Texto das três primeiras páginas de quatro | Levantar os eventos de referência do contrato original, reversão, restituição, quitação, posse e encerramento. |

## Padrões operacionais extraídos

| Padrão | Interpretação para produto | Limite de implantação atual |
|---|---|---|
| Ficha de qualificação e reserva antecede o contrato | Dados de partes, lote e uma configuração preliminar podem existir em etapa própria, sem constituir contrato. | Não importar pessoas, documentos, endereços, corretor ou comissão na política de preço-base. |
| Objeto físico é identificável por empreendimento, Quadra, Lote e área | O contrato depende de uma referência física que deve coincidir com a matriz autorizada. | A importação A223 confere referência; não altera área, cria Lote ou determina disponibilidade. |
| Configuração de preço inclui entrada, parcelas e periodicidades | Preço-base por m² é apenas uma camada anterior à negociação e não substitui uma condição contratual. | Não criar plano de pagamento, saldo, vencimento, correção, desconto, encargo ou recebível. |
| Corretagem aparece separada do preço do imóvel | Comissão é domínio próprio e não deve ser somada, deduzida ou inferida da regra de preço-base. | Não criar corretor, comissão, pagamento a terceiro ou repasse. |
| O contrato prevê obrigações, custos, pagamento pontual, correção, consequências de atraso e possibilidade de rescisão | Eventos contratuais exigem trilha de fatos e documentos próprios, não um campo simples de status. | Não abrir cobrança, negativação, rescisão, retenção, multa, juros ou alteração de situação do Lote. |
| O distrato referencia instrumento anterior, objeto, restituição, quitação e restituição de posse | Um distrato deve ser um evento governado que aponta para um contrato material existente, nunca uma simples reversão de preço. | Preparar domínio futuro de distrato; não executar distrato nem retornar Lote a qualquer estado comercial. |
| Há vedação de fracionamento, disciplina para cessão e cláusulas de foro/obrigatoriedade | O ciclo contratual envolve restrições de uso e transferência que pertencem ao domínio contratual, não ao cadastro físico ou à política de preço-base. | Preparar campos/estados futuros de restrição contratual e cessão, sem implantá-los agora. |
| O contrato usa anexo próprio de fluxo de pagamento com parcelas mensais e possíveis parcelas intermediárias | A dinâmica comercial depende de anexo versionado e cronograma associado ao instrumento, separado do preço-base por m². | Não derivar plano de pagamento da política de preço-base; modelar cronograma apenas em etapa contratual futura. |
| O contrato contém material gráfico de localização e páginas de certificação/assinatura digital | Um documento material pode depender de anexos visuais e de evidência de assinatura, mas esses elementos têm classificação e retenção próprias. | Não usar mapa/anexo como fonte de alteração automática da matriz e não guardar logs de assinatura, e-mails, IPs, tokens ou identificadores em registros operacionais do CRM. |

## Regras derivadas para a arquitetura

1. **Preço-base não é contrato.** A política de preço-base permanece anterior e independente de proposta, reserva, contrato, recebível e receita.
2. **Referência física imutável na importação.** Quadra, Lote e área vindos da fonte servem somente para validar aderência; divergências viram pendência de reconciliação.
3. **Qualificação é domínio pessoal separado.** Se uma etapa futura tratar partes, os dados exigirão base legal, transparência, controles LGPD, retenção e permissões específicas.
4. **Condições financeiras são versões contratuais.** Entrada, parcelas, periodicidade, índices, desconto, corretagem, multa, juros, cobrança e restituição não podem nascer de uma política de preço-base.
5. **Distrato é ciclo documental e financeiro.** A futura modelagem deve exigir contrato de origem, motivo, aprovação, evidência documental, efeito de posse/uso, liquidação/restituição e auditoria; a implementação atual permanece bloqueada.
6. **Disponibilidade é decisão posterior.** Nem a planilha de preço, nem a fonte física, nem a existência de uma minuta podem alterar disponibilidade. Essa transição deverá depender de um módulo próprio e de fatos materiais validados.
7. **Cessão, fracionamento e anexos pertencem ao contrato.** Restrições de transferência, proibição de fracionamento e cronogramas anexos devem existir como eventos e documentos do domínio contratual, jamais como atalhos na estrutura física ou na política de preço-base.
8. **Prova de assinatura não é log operacional.** O domínio contratual futuro deve guardar referência segura a um documento final e seu fingerprint, além de estado de assinatura e data de conclusão quando necessário. Dados de autenticação, contato, IP, token, código de verificação e identificadores de assinatura devem ser excluídos/redigidos na visualização e nunca copiados para auditoria funcional.

## Consequência para o escopo autorizado agora

O fluxo A223 permanece limitado a **Quadra, Lote, área e preço-base por m²**, com prévia, versionamento, vigência e aprovação separada. O estudo documental reforça — e não amplia — a proibição atual de criar clientes, contratos, distratos, cobranças, pagamentos, repasses, comissões, receitas ou status comercial de Lote.

## Jornada visual A226

O módulo Preparação passou a exibir um roteiro estático de cinco marcos: referência física, preço-base, qualificação e proposta, formalização, e encerramento/distrato. Essa composição ajuda a orientar o trabalho humano sem gravar qualquer dado de parte, instrumento, assinatura, parcela, valor contratual ou situação comercial.

> **Proteção operacional.** O roteiro não tem comandos de contratação, distrato, cobrança ou retorno de Lote. Preço-base permanece uma referência anterior à proposta; um eventual distrato exigirá, em módulo futuro, instrumento de origem, evidência, aprovação e auditoria antes de produzir qualquer efeito material.
