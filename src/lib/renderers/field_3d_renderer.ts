// =============================================================================
// field_3d_renderer.ts
// Pre-built Three.js renderer for electric & magnetic field simulations.
// Engineer-written — NOT AI-generated.
//
// Architecture: reads window.SIM_CONFIG (Field3DConfig), draws any
// field scenario from that config. Zero hardcoded physics — everything
// is driven by the JSON.
//
// Scenarios supported (via config.scenario_type):
//   point_charge_positive  — radial field lines from +q
//   point_charge_negative  — radial field lines into -q
//   dipole                 — curved lines from + to -
//   parallel_plates        — uniform parallel lines between plates
//   solenoid_field         — dense lines inside, sparse outside
//   bar_magnet             — N→S external loops
//   straight_wire_current  — concentric circles around wire
//   changing_flux          — coil + moving magnet + EMF
//
// postMessage bridge:
//   IN:  { type: 'SET_STATE', state: 'STATE_N' }
//        { type: 'INIT_CONFIG', config: Field3DConfig }
//        { type: 'REPLAY_ANIMATIONS' }   ← admin harness: rewind one-shot anims
//        { type: 'PING' }
//   OUT: { type: 'SIM_READY' }          — on load
//        { type: 'STATE_REACHED', state: 'STATE_N' }  — on state apply
//        { type: 'PONG' }
// =============================================================================

// ── TypeScript interfaces (exported for config generation) ───────────────────

export interface Field3DConfig {
    scenario_type: 'point_charge_positive' | 'point_charge_negative' | 'dipole' |
        'parallel_plates' | 'solenoid_field' | 'bar_magnet' | 'straight_wire_current' |
        'changing_flux' | 'lorentz_force_uniform_field' | 'torque_on_loop_uniform_field' |
        'biot_savart_element' | 'force_on_current_wire' | 'uniform_field_force';
    // Biot-Savart concept (Archetype A meta): a single current element dl on a
    // straight wire, the unit vector r̂ to a field point P, the cross-product
    // dl × r̂, the contribution dB at P, and a staggered accumulation of many
    // elements whose dB's sum into the circular field B = μ₀I/2πr. Defaults
    // for the element/point geometry live in biot_defaults; per-state behaviour
    // (single element vs sequence accumulation vs integrated circle) is set via
    // the per-state biot_element block.
    biot_defaults?: {
        field_point_P?: [number, number, number];   // world position of P
        wire_half_length?: number;                   // half-length of the wire
        num_elements?: number;                        // elements in sequence mode
    };
    // Diamond #2 (Archetype B — force-in-field): a uniform external B grid
    // surrounding a single moving charged particle. Drives the F = qv × B reveal,
    // palm-rule overlay, and circular/helical trajectory across STATE_1..STATE_7.
    ambient_field?: {
        direction: [number, number, number];   // unit B direction, e.g. [0,0,1]
        magnitude: number;                      // T (visual scaling only — physics is qualitative)
        density: [number, number, number];      // lattice points per axis, e.g. [5,5,5]
        color: string;
        opacity?: number;                       // 0..1, default 0.45
        extent?: number;                        // half-extent of the 3D lattice, default 3
    };
    particle?: {
        charge_sign: 1 | -1;                    // +1 = positive (proton-like), -1 = negative (electron-like)
        mass_kg?: number;                        // visual only — engine handles the numerics
        color: string;
        radius?: number;                         // sphere radius in world units, default 0.12
    };
    charges?: Array<{
        id: string;
        sign: number;           // +1 or -1
        magnitude: number;      // in units of e
        position: [number, number, number];
        label: string;
        color: string;
    }>;
    field_lines: {
        count: number;          // number of field lines per charge
        color_positive: string;
        color_negative: string;
        opacity: number;
        arrow_spacing: number;  // how often arrows appear on lines
    };
    equipotential?: {
        show: boolean;
        surfaces: number;       // number of equipotential surfaces
        opacity: number;
        color: string;
    };
    current?: {
        direction: [number, number, number];
        magnitude: number;
        wire_color: string;
    };
    coil?: {
        turns: number;
        radius: number;
        axis: [number, number, number];
    };
    states: Record<string, {
        label: string;
        visible_elements: string[];   // which elements to show
        camera_position?: [number, number, number];
        highlight?: string;
        caption: string;
        animate?: boolean;
        // ── Premium polish extras (session 60 polish iteration) ───────────────
        extras?: {
            right_hand?: {
                position: [number, number, number];
                thumb_direction: [number, number, number];
                finger_curl: 'cw' | 'ccw';
                scale?: number;
                animate_curl?: boolean;       // pulse the fingers to animate the rule
                // Case-specific overlay mode. 'A' = thumb-up Case A only (current up,
                // B counter-clockwise). 'B' = thumb-down Case B only (current down,
                // B clockwise). Omit (or 'both') = show both cases stacked.
                // 'solenoid' = solenoid grip (fingers curl WITH current loops,
                // thumb gives B inside) — used by magnetic_field_solenoid Diamond #4
                // STATE_5 to teach the RHR-swap from wire to solenoid.
                case?: 'A' | 'B' | 'both' | 'solenoid';
                // Optional cross-fade from a previous case (Diamond #4 STATE_5):
                // when set, the overlay starts visible at 'fade_from_case' for
                // ~400ms, then cross-fades to `case` over `fade_duration_ms`.
                // Pedagogical use: STATE_5 begins with the wire-RHR (Case A) the
                // student remembers from Diamond #1, then swaps to the solenoid
                // grip so the student feels the grip role-swap as a visual flip.
                fade_from_case?: 'A' | 'B' | 'solenoid';
                fade_duration_ms?: number;
            };
            compass?: {
                position: [number, number, number];
                radius?: number;
                animate_swing?: boolean;       // swing from north to B-tangent over time
                swing_delay_ms?: number;       // when in state lifecycle to start swinging
                // Optional approach animation: compass starts at approach_from and
                // glides toward `position` over approach_duration_ms BEFORE the
                // needle swings. Pedagogical intent: student first sees the compass
                // entering the field region, then sees the deflection — the cause
                // (wire's B) and the effect (needle response) are sequenced.
                approach_from?: [number, number, number];
                approach_duration_ms?: number;
            };
            highlighted_point?: {
                position: [number, number, number];
                label?: string;
                color?: string;
                radius?: number;
            };
            // ── Lorentz-force extras (Diamond #2) ──────────────────────────
            // 2D SVG palm-rule overlay pinned to the iframe corner. Mirror of
            // right_hand's role for archetype A. `case`: 'positive' = thumb-v,
            // fingers-B, palm-out = F (right hand for +q); 'negative' = the
            // same hand but F reverses. Omit/'both' = stacked.
            // Optionally also renders a 3D anatomical right-hand mesh inside the
            // scene (palm + thumb + 4 curling fingers + animated curl). Uses the
            // *cross-product* convention: thumb along F = q v × B, fingers
            // curl from v → B in the plane perpendicular to F.
            palm_rule?: {
                case?: 'positive' | 'negative' | 'both';
                show_3d_hand?: boolean;
                hand_position?: [number, number, number]; // world position; default off-axis [-2.6, 1.6, 0.8]
                hand_scale?: number;                       // default 1.0
            };
            // Show the velocity vector arrow on the moving particle.
            velocity_vector?: {
                show: boolean;
                color?: string;
                scale?: number;       // visual length scaler, default 1.5
            };
            // Show the force vector arrow on the moving particle. Updates
            // per frame as F = qv × B (direction only; magnitude is visual).
            force_vector?: {
                show: boolean;
                color?: string;
                scale?: number;       // visual length scaler, default 1.5
            };
            // Particle trail / trajectory trace.
            particle_trail?: {
                show: boolean;
                color?: string;
                max_segments?: number; // ring-buffer length, default 240
                equal_arc?: boolean;   // draw segments at equal arc-length (STATE_5 emphasis)
            };
            // Decompose v into its component parallel to B (v cos θ) and its
            // component perpendicular to B (v sin θ). Drawn as two extra
            // arrows from the particle: grey for v_∥, bright orange for v_⊥.
            // Per-frame, the renderer projects the current v onto B to get the
            // correct components for the active θ.
            vector_decomposition?: {
                show: boolean;
                color_parallel?: string; // default '#9CA3AF'
                color_perp?: string;     // default '#FFCC9F'
                scale?: number;          // visual length scaler, default 1.2
            };
            // Fleming's left-hand-rule reconciliation overlay (Diamond #2
            // STATE_5). Three orthogonal fingers — ForeFinger=B, seCond=v,
            // thuMb=F. Class-10 Indian-board mnemonic, valid only for +q.
            // Opt-in for the one reconciliation state; the right-hand cross
            // product remains canonical everywhere else.
            fleming_left_hand?: {
                show: boolean;
            };
            // ── force_on_current_wire extras (F = I L × B) ───────────────────
            // Loosely typed (matching the sibling lorentz extras philosophy):
            // the renderer reads .show + per-element shape fields off these at
            // build/applyExtras/animate time. See buildForceOnCurrentWire().
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            wire?: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            current_arrows?: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            F_net_arrow?: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            charge_arrows?: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            hand_3d?: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            current_flip?: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            decoy_30_angle?: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            true_90_arc?: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            bent_wire?: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            chord_arrow?: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            square_loop?: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            side_forces?: any;
        };
        // Show interactive I/r sliders + B readout overlay in this state
        show_sliders?: boolean;
        // Multi-line text shown in a corner of the canvas (formulas, numerics)
        formula_overlay?: string;
        // Diamond #2 retrofit (2026-05-11): which corner the TTS-driven
        // equation panel anchors to for this state. Default 'bottom-left'.
        // Avoid the corner occupied by sliders or RHR overlay — collision
        // rule documented in patterns/magnetism.md §4.
        equation_panel_anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
        // straight_wire_current scenario: rotate the field-line arrows around the
        // wire. 'ccw' (default) for current upward; 'cw' for reversed current.
        // Omitted = no rotation animation.
        field_rotation_direction?: 'cw' | 'ccw';
        // straight_wire_current scenario: animate yellow dots flowing along the
        // wire to visualize the conventional current direction. 'up' or 'down'.
        // Omitted = no dots shown.
        current_direction_indicator?: 'up' | 'down';
        // ── lorentz_force_uniform_field per-state config ─────────────────
        // 'static' = particle frozen (reveal/explain states); 'circle' = uniform
        // circular motion in the plane ⊥ B; 'helix' = helical (v has component
        // along B); 'straight' = drift (B not yet on, STATE_1 hook).
        trajectory_mode?: 'static' | 'circle' | 'helix' | 'straight';
        // Angle between v and B in degrees (per-state override).
        theta_deg?: number;
        // Charge sign override for this state (e.g. STATE_4 flips between
        // positive and negative to demonstrate F direction reversal).
        charge_sign?: 1 | -1;
        // Diamond #4 (magnetic_field_solenoid STATE_1): start the scene with
        // a straight wire (cylinder) visible and the coil hidden, then after
        // `straight_duration_ms` cross-fade over `morph_duration_ms` so the
        // straight wire fades out while the coil fades in. Pedagogical move:
        // "you already know the field around a single wire... but what if we
        // coil it?" Only applies to `solenoid_field` scenario; ignored else.
        wire_to_coil_morph?: {
            enabled: boolean;
            straight_duration_ms?: number;   // default 3000
            morph_duration_ms?: number;      // default 1500
        };
        // Diamond #4 STATE_2 — per-turn field circles around each coil turn.
        // 6 sets of B-circles (one per turn) reveal in sequence with a stagger
        // so the student sees individual per-turn fields before they're asked
        // (STATE_3) to add them up. opacity_dim lets STATE_3 carry these over
        // at 30% so the new axial arrows visually dominate.
        per_turn_field_circles?: {
            enabled: boolean;
            highlight_first?: boolean;       // STATE_2: first turn pulses to focus eye
            reveal_at_ms?: number;           // when (after state enter) reveal begins; default 3500 (~s2_3)
            reveal_stagger_ms?: number;      // per-turn delay; default 250
            reveal_fade_ms?: number;         // per-turn fade-in duration; default 500
            opacity_dim?: number;            // dimmed steady opacity (carryover use); default 1.0 = full
        };
        // Diamond #4 STATE_3 — red radial-cancellation arrows BETWEEN adjacent
        // turns (5 zones for 6 turns). Two opposing arrows per zone show the
        // mirror-image radial components meeting and cancelling.
        radial_cancellation_arrows?: {
            enabled: boolean;
            color?: string;                  // default "#EF4444"
            reveal_at_ms?: number;           // ms after state enter; default 6000 (~s3_3 after 3s pause)
            fade_in_duration_ms?: number;    // default 800
            arrow_length?: number;           // default 0.55 (world units)
        };
        // Diamond #4 STATE_3 — blue axial arrows that "arise" (build up from
        // length 0 to full) along the central solenoid axis, AFTER the radial
        // cancellation arrows. Triggers the dim of per_turn_field_circles via
        // a co-fade hook when both primitives are on the same state.
        axial_buildup_arrows?: {
            enabled: boolean;
            color?: string;                  // default "#3B82F6"
            count?: number;                  // default 5
            reveal_at_ms?: number;           // ms after state enter; default 8500 (~s3_4)
            arise_duration_ms?: number;      // default 1000
            arrow_length_max?: number;       // default 1.0 (world units along axis)
        };
        // ── biot_savart_element per-state config ─────────────────────────
        // Drives the Biot-Savart scene. accumulate_mode:
        //   'single'     — one element dl at element_position_on_wire, with
        //                  r̂ / dl×r̂ / dB shown per the show_* flags.
        //   'sequence'   — many elements light up along the wire on a stagger
        //                  (reveal_at_ms + i*reveal_stagger_ms), each dropping a
        //                  dB contribution that stacks at P; the circle ramps in.
        //   'integrated' — the assembled circular field shown at circle_opacity;
        //                  individual elements hidden.
        biot_element?: {
            field_point_P?: [number, number, number];
            element_position_on_wire?: number;   // y-coord of the highlighted dl
            accumulate_mode?: 'single' | 'sequence' | 'integrated';
            num_elements?: number;
            wire_half_length?: number;
            show_rhat?: boolean;
            show_theta?: boolean;
            show_cross?: boolean;
            show_dB?: boolean;
            show_proportion_bars?: boolean;
            direction_practice?: boolean;        // STATE_6: orbiting circulation arrow
            show_current_flow?: boolean;         // animate flow dots up the wire (live current)
            weight_by_sin_theta?: boolean;       // STATE_8: emphasise sinθ/r² weighting + scan ring
            circle_opacity?: number;             // integrated-mode circle opacity
            reveal_at_ms?: number;
            reveal_stagger_ms?: number;
            reveal_fade_ms?: number;
            // ── Right-hand-rule hands (2026-06-11) ───────────────────────
            // Grip / thumb rule: thumb = current I (up the wire), curled
            // fingers = B circulation. Shown on the result-recall +
            // reconciliation states (STATE_1, STATE_9). Reuses the
            // archetype-A 3D grip mesh (createRightHand).
            show_grip_hand?: boolean;
            // Cross-product rule: flat fingers along dl, curl toward r̂,
            // thumb = dB. Shown where per-element direction is taught/applied
            // (STATE_5, STATE_6). Reuses the Diamond-#2 3D cross-product mesh
            // (createLorentzHand), relabeled dl / r-hat / dB and oriented to
            // the biot geometry. NEVER put the grip hand on these states — a
            // single element's dB is the cross product, not the grip rule.
            show_cross_hand?: boolean;
            // Optional per-state world position for each hand (the front-view
            // and top-down states need different placements to stay in frame).
            // Omitted = the hand's build-time home position.
            grip_hand_position?: [number, number, number];
            cross_hand_position?: [number, number, number];
        };
    }>;
    // Slider configuration (used when show_sliders: true on a state)
    slider_controls?: {
        I?: { min: number; max: number; step: number; default: number; label: string };
        r?: { min: number; max: number; step: number; default: number; label: string };
        // ── Lorentz-force sliders (Diamond #2) ───────────────────────────
        q_sign?: { default: 1 | -1; label: string };
        v?: { min: number; max: number; step?: number; default: number; label: string };
        B?: { min: number; max: number; step?: number; default: number; label: string };
        theta_deg?: { min: number; max: number; step?: number; default: number; label: string };
        // ── force_on_current_wire sliders ───────────────────────────────
        L?: { min: number; max: number; step?: number; default: number; label: string };
        current_dir?: { default: 1 | -1; label: string };
    };
    pvl_colors?: {
        background: string; text: string; positive: string; negative: string; field_line: string;
    };
}

// ── HTML assembler ───────────────────────────────────────────────────────────

export function assembleField3DHtml(config: Field3DConfig): string {
    const bg = config.pvl_colors?.background ?? '#0A0A1A';
    const textColor = config.pvl_colors?.text ?? '#D4D4D8';
    return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
html, body { margin: 0; padding: 0; overflow: hidden; background: ${bg}; width: 100%; height: 100%; }
canvas { display: block; width: 100%; height: 100%; }
#legend {
    position: fixed; bottom: 8px; left: 8px;
    background: rgba(0,0,0,0.85); color: ${textColor};
    padding: 10px 14px; border-radius: 6px; font: 12px/1.5 monospace;
    z-index: 10; max-width: 280px; pointer-events: none;
}
#caption {
    position: fixed; top: 12px; left: 50%; transform: translateX(-50%);
    background: rgba(0,0,0,0.8); color: ${textColor};
    padding: 8px 16px; border-radius: 8px; font: 14px/1.4 system-ui, sans-serif;
    z-index: 10; text-align: center; max-width: 80%; pointer-events: none;
}
/* Rule 24: the sim is the teacher's silent visual — no prose caption box.
   When a state's caption is empty, hide the box entirely (no empty pill). */
#caption:empty { display: none; }
#mobile-fallback {
    display: none; width: 100%; height: 100%;
    position: fixed; top: 0; left: 0; background: ${bg};
}
#sliders {
    position: fixed; top: 12px; right: 12px;
    background: rgba(0,0,0,0.85); color: ${textColor};
    padding: 10px 14px; border-radius: 8px;
    font: 12px/1.6 monospace; z-index: 10;
    min-width: 180px; display: none;
}
#sliders label { display: block; margin-bottom: 2px; }
#sliders input[type="range"] { width: 100%; margin-bottom: 8px; }
#sliders #b_readout {
    margin-top: 6px; padding-top: 6px;
    border-top: 1px solid rgba(255,255,255,0.2);
    color: #FFF176; font-weight: bold;
}
#formula_overlay {
    position: fixed; bottom: 12px; right: 12px;
    background: rgba(0,0,0,0.85); color: #FFF176;
    padding: 10px 14px; border-radius: 8px;
    font: 13px/1.5 monospace; z-index: 10;
    max-width: 300px; display: none;
    white-space: pre-line;
}
/* TTS-driven equation panel — anchored per state.equation_panel_anchor.
   Each TTS sentence with math_show appends a .equation_line child; the
   panel resets when the next sentence arrives with math_persist=false. */
#equation_panel {
    position: fixed; padding: 12px 16px;
    background: rgba(10,10,26,0.92);
    border: 1px solid rgba(252,211,77,0.45);
    border-radius: 8px; z-index: 11;
    max-width: 320px; display: none;
    color: #FFF8E1; font-size: 17px;
    line-height: 1.5;
}
#equation_panel.anchor-bottom-left  { bottom: 12px; left: 12px;  top: auto;   right: auto; }
#equation_panel.anchor-bottom-right { bottom: 12px; right: 12px; top: auto;   left: auto;  }
#equation_panel.anchor-top-left     { top:    12px; left: 12px;  bottom: auto; right: auto; }
#equation_panel.anchor-top-right    { top:    12px; right: 12px; bottom: auto; left: auto;  }
#equation_panel .equation_line {
    margin: 4px 0;
    animation: equationFadeIn 280ms ease-out;
}
#equation_panel .equation_line.dim {
    opacity: 0.55;
    color: #B0BEC5;
}
@keyframes equationFadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
}
/* TTS-driven glow for HTML overlays (Fleming SVG, sliders panel, etc.).
   Founder note 2026-05-12 (fourth pass): halo must be visible the ENTIRE
   time .glow-pulse is on, not just at the 50% keyframe. Both 0% and 100%
   keyframes now carry a moderate amber halo (18px / 5px / 55% opacity);
   50% boosts to the bright peak (36px / 12px / 100% opacity). The overlay
   never drops back to "no halo" during active glow. */
@keyframes overlayGlowPulse {
    0%, 100% { box-shadow: 0 0 18px  5px rgba(252,211,77,0.55); border-color: rgba(252,211,77,0.85); }
    50%      { box-shadow: 0 0 36px 12px rgba(252,211,77,1.00); border-color: rgba(252,211,77,1.0); }
}
.glow-pulse { animation: overlayGlowPulse 1.8s ease-in-out infinite; }
/* Per-finger Fleming SVG glow (founder note 2026-05-14). Box-shadow does not
   work on inline SVG children — uses CSS filter: drop-shadow instead, plus a
   subtle scale to make the active finger pop without disturbing the others.
   Same 1.8s period as overlayGlowPulse so the two effects feel synchronised
   when both fire (e.g. s5_2a glows the index finger AND the scene B grid). */
@keyframes flemingFingerGlow {
    0%, 100% { filter: drop-shadow(0 0  6px rgba(252,211,77,0.55)); transform: scale(1.00); }
    50%      { filter: drop-shadow(0 0 14px rgba(252,211,77,1.00)); transform: scale(1.05); }
}
.glow-finger { transform-box: fill-box; transform-origin: center; animation: flemingFingerGlow 1.8s ease-in-out infinite; }
@keyframes rhrCurlSweep {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -22; }
}
#rhr_overlay {
    position: fixed; top: 60px; right: 12px;
    background: rgba(0,0,0,0.86);
    border: 1px solid rgba(252,211,77,0.55);
    border-radius: 12px;
    padding: 10px 12px;
    z-index: 12;
    display: none;
    pointer-events: none;
    width: 230px;
    font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui, sans-serif;
    color: ${textColor};
}
#rhr_overlay .rhr-title {
    color: #FCD34D; font-size: 14px; font-weight: 700;
    text-align: center; margin-bottom: 8px;
    letter-spacing: 0.3px;
}
#rhr_overlay .rhr-case {
    margin-bottom: 8px;
    padding: 6px 8px 8px;
    background: rgba(255,255,255,0.05);
    border-radius: 8px;
}
#rhr_overlay .rhr-case:last-of-type { margin-bottom: 6px; }
#rhr_overlay .rhr-case-label {
    font-size: 11px; font-weight: 700; margin-bottom: 4px;
    letter-spacing: 0.2px;
}
#rhr_overlay .rhr-case-a-label { color: #FFB366; }
#rhr_overlay .rhr-case-b-label { color: #82B1FF; }
#rhr_overlay .rhr-row {
    display: flex; align-items: center; gap: 10px;
}
#rhr_overlay .rhr-hand {
    font-size: 52px; line-height: 1; flex-shrink: 0;
    text-shadow: 0 2px 6px rgba(0,0,0,0.5);
    user-select: none;
}
#rhr_overlay .rhr-thumb-unit {
    display: flex; flex-direction: column; align-items: center;
    flex-shrink: 0; gap: 2px;
}
#rhr_overlay .rhr-i-arrow {
    width: 22px; height: 28px; display: block;
}
#rhr_overlay .rhr-i-label {
    font-size: 11px; font-weight: 700;
    font-family: 'Cambria Math', 'Times New Roman', serif;
    font-style: italic;
    line-height: 1;
}
#rhr_overlay .rhr-curl-a .rhr-i-label,
#rhr_overlay .rhr-i-a-label { color: #66BB6A; }
#rhr_overlay .rhr-curl-b .rhr-i-label,
#rhr_overlay .rhr-i-b-label { color: #EF7B7B; }
#rhr_overlay .rhr-curl-block { flex: 1; text-align: center; }
#rhr_overlay .rhr-curl-svg {
    width: 70px; height: 50px; display: block; margin: 0 auto;
}
#rhr_overlay .rhr-curl-text {
    font-size: 10px; margin-top: 2px; line-height: 1.25;
}
#rhr_overlay .rhr-curl-a .rhr-curl-text { color: #66BB6A; font-weight: 600; }
#rhr_overlay .rhr-curl-b .rhr-curl-text { color: #EF7B7B; font-weight: 600; }
#rhr_overlay .rhr-footer {
    font-size: 9px; text-align: center; margin-top: 4px;
    opacity: 0.78; font-style: italic;
}
#rhr_overlay .curl-arc { animation: rhrCurlSweep 1.4s linear infinite; }
#rhr_overlay.rhr-show-a-only .rhr-case-section-b,
#rhr_overlay.rhr-show-a-only .rhr-case-section-solenoid,
#rhr_overlay.rhr-show-a-only .rhr-footer { display: none; }
#rhr_overlay.rhr-show-b-only .rhr-case-section-a,
#rhr_overlay.rhr-show-b-only .rhr-case-section-solenoid,
#rhr_overlay.rhr-show-b-only .rhr-footer { display: none; }
/* Diamond #4 STATE_5 — solenoid grip (fingers curl WITH current loops,
   thumb gives B inside). Single-section "show only" mode. Both wire
   sections + footer are hidden so the student sees ONLY the new grip. */
#rhr_overlay.rhr-show-solenoid-only .rhr-case-section-a,
#rhr_overlay.rhr-show-solenoid-only .rhr-case-section-b,
#rhr_overlay.rhr-show-solenoid-only .rhr-footer { display: none; }
/* Solenoid case styling — green wrapper to match field colour, label colour
   to distinguish from Cases A/B. The curl SVG inside arcs in the opposite
   axis to wire-RHR to communicate "fingers wrap the coils, thumb is B". */
#rhr_overlay .rhr-case-solenoid-label { color: #66BB6A; }
#rhr_overlay .rhr-curl-solenoid .rhr-curl-text { color: #66BB6A; font-weight: 600; }
#rhr_overlay .rhr-curl-solenoid .rhr-i-label,
#rhr_overlay .rhr-i-solenoid-label { color: #66BB6A; }
/* Diamond #4 STATE_5 — cross-fade transition between wire case and solenoid
   case. The overlay starts opaque at the "fade_from_case", then fades to 0
   over fade_duration_ms/2, swaps the show-only class, then fades back to 1.
   CSS owns the opacity transition; JS owns the class swap. */
#rhr_overlay { transition: opacity 0.6s ease-in-out; }
#rhr_overlay.rhr-fade-out { opacity: 0; }
/* ── Palm-rule overlay (Diamond #2 — Lorentz force F = qv × B) ─────────
   Pinned top-LEFT so it never collides with #lorentz_sliders (top-right)
   in the interactive STATE_5. The overlay is visible in every Diamond #2
   state per founder feedback. */
#palm_rule_overlay {
    position: fixed; top: 60px; left: 12px;
    background: rgba(0,0,0,0.86);
    border: 1px solid rgba(102,187,106,0.55);
    border-radius: 12px;
    padding: 10px 12px;
    z-index: 12;
    display: none;
    pointer-events: none;
    width: 232px;
    font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui, sans-serif;
    color: ${textColor};
}
#palm_rule_overlay .palm-title {
    color: #FCD34D; font-size: 14px; font-weight: 700;
    text-align: center; margin-bottom: 8px; letter-spacing: 0.3px;
}
#palm_rule_overlay .palm-case {
    margin-bottom: 8px;
    padding: 6px 8px 8px;
    background: rgba(255,255,255,0.05);
    border-radius: 8px;
}
#palm_rule_overlay .palm-case:last-of-type { margin-bottom: 6px; }
#palm_rule_overlay .palm-case-label {
    font-size: 11px; font-weight: 700; margin-bottom: 4px;
    letter-spacing: 0.2px;
}
#palm_rule_overlay .palm-case-pos-label { color: #FFB366; }
#palm_rule_overlay .palm-case-neg-label { color: #82B1FF; }
#palm_rule_overlay .palm-row {
    display: flex; align-items: center; gap: 10px;
}
#palm_rule_overlay .palm-hand {
    font-size: 48px; line-height: 1; flex-shrink: 0;
    text-shadow: 0 2px 6px rgba(0,0,0,0.5);
    user-select: none;
}
#palm_rule_overlay .palm-axes-svg {
    width: 96px; height: 64px; display: block;
}
#palm_rule_overlay .palm-axes-label {
    font-size: 10px; line-height: 1.3; margin-top: 4px; text-align: center;
}
#palm_rule_overlay .palm-axes-pos { color: #66BB6A; font-weight: 600; }
#palm_rule_overlay .palm-axes-neg { color: #EF7B7B; font-weight: 600; }
#palm_rule_overlay .palm-footer {
    font-size: 9px; text-align: center; margin-top: 4px;
    opacity: 0.78; font-style: italic;
}
#palm_rule_overlay.palm-show-pos-only .palm-case-section-neg,
#palm_rule_overlay.palm-show-pos-only .palm-footer { display: none; }
#palm_rule_overlay.palm-show-neg-only .palm-case-section-pos,
#palm_rule_overlay.palm-show-neg-only .palm-footer { display: none; }
/* ── Cycling glow on v / B / F so each labelled vector is called out in turn ──
   even without listening to the TTS. Cycle = 4.5s; each vector glows for ~0.5s
   then dims back. Staggered by animation-delay so the student's eye is led
   thumb (v) → fingers (B) → palm (F) → repeat. */
@keyframes palmAxisPulse {
    0%, 100%       { opacity: 0.55; }
    8%             { opacity: 1.0; filter: drop-shadow(0 0 5px currentColor); }
    20%            { opacity: 0.55; }
}
#palm_rule_overlay .palm-axis-v { animation: palmAxisPulse 4.5s ease-in-out infinite; animation-delay: 0s;   color: #FFAB40; }
#palm_rule_overlay .palm-axis-b { animation: palmAxisPulse 4.5s ease-in-out infinite; animation-delay: 1.5s; color: #42A5F5; }
#palm_rule_overlay .palm-axis-f-pos { animation: palmAxisPulse 4.5s ease-in-out infinite; animation-delay: 3.0s; color: #66BB6A; }
#palm_rule_overlay .palm-axis-f-neg { animation: palmAxisPulse 4.5s ease-in-out infinite; animation-delay: 3.0s; color: #EF7B7B; }
/* ── Fleming's left-hand rule overlay (Diamond #2 STATE_5 reconciliation) ──
   Class-10 Indian-board mnemonic. Three orthogonal fingers: ForeFinger=B,
   seCond=v, thuMb=F. Shown ONLY on the reconciliation state to acknowledge
   the alternative without conflicting with the right-hand cross-product
   framework used in every other state. Hidden by default. */
#fleming_overlay {
    position: fixed; top: 60px; left: 12px;
    background: rgba(0,0,0,0.86);
    border: 1px solid rgba(102,187,106,0.55);
    border-radius: 12px;
    padding: 10px 14px 8px;
    z-index: 12;
    display: none;
    pointer-events: none;
    width: 218px;
    font-family: system-ui, sans-serif;
    color: ${textColor};
}
#fleming_overlay .fleming-title {
    color: #FCD34D; font-size: 14px; font-weight: 700;
    text-align: center; margin-bottom: 2px; letter-spacing: 0.3px;
}
#fleming_overlay .fleming-axes-svg {
    width: 100%; height: 178px; display: block; margin: 2px auto 2px;
}
#fleming_overlay .fleming-axes-label {
    font-size: 10px; line-height: 1.4; margin-top: 2px;
    text-align: center; color: #B0BEC5; font-style: italic;
}
#fleming_overlay .fleming-footer {
    font-size: 9.5px; text-align: center; margin-top: 6px;
    opacity: 0.82; line-height: 1.45;
}
/* ── Lorentz sliders (Diamond #2) ────────────────────────────────────── */
#lorentz_sliders {
    position: fixed; top: 12px; right: 12px;
    background: rgba(0,0,0,0.85); color: ${textColor};
    padding: 10px 14px; border-radius: 8px;
    border: 1.5px solid rgba(252,211,77,0);
    font: 12px/1.6 monospace; z-index: 10;
    min-width: 200px; display: none;
}
#lorentz_sliders label { display: block; margin-bottom: 2px; }
#lorentz_sliders input[type="range"] { width: 100%; margin-bottom: 6px; }
#lorentz_sliders #q_toggle {
    display: inline-block; padding: 3px 10px; border-radius: 4px;
    background: #FFB366; color: #1A1A2E; font-weight: 700; cursor: pointer;
    font-size: 11px; pointer-events: auto; user-select: none;
}
#lorentz_sliders #q_toggle.neg { background: #82B1FF; }
#lorentz_sliders #f_readout {
    margin-top: 6px; padding-top: 6px;
    border-top: 1px solid rgba(255,255,255,0.2);
    color: #66BB6A; font-weight: bold;
}
#torque_sliders {
    position: fixed; top: 12px; right: 12px;
    background: rgba(0,0,0,0.85); color: ${textColor};
    padding: 10px 14px; border-radius: 8px;
    font: 12px/1.6 monospace; z-index: 10;
    min-width: 200px; display: none;
}
#torque_sliders label { display: block; margin-bottom: 2px; }
#torque_sliders input[type="range"] { width: 100%; margin-bottom: 6px; }
#torque_sliders #tau_readout {
    margin-top: 6px; padding-top: 6px;
    border-top: 1px solid rgba(255,255,255,0.2);
    color: #E879F9; font-weight: bold;
}
#fcw_sliders {
    position: fixed; top: 12px; right: 12px;
    background: rgba(0,0,0,0.85); color: ${textColor};
    padding: 10px 14px; border-radius: 8px;
    font: 12px/1.6 monospace; z-index: 10;
    min-width: 200px; display: none;
}
#fcw_sliders label { display: block; margin-bottom: 2px; }
#fcw_sliders input[type="range"] { width: 100%; margin-bottom: 6px; }
#fcw_sliders #fcw_dir_toggle {
    display: inline-block; padding: 3px 10px; border-radius: 4px;
    background: #FFB366; color: #1A1A2E; font-weight: 700; cursor: pointer;
    font-size: 11px; pointer-events: auto; user-select: none;
    border: none; margin-top: 2px;
}
#fcw_sliders #fcw_dir_toggle.reversed { background: #82B1FF; }
#fcw_sliders #fcw_f_readout {
    margin-top: 6px; padding-top: 6px;
    border-top: 1px solid rgba(255,255,255,0.2);
    color: #66BB6A; font-weight: bold;
}
</style>
</head><body>
<div id="caption"></div>
<div id="legend"></div>
<div id="mobile-fallback"></div>
<div id="sliders">
    <label>I = <span id="i_val">5</span> A</label>
    <input type="range" id="i_slider" min="0.5" max="20" step="0.5" value="5">
    <label>r = <span id="r_val">5</span> cm</label>
    <input type="range" id="r_slider" min="2" max="30" step="1" value="5">
    <div id="b_readout">B = 20.0 μT</div>
</div>
<div id="formula_overlay"></div>
<div id="equation_panel" class="anchor-bottom-left"></div>
<div id="rhr_overlay">
    <div class="rhr-title">Right-Hand Rule</div>
    <div class="rhr-case rhr-case-section-a">
        <div class="rhr-case-label rhr-case-a-label">Case A · I points UP ↑</div>
        <div class="rhr-row">
            <div class="rhr-thumb-unit">
                <svg class="rhr-i-arrow" viewBox="0 0 22 28" xmlns="http://www.w3.org/2000/svg" aria-label="current up">
                    <line x1="11" y1="26" x2="11" y2="6" stroke="#66BB6A" stroke-width="2.5" stroke-linecap="round"/>
                    <polygon points="11,2 6,10 16,10" fill="#66BB6A"/>
                </svg>
                <div class="rhr-i-label rhr-i-a-label">I</div>
                <div class="rhr-hand">👍</div>
            </div>
            <div class="rhr-curl-block rhr-curl-a">
                <svg class="rhr-curl-svg" viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg">
                    <path class="curl-arc" d="M 60 28 A 24 16 0 1 0 12 28" stroke="#66BB6A" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="6 5"/>
                    <polygon points="6,28 18,22 18,34" fill="#66BB6A"/>
                </svg>
                <div class="rhr-curl-text">B counter-clockwise<br/>(viewed from above)</div>
            </div>
        </div>
    </div>
    <div class="rhr-case rhr-case-section-b">
        <div class="rhr-case-label rhr-case-b-label">Case B · I points DOWN ↓</div>
        <div class="rhr-row">
            <div class="rhr-thumb-unit">
                <div class="rhr-hand">👎</div>
                <div class="rhr-i-label rhr-i-b-label">I</div>
                <svg class="rhr-i-arrow" viewBox="0 0 22 28" xmlns="http://www.w3.org/2000/svg" aria-label="current down">
                    <line x1="11" y1="2" x2="11" y2="22" stroke="#EF7B7B" stroke-width="2.5" stroke-linecap="round"/>
                    <polygon points="11,26 6,18 16,18" fill="#EF7B7B"/>
                </svg>
            </div>
            <div class="rhr-curl-block rhr-curl-b">
                <svg class="rhr-curl-svg" viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg">
                    <path class="curl-arc" d="M 10 28 A 24 16 0 1 0 58 28" stroke="#EF7B7B" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="6 5"/>
                    <polygon points="64,28 52,22 52,34" fill="#EF7B7B"/>
                </svg>
                <div class="rhr-curl-text">B clockwise<br/>(viewed from above)</div>
            </div>
        </div>
    </div>
    <div class="rhr-case rhr-case-section-solenoid">
        <div class="rhr-case-label rhr-case-solenoid-label">Solenoid · fingers curl WITH current loops</div>
        <div class="rhr-row">
            <div class="rhr-thumb-unit">
                <svg class="rhr-i-arrow" viewBox="0 0 22 28" xmlns="http://www.w3.org/2000/svg" aria-label="thumb gives B inside">
                    <line x1="11" y1="26" x2="11" y2="6" stroke="#66BB6A" stroke-width="2.5" stroke-linecap="round"/>
                    <polygon points="11,2 6,10 16,10" fill="#66BB6A"/>
                </svg>
                <div class="rhr-i-label rhr-i-solenoid-label">B</div>
                <div class="rhr-hand">👍</div>
            </div>
            <div class="rhr-curl-block rhr-curl-solenoid">
                <svg class="rhr-curl-svg" viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg">
                    <path class="curl-arc" d="M 60 28 A 24 16 0 1 0 12 28" stroke="#66BB6A" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="6 5"/>
                    <polygon points="6,28 18,22 18,34" fill="#66BB6A"/>
                </svg>
                <div class="rhr-curl-text">Fingers follow I around the coil<br/>(thumb axial = B inside)</div>
            </div>
        </div>
    </div>
    <div class="rhr-footer">Same RIGHT hand — flip thumb, B reverses too</div>
</div>
<div id="palm_rule_overlay">
    <div class="palm-title">Right-Hand Rule · F = q v × B</div>
    <div class="palm-case palm-case-section-pos">
        <div class="palm-case-label palm-case-pos-label">Positive charge (+q)</div>
        <div class="palm-row">
            <div class="palm-hand">🖐️</div>
            <div>
                <svg class="palm-axes-svg" viewBox="0 0 96 64" xmlns="http://www.w3.org/2000/svg" aria-label="v thumb, B fingers, F out of palm">
                    <g class="palm-axis-v">
                        <line x1="14" y1="50" x2="14" y2="14" stroke="#FFAB40" stroke-width="2.5" stroke-linecap="round"/>
                        <polygon points="14,8 9,18 19,18" fill="#FFAB40"/>
                        <text x="22" y="18" fill="#FFAB40" font-size="11" font-family="serif" font-style="italic">v</text>
                    </g>
                    <g class="palm-axis-b">
                        <line x1="14" y1="50" x2="50" y2="50" stroke="#42A5F5" stroke-width="2.5" stroke-linecap="round"/>
                        <polygon points="56,50 46,45 46,55" fill="#42A5F5"/>
                        <text x="40" y="46" fill="#42A5F5" font-size="11" font-family="serif" font-style="italic">B</text>
                    </g>
                    <g class="palm-axis-f-pos">
                        <line x1="14" y1="50" x2="74" y2="22" stroke="#66BB6A" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="4 3"/>
                        <polygon points="80,18 68,18 74,28" fill="#66BB6A"/>
                        <text x="78" y="38" fill="#66BB6A" font-size="11" font-family="serif" font-style="italic" font-weight="700">F</text>
                    </g>
                </svg>
                <div class="palm-axes-label palm-axes-pos">Flat right hand:<br/>thumb=v · fingers=B<br/>palm pushes out → F</div>
            </div>
        </div>
    </div>
    <div class="palm-case palm-case-section-neg">
        <div class="palm-case-label palm-case-neg-label">Negative charge (−q)</div>
        <div class="palm-row">
            <div class="palm-hand">🖐️</div>
            <div>
                <svg class="palm-axes-svg" viewBox="0 0 96 64" xmlns="http://www.w3.org/2000/svg" aria-label="v thumb, B fingers, F reversed for -q">
                    <g class="palm-axis-v">
                        <line x1="14" y1="50" x2="14" y2="14" stroke="#FFAB40" stroke-width="2.5" stroke-linecap="round"/>
                        <polygon points="14,8 9,18 19,18" fill="#FFAB40"/>
                        <text x="22" y="18" fill="#FFAB40" font-size="11" font-family="serif" font-style="italic">v</text>
                    </g>
                    <g class="palm-axis-b">
                        <line x1="14" y1="50" x2="50" y2="50" stroke="#42A5F5" stroke-width="2.5" stroke-linecap="round"/>
                        <polygon points="56,50 46,45 46,55" fill="#42A5F5"/>
                        <text x="40" y="46" fill="#42A5F5" font-size="11" font-family="serif" font-style="italic">B</text>
                    </g>
                    <g class="palm-axis-f-neg">
                        <line x1="74" y1="22" x2="14" y2="50" stroke="#EF7B7B" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="4 3"/>
                        <polygon points="8,54 20,54 14,44" fill="#EF7B7B"/>
                        <text x="78" y="38" fill="#EF7B7B" font-size="11" font-family="serif" font-style="italic" font-weight="700">F</text>
                    </g>
                </svg>
                <div class="palm-axes-label palm-axes-neg">Same right hand · F reverses<br/>(opposite direction for −q)</div>
            </div>
        </div>
    </div>
    <div class="palm-footer">NCERT / DC Pandey: right-hand rule for v × B. Same hand both cases — only F's sign flips with q.</div>
</div>
<div id="fleming_overlay">
    <div class="fleming-title">Fleming's Left-Hand Rule</div>
    <svg class="fleming-axes-svg" viewBox="0 0 170 150" xmlns="http://www.w3.org/2000/svg" aria-label="left hand: forefinger up (B), thumb left (F), central finger toward viewer (v) — matches the scene orientation">
        <ellipse cx="90" cy="90" rx="14" ry="11" fill="rgba(244,167,126,0.22)" stroke="rgba(255,255,255,0.45)" stroke-width="1"/>
        <g id="fleming_index_finger">
            <line x1="90" y1="79" x2="90" y2="20" stroke="#EFEFEF" stroke-width="6" stroke-linecap="round"/>
            <ellipse cx="90" cy="20" rx="3.5" ry="2.2" fill="#FFE4D2" stroke="rgba(0,0,0,0.4)" stroke-width="0.7"/>
            <line x1="90" y1="16" x2="90" y2="4" stroke="#42A5F5" stroke-width="2.5"/>
            <polygon points="90,0 85,10 95,10" fill="#42A5F5"/>
            <text x="50" y="14" fill="#42A5F5" font-size="11" font-weight="700">Forefinger</text>
            <text x="98" y="30" fill="#42A5F5" font-size="13" font-weight="700" font-style="italic">B</text>
        </g>
        <g id="fleming_thumb">
            <line x1="79" y1="93" x2="22" y2="98" stroke="#EFEFEF" stroke-width="6" stroke-linecap="round"/>
            <ellipse cx="22" cy="98" rx="2.2" ry="3.3" fill="#FFE4D2" stroke="rgba(0,0,0,0.4)" stroke-width="0.7" transform="rotate(85 22 98)"/>
            <line x1="18" y1="98" x2="6" y2="98" stroke="#66BB6A" stroke-width="2.5"/>
            <polygon points="0,98 8,93 8,103" fill="#66BB6A"/>
            <text x="30" y="84" fill="#66BB6A" font-size="11" font-weight="700">Thumb</text>
            <text x="32" y="115" fill="#66BB6A" font-size="13" font-weight="700" font-style="italic">F</text>
        </g>
        <g id="fleming_middle_finger">
            <line x1="92" y1="100" x2="64" y2="138" stroke="#EFEFEF" stroke-width="6" stroke-linecap="round"/>
            <ellipse cx="64" cy="138" rx="3" ry="2.2" fill="#FFE4D2" stroke="rgba(0,0,0,0.4)" stroke-width="0.7" transform="rotate(60 64 138)"/>
            <line x1="62" y1="140" x2="54" y2="148" stroke="#FFAB40" stroke-width="2.5"/>
            <polygon points="50,150 58,144 60,150" fill="#FFAB40"/>
            <text x="70" y="124" fill="#FFAB40" font-size="11" font-weight="700">Central</text>
            <text x="78" y="138" fill="#FFAB40" font-size="13" font-weight="700" font-style="italic">v</text>
            <text x="70" y="148" fill="#FFAB40" font-size="9" opacity="0.78">(toward you)</text>
        </g>
    </svg>
    <div class="fleming-axes-label">
        Forefinger up (B) matches the scene above
    </div>
    <div class="fleming-footer">
        Works for +q only. For −q, F reverses.<br/>For any θ ≠ 90°, use right-hand rule.
    </div>
</div>
<div id="lorentz_sliders">
    <label>q = <span id="q_toggle">+e</span></label>
    <label>|v| = <span id="v_val">1.0</span> ×10⁵ m/s</label>
    <input type="range" id="v_slider" min="0.5" max="5" step="0.1" value="1">
    <label>B = <span id="b_val">10</span> mT</label>
    <input type="range" id="b_slider" min="1" max="100" step="1" value="10">
    <label>θ(v,B) = <span id="theta_val">90</span>°</label>
    <input type="range" id="theta_slider" min="0" max="90" step="1" value="90">
    <div id="f_readout">F = 0.16 fN</div>
</div>
<div id="torque_sliders">
    <label>N = <span id="n_torque_val">1</span> turns</label>
    <input type="range" id="n_torque_slider" min="1" max="100" step="1" value="1">
    <label>I = <span id="i_torque_val">0.50</span> A</label>
    <input type="range" id="i_torque_slider" min="0.01" max="5" step="0.01" value="0.5">
    <label>B = <span id="b_torque_val">0.10</span> T</label>
    <input type="range" id="b_torque_slider" min="0.01" max="1" step="0.01" value="0.1">
    <label>θ(μ,B) = <span id="theta_torque_val">45</span>°</label>
    <input type="range" id="theta_torque_slider" min="0" max="180" step="1" value="45">
    <div id="tau_readout">τ = 0.0 μN·m</div>
</div>
<div id="fcw_sliders">
    <label>I = <span id="fcw_i_val">2</span> A</label>
    <input type="range" id="fcw_i_slider" min="0.5" max="5" step="0.5" value="2">
    <label>L = <span id="fcw_l_val">0.5</span> m</label>
    <input type="range" id="fcw_l_slider" min="0.1" max="1" step="0.1" value="0.5">
    <label>B = <span id="fcw_b_val">0.5</span> T</label>
    <input type="range" id="fcw_b_slider" min="0.1" max="1" step="0.1" value="0.5">
    <label>θ(L,B) = <span id="fcw_theta_val">90</span>°</label>
    <input type="range" id="fcw_theta_slider" min="0" max="90" step="1" value="90">
    <button id="fcw_dir_toggle" type="button">Flip current →</button>
    <div id="fcw_f_readout">F = 0.50 N</div>
</div>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" crossorigin="anonymous"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" crossorigin="anonymous"><\/script>
<script>
window.SIM_CONFIG = ${JSON.stringify(config)};
<\/script>
<script>
${FIELD_3D_RENDERER_CODE}
<\/script>
</body></html>`;
}

// ── Renderer code (Three.js, embedded as string) ────────────────────────────

export const FIELD_3D_RENDERER_CODE = `
// ============================================================
// Field 3D Renderer — Three.js global mode
// Reads window.SIM_CONFIG (Field3DConfig)
// ============================================================

(function() {
    "use strict";

    var config = window.SIM_CONFIG;
    if (!config) { console.error("No SIM_CONFIG"); return; }

    var PM_currentState = "STATE_1";
    var stateStartTime = 0; // animate-loop time at the moment the current state was entered (Diamond #2 trajectory parameterization)
    // Diamond #2 — current TTS-driven glow target(s). Set via postMessage:
    // { type: 'SET_GLOW',
    //   target: <one of below, OR an array of below, OR null> }
    //   'v' | 'f' | 'v_parallel' | 'v_perp' | 'b'
    // | 'trail' | 'hand' | 'fleming' | 'sliders'
    // | 'fleming_index' | 'fleming_middle' | 'fleming_thumb' | null
    // Companion messages:
    //   { type: 'SET_HAND_PHASE',     phase: 'v'|'b'|'f'|null }
    //   { type: 'SET_FREEZE_PROTON',  frozen: boolean        }
    // from the parent page (TtsPlayButton on the admin test page). The matching
    // element pulses softly while the related teacher_script sentence speaks.
    // 3D scene elements (arrows, ambient_field grid, particle_trail line, 3D
    // right-hand mesh) pulse via the animate loop's glowFactor(); HTML overlays
    // (Fleming SVG, lorentz_sliders) pulse via a CSS .glow-pulse class toggled
    // in the SET_GLOW handler. Pulse is intentionally dim + slow (founder note
    // 2026-05-12: "according to the script, slow and dim glow").
    // Diamond #2 — TTS-driven glow now supports MULTIPLE simultaneous targets
    // (founder note 2026-05-14: "v cosθ along B" co-glows v_parallel + b, etc).
    // SET_GLOW accepts a string OR an array. Internally we always store an
    // array; glowFactor(t) returns the pulse if t is in the array.
    var glowTargets = [];
    // Diamond #2 — when a sentence wants the proton to stop translating along
    // its trajectory (so the F arrow is readable mid-narration), the renderer
    // captures the local trajectory time at the freeze moment and re-uses it
    // every frame until cleared. Hand cycle + glow + camera keep ticking.
    var protonFreezeAt = null;
    // Visual-validator regression capture (2026-06-10) — SET_TIME_FREEZE pins
    // the virtual time var at stateStartTime + at_ms/1000 so every time-driven
    // element (trajectory, trail, glow phase, theta_sweep, oscillation) renders
    // the IDENTICAL frame on every run → deterministic pixels for H2 frozen
    // baselines. Pin-by-target: time advances normally up to the pin, then
    // holds (a jump would skip per-frame trail/integration accumulation).
    // KNOWN RESIDUAL: compass approach/swing easings read performance.now()
    // (wall clock) — they are NOT frozen; both reach a terminal pose within
    // ~3.2s, so capture callers must settle-wait ≥3s before screenshotting.
    //   { type: 'SET_TIME_FREEZE', at_ms: 1500 }  → pin at state-local 1.5s
    //   { type: 'SET_TIME_FREEZE', frozen: false } → release the pin
    var freezeAtTime = null;
    // Diamond #2 — pause+co-glow choreography (founder note 2026-05-14):
    // when a teacher_script sentence is locked to a hand-rule phase, the 3D
    // right-hand mesh freezes at that phase so the student can read the v / B
    // / F label without the gesture cycling away. Set via postMessage:
    //   { type: 'SET_HAND_PHASE', phase: 'v' | 'b' | 'f' | null }
    // null resumes the default 9-second curl cycle. Phase mapping:
    //   'v' → curlT=0  (flat palm — fingers point along v)
    //   'b' → curlT=0.5 (mid-curl — fingertips bend toward B)
    //   'f' → curlT=1  (full curl — thumb points along F)
    var heldHandPhase = null;
    // Diamond #2 — set when the user drags a v/B/q-sign slider in STATE_6.
    // The trail update logic clears the LineGeometry buffer on the next
    // animate tick so the old trajectory doesn't bleed into the new one.
    var lorentzTrailResetPending = false;
    // force_on_current_wire — sign of the conventional current along the wire
    // (+1 = along config.current.direction, -1 = reversed). Driven by the
    // STATE_7 flip button and the STATE_3 current_flip timer. The animate loop
    // reads this to orient the current arrows + the net/per-charge F arrows.
    var fcwCurrentDir = 1;
    // STATE_3 current_flip: STATE-LOCAL sim-time offset (ms since state entry)
    // at which the current auto-reverses, armed on STATE_3 entry from
    // extras.current_flip.reverse_at_ms; null = off. Sim-clock based (not
    // wall-clock) so it also fires under SET_TIME_FREEZE in the visual gate.
    var fcwFlipAt = null;
    var scene, camera, renderer, animationId;
    var sceneObjects = [];
    var isDragging = false, prevMouse = { x: 0, y: 0 };
    // Tap detection (teacher freeze gesture): a clean click/tap with no drag
    // posts CANVAS_TAP to the parent player, which toggles the freeze. A drag
    // still rotates the scene (and rotates the frozen frame while paused).
    var tapDownX = 0, tapDownY = 0, tapMoved = false;
    function tapDist(x, y) { return Math.abs(x - tapDownX) + Math.abs(y - tapDownY); }
    function emitTap() { if (!tapMoved) { try { parent.postMessage({ type: "CANVAS_TAP" }, "*"); } catch (e) {} } }
    var spherical = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 8 };
    var targetSpherical = { theta: spherical.theta, phi: spherical.phi, radius: spherical.radius };
    var animating = false;
    var isMobile = window.innerWidth < 768;

    // ── Mobile fallback: 2D SVG projection ────────────────────────────────
    if (isMobile) {
        showMobileFallback();
        setupPostMessage();
        return;
    }

    // ── Three.js setup ────────────────────────────────────────────────────
    scene = new THREE.Scene();
    scene.background = new THREE.Color(config.pvl_colors ? config.pvl_colors.background : "#0A0A1A");

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    updateCameraFromSpherical();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    // Lighting
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // ── Manual orbit controls ─────────────────────────────────────────────
    renderer.domElement.addEventListener("mousedown", function(e) {
        isDragging = true;
        prevMouse.x = e.clientX; prevMouse.y = e.clientY;
        tapDownX = e.clientX; tapDownY = e.clientY; tapMoved = false;
    });
    renderer.domElement.addEventListener("mousemove", function(e) {
        if (!isDragging) return;
        if (!tapMoved && tapDist(e.clientX, e.clientY) > 6) tapMoved = true;
        var dx = e.clientX - prevMouse.x;
        var dy = e.clientY - prevMouse.y;
        spherical.theta -= dx * 0.005;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - dy * 0.005));
        targetSpherical.theta = spherical.theta;
        targetSpherical.phi = spherical.phi;
        prevMouse.x = e.clientX; prevMouse.y = e.clientY;
        updateCameraFromSpherical();
    });
    renderer.domElement.addEventListener("mouseup", function() { isDragging = false; emitTap(); });
    renderer.domElement.addEventListener("mouseleave", function() { isDragging = false; });
    renderer.domElement.addEventListener("wheel", function(e) {
        spherical.radius = Math.max(3, Math.min(20, spherical.radius + e.deltaY * 0.01));
        targetSpherical.radius = spherical.radius;
        updateCameraFromSpherical();
        e.preventDefault();
    }, { passive: false });

    // Touch support
    var touchStart = null;
    renderer.domElement.addEventListener("touchstart", function(e) {
        if (e.touches.length === 1) {
            touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            tapDownX = e.touches[0].clientX; tapDownY = e.touches[0].clientY; tapMoved = false;
        }
    });
    renderer.domElement.addEventListener("touchmove", function(e) {
        if (!touchStart || e.touches.length !== 1) return;
        if (!tapMoved && tapDist(e.touches[0].clientX, e.touches[0].clientY) > 8) tapMoved = true;
        var dx = e.touches[0].clientX - touchStart.x;
        var dy = e.touches[0].clientY - touchStart.y;
        spherical.theta -= dx * 0.005;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - dy * 0.005));
        targetSpherical.theta = spherical.theta;
        targetSpherical.phi = spherical.phi;
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        updateCameraFromSpherical();
        e.preventDefault();
    }, { passive: false });
    renderer.domElement.addEventListener("touchend", function() { touchStart = null; emitTap(); });

    // ── Camera helpers ────────────────────────────────────────────────────
    function updateCameraFromSpherical() {
        var r = spherical.radius;
        camera.position.set(
            r * Math.sin(spherical.phi) * Math.cos(spherical.theta),
            r * Math.cos(spherical.phi),
            r * Math.sin(spherical.phi) * Math.sin(spherical.theta)
        );
        camera.lookAt(0, 0, 0);
    }

    function animateCameraTo(pos) {
        if (!pos) return;
        var r = Math.sqrt(pos[0]*pos[0] + pos[1]*pos[1] + pos[2]*pos[2]);
        targetSpherical.radius = r || 8;
        targetSpherical.phi = r > 0 ? Math.acos(Math.max(-1, Math.min(1, pos[1] / r))) : Math.PI / 3;
        targetSpherical.theta = Math.atan2(pos[2], pos[0]);
        animating = true;
    }

    function lerpSpherical() {
        if (!animating) return;
        var t = 0.05;
        spherical.theta += (targetSpherical.theta - spherical.theta) * t;
        spherical.phi += (targetSpherical.phi - spherical.phi) * t;
        spherical.radius += (targetSpherical.radius - spherical.radius) * t;
        if (Math.abs(spherical.theta - targetSpherical.theta) < 0.001 &&
            Math.abs(spherical.phi - targetSpherical.phi) < 0.001 &&
            Math.abs(spherical.radius - targetSpherical.radius) < 0.01) {
            spherical.theta = targetSpherical.theta;
            spherical.phi = targetSpherical.phi;
            spherical.radius = targetSpherical.radius;
            animating = false;
        }
        updateCameraFromSpherical();
    }

    // ── Scene management ──────────────────────────────────────────────────
    function clearScene() {
        for (var i = sceneObjects.length - 1; i >= 0; i--) {
            var obj = sceneObjects[i];
            scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(function(m) { m.dispose(); });
                } else {
                    obj.material.dispose();
                }
            }
        }
        sceneObjects = [];
    }

    function addToScene(obj) {
        scene.add(obj);
        sceneObjects.push(obj);
    }

    // ── Geometry helpers ──────────────────────────────────────────────────
    function hexToThreeColor(hex) {
        return new THREE.Color(hex);
    }

    function createChargeSphere(pos, color, radius) {
        var geo = new THREE.SphereGeometry(radius || 0.3, 24, 24);
        var mat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            emissive: hexToThreeColor(color),
            emissiveIntensity: 0.4,
            shininess: 80
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(pos[0], pos[1], pos[2]);
        return mesh;
    }

    function createTubeLine(points, color, tubeRadius) {
        if (points.length < 2) return null;
        var vectors = points.map(function(p) { return new THREE.Vector3(p[0], p[1], p[2]); });
        var curve = new THREE.CatmullRomCurve3(vectors);
        var geo = new THREE.TubeGeometry(curve, Math.max(points.length * 4, 20), tubeRadius || 0.02, 8, false);
        var mat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            transparent: true,
            opacity: config.field_lines.opacity || 0.8
        });
        var mesh = new THREE.Mesh(geo, mat);
        return mesh;
    }

    function createArrowHead(position, direction, color) {
        var geo = new THREE.ConeGeometry(0.06, 0.15, 8);
        var mat = new THREE.MeshPhongMaterial({ color: hexToThreeColor(color) });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(position[0], position[1], position[2]);
        // Orient cone along direction
        var dir = new THREE.Vector3(direction[0], direction[1], direction[2]).normalize();
        var up = new THREE.Vector3(0, 1, 0);
        var quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, dir);
        mesh.setRotationFromQuaternion(quaternion);
        return mesh;
    }

    function createPlate(width, height, position, color) {
        var geo = new THREE.BoxGeometry(width, height, 0.05);
        var mat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            transparent: true,
            opacity: 0.6
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(position[0], position[1], position[2]);
        return mesh;
    }

    function createWire(start, end, color, radius) {
        var dir = new THREE.Vector3(end[0]-start[0], end[1]-start[1], end[2]-start[2]);
        var length = dir.length();
        dir.normalize();
        var geo = new THREE.CylinderGeometry(radius || 0.05, radius || 0.05, length, 12);
        var mat = new THREE.MeshPhongMaterial({ color: hexToThreeColor(color) });
        var mesh = new THREE.Mesh(geo, mat);
        var mid = [(start[0]+end[0])/2, (start[1]+end[1])/2, (start[2]+end[2])/2];
        mesh.position.set(mid[0], mid[1], mid[2]);
        var up = new THREE.Vector3(0, 1, 0);
        var quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, dir);
        mesh.setRotationFromQuaternion(quaternion);
        return mesh;
    }

    function createEquipotentialSurface(radius, color, opacity) {
        var geo = new THREE.SphereGeometry(radius, 32, 32);
        var mat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            transparent: true,
            opacity: opacity || 0.12,
            wireframe: true,
            wireframeLinewidth: 1
        });
        var mesh = new THREE.Mesh(geo, mat);
        return mesh;
    }

    // ── Premium primitives (session-60 polish iteration) ─────────────────
    function createRightHand(spec) {
        // Builds a stylised right hand at spec.position with thumb pointing
        // along spec.thumb_direction, fingers curling spec.finger_curl
        // ('ccw' | 'cw') around the thumb axis. All composed of basic Three.js
        // primitives — no GLTF dependency.
        var grp = new THREE.Group();
        var s = spec.scale || 1;
        var skinColor = 0xFFCC9F;
        var skinMat = new THREE.MeshPhongMaterial({
            color: skinColor, emissive: 0x442211, emissiveIntensity: 0.18, shininess: 30
        });

        // Palm — slightly elongated sphere
        var palmGeo = new THREE.SphereGeometry(0.20 * s, 18, 14);
        var palm = new THREE.Mesh(palmGeo, skinMat);
        palm.scale.set(1.0, 0.85, 0.7);
        grp.add(palm);

        // Thumb — cylinder pointing local +Y, anchored on top of palm
        var thumbGeo = new THREE.CylinderGeometry(0.07 * s, 0.085 * s, 0.55 * s, 12);
        var thumb = new THREE.Mesh(thumbGeo, skinMat);
        thumb.position.set(0, 0.35 * s, 0.04 * s);
        grp.add(thumb);

        // Thumbnail (tiny dark cap) for clarity at the thumb tip
        var nailGeo = new THREE.SphereGeometry(0.06 * s, 8, 8);
        var nailMat = new THREE.MeshPhongMaterial({ color: 0xCC9966 });
        var nail = new THREE.Mesh(nailGeo, nailMat);
        nail.position.set(0, 0.62 * s, 0.05 * s);
        grp.add(nail);

        // 4 fingers — each a quarter-circle TubeGeometry curling around +Y
        var fingerLengths = [1.00, 1.05, 0.95, 0.80]; // index..pinky relative
        var dir = spec.finger_curl === 'cw' ? -1 : 1;
        var palmRadius = 0.22 * s;

        for (var fi = 0; fi < 4; fi++) {
            // each finger sits at a different Y along the palm and starts at a
            // different starting angle in XZ plane
            var fingerOffsetY = -0.05 * s + fi * 0.085 * s;
            var startTheta = -Math.PI / 2 - 0.2;        // start on the back side of the palm
            var sweepTheta = (Math.PI / 1.8) * fingerLengths[fi];  // ~100°

            var pts = [];
            var segments = 18;
            for (var t = 0; t <= segments; t++) {
                var u = t / segments;
                var theta = startTheta + dir * sweepTheta * u;
                var rad = palmRadius * (1 + 0.05 * Math.sin(u * Math.PI)); // slight bulge
                var x = rad * Math.cos(theta);
                var z = rad * Math.sin(theta);
                var y = fingerOffsetY - u * 0.04 * s;   // fingers droop slightly toward palm
                pts.push(new THREE.Vector3(x, y, z));
            }
            var curve = new THREE.CatmullRomCurve3(pts);
            var fingerGeo = new THREE.TubeGeometry(curve, 24, 0.045 * s * fingerLengths[fi], 8, false);
            var finger = new THREE.Mesh(fingerGeo, skinMat);
            finger.userData = { fingerIndex: fi };
            grp.add(finger);
        }

        // Wrist stub — small darker cylinder below the palm
        var wristGeo = new THREE.CylinderGeometry(0.16 * s, 0.13 * s, 0.30 * s, 12);
        var wristMat = new THREE.MeshPhongMaterial({ color: 0xE6B895 });
        var wrist = new THREE.Mesh(wristGeo, wristMat);
        wrist.position.set(0, -0.30 * s, 0);
        grp.add(wrist);

        // Position + orient so local +Y aligns with spec.thumb_direction
        grp.position.set(spec.position[0], spec.position[1], spec.position[2]);
        var thumbDir = new THREE.Vector3(
            spec.thumb_direction[0], spec.thumb_direction[1], spec.thumb_direction[2]
        ).normalize();
        var defaultUp = new THREE.Vector3(0, 1, 0);
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(defaultUp, thumbDir);
        grp.setRotationFromQuaternion(quat);
        grp.userData = { elementType: 'right_hand', id: 'rhr_hand', animate_curl: !!spec.animate_curl };

        return grp;
    }

    // ── Articulated right-hand RHR (Diamond #4 STATE_6) ───────────────────
    //   A production-grade, anatomically articulated right hand placed BESIDE
    //   the solenoid (NOT wrapping the coil). Each finger is a 3-phalange
    //   kinematic chain (proximal/middle/distal) with rounded knuckle joints,
    //   exactly like the reference animation (Animations for Physics and
    //   Astronomy, "Right Hand Rule for Cross Products"). The hand makes a real
    //   fist-curl: every joint bends as curlT 0→1, the fingers sweeping AROUND
    //   the local +y axis (= the thumb = the solenoid axis = B). The whole group
    //   is rotated so local +y aligns with spec.thumb_direction so the thumb runs
    //   parallel to the coil axis; curlSign sets the wrap sense to match the
    //   conventional current.
    //
    //   rhrFingerJoints() is forward kinematics for ONE finger and returns its
    //   4 joint positions [MCP, PIP, DIP, TIP]; the animate loop rebuilds the
    //   finger tube + repositions the knuckle spheres each frame. curlT is a
    //   pure function of (time - stateStartTime) so it freezes deterministically
    //   under SET_TIME_FREEZE for THE EYE.
    function rhrFingerJoints(fingerIndex, sc, curlT, curlSign) {
        var yArr = [0.34, 0.115, -0.115, -0.34];               // fingers stacked along +y (closer together)
        var lenF = [0.92, 1.05, 1.0, 0.78][fingerIndex];       // anatomical: middle > ring > index > pinky
        var yBase = yArr[fingerIndex] * sc;
        var r0 = 0.11 * sc;                                    // base buried in the palm front → seamless merge
        var L = [0.27 * sc * lenF, 0.21 * sc * lenF, 0.165 * sc * lenF];
        var maxA = [1.18, 1.42, 1.20];                         // per-joint max bend (rad)
        var joints = [new THREE.Vector3(r0, yBase, 0)];        // MCP base, on the +x side
        var ang = 0;
        var p = joints[0].clone();
        for (var s = 0; s < 3; s++) {
            ang += curlSign * maxA[s] * curlT;                 // cumulative bend about +y
            // segment direction = flat +x rotated about +y by ang
            var dir = new THREE.Vector3(Math.cos(ang), 0, -Math.sin(ang));
            p = p.clone().add(dir.multiplyScalar(L[s]));
            joints.push(p.clone());
        }
        return joints;                                         // [MCP, PIP, DIP, TIP]
    }

    // ── Shared refined right-hand model ───────────────────────
    //   The articulated hand built for the solenoid (segmented FK fingers +
    //   knuckles, smooth thumb, rounded flat palm, tapered wrist) — extracted
    //   so the Lorentz / Biot-Savart cross-product hands reuse the SAME model.
    //   rhr-local frame: fingers extend +x and curl toward -z, thumb +y.
    // Global right-hand size multiplier — founder directive: shrink every hand
    // (solenoid grip + Lorentz/Biot cross-product) uniformly. Each call's
    // spec.scale is multiplied by this, so relative sizes are preserved.
    var HAND_SIZE_FACTOR = 0.7;
    function buildArticulatedHandParts(sc, curlSign) {
        var grp = new THREE.Group();
        var skinMat = new THREE.MeshPhongMaterial({
            color: 0xE8B98E, emissive: 0x3a1d0e, emissiveIntensity: 0.16, shininess: 26
        });
        var jointMat = new THREE.MeshPhongMaterial({
            color: 0xEEC6A0, emissive: 0x3a1d0e, emissiveIntensity: 0.14, shininess: 26
        });
        var nailMat = new THREE.MeshPhongMaterial({ color: 0xCC9966, shininess: 50 });
        var segR = 0.058 * sc;
        var fingerTubes = [], fingerKnuckles = [], fingerNails = [];
        for (var fi = 0; fi < 4; fi++) {
            var j0 = rhrFingerJoints(fi, sc, 0, curlSign);
            var tube = new THREE.Mesh(
                new THREE.TubeGeometry(new THREE.CatmullRomCurve3(j0), 24, segR, 12, false), skinMat
            );
            tube.userData = { fingerIndex: fi };
            grp.add(tube);
            fingerTubes.push(tube);
            var ks = [];
            for (var k = 0; k < 3; k++) {
                var kr = (k === 0) ? segR * 1.55 : segR * 1.08;
                var kmat = (k === 0) ? skinMat : jointMat;
                var ksph = new THREE.Mesh(new THREE.SphereGeometry(kr, 14, 12), kmat);
                ksph.position.copy(j0[k]);
                grp.add(ksph);
                ks.push(ksph);
            }
            fingerKnuckles.push(ks);
            var fnail = new THREE.Mesh(new THREE.SphereGeometry(segR * 1.0, 8, 8), nailMat);
            fnail.position.copy(j0[3]);
            grp.add(fnail);
            fingerNails.push(fnail);
        }
        var palm = new THREE.Mesh(new THREE.SphereGeometry(0.34 * sc, 24, 20), skinMat);
        palm.scale.set(1.20, 1.34, 0.52);
        palm.position.set(-0.15 * sc, 0, 0);
        grp.add(palm);
        var wrist = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18 * sc, 0.215 * sc, 0.60 * sc, 20), skinMat
        );
        wrist.setRotationFromQuaternion(
            new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-1, 0, 0))
        );
        wrist.scale.set(1.0, 1.0, 0.9);
        wrist.position.set(-0.78 * sc, 0, 0);
        grp.add(wrist);
        var wcap = new THREE.Mesh(new THREE.SphereGeometry(0.18 * sc, 16, 12), skinMat);
        wcap.scale.set(1.0, 1.0, 0.9);
        wcap.position.set(-1.08 * sc, 0, 0);
        grp.add(wcap);
        var tGrp = new THREE.Group();
        var thumbPts = [
            new THREE.Vector3(0, -0.04 * sc, 0),
            new THREE.Vector3(-0.015 * sc, 0.16 * sc, 0.015 * sc),
            new THREE.Vector3(-0.038 * sc, 0.36 * sc, 0.038 * sc),
            new THREE.Vector3(-0.052 * sc, 0.54 * sc, 0.052 * sc)
        ];
        var thumbTube = new THREE.Mesh(
            new THREE.TubeGeometry(new THREE.CatmullRomCurve3(thumbPts), 28, 0.082 * sc, 12, false), skinMat
        );
        tGrp.add(thumbTube);
        var tnail = new THREE.Mesh(new THREE.SphereGeometry(0.082 * sc, 10, 8), nailMat);
        tnail.position.copy(thumbPts[3]);
        tGrp.add(tnail);
        tGrp.position.set(0.05 * sc, 0.22 * sc, 0.10 * sc);
        grp.add(tGrp);
        return {
            group: grp, fingerTubes: fingerTubes, fingerKnuckles: fingerKnuckles,
            fingerNails: fingerNails, segR: segR
        };
    }

    function createSolenoidGripHand(spec) {
        var grp = new THREE.Group();
        var sc = (spec.scale || 1) * HAND_SIZE_FACTOR;
        var curlSign = (spec.finger_curl === 'cw') ? -1 : 1;
        var parts = buildArticulatedHandParts(sc, curlSign);
        grp.add(parts.group);

        // B arrow + label off the thumb tip — blue, pointing up the axis (B).
        if (spec.show_b_label !== false) {
            var bTip = new THREE.Vector3(0.0, 0.80 * sc, 0.15 * sc);
            var bArrow = new THREE.ArrowHelper(
                new THREE.Vector3(0, 1, 0), bTip,
                0.80 * sc, 0x42A5F5, 0.20 * sc, 0.12 * sc
            );
            grp.add(bArrow);
            var bLabel = createLabelSprite('B', '#42A5F5', 0.6 * sc);
            bLabel.position.set(0.20 * sc, bTip.y + 0.95 * sc, 0.15 * sc);
            grp.add(bLabel);
        }

        // Position BESIDE the coil + orient local +y → thumb_direction so the
        // thumb runs parallel to the solenoid axis and the fingers curl around it.
        grp.position.set(spec.position[0], spec.position[1], spec.position[2]);
        var thumbDir = new THREE.Vector3(
            spec.thumb_direction[0], spec.thumb_direction[1], spec.thumb_direction[2]
        ).normalize();
        grp.setRotationFromQuaternion(
            new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), thumbDir)
        );
        grp.userData = {
            elementType: 'solenoid_grip_hand', id: 'solenoid_grip_hand',
            finger_tubes: parts.fingerTubes, finger_knuckles: parts.fingerKnuckles, finger_nails: parts.fingerNails,
            sc: sc, curlSign: curlSign, seg_tube_r: parts.segR,
            animate_curl: spec.animate_curl !== false
        };
        return grp;
    }

    function createCompass(spec) {
        // Compass disk + N/S needle. The needle's local +Z is the "north
        // pointer". When animate_swing is enabled, applyState rotates the
        // needle group toward the local B-field direction over time.
        var grp = new THREE.Group();
        var R = spec.radius || 0.45;

        // Disk base — flat cylinder lying in XZ plane
        var diskGeo = new THREE.CylinderGeometry(R, R, 0.04, 32);
        var diskMat = new THREE.MeshPhongMaterial({
            color: 0xEEEEEE, transparent: true, opacity: 0.55, shininess: 60
        });
        var disk = new THREE.Mesh(diskGeo, diskMat);
        grp.add(disk);

        // Disk rim
        var rimGeo = new THREE.TorusGeometry(R, 0.025, 8, 32);
        var rimMat = new THREE.MeshPhongMaterial({ color: 0x4A4A4A });
        var rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        grp.add(rim);

        // Needle group — rotated as a whole for the swing animation
        var needleGrp = new THREE.Group();

        // North half — red, points +Z by default
        var northGeo = new THREE.BoxGeometry(R * 0.18, 0.06, R * 0.85);
        var northMat = new THREE.MeshPhongMaterial({
            color: 0xEF5350, emissive: 0x661111, emissiveIntensity: 0.4
        });
        var north = new THREE.Mesh(northGeo, northMat);
        north.position.set(0, 0.045, R * 0.42);
        needleGrp.add(north);

        // South half — white/grey, points -Z
        var southGeo = new THREE.BoxGeometry(R * 0.18, 0.06, R * 0.85);
        var southMat = new THREE.MeshPhongMaterial({ color: 0xE0E0E0 });
        var south = new THREE.Mesh(southGeo, southMat);
        south.position.set(0, 0.045, -R * 0.42);
        needleGrp.add(south);

        // Tiny pivot dot
        var pivotGeo = new THREE.SphereGeometry(0.05, 8, 8);
        var pivotMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
        var pivot = new THREE.Mesh(pivotGeo, pivotMat);
        pivot.position.set(0, 0.05, 0);
        needleGrp.add(pivot);

        // N/S labels on top
        var nMarkGeo = new THREE.SphereGeometry(0.04, 8, 8);
        var nMarkMat = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 0.7
        });
        var nMark = new THREE.Mesh(nMarkGeo, nMarkMat);
        nMark.position.set(0, 0.07, R * 0.85);
        needleGrp.add(nMark);

        grp.add(needleGrp);
        // If approach_from is given, the compass starts there and lerps to
        // its final position. Otherwise it spawns directly there (legacy).
        var startPos = spec.approach_from || spec.position;
        var hasApproach = !!spec.approach_from;
        grp.userData = {
            elementType: 'compass',
            id: 'compass_oersted',
            animate_swing: !!spec.animate_swing,
            swing_delay_ms: spec.swing_delay_ms || 1500,
            position_world: [spec.position[0], spec.position[1], spec.position[2]],
            approach_from: hasApproach ? [startPos[0], startPos[1], startPos[2]] : null,
            approach_duration_ms: spec.approach_duration_ms || 1200,
            approach_started_at: hasApproach ? -1 : 0,
            approach_progress: hasApproach ? 0 : 1,
            needleGroup: needleGrp,
            target_angle: 0,
            current_angle: 0,
            swing_started_at: -1
        };
        grp.position.set(startPos[0], startPos[1], startPos[2]);
        return grp;
    }

    // ── Lorentz right-hand (Diamond #2) ───────────────────────────────────
    //   Variant of createRightHand with a shorter thumb and an *animatable*
    //   curl progress. The fingers are regenerated each frame in the animate
    //   loop based on a curl_t parameter (0 = straight, 1 = fully curled
    //   around the palm). curl_t cycles 0 → 1 → 0 every ~6 seconds so the
    //   student sees the curling action repeatedly.
    function lorentzFingerPoints(fingerIndex, palmRadius, fingerLength, s, curlT) {
        // Geometry conventions for the Lorentz right-hand mesh:
        //   +y_local = thumb (= F = q v × B)
        //   -z_local = flat-finger direction at curlT=0 (= v)
        //   -x_local = fingertip direction at curlT=1 (= B)
        // Check: (-z) × (-x) = (z × x) = +y ✓ matches right-hand rule.
        var startThetaBase = -Math.PI / 2 - 0.2;
        // Spread offsets — at curlT=0 fingers fan out from the palm like an
        // open flat hand. The spread vanishes as fingers curl (converging to
        // the arc).
        var spreadOffsets = [0.20, 0.06, -0.07, -0.20];
        var spread = (1 - curlT) * (spreadOffsets[fingerIndex] || 0);
        var startTheta = startThetaBase + spread;
        // Negative sweep so fingers curl from -z toward -x (B direction). The
        // earlier positive sweep was the wrong handedness — it left thumb &
        // curl in mirror-image of the textbook right-hand rule.
        var sweepTheta = -(Math.PI / 1.8) * fingerLength;
        var fingerOffsetY = -0.05 * s + fingerIndex * 0.085 * s;
        var fingerStraightLen = 0.62 * s * fingerLength;
        var startX = palmRadius * Math.cos(startTheta);
        var startZ = palmRadius * Math.sin(startTheta);
        var dirX = Math.cos(startTheta);
        var dirZ = Math.sin(startTheta);
        var pts = [];
        var segments = 18;
        for (var ti = 0; ti <= segments; ti++) {
            var u = ti / segments;
            // Straight position: finger extends radially outward from palm.
            var straightX = startX + u * fingerStraightLen * dirX;
            var straightY = fingerOffsetY - u * 0.015 * s;
            var straightZ = startZ + u * fingerStraightLen * dirZ;
            // Fully-curled position: finger wraps around the palm in an arc.
            var theta = startThetaBase + sweepTheta * u;
            var rad = palmRadius * (1 + 0.05 * Math.sin(u * Math.PI));
            var curledX = rad * Math.cos(theta);
            var curledY = fingerOffsetY - u * 0.04 * s;
            var curledZ = rad * Math.sin(theta);
            // Smooth blend.
            var x = (1 - curlT) * straightX + curlT * curledX;
            var y = (1 - curlT) * straightY + curlT * curledY;
            var z = (1 - curlT) * straightZ + curlT * curledZ;
            pts.push(new THREE.Vector3(x, y, z));
        }
        return pts;
    }

    function createLorentzHand(spec) {
        var grp = new THREE.Group();
        // moving_charge (lorentz_force scenario): founder wants this hand a bit
        // smaller still (0.6); the Biot-Savart cross/grip hands keep the shared
        // HAND_SIZE_FACTOR.
        var lorentzFactor = (config.scenario_type === 'lorentz_force_uniform_field') ? 0.5 : HAND_SIZE_FACTOR;
        var s = (spec.scale || 1) * lorentzFactor;
        // Refined articulated hand (the solenoid model), placed in a +90deg-
        // about-+y sub-group so the rhr-local frame (fingers +x, curl -z,
        // thumb +y) maps to the cross-product frame the orientation + label
        // code below assume: fingers -z = v/dl, curl -x = B/r-hat, thumb
        // +y = F/dB.
        var curlSign = 1;
        var parts = buildArticulatedHandParts(s, curlSign);
        parts.group.rotation.y = Math.PI / 2;
        grp.add(parts.group);

                // v / B / F pointer arrows — small ArrowHelpers that emerge from the
        // matching anatomical landmark (fingertip / thumb tip) and point in
        // the direction the student should read off the right-hand-rule
        // gesture. Visibility is gated by phase in the animate loop:
        //   v phase  → v arrow shoots out of the flat fingertips
        //   B phase  → B arrow shoots out of the fingertips at full curl
        //   F phase  → F arrow shoots out of the thumb tip
        var vArrowLocal = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(-0.10 * s, -0.05 * s, -0.55 * s),
            0.45 * s, 0xFFAB40, 0.16 * s, 0.10 * s
        );
        vArrowLocal.userData = { phase_arrow: 'v' };
        vArrowLocal.visible = false;
        grp.add(vArrowLocal);
        var bArrowLocal = new THREE.ArrowHelper(
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(-0.30 * s, -0.05 * s, 0.05 * s),
            0.45 * s, 0x42A5F5, 0.16 * s, 0.10 * s
        );
        bArrowLocal.userData = { phase_arrow: 'b' };
        bArrowLocal.visible = false;
        grp.add(bArrowLocal);
        var fArrowLocal = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(-0.05 * s, 0.42 * s, 0.08 * s),
            0.45 * s, 0x66BB6A, 0.16 * s, 0.10 * s
        );
        fArrowLocal.userData = { phase_arrow: 'f' };
        fArrowLocal.visible = false;
        grp.add(fArrowLocal);

        // v / B / F label sprites — fixed in hand-local space, kept close to
        // the palm so they stay inside the iframe view regardless of which
        // direction v / B / F point in world. Conventions:
        //   v at -z (where flat fingers point initially)
        //   B at -x (where fingertips point at full curl)
        //   F at +y (thumb tip / cross-product direction)
        var vLabel = createLabelSprite('v', '#FFAB40', 0.50 * s);
        vLabel.position.set(-0.05 * s, -0.05 * s, -0.65 * s);
        vLabel.userData = { phase_label: 'v' };
        vLabel.visible = false;
        grp.add(vLabel);
        var bLabel = createLabelSprite('B', '#42A5F5', 0.50 * s);
        bLabel.position.set(-0.55 * s, 0.10 * s, 0.10 * s);
        bLabel.userData = { phase_label: 'b' };
        bLabel.visible = false;
        grp.add(bLabel);
        var fLabel = createLabelSprite('F', '#66BB6A', 0.50 * s);
        fLabel.position.set(-0.08 * s, 0.60 * s, 0.08 * s);
        fLabel.userData = { phase_label: 'f' };
        fLabel.visible = false;
        grp.add(fLabel);

        grp.position.set(spec.position[0], spec.position[1], spec.position[2]);
        grp.userData = {
            elementType: 'lorentz_hand',
            id: 'lorentz_hand_3d',
            finger_meshes: parts.fingerTubes,
            finger_knuckles: parts.fingerKnuckles,
            finger_nails: parts.fingerNails,
            sc: s,
            curlSign: curlSign,
            seg_tube_r: parts.segR,
            animate_curl: true,
            v_label: vLabel,
            b_label: bLabel,
            f_label: fLabel,
            v_arrow: vArrowLocal,
            b_arrow: bArrowLocal,
            f_arrow: fArrowLocal,
        };
        return grp;
    }

    // ── Text-label sprite (Diamond #2) ────────────────────────────────────
    //   Cheap canvas-texture sprite. Always faces the camera. Used to label
    //   v / F / v cos θ / v sin θ arrows in the Lorentz scenario.
    function createLabelSprite(text, color, scaleFactor) {
        var canvas = document.createElement("canvas");
        canvas.width = 384;
        canvas.height = 128;
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "bold italic 76px 'Cambria Math', 'Times New Roman', serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Dark outline for legibility against the deep-blue background
        ctx.lineWidth = 8;
        ctx.strokeStyle = "rgba(10,10,26,0.95)";
        ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = color;
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        var texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        var material = new THREE.SpriteMaterial({
            map: texture, transparent: true, depthTest: false, depthWrite: false
        });
        var sprite = new THREE.Sprite(material);
        var s = scaleFactor != null ? scaleFactor : 0.85;
        // aspect: 384/128 = 3
        sprite.scale.set(s * 3, s, 1);
        sprite.renderOrder = 999;  // always draw on top of arrows
        return sprite;
    }

    // ── Wide text-label sprite ────────────────────────────────────────────
    //   Like createLabelSprite, but sizes the canvas to the MEASURED text width
    //   so multi-word labels (e.g. "couple \\u2192 torque") are never clipped by
    //   the fixed 384px canvas. The sprite world-width scales with the canvas
    //   aspect so the glyphs keep the same on-screen height as a short label.
    function createWideLabelSprite(text, color, heightScale) {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var fontSpec = "bold 64px 'Cambria Math', 'Times New Roman', serif";
        // First-pass measure on a temporary context to size the canvas.
        ctx.font = fontSpec;
        var pad = 48;
        var measured = Math.ceil(ctx.measureText(text).width) + pad;
        canvas.width = Math.max(384, measured);
        canvas.height = 128;
        // Re-acquire the context (resizing the canvas clears font state).
        ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = fontSpec;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 8;
        ctx.strokeStyle = "rgba(10,10,26,0.95)";
        ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = color;
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        var texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        var material = new THREE.SpriteMaterial({
            map: texture, transparent: true, depthTest: false, depthWrite: false
        });
        var sprite = new THREE.Sprite(material);
        var h = heightScale != null ? heightScale : 0.42;
        var aspect = canvas.width / canvas.height;   // keep glyphs unstretched
        sprite.scale.set(h * aspect, h, 1);
        sprite.renderOrder = 999;
        return sprite;
    }

    function createHighlightedPoint(spec) {
        // A glowing point P with optional label-anchor sphere for callouts.
        var grp = new THREE.Group();
        var R = spec.radius || 0.10;
        var color = spec.color || '#FFF176';
        var geo = new THREE.SphereGeometry(R, 16, 16);
        var mat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            emissive: hexToThreeColor(color),
            emissiveIntensity: 0.9,
            transparent: true,
            opacity: 0.9
        });
        var dot = new THREE.Mesh(geo, mat);
        grp.add(dot);

        // Outer glow halo
        var haloGeo = new THREE.SphereGeometry(R * 1.8, 16, 16);
        var haloMat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(color),
            transparent: true,
            opacity: 0.18,
            emissive: hexToThreeColor(color),
            emissiveIntensity: 0.4
        });
        var halo = new THREE.Mesh(haloGeo, haloMat);
        grp.add(halo);

        grp.position.set(spec.position[0], spec.position[1], spec.position[2]);
        grp.userData = {
            elementType: 'highlighted_point',
            id: 'hp_point',
            label: spec.label || '',
            pulse: true
        };
        return grp;
    }

    // Track current dynamic extras so applyState can clear them between states
    var dynamicExtras = [];

    function clearDynamicExtras() {
        for (var i = 0; i < dynamicExtras.length; i++) {
            var obj = dynamicExtras[i];
            scene.remove(obj);
            // Sub-meshes share materials w/ scene objects; safe to skip dispose here
        }
        dynamicExtras = [];
        // Hide the 2D right-hand SVG overlay between states (session-60 polish: switched
        // from a 3D Three.js hand mesh that read as ambiguous geometry to a clear 2D SVG
        // pinned to the iframe corner — see #rhr_overlay in assembleField3DHtml).
        // Also clear the Diamond #4 fade-out class so the next show starts opaque.
        var rhrEl = document.getElementById("rhr_overlay");
        if (rhrEl) {
            rhrEl.style.display = "none";
            rhrEl.classList.remove("rhr-fade-out");
        }
        // Hide the 2D palm-rule overlay (Diamond #2 — Lorentz force).
        var palmEl = document.getElementById("palm_rule_overlay");
        if (palmEl) {
            palmEl.style.display = "none";
            palmEl.classList.remove("palm-show-pos-only", "palm-show-neg-only");
        }
        // Hide the Fleming's left-hand-rule overlay (Diamond #2 STATE_5
        // reconciliation). Only one state opts into it.
        var flemingEl = document.getElementById("fleming_overlay");
        if (flemingEl) flemingEl.style.display = "none";
    }

    function applyExtras(extras) {
        if (!extras) return;
        if (extras.right_hand) {
            // Show the 2D SVG overlay pinned to the iframe corner instead of building
            // a 3D Three.js hand. The 3D mesh (createRightHand) is kept for backwards
            // compatibility but no longer rendered — the overlay is the canonical UX.
            // Case 'A' shows only the thumb-up section; case 'B' shows only the
            // thumb-down section; 'solenoid' shows only the solenoid-grip section
            // (Diamond #4 STATE_5); omitted/'both' shows both wire cases stacked.
            var rhrEl = document.getElementById("rhr_overlay");
            if (rhrEl) {
                function applyRhrCase(caseStr) {
                    rhrEl.classList.remove(
                        "rhr-show-a-only", "rhr-show-b-only", "rhr-show-solenoid-only"
                    );
                    if (caseStr === "A") rhrEl.classList.add("rhr-show-a-only");
                    else if (caseStr === "B") rhrEl.classList.add("rhr-show-b-only");
                    else if (caseStr === "solenoid") rhrEl.classList.add("rhr-show-solenoid-only");
                }
                var targetCase = extras.right_hand.case;
                var fromCase = extras.right_hand.fade_from_case;
                rhrEl.classList.remove("rhr-fade-out");
                rhrEl.style.display = "block";
                if (fromCase && targetCase && fromCase !== targetCase) {
                    // Diamond #4 STATE_5: start at fromCase, fade out, swap, fade in.
                    // Half the duration goes to fade-out, half to fade-in. Default
                    // total 1200ms gives a calm visual switch matched to TTS pace.
                    var dur = extras.right_hand.fade_duration_ms || 1200;
                    var half = Math.max(200, dur / 2);
                    applyRhrCase(fromCase);
                    // Defer the fade start so the student sees the "from" pose for
                    // a beat before it dissolves — mirrors the TTS sentence cadence.
                    setTimeout(function() {
                        if (rhrEl.style.display === "none") return; // state changed
                        rhrEl.classList.add("rhr-fade-out");
                        setTimeout(function() {
                            if (rhrEl.style.display === "none") return;
                            applyRhrCase(targetCase);
                            rhrEl.classList.remove("rhr-fade-out");
                        }, half);
                    }, half);
                } else {
                    applyRhrCase(targetCase);
                }
            }
            // Diamond #4 STATE_6 — also build the real 3D right hand that grips
            // the solenoid (fingers wrap the coil with the current; thumb up the
            // axis = B). The 2D overlay above stays as a corner legend.
            if (extras.right_hand.render_3d) {
                var gripHand = createSolenoidGripHand({
                    position: extras.right_hand.position || [0, -0.6, 0],
                    thumb_direction: extras.right_hand.thumb_direction || [0, 1, 0],
                    finger_curl: extras.right_hand.finger_curl || 'ccw',
                    grip_radius: extras.right_hand.grip_radius || 0.8,
                    scale: extras.right_hand.scale || 1.0,
                    back_azimuth: extras.right_hand.back_azimuth,
                    show_b_label: extras.right_hand.show_b_label,
                    animate_curl: extras.right_hand.animate_curl
                });
                scene.add(gripHand);
                dynamicExtras.push(gripHand);
            }
        }
        if (extras.compass) {
            var compass = createCompass(extras.compass);
            scene.add(compass);
            dynamicExtras.push(compass);
            var nowMs = performance.now();
            // If approach_from is set, the compass first glides to its final
            // position for approach_duration_ms, THEN waits swing_delay_ms
            // before the needle swings. Otherwise the legacy timing applies
            // (immediate + swing_delay_ms). The sequencing makes the student
            // perceive the compass enter the field, then react to it.
            if (compass.userData.approach_from) {
                compass.userData.approach_started_at = nowMs;
                compass.userData.swing_started_at =
                    nowMs + (compass.userData.approach_duration_ms || 1200) + (compass.userData.swing_delay_ms || 0);
            } else {
                compass.userData.swing_started_at = nowMs + (compass.userData.swing_delay_ms || 0);
            }
        }
        if (extras.highlighted_point) {
            var hp = createHighlightedPoint(extras.highlighted_point);
            scene.add(hp);
            dynamicExtras.push(hp);
        }
        // Diamond #2 (Lorentz force) — toggle the 2D palm-rule SVG overlay
        // pinned to the iframe corner. Case 'positive' shows only the +q
        // panel; 'negative' shows only the -q panel; 'both' / omitted shows
        // both stacked.
        if (extras.palm_rule) {
            var palmEl = document.getElementById("palm_rule_overlay");
            // 2D overlay only shows when explicitly requested via 'case'.
            // Diamond #2 keeps the scene minimalistic — the 3D hand mesh is
            // the canonical rule visualisation, not the 2D panel.
            if (palmEl && extras.palm_rule.case) {
                palmEl.classList.remove("palm-show-pos-only", "palm-show-neg-only");
                if (extras.palm_rule.case === "positive") palmEl.classList.add("palm-show-pos-only");
                else if (extras.palm_rule.case === "negative") palmEl.classList.add("palm-show-neg-only");
                palmEl.style.display = "block";
            }
            // Optional 3D right-hand mesh — thumb along F (= q v × B), fingers
            // animate from straight to fully curled in the plane perpendicular
            // to F (i.e., the plane containing v and B). Per-frame orientation
            // is recomputed in the animate loop below (elementType "lorentz_hand").
            if (extras.palm_rule.show_3d_hand) {
                var handPos = extras.palm_rule.hand_position || [-2.8, 1.6, 0.6];
                var handScale = extras.palm_rule.hand_scale || 1.0;
                var lhand = createLorentzHand({
                    position: handPos,
                    scale: handScale,
                });
                scene.add(lhand);
                dynamicExtras.push(lhand);
            }
        }
        // Diamond #2 STATE_5 — Fleming's left-hand-rule reconciliation overlay.
        // Static SVG (three orthogonal fingers + footnote on scope). Only the
        // dedicated reconciliation state opts in via extras.fleming_left_hand.
        if (extras.fleming_left_hand && extras.fleming_left_hand.show) {
            var flemingEl = document.getElementById("fleming_overlay");
            if (flemingEl) flemingEl.style.display = "block";
        }
    }

    function createCoilGeometry(turns, radius, axis, length) {
        var group = new THREE.Group();
        var tubeRadius = 0.03;
        for (var t = 0; t < turns; t++) {
            var points = [];
            for (var a = 0; a <= 64; a++) {
                var angle = (a / 64) * Math.PI * 2;
                var x = radius * Math.cos(angle);
                var y = radius * Math.sin(angle);
                var z = (length || 3) * ((t + a / 64) / turns - 0.5);
                points.push(new THREE.Vector3(x, y, z));
            }
            var curve = new THREE.CatmullRomCurve3(points);
            var geo = new THREE.TubeGeometry(curve, 64, tubeRadius, 8, false);
            var mat = new THREE.MeshPhongMaterial({ color: 0xFFAB40 });
            group.add(new THREE.Mesh(geo, mat));
        }
        // Align coil to axis
        if (axis && (axis[0] !== 0 || axis[2] !== 0)) {
            var dir = new THREE.Vector3(axis[0], axis[1], axis[2]).normalize();
            var up = new THREE.Vector3(0, 0, 1);
            var q = new THREE.Quaternion();
            q.setFromUnitVectors(up, dir);
            group.setRotationFromQuaternion(q);
        }
        return group;
    }

    // Sample a polyline at arc-length fraction frac (0..1, wraps). Used to
    // animate current-flow dots along the concatenated solenoid helix at a
    // constant visual speed. cum = cumulative arc length per point, len = total.
    function sampleHelix(frac, pts, cum, len) {
        if (!pts || pts.length < 2 || !len) return [0, 0, 0];
        var f = frac - Math.floor(frac);          // wrap into [0,1)
        var target = f * len;
        var idx = pts.length - 1;
        for (var k = 1; k < cum.length; k++) {
            if (cum[k] >= target) { idx = k; break; }
        }
        var i0 = Math.max(0, idx - 1), i1 = idx;
        var seg = cum[i1] - cum[i0] || 1;
        var u = (target - cum[i0]) / seg;
        var a = pts[i0], b = pts[i1];
        return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
    }

    // Shrink a decomposition arrow toward P (= the coil-local origin) by factor
    // (1 to 0). Used to annihilate the equal-and-opposite radial halves. Relies
    // on the arrow's tail being at the origin (sample_point = [0,0,0]).
    function applyDecompTransform(ch, ud, factor) {
        if (ud.role === "shaft") {
            ch.scale.set(factor, factor, factor);
        } else if (ud.role === "head") {
            var f = Math.max(0.0001, factor);
            ch.position.set(ud.toP[0] * factor, ud.toP[1] * factor, ud.toP[2] * factor);
            ch.scale.set(1.25 * f, 1.25 * f, 1.25 * f);
        }
    }

    // Translate a decomposition arrow along +z by liftZ. Used to stack the
    // right axial half head-to-tail on the left one (→ 2× in the axial state).
    function applyDecompLift(ch, ud, liftZ) {
        if (ud.role === "shaft") {
            ch.scale.set(1, 1, 1);
            ch.position.set(0, 0, liftZ);
        } else if (ud.role === "head") {
            ch.scale.set(1.25, 1.25, 1.25);
            ch.position.set(ud.toP[0], ud.toP[1], ud.toP[2] + liftZ);
        }
    }

    // ── Scenario builders ─────────────────────────────────────────────────

    function buildPointChargeField(charge, lineCount) {
        var color = charge.sign > 0
            ? (config.field_lines.color_positive || "#EF5350")
            : (config.field_lines.color_negative || "#42A5F5");
        var chargeColor = charge.color || color;

        // Charge sphere
        var sphere = createChargeSphere(charge.position, chargeColor, 0.3);
        sphere.userData = { elementType: "charge", id: charge.id };
        addToScene(sphere);

        // Field lines — radial distribution using golden angle
        var goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (var i = 0; i < lineCount; i++) {
            var y = 1 - (i / (lineCount - 1)) * 2;
            var radiusAtY = Math.sqrt(1 - y * y);
            var theta = goldenAngle * i;

            var dx = radiusAtY * Math.cos(theta);
            var dy = y;
            var dz = radiusAtY * Math.sin(theta);

            var points = [];
            var arrowPoints = [];
            var numSegments = 20;
            var lineLength = 3.5;
            for (var s = 0; s <= numSegments; s++) {
                var t = s / numSegments;
                var r = 0.35 + t * lineLength;
                var dir = charge.sign > 0 ? 1 : -1;
                points.push([
                    charge.position[0] + dx * r * dir,
                    charge.position[1] + dy * r * dir,
                    charge.position[2] + dz * r * dir
                ]);

                // Arrows at spacing intervals. Arrowheads point ALONG the field:
                // OUTWARD (away) for +q, INWARD (toward the charge) for -q.
                // Increasing-s is always away from the charge, so multiply by the
                // sign to flip the arrowhead for a negative charge.
                if (s > 0 && s % config.field_lines.arrow_spacing === 0) {
                    var prevIdx = s - 1;
                    var aSign = charge.sign < 0 ? -1 : 1;
                    arrowPoints.push({
                        pos: points[s],
                        dir: [
                            (points[s][0] - points[prevIdx][0]) * aSign,
                            (points[s][1] - points[prevIdx][1]) * aSign,
                            (points[s][2] - points[prevIdx][2]) * aSign
                        ]
                    });
                }
            }

            var tube = createTubeLine(points, color, 0.02);
            if (tube) {
                // unitDir = the line's outward radial direction (golden-angle), so
                // the electric STATE_5 probe can brighten lines near its heading.
                tube.userData = { elementType: "field_line", id: "fl_" + charge.id + "_" + i, unitDir: [dx, dy, dz] };
                addToScene(tube);
            }

            for (var a = 0; a < arrowPoints.length; a++) {
                var arrow = createArrowHead(arrowPoints[a].pos, arrowPoints[a].dir, color);
                arrow.userData = { elementType: "arrow", id: "arr_" + charge.id + "_" + i + "_" + a };
                addToScene(arrow);
            }
        }
    }

    function buildDipoleField(posCharge, negCharge, lineCount) {
        // Draw both charge spheres
        var posColor = posCharge.color || config.field_lines.color_positive || "#EF5350";
        var negColor = negCharge.color || config.field_lines.color_negative || "#42A5F5";

        var posSphere = createChargeSphere(posCharge.position, posColor, 0.3);
        posSphere.userData = { elementType: "charge", id: posCharge.id };
        addToScene(posSphere);

        var negSphere = createChargeSphere(negCharge.position, negColor, 0.3);
        negSphere.userData = { elementType: "charge", id: negCharge.id };
        addToScene(negSphere);

        // Curved field lines from + to -
        var p1 = posCharge.position;
        var p2 = negCharge.position;
        var midX = (p1[0] + p2[0]) / 2;
        var midY = (p1[1] + p2[1]) / 2;
        var midZ = (p1[2] + p2[2]) / 2;

        var goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (var i = 0; i < lineCount; i++) {
            var frac = 1 - (i / (lineCount - 1)) * 2;
            var radiusAtFrac = Math.sqrt(Math.max(0, 1 - frac * frac));
            var theta = goldenAngle * i;

            var bulge = 1.5 + Math.abs(frac) * 1.5;
            var offX = radiusAtFrac * Math.cos(theta) * bulge;
            var offY = frac * bulge;
            var offZ = radiusAtFrac * Math.sin(theta) * bulge;

            var points = [];
            var segments = 24;
            for (var s = 0; s <= segments; s++) {
                var t = s / segments;
                var cx = p1[0] * (1 - t) + p2[0] * t;
                var cy = p1[1] * (1 - t) + p2[1] * t;
                var cz = p1[2] * (1 - t) + p2[2] * t;
                var blend = Math.sin(t * Math.PI);
                points.push([cx + offX * blend, cy + offY * blend, cz + offZ * blend]);
            }

            var flColor = config.field_lines.color_positive || "#EF5350";
            var tube = createTubeLine(points, flColor, 0.018);
            if (tube) {
                tube.userData = { elementType: "field_line", id: "fl_dipole_" + i };
                addToScene(tube);
            }

            // Arrow at midpoint
            var midIdx = Math.floor(segments / 2);
            if (midIdx > 0 && midIdx < points.length) {
                var arrowDir = [
                    points[midIdx][0] - points[midIdx - 1][0],
                    points[midIdx][1] - points[midIdx - 1][1],
                    points[midIdx][2] - points[midIdx - 1][2]
                ];
                var arrowMesh = createArrowHead(points[midIdx], arrowDir, flColor);
                arrowMesh.userData = { elementType: "arrow", id: "arr_dipole_" + i };
                addToScene(arrowMesh);
            }
        }
    }

    function buildParallelPlatesField(config_unused) {
        var sep = 3;
        var plateW = 3, plateH = 3;
        var posColor = config.pvl_colors ? config.pvl_colors.positive : "#EF5350";
        var negColor = config.pvl_colors ? config.pvl_colors.negative : "#42A5F5";
        var flColor = config.field_lines.color_positive || "#FFF176";

        // Positive plate
        var posPlate = createPlate(plateW, plateH, [-sep/2, 0, 0], posColor || "#EF5350");
        posPlate.userData = { elementType: "plate_positive", id: "plate_pos" };
        addToScene(posPlate);

        // Negative plate
        var negPlate = createPlate(plateW, plateH, [sep/2, 0, 0], negColor || "#42A5F5");
        negPlate.userData = { elementType: "plate_negative", id: "plate_neg" };
        addToScene(negPlate);

        // + and - labels (using small spheres as markers)
        var plusMarker = createChargeSphere([-sep/2 - 0.15, plateH/2 + 0.3, 0], posColor || "#EF5350", 0.12);
        plusMarker.userData = { elementType: "label", id: "label_plus" };
        addToScene(plusMarker);
        var minusMarker = createChargeSphere([sep/2 + 0.15, plateH/2 + 0.3, 0], negColor || "#42A5F5", 0.12);
        minusMarker.userData = { elementType: "label", id: "label_minus" };
        addToScene(minusMarker);

        // Uniform field lines between plates
        var gridN = 4;
        for (var iy = 0; iy < gridN; iy++) {
            for (var iz = 0; iz < gridN; iz++) {
                var y = ((iy + 0.5) / gridN - 0.5) * (plateH * 0.7);
                var z = ((iz + 0.5) / gridN - 0.5) * (plateW * 0.7);
                var points = [];
                for (var s = 0; s <= 12; s++) {
                    var t = s / 12;
                    points.push([-sep/2 + 0.1 + t * (sep - 0.2), y, z]);
                }
                var tube = createTubeLine(points, flColor, 0.02);
                if (tube) {
                    tube.userData = { elementType: "field_line", id: "fl_plate_" + iy + "_" + iz };
                    addToScene(tube);
                }
                // Arrow at midpoint
                var mid = Math.floor(12 / 2);
                var arrowMesh = createArrowHead(points[mid], [1, 0, 0], flColor);
                arrowMesh.userData = { elementType: "arrow", id: "arr_plate_" + iy + "_" + iz };
                addToScene(arrowMesh);
            }
        }
    }

    function buildSolenoidField(config_unused) {
        var coilConf = config.coil || { turns: 8, radius: 0.8, axis: [0, 0, 1] };
        var solenoidLength = 4;
        var flColor = config.field_lines.color_positive || "#66BB6A";
        var lineCount = config.field_lines.count || 8;

        // Diamond #4 STATE_1 morph stand-in: a straight axial wire built once
        // and kept hidden by default. When a state has wire_to_coil_morph
        // enabled, the animate loop fades the wire out and the coil group in
        // over the configured window so the student sees a "straight wire
        // becoming a coil" sequence. Stays hidden for all other states.
        var axis = coilConf.axis || [0, 0, 1];
        var aLen = Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2]) || 1;
        var aUnit = [axis[0]/aLen, axis[1]/aLen, axis[2]/aLen];
        var halfL = solenoidLength / 2;
        var morphWireStart = [-aUnit[0]*halfL, -aUnit[1]*halfL, -aUnit[2]*halfL];
        var morphWireEnd   = [ aUnit[0]*halfL,  aUnit[1]*halfL,  aUnit[2]*halfL];
        var morphWire = createWire(morphWireStart, morphWireEnd, "#FFAB40", 0.06);
        morphWire.material.transparent = true;
        morphWire.material.opacity = 0;
        morphWire.visible = false;
        morphWire.userData = { elementType: "wire_morph_stand_in", id: "solenoid_morph_wire" };
        addToScene(morphWire);

        // Coil geometry
        var coilGroup = createCoilGeometry(coilConf.turns, coilConf.radius, coilConf.axis, solenoidLength);
        coilGroup.userData = { elementType: "coil", id: "solenoid_coil" };
        // Materials inside the group must be transparent so per-frame opacity
        // tweens land. createCoilGeometry returns a Group of Meshes; flag each.
        for (var ci = 0; ci < coilGroup.children.length; ci++) {
            var cm = coilGroup.children[ci];
            if (cm.material) {
                cm.material.transparent = true;
                cm.material.opacity = 1;
            }
        }
        addToScene(coilGroup);

        // Internal field lines — dense, parallel to axis
        var internalLines = Math.max(4, Math.floor(lineCount * 0.6));
        for (var i = 0; i < internalLines; i++) {
            var angle = (i / internalLines) * Math.PI * 2;
            var r = coilConf.radius * 0.5;
            var x = r * Math.cos(angle);
            var y = r * Math.sin(angle);
            var points = [];
            for (var s = 0; s <= 16; s++) {
                var t = s / 16;
                points.push([x, y, -solenoidLength / 2 + t * solenoidLength]);
            }
            var tube = createTubeLine(points, flColor, 0.025);
            if (tube) {
                tube.userData = { elementType: "field_line_internal", id: "fl_int_" + i };
                addToScene(tube);
            }
            var mid = 8;
            var arrowMesh = createArrowHead(points[mid], [0, 0, 1], flColor);
            arrowMesh.userData = { elementType: "arrow", id: "arr_int_" + i };
            addToScene(arrowMesh);
        }

        // External field lines — TRUE closed return loops (bar-magnet pattern):
        //   exit the top end near the axis, sweep out and around the outside, and
        //   re-enter the bottom end — continuous with the internal lines (flux
        //   continuity, ∇·B = 0). Kept FEW and FAINT so a long solenoid reads
        //   "outside ≈ 0" (dense inside ≫ sparse outside).
        var externalLines = Math.max(3, Math.floor(lineCount * 0.4));
        for (var i = 0; i < externalLines; i++) {
            var angle = (i / externalLines) * Math.PI * 2;
            var extBulge = 1.1 + (i / externalLines) * 1.9;   // how far out this loop swings
            var points = [];
            for (var s = 0; s <= 40; s++) {
                var phi = (s / 40) * Math.PI;                  // 0..π: top end → outside → bottom end
                var rr = coilConf.radius * 0.5 + extBulge * Math.sin(phi);
                var zz = (solenoidLength / 2) * Math.cos(phi); // +L/2 → -L/2
                points.push([rr * Math.cos(angle), rr * Math.sin(angle), zz]);
            }
            var tube = createTubeLine(points, flColor, 0.012);
            if (tube) {
                if (tube.material) { tube.material.transparent = true; tube.material.opacity = 0.28; }
                tube.userData = { elementType: "field_line_external", id: "fl_ext_" + i };
                addToScene(tube);
            }
        }

        // ── Diamond #4 STATE_2 — per-turn field circles (one per coil turn).
        //   Built in coilGroup-local space (axis = +Z before rotation) so each
        //   turn's circle sits in the plane of that turn. Hidden by default;
        //   applyState turns them on when stateDef.per_turn_field_circles is set,
        //   and animate() fades them in at reveal_at_ms with a per-turn stagger.
        var ptColor = "#FFD54F"; // per-turn highlight color (yellow)
        var ptTurns = coilConf.turns || 6;
        for (var pti = 0; pti < ptTurns; pti++) {
            var turnZ = solenoidLength * ((pti + 0.5) / ptTurns - 0.5);
            // Wrap a slightly-larger ring around each turn so the field-circle
            // is visually distinct from the coil tube itself.
            var circleR = coilConf.radius * 1.18;
            var circlePts = [];
            var segs = 40;
            for (var cs = 0; cs <= segs; cs++) {
                var ca = (cs / segs) * Math.PI * 2;
                circlePts.push([circleR * Math.cos(ca), circleR * Math.sin(ca), turnZ]);
            }
            var ptTube = createTubeLine(circlePts, ptColor, 0.018);
            if (ptTube) {
                ptTube.userData = { elementType: "per_turn_field_circle", id: "ptfc_" + pti, turnIndex: pti };
                if (ptTube.material) {
                    ptTube.material.transparent = true;
                    ptTube.material.opacity = 0;
                }
                ptTube.visible = false;
                coilGroup.add(ptTube);
            }
        }

        // ── Diamond #4 STATE_3 — radial cancellation arrows (RED) between
        //   adjacent turns. For ptTurns turns there are ptTurns-1 inter-turn
        //   zones; each zone gets a pair of opposing arrows (top + bottom of
        //   the coil cross-section) pointing toward each other to visualize
        //   the mirror-image radial cancellation.
        var rcColor = "#EF4444";
        var rcZones = Math.max(1, ptTurns - 1);
        for (var rci = 0; rci < rcZones; rci++) {
            // Zone z-position halfway between turn rci and turn rci+1.
            var zA = solenoidLength * ((rci + 0.5) / ptTurns - 0.5);
            var zB = solenoidLength * ((rci + 1 + 0.5) / ptTurns - 0.5);
            var zMid = (zA + zB) / 2;
            var rArm = coilConf.radius * 0.9;
            // Pair 1: top (above-axis) arrows meeting in the middle.
            // Arrow from upper-turn side (above) pointing DOWN to zMid; arrow
            // from lower-turn side (below) pointing UP to zMid. Show in two
            // pair-positions (top of cross-section and bottom) so the
            // cancellation reads from multiple angles.
            var pairs = [
                { x: 0,  y:  rArm },
                { x: 0,  y: -rArm }
            ];
            for (var pi = 0; pi < pairs.length; pi++) {
                var p = pairs[pi];
                // Upper turn's contribution points toward zMid from zA side
                var upArr = createArrowHead(
                    [p.x, p.y, zMid],
                    [0, 0, zA < zB ? 1 : -1],
                    rcColor
                );
                upArr.userData = { elementType: "radial_cancel_arrow", id: "rca_" + rci + "_up_" + pi };
                if (upArr.material) { upArr.material.transparent = true; upArr.material.opacity = 0; upArr.material.depthTest = false; upArr.material.depthWrite = false; }
                upArr.renderOrder = 998;
                upArr.scale.set(1.5, 1.5, 1.5);
                upArr.visible = false;
                coilGroup.add(upArr);
                var dnArr = createArrowHead(
                    [p.x, p.y, zMid],
                    [0, 0, zA < zB ? -1 : 1],
                    rcColor
                );
                dnArr.userData = { elementType: "radial_cancel_arrow", id: "rca_" + rci + "_dn_" + pi };
                if (dnArr.material) { dnArr.material.transparent = true; dnArr.material.opacity = 0; dnArr.material.depthTest = false; dnArr.material.depthWrite = false; }
                dnArr.renderOrder = 998;
                dnArr.scale.set(1.5, 1.5, 1.5);
                dnArr.visible = false;
                coilGroup.add(dnArr);
            }
        }

        // ── Diamond #4 STATE_3 — axial buildup arrows (BLUE) down the solenoid
        //   centre: a small bundle of bold blue tubes + arrowheads that fade in
        //   AFTER the radial cancellation, showing "one uniform axial field
        //   survives." Built with createTubeLine + createArrowHead — the same
        //   primitives the field lines / per-turn circles use, which render
        //   reliably as coilGroup children (the prior CylinderGeometry shaft did
        //   not render). depthTest:false so they show through the front turns.
        var axColor = "#3B82F6";
        var axCount = 3;
        var axHalf = solenoidLength * 0.42;
        for (var axi = 0; axi < axCount; axi++) {
            var axOff = (axi - (axCount - 1) / 2) * (coilConf.radius * 0.30);
            var axPts = [];
            for (var aps = 0; aps <= 12; aps++) {
                var apz = -axHalf + (aps / 12) * (axHalf * 2);
                axPts.push([axOff, 0, apz]);
            }
            var axTube = createTubeLine(axPts, axColor, 0.05);
            if (axTube) {
                if (axTube.material) {
                    axTube.material.transparent = true;
                    axTube.material.opacity = 0;
                }
                axTube.visible = false;
                axTube.userData = { elementType: "axial_buildup_tube", id: "axb_tube_" + axi, axIndex: axi };
                coilGroup.add(axTube);
            }
            var axHead = createArrowHead([axOff, 0, axHalf], [0, 0, 1], axColor);
            if (axHead.material) {
                axHead.material.transparent = true;
                axHead.material.opacity = 0;
            }
            axHead.scale.set(2.2, 2.2, 2.2);
            axHead.visible = false;
            axHead.userData = { elementType: "axial_buildup_head", id: "axb_head_" + axi, axIndex: axi };
            coilGroup.add(axHead);
        }

        // ════════════════════════════════════════════════════════════════════
        // Diamond #4 enrichment (2026-06-14) — current motion, per-turn Biot-
        // Savart B, diametric-twin radial decomposition, axial stack. Built in
        // the coilGroup-local +Z frame (coilGroup is NOT rotated for axis
        // [0,1,0]). All hidden by default; the animate loop reveals per state.
        // ════════════════════════════════════════════════════════════════════

        // ── 1. Current-flow dots — animate ALONG the helix to show the live
        //   current direction (the renderer had flow dots for wire/biot/torque
        //   but none on the solenoid). Concatenate every turn into one polyline
        //   + cumulative arc length so dots move at constant visual speed.
        var helixPts = [];
        for (var hti = 0; hti < ptTurns; hti++) {
            for (var hai = 0; hai < 64; hai++) {        // 0..63: skip the seam dup
                var hAng = (hai / 64) * Math.PI * 2;
                helixPts.push([
                    coilConf.radius * Math.cos(hAng),
                    coilConf.radius * Math.sin(hAng),
                    solenoidLength * ((hti + hai / 64) / ptTurns - 0.5)
                ]);
            }
        }
        var helixCum = [0];
        var helixLen = 0;
        for (var hci = 1; hci < helixPts.length; hci++) {
            var hpa = helixPts[hci - 1], hpb = helixPts[hci];
            helixLen += Math.sqrt(
                (hpb[0]-hpa[0])*(hpb[0]-hpa[0]) +
                (hpb[1]-hpa[1])*(hpb[1]-hpa[1]) +
                (hpb[2]-hpa[2])*(hpb[2]-hpa[2])
            );
            helixCum.push(helixLen);
        }
        coilGroup.userData.helixPts = helixPts;
        coilGroup.userData.helixCum = helixCum;
        coilGroup.userData.helixLen = helixLen;

        var cfColor = (config.current && config.current.wire_color) || "#FFD54F";
        var cfCount = (config.current && config.current.flow_dot_count) || 14;
        for (var cfi = 0; cfi < cfCount; cfi++) {
            var cfGeo = new THREE.SphereGeometry(0.085, 14, 14);
            var cfMat = new THREE.MeshPhongMaterial({
                color: hexToThreeColor(cfColor), emissive: hexToThreeColor("#FFAB00"),
                emissiveIntensity: 0.85, transparent: true, opacity: 0
            });
            var cfDot = new THREE.Mesh(cfGeo, cfMat);
            cfDot.userData = { elementType: "current_flow_dot", id: "cfd_" + cfi, t: cfi / cfCount, speed: 0.16 };
            cfDot.visible = false;
            cfDot.renderOrder = 997;
            var cfInit = sampleHelix(cfi / cfCount, helixPts, helixCum, helixLen);
            cfDot.position.set(cfInit[0], cfInit[1], cfInit[2]);
            coilGroup.add(cfDot);
        }

        // ── 2. STATE_2 "each turn makes its own B" — small Biot-Savart B-circles
        //   wrapping AROUND the wire (perpendicular to the local tangent), the
        //   straight-wire field (Diamond #1) bent around the loop, plus a short
        //   axial mini-arrow through each loop centre (the turn's net field).
        var wrapColor = "#7FE7FF";
        var wrapPerTurn = 6;
        var wrapR = 0.2;
        for (var wti = 0; wti < ptTurns; wti++) {
            var wTurnZ = solenoidLength * ((wti + 0.5) / ptTurns - 0.5);
            for (var wpi = 0; wpi < wrapPerTurn; wpi++) {
                var wPhi = (wpi / wrapPerTurn) * Math.PI * 2;
                var wcx = coilConf.radius * Math.cos(wPhi);
                var wcy = coilConf.radius * Math.sin(wPhi);
                // local wire tangent (in-plane approx for a tight coil)
                var tgx = -Math.sin(wPhi), tgy = Math.cos(wPhi), tgz = 0;
                // u = tangent × zhat, v = tangent × u  → basis of the plane ⟂ tangent
                var uxv = tgy, uyv = -tgx, uzv = 0;
                var uln = Math.sqrt(uxv*uxv + uyv*uyv + uzv*uzv) || 1; uxv/=uln; uyv/=uln; uzv/=uln;
                var vxv = tgy*uzv - tgz*uyv, vyv = tgz*uxv - tgx*uzv, vzv = tgx*uyv - tgy*uxv;
                var vln = Math.sqrt(vxv*vxv + vyv*vyv + vzv*vzv) || 1; vxv/=vln; vyv/=vln; vzv/=vln;
                var wrapPts = [];
                var wsegs = 22;
                for (var wsi = 0; wsi <= wsegs; wsi++) {
                    var wth = (wsi / wsegs) * Math.PI * 2;
                    wrapPts.push([
                        wcx + wrapR*(Math.cos(wth)*uxv + Math.sin(wth)*vxv),
                        wcy + wrapR*(Math.cos(wth)*uyv + Math.sin(wth)*vyv),
                        wTurnZ + wrapR*(Math.cos(wth)*uzv + Math.sin(wth)*vzv)
                    ]);
                }
                var wrapTube = createTubeLine(wrapPts, wrapColor, 0.013);
                if (wrapTube) {
                    if (wrapTube.material) { wrapTube.material.transparent = true; wrapTube.material.opacity = 0; }
                    wrapTube.visible = false;
                    wrapTube.userData = { elementType: "wire_wrap_circle", id: "wwc_" + wti + "_" + wpi, turnIndex: wti };
                    coilGroup.add(wrapTube);
                }
            }
            var ptaArrow = createArrowHead([0, 0, wTurnZ + 0.28], [0, 0, 1], "#3B82F6");
            if (ptaArrow.material) { ptaArrow.material.transparent = true; ptaArrow.material.opacity = 0; }
            ptaArrow.scale.set(1.3, 1.3, 1.3);
            ptaArrow.visible = false;
            ptaArrow.userData = { elementType: "per_turn_axial_arrow", id: "pta_" + wti, turnIndex: wti };
            coilGroup.add(ptaArrow);
        }

        // ── 3. Diametric-twin radial decomposition (STATE_3). At a point P on the
        //   axis, the field from a current element on the RIGHT and its diametric
        //   twin on the LEFT split into axial (z, blue) + radial (x, red) pieces:
        //   radial halves are equal & opposite → cancel; axial halves add. P is the
        //   local origin so the red radials can shrink-to-P to annihilate.
        function addDecompArrow(idBase, fromP, toP, color, shaftR, etype) {
            var shaft = createTubeLine([fromP, toP], color, shaftR);
            if (shaft) {
                if (shaft.material) { shaft.material.transparent = true; shaft.material.opacity = 0; shaft.material.depthTest = false; shaft.material.depthWrite = false; }
                shaft.renderOrder = 999;
                shaft.visible = false;
                shaft.userData = { elementType: etype, id: idBase + "_shaft", role: "shaft", fromP: fromP.slice(), toP: toP.slice() };
                coilGroup.add(shaft);
            }
            var hDir = [toP[0]-fromP[0], toP[1]-fromP[1], toP[2]-fromP[2]];
            var head = createArrowHead(toP, hDir, color);
            if (head.material) { head.material.transparent = true; head.material.opacity = 0; head.material.depthTest = false; head.material.depthWrite = false; }
            head.renderOrder = 999;
            head.scale.set(1.25, 1.25, 1.25);
            head.visible = false;
            head.userData = { elementType: etype, id: idBase + "_head", role: "head", fromP: fromP.slice(), toP: toP.slice() };
            coilGroup.add(head);
        }

        var rdG = config.radial_decomposition_geometry || {};
        var rdFocalTurn = (rdG.focal_turn != null) ? rdG.focal_turn : 1;
        var rdRingZ = (rdG.ring_z != null) ? rdG.ring_z : solenoidLength * ((rdFocalTurn + 0.5) / ptTurns - 0.5);
        var rdP = rdG.sample_point || [0, 0, 0];
        var rdArrowLen = rdG.arrow_len || 1.25;
        var rdRad = coilConf.radius;
        var rdD = rdP[2] - rdRingZ;                                   // axial offset ring→P
        var rdMag = Math.sqrt(rdD*rdD + rdRad*rdRad) || 1;
        var rdAxL = rdArrowLen * (rdRad / rdMag);                     // axial component length
        var rdRadL = rdArrowLen * (Math.abs(rdD) / rdMag);           // radial component length

        // source current elements (the diametric twins on the ring) + the axis point
        var elR = createChargeSphere([rdRad, 0, rdRingZ], "#FFAB40", 0.09);
        elR.userData = { elementType: "rd_element", id: "rd_el_right" }; elR.visible = false;
        if (elR.material) { elR.material.transparent = true; elR.material.opacity = 0; }
        coilGroup.add(elR);
        var elL = createChargeSphere([-rdRad, 0, rdRingZ], "#FFAB40", 0.09);
        elL.userData = { elementType: "rd_element", id: "rd_el_left" }; elL.visible = false;
        if (elL.material) { elL.material.transparent = true; elL.material.opacity = 0; }
        coilGroup.add(elL);
        var axPt = createChargeSphere(rdP, "#FFFFFF", 0.07);
        axPt.userData = { elementType: "rd_axis_point", id: "rd_axis_point" }; axPt.visible = false;
        if (axPt.material) { axPt.material.transparent = true; axPt.material.opacity = 0; }
        coilGroup.add(axPt);
        // faint causal rays element → P
        var rayR = createTubeLine([[rdRad,0,rdRingZ], rdP], "#9CA3AF", 0.008);
        if (rayR) { if (rayR.material){ rayR.material.transparent=true; rayR.material.opacity=0; } rayR.visible=false; rayR.userData={ elementType:"rd_ray", id:"rd_ray_right" }; coilGroup.add(rayR); }
        var rayL = createTubeLine([[-rdRad,0,rdRingZ], rdP], "#9CA3AF", 0.008);
        if (rayL) { if (rayL.material){ rayL.material.transparent=true; rayL.material.opacity=0; } rayL.visible=false; rayL.userData={ elementType:"rd_ray", id:"rd_ray_left" }; coilGroup.add(rayL); }

        // full contribution arrows at P (yellow): up-and-out / up-and-in
        addDecompArrow("rd_contrib_right", rdP, [rdP[0]+rdRadL, rdP[1], rdP[2]+rdAxL], "#FFD54F", 0.03, "rd_contribution");
        addDecompArrow("rd_contrib_left",  rdP, [rdP[0]-rdRadL, rdP[1], rdP[2]+rdAxL], "#FFD54F", 0.03, "rd_contribution");
        // axial components (blue) — both point +z (add)
        addDecompArrow("rd_axial_right", rdP, [rdP[0], rdP[1], rdP[2]+rdAxL], "#3B82F6", 0.026, "rd_axial");
        addDecompArrow("rd_axial_left",  rdP, [rdP[0], rdP[1], rdP[2]+rdAxL], "#3B82F6", 0.026, "rd_axial");
        // radial components (red) — point +x and -x (equal & opposite → cancel)
        addDecompArrow("rd_radial_right", rdP, [rdP[0]+rdRadL, rdP[1], rdP[2]], "#EF4444", 0.026, "rd_radial");
        addDecompArrow("rd_radial_left",  rdP, [rdP[0]-rdRadL, rdP[1], rdP[2]], "#EF4444", 0.026, "rd_radial");
        // doubled axial sum (for the AXIAL state head-to-tail stack)
        addDecompArrow("ax_stack_sum", rdP, [rdP[0], rdP[1], rdP[2]+2*rdAxL], "#3B82F6", 0.036, "ax_stack_sum");

        // ── Beat 3 (2026-06-14): along-length axial stack. Short blue axial
        //   arrows at successive z down the axis, revealed left to right
        //   (staggered) so the student sees the WHOLE-solenoid summation —
        //   every ring along L adding its axial bit into one uniform field
        //   (the n.dx.i superposition Alakh Pandey teaches). Complements the
        //   single-ring diametric-twin stack above. Hidden until STATE_4.
        var lsCount = 6;
        var lsHalf = solenoidLength * 0.40;
        var lsLen = coilConf.radius * 0.55;
        for (var lsi = 0; lsi < lsCount; lsi++) {
            var lsz = -lsHalf + (lsi / (lsCount - 1)) * (lsHalf * 2);
            var lsShaft = createTubeLine([[0, 0, lsz], [0, 0, lsz + lsLen]], "#3B82F6", 0.03);
            if (lsShaft) {
                if (lsShaft.material) { lsShaft.material.transparent = true; lsShaft.material.opacity = 0; lsShaft.material.depthTest = false; lsShaft.material.depthWrite = false; }
                lsShaft.renderOrder = 997; lsShaft.visible = false;
                lsShaft.userData = { elementType: "length_stack_arrow", id: "length_stack_" + lsi + "_shaft", lsIndex: lsi };
                coilGroup.add(lsShaft);
            }
            var lsHead = createArrowHead([0, 0, lsz + lsLen], [0, 0, 1], "#3B82F6");
            if (lsHead.material) { lsHead.material.transparent = true; lsHead.material.opacity = 0; lsHead.material.depthTest = false; lsHead.material.depthWrite = false; }
            lsHead.scale.set(1.1, 1.1, 1.1); lsHead.renderOrder = 997; lsHead.visible = false;
            lsHead.userData = { elementType: "length_stack_arrow", id: "length_stack_" + lsi + "_head", lsIndex: lsi };
            coilGroup.add(lsHead);
        }

        // ── Beat 1 (2026-06-14): N/S pole labels at the solenoid ends — the
        //   "a solenoid IS a bar magnet" hook. Four sprites (N+S at each end);
        //   the animate loop shows the correct pair per field_lines_dir so the
        //   poles SWAP when the current reverses (STATE_8) — exactly Alakh
        //   Pandey's suspended-solenoid demo (rests N-S; reverse battery ->
        //   flips 180 degrees). N is the end the interior field points toward.
        var poleZ = solenoidLength * 0.5 + 0.55;
        var poleSpecs = [
            { id: "pole_Np", end: 1, pole: "N", text: "N", color: "#EF4444", z: poleZ },
            { id: "pole_Sp", end: 1, pole: "S", text: "S", color: "#3B82F6", z: poleZ },
            { id: "pole_Nn", end: -1, pole: "N", text: "N", color: "#EF4444", z: -poleZ },
            { id: "pole_Sn", end: -1, pole: "S", text: "S", color: "#3B82F6", z: -poleZ }
        ];
        for (var psi = 0; psi < poleSpecs.length; psi++) {
            var ps = poleSpecs[psi];
            var plab = createLabelSprite(ps.text, ps.color, 0.44);
            plab.position.set(0, 0, ps.z);
            if (plab.material) plab.material.opacity = 0;
            plab.visible = false;
            plab.userData = { elementType: "pole_label", id: ps.id, end: ps.end, pole: ps.pole };
            coilGroup.add(plab);
        }
    }

    function buildBarMagnetField(config_unused) {
        var magnetLength = 2;
        var flColor = config.field_lines.color_positive || "#66BB6A";
        var lineCount = config.field_lines.count || 10;
        var posColor = config.pvl_colors ? config.pvl_colors.positive : "#EF5350";
        var negColor = config.pvl_colors ? config.pvl_colors.negative : "#42A5F5";

        // Bar magnet body — two halves (N=red, S=blue)
        var nGeo = new THREE.BoxGeometry(0.6, 0.6, magnetLength / 2);
        var nMat = new THREE.MeshPhongMaterial({ color: hexToThreeColor(posColor || "#EF5350") });
        var nMesh = new THREE.Mesh(nGeo, nMat);
        nMesh.position.set(0, 0, magnetLength / 4);
        nMesh.userData = { elementType: "magnet_north", id: "magnet_n" };
        addToScene(nMesh);

        var sGeo = new THREE.BoxGeometry(0.6, 0.6, magnetLength / 2);
        var sMat = new THREE.MeshPhongMaterial({ color: hexToThreeColor(negColor || "#42A5F5") });
        var sMesh = new THREE.Mesh(sGeo, sMat);
        sMesh.position.set(0, 0, -magnetLength / 4);
        sMesh.userData = { elementType: "magnet_south", id: "magnet_s" };
        addToScene(sMesh);

        // External field lines — N to S loops
        var goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (var i = 0; i < lineCount; i++) {
            var frac = 1 - (i / (lineCount - 1)) * 2;
            var radiusAtFrac = Math.sqrt(Math.max(0, 1 - frac * frac));
            var theta = goldenAngle * i;

            var bulge = 1.2 + Math.abs(frac) * 1.8;
            var offX = radiusAtFrac * Math.cos(theta) * bulge;
            var offY = frac * bulge;

            var points = [];
            var segments = 28;
            var nPos = [0, 0, magnetLength / 2];
            var sPos = [0, 0, -magnetLength / 2];
            for (var s = 0; s <= segments; s++) {
                var t = s / segments;
                var cz = nPos[2] * (1 - t) + sPos[2] * t;
                var blend = Math.sin(t * Math.PI);
                points.push([offX * blend, offY * blend, cz]);
            }

            var tube = createTubeLine(points, flColor, 0.018);
            if (tube) {
                tube.userData = { elementType: "field_line", id: "fl_mag_" + i };
                addToScene(tube);
            }

            // Arrow at 1/3 point
            var aIdx = Math.floor(segments / 3);
            if (aIdx > 0) {
                var arrowDir = [
                    points[aIdx][0] - points[aIdx-1][0],
                    points[aIdx][1] - points[aIdx-1][1],
                    points[aIdx][2] - points[aIdx-1][2]
                ];
                var arrowMesh = createArrowHead(points[aIdx], arrowDir, flColor);
                arrowMesh.userData = { elementType: "arrow", id: "arr_mag_" + i };
                addToScene(arrowMesh);
            }
        }
    }

    function buildStraightWireField(config_unused) {
        var wireColor = (config.current && config.current.wire_color) ? config.current.wire_color : "#FFAB40";
        var flColor = config.field_lines.color_positive || "#66BB6A";
        var lineCount = config.field_lines.count || 6;

        // Vertical wire
        var wire = createWire([0, -3, 0], [0, 3, 0], wireColor, 0.08);
        wire.userData = { elementType: "wire", id: "wire_main" };
        addToScene(wire);

        // Current direction arrow on wire (head sits near top of wire by default;
        // hidden / flipped per state via the current_direction_indicator pipeline)
        var currArrow = createArrowHead([0, 1.5, 0], [0, 1, 0], wireColor);
        currArrow.userData = { elementType: "current_arrow", id: "curr_arr" };
        addToScene(currArrow);

        // Conventional-current flow visualization: 6 yellow dots evenly spaced
        // along the wire. animate() drives their Y-position based on the current
        // state's current_direction_indicator ('up' | 'down'). Hidden when the
        // state has no indicator set.
        var dotCount = 6;
        for (var di = 0; di < dotCount; di++) {
            var dotGeo = new THREE.SphereGeometry(0.10, 14, 14);
            var dotMat = new THREE.MeshPhongMaterial({
                color: 0xFFD54F, emissive: 0xFFAB00, emissiveIntensity: 0.7
            });
            var dot = new THREE.Mesh(dotGeo, dotMat);
            dot.userData = { elementType: "current_dot", id: "cdot_" + di, dotIndex: di, dotCount: dotCount };
            dot.position.set(0, -2.5 + (di / dotCount) * 5, 0);
            dot.visible = false; // applyState turns this on per-state
            addToScene(dot);
        }

        // Concentric circular field lines at different heights and radii.
        // Each tube is static (closed loop — rotation is invisible), each arrow
        // gets flow metadata so animate() can orbit it around the wire when the
        // state requests rotation.
        var heights = [-1.5, 0, 1.5];
        for (var h = 0; h < heights.length; h++) {
            for (var ri = 0; ri < lineCount; ri++) {
                var radius = 0.6 + ri * 0.5;
                var points = [];
                var segments = 48;
                for (var s = 0; s <= segments; s++) {
                    var angle = (s / segments) * Math.PI * 2;
                    points.push([radius * Math.cos(angle), heights[h], radius * Math.sin(angle)]);
                }
                var tube = createTubeLine(points, flColor, 0.015);
                if (tube) {
                    tube.userData = { elementType: "field_line", id: "fl_wire_" + h + "_" + ri };
                    addToScene(tube);
                }
                // Arrow at quarter circle. Stored flow metadata enables orbital
                // animation in animate(): the arrow walks around the circle of
                // radius 'radius' at height heights[h], maintaining tangent
                // orientation (sense flips with field_rotation_direction).
                var qIdx = Math.floor(segments / 4);
                if (qIdx > 0) {
                    var arrowDir = [
                        points[qIdx][0] - points[qIdx-1][0],
                        points[qIdx][1] - points[qIdx-1][1],
                        points[qIdx][2] - points[qIdx-1][2]
                    ];
                    var arrowMesh = createArrowHead(points[qIdx], arrowDir, flColor);
                    arrowMesh.userData = {
                        elementType: "arrow",
                        id: "arr_wire_" + h + "_" + ri,
                        flowRadius: radius,
                        flowHeight: heights[h],
                        flowAngleOffset: Math.PI / 2 // initial position = quarter circle (matches qIdx)
                    };
                    addToScene(arrowMesh);
                }
            }
        }
    }

    function buildBiotSavartField(config_unused) {
        // Archetype A meta — Biot-Savart law, choreographed for storytelling.
        // Reuses createWire / createTubeLine / createArrowHead / createHighlightedPoint.
        // Each vector is a "grow-from-origin" group (anchored at its tail, children in
        // local space) so the animate loop can draw it outward on a per-state schedule
        // (revealAt by elementType). Plus: current-flow dots (live wire), an angle arc,
        // an orbiting circulation arrow, a scan highlight, and the dB accumulation.
        var wireColor = (config.current && config.current.wire_color) ? config.current.wire_color : "#FFAB40";
        var flColor = config.field_lines.color_positive || "#66BB6A";
        var rhatColor = "#D4D4D8";
        var crossColor = "#66BB6A";
        var dbColor = "#66BB6A";
        var thetaColor = "#FFF176";
        var defs = config.biot_defaults || {};
        var P = defs.field_point_P || [1.6, 0, 0];
        var wireHalf = defs.wire_half_length || 3.0;
        var numElements = defs.num_elements || 9;

        // ── tiny vector helpers (ES5, no THREE dependency) ──────────────
        function vlen(a) { return Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]); }
        function vsub(a, b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
        function vadd(a, b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
        function vscale(a, s) { return [a[0]*s, a[1]*s, a[2]*s]; }
        function vdot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
        function vnorm(a) { var L = vlen(a) || 1; return [a[0]/L, a[1]/L, a[2]/L]; }
        function vcross(a, b) {
            return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
        }

        // A grow-from-origin vector arrow: Group anchored at its tail, with the shaft
        // tube + cone head built in LOCAL coords (origin to tip). The animate loop
        // grows it by scaling the group 0→1 (draws outward from the tail) and fades
        // the children via their stored baseOpacity. revealAt = ms after state enter.
        function bsArrow(from, to, color, rad, elementType, id, revealAt) {
            var grp = new THREE.Group();
            grp.position.set(from[0], from[1], from[2]);
            var lto = vsub(to, from);
            var tube = createTubeLine([[0, 0, 0], lto], color, rad || 0.02);
            if (tube) {
                tube.material.transparent = true;
                tube.userData = { baseOpacity: tube.material.opacity };
                grp.add(tube);
            }
            var head = createArrowHead(lto, lto, color);
            head.material.transparent = true;
            head.userData = { baseOpacity: 1 };
            grp.add(head);
            grp.userData = { elementType: elementType, id: id, revealAt: revealAt, grows: true, fadeChildren: true };
            return grp;
        }

        var dlDir = [0, 1, 0]; // current flows up the wire

        // Wire
        var wire = createWire([0, -wireHalf, 0], [0, wireHalf, 0], wireColor, 0.06);
        wire.userData = { elementType: "wire", id: "bs_wire" };
        addToScene(wire);

        // Current direction arrow
        var currArrow = createArrowHead([0, wireHalf * 0.6, 0], [0, 1, 0], wireColor);
        currArrow.userData = { elementType: "current_arrow", id: "bs_curr_arrow" };
        addToScene(currArrow);

        // ── Current-flow dots — animate up the wire to show the live current.
        //   Shown only when the active state sets biot_element.show_current_flow.
        var flowCount = 7;
        for (var fd = 0; fd < flowCount; fd++) {
            var fGeo = new THREE.SphereGeometry(0.07, 10, 10);
            var fMat = new THREE.MeshPhongMaterial({
                color: 0xFFF59D, emissive: 0xFFD54F, emissiveIntensity: 0.85,
                transparent: true, opacity: 0
            });
            var fdot = new THREE.Mesh(fGeo, fMat);
            fdot.position.set(0, -wireHalf + (fd / flowCount) * (2 * wireHalf), 0);
            fdot.userData = { elementType: "biot_flow", id: "bs_flow_" + fd, phase: fd / flowCount };
            fdot.visible = false;
            addToScene(fdot);
        }

        // Field point P — grow-in pop (revealAt 0)
        var pPoint = createHighlightedPoint({ position: P, color: "#FFEB3B", label: "P", radius: 0.12 });
        pPoint.userData = { elementType: "field_point", id: "bs_point_P", pulse: true, revealAt: 0, grows: true, fadeChildren: false };
        addToScene(pPoint);

        // Primary single element dl at the wire origin (y = 0): a short, fat,
        // brighter cylinder so it reads as "this one piece". Grows in at 250ms.
        var dlHalf = 0.28;
        var dlMid = [0, 0, 0];
        var dl = createWire([0, -dlHalf, 0], [0, dlHalf, 0], wireColor, 0.12);
        dl.material.emissive = hexToThreeColor(wireColor);
        dl.material.emissiveIntensity = 0.55;
        dl.userData = { elementType: "biot_dl", id: "bs_dl", revealAt: 250, grows: true, fadeChildren: false };
        addToScene(dl);

        // r̂ arrow: element → P (draws outward at 1000ms)
        var rVec = vsub(P, dlMid);
        var rHat = vnorm(rVec);
        var rhatArrow = bsArrow(dlMid, vadd(dlMid, vscale(rHat, vlen(rVec))), rhatColor, 0.02, "biot_rhat", "bs_rhat", 1000);
        addToScene(rhatArrow);

        // Angle arc θ between dl (up) and r̂, at the element (reveals at 2000ms).
        var arcGrp = new THREE.Group();
        arcGrp.position.set(dlMid[0], dlMid[1], dlMid[2]);
        var arcA = vnorm(dlDir);
        var arcDot = Math.max(-1, Math.min(1, vdot(arcA, rHat)));
        var arcAng = Math.acos(arcDot);
        var arcW = vnorm(vsub(rHat, vscale(arcA, arcDot)));
        var arcPts = [], arcRad = 0.45, arcSegs = 24;
        for (var as = 0; as <= arcSegs; as++) {
            var at = (as / arcSegs) * arcAng;
            arcPts.push(vadd(vscale(arcA, arcRad * Math.cos(at)), vscale(arcW, arcRad * Math.sin(at))));
        }
        var arcTube = createTubeLine(arcPts, thetaColor, 0.012);
        if (arcTube) {
            arcTube.material.transparent = true;
            arcTube.userData = { baseOpacity: 1 };
            arcGrp.add(arcTube);
        }
        arcGrp.userData = { elementType: "biot_theta", id: "bs_theta", revealAt: 2000, grows: true, fadeChildren: true };
        addToScene(arcGrp);

        // dl × r̂ at the element — perpendicular to both. For a straight wire and a
        // fixed P this direction is the SAME for every element (why dB's ADD).
        // Draws at 2800ms.
        var crossDir = vnorm(vcross(dlDir, rHat));
        var crossArrow = bsArrow(dlMid, vadd(dlMid, vscale(crossDir, 0.9)), crossColor, 0.022, "biot_cross", "bs_cross", 2800);
        addToScene(crossArrow);

        // dB at P (along dl × r̂) — the contribution of this one element. Draws at 3700ms.
        var dBArrow = bsArrow(P, vadd(P, vscale(crossDir, 0.9)), dbColor, 0.025, "biot_db", "bs_dB", 3700);
        addToScene(dBArrow);

        // ── Accumulation elements + stacked dB contributions at P ────────
        // Each element's dB ∝ sinθ/r² and points along crossDir; we stack the
        // contributions at P so the growing column visualises the integral.
        var weights = [], ys = [], maxW = 1e-9, totalW = 0;
        for (var ai = 0; ai < numElements; ai++) {
            var frac = numElements > 1 ? (ai / (numElements - 1)) : 0.5;
            var yEl = -wireHalf * 0.85 + frac * (wireHalf * 1.7);
            var rv = vsub(P, [0, yEl, 0]);
            var rlen = vlen(rv);
            var sinTheta = vlen(vcross(dlDir, vnorm(rv)));   // |dlDir × r̂|, dlDir unit
            var w = sinTheta / (rlen * rlen);
            weights.push(w); ys.push(yEl); totalW += w;
            if (w > maxW) maxW = w;
        }
        var STACK_TARGET = 1.6; // world height of the fully summed column
        var cum = 0;
        for (var bi = 0; bi < numElements; bi++) {
            var grp = new THREE.Group();
            // wire marker
            var mkGeo = new THREE.SphereGeometry(0.085, 12, 12);
            var mkMat = new THREE.MeshPhongMaterial({
                color: hexToThreeColor(wireColor), emissive: hexToThreeColor(wireColor),
                emissiveIntensity: 0.7, transparent: true, opacity: 0
            });
            var mk = new THREE.Mesh(mkGeo, mkMat);
            mk.position.set(0, ys[bi], 0);
            grp.add(mk);
            // stacked dB contribution at P
            var len = STACK_TARGET * (weights[bi] / totalW);
            var from = vadd(P, vscale(crossDir, cum));
            var to = vadd(P, vscale(crossDir, cum + len));
            cum += len;
            var seg = createTubeLine([from, to], dbColor, 0.03);
            if (seg) { seg.material.transparent = true; seg.material.opacity = 0; grp.add(seg); }
            grp.visible = false;
            grp.userData = {
                elementType: "biot_accum", id: "bs_accum_" + bi,
                elemIndex: bi, sinThetaWeight: weights[bi] / maxW, elemY: ys[bi]
            };
            addToScene(grp);
        }

        // Scan highlight — a bright disc that travels down the wire in STATE_8 so
        // the eye follows the sinθ/r² weighting from the dominant middle element to
        // the vanishing ends. Shown only when biot_element.weight_by_sin_theta.
        var scanGeo = new THREE.TorusGeometry(0.22, 0.03, 8, 24);
        var scanMat = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF, emissive: 0xFFF176, emissiveIntensity: 0.9,
            transparent: true, opacity: 0
        });
        var scanner = new THREE.Mesh(scanGeo, scanMat);
        scanner.rotation.x = Math.PI / 2; // lie flat around the wire
        scanner.userData = { elementType: "biot_scan", id: "bs_scanner" };
        scanner.visible = false;
        addToScene(scanner);

        // ── Assembled circular field (the circle through P) ──────────────
        // Three stacked rings at radius rP; opacity is driven per-frame (faint in
        // STATE_1, ramps during accumulation, bright in STATE_9/10).
        var rP = Math.sqrt(P[0]*P[0] + P[2]*P[2]) || 1.6;
        var ringHeights = [-1.2, 0, 1.2];
        for (var rh = 0; rh < ringHeights.length; rh++) {
            var rpts = [], rsegs = 48;
            for (var rs = 0; rs <= rsegs; rs++) {
                var ra = (rs / rsegs) * Math.PI * 2;
                rpts.push([rP * Math.cos(ra), ringHeights[rh], rP * Math.sin(ra)]);
            }
            var ring = createTubeLine(rpts, flColor, 0.02);
            if (ring) {
                ring.material.transparent = true;
                ring.material.opacity = 0;
                ring.userData = { elementType: "biot_circle", id: "bs_circle_ring_" + rh };
                addToScene(ring);
            }
            // physically-correct tangent arrow at P on the mid ring (dl × r̂).
            // animate() orbits it around the wire when the state sets circulate.
            if (rh === 1) {
                var carr = createArrowHead(P, crossDir, flColor);
                carr.material.transparent = true;
                carr.material.opacity = 0;
                carr.userData = { elementType: "biot_circle", id: "bs_circle_arr", orbitRadius: rP };
                addToScene(carr);
            }
        }

        // Orbiting circulation arrow for the top-down dot/cross practice (STATE_6):
        // a green arrow that travels around the wire so the student SEES the field
        // circulate. animate() drives its angle when biot_element.direction_practice.
        var orbitArr = createArrowHead([rP, 0, 0], crossDir, flColor);
        orbitArr.material.transparent = true;
        orbitArr.material.opacity = 0;
        orbitArr.userData = { elementType: "biot_orbit", id: "bs_orbit", orbitRadius: rP };
        orbitArr.visible = false;
        addToScene(orbitArr);

        // ── In-scene symbol labels (camera-facing sprites) ───────────────
        // Textbook-style annotations placed ON the diagram: dl, r, θ, P, dl×r̂,
        // dB, I, B. Each label id is "<element_id>_label" so the existing
        // visible_elements tokens (bs_dl, bs_rhat, bs_theta, bs_point_P, bs_cross,
        // bs_dB, bs_curr_arrow, bs_circle) match it by substring and show/hide it
        // with its element. revealAt matches the element so the symbol fades in as
        // the shape draws (handled as isLabel in the animate loop — fade, no scale).
        function bsLabel(text, pos, color, id, revealAt) {
            var spr = createLabelSprite(text, color, 0.5);
            spr.position.set(pos[0], pos[1], pos[2]);
            spr.material.transparent = true;
            spr.material.opacity = 0;
            spr.userData = { elementType: "biot_label", id: id, revealAt: revealAt, grows: true, isLabel: true, fadeChildren: false };
            addToScene(spr);
        }
        // midpoint of r̂ (element → P), offset below the shaft for the "r" label
        var rMid = vscale(vadd(dlMid, P), 0.5);
        bsLabel("dl", vadd(dlMid, [-0.6, 0.18, 0.35]), wireColor, "bs_dl_label", 250);
        bsLabel("r", vadd(rMid, [0.0, -0.42, 0.25]), rhatColor, "bs_rhat_label", 1000);
        bsLabel("\\u03b8", vadd(dlMid, [0.5, 0.5, 0.2]), thetaColor, "bs_theta_label", 2000);
        bsLabel("P", vadd(P, [0.18, 0.5, 0.25]), "#FFEB3B", "bs_point_P_label", 0);
        bsLabel("dl\\u00d7r\\u0302", vadd(dlMid, vadd(vscale(crossDir, 0.9), [0.25, 0.5, 0])), crossColor, "bs_cross_label", 2800);
        bsLabel("dB", vadd(P, vadd(vscale(crossDir, 0.9), [0.4, 0.4, 0])), dbColor, "bs_dB_label", 3700);
        bsLabel("I", [0.42, wireHalf * 0.6 + 0.2, 0.0], wireColor, "bs_curr_arrow_label", 0);
        bsLabel("B", [-rP, 0.45, 0.0], flColor, "bs_circle_B_label", 400);

        // ── Grip / thumb rule hand (STATE_1, STATE_9) — ANIMATED ─────────
        // Uses the Diamond-#2 animatable mesh so the fingers curl realistically
        // (regenerated per frame via lorentzFingerPoints in animate block 7).
        // The mesh's IDENTITY orientation already IS the grip gesture for this
        // scene: thumb +y = I (up the wire), and the finger sweep -z -> -x is a
        // positive rotation about +y = exactly the B circulation sense for
        // current up. 2-beat story: flat hold ("I" on thumb) -> curl -> full-
        // curl hold ("B" on the curled fingertips) -> uncurl, repeat.
        var gripHand = createLorentzHand({ position: [2.4, 0.2, 0.6], scale: 1.0 });
        if (gripHand.userData.v_label) gripHand.userData.v_label.visible = false;
        if (gripHand.userData.b_label) gripHand.userData.b_label.visible = false;
        if (gripHand.userData.f_label) gripHand.userData.f_label.visible = false;
        if (gripHand.userData.v_arrow) gripHand.userData.v_arrow.visible = false;
        if (gripHand.userData.b_arrow) gripHand.userData.b_arrow.visible = false;
        if (gripHand.userData.f_arrow) gripHand.userData.f_arrow.visible = false;
        // Repurpose the thumb arrow (+y) as I and the curl arrow (-x) as B.
        if (gripHand.userData.f_arrow) gripHand.userData.f_arrow.setColor(new THREE.Color(0xFFAB40));
        if (gripHand.userData.b_arrow) gripHand.userData.b_arrow.setColor(new THREE.Color(0x66BB6A));
        var gripILabel = createLabelSprite("I", wireColor, 0.5);
        if (gripHand.userData.f_label) gripILabel.position.copy(gripHand.userData.f_label.position);
        gripILabel.visible = false;
        gripHand.add(gripILabel);
        var gripBLabel = createLabelSprite("B", flColor, 0.5);
        if (gripHand.userData.b_label) gripBLabel.position.copy(gripHand.userData.b_label.position);
        gripBLabel.visible = false;
        gripHand.add(gripBLabel);
        gripHand.userData.elementType = "biot_grip_hand";
        gripHand.userData.id = "bs_grip_hand";
        gripHand.userData.homePos = [2.4, 0.2, 0.6];
        gripHand.userData.i_label = gripILabel;
        gripHand.userData.b_grip_label = gripBLabel;
        gripHand.visible = false;
        addToScene(gripHand);

        // ── Cross-product rule hand (STATE_5, STATE_6) ───────────────────
        // Reuses the Diamond-#2 cross-product mesh: flat fingers (-z local)
        // along dl, fingertips curl (-x local) toward r-hat, thumb (+y local)
        // = dB. We relabel v/B/F -> dl / r-hat / dB, curl the fingers to a
        // held mid-gesture, reveal the three pointer arrows, and orient the
        // whole hand to the biot geometry. Hidden by default; applyState shows
        // it only when biot_element.show_cross_hand is set.
        var crossHand = createLorentzHand({ position: [-2.6, 1.7, 1.0], scale: 0.85 });
        // ANIMATED: the fingers are regenerated per frame in animate block 7
        // (clone of Diamond-#2's 3-phase-pause-animation), so no fixed curl is
        // baked here. 3-beat story: flat fingers ("dl") -> curl -> mid-curl
        // hold ("r-hat") -> full curl ("dB" on the thumb) -> snap back.
        // Arrows + relabeled sprites start hidden; the animate loop shows each
        // only during its hold phase. Recolor the r-hat arrow grey to match the
        // scene's r-hat (the Lorentz mesh painted it blue for B).
        if (crossHand.userData.v_arrow) crossHand.userData.v_arrow.visible = false;  // -z -> dl
        if (crossHand.userData.b_arrow) {
            crossHand.userData.b_arrow.visible = false;                               // -x -> r-hat
            crossHand.userData.b_arrow.setColor(new THREE.Color(0xD4D4D8));
        }
        if (crossHand.userData.f_arrow) crossHand.userData.f_arrow.visible = false;  // +y -> dB
        // Swap the v/B/F text for dl / r-hat / dB at the same local landmarks.
        if (crossHand.userData.v_label) crossHand.userData.v_label.visible = false;
        if (crossHand.userData.b_label) crossHand.userData.b_label.visible = false;
        if (crossHand.userData.f_label) crossHand.userData.f_label.visible = false;
        var dlHandLabel = createLabelSprite("dl", wireColor, 0.42);
        if (crossHand.userData.v_label) dlHandLabel.position.copy(crossHand.userData.v_label.position);
        dlHandLabel.visible = false;
        crossHand.add(dlHandLabel);
        var rhatHandLabel = createLabelSprite("r\\u0302", rhatColor, 0.42);
        if (crossHand.userData.b_label) rhatHandLabel.position.copy(crossHand.userData.b_label.position);
        rhatHandLabel.visible = false;
        crossHand.add(rhatHandLabel);
        var dBHandLabel = createLabelSprite("dB", dbColor, 0.42);
        if (crossHand.userData.f_label) dBHandLabel.position.copy(crossHand.userData.f_label.position);
        dBHandLabel.visible = false;
        crossHand.add(dBHandLabel);
        crossHand.userData.dl_label = dlHandLabel;
        crossHand.userData.rhat_label = rhatHandLabel;
        crossHand.userData.db_label = dBHandLabel;
        // Orient: flat fingers (-z) -> dl, curled tips (-x) -> r-hat side, thumb
        // (+y) -> dB. Use the orthonormalised frame (dl, dB x dl, dB) so the
        // mapping stays a proper rotation even when θ != 90° (P off-axis).
        var thumbDirW = crossDir;        // dB = dl x r-hat (unit)
        var fingerDirW = vnorm(dlDir);   // dl (unit)
        var curlDirW = vnorm(vcross(thumbDirW, fingerDirW)); // r-hat side (perp part of r-hat)
        var hbX = new THREE.Vector3(-curlDirW[0], -curlDirW[1], -curlDirW[2]);
        var hbY = new THREE.Vector3(thumbDirW[0], thumbDirW[1], thumbDirW[2]);
        var hbZ = new THREE.Vector3(-fingerDirW[0], -fingerDirW[1], -fingerDirW[2]);
        var hbBasis = new THREE.Matrix4().makeBasis(hbX, hbY, hbZ);
        crossHand.setRotationFromMatrix(hbBasis);
        crossHand.userData.elementType = "biot_cross_hand";
        crossHand.userData.id = "bs_cross_hand";
        crossHand.userData.homePos = [-2.6, 1.7, 1.0];
        crossHand.visible = false;
        addToScene(crossHand);

        // ── STATE_10 interactive-explorer object set ─────────────────────
        // Own, dedicated objects (NOT the authored choreography ones) so the
        // explorer never fights the grow/reveal animation. Hidden by default;
        // applyState shows them only when stateDef.show_sliders, and
        // refreshBiotExplorer() drives them from the I / r / θ sliders so the
        // single element, r-hat, and dB all obey Biot-Savart. The authored
        // rings (bs_circle) + point P (bs_point_P) ARE reused (scaled / moved)
        // and reset to their built pose on every biot state entry.
        var expElemMat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(wireColor), emissive: hexToThreeColor(wireColor),
            emissiveIntensity: 0.6
        });
        var expElem = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.55, 16), expElemMat);
        expElem.userData = { elementType: "biot_explorer", id: "bs_exp_elem" };
        expElem.visible = false;
        addToScene(expElem);

        var expRhat = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1.6, 0xD4D4D8, 0.26, 0.15);
        expRhat.userData = { elementType: "biot_explorer", id: "bs_exp_rhat" };
        expRhat.visible = false;
        addToScene(expRhat);

        var expDb = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(P[0], P[1], P[2]), 1.0, 0x66BB6A, 0.22, 0.14);
        expDb.userData = { elementType: "biot_explorer", id: "bs_exp_db" };
        expDb.visible = false;
        addToScene(expDb);

        var expDbLabel = createLabelSprite("dB", dbColor, 0.5);
        expDbLabel.userData = { elementType: "biot_explorer", id: "bs_exp_db_label" };
        expDbLabel.visible = false;
        addToScene(expDbLabel);

        var expElemLabel = createLabelSprite("dl", wireColor, 0.42);
        expElemLabel.userData = { elementType: "biot_explorer", id: "bs_exp_elem_label" };
        expElemLabel.visible = false;
        addToScene(expElemLabel);

        // "r" label rides the slant r̂ line (element→P) so the student SEES that
        // r is the element-to-P distance, equal to the circle radius only at θ=90°.
        var expRLabel = createLabelSprite("r", rhatColor, 0.42);
        expRLabel.userData = { elementType: "biot_explorer", id: "bs_exp_r_label" };
        expRLabel.visible = false;
        addToScene(expRLabel);
    }

    function buildChangingFluxField(config_unused) {
        var coilConf = config.coil || { turns: 5, radius: 1.0, axis: [0, 0, 1] };
        var flColor = config.field_lines.color_positive || "#66BB6A";

        // Coil
        var coilGroup = createCoilGeometry(coilConf.turns, coilConf.radius, coilConf.axis, 1.5);
        coilGroup.position.set(0, 0, 0);
        coilGroup.userData = { elementType: "coil", id: "induction_coil" };
        addToScene(coilGroup);

        // Bar magnet (moving)
        var magnetGeo = new THREE.BoxGeometry(0.4, 0.4, 1.5);
        var magnetMat = new THREE.MeshPhongMaterial({ color: 0xEF5350 });
        var magnetMesh = new THREE.Mesh(magnetGeo, magnetMat);
        magnetMesh.position.set(0, 0, 3);
        magnetMesh.userData = { elementType: "magnet", id: "moving_magnet" };
        addToScene(magnetMesh);

        // S pole half
        var sHalfGeo = new THREE.BoxGeometry(0.41, 0.41, 0.75);
        var sHalfMat = new THREE.MeshPhongMaterial({ color: 0x42A5F5 });
        var sHalfMesh = new THREE.Mesh(sHalfGeo, sHalfMat);
        sHalfMesh.position.set(0, 0, 3 - 0.375);
        sHalfMesh.userData = { elementType: "magnet_south_half", id: "magnet_s_half" };
        addToScene(sHalfMesh);

        // Field lines from magnet
        for (var i = 0; i < 6; i++) {
            var angle = (i / 6) * Math.PI * 2;
            var r = 0.3;
            var points = [];
            for (var s = 0; s <= 16; s++) {
                var t = s / 16;
                var z = 3.75 - t * 5;
                var blend = Math.sin(t * Math.PI);
                points.push([r * Math.cos(angle) * (1 + blend), r * Math.sin(angle) * (1 + blend), z]);
            }
            var tube = createTubeLine(points, flColor, 0.015);
            if (tube) {
                tube.userData = { elementType: "field_line", id: "fl_flux_" + i };
                addToScene(tube);
            }
        }

        // EMF indicator (small glow sphere at coil center)
        var emfGeo = new THREE.SphereGeometry(0.15, 16, 16);
        var emfMat = new THREE.MeshPhongMaterial({
            color: 0xFFF176,
            emissive: 0xFFF176,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.7
        });
        var emfMesh = new THREE.Mesh(emfGeo, emfMat);
        emfMesh.position.set(0, 0, 0);
        emfMesh.userData = { elementType: "emf_indicator", id: "emf_glow" };
        addToScene(emfMesh);
    }

    // ── Lorentz force in uniform field (Diamond #2 — archetype B) ────────
    // Build the static scene: a faint 3D lattice of B-field arrows + a single
    // charged particle + velocity / force vector arrows + an (initially empty)
    // trail. The animate loop updates particle position, vectors, and trail
    // each frame based on the active state's trajectory_mode.
    function buildLorentzForceField() {
        var af = config.ambient_field || {
            direction: [0, 0, 1], magnitude: 1, density: [5, 5, 5],
            color: "#42A5F5", opacity: 0.45, extent: 3
        };
        var p = config.particle || { charge_sign: 1, color: "#FFB366", radius: 0.12 };

        var bDir = new THREE.Vector3(af.direction[0], af.direction[1], af.direction[2]).normalize();
        var ext = af.extent != null ? af.extent : 3;
        var nx = af.density[0], ny = af.density[1], nz = af.density[2];
        var sx = nx > 1 ? (2 * ext) / (nx - 1) : 0;
        var sy = ny > 1 ? (2 * ext) / (ny - 1) : 0;
        var sz = nz > 1 ? (2 * ext) / (nz - 1) : 0;
        var arrowLen = 0.55;
        var arrowOp = af.opacity != null ? af.opacity : 0.45;
        var arrowColor = af.color || "#42A5F5";

        // 1. Ambient B-field arrows — InstancedMesh would be ideal, but using
        //    individual ArrowHelpers keeps the code consistent with the rest of
        //    the renderer and 125 arrows render fine on desktop.
        for (var ix = 0; ix < nx; ix++) {
            for (var iy = 0; iy < ny; iy++) {
                for (var iz = 0; iz < nz; iz++) {
                    var ox = nx > 1 ? -ext + ix * sx : 0;
                    var oy = ny > 1 ? -ext + iy * sy : 0;
                    var oz = nz > 1 ? -ext + iz * sz : 0;
                    var origin = new THREE.Vector3(ox, oy, oz)
                        .addScaledVector(bDir, -arrowLen / 2);
                    var arrH = new THREE.ArrowHelper(bDir, origin, arrowLen, arrowColor, 0.14, 0.09);
                    arrH.userData = { elementType: "ambient_field", id: "b_arrow_" + ix + "_" + iy + "_" + iz };
                    // Apply opacity to the helper's line + cone materials
                    arrH.children.forEach(function(child) {
                        if (child.material) {
                            child.material.transparent = true;
                            child.material.opacity = arrowOp;
                        }
                    });
                    addToScene(arrH);
                }
            }
        }

        // 2. Charged particle (the "proton" — q = +e by default; STATE_6's
        //    q-toggle can flip the sign).
        var pRadius = p.radius != null ? p.radius : 0.12;
        var particleGeo = new THREE.SphereGeometry(pRadius, 22, 22);
        var particleMat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor(p.color),
            emissive: hexToThreeColor(p.color),
            emissiveIntensity: 0.65, shininess: 90
        });
        var particle = new THREE.Mesh(particleGeo, particleMat);
        particle.position.set(0, 0, 0);
        // Charge-sign badge — a "+" sprite that hovers just above the
        // sphere so the student always reads which charge they are seeing.
        // The animate loop swaps to "−" when STATE_6's q-toggle flips.
        var chargeSprite = createLabelSprite("+", "#FFFFFF", 0.34);
        chargeSprite.position.set(0, 0, 0);
        chargeSprite.userData = { is_charge_badge: true, current_sign: 1 };
        particle.add(chargeSprite);
        particle.userData = {
            elementType: "particle", id: "lorentz_particle",
            charge_sign: p.charge_sign,
            charge_sprite: chargeSprite
        };
        addToScene(particle);

        // 3. Velocity vector arrow (initial direction will be overwritten per frame)
        var vArrow = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1.2,
            "#FFAB40", 0.22, 0.11
        );
        vArrow.userData = { elementType: "velocity_vector", id: "v_arrow" };
        addToScene(vArrow);

        // 4. Force vector arrow (direction recomputed per frame as q v × B)
        var fArrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1.2,
            "#66BB6A", 0.22, 0.11
        );
        fArrow.userData = { elementType: "force_vector", id: "f_arrow" };
        addToScene(fArrow);

        // 4b. Vector-decomposition arrows (Diamond #2 STATE_3 pedagogy).
        //     Built up-front (invisible by default); visibility + length set
        //     per-frame in the animate loop based on the active θ.
        var vParArrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1.0,
            "#9CA3AF", 0.18, 0.09
        );
        vParArrow.userData = { elementType: "v_parallel", id: "v_par_arrow" };
        vParArrow.visible = false;
        addToScene(vParArrow);

        var vPerpArrow = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1.0,
            "#FFCC9F", 0.18, 0.09
        );
        vPerpArrow.userData = { elementType: "v_perp", id: "v_perp_arrow" };
        vPerpArrow.visible = false;
        addToScene(vPerpArrow);

        // 4c. Text labels — one sprite per vector, positioned at the arrow tip
        //     in the animate loop. Visibility tracks the corresponding arrow.
        var labelV = createLabelSprite("v", "#FFAB40", 0.85);
        labelV.userData = { elementType: "vector_label", id: "label_v", tracks: "velocity_vector" };
        labelV.visible = false;
        addToScene(labelV);

        var labelF = createLabelSprite("F", "#66BB6A", 0.95);
        labelF.userData = { elementType: "vector_label", id: "label_f", tracks: "force_vector" };
        labelF.visible = false;
        addToScene(labelF);

        var labelVPar = createLabelSprite("v cos θ", "#D1D5DB", 0.65);
        labelVPar.userData = { elementType: "vector_label", id: "label_v_par", tracks: "v_parallel" };
        labelVPar.visible = false;
        addToScene(labelVPar);

        var labelVPerp = createLabelSprite("v sin θ", "#FFCC9F", 0.65);
        labelVPerp.userData = { elementType: "vector_label", id: "label_v_perp", tracks: "v_perp" };
        labelVPerp.visible = false;
        addToScene(labelVPerp);

        // 5. Trail — BufferGeometry line populated per frame. Reset on state change.
        //    600 frames ≈ 10s at 60fps — long enough to show ~1 full helix loop
        //    even at θ = 10° where the period is ~8.4s.
        var maxPts = 600;
        var trailGeo = new THREE.BufferGeometry();
        var positions = new Float32Array(maxPts * 3);
        trailGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        trailGeo.setDrawRange(0, 0);
        var trailMat = new THREE.LineBasicMaterial({
            color: hexToThreeColor("#FFCC9F"), transparent: true, opacity: 0.85
        });
        var trail = new THREE.Line(trailGeo, trailMat);
        trail.userData = {
            elementType: "particle_trail", id: "lorentz_trail",
            max_points: maxPts, filled: 0, write_index: 0
        };
        addToScene(trail);
    }

    // ── Torque on a current loop in uniform B (Diamond #3, archetype C) ───
    //
    // Builds the rectangular current loop in a uniform B field for the
    // torque_on_current_loop_in_field concept. Sets up:
    //   1. Ambient B-field arrow lattice (reused pattern from Lorentz).
    //   2. Rectangular current-loop wire (4 sides) with per-side current
    //      direction arrows so the student can see which way I flows.
    //   3. Force arrows F_left and F_right on the two vertical sides (the
    //      sides that experience force in this θ configuration).
    //   4. Magnetic moment μ vector through the loop face (RHR-derived).
    //   5. Torque vector τ along the vertical rotation axis.
    //   6. ΣF = 0 badge sprite for STATE_3.
    //   7. Rotation axis line (faint) for visual reference.
    //
    // The loop, current arrows, F arrows, μ arrow rotate together as a single
    // THREE.Group keyed off 'theta_deg' from state.extras (or oscillation).
    function buildTorqueLoopInField() {
        var af = config.ambient_field || {
            direction: [1, 0, 0], magnitude: 0.1, density: [5, 5, 5],
            color: "#42A5F5", opacity: 0.42, extent: 2.5
        };
        var loopCfg = config.loop || {
            shape: "rectangle", side_length: 0.10, current_amps: 0.5,
            turns: 1, color: "#FFD54F", current_arrow_color: "#FFAB40"
        };

        // 1. Ambient B-field arrows (uniform along af.direction).
        var bDir = new THREE.Vector3(af.direction[0], af.direction[1], af.direction[2]).normalize();
        var ext = af.extent != null ? af.extent : 2.5;
        var nx = af.density[0], ny = af.density[1], nz = af.density[2];
        var sxAmb = nx > 1 ? (2 * ext) / (nx - 1) : 0;
        var syAmb = ny > 1 ? (2 * ext) / (ny - 1) : 0;
        var szAmb = nz > 1 ? (2 * ext) / (nz - 1) : 0;
        var arrowLen = 0.55;
        var arrowOp = af.opacity != null ? af.opacity : 0.42;
        var arrowColor = af.color || "#42A5F5";
        for (var ix = 0; ix < nx; ix++) {
            for (var iy = 0; iy < ny; iy++) {
                for (var iz = 0; iz < nz; iz++) {
                    var ox = nx > 1 ? -ext + ix * sxAmb : 0;
                    var oy = ny > 1 ? -ext + iy * syAmb : 0;
                    var oz = nz > 1 ? -ext + iz * szAmb : 0;
                    var origin = new THREE.Vector3(ox, oy, oz)
                        .addScaledVector(bDir, -arrowLen / 2);
                    var arrH = new THREE.ArrowHelper(bDir, origin, arrowLen, arrowColor, 0.14, 0.09);
                    arrH.userData = { elementType: "ambient_field", id: "b_arrow_" + ix + "_" + iy + "_" + iz };
                    arrH.children.forEach(function(child) {
                        if (child.material) {
                            child.material.transparent = true;
                            child.material.opacity = arrowOp;
                        }
                    });
                    addToScene(arrH);
                }
            }
        }

        // 2. Loop group — contains the wire, current arrows, F arrows, μ arrow.
        //    The group is rotated about the vertical (y) axis by theta to model
        //    the loop turning in the field. We display the loop scaled up
        //    visually (side length 1.4 world units) regardless of physical L.
        var loopGroup = new THREE.Group();
        loopGroup.userData = { elementType: "torque_loop_group", id: "loop_group" };
        var visualHalf = 0.7; // half side length in world units

        // 2a. Loop wire — 4 cylinders forming a square in the x-y plane.
        var loopColor = hexToThreeColor(loopCfg.color || "#FFD54F");
        var wireRadius = 0.025;
        function makeWireSegment(x1, y1, z1, x2, y2, z2, sideId) {
            var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
            var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
            var geom = new THREE.CylinderGeometry(wireRadius, wireRadius, len, 12);
            var mat = new THREE.MeshPhongMaterial({
                color: loopColor, emissive: loopColor,
                emissiveIntensity: 0.45, shininess: 60
            });
            var mesh = new THREE.Mesh(geom, mat);
            mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
            // Default cylinder axis is +y; orient toward (dx,dy,dz).
            var axis = new THREE.Vector3(dx, dy, dz).normalize();
            var up = new THREE.Vector3(0, 1, 0);
            var quat = new THREE.Quaternion().setFromUnitVectors(up, axis);
            mesh.quaternion.copy(quat);
            mesh.userData = { elementType: "loop_side", id: sideId };
            loopGroup.add(mesh);
            return mesh;
        }
        // Loop sits in the x-y plane at z=0. Sides:
        //   top:    -h,+h → +h,+h   current flows +x (matches CW-from-+z)
        //   right:  +h,+h → +h,-h   current flows -y (DOWN)
        //   bottom: +h,-h → -h,-h   current flows -x
        //   left:   -h,-h → -h,+h   current flows +y (UP)
        // For a CCW loop viewed from +z, current goes: bottom-right → top-right
        // (up on right) is the OPPOSITE of what we want for "F₁ out of page on
        // left side with current up". So convention: current flows CCW viewed
        // from -z (so it goes UP on left, DOWN on right).
        var h = visualHalf;
        makeWireSegment(-h, +h, 0, +h, +h, 0, "side_top");
        makeWireSegment(+h, -h, 0, -h, -h, 0, "side_bottom");
        makeWireSegment(-h, -h, 0, -h, +h, 0, "side_left");
        makeWireSegment(+h, +h, 0, +h, -h, 0, "side_right");

        // 2b. Current direction arrows on each side (small cone glyph).
        var currentArrowColor = loopCfg.current_arrow_color || "#FFAB40";
        function addCurrentArrow(x, y, z, dirVec, sideId) {
            var arrow = new THREE.ArrowHelper(
                dirVec.clone().normalize(),
                new THREE.Vector3(x, y, z),
                0.30, currentArrowColor, 0.12, 0.08
            );
            arrow.userData = { elementType: "current_arrow", id: "current_" + sideId };
            loopGroup.add(arrow);
        }
        // CW-from-+z current direction: top→right→bottom→left→top.
        // Left side current flows UP (+y); F_left = ŷ × x̂ = -ẑ (INTO page).
        // Right side current flows DOWN (-y); F_right = -ŷ × x̂ = +ẑ (OUT of page).
        addCurrentArrow(0, +h, 0, new THREE.Vector3(+1, 0, 0), "top");
        addCurrentArrow(0, -h, 0, new THREE.Vector3(-1, 0, 0), "bottom");
        addCurrentArrow(-h, 0, 0, new THREE.Vector3(0, +1, 0), "left");
        addCurrentArrow(+h, 0, 0, new THREE.Vector3(0, -1, 0), "right");

        // 2b-2. Animated current-flow dots — 2 spheres per side, flowing in
        //       current direction at steady speed. Visible in ALL states so
        //       the student sees current flowing BEFORE any force prediction.
        //       This removes the biggest invisibility: current is not a static
        //       arrow — it flows, and the student must see it flow to intuit
        //       the force direction before the RHR guide confirms it.
        var dotGeom = new THREE.SphereGeometry(0.048, 10, 10);
        // Re-use a single material cloned per dot so each can be faded independently.
        var dotBaseMat = new THREE.MeshPhongMaterial({
            color: 0xFFAB40, emissive: 0xFFAB40, emissiveIntensity: 0.80
        });
        // Each entry: id, initial t (0..1 along segment), start, end in loop-local coords.
        // current flows start → end on each side (CW-from-+z).
        var currentDotDefs = [
            { id: "dot_left_a",   t: 0.10, s: [-h,-h,0], e: [-h,+h,0] },
            { id: "dot_left_b",   t: 0.60, s: [-h,-h,0], e: [-h,+h,0] },
            { id: "dot_top_a",    t: 0.35, s: [-h,+h,0], e: [+h,+h,0] },
            { id: "dot_top_b",    t: 0.85, s: [-h,+h,0], e: [+h,+h,0] },
            { id: "dot_right_a",  t: 0.10, s: [+h,+h,0], e: [+h,-h,0] },
            { id: "dot_right_b",  t: 0.60, s: [+h,+h,0], e: [+h,-h,0] },
            { id: "dot_bottom_a", t: 0.35, s: [+h,-h,0], e: [-h,-h,0] },
            { id: "dot_bottom_b", t: 0.85, s: [+h,-h,0], e: [-h,-h,0] }
        ];
        currentDotDefs.forEach(function(dd) {
            var dot = new THREE.Mesh(dotGeom, dotBaseMat.clone());
            dot.userData = {
                elementType: "current_dot", id: dd.id,
                t: dd.t, speed: 0.35,        // traverses full side in ~2.9s
                sideStart: dd.s.slice(), sideEnd: dd.e.slice()
            };
            dot.position.set(
                dd.s[0] + (dd.e[0]-dd.s[0]) * dd.t,
                dd.s[1] + (dd.e[1]-dd.s[1]) * dd.t,
                dd.s[2] + (dd.e[2]-dd.s[2]) * dd.t
            );
            loopGroup.add(dot);
        });

        // 2c. Force arrows on the two vertical sides — F = I L × B.
        //     B points along +x (ambient direction). On left side, current is
        //     +y (up); F = +y × +x = -z (into page). On right side, current
        //     is -y; F = -y × +x = +z (out of page).
        //     NOTE: We render these in the LOOP-LOCAL frame so they rotate
        //     with the loop. The visual direction in the static-θ=90 starting
        //     pose is what students see in STATES 2/3/4.
        var fColor = "#66BB6A";
        var fLeftArrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(-h, 0, 0),
            0.85, fColor, 0.22, 0.11
        );
        fLeftArrow.userData = { elementType: "force_left", id: "f_left", visible_default: false };
        fLeftArrow.visible = false;
        loopGroup.add(fLeftArrow);

        var fRightArrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, +1),
            new THREE.Vector3(+h, 0, 0),
            0.85, fColor, 0.22, 0.11
        );
        fRightArrow.userData = { elementType: "force_right", id: "f_right", visible_default: false };
        fRightArrow.visible = false;
        loopGroup.add(fRightArrow);

        // 2d. μ vector arrow — perpendicular to loop face, through centre.
        //     In loop-local frame this is +z by RHR for our CW-from-+z
        //     current direction.
        var muColor = "#FFD54F";
        var muArrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, +1),
            new THREE.Vector3(0, 0, 0),
            1.0, muColor, 0.26, 0.13
        );
        muArrow.userData = { elementType: "mu_vector", id: "mu_arrow", visible_default: false };
        muArrow.visible = false;
        loopGroup.add(muArrow);

        // 2e. Bar magnet swap mesh (STATE_7). Two cylinders end-to-end along
        //     loop-local +z. Red N pole (+z half), blue S pole (-z half).
        //     Visible only when STATE_7's bar_magnet_swap.enabled fires.
        var barMagnetGroup = new THREE.Group();
        barMagnetGroup.userData = { elementType: "bar_magnet_group", id: "bar_magnet_group" };
        barMagnetGroup.visible = false;
        var poleRadius = 0.18;
        var poleHalfLen = 0.5;
        var nMat = new THREE.MeshPhongMaterial({
            color: 0xEF4444, emissive: 0xEF4444, emissiveIntensity: 0.35,
            transparent: true, opacity: 0
        });
        var sMat = new THREE.MeshPhongMaterial({
            color: 0x3B82F6, emissive: 0x3B82F6, emissiveIntensity: 0.35,
            transparent: true, opacity: 0
        });
        var nGeom = new THREE.CylinderGeometry(poleRadius, poleRadius, poleHalfLen, 24);
        var nMesh = new THREE.Mesh(nGeom, nMat);
        // Orient cylinder along loop-local +z; cylinder default axis is +y,
        // so rotate -90° about x to align +y → +z.
        nMesh.rotation.x = -Math.PI / 2;
        nMesh.position.set(0, 0, +poleHalfLen / 2);
        nMesh.userData = { elementType: "bar_magnet_pole", id: "bar_n" };
        barMagnetGroup.add(nMesh);
        var sGeom = new THREE.CylinderGeometry(poleRadius, poleRadius, poleHalfLen, 24);
        var sMesh = new THREE.Mesh(sGeom, sMat);
        sMesh.rotation.x = -Math.PI / 2;
        sMesh.position.set(0, 0, -poleHalfLen / 2);
        sMesh.userData = { elementType: "bar_magnet_pole", id: "bar_s" };
        barMagnetGroup.add(sMesh);
        // "N" / "S" sprite labels on the end caps.
        var nLabel = createLabelSprite("N", "#FFFFFF", 0.30);
        nLabel.position.set(0, 0, +poleHalfLen + 0.15);
        nLabel.material.transparent = true;
        nLabel.material.opacity = 0;
        nLabel.userData = { elementType: "bar_magnet_label", id: "bar_n_label" };
        barMagnetGroup.add(nLabel);
        var sLabel = createLabelSprite("S", "#FFFFFF", 0.30);
        sLabel.position.set(0, 0, -poleHalfLen - 0.15);
        sLabel.material.transparent = true;
        sLabel.material.opacity = 0;
        sLabel.userData = { elementType: "bar_magnet_label", id: "bar_s_label" };
        barMagnetGroup.add(sLabel);
        loopGroup.add(barMagnetGroup);

        // 2f. "μ" sprite label — parented to loopGroup so it rotates with μ.
        //     Positioned just past the μ-arrow tip along loop-local +z.
        var muLabelSprite = createLabelSprite("μ", muColor, 0.40);
        muLabelSprite.position.set(0, 0.18, 1.15);
        muLabelSprite.visible = false;
        muLabelSprite.userData = { elementType: "mu_label", id: "mu_label" };
        loopGroup.add(muLabelSprite);

        scene.add(loopGroup);
        sceneObjects.push(loopGroup);

        // 3. τ vector — lives in WORLD frame along the rotation axis (±y,
        //    sign tracks sin(θ)). Magnitude scales as |sin θ|. Direction +
        //    length are updated in updateTorqueLoopFrame each tick.
        var tauColor = "#E879F9";
        var tauArrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 0),
            1.0, tauColor, 0.26, 0.13
        );
        tauArrow.userData = { elementType: "tau_vector", id: "tau_arrow", visible_default: false };
        tauArrow.visible = false;
        addToScene(tauArrow);

        // 3b. "τ" sprite label — stays in world frame near the τ-arrow tip.
        //     updateTorqueLoopFrame repositions it based on the sin θ sign so
        //     the label sits on whichever side the arrow points.
        var tauLabelSprite = createLabelSprite("τ", tauColor, 0.40);
        tauLabelSprite.position.set(0, 1.65, 0);
        tauLabelSprite.visible = false;
        tauLabelSprite.userData = { elementType: "tau_label", id: "tau_label" };
        addToScene(tauLabelSprite);

        // 3c. "B" sprite label — stays at the +x end of the visible ambient
        //     field grid so the student always sees what those blue arrows are.
        var bLabelSprite = createLabelSprite("B", "#82B1FF", 0.40);
        bLabelSprite.position.set((ext != null ? ext : 2.5) + 0.4, 0, 0);
        bLabelSprite.userData = { elementType: "b_label", id: "b_label" };
        addToScene(bLabelSprite);

        // 4. Rotation axis (faint vertical reference line through y).
        var axisGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -2, 0), new THREE.Vector3(0, +2, 0)
        ]);
        var axisMat = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.25 });
        var axisLine = new THREE.Line(axisGeom, axisMat);
        axisLine.userData = { elementType: "rotation_axis", id: "rotation_axis" };
        addToScene(axisLine);

        // 5. ΣF = 0 badge — text sprite, hidden by default, shown in STATE_3+.
        var sumZeroBadge = createLabelSprite("ΣF = 0", "#FFF176", 0.55);
        sumZeroBadge.position.set(0, -1.8, 0);
        sumZeroBadge.userData = { elementType: "sum_force_badge", id: "sum_zero", visible_default: false };
        sumZeroBadge.visible = false;
        addToScene(sumZeroBadge);

        // 6. RHR I×B=F guide — STATE_2 shows left-side triad, STATE_3 shows
        //    right-side triad. Each is a compact cluster of 3 arrows (I, B, F)
        //    with sprite labels, positioned in world space so it doesn't
        //    rotate with the loop. The student sees the guide BEFORE narration
        //    names the force direction — their hand mirrors the arrows.
        //
        //    Physics: B = +x always.
        //    Left side:  I = +y (up),  F = ŷ × x̂ = -ẑ (into page)
        //    Right side: I = -y (down), F = -ŷ × x̂ = +ẑ (out of page)
        function buildRHRGuide(iVec, fVec, wx, wy, wz, groupId) {
            var grp = new THREE.Group();
            grp.position.set(wx, wy, wz);
            grp.userData = { elementType: "rhr_guide", id: groupId };
            grp.visible = false;
            var aLen = 0.52, aHead = 0.17, aHeadW = 0.10;
            // I arrow — orange
            var iArr = new THREE.ArrowHelper(
                iVec.clone().normalize(), new THREE.Vector3(0,0,0),
                aLen, 0xFFAB40, aHead, aHeadW
            );
            iArr.userData = { id: groupId + "_i" };
            grp.add(iArr);
            // B arrow — blue (always +x)
            var bArr = new THREE.ArrowHelper(
                new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0),
                aLen, 0x42A5F5, aHead, aHeadW
            );
            bArr.userData = { id: groupId + "_b" };
            grp.add(bArr);
            // F = I×B arrow — green
            var fArr = new THREE.ArrowHelper(
                fVec.clone().normalize(), new THREE.Vector3(0,0,0),
                aLen, 0x66BB6A, aHead, aHeadW
            );
            fArr.userData = { id: groupId + "_f" };
            grp.add(fArr);
            // Sprite labels at each arrow tip
            var iN = iVec.clone().normalize();
            var fN = fVec.clone().normalize();
            var iLab = createLabelSprite("I", "#FFAB40", 0.32);
            iLab.position.copy(iN.multiplyScalar(aLen + 0.22));
            grp.add(iLab);
            var bLab = createLabelSprite("B", "#82B1FF", 0.32);
            bLab.position.set(aLen + 0.22, 0, 0);
            grp.add(bLab);
            var fLab = createLabelSprite("F", "#66BB6A", 0.32);
            fLab.position.copy(fN.multiplyScalar(aLen + 0.22));
            grp.add(fLab);
            // Title above
            var title = createLabelSprite("F = I × B", "#FFD54F", 0.28);
            title.position.set(0, 0.90, 0);
            grp.add(title);
            return grp;
        }

        // Left-side guide (STATE_2): I up, F into page (-z)
        var rhrGuideLeft = buildRHRGuide(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, -1),
            2.4, 1.0, 0.5,
            "rhr_guide_left"
        );
        addToScene(rhrGuideLeft);

        // Right-side guide (STATE_3): I down, F out of page (+z)
        var rhrGuideRight = buildRHRGuide(
            new THREE.Vector3(0, -1, 0),
            new THREE.Vector3(0, 0, +1),
            2.4, 1.0, 0.5,
            "rhr_guide_right"
        );
        addToScene(rhrGuideRight);

        // Initial pose: loop at theta_deg from state STATE_1 (default 90°).
        // We rotate about y; θ = 90° means loop face is perpendicular to B
        // (i.e., loop in x-y plane, μ along +z, B along +x).
        // θ = 0 means μ aligned with B (loop face parallel to B's perpendicular).
        // The rotation about y by angle (90° - θ) brings μ from +z toward +x.
        // We expose this via a userData angle that the animate loop reads.
        loopGroup.userData.theta_deg = 90;
        loopGroup.userData.rotation_mode = "static";
        loopGroup.userData.rotation_target_deg = 90;
        loopGroup.userData.rotation_start_time = 0;
        loopGroup.userData.oscillation_amplitude_deg = 0;
        loopGroup.userData.oscillation_period_s = 4;

        // Apply initial theta.
        applyTorqueLoopTheta(loopGroup, 90);
    }

    function applyTorqueLoopTheta(loopGroup, thetaDeg) {
        // Rotate loop group about the world Y axis so that μ (loop-local +z)
        // moves to make angle θ with B (world +x). θ=90 → μ along +z (perp
        // to B). θ=0 → μ along +x (parallel to B). θ=180 → μ along -x.
        var rotY = (90 - thetaDeg) * Math.PI / 180;
        loopGroup.rotation.set(0, rotY, 0);
        loopGroup.userData.theta_deg = thetaDeg;
    }

    function findTorqueLoopGroup() {
        for (var i = 0; i < sceneObjects.length; i++) {
            var o = sceneObjects[i];
            if (o.userData && o.userData.elementType === "torque_loop_group") return o;
        }
        return null;
    }

    function findTorqueElementById(id) {
        for (var i = 0; i < sceneObjects.length; i++) {
            var o = sceneObjects[i];
            if (o.userData && o.userData.id === id) return o;
        }
        // Search inside the loopGroup too.
        var lg = findTorqueLoopGroup();
        if (lg) {
            for (var j = 0; j < lg.children.length; j++) {
                var c = lg.children[j];
                if (c.userData && c.userData.id === id) return c;
            }
        }
        return null;
    }

    function applyTorqueLoopState(stateDef) {
        // Toggle visibility of force vectors, μ, τ, ΣF=0 badge, bar magnet
        // mesh based on the state's extras object. Drive rotation_mode +
        // theta_deg. Stamp fadeStartTime on newly-visible elements so the
        // animate loop can tween their opacity from 0 → 1 over ~0.6s.
        var lg = findTorqueLoopGroup();
        if (!lg) return;
        var ex = stateDef.extras || {};

        // Theta — directly take from stateDef.theta_deg.
        var theta = stateDef.theta_deg != null ? stateDef.theta_deg : 90;
        applyTorqueLoopTheta(lg, theta);
        lg.userData.rotation_mode = stateDef.rotation_mode || "static";
        lg.userData.rotation_target_deg = stateDef.rotation_target_deg != null
            ? stateDef.rotation_target_deg : theta;
        lg.userData.rotation_init_theta_deg = theta;
        lg.userData.rotation_start_time = time;
        lg.userData.oscillation_amplitude_deg = stateDef.oscillation_amplitude_deg || 0;
        lg.userData.oscillation_period_s = stateDef.oscillation_period_s || 4;
        lg.userData.theta_sweep_period_s = stateDef.theta_sweep_period_s || 10;

        function setVisibleWithFade(obj, wantVisible) {
            if (!obj) return;
            var wasVisible = !!obj.visible;
            obj.visible = !!wantVisible;
            if (wantVisible && !wasVisible) {
                obj.userData.fadeStartTime = time;
            } else if (!wantVisible) {
                obj.userData.fadeStartTime = -1;
            }
        }

        // Force-vector visibility (fade-in on appearance).
        var fLeft = findTorqueElementById("f_left");
        var fRight = findTorqueElementById("f_right");
        setVisibleWithFade(fLeft, ex.force_vectors && ex.force_vectors.show_left);
        setVisibleWithFade(fRight, ex.force_vectors && ex.force_vectors.show_right);

        // μ vector — accept scale_factor in extras.mu_vector (default 1.0)
        // so STATE_5/6/7 can show μ shrinking/growing with N·I·A.
        var muArr = findTorqueElementById("mu_arrow");
        var muShow = !!(ex.mu_vector && ex.mu_vector.show);
        setVisibleWithFade(muArr, muShow);
        var muLabel = findTorqueElementById("mu_label");
        if (muLabel) muLabel.visible = muShow;
        if (muArr && muShow) {
            var muScale = (ex.mu_vector && typeof ex.mu_vector.scale_factor === "number")
                ? ex.mu_vector.scale_factor : 1.0;
            // length range: 0.5 (scale 0) → 1.5 (scale 2). Stays visible at
            // scale 0 with a stub so the student can still see the vector.
            var muLen = 0.5 + 0.5 * muScale;
            muArr.setLength(muLen, 0.26, 0.13);
            muArr.userData.muLen = muLen;
        }

        // τ vector (direction sign + length scaled by sin θ in updateFrame).
        var tauArr = findTorqueElementById("tau_arrow");
        var tauShow = !!(ex.tau_vector && ex.tau_vector.show);
        setVisibleWithFade(tauArr, tauShow);
        var tauLabel = findTorqueElementById("tau_label");
        if (tauLabel) tauLabel.visible = tauShow;

        // ΣF=0 badge (fade-in on appearance).
        var sumBadge = findTorqueElementById("sum_zero");
        setVisibleWithFade(sumBadge, ex.sum_force_badge);

        // RHR I×B=F guide — shows in STATE_2 (left side) and STATE_3 (right side).
        var rhrGuideL = findTorqueElementById("rhr_guide_left");
        var rhrGuideR = findTorqueElementById("rhr_guide_right");
        var rhrSide = (ex.rhr_guide && ex.rhr_guide.side) || null;
        if (rhrGuideL) rhrGuideL.visible = (rhrSide === "left");
        if (rhrGuideR) rhrGuideR.visible = (rhrSide === "right");

        // Bar-magnet swap (STATE_7). When enabled, fade loop wire → 25%
        // opacity and bar magnet → 100% over ~1.5s. updateTorqueLoopFrame
        // does the per-frame tween reading barSwapStartTime.
        var barEnabled = !!(ex.bar_magnet_swap && ex.bar_magnet_swap.enabled);
        var barGroup = findTorqueElementById("bar_magnet_group");
        if (barGroup) {
            // Even if not yet visible, the animate loop reads barSwapStartTime
            // to drive the fade. Set visible immediately; opacity starts at 0.
            barGroup.visible = barEnabled;
            lg.userData.barSwapStartTime = barEnabled ? time : -1;
            lg.userData.barSwapEnabled = barEnabled;
        }
    }

    function updateTorqueLoopFrame(dtSeconds) {
        var lg = findTorqueLoopGroup();
        if (!lg) return;
        var mode = lg.userData.rotation_mode || "static";
        var curTheta = lg.userData.theta_deg;

        if (mode === "slow_rotation") {
            // Linear interpolate from current toward rotation_target_deg
            // over ~3 seconds.
            var target = lg.userData.rotation_target_deg;
            var diff = target - curTheta;
            var step = (Math.sign(diff)) * Math.min(Math.abs(diff), 30 * dtSeconds);
            if (Math.abs(step) > 0.01) applyTorqueLoopTheta(lg, curTheta + step);
        } else if (mode === "oscillation") {
            // Simple SHM about θ = 0.
            var T = lg.userData.oscillation_period_s || 4;
            var amp = lg.userData.oscillation_amplitude_deg || 60;
            var phi = ((time - lg.userData.rotation_start_time) / T) * 2 * Math.PI;
            applyTorqueLoopTheta(lg, amp * Math.cos(phi));
        } else if (mode === "theta_sweep") {
            // Cycle θ smoothly 0 → 90 → 180 → 90 → 0 over a configurable
            // period (STATE_6). θ(t) = 90 + 90·sin(2π t / T). Visible cue
            // that "τ scales with sin θ" — at t=T/4, θ=180 (sinθ=0); at
            // t=0, θ=90 (sinθ=1); the τ-arrow direction flips at θ=0,180.
            var Ts = lg.userData.theta_sweep_period_s || 10;
            var phs = ((time - lg.userData.rotation_start_time) / Ts) * 2 * Math.PI;
            applyTorqueLoopTheta(lg, 90 + 90 * Math.sin(phs));
        }
        // theta_controlled, manual, static — no auto-update; theta_deg is
        // set by applyState or by an external SET_LOOP_ANGLE postMessage.

        // τ-arrow direction + length. τ = μ × B. μ is loop-local +z; after
        // rotY=(90-θ)·deg→rad, μ projects onto world axes as
        //   μ_x = sin(rotY), μ_z = cos(rotY)
        //   ⇒ τ = μ × B = (μ_z·sin0 − μ_x·0,  μ_x·B_z − μ_z·B_x,  ...)
        // With B=+x, τ = (0, −μ_z·1, 0) → along ±y. The sign tracks sin(θ)
        // because μ_z·B_x = cos(rotY)·1 = sin(θ). So τ_y = −sin(θ) of the
        // standard convention — but for teaching, we want τ along +y when
        // θ∈(0,180) (the loop rotates to align μ with B from the perp pose)
        // and along −y for θ∈(−180,0). That's exactly sign(sin θ).
        var tauArr = findTorqueElementById("tau_arrow");
        if (tauArr && tauArr.visible) {
            var sRaw = Math.sin(lg.userData.theta_deg * Math.PI / 180);
            var sAbs = Math.abs(sRaw);
            var sSign = sRaw >= 0 ? 1 : -1;
            tauArr.setDirection(new THREE.Vector3(0, sSign, 0));
            // Slider-driven scaling for STATE_11 sandbox: when sliders have
            // been seeded (by applyState or by the slider input handler),
            // τ scales as (N·I·B) relative to defaults. Sub-linear power
            // (^0.4) plus a hard cap of 2.5× keeps the arrow on-canvas at
            // extreme values. Other torque states leave slider_* unset →
            // mult stays at 1.0, preserving the original 0.05+1.2*sAbs.
            var sliderN = lg.userData.slider_N;
            var sliderI = lg.userData.slider_I;
            var sliderB = lg.userData.slider_B;
            var tauMult = 1.0;
            if (typeof sliderN === "number" && typeof sliderI === "number" && typeof sliderB === "number") {
                var rawMult = (sliderN / 1) * (sliderI / 0.5) * (sliderB / 0.1);
                tauMult = Math.min(2.5, Math.pow(Math.max(0.001, rawMult), 0.4));
            }
            // Scale length AND head dimensions so the τ arrow visibly grows
            // and shrinks as θ sweeps — at sinθ=0 it nearly vanishes
            // (equilibria), at sinθ=1 it reaches full size (max torque).
            var tauTotal = 0.05 + 1.2 * sAbs * tauMult;
            var tauHead = Math.max(0.04, 0.30 * sAbs * Math.min(1.6, tauMult));
            var tauHeadW = Math.max(0.02, 0.15 * sAbs * Math.min(1.6, tauMult));
            tauArr.setLength(tauTotal, tauHead, tauHeadW);
        }

        // μ-arrow per-frame length update — driven by sliders N and I in
        // the STATE_11 sandbox. Mirrors the τ-arrow guard: only fires when
        // slider_* userData has been seeded; otherwise leaves whatever
        // applyTorqueLoopState set for the current state.
        var muArrF = findTorqueElementById("mu_arrow");
        if (muArrF && muArrF.visible) {
            var muN = lg.userData.slider_N;
            var muI = lg.userData.slider_I;
            if (typeof muN === "number" && typeof muI === "number") {
                var muRawMult = (muN / 1) * (muI / 0.5);
                var muMult = Math.min(3.0, Math.pow(Math.max(0.001, muRawMult), 0.5));
                var muLenFrame = 0.5 + 0.5 * muMult;
                muArrF.setLength(muLenFrame, 0.26, 0.13);
            }
        }

        // Animate current-flow dots along wire segments.
        for (var dci = 0; dci < lg.children.length; dci++) {
            var dch = lg.children[dci];
            if (!dch.userData || dch.userData.elementType !== "current_dot") continue;
            var dud = dch.userData;
            dud.t = (dud.t + dud.speed * dtSeconds) % 1.0;
            var ds = dud.sideStart, de = dud.sideEnd;
            dch.position.set(
                ds[0] + (de[0]-ds[0]) * dud.t,
                ds[1] + (de[1]-ds[1]) * dud.t,
                ds[2] + (de[2]-ds[2]) * dud.t
            );
        }

        // τ label tracks the τ arrow tip on whichever side it's pointing.
        var tauLab = findTorqueElementById("tau_label");
        if (tauLab && tauArr && tauArr.visible) {
            var sR = Math.sin(lg.userData.theta_deg * Math.PI / 180);
            tauLab.position.set(0, (sR >= 0 ? 1.65 : -1.65) - (sR === 0 ? 0.5 : 0), 0);
        }

        // Fade-in opacity tween for newly-visible vectors (F_left, F_right,
        // ΣF=0 badge, τ). Reads userData.fadeStartTime stamped by
        // applyTorqueLoopState; eases over 0.6s.
        function tweenOpacity(obj) {
            if (!obj || !obj.visible) return;
            var t0 = obj.userData.fadeStartTime;
            if (t0 == null || t0 < 0) return;
            var pNorm = Math.min(1, (time - t0) / 0.6);
            // For ArrowHelpers (Object3D with line + cone children).
            if (obj.children && obj.children.length > 0) {
                obj.children.forEach(function(c) {
                    if (c.material) {
                        c.material.transparent = true;
                        c.material.opacity = pNorm;
                    }
                });
            } else if (obj.material) {
                obj.material.transparent = true;
                obj.material.opacity = pNorm;
            }
        }
        tweenOpacity(findTorqueElementById("f_left"));
        tweenOpacity(findTorqueElementById("f_right"));
        tweenOpacity(findTorqueElementById("sum_zero"));
        tweenOpacity(findTorqueElementById("tau_arrow"));

        // Bar-magnet swap fade (STATE_7). t∈[0,1.5s]; loop wires fade to
        // 0.25 opacity, bar magnet fades 0 → 1. Sprite labels share the
        // bar magnet's opacity so "N"/"S" appear in sync.
        var swapT0 = lg.userData.barSwapStartTime;
        if (swapT0 != null && swapT0 >= 0) {
            var sp = Math.min(1, (time - swapT0) / 1.5);
            var loopOp = 1.0 - 0.75 * sp;
            var barOp = sp;
            for (var ic = 0; ic < lg.children.length; ic++) {
                var ch = lg.children[ic];
                var ud = ch.userData || {};
                if (ud.elementType === "loop_side" && ch.material) {
                    ch.material.transparent = true;
                    ch.material.opacity = loopOp;
                }
                if (ud.elementType === "current_arrow") {
                    ch.children.forEach(function(c) {
                        if (c.material) {
                            c.material.transparent = true;
                            c.material.opacity = loopOp;
                        }
                    });
                }
            }
            var barGrp = findTorqueElementById("bar_magnet_group");
            if (barGrp) {
                for (var bi = 0; bi < barGrp.children.length; bi++) {
                    var bc = barGrp.children[bi];
                    if (bc.material) {
                        bc.material.transparent = true;
                        bc.material.opacity = barOp;
                    }
                }
            }
        } else {
            // Restore full loop opacity when bar swap inactive.
            for (var ir = 0; ir < lg.children.length; ir++) {
                var rch = lg.children[ir];
                var rud = rch.userData || {};
                if (rud.elementType === "loop_side" && rch.material) {
                    rch.material.opacity = 1.0;
                }
            }
        }
    }

    function applyTorqueLoopGlow() {
        // TTS-driven glow for torque-loop scenario children. glowTargets is
        // populated by the SET_GLOW postMessage handler. Pulse factor matches
        // Diamond #2's animate-loop convention: 1.35 + 0.35·sin(t·3.5) so
        // the targeted element sits above baseline at all times in cycle.
        var lg = findTorqueLoopGroup();
        if (!lg) return;
        var pulse = 1.35 + 0.35 * Math.sin(time * 3.5);
        function f(id) { return glowTargets.indexOf(id) >= 0 ? pulse : 1.0; }
        var loopActive = glowTargets.indexOf("loop") >= 0;

        // 1) loopGroup children — wires, current arrows, F arrows, μ arrow,
        //    bar magnet group (but skip individual bar children — handled
        //    separately so the bar swap fade has clean ownership).
        for (var i = 0; i < lg.children.length; i++) {
            var c = lg.children[i];
            var ud = c.userData || {};
            if (!ud.id) continue;
            if (ud.elementType === "bar_magnet_group") continue;
            // 'loop' glow lights all 4 wire sides + 4 current arrows.
            if (loopActive && (ud.elementType === "loop_side" || ud.elementType === "current_arrow")) {
                c.scale.setScalar(pulse);
            } else {
                c.scale.setScalar(f(ud.id));
            }
        }

        // 2) Standalone scene objects — τ arrow, ΣF=0 badge, B label, μ label
        //    (these live in scene root, not inside loopGroup, except mu_label
        //    which is inside loopGroup — already handled above).
        for (var j = 0; j < sceneObjects.length; j++) {
            var so = sceneObjects[j];
            var sud = so.userData || {};
            if (!sud.id) continue;
            if (sud.elementType === "ambient_field") {
                // 'b' glow scales every ambient field arrow uniformly.
                so.scale.setScalar(f("b"));
            } else if (sud.id === "tau_arrow" || sud.id === "tau_label" || sud.id === "b_label" || sud.id === "sum_zero") {
                so.scale.setScalar(f(sud.id));
            }
        }
    }

    // ── Equipotential surfaces ────────────────────────────────────────────
    function buildEquipotentialSurfaces() {
        if (!config.equipotential || !config.equipotential.show) return;
        var nSurfaces = config.equipotential.surfaces || 3;
        var eqColor = config.equipotential.color || "#4FC3F7";
        var eqOpacity = config.equipotential.opacity || 0.12;
        for (var i = 0; i < nSurfaces; i++) {
            var radius = 1.0 + i * 1.2;
            var surf = createEquipotentialSurface(radius, eqColor, eqOpacity);
            surf.userData = { elementType: "equipotential", id: "eq_" + i };
            addToScene(surf);
        }
    }

    // ── Force on a current-carrying wire (F = I L × B, archetype B meta) ──
    //
    // Concept force_on_current_carrying_wire. A straight current-carrying wire
    // (along +x) sits in a uniform B field (along +y), so F = I (L̂ × B̂) runs
    // along +z (× current_dir). Builds, up-front and mostly hidden:
    //   1. Ambient uniform-B arrow lattice (reused Lorentz/torque pattern).
    //   2. wire            — straight current wire (createWire), id "fcw_wire".
    //   3. current_arrows  — small cones along the wire (conventional I).
    //   4. F_net_arrow      — ArrowHelper, direction = current_dir·(L̂×B̂),
    //                         length ∝ B·I·L·sinθ, recomputed per frame.
    //   5. charge_arrows    — count drifting carriers, each with a small
    //                         parallel q(v_d×B) arrow (the STATE_2 derivation).
    //   6. hand_3d          — RHR cross-product hand (createLorentzHand),
    //                         fingers=L, curl=B, thumb=F (STATE_3 only).
    //   7. decoy_30_angle   — RED wrong 30°-to-page-edge arc (STATE_4).
    //   8. true_90_arc      — the true ∠(L,B) arc (STATE_4), distinct primitive.
    //   9. bent_wire        — zig-zag tube through waypoints (STATE_5).
    //  10. chord_arrow      — straight chord end→end, snapshot reveal (STATE_5).
    //  11. square_loop      — closed loop + per-side outward force arrows that
    //                         sum to zero but form a couple (STATE_6).
    // Per-state visibility is owned by applyForceWireState() (reads extras.<key>
    // .show). Per-frame behaviour (drift, current-flip, live F) lives in the
    // animate loop's force_on_current_wire block.
    function buildForceOnCurrentWire() {
        // ── tiny ES5 vector helpers (no THREE dependency) ────────────────
        function fwCross(a, b) {
            return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
        }
        function fwNorm(a) {
            var L = Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]) || 1;
            return [a[0]/L, a[1]/L, a[2]/L];
        }

        var af = config.ambient_field || {
            direction: [0, 1, 0], magnitude: 0.5, density: [5, 5, 5],
            color: "#42A5F5", opacity: 0.42, extent: 2.5
        };
        var cur = config.current || { direction: [1, 0, 0], magnitude: 2, wire_color: "#FFB366" };
        var wireColor = cur.wire_color || "#FFB366";
        var wireDir = fwNorm(cur.direction || [1, 0, 0]);   // L̂ (along conventional current)
        var bDir = new THREE.Vector3(af.direction[0], af.direction[1], af.direction[2]).normalize();

        // 1. Ambient B-field arrow lattice (uniform along af.direction).
        var ext = af.extent != null ? af.extent : 2.5;
        var nx = af.density[0], ny = af.density[1], nz = af.density[2];
        var sxAmb = nx > 1 ? (2 * ext) / (nx - 1) : 0;
        var syAmb = ny > 1 ? (2 * ext) / (ny - 1) : 0;
        var szAmb = nz > 1 ? (2 * ext) / (nz - 1) : 0;
        var arrowLen = 0.55;
        var arrowOp = af.opacity != null ? af.opacity : 0.42;
        var arrowColor = af.color || "#42A5F5";
        for (var ix = 0; ix < nx; ix++) {
            for (var iy = 0; iy < ny; iy++) {
                for (var iz = 0; iz < nz; iz++) {
                    var ox = nx > 1 ? -ext + ix * sxAmb : 0;
                    var oy = ny > 1 ? -ext + iy * syAmb : 0;
                    var oz = nz > 1 ? -ext + iz * szAmb : 0;
                    var origin = new THREE.Vector3(ox, oy, oz)
                        .addScaledVector(bDir, -arrowLen / 2);
                    var arrH = new THREE.ArrowHelper(bDir, origin, arrowLen, arrowColor, 0.14, 0.09);
                    arrH.userData = { elementType: "ambient_field", id: "b_arrow_" + ix + "_" + iy + "_" + iz };
                    arrH.children.forEach(function(child) {
                        if (child.material) {
                            child.material.transparent = true;
                            child.material.opacity = arrowOp;
                        }
                    });
                    addToScene(arrH);
                }
            }
        }

        // B sprite label at the +y end of the lattice.
        var bLabelF = createLabelSprite("B", "#82B1FF", 0.40);
        bLabelF.position.set(0, ext + 0.4, 0);
        bLabelF.userData = { elementType: "fcw_b_label", id: "fcw_b_label" };
        addToScene(bLabelF);

        // 2. Straight current-carrying wire (along ±wireDir). Half-length 1.8.
        var wireHalf = 1.8;
        var wEnd = [wireDir[0]*wireHalf, wireDir[1]*wireHalf, wireDir[2]*wireHalf];
        var wStart = [-wEnd[0], -wEnd[1], -wEnd[2]];
        var fwWire = createWire(wStart, wEnd, wireColor, 0.09);
        fwWire.material.emissive = hexToThreeColor(wireColor);
        fwWire.material.emissiveIntensity = 0.4;
        fwWire.userData = { elementType: "fcw_wire", id: "fcw_wire" };
        addToScene(fwWire);

        // L sprite label near the +current end of the wire.
        var lLabelF = createLabelSprite("L", "#FFCC9F", 0.40);
        lLabelF.position.set(wEnd[0] + 0.3, wEnd[1] + 0.2, wEnd[2]);
        lLabelF.userData = { elementType: "fcw_l_label", id: "fcw_l_label" };
        addToScene(lLabelF);

        // 3. Current direction arrows along the wire. Built as BOLD cones whose
        //    radius (0.13) is larger than the wire tube radius (0.09) so each
        //    clearly PROTRUDES from the wire instead of hiding inside it. Bright
        //    yellow, emissive. Orientation flips per frame when current_dir
        //    reverses (STATE_3). Default cone axis is +y → setRotation in the
        //    animate loop maps it onto the (possibly flipped) current direction.
        var nCurArrows = 5;
        for (var ca = 0; ca < nCurArrows; ca++) {
            var fracC = (ca + 0.5) / nCurArrows;            // 0..1 along the wire
            var posC = [
                wStart[0] + (wEnd[0]-wStart[0]) * fracC,
                wStart[1] + (wEnd[1]-wStart[1]) * fracC,
                wStart[2] + (wEnd[2]-wStart[2]) * fracC
            ];
            var cGeo = new THREE.ConeGeometry(0.13, 0.34, 14);
            var cMat = new THREE.MeshPhongMaterial({
                color: hexToThreeColor("#FFD54F"), emissive: hexToThreeColor("#FFD54F"),
                emissiveIntensity: 0.6, shininess: 70
            });
            var cArr = new THREE.Mesh(cGeo, cMat);
            cArr.position.set(posC[0], posC[1], posC[2]);
            cArr.setRotationFromQuaternion(
                new THREE.Quaternion().setFromUnitVectors(
                    new THREE.Vector3(0, 1, 0),
                    new THREE.Vector3(wireDir[0], wireDir[1], wireDir[2]).normalize()
                )
            );
            cArr.userData = {
                elementType: "fcw_current_arrow", id: "fcw_curr_" + ca,
                baseDir: wireDir.slice(),
                phase: fracC        // 0..1 starting position along the wire (for sim-time drift)
            };
            addToScene(cArr);
        }

        // 4. Net force arrow F = I (L̂ × B̂). Direction + length recomputed per
        //    frame (length ∝ B·I·L·sinθ, with a readable floor). Tail at the
        //    wire centre. BOLD: a thick shaft (cylinder overlay) + a large clear
        //    cone head, bright green, so it reads as a proper arrow even broadside
        //    to the camera. The ArrowHelper carries the head; a child cylinder
        //    thickens the shaft (ArrowHelper lines render 1px and vanish broadside).
        var fNet = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0),
            1.2, "#66BB6A", 0.40, 0.22
        );
        // Thick shaft tube riding inside the arrow so it is visible from any
        // angle. Re-scaled + re-oriented per frame in the animate loop.
        var fNetShaftGeo = new THREE.CylinderGeometry(0.055, 0.055, 1, 12);
        var fNetShaftMat = new THREE.MeshPhongMaterial({
            color: hexToThreeColor("#66BB6A"), emissive: hexToThreeColor("#66BB6A"),
            emissiveIntensity: 0.5, shininess: 60
        });
        var fNetShaft = new THREE.Mesh(fNetShaftGeo, fNetShaftMat);
        fNetShaft.userData = { fcwRole: "f_net_shaft" };
        fNet.add(fNetShaft);
        fNet.userData = { elementType: "fcw_F_net", id: "fcw_F_net", shaft: fNetShaft };
        addToScene(fNet);

        // F sprite label — repositioned to the F-arrow tip per frame.
        var fLabelF = createLabelSprite("F", "#66BB6A", 0.42);
        fLabelF.userData = { elementType: "fcw_f_label", id: "fcw_f_label" };
        addToScene(fLabelF);

        // 5. Charge carriers (STATE_2 derivation-as-picture). count spheres
        //    drift ALONG the wire; each carries a small per-carrier force arrow
        //    q(v_d x B), all parallel, all the same direction (= F-hat). They
        //    stack visually into the net F arrow.
        var chargeCount = 7;
        var perChargeFhat = fwNorm(fwCross(wireDir, [bDir.x, bDir.y, bDir.z]));
        for (var ch = 0; ch < chargeCount; ch++) {
            var fracH = (ch + 0.5) / chargeCount;
            var cPos = [
                wStart[0] + (wEnd[0]-wStart[0]) * fracH,
                wStart[1] + (wEnd[1]-wStart[1]) * fracH,
                wStart[2] + (wEnd[2]-wStart[2]) * fracH
            ];
            var carrier = createChargeSphere(cPos, "#FFCC9F", 0.10);
            carrier.userData = {
                elementType: "fcw_carrier", id: "fcw_carrier_" + ch,
                phase: fracH        // 0..1 starting position along the wire
            };
            addToScene(carrier);

            // Per-carrier force arrow — BOLD + clearly parallel (each is one
            // carrier's q(v_d×B), all pointing along the SAME F̂; they visually
            // stack into the net F). Length 0.7 with a thick cone + child shaft
            // so the "all parallel, all same way" reading is unmistakable.
            var PCF_LEN = 0.7;
            var pcArr = new THREE.ArrowHelper(
                new THREE.Vector3(perChargeFhat[0], perChargeFhat[1], perChargeFhat[2]),
                new THREE.Vector3(cPos[0], cPos[1], cPos[2]),
                PCF_LEN, "#FFCC9F", 0.22, 0.12
            );
            var pcShaftGeo = new THREE.CylinderGeometry(0.03, 0.03, PCF_LEN - 0.22, 10);
            var pcShaftMat = new THREE.MeshPhongMaterial({
                color: hexToThreeColor("#FFCC9F"), emissive: hexToThreeColor("#FFCC9F"),
                emissiveIntensity: 0.45, shininess: 50
            });
            var pcShaft = new THREE.Mesh(pcShaftGeo, pcShaftMat);
            pcShaft.position.set(0, (PCF_LEN - 0.22) / 2, 0);   // +y-local = arrow axis
            pcArr.add(pcShaft);
            pcArr.userData = {
                elementType: "fcw_carrier_force", id: "fcw_cforce_" + ch,
                carrierIndex: ch
            };
            addToScene(pcArr);
        }

        // 6. RHR cross-product hand (STATE_3): fingers=L (current), curl→B,
        //    thumb=F. Reuses the Diamond #2 articulated cross-product mesh.
        //    Sits JUST ABOVE the wire centre (NOT in the far corner) so it
        //    clearly relates to the wire. The fcw scenario does NOT run the
        //    lorentz hand-animation block, so the hand is a STATIC prop: its
        //    pose + the L/B/F labels are set once here (orientation in
        //    applyForceWireState). Built hidden; shown only for STATE_3.
        //    fcwHandHome chosen near the wire centre, lifted in +y above the
        //    wire and pulled slightly toward the camera (+z) so it does not
        //    occlude the wire.
        var fcwHandHome = [0.0, 1.35, 0.9];
        var fwHand = createLorentzHand({ position: fcwHandHome, scale: 1.3 });
        var fcwHandSc = fwHand.userData.sc || 1;
        // Hide the hand's built-in phase v/B/F labels — the lorentz toggler that
        // would manage them never runs for fcw, so they would sit stale. We add
        // our own always-on L/B/F labels below instead.
        if (fwHand.userData.v_label) fwHand.userData.v_label.visible = false;
        if (fwHand.userData.b_label) fwHand.userData.b_label.visible = false;
        if (fwHand.userData.f_label) fwHand.userData.f_label.visible = false;

        // Three macroscopic labels parented to the hand group so they ride its
        // transform (position/scale). Local placement mirrors the hand frame
        // conventions (fingers -z_local, curl -x_local, thumb +y_local) so each
        // label sits at the right landmark; after applyForceWireState orients
        // the group, "L" rides the fingers, "B" the curl, "F" the thumb.
        var fcwLabL = createLabelSprite("L", "#FFD54F", 0.55 * fcwHandSc);
        fcwLabL.position.set(-0.05 * fcwHandSc, -0.05 * fcwHandSc, -0.78 * fcwHandSc);
        fcwLabL.userData = { fcwRole: "hand_label_L" };
        fwHand.add(fcwLabL);
        var fcwLabB = createLabelSprite("B", "#82B1FF", 0.55 * fcwHandSc);
        fcwLabB.position.set(-0.70 * fcwHandSc, 0.10 * fcwHandSc, 0.10 * fcwHandSc);
        fcwLabB.userData = { fcwRole: "hand_label_B" };
        fwHand.add(fcwLabB);
        var fcwLabF = createLabelSprite("F", "#66BB6A", 0.55 * fcwHandSc);
        fcwLabF.position.set(-0.05 * fcwHandSc, 0.72 * fcwHandSc, 0.08 * fcwHandSc);
        fcwLabF.userData = { fcwRole: "hand_label_F" };
        fwHand.add(fcwLabF);

        fwHand.userData.elementType = "fcw_hand";
        fwHand.userData.id = "fcw_hand";
        fwHand.userData.fcw_home = fcwHandHome.slice();
        fwHand.visible = false;
        addToScene(fwHand);

        // 7. Decoy 30° angle arc (STATE_4) — RED, the WRONG angle the wire makes
        //    with a drawn page-edge reference line. Drawn from the wire (+x) down
        //    toward a reference direction 30° below the wire in the x-y plane,
        //    placed near the +current end so it does NOT overlap true_90_arc
        //    (which sits at the wire centre between L and B).
        var decoyArc = buildFcwAngleArc(
            [wEnd[0] - 0.4, wEnd[1], wEnd[2]],   // centre near the wire end
            wireDir,                              // arm 1 = L (wire)
            // arm 2 = wireDir rotated 30° toward -y in the x-y plane (a drawn edge)
            fwNorm([
                wireDir[0]*Math.cos(-Math.PI/6) - wireDir[1]*Math.sin(-Math.PI/6),
                wireDir[0]*Math.sin(-Math.PI/6) + wireDir[1]*Math.cos(-Math.PI/6),
                0
            ]),
            0.7, "#EF5350"
        );
        decoyArc.userData = { elementType: "fcw_decoy_arc", id: "fcw_decoy_arc" };
        decoyArc.visible = false;
        addToScene(decoyArc);
        var decoyLab = createLabelSprite("30°", "#EF5350", 0.34);
        decoyLab.position.set(wEnd[0] + 0.1, wEnd[1] - 0.7, wEnd[2]);
        decoyLab.userData = { elementType: "fcw_decoy_label", id: "fcw_decoy_label" };
        decoyLab.visible = false;
        addToScene(decoyLab);

        // 8. True ∠(L,B) arc (STATE_4) — GREEN, between L (wire +x) and B (+y),
        //    drawn at the wire CENTRE so it is visually distinct from the red
        //    decoy arc near the wire end. Here L ⊥ B so the arc spans 90°.
        var trueArc = buildFcwAngleArc(
            [0, 0, 0],
            wireDir,
            [bDir.x, bDir.y, bDir.z],
            0.85, "#66BB6A"
        );
        trueArc.userData = { elementType: "fcw_true_arc", id: "fcw_true_arc" };
        trueArc.visible = false;
        addToScene(trueArc);
        var trueLab = createLabelSprite("θ", "#66BB6A", 0.40);
        trueLab.position.set(0.7, 0.7, 0);
        trueLab.userData = { elementType: "fcw_true_label", id: "fcw_true_label" };
        trueLab.visible = false;
        addToScene(trueLab);

        // 9. Bent wire (STATE_5) — a zig-zag tube through the state's waypoints.
        //    Waypoints come from the per-state extras; build with a sensible
        //    default so the element exists even before applyExtras runs.
        var defaultWaypts = [[-1.4, -0.6, 0], [-0.5, 0.7, 0], [0.4, -0.5, 0], [1.4, 0.6, 0]];
        var bentTube = createTubeLine(defaultWaypts, wireColor, 0.07);
        if (bentTube) {
            bentTube.material.emissive = hexToThreeColor(wireColor);
            bentTube.material.emissiveIntensity = 0.35;
            bentTube.userData = { elementType: "fcw_bent_wire", id: "fcw_bent_wire" };
            bentTube.visible = false;
            addToScene(bentTube);
        }

        // 10. Chord arrow (STATE_5) — the straight chord from first→last
        //     waypoint. Snapshot reveal (a discrete shown element, NOT a morph).
        var chordFrom = defaultWaypts[0];
        var chordTo = defaultWaypts[defaultWaypts.length - 1];
        var chordVec = [chordTo[0]-chordFrom[0], chordTo[1]-chordFrom[1], chordTo[2]-chordFrom[2]];
        var chordLen = Math.sqrt(chordVec[0]*chordVec[0]+chordVec[1]*chordVec[1]+chordVec[2]*chordVec[2]) || 1;
        var chordArr = new THREE.ArrowHelper(
            new THREE.Vector3(chordVec[0]/chordLen, chordVec[1]/chordLen, chordVec[2]/chordLen),
            new THREE.Vector3(chordFrom[0], chordFrom[1], chordFrom[2]),
            chordLen, "#66BB6A", 0.18, 0.10
        );
        chordArr.userData = { elementType: "fcw_chord", id: "fcw_chord" };
        chordArr.visible = false;
        addToScene(chordArr);
        var chordLab = createLabelSprite("L_chord", "#66BB6A", 0.34);
        chordLab.position.set((chordFrom[0]+chordTo[0])/2, (chordFrom[1]+chordTo[1])/2 + 0.35, 0);
        chordLab.userData = { elementType: "fcw_chord_label", id: "fcw_chord_label" };
        chordLab.visible = false;
        addToScene(chordLab);

        // 11. Square loop (STATE_6) — closed square in the x-y plane + four
        //     outward per-side force arrows that sum to zero (couple/twist).
        //     net F_net_arrow is hidden in STATE_6 (chord closes → ΣF = 0).
        var loopGrpF = new THREE.Group();
        loopGrpF.userData = { elementType: "fcw_square_loop", id: "fcw_square_loop" };
        loopGrpF.visible = false;
        var lhSide = 0.8;   // half-side (full side 1.6 from JSON default)
        var loopColF = hexToThreeColor(wireColor);
        function fwLoopSeg(x1, y1, x2, y2, segId) {
            var dx = x2 - x1, dy = y2 - y1;
            var len = Math.sqrt(dx*dx + dy*dy);
            var geom = new THREE.CylinderGeometry(0.05, 0.05, len, 12);
            var mat = new THREE.MeshPhongMaterial({
                color: loopColF, emissive: loopColF, emissiveIntensity: 0.4, shininess: 60
            });
            var mesh = new THREE.Mesh(geom, mat);
            mesh.position.set((x1+x2)/2, (y1+y2)/2, 0);
            var axis = new THREE.Vector3(dx, dy, 0).normalize();
            var up = new THREE.Vector3(0, 1, 0);
            mesh.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(up, axis));
            mesh.userData = { elementType: "fcw_loop_side", id: segId };
            loopGrpF.add(mesh);
        }
        // CCW loop viewed from +z: bottom (→ +x), right (↑ +y), top (← -x), left (↓ -y)
        fwLoopSeg(-lhSide, -lhSide, +lhSide, -lhSide, "loop_bottom");
        fwLoopSeg(+lhSide, -lhSide, +lhSide, +lhSide, "loop_right");
        fwLoopSeg(+lhSide, +lhSide, -lhSide, +lhSide, "loop_top");
        fwLoopSeg(-lhSide, +lhSide, -lhSide, -lhSide, "loop_left");

        // Per-side force arrows F = I (Lside × B). B = +y. Only the horizontal
        // sides (current along ±x) feel a force ⊥ to the page (±z); the vertical
        // sides carry current ∥ B → ZERO force. Top current is -x → F = -x̂×ŷ =
        // -ẑ (into page); bottom current +x → F = +ẑ (out of page). The two are
        // equal and opposite → ΣF = 0, but on opposite sides → a couple (twist).
        // BOLD arrows (thick cone, length 1.0) so the couple reads broadside; a
        // child shaft cylinder thickens them the same way as the net-F arrow.
        function fwSideForce(px, py, dirZ, sideId) {
            var sfLen = 1.0;
            var arr = new THREE.ArrowHelper(
                new THREE.Vector3(0, 0, dirZ), new THREE.Vector3(px, py, 0),
                sfLen, "#66BB6A", 0.34, 0.18
            );
            var sfShaftGeo = new THREE.CylinderGeometry(0.045, 0.045, sfLen - 0.34, 12);
            var sfShaftMat = new THREE.MeshPhongMaterial({
                color: hexToThreeColor("#66BB6A"), emissive: hexToThreeColor("#66BB6A"),
                emissiveIntensity: 0.5, shininess: 60
            });
            var sfShaft = new THREE.Mesh(sfShaftGeo, sfShaftMat);
            sfShaft.position.set(0, (sfLen - 0.34) / 2, 0);   // +y-local = arrow axis
            arr.add(sfShaft);
            arr.userData = { elementType: "fcw_side_force", id: sideId };
            loopGrpF.add(arr);
        }
        fwSideForce(0, +lhSide, -1, "fcw_force_top");     // top current -x → into page
        fwSideForce(0, -lhSide, +1, "fcw_force_bottom");  // bottom current +x → out of page

        // The two vertical sides carry current ∥ B → F = 0. Mark them so the
        // loop's FOUR sides are all visibly accounted for and the student sees
        // WHY only the horizontal pair forms the couple (not a missing arrow).
        function fwZeroForceMark(px, py, sideId) {
            var z = createLabelSprite("F=0", "#9CA3AF", 0.26);
            z.position.set(px, py, 0);
            z.userData = { elementType: "fcw_side_force", id: sideId };
            loopGrpF.add(z);
        }
        fwZeroForceMark(+lhSide + 0.45, 0, "fcw_force_right_zero");  // right side ∥ B
        fwZeroForceMark(-lhSide - 0.45, 0, "fcw_force_left_zero");   // left side  ∥ B
        // Couple/twist hint — wide label so the FULL "couple → torque" string
        // shows (the fixed-width createLabelSprite canvas clipped it to
        // "uple → torq"). createWideLabelSprite sizes the canvas to the text.
        var coupleLab = createWideLabelSprite("couple \\u2192 torque", "#FFF176", 0.34);
        coupleLab.position.set(0, -lhSide - 0.6, 0);
        coupleLab.userData = { elementType: "fcw_couple_label", id: "fcw_couple_label" };
        loopGrpF.add(coupleLab);
        addToScene(loopGrpF);
    }

    // Parametric angle arc between two arm directions, anchored at centre,
    // built via Gram-Schmidt (matching the Biot-Savart arc pattern) + a tube.
    // Returns a Group placed at centre; the arc spans the angle between
    // armA and armB at radius rad.
    function buildFcwAngleArc(centre, armA, armB, rad, color) {
        function v3(a) { return new THREE.Vector3(a[0], a[1], a[2]); }
        var a = v3(armA).normalize();
        var b = v3(armB).normalize();
        var d = Math.max(-1, Math.min(1, a.dot(b)));
        var ang = Math.acos(d);
        // Component of b perpendicular to a (Gram-Schmidt), normalized.
        var w = b.clone().sub(a.clone().multiplyScalar(d));
        if (w.length() < 1e-6) w = new THREE.Vector3(0, 0, 1); else w.normalize();
        var pts = [], segs = 28;
        for (var s = 0; s <= segs; s++) {
            var t = (s / segs) * ang;
            var x = a.x * rad * Math.cos(t) + w.x * rad * Math.sin(t);
            var y = a.y * rad * Math.cos(t) + w.y * rad * Math.sin(t);
            var z = a.z * rad * Math.cos(t) + w.z * rad * Math.sin(t);
            pts.push([x, y, z]);
        }
        var grp = new THREE.Group();
        grp.position.set(centre[0], centre[1], centre[2]);
        var tube = createTubeLine(pts, color, 0.022);
        if (tube) {
            tube.material.transparent = true;
            tube.material.opacity = 0.95;
            grp.add(tube);
        }
        return grp;
    }

    // Per-state visibility + positioning for the force_on_current_wire scenario.
    // The generic visible_elements matcher in applyState leaves these elements
    // alone (their elementTypes are not listed in visible_elements), so this
    // function is authoritative: it reads each extras.<key>.show flag and the
    // per-state shape fields, then toggles + repositions the matching meshes.
    function applyForceWireState(stateDef) {
        var ex = (stateDef && stateDef.extras) || {};
        function flag(o) { return !!(o && o.show); }

        // Reset the current direction on every state entry. STATE_3 arms a
        // one-shot auto-flip; STATE_7 lets the student drive it via the button.
        fcwCurrentDir = 1;
        var fcwDirToggleEl = document.getElementById("fcw_dir_toggle");
        if (fcwDirToggleEl) {
            fcwDirToggleEl.textContent = "Flip current \\u2192";
            fcwDirToggleEl.classList.remove("reversed");
        }
        if (ex.current_flip && ex.current_flip.show) {
            // Store the flip threshold as a STATE-LOCAL sim-time offset (ms since
            // state entry), NOT a wall-clock performance.now() stamp. The animate
            // loop compares it against (time - stateStartTime)*1000 so the flip
            // also fires when the visual gate pins the clock past the threshold
            // via SET_TIME_FREEZE (wall-clock + heldAtPin gating used to swallow
            // it entirely — the flip showed no before/after change in capture).
            fcwFlipAt = (typeof ex.current_flip.reverse_at_ms === "number") ? ex.current_flip.reverse_at_ms : 9000;
        } else {
            fcwFlipAt = null;
        }

        var showWire = flag(ex.wire);
        var showCurArrows = flag(ex.current_arrows);
        var showFNet = flag(ex.F_net_arrow);
        var showCharges = flag(ex.charge_arrows);
        var showHand = flag(ex.hand_3d);
        var showDecoy = flag(ex.decoy_30_angle);
        var showTrue = flag(ex.true_90_arc);
        var showBent = flag(ex.bent_wire);
        var showChord = flag(ex.chord_arrow);
        var showLoop = flag(ex.square_loop);
        var showSideForces = flag(ex.side_forces);

        // Charge count override from the state (default 7).
        var chargeCountState = (ex.charge_arrows && ex.charge_arrows.count) || 7;

        // STATE_5 bent-wire waypoints + chord override.
        var bentWaypts = (ex.bent_wire && ex.bent_wire.waypoints) || null;
        var chordFrom = (ex.chord_arrow && ex.chord_arrow.from) || null;
        var chordTo = (ex.chord_arrow && ex.chord_arrow.to) || null;

        for (var i = 0; i < sceneObjects.length; i++) {
            var o = sceneObjects[i];
            var ud = o.userData;
            if (!ud || !ud.elementType) continue;
            var et = ud.elementType;

            if (et === "fcw_wire") { o.visible = showWire; }
            else if (et === "fcw_l_label") { o.visible = showWire; }
            else if (et === "fcw_current_arrow") { o.visible = showCurArrows; }
            else if (et === "fcw_F_net") { o.visible = showFNet; }
            else if (et === "fcw_f_label") { o.visible = showFNet; }
            else if (et === "fcw_carrier") {
                var ci = parseInt((ud.id || "fcw_carrier_0").split("_").pop(), 10);
                o.visible = showCharges && ci < chargeCountState;
            }
            else if (et === "fcw_carrier_force") {
                o.visible = showCharges && (ud.carrierIndex < chargeCountState) &&
                    !!(ex.charge_arrows && ex.charge_arrows.per_charge_force);
            }
            else if (et === "fcw_hand") {
                o.visible = showHand;
                if (showHand) {
                    // Place the hand JUST ABOVE the wire centre (renderer-owned
                    // home), NOT the far-corner JSON hand_position — so it
                    // clearly relates to the wire. (JSON hand_position kept for
                    // back-compat but intentionally overridden here.)
                    var home = (ud.fcw_home && ud.fcw_home.length === 3) ? ud.fcw_home : [0.0, 1.35, 0.9];
                    o.position.set(home[0], home[1], home[2]);

                    // Static cross-product orientation: thumb (+y_local) → F̂,
                    // then twist so the flat fingers (-z_local) point along L
                    // (the current). With L = +x and B = +y, F̂ = L̂×B̂ = +z.
                    // Mirrors the lorentz hand-orientation math (which does NOT
                    // run for fcw), applied once here.
                    var lU = new THREE.Vector3(1, 0, 0);                 // L = current (+x)
                    var bU = new THREE.Vector3(0, 1, 0);                 // B (+y)
                    var fU = new THREE.Vector3().crossVectors(lU, bU);   // F̂ = +z
                    if (fU.length() > 1e-6) {
                        fU.normalize();
                        var qThumb = new THREE.Quaternion().setFromUnitVectors(
                            new THREE.Vector3(0, 1, 0), fU
                        );
                        var negZ = new THREE.Vector3(0, 0, -1).applyQuaternion(qThumb);
                        negZ.sub(fU.clone().multiplyScalar(negZ.dot(fU)));
                        if (negZ.length() > 1e-6) {
                            negZ.normalize();
                            var lProj = lU.clone().sub(fU.clone().multiplyScalar(lU.dot(fU)));
                            if (lProj.length() > 1e-6) {
                                lProj.normalize();
                                var qTwist = new THREE.Quaternion().setFromUnitVectors(negZ, lProj);
                                o.setRotationFromQuaternion(qTwist.clone().multiply(qThumb));
                            }
                        }
                    }
                }
            }
            else if (et === "fcw_decoy_arc" || et === "fcw_decoy_label") { o.visible = showDecoy; }
            else if (et === "fcw_true_arc" || et === "fcw_true_label") { o.visible = showTrue; }
            else if (et === "fcw_bent_wire") {
                o.visible = showBent;
                if (showBent && bentWaypts && bentWaypts.length >= 2) {
                    // Rebuild the tube geometry to the state's waypoints.
                    var vecs = bentWaypts.map(function(p) { return new THREE.Vector3(p[0], p[1], p[2]); });
                    var curve = new THREE.CatmullRomCurve3(vecs);
                    var newGeo = new THREE.TubeGeometry(curve, Math.max(bentWaypts.length * 8, 24), 0.07, 8, false);
                    if (o.geometry) o.geometry.dispose();
                    o.geometry = newGeo;
                }
            }
            else if (et === "fcw_chord") {
                o.visible = showChord;
                if (showChord && chordFrom && chordTo) {
                    var cv = [chordTo[0]-chordFrom[0], chordTo[1]-chordFrom[1], chordTo[2]-chordFrom[2]];
                    var cl = Math.sqrt(cv[0]*cv[0]+cv[1]*cv[1]+cv[2]*cv[2]) || 1;
                    o.position.set(chordFrom[0], chordFrom[1], chordFrom[2]);
                    o.setDirection(new THREE.Vector3(cv[0]/cl, cv[1]/cl, cv[2]/cl));
                    o.setLength(cl, 0.18, 0.10);
                }
            }
            else if (et === "fcw_chord_label") {
                o.visible = showChord;
                if (showChord && chordFrom && chordTo) {
                    o.position.set((chordFrom[0]+chordTo[0])/2, (chordFrom[1]+chordTo[1])/2 + 0.35, 0);
                }
            }
            else if (et === "fcw_square_loop") { o.visible = showLoop; }
            else if (et === "fcw_couple_label") { /* child of loop group */ }
        }

        // Side-force arrows + couple label live inside the loop group; toggle
        // them based on side_forces.show (independent of the loop wire itself).
        for (var j = 0; j < sceneObjects.length; j++) {
            var grp = sceneObjects[j];
            if (!grp.userData || grp.userData.elementType !== "fcw_square_loop") continue;
            for (var k = 0; k < grp.children.length; k++) {
                var c = grp.children[k];
                var cet = c.userData && c.userData.elementType;
                if (cet === "fcw_side_force") c.visible = showSideForces;
                else if (cet === "fcw_couple_label") {
                    c.visible = showSideForces && !!(ex.side_forces && ex.side_forces.show_couple);
                }
            }
        }
    }

    // ── Build scenario ────────────────────────────────────────────────────
    function buildScenario() {
        clearScene();

        var scenario = config.scenario_type;
        var charges = config.charges || [];

        switch (scenario) {
            case "point_charge_positive":
            case "point_charge_negative":
                if (config.electric_explorer) {
                    buildElectricDiamond();
                    break;
                }
                var charge = charges[0] || {
                    id: "q1", sign: scenario === "point_charge_positive" ? 1 : -1,
                    magnitude: 1, position: [0, 0, 0],
                    label: scenario === "point_charge_positive" ? "+q" : "-q",
                    color: scenario === "point_charge_positive" ? "#EF5350" : "#42A5F5"
                };
                buildPointChargeField(charge, config.field_lines.count || 12);
                buildEquipotentialSurfaces();
                break;

            case "dipole":
                var posCharge = charges.find(function(c) { return c.sign > 0; }) || {
                    id: "q_pos", sign: 1, magnitude: 1, position: [-1.5, 0, 0], label: "+q", color: "#EF5350"
                };
                var negCharge = charges.find(function(c) { return c.sign < 0; }) || {
                    id: "q_neg", sign: -1, magnitude: 1, position: [1.5, 0, 0], label: "-q", color: "#42A5F5"
                };
                buildDipoleField(posCharge, negCharge, config.field_lines.count || 10);
                buildEquipotentialSurfaces();
                break;

            case "parallel_plates":
                buildParallelPlatesField();
                break;

            case "uniform_field_force":
                buildForceFieldDiamond();
                break;

            case "solenoid_field":
                buildSolenoidField();
                break;

            case "bar_magnet":
                buildBarMagnetField();
                break;

            case "straight_wire_current":
                buildStraightWireField();
                break;

            case "biot_savart_element":
                buildBiotSavartField();
                break;

            case "changing_flux":
                buildChangingFluxField();
                break;

            case "lorentz_force_uniform_field":
                buildLorentzForceField();
                break;

            case "torque_on_loop_uniform_field":
                buildTorqueLoopInField();
                break;

            case "force_on_current_wire":
                buildForceOnCurrentWire();
                break;

            default:
                // Fallback: show a single positive charge
                buildPointChargeField(
                    { id: "q1", sign: 1, magnitude: 1, position: [0,0,0], label: "+q", color: "#EF5350" },
                    config.field_lines.count || 12
                );
        }

        applyState(PM_currentState);
    }

    // ── State management ──────────────────────────────────────────────────
    function applyState(stateId) {
        PM_currentState = stateId;
        stateStartTime = time;
        var stateDef = config.states[stateId];
        if (!stateDef) return;

        // Diamond #2 (Lorentz force): reset the particle trail buffer on state
        // change so each state animates from a clean canvas. The static-state
        // visibility (STATE_2/3/4) won't ever fill the buffer; the moving-state
        // visibility (STATE_5/6/7) starts from 0 each time the state is entered.
        for (var ri = 0; ri < sceneObjects.length; ri++) {
            var rObj = sceneObjects[ri];
            if (rObj.userData && rObj.userData.elementType === "particle_trail") {
                rObj.userData.filled = 0;
                rObj.userData.write_index = 0;
                rObj.geometry.setDrawRange(0, 0);
            }
        }

        // Update caption
        var captionEl = document.getElementById("caption");
        if (captionEl) captionEl.textContent = stateDef.caption || "";

        // Visibility — show only elements in visible_elements
        var vis = stateDef.visible_elements || [];
        var showAll = vis.length === 0 || vis.indexOf("all") >= 0;

        for (var i = 0; i < sceneObjects.length; i++) {
            var obj = sceneObjects[i];
            var ud = obj.userData;
            if (!ud || !ud.elementType) { obj.visible = true; continue; }

            if (showAll) {
                obj.visible = true;
            } else {
                // Check if any visible_elements token matches
                var match = false;
                for (var v = 0; v < vis.length; v++) {
                    if (ud.elementType === vis[v] || ud.id === vis[v] ||
                        ud.elementType.indexOf(vis[v]) >= 0 || (ud.id && ud.id.indexOf(vis[v]) >= 0)) {
                        match = true; break;
                    }
                }
                obj.visible = match;
            }
        }

        // Camera animation
        if (stateDef.camera_position) {
            animateCameraTo(stateDef.camera_position);
        }

        // Diamond #4 STATE_1 wire-to-coil morph: when a state opts in via
        // wire_to_coil_morph.enabled, force the straight stand-in wire visible
        // + opaque, and the coil hidden + transparent. The animate loop drives
        // the cross-fade from there. For ALL other states (incl. the default
        // case where the wire doesn't exist) the stand-in stays invisible and
        // the coil stays fully visible — matching pre-Diamond-#4 behavior.
        if (config.scenario_type === "solenoid_field") {
            var morphCfg = stateDef.wire_to_coil_morph;
            var morphWireObj = null, coilObj = null;
            for (var mi = 0; mi < sceneObjects.length; mi++) {
                var mo = sceneObjects[mi];
                if (mo.userData && mo.userData.id === "solenoid_morph_wire") morphWireObj = mo;
                if (mo.userData && mo.userData.id === "solenoid_coil") coilObj = mo;
            }
            if (morphCfg && morphCfg.enabled) {
                if (morphWireObj) {
                    morphWireObj.visible = true;
                    if (morphWireObj.material) morphWireObj.material.opacity = 1;
                }
                if (coilObj) {
                    coilObj.visible = true;
                    for (var coi = 0; coi < coilObj.children.length; coi++) {
                        var ch = coilObj.children[coi];
                        if (ch.material) ch.material.opacity = 0;
                    }
                }
            } else {
                if (morphWireObj) {
                    morphWireObj.visible = false;
                    if (morphWireObj.material) morphWireObj.material.opacity = 0;
                }
                if (coilObj) {
                    for (var coj = 0; coj < coilObj.children.length; coj++) {
                        var ch2 = coilObj.children[coj];
                        if (ch2.material) ch2.material.opacity = 1;
                    }
                }
            }
        }

        // Premium extras (right hand, compass, highlighted point)
        clearDynamicExtras();
        applyExtras(stateDef.extras);

        // Diamond #3 — torque-loop per-state visibility + rotation seeding.
        if (config.scenario_type === "torque_on_loop_uniform_field") {
            applyTorqueLoopState(stateDef);
        }

        // force_on_current_wire — per-state element visibility + positioning
        // (authoritative; runs after the generic visible_elements matcher).
        if (config.scenario_type === "force_on_current_wire") {
            applyForceWireState(stateDef);
        }

        // Biot-Savart — seed the choreography on state entry: collapse every
        // grow-from-origin vector to scale 0 (the animate loop draws them back in
        // on schedule) so there is no full-size flash on the first frame. Also
        // hide the flow dots / orbit arrow / scanner until the animate loop turns
        // them on for the active state.
        if (config.scenario_type === "biot_savart_element") {
            // Authored field point + circle radius — used to RESET the reused
            // rings / P to their built pose on every state entry, so the
            // STATE_10 explorer's edits (which scale the rings + move P) never
            // leak into the other states.
            var authP = (config.biot_defaults && config.biot_defaults.field_point_P) || [1.6, 0, 0];
            var authRP = Math.sqrt(authP[0] * authP[0] + authP[2] * authP[2]) || 1.6;
            var showExplorer = !!stateDef.show_sliders;
            for (var bri = 0; bri < sceneObjects.length; bri++) {
                var bro = sceneObjects[bri];
                var brud = bro.userData;
                if (!brud || !brud.elementType) continue;
                if (brud.grows) {
                    if (brud.isLabel) {
                        if (bro.material) bro.material.opacity = 0;
                    } else {
                        bro.scale.setScalar(0.0001);
                        if (brud.fadeChildren) {
                            for (var brc = 0; brc < bro.children.length; brc++) {
                                if (bro.children[brc].material) bro.children[brc].material.opacity = 0;
                            }
                        }
                    }
                }
                if (brud.elementType === "biot_flow" || brud.elementType === "biot_orbit" || brud.elementType === "biot_scan") {
                    bro.visible = false;
                    if (bro.material) bro.material.opacity = 0;
                }
                // Right-hand-rule hands: visibility owned entirely by the
                // per-state biot_element flags (this loop runs AFTER the
                // generic visible_elements matcher, so it is authoritative).
                if (brud.elementType === "biot_grip_hand") {
                    bro.visible = !!(stateDef.biot_element && stateDef.biot_element.show_grip_hand);
                    if (bro.visible) {
                        var gp = (stateDef.biot_element && stateDef.biot_element.grip_hand_position) || brud.homePos;
                        if (gp) bro.position.set(gp[0], gp[1], gp[2]);
                    }
                }
                if (brud.elementType === "biot_cross_hand") {
                    bro.visible = !!(stateDef.biot_element && stateDef.biot_element.show_cross_hand);
                    if (bro.visible) {
                        var xp = (stateDef.biot_element && stateDef.biot_element.cross_hand_position) || brud.homePos;
                        if (xp) bro.position.set(xp[0], xp[1], xp[2]);
                    }
                }
                // RESET reused objects to their built pose (the explorer mutates
                // these; reset every entry so non-explorer states stay correct).
                if (brud.elementType === "biot_circle") {
                    if (brud.id && brud.id.indexOf("bs_circle_ring") === 0) bro.scale.set(1, 1, 1);
                    if (brud.id === "bs_circle_arr") brud.orbitRadius = authRP;
                }
                if (brud.elementType === "field_point" && brud.id === "bs_point_P") {
                    bro.position.set(authP[0], authP[1], authP[2]);
                }
                // Interactive-explorer objects: shown ONLY in the slider state.
                if (brud.elementType === "biot_explorer") {
                    bro.visible = showExplorer;
                }
            }
        }

        // Point-charge electric diamond — authoritative per-state visibility
        // (field sets, charge labels, test charge, emphasis E-arrow, rule-wrong
        // glyphs) + emphasis-arrow pose. Runs after the generic matcher + extras.
        if (config.electric_explorer) {
            applyElectricState(stateDef);
        }

        // Uniform-field force diamond (force_on_charge_in_field, F = qE) —
        // per-state visibility (charge, F/v arrows, trails, multi-mass charges)
        // + motion-mode reset. Gated on config.force_field_explorer so nothing
        // else is touched. The per-frame integrator lives in the animate loop.
        if (config.force_field_explorer) {
            applyForceFieldState(stateDef);
        }

        // Sliders + formula overlay visibility — scenario-aware: show the
        // I/r panel for straight_wire_current, the q/v/B/θ panel for
        // lorentz_force_uniform_field, the N/I/B/θ panel for
        // torque_on_loop_uniform_field. Always hide the others.
        var slidersEl = document.getElementById("sliders");
        var lorentzSlidersEl = document.getElementById("lorentz_sliders");
        var torqueSlidersEl = document.getElementById("torque_sliders");
        var fcwSlidersEl = document.getElementById("fcw_sliders");
        var isLorentz = config.scenario_type === "lorentz_force_uniform_field";
        var isTorque = config.scenario_type === "torque_on_loop_uniform_field";
        var isFcw = config.scenario_type === "force_on_current_wire";
        if (slidersEl) slidersEl.style.display = (stateDef.show_sliders && !isLorentz && !isTorque && !isFcw) ? "block" : "none";
        if (fcwSlidersEl) {
            var showFcwSliders = !!(stateDef.show_sliders && isFcw);
            fcwSlidersEl.style.display = showFcwSliders ? "block" : "none";
            if (showFcwSliders) {
                // Sync the θ slider to the state's theta_deg on entry, then
                // re-fire its input handler so the F readout matches.
                var thF = document.getElementById("fcw_theta_slider");
                if (thF && typeof stateDef.theta_deg === "number") {
                    thF.value = String(stateDef.theta_deg);
                    var thVF = document.getElementById("fcw_theta_val");
                    if (thVF) thVF.textContent = String(Math.round(stateDef.theta_deg));
                    thF.dispatchEvent(new Event("input", { bubbles: true }));
                }
            }
        }
        if (lorentzSlidersEl) lorentzSlidersEl.style.display = (stateDef.show_sliders && isLorentz) ? "block" : "none";
        if (torqueSlidersEl) {
            var showTorqueSliders = !!(stateDef.show_sliders && isTorque);
            torqueSlidersEl.style.display = showTorqueSliders ? "block" : "none";
            if (showTorqueSliders) {
                // Sync the θ slider thumb to the state's theta_deg so the
                // visible loop angle matches the slider position on entry.
                // Also seed the loop group's slider_* userData with current
                // slider values so per-frame μ/τ scaling reads them from
                // the very first frame (before the user drags anything).
                var nT = document.getElementById("n_torque_slider");
                var iT = document.getElementById("i_torque_slider");
                var bT = document.getElementById("b_torque_slider");
                var thT = document.getElementById("theta_torque_slider");
                if (thT && typeof stateDef.theta_deg === "number") {
                    thT.value = String(stateDef.theta_deg);
                    var thV = document.getElementById("theta_torque_val");
                    if (thV) thV.textContent = String(Math.round(stateDef.theta_deg));
                }
                var lgSync = findTorqueLoopGroup();
                if (lgSync && nT && iT && bT && thT) {
                    lgSync.userData.slider_N = parseFloat(nT.value);
                    lgSync.userData.slider_I = parseFloat(iT.value);
                    lgSync.userData.slider_B = parseFloat(bT.value);
                    lgSync.userData.slider_theta_deg = parseFloat(thT.value);
                }
                // Re-fire the slider input handler so the τ readout
                // recomputes against the just-synced θ value (otherwise
                // the readout shows the stale value from setupSliders'
                // initial refreshTorqueLabels() at slider_controls.default).
                if (thT) thT.dispatchEvent(new Event("input", { bubbles: true }));
            }
        }

        var formulaEl = document.getElementById("formula_overlay");
        if (formulaEl) {
            if (stateDef.formula_overlay) {
                formulaEl.textContent = stateDef.formula_overlay;
                formulaEl.style.display = "block";
            } else {
                formulaEl.style.display = "none";
            }
        }

        // Equation panel anchor (TTS-driven math sync). Reset to empty
        // whenever we enter a new state so left-over math from a previous
        // state's TTS doesn't bleed in.
        var equationPanelEl = document.getElementById("equation_panel");
        if (equationPanelEl) {
            equationPanelEl.innerHTML = "";
            equationPanelEl.style.display = "none";
            var anchor = stateDef.equation_panel_anchor || "bottom-left";
            equationPanelEl.className = "anchor-" + anchor;
        }

        // If sliders are shown for this state, refresh the field-line visual
        // feedback so the current slider values are reflected immediately.
        if (stateDef.show_sliders) refreshSliderVisuals();

        // Update legend
        updateLegend(stateDef);
    }

    function updateLegend(stateDef) {
        var legendEl = document.getElementById("legend");
        if (!legendEl) return;

        // Rule 24 (sim is the teacher's silent visual): the electric diamond ships
        // with NO on-canvas prose legend — labels live in the 3D scene instead.
        if (config.electric_explorer) { legendEl.style.display = "none"; legendEl.innerHTML = ""; return; }
        if (config.force_field_explorer) { legendEl.style.display = "none"; legendEl.innerHTML = ""; return; }

        var scenario = config.scenario_type;
        var lines = [];
        lines.push("<b>" + (stateDef.label || PM_currentState) + "</b>");

        if (scenario.indexOf("charge") >= 0 || scenario === "dipole" || scenario === "gauss") {
            lines.push("\\u26aa Red sphere = +q");
            lines.push("\\u26aa Blue sphere = -q");
            lines.push("\\u26aa Lines = E field direction");
        } else if (scenario.indexOf("magnet") >= 0 || scenario === "solenoid_field") {
            lines.push("\\u26aa Red = N pole");
            lines.push("\\u26aa Blue = S pole");
            lines.push("\\u26aa Lines = B field");
        } else if (scenario === "straight_wire_current") {
            lines.push("\\u26aa Wire carries current I");
            lines.push("\\u26aa Circles = B field");
        } else if (scenario === "biot_savart_element") {
            lines.push("\\u26aa Amber = current element dl");
            lines.push("\\u26aa Grey = r̂ to point P");
            lines.push("\\u26aa Green = dB (⊥ dl & r̂)");
        } else if (scenario === "parallel_plates") {
            lines.push("\\u26aa Red plate = +");
            lines.push("\\u26aa Blue plate = \\u2212");
            lines.push("\\u26aa Lines = uniform E");
        } else if (scenario === "changing_flux") {
            lines.push("\\u26aa Coil = conductor");
            lines.push("\\u26aa Block = magnet");
            lines.push("\\u26aa Glow = induced EMF");
        }

        lines.push("<i>Drag to rotate \\u2022 Scroll to zoom</i>");
        legendEl.innerHTML = lines.join("<br>");
    }

    // ── Slider wiring (I and r — interactive in show_sliders states) ──────
    var MU_0 = 4 * Math.PI * 1e-7;

    function biotFindById(id) {
        for (var k = 0; k < sceneObjects.length; k++) {
            var o = sceneObjects[k];
            if (o.userData && o.userData.id === id) return o;
        }
        return null;
    }

    // ── Biot-Savart STATE_10 explorer — I / d / θ drive real physics ───────
    // The teacher's key point (2026-06-17 review): the Biot-Savart r is the
    // distance from the ELEMENT to P, equal to the field-circle radius ONLY at
    // θ=90°. So the slider is the perpendicular distance d (= circle radius),
    // and the true slant r = d / sinθ is COMPUTED + shown changing as θ moves.
    //   d (slider) → moves P + rescales the field circle; B = μ0 I / 2π d (whole wire)
    //   θ (slider) → slides the element along the wire so angle(dl, r̂)=θ; the slant
    //                r̂ line (= true r) lengthens, and dB = (μ0/4π) I dl sinθ / r²
    //   I (slider) → scales B and dB.
    // dB direction is dl × r̂ (tangent at P). Numeric readouts are EXACT; the dB
    // arrow length is a bounded visual of the true dB.
    function refreshBiotExplorer() {
        var iS = document.getElementById("i_slider");
        var rS = document.getElementById("r_slider");
        var thS = document.getElementById("theta_slider");
        if (!iS || !rS) return;
        var I = parseFloat(iS.value);
        var d_cm = parseFloat(rS.value);          // slider = PERPENDICULAR distance to P = circle radius
        var d_m = d_cm / 100;
        var thetaDeg = thS ? parseFloat(thS.value) : 90;
        var thetaRad = thetaDeg * Math.PI / 180;
        var sinT = Math.sin(thetaRad);
        var cosT = Math.cos(thetaRad);
        var sinSafe = Math.max(Math.abs(sinT), 0.02);

        // d (2..30 cm) → scene circle radius (~1.4..2.8; default 5cm ≈ built 1.6)
        var sceneR = 1.4 + ((d_cm - 2) / 28) * 1.4;
        if (sceneR < 1.4) sceneR = 1.4;
        if (sceneR > 2.8) sceneR = 2.8;

        // TRUE Biot-Savart r = element→P distance = d / sinθ (= d only at 90°).
        var rTrue_m = d_m / sinSafe;
        var B_uT = (MU_0 * I) / (2 * Math.PI * d_m) * 1e6;     // whole-wire field at P (uses d)
        var dl_m = 0.01;
        var dB_uT = (MU_0 / (4 * Math.PI)) * I * dl_m * sinT / (rTrue_m * rTrue_m) * 1e6; // one element (uses true r)

        // P on +x at the circle radius; move it + rescale the reused rings.
        var Px = sceneR, Py = 0, Pz = 0;
        var pP = biotFindById("bs_point_P");
        if (pP) pP.position.set(Px, Py, Pz);
        var k = sceneR / 1.6;
        for (var ci = 0; ci < sceneObjects.length; ci++) {
            var co = sceneObjects[ci]; var cud = co.userData;
            if (!cud || cud.elementType !== "biot_circle") continue;
            if (cud.id && cud.id.indexOf("bs_circle_ring") === 0) co.scale.set(k, 1, k);
            if (cud.id === "bs_circle_arr") cud.orbitRadius = sceneR;
        }

        // element y so that angle(dl=+y, r̂)=θ ⇒ y = -d·cotθ (clamped to wire).
        // Sliding the element (changing θ) lengthens the slant r — exactly why
        // r and the circle radius coincide only at 90°.
        var cot = (Math.abs(sinT) < 1e-4) ? 0 : (cosT / sinT);
        var yEl = -sceneR * cot;
        var wireLim = 2.9;
        if (yEl > wireLim) yEl = wireLim;
        if (yEl < -wireLim) yEl = -wireLim;
        var expElem = biotFindById("bs_exp_elem");
        if (expElem) expElem.position.set(0, yEl, 0);
        var expElemLabel = biotFindById("bs_exp_elem_label");
        if (expElemLabel) expElemLabel.position.set(-0.5, yEl + 0.1, 0.0);

        // r̂ = the SLANT line element→P (the true r). Label "r" rides its midpoint.
        var rx = Px, ry = Py - yEl, rz = Pz;
        var rlen = Math.sqrt(rx * rx + ry * ry + rz * rz) || 1;
        var rhx = rx / rlen, rhy = ry / rlen, rhz = rz / rlen;
        var expRhat = biotFindById("bs_exp_rhat");
        if (expRhat) {
            expRhat.position.set(0, yEl, 0);
            expRhat.setDirection(new THREE.Vector3(rhx, rhy, rhz));
            expRhat.setLength(rlen, Math.min(0.3, 0.22 * rlen), Math.min(0.18, 0.13 * rlen));
        }
        var expRLabel = biotFindById("bs_exp_r_label");
        if (expRLabel) expRLabel.position.set(rhx * rlen * 0.5 + 0.14, yEl + rhy * rlen * 0.5 + 0.14, rhz * rlen * 0.5);

        // dB ∝ dl × r̂ (dl=+y) ⇒ (rhz, 0, -rhx); tangent at P. Length = bounded
        // visual of the TRUE dB (normalised to the default I=5,θ=90,d=5cm ⇒ 2 µT).
        var cdx = rhz, cdy = 0, cdz = -rhx;
        var clen = Math.sqrt(cdx * cdx + cdz * cdz) || 1;
        var cnx = cdx / clen, cny = cdy / clen, cnz = cdz / clen;
        var dBrel = dB_uT / 2.0;
        var dbLen = 0.3 + 1.0 * Math.tanh(0.55 * dBrel);
        var expDb = biotFindById("bs_exp_db");
        if (expDb) {
            expDb.position.set(Px, Py, Pz);
            expDb.setDirection(new THREE.Vector3(cnx, cny, cnz));
            expDb.setLength(dbLen, 0.2, 0.13);
        }
        var expDbLabel = biotFindById("bs_exp_db_label");
        if (expDbLabel) {
            expDbLabel.position.set(Px + cnx * (dbLen + 0.3), Py + 0.12, Pz + cnz * (dbLen + 0.3));
        }

        var iVal = document.getElementById("i_val");
        var rVal = document.getElementById("r_val");
        var thVal = document.getElementById("theta_val");
        var bEl = document.getElementById("b_readout");
        var dbEl = document.getElementById("db_readout");
        var rTrueEl = document.getElementById("rtrue_readout");
        if (iVal) iVal.textContent = I.toFixed(1);
        if (rVal) rVal.textContent = String(Math.round(d_cm));
        if (thVal) thVal.textContent = String(Math.round(thetaDeg));
        if (bEl) bEl.innerHTML = "B = " + B_uT.toFixed(1) + " \\u03bcT";
        if (dbEl) dbEl.innerHTML = "dB = " + dB_uT.toFixed(2) + " \\u03bcT";
        if (rTrueEl) rTrueEl.innerHTML = "r (dl\\u2192P) = d/sin\\u03b8 = " + (rTrue_m * 100).toFixed(1) + " cm";
    }

    function refreshSliderVisuals() {
        var slidersEl = document.getElementById("sliders");
        if (!slidersEl || slidersEl.style.display === "none") return;

        // Biot-Savart owns a dedicated interactive explorer (P / circle / element
        // / r̂ / dB all respond to I, r, θ). Delegate and return.
        if (config.scenario_type === "biot_savart_element") { refreshBiotExplorer(); return; }
        if (config.electric_explorer) { refreshElectricExplorer(); return; }
        if (config.force_field_explorer) { refreshForceFieldExplorer(); return; }

        var iSlider = document.getElementById("i_slider");
        var rSlider = document.getElementById("r_slider");
        if (!iSlider || !rSlider) return;

        var I = parseFloat(iSlider.value);
        var r_cm = parseFloat(rSlider.value);
        var r_m = r_cm / 100;

        var B = (MU_0 * I) / (2 * Math.PI * r_m);
        var B_uT = B * 1e6;

        var iValEl = document.getElementById("i_val");
        var rValEl = document.getElementById("r_val");
        var bReadoutEl = document.getElementById("b_readout");
        if (iValEl) iValEl.textContent = I.toFixed(1);
        if (rValEl) rValEl.textContent = r_cm.toFixed(0);
        if (bReadoutEl) bReadoutEl.innerHTML = "B = " + B_uT.toFixed(1) + " μT";

        // Visual feedback: scale opacity by I (more current = brighter rings)
        // and highlight the ring closest to the slider's r.
        // Renderer builds 6 circles per height at radii 0.6, 1.1, 1.6, 2.1, 2.6, 3.1
        // (scene units). Map slider r (in m, 0.02 - 0.30) to scene units.
        var SCENE_R_MIN = 0.6, SCENE_R_MAX = 3.1;
        var sliderRMin = 0.02, sliderRMax = 0.30;
        var sceneR = SCENE_R_MIN + ((r_m - sliderRMin) / (sliderRMax - sliderRMin)) * (SCENE_R_MAX - SCENE_R_MIN);
        var closestRi = Math.round((sceneR - SCENE_R_MIN) / 0.5);
        if (closestRi < 0) closestRi = 0;
        if (closestRi > 5) closestRi = 5;

        var brightness = Math.min(1, Math.log(1 + I) / Math.log(21));
        var baseOpacity = 0.35 + brightness * 0.55;

        for (var i = 0; i < sceneObjects.length; i++) {
            var obj = sceneObjects[i];
            if (!obj.userData || !obj.material) continue;
            var et = obj.userData.elementType;
            var id = obj.userData.id || "";
            if (et === "field_line" || et === "arrow") {
                // Reset to default field-line color first
                if (obj.material.color && obj.material.color.setHex) {
                    obj.material.color.setHex(0x66BB6A);
                }
                obj.material.opacity = baseOpacity;
                // Highlight if this ring/arrow is at the closest radius
                var endsWithRi = id.endsWith("_" + closestRi);
                if (endsWithRi) {
                    if (obj.material.color && obj.material.color.setHex) {
                        obj.material.color.setHex(0xFFEB3B); // yellow highlight
                    }
                    obj.material.opacity = 1.0;
                }
            }
        }
    }

    // ── Electric point-charge diamond (electric_field_point_charge) ───────────
    //   Builds BOTH a +Q and a -Q radial field at the origin (sign flip = a
    //   visibility toggle, never a mid-state rebuild), plus a STATE_1 test charge
    //   + F arrow, an emphasis E-arrow at the field point P (STATE_2 static +
    //   STATE_7 slider-driven), and STATE_6 rule-wrong glyphs. Gated entirely on
    //   config.electric_explorer so legacy point-charge concepts are untouched.
    var electricSign = 1;

    function ecFindById(id) {
        for (var i = 0; i < sceneObjects.length; i++) {
            if (sceneObjects[i].userData && sceneObjects[i].userData.id === id) return sceneObjects[i];
        }
        return null;
    }

    function buildElectricDiamond() {
        var posColor = config.field_lines.color_positive || "#EF5350";
        var negColor = config.field_lines.color_negative || "#42A5F5";
        var count = config.field_lines.count || 12;

        // Both field sets at the origin — sign flip toggles visibility.
        buildPointChargeField({ id: "q_plus", sign: 1, magnitude: 1, position: [0, 0, 0], color: posColor }, count);
        buildPointChargeField({ id: "q_minus", sign: -1, magnitude: 1, position: [0, 0, 0], color: negColor }, count);

        // Source-charge labels (both at origin; one shown at a time).
        var lblPlus = createLabelSprite("+Q", posColor, 0.6);
        lblPlus.position.set(0, 0.55, 0);
        lblPlus.userData = { elementType: "electric_aux", id: "lbl_q_plus" };
        addToScene(lblPlus);
        var lblMinus = createLabelSprite("\\u2212Q", negColor, 0.6);
        lblMinus.position.set(0, 0.55, 0);
        lblMinus.userData = { elementType: "electric_aux", id: "lbl_q_minus" };
        addToScene(lblMinus);

        // STATE_1 test charge q + force arrow F (the E = F/q hook).
        var testQ = createChargeSphere([1.3, 0, 0], "#FFF176", 0.14);
        testQ.userData = { elementType: "electric_aux", id: "ec_test_q" };
        addToScene(testQ);
        var testLbl = createLabelSprite("q", "#FFF176", 0.42);
        testLbl.position.set(1.3, 0.35, 0);
        testLbl.userData = { elementType: "electric_aux", id: "ec_test_lbl" };
        addToScene(testLbl);
        var fArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(1.3, 0, 0), 0.9, 0x66BB6A, 0.22, 0.13);
        fArrow.userData = { elementType: "electric_aux", id: "ec_f_arrow" };
        addToScene(fArrow);
        var fLbl = createLabelSprite("F", "#66BB6A", 0.42);
        fLbl.position.set(2.35, 0.2, 0);
        fLbl.userData = { elementType: "electric_aux", id: "ec_f_lbl" };
        addToScene(fLbl);

        // Emphasis E-arrow at the field point P (STATE_2 static + STATE_7 driven).
        var pDot = createChargeSphere([1.6, 0, 0], "#FFEB3B", 0.09);
        pDot.userData = { elementType: "electric_aux", id: "ec_p_dot" };
        addToScene(pDot);
        var pLbl = createLabelSprite("P", "#FFF176", 0.4);
        pLbl.position.set(1.6, -0.32, 0);
        pLbl.userData = { elementType: "electric_aux", id: "ec_p_lbl" };
        addToScene(pLbl);
        var eArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(1.6, 0, 0), 1.2, 0xEF5350, 0.26, 0.15);
        eArrow.userData = { elementType: "electric_aux", id: "ec_e_arrow" };
        addToScene(eArrow);
        var eLbl = createLabelSprite("E", "#66BB6A", 0.5);
        eLbl.position.set(3.0, 0.2, 0);
        eLbl.userData = { elementType: "electric_aux", id: "ec_e_lbl" };
        addToScene(eLbl);
        var rLbl = createLabelSprite("r", "#D4D4D8", 0.4);
        rLbl.position.set(0.8, -0.3, 0);
        rLbl.userData = { elementType: "electric_aux", id: "ec_r_lbl" };
        addToScene(rLbl);

        // STATE_5 density-probe: a glowing probe that sweeps radially out/back; its
        // E-arrow shrinks as kQ/r² while the field lines around it brighten where
        // they crowd — density and strength fall together (the PRIMARY aha, animated).
        var probe = createChargeSphere([1.0, 0, 0], "#FFEB3B", 0.13);
        probe.userData = { elementType: "electric_aux", id: "ec_probe" };
        addToScene(probe);
        var probeArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(1.0, 0, 0), 1.5, 0x66BB6A, 0.3, 0.18);
        probeArrow.userData = { elementType: "electric_aux", id: "ec_probe_arrow" };
        addToScene(probeArrow);
        var probeELbl = createLabelSprite("E", "#66BB6A", 0.5);
        probeELbl.position.set(2.6, 0.22, 0);
        probeELbl.userData = { elementType: "electric_aux", id: "ec_probe_E_lbl" };
        addToScene(probeELbl);

        // STATE_6 rule-wrong glyphs: crossing lines (struck out) + charge-on-a-rail
        // (struck out). The teaching shows the wrong belief, then corrects it.
        var crossA = createTubeLine([[-2.7, 1.5, 0], [-1.5, 2.5, 0]], "#9E9E9E", 0.03);
        if (crossA) { crossA.userData = { elementType: "electric_aux", id: "ec_cross_a" }; addToScene(crossA); }
        var crossB = createTubeLine([[-2.7, 2.5, 0], [-1.5, 1.5, 0]], "#9E9E9E", 0.03);
        if (crossB) { crossB.userData = { elementType: "electric_aux", id: "ec_cross_b" }; addToScene(crossB); }
        var crossX = createLabelSprite("\\u2717", "#EF5350", 0.7);
        crossX.position.set(-2.1, 2.0, 0.05);
        crossX.userData = { elementType: "electric_aux", id: "ec_cross_x" };
        addToScene(crossX);
        var pathLine = createTubeLine([[1.4, 1.6, 0], [3.0, 2.4, 0]], "#9E9E9E", 0.03);
        if (pathLine) { pathLine.userData = { elementType: "electric_aux", id: "ec_path_line" }; addToScene(pathLine); }
        var pathDot = createChargeSphere([2.2, 2.0, 0], "#FFF176", 0.1);
        pathDot.userData = { elementType: "electric_aux", id: "ec_path_dot" };
        addToScene(pathDot);
        var pathX = createLabelSprite("\\u2717", "#EF5350", 0.7);
        pathX.position.set(2.2, 2.5, 0.05);
        pathX.userData = { elementType: "electric_aux", id: "ec_path_x" };
        addToScene(pathX);
    }

    function setElectricPolarity(sign) {
        electricSign = sign;
        for (var i = 0; i < sceneObjects.length; i++) {
            var o = sceneObjects[i]; var ud = o.userData;
            if (!ud || !ud.id) continue;
            var id = ud.id;
            if (id.indexOf("fl_q_plus") === 0 || id.indexOf("arr_q_plus") === 0) o.visible = (sign > 0);
            else if (id.indexOf("fl_q_minus") === 0 || id.indexOf("arr_q_minus") === 0) o.visible = (sign < 0);
            else if (id === "q_plus" || id === "lbl_q_plus") o.visible = (sign > 0);
            else if (id === "q_minus" || id === "lbl_q_minus") o.visible = (sign < 0);
        }
    }

    function applyElectricState(stateDef) {
        if (!stateDef) return;
        var showField = stateDef.show_field || "none";    // none | plus | minus
        var showCharge = stateDef.show_charge || "plus";   // plus | minus
        var showTest = !!stateDef.show_test_charge;
        var showEArrow = !!stateDef.show_e_arrow;
        var showRuleWrongs = !!stateDef.show_rule_wrongs;
        var showProbe = !!stateDef.show_density_probe;
        electricSign = (showCharge === "minus") ? -1 : 1;

        for (var i = 0; i < sceneObjects.length; i++) {
            var o = sceneObjects[i];
            var ud = o.userData;
            if (!ud || !ud.id) continue;
            var id = ud.id;
            // Reset field-line opacity on every entry (the STATE_5 probe dims/
            // brightens lines per-frame; restore full opacity for all other states).
            if (ud.elementType === "field_line" && o.material) o.material.opacity = config.field_lines.opacity || 0.85;
            if (id.indexOf("fl_q_plus") === 0 || id.indexOf("arr_q_plus") === 0) {
                o.visible = (showField === "plus");
            } else if (id.indexOf("fl_q_minus") === 0 || id.indexOf("arr_q_minus") === 0) {
                o.visible = (showField === "minus");
            } else if (id === "q_plus" || id === "lbl_q_plus") {
                o.visible = (showCharge === "plus");
            } else if (id === "q_minus" || id === "lbl_q_minus") {
                o.visible = (showCharge === "minus");
            } else if (id === "ec_test_q" || id === "ec_test_lbl" || id === "ec_f_arrow" || id === "ec_f_lbl") {
                o.visible = showTest;
            } else if (id === "ec_e_arrow" || id === "ec_e_lbl" || id === "ec_p_dot" || id === "ec_p_lbl" || id === "ec_r_lbl") {
                o.visible = showEArrow;
            } else if (id === "ec_probe" || id === "ec_probe_arrow" || id === "ec_probe_E_lbl") {
                o.visible = showProbe;
            } else if (id.indexOf("ec_cross") === 0 || id.indexOf("ec_path") === 0) {
                o.visible = showRuleWrongs;
            }
        }
        if (showEArrow) refreshElectricExplorer();
    }

    function refreshElectricExplorer() {
        var kE = 8.9875517873681764e9;
        var qS = document.getElementById("ec_q_slider");
        var rS = document.getElementById("ec_r_slider");
        var scQ = (config.slider_controls && config.slider_controls.Q) || {};
        var scR = (config.slider_controls && config.slider_controls.r) || {};
        var Q_nC = qS ? parseFloat(qS.value) : (scQ.default != null ? scQ.default : 5);
        var r_cm = rS ? parseFloat(rS.value) : ((scR.default != null ? scR.default : 0.05) * 100);
        var r_m = r_cm / 100;
        var sign = electricSign;

        var E = kE * (Q_nC * 1e-9) / (r_m * r_m);          // N/C
        var Eref = kE * (5 * 1e-9) / (0.05 * 0.05);          // default reference

        // r_cm (2..20) → scene radius (1.0..3.0).
        var sceneR = 1.0 + ((r_cm - 2) / 18) * 2.0;
        if (sceneR < 1.0) sceneR = 1.0;
        if (sceneR > 3.0) sceneR = 3.0;

        var Px = sceneR, Py = 0, Pz = 0;
        var dirX = sign > 0 ? 1 : -1;                        // outward for +, inward for -
        var arrColor = sign > 0 ? 0xEF5350 : 0x42A5F5;
        var len = 0.4 + 1.6 * Math.tanh(0.8 * (E / Eref));

        var pDot = ecFindById("ec_p_dot");
        if (pDot) pDot.position.set(Px, Py, Pz);
        var pLbl = ecFindById("ec_p_lbl");
        if (pLbl) pLbl.position.set(Px, -0.32, 0);
        var rLbl = ecFindById("ec_r_lbl");
        if (rLbl) rLbl.position.set(Px * 0.5, -0.3, 0);

        var eArrow = ecFindById("ec_e_arrow");
        if (eArrow) {
            eArrow.position.set(Px, Py, Pz);
            eArrow.setDirection(new THREE.Vector3(dirX, 0, 0));
            eArrow.setLength(len, Math.min(0.3, 0.25 * len), Math.min(0.18, 0.14 * len));
            if (eArrow.setColor) eArrow.setColor(new THREE.Color(arrColor));
        }
        var eLbl = ecFindById("ec_e_lbl");
        if (eLbl) eLbl.position.set(Px + dirX * (len + 0.25), 0.2, 0);

        var qVal = document.getElementById("ec_q_val");
        var rVal = document.getElementById("ec_r_val");
        var eOut = document.getElementById("ec_e_readout");
        if (qVal) qVal.textContent = (sign > 0 ? "+" : "\\u2212") + Math.round(Q_nC);
        if (rVal) rVal.textContent = String(Math.round(r_cm));
        if (eOut) {
            var disp = E >= 1000 ? (E / 1000).toFixed(1) + " kN/C" : Math.round(E) + " N/C";
            eOut.innerHTML = "E = " + disp;
        }
    }

    // ── Uniform-field force diamond (force_on_charge_in_field, F = qE) ────────
    //   A charge in a UNIFORM field between two horizontal plates (top +, bottom
    //   −), E pointing straight DOWN. A constant force F = qE gives a constant
    //   acceleration a = qE/m, so a charge launched sideways traces a PARABOLA —
    //   exactly like gravity (the PRIMARY aha, STATE_5). Built once; per-state
    //   visibility + motion mode are driven by applyForceFieldState + the
    //   animate-loop integrator. Gated entirely on config.force_field_explorer.
    var FF_TOP_Y = 1.45, FF_BOT_Y = -1.45;     // plate y-positions (E spans the gap)
    var FF_PLATE_W = 3.8, FF_PLATE_D = 2.4;    // plate size (x, z)
    var ffSign = 1;                            // current charge sign (+1 / −1)
    // Slider-driven values for the STATE_7 explorer (read by the integrator).
    var ffExpAccel = 0.55, ffExpFy = -1, ffExpFLen = 0.95;

    function ffFindById(id) {
        for (var i = 0; i < sceneObjects.length; i++) {
            if (sceneObjects[i].userData && sceneObjects[i].userData.id === id) return sceneObjects[i];
        }
        return null;
    }

    function ffMakeTrail(id, color) {
        var maxPts = 600;
        var g = new THREE.BufferGeometry();
        var arr = new Float32Array(maxPts * 3);
        g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
        g.setDrawRange(0, 0);
        var mat = new THREE.LineBasicMaterial({ color: hexToThreeColor(color), transparent: true, opacity: 0.9 });
        var line = new THREE.Line(g, mat);
        line.userData = { elementType: "particle_trail", id: id, max_points: maxPts, filled: 0, write_index: 0, ff_last_phase: 0 };
        addToScene(line);
        return line;
    }

    function buildForceFieldDiamond() {
        var posColor = (config.pvl_colors && config.pvl_colors.positive) || "#EF5350";
        var negColor = (config.pvl_colors && config.pvl_colors.negative) || "#42A5F5";
        var flColor = (config.field_lines && config.field_lines.color_positive) || "#7EA6FF";
        var chColor = "#FFF176";

        // Plates (thin in Y): top = + (red), bottom = − (blue).
        var topPlate = new THREE.Mesh(
            new THREE.BoxGeometry(FF_PLATE_W, 0.06, FF_PLATE_D),
            new THREE.MeshPhongMaterial({ color: hexToThreeColor(posColor), transparent: true, opacity: 0.5 }));
        topPlate.position.set(0, FF_TOP_Y, 0);
        topPlate.userData = { elementType: "ff_plate", id: "ff_plate_top" };
        addToScene(topPlate);
        var botPlate = new THREE.Mesh(
            new THREE.BoxGeometry(FF_PLATE_W, 0.06, FF_PLATE_D),
            new THREE.MeshPhongMaterial({ color: hexToThreeColor(negColor), transparent: true, opacity: 0.5 }));
        botPlate.position.set(0, FF_BOT_Y, 0);
        botPlate.userData = { elementType: "ff_plate", id: "ff_plate_bot" };
        addToScene(botPlate);
        var topMark = createLabelSprite("+", posColor, 0.5);
        topMark.position.set(-FF_PLATE_W / 2 - 0.25, FF_TOP_Y, 0);
        topMark.userData = { elementType: "ff_plate", id: "ff_mark_top" };
        addToScene(topMark);
        var botMark = createLabelSprite("\\u2212", negColor, 0.5);
        botMark.position.set(-FF_PLATE_W / 2 - 0.25, FF_BOT_Y, 0);
        botMark.userData = { elementType: "ff_plate", id: "ff_mark_bot" };
        addToScene(botMark);

        // Uniform field lines (vertical, pointing DOWN) on a grid.
        var nx = 4, nz = 3;
        for (var ix = 0; ix < nx; ix++) {
            for (var iz = 0; iz < nz; iz++) {
                var x = ((ix + 0.5) / nx - 0.5) * (FF_PLATE_W * 0.78);
                var z = ((iz + 0.5) / nz - 0.5) * (FF_PLATE_D * 0.7);
                var fline = createTubeLine([[x, FF_TOP_Y - 0.1, z], [x, FF_BOT_Y + 0.1, z]], flColor, 0.015);
                if (fline) { fline.userData = { elementType: "ff_field", id: "ff_fl_" + ix + "_" + iz }; addToScene(fline); }
                var farr = createArrowHead([x, 0.0, z], [0, -1, 0], flColor);
                farr.userData = { elementType: "ff_field", id: "ff_arr_" + ix + "_" + iz };
                addToScene(farr);
            }
        }
        var eLbl = createLabelSprite("E", flColor, 0.5);
        eLbl.position.set(FF_PLATE_W * 0.30, 0.55, FF_PLATE_D * 0.33);
        eLbl.userData = { elementType: "ff_field", id: "ff_e_lbl" };
        addToScene(eLbl);

        // Main charge + its F and v arrows + label + trail.
        var charge = createChargeSphere([0, 0.3, 0], chColor, 0.16);
        charge.userData = { elementType: "ff_charge", id: "ff_charge" };
        addToScene(charge);
        var qLbl = createLabelSprite("q", chColor, 0.45);
        qLbl.position.set(0, 0.66, 0);
        qLbl.userData = { elementType: "ff_charge", id: "ff_q_lbl" };
        addToScene(qLbl);
        var fArrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0.3, 0), 0.95, 0x66BB6A, 0.24, 0.14);
        fArrow.userData = { elementType: "ff_force", id: "ff_f_arrow" };
        addToScene(fArrow);
        var fLbl = createLabelSprite("F = qE", "#66BB6A", 0.46);
        fLbl.position.set(0.6, -0.2, 0);
        fLbl.userData = { elementType: "ff_force", id: "ff_f_lbl" };
        addToScene(fLbl);
        var vArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0.3, 0), 0.9, 0xFFAB40, 0.22, 0.12);
        vArrow.userData = { elementType: "ff_vel", id: "ff_v_arrow" };
        addToScene(vArrow);
        var vLbl = createLabelSprite("v", "#FFAB40", 0.44);
        vLbl.userData = { elementType: "ff_vel", id: "ff_v_lbl" };
        addToScene(vLbl);
        ffMakeTrail("ff_trail", chColor);

        // STATE_6 multi-mass: a light charge (whips, sharp curve) + a heavy charge
        // (barely curves) — SAME force F = qE, different mass → a = qE/m.
        var lightCh = createChargeSphere([0, 0.3, 0], "#A5D6A7", 0.12);
        lightCh.userData = { elementType: "ff_mass", id: "ff_charge_light" };
        addToScene(lightCh);
        var lightLbl = createLabelSprite("light m", "#A5D6A7", 0.38);
        lightLbl.userData = { elementType: "ff_mass", id: "ff_light_lbl" };
        addToScene(lightLbl);
        ffMakeTrail("ff_trail_light", "#A5D6A7");
        var heavyCh = createChargeSphere([0, 0.3, 0], "#EF9A9A", 0.22);
        heavyCh.userData = { elementType: "ff_mass", id: "ff_charge_heavy" };
        addToScene(heavyCh);
        var heavyLbl = createLabelSprite("heavy m", "#EF9A9A", 0.38);
        heavyLbl.userData = { elementType: "ff_mass", id: "ff_heavy_lbl" };
        addToScene(heavyLbl);
        ffMakeTrail("ff_trail_heavy", "#EF9A9A");
    }

    function applyForceFieldState(stateDef) {
        if (!stateDef) return;
        var mode = stateDef.motion_mode || "rest";
        ffSign = (stateDef.ff_sign != null) ? stateDef.ff_sign : 1;
        var showMain = (mode !== "launch_parabola_multimass");
        var showArrows = (mode === "rest" || mode === "accelerate_straight" || mode === "launch_parabola" || mode === "explorer");
        var showV = (mode === "accelerate_straight" || mode === "launch_parabola" || mode === "explorer");
        var showTrailMain = showV;
        var showMass = (mode === "launch_parabola_multimass");

        for (var i = 0; i < sceneObjects.length; i++) {
            var o = sceneObjects[i]; var ud = o.userData;
            if (!ud || !ud.id) continue;
            var et = ud.elementType;
            if (et === "ff_plate" || et === "ff_field") { o.visible = true; }
            else if (ud.id === "ff_charge" || ud.id === "ff_q_lbl") { o.visible = showMain; }
            else if (et === "ff_force") { o.visible = showMain && showArrows; }
            else if (et === "ff_vel") { o.visible = showMain && showV; }
            else if (ud.id === "ff_trail") { o.visible = showMain && showTrailMain; }
            else if (et === "ff_mass") { o.visible = showMass; }
            else if (ud.id === "ff_trail_light" || ud.id === "ff_trail_heavy") { o.visible = showMass; }
        }

        // Park the main charge + F arrow at the rest position for non-motion states.
        if (mode === "rest") {
            var fy = -ffSign;                 // +q → F down (E is down); −q → F up
            var rp = [0, 0.3, 0];
            var ch = ffFindById("ff_charge"); if (ch) ch.position.set(rp[0], rp[1], rp[2]);
            var ql = ffFindById("ff_q_lbl"); if (ql) ql.position.set(rp[0], rp[1] + 0.36, rp[2]);
            var fa = ffFindById("ff_f_arrow");
            if (fa) { fa.position.set(rp[0], rp[1], rp[2]); fa.setDirection(new THREE.Vector3(0, fy, 0)); fa.setLength(0.95, 0.24, 0.14); }
            var flb = ffFindById("ff_f_lbl"); if (flb) flb.position.set(rp[0] + 0.6, rp[1] + fy * 0.6, rp[2]);
        }
    }

    function refreshForceFieldExplorer() {
        var qS = document.getElementById("ff_q_slider");
        var eS = document.getElementById("ff_e_slider");
        var mS = document.getElementById("ff_m_slider");
        var scQ = (config.slider_controls && config.slider_controls.q) || {};
        var scE = (config.slider_controls && config.slider_controls.E) || {};
        var scM = (config.slider_controls && config.slider_controls.m) || {};
        var q = qS ? parseFloat(qS.value) : (scQ.default != null ? scQ.default : 5);
        var E = eS ? parseFloat(eS.value) : (scE.default != null ? scE.default : 5);
        var m = mS ? parseFloat(mS.value) : (scM.default != null ? scM.default : 5);
        var sign = ffSign;
        var F = q * E;                         // µN  (q[nC] × E[kN/C])
        var aRel = (q * E) / m;                // relative acceleration units

        // Drive the integrator (explorer mode reads these every frame).
        var aRef = (5 * 5) / 5;                // default reference (q=5,E=5,m=5) = 5
        ffExpAccel = Math.max(0.12, Math.min(1.6, 0.55 * (aRel / aRef)));
        ffExpFy = -sign;
        ffExpFLen = 0.45 + 1.25 * Math.tanh(0.5 * (F / 25));

        var qVal = document.getElementById("ff_q_val");
        var eVal = document.getElementById("ff_e_val");
        var mVal = document.getElementById("ff_m_val");
        var out = document.getElementById("ff_readout");
        if (qVal) qVal.textContent = (sign > 0 ? "+" : "\\u2212") + Math.round(q);
        if (eVal) eVal.textContent = String(Math.round(E));
        if (mVal) mVal.textContent = String(Math.round(m));
        if (out) out.innerHTML = "F = qE = " + F.toFixed(0) + " \\u00b5N<br>a = qE/m = " + aRel.toFixed(1);
    }

    function setupSliders() {
        var iSlider = document.getElementById("i_slider");
        var rSlider = document.getElementById("r_slider");
        if (!iSlider || !rSlider) return;

        // Apply slider_controls config to the input ranges if provided
        if (config.slider_controls) {
            if (config.slider_controls.I) {
                iSlider.min = String(config.slider_controls.I.min);
                iSlider.max = String(config.slider_controls.I.max);
                iSlider.step = String(config.slider_controls.I.step);
                iSlider.value = String(config.slider_controls.I.default);
            }
            if (config.slider_controls.r) {
                // r slider in cm — internal unit conversion handled in refresh
                rSlider.min = String(config.slider_controls.r.min * 100);
                rSlider.max = String(config.slider_controls.r.max * 100);
                rSlider.step = String(config.slider_controls.r.step * 100);
                rSlider.value = String(config.slider_controls.r.default * 100);
            }
        }

        iSlider.addEventListener("input", refreshSliderVisuals);
        rSlider.addEventListener("input", refreshSliderVisuals);

        // ── Diamond #4 (solenoid) slider wiring: B = μ₀ n I ──────────────────
        //   The default #sliders panel is wire-centric (I + r → B = μ₀I/2πr).
        //   A solenoid's field is B = μ₀ n I (independent of r), so for the
        //   solenoid_field scenario rebuild the panel with turn-density n and
        //   current I controls + an mT readout (solenoid B is ~1000× a wire's).
        if (config.scenario_type === "solenoid_field") {
            var solPanel = document.getElementById("sliders");
            if (solPanel) {
                var scN = (config.slider_controls && config.slider_controls.n) || {};
                var scI = (config.slider_controls && config.slider_controls.I) || {};
                var nDef = scN.default != null ? scN.default : 1000;
                var nMin = scN.min != null ? scN.min : 100;
                var nMax = scN.max != null ? scN.max : 5000;
                var nStep = scN.step != null ? scN.step : 100;
                var iDef = scI.default != null ? scI.default : 2;
                var iMin = scI.min != null ? scI.min : 0.1;
                var iMax = scI.max != null ? scI.max : 10;
                var iStep = scI.step != null ? scI.step : 0.1;
                solPanel.innerHTML =
                    '<label>n = <span id="sol_n_val">' + nDef + '</span> turns/m</label>' +
                    '<input type="range" id="sol_n_slider" min="' + nMin + '" max="' + nMax + '" step="' + nStep + '" value="' + nDef + '">' +
                    '<label>I = <span id="sol_i_val">' + iDef + '</span> A</label>' +
                    '<input type="range" id="sol_i_slider" min="' + iMin + '" max="' + iMax + '" step="' + iStep + '" value="' + iDef + '">' +
                    '<div id="b_readout">B = 0 mT</div>';
                var refreshSolenoidSliders = function () {
                    var nS = document.getElementById("sol_n_slider");
                    var iS = document.getElementById("sol_i_slider");
                    if (!nS || !iS) return;
                    var nv = parseFloat(nS.value);
                    var iv = parseFloat(iS.value);
                    var Bsol = MU_0 * nv * iv; // tesla
                    var nValEl = document.getElementById("sol_n_val");
                    var iValEl2 = document.getElementById("sol_i_val");
                    var bEl = document.getElementById("b_readout");
                    if (nValEl) nValEl.textContent = String(Math.round(nv));
                    if (iValEl2) iValEl2.textContent = iv.toFixed(1);
                    if (bEl) bEl.innerHTML = "B = " + (Bsol * 1000).toFixed(2) + " mT";
                };
                var solN = document.getElementById("sol_n_slider");
                var solI = document.getElementById("sol_i_slider");
                if (solN) solN.addEventListener("input", refreshSolenoidSliders);
                if (solI) solI.addEventListener("input", refreshSolenoidSliders);
                refreshSolenoidSliders();
            }
        }

        // ── Biot-Savart (STATE_10) slider wiring: I, r, θ → P / circle / dB ──
        //   The default panel is I + r only. Rebuild it with a θ control and a
        //   dB readout; all three drive refreshBiotExplorer (real physics).
        if (config.scenario_type === "biot_savart_element") {
            var biotPanel = document.getElementById("sliders");
            if (biotPanel) {
                var bsI = (config.slider_controls && config.slider_controls.I) || {};
                var bsR = (config.slider_controls && config.slider_controls.r) || {};
                var bsTh = (config.slider_controls && config.slider_controls.theta_deg) || {};
                var biIDef = bsI.default != null ? bsI.default : 5;
                var biIMin = bsI.min != null ? bsI.min : 0.5;
                var biIMax = bsI.max != null ? bsI.max : 20;
                var biIStep = bsI.step != null ? bsI.step : 0.5;
                var biRDef = (bsR.default != null ? bsR.default : 0.05) * 100;
                var biRMin = (bsR.min != null ? bsR.min : 0.02) * 100;
                var biRMax = (bsR.max != null ? bsR.max : 0.30) * 100;
                var biRStep = (bsR.step != null ? bsR.step : 0.01) * 100;
                var biThDef = bsTh.default != null ? bsTh.default : 90;
                var biThMin = bsTh.min != null ? bsTh.min : 30;
                var biThMax = bsTh.max != null ? bsTh.max : 150;
                var biThStep = bsTh.step != null ? bsTh.step : 5;
                biotPanel.innerHTML =
                    '<label>I = <span id="i_val">' + biIDef.toFixed(1) + '</span> A</label>' +
                    '<input type="range" id="i_slider" min="' + biIMin + '" max="' + biIMax + '" step="' + biIStep + '" value="' + biIDef + '">' +
                    '<label>d = <span id="r_val">' + Math.round(biRDef) + '</span> cm (\\u22a5 wire\\u2192P = circle radius)</label>' +
                    '<input type="range" id="r_slider" min="' + biRMin + '" max="' + biRMax + '" step="' + biRStep + '" value="' + biRDef + '">' +
                    '<label>\\u03b8 = <span id="theta_val">' + Math.round(biThDef) + '</span>\\u00b0 (dl, r\\u0302)</label>' +
                    '<input type="range" id="theta_slider" min="' + biThMin + '" max="' + biThMax + '" step="' + biThStep + '" value="' + biThDef + '">' +
                    '<div id="b_readout">B = 0 \\u03bcT</div>' +
                    '<div id="rtrue_readout">r (dl\\u2192P) = 0 cm</div>' +
                    '<div id="db_readout">dB = 0 \\u03bcT</div>';
                var biiEl = document.getElementById("i_slider");
                var birEl = document.getElementById("r_slider");
                var bithEl = document.getElementById("theta_slider");
                if (biiEl) biiEl.addEventListener("input", refreshBiotExplorer);
                if (birEl) birEl.addEventListener("input", refreshBiotExplorer);
                if (bithEl) bithEl.addEventListener("input", refreshBiotExplorer);
                refreshBiotExplorer();
            }
        }

        // ── Electric point-charge explorer (STATE_7): Q, sign, r → E = kQ/r² ──
        //   Rebuild the #sliders panel with a charge slider, a sign-flip button,
        //   and a distance slider; all drive refreshElectricExplorer (real physics).
        if (config.electric_explorer) {
            var ecPanel = document.getElementById("sliders");
            if (ecPanel) {
                var ecQ = (config.slider_controls && config.slider_controls.Q) || {};
                var ecR = (config.slider_controls && config.slider_controls.r) || {};
                var qDef = ecQ.default != null ? ecQ.default : 5;
                var qMin = ecQ.min != null ? ecQ.min : 1;
                var qMax = ecQ.max != null ? ecQ.max : 10;
                var qStep = ecQ.step != null ? ecQ.step : 1;
                var rDef = (ecR.default != null ? ecR.default : 0.05) * 100;
                var rMin = (ecR.min != null ? ecR.min : 0.02) * 100;
                var rMax = (ecR.max != null ? ecR.max : 0.20) * 100;
                var rStep = (ecR.step != null ? ecR.step : 0.01) * 100;
                ecPanel.innerHTML =
                    '<label>Q = <span id="ec_q_val">+' + Math.round(qDef) + '</span> nC</label>' +
                    '<input type="range" id="ec_q_slider" min="' + qMin + '" max="' + qMax + '" step="' + qStep + '" value="' + qDef + '">' +
                    '<button id="ec_sign_toggle" style="margin:6px 0;padding:4px 10px;cursor:pointer;border-radius:4px;border:1px solid #555;background:#222;color:#eee;">flip sign (+/\\u2212)</button>' +
                    '<label>r = <span id="ec_r_val">' + Math.round(rDef) + '</span> cm</label>' +
                    '<input type="range" id="ec_r_slider" min="' + rMin + '" max="' + rMax + '" step="' + rStep + '" value="' + rDef + '">' +
                    '<div id="ec_e_readout">E = 0 N/C</div>';
                var ecQS = document.getElementById("ec_q_slider");
                var ecRS = document.getElementById("ec_r_slider");
                var ecToggle = document.getElementById("ec_sign_toggle");
                if (ecQS) ecQS.addEventListener("input", refreshElectricExplorer);
                if (ecRS) ecRS.addEventListener("input", refreshElectricExplorer);
                if (ecToggle) ecToggle.addEventListener("click", function () {
                    setElectricPolarity(electricSign > 0 ? -1 : 1);
                    refreshElectricExplorer();
                });
                refreshElectricExplorer();
            }
        }

        // ── Uniform-field force explorer (STATE_7): q, sign, E, m → F = qE, a = qE/m ──
        //   Rebuild the #sliders panel with charge / field / mass sliders + a
        //   sign-flip button; all drive refreshForceFieldExplorer (real F = qE,
        //   a = qE/m) and the animate-loop parabola.
        if (config.force_field_explorer) {
            var ffPanel = document.getElementById("sliders");
            if (ffPanel) {
                var sQ = (config.slider_controls && config.slider_controls.q) || {};
                var sE = (config.slider_controls && config.slider_controls.E) || {};
                var sM = (config.slider_controls && config.slider_controls.m) || {};
                var qD = sQ.default != null ? sQ.default : 5, qMn = sQ.min != null ? sQ.min : 1, qMx = sQ.max != null ? sQ.max : 10, qSt = sQ.step != null ? sQ.step : 1;
                var eD = sE.default != null ? sE.default : 5, eMn = sE.min != null ? sE.min : 1, eMx = sE.max != null ? sE.max : 10, eSt = sE.step != null ? sE.step : 1;
                var mD = sM.default != null ? sM.default : 5, mMn = sM.min != null ? sM.min : 1, mMx = sM.max != null ? sM.max : 10, mSt = sM.step != null ? sM.step : 1;
                ffPanel.innerHTML =
                    '<label>q = <span id="ff_q_val">+' + Math.round(qD) + '</span> nC</label>' +
                    '<input type="range" id="ff_q_slider" min="' + qMn + '" max="' + qMx + '" step="' + qSt + '" value="' + qD + '">' +
                    '<button id="ff_sign_toggle" style="margin:6px 0;padding:4px 10px;cursor:pointer;border-radius:4px;border:1px solid #555;background:#222;color:#eee;">flip sign (+/\\u2212)</button>' +
                    '<label>E = <span id="ff_e_val">' + Math.round(eD) + '</span> kN/C</label>' +
                    '<input type="range" id="ff_e_slider" min="' + eMn + '" max="' + eMx + '" step="' + eSt + '" value="' + eD + '">' +
                    '<label>m = <span id="ff_m_val">' + Math.round(mD) + '</span> units</label>' +
                    '<input type="range" id="ff_m_slider" min="' + mMn + '" max="' + mMx + '" step="' + mSt + '" value="' + mD + '">' +
                    '<div id="ff_readout">F = qE<br>a = qE/m</div>';
                var ffQS = document.getElementById("ff_q_slider");
                var ffES = document.getElementById("ff_e_slider");
                var ffMS = document.getElementById("ff_m_slider");
                var ffTog = document.getElementById("ff_sign_toggle");
                if (ffQS) ffQS.addEventListener("input", refreshForceFieldExplorer);
                if (ffES) ffES.addEventListener("input", refreshForceFieldExplorer);
                if (ffMS) ffMS.addEventListener("input", refreshForceFieldExplorer);
                if (ffTog) ffTog.addEventListener("click", function () {
                    ffSign = (ffSign > 0 ? -1 : 1);
                    refreshForceFieldExplorer();
                });
                refreshForceFieldExplorer();
            }
        }

        // ── Diamond #2 (Lorentz force) slider wiring ─────────────────────
        // The q-toggle is a click-to-flip button (not a range input). v/B/θ
        // are range inputs that update their span labels and trigger a redraw
        // of the F readout (also recomputed in the animate loop while the
        // Lorentz block is active — the readout has two write paths because
        // the user may release the slider while a state is still rendering).
        var qToggle = document.getElementById("q_toggle");
        var vSliderL = document.getElementById("v_slider");
        var bSliderL = document.getElementById("b_slider");
        var thetaSliderL = document.getElementById("theta_slider");
        if (qToggle && vSliderL && bSliderL && thetaSliderL) {
            // Apply slider_controls config to defaults if provided
            if (config.slider_controls) {
                if (config.slider_controls.v) {
                    vSliderL.min = String(config.slider_controls.v.min / 1e5);
                    vSliderL.max = String(config.slider_controls.v.max / 1e5);
                    vSliderL.step = String((config.slider_controls.v.step || 1e4) / 1e5);
                    vSliderL.value = String(config.slider_controls.v.default / 1e5);
                }
                if (config.slider_controls.B) {
                    bSliderL.min = String(config.slider_controls.B.min * 1000);
                    bSliderL.max = String(config.slider_controls.B.max * 1000);
                    bSliderL.step = String((config.slider_controls.B.step || 0.001) * 1000);
                    bSliderL.value = String(config.slider_controls.B.default * 1000);
                }
                if (config.slider_controls.theta_deg) {
                    thetaSliderL.min = String(config.slider_controls.theta_deg.min);
                    thetaSliderL.max = String(config.slider_controls.theta_deg.max);
                    thetaSliderL.step = String(config.slider_controls.theta_deg.step || 1);
                    thetaSliderL.value = String(config.slider_controls.theta_deg.default);
                }
                if (config.slider_controls.q_sign) {
                    qToggle.textContent = config.slider_controls.q_sign.default > 0 ? "+e" : "−e";
                    qToggle.classList.toggle("neg", config.slider_controls.q_sign.default < 0);
                }
            }

            function refreshLorentzLabels() {
                var vVal = document.getElementById("v_val");
                var bVal = document.getElementById("b_val");
                var thetaVal = document.getElementById("theta_val");
                if (vVal) vVal.textContent = parseFloat(vSliderL.value).toFixed(1);
                if (bVal) bVal.textContent = parseFloat(bSliderL.value).toFixed(0);
                if (thetaVal) thetaVal.textContent = parseFloat(thetaSliderL.value).toFixed(0);
                // Mutate the current state's theta_deg and charge_sign so the
                // animate loop picks them up (only when in a sliders-enabled
                // state in the Lorentz scenario — without the scenario guard
                // this scribbles the torque-loop config's theta_deg too).
                if (config.scenario_type !== "lorentz_force_uniform_field") return;
                var stateDefS = config.states[PM_currentState];
                if (stateDefS && stateDefS.show_sliders) {
                    stateDefS.theta_deg = parseFloat(thetaSliderL.value);
                    stateDefS.charge_sign = qToggle.textContent === "+e" ? 1 : -1;
                    // Any slider edit invalidates the existing trail — wipe
                    // it so the student sees the new orbit cleanly instead
                    // of the old curve plus the new curve smeared together.
                    lorentzTrailResetPending = true;
                }
            }

            vSliderL.addEventListener("input", refreshLorentzLabels);
            bSliderL.addEventListener("input", refreshLorentzLabels);
            thetaSliderL.addEventListener("input", refreshLorentzLabels);
            qToggle.addEventListener("click", function() {
                var nowPos = qToggle.textContent === "+e";
                qToggle.textContent = nowPos ? "−e" : "+e";
                qToggle.classList.toggle("neg", nowPos);
                refreshLorentzLabels();
            });
            refreshLorentzLabels();
        }

        // ── Diamond #3 (torque on current loop) slider wiring ────────────
        // Four range inputs: N, I, B, θ. The θ slider directly rotates the
        // loop via applyTorqueLoopTheta (matches SET_LOOP_ANGLE). N, I, B
        // are read by the per-frame μ/τ-arrow scaling in
        // updateTorqueLoopFrame. τ readout shows τ = N·I·A·B·|sinθ| in μN·m.
        var nTorque = document.getElementById("n_torque_slider");
        var iTorque = document.getElementById("i_torque_slider");
        var bTorque = document.getElementById("b_torque_slider");
        var thetaTorque = document.getElementById("theta_torque_slider");
        if (nTorque && iTorque && bTorque && thetaTorque) {
            if (config.slider_controls) {
                if (config.slider_controls.N) {
                    nTorque.min = String(config.slider_controls.N.min);
                    nTorque.max = String(config.slider_controls.N.max);
                    nTorque.step = String(config.slider_controls.N.step);
                    nTorque.value = String(config.slider_controls.N.default);
                }
                if (config.slider_controls.I) {
                    iTorque.min = String(config.slider_controls.I.min);
                    iTorque.max = String(config.slider_controls.I.max);
                    iTorque.step = String(config.slider_controls.I.step);
                    iTorque.value = String(config.slider_controls.I.default);
                }
                if (config.slider_controls.B) {
                    bTorque.min = String(config.slider_controls.B.min);
                    bTorque.max = String(config.slider_controls.B.max);
                    bTorque.step = String(config.slider_controls.B.step);
                    bTorque.value = String(config.slider_controls.B.default);
                }
                if (config.slider_controls.theta_deg) {
                    thetaTorque.min = String(config.slider_controls.theta_deg.min);
                    thetaTorque.max = String(config.slider_controls.theta_deg.max);
                    thetaTorque.step = String(config.slider_controls.theta_deg.step);
                    thetaTorque.value = String(config.slider_controls.theta_deg.default);
                }
            }

            function refreshTorqueLabels() {
                var nVal = document.getElementById("n_torque_val");
                var iVal = document.getElementById("i_torque_val");
                var bVal = document.getElementById("b_torque_val");
                var thVal = document.getElementById("theta_torque_val");
                var tauReadout = document.getElementById("tau_readout");

                var n = parseFloat(nTorque.value);
                var i = parseFloat(iTorque.value);
                var b = parseFloat(bTorque.value);
                var th = parseFloat(thetaTorque.value);

                if (nVal) nVal.textContent = n.toFixed(0);
                if (iVal) iVal.textContent = i.toFixed(2);
                if (bVal) bVal.textContent = b.toFixed(2);
                if (thVal) thVal.textContent = th.toFixed(0);

                var lgT = findTorqueLoopGroup();
                if (lgT) {
                    lgT.userData.slider_N = n;
                    lgT.userData.slider_I = i;
                    lgT.userData.slider_B = b;
                    lgT.userData.slider_theta_deg = th;
                    // θ slider takes direct rotation control — switch to
                    // manual mode and apply immediately.
                    lgT.userData.rotation_mode = "manual";
                    applyTorqueLoopTheta(lgT, th);
                }

                // τ = N·I·A·B·|sinθ| in N·m → display in μN·m for legibility.
                // A = L² with L from slider_controls.L_side.default (slider
                // not exposed in V1.0 sandbox — only the four primary knobs).
                var Lside = (config.slider_controls && config.slider_controls.L_side
                            && typeof config.slider_controls.L_side.default === "number")
                            ? config.slider_controls.L_side.default : 0.1;
                var area = Lside * Lside;
                var tauNm = n * i * area * b * Math.abs(Math.sin(th * Math.PI / 180));
                var tauUNm = tauNm * 1e6;
                if (tauReadout) tauReadout.textContent = "τ = " + tauUNm.toFixed(2) + " μN·m";
            }

            nTorque.addEventListener("input", refreshTorqueLabels);
            iTorque.addEventListener("input", refreshTorqueLabels);
            bTorque.addEventListener("input", refreshTorqueLabels);
            thetaTorque.addEventListener("input", refreshTorqueLabels);
            refreshTorqueLabels();
        }

        // ── force_on_current_wire slider wiring ──────────────────────────
        // Four range inputs (I, L, B, θ) + a flip-current button. The F
        // readout = B·I·L·sinθ (Newtons). The animate loop reads the slider
        // values + fcwCurrentDir directly to recompute the live F arrow, so
        // these handlers only need to update the labels + readout.
        var fcwI = document.getElementById("fcw_i_slider");
        var fcwL = document.getElementById("fcw_l_slider");
        var fcwB = document.getElementById("fcw_b_slider");
        var fcwTheta = document.getElementById("fcw_theta_slider");
        var fcwDirToggle = document.getElementById("fcw_dir_toggle");
        if (fcwI && fcwL && fcwB && fcwTheta) {
            if (config.slider_controls) {
                if (config.slider_controls.I) {
                    fcwI.min = String(config.slider_controls.I.min);
                    fcwI.max = String(config.slider_controls.I.max);
                    fcwI.step = String(config.slider_controls.I.step);
                    fcwI.value = String(config.slider_controls.I.default);
                }
                if (config.slider_controls.L) {
                    fcwL.min = String(config.slider_controls.L.min);
                    fcwL.max = String(config.slider_controls.L.max);
                    fcwL.step = String(config.slider_controls.L.step != null ? config.slider_controls.L.step : 0.1);
                    fcwL.value = String(config.slider_controls.L.default);
                }
                if (config.slider_controls.B) {
                    fcwB.min = String(config.slider_controls.B.min);
                    fcwB.max = String(config.slider_controls.B.max);
                    fcwB.step = String(config.slider_controls.B.step != null ? config.slider_controls.B.step : 0.1);
                    fcwB.value = String(config.slider_controls.B.default);
                }
                if (config.slider_controls.theta_deg) {
                    fcwTheta.min = String(config.slider_controls.theta_deg.min);
                    fcwTheta.max = String(config.slider_controls.theta_deg.max);
                    fcwTheta.step = String(config.slider_controls.theta_deg.step != null ? config.slider_controls.theta_deg.step : 1);
                    fcwTheta.value = String(config.slider_controls.theta_deg.default);
                }
            }

            function refreshFcwLabels() {
                var iVal = document.getElementById("fcw_i_val");
                var lVal = document.getElementById("fcw_l_val");
                var bVal = document.getElementById("fcw_b_val");
                var thVal = document.getElementById("fcw_theta_val");
                var fReadout = document.getElementById("fcw_f_readout");
                var Iv = parseFloat(fcwI.value);
                var Lv = parseFloat(fcwL.value);
                var Bv = parseFloat(fcwB.value);
                var thv = parseFloat(fcwTheta.value);
                if (iVal) iVal.textContent = Iv.toFixed(1);
                if (lVal) lVal.textContent = Lv.toFixed(1);
                if (bVal) bVal.textContent = Bv.toFixed(1);
                if (thVal) thVal.textContent = thv.toFixed(0);
                // Mutate the active state's theta_deg so the animate loop + the
                // angle arcs follow the slider (scenario-guarded).
                if (config.scenario_type === "force_on_current_wire") {
                    var sd = config.states[PM_currentState];
                    if (sd && sd.show_sliders) sd.theta_deg = thv;
                }
                var Fn = Bv * Iv * Lv * Math.sin(thv * Math.PI / 180);
                if (fReadout) fReadout.textContent = "F = " + Fn.toFixed(2) + " N";
            }

            fcwI.addEventListener("input", refreshFcwLabels);
            fcwL.addEventListener("input", refreshFcwLabels);
            fcwB.addEventListener("input", refreshFcwLabels);
            fcwTheta.addEventListener("input", refreshFcwLabels);
            if (fcwDirToggle) {
                fcwDirToggle.addEventListener("click", function() {
                    fcwCurrentDir = -fcwCurrentDir;
                    fcwDirToggle.classList.toggle("reversed", fcwCurrentDir < 0);
                    fcwDirToggle.textContent = fcwCurrentDir < 0 ? "Flip current \\u2190" : "Flip current \\u2192";
                });
            }
            refreshFcwLabels();
        }
    }

    // ── Animation loop ────────────────────────────────────────────────────
    var time = 0;
    function animate() {
        animationId = requestAnimationFrame(animate);
        // SET_TIME_FREEZE pin-by-target: advance virtual time normally until
        // the pin, then hold — never jump, so per-frame accumulators (particle
        // trail, slow_rotation integration) build the exact same frame count
        // every run → deterministic pixels for regression baselines.
        var heldAtPin = false;
        if (freezeAtTime !== null && time + 0.016 >= freezeAtTime) {
            time = freezeAtTime;
            heldAtPin = true;
        } else {
            time += 0.016;
        }

        // Visual-validator capture hook: expose the renderer's SIM-TIME clock
        // (state-local ms) so the headless screenshotter can poll for reveals
        // to actually fire instead of guessing on wall-clock (rAF is throttled
        // in headless → sim-time lags wall-clock → false negatives). Set every
        // frame incl. while frozen, where time === freezeAtTime, so the poller
        // can terminate at the pin. Compares directly to reveal_at_ms / the
        // SET_TIME_FREEZE at_ms offset.
        window.PM_simTimeMs = (time - stateStartTime) * 1000;

        lerpSpherical();

        // Diamond #3 — torque-loop rotation + τ-arrow scaling + TTS glow.
        if (config.scenario_type === "torque_on_loop_uniform_field") {
            // slow_rotation integrates by dt independent of the time var —
            // pass 0 while held at the pin so the loop angle freezes too.
            updateTorqueLoopFrame(heldAtPin ? 0 : 0.016);
            applyTorqueLoopGlow();
        }

        // Electric diamond STATE_5 — the density↔strength aha, in motion.
        // A probe sweeps radially out and back; its E-arrow shrinks as kQ/r²
        // (strength), and the field lines around it brighten where they crowd
        // (dense near → sparse far, the lit reach shrinking ∝ 1/distance). Density
        // and strength fall together — the aha is shown, not just narrated.
        if (config.electric_explorer && PM_currentState === "STATE_5") {
            var tt5 = time - stateStartTime;
            var per5 = 5.0;                              // 5s out-and-back loop
            var ph5 = (tt5 % per5) / per5;               // 0..1
            var tri5 = ph5 < 0.5 ? ph5 * 2 : 2 - ph5 * 2;
            var sm5 = tri5 * tri5 * (3 - 2 * tri5);       // smoothstep ease
            var nearX5 = 0.7, farX5 = 3.2;
            var px5 = nearX5 + (farX5 - nearX5) * sm5;
            var rel5 = (nearX5 * nearX5) / (px5 * px5);   // 1 near → ~0.05 far (∝ 1/r²)
            var pulse5 = 0.82 + 0.18 * Math.sin(tt5 * 4);

            var ecProbe = ecFindById("ec_probe");
            if (ecProbe) ecProbe.position.set(px5, 0, 0);
            var ecPArr = ecFindById("ec_probe_arrow");
            var aLen5 = 0.3 + 1.8 * rel5;
            if (ecPArr) {
                ecPArr.position.set(px5, 0, 0);
                ecPArr.setDirection(new THREE.Vector3(1, 0, 0));
                ecPArr.setLength(aLen5, Math.min(0.34, 0.26 * aLen5), Math.min(0.2, 0.16 * aLen5));
            }
            var ecPLbl5 = ecFindById("ec_probe_E_lbl");
            if (ecPLbl5) ecPLbl5.position.set(px5 + aLen5 + 0.3, 0.22, 0);

            // Crowd spotlight: brighten +Q field lines within the probe's angular
            // reach (atan(reach/distance) → shrinks with distance → many lit near,
            // few far). This is the field-line density made visible, in motion.
            var reach5 = Math.atan2(0.95, px5);
            for (var li5 = 0; li5 < sceneObjects.length; li5++) {
                var lo5 = sceneObjects[li5];
                var lud5 = lo5.userData;
                if (!lud5 || lud5.elementType !== "field_line" || !lud5.id) continue;
                if (lud5.id.indexOf("fl_q_plus") !== 0 || !lud5.unitDir || !lo5.material) continue;
                var ang5 = Math.acos(Math.max(-1, Math.min(1, lud5.unitDir[0])));
                lo5.material.opacity = (ang5 < reach5) ? (0.95 * pulse5) : 0.12;
            }
        }

        // Uniform-field force diamond (force_on_charge_in_field) — per-frame
        // motion. Constant force F = qE → constant acceleration a = qE/m.
        // STATE_4 straight drop, STATE_5 sideways launch → PARABOLA (the gravity
        // analogy, PRIMARY aha), STATE_6 same F / different mass, STATE_7
        // slider-driven. Driven by the state clock (Rule 26), never TTS.
        if (config.scenario_type === "uniform_field_force") {
            var ffSt = config.states[PM_currentState] || {};
            var ffMode = ffSt.motion_mode || "rest";
            var ffTL = time - stateStartTime;

            var ffPush = function (trailObj, x, y, z) {
                var ud = trailObj.userData; var maxP = ud.max_points;
                var attr = trailObj.geometry.getAttribute("position");
                var wi = ud.write_index || 0;
                if (wi >= maxP) return;
                attr.array[wi * 3] = x; attr.array[wi * 3 + 1] = y; attr.array[wi * 3 + 2] = z;
                ud.write_index = wi + 1; ud.filled = ud.write_index;
                trailObj.geometry.setDrawRange(0, ud.filled);
                attr.needsUpdate = true;
            };
            var ffResetTrail = function (trailObj) {
                if (!trailObj) return;
                trailObj.userData.write_index = 0; trailObj.userData.filled = 0;
                trailObj.geometry.setDrawRange(0, 0);
            };

            if (ffMode === "accelerate_straight" || ffMode === "launch_parabola" || ffMode === "explorer") {
                var aVis, vx, startX, fy, fLen;
                if (ffMode === "explorer") {
                    aVis = ffExpAccel; vx = 1.15; startX = -1.7; fy = ffExpFy; fLen = ffExpFLen;
                } else if (ffMode === "launch_parabola") {
                    aVis = 0.55; vx = 1.2; startX = -1.7; fy = -ffSign; fLen = 0.95;
                } else {
                    aVis = 1.6; vx = 0; startX = 0; fy = -ffSign; fLen = 0.95;
                }
                var startY = (fy < 0) ? 1.15 : -1.15;     // start near the plate the charge moves away from
                var period = (ffMode === "accelerate_straight") ? 3.4 : 4.4;
                var ph = ffTL % period;
                var tr = ffFindById("ff_trail");
                if (tr) {
                    if (ph < (tr.userData.ff_last_phase || 0)) ffResetTrail(tr);
                    tr.userData.ff_last_phase = ph;
                }
                var rawX = startX + vx * ph;
                var rawY = startY + fy * 0.5 * aVis * ph * ph;
                var cy = Math.max(FF_BOT_Y + 0.18, Math.min(FF_TOP_Y - 0.18, rawY));
                var cx = Math.max(-1.85, Math.min(1.85, rawX));
                var moving = (cy === rawY) && (cx === rawX);

                var ch = ffFindById("ff_charge");
                if (ch) ch.position.set(cx, cy, 0);
                var ql = ffFindById("ff_q_lbl"); if (ql) ql.position.set(cx, cy + 0.36, 0);
                var fa = ffFindById("ff_f_arrow");
                if (fa) { fa.position.set(cx, cy, 0); fa.setDirection(new THREE.Vector3(0, fy, 0)); fa.setLength(fLen, 0.24, 0.14); }
                var flb = ffFindById("ff_f_lbl"); if (flb) flb.position.set(cx + 0.62, cy + fy * 0.5, 0);

                var vyc = fy * aVis * ph;                  // dy/dt
                var sp = Math.sqrt(vx * vx + vyc * vyc);
                var va = ffFindById("ff_v_arrow");
                if (va && sp > 1e-4) {
                    va.position.set(cx, cy, 0);
                    va.setDirection(new THREE.Vector3(vx / sp, vyc / sp, 0));
                    va.setLength(Math.min(1.4, 0.35 + 0.55 * sp), 0.22, 0.12);
                }
                var vlb = ffFindById("ff_v_lbl");
                if (vlb && sp > 1e-4) vlb.position.set(cx + (vx / sp) * 1.05 + 0.12, cy + (vyc / sp) * 0.6 + 0.34, 0);

                if (moving && tr) ffPush(tr, cx, cy, 0);
            } else if (ffMode === "launch_parabola_multimass") {
                var periodM = 4.4;
                var phM = ffTL % periodM;
                var fyM = -ffSign;
                var startYM = (fyM < 0) ? 1.15 : -1.15;
                var vxM = 1.2, startXM = -1.7;
                var defsM = [
                    { id: "ff_charge", trail: "ff_trail", a: 0.55, lbl: null },
                    { id: "ff_charge_light", trail: "ff_trail_light", a: 0.95, lbl: "ff_light_lbl" },
                    { id: "ff_charge_heavy", trail: "ff_trail_heavy", a: 0.30, lbl: "ff_heavy_lbl" }
                ];
                for (var mI = 0; mI < defsM.length; mI++) {
                    var dM = defsM[mI];
                    var trM = ffFindById(dM.trail);
                    if (trM && phM < (trM.userData.ff_last_phase || 0)) ffResetTrail(trM);
                    var rxM = startXM + vxM * phM;
                    var ryM = startYM + fyM * 0.5 * dM.a * phM * phM;
                    var cyM = Math.max(FF_BOT_Y + 0.18, Math.min(FF_TOP_Y - 0.18, ryM));
                    var cxM = Math.max(-1.85, Math.min(1.85, rxM));
                    var movM = (cyM === ryM) && (cxM === rxM);
                    var chM = ffFindById(dM.id); if (chM) chM.position.set(cxM, cyM, 0);
                    if (dM.lbl) { var lblM = ffFindById(dM.lbl); if (lblM) lblM.position.set(cxM - 0.62, cyM + 0.12, 0); }
                    if (movM && trM) ffPush(trM, cxM, cyM, 0);
                    if (trM) trM.userData.ff_last_phase = phM;
                }
            }
        }

        // Animate dynamic extras (compass swing, hand pulse, point pulse)
        for (var di = 0; di < dynamicExtras.length; di++) {
            var dx = dynamicExtras[di];
            var dud = dx.userData;
            if (!dud) continue;
            if (dud.elementType === "compass") {
                // Approach animation: glide compass position from approach_from
                // to position_world over approach_duration_ms before any
                // needle deflection happens. Runs even if animate_swing is off.
                if (dud.approach_from && dud.approach_progress < 1) {
                    var nowA = performance.now();
                    if (dud.approach_started_at > 0 && nowA >= dud.approach_started_at) {
                        var elapsedA = (nowA - dud.approach_started_at) / (dud.approach_duration_ms || 1200);
                        var tA = Math.min(1, elapsedA);
                        var easedA = 1 - Math.pow(1 - tA, 3); // easeOutCubic
                        var sx = dud.approach_from[0], sy = dud.approach_from[1], sz = dud.approach_from[2];
                        var ex = dud.position_world[0], ey = dud.position_world[1], ez = dud.position_world[2];
                        dx.position.set(
                            sx + (ex - sx) * easedA,
                            sy + (ey - sy) * easedA,
                            sz + (ez - sz) * easedA
                        );
                        dud.approach_progress = tA;
                    }
                }
            }
            if (dud.elementType === "compass" && dud.animate_swing && dud.needleGroup) {
                // Compute the physics-correct equilibrium direction the needle
                // should swing to:
                //   - For straight_wire_current: B at the compass position
                //     follows Biot-Savart's right-hand rule, B_hat = I_hat × r_hat,
                //     where r_hat is the perpendicular unit vector from the wire
                //     (Y-axis) to the compass. Sign of I from the active state's
                //     current_direction_indicator ('up' = +Y, 'down' = -Y).
                //   - For other scenarios, fall back to the legacy hardcoded -90°
                //     (matches Oersted's classic east-deflection in earlier states).
                if (dud.target_angle_rad == null) {
                    var stateDefC = config.states[PM_currentState] || {};
                    var iSign = (stateDefC.current_direction_indicator === "down") ? -1 :
                                (stateDefC.current_direction_indicator === "up") ? 1 : 1;
                    if (config.scenario_type === "straight_wire_current") {
                        var pos = dud.position_world || [0, 0, 0];
                        var rPerp = new THREE.Vector3(pos[0], 0, pos[2]);
                        if (rPerp.length() > 0.001) {
                            rPerp.normalize();
                            var ihat = new THREE.Vector3(0, iSign, 0);
                            var bDir = new THREE.Vector3().crossVectors(ihat, rPerp).normalize();
                            // Default needle "north" is +Z. atan2(x, z) gives the
                            // signed Y-axis rotation angle that takes +Z to bDir.
                            dud.target_angle_rad = Math.atan2(bDir.x, bDir.z);
                        } else {
                            dud.target_angle_rad = -Math.PI / 2;
                        }
                    } else {
                        dud.target_angle_rad = -Math.PI / 2; // legacy default
                    }
                }
                var now = performance.now();
                if (dud.swing_started_at > 0 && now >= dud.swing_started_at) {
                    var elapsed = (now - dud.swing_started_at) / 2000; // 2s sweep
                    var easeT = Math.min(1, elapsed);
                    var eased = 1 - Math.pow(1 - easeT, 3); // easeOutCubic
                    dud.current_angle = dud.target_angle_rad * eased;
                    dud.needleGroup.rotation.y = dud.current_angle;
                }
            }
            if (dud.elementType === "right_hand" && dud.animate_curl) {
                // Subtle pulse: scale fingers slightly to draw the eye
                var pulse = 1 + 0.04 * Math.sin(time * 2.5);
                for (var ci = 0; ci < dx.children.length; ci++) {
                    var ch = dx.children[ci];
                    if (ch.userData && typeof ch.userData.fingerIndex === "number") {
                        ch.scale.set(pulse, 1, pulse);
                    }
                }
            }
            if (dud.elementType === "solenoid_grip_hand") {
                // Curl the articulated fingers open → fist, hold, then release and
                // repeat. curlT is a PURE function of (time - stateStartTime) so
                // SET_TIME_FREEZE pins it deterministically. By ~1.3s the fist is
                // closed and holds, so the reveal-time capture (default 1500ms)
                // photographs the closed fist.
                var gT = time - stateStartTime;
                var gPeriod = 6.5;
                var gtc = gT % gPeriod;
                var gcurl;
                if (gtc < 1.3) { var gu = gtc / 1.3; gcurl = gu * gu * (3 - 2 * gu); }
                else if (gtc < 5.2) { gcurl = 1; }
                else { var gu2 = (gtc - 5.2) / 1.3; gcurl = 1 - gu2 * gu2 * (3 - 2 * gu2); }
                var gTubes = dud.finger_tubes || [];
                var gKnu = dud.finger_knuckles || [];
                var gNails = dud.finger_nails || [];
                for (var gfi = 0; gfi < gTubes.length; gfi++) {
                    var gjoints = rhrFingerJoints(gfi, dud.sc, gcurl, dud.curlSign);
                    var gt = gTubes[gfi];
                    gt.geometry.dispose();
                    gt.geometry = new THREE.TubeGeometry(
                        new THREE.CatmullRomCurve3(gjoints), 24, dud.seg_tube_r, 12, false
                    );
                    var gks = gKnu[gfi] || [];
                    for (var gkk = 0; gkk < gks.length; gkk++) {
                        if (gks[gkk]) gks[gkk].position.copy(gjoints[gkk]);
                    }
                    if (gNails[gfi]) gNails[gfi].position.copy(gjoints[3]);
                }
            }
            if (dud.elementType === "highlighted_point" && dud.pulse) {
                var p = 1 + 0.15 * Math.sin(time * 3);
                dx.scale.set(p, p, p);
            }
        }

        // Animate moving magnet in changing_flux scenario
        var stateDef = config.states[PM_currentState];
        if (config.scenario_type === "changing_flux" && stateDef && stateDef.animate) {
            for (var i = 0; i < sceneObjects.length; i++) {
                var obj = sceneObjects[i];
                if (obj.userData && obj.userData.elementType === "magnet") {
                    obj.position.z = 3 + Math.sin(time * 1.5) * 2;
                }
                if (obj.userData && obj.userData.elementType === "magnet_south_half") {
                    obj.position.z = 3 + Math.sin(time * 1.5) * 2 - 0.375;
                }
                if (obj.userData && obj.userData.elementType === "emf_indicator") {
                    var emfIntensity = Math.abs(Math.cos(time * 1.5));
                    obj.material.emissiveIntensity = 0.2 + emfIntensity * 0.8;
                    obj.material.opacity = 0.3 + emfIntensity * 0.7;
                }
            }
        }

        // straight_wire_current scenario:
        //   1. Orbit field-line arrows around the wire's Y-axis (sense from
        //      stateDef.field_rotation_direction). Tubes are closed loops so
        //      they don't need rotation — rotating an arrow on a circle gives
        //      the visual "flow" the user sees as B-field motion.
        //   2. Animate yellow current_dot spheres along the wire to visualize
        //      the conventional current direction (stateDef.current_direction_indicator).
        if (config.scenario_type === "straight_wire_current" && stateDef) {
            var rotDirSign = stateDef.field_rotation_direction === "cw" ? -1 :
                             stateDef.field_rotation_direction === "ccw" ? 1 : 0;
            var rotRate = 0.6; // radians/second
            var curDirSign = stateDef.current_direction_indicator === "down" ? -1 :
                             stateDef.current_direction_indicator === "up" ? 1 : 0;
            var dotSpeed = 0.55; // wire-units per second along the 5-unit visible span

            for (var swi = 0; swi < sceneObjects.length; swi++) {
                var swObj = sceneObjects[swi];
                var swUd = swObj.userData;
                if (!swUd) continue;

                if (swUd.elementType === "arrow" && swUd.flowRadius != null && rotDirSign !== 0 && swObj.visible) {
                    var ang = (swUd.flowAngleOffset || 0) + time * rotRate * rotDirSign;
                    swObj.position.set(
                        swUd.flowRadius * Math.cos(ang),
                        swUd.flowHeight,
                        swUd.flowRadius * Math.sin(ang)
                    );
                    // Tangent direction along the circle, sense follows rotDirSign so
                    // arrowhead always points "downstream" of the rotation.
                    var tx = -Math.sin(ang) * rotDirSign;
                    var tz =  Math.cos(ang) * rotDirSign;
                    var qup = new THREE.Vector3(0, 1, 0);
                    var qdir = new THREE.Vector3(tx, 0, tz).normalize();
                    var arrowQuat = new THREE.Quaternion();
                    arrowQuat.setFromUnitVectors(qup, qdir);
                    swObj.setRotationFromQuaternion(arrowQuat);
                }

                if (swUd.elementType === "current_dot") {
                    if (curDirSign === 0) {
                        swObj.visible = false;
                    } else {
                        swObj.visible = true;
                        var dotCount = swUd.dotCount || 6;
                        var phase = (swUd.dotIndex || 0) / dotCount;
                        var loopT = ((time * dotSpeed) + phase) % 1;
                        // Up-flow: y goes -2.5 → +2.5; Down-flow: y goes +2.5 → -2.5
                        swObj.position.y = curDirSign > 0 ? (-2.5 + loopT * 5) : (2.5 - loopT * 5);
                    }
                }
            }
        }

        // ── Diamond #4 STATE_1 wire-to-coil morph (solenoid_field) ───────
        //   When the active state has wire_to_coil_morph.enabled, drive the
        //   stand-in straight wire opacity 1→0 and the coil opacity 0→1 over
        //   the configured window. Reads stateStartTime (set by applyState)
        //   so each entry into the state replays the morph from t=0.
        if (config.scenario_type === "solenoid_field" && stateDef && stateDef.wire_to_coil_morph && stateDef.wire_to_coil_morph.enabled) {
            var msSinceStart = (time - stateStartTime) * 1000;
            var straightDur = stateDef.wire_to_coil_morph.straight_duration_ms || 3000;
            var morphDur = stateDef.wire_to_coil_morph.morph_duration_ms || 1500;
            var wireOpacity, coilOpacity;
            if (msSinceStart < straightDur) {
                wireOpacity = 1; coilOpacity = 0;
            } else if (msSinceStart < straightDur + morphDur) {
                var u = (msSinceStart - straightDur) / morphDur;
                // smoothstep ease for visual continuity
                u = u * u * (3 - 2 * u);
                wireOpacity = 1 - u; coilOpacity = u;
            } else {
                wireOpacity = 0; coilOpacity = 1;
            }
            for (var msi = 0; msi < sceneObjects.length; msi++) {
                var mso = sceneObjects[msi];
                if (!mso.userData) continue;
                if (mso.userData.id === "solenoid_morph_wire" && mso.material) {
                    mso.material.opacity = wireOpacity;
                    mso.visible = wireOpacity > 0.01;
                } else if (mso.userData.id === "solenoid_coil") {
                    for (var mci = 0; mci < mso.children.length; mci++) {
                        var mch = mso.children[mci];
                        if (mch.material) mch.material.opacity = coilOpacity;
                    }
                    mso.visible = coilOpacity > 0.01;
                }
            }
        }

        // ── Diamond #4 STATE_2/STATE_3 — per_turn_field_circles +
        //   radial_cancellation_arrows + axial_buildup_arrows. These primitives
        //   live as children of solenoid_coil so the coil's axis-rotation
        //   applies automatically. Default state: all hidden. When a state opts
        //   in via stateDef.*_*, drive opacity/scale from (time - stateStartTime).
        if (config.scenario_type === "solenoid_field" && stateDef) {
            var coilForChildren = null;
            for (var cci = 0; cci < sceneObjects.length; cci++) {
                var cco = sceneObjects[cci];
                if (cco.userData && cco.userData.id === "solenoid_coil") {
                    coilForChildren = cco; break;
                }
            }
            if (coilForChildren) {
                var localMs = (time - stateStartTime) * 1000;
                var ptCfg = stateDef.per_turn_field_circles;
                var rcCfg = stateDef.radial_cancellation_arrows;
                var axCfg = stateDef.axial_buildup_arrows;
                var ptRevealAt = (ptCfg && ptCfg.reveal_at_ms != null) ? ptCfg.reveal_at_ms : 3500;
                var ptStagger = (ptCfg && ptCfg.reveal_stagger_ms != null) ? ptCfg.reveal_stagger_ms : 250;
                var ptFade = (ptCfg && ptCfg.reveal_fade_ms != null) ? ptCfg.reveal_fade_ms : 500;
                var ptDimSteady = (ptCfg && ptCfg.opacity_dim != null) ? ptCfg.opacity_dim : 1.0;
                var ptHighlightFirst = !!(ptCfg && ptCfg.highlight_first);
                var rcColorActive = (rcCfg && rcCfg.color) || "#EF4444";
                var rcRevealAt = (rcCfg && rcCfg.reveal_at_ms != null) ? rcCfg.reveal_at_ms : 6000;
                var rcFade = (rcCfg && rcCfg.fade_in_duration_ms != null) ? rcCfg.fade_in_duration_ms : 800;
                var axColorActive = (axCfg && axCfg.color) || "#3B82F6";
                var axRevealAt = (axCfg && axCfg.reveal_at_ms != null) ? axCfg.reveal_at_ms : 8500;
                var axArise = (axCfg && axCfg.arise_duration_ms != null) ? axCfg.arise_duration_ms : 1000;
                var axLenMax = (axCfg && axCfg.arrow_length_max != null) ? axCfg.arrow_length_max : 1.0;
                // Co-fade: when axial arrows finish arising on the same state
                // that also has per_turn_field_circles, the circles dim to 30%
                // so the axial field dominates visually (architect-specified).
                var coFadeDim = 1.0;
                if (axCfg && axCfg.enabled && ptCfg && ptCfg.enabled) {
                    var axDoneAt = axRevealAt + axArise;
                    if (localMs >= axDoneAt) coFadeDim = 0.3;
                    else if (localMs >= axRevealAt) {
                        var fu = (localMs - axRevealAt) / Math.max(1, axArise);
                        coFadeDim = 1.0 - 0.7 * Math.max(0, Math.min(1, fu));
                    }
                }
                for (var chi = 0; chi < coilForChildren.children.length; chi++) {
                    var ch = coilForChildren.children[chi];
                    var ud = ch.userData;
                    if (!ud) continue;
                    if (ud.elementType === "per_turn_field_circle") {
                        if (!ptCfg || !ptCfg.enabled) {
                            ch.visible = false;
                            if (ch.material) ch.material.opacity = 0;
                            continue;
                        }
                        var turnRevealStart = ptRevealAt + ud.turnIndex * ptStagger;
                        // Highlight-first behaviour: if highlight_first and first
                        // turn (index 0), it's visible from state enter (t=0).
                        if (ptHighlightFirst && ud.turnIndex === 0) {
                            turnRevealStart = 0;
                        }
                        var turnOpacity = 0;
                        if (localMs >= turnRevealStart + ptFade) {
                            turnOpacity = ptDimSteady * coFadeDim;
                        } else if (localMs >= turnRevealStart) {
                            var tu = (localMs - turnRevealStart) / Math.max(1, ptFade);
                            turnOpacity = ptDimSteady * coFadeDim * Math.max(0, Math.min(1, tu));
                        }
                        ch.visible = turnOpacity > 0.01;
                        if (ch.material) ch.material.opacity = turnOpacity;
                    } else if (ud.elementType === "radial_cancel_arrow") {
                        if (!rcCfg || !rcCfg.enabled) {
                            ch.visible = false;
                            if (ch.material) ch.material.opacity = 0;
                            continue;
                        }
                        var rcOpacity = 0;
                        if (localMs >= rcRevealAt + rcFade) {
                            rcOpacity = 1;
                        } else if (localMs >= rcRevealAt) {
                            var ru = (localMs - rcRevealAt) / Math.max(1, rcFade);
                            rcOpacity = Math.max(0, Math.min(1, ru));
                        }
                        ch.visible = rcOpacity > 0.01;
                        if (ch.material) {
                            ch.material.opacity = rcOpacity;
                            if (rcCfg.color) ch.material.color = hexToThreeColor(rcColorActive);
                        }
                    } else if (ud.elementType === "axial_buildup_tube" || ud.elementType === "axial_buildup_head") {
                        // Blue axial field (tube + arrowhead) fades in after the
                        // radial cancellation — opacity reveal (the tube is full
                        // length; the head is fixed at the tip). smoothstep over
                        // arise_duration_ms starting at reveal_at_ms.
                        if (!axCfg || !axCfg.enabled) {
                            ch.visible = false;
                            if (ch.material) ch.material.opacity = 0;
                            continue;
                        }
                        var axO = 0;
                        if (localMs >= axRevealAt + axArise) axO = 1;
                        else if (localMs >= axRevealAt) {
                            axO = (localMs - axRevealAt) / Math.max(1, axArise);
                            axO = axO * axO * (3 - 2 * axO); // smoothstep
                        }
                        ch.visible = axO > 0.01;
                        if (ch.material) {
                            ch.material.opacity = axO;
                            if (axCfg.color) ch.material.color = hexToThreeColor(axColorActive);
                        }
                    } else if (ud.elementType === "current_flow_dot") {
                        // Live current flowing ALONG the helix. heldAtPin?0:0.016
                        // is the freeze-determinism guard (mirrors the torque dot).
                        var cfCfg = stateDef.current_flow;
                        if (!cfCfg || !cfCfg.enabled) { ch.visible = false; if (ch.material) ch.material.opacity = 0; continue; }
                        var cfReveal = (cfCfg.reveal_at_ms != null) ? cfCfg.reveal_at_ms : 0;
                        if (localMs < cfReveal) { ch.visible = false; if (ch.material) ch.material.opacity = 0; continue; }
                        var cfDir = (cfCfg.direction === "reverse") ? -1 : 1;
                        var cfSpeed = (cfCfg.speed != null) ? cfCfg.speed : (ud.speed || 0.16);
                        var cfDt = heldAtPin ? 0 : 0.016;
                        ud.t = (ud.t + cfDir * cfSpeed * cfDt + 1.0) % 1.0;
                        var cfPos = sampleHelix(ud.t, coilForChildren.userData.helixPts, coilForChildren.userData.helixCum, coilForChildren.userData.helixLen);
                        ch.position.set(cfPos[0], cfPos[1], cfPos[2]);
                        ch.visible = true;
                        if (ch.material) ch.material.opacity = 1;
                    } else if (ud.elementType === "wire_wrap_circle") {
                        // STATE_2: Biot-Savart B-circles around the FOCAL turn's wire.
                        var wbCfg = stateDef.per_turn_biot;
                        var wbFocal = (wbCfg && wbCfg.focal_turn != null) ? wbCfg.focal_turn : 0;
                        if (!wbCfg || !wbCfg.enabled || ud.turnIndex !== wbFocal) { ch.visible = false; if (ch.material) ch.material.opacity = 0; continue; }
                        var wbReveal = (wbCfg.reveal_at_ms != null) ? wbCfg.reveal_at_ms : 500;
                        var wbFade = (wbCfg.reveal_fade_ms != null) ? wbCfg.reveal_fade_ms : 600;
                        var wbO = 0;
                        if (localMs >= wbReveal + wbFade) wbO = 1;
                        else if (localMs >= wbReveal) wbO = (localMs - wbReveal) / Math.max(1, wbFade);
                        ch.visible = wbO > 0.01;
                        if (ch.material) ch.material.opacity = wbO * 0.95;
                    } else if (ud.elementType === "per_turn_axial_arrow") {
                        // STATE_2: each turn's NET axial field, staggered across turns.
                        var pbCfg = stateDef.per_turn_biot;
                        if (!pbCfg || !pbCfg.enabled) { ch.visible = false; if (ch.material) ch.material.opacity = 0; continue; }
                        var paReveal = (pbCfg.axial_reveal_at_ms != null) ? pbCfg.axial_reveal_at_ms : 1800;
                        var paStagger = (pbCfg.axial_stagger_ms != null) ? pbCfg.axial_stagger_ms : 250;
                        var paStart = paReveal + ud.turnIndex * paStagger;
                        var paO = 0;
                        if (localMs >= paStart + 500) paO = 1;
                        else if (localMs >= paStart) paO = (localMs - paStart) / 500;
                        ch.visible = paO > 0.01;
                        if (ch.material) ch.material.opacity = paO * 0.9;
                    } else if (ud.elementType === "rd_element" || ud.elementType === "rd_axis_point" || ud.elementType === "rd_ray" || ud.elementType === "rd_contribution") {
                        // STATE_3 radial decomposition: source elements, axis point,
                        // causal rays, and the full (yellow) contribution arrows.
                        var rdCfg = stateDef.radial_decomposition;
                        if (!rdCfg || !rdCfg.enabled) { ch.visible = false; if (ch.material) ch.material.opacity = 0; continue; }
                        var rdRevC = (rdCfg.reveal_contributions_at_ms != null) ? rdCfg.reveal_contributions_at_ms : 1500;
                        var rdRevCFade = (rdCfg.contributions_fade_ms != null) ? rdCfg.contributions_fade_ms : 700;
                        var rdSplitAt = (rdCfg.split_at_ms != null) ? rdCfg.split_at_ms : 4000;
                        var rdBaseO = 0;
                        if (localMs >= rdRevC + rdRevCFade) rdBaseO = 1;
                        else if (localMs >= rdRevC) rdBaseO = (localMs - rdRevC) / Math.max(1, rdRevCFade);
                        var rdDim = 1.0;
                        if (ud.elementType === "rd_ray") rdDim = 0.4;
                        if (ud.elementType === "rd_contribution" && localMs >= rdSplitAt) rdDim = 0.3;
                        var rdOpac = rdBaseO * rdDim;
                        ch.visible = rdOpac > 0.01;
                        if (ch.material) ch.material.opacity = rdOpac;
                    } else if (ud.elementType === "rd_axial" || ud.elementType === "rd_radial") {
                        // Shared by STATE_3 (radial: split → annihilate red) and
                        // STATE_4 (axial: stack the blue halves head-to-tail).
                        var rdCfg2 = stateDef.radial_decomposition;
                        var axsCfg = stateDef.axial_stack;
                        if ((!rdCfg2 || !rdCfg2.enabled) && (!axsCfg || !axsCfg.enabled)) { ch.visible = false; if (ch.material) ch.material.opacity = 0; continue; }
                        if (rdCfg2 && rdCfg2.enabled) {
                            var splitAt = (rdCfg2.split_at_ms != null) ? rdCfg2.split_at_ms : 4000;
                            var splitFade = (rdCfg2.split_fade_ms != null) ? rdCfg2.split_fade_ms : 700;
                            var annAt = (rdCfg2.annihilate_at_ms != null) ? rdCfg2.annihilate_at_ms : 7000;
                            var annDur = (rdCfg2.annihilate_dur_ms != null) ? rdCfg2.annihilate_dur_ms : 1200;
                            var splitO = 0;
                            if (localMs >= splitAt + splitFade) splitO = 1;
                            else if (localMs >= splitAt) splitO = (localMs - splitAt) / Math.max(1, splitFade);
                            if (ud.elementType === "rd_radial") {
                                var shrink = 1;
                                if (localMs >= annAt + annDur) shrink = 0;
                                else if (localMs >= annAt) { var av = (localMs - annAt) / Math.max(1, annDur); shrink = 1 - av * av * (3 - 2 * av); }
                                applyDecompTransform(ch, ud, shrink);
                                var rdrO = splitO * shrink;
                                ch.visible = rdrO > 0.01;
                                if (ch.material) ch.material.opacity = rdrO;
                            } else {
                                applyDecompTransform(ch, ud, 1);
                                ch.visible = splitO > 0.01;
                                if (ch.material) ch.material.opacity = splitO;
                            }
                        } else {
                            // AXIAL state — red hidden; blue halves reveal + stack.
                            if (ud.elementType === "rd_radial") { ch.visible = false; if (ch.material) ch.material.opacity = 0; continue; }
                            var asReveal = (axsCfg.reveal_at_ms != null) ? axsCfg.reveal_at_ms : 0;
                            var asStackAt = (axsCfg.stack_at_ms != null) ? axsCfg.stack_at_ms : 1200;
                            var asStackDur = (axsCfg.stack_dur_ms != null) ? axsCfg.stack_dur_ms : 1000;
                            var stackU = 0;
                            if (localMs >= asStackAt + asStackDur) stackU = 1;
                            else if (localMs >= asStackAt) { var su = (localMs - asStackAt) / Math.max(1, asStackDur); stackU = su * su * (3 - 2 * su); }
                            var liftZ = 0;
                            if (ud.id.indexOf("rd_axial_right") === 0) liftZ = stackU * (ud.toP[2] - ud.fromP[2]);
                            applyDecompLift(ch, ud, liftZ);
                            var asO = (localMs >= asReveal) ? 1 : 0;
                            ch.visible = asO > 0.01;
                            if (ch.material) ch.material.opacity = asO;
                        }
                    } else if (ud.elementType === "ax_stack_sum") {
                        // STATE_4: the doubled axial arrow (2× = adds).
                        var assCfg = stateDef.axial_stack;
                        if (!assCfg || !assCfg.enabled) { ch.visible = false; if (ch.material) ch.material.opacity = 0; continue; }
                        var sumReveal = (assCfg.sum_reveal_at_ms != null) ? assCfg.sum_reveal_at_ms : 2600;
                        var sumO = 0;
                        if (localMs >= sumReveal + 700) sumO = 1;
                        else if (localMs >= sumReveal) sumO = (localMs - sumReveal) / 700;
                        ch.visible = sumO > 0.01;
                        if (ch.material) ch.material.opacity = sumO;
                    } else if (ud.elementType === "length_stack_arrow") {
                        // Beat 3 (STATE_4): along-length axial arrows reveal
                        // left to right (staggered) — every ring along L adds
                        // its axial bit, building the uniform field end to end.
                        var lsCfg = stateDef.length_stack;
                        if (!lsCfg || !lsCfg.enabled) { ch.visible = false; if (ch.material) ch.material.opacity = 0; continue; }
                        var lsReveal = (lsCfg.reveal_at_ms != null) ? lsCfg.reveal_at_ms : 1800;
                        var lsStagger = (lsCfg.stagger_ms != null) ? lsCfg.stagger_ms : 260;
                        var lsFade = (lsCfg.fade_ms != null) ? lsCfg.fade_ms : 500;
                        var lsStart = lsReveal + (ud.lsIndex || 0) * lsStagger;
                        var lsO = 0;
                        if (localMs >= lsStart + lsFade) lsO = 1;
                        else if (localMs >= lsStart) lsO = (localMs - lsStart) / Math.max(1, lsFade);
                        ch.visible = lsO > 0.01;
                        if (ch.material) ch.material.opacity = lsO * 0.92;
                    } else if (ud.elementType === "pole_label") {
                        // Beat 1 (STATE_5 + STATE_8): N/S pole labels. Show the
                        // correct pair per field direction so they SWAP when the
                        // current reverses. N is the end the interior field B
                        // points toward: dir>0 -> +z end = N; dir<0 -> swap.
                        var plCfg = stateDef.pole_labels;
                        if (!plCfg || !plCfg.enabled) { ch.visible = false; if (ch.material) ch.material.opacity = 0; continue; }
                        var plDir = (stateDef.field_lines_dir != null) ? stateDef.field_lines_dir : 1;
                        var wantN = (plDir >= 0) ? (ud.end === 1) : (ud.end === -1);
                        var showThis = (ud.pole === "N") ? wantN : !wantN;
                        var plReveal = (plCfg.reveal_at_ms != null) ? plCfg.reveal_at_ms : 300;
                        var plFade = (plCfg.fade_ms != null) ? plCfg.fade_ms : 500;
                        var plO = 0;
                        if (showThis) {
                            if (localMs >= plReveal + plFade) plO = 1;
                            else if (localMs >= plReveal) plO = (localMs - plReveal) / Math.max(1, plFade);
                        }
                        ch.visible = plO > 0.01;
                        if (ch.material) ch.material.opacity = plO;
                    }
                }

                // Field-line arrow direction follows the current (RHR); flips to
                // -z on the reverse-current state (field_lines_dir = -1). The
                // internal field lines + arrows are top-level sceneObjects.
                var flDir = (stateDef.field_lines_dir != null) ? stateDef.field_lines_dir : 1;
                for (var fli = 0; fli < sceneObjects.length; fli++) {
                    var flo = sceneObjects[fli];
                    if (flo.userData && flo.userData.elementType === "arrow" && flo.userData.id && flo.userData.id.indexOf("arr_int_") === 0) {
                        var flUp = new THREE.Vector3(0, 1, 0);
                        var flTgt = new THREE.Vector3(0, 0, flDir >= 0 ? 1 : -1);
                        var flQ = new THREE.Quaternion(); flQ.setFromUnitVectors(flUp, flTgt);
                        flo.setRotationFromQuaternion(flQ);
                    }
                }
            }
        }

        // ── Biot-Savart choreography ─────────────────────────────────────
        //   Storytelling motion, all keyed off localMsB = (time - stateStartTime):
        //     • grow-from-origin reveal of dl / r̂ / θ-arc / dl×r̂ / dB on a
        //       per-element schedule (revealAt by elementType) → the vectors draw
        //       themselves in narration order.
        //     • current-flow dots animate up the wire (show_current_flow).
        //     • dB accumulation reveals on a stagger; the circle ramps in (sequence).
        //     • the tangent arrow orbits the wire (circulate / direction_practice).
        //     • a scan ring travels down the wire for the sinθ/r² weighting (STATE_8).
        //   Visibility of each element is still owned by applyState/visible_elements;
        //   here we only drive per-frame scale / opacity / position.
        if (config.scenario_type === "biot_savart_element" && stateDef) {
            var be = stateDef.biot_element || {};
            var modeB = be.accumulate_mode || "single";
            var localMsB = (time - stateStartTime) * 1000;
            var revealAtB = be.reveal_at_ms != null ? be.reveal_at_ms : 1500;
            var staggerB = be.reveal_stagger_ms != null ? be.reveal_stagger_ms : 350;
            var fadeB = be.reveal_fade_ms != null ? be.reveal_fade_ms : 400;
            var nElB = (config.biot_defaults && config.biot_defaults.num_elements) || 9;
            var lastStartB = revealAtB + (nElB - 1) * staggerB + fadeB;
            // Single-element teaching states get the full staggered draw-on; the
            // integrated/sequence states reveal their few elements quickly so the
            // narrative beat (accumulation / result) isn't held up.
            var revFactorB = (modeB === "single") ? 1 : 0.28;
            var growMsB = (modeB === "single") ? 720 : 450;
            var biotPulseB = 0.5 + 0.5 * Math.abs(Math.sin(time * 3.0));
            var wireHalfB = (config.biot_defaults && config.biot_defaults.wire_half_length) || 3.0;

            function smooth01(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

            for (var bsi = 0; bsi < sceneObjects.length; bsi++) {
                var bso = sceneObjects[bsi];
                var bud = bso.userData;
                if (!bud || !bud.elementType) continue;

                // 1) Reveal tagged elements. Vectors (dl, r̂, θ, dl×r̂, dB, P) grow
                //    from their origin; symbol labels just fade in at fixed scale.
                if (bud.grows && bso.visible) {
                    var rAtB = (bud.revealAt != null ? bud.revealAt : 0) * revFactorB;
                    var kB = (localMsB <= rAtB) ? 0 : smooth01((localMsB - rAtB) / growMsB);
                    if (bud.isLabel) {
                        if (bso.material) bso.material.opacity = kB;
                    } else {
                        bso.scale.setScalar(Math.max(0.0001, kB));
                        if (bud.fadeChildren) {
                            for (var gci = 0; gci < bso.children.length; gci++) {
                                var gch = bso.children[gci];
                                if (gch.material) {
                                    var baseO = (gch.userData && gch.userData.baseOpacity != null) ? gch.userData.baseOpacity : 1;
                                    gch.material.opacity = kB * baseO;
                                }
                            }
                        }
                    }
                }

                // 2) Current-flow dots — march up the wire when the state asks for it
                if (bud.elementType === "biot_flow") {
                    if (be.show_current_flow) {
                        bso.visible = true;
                        var speed = 0.55; // wire-units per second
                        var span = 2 * wireHalfB;
                        var yF = -wireHalfB + (((bud.phase + (localMsB / 1000) * (speed / span)) % 1) * span);
                        bso.position.set(0, yF, 0);
                        if (bso.material) bso.material.opacity = 0.9;
                    } else {
                        bso.visible = false;
                        if (bso.material) bso.material.opacity = 0;
                    }
                }

                // 3) dB accumulation reveal (sequence) + optional sinθ-weight emphasis
                if (bud.elementType === "biot_accum") {
                    var opB = 0;
                    if (modeB === "sequence") {
                        var startB = revealAtB + bud.elemIndex * staggerB;
                        if (localMsB >= startB + fadeB) opB = 1;
                        else if (localMsB >= startB) opB = Math.max(0, Math.min(1, (localMsB - startB) / Math.max(1, fadeB)));
                    }
                    // STATE_8: scale the wire marker by its sinθ/r² weight so the
                    // dominant middle element visibly swells and the ends shrink.
                    var mkScale = be.weight_by_sin_theta ? (0.4 + 1.6 * bud.sinThetaWeight) : 1.0;
                    for (var bci = 0; bci < bso.children.length; bci++) {
                        var ach = bso.children[bci];
                        if (ach.material) ach.material.opacity = opB;
                        if (ach.geometry && ach.geometry.type === "SphereGeometry") ach.scale.setScalar(mkScale);
                    }
                }

                // 4) Assembled circle opacity (faint → ramps with accumulation → bright)
                else if (bud.elementType === "biot_circle") {
                    var cOpB = 0;
                    if (modeB === "integrated") {
                        cOpB = be.circle_opacity != null ? be.circle_opacity : 0.9;
                    } else if (modeB === "sequence") {
                        var progB = (localMsB <= revealAtB) ? 0
                            : (localMsB >= lastStartB ? 1 : (localMsB - revealAtB) / Math.max(1, lastStartB - revealAtB));
                        cOpB = 0.85 * Math.max(0, Math.min(1, progB));
                    } else {
                        cOpB = be.circle_opacity != null ? be.circle_opacity : 0;
                    }
                    if (bso.material) bso.material.opacity = cOpB;
                    // Orbit the tangent arrow around the wire to show circulation.
                    if (bud.id === "bs_circle_arr" && bso.visible && bud.orbitRadius) {
                        var angC = (localMsB / 1000) * 0.7; // ccw
                        var rO = bud.orbitRadius;
                        bso.position.set(rO * Math.cos(angC), 0, -rO * Math.sin(angC));
                        // tangent direction (ccw) = derivative of (cos, 0, -sin)
                        var tdir = new THREE.Vector3(-Math.sin(angC), 0, -Math.cos(angC));
                        var upv = new THREE.Vector3(0, 1, 0);
                        var qC = new THREE.Quaternion(); qC.setFromUnitVectors(upv, tdir);
                        bso.setRotationFromQuaternion(qC);
                        if (bso.material) bso.material.opacity = Math.max(cOpB, 0.55);
                    }
                }

                // 5) Orbiting circulation arrow for the top-down dot/cross practice
                else if (bud.elementType === "biot_orbit") {
                    if (be.direction_practice) {
                        bso.visible = true;
                        var angO = (localMsB / 1000) * 0.9; // ccw (current out of page)
                        var rOb = bud.orbitRadius || 1.6;
                        bso.position.set(rOb * Math.cos(angO), 0, -rOb * Math.sin(angO));
                        var tdirO = new THREE.Vector3(-Math.sin(angO), 0, -Math.cos(angO));
                        var qO = new THREE.Quaternion(); qO.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tdirO);
                        bso.setRotationFromQuaternion(qO);
                        if (bso.material) bso.material.opacity = 0.95;
                    } else {
                        bso.visible = false;
                        if (bso.material) bso.material.opacity = 0;
                    }
                }

                // 6) Scan ring travels down the wire during the weighting state
                else if (bud.elementType === "biot_scan") {
                    if (be.weight_by_sin_theta) {
                        bso.visible = true;
                        var scanT = smooth01((localMsB - 600) / 4000);
                        bso.position.set(0, wireHalfB * 0.85 - scanT * (wireHalfB * 1.7), 0);
                        if (bso.material) bso.material.opacity = 0.85 * biotPulseB;
                    } else {
                        bso.visible = false;
                        if (bso.material) bso.material.opacity = 0;
                    }
                }
            }

            // 7) Right-hand-rule hands — realistic finger curl with pause
            //    phases (clone of Diamond-#2's 3-phase-pause-animation). The
            //    4 finger tube geometries are regenerated each frame from
            //    lorentzFingerPoints at the current curl progress, and the
            //    fingernails slide to the live fingertips — so the curl reads
            //    as a human hand closing, not a morph. Each hold phase shows
            //    exactly one label + pointer arrow so the student's eye lands
            //    on the right direction at the right moment. The cycle starts
            //    at state entry (localMsB), so the story always begins flat.
            var handSecB = localMsB / 1000;
            for (var bhi = 0; bhi < sceneObjects.length; bhi++) {
                var hnd = sceneObjects[bhi];
                var hud = hnd.userData;
                if (!hud || !hud.finger_meshes) continue;
                if (hud.elementType !== "biot_cross_hand" && hud.elementType !== "biot_grip_hand") continue;
                if (!hnd.visible) continue;
                var hCurl, hPhase;
                if (hud.elementType === "biot_grip_hand") {
                    // 2-beat grip cycle (7 s): flat hold (thumb = I) -> curl ->
                    // full-curl hold (fingers = B circulation) -> uncurl.
                    var gc = (handSecB % 7.0) / 7.0;
                    if (gc < 0.22) { hCurl = 0; hPhase = "i"; }
                    else if (gc < 0.45) { var gu = (gc - 0.22) / 0.23; hCurl = gu * gu * (3 - 2 * gu); hPhase = null; }
                    else if (gc < 0.88) { hCurl = 1; hPhase = "b"; }
                    else { var gv = (gc - 0.88) / 0.12; hCurl = 1 - gv * gv * (3 - 2 * gv); hPhase = null; }
                } else {
                    // 3-beat cross-product cycle (9 s, same timing as Diamond
                    // #2): flat (dl) -> mid-curl (r-hat) -> full curl (dB) ->
                    // snap back.
                    var cc = (handSecB % 9.0) / 9.0;
                    if (cc < 0.15) { hCurl = 0; hPhase = "dl"; }
                    else if (cc < 0.35) { var cu = (cc - 0.15) / 0.20; hCurl = 0.5 * (cu * cu * (3 - 2 * cu)); hPhase = null; }
                    else if (cc < 0.50) { hCurl = 0.5; hPhase = "rhat"; }
                    else if (cc < 0.70) { var cv = (cc - 0.50) / 0.20; hCurl = 0.5 + 0.5 * (cv * cv * (3 - 2 * cv)); hPhase = null; }
                    else if (cc < 0.92) { hCurl = 1; hPhase = "db"; }
                    else { var cw = (cc - 0.92) / 0.08; hCurl = 1 - cw * cw * (3 - 2 * cw); hPhase = null; }
                }
                var hFingers = hud.finger_meshes || [];
                var hKnu = hud.finger_knuckles || [];
                var hNails = hud.finger_nails || [];
                for (var hfi = 0; hfi < hFingers.length; hfi++) {
                    var hf = hFingers[hfi];
                    var hj = rhrFingerJoints(hfi, hud.sc, hCurl, hud.curlSign);
                    hf.geometry.dispose();
                    hf.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hj), 24, hud.seg_tube_r, 12, false);
                    var hkn = hKnu[hfi] || [];
                    for (var hkk = 0; hkk < hkn.length; hkk++) { if (hkn[hkk]) hkn[hkk].position.copy(hj[hkk]); }
                    if (hNails[hfi]) hNails[hfi].position.copy(hj[3]);
                }
                if (hud.elementType === "biot_grip_hand") {
                    if (hud.i_label) hud.i_label.visible = (hPhase === "i");
                    if (hud.b_grip_label) hud.b_grip_label.visible = (hPhase === "b");
                    if (hud.f_arrow) hud.f_arrow.visible = (hPhase === "i");   // thumb arrow = I
                    if (hud.b_arrow) hud.b_arrow.visible = (hPhase === "b");   // curl arrow  = B
                } else {
                    if (hud.dl_label) hud.dl_label.visible = (hPhase === "dl");
                    if (hud.rhat_label) hud.rhat_label.visible = (hPhase === "rhat");
                    if (hud.db_label) hud.db_label.visible = (hPhase === "db");
                    if (hud.v_arrow) hud.v_arrow.visible = (hPhase === "dl");
                    if (hud.b_arrow) hud.b_arrow.visible = (hPhase === "rhat");
                    if (hud.f_arrow) hud.f_arrow.visible = (hPhase === "db");
                }
            }
        }

        // ── Lorentz force (Diamond #2) ───────────────────────────────────
        //   Analytical particle trajectory parameterised by t_local = time -
        //   stateStartTime. F = q v × B recomputed each frame (direction only).
        //   No numerical integrator — closed-form circular / helical / linear
        //   motion keeps the visual deterministic and reproducible.
        if (config.scenario_type === "lorentz_force_uniform_field" && stateDef) {
            var afL = config.ambient_field || { direction: [0, 0, 1] };
            var bUnit = new THREE.Vector3(afL.direction[0], afL.direction[1], afL.direction[2]).normalize();

            // Build a stable orthonormal basis {u1, u2, bUnit}. u2 is constructed
            // as cross(u1, bUnit) (not cross(bUnit, u1)) so the orbit
            // parameterisation pos = R*cos(phase)*u1 + R*sin(phase)*u2 for q>0
            // produces a centripetal Lorentz force (F = qv x B pointing TOWARD
            // the origin). The earlier cross(bUnit, u1) ordering gave a right-
            // handed basis where F came out centrifugal — a 25-iteration-old
            // bug surfaced by the Fleming-overlay sanity check on 2026-05-12.
            var u1 = new THREE.Vector3(1, 0, 0);
            if (Math.abs(bUnit.dot(u1)) > 0.99) u1 = new THREE.Vector3(0, 1, 0);
            u1.sub(bUnit.clone().multiplyScalar(bUnit.dot(u1))).normalize();
            var u2 = new THREE.Vector3().crossVectors(u1, bUnit).normalize();

            // Pause+co-glow: when protonFreezeAt is set (via SET_FREEZE_PROTON
            // postMessage from the TTS player), the proton's local trajectory
            // time is held at the snapshot value so position + v/F arrow bases
            // stop drifting while the script discusses the F arrow.
            var tLocal = (protonFreezeAt != null) ? protonFreezeAt : (time - stateStartTime);
            var thetaDegL = stateDef.theta_deg != null ? stateDef.theta_deg : 90;
            var thetaRadL = (thetaDegL * Math.PI) / 180;
            var sinT = Math.sin(thetaRadL);
            var cosT = Math.cos(thetaRadL);
            var chargeSignL = stateDef.charge_sign != null
                ? stateDef.charge_sign
                : (config.particle ? config.particle.charge_sign : 1);
            var modeL = stateDef.trajectory_mode || "static";

            // STATE_6 interactive sliders: v and B must change the visible
            // trajectory, not just the F readout. Physics:
            //   r = m·v / (|q|·B)    → radius ∝ v / B
            //   ω = |q|·B / m         → angular frequency ∝ B
            //   T = 2π·m / (|q|·B)    → period ∝ 1/B
            // We treat the sliders as multiplicative factors relative to the
            // JSON-declared defaults so the static states (no sliders) keep
            // their original visual radius and speed.
            var vFactor = 1.0;
            var BFactor = 1.0;
            if (stateDef.show_sliders) {
                var vSliderEl = document.getElementById("v_slider");
                var bSliderEl = document.getElementById("b_slider");
                var vDefault = (config.slider_controls && config.slider_controls.v)
                    ? (config.slider_controls.v.default / 1e5) : 1.0;
                var BDefault = (config.slider_controls && config.slider_controls.B)
                    ? (config.slider_controls.B.default * 1000) : 10.0;
                if (vSliderEl) vFactor = parseFloat(vSliderEl.value) / vDefault;
                if (bSliderEl) BFactor = parseFloat(bSliderEl.value) / BDefault;
            }
            // Visual radius scales as v/B, clamped so the circle stays inside
            // the camera frustum even at extreme slider settings.
            var R = Math.max(0.35, Math.min(2.4, 1.5 * vFactor / Math.max(0.15, BFactor)));
            // Angular frequency scales with B, clamped so the motion never
            // gets too sluggish or too fast to read.
            var omega = Math.max(0.20, Math.min(3.00, 0.75 * BFactor));

            // Position
            var newPos = new THREE.Vector3();
            var vDir = new THREE.Vector3();
            if (modeL === "static") {
                newPos.set(0, 0, 0);
                // Respect theta_deg: v makes angle θ with B (B = bUnit).
                //   θ = 0   → v along  bUnit  (parallel to B)
                //   θ = 90° → v along  u1     (perpendicular to B)
                //   θ in between → v at the configured angle, in the (bUnit, u1) plane.
                vDir.copy(bUnit).multiplyScalar(cosT).add(u1.clone().multiplyScalar(sinT)).normalize();
            } else if (modeL === "straight") {
                // v ∥ B (theta ≈ 0): particle drifts along B, F = 0.
                // v ⊥ B with no force visualization (rare): drift along u1.
                var driftAlongB = thetaDegL < 30;
                var driftAxis = driftAlongB ? bUnit : u1;
                var driftS = ((tLocal * 0.45) % 4) - 2;
                newPos.copy(driftAxis).multiplyScalar(driftS);
                vDir.copy(driftAxis);
            } else if (modeL === "circle") {
                var phaseC = omega * tLocal * chargeSignL;
                newPos.copy(u1).multiplyScalar(R * Math.cos(phaseC))
                     .add(u2.clone().multiplyScalar(R * Math.sin(phaseC)));
                // vDir formula is (-sin·u1 + cos·u2), but for q<0 the actual
                // dpos/dt has the opposite sign (phaseC decreases with t).
                // Multiply by chargeSignL so the velocity arrow matches the
                // particle's actual direction of motion in both q-sign cases.
                vDir.copy(u1).multiplyScalar(-Math.sin(phaseC))
                    .add(u2.clone().multiplyScalar(Math.cos(phaseC)))
                    .multiplyScalar(chargeSignL)
                    .normalize();
            } else if (modeL === "helix") {
                // Optional entry phase (founder note 2026-05-14 — STATE_3):
                // before the helix begins, the proton flies in along the
                // helix-start tangent vector from outside the field, then
                // crosses in seamlessly. tJoin is the helix-local time; for
                // tLocal < entryDur it's pinned at 0 and the position is
                // shifted backwards along v by entrySpeed × (entryDur - tLocal).
                var entryDur = stateDef.entry_duration || 0;
                var tJoin = Math.max(0, tLocal - entryDur);
                // Balanced helix (reviewer Asmi, 2026-06-16): split ONE base
                // speed (omega·HELIX_R) into a perpendicular part (∝ sinθ — the
                // cyclotron circle) and an axial part (∝ cosθ — the conserved v∥
                // drift), so at θ = 45°, where v·cosθ = v·sinθ, the forward drift
                // per orbit equals the circle's circumference and circling vs
                // forward look balanced. The old hard-coded 0.35·cosθ made the
                // drift ~3× too slow, so 45° read as a tight circle.
                // HELIX_R shrinks the radius so a FULL balanced loop fits the
                // visible axial range (a balanced 45° helix has pitch = circum-
                // ference, so the circle has to be small to fit on screen). The
                // motion loops cleanly over loopDur — proton + trail restart
                // together at −AX/2 instead of teleporting mid-orbit (the old
                // modulo-4 axial wrap drew a long dead-zone line and left the
                // trail half-drawn, which is what the reviewer saw).
                var HELIX_R = R * 0.5;
                var AX_RANGE = 4.5;
                var Rperp = HELIX_R * Math.max(0.05, sinT);
                var axialSpeed = omega * HELIX_R * cosT;
                var loopDur = axialSpeed > 1e-4 ? (AX_RANGE / axialSpeed) : 1e9;
                var tHelix = loopDur < 1e8 ? (tJoin % loopDur) : tJoin;
                var phaseH = omega * tHelix * chargeSignL;
                var axial = (tHelix * axialSpeed) - (AX_RANGE / 2);
                newPos.copy(u1).multiplyScalar(Rperp * Math.cos(phaseH))
                     .add(u2.clone().multiplyScalar(Rperp * Math.sin(phaseH)))
                     .add(bUnit.clone().multiplyScalar(axial));
                // Cyclotron part (perpendicular to B) flips sign with charge;
                // drift along B (bUnit*cosT) does NOT — it's the conserved v∥
                // component, unaffected by the magnetic force.
                vDir.copy(u1).multiplyScalar(-Math.sin(phaseH) * sinT * chargeSignL)
                    .add(u2.clone().multiplyScalar(Math.cos(phaseH) * sinT * chargeSignL))
                    .add(bUnit.clone().multiplyScalar(cosT))
                    .normalize();
                if (entryDur > 0 && tLocal < entryDur) {
                    // Approach speed matches the helix tangent magnitude at
                    // join so the visual rate of travel is continuous.
                    var entrySpeed = Math.sqrt(
                        omega * omega * Rperp * Rperp + axialSpeed * axialSpeed
                    );
                    var backDist = entrySpeed * (entryDur - tLocal);
                    newPos.addScaledVector(vDir, -backDist);
                }
            }

            // Force direction: F = q (v × B). For visual, scale by sin θ
            // (cross-product of unit vectors), then multiply by the v·B
            // slider factors so STATE_6 students see F grow when they crank
            // up |v| or |B|. Clamp to keep the arrow within a readable range.
            var fVec = new THREE.Vector3().crossVectors(vDir, bUnit);
            if (chargeSignL < 0) fVec.multiplyScalar(-1);
            var fLenRaw = fVec.length();
            var fLen = stateDef.show_sliders
                ? Math.min(2.0, fLenRaw * vFactor * BFactor)
                : fLenRaw;
            var fDir = fLenRaw > 1e-6 ? fVec.normalize() : new THREE.Vector3(0, 1, 0);

            // Read extras for this state to decide which arrows are visible
            var lExtras = stateDef.extras || {};
            var vShow = !!(lExtras.velocity_vector && lExtras.velocity_vector.show);
            var fShow = !!(lExtras.force_vector && lExtras.force_vector.show);
            var trailShow = !!(lExtras.particle_trail && lExtras.particle_trail.show);
            var decompShow = !!(lExtras.vector_decomposition && lExtras.vector_decomposition.show);
            var vScale = (lExtras.velocity_vector && lExtras.velocity_vector.scale) || 1.2;
            var fScale = (lExtras.force_vector && lExtras.force_vector.scale) || 1.2;
            var decompScale = (lExtras.vector_decomposition && lExtras.vector_decomposition.scale) || 1.2;

            // Project v onto B once per frame for the decomposition arrows.
            // v_∥ = (v · B̂) B̂   (length = |v| cos θ)
            // v_⊥ = v − v_∥      (length = |v| sin θ)
            var vDotB = vDir.dot(bUnit);
            var vParLen = Math.abs(vDotB) * decompScale;
            var vPerpVec = vDir.clone().sub(bUnit.clone().multiplyScalar(vDotB));
            var vPerpLen = vPerpVec.length() * decompScale;
            var vParDir = vDotB >= 0 ? bUnit : bUnit.clone().multiplyScalar(-1);
            var vPerpDir = vPerpLen > 1e-6 ? vPerpVec.normalize() : new THREE.Vector3(1, 0, 0);

            // Track final lengths so the labels know where the arrow tips are.
            var finalV_len = 0, finalF_len = 0, finalVPar_len = 0, finalVPerp_len = 0;
            // TTS-driven glow pulse: shifted DC offset so glowing elements are
            // always larger than their un-glowed baseline (range [1.0, 1.7]).
            // Founder note 2026-05-12 (fourth pass): centered-on-1.0 oscillations
            // meant elements were sometimes SMALLER than baseline mid-cycle —
            // invisible signal when caught at the dip. The new formula sits at
            // a +35% mean elevation and oscillates ±35% around that, so the
            // element is conspicuously enlarged for the entire duration of the
            // glow target, with a soft pulse on top.
            var glowPulse = 1.35 + 0.35 * Math.sin(time * 3.5);
            function glowFactor(target) {
                return glowTargets.indexOf(target) >= 0 ? glowPulse : 1.0;
            }

            for (var li = 0; li < sceneObjects.length; li++) {
                var lObj = sceneObjects[li];
                var lUd = lObj.userData;
                if (!lUd) continue;
                if (lUd.elementType === "particle") {
                    lObj.position.copy(newPos);
                    // Refresh the +/− badge if the state's charge_sign was
                    // mutated by the STATE_6 q-toggle. Rebuilding the canvas
                    // texture is cheap (one DOM write) and only triggers on
                    // an actual sign flip — not every frame.
                    var badge = lUd.charge_sprite;
                    if (badge) {
                        var wantedSign = stateDef.charge_sign != null
                            ? stateDef.charge_sign
                            : (config.particle ? config.particle.charge_sign : 1);
                        if (badge.userData.current_sign !== wantedSign) {
                            var bCanvas = badge.material.map.image;
                            var bCtx = bCanvas.getContext("2d");
                            bCtx.clearRect(0, 0, bCanvas.width, bCanvas.height);
                            bCtx.font = "bold italic 76px 'Cambria Math', 'Times New Roman', serif";
                            bCtx.textAlign = "center";
                            bCtx.textBaseline = "middle";
                            bCtx.lineWidth = 8;
                            bCtx.strokeStyle = "rgba(10,10,26,0.95)";
                            var bText = wantedSign < 0 ? "−" : "+";
                            bCtx.strokeText(bText, bCanvas.width / 2, bCanvas.height / 2);
                            bCtx.fillStyle = "#FFFFFF";
                            bCtx.fillText(bText, bCanvas.width / 2, bCanvas.height / 2);
                            badge.material.map.needsUpdate = true;
                            badge.userData.current_sign = wantedSign;
                        }
                    }
                } else if (lUd.elementType === "velocity_vector") {
                    lObj.position.copy(newPos);
                    if (vShow) {
                        finalV_len = vScale * glowFactor("v");
                        lObj.setDirection(vDir); lObj.setLength(finalV_len, 0.22, 0.11);
                        lObj.visible = true;
                    } else lObj.visible = false;
                } else if (lUd.elementType === "force_vector") {
                    lObj.position.copy(newPos);
                    if (fShow && fLen > 1e-6) {
                        finalF_len = fScale * Math.max(0.15, fLen) * glowFactor("f");
                        lObj.setDirection(fDir);
                        lObj.setLength(finalF_len, 0.22, 0.11);
                        lObj.visible = true;
                    } else {
                        lObj.visible = false;
                    }
                } else if (lUd.elementType === "v_parallel") {
                    if (decompShow && vParLen > 0.02) {
                        finalVPar_len = vParLen * glowFactor("v_parallel");
                        lObj.position.copy(newPos);
                        lObj.setDirection(vParDir);
                        lObj.setLength(finalVPar_len, 0.18, 0.09);
                        lObj.visible = true;
                    } else {
                        lObj.visible = false;
                    }
                } else if (lUd.elementType === "v_perp") {
                    if (decompShow && vPerpLen > 0.02) {
                        finalVPerp_len = vPerpLen * glowFactor("v_perp");
                        lObj.position.copy(newPos);
                        lObj.setDirection(vPerpDir);
                        lObj.setLength(finalVPerp_len, 0.18, 0.09);
                        lObj.visible = true;
                    } else {
                        lObj.visible = false;
                    }
                } else if (lUd.elementType === "vector_label") {
                    // Sync each label to its arrow's visibility + tip position.
                    var tracks = lUd.tracks;
                    var labelDir, labelLen, labelShow = false;
                    if (tracks === "velocity_vector") {
                        labelShow = vShow;
                        labelDir = vDir; labelLen = finalV_len;
                    } else if (tracks === "force_vector") {
                        labelShow = fShow && fLen > 1e-6;
                        labelDir = fDir; labelLen = finalF_len;
                    } else if (tracks === "v_parallel") {
                        labelShow = decompShow && vParLen > 0.02;
                        labelDir = vParDir; labelLen = finalVPar_len;
                    } else if (tracks === "v_perp") {
                        labelShow = decompShow && vPerpLen > 0.02;
                        labelDir = vPerpDir; labelLen = finalVPerp_len;
                    }
                    if (labelShow && labelDir && labelLen > 0) {
                        // Place label just past the arrow tip.
                        lObj.position.copy(newPos).addScaledVector(labelDir, labelLen + 0.22);
                        lObj.visible = true;
                        // Glow target scales the label up too.
                        var tracksGlow = (
                            (tracks === "velocity_vector" && glowTargets.indexOf("v") >= 0) ||
                            (tracks === "force_vector"    && glowTargets.indexOf("f") >= 0) ||
                            (tracks === "v_parallel"      && glowTargets.indexOf("v_parallel") >= 0) ||
                            (tracks === "v_perp"          && glowTargets.indexOf("v_perp") >= 0)
                        );
                        var baseScale = (tracks === "v_parallel" || tracks === "v_perp") ? 0.65 : (tracks === "force_vector" ? 0.95 : 0.85);
                        var pulse = tracksGlow ? glowPulse : 1.0;
                        lObj.scale.set(baseScale * 3 * pulse, baseScale * pulse, 1);
                    } else {
                        lObj.visible = false;
                    }
                } else if (lUd.elementType === "ambient_field") {
                    // TTS glow 'b': uniform B-field grid arrows scale softly
                    // while the narration references the magnetic field.
                    lObj.scale.setScalar(glowFactor("b"));
                } else if (lUd.elementType === "particle_trail") {
                    if (!trailShow) { lObj.visible = false; continue; }
                    lObj.visible = true;
                    // TTS glow 'trail': the orbit path pulses via opacity
                    // (geometry is unchanged so the trace stays positionally
                    // accurate). Base opacity 0.85 set at trail construction.
                    var trailGlow = glowTargets.indexOf("trail") >= 0 ? glowPulse : 1.0;
                    lObj.material.opacity = Math.min(1.0, 0.85 * trailGlow);
                    if (lorentzTrailResetPending) {
                        lUd.write_index = 0;
                        lUd.filled = 0;
                        lObj.geometry.setDrawRange(0, 0);
                        lorentzTrailResetPending = false;
                    }
                    var maxP = lUd.max_points || 600;
                    var wi = lUd.write_index || 0;
                    // STATE_6 needs the trail to keep drawing forever so the
                    // student sees the orbit even after the buffer fills;
                    // for static states we keep the original cap so the
                    // pedagogical "this is one full circle" framing stays.
                    var infiniteTrail = !!stateDef.show_sliders;
                    // Only sample the trail when the proton has actually moved
                    // since the last point. Two reviewer bugs this fixes (Asmi,
                    // 2026-06-16):
                    //  (a) circle "not completed" — a TTS freeze_proton holds
                    //      the proton still, but the old code kept writing the
                    //      SAME point every frame, burning the fixed buffer so
                    //      the 90° circle stopped ~0.95 of a turn short and
                    //      never closed. Skipping stationary frames lets every
                    //      buffer slot advance the orbit, so it closes.
                    //  (b) helix "path not drawn" — when the axial coordinate
                    //      wraps (+2 → −2) the two samples are ~4 units apart,
                    //      so the trail drew one long segment straight across
                    //      the field. We detect that jump and start a fresh
                    //      trace instead of drawing the dead-zone line.
                    var movedOK = true;
                    var isJump = false;
                    if ((lUd.filled || 0) > 0) {
                        var ddx = newPos.x - lUd.last_x;
                        var ddy = newPos.y - lUd.last_y;
                        var ddz = newPos.z - lUd.last_z;
                        var step2 = ddx * ddx + ddy * ddy + ddz * ddz;
                        movedOK = step2 >= 1e-7;   // skip duplicate (frozen) frames
                        isJump = step2 > 4.0;      // axial wrap discontinuity (~4 units)
                    }
                    if (movedOK) {
                        if (isJump) {
                            // Discontinuity (helix wrap): refresh the trace so
                            // we never draw a long segment across the dead zone.
                            wi = 0;
                            lUd.write_index = 0;
                            lUd.filled = 0;
                        }
                        if (infiniteTrail || (lUd.filled || 0) < maxP) {
                            var arr = lObj.geometry.attributes.position.array;
                            arr[wi * 3 + 0] = newPos.x;
                            arr[wi * 3 + 1] = newPos.y;
                            arr[wi * 3 + 2] = newPos.z;
                            lUd.last_x = newPos.x;
                            lUd.last_y = newPos.y;
                            lUd.last_z = newPos.z;
                            if (infiniteTrail) {
                                // Circular buffer: when we wrap, reset the
                                // counters so the line never jumps from the end
                                // of the buffer back to the start as one long
                                // segment. The student sees one fresh orbit at
                                // a time instead.
                                lUd.write_index = wi + 1;
                                lUd.filled = (lUd.filled || 0) + 1;
                                if (lUd.write_index >= maxP) {
                                    lUd.write_index = 0;
                                    lUd.filled = 0;
                                    lObj.geometry.setDrawRange(0, 0);
                                } else {
                                    lObj.geometry.setDrawRange(0, lUd.filled);
                                }
                            } else {
                                lUd.write_index = wi + 1;
                                lUd.filled = (lUd.filled || 0) + 1;
                                lObj.geometry.setDrawRange(0, lUd.filled);
                            }
                            lObj.geometry.attributes.position.needsUpdate = true;
                        }
                    }
                }
            }

            // ── 3D right-hand: per-frame orientation + finger-curl anim ──
            // Cross-product convention: thumb = F = q v × B; fingers start
            // straight along v and curl toward B over a 9 s loop with three
            // pause phases for the student to read the v / B / F label that
            // hangs off the hand:
            //   0–15%  flat palm, "v" visible on fingertips
            //  15–35%  curl 0 → 0.5
            //  35–50%  mid-curl, "B" visible inside the curl
            //  50–70%  curl 0.5 → 1
            //  70–92%  fully curled, "F" visible above thumb
            //  92–100% snap back to flat
            var handAnimT = time - stateStartTime;
            var period = 9.0;
            var tCycle = (handAnimT % period) / period;
            var curlT, phaseLabel;
            if (heldHandPhase === 'v') {
                // TTS-driven freeze on the flat-palm phase: fingers along v.
                curlT = 0;
                phaseLabel = 'v';
            } else if (heldHandPhase === 'b') {
                // Mid-curl freeze: fingertips bend through B.
                curlT = 0.5;
                phaseLabel = 'b';
            } else if (heldHandPhase === 'f') {
                // Full-curl freeze: thumb along F.
                curlT = 1;
                phaseLabel = 'f';
            } else if (tCycle < 0.15) {
                curlT = 0;
                phaseLabel = 'v';
            } else if (tCycle < 0.35) {
                var uA = (tCycle - 0.15) / 0.20;
                curlT = 0.5 * (uA * uA * (3 - 2 * uA));
                phaseLabel = null;
            } else if (tCycle < 0.50) {
                curlT = 0.5;
                phaseLabel = 'b';
            } else if (tCycle < 0.70) {
                var uB = (tCycle - 0.50) / 0.20;
                curlT = 0.5 + 0.5 * (uB * uB * (3 - 2 * uB));
                phaseLabel = null;
            } else if (tCycle < 0.92) {
                curlT = 1;
                phaseLabel = 'f';
            } else {
                var uC = (tCycle - 0.92) / 0.08;
                curlT = 1 - (uC * uC * (3 - 2 * uC));
                phaseLabel = null;
            }

            for (var hi = 0; hi < dynamicExtras.length; hi++) {
                var handObj = dynamicExtras[hi];
                if (!handObj.userData || handObj.userData.elementType !== "lorentz_hand") continue;

                // TTS glow 'hand': the 3D right-hand mesh scales softly while
                // the narration explicitly references "the 3D right-hand" or
                // its fingers / palm / thumb. Multiplies on top of the base
                // hand_scale already baked into child positions/dimensions.
                handObj.scale.setScalar(glowFactor("hand"));

                // (a) Regenerate the 4 finger geometries with current curlT,
                //     and slide each fingernail to the new fingertip.
                var fingers = handObj.userData.finger_meshes || [];
                var knuckles = handObj.userData.finger_knuckles || [];
                var nails = handObj.userData.finger_nails || [];
                for (var fmi = 0; fmi < fingers.length; fmi++) {
                    var fmesh = fingers[fmi];
                    var fj = rhrFingerJoints(fmi, handObj.userData.sc, curlT, handObj.userData.curlSign);
                    fmesh.geometry.dispose();
                    fmesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(fj), 24, handObj.userData.seg_tube_r, 12, false);
                    var fkn = knuckles[fmi] || [];
                    for (var fkk = 0; fkk < fkn.length; fkk++) { if (fkn[fkk]) fkn[fkk].position.copy(fj[fkk]); }
                    if (nails[fmi]) nails[fmi].position.copy(fj[3]);
                }

                // (b) Toggle v / B / F label + arrow visibility per phase.
                if (handObj.userData.v_label) handObj.userData.v_label.visible = (phaseLabel === 'v');
                if (handObj.userData.b_label) handObj.userData.b_label.visible = (phaseLabel === 'b');
                if (handObj.userData.f_label) handObj.userData.f_label.visible = (phaseLabel === 'f');
                if (handObj.userData.v_arrow) handObj.userData.v_arrow.visible = (phaseLabel === 'v');
                if (handObj.userData.b_arrow) handObj.userData.b_arrow.visible = (phaseLabel === 'b');
                if (handObj.userData.f_arrow) handObj.userData.f_arrow.visible = (phaseLabel === 'f');

                // (c) Orient the hand. Mesh conventions:
                //     +y_local = thumb (F),  -z_local = flat fingers (v).
                //   Step 1: quatThumb maps +y_local → fUnit (= F direction).
                //   Step 2: quatTwist rotates around fUnit so the rotated
                //   -z_local aligns with +v_world (the flat fingers point
                //   along v).
                if (fLen < 1e-6) continue;
                var fUnit = fDir.clone().normalize();
                var vProj = vDir.clone().sub(fUnit.clone().multiplyScalar(vDir.dot(fUnit)));
                if (vProj.length() < 1e-6) continue;
                vProj.normalize();
                var quatThumb = new THREE.Quaternion().setFromUnitVectors(
                    new THREE.Vector3(0, 1, 0), fUnit
                );
                var newLocalNegZ = new THREE.Vector3(0, 0, -1).applyQuaternion(quatThumb);
                newLocalNegZ.sub(fUnit.clone().multiplyScalar(newLocalNegZ.dot(fUnit))).normalize();
                var quatTwist = new THREE.Quaternion().setFromUnitVectors(newLocalNegZ, vProj);
                var finalQuat = quatTwist.clone().multiply(quatThumb);
                handObj.setRotationFromQuaternion(finalQuat);
            }

            // Update the F readout in #lorentz_sliders if visible
            if (stateDef.show_sliders) {
                var fReadout = document.getElementById("f_readout");
                if (fReadout) {
                    var vSlider = document.getElementById("v_slider");
                    var bSlider = document.getElementById("b_slider");
                    var thetaSlider = document.getElementById("theta_slider");
                    if (vSlider && bSlider && thetaSlider) {
                        var vAbs = parseFloat(vSlider.value) * 1e5;
                        var Bval = parseFloat(bSlider.value) * 1e-3;
                        var thetaDegSlider = parseFloat(thetaSlider.value);
                        var sinThetaSlider = Math.sin((thetaDegSlider * Math.PI) / 180);
                        var fNumeric = 1.602e-19 * vAbs * Bval * sinThetaSlider;
                        fReadout.textContent = "F = " + (fNumeric * 1e15).toFixed(3) + " fN";
                    }
                }
            }
        }

        // ── force_on_current_wire per-frame: drift carriers, current-flip,
        //    live F = current_dir·I·(L̂×B̂), |F| ∝ B·I·L·sinθ. ────────────────
        if (config.scenario_type === "force_on_current_wire" && stateDef) {
            var afF = config.ambient_field || { direction: [0, 1, 0] };
            var curF = config.current || { direction: [1, 0, 0], magnitude: 2 };
            var bUnitF = new THREE.Vector3(afF.direction[0], afF.direction[1], afF.direction[2]).normalize();
            var lUnitF = new THREE.Vector3(curF.direction[0], curF.direction[1], curF.direction[2]).normalize();

            // STATE_3 one-shot auto current-flip. Threshold is a state-local
            // sim-time offset (ms); compare against (time - stateStartTime)*1000
            // so the flip ALSO fires when the visual gate pins the clock past the
            // threshold via SET_TIME_FREEZE (PM_simTimeMs is this same sim-clock).
            // We do NOT leave fcwCurrentDir latched to -1 here: we set it directly
            // from whether sim-time has passed the threshold, so a re-pin BEFORE
            // the flip time correctly shows the pre-flip (forward) state too.
            var fcwStateMs = (time - stateStartTime) * 1000;
            if (fcwFlipAt !== null) {
                fcwCurrentDir = (fcwStateMs >= fcwFlipAt) ? -1 : 1;
            }

            // Read I, L, B, θ — from sliders in the interactive state, else from
            // config defaults + the per-state theta_deg.
            var thetaDegF = (typeof stateDef.theta_deg === "number") ? stateDef.theta_deg : 90;
            var Ival = curF.magnitude != null ? curF.magnitude : 2;
            var Lval = (config.slider_controls && config.slider_controls.L && config.slider_controls.L.default != null)
                ? config.slider_controls.L.default : 0.5;
            var Bval2 = afF.magnitude != null ? afF.magnitude : 0.5;
            if (stateDef.show_sliders) {
                var fiEl = document.getElementById("fcw_i_slider");
                var flEl = document.getElementById("fcw_l_slider");
                var fbEl = document.getElementById("fcw_b_slider");
                if (fiEl) Ival = parseFloat(fiEl.value);
                if (flEl) Lval = parseFloat(flEl.value);
                if (fbEl) Bval2 = parseFloat(fbEl.value);
            }
            var sinThetaF = Math.sin(thetaDegF * Math.PI / 180);

            // Effective current direction (sign-flipped) and F̂ = curDir·(L̂×B̂).
            var effLdir = lUnitF.clone().multiplyScalar(fcwCurrentDir);
            var fHatF = new THREE.Vector3().crossVectors(effLdir, bUnitF);
            var fRawLen = fHatF.length();
            if (fRawLen > 1e-6) fHatF.normalize(); else fHatF.set(0, 0, 1);
            // Visual length of the net F arrow: scale B·I·L·sinθ into a readable
            // 0..1.8 world-unit range (max F at I=5,L=1,B=1,θ=90 → B·I·L = 5).
            var fMag = Bval2 * Ival * Lval * Math.abs(sinThetaF);
            // Visible length: grow with B·I·L·sinθ but NEVER below a readable
            // floor (~0.9 world units) so a small |F| still reads as a bold arrow
            // rather than a tiny nub. In the interactive state it stretches up to
            // ~2.0 so the student sees it respond to the sliders.
            var FCW_F_MIN_LEN = 0.9;
            var fNetLen = Math.max(FCW_F_MIN_LEN, Math.min(2.0, 0.42 * fMag + FCW_F_MIN_LEN));

            // Per-frame element updates.
            for (var fwi = 0; fwi < sceneObjects.length; fwi++) {
                var fo = sceneObjects[fwi];
                var fud = fo.userData;
                if (!fud || !fud.elementType) continue;
                var fet = fud.elementType;

                if (fet === "fcw_current_arrow") {
                    // Orient cones along the (possibly flipped) current direction.
                    fo.setRotationFromQuaternion(
                        new THREE.Quaternion().setFromUnitVectors(
                            new THREE.Vector3(0, 1, 0), effLdir.clone().normalize()
                        )
                    );
                    // Drift the cones ALONG the wire so current visibly "flows"
                    // (marching-ants). Phase is derived from SIM-TIME (state-local
                    // seconds), mirroring the fcw_carrier block below, so the flow
                    // is deterministic AND still plays mid-flow when the visual gate
                    // pins the clock via SET_TIME_FREEZE (a wall-clock / !heldAtPin
                    // accumulator would freeze and re-trigger the D7 motion FAIL).
                    // Subtle/steady: one wire-length per ~3.6s. Direction follows
                    // the (flipped) current so cones reverse on the STATE_3 flip.
                    var FCW_CUR_DRIFT_RATE = 0.28;   // phase units per second
                    var curBasePhase = (typeof fud.phase === "number") ? fud.phase : 0;
                    var curSimSec = fcwStateMs / 1000;
                    var curDriftPhase = curBasePhase + FCW_CUR_DRIFT_RATE * curSimSec * fcwCurrentDir;
                    curDriftPhase = ((curDriftPhase % 1) + 1) % 1;
                    var curWHalfF = 1.8;
                    var curAlongF = (curDriftPhase * 2 - 1) * curWHalfF;   // -1.8 .. +1.8 along wire
                    fo.position.set(
                        lUnitF.x * curAlongF, lUnitF.y * curAlongF, lUnitF.z * curAlongF
                    );
                } else if (fet === "fcw_F_net") {
                    if (fo.visible) {
                        fo.setDirection(fHatF);
                        // Bold head: clamp head length to ~30% of the shaft but
                        // keep a generous floor so the cone never collapses.
                        var fHeadLen = Math.max(0.32, Math.min(0.5, fNetLen * 0.3));
                        fo.setLength(fNetLen, fHeadLen, 0.22);
                        // Thick shaft cylinder spanning tail→head-base. The
                        // ArrowHelper points the arrow along +y in its own frame,
                        // so the child cylinder (also +y-aligned) lines up; centre
                        // it at half the shaft length, scale Y to the shaft span.
                        if (fud.shaft) {
                            var shaftLen = Math.max(0.0001, fNetLen - fHeadLen);
                            fud.shaft.scale.set(1, shaftLen, 1);
                            fud.shaft.position.set(0, shaftLen / 2, 0);
                        }
                    }
                } else if (fet === "fcw_f_label") {
                    if (fo.visible) {
                        // Park the "F" label just BEYOND the arrow tip (not at the
                        // wire centre) so it clearly belongs to the arrow head.
                        var fLabOff = fNetLen + 0.35;
                        fo.position.set(fHatF.x * fLabOff, fHatF.y * fLabOff, fHatF.z * fLabOff);
                    }
                } else if (fet === "fcw_carrier") {
                    if (fo.visible) {
                        // Drift the carrier ALONG the wire so the wire visibly
                        // "flows". Phase is derived from SIM-TIME (state-local
                        // seconds) rather than a per-frame accumulator, so the
                        // drift is deterministic AND still shows the carriers
                        // mid-flow when the visual gate pins the clock (the old
                        // !heldAtPin accumulator froze them under a pin). One full
                        // traverse ~= 4.4s; direction follows the (flipped) current.
                        var FCW_DRIFT_RATE = 0.225;   // phase units per second
                        var basePhase = (typeof fud.phase === "number") ? fud.phase : 0;
                        var simSec = fcwStateMs / 1000;
                        var driftPhase = basePhase + FCW_DRIFT_RATE * simSec * fcwCurrentDir;
                        driftPhase = ((driftPhase % 1) + 1) % 1;
                        var wHalfF = 1.8;
                        var alongF = (driftPhase * 2 - 1) * wHalfF;   // -1.8 .. +1.8 along wire
                        fo.position.set(
                            lUnitF.x * alongF, lUnitF.y * alongF, lUnitF.z * alongF
                        );
                    }
                } else if (fet === "fcw_carrier_force") {
                    if (fo.visible) {
                        // Per-carrier force arrow: tail tracks its carrier, all
                        // parallel along F̂. (They visually stack into F_net.)
                        var carrier = null;
                        for (var cci = 0; cci < sceneObjects.length; cci++) {
                            var cco = sceneObjects[cci];
                            if (cco.userData && cco.userData.elementType === "fcw_carrier" &&
                                cco.userData.id === "fcw_carrier_" + fud.carrierIndex) { carrier = cco; break; }
                        }
                        if (carrier) {
                            fo.position.copy(carrier.position);
                            fo.setDirection(fHatF);
                        }
                    }
                }
            }

            // Update the STATE_7 readout (also written by the slider handler;
            // recomputed here in case the auto-flip / state-sync changed θ).
            if (stateDef.show_sliders) {
                var fcwRead = document.getElementById("fcw_f_readout");
                if (fcwRead) fcwRead.textContent = "F = " + fMag.toFixed(2) + " N";
            }
        }

        renderer.render(scene, camera);
    }

    // ── Resize ────────────────────────────────────────────────────────────
    window.addEventListener("resize", function() {
        if (!renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ── postMessage bridge ────────────────────────────────────────────────
    function setupPostMessage() {
        window.addEventListener("message", function(e) {
            var data = e.data;
            if (!data || !data.type) return;

            switch (data.type) {
                case "INIT_CONFIG":
                    if (data.config) {
                        window.SIM_CONFIG = data.config;
                        config = data.config;
                        if (!isMobile) {
                            buildScenario();
                        } else {
                            renderMobileSVG();
                        }
                    }
                    parent.postMessage({ type: "SIM_READY" }, "*");
                    break;

                case "SET_STATE":
                    var newState = data.state || data.payload;
                    if (newState && config.states[newState]) {
                        // A new state must never start under a stale time pin
                        // (SET_TIME_FREEZE without a matching release).
                        freezeAtTime = null;
                        if (!isMobile) {
                            applyState(newState);
                        } else {
                            PM_currentState = newState;
                            renderMobileSVG();
                        }
                        parent.postMessage({ type: "STATE_REACHED", state: newState }, "*");
                    }
                    break;

                case "PING":
                    parent.postMessage({ type: "PONG" }, "*");
                    break;

                case "RESET_TRAJECTORY":
                    // Founder note 2026-05-14 — STATE_3 entry phase: when ▶
                    // Play TTS is clicked, replay the trajectory from t=0 so
                    // the proton's entry into the field plays in sync with the
                    // narration. Also clears the particle_trail so the visible
                    // path matches the replayed motion.
                    stateStartTime = time;
                    lorentzTrailResetPending = true;
                    break;

                case "SET_GLOW":
                    // Diamond #2: TTS-driven highlight. data.target is a single
                    // string OR an array of strings (co-glow). Valid values:
                    //   'v' | 'f' | 'v_parallel' | 'v_perp' | 'b'
                    // | 'trail' | 'hand' | 'fleming' | 'sliders'
                    // | 'fleming_index' | 'fleming_middle' | 'fleming_thumb'
                    // | null (clears).
                    if (Array.isArray(data.target)) {
                        glowTargets = data.target.slice();
                    } else if (data.target) {
                        glowTargets = [data.target];
                    } else {
                        glowTargets = [];
                    }
                    // HTML overlays (Fleming SVG, sliders panel) glow via a CSS
                    // class — see #fleming_overlay / #lorentz_sliders + the
                    // .glow-pulse keyframes in the iframe <style> block. 3D-
                    // scene elements (arrows, trail, hand, B grid) pulse via
                    // glowFactor() inside the animate loop above.
                    var flemingEl = document.getElementById("fleming_overlay");
                    if (flemingEl) flemingEl.classList.toggle("glow-pulse", glowTargets.indexOf("fleming") >= 0);
                    var slidersEl = document.getElementById("lorentz_sliders");
                    if (slidersEl) slidersEl.classList.toggle("glow-pulse", glowTargets.indexOf("sliders") >= 0);
                    // Per-finger Fleming SVG glow (founder note 2026-05-14):
                    // s5_2a/b/c name one finger at a time — index / middle /
                    // thumb. Each finger is a <g> wrapper around its phalanx
                    // line + nail + arrow shaft + arrowhead + labels; the
                    // .glow-finger class drives an SVG-friendly drop-shadow
                    // pulse via @keyframes flemingFingerGlow.
                    var fingerMap = {
                        fleming_index:  "fleming_index_finger",
                        fleming_middle: "fleming_middle_finger",
                        fleming_thumb:  "fleming_thumb"
                    };
                    for (var fkey in fingerMap) {
                        var fEl = document.getElementById(fingerMap[fkey]);
                        if (fEl) fEl.classList.toggle("glow-finger", glowTargets.indexOf(fkey) >= 0);
                    }
                    break;

                case "SET_FREEZE_PROTON":
                    // Diamond #2 pause+co-glow: snapshot the local trajectory
                    // time so the proton (and the v / F arrows attached to it)
                    // stop translating while the TTS narrates the F arrow.
                    // Glow + hand cycle keep ticking — only position is frozen.
                    if (data.frozen) {
                        protonFreezeAt = time - stateStartTime;
                    } else {
                        protonFreezeAt = null;
                    }
                    break;

                case "SET_HAND_PHASE":
                    // Diamond #2 pause+co-glow: lock the 3D right-hand at the
                    // 'v', 'b', or 'f' phase while a TTS sentence speaks. The
                    // animate-loop curlT logic checks heldHandPhase first and
                    // skips the 9-sec cycle when set. Null resumes cycling.
                    heldHandPhase = data.phase || null;
                    break;

                case "SET_TIME_FREEZE":
                    // Visual-validator regression capture: pin virtual time at
                    // stateStartTime + at_ms/1000 (see freezeAtTime declaration
                    // for the determinism contract + compass caveat). Callers
                    // send RESET_TRAJECTORY first so the pin is state-local.
                    if (data.frozen === false) {
                        freezeAtTime = null;
                    } else {
                        var freezeOffsetMs = typeof data.at_ms === "number" && data.at_ms > 0 ? data.at_ms : 1500;
                        freezeAtTime = stateStartTime + freezeOffsetMs / 1000;
                    }
                    break;

                case "SET_TIME_JUMP":
                    // Live-viewer scrubber: instantly set the clock to a state-local
                    // ms (forward OR backward) and hold there. Unlike SET_TIME_FREEZE
                    // (which advances forward to the pin), this is an immediate set —
                    // used only by the interactive review player, never the
                    // deterministic visual gate. Reveals are pure functions of
                    // (time - stateStartTime), so they re-evaluate at the new time;
                    // per-frame accumulators (e.g. lorentz trail) do not un-draw.
                    var jumpMs = typeof data.at_ms === "number" && data.at_ms >= 0 ? data.at_ms : 0;
                    time = stateStartTime + jumpMs / 1000;
                    freezeAtTime = time;
                    break;

                case "SET_MATH":
                    // Diamond #2 retrofit (2026-05-11): TTS-driven equation
                    // panel. data.expression is a LaTeX string (or null/'' to
                    // clear). data.persist=true appends; false replaces.
                    // Renders via KaTeX (CDN-loaded in the iframe head).
                    handleSetMath(data.expression, !!data.persist);
                    break;

                case "SET_LOOP_ANGLE":
                    // Diamond #3: external controller (e.g. theta slider or
                    // TTS-driven cue) sets the current loop angle θ relative
                    // to B in degrees. Cancels any rotation_mode auto-advance.
                    if (config.scenario_type === "torque_on_loop_uniform_field") {
                        var lgM = findTorqueLoopGroup();
                        if (lgM && typeof data.theta_deg === "number") {
                            lgM.userData.rotation_mode = "manual";
                            applyTorqueLoopTheta(lgM, data.theta_deg);
                        }
                    }
                    break;

                case "REPLAY_ANIMATIONS":
                    // Admin-harness hook: rewind one-shot time-driven animations
                    // (bar-magnet swap, slow_rotation flip) so they play in sync
                    // with TTS narration when the founder clicks ▶ Play TTS.
                    // Continuous modes (theta_sweep, oscillation) restart from
                    // phi=0 for a clean visual reset.
                    if (config.scenario_type === "torque_on_loop_uniform_field") {
                        var lgR = findTorqueLoopGroup();
                        if (lgR) {
                            var initT = lgR.userData.rotation_init_theta_deg;
                            if (typeof initT === "number") applyTorqueLoopTheta(lgR, initT);
                            lgR.userData.rotation_start_time = time;
                            if (lgR.userData.barSwapEnabled) {
                                lgR.userData.barSwapStartTime = time;
                            }
                        }
                    }
                    break;
            }
        });
    }

    function handleSetMath(expression, persist) {
        var panel = document.getElementById("equation_panel");
        if (!panel) return;
        var clearing = expression === null || expression === undefined || expression === "";
        if (clearing) {
            if (!persist) {
                panel.innerHTML = "";
                panel.style.display = "none";
            }
            return;
        }
        if (!persist) {
            panel.innerHTML = "";
        } else {
            // Dim previously-shown lines so the newest sits visually on top.
            var prevLines = panel.querySelectorAll(".equation_line");
            for (var pi = 0; pi < prevLines.length; pi++) prevLines[pi].classList.add("dim");
        }
        var line = document.createElement("div");
        line.className = "equation_line";
        try {
            if (typeof window.katex !== "undefined") {
                window.katex.render(expression, line, {
                    throwOnError: false, displayMode: false, output: "html"
                });
            } else {
                line.textContent = expression;
            }
        } catch (e) {
            line.textContent = expression;
        }
        panel.appendChild(line);
        panel.style.display = "block";
    }

    // ── Mobile 2D SVG fallback ────────────────────────────────────────────
    function showMobileFallback() {
        var container = document.getElementById("mobile-fallback");
        if (container) container.style.display = "block";
        renderMobileSVG();
    }

    function renderMobileSVG() {
        var container = document.getElementById("mobile-fallback");
        if (!container) return;

        var w = window.innerWidth;
        var h = window.innerHeight;
        var cx = w / 2, cy = h / 2;
        var stateDef = config.states[PM_currentState] || {};
        var scenario = config.scenario_type;
        var textCol = config.pvl_colors ? config.pvl_colors.text : "#D4D4D8";
        var posCol = config.pvl_colors ? config.pvl_colors.positive : "#EF5350";
        var negCol = config.pvl_colors ? config.pvl_colors.negative : "#42A5F5";
        var flCol = config.field_lines ? config.field_lines.color_positive : "#FFF176";

        var svg = '<svg width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg">';
        svg += '<rect width="100%" height="100%" fill="' + (config.pvl_colors ? config.pvl_colors.background : '#0A0A1A') + '"/>';

        // Caption
        svg += '<text x="' + cx + '" y="30" fill="' + textCol + '" font-size="14" text-anchor="middle" font-family="system-ui">' + (stateDef.caption || '') + '</text>';

        if (scenario === "point_charge_positive" || scenario === "point_charge_negative") {
            var sign = scenario === "point_charge_positive" ? 1 : -1;
            var col = sign > 0 ? posCol : negCol;
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="20" fill="' + col + '"/>';
            svg += '<text x="' + cx + '" y="' + (cy + 5) + '" fill="white" font-size="16" text-anchor="middle">' + (sign > 0 ? '+' : '\\u2212') + '</text>';
            for (var i = 0; i < 8; i++) {
                var angle = (i / 8) * Math.PI * 2;
                var r1 = 30, r2 = 100;
                var x1 = cx + r1 * Math.cos(angle), y1 = cy + r1 * Math.sin(angle);
                var x2 = cx + r2 * Math.cos(angle), y2 = cy + r2 * Math.sin(angle);
                svg += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + flCol + '" stroke-width="2" opacity="0.7"/>';
                // arrowhead
                var ax = cx + (r2 - 10) * Math.cos(angle), ay = cy + (r2 - 10) * Math.sin(angle);
                svg += '<circle cx="' + ax + '" cy="' + ay + '" r="3" fill="' + flCol + '"/>';
            }
        } else if (scenario === "dipole") {
            svg += '<circle cx="' + (cx - 80) + '" cy="' + cy + '" r="18" fill="' + posCol + '"/>';
            svg += '<text x="' + (cx - 80) + '" y="' + (cy + 5) + '" fill="white" font-size="14" text-anchor="middle">+</text>';
            svg += '<circle cx="' + (cx + 80) + '" cy="' + cy + '" r="18" fill="' + negCol + '"/>';
            svg += '<text x="' + (cx + 80) + '" y="' + (cy + 5) + '" fill="white" font-size="14" text-anchor="middle">\\u2212</text>';
            for (var i = 0; i < 6; i++) {
                var offset = (i - 2.5) * 25;
                svg += '<path d="M' + (cx - 60) + ',' + (cy + offset) + ' Q' + cx + ',' + (cy + offset - 40) + ' ' + (cx + 60) + ',' + (cy + offset) + '" fill="none" stroke="' + flCol + '" stroke-width="1.5" opacity="0.6"/>';
            }
        } else if (scenario === "parallel_plates") {
            svg += '<rect x="' + (cx - 100) + '" y="' + (cy - 80) + '" width="8" height="160" fill="' + posCol + '"/>';
            svg += '<rect x="' + (cx + 92) + '" y="' + (cy - 80) + '" width="8" height="160" fill="' + negCol + '"/>';
            for (var i = 0; i < 5; i++) {
                var yy = cy - 60 + i * 30;
                svg += '<line x1="' + (cx - 88) + '" y1="' + yy + '" x2="' + (cx + 88) + '" y2="' + yy + '" stroke="' + flCol + '" stroke-width="1.5" opacity="0.6"/>';
            }
        } else if (scenario === "lorentz_force_uniform_field") {
            // Minimal 2D projection: ⊗ grid for B into page, orange particle in
            // the middle, green circular trajectory if the state demands it.
            // Full interactive Three.js trajectory is desktop-only for V1.
            for (var bx = -2; bx <= 2; bx++) {
                for (var by = -2; by <= 2; by++) {
                    var gx = cx + bx * 60;
                    var gy = cy + by * 60;
                    svg += '<circle cx="' + gx + '" cy="' + gy + '" r="6" fill="none" stroke="#42A5F5" stroke-width="1.2" opacity="0.55"/>';
                    svg += '<line x1="' + (gx - 4) + '" y1="' + (gy - 4) + '" x2="' + (gx + 4) + '" y2="' + (gy + 4) + '" stroke="#42A5F5" stroke-width="1.2" opacity="0.55"/>';
                    svg += '<line x1="' + (gx - 4) + '" y1="' + (gy + 4) + '" x2="' + (gx + 4) + '" y2="' + (gy - 4) + '" stroke="#42A5F5" stroke-width="1.2" opacity="0.55"/>';
                }
            }
            var modeM = stateDef.trajectory_mode || "static";
            if (modeM === "circle" || modeM === "helix") {
                svg += '<circle cx="' + cx + '" cy="' + cy + '" r="80" fill="none" stroke="#FFCC9F" stroke-width="2" opacity="0.7" stroke-dasharray="6 4"/>';
            }
            svg += '<circle cx="' + (cx + 80) + '" cy="' + cy + '" r="9" fill="#FFB366"/>';
            // v arrow (orange)
            svg += '<line x1="' + (cx + 80) + '" y1="' + cy + '" x2="' + (cx + 80) + '" y2="' + (cy - 50) + '" stroke="#FFAB40" stroke-width="2.5"/>';
            svg += '<polygon points="' + (cx + 80) + ',' + (cy - 56) + ' ' + (cx + 75) + ',' + (cy - 46) + ' ' + (cx + 85) + ',' + (cy - 46) + '" fill="#FFAB40"/>';
            svg += '<text x="' + (cx + 90) + '" y="' + (cy - 40) + '" fill="#FFAB40" font-size="12" font-style="italic">v</text>';
            // F arrow (green) — points toward centre
            svg += '<line x1="' + (cx + 80) + '" y1="' + cy + '" x2="' + (cx + 35) + '" y2="' + cy + '" stroke="#66BB6A" stroke-width="2.5"/>';
            svg += '<polygon points="' + (cx + 29) + ',' + cy + ' ' + (cx + 39) + ',' + (cy - 5) + ' ' + (cx + 39) + ',' + (cy + 5) + '" fill="#66BB6A"/>';
            svg += '<text x="' + (cx + 45) + '" y="' + (cy - 8) + '" fill="#66BB6A" font-size="12" font-style="italic" font-weight="700">F</text>';
        } else {
            svg += '<text x="' + cx + '" y="' + cy + '" fill="' + textCol + '" font-size="16" text-anchor="middle">3D view — rotate on desktop</text>';
        }

        svg += '<text x="' + cx + '" y="' + (h - 15) + '" fill="' + textCol + '" font-size="11" text-anchor="middle" opacity="0.6">Rotate on desktop for full 3D</text>';
        svg += '</svg>';

        container.innerHTML = svg;

        // Also update caption
        var captionEl = document.getElementById("caption");
        if (captionEl) captionEl.textContent = stateDef.caption || "";
    }

    // ── Initialize ────────────────────────────────────────────────────────
    setupPostMessage();
    setupSliders();
    buildScenario();
    animate();

    // Fire SIM_READY after a short delay to ensure rendering is stable
    setTimeout(function() {
        parent.postMessage({ type: "SIM_READY" }, "*");
    }, 300);

})();
`;
