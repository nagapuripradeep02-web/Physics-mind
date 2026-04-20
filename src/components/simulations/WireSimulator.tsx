"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface WireSimulatorState {
    length?: number;   // 0.5 – 3.0 multiplier
    area?: number;     // 0.5 – 2.0 multiplier
    material?: string; // 'copper' | 'iron' | 'nichrome'
}

export interface WireSimulatorProps {
    // Legacy / standalone props
    initialLength?: number;
    initialArea?: number;
    material?: "copper" | "nichrome" | "iron";
    autoPlay?: "stretch" | "none";
    highlightTarget?: string | null; // legacy – same as highlighted

    // Controlled props (from Teacher Engine)
    state?: WireSimulatorState;
    highlighted?: string | null;
    // 'resistance_formula' → formula row glows blue
    // 'wire_length'        → wire body gets blue outline
    // 'resistance_display' → R value flashes yellow
    // 'area_display'       → area value flashes yellow
    interactive?: boolean;          // default true
    onStateChange?: (s: WireSimulatorState) => void;
}

type Material = "copper" | "nichrome" | "iron";

// ─── Constants ────────────────────────────────────────────────────────────────
const RESISTIVITY: Record<Material, number> = {
    copper: 1.72e-8,
    nichrome: 1.1e-6,
    iron: 1.0e-7,
};

const MATERIAL_LABELS: Record<Material, string> = {
    copper: "Copper",
    nichrome: "Nichrome",
    iron: "Iron",
};

const MATERIAL_COLORS: Record<Material, string> = {
    copper: "#c87533",
    nichrome: "#9ca3af",
    iron: "#b0b7c3",
};

const NUM_ELECTRONS = 7;
const PAD = 44;         // px on each side for terminal circles
const WIRE_H_BASE = 26; // px for area=1
const SVG_H = 110;
const WIRE_Y = SVG_H / 2;
const BASE_SPEED = 55;      // px/s at REFERENCE_R
const REFERENCE_R = 0.0172; // copper L=1 A=1mm²

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcR(mat: Material, L: number, A: number): number {
    return (RESISTIVITY[mat] * L) / (A * 1e-6);
}

function fmtRho(rho: number): string {
    const exp = Math.floor(Math.log10(Math.abs(rho)));
    const m = rho / 10 ** exp;
    return `${m.toFixed(2)}×10⁻${Math.abs(exp)}`;
}

function fmtR(r: number): string {
    if (r < 1e-3) return `${(r * 1e6).toFixed(4)} μΩ`;
    if (r < 1) return `${(r * 1e3).toFixed(4)} mΩ`;
    if (r < 1000) return `${r.toFixed(4)} Ω`;
    return `${(r / 1000).toFixed(4)} kΩ`;
}

// ─── Highlight helpers ────────────────────────────────────────────────────────
// Returns a CSS filter string for a pulsing glow, or "none"
const BLUE_GLOW = "drop-shadow(0 0 6px #60a5fa)";
const YELLOW_GLOW = "drop-shadow(0 0 6px #fbbf24)";

