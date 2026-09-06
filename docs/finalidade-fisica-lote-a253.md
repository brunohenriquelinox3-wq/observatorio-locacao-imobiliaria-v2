# Finalidade física reservada por Lote — A253

## Objetivo

A finalidade física reservada classifica uma unidade da matriz do loteamento para **uso patrimonial** ou **infraestrutura técnica**, sem transformá-la em disponibilidade, venda, proposta, contrato, cobrança, pagamento ou financeiro.

| Finalidade permitida | Uso operacional | Efeito comercial |
|---|---|---|
| Reserva de proprietários da área de origem | Identificar reserva patrimonial interna | Nenhum |
| Infraestrutura — poço artesiano | Planejar componente técnico físico | Nenhum |
| Infraestrutura — caixa d’água | Planejar componente técnico físico | Nenhum |
| Outra infraestrutura técnica | Registrar finalidade física a detalhar posteriormente | Nenhum |

## Controles

O servidor resolve a combinação de empreendimento, Quadra e Lote, exige alçada ativa, MFA recente, organização, contexto, finalidade autorizada e correlação idempotente. A auditoria armazena somente a finalidade padronizada e o resultado redigido; não registra preço, documento, disponibilidade, cliente, contrato ou dados financeiros.

> Nenhuma finalidade foi atribuída automaticamente. A classificação exige a escolha explícita de uma Quadra, de um Lote e de uma finalidade pelo usuário autorizado.

## Validação

A validação integral A253 aprovou **219 arquivos de teste** e **582 testes**, além de tipagem, build Netlify e integridade de diff. O build preservou apenas o aviso não bloqueante de chunks grandes. A revisão protegida não concluiu após reinício da prévia; como não há atribuição automática nem comando disparado, não houve alteração material em Lotes, preços ou reservas.

## Selo e filtro local A254

Quando uma finalidade for registrada por fluxo protegido, o cartão do Lote exibirá um selo de reserva patrimonial ou infraestrutura técnica. A matriz também oferece filtro exclusivamente local para reservar a leitura a Lotes com ou sem finalidade física. A validação integral A254 manteve **219 arquivos de teste** e **582 testes** aprovados, sem classificar qualquer Lote real.
