import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("bootstrap da sessão", () => {
  it("não invalida toda a cache de consultas a cada evento do provedor", () => {
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(source).toContain("createSupabaseSessionBridge(getSupabaseBrowserClient());");
    expect(source).not.toContain("createSupabaseSessionBridge(getSupabaseBrowserClient(), () =>");
    expect(source).not.toContain("queryClient.invalidateQueries();");
  });
});
