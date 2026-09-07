import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260907190000_subdivision_buyer_client_readiness_operational_a286.sql"), "utf8");

describe("A286 — prontidão operacional de Cliente Loteadora", () => {
	it("mantém autoridade, paginação e uma projeção mínima sem e-mail ou documento", () => {
		expect(migration).toContain("private.require_subdivision_draft_authority");
		expect(migration).toContain("limit p_page_size offset p_page_offset");
		expect(migration).toContain("primary_phone text");
		expect(migration).toContain("messaging_phone text");
		expect(migration).not.toContain("primary_email text");
		expect(migration).not.toContain("document_reference text");
		expect(migration).toContain("from public, anon, authenticated");
		expect(migration).toContain("to service_role");
	});
});
