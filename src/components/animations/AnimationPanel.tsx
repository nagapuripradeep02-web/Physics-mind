"use client";

import { useState } from "react";
import { Play, Pause, Gauge } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import ElectronsWire from "./ElectronsWire";
import KCLJunction from "./KCLJunction";
import VoltageDrop from "./VoltageDrop";

const MODULE_ANIMATIONS: Record<number, "electrons" | "kcl" | "voltage" | null> = {
    1: "electrons",
    2: "kcl",
    3: "voltage",
    4: null,
    5: null,
};

const MODULE_TITLES: Record<number, string> = {
    1: "⚡ Electron Flow in a Wire",
    2: "🔀 KCL at a Junction",
    3: "📉 Voltage Drop",
    4: "💡 Power & Energy",
    5: "🔬 Measuring Instruments",
};

export default function AnimationPanel() {
    const { currentModule } = useProfile();
    const [playing, setPlaying] = useState(true);
    const [speed, setSpeed] = useState(1); // 0.5, 1, 2

    const animationType = MODULE_ANIMATIONS[currentModule];
    const title = MODULE_TITLES[currentModule];

    if (!animationType) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-zinc-950 border-b border-zinc-800">
                <div className="text-center">
                    <div className="text-3xl mb-2">🔬</div>
                    <p className="text-sm text-zinc-500">Interactive diagram coming soon for this module.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-zinc-950 border-b border-zinc-800 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800">
                <p className="text-xs font-semibold text-zinc-300">{title}</p>
                <div className="flex items-center gap-2">
                    {/* Speed picker */}
                    <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                        {([0.5, 1, 2] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setSpeed(s)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${speed === s
                                    ? "bg-zinc-700 text-white"
                                    : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                            >
                                {s === 0.5 ? "0.5×" : s === 1 ? "1×" : "2×"}
                            </button>
                        ))}
                    </div>
                    {/* Play / Pause */}
                    <button
                        onClick={() => setPlaying((p) => !p)}
                        className="w-7 h-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
                    >
                        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {/* Animation */}
            <div className="px-3 py-3">
                {animationType === "electrons" && <ElectronsWire playing={playing} speed={speed} />}
                {animationType === "kcl" && <KCLJunction playing={playing} speed={speed} />}
                {animationType === "voltage" && <VoltageDrop playing={playing} speed={speed} />}
            </div>
        </div>
    );
}
