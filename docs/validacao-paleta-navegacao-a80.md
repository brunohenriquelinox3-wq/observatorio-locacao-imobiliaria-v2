# Validação A80 — Paleta de navegação por teclado

## Escopo validado

A paleta compartilhada foi adicionada somente como atalho de navegação. Ela deriva seus grupos e itens da mesma coleção já renderizada na sidebar, portanto não descobre rotas, organizações, módulos ou permissões adicionais.

## Evidências

| Verificação | Resultado |
| --- | --- |
| Atalho `Control+K` | Abre a paleta e posiciona o foco na busca. |
| Itens disponíveis | Mostra apenas Central de plataforma, Painel ADM, Loteadora, Vendas Urbanas e Locação da navegação corrente. |
| Seleção de rota | Navega à área escolhida e o diálogo é fechado ao concluir o carregamento. |
| Acessibilidade | Campo com `role="combobox"`, resultados com `role="listbox"`/`role="option"` e título/descrição de diálogo em português. |
| Bateria técnica | Testes, tipagem, build de produção e integridade de diff aprovados. |

## Limites preservados

A paleta não cria dados, não seleciona organização, não concede alçada, não contorna guardas e não altera políticas. A autorização continua sendo confirmada pela rota e pelo servidor a cada operação.
