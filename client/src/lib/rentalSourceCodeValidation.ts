export type RentalSourceCodeValidation = { valid: true; value: string } | { valid: false; message: string };

export function validateRentalSourceCode(value: string): RentalSourceCodeValidation {
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9_]{2,79}$/.test(normalized)) {
    return { valid: false, message: "Use um código de 3 a 80 caracteres: letra inicial, letras, números ou sublinhado." };
  }
  return { valid: true, value: normalized };
}
