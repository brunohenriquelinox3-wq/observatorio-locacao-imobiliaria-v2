import { describe, expect, it, vi } from "vitest";
import { handleSubdivisionInternalReceivableAlertSchedule } from "./subdivisionInternalReceivableAlertSchedule";
describe("endpoint periódico de alertas internos", () => {
  it("recusa chamadas que não sejam de cron", async () => { const response = { status: vi.fn().mockReturnThis(), json: vi.fn() }; await handleSubdivisionInternalReceivableAlertSchedule({ path: "/api/scheduled/subdivision-internal-receivable-attention" } as never, response as never); expect(response.status).toHaveBeenCalledWith(500); });
  it("não consome corpo para definir o agendamento", () => { expect(handleSubdivisionInternalReceivableAlertSchedule.toString()).toContain("user.taskUid"); expect(handleSubdivisionInternalReceivableAlertSchedule.toString()).not.toContain("req.body"); });
});
