export type SupabasePasswordFlow = "invite" | "recovery";

export function supabasePasswordFlowFromFragment(hash: string): SupabasePasswordFlow | null {
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const type = params.get("type");
  return Boolean(params.get("access_token")) && (type === "invite" || type === "recovery") ? type : null;
}

export function activationPathForPasswordFlow(hash: string): string | null {
  return supabasePasswordFlowFromFragment(hash) ? `/ativar-conta${hash}` : null;
}
