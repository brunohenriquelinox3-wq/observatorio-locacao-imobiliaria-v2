# Metodologia de engenharia anti-erro — CRM imobiliário

## Versão 0.1 — agosto de 2026

> **Tese:** não existe execução sem risco. A disciplina de engenharia reduz a chance de erro previsível, diminui o raio de impacto quando algo falha e deixa prova suficiente para detectar, conter, recuperar e aprender sem apagar a história.

## 1. Escopo da revisão

Esta revisão não trata “bug” como sinônimo de tela quebrada. No CRM, uma falha pode ser uma reserva concorrente, uma policy que lê outra SPE, uma versão de tabela aplicada fora da vigência, uma mensagem repetida, uma fila parada, uma exportação parcial, uma evidência exposta, um cálculo que arredonda de modo incompatível, um deploy com segredo errado ou um insight de IA sem fonte. A estratégia deve tratar a falha no ponto em que ela nasce e no fluxo que a torna visível.

| Frente | Pergunta de auditoria | Evidência de saída |
| --- | --- | --- |
| Correção de domínio | O estado, a transição e a regra produzem o resultado pretendido? | Invariantes, teste unitário/transacional, caso de concorrência e audit event. |
| Dados e privacidade | A pessoa certa acessa o dado mínimo pelo tempo correto? | RLS/grant/policy, teste permitir/negar, classificação, retenção e log minimizado. |
| Integração | Efeito externo é único, explicado e reconciliável? | Contrato de API, inbox/outbox, idempotência, sandbox, retry e caso de exceção. |
| Disponibilidade e performance | A jornada responde sob volume, falha parcial e degradação? | SLI/SLO, carga sintética, fallback, alerta e capacidade medida. |
| Mudança e dependência | O release é reproduzível, reversível e conhecido? | Migration, revisão, artefato, inventário de dependência, feature flag e rollback. |
| Experiência e acessibilidade | Estado, erro e recuperação são compreensíveis sem esconder risco? | Teste de fluxo, teclado, estado vazio/erro/parcial, telemetria de tarefa e fallback. |
| Operação e aprendizado | A equipe contém o problema e elimina a causa sistêmica? | Runbook, incidente, linha do tempo, ação corretiva, owner e teste de regressão. |

## 2. Ficha única de risco e falha

Cada item de risco, bug encontrado, incidente ou antipadrão usa uma ficha comum. A equipe não fecha o item ao “corrigir o sintoma”: ela registra como o defeito foi impedido, detectado, contido e testado contra reincidência.

| Campo | Uso |
| --- | --- |
| `risk_id`, classe e jornada | Distingue domínio, acesso, integração, release, UX, performance, dependência ou IA. |
| Cenário e invariante | Declara o que pode acontecer e o que nunca pode acontecer. |
| Severidade, probabilidade, detectabilidade e raio | Prioriza por impacto real, não por volume de tickets. |
| Fonte e confiança | Separa especificação oficial, vulnerabilidade, incidente interno, fonte comunitária e hipótese. |
| Prevenção | Código, schema, policy, contrato, validação, limite ou revisão que evita a falha. |
| Detecção e contenção | Sinal, alerta, owner, flag, bloqueio, modo degradado ou fila de exceção. |
| Recuperação e reconciliação | Replay, compensação, migration corretiva, restore ou análise humana — com limite explícito. |
| Teste de regressão e dono | Prova automatizada/manual, ambiente, data de revisão e responsável por manter o controle. |

## 3. Hierarquia de fontes e soluções

O estudo usará fontes em ordem de força. A documentação oficial, padrão ou especificação define limite e comportamento. Repositório oficial, issue tracker, advisory de segurança e changelog ajudam a explicar versão e regressão. Comunidades técnicas são úteis para reproduzir sintomas e encontrar alternativas, mas uma resposta não vira padrão do CRM sem versão, fonte primária, teste local e revisão de segurança.

| Nível | Onde pesquisar | Como pode entrar na estratégia |
| --- | --- | --- |
| Primário | Documentação oficial, especificação, CVE/advisory, RFC, changelog e repositório do fornecedor. | Define comportamento esperado, limite e versão. |
| Operacional | SRE, OWASP, NIST, projetos de testes, observabilidade e segurança reconhecidos. | Define controles e critérios proporcionais ao risco. |
| Diagnóstico | Issue trackers oficiais, discussões de mantenedores, bases de erro e ferramenta de monitoramento. | Ajuda a reproduzir, classificar e acompanhar regressão. |
| Comunitário | Stack Overflow, fóruns e respostas de desenvolvedores. | Gera hipótese; exige validação contra fonte primária e teste. |

## 4. Classes iniciais de falha que a estratégia deve cobrir

1. **Estado de domínio:** transição inválida, concorrência, reentrada, versão defasada, valor/índice/arredondamento e compensação ausente.
2. **Escopo e autorização:** bypass de RLS, role excessivo, sessão/claim defasado, MFA insuficiente, exportação/arquivo fora de finalidade e segredo exposto.
3. **Integridade e integração:** evento duplicado, fora de ordem, perda de callback, timeout, rate limit, contrato quebrado, divergência de reconciliação e processamento parcial.
4. **Dados e documentos:** migration incompatível, default incorreto, timezone, codificação, arquivo incompleto, hash ausente, retenção/hold e backup de objeto distinto do banco.
5. **Interface e experiência:** loading infinito, estado vazio confundido com zero, erro oculto, dupla submissão, foco perdido, permissão inconsistente, cache obsoleto e mobile degradado.
6. **Release e dependência:** ambiente cruzado, variável ausente, feature flag órfã, pacote vulnerável, drift de schema, build não reproduzível, rollout sem rollback e observabilidade insuficiente.
7. **Capacidade e falha parcial:** pool exaurido, fila envelhecida, Realtime limitado, payload excedido, função interrompida, dependência lenta e custo sem orçamento.
8. **Inteligência e decisão assistida:** fonte ausente, dado fora de escopo, prompt/instrução não confiável, avaliação incompleta, automação de alto impacto e ausência de kill switch.

## 5. Portas de qualidade

Uma capacidade sensível não é “concluída” por ter código. Ela avança em cinco portas: **modelar a invariante → prevenir no desenho → provar em teste → observar em uso → aprender após desvio**. A ausência de uma porta mantém o item em risco conhecido e impede promoção conforme sua severidade.

## 6. Limites explícitos

Nenhum catálogo torna um CRM perfeito ou elimina validação humana de tema jurídico, registral, fiscal, contábil, privacidade, KYC, pagamento ou segurança. A disciplina evita que a aplicação transforme uma regra incerta em automação opaca, preserva o caso de exceção e exige os responsáveis habilitados quando o efeito ultrapassa o software.
