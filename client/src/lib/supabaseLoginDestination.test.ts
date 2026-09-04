import { describe, expect, it } from "vitest";
import {
  defaultSupabaseLoginDestination,
  resolveSupabaseLoginDestination,
  supabaseLoginErrorMessage,
} from "./supabaseLoginDestination";

describe("destino seguro do login Supabase", () => {
  it("aceita somente rotas internas operacionais conhecidas", () => {
    expect(resolveSupabaseLoginDestination("/locacao/perfil-busca")).toBe("/locacao/perfil-busca");
    expect(resolveSupabaseLoginDestination("/vendas-urbanas?origem=login")).toBe("/vendas-urbanas?origem=login");
  });

  it("recusa retorno externo, ambíguo ou não reconhecido", () => {
    expect(resolveSupabaseLoginDestination("https://exemplo.invalid")).toBe(defaultSupabaseLoginDestination);
    expect(resolveSupabaseLoginDestination("//exemplo.invalid")).toBe(defaultSupabaseLoginDestination);
    expect(resolveSupabaseLoginDestination("/outra-area")).toBe(defaultSupabaseLoginDestination);
    expect(resolveSupabaseLoginDestination(null)).toBe(defaultSupabaseLoginDestination);
  });

  it("mantém a mensagem de erro genérica", () => {
    expect(supabaseLoginErrorMessage()).toBe("Não foi possível validar esta sessão de contexto. Confira os dados e tente novamente.");
  });
});
