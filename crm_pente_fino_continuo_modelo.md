# Modelo operacional de pente fino contínuo

> **Regra central.** Nenhuma alteração é “pequena” por definição. Ela é classificada pela superfície que toca, pelo efeito possível e pela reversibilidade. A varredura acompanha essa classificação, com ferramentas sobre o diff e evidência humana sobre a decisão.

## 1. A unidade de controle é a mudança

O CRM trata **diff + configuração + migration + dependência + teste + decisão de promoção** como uma única unidade auditável. Uma linha não chega à branch protegida sem passar por análise automatizada aplicável ao arquivo modificado; uma mudança crítica não chega a ambiente real sem prova adicional de isolamento, integração, recuperação e observação.

| Classe | Exemplos | Risco predominante | Regra de promoção |
|---|---|---|---|
| C0 — apresentação | Texto, estilo, composição estática | Regressão visual, acessibilidade, interpretação | Tipo, lint, preview e revisão visual |
| C1 — lógica local | Formulário, estado de interface, regra determinística sem efeito externo | Regressão de fluxo, validação e estado inconsistente | Teste unitário/interação e revisão de diff |
| C2 — dado governado | Schema, RLS, RPC, Storage, exportação | Vazamento, acesso indevido, corrupção ou concorrência | Teste permitir/negar, migration efêmera, revisão de segurança |
| C3 — efeito econômico ou externo | Recebível, split, callback, parceiro, documento legal, acesso privilegiado | Saldo, direito, pagamento, contrato ou privilégio indevido | Invariantes, idempotência, fixture, outbox/inbox, alçada e plano de compensação |
| C4 — incidente/recovery | Restore, emergência, falha de segurança, dados afetados | Perda de evidência, indisponibilidade ou dano material | Runbook, dupla validação, correlação, comunicação e postmortem |

## 2. Gates de varredura

| Gate | Momento | Pergunta de pente fino | Provas obrigatórias | Bloqueio |
|---|---|---|---|---|
| G-1 — editor | Durante a escrita | O código é sintaticamente/tipadamente coerente e evita padrão proibido? | Typecheck, linter, formatter, secret scan local, testes focados | Diagnóstico bloqueante ou segredo potencial |
| G0 — commit | Antes de compartilhar | O diff carrega alteração acidental, lockfile inesperado ou teste quebrado? | Diff revisado, testes focados, mensagem com escopo e risco | Arquivo fora do escopo, alteração sem justificativa ou suite vermelha |
| G1 — pull request | Antes de merge | A intenção, a arquitetura e a dependência correspondem ao requisito? | Revisão humana, SAST, dependency review, licença, SBOM/provenance quando aplicável, checklist C0–C4 | Alerta alto sem tratamento, requisito sem teste, exceção sem prazo |
| G2 — preview | Antes de homologar | A jornada visível, acessível e responsiva continua íntegra? | E2E isolado, visual desktop/mobile, caso permitir/negar e exploração manual | Fluxo crítico falha, regressão de contraste/foco ou estado enganoso |
| G3 — homologação | Antes de produção | O dado, a policy, a integração e a recuperação obedecem ao contrato? | Migration efêmera, fixtures de parceiro, webhook duplicado, rollback/compensação e SLO de referência | Efeito não idempotente, RLS sem teste negativo ou recuperação não ensaiada |
| G4 — produção | Durante e após promoção | O release produz sinal saudável e permanece reversível? | Release ID, correlação, canary proporcional, trace/métrica/log minimizados e owner | SLO degradado, erro novo material ou budget excedido |
| G5 — incidente | Após falha material | A causa pode ser reproduzida sem dado real e a correção previne recidiva? | Timeline, fixture sintética, regressão, postmortem, ação com dono e data | Caso encerrado por relato, workaround ou exclusão de registro |

## 3. Regras especiais para o CRM

O mecanismo de controle deve ser mais rigoroso quanto maior o impacto. Para **RLS**, há sempre teste de permitir e negar por organização, SPE, objeto, finalidade e vigência. Para **financeiro/split**, há sempre chave de idempotência, evento de intenção, referência externa, estado incerto, reconciliação e prova de que repetição/reordenação não duplica saldo, direito ou instrução. Para **login/administração**, há sempre MFA/step-up quando aplicável, expiração de sessão, recuperação restrita, audit event e revogação. Para **documento**, há sempre política de acesso, versão, URL temporária e tentativa negada.

## 4. Exceções e congelamento de mudança

Uma exceção não é uma aprovação informal. Ela contém **risco aceito, motivo, owner, aprovador, compensação, expiração e condição de reabertura**. Se uma jornada crítica consome o orçamento de erro ou manifesta falha recorrente, mudanças não essenciais daquela superfície são congeladas até que exista correção, prova de regressão e decisão de retomada. O objetivo não é punir entrega: é impedir que a velocidade repita o mesmo dano [8].

## 5. Contrato mínimo de revisão humana

A revisão humana não faz “leitura estética de código”. Ela responde: qual fato de domínio muda; qual policy ou invariável impede o estado inválido; qual erro conhecido a alteração poderia reintroduzir; qual teste falharia sem a correção; qual sinal exporia falha em produção; e como desfazer/compensar sem apagar a história.

## Referências

[1]: https://csrc.nist.gov/pubs/sp/800/218/final "NIST SP 800-218 — Secure Software Development Framework"
[2]: https://owasp.org/www-project-application-security-verification-standard/ "OWASP Application Security Verification Standard 5.0"
[3]: https://slsa.dev/ "SLSA — Supply-chain Levels for Software Artifacts"
[4]: https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning "GitHub Docs — Code scanning"
[5]: https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review "GitHub Docs — Dependency review"
[6]: https://playwright.dev/docs/best-practices "Playwright — Best practices"
[7]: https://opentelemetry.io/docs/concepts/observability-primer/ "OpenTelemetry — Observability primer"
[8]: https://sre.google/workbook/error-budget-policy/ "Google SRE — Example Error Budget Policy"
