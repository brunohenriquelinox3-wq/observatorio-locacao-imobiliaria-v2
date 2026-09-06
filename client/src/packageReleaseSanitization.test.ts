import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("saneamento do empacotador", () => {
  it("mantém redatores distintos para endpoints com barras literais e escapadas", async () => {
    const source = await readFile(resolve(import.meta.dirname, "../../scripts/package-release.mjs"), "utf8");
    expect((source.match(/REDACTED_PLATFORM_ENDPOINT/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(source).toContain("REDACTED_PLATFORM_HOST_PATTERN");
    expect(source).toContain("supabase");
  });
});
