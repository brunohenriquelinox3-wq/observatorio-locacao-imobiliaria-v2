# Registro complementar de pesquisa — adoção e operação

**Data de acesso:** `2026-08-27`  
**Escopo:** Vendas Urbanas e Locação.  
**Limite:** fontes de fornecedor e conteúdo de orientação são utilizados como sinais de produto e adoção; não provam resultado, não definem preço e não autorizam automação, comunicação ou qualquer implementação.

## Evidências externas validadas

| Fonte | Evidência observada | Implicação estratégica limitada | Limite |
| --- | --- | --- | --- |
| Pendo | Define adoção de produto como ativação/uso relevante e propõe métricas de adoção de funcionalidade, frequência e crescimento; destaca onboarding, ajuda contextual, análise de uso e feedback no produto. [1] | Adoção deve ser medida por cenários de papel concluídos com qualidade e suporte, não apenas por login ou volume de cliques. | Métricas genéricas de produto não devem ser transplantadas como KPI imobiliário sem contrato de métrica e recorte por papel. |
| Gainsight | Descreve onboarding B2B como processo estruturado, com continuidade após a venda, segmentação, demonstração de valor inicial, suporte e acompanhamento por métricas. [2] | A ativação estratégica deve definir coorte, papel, cenário essencial, responsável, ajuda, critério de saída e sinal de risco. | É orientação de fornecedor; não implica que mensagens ou campanhas automatizadas sejam autorizadas. |
| AppFolio | Apresenta plataforma integrada para operação imobiliária, dados unificados, fluxos de trabalho e capacidades de IA; também trata onboarding de proprietários como processo com programa padronizado, responsabilidades, pacote de entrada, expectativas e melhoria contínua. [3] [4] | Locação deve tratar entrada de proprietário, imóvel, contrato e portal como jornada governada com expectativa, evidência, owner e acompanhamento, não como cadastro isolado. | Referência estrangeira e conteúdo comercial; obrigações brasileiras, regras contratuais e privacidade permanecem dependentes da matriz regulatória própria. |

## Decisões de reforço

| ID | Decisão estratégica | Evidência | Regra de aplicação |
| --- | --- | --- | --- |
| `ADO-EXT-01` | O primeiro valor percebido deve ser definido por papel e jornada, com evidência de conclusão útil. | [1] [2] | Não usar login, permanência de tela ou contagem de dados como único proxy de adoção. |
| `ADO-EXT-02` | Onboarding é capacidade contínua de adoção, composta por contexto, responsabilidade, ajuda, exceção e recuperação. | [2] [4] | Ajuda contextual e lembretes futuros devem respeitar preferência, permissão, canal e aprovação aplicável. |
| `ADO-EXT-03` | Locação requer uma experiência conectada entre proprietário, ativo, contrato, carteira, solicitação e prestação de contas. | [3] [4] | Conectar a jornada não equivale a ampliar acesso: cada leitura permanece sujeita a policy, escopo e minimização. |
| `ADO-EXT-04` | Fluxos e IA só são úteis quando o usuário consegue identificar contexto, fonte, motivo, exceção e forma de corrigir. | [1] [3] | Recomendações podem orientar; ações materiais permanecem sob gate humano e trilha de auditoria. |

## Critérios de aceite futuros

1. Para cada papel de Vendas Urbanas e Locação, definir um cenário essencial, o fato inicial, a informação mínima, a exceção previsível, o resultado verificável e o caminho de suporte.
2. Calcular adoção por cenário e coorte somente com finalidade clara, retenção mínima e agregação proporcional; nunca usar telemetria para vigilância indiscriminada de colaboradores.
3. Toda experiência de onboarding, portal ou ajuda deve informar quem é responsável pelo próximo passo, o prazo aplicável e a maneira de interromper/escalar um erro.
4. Recursos de IA, automação ou comunicação devem ser inicialmente recomendativos e acompanhados por explicação, revisão humana, métrica de erro e reversão.

## Referências

[1] [Pendo — Product adoption](https://www.pendo.io/glossary/product-adoption/)

[2] [Gainsight — Customer onboarding](https://www.gainsight.com/glossary/entry/customer-onboarding/)

[3] [AppFolio — Performance Platform](https://www.appfolio.com/)

[4] [AppFolio — Setting Your Owners Up for Success Through Onboarding](https://www.appfolio.com/blog/setting-owners-up-for-success-onboarding)
