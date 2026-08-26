# Consolidação — contratos de módulo, owners e aceite das colunas canônicas

**Estado:** `pronto_para_integração_documental`  
**Princípio:** a árvore canônica organiza o CRM em cinco colunas; a ativação de uma coluna operacional depende de contrato de módulo, e o uso por pessoa depende de grant/policy. Nenhuma das duas coisas substitui a outra.

## 1. Contrato de módulo por organização

| Módulo/coluna | Organização elegível | Habilita | Não habilita automaticamente |
| --- | --- | --- | --- |
| **SUPER ADM** | Somente a empresa operadora da plataforma. | Gestão de organizações contratantes, módulos SaaS, financeiro SaaS e equipe interna. | Acesso ao tenant, carteira, documento, saldo, cliente final ou suporte sem JIT. |
| **ADM** | Toda organização cliente ativa. | Painel administrativo, colaboradores, parâmetros permitidos e visão de módulos contratados. | Papel financeiro irrestrito, gestão de outra organização, recurso não contratado ou privilégio de plataforma. |
| **LOTEADORA** | Organização com módulo Loteadora contratado/habilitado. | Cadastro de loteamento, estoque, parceiros, vendas, contratos e recortes financeiros próprios. | Venda sem gate, regra municipal automática, repasse automático, acesso a outro empreendimento/tenant. |
| **VENDAS URBANAS** | Organização com módulo Vendas Urbanas contratado/habilitado. | Clientes, proprietários, imóveis, construtoras, vendas, contratos e comissões. | Poder de venda sem evidência, comissão como pagamento, acesso cruzado ou acesso a imóvel sem escopo. |
| **LOCAÇÃO** | Organização com módulo Locação contratado/habilitado. | Clientes, imóveis/proprietários, administração, locação, cobrança, carteira, repasse e renovação. | Portal amplo, baixa manual, liquidação presumida ou acesso a imóvel não administrado. |

## 2. Matriz de owners por setor

| Coluna | Owner de produto | Owners operacionais | Owners especialistas/dependências |
| --- | --- | --- | --- |
| SUPER ADM | Produto de Plataforma. | Operações SaaS e suporte controlado. | Segurança/IAM, DPO, jurídico, parceiro de faturamento. |
| ADM | Administração do tenant. | Gestão da organização, RH interno, gestor comercial. | Segurança/IAM, contador, jurídico e DPO conforme o comando. |
| LOTEADORA | Produto de Desenvolvimento Urbano. | Comercial de loteadora, gestor de empreendimento, carteira. | Jurídico imobiliário/registro, urbanismo/engenharia, contador, banco e parceiros/permutantes. |
| VENDAS URBANAS | Produto de Vendas Urbanas. | Captação, comercial, documentação e pós-venda. | Jurídico, proprietários/representantes, construtoras, cartórios, contador e corretores associados. |
| LOCAÇÃO | Produto de Locação. | Captação, administração, cobrança, carteira e relacionamento com proprietário. | Jurídico, contador, banco/PSP, DPO e parceiro-piloto de locação. |

## 3. Critérios de aceite por coluna

