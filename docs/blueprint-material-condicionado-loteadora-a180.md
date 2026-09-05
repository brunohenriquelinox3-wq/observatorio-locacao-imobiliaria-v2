# Blueprint condicionado — contratos e Financeiro da Loteadora A180

**Status:** arquitetura futura não executável.  
**Escopo:** contrato, boleto, cobrança, recebíveis, pagamentos, repasses, obras, fornecedores, marketing e controles associados à Loteadora.  
**Aviso:** este material é uma análise de produto e controles, não aconselhamento jurídico, contábil ou financeiro. Modelos, cálculos, regras de cobrança e fluxos de pagamento exigem validação de profissionais habilitados antes de uso.

## Fundamento de desenho

A Lei nº 6.766/1979 regula o parcelamento do solo urbano e prevê, para o registro de loteamento, elementos como o contrato-padrão de promessa de venda ou cessão. [1] A Lei nº 13.786/2018 inseriu requisitos específicos para contratos de loteamento, incluindo quadro-resumo e informações essenciais ligadas a preço, forma de pagamento, encargos, distrato e prazo de obra. [2] O futuro módulo deve, portanto, organizar versões, aprovações e evidências; ele não pode ser implementado como um simples gerador de texto, planilha de parcelas ou acionador automático de consequências.

O arranjo de boleto é regulado pelo Banco Central e envolve instituições autorizadas, beneficiário, pagador, emissão, apresentação e liquidação. [3] A emissão e a baixa de um boleto são operações externas e materialmente relevantes. A segregação entre autorização, execução, controle e contabilização é um princípio de controle interno que reduz risco de erro e fraude. [4]

> A próxima evolução material não começará no Setor 06. Ela começará por uma camada de **governança, fonte jurídica, identidade de partes, permissão, trilha de aprovação e reconciliação**, sem emitir títulos, cobrar, movimentar recursos ou calcular resultado.

## Mapa de domínios futuros

| Domínio | Responsabilidade futura | Fonte de verdade | Proibido até a liberação específica |
|---|---|---|---|
| Contrato de lote | Organizar versão aprovada, partes, cláusulas aplicáveis, quadro-resumo e trilha de revisão. | Documento jurídico aprovado e registro de revisão. | Gerar contrato definitivo, assinatura, cessão, distrato ou alteração de registro. |
| Obrigação contratual | Representar eventos previstos no contrato aprovado. | Contrato versionado e decisão humana autorizada. | Calcular automaticamente parcelas, juros, correção, multa, saldo ou restituição. |
| Boleto e cobrança | Coordenar referência externa, situação de emissão e retorno de conciliação. | Instituição/provedor habilitado e eventos assinados ou verificáveis. | Emitir, baixar, protestar, notificar ou alterar beneficiário. |
| Recebíveis e repasses | Manter um razão auditável por obrigação, beneficiário e regra contratual aprovada. | Eventos contábeis/financeiros imutáveis e origem conciliada. | Distribuir valor, executar repasse, projetar ganho ou liberar pagamento. |
| Sócios e parceiros | Vincular regra econômica apenas após fonte jurídica revisada. | Contrato/instrumento aprovado e vigência explícita. | Percentual, valor fixo, prioridade, portal de ganhos ou pagamento. |
| Obras e fornecedores | Organizar referência de frente, responsável, documento de contratação e aceite. | Aprovação interna e fonte contratual autorizada. | Ordem de compra, medição, despesa, pagamento ou comprometimento financeiro. |
| Marketing e corretores | Vincular origem de captação e permissão operacional por escopo. | Governança comercial aprovada. | Campanha externa, comunicação, comissão ou repasse. |

## Requisitos de arquitetura antes de qualquer código material

