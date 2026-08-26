# Inventário — diretriz permanente de execução sem atalhos

**Estado:** `lacunas_identificadas_para_consolidação`  
**Princípio solicitado:** nenhuma tarefa é promovida por pressa, aparência de conclusão ou confiança verbal. Toda mudança deve deixar uma prova adequada ao risco e uma rota de aprendizado.

## 1. Controles já presentes

| Controle existente | Onde está consolidado | Proteção que já oferece |
| --- | --- | --- |
| Classificação C0–C4 por superfície, efeito e reversibilidade | `crm_pente_fino_continuo_modelo.md` | Impede que tela, dado, privilégio, dinheiro e recuperação recebam a mesma prova. |
| Gates G-1 a G5 | Modelo de pente fino e metodologia anti-erro | Liga escrita, revisão, preview, homologação, produção e incidente a bloqueios objetivos. |
| Ficha de risco/falha | Metodologia anti-erro | Preserva invariante, prevenção, detecção, contenção, recuperação, regressão e owner. |
| Regra de evidência e fontes | Estratégia, auditorias de estudos e benchmark | Separa fonte, hipótese, decisão, conflito, limitação e impacto. |
| Provas de alta criticidade | Pente fino contínuo | Exige allow/deny, idempotência, outbox/inbox, alçada, compensação e exercício de recuperação. |
| Validação de experiência | Checklist do projeto e telas do observatório | Exige teste, build, TypeScript, desktop/mobile e estados de interface. |
| Exceção datada e congelamento | Modelo de pente fino | Evita que `skip` implícito se transforme em regra permanente. |

## 2. Lacunas que a diretriz raiz precisa fechar

| Lacuna | Risco se permanecer implícita | Regra candidata |
| --- | --- | --- |
| O controle começa no diff, não na formulação do pedido. | Estudo ou decisão chega à implementação sem recorte, limite, owner ou critério de aceite. | Criar gate de **intenção e entendimento** antes de pesquisar, desenhar ou escrever código. |
| “Sem pressa” é um valor, mas não uma prática mensurável. | A equipe pode confundir velocidade saudável com pular teste, evidência ou revisão. | Definir que velocidade é reduzir retrabalho por prova antecipada, não reduzir gates. |
| Documentação estratégica, código, migration e release não têm uma linguagem única de saída. | Documento pode declarar decisão sem consequência/teste; feature pode ser entregue sem fonte/owner. | Exigir cadeia `intenção → evidência → decisão → requisito → prova → observação → aprendizado`. |
| A avaliação de eficácia fica difusa. | É possível “concluir” uma atividade sem confirmar resultado e sem corrigir desvio. | Toda entrega declara resultado esperado, sinal de sucesso, sinal de falha, owner e próxima revisão. |
| A revisão humana pode ser confundida com aprovação estética. | Risco de domínio, escopo ou recuperação fica invisível apesar de revisão formal. | Revisão responde a invariante, permissionamento, erro reintroduzível, teste, sinal e compensação. |
| A mudança documental/estratégica recebe menos rigor que uma mudança técnica. | Estratégia pode acumular decisão contraditória, desatualizada ou sem fonte. | Classificar também pesquisa, guia e backlog; mudança de estratégia crítica exige fonte, conflito, owner e critério de promoção. |

## 3. Definição operacional de eficiência e eficácia

| Termo | Definição nesta estratégia | Antipadrão recusado |
| --- | --- | --- |
| Eficiência | Resolver a necessidade com menos retrabalho, menos duplicidade, menor raio de erro e artefatos reutilizáveis. | “Fazer rápido” produzindo correção, investigação ou reconciliação adicionais. |
| Eficácia | Alcançar o resultado verificável, no escopo e no risco declarados, com usuário/owner apto a explicar e operar a saída. | Declarar concluído porque a tela renderizou, um teste isolado passou ou uma página comercial fez uma promessa. |
| Qualidade proporcional | Aumentar prova, revisão e recuperação conforme dado, privilégio, dinheiro, documento, integração ou irreversibilidade crescem. | Aplicar o mesmo checklist curto a texto estático e a pagamento/produção. |
| Aprendizado | Converter desvio, dúvida ou incidente em hipótese, causa, ação, regressão e reavaliação datada. | Fechar caso com workaround, memória oral ou exclusão de evidência. |

## 4. Próximo passo

A consolidação transformará as lacunas em uma diretriz curta, bloqueante e aplicável a pesquisa, decisão, documento, UX, código, dados, integração, release e incidente. Ela reforçará — e não substituirá — os gates C0–C4 e G-1–G5 já aprovados.
