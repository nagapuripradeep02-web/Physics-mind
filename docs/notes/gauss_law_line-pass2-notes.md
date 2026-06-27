# Pass-2 four-question notes — `gauss_law_line`

Renderer family: **field_3d** (scenario `gauss_law_line`). Q3 motion is authored in
`field_3d_config.states.STATE_N.gauss_line.*` via the renderer's per-state reveal `_at_ms` keys
(read on the state clock, Rule 26); Q2 think-time is `pause_after_ms` on the prediction `tts_sentence`.
All six `pause_after_ms` from the physics block are carried verbatim (s1_2=2600, s2_1=2600, s3_1=2400,
s4_1=2800, s5_2=2500, s6_2=2800). No `reveal_at_tts_id` / `animate_in` in `scene_composition` — those
drive the PCPL/parametric family, not field_3d.

## STATE_1 — hook (the 1/r² instinct, planted)
1. **Not known yet:** how the field of an *extended line* weakens with distance — the student only knows
   the point-charge 1/r² law and will wrongly export it. The actual law (1/r) is invisible here.
2. **Feel the confusion:** s1_2 poses "what is your first guess for the law?" with `pause_after_ms: 2600`.
   No field arrows, no formula on canvas (`show_radial_arrows:false`, `show_cylinder:false`) — the student
   sits with their own guess, unresolved, for 2.6 s. Resolution is deliberately withheld to STATE_5/6.
3. **Moves/appears:** nothing reveals (by design) — only the line + λ markers populate. This is the one
   state where the absence of motion IS the pedagogy (an earned wrong belief, broken at STATE_6).
4. **Hand/eye:** `focal_primitive_id = question_label` (the falloff question, the physics-bearing prompt),
   not the wire tag. The eye lands on the 1/r? / 1/r² fork.

## STATE_2 — radial field
1. **Not known yet:** the *direction* of E (along the wire? toward the nearest bit? straight out?) and that
   |E| is the same all around a ring at distance r.
2. **Feel:** s2_1 offers the three-way direction choice with `pause_after_ms: 2600` before any arrow draws.
3. **Moves/appears:** the ring of ~12 equal radial wall arrows reveals at `radial_arrow_at_ms: 7800`
   (synced to s2_2 "straight out, at right angles"), and the r⊥ reference line grows in at
   `emerge_r_at_ms: 7800`. The arrows are equal length all round (cylindrical symmetry made visible).
4. **Hand/eye:** `focal_primitive_id = radial_label` ("E ∥ r̂, same |E| all around") — the symmetry payoff,
   not the question tag. Re-entry: line + λ markers + field point are visible in the first 5 s before the
   ring reveal at 7.8 s; nothing on screen is bare during orientation.

## STATE_3 — coaxial Gaussian cylinder
1. **Not known yet:** that ONE wrapped surface replaces the dq-by-dq Coulomb sum, and that a *cylinder*
   (not a sphere) matches the symmetry so E·area = E·(2πrL) on the curved wall.
2. **Feel:** s3_1 "Sphere, or cylinder — which one matches?" with `pause_after_ms: 2400`.
3. **Moves/appears:** the coaxial cylinder (wall + wireframe + two caps) fades in at
   `gaussian_fade_at_ms: 8600`; the L axial reference line grows at `emerge_L_at_ms: 15200` exactly when
   "height L" is said in s3_3. The ring arrows from STATE_2 carry over (`radial_arrow_at_ms:0`,
   `emerge_r_at_ms:0` → present at entry), giving the re-entry orientation. Two DISTINCT reference lines
   now on screen — r (billboarded camera-right) vs L (axial) — per the distinct-reference-lines scar.
4. **Hand/eye:** `focal_primitive_id = wall_area_label` ("curved wall area = 2πr·L") — the quantity the
   whole derivation hinges on.

## STATE_4 — end caps carry zero flux (SUPPORTING aha)
1. **Not known yet:** that the two flat caps carry *exactly* zero flux (E grazes them), so only the curved
   wall contributes. The default instinct is "every face of a closed surface carries flux."
2. **Feel:** s4_1 "Which pieces does the field actually pierce?" with `pause_after_ms: 2800` — the longest
   pause, on the hardest predict. Cylinder + ring arrows are already present (entry-visible) so the student
   reasons about a concrete object.
