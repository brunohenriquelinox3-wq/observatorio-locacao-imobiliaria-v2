export function isNavigationPaletteShortcut({
  key,
  metaKey,
  ctrlKey,
}: {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
}): boolean {
  return key.toLowerCase() === "k" && (metaKey || ctrlKey);
}
