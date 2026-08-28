import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828005500_rental_agenda_classification_a14.sql"), "utf8");

describe("A14 rental agenda classification migration", () => {
  it("restricts classifications to active internal draft agendas", () => {
    expect(migration).toContain("RENTAL_AGENDA_CLASSIFICATION_STATE_DENIED");
    expect(migration).toContain("agenda.state in ('scheduled', 'rescheduled')");
    expect(migration).toContain("rental_intake_agendas_tenant_match unique (id, organization_id)");
    expect(migration).toContain("context_preparation");
    expect(migration).toContain("internal_follow_up");
  });

  it("keeps classifications contextual, idempotent, redacted and server-only", () => {
    expect(migration).toContain("private.require_rental_pipeline_authority");
    expect(migration).toContain("event.correlation_id = p_correlation_id");
    expect(migration).toContain("internal_code_present");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("to service_role");
  });
});
