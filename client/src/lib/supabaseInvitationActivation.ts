export function isSupabaseInviteFragment(hash: string): boolean {
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  return params.get("type") === "invite" && Boolean(params.get("access_token"));
}

export function activationPathForInvite(hash: string): string | null {
  return isSupabaseInviteFragment(hash) ? `/ativar-conta${hash}` : null;
}
