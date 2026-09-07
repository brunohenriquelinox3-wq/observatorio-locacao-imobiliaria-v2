import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(resolve(import.meta.dirname, "App.tsx"), "utf8");

describe("rotas de Clientes Loteadora", () => {
  it("encaminha a ficha compatível à mesma área protegida antes da rota geral de clientes", () => {
    const profileRoute = appSource.indexOf('<Route path={"/loteadora/clientes/ficha"} component={SubdivisionFoundation} />');
    const clientsRoute = appSource.indexOf('<Route path={"/loteadora/clientes"} component={SubdivisionFoundation} />');

    expect(profileRoute).toBeGreaterThan(-1);
    expect(clientsRoute).toBeGreaterThan(profileRoute);
  });
});
