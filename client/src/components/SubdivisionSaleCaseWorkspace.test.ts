import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

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
    expect(source).toContain("Número de parcelas");
    expect(source).toContain("Primeiro vencimento");
    expect(source).toContain("não cria recebíveis, boletos ou calendário financeiro");
    expect(source).toContain("Valores ficam em centavos no servidor");
  });

  it("valida parcelamento no cliente antes de chamar o servidor", () => {
    expect(source).toContain("installmentQuantity > 0");
    expect(source).toContain("Revise os valores em reais e a quantidade de parcelas.");
    expect(source).toContain("Para parcelamento, informe valor, primeira data e dia de vencimento.");
  });
});
