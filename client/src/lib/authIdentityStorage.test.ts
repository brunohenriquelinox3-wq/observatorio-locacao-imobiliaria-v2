import { describe, expect, it, vi } from "vitest";
import {
  clearLegacyAuthIdentityMirror,
  LEGACY_AUTH_IDENTITY_MIRROR_KEY,
} from "./authIdentityStorage";

describe("privacidade de identidade no navegador", () => {
  it("remove somente o espelhamento legado de identidade", () => {
    const storage = { removeItem: vi.fn() };

    clearLegacyAuthIdentityMirror(storage);

    expect(storage.removeItem).toHaveBeenCalledTimes(1);
    expect(storage.removeItem).toHaveBeenCalledWith(LEGACY_AUTH_IDENTITY_MIRROR_KEY);
  });
});
