export interface VerifiedConcept {
    concept_slug: string
    concept_name: string
    chapter: string
    class_level: string[]
    trigger_keywords: string[]
    full_content_competitive: string
    full_content_board: string
    key_equations: { latex: string; meaning: string }[]
    common_mistakes: string[]
    physics_verified: boolean
}

export const VERIFIED_CONCEPTS: VerifiedConcept[] = [
    {
        concept_slug: "kvl",
        concept_name: "Kirchhoff's Voltage Law",
        chapter: "Current Electricity",
        class_level: ["12"],
        trigger_keywords: [
            "kvl", "kirchhoff voltage", "loop rule",
            "voltage law", "sum of voltages",
            "mesh", "kirchhoff's second law"
        ],
        full_content_competitive: `
⚡ Kirchhoff's Voltage Law (KVL)

🚰 Picture this first

Imagine hiking a circular mountain trail.
You climb UP a hill — you GAIN potential energy.
You walk DOWN a valley — you LOSE potential energy.
You return to your starting point — net height change = zero.

That's KVL. Exactly that.

---

🔌 Now replace the trail with a circuit loop

| On the hiking trail | In the circuit |
|---|---|
| Height (elevation) | Electric potential (voltage) |
| Climbing UP a hill | Crossing battery from − to + |
| Walking DOWN a valley | Crossing resistor in current direction |
| Return to start = zero net height | Complete loop = zero net voltage |

So naturally: **ΣV = 0** around any closed loop

You didn't memorize this. You just saw WHY it must be true.

---

🔢 Quick example

Loop: ε = 10V, r = 1Ω, R = 4Ω, find I.

Starting from battery negative terminal, going clockwise:
+ε − I·r − I·R = 0
+10 − I(1) − I(4) = 0
10 = 5I
**I = 2A** ✓

Check: 10 − 2(1) − 2(4) = 10 − 2 − 8 = 0 ✓

---

🎯 JEE Strategy

- Apply KVL to the SIMPLEST loop first
- Sign rule: battery − to + → **+ε** (rise); resistor in current direction → **−IR** (drop)
- For complex circuits: assign loop currents, write one KVL equation per unknown
- ⚠️ Trap: Getting sign wrong when traversing against current direction → IR becomes +IR
- ⏱ ~2 min for multi-loop problems in JEE

---

⚠️ One thing students always get wrong

"Climbing a hill means losing potential energy."
**WRONG. Climbing UP = GAINING potential energy.**
This is the #1 KVL sign error.
Going from − to + terminal of battery = voltage RISES.
Going through resistor in current direction = voltage DROPS.
Never mix these up.

---

💡 "Go around any loop, sum all voltage rises and drops — they always equal zero."

---

❓ Does this make sense to you?

In a loop with EMF 12V and two resistors 2Ω and 4Ω in series, what is the current?

(A) 6A  (B) 3A  (C) 2A  (D) 1A

*(Think: 12 = I × (2+4), so I = ?)*
    `,
        full_content_board: `
⚡ Kirchhoff's Voltage Law (KVL)

🚰 Picture this first

Imagine hiking a circular mountain trail.
Climb UP = GAIN height. Walk DOWN = LOSE height.
Return to start = zero net change in height.
KVL works exactly the same way with voltage.

---

📝 How to write this in board exam

**Statement (write this first — 1 mark):**
"The algebraic sum of all potential differences
(EMF and IR drops) around any closed loop
in a circuit is zero."

**Mathematical form:**
ΣV = 0  or  ΣE = ΣIR

**Sign convention:**
- EMF (battery − to +): take as **positive**
- Voltage drop across resistor (in current direction): take as **negative**

**Derivation basis:** Conservation of energy
(Energy gained from source = Energy lost in resistors)

**Worked example (3-mark question):**

Given: ε = 12V, r = 2Ω, R = 4Ω
Find: Current I

Step 1 — Apply KVL to the loop:
ε − I·r − I·R = 0

Step 2 — Substitute values:
12 − I(2) − I(4) = 0

Step 3 — Solve:
12 = 6I
**I = 2A**

Step 4 — Conclusion:
The current in the circuit is 2 Amperes.

---

⚠️ Board exam mistake alert

Students write KVL without stating the
sign convention first. Examiners deduct marks.
Always write: "Taking clockwise direction as positive..."
before writing the KVL equation.

Marks breakdown:
- Statement: 1 mark
- Equation with sign convention: 1 mark
- Numerical substitution + answer: 1 mark

---

💡 "State law → Write sign convention → Apply equation → Solve → Conclude."
    `,
        key_equations: [
            { latex: "\\sum V = 0", meaning: "Sum of all voltages around closed loop = 0" },
            { latex: "\\sum E = \\sum IR", meaning: "Total EMF = Total voltage drop" }
        ],
        common_mistakes: [
            "Saying climbing a hill = losing potential energy (WRONG — climbing UP = GAINING)",
            "Wrong sign when traversing against assumed current direction",
            "Not stating sign convention before writing KVL in board exams"
        ],
        physics_verified: true
    },

    {
        concept_slug: "kcl",
        concept_name: "Kirchhoff's Current Law",
        chapter: "Current Electricity",
        class_level: ["12"],
        trigger_keywords: [
            "kcl", "kirchhoff current", "junction rule",
            "current law", "kirchhoff's first law",
            "node", "current at junction"
        ],
        full_content_competitive: `
⚡ Kirchhoff's Current Law (KCL)

🚰 Picture this first

Water flowing into a pipe junction.
Water flowing in = water flowing out.
No water appears. No water disappears.
The junction doesn't store anything.

That's KCL. Charge conservation at a node.

---

🔌 Now replace water with electric current

| Water junction | Circuit node |
|---|---|
| Water flow rate in (L/s) | Current entering node (A) |
| Water flow rate out (L/s) | Current leaving node (A) |
| Conservation of water | Conservation of charge |

So naturally: **ΣI_in = ΣI_out**
Or equivalently: **ΣI = 0** (algebraic sum at any node)

---

🔢 Quick example

At a junction: I₁ = 5A in, I₂ = 3A in, I₃ = 2A out, find I₄.

ΣI_in = ΣI_out
5 + 3 = 2 + I₄
**I₄ = 6A** (leaving the junction) ✓

---

🎯 JEE Strategy

- KCL is based on **conservation of charge** — charge cannot accumulate at a node
- Apply KCL at every node that has an unknown current
- If you get a negative value → current direction was assumed wrong (just flip the direction)
- Works for DC AND AC at any instant
- ⚠️ Trap: Missing a branch — always count ALL wires connected to a node
- ⏱ ~30 seconds per node in JEE

---

⚠️ One thing students always get wrong

Missing one of the branches at a junction.
Always draw the junction first, mark ALL wires,
then count. Missing even one branch makes
the entire circuit solution wrong.

---

💡 "Current in = Current out. At every junction. Always. No exceptions."

---

❓ Does this make sense to you?

At a node: I₁ = 4A enters, I₂ = 7A enters, I₃ = 5A leaves. Find I₄.

(A) 2A leaving  (B) 6A leaving  (C) 6A entering  (D) 16A leaving

*(Think: total in = total out)*
    `,
        full_content_board: `
⚡ Kirchhoff's Current Law (KCL)

🚰 Picture this first

Water at a pipe junction flows in and out.
The amount flowing in always equals the amount flowing out.
Electric current at a circuit node works identically.

---

📝 How to write this in board exam

**Statement (write this first — 1 mark):**
"The algebraic sum of all currents meeting
at a junction in a circuit is zero.
Equivalently, the sum of currents entering
a junction equals the sum of currents leaving it."

**Mathematical form:**
ΣI = 0  or  ΣI_in = ΣI_out

**Basis:** Conservation of electric charge

**Worked example:**
At node P: I₁ = 2A (in), I₂ = 3A (in), I₃ = ?

Step 1 — Apply KCL:
ΣI_in = ΣI_out
2 + 3 = I₃

Step 2 — Solve:
**I₃ = 5A** (leaving node P)

---

⚠️ Board exam tip

Always specify direction (entering/leaving) for each current.
Examiners want to see you understand KCL,
not just use numbers.

Marks: Statement (1) + Equation (1) + Solution (1)

---

💡 "State law → Draw junction → Mark all currents → Apply ΣI_in = ΣI_out."
    `,
        key_equations: [
            { latex: "\\sum I = 0", meaning: "Algebraic sum of currents at junction = 0" },
            { latex: "\\sum I_{in} = \\sum I_{out}", meaning: "Current in = Current out at any node" }
        ],
        common_mistakes: [
            "Missing one branch when counting currents at junction",
            "Forgetting to specify entering/leaving direction in board answers",
            "Applying KCL to the whole circuit instead of at specific nodes"
        ],
        physics_verified: true
    },

    {
        concept_slug: "ohms-law",
        concept_name: "Ohm's Law",
        chapter: "Current Electricity",
        class_level: ["12"],
        trigger_keywords: [
            "ohm", "ohm's law", "v=ir", "v = ir",
            "voltage current resistance", "ohmic",
            "resistance formula"
        ],
        full_content_competitive: `
⚡ Ohm's Law

🚰 Picture this first

Water flowing through a pipe.
Wider pipe = more water flows for same pressure.
Narrower pipe = less water flows.
More pressure = more flow regardless of pipe.

Voltage is pressure. Current is flow. Resistance is pipe narrowness.

---

🔌 Now replace water with electricity

| Water pipe | Electric circuit |
|---|---|
| Water pressure difference | Voltage V (Volts) |
| Water flow rate | Current I (Amperes) |
| Pipe narrowness | Resistance R (Ohms Ω) |

More pressure → more flow. More resistance → less flow.
So V ∝ I and R is the constant of proportionality.
Naturally: **V = IR**

---

🔢 Quick example

R = 10Ω, V = 5V → I = V/R = 5/10 = **0.5A** ✓

---

🎯 JEE Strategy

- Ohm's law is **NOT universal** — semiconductors and diodes don't obey it
- Ohmic conductor: V-I graph is straight line through origin
- Non-Ohmic: curved V-I graph (diode, transistor, electrolyte)
- Three forms: V = IR, I = V/R, R = V/I — know when to use each
- ⚠️ Trap: Applying V=IR to a diode or LED — they are non-Ohmic
- ⏱ ~30 seconds for direct application

---

⚠️ One thing students always get wrong

Applying Ohm's law to everything including diodes and transistors.
Ohm's law only holds when R is **constant**
(independent of V, I, and temperature).
Materials where R changes with voltage = non-Ohmic.

---

💡 "More voltage, more current through the same resistance. But only if R stays constant."

---

❓ Does this make sense to you?

Which device does NOT obey Ohm's law?

(A) Copper wire  (B) Nichrome wire  (C) Semiconductor diode  (D) Carbon resistor

*(Think: which has a curved V-I graph?)*
    `,
        full_content_board: `
⚡ Ohm's Law

🚰 Picture this first

Water flows more through a wider pipe at the same pressure.
Voltage is pressure, current is flow, resistance is pipe width.
More voltage → more current. More resistance → less current.

---

📝 How to write this in board exam

**Statement:**
"At constant temperature, the current flowing
through a conductor is directly proportional
to the potential difference across its ends."

**Mathematical form:**
V ∝ I → V = IR

where R = resistance of the conductor (constant at fixed temp)

**Unit of resistance:** Ohm (Ω)
1 Ohm = 1 Volt / 1 Ampere

**Worked example:**
A resistor of 20Ω has 100V across it. Find current.

Step 1: V = IR
Step 2: I = V/R = 100/20
**I = 5A**

---

⚠️ Limitation of Ohm's law (board examiners ask this):

Ohm's law holds only for:
- Metallic conductors at constant temperature
- It does NOT hold for: semiconductors, diodes,
  electrolytes, discharge tubes

Marks: Statement (1) + Formula + unit (1) + Numerical (1)

---

💡 "State the law → write V=IR → state unit → solve numerically → state limitation."
    `,
        key_equations: [
            { latex: "V = IR", meaning: "Voltage = Current × Resistance" }
        ],
        common_mistakes: [
            "Applying V=IR to diodes and semiconductors — they are non-Ohmic",
            "Forgetting to state limitation of Ohm's law in board answers",
            "Confusing which form to use: V=IR, I=V/R, or R=V/I"
        ],
        physics_verified: true
    },

    {
        concept_slug: "emf-internal-resistance",
        concept_name: "EMF and Internal Resistance",
        chapter: "Current Electricity",
        class_level: ["12"],
        trigger_keywords: [
            "emf", "internal resistance", "terminal voltage",
            "e minus ir", "ε", "cell emf", "battery emf",
            "terminal pd", "lost volts"
        ],
        full_content_competitive: `
⚡ EMF and Internal Resistance

🚰 Picture this first

A water pump with friction inside its own pipes.
The pump generates full pressure (EMF).
But internal friction (internal resistance r) wastes some pressure.
What comes out of the tap (terminal voltage) is always less.

---

🔌 Now replace the pump with a cell

| Pump analogy | Electric cell |
|---|---|
| Pump's total pressure generated | EMF ε |
| Friction inside pump's own pipe | Internal resistance r |
| Pressure available at tap | Terminal voltage V |
| Water flow rate | Current I |

Energy from pump − energy lost inside = energy available outside.
So: **V = ε − Ir** (during discharge)

During charging (current reversed into cell):
**V = ε + Ir**

---

🔢 Quick example

ε = 6V, r = 2Ω, R = 4Ω. Find I and terminal voltage.

I = ε/(R+r) = 6/(4+2) = **1A**
V = ε − Ir = 6 − (1×2) = **4V** ✓

Or: V = IR = 1×4 = 4V ✓ (same answer, good check)

---

🎯 JEE Strategy

- Open circuit (I=0): **V = ε** exactly (terminal voltage = EMF)
- Short circuit (R=0): **I = ε/r** maximum, V = 0
- Charging cell: **V = ε + Ir** (terminal voltage > EMF)
- Discharging cell: **V = ε − Ir** (terminal voltage < EMF)
- ⚠️ Trap: Using V = ε − Ir during charging — sign FLIPS
- Maximum power transfer: when R = r (internal = external)
- ⏱ ~1 min in JEE

---

⚠️ One thing students always get wrong

Using V = ε − Ir when the cell is charging.
During charging, current enters the positive terminal.
The equation FLIPS to V = ε + Ir.
Check: is cell delivering current (−Ir) or receiving current (+Ir)?

---

💡 "The cell always wastes some voltage on itself. Terminal voltage is always less than EMF during discharge."

---

❓ Does this make sense to you?

A cell with EMF 9V and internal resistance 3Ω delivers current through 6Ω. What is terminal voltage?

(A) 9V  (B) 6V  (C) 3V  (D) 4.5V

*(Think: I = 9/9 = 1A, V = 9 − 1×3 = ?)*
    `,
        full_content_board: `
⚡ EMF and Internal Resistance

🚰 Picture this first

A pump with internal friction.
Total pressure generated = EMF.
Pressure lost inside = I × r.
Pressure at outlet = Terminal voltage = ε − Ir.

---

📝 How to write this in board exam

**Definitions:**
"EMF (ε) of a cell is the work done by the cell
per unit charge to move charge through the
complete circuit including internal resistance."

"Internal resistance (r) is the resistance
offered by the electrolyte of the cell."

"Terminal voltage (V) is the potential difference
across the terminals of the cell when current is flowing."

**Relation:**
V = ε − Ir (during discharge)

**Derivation (5-mark question):**
Work done by cell = εq
Work done against internal resistance = I²rt = Iqr
Work done in external circuit = Vq

By energy conservation:
εq = Iqr + Vq
ε = Ir + V
**V = ε − Ir**

**Numerical:**
ε = 12V, r = 2Ω, R = 10Ω
I = ε/(R+r) = 12/12 = 1A
V = ε − Ir = 12 − 2 = **10V**

Marks: Definitions (2) + Derivation (2) + Numerical (1)

---

💡 "Define EMF → Define internal resistance → Derive V = ε−Ir using energy conservation → Solve."
    `,
        key_equations: [
            { latex: "V = \\varepsilon - Ir", meaning: "Terminal voltage during discharge" },
            { latex: "V = \\varepsilon + Ir", meaning: "Terminal voltage during charging" },
            { latex: "I = \\frac{\\varepsilon}{R+r}", meaning: "Current in circuit" }
        ],
        common_mistakes: [
            "Using V = ε − Ir during charging (should be V = ε + Ir)",
            "Forgetting that open circuit terminal voltage = EMF exactly",
            "Not using energy conservation basis in board derivation"
        ],
        physics_verified: true
    },

    {
        concept_slug: "resistance-resistivity",
        concept_name: "Resistance and Resistivity",
        chapter: "Current Electricity",
        class_level: ["12"],
        trigger_keywords: [
            "resistivity", "resistance formula", "r = pl/a",
            "ρ", "stretch wire", "wire stretched",
            "conductivity", "temperature resistance"
        ],
        full_content_competitive: `
⚡ Resistance and Resistivity

🚰 Picture this first

Drinking through a straw.
Long thin straw = very hard to drink through.
Short wide straw = easy.
The material of the straw determines how sticky the liquid is.

Length increases difficulty. Width decreases it. Material is resistivity.

---

🔌 Now replace the straw with a wire

| Straw analogy | Wire |
|---|---|
| Straw length | Wire length L |
| Straw cross-section area | Cross-section area A |
| Stickiness of liquid | Resistivity ρ (material property) |

R ∝ L and R ∝ 1/A, so: **R = ρL/A**

ρ depends only on material and temperature.
R depends on material AND dimensions.

---

🔢 Wire stretching (JEE favourite)

Wire of resistance R stretched to double length.
Volume conserved: A × L = A' × 2L → A' = A/2

New R = ρ(2L)/(A/2) = **4R** — resistance becomes 4 times!

General rule: if length becomes n times → R becomes **n² times**

---

🎯 JEE Strategy

- **Stretching:** Length → n times, Area → 1/n times, R → n² times
- **Cutting in half:** Each piece R/2. In parallel: R/4.
- Temperature: metals → R increases; semiconductors → R decreases
- ρ(copper) = 1.72×10⁻⁸ Ωm; ρ(nichrome) = 1.1×10⁻⁶ Ωm (60× higher)
- ⚠️ Trap: Forgetting area also changes when wire is stretched
- ⏱ ~1 min in JEE

---

⚠️ One thing students always get wrong

When a wire is stretched, students change only L and forget A also changes.
Both change simultaneously (volume = AL = constant).
Length doubles → area halves → R quadruples.
Never change just one variable.

---

💡 "Resistivity is the material's property. Resistance depends on the material AND the shape."

---

❓ Does this make sense to you?

A wire of resistance 16Ω is stretched to 4 times its length. New resistance is:

(A) 4Ω  (B) 64Ω  (C) 256Ω  (D) 16Ω

*(Think: n=4, so R becomes n²=16 times: 16×16 = ?)*
    `,
        full_content_board: `
⚡ Resistance and Resistivity

🚰 Picture this first

Long thin straw is harder to drink through than short wide straw.
R = ρL/A captures this exactly.

---

📝 How to write this in board exam

**Definition of resistivity:**
"Resistivity (ρ) of a material is defined as
the resistance of a conductor of unit length
and unit cross-sectional area made of that material."

**Formula derivation:**
Experimentally: R ∝ L and R ∝ 1/A
Combining: R = ρ × L/A
where ρ = resistivity (Ω·m), L = length (m), A = area (m²)

**Unit:** Ohm-metre (Ω·m)

**Worked example:**
Copper wire: ρ = 1.72×10⁻⁸ Ω·m, L = 2m, A = 0.5×10⁻⁶ m²
R = ρL/A = (1.72×10⁻⁸ × 2) / (0.5×10⁻⁶)
**R = 0.0688 Ω**

Marks: Definition (1) + Formula derivation (2) + Numerical (2)

---

💡 "Define resistivity → State R = ρL/A → Give units → Solve substituting values."
    `,
        key_equations: [
            { latex: "R = \\frac{\\rho L}{A}", meaning: "Resistance = Resistivity × Length / Area" },
            { latex: "\\text{If L} \\rightarrow nL, \\text{ then R} \\rightarrow n^2R", meaning: "When wire is stretched n times, resistance becomes n² times" }
        ],
        common_mistakes: [
            "When wire is stretched, forgetting area also changes (area halves when length doubles)",
            "Confusing resistivity (ρ) with resistance (R) — ρ is material property, R depends on dimensions",
            "Not conserving volume when solving wire-stretching problems"
        ],
        physics_verified: true
    }
]
