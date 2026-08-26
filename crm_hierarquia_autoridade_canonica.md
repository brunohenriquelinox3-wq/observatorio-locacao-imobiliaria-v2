# Hierarquia canônica de autoridade — SUPER ADM acima de ADM

**Status:** `regra_mestra_de_governança`  
**Decisão confirmada pelo usuário:** o **SUPER ADM** é a autoridade máxima da plataforma CRM. Abaixo dele está o **ADM**, que é a autoridade máxima somente da sua própria empresa cliente. Abaixo do ADM estão os responsáveis por módulo, equipes e colaboradores.

> **Hierarquia de produto:** `SUPER ADM da Plataforma → ADM da Organização Cliente → Responsável pelo Módulo → Colaborador/Corretor/Operador → Portal de Cliente ou Proprietário`.

## 1. Níveis de autoridade

| Nível | Autoridade | Pode governar | Não pode fazer sem controle adicional |
| --- | --- | --- | --- |
| **N0 — SUPER ADM** | Autoridade máxima da plataforma. | Organizações clientes, contratos/módulos SaaS, equipe interna, segurança de plataforma, suporte controlado e financeiro da plataforma. | Acessar dados operacionais de tenant sem escopo, justificativa, JIT, vigência, MFA/step-up e auditoria. |
| **N1 — ADM** | Autoridade máxima dentro de uma organização cliente. | Colaboradores da própria empresa, módulos já contratados, equipes, alçadas internas e parâmetros autorizados. | Administrar a plataforma, mudar contrato SaaS, acessar outro tenant ou criar privilégio acima de seu teto. |
| **N2 — Responsável de módulo** | Gestor delegado de Loteadora, Vendas Urbanas, Locação ou Financeiro. | Fluxos, equipe e dados do módulo dentro do escopo que ADM delegou. | Ativar módulo não contratado, alterar regras críticas sem alçada ou acessar outro módulo/empresa por padrão. |
| **N3 — Colaborador/Corretor/Operador** | Pessoa que executa tarefas de sua função. | Cadastros, propostas, atendimento, carteira, documentos ou ações previstas no próprio grant. | Alterar contratos, preços, direitos, acesso, conciliação ou dados fora de sua função sem aprovação. |
| **N4 — Portal externo** | Cliente, comprador, locatário ou proprietário. | Somente informações e ações mínimas relativas ao próprio contrato, imóvel, boleto, documento ou solicitação autorizada. | Ver dados internos, outros contratos, outras pessoas, carteira geral ou regras administrativas. |

## 2. SUPER ADM: autoridade máxima, porém governada

O SUPER ADM é superior ao ADM porque governa a **plataforma inteira**. Ele cria e administra organizações clientes, registra os módulos contratados, cuida dos colaboradores internos, acompanha o financeiro SaaS e mantém a segurança da plataforma.

| Poder de SUPER ADM | Aplicação correta | Proteção obrigatória |
| --- | --- | --- |
| Criar/suspender organização cliente | Criar o tenant que usará o CRM ou suspender sua operação por motivo autorizado. | Comando transacional, alçada, motivo, idempotência e audit event. |
| Habilitar módulos contratados | Habilitar ADM, Loteadora, Vendas Urbanas e/ou Locação conforme contrato da empresa cliente. | Módulo contratado não concede acesso a usuários nem cria dados automaticamente. |
| Gerenciar equipe da plataforma | Conceder funções internas de suporte, comercial, implantação, produto e segurança. | Menor privilégio, escopo, vigência, MFA, teto de delegação e recertificação. |
| Financeiro da plataforma | Controlar planos, faturas, recebimentos e pagáveis da empresa CRM. | Separação absoluta do financeiro e da carteira de qualquer organização cliente. |
| Suporte a uma organização cliente | Investigar uma solicitação técnica dentro de tenant específico. | JIT, justificativa, período curto, mascaramento quando possível, MFA/step-up e trilha append-only. |

