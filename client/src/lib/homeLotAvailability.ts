export type HomeLotAvailabilityState =
  | "context_required"
  | "loading"
  | "ready"
  | "empty"
  | "unavailable";

type StructureQuery = {
  isLoading: boolean;
  isError: boolean;
  data?: readonly {
    lots: readonly { lotId: string | null }[];
  }[];
};

type CommercialState = { lotId: string };

export type HomeLotAvailabilitySummary = {
  state: HomeLotAvailabilityState;
  totalLots: number | null;
  availableLots: number | null;
};

export function summarizeHomeLotAvailability(input: {
  contextLoading: boolean;
  contextError: boolean;
  contextReady: boolean;
  developmentsLoading: boolean;
  developmentsError: boolean;
  developmentCount: number;
  structureQueries: readonly StructureQuery[];
  commercialStatesLoading: boolean;
  commercialStatesError: boolean;
  commercialStates?: readonly CommercialState[];
}): HomeLotAvailabilitySummary {
  if (input.contextError || input.developmentsError || input.commercialStatesError || input.structureQueries.some(query => query.isError)) {
    return { state: "unavailable", totalLots: null, availableLots: null };
  }

  if (
    input.contextLoading ||
    input.developmentsLoading ||
    input.commercialStatesLoading ||
    input.structureQueries.some(query => query.isLoading)
  ) {
    return { state: "loading", totalLots: null, availableLots: null };
  }

  if (!input.contextReady) {
    return { state: "context_required", totalLots: null, availableLots: null };
  }

  if (input.developmentCount === 0) {
    return { state: "empty", totalLots: 0, availableLots: 0 };
  }

  const lots = input.structureQueries.flatMap(query =>
    (query.data ?? []).flatMap(block => block.lots),
  );
  const lotIds = lots.map(lot => lot.lotId);

  // A missing identity makes the aggregate unsafe: do not infer availability.
  if (lotIds.some(lotId => !lotId)) {
    return { state: "unavailable", totalLots: null, availableLots: null };
  }

  const uniqueLotIds = new Set(lotIds as string[]);
  const restrictedLotIds = new Set(
    (input.commercialStates ?? [])
      .map(state => state.lotId)
      .filter(lotId => uniqueLotIds.has(lotId)),
  );
  const totalLots = uniqueLotIds.size;
  const availableLots = Math.max(0, totalLots - restrictedLotIds.size);

  return {
    state: totalLots > 0 ? "ready" : "empty",
    totalLots,
    availableLots,
  };
}

export function homeLotAvailabilityLabel(state: HomeLotAvailabilityState): string {
  switch (state) {
    case "ready":
      return "Leitura pronta";
    case "empty":
      return "Nenhum lote no contexto";
    case "loading":
      return "Consultando estoque";
    case "unavailable":
      return "Leitura não confirmada";
    case "context_required":
    default:
      return "Contexto necessário";
  }
}
