# Diretriz raiz — execução sem atalhos, prova antes de promoção

**Status:** `v1.0 · vinculante para estratégia, desenho, implementação, operação e revisão`  
**Regra central:** nenhuma atividade é considerada concluída por parecer pronta. Ela só pode ser promovida quando a equipe consegue explicar **o que mudou, por que mudou, que risco foi considerado, qual prova sustenta o resultado, quem é responsável, qual limite permanece e como detectar ou corrigir um desvio**.

> **Velocidade aceitável é a que reduz retrabalho por antecipar a prova. Pressa que remove evidência, revisão, teste, validação ou recuperação não é eficiência; é risco adiado.**

## 1. Cadeia única de execução

Toda mudança — seja uma pesquisa, decisão, documento, regra de domínio, tela, migration, integração, privilégio, pagamento, release ou incidente — percorre a mesma cadeia. As provas aumentam com a criticidade; nenhuma etapa pode ser substituída por expectativa, urgência ou autoridade informal.

| Etapa | Pergunta obrigatória | Artefato mínimo | Bloqueio de promoção |
| --- | --- | --- | --- |
| **I — intenção** | Qual problema, escopo, resultado e limite estão sendo tratados? | Pedido/objetivo, não-objetivos, owner e risco inicial. | Objetivo ambíguo, escopo aberto ou efeito não classificado. |
| **E — evidência** | O que sustenta a hipótese e qual é a força/limitação da fonte? | Fonte, recorte, data, confiança, conflito e lacuna. | Regra importante baseada só em publicidade, memória, hipótese ou fonte não verificada. |
| **D — decisão** | Qual regra foi escolhida, o que foi rejeitado e quem valida o caso concreto? | Decisão datada, owner, limite, exceção e impacto. | Decisão sem responsável, sem limite ou que trate especialista/parceiro como detalhe. |
| **R — requisito** | Que comportamento observável, invariante e critério de aceite representam a decisão? | Cenário permitir/negar, estado esperado, sinal de falha e reversão. | Requisito genérico, sem falha prevista ou sem resultado verificável. |
| **P — prova prática** | O comportamento permanece correto no nível proporcional ao risco? | Teste, fixture, revisão, preview, migração isolada ou ensaio operacional. | Código/tela sem prova compatível; evidência só declarativa em mudança crítica. |
| **O — observação** | Como a operação saberá que a mudança está saudável ou desviou? | Métrica/sinal, correlação, owner, limiar, runbook e fila de exceção. | Efeito externo, dado governado ou jornada crítica sem sinal e próxima ação segura. |
| **A — aprendizado** | Como o desvio, dúvida ou incidente evita reincidência? | Caso, causa, decisão, regressão, ação corretiva e revisão futura. | Fechamento por workaround, relato oral, exclusão de registro ou ausência de regressão. |

> A cadeia `I → E → D → R → P → O → A` não é burocracia linear. Ela permite voltar: uma prova que falha reabre requisito/decisão; uma nova fonte reabre a hipótese; um incidente atualiza risco, teste e runbook. O que não pode acontecer é pular a trilha e chamar o resultado de seguro.

## 2. Portas de promoção e proporcionalidade

Os gates existentes C0–C4 e G-1–G5 permanecem válidos. Esta diretriz acrescenta a **porta anterior D-0**, que impede iniciar pesquisa, desenho ou construção sem entendimento rastreável do objetivo e do risco. [1] [2]

| Classe | Exemplos | Prova mínima não negociável | Prova adicional se houver incerteza ou alto raio |
| --- | --- | --- | --- |
| **D-0 — descoberta/decisão** | Estudo, benchmark, mudança de estratégia, hipótese de produto. | Intenção, fonte/limite, owner, conflito, decisão e critério de promoção. | Segundo confronto independente, parecer especializado ou piloto controlado. |
| **C0 — apresentação** | Texto, estilo, gráfico estático, organização visual. | Revisão de conteúdo, acessibilidade, desktop/mobile e build. | Pesquisa de compreensão, contraste/foco, validação com operação. |
| **C1 — lógica local** | Formulário, validação, estado de tela, cálculo determinístico sem efeito externo. | Invariante, unitário/interação, caso de erro e revisão de diff. | Testes de propriedade, caso de borda e regressão de fluxo. |
| **C2 — dado governado** | Schema, RLS, Storage, exportação, RPC, migração. | Permitir/negar, migration isolada, política, reversibilidade e revisão de segurança. | Concorrência, carga, recuperação e recertificação de acesso. |
| **C3 — efeito econômico/externo** | Reserva, contrato, split, cobrança, callback, pagamento, privilégio. | Idempotência, intenção, alçada, fixture, estado incerto, compensação e reconciliação. | Sandbox/parceiro, reordenação, timeout, partialidade e simulação de fraude/abuso. |
| **C4 — incidente/recovery** | Restore, emergência, vazamento, indisponibilidade material. | Runbook, dupla validação, correlação, comunicação, contenção e postmortem. | Exercício prévio, recuperação em ambiente isolado e ação corretiva com data. |

