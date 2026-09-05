# Jornada de Segurança e MFA — A204

> **Motivo:** a sessão autenticada alcança o Cadastro de Loteamentos, mas o servidor negou um comando de criação por ausência de MFA TOTP recente e a interface não oferecia um caminho visível de inscrição ou revalidação.

## Fluxo adotado

O fluxo seguirá a API oficial de MFA do provedor somente no navegador autenticado. A aplicação verificará o nível de garantia da sessão e listará fatores. Quando não houver fator TOTP, a pessoa poderá iniciar a inscrição; quando houver fator mas a sessão estiver no nível inicial, poderá solicitar um desafio e confirmar o código do autenticador. A verificação bem-sucedida eleva a sessão para o nível reforçado; o servidor continua decidindo se os comandos administrativos podem prosseguir [1].

| Estado de garantia | Leitura na interface | Ação permitida |
|---|---|---|
| Nível inicial, sem fator | Proteção não configurada | Iniciar inscrição TOTP. |
| Nível inicial, com fator | Revalidação necessária | Gerar desafio e verificar o código local. |
| Nível reforçado, com fator | MFA recente reconhecido | Retomar comandos protegidos. |
| Erro ou sessão indisponível | Estado de segurança não confirmado | Manter qualquer comando protegido bloqueado. |

## Proteções de implementação

O QR code e o segredo de inscrição existem apenas no estado de memória do navegador e são removidos ao cancelar, concluir, sair da rota ou trocar a sessão. O segredo não será enviado ao servidor, salvo em banco, colocado em logs, anexado a auditoria ou retornado por procedures. O código TOTP é validado localmente quanto ao formato e enviado somente ao método de verificação do provedor autenticado. A interface não revela o identificador de fator, o identificador da pessoa ou tokens de sessão.

O servidor não receberá uma concessão da tela de Segurança. Depois de uma verificação bem-sucedida, o cliente atualizará o token de sessão que já acompanha chamadas protegidas; cada comando continuará exigindo subject ativo, organização ativa, alçada, finalidade, contexto e a atestação AAL2 por TOTP.

## Implementação entregue

A rota **Segurança e MFA** foi incorporada à navegação de Plataforma e ao menu de perfil. Ela se torna visível para toda sessão da plataforma, mas não libera contexto, papel, grant ou qualquer comando sensível. A tela trata a sessão de contexto como dependência explícita e apresenta uma única ação segura para cada estado.

| Estado | Ação disponível | Tratamento de informações sensíveis |
|---|---|---|
| Sem sessão de contexto | Encaminhar à validação de contexto. | Não mostra fator, QR, segredo, código, token ou identidade. |
| Sem fator TOTP | Iniciar inscrição após confirmação local. | QR e segredo são mantidos somente na memória do navegador. |
| Fator presente, sem AAL2 recente | Gerar desafio e confirmar código TOTP. | O código segue diretamente ao provedor e é limpo da interface após êxito ou falha. |
| AAL2 recente | Retornar ao Cadastro de Loteamentos. | A interface informa que o servidor ainda revalida contexto, alçada e policy. |
| Estado indisponível | Verificar novamente ou validar o contexto. | Comandos permanecem bloqueados; a interface não fica sem orientação. |

O QR tem texto alternativo apropriado, não é escrito em auditoria, não passa por procedure e é descartado em cancelamento, confirmação ou saída da tela. A inscrição pode ser cancelada antes da confirmação, removendo o fator pendente diretamente no provedor. A inclusão na navegação preserva a ordem de autoridade: **SUPER ADM**, **ADM**, **Segurança e MFA**, seguidos das colunas operacionais.

## Verificações executadas

| Verificação | Resultado |
|---|---|
| Tipagem TypeScript | Aprovada. |
| Suíte de testes | 206 arquivos e 493 testes aprovados. |
| Cobertura nova | Verifica sessão ausente, inscrição necessária, revalidação, AAL2 reconhecido, cópia segura de falha e ordem da navegação. |
| Build e integridade | Build compatível com Netlify e `git diff --check` aprovados; há somente o aviso não bloqueante de tamanho de chunk. |
| Revisão desktop e móvel | O estado seguro e a recuperação de estado indisponível ficaram legíveis em ambos os tamanhos. |
| Sessão autenticada real | Pendente de a pessoa usuária abrir a nova rota e concluir o fluxo no próprio autenticador. As tentativas de automação remota expiraram antes de alcançar a página; nenhum MFA foi criado ou modificado por automação. |

Na revisão autenticada do Painel ADM, o guia apareceu antes dos relatórios e da preparação de equipe, com quatro passos numerados e o atalho **“Configurar ou renovar MFA”** diretamente acessível. O acionamento do atalho e a navegação direta para a rota expiraram no canal remoto antes de qualquer carregamento ou comando. Esse limite de navegador não alterou a sessão nem o CRM; a rota permanece validada por testes e captura local, enquanto a inscrição pessoal continua pendente.

> A pessoa usuária precisa abrir **Segurança e MFA** no menu de perfil ou na navegação Plataforma. Caso o estado mostre “Proteção ainda não configurada”, ela deve escanear o QR somente em seu autenticador e confirmar o código na própria página. Não deve compartilhar senha, chave ou código por mensagem.

Esta correção permite que a pessoa responsável encontre o caminho legítimo para elevar a sessão, sem alterar a regra de que o CRM só executa comandos após MFA recente. Ela dá condições para **explorar os dados de forma mais intuitiva**, **entender melhor as tendências** de segurança e **salvar ou compartilhar facilmente** somente conteúdos já autorizados.

## Referência

[1]: https://supabase.com/docs/guides/auth/auth-mfa/totp "Supabase — Multi-Factor Authentication (TOTP)"
