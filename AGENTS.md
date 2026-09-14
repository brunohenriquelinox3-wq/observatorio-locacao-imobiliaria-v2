# Instruções persistentes do projeto

## Regra de preservação obrigatória

Toda atualização deve **aprimorar e preservar** os recursos, conteúdos, dados, fluxos, campos, controles, módulos e jornadas já desenvolvidos. Não excluir, ocultar, substituir nem tornar inacessível qualquer elemento existente apenas para acomodar um novo visual ou funcionalidade.

Uma remoção, desativação, arquivamento, exclusão ou substituição material somente pode ocorrer após ordem explícita do usuário. Quando uma nova camada de interface for introduzida, ela deve coexistir com a jornada anterior ou oferecer acesso inequívoco a ela, sem perda de conteúdo.

## Verificação antes de concluir atualizações

Antes de declarar uma alteração pronta, conferir no navegador a continuidade da jornada inteira — da entrada aos estados posteriores — e registrar que as funções já existentes permanecem acessíveis. A validação deve abranger desktop e celular, testes automatizados e revisão de integridade sem mutação não autorizada de dados.

## Autonomia para testes seguros

O agente tem autonomia permanente para navegar pelo CRM, percorrer jornadas completas, acionar controles estritamente não materiais e testar fluxos de leitura, filtro, seleção, rolagem, foco, retorno, mensagens de bloqueio e responsividade. Essa autonomia existe para detectar e corrigir falhas antes da entrega, sem exigir nova autorização para cada teste seguro.

Nenhum teste pode confirmar, enviar, salvar, criar, editar, arquivar, restaurar, importar, exportar, publicar ou alterar dados sem a autorização específica já aplicável. Por ordem explícita do proprietário, o MFA é confirmado na autenticação e vinculado à sessão válida; operações materiais continuam condicionadas a identidade, organização, membership, grant, escopo, finalidade, sessão MFA autorizada, correlação, idempotência e auditoria. Logout, expiração ou invalidação da sessão devem voltar a bloquear as operações; falhas de precondição devem ser preservadas e tratadas como controles corretos, nunca contornadas.

## Preservação de conhecimento

Não descartar conhecimento adquirido em estudos, inspeções, validações, decisões de UX, contratos de interface ou evidências de segurança. Registrar cada achado reutilizável em documentação versionada e manter um índice de consulta no projeto. Ao iniciar nova atualização, revisar essas referências antes de decidir, implementar ou remover qualquer coisa.

## Manual do Operador da Loteadora

Toda alteração futura que criar, modificar ou remover de forma autorizada uma jornada, campo, regra, tela ou controle da Loteadora deve atualizar o setor **Manual do Operador** na mesma entrega. A atualização deve incluir a trilha afetada, passo a passo em linguagem simples, tela demonstrativa com dados fictícios, regra de conferência, limite operacional e teste de regressão correspondente. O manual é a porta de treinamento de novos colaboradores e deve permanecer coerente com o CRM; nenhuma funcionalidade operacional da Loteadora é considerada concluída sem essa revisão didática.
