# Comparação do benchmark: propostas para Vendas Urbanas e Locação

**Status:** `proposta_para_auditoria_do_usuário`  
**Escopo:** utiliza somente o benchmark autorizado do CRM de referência e os cadernos atuais de Vendas Urbanas/Locação. Não altera Loteadora, nem cria rota, dados, contrato, cobrança, integração, portal, migration ou automação.  
**Método:** `evidência observada → limite da evidência → oportunidade de produto → requisito proposto → prova futura`.

> O benchmark mostrou boas referências de organização visual: centrais de leads, imóveis, clientes, negócios, serviços, agenda, formulários, financeiro e permissões. A estratégia do projeto deve absorver apenas a **cobertura útil**, preservando evidência, versão, escopo, menor privilégio, separação financeira e estados explícitos. [1] [2] [3]

## 1. Confronto de Vendas Urbanas

| Evidência de referência | Lacuna/risco se copiada literalmente | Atualização proposta | Prioridade | Prova futura |
| --- | --- | --- | --- | --- |
| Visitantes, leads, termômetro, pipeline, propensão e origem. | Score, origem ou mudança de etapa podem virar decisão opaca; visitante pode ter dados de finalidade limitada. | Criar uma jornada declarativa `Visitante → Lead → Oportunidade → Visita → Proposta → Contrato/Pós-venda`, com consentimento/finalidade, evento de origem, owner, próximo passo e transições permitidas. | Alta | Testes de transição, reentrada, duplicidade, escopo e explicação de score/recomendação. |
| Clientes e proprietários em listas separadas. | Cadastro raso ou duplicado não representa coadquirente, procurador, representante PJ e autoridade de venda. | Reforçar `Parte` única e papéis datados; criar dossiê de proprietário/representação e de comprador/grupo comprador reutilizável por proposta, com snapshots no contrato. | Alta | Busca controlada, deduplicação assistida, documento versionado e acesso por finalidade. |
| Imóveis anunciados, mapa, tipologia, portal/mídia e referência de chaves. | Anúncio/publicação pode ser confundido com autorização, disponibilidade jurídica ou posse de chave; dado de endereço/chave pode vazar. | Separar `Ativo urbano`, `Oferta/Anúncio`, `Autorização de venda`, `Disponibilidade comercial`, `Mídia/portal` e `Gestão de chaves`, cada qual com estado, vigência e acesso mínimo. | Alta | Permitir publicação apenas com autorização vigente; negar divulgação de chave/endereço sensível fora do escopo. |
| Condomínios/empreendimentos e unidades. | Empreendimento vira campo do imóvel sem construtora, torre, unidade, correspondente ou estoque próprios. | Formalizar `Construtora → Empreendimento → Torre/Bloco → Unidade`, com vínculo de correspondente autorizado e oferta/estoque por unidade. | Alta | Linhagem da unidade e bloqueio de proposta sobre unidade sem autorização/disponibilidade. |
| Visitas, agenda e pipeline comercial. | Calendário pode alterar estágio por clique e pipeline pode misturar etapas, coortes e métricas. | Manter `Atividade` e `Visita` como objetos próprios; estágio comercial muda apenas por transição declarada, motivo, owner e evidência, enquanto métricas de funil usam coorte/denominador/versionamento. | Alta | Testes permitir/negar de mudança de estado e métricas com `as_of`, reentrada e motivo de perda. |
| Financiamento com simulação/operação/estado. | Simulação pode ser confundida com crédito aprovado, proposta vinculante ou dinheiro desembolsado. | Tratar financiamento como caso separado: intenção, simulação, documentos, proposta externa, condição, status de contraparte, desembolso em análise/conciliado e vínculo opcional à venda. | Alta | Não permitir contrato/recebimento/comissão automático por criar simulação. |
| Formulários de autorização, visita e proposta. | Download de modelo não prova preenchimento, assinatura, validade ou uso contratual. | Tornar formulários/checklists evidências versionadas por finalidade, com template, campos, assinatura/aceite quando aplicável, acesso privado e snapshot por proposta/contrato. | Média | Documento reutilizado sem duplicar binário; versão futura não muda histórico. |
| Financeiro por categorias e permissões gerais. | Comissão, boleto, caixa e desembolso podem ser tratados como mesmo fato; RBAC sem escopo é insuficiente. | Aplicar subledger: comissão/direito, instrução, retorno, settlement, cash application e conciliação distintos; papel precisa de organização, equipe, ativo/negócio, vigência e alçada. | Alta | Comando negado fora do escopo; evento financeiro reproduzível até origem/regra. |

## 2. Confronto de Locação

