import { describe, expect, it } from "vitest";
import { buildTransientOauthUser } from "./sdk";

describe("identidade transitória do OAuth", () => {
  it("mantém papel mínimo e não depende da tabela auxiliar de usuários", () => {
    const now = new Date("2026-08-28T00:00:00.000Z");
    const user = buildTransientOauthUser({ openId: "synthetic-open-id", name: "Synthetic", email: "synthetic@example.test", loginMethod: "oauth" }, now);
    expect(user).toMatchObject({ id: 0, openId: "synthetic-open-id", role: "user" });
    expect(user.lastSignedIn).toEqual(now);
  });

  it("rejeita identidade sem identificador do provedor", () => {
    expect(() => buildTransientOauthUser({ openId: "", name: "Synthetic" }, new Date())).toThrow("missing openId");
  });
});
