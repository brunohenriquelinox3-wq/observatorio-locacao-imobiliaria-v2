# Linha de base pós-governança de equipe — A189

**Data:** 05 de setembro de 2026  
**Escopo:** medição local do build de produção e leitura agregada dos logs recentes, sem mutação, ampliação de permissão ou exposição de conteúdo de logs.

| Métrica | Medição atual | Linha de base A168 | Variação |
|---|---:|---:|---:|
| JavaScript inicial | 1.020.717 bytes | 1.020.102 bytes | +615 bytes |
| JavaScript inicial compactado | 282.246 bytes | 282.103 bytes | +143 bytes |
| CSS inicial | 146.898 bytes | 146.229 bytes | +669 bytes |
| CSS inicial compactado | 25.065 bytes | 24.999 bytes | +66 bytes |
| Erros recentes de console | 0 linhas | — | sem anomalia observada |
| Respostas 4xx/5xx recentes | 0 linhas | — | sem anomalia observada |
| Erros recentes do servidor | 0 linhas | — | sem anomalia observada |

## Interpretação

A medição distingue os arquivos referenciados diretamente por `index.html` do total de artefatos lazy. A gestão de equipe foi mantida em rotas e estilos carregados sob demanda; a diferença na carga inicial é pequena e, por si só, não justifica alteração de arquitetura, movimentação de CSS ou mudança de código. A ausência de erros recentes é um indicador local de estabilidade, não uma prova de experiência real em produção.

## Decisão

Não será aplicada otimização especulativa. Uma intervenção de desempenho somente será considerada se houver atribuição reproduzível de gargalo por medição de navegador ou telemetria aprovada, preservando a autorização server-side e a separação entre sessão da plataforma e contexto Supabase.
