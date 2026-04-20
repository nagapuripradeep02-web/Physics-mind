"use client";

import { useEffect, useRef, useState } from "react";

interface KCLJunctionProps {
    playing: boolean;
    speed: number;
}

const JUNCTION = { x: 210, y: 110 };
const PATHS = [
    // Incoming from left
    { from: { x: 40, y: 110 }, to: JUNCTION, incoming: true, label: "I₁" },
    // Incoming from top-left
    { from: { x: 90, y: 30 }, to: JUNCTION, incoming: true, label: "I₂" },
    // Outgoing to right
    { from: JUNCTION, to: { x: 380, y: 110 }, incoming: false, label: "I₃" },
    // Outgoing to bottom-right
    { from: JUNCTION, to: { x: 340, y: 190 }, incoming: false, label: "I₄" },
];

const ELECTRON_RADIUS = 5;
const ELECTRONS_PER_PATH = 4;

export default function KCLJunction({ playing, speed }: KCLJunctionProps) {
    const [r1, setR1] = useState(3); // resistance path 1 → controls I1 relative split
    const [r2, setR2] = useState(2); // resistance path 2

    // I_in = I1 + I2, I_out = I3 + I4
    // Using conductance for current split: I ∝ 1/R
    const g1 = 1 / r1, g2 = 1 / r2;
    const totalIn = g1 + g2;
    const i1 = +(g1 / totalIn * 4).toFixed(2);
    const i2 = +(g2 / totalIn * 4).toFixed(2);
    const i3 = +(i1 + i2) * 0.6;
    const i4 = +(i1 + i2) * 0.4;

    const pathSpeeds = [i1 * 20, i2 * 20, (i1 + i2) * 12, (i1 + i2) * 8];

    // Per-path electron positions (0..1 along path)
    const posRef = useRef<number[][]>(
        PATHS.map((_, pi) =>
            Array.from({ length: ELECTRONS_PER_PATH }, (_, i) => i / ELECTRONS_PER_PATH + (pi * 0.17 % 1))
        )
    );
    const rafRef = useRef<number | null>(null);
    const [, forceRender] = useState(0);

    useEffect(() => {
        if (!playing) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            return;
        }
        const animate = () => {
            posRef.current = posRef.current.map((electrons, pi) =>
                electrons.map((t) => {
                    const nt = t + pathSpeeds[pi] * speed * 0.0003;
                    return nt > 1 ? nt - 1 : nt;
                })
            );
            forceRender((n) => n + 1);
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [playing, speed, r1, r2]);

    const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
    });

    return (
        <div className="flex flex-col gap-4 w-full px-2">
            <svg viewBox="0 0 420 230" className="w-full rounded-xl bg-zinc-900 border border-zinc-800">
                {/* Paths / wires */}
                {PATHS.map((path, pi) => (
                    <line
                        key={pi}
                        x1={path.from.x} y1={path.from.y}
                        x2={path.to.x} y2={path.to.y}
                        stroke="#3f3f46" strokeWidth="6" strokeLinecap="round"
                    />
                ))}

                {/* Junction dot */}
                <circle cx={JUNCTION.x} cy={JUNCTION.y} r={10} fill="#1d4ed8" stroke="#3b82f6" strokeWidth="2" />
                <circle cx={JUNCTION.x} cy={JUNCTION.y} r={4} fill="#93c5fd" />

                {/* Electrons */}
                {PATHS.map((path, pi) =>
                    posRef.current[pi].map((t, ei) => {
                        const pos = lerp(path.from, path.to, t);
                        return (
                            <g key={`${pi}-${ei}`}>
                                <circle cx={pos.x} cy={pos.y} r={ELECTRON_RADIUS} fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5" />
                                <text x={pos.x} y={pos.y + 3.5} textAnchor="middle" fill="#93c5fd" fontSize="7" fontWeight="bold">e⁻</text>
                            </g>
                        );
                    })
                )}

                {/* Path labels */}
                <text x="60" y="102" fill="#60a5fa" fontSize="11" fontWeight="bold">{PATHS[0].label}={i1.toFixed(1)}A</text>
                <text x="100" y="52" fill="#60a5fa" fontSize="11" fontWeight="bold">{PATHS[1].label}={i2.toFixed(1)}A</text>
                <text x="290" y="102" fill="#34d399" fontSize="11" fontWeight="bold">{PATHS[2].label}={i3.toFixed(1)}A</text>
                <text x="270" y="178" fill="#34d399" fontSize="11" fontWeight="bold">{PATHS[3].label}={i4.toFixed(1)}A</text>

                {/* KCL equation */}
                <text x="210" y="25" textAnchor="middle" fill="#a1a1aa" fontSize="11">KCL: I₁ + I₂ = I₃ + I₄</text>
                <text x="210" y="215" textAnchor="middle" fill="#6b7280" fontSize="10">
                    {i1.toFixed(1)} + {i2.toFixed(1)} = {(i1 + i2).toFixed(1)} A (total)
                </text>

                {/* Incoming / Outgoing arrows */}
                <defs>
                    <marker id="arrowIn" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto">
                        <path d="M0,0 L0,5 L5,2.5 z" fill="#3b82f6" />
                    </marker>
                    <marker id="arrowOut" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto">
                        <path d="M0,0 L0,5 L5,2.5 z" fill="#10b981" />
                    </marker>
                </defs>
            </svg>

            {/* Sliders */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-zinc-400 flex justify-between mb-1">
                        <span>R₁ (Path 1)</span>
                        <span className="text-blue-400">{r1} Ω</span>
                    </label>
                    <input type="range" min="1" max="9" step="1" value={r1}
                        onChange={(e) => setR1(Number(e.target.value))}
                        className="w-full accent-blue-500 h-1.5 rounded-full cursor-pointer" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-zinc-400 flex justify-between mb-1">
                        <span>R₂ (Path 2)</span>
                        <span className="text-blue-400">{r2} Ω</span>
                    </label>
                    <input type="range" min="1" max="9" step="1" value={r2}
                        onChange={(e) => setR2(Number(e.target.value))}
                        className="w-full accent-blue-500 h-1.5 rounded-full cursor-pointer" />
                </div>
            </div>

            <p className="text-center text-xs text-zinc-500">
                Total current entering = total current leaving. Lower R → more current through that branch.
            </p>
        </div>
    );
}
