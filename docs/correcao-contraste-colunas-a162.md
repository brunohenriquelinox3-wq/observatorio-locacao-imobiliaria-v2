# Correção de contraste dos controles de coluna — A162

**Data:** 04 de setembro de 2026  
**Escopo:** tela inicial operacional do CRM, sem contexto organizacional, dados ou comandos.

## Defeito comprovado e causa

Uma captura ampliada da tela inicial mostrou que o rótulo **“Abrir coluna”** era visualmente pouco legível. O seletor global `footer` de `index.css`, preservado para páginas estratégicas legadas, aplicava fundo escuro e espaçamento amplo a cada elemento `footer`, inclusive aos controles compactos presentes nos cartões operacionais.

## Correção mínima

Foi criado o ajuste carregado somente pela rota da entrada operacional. Ele redefine `display`, `padding` e `background` de `.crm-entry__column footer`, sem modificar a navegação, os links, a autorização, a seleção de contexto, as rotas ou os estados bloqueados.

| Verificação | Resultado |
|---|---|
| Teste dirigido da entrada operacional | Aprovado: 3 testes. |
| Suíte completa, tipagem e build Netlify local | Aprovados. |
| Integridade de diff | Aprovada. |
| Revisão visual em desktop e móvel | O rótulo voltou a ter contraste visível, com o empilhamento preservado. |
| ZIP e HTML de entrega | Gerados e saneados, sem arquivos de ambiente, logs, segredos ou referências externas de build. |

## Limites preservados

O controle continua uma navegação visual; ele não concede acesso. Nenhum dado, contexto, organização, membership, grant, escopo, MFA, contrato, proposta material, valor, cálculo, cobrança, pagamento, repasse, integração externa ou publicação foi criado ou alterado.
