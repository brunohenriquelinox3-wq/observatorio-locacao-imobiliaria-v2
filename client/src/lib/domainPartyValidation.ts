export type DraftPartyNameValidation =
  | { valid: true; normalizedValue: string }
  | { valid: false; message: string };

const MIN_DISPLAY_NAME_LENGTH = 2;
const MAX_DISPLAY_NAME_LENGTH = 160;

export function validateDraftPartyDisplayName(value: string): DraftPartyNameValidation {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return { valid: false, message: "Informe o nome de exibição necessário ao rascunho." };
  }

  if (normalizedValue.length < MIN_DISPLAY_NAME_LENGTH) {
    return { valid: false, message: "Use pelo menos 2 caracteres no nome de exibição." };
  }

  if (normalizedValue.length > MAX_DISPLAY_NAME_LENGTH) {
    return { valid: false, message: "Use no máximo 160 caracteres no nome de exibição." };
  }

  return { valid: true, normalizedValue };
}
