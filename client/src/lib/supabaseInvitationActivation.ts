export type SupabasePasswordFlow = "invite" | "recovery";
export const supabasePasswordFlowStorageKey = "crm.supabase-password-flow";

export function supabasePasswordFlowFromFragment(hash: string): SupabasePasswordFlow | null {
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const type = params.get("type");
  return Boolean(params.get("access_token")) && (type === "invite" || type === "recovery") ? type : null;
}

export function activationPathForPasswordFlow(hash: string): string | null {
  return supabasePasswordFlowFromFragment(hash) ? `/ativar-conta${hash}` : null;
}

export function passwordFlowForActivation(hash: string, storedFlow: string | null): SupabasePasswordFlow | null {
  return supabasePasswordFlowFromFragment(hash) ?? (storedFlow === "invite" || storedFlow === "recovery" ? storedFlow : null);
}

export function recoveryStateAfterAssurance(flow: SupabasePasswordFlow | null, currentLevel: string | null, hasVerifiedTotp: boolean): "ready" | "mfa_required" | "missing" {
  if (flow !== "recovery") return "ready";
  if (currentLevel === "aal2") return "ready";
  return hasVerifiedTotp ? "mfa_required" : "missing";
}
