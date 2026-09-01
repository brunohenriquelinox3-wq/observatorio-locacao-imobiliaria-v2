export type DraftPartyRolePeriodValidation =
  | { valid: true }
  | { valid: false; message: string };

export function validateDraftPartyRolePeriod(beginsAt: string, endsAt: string): DraftPartyRolePeriodValidation {
  if (!beginsAt || !endsAt) return { valid: true };

  const beginsAtTime = Date.parse(beginsAt);
  const endsAtTime = Date.parse(endsAt);

  if (!Number.isFinite(beginsAtTime) || !Number.isFinite(endsAtTime)) {
    return { valid: false, message: "Informe datas e horários válidos para a vigência do papel." };
  }

  if (endsAtTime < beginsAtTime) {
    return { valid: false, message: "O fim da vigência não pode ser anterior ao início." };
  }

  return { valid: true };
}
