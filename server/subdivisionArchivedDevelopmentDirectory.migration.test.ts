import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260926020000_subdivision_archived_development_directory_a391.sql"),
  "utf8",
);

describe("A391 — Loteamentos Arquivados", () => {
  it("expõe somente uma leitura agregada de empreendimentos arquivados", () => {
    expect(migration).toContain("subdivision_list_archived_developments");
    expect(migration).toContain("development.state = 'archived'");
    expect(migration).toContain("archived_block_count");
    expect(migration).toContain("archived_lot_count");
    expect(migration).toContain("order by development.updated_at desc, development.id asc");
    expect(migration).not.toMatch(/insert\s+into|update\s+public\.|delete\s+from/i);
  });

  it("preserva a fronteira de segurança server-side", () => {
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("private.require_active_subdivision_draft_authority");
    expect(migration).toContain("revoke all on function");
    expect(migration).toContain("grant execute on function");
    expect(migration).not.toMatch(/paymentStatus|paidAt|pix|split|transfer|repasse|cobrança externa/i);
  });
});
