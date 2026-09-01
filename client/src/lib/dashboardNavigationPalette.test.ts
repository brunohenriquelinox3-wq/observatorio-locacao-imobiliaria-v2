import { describe, expect, it } from "vitest";
import { isNavigationPaletteShortcut } from "./dashboardNavigationPalette";

describe("atalho da paleta de navegação", () => {
  it("aceita Command+K e Control+K", () => {
    expect(isNavigationPaletteShortcut({ key: "k", metaKey: true, ctrlKey: false })).toBe(true);
    expect(isNavigationPaletteShortcut({ key: "K", metaKey: false, ctrlKey: true })).toBe(true);
  });

  it("não abre a paleta para combinações ou teclas não relacionadas", () => {
    expect(isNavigationPaletteShortcut({ key: "k", metaKey: false, ctrlKey: false })).toBe(false);
    expect(isNavigationPaletteShortcut({ key: "p", metaKey: true, ctrlKey: false })).toBe(false);
  });
});
