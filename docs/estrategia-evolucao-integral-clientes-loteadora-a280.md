# Estratégia preservativa — Central de Clientes Loteadora (A280)

> **Decisão de escopo.** A280 evolui a organização, a encontrabilidade e a continuidade do cadastro de Clientes Loteadora. O marco não cria ou altera venda, reserva, oportunidade, preferência de lote, preço, crédito, score, financiamento, proposta, contrato, assinatura, registro, cobrança, pagamento, repasse, integração de mensageria ou exportação individual de dados pessoais.

## 1. Objetivo

O setor deve permitir que uma equipe autorizada localize um cadastro dentro do seu contexto, abra uma ficha organizada e compreenda o que já está cadastrado ou ainda precisa de revisão. A experiência não deve se tornar uma tabela de todos os domínios da empresa nem um novo funil de venda. Seu papel é organizar dados cadastrais mínimos, contatos declarados, preferências de contato, requisitos condicionais, intenção privada de anexo e uma visão redigida de eventos.

A pesquisa comparativa de CRMs consolidados aponta uma convergência útil: lista contextual, ficha única, resumo de propriedades, histórico cronológico e associações organizadas reduzem alternância de telas. Ao mesmo tempo, as mesmas referências misturam negócios, campanhas, pagamentos, automações, documentos e previsões. A280 adota somente o padrão de **organização da ficha**, não seus módulos comerciais ou financeiros.

## 2. O que já existe e será preservado

| Elemento existente | Regra de preservação em A280 |
|---|---|
| `Party` canônica | Continua sendo a única identidade resumida e reutilizável; não será duplicada. |
| Cliente comprador contextual | Continua vinculado ao papel temporal já autorizado; o servidor resolve sua pertença à organização e ao contexto. |
| Perfil cadastral A279 | Permanece em sua tabela privada, com tipo de pessoa, estado cadastral, identificação-base opcional, contatos, estado civil e representação. |
| Pendências condicionais A279 | Continuam por código fechado e estado de revisão; não viram prova de aprovação jurídica ou registral. |
| Preferências de contato A279 | Continuam granulares por finalidade e canal, revogáveis e auditadas; não há aceite genérico. |
| Intenção e envio opaco de anexo | Permanecem como estão. A280 não abre arquivo, URL, chave, nome, prévia ou download. |
| Prontidão e relatórios redigidos | Permanecem agregados e sem conteúdo pessoal; A280 só poderá acrescentar métricas igualmente agregadas e autorizadas. |
| Sessão e autoridade A276 | Toda leitura e comando continuam dependentes de sessão válida, organização, contexto, membership, grant, papel, escopo, finalidade, correlação, idempotência e auditoria. |

## 3. Matriz de decisão sobre as novas especificações

| Tema proposto | Decisão A280 | Motivo e limite |
|---|---|---|
| Lista de Clientes Loteadora | **Entra** | Lista contextual de clientes compradores retornados pelo servidor, com estado cadastral, cobertura de pendências e contato mascarado somente quando a política de leitura o permitir. |
| Busca imediata | **Entra com limite** | Busca server-side, contextual e minimizada. Não pesquisa nem retorna contrato, lote, preço, corretor, dados financeiros ou conteúdo documental. |
| Ficha em página única | **Entra** | Um painel de leitura rápida e uma ficha contínua por blocos, sem desmontar Cadastro-base, Anexo privado, Perfil A279 ou Prontidão. |
| Dados de contato | **Preserva e organiza** | Usa exclusivamente os campos minimizados já aprovados. Não ativa WhatsApp, e-mail, SMS, campanhas ou sincronizações. |
| Estado de cadastro | **Entra** | Usa somente estados cadastrais fechados. Não usa “em contrato”, “em registro”, “pago”, “finalizado” ou qualquer fase de negócio. |
| Checklist | **Preserva e torna localizável** | Mostra requisitos condicionais de A279 em blocos claros. Não infere validade, exige documento de modo automático ou libera etapa comercial. |
| Histórico | **Entra com redação** | Linha do tempo de categorias de evento, ator autorizado e momento. Não exibe valores antigos/novos, identificadores, notas ou conteúdo de documento. |
| Anotações livres | **Posterga** | Texto livre aumenta risco de dados excessivos e sensíveis. Só poderá entrar em marco separado com taxonomia, retenção, controles e avaliação específica. |
| Central de documentos por categoria | **Posterga** | Exige matriz de categorias, finalidade, retenção, acesso, versões, verificação de conteúdo e ciclo de substituição. O envio opaco atual permanece disponível e inalterado. |
| Foto, miniatura ou visualização de arquivo | **Fora de A280** | Não é necessária para cadastro-base e aumentaria a exposição de dados/documentos. |
| Financeiro, parcelas, saldo e pagamentos | **Fora de A280** | Domínio financeiro bloqueado e independente. |
| Empreendimento, Quadra, Lote e condições | **Fora de A280** | São dados de oportunidade/venda e não integram a identidade cadastral. |
| Contrato, assinatura, escritura e registro | **Fora de A280** | São domínios jurídicos e registrais com marcos próprios. |
| Importação da planilha | **Posterga e não substitui cadastro manual** | A lista é insumo privado. Primeiro haverá validação de tela e prévia local controlada; qualquer gravação permanece material e exige confirmação específica. |

