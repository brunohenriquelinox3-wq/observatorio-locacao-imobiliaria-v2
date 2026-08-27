import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

let supabaseAdmin: SupabaseClient | null = null;

/**
 * Cliente estritamente server-side para a fundação administrativa. A chave
 * secreta jamais deve ser importada pelo cliente web ou retornada em respostas.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (supabaseAdmin) return supabaseAdmin;

  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVER_CONFIGURATION_MISSING");
  }

  supabaseAdmin = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return supabaseAdmin;
}
