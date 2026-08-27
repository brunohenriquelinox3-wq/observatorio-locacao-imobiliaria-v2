# Protocolo de atualização estratégica linear — Vendas Urbanas e Locação

**Status:** `ativo_por_autorização_do_usuário_2026-08-27`  
**Natureza:** documental. Este protocolo atualiza estratégia, requisitos, critérios de aceite, riscos, fontes e roadmap; não autoriza implementação de funcionalidades, dados, integrações, permissões ou automações do CRM.

## Mandato de atualização

O estudo acumulado e os achados comprovados do CRM de referência devem ser integrados linearmente aos documentos estratégicos de Vendas Urbanas e Locação. Não é necessária uma autorização intermediária por ajuste documental. O usuário será chamado ao fim de cada bloco coerente, revisado e preservado, não entre cada observação isolada.

## Regra de evidência e decisão

Cada decisão relevante deve preservar uma cadeia rastreável:

> intenção → evidência → recomendação → alternativas → decisão → requisito → dependência → critério de aceite → prova futura → observação → aprendizado.

| Elemento | Regra documental |
| --- | --- |
| Recomendação | Declara o caminho preferencial, a razão, o risco de não adotá-lo e o nível de confiança. |
| Evidência | Distingue achado observado, fonte externa, hipótese, lacuna e decisão de negócio. |
| Alternativa | Registra opções descartadas, adiadas ou condicionais, sem ocultar trade-offs. |
| Limite | Não converte recurso visto em requisito obrigatório sem teste de adequação ao domínio e à arquitetura canônica. |
| Aceite | Define a prova prática que uma implementação futura precisa demonstrar antes de ser considerada pronta. |
| Revisão | Versiona mudanças sem apagar histórico e reabre uma decisão quando houver nova evidência ou contradição. |

## Limites invariáveis

| Limite | Aplicação |
| --- | --- |
| Escopo | Atualizações restritas a Vendas Urbanas e Locação; SUPER ADM, ADM e Loteadora permanecem intactos salvo instrução futura inequívoca. |
| Privacidade | Nenhum documento estratégico reproduz nomes, contatos, endereços, valores, identificadores ou outras informações individuais vistas no CRM de referência. |
| Segurança | Todo requisito preserva menor privilégio, escopo explícito, reversibilidade, trilha de auditoria e falha segura. |
| Financeiro | Cobrança, caixa, direito, instrução de repasse e liquidação continuam tratados como fatos distintos e governados. |
| Implementação | Nenhum schema, migration, rota, tela, integração, permissão operacional ou dado é criado ou alterado por este protocolo. |

## Cadência linear

1. Consolidar um conjunto temático de evidências e decisões relacionadas.
2. Verificar fronteiras com a arquitetura canônica e decisões já aprovadas.
3. Registrar recomendação, evidência, alternativa, risco, dependência e critério de aceite.
4. Atualizar a estratégia e o plano de ondas correspondente.
5. Fazer revisão de coerência, teste de integridade documental e checkpoint.
6. Comunicar somente o bloco concluído, com limites e próximos pontos de atenção.

## Referências internas

[1] [Estratégia atualizada — Vendas Urbanas e Locação](estrategia_vendas_urbanas_locacao_atualizada.md)

[2] [Plano estratégico de ondas](plano_estrategico_ondas_vendas_locacao.md)

[3] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)
