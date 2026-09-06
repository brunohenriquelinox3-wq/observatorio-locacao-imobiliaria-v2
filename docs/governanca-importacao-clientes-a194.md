# Governança de Importação de Clientes — A194

## Finalidade e limite

A importação permanece limitada a uma **prévia local de CSV** e, quando autorizada, à criação de cadastros em rascunho. Ela não processa arquivo real durante a prévia e não recebe documentos, dados de contato, endereço, contratos, valores ou informações financeiras.

| Campo permitido | Classe | Finalidade | Retenção declarada |
|---|---|---|---|
| Nome | Identificação mínima | Criar rascunho de parte | Até revisão humana do rascunho |
| Tipo | Classificação cadastral | Diferenciar pessoa física ou jurídica | Até revisão humana do rascunho |
| Perfil | Classificação operacional | Definir Cliente ou Comprador | Até revisão humana do rascunho |

> A confirmação da interface não concede acesso. A gravação continua sujeita a MFA TOTP recente, identidade ativa, organização, papel administrativo, grant, escopo, deduplicação, correlação e revalidação server-side.

## Controles A194

O navegador classifica cabeçalhos localmente e rejeita qualquer coluna fora da matriz. Antes de encaminhar o comando, a interface exige dois reconhecimentos distintos: a matriz de privacidade **IMPORTACAO_MINIMA_V1** e a finalidade **CADASTRO_RASCUNHO_COM_REVISAO_HUMANA**. A função protegida também exige exatamente esses dois valores antes de delegar a persistência já governada.

Não há expurgo automático. Qualquer descarte ou retenção posterior depende de revisão humana e não é acionado pela prévia, pelo modelo CSV ou pela confirmação. A auditoria registra apenas a versão da matriz e a finalidade de retenção, sem conteúdo de arquivo ou dados pessoais.

| Verificação A194 | Resultado |
|---|---|
| Contrato e serviço | A confirmação exige versão de privacidade e finalidade de retenção controladas antes da RPC de gravação. |
| Interface | A matriz mínima, os campos proibidos e os dois reconhecimentos aparecem antes da confirmação. |
| Revisão autenticada | A interface foi revisada sem selecionar arquivo, sem enviar prévia e sem importar registro. |
| Validação integral | 219 arquivos de teste e 577 testes aprovados; tipagem, build Netlify e integridade de diff aprovados. |
| Exceção de build | Apenas o aviso não bloqueante de chunks grandes permaneceu. |
