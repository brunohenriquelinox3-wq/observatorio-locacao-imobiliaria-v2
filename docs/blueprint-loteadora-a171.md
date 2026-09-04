# Blueprint setorial de Loteadora — A171

**Data:** 04 de setembro de 2026  
**Finalidade:** orientar a primeira atualização setorial com base no inventário técnico, pesquisa pública e limites de autorização do CRM. Este documento é de produto e arquitetura; não substitui parecer jurídico, contábil, registral ou de engenharia.

## Princípio de desenho

A Loteadora deve operar como uma cadeia de evidências internas, e não como um formulário único que mistura cadastro, estoque, vendas, contratos, cobrança e financeiro. A Lei nº 6.766/1979 diferencia a aprovação, o registro e a execução de obras ou cronograma no ciclo de loteamento; portanto, o CRM deve refletir etapas, responsáveis e evidências de forma separada, sem declarar automaticamente regularidade ou concluir exigências legais. [1]

As referências de mercado convergem em inventário visual, controle de disponibilidade, governança comercial, histórico e experiência de corretores, mas também concentram reservas, contratos, pagamentos e integrações. [2] [6] [8] A diferenciação deste CRM será preservar essa profundidade operacional com **segregação de domínios, alçadas verificadas pelo servidor, privacidade por finalidade e transições auditáveis**, em vez de antecipar automações materiais sem condições de segurança.

| Diretriz | Regra de produto |
|---|---|
| SUPER ADM → ADM → Loteadora | A hierarquia organiza governança e contexto. Nenhuma tela concede alçada. |
| Setores independentes | Cadastro de loteamento, estoque, clientes, parceiros e vendas não compartilham comando material. |
| Quadra como matriz | Quadra N organiza seus lotes; lote, mapa e estado de inventário permanecem em setor próprio. |
| Party antes de perfil | Cliente, sócio, parceiro, corretor, fornecedor, colaborador e responsável técnico partem de Party e papel temporal, evitando cópia de cadastro. |
| Dados mínimos por finalidade | A ficha de loteamento trabalha com códigos e estados internos; dados pessoais e anexos privados exigem finalidade, acesso e trilha. [5] |
| Human-in-the-loop | O sistema prepara, organiza e evidencia. Ele não decide aprovação, contrato, cobrança, renegociação, inadimplência, pagamento ou repasse. [4] |

## Arquitetura da coluna Loteadora

| Setor | Responsabilidade imediata | Evolução segura | Fora da primeira atualização |
|---|---|---|---|
| 01 · Cadastro de Loteamentos | Referência interna, fase de trabalho e Quadra matriz. | Ficha de preparação operacional, marcos codificados e responsáveis internos vinculados. | Nome comercial, localização detalhada, registros públicos, documentos sensíveis, áreas, custos ou aprovação automática. |
| 02 · Estoque/Mapa de Lotes | Lote, Quadra, estado interno e transições auditáveis. | Visualização de matriz e consistência de nomenclatura **Quadra N → Lote N**. | Disponibilidade comercial, reserva, preço, mapa de terceiros ou integração geográfica. |
| 03 · Clientes Loteadora | Party, papel comprador, intenção de anexo e cobertura opaca. | Ficha mínima por finalidade e continuidade documental privada quando autorizada. | CPF/CNPJ em interface ampla, consulta externa, análise de crédito, contrato ou boleto. |
| 04 · Sócios e Parceiros | Papel temporal ligado ao loteamento. | Relações internas, responsáveis por frente e visibilidade mínima por escopo. | Percentuais, valores, recebíveis, portal econômico, repasse ou painel financeiro. |
| 05 · Vendas de Lotes | Rascunho de vínculo entre lote e cliente; co-comprador e estado de trabalho. | Checklist de preparação não comercial e alerta interno de consistência. | Reserva, proposta, preço, contrato, assinatura, comissão, cobrança ou pagamento. |
| 06 · Financeiro | Estado bloqueado e visível. | Nenhuma evolução nesta etapa. | Boleto, parcelas, recebíveis, gastos, lucros, pagamentos, estorno, repasse e integração bancária. |

### Frentes transversais futuras

Os papéis citados pelo negócio — jurídico, obras, marketing, fornecedores, trabalhadores, vendedores e corretores — são importantes, mas não devem virar uma lista única de permissões ou um setor que atravessa todos os domínios. Eles serão modelados, quando autorizados, como **papel temporal, escopo mínimo e responsabilidade declarada por loteamento**, mantendo cada ação no setor correto. A gestão de implantação poderá usar marcos, preparação e responsáveis internos; medições, contratações, custos e pagamentos serão tratados somente em módulo material próprio. [7]

## Primeira atualização setorial: ficha de preparação operacional