## 4. Experiência proposta

### 4.1 Lista contextual

A entrada **Clientes Loteadora** ganhará uma faixa inicial de operação com busca, filtros cadastrais e indicadores agregados. A lista será retornada exclusivamente pelo servidor para o contexto autorizado, sem carregar cadastros de outras organizações. Cada linha apresentará o nome declarado, a natureza da pessoa, o estado cadastral e um resumo de prontidão; campos de contato podem ser parcialmente mascarados conforme a política de leitura. Não haverá colunas de lote, contrato, valor, responsável comercial ou situação financeira.

A busca será iniciada somente após intenção inequívoca — por exemplo, termo com tamanho mínimo ou identificador-base completo — e terá limites de resultado, ordenação estável e resposta redigida em caso de ausência de acesso. A busca não existirá como uma consulta global indiscriminada e não poderá ser usada para revelar dados de documento ou relacionamento comercial.

### 4.2 Ficha de cliente contínua

Ao selecionar uma linha, o operador abre um painel de leitura rápida, preservando a lista e o contexto. Um atalho explícito conduz à ficha completa no mesmo setor. A ficha organiza, em sequência, **Visão geral**, **Perfil cadastral**, **Contato e preferências**, **Pendências condicionais**, **Anexos privados existentes** e **Linha do tempo redigida**. A ordem mantém o que já existe e acrescenta organização, sem alterar a fonte de verdade de nenhum bloco.

No desktop, a visão rápida poderá usar uma coluna auxiliar fixa para checklist e contexto. Em celular, ela deverá se transformar em bloco de topo ou painel recolhível, sem sumir com informações ou depender de hover. Os botões terão alvos táteis adequados, rótulos curtos, foco visível e estados claros de carregamento, vazio, bloqueio e falha.

### 4.3 Histórico redigido

A linha do tempo exibirá somente fatos operacionais mínimos: categoria de evento, momento, ator interno autorizado e estado resultante quando não revelar conteúdo pessoal. Exemplos de categorias são “perfil cadastral iniciado”, “preferência de contato atualizada” e “pendência marcada para revisão”. Valores de identificação, contatos, conteúdo de nota, arquivo, metadados de documento e versões de campos não devem ser exibidos na linha do tempo nem copiados para auditoria.

O histórico de A280 não substitui a auditoria de segurança. Ele é uma projeção de leitura limitada e contextual, alimentada por eventos já autorizados, com bloqueio de acesso idêntico ou mais restritivo que o dado relacionado.

## 5. Arquitetura aditiva proposta

| Camada | Responsabilidade | Regras obrigatórias |
|---|---|---|
| Consulta de lista | Retornar somente clientes compradores do contexto e resumos minimizados. | Filtro por organização/contexto no servidor, paginação, busca normalizada, limite de resultados, resposta sem IDs expostos. |
| Consulta de ficha | Reunir perfil A279, estados de pendência, preferências e resumo opaco de anexos. | O `buyerClient` é resolvido no servidor; nenhum vínculo de venda ou documento é seguido. |
| Linha do tempo redigida | Projetar eventos permitidos para leitura humana. | Eventos fechados, sem valores de campo, sem PII em payload, sem conteúdo de arquivo ou nota. |
| Interface de lista e ficha | Organizar e dar acesso a leituras existentes e novos resumos. | Nenhuma leitura dispara criação, edição, upload, arquivamento, restauração, importação ou exportação. |
| Edição cadastral | Continua nos comandos protegidos A279. | Cada comando segue sessão válida, alçada, contexto, finalidade, correlação, idempotência e auditoria redigida. |

