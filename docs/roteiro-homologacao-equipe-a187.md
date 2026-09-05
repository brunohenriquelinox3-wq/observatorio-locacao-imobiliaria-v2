# Roteiro de homologação humana — governança de equipe A187

**Objetivo:** verificar, somente em leitura, os painéis de colaboradores e corretores em SUPER ADM, ADM e a jornada própria de acesso.  
**Modo:** não preencher, não selecionar, não enviar e não aceitar qualquer ação.

> O roteiro não autoriza criação de solicitação, preparo de delegação, aceite, ativação de membership, grant, convite, senha, e-mail, comunicação externa ou alteração de alçada.

## Preparação

Mantenha a sessão como está e não altere a organização selecionada. Não clique em “solicitar”, “preparar”, “aceitar”, “ativar”, “suspender”, “revogar” ou equivalentes. Caso um seletor esteja aberto, feche-o sem modificar a escolha.

| Superfície | Como acessar | Verificação de leitura |
|---|---|---|
| SUPER ADM | Use o item **Central de plataforma** da barra lateral. | O painel identifica a governança da plataforma e mantém a hierarquia SUPER ADM → ADM. As solicitações não exibem nome, e-mail, UUID ou documento. |
| ADM | Use o item **Painel ADM** da barra lateral. | A gestão de equipe é limitada à organização atual e informa que ADM não eleva alçada; sem subject Supabase, os controles de preparo ficam visualmente bloqueados. |
| Acesso próprio | Abra a rota `/acesso-equipe`. | A solicitação e o aceite ficam bloqueados quando a identidade Supabase ou MFA exigido não está confirmado; a tela não mostra credencial, link sensível ou identidade de terceiros. |

## Critérios de aceite

O teste é aprovado se SUPER ADM e ADM estiverem visivelmente separados; se ADM não enxergar opções de papel administrativo elevado; se solicitações forem apresentadas por ordem e estado redigido; se nenhuma identidade pessoal, dado de RH, contrato, comissão ou dado financeiro aparecer; e se controles que exigem subject Supabase ou MFA estiverem inequivocamente indisponíveis quando esses requisitos faltarem.

## Parada imediata

Interrompa e informe somente a rota e a mensagem genérica se houver nome, e-mail, telefone, identificador técnico, documento, senha, URL sensível, lista de identidades, organização externa, botão ativo sem subject Supabase, possibilidade de ADM escolher papel acima de operador, ou erro de autorização não esperado. Não envie capturas contendo dados pessoais, documentos, valores ou mensagens de erro completas.

## Continuidade

Após o aceite visual, qualquer teste de solicitação ou delegação exige confirmação explícita por operação e uma identidade já ativa que pertença ao próprio testador. O preparo não autoriza aceite em nome de terceiro; o aceite não dispensa MFA; e a ativação nunca poderá ser considerada automática.
