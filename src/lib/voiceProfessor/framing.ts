/**
 * framing.ts — deterministic camera-framing decision for the voice professor.
 *
 * "The engine is the eyes, the AI is the director." Whether an object is VISIBLE
 * from the viewer's current camera is a geometric fact, not a model judgment. An
 * arrow whose direction is PARALLEL to the camera's view axis projects to a dot
 * (unreadable); one PERPENDICULAR to it lies in the image plane (fully readable).
 * So framing "badness" = |objectDir · viewAxis|  (1 = a dot/worst, 0 = full/best).
 *
 * Fully general (no per-concept geometry): the object's real world direction is
 * REPORTED by the renderer each frame (OBJECT_DIRS), and the actual camera axis is
 * reported too (CAMERA_VIEW). This module only DECIDES whether to reframe; the
 * renderer computes the exact camera angle (frame_object) from the same live
 * direction. The AI names the object; the verified engine computes the angle —
 * the Rule-18 line, same as the op-whitelist.
 */

type Vec3 = [number, number, number];

function norm(v: Vec3): Vec3 {
    const m = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / m, v[1] / m, v[2] / m];
}
function dot(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/** View axis (unit, camera → origin) from an authored per-state camera_position. */
export function axisFromCameraPosition(pos: Vec3): Vec3 {
    const a = norm(pos);
    return [-a[0], -a[1], -a[2]];
}

/** |direction · viewAxis| — 1 = arrow points at the camera (a dot), 0 = fully in-plane. */
export function framingBadness(direction: Vec3, viewAxis: Vec3): number {
    return Math.abs(dot(norm(direction), norm(viewAxis)));
}

// Spoken-friendly names for the glow tokens (used in the "let me turn this…" line).
const GLOW_LABEL: Record<string, string> = {
    v: "velocity",
    f: "force",
    b: "magnetic field",
    v_parallel: "part of the velocity along the field",
    v_perp: "part of the velocity across the field",
};

// Reframe only when the object is genuinely hard to see (within ~53° of the view
// axis). The renderer then computes the exact angle; we just gate the narration.
const POORLY_FRAMED = 0.6;

export interface ReframePick {
    token: string;       // the glow token to frame (e.g. "v_parallel")
    glowLabel: string;   // spoken name of the object
    badness: number;     // how foreshortened it is from the current view (0..1)
}

/**
 * Of the highlighted objects, the WORST-framed one from the viewer's current camera —
 * the one worth turning to see — or null if they're all already readable / unknown.
 * Uses the renderer-REPORTED live directions, so it works for any concept.
 */
export function chooseReframeTarget(
    tokens: string[],
    reportedDirs: Record<string, Vec3> | null | undefined,
    currentViewAxis: Vec3 | null,
): ReframePick | null {
    if (!reportedDirs || !currentViewAxis || tokens.length === 0) return null;
    let worst: ReframePick | null = null;
    for (const tok of tokens) {
        const dir = reportedDirs[tok];
        if (!dir) continue; // non-vector token (trail / hand / sliders) or not reported
        const badness = framingBadness(dir, currentViewAxis);
        if (badness >= POORLY_FRAMED && (!worst || badness > worst.badness)) {
            worst = { token: tok, glowLabel: GLOW_LABEL[tok] ?? tok, badness };
        }
    }
    return worst;
}

// ── Named views (the renderer's applyCameraView presets) — kept ONLY to describe,
//    in plain words, roughly where the student is currently looking, as a hint for
//    the generative prompt. The framing DECISION above no longer picks among them. ──
interface ViewDef { theta: number; phi: number; radius: number; label: string }
const NAMED_VIEWS: Record<string, ViewDef> = {
    default: { theta: Math.PI / 4, phi: Math.PI / 3, radius: 8, label: "the standard angle" },
    face_on: { theta: Math.PI / 4, phi: 0.18, radius: 8, label: "looking down the field" },
    edge_on: { theta: 0, phi: Math.PI / 2, radius: 9, label: "from the side" },
    top: { theta: Math.PI / 4, phi: 0.5, radius: 9, label: "from above" },
};
function sphericalAxis(v: ViewDef): Vec3 {
    const x = v.radius * Math.sin(v.phi) * Math.cos(v.theta);
    const y = v.radius * Math.cos(v.phi);
    const z = v.radius * Math.sin(v.phi) * Math.sin(v.theta);
    const a = norm([x, y, z]);
    return [-a[0], -a[1], -a[2]];
}

/** Coarse label for the named view nearest the current axis — a cheap hint for the
 *  generative prompt ("the student is currently viewing it from … "). */
export function describeViewAxis(axis: Vec3 | null): string | null {
    if (!axis) return null;
    let best: { label: string; d: number } | null = null;
    for (const name of Object.keys(NAMED_VIEWS)) {
        const d = framingBadness(axis, sphericalAxis(NAMED_VIEWS[name])); // 1 = same line
        if (!best || d > best.d) best = { label: NAMED_VIEWS[name].label, d };
    }
    return best ? best.label : null;
}
