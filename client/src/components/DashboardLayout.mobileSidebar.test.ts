import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const componentsRoot = resolve(import.meta.dirname);
const readComponent = (file: string) => readFileSync(resolve(componentsRoot, file), "utf8");

describe("superfície móvel da sidebar", () => {
  it("mantém o painel móvel opaco e acima da sobreposição", () => {
    const sidebar = readComponent("ui/sidebar.tsx");

    expect(sidebar).toContain("!z-[60]");
    expect(sidebar).toContain("!bg-[#092733]");
    expect(sidebar).toContain("!opacity-100");
  });

  it("mantém a lista setorial com rolagem contida", () => {
    expect(readComponent("DashboardLayout.tsx")).toContain("overflow-y-auto overscroll-contain");
  });
});