A primeira entrega aprofundará o **Setor 01 · Cadastro de Loteamentos** sem transformar o cadastro em contrato ou financeiro. Para cada loteamento em rascunho, a ficha permitirá registrar um único perfil de preparação por contexto, com valores enumerados e significado operacional limitado.

| Campo proposto | Valores controlados | Objetivo | Limite explícito |
|---|---|---|---|
| Situação de planejamento | referência, estudo interno, preparação de projeto, revisão interna | Organizar a maturidade interna sem texto livre. | Não representa viabilidade, aprovação ou registro. |
| Preparação municipal | não iniciada, organização interna, evidência para revisão | Indicar preparação de trabalho. | Não declara protocolo, aprovação ou exigência municipal cumprida. |
| Preparação registral | não iniciada, organização interna, evidência para revisão | Separar esta frente da etapa municipal. | Não armazena matrícula, certidão, título ou contrato padrão. |
| Preparação de implantação | não iniciada, planejamento interno, revisão necessária | Tornar obras uma frente visível sem misturá-la ao inventário. | Não registra obra, medição, cronograma contratual, custo ou fornecedor. |
| Responsável interno | Papel temporal já autorizado no contexto. | Atribuir accountability interna, sem duplicar Party. | Não cria login, portal, novo escopo ou delegação. |

Essa estrutura dialoga com a necessidade pública de separar aprovação, registro e evidências de implantação. [1] Ela também reduz o risco de “CRM de planilha” ao organizar o próximo trabalho humano em vez de apenas guardar uma etiqueta de loteamento. A relação com responsável será sempre uma declaração interna, sujeita a contexto, vigência e policy no servidor.

## Regras de segurança e privacidade

O cadastro seguirá o princípio de que informações de pessoas, empresas e documentos somente podem ser tratadas pela finalidade e base adequada; mesmo dados públicos não podem ser reutilizados sem finalidade, boa-fé e interesse compatível. [5] Por isso, a atualização não incluirá captura de documentos, CPF/CNPJ, contatos, perfil comportamental, geolocalização precisa ou importação de listas.

| Risco | Controle obrigatório |
|---|---|
| Confusão entre preparação e conformidade legal | Mensagens explícitas de que estados são internos e não atestam aprovação, registro ou regularidade. |
| Vínculo fora da organização | RPC valida subject, organização, módulo, finalidade, vigência e papel elegível em cada comando. |
| Escalonamento pela interface | A seleção de contexto permanece auxiliar; o servidor mantém a decisão. |
| Duplicação de cadastro | Responsáveis usam Party/papel temporal já existente, sem cópia de dados pessoais. |
| Mistura com estoque ou vendas | Perfil de loteamento não contém lote, preço, reserva, proposta, contrato ou financeiro. |
| Regressão não detectada | Cobertura de schema, serviço, tRPC, UI, fail-closed, autorização e responsividade antes do checkpoint. |

## Critérios de aceite da primeira atualização

O marco somente será preservado se a migração, as políticas, as RPCs, o procedimento tRPC e a interface estiverem coerentes; se a consulta permanecer desabilitada sem sessão ou contexto; se um responsável não autorizado for rejeitado; se não houver dados novos em carregamento; e se a tela continuar legível em desktop e móvel. Testes completos, tipagem, build local compatível com Netlify, integridade de diff, revisão visual e saneamento de ZIP/HTML continuarão obrigatórios.

> A prioridade é deixar o Setor 01 suficientemente estruturado para orientar **Cadastro de Loteamentos → Estoque/Mapa de Lotes → Clientes → Sócios e Parceiros → Vendas de Lotes**, sem permitir que a cadeia avance artificialmente para contratos ou financeiro.

## Referências

[1]: [Presidência da República — Lei nº 6.766/1979](https://www.planalto.gov.br/ccivil_03/leis/l6766compilado.htm)

[2]: [Jetimob — CRM para Loteadora](https://www.jetimob.com/crm-loteadora)

[3]: [Jornada do Loteamento — O que é de fato um empreendimento de alto padrão?](https://www.youtube.com/watch?v=QscV13CYn8w)

[4]: [Jornada do Loteamento — O valor estratégico da gestão de recebíveis](https://www.youtube.com/watch?v=WELnXgEPSec)

[5]: [Presidência da República — Lei nº 13.709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

[6]: [CV CRM — CV para Loteadora](https://cvcrm.com.br/cv-para-loteadora/)

[7]: [CTE — Loteadoras](https://cte.com.br/segmentos/loteadoras/)

[8]: [Facilita — Loteadoras](https://appfacilita.com/loteadoras/)

[9]: [Lote Mobile — Sistema para Loteamento](https://www.lotemobile.com.br/)
