import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Deleting caches for ohms_law...");
  const del1 = await supabase.from("simulation_cache").delete().like("fingerprint_key", "%ohms_law%");
  console.log("Simulations deleted:", del1.error ? del1.error : "success");
  
  const del2 = await supabase.from("response_cache").delete().like("fingerprint_key", "%ohms_law%");
  console.log("Responses deleted:", del2.error ? del2.error : "success");
  
  const del3 = await supabase.from("lesson_cache").delete().like("fingerprint_key", "%ohms_law%");
  console.log("Lessons deleted:", del3.error ? del3.error : "success");
}
main();
