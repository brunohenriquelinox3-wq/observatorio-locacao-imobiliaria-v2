import { describe, expect, it } from "vitest";
import { organizationAdminModuleLabel, organizationAdminModuleState } from "./organizationAdminPresentation";

describe("organization admin presentation", () => {
  it("keeps unavailable context distinct from an authorized empty module", () => {
    expect(organizationAdminModuleState({ loading: false, denied: false, contextCount: 1 })).toBe("available");
    expect(organizationAdminModuleState({ loading: false, denied: false, contextCount: 0 })).toBe("empty");
    expect(organizationAdminModuleState({ loading: false, denied: true })).toBe("restricted");
  });

  it("uses operational labels without inventing records", () => {
    expect(organizationAdminModuleLabel("available")).toBe("Pronto para operar");
    expect(organizationAdminModuleLabel("empty")).toBe("Sem contexto liberado");
  });
});
