# Medição de bundle inicial — A77

## Linha de base

| Indicador | Resultado medido |
|---|---:|
| JavaScript inicial `index` (gzip) | 373,51 kB |
| CSS inicial `index` (gzip) | 35,68 kB |
| Bundle lazy de estratégia CRM (gzip) | 78,45 kB |

## Diagnóstico verificável

A página pública de entrada importa a biblioteca de gráficos e seus componentes de forma estática, embora a leitura de mercado apareça após a abertura principal da página. A intervenção proposta é isolar **somente** essa seção em carregamento sob demanda. Nenhuma consulta, indicador, dado, rota, autenticação ou policy será removido.

## Critério de decisão

O corte será mantido apenas se o JavaScript inicial em gzip diminuir de modo objetivo e se a bateria de testes, a tipagem, o build e a visualização da página pública continuarem aprovados. Caso não exista redução mensurável, a alteração será revertida.

## Resultado pós-otimização

| Indicador | Antes | Depois | Variação |
|---|---:|---:|---:|
| JavaScript inicial `index` (gzip) | 373,51 kB | 255,95 kB | **−31,47%** |
| Chunk gráfico sob demanda (gzip) | — | 112,29 kB | Carregado fora do bundle inicial |

A redução supera a variação esperada entre builds para esse artefato e mantém a página pública íntegra: a abertura, o conteúdo editorial, a seleção de cidade e os três gráficos seguem renderizados. A alteração é mantida porque desloca a biblioteca de gráficos para um chunk separado sem remover funcionalidade.
