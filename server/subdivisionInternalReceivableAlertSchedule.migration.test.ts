import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
const source = readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907240000_subdivision_internal_receivable_alerts_a297.sql"), "utf8");
describe("A297 alertas internos de recebíveis", () => {
  it("usa idempotência diária, configuração desativada e identificação segura do agendamento", () => { expect(source).toContain("schedule_cron_task_uid varchar(65)"); expect(source).toContain("enabled boolean not null default false"); expect(source).toContain("attention_date"); expect(source).toContain("on conflict (organization_id, receivable_schedule_id, alert_kind, attention_date) do nothing"); });
  it("não emite boleto, não cobra, não envia mensagem e não registra pagamento", () => { expect(source).toContain("Não emite boleto, não cobra, não envia mensagens e não infere pagamento."); expect(source).not.toContain("webhook"); expect(source).not.toContain("payment_status"); expect(source).not.toContain("send_email"); });
});