3. **Moves/appears:** grazing cap arrows + "Φ=0" tags reveal at `caps_reveal_at_ms: 8000` (synced to s4_2
   "it just grazes... zero flux on both caps"), contrasted against the piercing wall arrows kept visible.
   The caps pulse in BRIGHTNESS (not size — Rule 29) to draw the eye.
4. **Hand/eye:** `focal_primitive_id = wall_flux_label` ("Φ = Φ_wall = E·(2πr·L)") — the surviving term.

## STATE_5 — derivation, L cancels
1. **Not known yet:** that q_enc = λL, that Gauss gives Φ = λL/ε₀, and that the L *cancels* leaving
   E = λ/(2πε₀r) with no length dependence. ε₀ + the solved formula appear for the FIRST time here
   (pre-spoil guard — clean through STATE_1–4).
2. **Feel:** s5_2 "Set them equal and solve for E, and watch what happens to L" with `pause_after_ms: 2500`.
3. **Moves/appears:** the derivation panel writes in stepwise at `derivation_at_ms: 15600`,
   `derivation_duration_ms: 6000` — the renderer auto-splits into 4 sub-steps (Φ=E·2πrL → =λL/ε₀ →
   strike-L on both sides → ⇒ E=λ/(2πε₀r)). The struck-through L is the visual that makes "L cancels"
   honest. Cylinder + arrows + both reference lines are entry-visible for orientation.
4. **Hand/eye:** `focal_primitive_id = solved_field_label` ("E = λ/(2πε₀r) (no L left)").

## STATE_6 — 1/r NOT 1/r² (PRIMARY aha)
1. **Not known yet:** that the line falls off *slower* than a point charge — the STATE_1 instinct is wrong.
2. **Feel:** s6_2 "Back at the start you probably guessed the wire fades the same way. Does it?" with
   `pause_after_ms: 2800` — recalls the planted STATE_1 guess and makes the student commit before the reveal.
3. **Moves/appears:** concrete-first — the faint 1/r² point-charge ghost draws ALONE first, then the green
   1/r line curve draws beside it (`plot_draw_at_ms: 12000`, `plot_draw_duration_ms: 9000`) WHILE the
   `coordinated_sweep` (sweep_r_min 0.5 → sweep_r_max 3.6, end 28000) shrinks the 3D ring arrows as 1/r AND
   rides the tracking dot down the 1/r curve in lockstep. Continuous motion >0.1%/frame (D7 guard). The two
   curves share r=1 then diverge — the line sits ABOVE the point. `live_readout:true` shows E falling.
4. **Hand/eye:** `focal_primitive_id = falloff_compare_label` ("2πr·L grows linearly vs 4πr² grows as r²")
   — the *cause* of the slower falloff, the thing the aha rests on. Cylinder small at entry (r=0.5) so the
   sweep has room to grow outward; nothing bare during orientation.

## STATE_7 — exploration
1. **Not known yet (felt, not told):** the live coupling — push λ → all arrows grow together; drag r →
   arrows shrink as 1/r; E never depends on axial position.
2. **Feel:** n/a (explorer; no prediction pause).
3. **Moves/appears:** `sliders:true` → λ + r sliders render at FULL immediately (no clock-gated emergence —
   field3d_time_gated_visual_invisible_in_slider_state) and track live; the renderer's idle auto-sweep of r
   keeps the explorer MOVING hands-free so a headless capture isn't static (D1p). `emerge_r_at_ms:0` so the
   r line is full at entry. classifier: `gln.sliders===true → interactive` in deriveStateMeta.
4. **Hand/eye:** `focal_primitive_id = live_readout_label` ("drag r out → arrows shrink as 1/r"); the
   student's hand goes to the sliders bottom-right where the renderer mounts `#gln_sliders`.

## RHR / gesture check
RHR is **N/A** for this concept (radial electrostatic field, no cross-product direction — skeleton §10c
documents the absence). No gesture-mirror primitive needed; no escalation filed.

## Re-entry orientation
Every guided state (2–6) keeps the line + λ markers + (from STATE_3 on) the cylinder + ring arrows
entry-visible via `_at_ms: 0` seeds, so a returning student orients on the physical picture within the
first 5 s. The only delayed first reveals are the *new* content of each state (ring at 7.8 s in STATE_2,
cylinder fade at 8.6 s in STATE_3, caps at 8 s in STATE_4, derivation at 15.6 s in STATE_5, plot/sweep at
12 s in STATE_6) — and in each case prior-state context is already on screen, so no bare object sits alone
during orientation.
