import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
const source=readFileSync(path.resolve(process.cwd(),"supabase/migrations/20260908003000_subdivision_sale_case_private_upload_a300.sql"),"utf8");
describe("A300 upload privado do dossiê comercial",()=>{it("protege sessão, contexto e metadata antes da escrita",()=>{expect(source).toContain("private.require_active_subdivision_draft_authority");expect(source).toContain("private_upload_recorded");expect(source).toContain("to service_role");});it("não oferece conteúdo ou operações externas",()=>{expect(source).toContain("não retorna URL, nome, conteúdo ou download");expect(source).not.toContain("send_email");expect(source).not.toContain("payment_status");expect(source).not.toContain("webhook");});});
