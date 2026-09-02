export type SubdivisionReferenceValidation = { valid: true; value: string } | { valid: false; message: string };

export function validateSubdivisionReference(value: string): SubdivisionReferenceValidation {
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9_]{2,79}$/.test(normalized)) return { valid: false, message: "Use de 3 a 80 caracteres: letra inicial, letras, números ou sublinhado." };
  return { valid: true, value: normalized };
}
