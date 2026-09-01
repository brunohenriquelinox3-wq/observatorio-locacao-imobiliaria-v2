import { describe, expect, it } from "vitest";
import {
  allFoundationCommandsBlocked,
  canLoadAdministrativeState,
  canLoadIdentityState,
  getPlatformCommandState,
  platformCommands,
} from "./platformAdmin";

describe("platform admin foundation", () => {
  it("keeps every sensitive command blocked before the controlled RPC layer exists", () => {
    expect(allFoundationCommandsBlocked()).toBe(true);

    for (const command of platformCommands) {
      const state = getPlatformCommandState(command);
      expect(state.enabled).toBe(false);
      expect(state.reason.length).toBeGreaterThan(20);
    }
  });

  it("does not expor ativação de bootstrap como ação disponível de UI", () => {
    expect(getPlatformCommandState("activateBootstrap")).toMatchObject({
      enabled: false,
      label: "Preparar principal inicial",
    });
  });

  it("descreve o provisionamento como um comando governado já disponível", () => {
    expect(getPlatformCommandState("provisionOrganization").reason).toContain("comando governado está disponível");
  });

  it("does not call protected administrative endpoints before the session and local admin gate are present", () => {
    expect(canLoadIdentityState(false)).toBe(false);
    expect(canLoadIdentityState(true)).toBe(true);
    expect(canLoadAdministrativeState(false, "admin")).toBe(false);
    expect(canLoadAdministrativeState(true, "user")).toBe(false);
    expect(canLoadAdministrativeState(true, "admin")).toBe(true);
  });
});