// ─── Component ────────────────────────────────────────────────────────────────
export default function WireSimulator({
    initialLength = 1,
    initialArea = 1,
    material: initMaterial = "copper",
    autoPlay = "none",
    highlightTarget = null,
    // Controlled props
    state: externalState,
    highlighted,
    interactive: interactiveProp = true,
    onStateChange,
}: WireSimulatorProps) {
    // ── Internal state (used when no externalState prop) ──
    const [intLength, setIntLength] = useState(initialLength);
    const [intArea, setIntArea] = useState(initialArea);
    const [intMaterial, setIntMaterial] = useState<Material>(initMaterial);

    const [showHint, setShowHint] = useState(false);
    const [flashR, setFlashR] = useState(false);
    const [svgWidth, setSvgWidth] = useState(480);
    const [pulseKey, setPulseKey] = useState(0); // forces highlight re-animation

    // ── Resolve controlled vs internal ──
    const isControlled = externalState !== undefined;

    const length: number = isControlled
        ? (externalState?.length ?? initialLength)
        : intLength;
    const area: number = isControlled
        ? (externalState?.area ?? initialArea)
        : intArea;
    const material: Material = isControlled && externalState?.material
        ? (externalState.material as Material)
        : intMaterial;

    // Merge prop highlights: new `highlighted` takes priority, legacy `highlightTarget` fallback
    const activeHighlight = highlighted ?? highlightTarget;

    // ── Setters that respect controlled mode ──
    const setLength = (v: number) => {
        if (isControlled) onStateChange?.({ ...externalState, length: v });
        else setIntLength(v);
    };
    const setArea = (v: number) => {
        if (isControlled) onStateChange?.({ ...externalState, area: v });
        else setIntArea(v);
    };
    const setMaterial = (v: Material) => {
        if (isControlled) onStateChange?.({ ...externalState, material: v });
        else setIntMaterial(v);
    };

    // ── Refs for animation loop ──
    const lRef = useRef(length);
    const aRef = useRef(area);
    const mRef = useRef(material);
    lRef.current = length;
    aRef.current = area;
    mRef.current = material;

    const svgRef = useRef<SVGSVGElement>(null);
    const rafRef = useRef(0);
    const lastTRef = useRef(0);
    const electronXRef = useRef<number[]>(
        Array.from({ length: NUM_ELECTRONS }, (_, i) => i / NUM_ELECTRONS)
    );
    const autoRafRef = useRef(0);
    const prevR = useRef<number | null>(null);

    // ── Flash R value on change ──
    const R = calcR(material, length, area);
    useEffect(() => {
        if (prevR.current !== null && Math.abs(prevR.current - R) > 1e-12) {
            setFlashR(true);
            const t = setTimeout(() => setFlashR(false), 500);
            return () => clearTimeout(t);
        }
        prevR.current = R;
    }, [R]);

    // ── Re-trigger highlight pulse every time activeHighlight changes ──
    useEffect(() => {
        if (activeHighlight) setPulseKey(k => k + 1);
    }, [activeHighlight]);

    // ── Measure SVG width ──
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        const obs = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect.width;
            if (w) setSvgWidth(w);
        });
        obs.observe(svg);
        setSvgWidth(svg.getBoundingClientRect().width || 480);
        return () => obs.disconnect();
    }, []);

    // ── Electron animation ──
    useEffect(() => {
        cancelAnimationFrame(rafRef.current);
        lastTRef.current = 0;
        const wireW = svgWidth - PAD * 2;

        const tick = (ts: number) => {
            if (!lastTRef.current) lastTRef.current = ts;
            const dt = Math.min((ts - lastTRef.current) / 1000, 0.05);
            lastTRef.current = ts;

            const r = calcR(mRef.current, lRef.current, aRef.current);
            const speed = Math.min(BASE_SPEED * (REFERENCE_R / r), 350);

            electronXRef.current = electronXRef.current.map((x) => {
                const nx = x + (speed * dt) / wireW;
                return nx >= 1 ? nx - 1 : nx;
            });

            const svg = svgRef.current;
            if (svg) {
                const circles = svg.querySelectorAll<SVGCircleElement>(".e-circ");
                const texts = svg.querySelectorAll<SVGTextElement>(".e-txt");
                electronXRef.current.forEach((x, i) => {
                    const px = PAD + x * wireW;
                    circles[i]?.setAttribute("cx", String(px));
                    texts[i]?.setAttribute("x", String(px));
                });
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [length, area, material, svgWidth]);

    // ── Auto-play stretch ──
    useEffect(() => {
        if (autoPlay !== "stretch" || isControlled) return;
        const delay = setTimeout(() => {
            const dur = 2500;
            let start: number | null = null;

            const animate = (ts: number) => {
                if (!start) start = ts;
                const p = Math.min((ts - start) / dur, 1);
                const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;

                setIntLength(1 + e);       // 1 → 2
                setIntArea(1 - 0.5 * e);   // 1 → 0.5

                if (p < 1) {
                    autoRafRef.current = requestAnimationFrame(animate);
                } else {
                    setShowHint(true);
                }
            };
            autoRafRef.current = requestAnimationFrame(animate);
        }, 500);

        return () => {
            clearTimeout(delay);
            cancelAnimationFrame(autoRafRef.current);
        };
    }, [autoPlay, isControlled]);

    // ── Layout values ──
    const wireW = svgWidth - PAD * 2;
    const wireH = Math.max(10, Math.min(54, WIRE_H_BASE * Math.sqrt(area)));
    const matColor = MATERIAL_COLORS[material];
    const rho = RESISTIVITY[material];

    // Map activeHighlight → which elements glow
    const wireGlows = activeHighlight === "wire_length";
    const formulaGlows = activeHighlight === "resistance_formula";
    const rFlash = activeHighlight === "resistance_display" || flashR;
    const aFlash = activeHighlight === "area_display";

    // CSS animation keyframe: we use a data attribute + inline style trick
    // The `pulseKey` makes React remount the element and restart the animation
    const pulseStyle = (color: "blue" | "yellow"): React.CSSProperties => ({
        filter: color === "blue" ? BLUE_GLOW : YELLOW_GLOW,
        animation: "ws-pulse 0.8s ease-in-out 3",
    });

    return (
        <div
            className="rounded-xl bg-gray-900 border border-gray-700 p-3 select-none"
            style={{ maxHeight: 360 }}
        >
            {/* ── Keyframe for pulse glow ── */}
            <style>{`
                @keyframes ws-pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.55; }
                }
            `}</style>

            {/* ── SVG Canvas ── */}
            <div className="rounded-lg overflow-hidden bg-gray-950">
                <svg
                    ref={svgRef}
                    width="100%"
                    height={SVG_H}
                    style={{ display: "block" }}
                >
                    <defs>
                        <filter id="ws-glow" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <linearGradient id="ws-wg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.7" />
                            <stop offset="45%" stopColor={matColor} />
                            <stop offset="100%" stopColor="#334155" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>

                    {/* Positive terminal */}
                    <circle cx={PAD - 16} cy={WIRE_Y} r={13}
                        fill="#0f2744" stroke="#3b82f6" strokeWidth={2} />
                    <text x={PAD - 16} y={WIRE_Y + 5}
                        textAnchor="middle" fill="#60a5fa" fontSize={16} fontWeight="bold">+</text>

                    {/* Negative terminal */}
                    <circle cx={svgWidth - PAD + 16} cy={WIRE_Y} r={13}
                        fill="#2a0c0c" stroke="#ef4444" strokeWidth={2} />
                    <text x={svgWidth - PAD + 16} y={WIRE_Y + 5}
                        textAnchor="middle" fill="#f87171" fontSize={16} fontWeight="bold">−</text>

                    {/* Wire body */}
                    <rect
                        key={`wire-${pulseKey}`}
                        x={PAD}
                        y={WIRE_Y - wireH / 2}
                        width={wireW}
                        height={wireH}
                        rx={wireH / 2}
                        fill="url(#ws-wg)"
                        stroke={wireGlows ? "#3b82f6" : "#64748b"}
                        strokeWidth={wireGlows ? 2.5 : 1}
                        style={{
                            transition: "height 0.1s, y 0.1s",
                            ...(wireGlows ? pulseStyle("blue") : {}),
                        }}
                    />
                    {/* Sheen */}
                    <rect
                        x={PAD + 4}
                        y={WIRE_Y - wireH / 2 + 2}
                        width={Math.max(0, wireW - 8)}
                        height={Math.max(2, wireH * 0.22)}
                        rx={wireH * 0.11}
                        fill="white"
                        opacity={0.14}
                    />

                    {/* Electrons */}
                    {Array.from({ length: NUM_ELECTRONS }).map((_, i) => {
                        const initX = PAD + (i / NUM_ELECTRONS) * wireW;
                        return (
                            <g key={i}>
                                <circle
                                    className="e-circ"
                                    cx={initX} cy={WIRE_Y} r={6}
                                    fill="#1e40af" stroke="#93c5fd" strokeWidth={1.2}
                                    filter="url(#ws-glow)"
                                />
                                <text
                                    className="e-txt"
                                    x={initX} y={WIRE_Y + 4}
                                    textAnchor="middle"
                                    fill="#dbeafe" fontSize={6.5} fontWeight="bold"
                                    style={{ pointerEvents: "none" }}
                                >
                                    e⁻
                                </text>
                            </g>
                        );
                    })}

                    {/* Length dimension line */}
                    <g opacity={0.5}>
                        <line x1={PAD} y1={WIRE_Y + wireH / 2 + 9}
                            x2={PAD + wireW} y2={WIRE_Y + wireH / 2 + 9}
                            stroke="#64748b" strokeWidth={1} />
                        <line x1={PAD} y1={WIRE_Y + wireH / 2 + 5}
                            x2={PAD} y2={WIRE_Y + wireH / 2 + 13}
                            stroke="#64748b" strokeWidth={1} />
                        <line x1={PAD + wireW} y1={WIRE_Y + wireH / 2 + 5}
                            x2={PAD + wireW} y2={WIRE_Y + wireH / 2 + 13}
                            stroke="#64748b" strokeWidth={1} />
                        <text x={PAD + wireW / 2} y={WIRE_Y + wireH / 2 + 22}
                            textAnchor="middle" fill="#64748b" fontSize={9}>
                            L = {length.toFixed(1)} m
                        </text>
                    </g>
                </svg>
            </div>

            {/* ── Formula Display ── */}
            <div
                key={`formula-${pulseKey}`}
                className="mt-2 px-1 font-mono leading-5"
                style={{
                    fontSize: 11,
                    ...(formulaGlows ? pulseStyle("blue") : {}),
                }}
            >
                <div
                    className="text-gray-500"
                    style={formulaGlows ? { color: "#93c5fd" } : {}}
                >
                    R = ρ × L / A
                </div>
                <div className="text-gray-300">
                    R = {fmtRho(rho)} × {length.toFixed(1)} /{" "}
                    <span
                        key={`area-${pulseKey}`}
                        style={aFlash ? { ...pulseStyle("yellow"), color: "#fbbf24" } : {}}
                    >
                        {area.toFixed(1)}×10⁻⁶ m²
                    </span>
                </div>
                <div
                    key={`R-${pulseKey}`}
                    className="font-bold text-base transition-colors duration-300 mt-0.5"
                    style={{
                        color: rFlash ? "#fbbf24" : "#34d399",
                        ...(activeHighlight === "resistance_display"
                            ? pulseStyle("yellow")
                            : {}),
                    }}
                >
                    R = {fmtR(R)}
                </div>
            </div>

            {/* ── Sliders ── */}
            <div
                className="mt-2.5 space-y-1.5"
                style={{
                    opacity: interactiveProp ? 1 : 0.4,
                    cursor: interactiveProp ? "auto" : "not-allowed",
                    pointerEvents: interactiveProp ? "auto" : "none",
                }}
            >
                <SliderRow
                    label="Length"
                    unit="m"
                    value={length}
                    min={0.5} max={5.0} step={0.1}
                    color="#60a5fa"
                    disabled={!interactiveProp}
                    onChange={setLength}
                />
                <SliderRow
                    label="Area"
                    unit="mm²"
                    value={area}
                    min={0.1} max={3.0} step={0.1}
                    color="#a78bfa"
                    disabled={!interactiveProp}
                    onChange={setArea}
                />
                {/* Material select */}
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-14" style={{ fontSize: 11 }}>Material</span>
                    <select
                        value={material}
                        disabled={!interactiveProp}
                        onChange={(e) => setMaterial(e.target.value as Material)}
                        className="flex-1 bg-gray-800 border border-gray-600 text-white rounded-md
                                   px-2 py-1 focus:outline-none focus:border-blue-500 text-xs
                                   disabled:cursor-not-allowed"
                    >
                        {(Object.keys(RESISTIVITY) as Material[]).map((m) => (
                            <option key={m} value={m}>{MATERIAL_LABELS[m]}</option>
                        ))}
                    </select>
                    <span className="text-gray-500 font-mono text-right" style={{ fontSize: 10, minWidth: 90 }}>
                        ρ = {fmtRho(rho)}
                    </span>
                </div>
            </div>

            {showHint && (
                <p className="mt-2 text-center text-xs text-blue-400 animate-pulse">
                    Now try the sliders →
                </p>
            )}
        </div>
    );
}

// ─── SliderRow ────────────────────────────────────────────────────────────────
function SliderRow({
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
                style={{ fontSize: 11, minWidth: 52 }}>
                {value.toFixed(1)} {unit}
            </span>
        </div>
    );
}
