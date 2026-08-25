# Contrato executável — Etapa 0: fundação administrativa

**Estado:** `proposto_para_aprovacao`  
**Escopo da entrega:** Subetapas A0–A2 da administração privilegiada.  
**Princípio de autoridade:** o painel projeta o estado; **Auth, RLS, RPC transacional e eventos append-only** decidem.

> **Tese de construção:** o primeiro módulo real não é um CRUD de usuários. É a fronteira que cria uma organização, delega escopo, revoga acesso e explica quem fez cada mudança. Um Super Admin mantém a saúde da plataforma; ele não é proprietário automático do conteúdo ou das decisões de cada locatária.

## 1. Resultado que esta etapa deve entregar

A primeira fundação disponibilizará uma **Central de Plataforma** para o principal privilegiado governado. Ela permitirá iniciar o provisionamento de uma organização, acompanhar seu estado, convidar o primeiro Admin de organização, suspender ou revogar grants, consultar eventos administrativos redigidos e identificar pendências de segurança. O produto não incluirá ainda gestão de leads, estoque, contratos, cobranças, pagamentos, documentos de clientes ou split.

| Incluído | Excluído de propósito | Razão do limite |
| --- | --- | --- |
| Organização, convite, membership, grant, vigência, revogação e eventos administrativos. | Dados de operação imobiliária, carteira, dossiê, cobrança, liquidação e exportação. | Administração de plataforma não deve abrir acesso informal ao dado da locatária. |
| Bootstrap do primeiro principal por segredo de produção, confirmação de identidade e MFA. | Endereço de e-mail, token, `service_role` ou regra de privilégio no frontend, migration ou repositório. | A identidade inicial é configuração de implantação, não uma backdoor de código. |
| RLS, comandos transacionais, correlação, idempotência, erros seguros e testes permitir/negar. | Automação ampla de suporte, break-glass operacional e catálogos editáveis. | Cada privilégio adicional só entra depois de provar a fronteira básica. |

## 2. Modelo de dados e invariantes

| Entidade | Campos mínimos | Invariante de negócio | Autoridade de escrita |
| --- | --- | --- | --- |
| `organizations` | `id`, `name`, `domain`, `state`, `created_at` | `draft → provisioning → active` é explícito; uma organização suspensa não recebe novos grants ativos. | `provision_organization` |
| `identity_subjects` | `auth_user_id`, `lifecycle_state`, dados mínimos | E-mail é contato/verificação; nunca é chave de autorização. | Auth + comando confiável |
| `organization_memberships` | sujeito, organização, papel-base, vigência, estado | Membership aceita não é igual a grant privilegiado; não existe acesso sem vínculo ativo. | `grant_membership` / `revoke_membership` |
| `administrative_grants` | sujeito, escopo, ação, motivo, alçada, início/fim | Grant é menor privilégio, expira e não delega poder acima do teto recebido. | RPC transacional |
| `platform_principals` | sujeito, papel de plataforma, MFA, recertificação, estado | O principal inicial começa `pending_activation`; não existe plataforma privilegiada sem MFA concluída. | `bootstrap_platform_principal` / ativação |
| `admin_audit_events` | correlação, ator, comando, alvo redigido, resultado, tempo | Evento é append-only e é escrito no mesmo commit do comando crítico. | Função privada somente |
| `access_invitations` | destinatário, escopo, expiração, uso, correlação | Convite é único, expira e não ativa membership antes de aceite e MFA exigida. | Função transacional |

## 3. Estados e transições que a interface deverá mostrar

| Objeto | Estados iniciais | Transição permitida | Bloqueio obrigatório |
| --- | --- | --- | --- |
| Organização | `draft`, `provisioning`, `active`, `suspended` | O Super Admin inicia provisionamento; a ativação depende do aceite do primeiro Admin e da prova de segurança. | Falha, abandono ou convite expirado não deixam organização parcialmente ativa. |
| Principal de plataforma | `pending_activation`, `active`, `suspended`, `revoked` | A ativação exige e-mail confirmado, MFA AAL2, recuperação registrada e aceite de política. | Login ou e-mail compatível não convertem alguém em principal privilegiado. |
| Membership | `invited`, `active`, `suspended`, `revoked`, `expired` | Convite aceito cria vínculo ativo dentro de escopo, papel e vigência definidos. | Revogação fecha acesso mesmo se o cliente ainda exibir uma tela antiga. |
| Grant | `pending`, `active`, `expired`, `revoked` | Autoridade superior cria ou encerra um grant com motivo e duração. | Ninguém eleva o próprio grant, remove o último owner ou cruza organização. |

