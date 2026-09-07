# Pesquisa preliminar — Central de Vendas

**Data de referência:** 7 de setembro de 2026. Este documento registra somente fontes públicas e decisões arquiteturais preliminares. Não constitui aconselhamento jurídico, financeiro, contábil ou bancário; a configuração contratual e tributária deve ser revisada pelos profissionais responsáveis antes da entrada em produção.

## Achados aplicáveis

| Fonte | Achado verificável | Consequência de arquitetura |
| --- | --- | --- |
| Banco Central do Brasil | As regras modernizadas admitem pagamento de boleto por outro arranjo, como Pix; o boleto dinâmico exige infraestrutura de registro/escrituração compatível e sua operação depende dos sistemas autorizados. [1] | O CRM não pode fingir emissão ou liquidação bancária. Deve separar a **agenda interna de recebíveis** da emissão bancária efetiva, que só ocorrerá por integração contratada e autenticada com instituição ou provedor habilitado. |
| FEBRABAN | A plataforma de cobrança registrada foi concebida para dar mais controle, segurança e confiabilidade ao processo de apresentação e cobrança de boletos. [2] | Cada título interno precisa ter estado, versão, origem, evidência de sincronização e trilha auditável; dados bancários, linha digitável e QR Code não podem ser inventados ou persistidos antes de confirmação do integrador. |
| LGPD, arts. 6º, 7º e 9º | Finalidade, adequação, necessidade, transparência, segurança, prevenção e prestação de contas orientam o tratamento; a lei prevê hipóteses como execução de contrato e obrigação legal/regulatória, conforme o caso. [3] | A Central precisa limitar cada perfil, anexo e consulta à finalidade explícita, aplicar menor privilégio, registrar acesso material e impedir que dados de documentos ou CPF sejam exibidos em listas, históricos ou relatórios amplos. |
| Lei nº 6.766/1979 | O parcelamento urbano se submete também a normas estaduais e municipais; o texto prevê requisitos e documentação do loteamento e disciplina compromissos de compra e venda. [4] | O estoque deve manter fatos do empreendimento e do lote separados dos atos comerciais. A conclusão de venda deve depender de pré-condições cadastrais e jurídicas configuráveis, sem assumir aprovação, registro ou escrituração. |
| Decreto-Lei nº 58/1937 | O instrumento histórico prevê elementos contratuais como identificação das partes, descrição do lote, preço e forma de pagamento, encargos e restrições, e deixa claro que efeitos registrais não são substituídos por um sistema operacional. [5] | O CRM deve operar contratos como documentos privados versionados, aprovados por fluxo jurídico, com campos estruturados mínimos e estado de revisão; nunca gerar uma escritura, um registro imobiliário ou um efeito jurídico definitivo automaticamente. |

## Decisões preliminares

1. **Preservar antes de unificar.** Clientes Loteadora e Vendas de Lotes permanecem acessíveis por rotas compatíveis enquanto a nova Central de Vendas é introduzida. O menu pode redirecionar de maneira explícita somente após testes de continuidade.
2. **Separar etapas e estados.** Escolha de lote, qualificação do cliente, proposta/negociação, aprovação, contrato, títulos internos, emissão bancária, liquidação e cobrança são estados diferentes. Uma mudança deve ser transacional, idempotente e auditada.
3. **Não transformar estoque por intenção.** O lote não pode se tornar vendido apenas pela abertura de uma tela. Reserva, proposta aprovada, contrato pronto e venda efetivada precisam de políticas, autorizações e transições distintas.
4. **Tratar parcelas como agenda de recebíveis.** A negociação pode gerar um plano de parcelas interno, inclusive entrada, carência, intermediárias e balões. A geração de boletos bancários, linha digitável, Pix de cobrança e baixa deve ocorrer somente após integração aprovada com o banco/provedor e confirmação de retorno.
5. **Alertas determinísticos e deduplicados.** Vencimento e atraso devem ser calculados em rotina agendada, idempotente e auditada. O alerta é uma tarefa interna para o operador; ele não deve disparar cobrança ao cliente ou alterar situação financeira sem regra e canal aprovados.
6. **Documentos privados e revisáveis.** Manter anexos opacos, com metadados mínimos, acesso contextual e sem exibir URLs/chaves. A geração de contrato fica bloqueada até revisão do modelo jurídico e das regras por empreendimento.

## Referências

[1]: https://www.bcb.gov.br/detalhenoticia/20520/noticia "Banco Central — BC moderniza normas para boletos e autoriza pagamento por Pix"
[2]: https://portal.febraban.org.br/pagina/3150/1094/pt-br/servicos-novo-plataforma-boletos "FEBRABAN — Nova Plataforma de Boletos de Pagamento-Cobrança Registrada"
[3]: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm "Lei nº 13.709/2018 — LGPD"
[4]: https://www.planalto.gov.br/ccivil_03/leis/l6766.htm "Lei nº 6.766/1979 — Parcelamento do Solo Urbano"
[5]: https://www.planalto.gov.br/ccivil_03/decreto-lei/1937-1946/Del058.htm "Decreto-Lei nº 58/1937 — Loteamento e venda de terrenos a prestações"
