import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828002000_rental_pipeline_foundation_a8.sql"), "utf8");
const readMigration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828002500_rental_pipeline_read_a8_1.sql"), "utf8");

describe("A8 rental pipeline migration", () => {
  it("keeps administration and tenant intake distinct, contextual and draft-only", () => {
    expect(migration).toContain("create type public.rental_journey_kind as enum ('management_interest', 'tenant_interest')");
    expect(migration).toContain("p_module <> 'locacao'::public.operating_module");
    expect(migration).toContain("state public.party_lifecycle_state not null default 'draft'");
    expect(migration).toContain("Sem contrato de administração, contrato de locação, garantia, cobrança, repasse");
  });

  it("applies RLS, correlation idempotency and server-only execution", () => {
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("event.correlation_id = p_correlation_id");
    expect(migration).toContain("grant execute on function public.rental_create_draft_intake");
    expect(migration).toContain("to service_role");
    expect(migration).toContain("revoke all on function public.rental_create_draft_agenda");
  });

  it("keeps the A8.1 list contextual, minimized and exclusive to the service role", () => {
    expect(readMigration).toContain("private.require_rental_pipeline_authority");
    expect(readMigration).toContain("where intake.organization_id = p_organization_id and intake.state = 'draft'");
    expect(readMigration).toContain("revoke all on function public.rental_list_draft_intakes");
    expect(readMigration).toContain("to service_role");
  });
});
