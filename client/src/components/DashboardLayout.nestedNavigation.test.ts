import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const layout = readFileSync(resolve(import.meta.dirname, "DashboardLayout.tsx"), "utf8");

describe("navegação aninhada da sidebar", () => {
  it("mantém as três colunas e seus setores em uma estrutura de submenu", () => {
    expect(layout).toContain("columnSidebarIcons");
    expect(layout).toContain("SidebarMenuSub");
    expect(layout).toContain("Coluna ${group.label}");
    expect(layout).toContain("Setores de ${group.label}");
  });

  it("bloqueia a coluna e os setores quando não há item autorizado", () => {
    expect(layout).toContain("const isGroupDisabled = !firstAvailableItem");
    expect(layout).toContain("disabled={isGroupDisabled}");
    expect(layout).toContain("disabled={item.disabled}");
  });
});
