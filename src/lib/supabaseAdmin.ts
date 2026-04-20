/**
 * Supabase singleton client — server-side (API routes).
 * Uses the SERVICE ROLE KEY for unrestricted access behind RLS.
 * Never expose this key to the browser.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
    throw new Error(
        "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
    );
}

// createClient is cheap; a module-level singleton is fine in Next.js edge/node
export const supabaseAdmin = createClient(url, key, {
    auth: { persistSession: false },
});
