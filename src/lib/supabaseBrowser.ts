/**
 * Supabase singleton client — browser-side (React components).
 * Uses SSR-aware client so auth cookies are handled correctly across SSR and client renders.
 * Uses only the ANON PUBLIC KEY; service-role key is never sent here.
 */
import { createBrowserClient } from "@supabase/ssr";

export const supabaseBrowser = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
