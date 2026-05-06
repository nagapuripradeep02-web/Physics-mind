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
        pathname.startsWith("/api/test-lesson") ||      // temp: test only
        pathname.startsWith("/api/generate-lesson") ||  // temp: test only
        pathname.startsWith("/test-teacher") ||          // temp: test only
        pathname.startsWith("/test-engines") ||          // dev-only engine integration page
        pathname.startsWith("/admin/test-premium-primitives") || // dev-only premium primitives verification (sessions 56+)
        pathname.startsWith("/admin/test-vector-head-to-tail") || // dev-only Sim 1 verification (session 56)
        pathname.startsWith("/admin/test-friction-static-kinetic") || // dev-only friction verification (sessions 16-17, conceptual + board)
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
