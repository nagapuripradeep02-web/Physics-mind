/**
 * Bulk import script for physics_concept_map table.
 * Usage: npx tsx src/scripts/importConceptMap.ts <path-to-json>
 * Example: npx tsx src/scripts/importConceptMap.ts src/data/concepts/class12_current_electricity.json
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function importConcepts(jsonPath: string) {
  const absPath = resolve(process.cwd(), jsonPath);
  const conceptData = JSON.parse(readFileSync(absPath, "utf-8"));

  if (!Array.isArray(conceptData)) {
    console.error("JSON file must be an array of concept entries");
    process.exit(1);
  }

  console.log(`Importing ${conceptData.length} concepts from ${absPath}...`);

  const { data, error } = await supabase
    .from("physics_concept_map")
    .upsert(conceptData, { onConflict: "concept_id" });

  if (error) {
    console.error("Import failed:", error.message);
    process.exit(1);
  } else {
    console.log(`✅ Successfully imported ${conceptData.length} concepts`);
  }
}

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error("Usage: npx tsx src/scripts/importConceptMap.ts <path-to-json>");
  process.exit(1);
}

importConcepts(jsonPath).catch(err => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
