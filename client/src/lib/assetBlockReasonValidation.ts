export type AssetBlockReasonValidation =
  | { valid: true; value?: string }
  | { valid: false; message: string };

export function validateAssetBlockReason(value: string, blocked: boolean): AssetBlockReasonValidation {
  const normalized = value.trim().toUpperCase();
  if (!blocked) return { valid: true, value: undefined };
  if (!/^[A-Z][A-Z0-9_]{2,79}$/.test(normalized)) {
    return { valid: false, message: "Informe um motivo em código de 3 a 80 caracteres: letra inicial, letras, números ou sublinhado." };
  }
  return { valid: true, value: normalized };
}
