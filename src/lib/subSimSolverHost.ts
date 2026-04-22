/**
 * Server-side solver host for sub-simulation layouts.
 *
 * Given a `ParametricConfig` (the same object that ships to the iframe via
 * `assembleParametricHtml`), walk every state's `scene_composition` and
 * resolve layout-relationship primitives to pixel positions using
 * `ConstraintSolver`. Writes `_solverPosition: {x, y}` onto each solved
 * primitive; the iframe draw functions prefer this field over the raw
 * `position`.
 *
 * Why server-side?
 *   - `ConstraintSolver` is a TypeScript class using `@lume/kiwi` — bundling
 *     it into the iframe string would require a build-time step we don't
 *     otherwise need.
 *   - Solver output is deterministic given the config, so running it once
 *     during cache assembly is equivalent to running it on every iframe
 *     load and cheaper.
 *   - Text widths are approximated server-side (±15 % of p5.textWidth),
 *     which is within solver tolerance for gap/alignment computations.
 *
 * Off by default. Enable via the `SUB_SIM_SOLVER_ENABLED` env flag or by
 * calling with an explicit `{ enabled: true }` option.
 */

import {
    ConstraintSolver,
    type Edge,
    type Point,
    type Priority,
} from "./constraintSolver";

// ── Mirrors PM_ZONES in parametric_renderer.ts (line 1938–1944) ─────
const ZONES: Record<string, { x: number; y: number; w: number; h: number }> = {
    MAIN_ZONE: { x: 30, y: 80, w: 430, h: 380 },
    CALLOUT_ZONE_R: { x: 475, y: 80, w: 255, h: 200 },
    FORMULA_ZONE: { x: 475, y: 290, w: 255, h: 170 },
    CONTROL_ZONE: { x: 30, y: 460, w: 700, h: 40 },
    TITLE_ZONE: { x: 30, y: 10, w: 700, h: 60 },
};

// Slot offsets within CALLOUT_ZONE_R (matches PM_resolveAnchor line 1959–1961).
function resolveSlot(
    zoneName: string,
    slotIdx: number,
): Point | null {
    const zone = ZONES[zoneName];
    if (!zone) return null;
    const yOffsets = [10, 77, 144];
    const yo = yOffsets[slotIdx - 1];
    if (yo === undefined) return null;
    return { x: zone.x + 10, y: zone.y + yo };
}

interface BodyLike {
    id?: string;
    position?: { x?: number; y?: number };
    width?: number;
    height?: number;
    w?: number;
    h?: number;
    shape?: string;
    /** String form (v1) or object form (v2 prompt: {surface_id, position_fraction, orient_to_surface}) */
    attach_to_surface?: string | { surface_id?: string; position_fraction?: number };
    /** Legacy t_position field (0–1 fraction along surface) */
    t_position?: number;
}

interface SurfaceLike {
    id?: string;
    position?: { x?: number; y?: number };
    length?: number;
    angle?: number;
    orientation?: string;
}

interface PrimLike {
    id?: string;
    type?: string;
    text?: string;
    anchor?: string;
    edge?: Edge;
    gap?: number;
    priority?: Priority;
    width?: number;
    height?: number;
    font_size?: number;
    equation_expr?: string;
    equation?: string;
    formula_expr?: string;
    formula?: string;
    position?: { x?: number; y?: number };
    _solverPosition?: Point;
    _solverStatus?: "ok" | "relaxed" | "clamped" | "infeasible";
}

interface StateLike {
    scene_composition?: unknown[];
}

interface ConfigLike {
    default_variables?: Record<string, number>;
    states?: Record<string, StateLike>;
    scene_composition?: unknown[];
}

// Primitive types whose position is solver-managed.
const SOLVER_TARGETED = new Set([
    "label",
    "annotation",
    "formula_box",
]);

