# Registro complementar de pesquisa — operação, portal e implantação

**Data de acesso:** `2026-08-27`  
**Escopo:** Vendas Urbanas e Locação.  
**Uso permitido:** evidência de posicionamento e requisitos documentais; não é base para promessa comercial, execução financeira, automação autônoma ou implementação.

## Evidências validadas

| Fonte | Evidência declarada | Aplicação estratégica limitada | Limite |
| --- | --- | --- | --- |
| Buildium — onboarding | A fonte descreve migração assistida de dados de ativo, unidade, contrato, proprietário, ocupante e prestador, além de treinamento customizado e materiais autoguiados. [1] | Reforça a estratégia de staging, mapeamento, validação, treinamento por papel e adoção por jornada. | É uma oferta de fornecedor estrangeiro; importação e migração próprias devem seguir dados canônicos, privacy-by-design, reconciliação e regras brasileiras. |
| Buildium — portal de proprietário | A fonte apresenta portal com leitura de relatórios, transações, documentos e tarefas; também descreve pagamentos e comunicações. [2] | Reforça portal mínimo por escopo, objetos autorizados, documentos elegíveis, `as_of`, lineage e estados de vazio/erro. | Pagamento, comunicação e aprovação são ações sensíveis: não podem ser inferidas como leitura, nem habilitadas sem consentimento/policy/controle financeiro próprio. |
| Buildium — operação | A fonte comunica contabilidade, cobrança, leasing, manutenção, triagem, aplicativos móveis e integrações em uma plataforma. [3] | Reforça que locação deve conectar carteira, manutenção, documentos, portais e indicadores sem colapsar fatos financeiros distintos. | Catálogo de funcionalidades não comprova adequação normativa, desempenho ou necessidade de copiar produto/capacidade. |
| Yardi | A fonte organiza soluções por domínio — property management, leasing, marketing, pesquisa de mercado, procurement, financeiro, aprendizado e portais — e enfatiza dados conectados e plataforma governada. [4] | Reforça separação por domínio com modelos de leitura conectados, contratos de integração e treinamento contínuo. | A abrangência de portfólio e produtos Yardi não determina o escopo inicial da estratégia brasileira; cada capacidade exige caso de uso e gate próprio. |

## Reforços estratégicos decorrentes

| ID | Reforço | Regra estratégica |
| --- | --- | --- |
| `PORT-EXT-01` | O portal de proprietário deve ser leitura mínima governada, não uma cópia integral do backoffice. | Cada bloco de leitura precisa ter usuário/organização, objeto, campo, propósito, janela temporal, `as_of`, expiração e log. |
| `PORT-EXT-02` | Onboarding e migração devem combinar mapeamento de dados, treinamento por papel e critérios de conclusão. | Nenhum arquivo é promovido ao registro canônico sem validação, deduplicação, exceção explícita e reconciliação. |
| `PORT-EXT-03` | A jornada de Locação é um conjunto coordenado de domínios — contrato, carteira, ativo, pessoa, manutenção, documentos e prestação de contas. | Interfaces podem unificar contexto; o modelo de dados e as permissões não devem unificar fatos, owners ou políticas indevidamente. |
| `PORT-EXT-04` | Capacidades transversais devem ser tratadas como contratos, e não como dependência silenciosa de fornecedor. | Todo conector exige capacidade, fonte, dados mínimos, credencial/escopo, idempotência, observabilidade, contingência e owner. |

## Provas futuras de aceite

1. Um proprietário de teste consegue ler apenas os itens explicitamente liberados de um único contexto autorizado; variações de URL, cache, parâmetro ou identificador não ampliam escopo.
2. Um material de onboarding leva cada papel a concluir seu cenário essencial e a recuperar uma exceção sem depender de procedimento informal.
3. Uma carga simulada percorre staging, mapeamento, validação, deduplicação, reconciliação, erro e rollback/compensação antes de qualquer lote produtivo.
4. Uma jornada de Locação exibe vínculo entre contrato, carteira, manutenção e documento com lineage, sem realizar cobrança, repasse, comunicação ou pagamento automaticamente.

## Referências

[1] [Buildium — Onboarding & Data Migration](https://www.buildium.com/features/onboarding/)

[2] [Buildium — Owner Portal for Property Managers](https://www.buildium.com/features/property-owner-portal/)

[3] [Buildium — Property Management Software](https://www.buildium.com/)

[4] [Yardi — Real Estate Software](https://www.yardi.com/)
