import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, service);

async function main() {
  const json = JSON.parse(await fs.readFile("scripts/seed-data.json","utf8"));
  for (const p of json) {
    const { data, error } = await supabase.from("projects").upsert(p).select().single();
    if (error) throw error;
    console.log("Upserted:", data.slug);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
