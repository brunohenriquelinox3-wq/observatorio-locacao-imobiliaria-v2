import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("../supabase/migrations/20260905014000_workforce_active_organization_guard_a190.sql", import.meta.url),
  "utf8",
);

describe("A190 — isolamento de organização demonstrativa", () => {
  it("restringe a solicitação de equipe a organização ativa", () => {
    expect(migration).toContain("organization.state = 'active'");
    expect(migration).not.toContain("organization.state in ('draft', 'active')");
  });

  it("revalida o estado ativo antes de preparar ou aceitar uma delegação", () => {
    expect(migration).toContain("private.require_active_workforce_organization(v_request.organization_id)");
    expect(migration).toContain("organization.id = v_request.organization_id and organization.state = 'active'");
  });

  it("preserva a negação por policy e não introduz convite ou ativação automática", () => {
    expect(migration).toContain("WORKFORCE_ORGANIZATION_DENIED");
    expect(migration).toContain("errcode = '42501'");
    expect(migration).not.toContain("send_email");
    expect(migration).not.toContain("password");
  });
});
