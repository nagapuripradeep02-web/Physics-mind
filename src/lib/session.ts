/**
 * Session ID management — now backed by Supabase auth.
 *
 * Returns the authenticated user's UUID from Supabase auth.
 * If no user is authenticated, returns an empty string.
 */

import { supabaseBrowser } from "./supabaseBrowser";

/**
 * Returns the authenticated user's session ID (their Supabase auth UID).
 * If not authenticated, returns an empty string.
 */
export async function getSessionId(): Promise<string> {
    const { data: { user } } = await supabaseBrowser.auth.getUser();
    return user?.id ?? "";
}
