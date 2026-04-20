"use client";

import { useEffect, useRef, useState } from "react";

interface ElectronsWireProps {
    playing: boolean;
    speed: number; // 0.5 = slow, 1 = normal, 2 = fast
}

const WIRE_WIDTH = 400;
const WIRE_Y = 80;
const ELECTRON_COUNT = 8;
const ELECTRON_RADIUS = 6;

export default function ElectronsWire({ playing, speed }: ElectronsWireProps) {
    const [voltage, setVoltage] = useState(6); // 1-12V
    const [resistance, setResistance] = useState(3); // 1-10 Ohm
    const positions = useRef<number[]>(
        Array.from({ length: ELECTRON_COUNT }, (_, i) => (i * WIRE_WIDTH) / ELECTRON_COUNT)
    );
    const rafRef = useRef<number | null>(null);
    const [, forceRender] = useState(0);

    const current = voltage / resistance;
    const electronSpeed = current * 4; // px per frame (scaled)

    useEffect(() => {
        if (!playing) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            return;
        }

        const animate = () => {
            positions.current = positions.current.map((x) => {
                let nx = x + electronSpeed * speed * 0.016 * 60;
                if (nx > WIRE_WIDTH + ELECTRON_RADIUS) nx -= WIRE_WIDTH + ELECTRON_RADIUS * 2;
                return nx;
            });
            forceRender((n) => n + 1);
            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [playing, electronSpeed, speed]);

    return (
        <div className="flex flex-col gap-4 w-full px-2">
            {/* SVG Canvas */}
            <svg viewBox="0 0 420 160" className="w-full rounded-xl bg-zinc-900 border border-zinc-800">
                {/* Battery */}
                <rect x="8" y="65" width="22" height="30" rx="4" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1.5" />
                <text x="19" y="84" textAnchor="middle" fill="#93c5fd" fontSize="14" fontWeight="bold">+</text>
                <rect x="390" y="65" width="22" height="30" rx="4" fill="#374151" stroke="#6b7280" strokeWidth="1.5" />
                <text x="401" y="84" textAnchor="middle" fill="#9ca3af" fontSize="14">−</text>

                {/* Wire (top + bottom) */}
                <line x1="30" y1={WIRE_Y} x2="390" y2={WIRE_Y} stroke="#52525b" strokeWidth="8" strokeLinecap="round" />
                <line x1="30" y1={WIRE_Y + 40} x2="390" y2={WIRE_Y + 40} stroke="#3f3f46" strokeWidth="6" strokeLinecap="round" />

                {/* Connecting wires */}
                <line x1="30" y1={WIRE_Y} x2="30" y2={WIRE_Y + 40} stroke="#52525b" strokeWidth="8" strokeLinecap="round" />
                <line x1="390" y1={WIRE_Y} x2="390" y2={WIRE_Y + 40} stroke="#52525b" strokeWidth="8" strokeLinecap="round" />

                {/* Resistor symbol (zigzag) on bottom wire */}
                {[0, 1, 2, 3, 4, 5].map((i) => {
                    const x1 = 160 + i * 16;
                    const x2 = 160 + (i + 1) * 16;
                    const y1 = WIRE_Y + 40 + (i % 2 === 0 ? -10 : 10);
                    const y2 = WIRE_Y + 40 + (i % 2 === 0 ? 10 : -10);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />;
                })}
                <text x="188" y={WIRE_Y + 68} textAnchor="middle" fill="#fbbf24" fontSize="10">R = {resistance}Ω</text>

                {/* Electrons */}
                {positions.current.map((x, i) => (
                    <g key={i}>
                        <circle
                            cx={10 + x}
                            cy={WIRE_Y}
                            r={ELECTRON_RADIUS}
                            fill="#1e40af"
                            stroke="#3b82f6"
                            strokeWidth="1.5"
                        />
                        <text x={10 + x} y={WIRE_Y + 4} textAnchor="middle" fill="#93c5fd" fontSize="8" fontWeight="bold">e⁻</text>
                    </g>
                ))}

                {/* Labels */}
                <text x="19" y="58" textAnchor="middle" fill="#60a5fa" fontSize="10">{voltage}V</text>
                <text x="210" y="25" textAnchor="middle" fill="#a1a1aa" fontSize="11">I = V/R = {current.toFixed(2)} A</text>

                {/* Current arrow */}
                <defs>
                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L6,3 z" fill="#3b82f6" />
                    </marker>
                </defs>
                <line x1="80" y1={WIRE_Y - 15} x2="130" y2={WIRE_Y - 15} stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arrow)" />
                <text x="105" y={WIRE_Y - 19} textAnchor="middle" fill="#60a5fa" fontSize="9">I →</text>
            </svg>

            {/* Sliders */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-zinc-400 flex justify-between mb-1">
                        <span>Voltage (V)</span>
                        <span className="text-blue-400">{voltage} V</span>
                    </label>
                    <input
                        type="range" min="1" max="12" step="1" value={voltage}
                        onChange={(e) => setVoltage(Number(e.target.value))}
                        className="w-full accent-blue-500 h-1.5 rounded-full cursor-pointer"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-zinc-400 flex justify-between mb-1">
                        <span>Resistance (Ω)</span>
                        <span className="text-amber-400">{resistance} Ω</span>
                    </label>
                    <input
                        type="range" min="1" max="10" step="1" value={resistance}
                        onChange={(e) => setResistance(Number(e.target.value))}
                        className="w-full accent-amber-500 h-1.5 rounded-full cursor-pointer"
                    />
                </div>
            </div>

            <p className="text-center text-xs text-zinc-500">
                More voltage → electrons move faster. More resistance → electrons slow down.
            </p>
        </div>
    );
}
