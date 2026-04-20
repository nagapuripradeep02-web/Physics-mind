import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearCaches() {
  console.log("Clearing caches for standing_waves and projectile_motion...");
  
  // Clear lesson_cache
  const { data: d1, error: e1 } = await supabase
    .from('lesson_cache')
    .delete()
    .or('fingerprint_key.like.%standing_waves%,fingerprint_key.like.%projectile_motion%');
    
  if (e1) console.error("Error clearing lesson_cache:", e1);
  else console.log("Cleared lesson_cache entries:", d1 || "Success");

  // Clear response_cache (fingerprint contains the concept_id)
  const { data: d2, error: e2 } = await supabase
    .from('response_cache')
    .delete()
    .or('fingerprint_key.like.%standing_waves%,fingerprint_key.like.%projectile_motion%');
    
  if (e2) console.error("Error clearing response_cache:", e2);
  else console.log("Cleared response_cache entries:", d2 || "Success");
}

clearCaches();
