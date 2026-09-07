import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { getSupabaseAdminClient } from "./supabase";

export async function handleSubdivisionInternalReceivableAlertSchedule(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron_only" });
    const { data, error } = await getSupabaseAdminClient().rpc("subdivision_run_internal_receivable_alerts", { p_schedule_cron_task_uid: user.taskUid });
    if (error || !data || typeof data !== "object" || Array.isArray(data)) throw new Error("SUBDIVISION_RECEIVABLE_ALERT_SCHEDULE_DENIED");
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: "SUBDIVISION_RECEIVABLE_ALERT_SCHEDULE_DENIED", context: { path: req.path }, timestamp: new Date().toISOString() });
  }
}