## 3. ADM: autoridade máxima da empresa cliente

O ADM não fica no mesmo nível do SUPER ADM. Ele é o principal administrador **dentro da sua imobiliária, loteadora, construtora ou grupo**, e pode organizar equipes e processos somente nessa fronteira.

| Poder de ADM | Aplicação correta | Limite obrigatório |
| --- | --- | --- |
| Organizar equipe | Convidar, suspender, delegar e revisar colaboradores da própria empresa. | Não remove último owner, não se autoeleva acima do teto e não acessa outro tenant. |
| Distribuir trabalho | Definir responsáveis por Loteadora, Vendas Urbanas, Locação e setores permitidos. | A delegação não ultrapassa módulo contratado, alçada financeira ou finalidade autorizada. |
| Ver administração financeira | Acompanhar a visão da empresa, por módulo, entidade legal, carteira e período autorizados. | Não trata financeiro como planilha editável, nem mistura SaaS, recebível, caixa, repasse e direito econômico. |
| Configurar operação | Ajustar parâmetros, modelos, notificações e integrações autorizadas. | Regra crítica é versionada, revisada e não reescreve contrato, preço, direito ou fato passado. |
| Acessar módulos contratados | Abrir as colunas Loteadora, Vendas Urbanas e Locação contratadas pela organização. | Visibilidade de módulo não substitui policy de dados nem dá acesso a qualquer carteira/imóvel/contrato. |

## 4. Cadeia de delegação

| Quem delega | Para quem | Exemplo | Condições mínimas |
| --- | --- | --- | --- |
| SUPER ADM | ADM da organização cliente | Definir o primeiro administrador do tenant após validação segura. | Identidade confirmada, MFA, escopo do tenant, justificativa, audit event e método de bootstrap aprovado. |
| ADM | Responsável de módulo | Designar gestor de Loteadora ou Locação. | Módulo contratado, função, escopo, vigência, alçada e regras de revogação. |
| Responsável de módulo | Colaborador/corretor/operador | Delegar carteira, empreendimento, captação ou atendimento. | Menor privilégio, carteira/empreendimento delimitado e ações críticas sob alçada. |
| Sistema | Portal externo | Permitir acesso de cliente/locatário/proprietário. | Identidade, finalidade, contrato/imóvel vinculado, sessão segura e escopo mínimo. |

## 5. Regras que não podem mudar

1. **SUPER ADM está acima de ADM** na cadeia da plataforma.
2. **ADM está acima de colaboradores da própria empresa**, mas não acima da plataforma nem de outras empresas clientes.
3. **Nenhum nível abaixo pode conceder a si mesmo um poder que o nível acima não delegou.**
4. **Nenhum menu, módulo, tela, URL ou badge substitui policy real de banco, API e comando.**
5. **Toda delegação, revogação, suporte excepcional ou ação sensível produz evidência de auditoria.**
6. **O poder máximo do SUPER ADM é de governança da plataforma, não autorização invisível para consultar indiscriminadamente a operação privada de todos os clientes.**

## 6. Relação com as cinco colunas

| Coluna | Nível principal | Relação na hierarquia |
| --- | --- | --- |
| SUPER ADM | N0 | Governa plataforma, empresas clientes e módulos contratados. |
| ADM | N1 | Governa a organização cliente e distribui acesso interno dentro do teto. |
| LOTEADORA | N2/N3 | Módulo operacional usado por responsáveis e colaboradores autorizados. |
| VENDAS URBANAS | N2/N3 | Módulo operacional usado por responsáveis e colaboradores autorizados. |
| LOCAÇÃO | N2/N3 | Módulo operacional usado por responsáveis e colaboradores autorizados. |

## Referências internas

[1] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)

[2] [Consolidação de módulos, owners e critérios de aceite](crm_arquitetura_colunas_setores_consolidacao.md)

[3] [Contrato da fundação administrativa](crm_fundacao_administrativa_contrato_v0.md)
