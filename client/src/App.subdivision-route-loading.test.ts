import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appSource = readFileSync(resolve(import.meta.dirname, "App.tsx"), "utf8");

describe("rota crítica de Clientes Loteadora", () => {
  it("carrega a página setorial estaticamente para não depender de importação tardia", () => {
    expect(appSource).toContain('import SubdivisionFoundation from "./pages/SubdivisionFoundation";');
    expect(appSource).not.toContain('lazy(() => import("./pages/SubdivisionFoundation"))');
    expect(appSource).toContain('<Route path={"/loteadora/clientes"} component={SubdivisionFoundation} />');
  });
});
