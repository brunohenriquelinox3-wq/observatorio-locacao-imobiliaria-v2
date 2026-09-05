import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("migração A209 de restauração de Quadras arquivadas", () => {
  it("mantém a restauração contextual, idempotente e sem criação de Lotes", async () => {
    const migration = await readFile(new URL("../supabase/migrations/20260906193000_subdivision_restore_archived_blocks_a209.sql", import.meta.url), "utf8");
    expect(migration).toContain("security definer set search_path = ''");
    expect(migration).toContain("require_active_subdivision_draft_authority");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("subdivision_restore_draft_block_v1");
    expect(migration).toContain("restored_lot_count");
    expect(migration).toContain("revoke all on function");
    expect(migration).toContain("grant execute on function");
    expect(migration).not.toContain("insert into public.subdivision_lots");
  });
});
