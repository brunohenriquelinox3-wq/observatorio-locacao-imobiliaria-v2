export type UrbanPreferenceCodeValidation =
  | { valid: true; value?: string }
  | { valid: false; message: string };

export function validateUrbanPreferenceCode(value: string): UrbanPreferenceCodeValidation {
  const normalized = value.trim().toUpperCase();
  if (!normalized) return { valid: true, value: undefined };
  if (!/^[A-Z][A-Z0-9_]{2,79}$/.test(normalized)) {
    return { valid: false, message: "Use um código de 3 a 80 caracteres: letra inicial, letras, números ou sublinhado." };
  }
  return { valid: true, value: normalized };
}
