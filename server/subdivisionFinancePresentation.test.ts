import { describe, expect, it } from "vitest";
import {
  formatSubdivisionFinanceLineageStage,
  formatSubdivisionFinanceParticipantRole,
  formatSubdivisionFinanceSaleState,
} from "./subdivisionFinancePresentation";

describe("subdivisionFinancePresentation", () => {
  it("traduz papéis previstos para a linguagem operacional", () => {
    expect(formatSubdivisionFinanceParticipantRole("land_contributor")).toBe(
      "Cedente de terra"
    );
    expect(formatSubdivisionFinanceParticipantRole("partner")).toBe(
      "Parceiro"
    );
  });

  it("não expõe um papel interno desconhecido", () => {
    expect(formatSubdivisionFinanceParticipantRole("future_internal_role")).toBe(
      "Papel do participante não informado"
    );
  });

  it("traduz a situação conhecida da venda e redige valores desconhecidos", () => {
    expect(formatSubdivisionFinanceSaleState("preparation")).toBe(
      "Venda em preparação"
    );
    expect(formatSubdivisionFinanceSaleState("unexpected_state")).toBe(
      "Situação da venda não informada nesta leitura"
    );
  });

  it("traduz etapas da origem sem expor os nomes do DTO", () => {
    expect(formatSubdivisionFinanceLineageStage("item_nominal")).toBe(
      "Item nominal"
    );
    expect(formatSubdivisionFinanceLineageStage("unknown_stage")).toBe(
      "Etapa não informada"
    );
  });
});
