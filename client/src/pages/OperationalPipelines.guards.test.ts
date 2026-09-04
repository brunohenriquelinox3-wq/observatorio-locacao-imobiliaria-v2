import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = (name: "UrbanPipeline" | "RentalPipeline") =>
  readFileSync(resolve(process.cwd(), `client/src/pages/${name}.tsx`), "utf8");

describe("guardas das jornadas operacionais", () => {
  it("mantém Vendas Urbanas dependente de sessão, contexto e submissões explícitas", () => {
    const urban = page("UrbanPipeline");

    expect(urban).toContain("const enabled = isAuthenticated && contextReady");
    expect(urban).toContain("listDraftLeads.useQuery(context, { enabled, retry: false })");
    expect(urban).toContain("listDraftAgendas.useQuery(context, { enabled, retry: false })");
    expect(urban).toContain("function createLead(event: React.FormEvent<HTMLFormElement>)");
    expect(urban).toContain("function createAgenda(event: React.FormEvent<HTMLFormElement>)");
    expect(urban).toContain("createLeadMutation.mutate({ ...context, correlationId: crypto.randomUUID()");
    expect(urban).toContain("agendaMutation.mutate({ ...context, correlationId: crypto.randomUUID()");
  });

  it("mantém Locação dependente de sessão, contexto e submissões explícitas", () => {
    const rental = page("RentalPipeline");

    expect(rental).toContain("const isWorkspaceReady = isAuthenticated && isContextReady");
    expect(rental).toContain("listDraftIntakes.useQuery(context, { enabled: isWorkspaceReady, retry: false })");
    expect(rental).toContain("listDraftAgendas.useQuery(context, { enabled: isWorkspaceReady, retry: false })");
    expect(rental).toContain("function createIntake(event: React.FormEvent<HTMLFormElement>)");
    expect(rental).toContain("function createAgenda(event: React.FormEvent<HTMLFormElement>)");
    expect(rental).toContain("createMutation.mutate({ ...context, correlationId: crypto.randomUUID()");
    expect(rental).toContain("agendaMutation.mutate({ ...context, correlationId: crypto.randomUUID()");
  });

  it("mantém propostas, contratos, garantias e financeiro como setores bloqueados", () => {
    const urban = page("UrbanPipeline");
    const rental = page("RentalPipeline");

    expect(urban).toContain('activeUrbanSector === "proposals" || activeUrbanSector === "finance"');
    expect(urban).toContain("Propostas, reservas e contratos ainda não estão liberados.");
    expect(urban).not.toContain("createDraftProposal.useMutation");
    expect(rental).toContain('activeRentalSector === "contracts" || activeRentalSector === "finance"');
    expect(rental).toContain("Contratos e garantias ainda não estão liberados.");
    expect(rental).not.toContain("createDraftContract.useMutation");
    expect(rental).not.toContain("createFinancialEntry.useMutation");
  });
});
