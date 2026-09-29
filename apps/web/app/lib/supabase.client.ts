// `.client` modules are excluded from the build-time (prerender) bundle:
// Supabase is only ever used in the browser.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readSupabaseConfig } from "./env";

let client: SupabaseClient | undefined;

/** Lazily creates the browser Supabase client. Throws ConfigError when not configured. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    const { url, publishableKey } = readSupabaseConfig(import.meta.env);
    client = createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Staff sign in with email + password only; tokens never arrive via URL.
        detectSessionInUrl: false,
        storageKey: "ming-admin-auth",
      },
    });
  }
  return client;
}
