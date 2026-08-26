import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const netlifyConfig = readFileSync(resolve(projectRoot, "netlify.toml"), "utf8");
const staticRedirects = readFileSync(resolve(projectRoot, "client", "public", "_redirects"), "utf8");

describe("preparação Netlify", () => {
  it("envia API e storage à Function antes do fallback da SPA", () => {
    const apiRedirect = netlifyConfig.indexOf('from = "/api/*"');
    const storageRedirect = netlifyConfig.indexOf('from = "/manus-storage/*"');
    const spaRedirect = netlifyConfig.indexOf('from = "/*"');

    expect(apiRedirect).toBeGreaterThanOrEqual(0);
    expect(storageRedirect).toBeGreaterThan(apiRedirect);
    expect(spaRedirect).toBeGreaterThan(storageRedirect);
  });

  it("não armazena chaves de Supabase ou valores secretos no arquivo de deploy", () => {
    expect(netlifyConfig).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY\s*=/);
    expect(netlifyConfig).not.toMatch(/sb_secret_/);
    expect(netlifyConfig).not.toMatch(/sb_publishable_/);
  });

  it("inclui fallback SPA no pacote estático de prévia", () => {
    expect(staticRedirects.trim()).toBe("/* /index.html 200");
  });
});
