# Clientes Loteadora: ficha completa e dossiê documental reutilizável

**Status:** `decisão_aprovada_para_estratégia`  
**Nome do setor:** **Clientes Loteadora**  
**Decisão do usuário:** o cadastro de cliente/comprador deve ser completo, possuir ficha individual e permitir anexar documentos e fotos tanto no cadastro quanto na venda de lote. Ao selecionar a pessoa ou empresa pela identificação protegida — CPF/CNPJ — durante a venda, o sistema deve recuperar os dados e documentos já vinculados, sem redigitação, sem cópia silenciosa e sem confundir anexo com aprovação.

> **Princípio:** a ficha é única para a pessoa/empresa; cada venda usa um **snapshot contratual verificável** do que estava disponível, vigente e revisado naquele momento.

## 1. Estrutura do cadastro de Clientes Loteadora

| Bloco da ficha | Conteúdo | Regra de qualidade e privacidade |
| --- | --- | --- |
| **Identidade da parte** | Pessoa física ou jurídica, nome/razão social, nome social/fantasia quando aplicável, CPF/CNPJ protegido, data de nascimento/constituição quando necessária, estado de cadastro e fonte. | CPF/CNPJ serve para localizar com policy, deduplicação assistida e pesquisa autorizada; não é exibido integralmente nem concede acesso por existir. |
| **Contato e endereço** | E-mail, telefone, endereço, canal preferido, contato alternativo e endereço de correspondência quando aplicável. | Campos têm origem, confirmação, finalidade, atualização e acesso mínimos. |
| **Papéis e relações** | Proponente principal, comprador, coadquirente, representante, procurador, responsável financeiro, empresa compradora, cônjuge/participante quando aplicável e grupo comprador. | Papel é datado e contextual; uma pessoa não se torna automaticamente compradora de todas as vendas. |
| **Interesse e qualificação comercial** | Empreendimento/lote de interesse, faixa declarada, entrada/parcela declaradas, canal, corretor, origem, preferências e próxima ação. | Informação comercial não substitui análise de crédito, validação jurídica ou aprovação contratual. |
| **Representação e assinatura** | Representante, procuração, validade, poderes declarados, assinante, evidência e revisão responsável. | Contato comercial não é considerado assinante/poder de compra sem instrumento/revisão apropriada. |
| **Dossiê documental e fotográfico** | Documento de identidade, CPF/CNPJ, comprovante, certidões/documentos societários, procuração, comprovantes, documentos financeiros quando justificáveis, foto ou imagem documental e anexos próprios da operação. | Cada arquivo tem finalidade, classificação, acesso, origem, estado, validade, versão, hash/referência e owner; anexo não é aprovação. |
| **Vendas e contratos** | Propostas, reservas, contratos, parcelas, aditivos, cessões, distratos, situação da carteira e documentos vinculados. | A ficha mostra relações; não permite que um contrato substitua os dados/fatos de outro. |
| **Linha do tempo e auditoria** | Cadastro, alteração, documento recebido/revisado, uso em venda, expiração, recusa, solicitação e decisão. | Histórico é datado, com ator e correlação; não sobrescreve versões anteriores. |

## 2. Dossiê documental: uma fonte, usos controlados

| Objeto | O que representa | Uso na ficha | Uso na venda de lote |
| --- | --- | --- | --- |
| **Evidência de cliente** | Metadado da evidência ligada à pessoa/empresa: tipo, finalidade, emissor, validade, classificação, estado, referência de arquivo e revisão. | Lista organizada por categorias, pendências, validade e histórico. | Pode ser associada à venda quando satisfaz a checklist e a finalidade exigidas. |
| **Arquivo privado** | Binário de documento, foto ou comprovante em armazenamento privado. | Acesso temporário e auditado conforme permissão. | É referenciado, não duplicado; uma cópia/snapshot contratual é registrada somente quando o contrato precisar provar a versão usada. |
| **Checklist de venda** | Requisitos documentais da proposta/reserva/contrato conforme pessoa, empresa, representação, política e condição comercial. | Indica o que já existe, o que está expirado ou necessita revisão. | Calcula cobertura da venda com base nos documentos elegíveis e nos requisitos específicos daquela negociação. |
| **Snapshot de dossiê da venda** | Referências às versões de evidência utilizadas/avaliadas em uma proposta ou contrato específico. | Aparece na linha do tempo do cliente. | Preserva a prova da venda sem transformar alterações futuras na ficha em alteração retroativa do contrato. |

> O mesmo arquivo não deve ser anexado repetidamente em cada venda. A venda aponta para a evidência canônica e registra o snapshot de referência. Caso a negociação exija nova versão, validade diferente ou documento adicional, ela cria uma nova evidência/versionamento, sem apagar a anterior.

## 3. Estados de evidência e cobertura documental

