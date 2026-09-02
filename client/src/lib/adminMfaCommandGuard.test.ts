import { describe, expect, it } from "vitest";
import { getMfaAttestedCommandState } from "./adminMfaCommandGuard";

describe("mfa-attested administrative command gate", () => {
  it("blocks a command before the administrative console is available", () => {
    expect(getMfaAttestedCommandState({ consoleAvailable: false, sessionMfaVerified: true })).toMatchObject({
      allowed: false,
      title: "Console indisponível",
    });
  });

  it("blocks a command when MFA was not verified in the current session", () => {
    expect(getMfaAttestedCommandState({ consoleAvailable: true, sessionMfaVerified: false })).toMatchObject({
      allowed: false,
      title: "Verifique MFA nesta sessão",
    });
  });

  it("allows only a locally attested MFA session to request server validation", () => {
    expect(getMfaAttestedCommandState({ consoleAvailable: true, sessionMfaVerified: true })).toMatchObject({
      allowed: true,
    });
  });
});
