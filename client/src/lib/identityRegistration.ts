export type IdentityFormMode = "sign_in" | "sign_up";

export function validateIdentitySubmission(input: {
  mode: IdentityFormMode;
  email: string;
  password: string;
  passwordConfirmation: string;
}): string | null {
  if (!/^\S+@\S+\.\S+$/.test(input.email.trim())) return "Informe um e-mail válido.";
  if (input.password.length < 12) return "Use uma senha com pelo menos 12 caracteres.";
  if (input.mode === "sign_up" && input.password !== input.passwordConfirmation) {
    return "A confirmação de senha não corresponde.";
  }
  return null;
}
