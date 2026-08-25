# UX-FIN-01 — experiência anti-erro para ações financeiras e críticas

**Captura:** 25 de agosto de 2026.  
**Estado:** `adotado_com_gate` — padrões de interface entram na definição de pronto dos fluxos críticos; a semântica de cada parceiro e contrato continua sendo validada em homologação.

## 1. Princípio

Uma interface financeira não deve esconder incerteza atrás de um botão “confirmar”. Ela precisa mostrar fato, base de cálculo, destinatários, estado do parceiro, irreversibilidade, alçada e próxima ação. O critério W3C para transações financeiras e compromissos relevantes admite reversão, checagem com correção ou revisão/confirmação antes da submissão; isso se encaixa diretamente em instruções de cobrança, distribuição, baixa, estorno, exportação e exclusão de dados controláveis. [1]

## 2. Classes de ação e proteção de interação

| Classe | Exemplos | Interface obrigatória | Efeito de domínio |
| --- | --- | --- | --- |
| Consulta | Ver parcela, split, lote, log ou evidência. | Fonte, recorte, data de atualização, estado e link de origem. | Não muda estado. |
| Rascunho reversível | Simular distribuição, salvar proposta de acordo, preparar configuração. | Validação inline, simulação e salvamento como rascunho. | Versionável; não envia ao parceiro. |
| Solicitação crítica | Instruir cobrança, pedir repasse, aprovar acordo, publicar unidade. | Tela de revisão com dados-chave, checagem de alçada, confirmação explícita e referência de política. | Cria pedido/instrução; não alegar liquidação. |
| Ação com efeito externo | Enviar comando a parceiro, iniciar assinatura, reprocessar callback. | Mostrar parceiro, ambiente, chave de idempotência, efeitos esperados, estado inicial e rota de exceção. | Evento externo registrado; resultado depende de retorno. |
| Correção/compensação | Estorno, distrato, ajuste de entitlement, revogação de acesso. | Comparação antes/depois, vínculo ao fato original, motivo, aprovação e impacto residual. | Cria fato compensatório; não apaga histórico. |
| Exclusão irreversível | Purga permitida de dado controlável ou chave temporária. | Revisão, confirmação e mecanismo de recuperação quando aplicável. | Auditoria da ação, retenção/política e bloqueio por hold. |

## 3. Cartão de revisão antes de uma instrução de split

Antes de solicitar execução ao parceiro, o CRM deve apresentar um **cartão de revisão** que responda em linguagem direta:

| Campo visível | Pergunta respondida |
| --- | --- |
| Fato e parcela | Qual recebimento/contrato/empreendimento motivou a instrução? |
| Base e tarifa | O percentual incide sobre bruto ou líquido? Quem absorve taxa? |
| Regra e revisão | Qual versão contratual/política foi usada e desde quando vigora? |
| Destinatários | Quem recebe, em que papel, com valor/percentual, prioridade e estado de habilitação? |
| Parcialidade | Há pagamento parcial, retenção, bloqueio, arredondamento ou item sem elegibilidade? |
| Parceiro | Qual adaptador, ambiente, capacidade/limite e chave externa serão usados? |
| Autoridade | Quem preparou, quem aprova, qual alçada e qual poder vigente permitem seguir? |
| Próximo estado | A ação cria instrução, aguarda retorno, liquida ou abre exceção? |

## 4. Padrões de mensagens e acessibilidade

W3C recomenda identificar erros em texto, informar qual item falhou e, quando possível, indicar como corrigi-lo; validação de cliente melhora a experiência, mas não substitui validação no servidor. [2] [3] Mensagens críticas devem aparecer tanto no resumo de erro quanto junto ao campo/linha aplicável, sem depender só de cor. [2] [4]

| Situação | Mensagem inadequada | Mensagem operacionalmente útil |
| --- | --- | --- |
| Soma inválida | “Erro no split.” | “A regra 03 excede R$ 4,28 da base líquida disponível. Revise os itens 03 e 07 ou altere a política antes de enviar.” |
| Falha de autorização | “Você não pode.” | “Sua alçada permite preparar, mas não instruir repasse acima de R$ X para esta SPE. Solicite aprovação de [papel] até [data].” |
| Callback repetido | “Falhou.” | “Este retorno já foi registrado em 25/08 às 14:03. Nenhum valor foi aplicado novamente. Abrir evidência do evento.” |
| Parceiro indisponível | “Tente mais tarde.” | “A instrução está em exceção; nenhum repasse foi confirmado. Próxima reconciliação: [janela]. Chave externa: [referência].” |
| Estorno parcial | “Estorno concluído.” | “A devolução foi confirmada para a conta integradora. Os direitos de recebedores permanecem em reconciliação e exigem ação compensatória.” |

## 5. Definição de pronto para UX crítica

1. Validação de domínio no servidor e validação de ajuda no cliente; valores alterados automaticamente devem ser informados ao usuário. [2] [3]
2. Erro descritivo, texto de correção, foco navegável e alternativa não cromática.
3. Confirmação proporcional ao impacto; não usar modal para cada salvamento comum, mas usar revisão para compromisso financeiro, legal, exclusão ou mudança de alçada.
4. Cada estado mostra se o efeito é local, solicitado, confirmado, parcial, recusado ou em reconciliação.
5. Ações irreversíveis têm cancelamento/reversão quando o domínio permite; quando não permite, o sistema orienta o fato compensatório e o responsável.
6. Simulações nunca usam o rótulo “liquidado”, “pago” ou “confirmado”.
7. O log de decisão pode ser aberto por pessoas autorizadas, sem expor segredos, dados desnecessários ou conteúdo de outros tenants.

## Referências

[1] [W3C WAI — Error Prevention (Legal, Financial, Data)](https://www.w3.org/WAI/WCAG21/Understanding/error-prevention-legal-financial-data.html)  
[2] [W3C WAI — Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)  
[3] [W3C WAI — Validating Input](https://www.w3.org/WAI/tutorials/forms/validation/)  
[4] [W3C WAI — User Notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
