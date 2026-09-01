export const keyboardSidebarResizeStep = 16;

export function getSidebarWidthAfterKeyboardCommand({
  currentWidth,
  key,
  minWidth,
  maxWidth,
}: {
  currentWidth: number;
  key: string;
  minWidth: number;
  maxWidth: number;
}): number | null {
  if (key === "ArrowLeft") return Math.max(minWidth, currentWidth - keyboardSidebarResizeStep);
  if (key === "ArrowRight") return Math.min(maxWidth, currentWidth + keyboardSidebarResizeStep);
  if (key === "Home") return minWidth;
  if (key === "End") return maxWidth;
  return null;
}
