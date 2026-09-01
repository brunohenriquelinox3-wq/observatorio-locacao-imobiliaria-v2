export type SubdivisionBlockNumberValidation =
  | { valid: true; value: number }
  | { valid: false; message: string };

export function validateSubdivisionBlockNumber(value: number): SubdivisionBlockNumberValidation {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return { valid: false, message: "Informe um número inteiro de Quadra." };
  }

  if (value < 1 || value > 999) {
    return { valid: false, message: "Informe um número de Quadra entre 1 e 999." };
  }

  return { valid: true, value };
}
