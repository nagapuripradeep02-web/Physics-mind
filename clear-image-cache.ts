import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Clear ALL image_context_cache entries that were tagged as ohms_law
  // These may be mis-classified mechanics/other concept images
  console.log("Clearing image_context_cache entries with concept_id='ohms_law'...");
  const del = await supabase
    .from("image_context_cache")
    .delete()
    .eq("concept_id", "ohms_law");
  console.log("image_context_cache cleared:", del.error ? del.error.message : `success (${del.count ?? 'unknown'} rows)`);

  // Also list what remains so we can verify
  const { data, error } = await supabase
    .from("image_context_cache")
    .select("id, concept_id, phash_16, source_type, vision_confidence")
    .order("first_seen", { ascending: false })
    .limit(10);
  if (error) {
    console.error("Error listing cache:", error.message);
  } else {
    console.log("\nRemaining image_context_cache entries (last 10):");
    data?.forEach(r => console.log(` - [${r.concept_id}] phash=${r.phash_16} confidence=${r.vision_confidence}`));
  }
}
main();
