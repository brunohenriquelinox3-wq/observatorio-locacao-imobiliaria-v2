import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828006500_loteadora_operating_context_a16.sql"), "utf8");

describe("A16 loteadora operating context migration", () => {
  it("adds only the explicit module value", () => {
    expect(migration).toContain("add value if not exists 'loteadora'");
    expect(migration).not.toMatch(/insert\s+into|update\s+public\.|grant\s+execute/i);
  });

  it("documents that context alone never grants authority", () => {
    expect(migration).toContain("não concede acesso");
    expect(migration).toContain("membership");
    expect(migration).toContain("grant");
  });
});