| Camada | Requisito mínimo | Critério de bloqueio |
|---|---|---|
| Modelagem | Separar obrigação, evento de cobrança, evento de pagamento, conciliação e lançamento contábil; nunca usar um único campo de “status financeiro”. | Se houver qualquer campo que represente saldo, valor, parcela ou cálculo sem definição jurídica-contábil validada. |
| Identidade e escopo | Usar organização, loteamento, parte, papel temporal e vigência; validar no servidor em cada operação. | Se o operador puder visualizar ou afetar outra organização, parceiro ou empreendimento pelo front-end. |
| Segregação de deveres | Distinguir preparação, aprovação, emissão, recepção de retorno, conciliação, reversão e auditoria. [4] | Se a mesma alçada puder criar, aprovar, emitir e conciliar o mesmo evento sem controle independente. |
| Idempotência e imutabilidade | Todo evento externo deve ter chave de idempotência, origem, correlação, versão e trilha de reversão compensatória. | Se uma repetição puder duplicar cobrança, pagamento, repasse ou lançamento. |
| Integrações | Adaptadores isolados, segredos exclusivamente no servidor, contrato de provedor, homologação e tratamento de webhook verificável. | Se houver conexão direta do navegador ao provedor ou credencial em cliente. |
| Privacidade | Dados mínimos por finalidade, anexos privados segregados, retenção e acesso por escopo. | Se documento ou identificador pessoal estiver disponível em listagem ampla ou log. |
| Auditoria | Evento redigido com autor, alçada, finalidade, origem, correlação e resultado. | Se logs guardarem contrato, dado pessoal, boleto completo ou segredo. |

## Ordem segura de futuras entregas

1. **Catálogo jurídico-controlado:** tipos de instrumento, versão, responsável jurídico, estado de revisão e evidência de aprovação, sem texto contratual, assinatura ou valores.
2. **Matriz de deveres:** papéis de preparação, aprovação, conferência e auditoria por organização e loteamento, sem conceder alçada financeira automática.
3. **Razão de obrigações em ambiente isolado:** modelagem contábil e financeira validada, sem emissão e sem dados reais; cada lançamento deve ter origem, versão e reversão.
4. **Integração de homologação:** conexão com provedor habilitado em ambiente de testes, com webhooks verificáveis e reconciliação manual assistida.
5. **Piloto material controlado:** somente após parecer jurídico-contábil, contrato de integração, dados autorizados, controles de acesso, plano de incidentes e confirmação humana separada para cada operação externa.

## Critérios de autorização individual

Antes de iniciar qualquer item material, a decisão deverá indicar expressamente o domínio, a organização/ambiente, se haverá dados reais, o responsável jurídico, o responsável contábil, o provedor envolvido quando houver, os perfis de autorização e o procedimento de reversão/incidente. A autorização para desenhar ou testar um domínio não equivale à autorização para emitir boleto, cobrar, pagar, repassar, assinar, publicar ou integrar.

| Ação futura | Decisão necessária antes da execução |
|---|---|
| Registrar contrato real ou anexo jurídico | Modelo e fluxo aprovados pelo jurídico; finalidade e retenção de dados definidas. |
| Calcular obrigação, parcela ou resultado | Regra assinada pelo responsável contábil/jurídico, calendário e política de arredondamento/versionamento definidos. |
| Emitir ou alterar boleto | Provedor habilitado, homologação concluída, beneficiário validado e confirmação explícita por operação. |
| Cobrar ou notificar parte | Política jurídica/comercial aprovada, destinatário e base de contato validados, confirmação de comunicação externa. |
| Executar pagamento ou repasse | Alçadas segregadas, dados de destino verificados, reconciliação e confirmação explícita com valor, destino e consequência. |
| Processar fornecedor ou obra | Processo de contratação/aceite definido, alçada de aprovação e trilha de evidência separadas. |

## Referências

[1]: [Presidência da República — Lei nº 6.766/1979](https://www.planalto.gov.br/ccivil_03/leis/l6766compilado.htm)

[2]: [Presidência da República — Lei nº 13.786/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13786.htm)

[3]: [Banco Central do Brasil — Resolução BCB nº 443/2024](https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=443)

[4]: [CNMP — Segregação de funções: como distribuir atividades](https://www.cnmp.mp.br/portal/institucional/724-institucional/comissoes-institucional/comissao-de-controle-administrativo-e-financeiro/ordenador-de-despesas/recursos-humanos-e-gestao-de-pessoas/5888-segregacao-de-funcoes-como-distribuir-atividades)
