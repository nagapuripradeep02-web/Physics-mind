"use client";

/** Formats text for WhatsApp sharing and opens the native share dialog or copies to clipboard. */
export function shareViaWhatsApp(topic: string, content: string) {
    const preview = content.split("\n").slice(0, 3).join("\n");
    const text = `📚 *PhysicsMind explains ${topic}:*\n\n${preview}\n\n_...understand physics better at PhysicsMind.app_`;
    const isMobile = /android|iphone|ipad/i.test(navigator.userAgent);
    if (isMobile) {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    } else {
        navigator.clipboard.writeText(text).catch(() => { });
        // optional: show a toast (handled by caller)
    }
    return text;
}
