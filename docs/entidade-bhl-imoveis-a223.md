# Ficha de entidade — pesquisa regulatória A223

| Campo | Registro de trabalho |
|---|---|
| Nome comum informado | BHL Imóveis |
| Relação informada | Empresa do usuário e organização associada ao CRM em desenvolvimento |
| Empreendimento citado | Vista do Sol |
| Natureza de capital | Privada, conforme contexto fornecido; não verificar por fonte pública nesta etapa |
| País e moeda de trabalho | Brasil; BRL para os campos de preço-base mencionados pelo usuário |
| Setor | Atividade imobiliária e loteamento, conforme contexto fornecido |
| Exercício social | Não informado; não presumido |
| Situação cadastral, representação e regime tributário | Não informados; fora do escopo desta pesquisa de arquitetura |

## Delimitação da pesquisa

A pesquisa tratará de requisitos gerais e de controles de sistema para importar uma fonte interna de **Quadra, Lote, área e preço-base por m²**. Não será usado este arquivo como prova de regime tributário, titularidade, capacidade de representação, situação registral, obrigação fiscal específica ou autorização para registrar valores.

Até a conclusão do desenho e de uma confirmação posterior, a planilha real não será copiada, carregada, indexada ou persistida. Clientes, dados pessoais, disponibilidade, vendas, propostas, contratos, cobranças, pagamentos, repasses, notas fiscais e anexos permanecem fora do escopo da importação inicial.

Em 05 set. 2026, a inspeção técnica registrou somente que a fonte possui uma aba e uma grade de 165 linhas por 6 colunas. Nenhum cabeçalho, valor, pessoa, contato, situação comercial ou conteúdo de célula foi reproduzido neste documento. A diferença estrutural previamente conhecida permanece: a matriz autorizada contém 14 Quadras e 164 Lotes físicos, enquanto a fonte deverá passar por reconciliação estrita antes de qualquer persistência.

## Prévia técnica agregada da fonte

| Verificação | Resultado saneado | Decisão de processamento |
|---|---|---|
| Linhas não vazias | 164 | Coincide com a contagem atual de Lotes físicos; ainda exige reconciliação por par Quadra/Lote no servidor. |
| Pares únicos Quadra/Lote | 164 | Nenhuma duplicidade ou identificador físico vazio foi detectado na prévia agregada. |
| Campos importáveis reconhecidos | Quadra, Lote, área e valor-base por m² | Serão os únicos campos passíveis de mapeamento. |
| Cobertura numérica reconhecida | Uma linha sem área numérica e uma linha sem preço-base numérico | A fonte não poderá ser persistida como cobertura integral até que as exceções sejam apresentadas na prévia para decisão humana. |
| Colunas auxiliares fora do escopo | Um estado comercial e um total derivado por fórmula | Nunca serão importados, persistidos ou usados para classificar disponibilidade, venda, contrato, cobrança ou financeiro. |
| Fórmulas e links externos | Fórmulas apenas em coluna auxiliar não autorizada; nenhum link externo detectado | O parser não executará fórmulas. A coluna auxiliar será descartada antes da prévia; toda fórmula em campo permitido continua bloqueando a importação. |

Essa leitura não expôs linhas, preços, nomes ou estado comercial. Ela mostra que a importação deve operar por **lista de campos permitidos**, e não rejeitar automaticamente uma planilha só porque contém colunas auxiliares. Cabeçalhos pessoais continuam motivo de rejeição integral; cabeçalhos comerciais auxiliares podem ser exibidos como “não importados” e descartados sem leitura de seu conteúdo.

## Verificação efêmera com o parser de produção

A fonte autorizada foi processada localmente em 05 set. 2026 por exatamente o mesmo parser server-side que alimenta a prévia protegida. A execução usou uma RPC simulada, sem sessão, banco, auditoria ou persistência: o único produto foi uma contagem agregada saneada.

| Indicador | Resultado agregado | Efeito no fluxo |
|---|---:|---|
| Linhas não vazias | 164 | Coerente com a matriz autorizada de 164 Lotes físicos. |
| Linhas permitidas com Quadra, Lote, área e preço-base | 163 | A prévia pode reconciliar os 163 pares sem divergência física. |
| Pares permitidos sem reconciliação | 0 | Não foi detectada divergência entre os 163 pares completos e a matriz física. |
| Exceções de campos obrigatórios | 1 | A preparação formal permanece corretamente bloqueada até a fonte conter área e preço-base nessa linha. |
| Colunas auxiliares descartadas | 2 | O estado comercial e o total derivado não chegam à importação. |
| Fórmulas em colunas auxiliares descartadas | 164 | Não são executadas, persistidas ou usadas no CRM; fórmulas em campo permitido continuam bloqueadoras. |

Assim, a fonte está tecnicamente adequada ao novo fluxo, mas ainda não pode virar uma política preparada: a exceção única deve ser corrigida **na planilha de origem** e reenviada pela área de Política formal de preço-base. A plataforma não estimará o campo ausente nem criará um 165º Lote.