O desenho continuará com contratos Zod fechados, funções privadas de banco e camada server-side. Os dados pessoais jamais serão concatenados em relatórios, registros de erro ou payloads de auditoria. Logs técnicos registrarão apenas categorias de evento, resultado, contexto de autorização e correlação interna.

## 6. Documento e anexo: decisão para frente futura

O estudo técnico aponta que uma futura matriz documental precisa validar categoria, extensão permitida, tipo declarado, assinatura de conteúdo quando aplicável, tamanho, usuário autorizado, finalidade e armazenamento privado. Ela também deve usar identificador interno gerado pela aplicação, acesso por menor privilégio e versão lógica em lugar de exclusão imediata. Esses princípios orientam a próxima frente, mas não alteram o seletor, limites ou ciclo do anexo opaco A279.

Uma categoria documental só poderá ser habilitada depois que tiver finalidade definida, condições de aplicabilidade, retenção, visualização, reversão lógica, estado de revisão e regra de compartilhamento explicitamente aprovados. “Recebido” e “aprovado” não serão tratados como sinônimos, e nenhum estado de documento se converterá automaticamente em fase de contrato ou registro.

## 7. Plano de testes e validação

| Área | Verificações obrigatórias |
|---|---|
| Segurança | Contexto ausente, organização divergente, papel insuficiente, finalidade indevida e sessão inválida devem falhar antes de retornar lista, ficha ou histórico. |
| Minimização | Contratos rejeitam campos de crédito, renda, lote, preço, contrato, pagamento e anexos. A projeção de histórico não devolve conteúdo pessoal. |
| Busca | Consulta aplica mínimo de caracteres, paginação, teto de retorno e escopo server-side; termos fora do domínio cadastral não produzem ampliação de dados. |
| Preservação | Cadastro-base, intenção e envio opaco de anexo, perfil A279, prontidão e relatório redigido permanecem renderizados e acessíveis. |
| Interface | Lista, painel, ficha, busca, vazio, bloqueio, erro e rolagem são revisados em 1920, 1280, 768 e 375 pixels. |
| Não mutação | Todas as revisões visuais e de navegação ocorrem sem criar, editar, enviar, arquivar, restaurar, importar ou exportar dados. |
| Preparo de migração | Qualquer leitura da planilha permanece privada; campos em branco devem continuar vazios e a existência de uma coluna não obriga sua coleta. |

## 8. Condição para cadastro manual posterior

O cadastro registro por registro só será analisado após a central e seus testes serem concluídos, a pessoa responsável revisar uma prévia privada de estrutura, e a operação receber autorização material específica para aquele contexto. Antes de cada gravação, o CRM deverá confirmar sessão válida, identidade, organização, contexto, alçada, finalidade, correlação, idempotência e auditoria. A planilha não será copiada para o banco, anexada ao CRM nem incluída em pacote de entrega.

Os campos em branco da fonte deverão permanecer em branco, sem inferência, padronização automática, cálculo ou cópia entre cadastros. Uma linha com inconsistência ou potencial duplicidade deverá parar para revisão humana, sem sobrescrever cadastro preexistente.

## 9. Registro de fontes e decisão

Foram analisadas, em registro privado fora do repositório, referências públicas de Salesforce, HubSpot, Pipedrive, Microsoft, OWASP, Agência Nacional de Proteção de Dados e NIST, além de duas demonstrações públicas de CRM imobiliário. As fontes são insumo de produto e segurança, não aconselhamento jurídico nem modelo a copiar. O registro privado conserva URLs e observações de pesquisa; este documento versionado mantém apenas decisões saneadas, sem dados pessoais, identificadores, conteúdo de planilha ou links externos.