| Coluna | Permitir quando | Negar quando | Evidência/telemetria mínima |
| --- | --- | --- | --- |
| SUPER ADM | Principal de plataforma possui grant ativo, MFA/step-up exigido, escopo e justificativa compatíveis. | Sessão AAL1 para comando sensível, acesso cross-tenant, support sem JIT, tenant suspenso ou delegação acima do teto. | `AdminAuditEvent` append-only, correlação, dono, escopo, expiração e resultado permitir/negar. |
| ADM | Pessoa possui membership/grant ativo na organização e módulo habilitado; comando cabe na alçada. | Organização diferente, módulo ausente, próprio grant elevado, último owner removido ou parâmetro crítico sem revisão. | Evento administrativo, versão do parâmetro, estado do convite/grant e policy aplicada. |
| LOTEADORA | Lote elegível, partes/documentos/contrato atendidos, tabela/alçada vigentes e operação dentro do escopo. | Registro/restrição pendente, reserva incompatível, lote alocado, contrato/cálculo sem versão ou tentativa de venda duplicada. | Evidência registral, `InventoryHold`, reserva/proposta, versão de tabela/contrato e audit event. |
| VENDAS URBANAS | Imóvel/unidade, proprietário/autorização, tabela/condição e dossiê aplicável estão revisados. | Evidência insuficiente, ativo fora de escopo, alçada/tabela inválida, comissão sem base/gatilho ou acesso cross-tenant. | Evidência de ativo/parte, versão de contrato, regra de comissão, contexto/escopo e trilha crítica. |
| LOCAÇÃO | Administração/locação aplicáveis, partes/imóvel vinculados e condições/documentos necessários atendidos. | Imóvel não administrado, portal fora do escopo, cobrança sem contrato, baixa sem retorno/conciliação ou repasse sem base/liquidez. | Contratos separados, evento de cobrança, retorno, cash application, conciliação, repasse e audit event. |

## 4. Regras de busca, portal e financeiro

| Superfície | Regra consolidada |
| --- | --- |
| **Busca por CPF/CNPJ** | Só ocorre com finalidade, grant e política; resultado é limitado ao contexto permitido. Registro de busca, mascaramento e alerta de enumeração ficam no desenho de alta criticidade. |
| **Proponente principal/coadquirente** | Ambos são papéis de uma mesma entidade Parte; busca por qualquer papel deve retornar somente contratos/ativos que a identidade já pode ler. |
| **Área de cliente/proprietário** | É um portal por finalidade, mínimo e separado da coluna interna; mostra somente contratos, imóveis, ocorrências, documentos e prestação de contas autorizados. |
| **Boleto** | É instrução de cobrança ligada a contrato/parcela; só se torna impacto de caixa após retorno, correlação, cash application e conciliação. |
| **Financeiro ADM** | Projeta o subledger dos módulos da organização conforme alçada e entidade legal; não é uma planilha global editável. |
| **Financeiro Super Adm** | Registra a operação SaaS da plataforma; é completamente separado do subledger e dos boletos de qualquer organização cliente. |

## 5. Vínculos que impedem o modelo antigo de retornar

| Erro antigo a evitar | Decisão consolidada |
| --- | --- |
| Coluna financeira única para qualquer dinheiro. | Cada natureza e entidade legal possui subledger/visão própria; plataforma, organização, venda, loteadora e locação são projeções com política. |
| “Clientes” duplicados por módulo. | Parte única com papéis datados, vínculos por contrato e escopo de leitura. |
| Estoque editado como status comercial. | Disponibilidade deriva de ativo, registro, alocação, restrição, hold/reserva e contrato. |
| Boleto tratado como parcela paga. | Instrução, retorno, settlement e conciliação são estados/eventos distintos. |
| Super Adm como acesso ilimitado. | Plataforma opera com zero por padrão, JIT, MFA, escopo, vigência e auditoria. |
| Área de cliente/proprietário como espelho integral. | Portal mínimo por finalidade, com política própria de documento, conta, imóvel e evento. |

## 6. Próxima etapa executável, condicionada a aprovação

A primeira construção futura não deve ser uma sidebar completa. Ela começa pela **matriz de `ModuleEntitlement` e a árvore declarativa de navegação**, com dados sintéticos, policy de leitura, estados de módulo desligado/habilitado e testes permitir/negar. Implementar colunas reais, portais, boletos, contratos ou financeiros requer subetapas específicas aprovadas.

## Referências

[1] [Árvore canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)

[2] [Confronto de contratos, estoque e financeiro](crm_arquitetura_colunas_setores_confronto.md)

[3] [Contrato administrativo da fundação](crm_fundacao_administrativa_contrato_v0.md)

[4] [Subledger da imobiliária](crm_subledger_imobiliaria.md)