| Estado da evidência | Significado na ficha | Efeito no checklist da venda |
| --- | --- | --- |
| **Solicitada** | Requisito identificado, ainda sem arquivo válido. | Continua pendência. |
| **Recebida em análise** | Arquivo chegou, mas não foi conferido no contexto aplicável. | Pode aparecer como entregue, porém não como validada. |
| **Revisada/elegível** | Revisão concluída para finalidade, validade e versão registradas. | Pode satisfazer requisito compatível da venda, sujeito à política/tempo. |
| **Expirada** | Documento já não atende à validade definida. | Abre pendência; não é reaproveitado como atual sem revisão/regra. |
| **Incompatível/rejeitada** | Arquivo não atende tipo, legibilidade, finalidade ou consistência exigidos. | Não cobre o requisito; preserva motivo e próxima ação. |
| **Revogada/substituída** | A evidência perdeu aplicabilidade ou recebeu versão posterior. | Snapshot histórico permanece; novos usos exigem evidência válida. |
| **Restrita** | Existe, mas seu conteúdo não deve circular para o papel atual. | Mostra estado mínimo sem abrir arquivo/dados sensíveis. |

## 4. Ficha do cliente como superfície de trabalho

| Área da ficha | Objetivo | Resultado que evita retrabalho |
| --- | --- | --- |
| **Resumo** | Identificação, papéis atuais, contato, próxima ação e situação de dossiê. | Operador encontra a pessoa certa antes de abrir nova ficha. |
| **Dados cadastrais** | Dados completos coletados na finalidade e estágio corretos. | A venda reutiliza dados confirmados, preservando a origem e a data. |
| **Documentos e fotos** | Anexar, solicitar, classificar, revisar, versionar e controlar validade/visibilidade. | O anexo feito na ficha torna-se disponível para a checklist de venda compatível. |
| **Vendas e contratos** | Propostas, reservas, lotes, contratos e carteira ligados à parte. | A equipe compreende o histórico sem criar cadastro paralelo por contrato. |
| **Pendências e alertas** | Documento ausente/expirado, representação, duplicidade em análise ou próxima revisão. | Venda não depende de memória individual para identificar o que falta. |
| **Auditoria** | Quem incluiu, revisou, usou e alterou cada dado/evidência. | Permite explicar por que uma venda recebeu ou não cobertura documental. |

## 5. Armazenamento e acesso aos anexos

| Regra | Aplicação exigida |
| --- | --- |
| Arquivo privado, referência no banco. | Binários de documentos/fotos não são armazenados em colunas de banco; a ficha guarda chave/referência, metadados e permissões. |
| Sem URL pública persistente. | Leitura ocorre por autorização atual, acesso temporário e trilha; encaminhar uma URL não transfere permissão. |
| Finalidade antes da coleta. | A ficha solicita documento/foto somente quando a operação, instrumento, política ou obrigação aplicável justificar. |
| Foto não é verificação automática. | Foto ou imagem documental recebe finalidade/classificação própria; o sistema não decide identidade, poder, crédito ou regularidade por imagem. |
| Acesso por papel e escopo. | Comercial, jurídico, financeiro, parceiro e suporte visualizam somente os metadados/arquivos necessários à sua finalidade autorizada. |

## 6. Critérios de aceite futuros

| Cenário | Deve permitir | Deve impedir |
| --- | --- | --- |
| Operador encontra cliente por CPF/CNPJ autorizado. | Reutilizar a `Party` existente e abrir sua ficha, com deduplicação assistida. | Criar segundo cadastro silencioso ou exibir dados fora do escopo. |
| Documento anexado na ficha. | Classificar, versionar, revisar, limitar acesso e tornar elegível a checklists compatíveis. | Assumir que o documento está aprovado ou aplicável a qualquer venda. |
| Documento anexado durante a venda. | Criar evidência canônica no dossiê do cliente e associá-la à checklist/snapshot da venda. | Criar arquivo órfão somente no contrato ou duplicar o binário sem motivo. |
| Documento atualizado após contrato. | Manter documento novo na ficha e preservar no contrato o snapshot da versão anterior utilizada. | Alterar retroativamente a evidência histórica do contrato. |
| Cliente com documentos completos, mas requisito específico pendente. | Mostrar quais requisitos foram reutilizados e qual falta para aquela venda. | Declarar a venda “pronta” ou o cliente “aprovado” por ter anexos genéricos. |

## 7. Seleção de cliente e reaproveitamento na venda de lote

Durante a venda, o operador não cria um novo cadastro para um comprador que já existe. Ele localiza a `Party` autorizada por **CPF/CNPJ** — ou por outro critério permitido e auditado — e a inclui no papel adequado da venda: proponente principal, comprador, coadquirente, representante ou empresa compradora.

