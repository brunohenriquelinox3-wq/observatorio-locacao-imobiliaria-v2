import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  path.resolve(
    process.cwd(),
    "supabase/migrations/20260926010000_subdivision_private_upload_reservation_a390.sql",
  ),
  "utf8",
);

describe("A390 private upload reservation migration", () => {
  it("reserva uma chave opaca única antes da gravação privada", () => {
    expect(source).toContain("create table public.subdivision_private_upload_storage_reservations");
    expect(source).toContain("unique (organization_id, target_kind, target_id)");
    expect(source).toContain("storage_key text not null unique");
    expect(source).toContain("create or replace function public.subdivision_reserve_private_upload_storage");
    expect(source).toContain("return v_storage_key");
  });

  it("preserva isolamento, RLS e execução mínima para a reserva", () => {
    expect(source).toContain("enable row level security");
    expect(source).toContain("revoke all on table public.subdivision_private_upload_storage_reservations from public, anon, authenticated");
    expect(source).toContain("security definer");
    expect(source).toContain("set search_path = ''");
    expect(source).toContain("to service_role");
  });

  it("valida os três alvos e só remove a reserva após metadata registrada", () => {
    expect(source).toContain("'buyer_attachment'");
    expect(source).toContain("'sale_case_document'");
    expect(source).toContain("'development_attachment'");
    expect(source).toContain("private.subdivision_require_private_upload_reservation");
    expect(source.match(/delete from public\.subdivision_private_upload_storage_reservations/g)?.length).toBe(3);
  });

  it("mantém a reserva e os eventos redigidos sem dados privados ou operações financeiras", () => {
    expect(source).toContain("payload_redacted");
    expect(source).not.toMatch(/download_url|original_filename|document_content|payment_status|paid_at|pix|bank|transfer|settle/i);
  });
});
