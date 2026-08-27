import { describe, expect, it } from "vitest";
import { deriveAdministrativeConsoleState } from "./adminConsole";

describe("administrative console gate", () => {
  it("keeps organization and membership forms unavailable without identity, principal and MFA", () => {
    expect(deriveAdministrativeConsoleState()).toMatchObject({ isCommandFormAvailable: false, title: "Conecte a identidade" });
    expect(deriveAdministrativeConsoleState({ identityState: "principal_absent", commandMode: "bootstrap_pending" })).toMatchObject({ isCommandFormAvailable: false, title: "Prepare o bootstrap" });
    expect(deriveAdministrativeConsoleState({ identityState: "pending_activation", mfaVerified: false, commandMode: "blocked" })).toMatchObject({ isCommandFormAvailable: false, title: "Conclua MFA" });
  });

  it("only exposes submit-capable forms after the server reports a controlled command mode", () => {
    expect(deriveAdministrativeConsoleState({ identityState: "active", mfaVerified: true, commandMode: "blocked" }).isCommandFormAvailable).toBe(false);
    expect(deriveAdministrativeConsoleState({ identityState: "active", mfaVerified: true, commandMode: "ready_for_controlled_commands" })).toMatchObject({ isCommandFormAvailable: true, title: "Console liberada por política" });
  });

  it("does not confuse a pending bootstrap with a command-ready principal", () => {
    expect(deriveAdministrativeConsoleState({ identityState: "pending_activation", mfaVerified: true, commandMode: "blocked" })).toMatchObject({
      isCommandFormAvailable: false,
      title: "Alçada ainda bloqueada",
    });
  });
});
