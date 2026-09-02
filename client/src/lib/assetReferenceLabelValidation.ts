export type AssetReferenceLabelValidation = { valid: true; value: string } | { valid: false; message: string };

export function validateAssetReferenceLabel(value: string): AssetReferenceLabelValidation {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length < 2 || normalized.length > 160) return { valid: false, message: "Informe uma referência de trabalho entre 2 e 160 caracteres." };
  return { valid: true, value: normalized };
}
