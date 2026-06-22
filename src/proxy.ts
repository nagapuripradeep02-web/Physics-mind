import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (toSet) => {
                    toSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({ request });
                    toSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: getUser() also refreshes the access token if expired
    const { data: { user } } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isPublic =
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/generate-lesson") ||  // temp: test only
        pathname.startsWith("/test-engines") ||          // dev-only engine integration page
        pathname.startsWith("/admin/test-premium-primitives") || // dev-only premium primitives verification (sessions 56+)
        pathname.startsWith("/admin/test-vector-head-to-tail") || // dev-only Sim 1 verification (session 56)
        pathname.startsWith("/admin/test-friction-static-kinetic") || // dev-only friction verification (sessions 16-17, conceptual + board)
        pathname.startsWith("/admin/test-newton-second-law-direction") || // dev-only Sim 2 verification (session 59)
        pathname.startsWith("/admin/test-magnetic-field-wire") || // dev-only Sim 3 verification (session 60, first field_3d / Three.js concept)
        pathname.startsWith("/admin/test-magnetic-force-moving-charge") || // dev-only Diamond #2 verification (M1, Lorentz force F = qv × B)
        pathname.startsWith("/admin/test-torque-on-current-loop-in-field") || // dev-only Diamond #3 verification (M2, τ = μ × B on a current loop)
        pathname.startsWith("/admin/test-magnetic-field-solenoid") || // dev-only Diamond #4 verification (M3, B = μ₀nI inside a solenoid)
        pathname.startsWith("/admin/test-biot-savart-law") || // dev-only Biot-Savart verification (archetype A meta, dB = μ₀I(dl×r̂)/4πr²)
        pathname.startsWith("/voice-professor") ||       // dev/demo: voice professor demo page (Session 73 backend-first build)
        pathname.startsWith("/api/voice-professor") ||   // dev/demo: voice professor generative brain (Sonnet)
        pathname.startsWith("/api/voice/") ||            // dev/demo: Sarvam STT/TTS proxies
        pathname.startsWith("/api/test-") ||             // temp: test-only API
        pathname.startsWith("/data/concepts") ||
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico";

    if (!user && !isPublic) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (user && pathname === "/login") {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
