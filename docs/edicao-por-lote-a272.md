# Edição por Lote: atributos físicos e referência interna — A272

## Objetivo

Corrigir a experiência de edição por Lote para que cada informação apresentada no cartão tenha um caminho de edição compreensível, preservando a separação entre atributos físicos, referência interna de preço e efeitos comerciais.

## Evidência visual inicial

As duas primeiras faixas da captura enviada confirmam que a ficha denominada **Edição física por Lote** permite escolher Quadra e Lote e revisar área física, divisas, profundidade auxiliar, tipologia, posição, finalidade física e observação interna. O próprio fluxo declara que revisa somente dados físicos. A referência interna por m² e o total referencial exibidos no cartão não aparecem como campos dessa ficha, de modo que a separação de domínio é tecnicamente coerente, porém pouco explícita para o operador.

Nenhum conteúdo privado, valor individual, Lote identificável, dado de sessão ou operação material foi registrado nesta evidência.

## Decisão de experiência

O cartão passa a declarar dois destinos distintos e complementares: **Editar** permanece dedicado à ficha física; **Editar preço** leva diretamente ao campo de novo valor por m² no formulário governado de condições. Ao chegar ao formulário, um resumo do Lote selecionado esclarece que o total é derivado da área física confirmada e, por isso, não é digitado de forma independente. A ficha física selecionada também recebe um atalho contextual para o mesmo ajuste interno, evitando que o operador precise descobrir uma seção distante.

Essa mudança não altera contratos, política, valor, área ou estado comercial. O ato de preparar qualquer ajuste continua sujeito a contexto, MFA recente, alçada, vigência, motivo, evidência, correlação, idempotência e aprovação segregada; nenhuma preparação será testada com dado real sem autorização material explícita.

## Inspeção autenticada após a implementação

A jornada foi recarregada em sessão autenticada e a matriz física, os cartões, a ficha por Lote, o perfil interno, a ficha por Quadra, a política e os módulos posteriores permaneceram acessíveis. No instante da inspeção, a leitura de referência interna estava corretamente bloqueada por ausência de MFA recente; por isso, o cartão exibiu o estado de proteção e não ofereceu ajuste de preço até a revalidação. Isso confirma que a nova rota não contorna a proteção e que a validação visual do CTA de preço exige nova confirmação de MFA pelo usuário.

Após a revalidação direta do usuário na tela de Segurança e MFA, a sessão reforçada foi reconhecida e a leitura protegida retornou. Os cartões voltaram a apresentar referências internas e totais derivados, agora com o CTA **Editar preço** visível em cada referência autorizada. Nenhum valor individual, perfil, condição, correção ou comando material foi alterado nesta confirmação.

O formulário de condições, quando acessado sem partir de um cartão, continua deliberadamente genérico: não seleciona Lote, não pré-preenche valor e não permite inferir alvo de ajuste. A próxima validação funcional parte exclusivamente do CTA do cartão e deve confirmar que ele seleciona o Lote, desloca a visualização até esse formulário e foca o campo de valor por m², sem inserir conteúdo ou preparar condição.

Após MFA recente, a validação autenticada confirmou o percurso completo do CTA de referência interna: o cartão seleciona somente sua Quadra e seu Lote no formulário governado, preserva a política-base preparada, define o escopo individual e o tipo de ajuste por valor/m², mantém o novo valor vazio e desloca o foco para esse campo. Nenhum valor foi digitado, nenhuma condição foi preparada e nenhuma política, Lote, preço, disponibilidade, venda, contrato ou dado financeiro foi alterado.

Também foi confirmado que o cartão mantém dois acessos distintos e coerentes: **Editar** para ficha física e **Editar preço** para referência interna governada. A ficha física abrange a área, as quatro divisas, profundidade auxiliar, tipologia, posição, finalidade física e observação interna; a referência por m² tem formulário próprio, pois o total é derivado da área física e não pode ser digitado de forma independente. A matriz recebeu uma âncora de navegação para permitir localizar o conjunto de cartões com foco visível por teclado, sem alterar a fonte física ou criar uma segunda identidade de Lote.