## 3. Regras que não podem ser negociadas

| Regra | Aplicação prática |
| --- | --- |
| **Nada crítico é presumido.** | Dinheiro, acesso, documento, dado pessoal, registro, contrato, integração e produção exigem fonte, estado, owner e prova; nenhuma interface escondida substitui policy/transação. |
| **O teste deve tentar falhar.** | Além do caminho feliz, cada mudança relevante inclui duplicata, concorrência, expiração, ausência de permissão, timeout, retorno tardio, dado incompleto ou reversão aplicável. |
| **A exceção é um caso, não uma brecha.** | Exceção preserva motivo, risco, compensação, aprovador, expiração, condição de reabertura e próxima revisão. |
| **Fato não se apaga para fechar a tela.** | Correção de valor, direito, ativo, contrato, acesso ou evento usa versão, retificação, revogação, compensação ou caso — nunca edição destrutiva de histórico. |
| **Cada integração tem dono e fronteira.** | Um parceiro não determina sozinho o estado interno; intenção, retorno, correlação, reconciliação e compensação preservam a decisão do produto. |
| **O especialista valida o que excede o software.** | Jurídico, registro, engenharia, contador/fiscal, DPO, instituição de pagamento e parceiro contratado decidem o caso que depende de sua habilitação. |
| **Sem evidência de efeito, o estado é incerto.** | Timeout, comprovante, callback isolado ou resposta visual não confirmam liquidação, reserva, assinatura, exportação ou revogação. |

## 4. Auditoria e pente fino contínuos

| Momento | Perguntas de pente fino | Saída exigida |
| --- | --- | --- |
| Antes de iniciar | Existe resultado, limite, owner, risco e evidência suficiente para começar? | D-0 aprovado ou hipótese marcada como não promovida. |
| Durante o trabalho | A alteração ainda corresponde ao escopo? Mudou invariante, dado, permissão, dependência ou reversibilidade? | Diff/decisão atualizado e classe de risco reavaliada. |
| Antes de entregar | O comportamento visível e invisível foi testado no nível correto? | Critérios de aceite, testes, revisão e sinais registrados. |
| Após promover | O sinal confirma resultado, há regressão, fila de exceção, feedback de operação ou desvio? | Observação, owner, decisão de manter/ajustar/reverter. |
| Depois de falhar | A causa é reproduzível sem dado real e a correção impede repetição? | Caso, regressão, runbook, ação corretiva e revisão de risco. |

## 5. Medida de eficácia e eficiência

| Dimensão | Pergunta verificável | Evidência de eficácia | Evidência de eficiência |
| --- | --- | --- | --- |
| Pesquisa/estratégia | A decisão responde à necessidade e preserva conflito/limite? | Fonte suficiente, owner, requisito e critério de promoção. | Menos retrabalho por não promover hipótese como regra. |
| Experiência | A pessoa encontra, entende, age e se recupera sem ser enganada? | Fluxo, acessibilidade, erro, vazio, parcialidade e mobile validados. | Menos cliques repetidos, dúvida e abertura de suporte por estado opaco. |
| Dados/acesso | A policy impede o que deve negar e permite somente o necessário? | Casos permitir/negar, escopo, finalidade, vigência e audit event. | Menos correção manual, privilégio excessivo e investigação de vazamento. |
| Financeiro/integração | O efeito é único, explicado, correlacionado e conciliável? | Idempotência, estado incerto, exceção, settlement e reconciliação. | Menos retrabalho de baixa, duplicata, planilha paralela e disputa de saldo. |
| Release/incidente | A mudança é reversível, observável e aprendida? | Preview, release, SLO, runbook, recuperação e regressão. | Menos rollback cego, tempo de diagnóstico e reincidência. |

## 6. Contrato de conduta operacional

1. **Não há urgência que transforme risco não entendido em risco aceitável.** Quando a janela é curta, reduz-se o escopo para a menor mudança comprovável; não se remove a prova.
2. **Não há “feito” sem critério de saída.** Se um critério não foi provado, o item fica pendente, bloqueado ou explicitamente aceito como risco temporário pelo owner competente.
3. **Não há “funciona para mim” como evidência de produção.** O comportamento deve ser reproduzível em ambiente, fixture e contexto representativos da jornada.
4. **Não há melhoria sem memória.** Uma dúvida, divergência, falha ou incidente atualiza fonte, requisito, teste, runbook ou regra de decisão.
5. **Não há autoridade ilimitada.** Mesmo a administração privilegiada opera por menor privilégio, justificativa, escopo, vigência, MFA/step-up e auditoria.

## Referências

[1] [Metodologia de engenharia anti-erro](crm_engenharia_antierro_metodologia.md)

[2] [Modelo de pente fino contínuo](crm_pente_fino_continuo_modelo.md)

[3] [Catálogo de falhas previsíveis e inesperadas](crm_engenharia_antierro_catalogo_falhas.md)

[4] [Controles anti-erro e recuperação](crm_engenharia_antierro_controles.md)
