# Modelo revisado do cadastro de loteamentos

**Estado:** `decisões_candidatas_para_consolidação`  
**Base:** inventário do curso recebido, domínio de loteadora já aprovado e evidências primárias desta revisão.  
**Regra-mãe:** o CRM conserva o que foi declarado, recebido, revisado, bloqueado e autorizado. Ele não declara regularidade jurídica, urbanística, ambiental, registral ou fiscal sem decisão do owner competente.

## 1. Correções de modelagem promovidas pela revisão

| Simplificação anterior | Modelo revisado | Consequência prática |
| --- | --- | --- |
| `matricula: text` no ativo | `RegistryEvidence` + referência registral + revisão + política de revalidação | O número digitado não ganha status de propriedade, ônus ou disponibilidade. |
| `estado` linear do empreendimento | Trilhas paralelas de aquisição/viabilidade, aprovação, registro, infraestrutura e comercialização | O empreendimento pode ter obra em andamento, registro revisado e venda limitada sem contradição. |
| `estado` único do lote | Estado de identidade/registro, alocação, restrição, disponibilidade, compromisso comercial e carteira | Uma garantia ou permuta bloqueia o lote sem apagar o contrato/carteira quando aplicável. |
| `origem` em enum | `AssetOriginInterest`/`PartnerParticipation` plural, datado e documentado | Compra, permuta, aporte e parceria coexistem por gleba, fração ou lote sem misturar direitos. |
| “documentação ok” | Checklist contextual por finalidade, com revisão e efeito de gate | A tela mostra qual prova falta para cadastrar, ofertar, reservar, contratar ou reentrar. |

## 2. Núcleo revisado de entidades

| Entidade | Chave de identidade | Relações e campos indispensáveis | Observação de integridade |
| --- | --- | --- | --- |
| `LandParcel` | ID interno + geometria/referência + município | área, referência registral, titularidade declarada, evidências, análise de restrição e caso de aquisição | Uma gleba pode alimentar vários empreendimentos/fases somente por relação explicitada. |
| `Development` | ID + modalidade declarada + município | glebas, fase, `MunicipalityRuleSet`, trilhas de estado, responsáveis e evidências | Modalidade não é cosmética: loteamento, acesso controlado e condomínio de lotes exigem leitura específica. |
| `DevelopmentLegalRegime` | empreendimento + modalidade + fonte | loteamento/desmembramento/condomínio de lotes/acesso controlado, base documental, ato municipal, partes comuns, infraestrutura e revisão | O regime declarado não substitui aprovação, registro, evidência nem análise jurídica. |
| `DevelopmentPartyRole` | empreendimento + parte + papel + vigência | empreendedor, proprietário, compromissário, parceiro, SPE/SCP, representante, base de atuação, anuência/instrumento | Papel de implantar não prova titularidade nem direito econômico. |
| `RegistryEvidence` | ID + tipo + emissor + data + ativo/projeto | matrícula/certidão, ato/averbação, registro, cartório, arquivo/hash, revisão, escopo, validade operacional | A evidência é imutável; revisão e substituição são novos fatos. |
| `Block` / `Lot` | empreendimento/fase + quadra + número | área, atributos, referência registral, alocação, restrição, disponibilidade, compromisso e carteira | A identidade comercial permanece, mas cada dimensão guarda sua própria história. |
| `AssetOriginInterest` | parte + objeto/fração + natureza + instrumento | compra, permuta financeira/física, aporte, participação; base, condição, vigência, prioridade, entitlement/alocação | Não usar um único `%` sem tipo de base e condição. |
| `Restriction` | objeto + motivo + evidência + intervalo | severidade, escopo, precedente, owner, alçada e decisão de liberação | Restrição não desaparece em edição; baixa é evento novo. |
| `CommercialCommitment` | lote + tipo + titular + intervalo | hold, reserva, proposta, contrato; canal, preço/tabela, expiração, alçada e audit event | Um compromisso ativo bloqueia concorrência conforme a política aplicável. |
| `RescissionCase` | contrato + versão + causa | cálculo, posse, restituição/compensação, evidência, alçadas, checklist de reentrada | Reentrada comercial é consequência aprovada, não simples mudança de status. |

## 3. Estados por dimensão e precedência

### 3.1 Desenvolvimento

| Dimensão | Valores de leitura | Quem atualiza | Precedência de bloqueio |
| --- | --- | --- | --- |
| Aquisição/viabilidade | prospecção, diligência, estudo, decisão pendente, aprovado para avançar, pausado, descartado | Novos negócios | Bloqueia compromisso de capital/configuração comercial quando existir risco crítico sem decisão. |
| Urbanístico/aprovação | diretriz solicitada, diretriz vigente, projeto em elaboração, submetido, aprovado, pendência, caducado | Urbanismo/engenharia | Bloqueia o ato que depender daquela aprovação, sem inferir registro. |
| Modalidade/regime | declarado, documentado, em revisão, divergência | Jurídico/urbanismo | Bloqueia o ato cuja configuração dependa da modalidade, de ato municipal ou de partes comuns confirmadas. |
| Registro | preparação documental, protocolado, exigência, registro evidenciado, em revisão, divergência, cancelado | Jurídico/registro | Sem `registro evidenciado e revisado`, não há elegibilidade de oferta nos casos em que a lei/contrato o exigem. |
| Infraestrutura | planejada, em execução, em aceite, recebida, pendência, encerrada | Engenharia | Afeta marcos, garantias e contrato; não substitui situação registral. |
| Comercial | desenho interno, pré-lançamento permitido, vendas ativas, vendas limitadas, esgotado, encerrado | Gestão comercial | É sempre derivada dos gates acima, tabela e política vigente. |