| Evidência de referência | Lacuna/risco se copiada literalmente | Atualização proposta | Prioridade | Prova futura |
| --- | --- | --- | --- |
| Imóveis ofertados para aluguel em mesma listagem comercial. | Oferta de aluguel pode ser confundida com imóvel administrado, locável ou ocupado; anúncio não explica contrato vigente. | Separar `Imóvel locável`, `Oferta de locação`, `Contrato de administração`, `Disponibilidade/ocupação`, `Contrato de locação` e `Carteira`, ligados por vigência e evidência. | Alta | Imóvel sem administração/autorização não aparece como administrado nem permite cobrança/repasse. |
| Negócios de aluguel com ativo, aprovado, análise, vencido, rescisão e encerrado. | Estados resumidos não distinguem análise cadastral, garantia, assinatura, ocupação, cobrança, renovação, aviso, vistoria e distrato. | Criar jornada de locação em camadas: captação/administração → oferta → interessado/análise → proposta/garantia → contrato → entrada/vistoria → ativo/carteira → renovação/aviso → rescisão/saída/vistoria final → encerramento. | Alta | Cada transição tem critérios, owner, evidência, efeito explícito e não libera imóvel/repasse automaticamente. |
| Lançamentos, cobranças de contrato e repasse ao proprietário. | Boleto/comprovante/lançamento podem ser tomados como dinheiro conciliado, e repasse pode ocorrer sem base/deduções. | Reforçar `Receivable`, cobrança, retorno, aplicação de caixa, deduções/taxas, `Payable/entitlement`, instrução, settlement e conciliação por contrato/período. | Alta | Comprovante não baixa; repasse bloqueia sem liquidez/base/alçada; prestação de contas reproduzível. |
| Serviços, prestadores e workflow de orçamento/execução. | Status de serviço pode gerar despesa, responsabilidade ou reembolso sem autorização; prestador pode acessar dados demais. | Criar `Caso de manutenção` com escopo de imóvel/contrato, solicitante, autorização, orçamento, prestador, SLA, evidência, ordem, custo previsto/real e efeitos financeiros separados. | Alta | Prestador vê apenas ordem autorizada; aprovar serviço não cria pagamento/repasse. |
| Sinistros vinculados a negócio/ocupação. | Sinistro sem categoria/evidência/seguro/owner vira lista operacional sem resolução. | Tratar sinistro como caso especializado: fato, ocupação, contrato, cobertura declarada, evidência, comunicação, responsável, decisão e efeito financeiro/contratual separado. | Média | Encerrar caso sem apagar evidência nem alterar contrato/carteira sem ação explícita. |
| Formulários de autorização, ficha e relação de documentos. | Modelo baixável não compõe dossiê, portal ou estado de revisão. | Implementar dossiê de locação por parte, imóvel, administração e contrato, com checklist de garantia, vistoria, autorização, documentos e ocorrências por finalidade. | Alta | Área do cliente/proprietário recebe somente evidências liberadas e contextuais. |
| Área do cliente/proprietário referenciada pela estratégia. | Uma área externa pode espelhar informações internas sensíveis. | Manter Portal de Cliente e Portal do Proprietário separados, com Grant próprio, contexto de contrato/imóvel, vigência, leitura mínima, `as_of`, arquivos privados e negação por objeto. | Alta | Alterar URL/filtro/ID não revela outro imóvel, contrato, conta ou documento. |

## 3. Decisões de setor que o benchmark sugere submeter à auditoria

| ID | Coluna | Decisão a validar com o usuário | Recomendação inicial |
| --- | --- | --- | --- |
| VU-B01 | Vendas Urbanas | `Central de Leads e Oportunidades` deve ser setor próprio antes de Clientes? | **Sim**; recebe visitante/lead, qualifica, atribui, agenda e só então vincula/atualiza a Parte conforme policy. |
| VU-B02 | Vendas Urbanas | `Visitas e Atividades` deve ser setor próprio ou etapa dentro de Leads/Oportunidades? | **Etapa integrada** à jornada, mas com objeto/agenda/resultado próprios e filtros contextuais. |
| VU-B03 | Vendas Urbanas | `Financiamento` deve ser caso dentro de Vendas e Contratos ou setor separado? | **Caso dentro de Vendas e Contratos** no início; só separar se piloto comprovar volume, integrações e owners próprios. |
| VU-B04 | Vendas Urbanas | `Autorizações, chaves e publicação` deve integrar Imóveis e Proprietários? | **Sim**, como dossiê/estado de oferta dentro de Imóveis e Proprietários, sem criar menu isolado. |
| LC-B01 | Locação | `Manutenção e Prestadores` deve ser setor próprio? | **Sim**, pois tem caso, orçamento, autorização, prestador, SLA e efeitos financeiros próprios. |
| LC-B02 | Locação | `Vistoria` deve ser etapa de Locação e Contratos ou setor separado? | **Etapa própria dentro de Locação e Contratos**, com entrada/saída e evidência; evitar menu separado inicialmente. |
| LC-B03 | Locação | `Sinistros e Garantias` deve aparecer no primeiro lançamento? | **Faseável**: manter caso e estado mínimo; aprofundar quando operação/seguradora/garantidora e volume justificarem. |
| LC-B04 | Locação | Painel interno de Locação deve ser primeira tela da coluna? | **Sim**, usando o padrão aprovado da Loteadora: tela interna de prioridades após a seleção global, sem substituir os setores fonte. |

## 4. Guardrails que continuam não negociáveis

| Tema | Regra preservada |
| --- | --- |
| **Identidade e acesso** | Papel visual não é autorização: todo acesso depende de organização, módulo, grant, escopo, vigência, finalidade e policy no servidor/banco. |
| **Dossiês** | Documento/foto/modelo anexado não é aprovado; arquivo privado, versão, finalidade, revisão e snapshot são obrigatórios. |
| **Financeiro** | Boleto, comprovante, retorno, aplicação de caixa, conciliação, direito, instrução, settlement e repasse são eventos distintos. |
| **Automação/IA** | Propensão, importação, extração de contrato e roleta devem informar origem/limite, permitir revisão e nunca decidir crédito, contrato, pagamento ou elegibilidade por conta própria. |
| **Métricas** | Funil, conversão, receita, carteira e saúde declaram definição, fontes, filtros, coorte, estados, owner, `as_of`, frescor e limitação. |

As propostas acima deixam o CRM mais apto a **explorar os dados de forma mais intuitiva**, **entender melhor as tendências** e **salvar ou compartilhar facilmente**, sem abrir mão da segurança, rastreabilidade e separação entre Vendas Urbanas e Locação.

## Referências

[1] [Benchmark autenticado do CRM de referência](benchmark_hincrivel_vendas_locacao.md)

[2] [Estratégia de Vendas Urbanas](estrategia_vendas_urbanas.md)

[3] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)
