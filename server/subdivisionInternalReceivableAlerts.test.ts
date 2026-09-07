import { describe, expect, it, vi } from "vitest";
import { configureSubdivisionInternalReceivableAlerts } from "./subdivisionInternalReceivableAlerts";
describe("configuração de lembretes internos", () => {
  it("persiste o prazo de atenção sem ativar cron, cobrança ou comunicação", async () => { const rpc = vi.fn().mockResolvedValue({ data: { configuration_id: "00000000-0000-4000-8000-000000000004", lead_days: 4, enabled: false, schedule_bound: false }, error: null }); await expect(configureSubdivisionInternalReceivableAlerts("00000000-0000-4000-8000-000000000001", { organizationId: "00000000-0000-4000-8000-000000000002", module: "loteadora", purposeCode: "subdivision_sale_preparation", correlationId: "00000000-0000-4000-8000-000000000003", leadDays: 4 }, { rpc })).resolves.toMatchObject({ leadDays: 4, enabled: false }); expect(rpc).toHaveBeenCalledWith("subdivision_configure_internal_receivable_alerts", expect.objectContaining({ p_lead_days: 4 })); });
});
