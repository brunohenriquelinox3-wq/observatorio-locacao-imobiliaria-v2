# Contrato A18 — Quadra matriz em loteamento de rascunho

## Finalidade

O A18 acrescenta a **Quadra** como matriz organizacional de um loteamento em rascunho. A identificação visível é derivada de um número positivo, por exemplo, **Quadra 1**, **Quadra 12**. A quadra não contém lotes neste corte.

| Elemento | Regra A18 | Limite explícito |
|---|---|---|
| Vínculo | Cada quadra pertence a um loteamento em rascunho da mesma organização. | Não cruza contexto, loteamento ou organização. |
| Numeração | Inteiro de 1 a 999, único por loteamento. | Não usa nome livre, localização, mapa ou coordenada. |
| Estado | Sempre `draft` no corte. | Não cria lançamento, estoque ou disponibilidade. |
| Leitura | Retorna somente IDs técnicos, número da quadra e criação. | Não retorna lotes, clientes, parceiros, valores, documentos ou contratos. |

> A nomenclatura **Quadra N** permanece a matriz. O limite futuro de até 100 lotes por quadra será aplicado somente quando o setor separado de Estoque/Mapa de Lotes for especificado e passar pelos seus próprios gates.

## Controle

As operações exigem o módulo `loteadora`, a organização e a finalidade explícitos, além de identidade, membership, grant e vigência verificados no servidor. A criação é idempotente por correlação, auditada com payload redigido e executável somente por `service_role`.