| Etapa da venda | Ação do sistema | Proteção contra erro e duplicidade |
| --- | --- | --- |
| **1. Buscar** | Consulta protegida normaliza a identificação e retorna somente candidatos que o operador pode tratar. | CPF/CNPJ não é exposto integralmente, busca não atravessa organização e resposta não enumera pessoas fora do escopo. |
| **2. Resolver parte** | Operador confirma a pessoa/empresa encontrada e sua relação com a venda. | Não seleciona por nome parecido isolado; conflitos de CPF/CNPJ, representação ou duplicidade abrem caso de revisão. |
| **3. Aplicar papel na venda** | Cria relação datada `Party ↔ Venda/Proposta/Contrato` com papel, participação e vigência. | O cadastro global não é reescrito por um campo da venda; uma pessoa pode assumir papéis diferentes em negócios distintos. |
| **4. Carregar ficha relevante** | A venda mostra os dados cadastrais e o dossiê compatíveis, com origem, data e estado de cada item. | Não carrega documentos restritos, expirados ou sem finalidade como se estivessem prontos. |
| **5. Avaliar checklist** | Regras da venda identificam evidências já elegíveis, pendentes, expiradas ou em revisão. | Cobertura documental não equivale a aprovação jurídica, de crédito ou contratual. |
| **6. Anexar durante a venda** | Novo arquivo entra primeiro como Evidência canônica da ficha e é associado à venda/checklist. | Não gera binário órfão no contrato, não duplica arquivo e não libera acesso irrestrito à ficha. |
| **7. Congelar snapshot** | Ao atingir marco de proposta/contrato, registra quais dados/evidências/versões foram usados. | Mudança posterior na ficha não altera silenciosamente o que foi utilizado na venda já registrada. |

> A venda deve **puxar o que está disponível e elegível**, e não declarar automaticamente que “todas as informações estão corretas”. O operador vê, na mesma tela, dados preenchidos, documentos reutilizados, documentos expirados/restritos e pendências da operação antes de avançar.

### 7.1 Fontes de dados dentro da venda

| Dado apresentado na venda | Fonte | Comportamento de atualização |
| --- | --- | --- |
| Nome, identificação protegida e contatos aprovados para a finalidade | Ficha da `Party`. | Exibe origem e data; correção cadastral passa pelo fluxo de ficha/auditoria. |
| Papel do comprador, cota/participação e representação | Relação específica da venda. | Pode variar por venda sem alterar os papéis históricos da ficha. |
| Documentos e fotos | Dossiê da `Party`, filtrado por finalidade, estado e permissão. | A venda referencia a versão elegível e registra snapshot no marco aplicável. |
| Pendência documental | Checklist da venda + política vigente. | Recalcula para a operação atual, sem alterar o estado de documento em outras vendas. |
| Condições comerciais, lote e contrato | Proposta/venda selecionada. | Não são campos da ficha; permanecem próprios da negociação. |

### 7.2 Tratamento de documentos anexados em cada ponto

| Onde o operador anexa | Destino canônico | Efeito imediato | Efeito na próxima venda |
| --- | --- | --- | --- |
| Ficha de Clientes Loteadora | Dossiê da `Party`. | Evidência aparece em análise/revisão conforme tipo e finalidade. | Pode ser sugerida como reutilizável se estiver válida e compatível. |
| Tela de venda de lote | Mesmo dossiê da `Party`, com ligação à checklist/venda atual. | A venda passa a conhecer o documento e sua pendência/estado. | A evidência permanece disponível para usos futuros autorizados, sem cópia do binário. |
| Aditivo/novo contrato | Dossiê da `Party` ou do contrato, conforme a natureza do documento, sempre com vínculo explícito. | Cria nova versão/novo requisito quando necessário. | Não substitui automaticamente a evidência snapshot de contratos anteriores. |

### 7.3 Exceções que devem abrir alerta

| Situação | Alerta na venda | Próxima ação segura |
| --- | --- | --- |
| CPF/CNPJ já associado a outra `Party` não reconciliada. | `Possível duplicidade cadastral`. | Abrir revisão assistida; não unir nem apagar registros automaticamente. |
| Documento necessário existe, porém expirou ou está em análise. | `Documento precisa de revisão`. | Solicitar/validar nova versão conforme política. |
| Documento anexado na venda pertence a parte diferente. | `Evidência não pertence ao comprador selecionado`. | Bloquear associação e corrigir a parte/documento. |
| Representante aparece sem instrumento/poder elegível. | `Representação pendente`. | Abrir dossiê/validação competente antes da assinatura. |
| Venda contém dados locais diferentes da ficha. | `Dado específico da negociação`. | Registrar a razão e a origem na venda; não sobrescrever a ficha sem processo auditado. |
| Parte ou documento sem permissão de leitura para o operador. | `Conteúdo restrito`. | Mostrar estado mínimo e encaminhar ao owner autorizado, sem expor o arquivo. |

## Referências internas

[1] [Modelo canônico de pessoas, representação e dossiê](crm_nucleo_cadastral_carteira.md)

[2] [Painel integrado de Sócios e Parceiros](crm_socios_parceiros_painel_integrado_acesso.md)

[3] [Loteadora: recebíveis, permutas e cascatas](crm_loteadora_recebiveis_distribuicao.md)

[4] [Estratégia consolidada](estrategia_crm_imobiliario_consolidada.md)
