# Inventário da coluna Loteadora — A169

**Data:** 04 de setembro de 2026  
**Escopo:** leitura de código, contratos e testes existentes. Não houve consulta de dados de negócio, criação de registros ou alteração de permissões.

## Estrutura atual

| Setor | Estado atual | Controles preservados |
|---|---|---|
| 01 · Cadastro de Loteamentos | Referência interna codificada, situação de trabalho e Quadra matriz numerada. | Não registra nome comercial, área, endereço, matrícula, coordenada, valores ou aprovação. |
| 02 · Estoque/Mapa de Lotes | Rota e serviços próprios para lote, estado interno e transições de inventário. | Mantém Quadra como matriz; não cria disponibilidade comercial, reserva ou venda. |
| 03 · Clientes Loteadora | Reutiliza Party e papel temporal; há intenção de anexo privado e cobertura opaca. | Sem identificador fiscal ou contato em tela; envio privado exige sessão, MFA recente e intenção autorizada. |
| 04 · Sócios e Parceiros | Vínculo temporal de papel interno por loteamento. | Sem participação econômica, recebível, portal, contrato ou repasse. |
| 05 · Vendas de Lotes | Rascunho interno liga lote e cliente comprador; inclui co-comprador e estado de trabalho. | Não reserva estoque, não define titularidade, preço, proposta, contrato, cobrança ou financeiro. |
| 06 · Financeiro | Visível como setor bloqueado. | Sem consulta, cálculo, boleto, cobrança, pagamento, repasse ou integração. |

## Salvaguardas técnicas observadas

Cada serviço de leitura ou comando recebe subject, organização, módulo Loteadora, finalidade e correlação. As consultas são habilitadas apenas com sessão e contexto válidos, e os controles do navegador não concedem alçada. Seleções dependentes são limpas quando a referência deixa de ser autorizada, reduzindo o risco de reutilização cruzada de identificadores.

## Lacunas para o blueprint

A base é apropriada para o primeiro ciclo de rascunhos, porém o cadastro de loteamento ainda não possui uma ficha operacional estruturada de governança, marcos de implantação, conformidades declaradas e responsáveis internos. Esses elementos devem ser modelados sem introduzir documentos sensíveis, registros públicos, contratos, medidas, valores ou decisões automáticas.

Os domínios de contrato, jurídico, obras, fornecedores, equipes, marketing, boletos, gastos, lucros, recebíveis, pagamentos e repasses seguem fora desta etapa. Qualquer evolução desses domínios dependerá de desenho específico, validação jurídica-contábil quando aplicável, revisão de privacidade e autorização material separada.
