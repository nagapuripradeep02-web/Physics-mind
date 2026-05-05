"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Sigma, Bookmark, MessageSquareText } from "lucide-react";

const NAV_ITEMS = [
    { href: "/learn", label: "Learn", Icon: BookOpen, hint: "Catalog of physics concepts" },
    { href: "/solve", label: "Solve", Icon: Sigma, hint: "Upload a problem to solve" },
] as const;

export default function TopNav() {
    const pathname = usePathname();

    return (
        <header className="shrink-0 bg-zinc-950 border-b border-zinc-800">
            <div className="max-w-6xl mx-auto px-4 h-12 flex items-center gap-3">
                <Link href="/learn" className="flex items-center gap-2 text-zinc-100 font-bold tracking-tight text-sm">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-600/20 border border-blue-500/40 text-blue-300">
                        <BookOpen className="w-3.5 h-3.5" />
                    </span>
                    PhysicsMind
                </Link>

                <nav className="flex items-center gap-1 ml-2">
                    {NAV_ITEMS.map(({ href, label, Icon, hint }) => {
                        const isActive = pathname === href || pathname.startsWith(`${href}/`);
                        return (
                            <Link
                                key={href}
                                href={href}
                                title={hint}
                                aria-current={isActive ? "page" : undefined}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${isActive
                                    ? "bg-zinc-800 text-zinc-100"
                                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="ml-auto flex items-center gap-1">
                    <Link
                        href="/bookmarks"
                        title="Bookmarks"
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                    >
                        <Bookmark className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/chat"
                        title="Open free-form chat (legacy)"
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
                    >
                        <MessageSquareText className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