// Estimate rendered bounding box for a label/annotation/formula primitive
// using p5's default sans-serif metrics. Approximation (±15% of textWidth).
function estimateBBox(
    prim: PrimLike,
): { w: number; h: number } {
    if (prim.width !== undefined && prim.height !== undefined) {
        return { w: prim.width, h: prim.height };
    }

    const fontSize =
        typeof prim.font_size === "number" ? prim.font_size : 14;

    if (prim.type === "label") {
        const text = typeof prim.text === "string" ? prim.text : "";
        const lines = text.split("\n");
        const longestLineLen = lines.reduce(
            (max, line) => Math.max(max, line.length),
            0,
        );
        const approxCharW = fontSize * 0.55;
        return {
            w: Math.max(20, longestLineLen * approxCharW + 4),
            h: Math.max(fontSize, lines.length * fontSize * 1.25),
        };
    }

    if (prim.type === "annotation") {
        const text = typeof prim.text === "string" ? prim.text : "";
        const lines = text.split("\n");
        const longestLineLen = lines.reduce(
            (max, line) => Math.max(max, line.length),
            0,
        );
        const approxCharW = 12 * 0.55; // annotation is hardcoded 12px in drawAnnotation
        const boxW = longestLineLen * approxCharW + 16; // 2*padX=8
        const boxH = lines.length * 12 * 1.35 + 12; // 2*padY=6
        return { w: Math.max(40, boxW), h: Math.max(20, boxH) };
    }

    if (prim.type === "formula_box") {
        const src =
            prim.equation_expr ||
            prim.equation ||
            prim.formula_expr ||
            prim.formula ||
            "";
        const lines = String(src).split("\n");
        const longestLineLen = lines.reduce(
            (max, line) => Math.max(max, line.length),
            0,
        );
        const approxCharW = 14 * 0.55; // drawFormulaBox uses 14px bold
        const boxW = longestLineLen * approxCharW + 20; // 2*padding=20
        const boxH = lines.length * 18 + 20;
        return { w: Math.max(60, boxW), h: Math.max(30, boxH) };
    }

    return { w: 60, h: 20 };
}

interface BodyRegistry {
    [id: string]: { cx: number; cy: number; w: number; h: number };
}

interface SurfaceRegistry {
    [id: string]: { x0: number; y0: number; x1: number; y1: number };
}

/**
 * Build body + surface registries from a state's scene_composition, so that
 * anchor strings like "block.top_center" or "floor.mid" can be resolved
 * without running the iframe. This is a best-effort approximation — bodies
 * with `attach_to_surface` can't be fully resolved server-side because they
 * depend on the physics-engine-computed surface geometry. For those we fall
 * back to the surface's mid-point.
 */
function buildRegistries(
    primitives: PrimLike[],
    defaults: Record<string, number>,
): { bodies: BodyRegistry; surfaces: SurfaceRegistry } {
    const bodies: BodyRegistry = {};
    const surfaces: SurfaceRegistry = {};

    // First pass — surfaces.
    for (const prim of primitives) {
        if (!prim || prim.type !== "surface") continue;
        const s = prim as SurfaceLike;
        const id = s.id;
        if (!id) continue;
        const pos = s.position || {};
        const x0 = typeof pos.x === "number" ? pos.x : 100;
        const y0 = typeof pos.y === "number" ? pos.y : 400;
        const length = typeof s.length === "number" ? s.length : 200;
        const angleVal =
            typeof s.angle === "number"
                ? s.angle
                : typeof defaults.theta === "number"
                    ? defaults.theta
                    : 0;
        let x1 = x0;
        let y1 = y0;
        const orientation = s.orientation || "horizontal";
        if (orientation === "horizontal") {
            x1 = x0 + length;
            y1 = y0;
        } else if (orientation === "vertical") {
            x1 = x0;
            y1 = y0 - length;
        } else if (orientation === "inclined") {
            const rad = (angleVal * Math.PI) / 180;
            x1 = x0 + length * Math.cos(rad);
            y1 = y0 - length * Math.sin(rad);
        }
        surfaces[id] = { x0, y0, x1, y1 };
    }

    // Second pass — bodies.
    for (const prim of primitives) {
        if (!prim || prim.type !== "body") continue;
        const b = prim as BodyLike;
        const id = b.id;
        if (!id) continue;
        const pos = b.position || {};
        const w = typeof b.width === "number" ? b.width : b.w ?? 40;
        const h = typeof b.height === "number" ? b.height : b.h ?? 40;
        let cx = 0;
        let cy = 0;
        if (
            typeof pos.x === "number" &&
            typeof pos.y === "number"
        ) {
            cx = pos.x;
            cy = pos.y;
        } else if (b.attach_to_surface) {
            // Body sits on a surface. Estimate its center from the surface midpoint.
            // Handles both string form (v1) and object form (v2 prompt).
            const ats = b.attach_to_surface;
            const surfId =
                typeof ats === "string"
                    ? ats
                    : typeof ats === "object" && ats !== null && ats.surface_id
                        ? ats.surface_id
                        : null;
            const surf = surfId ? surfaces[surfId] : null;
            const t =
                typeof ats === "object" && ats !== null && typeof ats.position_fraction === "number"
                    ? ats.position_fraction
                    : typeof b.t_position === "number"
                        ? b.t_position
                        : 0.5;
            if (surf) {
                const surfMidX = surf.x0 + (surf.x1 - surf.x0) * t;
                const surfMidY = surf.y0 + (surf.y1 - surf.y0) * t;
                // Block center is ~half its height above the surface contact point.
                const perpAngle = Math.atan2(surf.y0 - surf.y1, surf.x1 - surf.x0);
                cx = surfMidX - (h / 2) * Math.sin(perpAngle);
                cy = surfMidY - (h / 2) * Math.cos(perpAngle);
            } else {
                // Surface not yet registered — fall back to MAIN_ZONE center.
                cx = ZONES.MAIN_ZONE.x + ZONES.MAIN_ZONE.w / 2;
                cy = ZONES.MAIN_ZONE.y + ZONES.MAIN_ZONE.h / 2;
            }
        } else {
            // No position info at all — centre of MAIN_ZONE.
            cx = ZONES.MAIN_ZONE.x + ZONES.MAIN_ZONE.w / 2;
            cy = ZONES.MAIN_ZONE.y + ZONES.MAIN_ZONE.h / 2;
        }
        bodies[id] = { cx, cy, w, h };
    }

    return { bodies, surfaces };
}

