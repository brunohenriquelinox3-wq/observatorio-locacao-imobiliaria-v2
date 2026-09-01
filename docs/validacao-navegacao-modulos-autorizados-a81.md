# Validação A81 — Navegação por módulos autorizados

## Regra aplicada

A sidebar e a paleta de navegação passam a ocultar visualmente os módulos operacionais que não tenham ao menos um contexto autorizado retornado pelo servidor. As rotas de Plataforma, ADM e Fundações permanecem disponíveis; a visibilidade nunca é usada como autorização.

## Falha segura

Enquanto as três leituras contextuais não terminarem com sucesso, a navegação original é mantida. Assim, uma resposta pendente ou com erro não remove atalhos de forma indevida. Depois de todas as leituras concluídas, somente os caminhos associados a módulos sem contexto autorizado são filtrados.

## Evidências

| Verificação | Resultado |
| --- | --- |
| Contexto atual autorizado | Os três módulos contratados permanecem visíveis na sidebar. |
| Regra pura | Testes cobrem carregamento pendente e ocultação seletiva de módulos sem autorização. |
| Autorização | Nenhuma rota, guarda ou policy foi alterada; cada operação segue verificada pelo servidor. |
| Bateria técnica | Testes, tipagem, build de produção e integridade de diff aprovados. |
