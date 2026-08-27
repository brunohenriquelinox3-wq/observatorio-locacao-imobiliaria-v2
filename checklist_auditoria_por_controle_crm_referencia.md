# Checklist obrigatório de auditoria por controle — CRM de referência

**Status:** `protocolo_v2_em_execução`  
**Regra de aceite:** uma página só é considerada coberta quando **todos os controles acessíveis** foram registrados individualmente. Abrir a rota, visualizar a tabela ou capturar uma imagem não encerra nenhum item.

> Se um controle puder criar, alterar, excluir, comunicar, publicar, cobrar, pagar, importar, exportar ou integrar, a auditoria abre no máximo a tela/modal de preparação e cancela antes da confirmação. O controle é classificado como **bloqueado por segurança**, não como “testado”.

## 1. Ficha de evidência por controle

| Campo obrigatório | Registro mínimo |
| --- | --- |
| Identificador | Domínio, rota, superfície, controle e sequência — exemplo `VU-15.03`. |
| Tipo | Aba, estado, botão, filtro, menu, modal, campo, ação em lote, atalho, linha, painel, erro ou vazio. |
| Estado inicial | URL, contexto, papel visível, dados de teste/ausência de dado e condições antes do clique. |
| Ação | Clique, abertura, seleção, busca, digitação sintética, cancelamento ou navegação realizada. |
| Resultado observável | Tela, modal, lista, campos, validação, mensagem, mudança de estado ou ausência de resposta. |
| Efeito externo | `Nenhum`, `bloqueado antes da confirmação`, `sintético persistido`, `inconclusivo` ou `não demonstrável`. |
| Evidência | Data/hora, URL, captura/HTML quando disponível e arquivo de registro. |
| Limite | O que a observação não prova — policy de servidor, RLS, integração, auditoria, cálculo, conciliação ou comportamento em outro papel. |

## 2. Sequência obrigatória em cada tela

| Ordem | Controle a abrir | Regra de conclusão |
| --- | --- | --- |
| **A. Cabeçalho** | Breadcrumb, título, contadores, atalhos, ajuda, notificação e ações globais visíveis. | Registrar o destino de cada atalho seguro e bloquear o que exige efeito externo. |
| **B. Estados** | Cada aba, tab, chip, status e categoria exibida. | Clicar todos individualmente, registrar lista/vazio/erro e retornar ao estado inicial. |
| **C. Filtros** | Cada seletor, campo de busca, intervalo, ordenação, exibição e reset. | Abrir todas as opções; aplicar somente filtro sem mutação; registrar resultado e limpeza. |
| **D. Listagem** | Colunas, paginação, ordenação, estado vazio, skeleton, erro, ações por linha e ações em massa. | Registrar exposição, mascaramento, comportamento de navegação e limites de permissão. |
| **E. Criação/importação** | Cada botão que abre formulário, wizard, planilha, IA, template ou ação em massa. | Abrir interface; inspecionar todos os passos/campos; cancelar antes de upload/envio/salvamento se houver risco. |
| **F. Ficha/detalhe** | Todas as abas, cards, seções recolhíveis, menus de três pontos, tabs de histórico, documentos e relacionamento. | Percorrer sequencialmente cada aba; nunca assumir que o detalhe da primeira aba representa a ficha inteira. |
| **G. Formulário** | Cada campo, máscara, ajuda, obrigatório, dependência, validação, erro, autopreenchimento e estado desabilitado. | Testar vazio/sintético apenas quando seguro; registrar validação local e não inferir validação de servidor. |
| **H. Ações críticas** | Salvar, excluir, publicar, enviar, notificar, importar, exportar, cobrar, pagar, repassar, gerar documento, IA, permissões. | Abrir confirmação/preview quando possível; cancelar; descrever dados exigidos, confirmação, reversibilidade e controles ausentes. |

## 3. Matriz de risco e modo de teste

| Classe | Exemplos | Pode clicar? | Pode confirmar? | Classificação esperada |
| --- | --- | --- | --- | --- |
| `R0 — leitura` | Abas, cards, filtros, ordenação, paginação, detalhes de teste, estados vazios. | Sim. | Não aplicável. | `D` demonstrado. |
| `R1 — rascunho local` | Abrir modal, wizard, seletor, formulário vazio, validação local. | Sim. | Somente cancelar/fechar. | `D` ou `B`. |
| `R2 — persistência sintética` | Criar ou editar rascunho marcado, quando o fluxo não possui comunicação, publicação, cobrança ou integração. | Sim. | Somente com marcador sintético, unicidade e plano de limpeza. | `T` ou `B`. |
| `R3 — efeito externo` | E-mail, WhatsApp, convite, publicação, portal, boleto, cobrança, pagamento, repasse, consulta bancária, upload, IA que processa documento. | Até o modal/preview. | Não. | `B` bloqueado por segurança. |
| `R4 — privilégio/destrutivo` | Permissões, usuários, configuração, exclusão, importação, integração, automação de massa. | Apenas leitura/preview. | Somente se a ação recair inequivocamente sobre teste sintético e houver confirmação específica do usuário. | `B`, `N` ou `T` com prova de limpeza. |

## 4. Checklist adicional para itens mostrados na imagem de Negócios

| Controle | Evidência exigida na nova auditoria |
| --- | --- |
| Estados `Ativo`, `Aprovado`, `Em Análise`, `Vencido`, `Rescisão`, `Encerrado` | Abrir cada estado, registrar colunas, contagem/estado vazio, filtro preservado, ação disponível e retorno ao estado inicial. |
| `Ordem` | Abrir menu, listar todas as opções, aplicar uma opção segura, registrar alteração e reset. |
| `Exibir` | Abrir menu, identificar controles de visibilidade/densidade/coluna e registrar se persiste. |
| `Filtrar` | Abrir modal/painel, listar cada campo/opção, aplicar filtro não destrutivo, registrar resultado e limpar. |
| `Importar planilha` | Abrir modal/preview, registrar formato, campos, validações, mapeamento, duplicidade, confirmação e rollback sem anexar arquivo. |
| `Importar contrato (IA)` | Abrir interface, registrar dados exigidos, política de upload, preview, destino, revisão humana, confirmação e cancelamento sem anexar documento. |
| Ações por linha | Com dados sintéticos apenas, abrir menu e registrar todas as ações sem confirmar efeito material. Se não houver linha sintética, classificar como não demonstrável. |

## 5. Critérios de término de uma frente

Uma frente só avança quando a matriz tiver uma linha por controle descoberto e não restarem linhas “pendente”. Os itens `B`, `I` e `N` permanecem aceitáveis somente se trouxerem motivo, risco, tentativa realizada e próxima evidência necessária. Nenhuma recomendação de produto será extraída de um controle apenas “presumido”.

## Referências internas

[1] [Reinício integral da auditoria](reinicio_auditoria_crm_referencia.md)

[2] [Matriz da segunda varredura](matriz_cobertura_segunda_varredura_hincrivel.md)
