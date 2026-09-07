import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildMonthlyDueDates, deriveEqualInstallmentCents, deriveEqualInstallmentFromResidualCents } from "./SubdivisionSaleCaseWorkspace";

const source = readFileSync(path.resolve(process.cwd(), "client/src/components/SubdivisionSaleCaseWorkspace.tsx"), "utf8");

describe("SubdivisionSaleCaseWorkspace", () => {
  it("reúne lote, CPF/CNPJ declarado e cliente antes de abrir uma preparação", () => {
    expect(source).toContain("CPF/CNPJ declarado");
    expect(source).toContain("Localizar cadastro");
    expect(source).toContain("Cadastrar novo Cliente Loteadora");
    expect(source).toContain("Abrir caso em preparação");
  });

  it("mantém termos negociáveis separados de cobrança, boleto e pagamento", () => {
    expect(source).toContain("Valor negociado (R$)");
    expect(source).toContain("Modalidade principal");
    expect(source).toContain("Parcelas de entrada");
    expect(source).toContain("Parcelas regulares");
    expect(source).toContain("Primeiro vencimento regular");
    expect(source).toContain("Crédito de bem entregue (R$)");
    expect(source).toContain("não cria recebíveis, boletos ou calendário financeiro");
    expect(source).toContain("Valores ficam em centavos no servidor");
    expect(source).toContain("Preparar lembretes internos");
    expect(source).toContain("Ativar lembrete diário interno");
    expect(source).toContain("Pausar lembrete interno");
    expect(source).toContain("Não há boleto, código de barras, remessa, pagamento, baixa ou comunicação externa");
  });

  it("valida parcelamento no cliente antes de chamar o servidor", () => {
    expect(source).toContain("installmentQuantity > 0");
    expect(source).toContain("Revise os valores em reais e a quantidade de parcelas.");
    expect(source).toContain("Para parcelamento, informe valor, primeira data e dia de vencimento.");
  });

  it("permite proponentes conjuntos e exige uma composição financeira conciliada", () => {
    expect(source).toContain("Proponentes da venda conjunta");
    expect(source).toContain("Adicionar proponente");
    expect(source).toContain("Remover");
    expect(source).toContain("Todos os componentes precisam compor exatamente o valor negociado, sem saldo residual.");
    expect(source).toContain("O dia de vencimento deve corresponder à primeira data");
    expect(source).toContain("Composição da negociação");
  });

  it("calcula parcelas iguais e projeta vencimentos mensais com ajuste para meses menores", () => {
    expect(deriveEqualInstallmentCents(12000000, 0, 200)).toBe(60000);
    expect(deriveEqualInstallmentCents(1000, 0, 3)).toBeNull();
    expect(deriveEqualInstallmentFromResidualCents(360000, 100000, 2)).toBe(130000);
    expect(deriveEqualInstallmentFromResidualCents(1000, 0, 3)).toBeNull();
    expect(buildMonthlyDueDates("2026-01-31", 31, 3)).toEqual(["2026-01-31", "2026-02-28", "2026-03-31"]);
  });
});
