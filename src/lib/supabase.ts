import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);

// Node-only helper (for seed scripts). Do NOT import in browser code.
export function createServerClient(serviceKey: string) {
  const nodeProcess = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
  const url = nodeProcess?.env?.VITE_SUPABASE_URL;
  if (!url) {
    throw new Error('VITE_SUPABASE_URL must be set in the Node environment.');
  }
  return createClient(url, serviceKey);
}
