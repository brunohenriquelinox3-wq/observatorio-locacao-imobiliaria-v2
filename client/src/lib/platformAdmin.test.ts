import { describe, expect, it } from "vitest";
import { allFoundationCommandsBlocked, getPlatformCommandState, platformCommands } from "./platformAdmin";

describe("platform admin foundation", () => {
  it("keeps every sensitive command blocked before the controlled RPC layer exists", () => {
    expect(allFoundationCommandsBlocked()).toBe(true);

    for (const command of platformCommands) {
      const state = getPlatformCommandState(command);
      expect(state.enabled).toBe(false);
      expect(state.reason.length).toBeGreaterThan(20);
    }
  });

  it("does not expose bootstrap activation as an available UI action", () => {
    expect(getPlatformCommandState("activateBootstrap")).toMatchObject({
      enabled: false,
      label: "Ativar principal inicial",
    });
  });
});
