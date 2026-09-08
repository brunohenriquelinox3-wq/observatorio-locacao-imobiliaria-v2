const temporaryPreviewSuffix = ".manus.computer";

export function resolvePublishedGoogleOAuthRedirect(origin: string, destination: string): string | null {
  let parsedOrigin: URL;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    return null;
  }

  const host = parsedOrigin.hostname.toLowerCase();
  const isTemporaryPreview = host.endsWith(temporaryPreviewSuffix) || host === "localhost" || host === "127.0.0.1";
  if (parsedOrigin.protocol !== "https:" || isTemporaryPreview) return null;

  const callback = new URL("/entrar", parsedOrigin.origin);
  callback.searchParams.set("proximo", destination);
  return callback.toString();
}
