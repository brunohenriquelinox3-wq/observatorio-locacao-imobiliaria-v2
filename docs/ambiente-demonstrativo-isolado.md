# Ambiente demonstrativo isolado

## Finalidade

O ambiente demonstrativo serve exclusivamente para verificar, em modo de leitura, as jornadas de **Vendas Urbanas** e **Locação**. Ele não deve receber clientes, imóveis, contratos, documentos, dados financeiros ou dados de produção.

> A sessão autenticada não concede alçada. A criação e a ativação continuam sujeitas às verificações de SUPER ADM, MFA, recuperação, contexto, membership, grant, escopo, vigência e policy no servidor.

## Pré-requisitos

Antes de iniciar, entre na **Central de Plataforma** com a identidade já habilitada como SUPER ADM. Confirme que a identidade Supabase está conectada, o MFA TOTP foi verificado recentemente e o canal de recuperação foi validado. Não compartilhe senha, código TOTP, QR code, link de recuperação, token ou identificadores administrativos.

## Criação do rascunho

1. Na Central de Plataforma, localize a ação de **provisionar organização**.
2. Informe um nome neutro, como `Ambiente Demonstrativo`, e um domínio de referência que não seja usado em operação comercial.
3. Acione a criação uma única vez. O resultado correto é uma organização em **rascunho**, sem usuários, alçadas, módulos ativos ou dados de negócio.
4. Não tente criar outra organização se houver falha: registre apenas a mensagem genérica exibida e interrompa o fluxo.

## Acesso mínimo para auditoria

Para auditoria visual, o caminho mais seguro é manter a organização em rascunho e utilizar somente superfícies que já possam ser visualizadas sem alteração de dados. Se, em uma etapa futura e explicitamente autorizada, for necessária ativação controlada, ela deve seguir esta ordem:

1. Atribuir uma membership temporária ao papel de teste, com finalidade explícita de auditoria e vigência curta.
2. Conceder exclusivamente os módulos **Vendas Urbanas** e **Locação**. Não conceder Plataforma, Loteadora, Financeiro, Pagamentos, Contratos, Integrações ou acesso a terceiros.
3. Confirmar no servidor que organization, principal, membership, grant, escopo e MFA são válidos.
4. Ativar a organização apenas após essa confirmação. A ativação não substitui nenhuma checagem anterior.

## Regras de uso do ambiente

| Permitido | Proibido |
|---|---|
| Navegar, rolar telas, ler rótulos, avaliar estados vazios e verificar mensagens de erro. | Criar, editar, excluir, importar, exportar ou anexar dados de negócio. |
| Usar somente dados sintéticos que já estejam disponíveis para demonstração. | Inserir dados de pessoas, empresas, imóveis, documentos, contratos ou dados financeiros reais. |
| Registrar lacunas sem reproduzir identificadores individuais. | Disparar comunicação, cobrança, pagamento, repasse, integração externa ou publicação. |

## Como me avisar

Quando o ambiente estiver disponível, responda somente: **“ambiente demonstrativo liberado”**. Eu confirmarei o contexto observável e farei a auditoria em modo de leitura, sem executar mutações.

## Resultado esperado

O ambiente permite validar de forma segura se cada jornada está clara, acessível e isolada, ajudando a **explorar os dados de forma mais intuitiva**, **entender melhor as tendências** e **salvar ou compartilhar facilmente**.
