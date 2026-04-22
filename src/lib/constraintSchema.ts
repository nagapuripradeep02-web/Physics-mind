/**
 * Zod schema for the sub-sim primitive *relationship* vocabulary.
 *
 * This validates the layout side of Sonnet-emitted primitives for deep-dive
 * and drill-down sub-sims. Physics fields (force magnitudes, vectors,
 * formulas, TTS) are out of scope here — they go through their own schemas
 * in the generator modules.
 *
 * Design note: every field is optional. Legacy pixel-position payloads
 * (`position: {x, y}`) still pass validation — they just don't engage the
 * solver. This lets existing cached sub-sims keep working while the LLM
 * contract migrates.
 */

import { z } from "zod";

export const PRIORITY_VALUES = ["required", "strong", "medium", "weak"] as const;
export const EDGE_VALUES = ["top", "right", "bottom", "left"] as const;

export const PrimitivePriority = z.enum(PRIORITY_VALUES);
export const PrimitiveEdge = z.enum(EDGE_VALUES);

/**
 * Anchor string grammar — purely syntactic validation. Actual resolution
 * happens at render time via `PM_resolveAnchor`.
 *
 * Accepted forms (mirrors PM_resolveAnchor in parametric_renderer.ts):
 *   - Zone: "MAIN_ZONE.center", "CALLOUT_ZONE_R.slot_1", etc.
 *   - Body: "block.top", "block.bottom_center", "wedge.left"
 *   - Surface: "floor.start", "floor.mid", "incline.end"
 *   - Parametric surface: "on_surface:floor at:0.45"
 */
const ANCHOR_PATTERN =
    /^(?:on_surface:[a-zA-Z_][\w]*\s+at:(?:0?\.\d+|1(?:\.0+)?|0)|[a-zA-Z_][\w]*\.[a-zA-Z_][\w]*)$/;

export const AnchorString = z
    .string()
    .regex(ANCHOR_PATTERN, {
        message:
            "anchor must be like 'MAIN_ZONE.center', 'block.top_center', 'floor.mid', or 'on_surface:floor at:0.45'",
    });

/**
 * Relationship fields accepted on every primitive. Legacy `position` is
 * allowed alongside — solver falls back to it as a weak suggestion.
 */
export const PrimitiveLayoutFields = z.object({
    anchor: AnchorString.optional(),
    edge: PrimitiveEdge.optional(),
    gap: z.number().min(0).max(200).optional(),
    align: AnchorString.optional(),
    avoid: z.array(z.string()).optional(),
    priority: PrimitivePriority.optional(),
    /**
     * Optional explicit dimensions — labels/formulas without this hint will
     * be measured via p5.textWidth() at render time.
     */
    width: z.number().min(1).max(760).optional(),
    height: z.number().min(1).max(500).optional(),
    /** Legacy absolute position, demoted to a weak suggestion. */
    position: z
        .object({
            x: z.number(),
            y: z.number(),
        })
        .optional(),
});

export type PrimitiveLayout = z.infer<typeof PrimitiveLayoutFields>;

/**
 * Per-primitive check used by deep-dive / drill-down generators.
 *
 * Returns a list of violation strings (empty = ok). Non-throwing by design
 * so callers can attach the list to `review_notes` when Sonnet produces
 * partially-valid output.
 */
export interface LayoutViolation {
    primitiveId: string;
    code:
        | "missing_layout_hint"
        | "pixel_only"
        | "invalid_anchor"
        | "invalid_edge"
        | "invalid_priority";
    message: string;
}

export interface PrimitiveForValidation {
    id?: unknown;
    anchor?: unknown;
    edge?: unknown;
    gap?: unknown;
    align?: unknown;
    priority?: unknown;
    position?: unknown;
    type?: unknown;
}

/**
 * Types that are *scene-positioned by the solver* (must match
 * `SOLVER_TARGETED` in subSimSolverHost.ts:103-107). Other types —
 * surface, body, force_arrow, vector, force_components, angle_arc,
 * motion_path, comparison_panel — have their own positioning logic
 * (anchor-to-body via `from`/`origin_body_id`, attach_to_surface, etc.)
 * and are excluded from this check to avoid false "missing_layout_hint"
 * violations.
 */
const SOLVER_TARGETED_TYPES = new Set([
    "label",
    "annotation",
    "formula_box",
]);

export function validatePrimitiveLayout(
    primitive: PrimitiveForValidation,
    options: { requireRelationships?: boolean } = {},
): LayoutViolation[] {
    const violations: LayoutViolation[] = [];
    const id = typeof primitive.id === "string" ? primitive.id : "(unknown)";
    const type = typeof primitive.type === "string" ? primitive.type : "";

    // Only check solver-targeted primitive types.
    if (!SOLVER_TARGETED_TYPES.has(type)) return violations;

    const hasAnchor = typeof primitive.anchor === "string";
    const hasPosition =
        primitive.position != null &&
        typeof primitive.position === "object" &&
        "x" in (primitive.position as Record<string, unknown>);

    if (hasAnchor) {
        const parsed = AnchorString.safeParse(primitive.anchor);
        if (!parsed.success) {
            violations.push({
                primitiveId: id,
                code: "invalid_anchor",
                message: `Anchor "${String(primitive.anchor)}" does not match the expected grammar.`,
            });
        }
    }

    if (primitive.edge !== undefined) {
        const parsed = PrimitiveEdge.safeParse(primitive.edge);
        if (!parsed.success) {
            violations.push({
                primitiveId: id,
                code: "invalid_edge",
                message: `edge must be one of ${EDGE_VALUES.join("|")} (got ${String(primitive.edge)}).`,
            });
        }
    }

    if (primitive.priority !== undefined) {
        const parsed = PrimitivePriority.safeParse(primitive.priority);
        if (!parsed.success) {
            violations.push({
                primitiveId: id,
                code: "invalid_priority",
                message: `priority must be one of ${PRIORITY_VALUES.join("|")} (got ${String(primitive.priority)}).`,
            });
        }
    }

    if (options.requireRelationships) {
        if (!hasAnchor && hasPosition) {
            violations.push({
                primitiveId: id,
                code: "pixel_only",
                message:
                    "Primitive only has absolute position; solver expects an 'anchor' relationship.",
            });
        }
        if (!hasAnchor && !hasPosition) {
            violations.push({
                primitiveId: id,
                code: "missing_layout_hint",
                message: "Primitive has neither 'anchor' nor 'position'.",
            });
        }
    }

    return violations;
}

/**
 * Run layout validation across a whole sub-sim (map of states → primitives).
 * Used by the generator modules after Sonnet responds.
 */
export interface SubSimStateLike {
    scene_composition?: unknown[];
}

export function validateSubSimLayout(
    subStates: Record<string, SubSimStateLike>,
    options: { requireRelationships?: boolean } = {},
): LayoutViolation[] {
    const violations: LayoutViolation[] = [];
    for (const state of Object.values(subStates)) {
        const prims = state.scene_composition;
        if (!Array.isArray(prims)) continue;
        for (const prim of prims) {
            violations.push(...validatePrimitiveLayout(prim as PrimitiveForValidation, options));
        }
    }
    return violations;
}
