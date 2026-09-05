# Exportação controlada e importação de clientes — A192

> **Natureza do marco:** implementação e validação sem importação de dados reais. Nenhum cliente, organização, acesso, escopo, contrato, proposta, cobrança, pagamento, repasse ou integração externa foi criado ou alterado durante este trabalho.

## Objetivo

O marco A192 disponibiliza exportação local de relatórios **em PDF e CSV** e uma jornada de importação de clientes por CSV. A entrega foi desenhada para que os usuários possam **explorar os dados de forma mais intuitiva**, **entender melhor as tendências** e **salvar ou compartilhar facilmente**, preservando a segregação entre SUPER ADM, ADM e operação.

As exportações são produzidas no próprio navegador a partir de um resumo já redigido do painel autorizado. A geração de PDF usa uma biblioteca compatível com ambientes modernos de navegador, e a leitura do CSV usa parser local com cabeçalho e validação estrutural [1] [2]. Nenhum conteúdo é encaminhado a serviço externo para criar o arquivo.

## Superfícies entregues

| Superfície | Recurso | Conteúdo permitido | Bloqueio aplicado |
|---|---|---|---|
| Central SUPER ADM | PDF e CSV | Estado da fundação e métricas agregadas de governança | Disponível somente para SUPER ADM em estado administrativo carregado. |
| Painel ADM | PDF e CSV | Situação redigida dos módulos devolvidos à sessão | Exige identidade conectada e ao menos um módulo autorizado. |
| Clientes Loteadora | PDF e CSV | Prontidão agregada de cadastro e anexos privados | Exige contexto Loteadora autorizado. |
| Vendas Urbanas | PDF e CSV | Setor, contexto e contagens agregadas de rascunhos autorizados | Exige sessão e contexto Vendas Urbanas autorizado. |
| Locação | PDF e CSV | Setor, contexto e contagens agregadas de rascunhos autorizados | Exige sessão e contexto Locação autorizado. |
| Importar clientes | CSV de modelo, prévia local e relatório redigido | Situação da prévia, sem nomes ou conteúdo do arquivo | Exige identidade e contexto; a gravação exige controles adicionais. |

Os relatórios não incluem nomes, e-mails, telefones, documentos, identificadores técnicos, endereços, anexos, ativos detalhados, contratos, propostas ou dados financeiros. O PDF é criado com texto saneado; o CSV recebe delimitador definido, codificação UTF-8 com BOM e colunas exclusivamente de resumo autorizado.

## Fluxo de importação

O novo caminho **Importar clientes** lista apenas contextos de organização e módulo já devolvidos pela policy. O arquivo é lido localmente, sem upload e sem persistência na fase de prévia. O modelo obrigatório aceita somente as colunas **Nome**, **Tipo** e **Perfil**.

| Etapa | Controle | Resultado |
|---|---|---|
| 1. Contexto | Organização, módulo e finalidade devem provir da consulta autorizada. | Um seletor não cria, infere ou amplia escopo. |
| 2. Arquivo local | Aceita CSV de até 512 KB e 200 linhas. | Nenhum arquivo é armazenado na prévia. |
| 3. Estrutura | Rejeita coluna inesperada, coluna obrigatória ausente, tipo/perfil inválido, nome fora do limite e repetição interna. | O operador recebe uma prévia com linha e motivo de revisão. |
| 4. Confirmação | A pessoa marca explicitamente que revisou e está autorizada a cadastrar. | Sem confirmação não há comando de gravação. |
| 5. Servidor | Requer subject ativo, MFA TOTP recente, organização ativa, papel `organization_admin` ou `area_admin`, grant vigente, módulo e finalidade. | A interface não é autoridade. |
| 6. Banco | RPC com `SECURITY DEFINER` e `search_path` vazio aplica deduplicação e grava somente rascunhos permitidos. | Não há acesso direto do navegador. |