/**
 * Server-side port of PM_resolveAnchor (parametric_renderer.ts:1946).
 * Handles the same anchor grammar: zone, body, surface, `on_surface` parametric.
 */
export function resolveAnchorPoint(
    anchor: string,
    bodies: BodyRegistry,
    surfaces: SurfaceRegistry,
): Point | null {
    if (!anchor) return null;

    // Parametric surface: "on_surface:floor at:0.45"
    const parametricMatch = /^on_surface:([a-zA-Z_][\w]*)\s+at:([\d.]+)$/.exec(
        anchor,
    );
    if (parametricMatch) {
        const surfId = parametricMatch[1];
        const t = parseFloat(parametricMatch[2]);
        const s = surfaces[surfId];
        if (!s) return null;
        return {
            x: s.x0 + (s.x1 - s.x0) * t,
            y: s.y0 + (s.y1 - s.y0) * t,
        };
    }

    // Dotted form: "zone.subanchor", "body.subanchor", "surface.subanchor"
    const dotIdx = anchor.indexOf(".");
    if (dotIdx === -1) return null;
    const lhs = anchor.substring(0, dotIdx);
    const sub = anchor.substring(dotIdx + 1);

    // Zone
    const zone = ZONES[lhs];
    if (zone) {
        const slotMatch = /^slot_(\d+)$/.exec(sub);
        if (slotMatch) {
            return resolveSlot(lhs, parseInt(slotMatch[1], 10));
        }
        switch (sub) {
            case "center":
                return { x: zone.x + zone.w / 2, y: zone.y + zone.h / 2 };
            case "top_left":
                return { x: zone.x, y: zone.y };
            case "top_right":
                return { x: zone.x + zone.w, y: zone.y };
            case "bottom_left":
                return { x: zone.x, y: zone.y + zone.h };
            case "bottom_right":
                return { x: zone.x + zone.w, y: zone.y + zone.h };
            case "top_center":
                return { x: zone.x + zone.w / 2, y: zone.y };
            case "bottom_center":
                return { x: zone.x + zone.w / 2, y: zone.y + zone.h };
            default:
                return null;
        }
    }

    // Body
    const body = bodies[lhs];
    if (body) {
        switch (sub) {
            case "center":
                return { x: body.cx, y: body.cy };
            case "top":
            case "top_center":
                return { x: body.cx, y: body.cy - body.h / 2 };
            case "bottom":
            case "bottom_center":
                return { x: body.cx, y: body.cy + body.h / 2 };
            case "left":
                return { x: body.cx - body.w / 2, y: body.cy };
            case "right":
                return { x: body.cx + body.w / 2, y: body.cy };
            default:
                return null;
        }
    }

    // Surface
    const surf = surfaces[lhs];
    if (surf) {
        switch (sub) {
            case "start":
                return { x: surf.x0, y: surf.y0 };
            case "mid":
                return {
                    x: surf.x0 + (surf.x1 - surf.x0) / 2,
                    y: surf.y0 + (surf.y1 - surf.y0) / 2,
                };
            case "end":
                return { x: surf.x1, y: surf.y1 };
            default:
                return null;
        }
    }

    return null;
}

export interface SolveHostOptions {
    enabled?: boolean;
    canvasWidth?: number;
    canvasHeight?: number;
}

export interface SolveHostResult {
    ran: boolean;
    statesTouched: number;
    primitivesResolved: number;
    warnings: string[];
}

function isSolverEnabledFromEnv(): boolean {
    const v = process.env.SUB_SIM_SOLVER_ENABLED;
    if (v == null) return false;
    return v === "1" || v === "true" || v === "on";
}

