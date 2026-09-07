import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migration = readFileSync(
  resolve(import.meta.dirname, '../supabase/migrations/20260907183000_subdivision_buyer_client_profile_privilege_hardening_a285.sql'),
  'utf8',
);

describe('A285 — privilégio da ficha cadastral', () => {
  it('revoga a execução direta e mantém somente o papel de serviço', () => {
    expect(migration).toContain('revoke all on function public.subdivision_get_draft_buyer_client_profile');
    expect(migration).toContain('from public, anon, authenticated');
    expect(migration).toContain('grant execute on function public.subdivision_get_draft_buyer_client_profile');
    expect(migration).toContain('to service_role');
  });
});
