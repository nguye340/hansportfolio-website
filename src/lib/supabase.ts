import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);

// Node-only helper (for seed scripts). Do NOT import in browser code.
export function createServerClient(serviceKey: string) {
  return createClient(process.env.VITE_SUPABASE_URL as string, serviceKey);
}
