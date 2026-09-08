import { describe, expect, it } from "vitest";
import { resolvePublishedGoogleOAuthRedirect } from "./supabaseOAuthRedirect";

describe("resolvePublishedGoogleOAuthRedirect", () => {
  it("monta o retorno interno somente para origem HTTPS publicada", () => {
    expect(resolvePublishedGoogleOAuthRedirect("https://crm.exemplo.com", "/acesso-equipe")).toBe("https://crm.exemplo.com/entrar?proximo=%2Facesso-equipe");
  });

  it("recusa prévias temporárias, origens locais, HTTP e origem inválida", () => {
    expect(resolvePublishedGoogleOAuthRedirect("https://3000-abc.manus.computer", "/")).toBeNull();
    expect(resolvePublishedGoogleOAuthRedirect("http://localhost:3000", "/")).toBeNull();
    expect(resolvePublishedGoogleOAuthRedirect("http://crm.exemplo.com", "/")).toBeNull();
    expect(resolvePublishedGoogleOAuthRedirect("não-é-uma-origem", "/")).toBeNull();
  });
});
