"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CircuitSimulatorState {
    emf?: number;   // 1 – 20 V
    r1?: number;    // 0.5 – 10 Ω  (internal resistance)
    r2?: number;    // 0.5 – 10 Ω  (external resistance)
    mode?: string;  // 'ohm' | 'kvl' | 'series' | 'parallel'
}

export interface CircuitSimulatorProps {
    // Self-controlled defaults
    initialEmf?: number;
    initialR1?: number;
    initialR2?: number;
    initialMode?: string;

    // Controlled props (Teacher Engine)
    state?: CircuitSimulatorState;
    highlighted?: string | null;
    // 'kvl_loop'      → loop arrow glows blue
    // 'voltage_drop'  → voltage-drop labels flash yellow
    // 'current_value' → current readout flashes yellow
    // 'emf_source'    → battery symbol glows blue
    interactive?: boolean;
    onStateChange?: (s: CircuitSimulatorState) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BLUE_GLOW = "drop-shadow(0 0 6px #60a5fa)";
const YELLOW_GLOW = "drop-shadow(0 0 6px #fbbf24)";

// ─── Component ────────────────────────────────────────────────────────────────
export default function CircuitSimulator({
    initialEmf = 10,
    initialR1 = 1,
    initialR2 = 4,
    initialMode = "kvl",
    state: externalState,
    highlighted,
    interactive: interactiveProp = true,
    onStateChange,
}: CircuitSimulatorProps) {
    // ── Internal state ──
    const [intEmf, setIntEmf] = useState(initialEmf);
    const [intR1, setIntR1] = useState(initialR1);
    const [intR2, setIntR2] = useState(initialR2);

    // ── Controlled vs self-controlled ──
    const isControlled = externalState !== undefined;

    const emf = isControlled ? (externalState?.emf ?? initialEmf) : intEmf;
    const r1 = isControlled ? (externalState?.r1 ?? initialR1) : intR1;
    const r2 = isControlled ? (externalState?.r2 ?? initialR2) : intR2;

    // ── Setters ──
    const setEmf = (v: number) => {
        if (isControlled) onStateChange?.({ ...externalState, emf: v });
        else setIntEmf(v);
    };
    const setR1 = (v: number) => {
        if (isControlled) onStateChange?.({ ...externalState, r1: v });
        else setIntR1(v);
    };
    const setR2 = (v: number) => {
        if (isControlled) onStateChange?.({ ...externalState, r2: v });
        else setIntR2(v);
    };

    // ── Derived values ──
    const I = emf / (r1 + r2);
    const Vr1 = I * r1;   // voltage drop across internal resistance
    const Vr2 = I * r2;   // voltage drop across external resistance
    const kvlSum = emf - Vr1 - Vr2;

    // ── Flash KVL sum when it changes ──
    const [flash, setFlash] = useState(false);
    const prevSum = useRef(kvlSum);
    useEffect(() => {
        if (Math.abs(prevSum.current - kvlSum) < 1e-9) return;
        prevSum.current = kvlSum;
        setFlash(true);
        const t = setTimeout(() => setFlash(false), 500);
        return () => clearTimeout(t);
    }, [kvlSum]);

    // ── Pulse key — restarts CSS animations when highlight changes ──
    const [pulseKey, setPulseKey] = useState(0);
    useEffect(() => {
        if (highlighted) setPulseKey(k => k + 1);
    }, [highlighted]);

    // ── Highlight flags ──
    const loopGlows = highlighted === "kvl_loop";
    const batteryGlows = highlighted === "emf_source";
    const voltGlows = highlighted === "voltage_drop";
    const currGlows = highlighted === "current_value";

    const pulseBlue: React.CSSProperties = {
        filter: BLUE_GLOW,
        animation: "cir-pulse 0.8s ease-in-out 3",
    };
    const pulseYellow: React.CSSProperties = {
        filter: YELLOW_GLOW,
        animation: "cir-pulse 0.8s ease-in-out 3",
    };

    return (
        <div className="rounded-xl bg-gray-900 border border-gray-700 p-3 select-none space-y-3">
            {/* ── Keyframe ── */}
            <style>{`
                @keyframes cir-pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.45; }
                }
            `}</style>

            {/* ── Circuit SVG ── */}
            <div className="rounded-lg overflow-hidden bg-gray-950">
                <svg width="100%" height={150} viewBox="0 0 320 150">

                    {/* ── Loop rectangle ── */}
                    <rect
                        key={`loop-${pulseKey}`}
                        x={30} y={20} width={260} height={110} rx={8}
                        fill="none"
                        stroke={loopGlows ? "#60a5fa" : "#475569"}
                        strokeWidth={loopGlows ? 2.5 : 2}
                        style={loopGlows ? pulseBlue : {}}
                    />

                    {/* ── KVL loop arrow (clockwise, top-centre) ── */}
                    <g key={`arrow-${pulseKey}`} style={loopGlows ? pulseBlue : { opacity: 0.5 }}>
                        <path
                            d="M 155 20 A 10 10 0 0 1 165 20"
                            fill="none"
                            stroke={loopGlows ? "#60a5fa" : "#64748b"}
                            strokeWidth={loopGlows ? 2 : 1.5}
                        />
                        {/* arrowhead */}
                        <polygon
                            points="163,17 168,20 163,23"
                            fill={loopGlows ? "#60a5fa" : "#64748b"}
                        />
                        <text x={160} y={16} textAnchor="middle"
                            fill={loopGlows ? "#93c5fd" : "#64748b"} fontSize={7}>
                            loop
                        </text>
                    </g>

                    {/* ── Battery (left side) ── */}
                    <g key={`bat-${pulseKey}`} style={batteryGlows ? pulseBlue : {}}>
                        {/* vertical wire */}
                        <line x1={30} y1={60} x2={30} y2={80}
                            stroke="#64748b" strokeWidth={2} />
                        {/* + plate (long) */}
                        <line x1={22} y1={57} x2={38} y2={57}
                            stroke={batteryGlows ? "#60a5fa" : "#3b82f6"}
                            strokeWidth={3} />
                        {/* − plate (short) */}
                        <line x1={26} y1={83} x2={34} y2={83}
                            stroke={batteryGlows ? "#60a5fa" : "#ef4444"}
                            strokeWidth={2} />
                        <text x={10} y={55} fill="#60a5fa" fontSize={10} fontWeight="bold">+</text>
                        <text x={10} y={90} fill="#f87171" fontSize={10} fontWeight="bold">−</text>
                        {/* EMF label */}
                        <text x={46} y={73} fill={batteryGlows ? "#93c5fd" : "#94a3b8"} fontSize={9}>
                            {emf}V
                        </text>
                        <text x={26} y={13} fill={batteryGlows ? "#93c5fd" : "#94a3b8"} fontSize={8}>ε</text>
                    </g>

                    {/* ── Internal resistor r1 (top-left) ── */}
                    <rect x={55} y={14} width={55} height={14} rx={3}
                        fill="#1e293b" stroke="#f59e0b" strokeWidth={1.5} />
                    <text x={82} y={24} textAnchor="middle" fill="#fbbf24" fontSize={9}>
                        r={r1}Ω
                    </text>

                    {/* ── External resistor r2 (top-right) ── */}
                    <rect x={202} y={14} width={58} height={14} rx={3}
                        fill="#1e293b" stroke="#34d399" strokeWidth={1.5} />
                    <text x={231} y={24} textAnchor="middle" fill="#34d399" fontSize={9}>
                        R={r2}Ω
                    </text>

                    {/* ── Current label (top-centre) ── */}
                    <text
                        key={`curr-${pulseKey}`}
                        x={160} y={12} textAnchor="middle"
                        fill={currGlows ? "#fbbf24" : "#93c5fd"} fontSize={9}
                        style={currGlows ? pulseYellow : {}}
                    >
                        I = {I.toFixed(2)}A →
                    </text>

                    {/* ── Voltage-drop labels (bottom) ── */}
                    <g key={`vdrop-${pulseKey}`} style={voltGlows ? pulseYellow : {}}>
                        <text x={82} y={145} textAnchor="middle"
                            fill={voltGlows ? "#fbbf24" : "#fbbf24"} fontSize={8}
                            opacity={voltGlows ? 1 : 0.75}>
                            −{Vr1.toFixed(2)}V
                        </text>
                        <text x={231} y={145} textAnchor="middle"
                            fill={voltGlows ? "#fbbf24" : "#34d399"} fontSize={8}
                            opacity={voltGlows ? 1 : 0.75}>
                            −{Vr2.toFixed(2)}V
                        </text>
                        <text x={30} y={145}
                            fill={voltGlows ? "#fbbf24" : "#60a5fa"} fontSize={8}
                            opacity={voltGlows ? 1 : 0.75}>
                            +{emf}V
                        </text>
                    </g>
                </svg>
            </div>

            {/* ── KVL equation display ── */}
            <div className="font-mono text-xs leading-5 px-1">
                <div className="text-gray-400">KVL → ε − I·r − I·R = 0</div>
                <div className="text-gray-200">
                    {emf} − {I.toFixed(2)}×{r1} − {I.toFixed(2)}×{r2} = 0
                </div>
                <div
                    className="font-bold text-base transition-colors duration-300"
                    style={{
                        color: flash
                            ? "#facc15"
                            : Math.abs(kvlSum) < 0.001
                                ? "#34d399"
                                : "#f87171",
                    }}
                >
                    = {kvlSum.toFixed(3)}{" "}
                    {Math.abs(kvlSum) < 0.001 ? "✓ KVL satisfied" : "(adjust values)"}
                </div>
            </div>

            {/* ── Sliders ── */}
            <div
                className="space-y-1.5"
                style={{
                    opacity: interactiveProp ? 1 : 0.4,
                    cursor: interactiveProp ? "auto" : "not-allowed",
                    pointerEvents: interactiveProp ? "auto" : "none",
                }}
            >
                <CircSlider
                    label="ε (EMF)" unit="V"
                    value={emf} min={1} max={20} step={1}
                    color="#60a5fa" disabled={!interactiveProp}
                    onChange={setEmf}
                />
                <CircSlider
                    label="r (int)" unit="Ω"
                    value={r1} min={0.5} max={10} step={0.5}
                    color="#fbbf24" disabled={!interactiveProp}
                    onChange={setR1}
                />
                <CircSlider
                    label="R (ext)" unit="Ω"
                    value={r2} min={0.5} max={10} step={0.5}
                    color="#34d399" disabled={!interactiveProp}
                    onChange={setR2}
                />
            </div>
        </div>
    );
}

// ─── CircSlider ───────────────────────────────────────────────────────────────
function CircSlider({
    label, unit, value, min, max, step, color, disabled, onChange,
}: {
    label: string; unit: string; value: number;
    min: number; max: number; step: number;
    color: string; disabled: boolean;
    onChange: (v: number) => void;
}) {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div className="flex items-center gap-2">
            <span className="text-gray-400 w-14 shrink-0" style={{ fontSize: 11 }}>{label}</span>
            <input
                type="range"
                min={min} max={max} step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
                style={{
                    accentColor: color,
                    background: `linear-gradient(to right, ${color} ${pct}%, #374151 ${pct}%)`,
                }}
            />
            <span className="text-white font-mono text-right shrink-0"
                style={{ fontSize: 11, minWidth: 40 }}>
                {value} {unit}
            </span>
        </div>
    );
}
