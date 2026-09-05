# Inventário de governança administrativa — A183

**Data:** 05 de setembro de 2026  
**Escopo:** leitura de interface, contratos, serviços e migrations. Não foram criadas identidades, organizações, memberships, grants, escopos, convites ou comunicações externas.

| Camada | Estado atual | Limite preservado |
|---|---|---|
| SUPER ADM | A Central de Plataforma pode provisionar organização, delegar membership, ativar organização e suspender/revogar membership, sempre por RPC protegida. | Exige principal ativo, identidade ativa, MFA, recuperação, correlação e policy no servidor. |
| ADM | O Painel ADM mostra módulos autorizados da própria organização, mas não tem gestão de colaboradores/corretores. | Não recebe autoridade implícita sobre identidade, membership ou grant. |
| Identidade | O subject Supabase é separado da sessão Manus e do papel organizacional. | Não há senha padrão, identidade automática ou exibição de e-mail na gestão administrativa. |
| Membership | Usa `organization_admin`, `area_admin` e `operator`, com estado, vigência e organização. | O papel é de autorização; ele não identifica ocupação profissional. |
| Grant | Armazena módulos, recursos opcionais, finalidade, estado e vigência. | A interface não torna o grant ativo nem substitui RLS/RPC. |
| Pessoas de trabalho | Não há tipo próprio para colaborador ou corretor. | Criar papéis de acesso por ocupação geraria explosão de roles e confundiria função com autorização. |
| Entrada de novo usuário | A delegação de plataforma requer uma referência de subject já existente. | Não há convite externo, geração de senha, automação de e-mail ou fluxo de autoinscrição organizacional. |

## Lacuna principal

O domínio atual possui a fundação para delegação, mas não uma jornada orientada a pessoas de trabalho. A evolução deve separar quatro conceitos: **identidade**, **perfil de trabalho** (colaborador ou corretor), **papel de autorização** (ADM organizacional, ADM de área ou operador) e **escopo** (módulos e finalidade).

## Implicação de segurança

O SUPER ADM deverá continuar como autoridade máxima para governança de plataforma e para aprovações de maior risco. O ADM poderá preparar e, em escopo estritamente contido, delegar apenas perfis operacionais de sua própria organização. Corretores e colaboradores não receberão módulos, escopos ou privilégios pela mera classificação profissional.
