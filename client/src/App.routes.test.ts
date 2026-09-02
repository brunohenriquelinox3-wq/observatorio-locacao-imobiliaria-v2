import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("rotas da aplicação", () => {
  it("mantém o caminho compatível do Núcleo de Cadastros", () => {
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

    expect(appSource).toContain('<Route path={"/cadastros"} component={DomainFoundation} />');
  });
});
