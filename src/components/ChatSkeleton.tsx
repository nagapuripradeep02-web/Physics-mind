"use client";

/** Pulsing skeleton shown while a chat session is loading from Supabase */
export default function ChatSkeleton() {
    return (
        <div className="flex-1 px-6 py-8 space-y-5 animate-pulse">
            {/* Assistant message placeholder */}
            <div className="space-y-2">
                <div className="h-10 w-3/4 bg-zinc-800/70 rounded-2xl" />
                <div className="h-4 w-2/3 bg-zinc-800/50 rounded-xl" />
                <div className="h-4 w-1/2 bg-zinc-800/40 rounded-xl" />
            </div>
            {/* User message placeholder (right-aligned) */}
            <div className="flex justify-end">
                <div className="h-8 w-2/5 bg-zinc-700/50 rounded-2xl" />
            </div>
            {/* Assistant message placeholder */}
            <div className="space-y-2">
                <div className="h-10 w-4/5 bg-zinc-800/70 rounded-2xl" />
                <div className="h-4 w-3/5 bg-zinc-800/50 rounded-xl" />
                <div className="h-4 w-2/5 bg-zinc-800/40 rounded-xl" />
                <div className="h-4 w-3/4 bg-zinc-800/30 rounded-xl" />
            </div>
            <div className="flex justify-center pt-4">
                <p className="text-[12px] text-zinc-700 animate-pulse">Loading conversation...</p>
            </div>
        </div>
    );
}
