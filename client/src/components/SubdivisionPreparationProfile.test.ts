import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const component = readFileSync(resolve(import.meta.dirname, "./SubdivisionPreparationProfile.tsx"), "utf8");

describe("SubdivisionPreparationProfile", () => {
  it("keeps reading and mutation fail-closed behind workspace readiness and explicit submit", () => {
    expect(component).toContain("enabled: isWorkspaceReady");
    expect(component).toContain("function saveProfile(event: React.FormEvent<HTMLFormElement>)");
    expect(component).toContain("event.preventDefault()");
    expect(component).toContain("if (!developmentId) return");
    expect(component).toContain("correlationId: crypto.randomUUID()");
  });

  it("keeps the preparation profile separate from material and identifying data", () => {
    expect(component).toContain("Estados internos, decisão humana");
    expect(component).not.toContain('type="file"');
    expect(component).not.toContain("getSupabaseBrowserClient");
    expect(component).not.toContain("new FormData()");
    expect(component).not.toContain("fetch(");
    expect(component).not.toContain("createSaleDraft");
  });
});