Nesta primeira entrega, CPF/CNPJ, telefone, e-mail, endereço, documentos, anexos, dados de contrato, valores e informações financeiras são explicitamente recusados. Esses campos demandam modelo de dados próprio, finalidade definida, retenção, controles de acesso, trilha de auditoria e validação jurídica/contábil antes de qualquer importação real.

## Persistência e segurança

Quando a confirmação chega ao servidor, a operação cria apenas Party e papel temporal em **rascunho**. No módulo Loteadora, o vínculo de cliente comprador é formado somente pela estrutura interna já existente. O lote da importação armazena metadados mínimos: contexto, contagens, fingerprint do arquivo, correlação e ator. O conteúdo do CSV não é armazenado no lote de auditoria.

| Proteção | Evidência verificada | Situação |
|---|---|---|
| RLS e acesso direto | A tabela de lotes de importação possui RLS habilitada e leitura direta negada a papéis anônimo e autenticado. | Aprovado. |
| Funções | A RPC pública e o helper privado usam `SECURITY DEFINER` com `search_path` vazio. | Aprovado. |
| EXECUTE | Papéis anônimo e autenticado não executam as funções; a RPC pública é exclusiva da camada de servidor e o helper permanece privado. | Aprovado. |
| Alçada | A validação exige organização ativa, membership administrativa, grant ativo, finalidade e módulo no escopo. | Aprovado. |
| MFA | O roteador exige atestação AAL2 por TOTP antes de chamar o serviço. | Aprovado. |
| Idempotência e duplicidade | A correlação é única por ator; a mesma pessoa, tipo, papel, módulo e finalidade não são recriados no mesmo contexto. | Aprovado. |
| Auditoria | O evento registra somente contagens e contexto redigido. | Aprovado. |

O verificador de segurança listou uma informação de RLS sem policy permissiva para a nova tabela. Esse resultado é esperado no desenho **fail-closed**, pois o acesso direto está revogado e não há policy permissiva; a operação usa exclusivamente a RPC controlada. O verificador também manteve um aviso preexistente referente à proteção do provedor contra senhas vazadas. Essa configuração global não foi alterada neste marco; a documentação oficial de avaliação está disponível em [3].

## Validação executada

| Verificação | Resultado |
|---|---|
| Testes dirigidos de contrato, serviço, roteador, migração, prévia, exportação e guardas operacionais | Aprovados. |
| Suíte integral | **191 arquivos e 451 testes aprovados**. |
| Verificação TypeScript | Aprovada. |
| Build compatível com Netlify | Aprovado; houve somente aviso de tamanho de chunk, sem erro de compilação. |
| Integridade de diff | Aprovada. |
| Capturas de tela | Revisadas em desktop e móvel para Central SUPER ADM, Painel ADM, Clientes Loteadora, Importar clientes, Vendas Urbanas e Locação. Os botões permaneceram visíveis, legíveis e bloqueados sem contexto. |
| Catálogo Supabase | Revisado apenas em modo estrutural, sem leitura de registros de clientes ou organizações. |

## Limites e próximo uso autorizado

O fluxo está pronto para receber uma planilha mínima em CSV por um administrador de organização ou área que já possua contextos autorizados e MFA TOTP recente. A pessoa deverá selecionar o contexto, baixar e preencher o modelo, analisar a prévia e confirmar pessoalmente a importação. O primeiro uso real deve ocorrer com um lote pequeno e autorizado pelo responsável pelos dados, mantendo a planilha original fora do sistema até que a política de retenção seja formalizada.

Nenhuma funcionalidade financeira, contratual, de cobrança, pagamento, repasse, proposta material ou integração externa foi habilitada. A expansão do arquivo para documentos, contatos ou dados fiscais continua fora deste marco e não deve ser feita sem autorização expressa e validação jurídica aplicável.

## Referências

[1]: https://github.com/Hopding/pdf-lib "pdf-lib — Create and modify PDF documents in JavaScript"
[2]: https://github.com/mholt/PapaParse "Papa Parse — CSV parser for browser and Node.js"
[3]: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection "Supabase — Password strength and leaked-password protection"
