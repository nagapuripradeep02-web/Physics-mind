"use client";

import { useEffect, useRef, useState } from "react";

interface VoltageDropProps {
    playing: boolean;
    speed: number;
}

const ELECTRON_COUNT = 6;

export default function VoltageDrop({ playing, speed }: VoltageDropProps) {
    const [batteryV, setBatteryV] = useState(9); // 3-12V
    const [r1, setR1] = useState(3);
    const [r2, setR2] = useState(6);

    const totalR = r1 + r2;
    const current = batteryV / totalR;
    const vDrop1 = current * r1;
    const vDrop2 = current * r2;

    // Circuit path (closed loop):
    // Battery(20,90) → top wire → R1(160,90) → wire → R2(280,90) → right-corner → bottom wire → battery-neg
    // Normalize path as segments: [0..1]
    // Segment definitions
    const segments = [
        { x1: 30, y1: 90, x2: 130, y2: 90 }, // battery+ to R1
        { x1: 200, y1: 90, x2: 250, y2: 90 }, // R1 to R2
        { x1: 320, y1: 90, x2: 380, y2: 90 }, // R2 to right
        { x1: 380, y1: 90, x2: 380, y2: 160 }, // right corner down
        { x1: 380, y1: 160, x2: 20, y2: 160 }, // bottom
        { x1: 20, y1: 160, x2: 20, y2: 90 },  // left side up to battery
    ];

    const segLengths = segments.map((s) =>
        Math.sqrt((s.x2 - s.x1) ** 2 + (s.y2 - s.y1) ** 2)
    );
    const totalLen = segLengths.reduce((a, b) => a + b, 0);
    const segStarts = segLengths.reduce<number[]>((acc, len, i) => {
        acc.push(i === 0 ? 0 : acc[i - 1] + segLengths[i - 1]);
        return acc;
    }, []);

    const getPoint = (dist: number) => {
        let d = ((dist % totalLen) + totalLen) % totalLen;
        for (let i = 0; i < segments.length; i++) {
            const len = segLengths[i];
            if (d <= len) {
                const t = d / len;
                const seg = segments[i];
                return { x: seg.x1 + (seg.x2 - seg.x1) * t, y: seg.y1 + (seg.y2 - seg.y1) * t };
            }
            d -= len;
        }
        return { x: segments[0].x1, y: segments[0].y1 };
    };

    const posRef = useRef<number[]>(
        Array.from({ length: ELECTRON_COUNT }, (_, i) => (totalLen * i) / ELECTRON_COUNT)
    );
    const rafRef = useRef<number | null>(null);
    const [, forceRender] = useState(0);
    const electronSpeed = current * 8;

    useEffect(() => {
        if (!playing) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            return;
        }
        const animate = () => {
            posRef.current = posRef.current.map((d) => {
                let nd = d + electronSpeed * speed * 0.016 * 60 * 0.016;
                if (nd > totalLen) nd -= totalLen;
                return nd;
            });
            forceRender((n) => n + 1);
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [playing, speed, electronSpeed, totalLen]);

    return (
        <div className="flex flex-col gap-4 w-full px-2">
            <svg viewBox="0 0 410 220" className="w-full rounded-xl bg-zinc-900 border border-zinc-800">
                {/* Circuit wires */}
                {segments.map((s, i) => (
                    <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                        stroke="#3f3f46" strokeWidth="6" strokeLinecap="round" />
                ))}

                {/* Battery */}
                <rect x="8" y="70" width="24" height="40" rx="5" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1.5" />
                <text x="20" y="88" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="bold">+</text>
                <text x="20" y="104" textAnchor="middle" fill="#6b7280" fontSize="11">−</text>
                <text x="20" y="62" textAnchor="middle" fill="#60a5fa" fontSize="9">{batteryV}V</text>

                {/* R1 resistor */}
                {[0, 1, 2, 3, 4].map((i) => {
                    const x1 = 130 + i * 14;
                    const x2 = 130 + (i + 1) * 14;
                    const y1 = 90 + (i % 2 === 0 ? -10 : 10);
                    const y2 = 90 + (i % 2 === 0 ? 10 : -10);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />;
                })}
                <text x="162" y="120" textAnchor="middle" fill="#fbbf24" fontSize="9">R₁={r1}Ω</text>
                <text x="162" y="132" textAnchor="middle" fill="#fbbf24" fontSize="9">−{vDrop1.toFixed(1)}V</text>

                {/* R2 resistor */}
                {[0, 1, 2, 3, 4].map((i) => {
                    const x1 = 250 + i * 14;
                    const x2 = 250 + (i + 1) * 14;
                    const y1 = 90 + (i % 2 === 0 ? -10 : 10);
                    const y2 = 90 + (i % 2 === 0 ? 10 : -10);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />;
                })}
                <text x="282" y="120" textAnchor="middle" fill="#c084fc" fontSize="9">R₂={r2}Ω</text>
                <text x="282" y="132" textAnchor="middle" fill="#c084fc" fontSize="9">−{vDrop2.toFixed(1)}V</text>

                {/* Voltage labels on wire */}
                <text x="80" y="82" textAnchor="middle" fill="#22d3ee" fontSize="9">{batteryV}V</text>
                <text x="227" y="82" textAnchor="middle" fill="#22d3ee" fontSize="9">{(batteryV - vDrop1).toFixed(1)}V</text>
                <text x="350" y="82" textAnchor="middle" fill="#22d3ee" fontSize="9">0V</text>

                {/* Electrons */}
                {posRef.current.map((d, i) => {
                    const pt = getPoint(d);
                    return (
                        <g key={i}>
                            <circle cx={pt.x} cy={pt.y} r={5} fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5" />
                            <text x={pt.x} y={pt.y + 3.5} textAnchor="middle" fill="#93c5fd" fontSize="7" fontWeight="bold">e⁻</text>
                        </g>
                    );
                })}

                {/* Current label */}
                <text x="205" y="15" textAnchor="middle" fill="#a1a1aa" fontSize="10">
                    I = {current.toFixed(2)}A · V₁+V₂ = {batteryV}V ✓
                </text>
            </svg>

            {/* Sliders */}
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="text-xs font-semibold text-zinc-400 flex justify-between mb-1">
                        <span>Battery</span>
                        <span className="text-blue-400">{batteryV}V</span>
                    </label>
                    <input type="range" min="3" max="12" step="1" value={batteryV}
                        onChange={(e) => setBatteryV(Number(e.target.value))}
                        className="w-full accent-blue-500 h-1.5 rounded-full cursor-pointer" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-zinc-400 flex justify-between mb-1">
                        <span>R₁</span>
                        <span className="text-amber-400">{r1}Ω</span>
                    </label>
                    <input type="range" min="1" max="9" step="1" value={r1}
                        onChange={(e) => setR1(Number(e.target.value))}
                        className="w-full accent-amber-500 h-1.5 rounded-full cursor-pointer" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-zinc-400 flex justify-between mb-1">
                        <span>R₂</span>
                        <span className="text-purple-400">{r2}Ω</span>
                    </label>
                    <input type="range" min="1" max="9" step="1" value={r2}
                        onChange={(e) => setR2(Number(e.target.value))}
                        className="w-full accent-purple-500 h-1.5 rounded-full cursor-pointer" />
                </div>
            </div>

            <p className="text-center text-xs text-zinc-500">
                Voltage drops across each resistor. Bigger resistor → bigger drop. Sum always = battery voltage.
            </p>
        </div>
    );
}
