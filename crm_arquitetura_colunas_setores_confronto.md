# Confronto — colunas canônicas, contratos, estoque e financeiro

**Estado:** `vínculos_validados_para_consolidação`  
**Base:** árvore definida pelo usuário, estratégia canônica, domínio de loteadora, subledger, domínio organizacional e contrato administrativo.  
**Regra:** as colunas são jornadas e superfícies de trabalho; a autorização real continua sendo aplicada por organização, contexto, módulo, papel, alçada, vigência, MFA/step-up, RLS/RPC e auditoria.

## 1. SUPER ADM

| Elemento | Confronto validado |
| --- | --- |
| Vínculo confirmado | Super Adm administra a plataforma, as organizações contratantes, os módulos/contratos SaaS e seus próprios colaboradores. Financeiro SaaS e carteiras dos clientes são domínios separados. |
| Ambiguidade a resolver | Janela de recertificação, dupla aprovação, mascaramento em suporte JIT, break-glass e reautenticação precisam de política calibrada; não podem ficar em texto genérico. |
| Invariante | Acesso zero por padrão a dados operacionais, documentos, carteira e financeiro de tenant; MFA AAL2, menor privilégio, teto de delegação, JIT justificado e `AdminAuditEvent` append-only. |
| Owner/dependência | Plataforma, Segurança/IAM, DPO/Jurídico, infraestrutura e eventual parceiro de faturamento SaaS. |

## 2. ADM

| Elemento | Confronto validado |
| --- | --- |
| Vínculo confirmado | ADM administra somente sua organização: módulos contratados, colaboradores, alçadas, parâmetros autorizados e visão financeira conforme papel. |
| Ambiguidade a resolver | “Financeiro ADM” precisa declarar por módulo, entidade legal, carteira, competência e alçada o que a pessoa pode ver; não pode significar saldo global irrestrito. |
| Invariante | Vínculo/grant ativo e expirável; vedação de autoelevar privilégio ou remover último owner; parâmetros críticos versionados; ajuste financeiro somente por evento/caso, nunca por digitação que reescreve passado. |
| Owner/dependência | Administração da organização, RH/IAM, comercial, financeiro/contador e jurídico. |

## 3. LOTEADORA

| Elemento | Confronto validado |
| --- | --- |
| Vínculo confirmado | A coluna conecta `gleba → empreendimento → fase → quadra → lote`, estoque, tabela, proposta, reserva, venda, contrato, carteira e parceiros. O fazendeiro/proprietário da terra é parte/parceiro conforme instrumento, não uma exceção informal. |
| Ambiguidade a resolver | Status comercial manual não pode competir com elegibilidade calculada; boleto não pode ser chamado de caixa confirmado; distrato não admite percentual universal. |
| Invariante | Venda negada se registro/evidência exigida não estiver revisada ou se houver reserva, alocação a parceiro/permutante, garantia ou restrição impeditiva; Parte única tem papéis datados; Receivable e Payable são separados. |
| Owner/dependência | Jurídico/registro, comercial/estoque, financeiro/carteira, contador, urbanismo, bancos, parceiros e permutantes. |

## 4. VENDAS URBANAS

| Elemento | Confronto validado |
| --- | --- |
| Vínculo confirmado | A coluna une cliente/proponente, proprietário, imóvel urbano, construtora/empreendimento, proposta, venda, contrato e comissão. Lote, kitnet, torre e condomínio são modalidades de ativo, não cadastros sem relação. |
| Ambiguidade a resolver | Comissão parcelada exige base, gatilho, teto, documento e tratamento fiscal; CNPJ/QSA e correspondente autorizado são evidências/contexto, não autorização automática para vender. |
| Invariante | Estoque só fica comercialmente elegível com documentação/registro aplicável, tabela vigente e alçada; comissão gera direito datado, não pagamento imediato; Super Adm não acessa dossiê/carteira do tenant por padrão. |
| Owner/dependência | Captação, comercial, jurídico, financeiro, proprietário/representante, construtora, corretor associado e cartório. |

## 5. LOCAÇÃO

| Elemento | Confronto validado |
| --- | --- |
| Vínculo confirmado | A coluna une locatário, proprietário, imóvel, contrato de administração, contrato de locação, cobrança, carteira, conciliação, repasse, inadimplência, renovação e portal mínimo. |
| Ambiguidade a resolver | Administração de proprietário e locação de locatário podem ter prazos/obrigações distintos; portal precisa divulgar somente o mínimo necessário, sem dados internos ou de outros imóveis. |
| Invariante | Cobrança só nasce após contrato aplicável; confirmação de liquidação requer retorno/correlação/conciliação; eventos financeiros não são apagados; repasse exige base econômica, recebedor, liquidez e alçada. |
| Owner/dependência | Comercial, cobrança, financeiro, contador, jurídico, parceiro-piloto, banco/provedor e DPO. |

## 6. Regras transversais não negociáveis

| Regra | Aplicação nas cinco colunas |
| --- | --- |
| Parte única e papel datado | A mesma pessoa ou PJ pode ser cliente, proponente, comprador, coadquirente, proprietário, locatário, sócio, fazendeiro/parceiro, corretor ou construtora, sem duplicação e com contexto/instrumento. |
| Coluna não concede acesso | Menu, rota, badge, filtro, deep link e exportação obedecem a policy real; ocultar UI não protege endpoint ou dado. |
| Módulo contratado não é grant | Habilitar Loteadora, Vendas Urbanas ou Locação cria capacidade da organização, mas usuários ainda exigem membership/grant/alçada. |
| Financeiro por natureza | Boleto/instrução, recebível, pagável, direito, retorno, settlement, cash application, conciliação, ajuste e repasse são fatos distintos. |
| Contrato não é só PDF | Contrato possui versão, partes, objeto, condição, vigência, evidência, owner, estado e efeitos em estoque/carteira; mudança gera versão/caso. |
| Busca protegida | CPF/CNPJ, proponente principal e coadquirente são critérios de busca autorizada e auditável; não viram enumeração livre de pessoas/dados. |
| Exceção é caso | Suspensão, distrato, atraso, retorno bancário fora de ordem, conflito de estoque, suporte e ajuste abrem caso com owner, evidência e compensação. |

## 7. Próxima consolidação

O ciclo seguinte converterá os vínculos acima em: uma matriz de módulo contratado, owner e política; critérios de aceite de navegação por coluna; e alterações precisas no guia, backlog e observatório. Nenhuma rota real, portal, boleto, contrato, integração bancária, grant ou acesso administrativo será ativado nesta etapa documental.
