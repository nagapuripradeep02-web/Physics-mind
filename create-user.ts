import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'testbot@example.com',
    password: 'password123',
    email_confirm: true
  });
  
  if (error) {
    console.error("Error creating user:", error.message);
  } else {
    console.log("Created user successfully:", data.user.email);
  }
}
main();