/**
 * In-place mutate a config: annotate solver-targeted primitives with
 * `_solverPosition`. Off by default — caller opts in via `{enabled: true}`
 * or `SUB_SIM_SOLVER_ENABLED=1` in the environment.
 */
export function solveSubSimLayout(
    config: ConfigLike,
    options: SolveHostOptions = {},
): SolveHostResult {
    const enabled = options.enabled ?? isSolverEnabledFromEnv();
    if (!enabled) {
        console.log(`[subSimSolverHost] enabled=false (SUB_SIM_SOLVER_ENABLED not set) — skipping`);
        return { ran: false, statesTouched: 0, primitivesResolved: 0, warnings: [] };
    }

    const defaults = config.default_variables ?? {};
    const warnings: string[] = [];
    let statesTouched = 0;
    let primitivesResolved = 0;

    const states = config.states ?? {};
    const stateKeys = Object.keys(states);
    if (stateKeys.length === 0 && Array.isArray(config.scene_composition)) {
        // Flat config (no states map). Treat as one state.
        solveOneScene(config.scene_composition as PrimLike[], defaults, warnings, options, (n) => {
            statesTouched = 1;
            primitivesResolved += n;
        });
    } else {
        for (const key of stateKeys) {
            const state = states[key];
            const scene = state?.scene_composition;
            if (!Array.isArray(scene)) continue;
            solveOneScene(scene as PrimLike[], defaults, warnings, options, (n) => {
                statesTouched += 1;
                primitivesResolved += n;
            });
        }
    }

    console.log(
        `[subSimSolverHost] enabled=true states=${statesTouched} primitives_resolved=${primitivesResolved} warnings=${warnings.length}`,
    );
    if (warnings.length > 0) {
        console.warn("[subSimSolverHost] warnings:", warnings.slice(0, 5));
    }
    return { ran: true, statesTouched, primitivesResolved, warnings };
}

function solveOneScene(
    primitives: PrimLike[],
    defaults: Record<string, number>,
    warnings: string[],
    options: SolveHostOptions,
    onDone: (resolvedCount: number) => void,
): void {
    const { bodies, surfaces } = buildRegistries(primitives, defaults);
    const solver = new ConstraintSolver();
    let addedTargets = 0;

    // Register fixed rectangles for bodies so solver avoids them.
    for (const [id, body] of Object.entries(bodies)) {
        solver.addFixed(id, {
            x: body.cx - body.w / 2,
            y: body.cy - body.h / 2,
            w: body.w,
            h: body.h,
        });
    }

    for (const prim of primitives) {
        if (!prim || typeof prim.type !== "string") continue;
        if (!SOLVER_TARGETED.has(prim.type)) continue;
        if (!prim.id) continue;
        // Only engage solver when the primitive declares a relationship.
        if (typeof prim.anchor !== "string") continue;

        const anchorPoint = resolveAnchorPoint(prim.anchor, bodies, surfaces);
        if (!anchorPoint) {
            warnings.push(
                `Unresolved anchor "${prim.anchor}" on ${prim.id}; skipping.`,
            );
            continue;
        }

        const bbox = estimateBBox(prim);
        solver.addPrimitive({
            id: prim.id,
            w: bbox.w,
            h: bbox.h,
            anchorPoint,
            edge: prim.edge,
            gap: prim.gap,
            priority: prim.priority,
        });
        addedTargets += 1;
    }

    if (addedTargets === 0) {
        onDone(0);
        return;
    }

    const result = solver.solve({
        canvasWidth: options.canvasWidth,
        canvasHeight: options.canvasHeight,
    });

    for (const prim of primitives) {
        if (!prim.id) continue;
        const pos = result.positions.get(prim.id);
        if (!pos) continue;
        // Translate top-left corner back to the coordinate convention each
        // draw function expects:
        //   - label: drawLabel uses center — need center_x, center_y
        //   - annotation: drawAnnotation uses top-left of text block (pos is text origin before pad shift)
        //   - formula_box: drawFormulaBox uses top-left of outer rect
        const bbox = estimateBBox(prim);
        if (prim.type === "label") {
            prim._solverPosition = {
                x: pos.x + bbox.w / 2,
                y: pos.y + bbox.h / 2,
            };
        } else {
            prim._solverPosition = { x: pos.x, y: pos.y };
        }
        if (result.relaxed.includes(prim.id)) {
            prim._solverStatus = "relaxed";
        } else if (result.clamped.includes(prim.id)) {
            prim._solverStatus = "clamped";
        } else {
            prim._solverStatus = "ok";
        }
    }

    for (const w of result.warnings) warnings.push(w);
    if (result.infeasible) {
        warnings.push("Solver could not resolve all overlaps after max iterations.");
    }
    onDone(addedTargets);
}
