# Medição de bundle — A57

## Linha de base

A build de produção anterior ao carregamento sob demanda concentrou o código do cliente em um único artefato JavaScript principal de **2.638.615 bytes** e **558.312 bytes comprimidos em gzip**. A folha CSS principal mediu **380.542 bytes** e **58.598 bytes em gzip**.

| Artefato | Tamanho original | Tamanho gzip | Interpretação |
|---|---:|---:|---|
| JavaScript inicial | 2.638.615 B | 558.312 B | Acima do patamar apropriado para uma primeira carga de painel administrativo. |
| CSS inicial | 380.542 B | 58.598 B | Ligeiramente acima da meta de referência; não será modificado neste corte para isolar a causa do ganho. |

## Hipótese e limite

O ganho proposto é dividir por rota as superfícies internas de administração, cadastro, ativos, Loteadora, Vendas Urbanas e Locação. A página pública permanece carregada diretamente. Não serão cacheadas permissões, contextos ou leituras de domínio, pois sua desatualização poderia comprometer isolamento de organização.

O corte será preservado somente se a medição posterior reduzir materialmente o JavaScript de entrada e se a bateria de rotas, autenticação e contexto continuar aprovada.

## Medição posterior

Após dividir as rotas internas por carregamento sob demanda, o JavaScript inicial mediu **1.338.212 bytes** e **372.547 bytes em gzip**. O CSS inicial mediu **231.419 bytes** e **35.555 bytes em gzip**. As rotas carregadas sob demanda passaram a ser emitidas como artefatos independentes, preservando o acesso sob demanda a cada superfície protegida.

| Artefato | Linha de base gzip | Após o corte gzip | Variação | Decisão |
|---|---:|---:|---:|---|
| JavaScript inicial | 558.312 B | 372.547 B | -185.765 B (-33,3%) | Manter: redução material na primeira carga. |
| CSS inicial | 58.598 B | 35.555 B | -23.043 B (-39,3%) | Manter: estilos de páginas internas foram separados por rota. |

O arquivo mais pesado da superfície especializada passou a ser carregado somente ao abrir a estratégia de CRM. Não houve cache de contexto ou permissão, alteração de policy, atenuação de MFA, nem remoção de testes. A verificação posterior de rotas e a bateria completa continuam obrigatórias antes do checkpoint.

## Verificação de rota

A central ADM foi aberta a partir de uma carga de rota nova e concluiu o carregamento normalmente depois do fallback transitório. A navegação lateral, a projeção minimizada de perfil e os três módulos contextualizados permaneceram visíveis. Não foram criados registros de negócio durante a verificação.
