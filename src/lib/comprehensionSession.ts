/**
 * Comprehension Metric — anonymous session_id helper.
 *
 * Persists a UUID in localStorage so the same browser/user gets the same
 * session_id across visits until they clear browser data. Falls back to a
 * generated UUID if localStorage is unavailable.
 *
 * Used by:
 *  - TeacherPlayer for state_interaction_log writes
 *  - ComprehensionMCQOverlay for comprehension_attempt writes
 *
 * Spec: physics-mind/docs/COMPREHENSION_METRIC.md §8.1 (privacy) + §6 (overlay UX)
 */

const STORAGE_KEY = "pm_comprehension_session_id";
const MCQ_DONE_KEY_PREFIX = "pm_comprehension_mcq_done:";

/**
 * Returns the persistent anonymous session_id for this browser.
 * Generates + persists a new UUID on first call.
 */
export function getComprehensionSessionId(): string {
    if (typeof window === "undefined") {
        // SSR fallback: ephemeral UUID. Will be replaced on hydration.
        return crypto.randomUUID();
    }
    try {
        const existing = window.localStorage.getItem(STORAGE_KEY);
        if (existing && isValidUUID(existing)) return existing;
        const fresh = crypto.randomUUID();
        window.localStorage.setItem(STORAGE_KEY, fresh);
        return fresh;
    } catch {
        return crypto.randomUUID();
    }
}

function isValidUUID(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Returns true if the student has already attempted (or skipped) the MCQ for
 * this concept in this browser session (sessionStorage, cleared on tab close).
 * Prevents re-prompting when the student replays the same sim.
 */
export function hasMCQBeenShown(conceptId: string): boolean {
    if (typeof window === "undefined") return false;
    try {
        return window.sessionStorage.getItem(MCQ_DONE_KEY_PREFIX + conceptId) === "1";
    } catch {
        return false;
    }
}

/**
 * Marks the MCQ as shown for this concept in this browser session.
 * Called after the student answers all questions OR explicitly skips.
 */
export function markMCQShown(conceptId: string): void {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.setItem(MCQ_DONE_KEY_PREFIX + conceptId, "1");
    } catch {
        // sessionStorage unavailable — silently no-op
    }
}

/**
 * Best-effort device + network classification for state_interaction_log.
 * Helps Phase-2 analytics segment Indian Class 11/12 mobile-on-4G usage.
 */
export function detectDeviceContext(): {
    device_class: "mobile" | "tablet" | "desktop";
    network_type: string | null;
} {
    if (typeof window === "undefined") {
        return { device_class: "desktop", network_type: null };
    }
    const ua = window.navigator.userAgent.toLowerCase();
    let device_class: "mobile" | "tablet" | "desktop" = "desktop";
    if (/ipad|tablet/.test(ua)) device_class = "tablet";
    else if (/iphone|android.*mobile|blackberry|phone/.test(ua)) device_class = "mobile";

    // NetworkInformation API is non-standard; only Chrome/Edge mobile.
    type NavigatorWithConn = Navigator & {
        connection?: { effectiveType?: string };
    };
    const nav = window.navigator as NavigatorWithConn;
    const network_type = nav.connection?.effectiveType ?? null;

    return { device_class, network_type };
}
