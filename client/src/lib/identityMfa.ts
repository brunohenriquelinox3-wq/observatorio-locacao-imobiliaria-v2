export function validateTotpCode(code: string): string | null {
  return /^\d{6,8}$/.test(code.trim()) ? null : "Informe o código numérico do autenticador.";
}

export function toMfaQrImageSource(qrCode: string): string {
  return qrCode.startsWith("data:") ? qrCode : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrCode)}`;
}

export const genericRecoveryNotice = "Se a identidade existir, as instruções de recuperação serão enviadas pelo provedor.";
