import { describe, expect, it } from "vitest";
import { genericRecoveryNotice, toMfaQrImageSource, validateTotpCode } from "./identityMfa";

describe("manual MFA identity helpers", () => {
  it("accepts only a short numeric TOTP code", () => {
    expect(validateTotpCode("123456")).toBeNull();
    expect(validateTotpCode(" 12345678 ")).toBeNull();
    expect(validateTotpCode("12345")).toBeTruthy();
    expect(validateTotpCode("12ab56")).toBeTruthy();
  });

  it("keeps data URLs and safely encodes raw SVG QR payloads", () => {
    expect(toMfaQrImageSource("data:image/svg+xml,qr")).toBe("data:image/svg+xml,qr");
    expect(toMfaQrImageSource("<svg />")).toContain("data:image/svg+xml;charset=utf-8,");
    expect(genericRecoveryNotice).not.toContain("encontrada");
  });
});
