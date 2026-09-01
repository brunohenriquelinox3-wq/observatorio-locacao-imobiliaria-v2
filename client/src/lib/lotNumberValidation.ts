export type LotNumberValidation =
  | { valid: true; value: number }
  | { valid: false; message: string };

export function validateLotNumber(value: number): LotNumberValidation {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return { valid: false, message: "Informe um número inteiro de Lote." };
  }

  if (value < 1 || value > 100) {
    return { valid: false, message: "Informe um número de Lote entre 1 e 100." };
  }

  return { valid: true, value };
}
