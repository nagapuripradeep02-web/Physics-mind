"use client";

import dynamic from "next/dynamic";
import type { Lesson } from "@/lib/teacherEngine";

const TeacherPlayer = dynamic(() => import("@/components/TeacherPlayer"), { ssr: false });
const WireSimulator = dynamic(() => import("@/components/simulations/WireSimulator"), { ssr: false });
const CircuitSimulator = dynamic(() => import("@/components/simulations/CircuitSimulator"), { ssr: false });

// Hardcoded lesson from the KVL test — replace with real output after Test 2
const HARDCODED_LESSON: Lesson = {
    sim_type: "circuit",
    sim_config: { emf: 10, r1: 1, r2: 4 },
    teaching_script: [
        {
            id: "step_1",
            text: "**Kirchhoff's Voltage Law (KVL)** states that the sum of all voltages around any closed loop is zero. Notice the circuit loop — energy supplied by the battery equals energy lost across resistors.",
            sim_action: "highlight_formula",
            sim_target: "kvl_loop",
            sim_state: {},
            pause_ms: 3000,
        },
        {
            id: "step_2",
            text: "See the **EMF source** (battery) — it provides the driving voltage ε. Watch as the circuit shows ε = 10V pushing current through both resistors.",
            sim_action: "highlight_value",
            sim_target: "emf_source",
            sim_state: { emf: 10 },
            pause_ms: 2500,
        },
        {
            id: "step_3",
            text: "Notice the **current value** I = ε/(r+R). Watch as I = 10/(1+4) = 2A flows through the loop, dropping voltage across each resistor.",
            sim_action: "highlight_value",
            sim_target: "current_value",
            sim_state: { r1: 1, r2: 4 },
            pause_ms: 3000,
        },
        {
            id: "step_4",
            text: "See the **voltage drops** — 2V across r₁ and 8V across R₂. Watch as ε − I·r − I·R = 10 − 2 − 8 = 0 ✓ — this is KVL!",
            sim_action: "highlight_value",
            sim_target: "voltage_drop",
            sim_state: {},
            pause_ms: 3500,
        },
    ],
    key_insight: "KVL is conservation of energy — every joule given by the battery is exactly consumed by resistors.",
    jee_trap: "JEE setters often ask KVL with multiple loops — apply it to EACH loop independently with consistent current directions.",
    interactive_prompt: "Try changing the EMF slider and watch the current and voltage drops update in real time.",
};

export default function TestTeacherPage() {
    return (
        <div className="min-h-screen bg-black p-6 space-y-10 text-white">
            <h1 className="text-xl font-bold text-blue-400">Teacher Engine — Test Page</h1>

            {/* TEST 4: TeacherPlayer */}
            <section>
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Test 4 — TeacherPlayer (KVL lesson, circuit sim)
                </h2>
                <div className="max-w-3xl">
                    <TeacherPlayer lesson={HARDCODED_LESSON} />
                </div>
            </section>

            {/* TEST 5A: WireSimulator controlled props */}
            <section>
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Test 5A — WireSimulator: state + highlighted + interactive=false
                </h2>
                <p className="text-xs text-zinc-500 mb-2">Expected: wire stretched (length=2, area=0.5), formula glowing blue, sliders dimmed</p>
                <div className="max-w-sm border border-zinc-800 rounded-xl p-3">
                    <WireSimulator
                        state={{ length: 2, area: 0.5, material: "copper" }}
                        highlighted="resistance_formula"
                        interactive={false}
                    />
                </div>
            </section>

            {/* TEST 5B: WireSimulator default (no props) */}
            <section>
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Test 5B — WireSimulator: default (no props, fully interactive)
                </h2>
                <p className="text-xs text-zinc-500 mb-2">Expected: works exactly as original, sliders move freely</p>
                <div className="max-w-sm border border-zinc-800 rounded-xl p-3">
                    <WireSimulator interactive={true} />
                </div>
            </section>

            {/* TEST 5C: CircuitSimulator controlled props */}
            <section>
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Test 5C — CircuitSimulator: state + kvl_loop highlighted + interactive=false
                </h2>
                <p className="text-xs text-zinc-500 mb-2">Expected: circuit at emf=10 r1=1 r2=4, loop glowing blue, sliders dimmed</p>
                <div className="max-w-sm border border-zinc-800 rounded-xl p-3">
                    <CircuitSimulator
                        state={{ emf: 10, r1: 1, r2: 4 }}
                        highlighted="kvl_loop"
                        interactive={false}
                    />
                </div>
            </section>
        </div>
    );
}
