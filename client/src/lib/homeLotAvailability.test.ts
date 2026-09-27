import { describe, expect, it } from "vitest";
import { homeLotAvailabilityLabel, summarizeHomeLotAvailability } from "./homeLotAvailability";

const baseInput = {
  contextLoading: false,
  contextError: false,
  contextReady: true,
  developmentsLoading: false,
  developmentsError: false,
  developmentCount: 1,
  structureQueries: [
    {
      isLoading: false,
      isError: false,
      data: [{ lots: [{ lotId: "lot-1" }, { lotId: "lot-2" }, { lotId: "lot-3" }] }],
    },
  ],
  commercialStatesLoading: false,
  commercialStatesError: false,
  commercialStates: [{ lotId: "lot-2" }],
} as const;

describe("resumo de disponibilidade da entrada", () => {
  it("conta somente lotes únicos sem estado comercial restritivo", () => {
    expect(summarizeHomeLotAvailability(baseInput)).toEqual({
      state: "ready",
      totalLots: 3,
      availableLots: 2,
    });
  });

  it("não infere disponibilidade enquanto o contexto ou leitura está pendente", () => {
    expect(summarizeHomeLotAvailability({ ...baseInput, contextReady: false })).toMatchObject({ state: "context_required", totalLots: null });
    expect(summarizeHomeLotAvailability({ ...baseInput, developmentsLoading: true })).toMatchObject({ state: "loading", availableLots: null });
  });

  it("fecha a leitura quando uma query falha ou não devolve identidade do lote", () => {
    expect(summarizeHomeLotAvailability({ ...baseInput, structureQueries: [{ isLoading: false, isError: true }] })).toMatchObject({ state: "unavailable", totalLots: null });
    expect(summarizeHomeLotAvailability({ ...baseInput, structureQueries: [{ isLoading: false, isError: false, data: [{ lots: [{ lotId: null }] }] }] })).toMatchObject({ state: "unavailable", availableLots: null });
  });

  it("classifica contexto sem empreendimentos como vazio, sem fabricar estoque", () => {
    expect(summarizeHomeLotAvailability({ ...baseInput, developmentCount: 0, structureQueries: [], commercialStates: [] })).toEqual({ state: "empty", totalLots: 0, availableLots: 0 });
    expect(homeLotAvailabilityLabel("unavailable")).toBe("Leitura não confirmada");
  });
});
