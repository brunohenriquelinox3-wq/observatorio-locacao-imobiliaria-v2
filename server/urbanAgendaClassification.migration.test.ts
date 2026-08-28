import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828006000_urban_agenda_classification_a15.sql"), "utf8");

describe("A15 urban agenda classification migration", () => {
  it("restricts classifications to active internal draft agendas", () => {
    expect(migration).toContain("URBAN_AGENDA_CLASSIFICATION_STATE_DENIED");
    expect(migration).toContain("agenda.state in ('scheduled', 'rescheduled')");
    expect(migration).toContain("urban_lead_agendas_tenant_match unique (id, organization_id)");
    expect(migration).toContain("context_preparation");
  });

  it("keeps classifications contextual, idempotent, redacted and server-only", () => {
    expect(migration).toContain("private.require_urban_pipeline_authority");
    expect(migration).toContain("event.correlation_id = p_correlation_id");
    expect(migration).toContain("internal_code_present");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("to service_role");
  });
});
