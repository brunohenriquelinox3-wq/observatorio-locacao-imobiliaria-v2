import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260926040000_domain_archived_party_role_directory_a393.sql"
  ),
  "utf8"
);

describe("A393 — diretório arquivado de participantes", () => {
  it("mantém a leitura contextual paginada fechada por estado arquivado", () => {
    expect(migration).toContain("domain_list_archived_party_role_directory");
    expect(migration).toContain("assignment.state = 'archived'::public.party_lifecycle_state");
    expect(migration).toContain("party.state = 'archived'::public.party_lifecycle_state");
    expect(migration).toContain("assignment.role::text in ('shareholder', 'partner', 'land_contributor')");
    expect(migration).toContain("count(*) over ()::integer");
    expect(migration).toContain("offset v_page_offset");
    expect(migration).toContain("limit v_page_size");
  });

  it("fecha search_path, ACL direta e limite de página", () => {
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("revoke all on function public.domain_list_archived_party_role_directory");
    expect(migration).toContain("grant execute on function public.domain_list_archived_party_role_directory");
    expect(migration).toContain("to service_role");
    expect(migration).toContain("least(coalesce(p_page_size, 25), 500)");
    expect(migration).not.toMatch(/paymentStatus|paidAt|pix|bank|transfer|split|repasse|cobrança/i);
  });
});