### 3.2 Lote

| Dimensão | Valores de leitura | Pergunta respondida | Precedência de bloqueio |
| --- | --- | --- | --- |
| Referência/registro | previsto, referência de gleba, matrícula pendente, matriculado, contrato registrado, escritura confirmada | Qual evidência registral existe e o que foi revisado? | Divergência/pêndencia crítica impede finalidade configurada. |
| Alocação | comercial, permutante/parceiro, garantia municipal, área pública/não comercial, outra alocação | A quem/para que o lote está destinado? | Alocação não comercial prevalece sobre disponibilidade geral. |
| Restrição | nenhuma conhecida, pendência registral, garantia, ônus, disputa, ambiental/obra, bloqueio interno | Qual fato impede ou limita o ato? | Restrição impeditiva vigente prevalece até baixa autorizada. |
| Disponibilidade | indisponível, elegível, hold, reservado, contratado, reentrada em revisão | O que o comercial pode fazer agora? | É projeção; não é fonte autônoma de verdade. |
| Compromisso | nenhum, hold, reserva, proposta, contrato, cessão em análise, distrato | Qual vínculo com parte/contrato está vigente? | Compromisso incompatível bloqueia nova alocação. |
| Carteira | sem carteira, agenda ativa, conciliada parcial, atraso, acordo, distrato, quitada, cedida | Que consequência econômica existe? | Não decide disponibilidade isoladamente; participa na reentrada. |

> **Regra de projeção:** `commercial_eligibility = registro_aplicável ∧ alocação_permite ∧ sem_restrição_impeditiva ∧ sem_compromisso_incompatível ∧ tabela_e_alçada_vigentes`. A fórmula é uma política legível e versionada, não um boolean escondido em tela.

## 4. Matriz de razões de restrição

| Código sugerido | Natureza | Evidência mínima | Pode bloquear | Owner de baixa |
| --- | --- | --- | --- | --- |
| `registry_pending` | Registral/documental | certidão/ato + resultado de revisão | oferta, reserva, contrato conforme política | Jurídico/registro. |
| `municipal_guarantee` | Garantia de infraestrutura | instrumento, lotes vinculados, vigência e condição de baixa | oferta/contrato quando aplicável | Engenharia + jurídico + órgão/gestor competente. |
| `partner_allocation` | Alocação econômica/física | instrumento de permuta/parceria, objeto/fração e vigência | disponibilidade comercial geral | Gestão do empreendimento + jurídico. |
| `encumbrance_or_dispute` | Ônus/disputa | evidência registral/jurídica e escopo | ato afetado pela restrição | Jurídico. |
| `reservation_or_contract` | Compromisso comercial | hold/reserva/contrato, expiração, titular e audit event | nova reserva/contrato incompatível | Comercial sob alçada. |
| `rescission_in_progress` | Caso contratual/financeiro | contrato, versão, situação de restituição/compensação e checklist | reentrada/nova venda | Jurídico + financeiro + comercial. |
| `technical_or_environmental_review` | Técnico/ambiental | parecer, protocolo/licença ou condição declarada | finalidade definida pela política | Engenharia/ambiental + jurídico. |

## 5. Modelo de origem e participação

Cada `AssetOriginInterest` carrega uma natureza e uma base explicitamente tipadas.

| Natureza | Objeto elegível | Base possível | Saída esperada | O que não significa |
| --- | --- | --- | --- | --- |
| Aquisição própria | gleba/fração | custo e instrumento de aquisição | custo/compromisso e titularidade declarada | Direito automático a 100% de qualquer receita futura. |
| Permuta física | lote/fração/unidade | alocação física e condição de entrega | `LotAllocation` e restrição de estoque | Payable financeiro automático. |
| Permuta financeira | gleba, contrato ou evento elegível | valor/fluxo definido no instrumento | entitlement/payable conforme condição | Participação societária ou propriedade registrada. |
| Participação sobre VGV | empreendimento/contratos elegíveis | valor contratado definido por política | entitlement datado | Percentual sobre caixa recebido. |
| Participação sobre fluxo | parcelas/settlements elegíveis | caixa conciliado ou base contratual | entitlement condicionado | VGV, lucro ou lote físico. |
| Participação societária | SPE/SCP/empresa | resultado verificado e acordo | distribuição após governança/apuração | Comissão, repasse ou direito imediato sobre cada parcela. |

## 6. Casos de recusa obrigatória

| Tentativa | Resultado esperado |
| --- | --- |
| Marcar lote de parceiro/permutante como disponível sem baixa documentada. | Recusar; abrir/ligar caso de alocação e revisão. |
| Reservar lote com restrição impeditiva, compromisso ativo incompatível ou registro insuficiente para a finalidade. | Recusar com código, razão, owner e evidência que falta. |
| Criar direito econômico sem instrumento, base, vigência e condição. | Recusar; entitlement não nasce de rótulo de parte. |
| Trocar `contratado` por `disponível` após distrato sem `RescissionCase` aprovado. | Recusar; manter reentrada em revisão. |
| Usar indicador municipal vencido ou sem fonte para liberar condição urbanística. | Recusar; solicitar regra local revisada. |

## Referências

[1] [Inventário da revisão de cadastro de loteamentos](crm_cadastro_loteamentos_revisao_inventario.md)

[2] [Evidências prioritárias da revisão](crm_cadastro_loteamentos_revisao_evidencias.md)

[3] [Domínio de loteadora já consolidado](crm_dominio_loteadora.md)
