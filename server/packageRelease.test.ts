import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("release package exclusions", () => {
  it("excludes environment and project configuration files from source ZIPs", async () => {
    const source = await readFile(new URL("../scripts/package-release.mjs", import.meta.url), "utf8");

    expect(source).toContain('".project-config.json"');
    expect(source).toContain('!basename.startsWith(".env")');
    expect(source).toContain("excludedFiles.has(basename)");
  });

  it("accepts an explicit safe release tag instead of silently reusing an older label", async () => {
    const source = await readFile(new URL("../scripts/package-release.mjs", import.meta.url), "utf8");

    expect(source).toContain('process.argv.indexOf("--tag")');
    expect(source).toContain("RELEASE_LABEL_INVALID");
    expect(source).toContain("^[a-z0-9]+(?:-[a-z0-9]+)*$");
  });

  it("redacts injected Supabase and database runtime values from standalone HTML", async () => {
    const source = await readFile(new URL("../scripts/package-release.mjs", import.meta.url), "utf8");

    expect(source).toContain("function redactRuntimeValues");
    expect(source).toContain("REDACTED_SUPABASE_CREDENTIAL");
    expect(source).toContain("REDACTED_DATABASE_URL");
    expect(source).toContain("REDACTED_SUPABASE_URL");
  });
});
