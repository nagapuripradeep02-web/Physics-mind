"use client";

import { CheckCircle2, XCircle } from "lucide-react";

interface MisconceptionVerifyCardProps {
    mvsPhrase: string;
    onResponse: (response: "YES" | "NO") => void;
    disabled?: boolean;
}

export default function MisconceptionVerifyCard({
    mvsPhrase,
    onResponse,
    disabled = false,
}: MisconceptionVerifyCardProps) {
    return (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 my-2 max-w-[88%] mr-auto text-left">
            <h4 className="text-[13px] font-semibold text-amber-500 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Wait, let me check something...
            </h4>
            <p className="text-[13px] text-zinc-300 leading-relaxed mb-4">
                {mvsPhrase}
            </p>
            <div className="flex gap-3">
                <button
                    onClick={() => onResponse("YES")}
                    disabled={disabled}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-[12px] font-medium transition-colors disabled:opacity-50"
                >
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Yes, exactly
                </button>
                <button
                    onClick={() => onResponse("NO")}
                    disabled={disabled}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-[12px] font-medium transition-colors disabled:opacity-50"
                >
                    <XCircle className="w-4 h-4 text-zinc-500" />
                    No, I understand that
                </button>
            </div>
        </div>
    );
}
