import { describe, expect, it } from "vitest";
import { getSidebarWidthAfterKeyboardCommand } from "./dashboardSidebarResize";

const limits = { minWidth: 200, maxWidth: 480 };

describe("redimensionamento acessível da sidebar", () => {
  it("ajusta a largura com as setas dentro dos limites", () => {
    expect(getSidebarWidthAfterKeyboardCommand({ currentWidth: 280, key: "ArrowLeft", ...limits })).toBe(264);
    expect(getSidebarWidthAfterKeyboardCommand({ currentWidth: 280, key: "ArrowRight", ...limits })).toBe(296);
  });

  it("respeita os limites e oferece atalhos para mínimo e máximo", () => {
    expect(getSidebarWidthAfterKeyboardCommand({ currentWidth: 200, key: "ArrowLeft", ...limits })).toBe(200);
    expect(getSidebarWidthAfterKeyboardCommand({ currentWidth: 480, key: "ArrowRight", ...limits })).toBe(480);
    expect(getSidebarWidthAfterKeyboardCommand({ currentWidth: 328, key: "Home", ...limits })).toBe(200);
    expect(getSidebarWidthAfterKeyboardCommand({ currentWidth: 328, key: "End", ...limits })).toBe(480);
  });

  it("não altera a largura para teclas que não pertencem ao controle", () => {
    expect(getSidebarWidthAfterKeyboardCommand({ currentWidth: 280, key: "Enter", ...limits })).toBeNull();
  });
});