## 4. Contrato de comandos da primeira superfície

| Comando | Atores permitidos | Pré-condições verificadas no servidor/banco | Efeito atômico | Resposta de UI |
| --- | --- | --- | --- | --- |
| `bootstrap_platform_principal` | Procedimento interno de implantação | Segredo de ambiente, nenhum bootstrap prévio, idempotência e correlação. | Intenção de bootstrap, convite curto e evento redigido. | Estado e correlação; nunca e-mail, token ou segredo. |
| `activate_platform_principal` | Sujeito convidado | E-mail confirmado, MFA AAL2, recuperação, política aceita e convite válido. | Principal e grant de plataforma governado; evento no mesmo commit. | Próxima ação ou código seguro de bloqueio. |
| `provision_organization` | `platform_super_admin` | AAL2, domínio/owner mínimos, idempotência e separação de deveres definida. | Organização `provisioning`, convite do owner, audit/outbox. | IDs, estado e pendência de ativação. |
| `grant_membership` | Super Admin ou Admin de organização com autoridade superior | Organização ativa, escopo contido, vigência, motivo e não autoelevação. | Membership/grant e evento atômicos. | Grant redigido e expiração. |
| `revoke_membership` | Autoridade de revogação | Motivo, sucessor quando necessário e correlação. | Grant encerrado, sessões elegíveis invalidadas, audit/outbox. | Estado revogado e follow-up. |

Falhas retornam apenas códigos seguros, como `ADMIN_SCOPE_DENIED`, `ADMIN_MFA_REQUIRED`, `ADMIN_DUAL_APPROVAL_REQUIRED`, `ADMIN_GRANT_EXPIRED` e `ADMIN_BOOTSTRAP_ALREADY_USED`. A interface informa uma ação segura sem enumerar outra organização, usuário ou regra interna.

## 5. Limites de Super Admin e principal inicial

O principal inicial designado será resolvido por `INITIAL_PLATFORM_PRINCIPAL_EMAIL` em **segredo de produção**. O endereço não entra em código, commits, migration, documentação pública, logs ou payload de navegador. O segredo apenas aponta o destinatário do convite inicial; ele não cria sessão, não contorna MFA e não libera privilégios antes da ativação transacional.

| Pode realizar no início | Não pode realizar por padrão |
| --- | --- |
| Criar/suspender organização, iniciar convite de owner, revogar grant, exigir MFA, ler eventos administrativos redigidos e abrir caso de suporte mínimo. | Ler dossiê, carteira, documento, payload completo, conteúdo financeiro, alterar cobrança, instruir split, operar como usuário de locatária ou exportar dados de cliente. |

## 6. Testes de aceite que bloqueiam a próxima subetapa

1. Um usuário autenticado sem membership não lê tabelas, views, RPCs ou objetos administrativos de nenhuma organização.
2. Um Admin de organização A não obtém dados nem cria recursos na organização B por URL, payload, estado de cliente ou chamada direta.
3. Uma sessão AAL1 recebe orientação de MFA, mas não executa comandos administrativos de alto risco; uma sessão AAL2 ainda respeita escopo, vigência e separação de deveres.
4. Criar, conceder, revogar, expirar, negar e ativar gera `AdminAuditEvent` correlacionado e redigido na mesma transação.
5. Reenvio de comando com a mesma chave de idempotência não cria uma segunda organização, membership, convite ou evento material.
6. O primeiro principal não ativa sem configuração protegida, e-mail confirmado, MFA, recuperação e aceite; não há caminho de frontend que promova um login por endereço.

## 7. Decisões ainda calibráveis antes de produção

Os prazos de convite, recertificação, retenção de eventos, janela de reautenticação, dupla aprovação, máscara de suporte e recovery de MFA dependem de piloto, contrato, segurança, LGPD, jurídico e operação. Eles serão parâmetros versionados com owner e data de revisão, não constantes universais de interface.

## 8. Passagem para a Subetapa 0.2

Com este contrato aprovado, a próxima subetapa poderá elevar o projeto para uma base full-stack e criar **somente** a infraestrutura de ambientes e o modelo administrativo mínimo. Ela não aplicará dados reais, não criará o principal inicial e não habilitará qualquer comando de produção sem uma nova confirmação explícita.

**Artefatos relacionados:** [modelo de alçadas](crm_administracao_plataforma_modelo.md) · [blueprint técnico](crm_administracao_plataforma_implementacao.md) · [estratégia consolidada](estrategia_crm_imobiliario_consolidada.md).
