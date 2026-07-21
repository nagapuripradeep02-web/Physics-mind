-- supabase_2026-07-21_seed_capacitance_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for capacitance.json —
-- the field_3d 'capacitance' scenario (Class 12 Ch.2 §2.11-2.12), the
-- doctrine proof-run for the international-curriculum guidelines
-- (worktree feat/curriculum-flex-pilot). Direct sequel of
-- parallel_plate_capacitor_field: opens on that diamond's own apparatus
-- (plates + gap ruler + docked battery) and teaches C = Q/V = ε₀A/d, the
-- fixed ratio that diamond deliberately stopped short of.
--
-- Authored 2026-07-21 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases (verbatim, physics block §7).
--
-- Migration is AUTHORED, NOT APPLIED — quality_auditor's pre-run step
-- applies it (json_author is forbidden from apply_migration). Drill-down
-- itself is DEFERRED (Rule 18, 2026-06-10 directive) — the
-- confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase per the
-- documented false-FAIL scar (memory: auditor-cluster-registry-false-fail).
-- Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real student-voice phrasings (lowercase,
-- idiomatic, no textbook prose), verbatim from the physics block §7.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive states + clusters (architect skeleton §6):
--   STATE_2 — the core abstraction / THE stuck point ("how can C not depend
--             on the charge I put on it") — why_ratio_constant, what_is_a_farad,
--             charge_stored_vs_capacity
--   STATE_5 — the counter-intuitive geometry flip, strong surviving intuition —
--             why_smaller_gap_bigger_c, where_does_drained_charge_go,
--             fixed_v_vs_fixed_q (the isolated-capacitor variant, flagged not
--             taught, in STATE_5's narration)
--   STATE_6 — the mathematical abstraction where board/JEE students fumble —
--             derivation_chain_confusion, sigma_vs_q, why_v_equals_ed

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 why_ratio_constant deep-dive ──────────────────────────────
(
  'why_ratio_constant',
  'capacitance',
  'STATE_2',
  'Why doesn''t capacitance change when I add more charge — shouldn''t C go up?',
  'Student assumes capacitance behaves like a "fullness" quantity that grows as you pour more charge in, by analogy with filling a container. It doesn''t: capacitance is the RATIO Q/V, not the charge Q itself, and both Q and V rise together in exact lockstep — Q = CV holds at every instant with the SAME C. The sim makes this concrete: STATE_2 steps the voltage 6 → 12 → 24 → 12 volts and the plate charge dutifully doubles, doubles again, then halves back — but the glowing Q/V ratio readout sits frozen at 0.0885 nC per volt the entire time, never ticking once. Giving the capacitor more charge or more voltage changes what it is currently HOLDING, never what it structurally IS. What actually sets C is answered two states later (STATE_5): pure geometry, C = ε₀A/d.',
  ARRAY[
    'why doesnt capacitance change when i add more charge',
    'if i put more charge shouldnt C go up',
    'why is Q over V always the same number',
    'does capacitance depend on how much charge is on it',
    'i dont get how the ratio stays fixed'
  ],
  'pending_review'
),
-- ─── STATE_2 what_is_a_farad deep-dive ─────────────────────────────────
(
  'what_is_a_farad',
  'capacitance',
  'STATE_2',
  'What even is a farad — is it a huge unit or a tiny one?',
  'Student has no intuitive scale for the farad because every real capacitor they will ever handle is measured in picofarads (pF, 10⁻¹²) or microfarads (µF, 10⁻⁶) — the sim''s own HUD never once shows a bare "F". One farad is an ENORMOUS amount of capacitance: this concept''s own plates, 1 cm² at 1 mm apart, manage only 88.5 pF — you would need plates the size of a small country at that same spacing to reach one farad. That is exactly why every readout in the sim, and every capacitor a student will meet in a real circuit or lab, is quoted in pF or µF: the farad is a unit sized for a formula, not for a benchtop component.',
  ARRAY[
    'what even is a farad',
    'is a farad a really huge unit',
    'why do we always see picofarads not farads',
    'what does one farad actually mean',
    'how big is one farad compared to real capacitors'
  ],
  'pending_review'
),
-- ─── STATE_2 charge_stored_vs_capacity deep-dive ───────────────────────
(
  'charge_stored_vs_capacity',
  'capacitance',
  'STATE_2',
  'What''s the difference between the charge stored and the capacitance — isn''t capacity just how much charge it holds?',
  'Student conflates Q (how much charge happens to be on the plates right now) with C (a fixed property of the device''s geometry) because everyday "capacity" language — a bucket''s capacity, a tank''s capacity — describes how much a container CAN hold, which sounds exactly like charge. The cleaner picture: C is the device''s fixed APPETITE, decided by A and d before you ever connect a battery; Q is simply how much charge that appetite is currently satisfying at the applied V. Same capacitor, three different voltages (STATE_2''s 6/12/24 V steps), three different Q values — but one unchanging C. The bucket analogy IS salvageable if you fix it: C is the bucket''s fixed cross-sectional area (geometry), Q is the water currently in it (which rises and falls), and V is the water level — Q = C × V is just "volume = area × height".',
  ARRAY[
    'whats the difference between charge and capacitance',
    'is Q the same thing as C',
    'capacity sounds like how much charge it holds so why isnt that C',
    'if Q changes but C doesnt then what is C actually measuring',
    'is capacitance like the size of a bucket and charge like the water'
  ],
  'pending_review'
),
-- ─── STATE_5 why_smaller_gap_bigger_c deep-dive ────────────────────────
(
  'why_smaller_gap_bigger_c',
  'capacitance',
  'STATE_5',
  'Why does moving the plates closer together increase capacitance — shouldn''t less space mean less room for charge?',
  'Student imports a "more room = more storage" spatial intuition that is simply the wrong mental model for how a capacitor stores charge — charge sits ON the plate surfaces, not floating in the gap volume, so gap size was never "storage room" to begin with. What actually matters is how strongly each plate''s charge is HELD in place by its oppositely-charged neighbour: bring the plates closer and the attractive pull across the gap gets stronger, so the SAME voltage manages to pack more charge onto the plates before the electric field (and hence V = E·d) catches up to the source voltage. The sim shows the inverse move directly: STATE_5 widens the gap at fixed V and charge visibly DRAINS off the plates, C and Q both falling to half — closer is the opposite, and C = ε₀A/d captures it exactly (C is inversely proportional to d).',
  ARRAY[
    'why does moving plates closer increase capacitance',
    'shouldnt less space mean less room for charge',
    'why is C bigger when d is smaller',
    'how does a smaller gap let it hold more charge',
    'doesnt closer plates mean less capacity not more'
  ],
  'pending_review'
),
-- ─── STATE_5 where_does_drained_charge_go deep-dive ────────────────────
(
  'where_does_drained_charge_go',
  'capacitance',
  'STATE_5',
  'Where does the extra charge go when the gap widens — does it just disappear?',
  'Student worries charge is being destroyed when STATE_5''s widening gap makes the plate charge visibly shrink, because nothing about a capacitor "losing charge" maps cleanly onto everyday conservation intuitions the way, say, water draining from one container to another does. Nothing is destroyed: the battery stays connected and holds V fixed, so when the widening gap lowers the plates'' capacitance, they can no longer hold as much charge at that same voltage — the excess charge simply flows back out through the wires into the battery, exactly the reverse of the charging flow from STATE_1. The sim makes this literal, not metaphorical: the same charge-carrying beads that flowed IN during STATE_1''s charging now visibly flow BACKWARD toward the battery as the gap widens. Charge is conserved; it just relocates from the plate surface back into the circuit.',
  ARRAY[
    'where does the extra charge go when the gap widens',
    'does the charge just disappear when you pull the plates apart',
    'why does charge flow back to the battery',
    'is the charge destroyed or does it go somewhere',
    'why does pulling the plates apart make charge leave'
  ],
  'pending_review'
),
-- ─── STATE_5 fixed_v_vs_fixed_q deep-dive (isolated-capacitor variant, narration-only) ───
(
  'fixed_v_vs_fixed_q',
  'capacitance',
  'STATE_5',
  'What if the battery wasn''t connected when I pulled the plates apart — does Q always change when d changes, or only when the battery stays connected?',
  'Student generalizes STATE_5''s fixed-V result ("widen the gap, Q drains, C halves") to EVERY way a capacitor''s geometry can change, missing that the sim deliberately teaches only the battery-CONNECTED case. This concept''s own physics block flags the isolated case as a real but SEPARATE scenario, narration-only, never visually implied: if the capacitor is instead disconnected from the battery FIRST, the charge Q on the plates has nowhere to go and stays exactly fixed as the plates are pulled apart. Since C still falls (C = ε₀A/d, unchanged by whether a battery is attached), and Q = CV must still hold, V is now the quantity forced to RISE to compensate — the opposite of the connected case, where V stays fixed and Q falls. The device-property fact C = ε₀A/d never changes either way; what changes is which of Q or V is the free variable, decided entirely by whether the battery is still in the circuit.',
  ARRAY[
    'what if the battery wasnt connected when i pulled the plates apart',
    'does Q always change or only when the battery stays connected',
    'whats different if the capacitor is isolated instead of connected to a battery',
    'why does it matter if the battery stays attached',
    'if i disconnect it first does Q change when d changes'
  ],
  'pending_review'
),
-- ─── STATE_6 derivation_chain_confusion deep-dive ──────────────────────
(
  'derivation_chain_confusion',
  'capacitance',
  'STATE_6',
  'Where does epsilon-naught come from in this formula, and why are there three separate steps to get to C = ε₀A/d?',
  'Student wants to treat C = ε₀A/d as a formula to memorize rather than a chain of three ALREADY-FAMILIAR facts stacked together, so each individual link (σ = Q/A, E = σ/ε₀, V = E·d) feels like a new, disconnected fact instead of a recombination of things already taught. STATE_6 makes the chain concrete and reversible: spread the known charge Q over the known area A to get the surface density σ = Q/A (nothing new — just a definition); that surface density sets the SAME uniform field E = σ/ε₀ this student met in the prerequisite parallel_plate_capacitor_field diamond; multiply that field by the known gap d to recover the applied voltage V = E·d (also nothing new — the field-times-distance relationship). Substitute all three into the definition C = Q/V and every quantity except A, d, and ε₀ cancels algebraically, leaving C = ε₀A/d. Nothing invents epsilon-naught — it enters through E = σ/ε₀, a constant of nature this student already used to compute the field between two plates.',
  ARRAY[
    'wheres epsilon naught come from in this formula',
    'why are there three steps to get to C equals epsilon A over d',
    'how do sigma and E and V all connect together',
    'why cant we just say C equals epsilon A over d without deriving it',
    'im lost on how this chain of formulas fits together'
  ],
  'pending_review'
),
-- ─── STATE_6 sigma_vs_q deep-dive ──────────────────────────────────────
(
  'sigma_vs_q',
  'capacitance',
  'STATE_6',
  'What''s the difference between sigma and Q — isn''t sigma just charge divided by area?',
  'Student correctly recalls the FORMULA σ = Q/A but treats σ as merely "Q written differently" rather than a genuinely distinct physical quantity — a DENSITY, describing how thickly charge is smeared over the plate surface, independent of how big that surface happens to be. Two plates carrying the exact same total charge Q but different areas A have different σ (the smaller plate is more densely charged); conversely, doubling the area at fixed σ (as STATE_4 does at fixed voltage) means the total charge Q must double to keep pace. σ is what actually drives the field, via E = σ/ε₀ — the field only cares how densely packed the charge is at the surface, not the plate''s total charge or its total area separately. Q is a property of the WHOLE plate; σ is a property of the surface, per unit area, and it is σ — not Q directly — that sets E.',
  ARRAY[
    'whats the difference between sigma and Q',
    'is sigma just charge divided by area',
    'why do we need sigma if we already have Q',
    'does sigma depend on the size of the plate',
    'is sigma the same on both plates'
  ],
  'pending_review'
),
-- ─── STATE_6 why_v_equals_ed deep-dive ─────────────────────────────────
(
  'why_v_equals_ed',
  'capacitance',
  'STATE_6',
  'Why does V equal E times d — how does a field turn into a voltage?',
  'Student has met V = W/q (work per unit charge, from electric_potential_meaning) and E as a force-per-charge field, but hasn''t yet connected the dots that in a UNIFORM field, moving a unit positive charge straight across the gap costs exactly (force per charge) × (distance) = E × d of work per unit charge — which is precisely the definition of a potential difference. Since the field between the plates is uniform (E is the SAME everywhere in the gap, the prerequisite diamond''s own result), the work-per-charge to cross it doesn''t depend on the path or the starting point — it is simply E multiplied by the straight-line distance d between the plates. V = E·d is not a new law; it is V = W/q evaluated for the one specific case of a uniform field crossed in a straight line, which is exactly the geometry a parallel-plate capacitor sets up.',
  ARRAY[
    'why does V equal E times d',
    'how does the field turn into a voltage',
    'why is voltage just field times distance here',
    'wheres this V equals Ed formula come from',
    'is V equals Ed the same as V equals W over q'
  ],
  'pending_review'
)
ON CONFLICT (cluster_id) DO UPDATE
SET concept_id        = EXCLUDED.concept_id,
    state_id          = EXCLUDED.state_id,
    label             = EXCLUDED.label,
    description       = EXCLUDED.description,
    trigger_examples  = EXCLUDED.trigger_examples,
    status            = EXCLUDED.status,
    updated_at        = now();
