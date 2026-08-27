import { describe, expect, it } from "vitest";
import { validateIdentitySubmission } from "./identityRegistration";

describe("manual Supabase identity registration", () => {
  it("rejects malformed email, short password and mismatched confirmation locally", () => {
    expect(validateIdentitySubmission({ mode: "sign_up", email: "invalido", password: "123456789012", passwordConfirmation: "123456789012" })).toBeTruthy();
    expect(validateIdentitySubmission({ mode: "sign_up", email: "admin@example.test", password: "curta", passwordConfirmation: "curta" })).toBeTruthy();
    expect(validateIdentitySubmission({ mode: "sign_up", email: "admin@example.test", password: "senha-segura-12", passwordConfirmation: "outra-senha-12" })).toBeTruthy();
  });

  it("accepts a valid sign-in or sign-up submission without assigning authority", () => {
    expect(validateIdentitySubmission({ mode: "sign_in", email: "admin@example.test", password: "senha-segura-12", passwordConfirmation: "" })).toBeNull();
    expect(validateIdentitySubmission({ mode: "sign_up", email: "admin@example.test", password: "senha-segura-12", passwordConfirmation: "senha-segura-12" })).toBeNull();
  });
});
