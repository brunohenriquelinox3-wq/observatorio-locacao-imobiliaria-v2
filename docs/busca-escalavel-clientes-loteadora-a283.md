# Busca escalável de Clientes Loteadora — A283

## Decisão preservada

A ficha detalhada de **Clientes Loteadora** deve atuar como uma área de busca e edição, não como uma lista linear de todos os cadastros. A pesquisa começa com dois ou mais caracteres e aceita, conforme o contexto autorizado, nome declarado, telefone, mensageria, e-mail ou referência de identificação.

O filtro é executado no servidor, no mesmo escopo de organização, finalidade, alçada e vigência. O resultado retorna somente o cartão cadastral minimizado necessário para selecionar a ficha. Valores de contato, referências documentais, identificadores técnicos, anexos e URLs não são projetados na lista de busca.

## Escala e experiência operacional

A lista da Central é limitada a páginas de 25 resultados e utiliza rolagem própria. A paginação continua disponível para crescimento, evitando que uma base extensa torne a página lenta ou visualmente interminável. A busca de ficha também pagina resultados e mantém navegação somente dentro do conjunto contextual devolvido.

O resultado selecionado abre a ficha única no mesmo fluxo, onde os dados permitidos podem ser editados e só aparecem no resumo após a confirmação do servidor. Inclusão, arquivamento e restauração permanecem ações explícitas da Central. O vínculo temporal legado foi preservado em uma divulgação avançada recolhida, para não competir com a busca principal.

## Limites obrigatórios

Esta atualização não cria venda, lote, preço, proposta, crédito, renda, score, financiamento, contrato, registro, cobrança, pagamento ou financeiro. Documentos continuam opacos e privados: não há URL, download ou visualização na busca ou nos resultados.

As proteções existentes permanecem exigidas em cada chamada: sessão válida, AAL2 vigente, identidade, organização, membership, grant, papel, escopo, finalidade, vigência, correlação, idempotência e auditoria redigida.

## Evidências de validação

Foram aplicados contrato e migração aditiva de busca protegida, testes de projeção minimizada, regressões de ficha, Central e página setorial, tipagem, build e verificação de integridade. A jornada visual confirmou busca sem resultado e seleção de resultado contextual sem alteração material.
