import { describe, expect, it, vi } from "vitest";
import { manageSubdivisionInternalReceivableAlertSchedule } from "./subdivisionInternalReceivableAlertScheduleManagement";
const context={organizationId:"00000000-0000-4000-8000-000000000002",module:"loteadora" as const,purposeCode:"SUBDIVISION_SALE_PREPARATION",correlationId:"00000000-0000-4000-8000-000000000004"};
describe("gestão do cron interno",()=>{it("não cria cron sem a sessão do operador",async()=>{await expect(manageSubdivisionInternalReceivableAlertSchedule("00000000-0000-4000-8000-000000000001",{...context,action:"activate"},undefined,{rpc:vi.fn()} as never)).rejects.toThrow("SUBDIVISION_SCHEDULE_SESSION_REQUIRED");});});
