/**
 * Sub-sim layout constraint solver.
 *
 * Wraps `@lume/kiwi` (Cassowary) for the sub-simulation rendering pipeline.
 * Takes primitive relationship specs (anchor + gap + edge + align) and returns
 * resolved pixel positions that stay within canvas bounds and (best-effort) do
 * not overlap each other.
 *
 * Contract:
 *   - Width/height per primitive are *inputs* (caller measures text first).
 *   - Anchor strings are resolved to pixel points by the caller (via
 *     `PM_resolveAnchor` in the renderer) before being handed to this solver.
 *   - Canvas bounds are required constraints — solver throws if the JSON is
 *     genuinely infeasible at that priority.
 *   - No-overlap is enforced via a post-solver imperative sweep (Cassowary is a
 *     linear solver and can't express disjunctive "A left of B OR above B"
 *     constraints directly).
 */

import { Solver, Variable, Operator, Strength } from "@lume/kiwi";

export const CANVAS_W = 760;
export const CANVAS_H = 500;

export type Priority = "required" | "strong" | "medium" | "weak";
export type Edge = "top" | "right" | "bottom" | "left";

export interface Point {
    x: number;
    y: number;
}

export interface BBox {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface PrimitiveInput {
    id: string;
    w: number;
    h: number;
    /** Resolved anchor pixel (caller converts string → point via PM_resolveAnchor). */
    anchorPoint?: Point;
    /** Which side of the anchor the primitive sits on. Default "top". */
    edge?: Edge;
    /** Pixel distance between anchor and primitive edge. Default 12. */
    gap?: number;
    /** Snap the primitive's center-x to this pixel (strong). */
    alignX?: number;
    /** Snap the primitive's center-y to this pixel (strong). */
    alignY?: number;
    /** Strength of the anchor / align ties. Default "strong". */
    priority?: Priority;
    /**
     * Legacy absolute position — treated as a weak suggestion so solver can
     * still respect canvas bounds + no-overlap. Enables gradual migration
     * without invalidating existing cached sub-sims.
     */
    suggestedX?: number;
    suggestedY?: number;
}

export interface FixedBox extends BBox {
    id: string;
}

export interface SolveOptions {
    canvasWidth?: number;
    canvasHeight?: number;
    /** When true (default), post-solver sweep nudges overlapping pairs apart. */
    enforceNoOverlap?: boolean;
    /** Upper bound on nudge iterations. Default 6. */
    maxNudgeIterations?: number;
}

export interface SolveResult {
    /** Resolved {x, y} per primitive id. Only ids added via addPrimitive appear. */
    positions: Map<string, Point>;
    /** Ids where anchor placement had to be nudged to resolve an overlap. */
    relaxed: string[];
    /** Ids clamped back into canvas bounds after nudge. */
    clamped: string[];
    /** Non-fatal warnings (unresolved anchors, infeasible align, etc.). */
    warnings: string[];
    /** True when at least one overlap remained after the maxNudge sweep. */
    infeasible: boolean;
}

function strengthOf(p: Priority | undefined): number {
    switch (p) {
        case "required":
            return Strength.required;
        case "strong":
            return Strength.strong;
        case "medium":
            return Strength.medium;
        case "weak":
            return Strength.weak;
        default:
            return Strength.strong;
    }
}

function aabbOverlap(a: BBox, b: BBox): boolean {
    return !(
        a.x + a.w <= b.x ||
        b.x + b.w <= a.x ||
        a.y + a.h <= b.y ||
        b.y + b.h <= a.y
    );
}

interface PrimVars {
    x: Variable;
    y: Variable;
    w: number;
    h: number;
}

export class ConstraintSolver {
    private primitives: PrimitiveInput[] = [];
    private fixed: FixedBox[] = [];

    addPrimitive(input: PrimitiveInput): void {
        this.primitives.push(input);
    }

    addFixed(id: string, bbox: BBox): void {
        this.fixed.push({ id, ...bbox });
    }

    /** For tests + introspection. */
    getPrimitiveCount(): number {
        return this.primitives.length;
    }

    getFixedCount(): number {
        return this.fixed.length;
    }

    solve(options: SolveOptions = {}): SolveResult {
        const canvasW = options.canvasWidth ?? CANVAS_W;
        const canvasH = options.canvasHeight ?? CANVAS_H;
        const enforceNoOverlap = options.enforceNoOverlap ?? true;
        const maxIter = options.maxNudgeIterations ?? 6;

        const solver = new Solver();
        const vars = new Map<string, PrimVars>();
        const warnings: string[] = [];
        const relaxed = new Set<string>();
        const clamped = new Set<string>();

        // Create kiwi variables for each primitive's top-left corner.
        for (const p of this.primitives) {
            vars.set(p.id, {
                x: new Variable(`${p.id}.x`),
                y: new Variable(`${p.id}.y`),
                w: p.w,
                h: p.h,
            });
        }

        // Pass A — required canvas bounds.
        for (const v of vars.values()) {
            solver.createConstraint(v.x, Operator.Ge, 0, Strength.required);
            solver.createConstraint(v.y, Operator.Ge, 0, Strength.required);
            solver.createConstraint(v.x.plus(v.w), Operator.Le, canvasW, Strength.required);
            solver.createConstraint(v.y.plus(v.h), Operator.Le, canvasH, Strength.required);
        }

        // Helper: add a kiwi constraint; if it would violate a higher-priority
        // constraint at "required" strength, retry at "strong" so the primitive
        // still gets pulled toward the target instead of silently dropping to
        // the kiwi default of zero.
        const addTie = (
            expr: { plus: (n: number) => unknown } | Variable,
            rhs: number,
            str: number,
            primId: string,
            axis: string,
        ): void => {
            try {
                solver.createConstraint(
                    expr as Variable,
                    Operator.Eq,
                    rhs,
                    str,
                );
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                if (str === Strength.required) {
                    try {
                        solver.createConstraint(
                            expr as Variable,
                            Operator.Eq,
                            rhs,
                            Strength.strong,
                        );
                        warnings.push(
                            `Anchor tie relaxed required→strong for ${primId} (${axis}): ${msg}`,
                        );
                        relaxed.add(primId);
                        return;
                    } catch (err2) {
                        const msg2 =
                            err2 instanceof Error ? err2.message : String(err2);
                        warnings.push(
                            `Anchor tie failed for ${primId} (${axis}) even at strong: ${msg2}`,
                        );
                        return;
                    }
                }
                warnings.push(`Anchor tie failed for ${primId} (${axis}): ${msg}`);
            }
        };

        // Pass B — anchor ties, align, legacy suggestions.
        for (const p of this.primitives) {
            const v = vars.get(p.id);
            if (!v) continue;
            const strength = strengthOf(p.priority);

            if (p.anchorPoint) {
                const ax = p.anchorPoint.x;
                const ay = p.anchorPoint.y;
                const gap = p.gap ?? 12;
                const edge: Edge = p.edge ?? "top";

                switch (edge) {
                    case "top":
                        // primitive sits above anchor: y + h + gap = ay
                        addTie(v.y.plus(v.h), ay - gap, strength, p.id, `edge=${edge}/y`);
                        addTie(v.x.plus(v.w / 2), ax, strength, p.id, `edge=${edge}/x`);
                        break;
                    case "bottom":
                        // primitive sits below anchor: y = ay + gap
                        addTie(v.y, ay + gap, strength, p.id, `edge=${edge}/y`);
                        addTie(v.x.plus(v.w / 2), ax, strength, p.id, `edge=${edge}/x`);
                        break;
                    case "left":
                        addTie(v.x.plus(v.w), ax - gap, strength, p.id, `edge=${edge}/x`);
                        addTie(v.y.plus(v.h / 2), ay, strength, p.id, `edge=${edge}/y`);
                        break;
                    case "right":
                        addTie(v.x, ax + gap, strength, p.id, `edge=${edge}/x`);
                        addTie(v.y.plus(v.h / 2), ay, strength, p.id, `edge=${edge}/y`);
                        break;
                }
            } else if (
                p.suggestedX !== undefined &&
                p.suggestedY !== undefined
            ) {
                // Legacy pixel position — weak suggestion so canvas bounds
                // and no-overlap still dominate.
                try {
                    solver.createConstraint(v.x, Operator.Eq, p.suggestedX, Strength.weak);
                    solver.createConstraint(v.y, Operator.Eq, p.suggestedY, Strength.weak);
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    warnings.push(`Legacy position failed for ${p.id}: ${msg}`);
                }
            }

            if (p.alignX !== undefined) {
                try {
                    solver.createConstraint(
                        v.x.plus(v.w / 2),
                        Operator.Eq,
                        p.alignX,
                        strength,
                    );
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    warnings.push(`alignX failed for ${p.id}: ${msg}`);
                }
            }
            if (p.alignY !== undefined) {
                try {
                    solver.createConstraint(
                        v.y.plus(v.h / 2),
                        Operator.Eq,
                        p.alignY,
                        strength,
                    );
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    warnings.push(`alignY failed for ${p.id}: ${msg}`);
                }
            }
        }

        solver.updateVariables();

        // Pass C — imperative overlap sweep. Cassowary can't express OR
        // constraints, so we nudge overlapping pairs along the minimum
        // translation axis after the linear solve completes.
        const live: { id: string; x: number; y: number; w: number; h: number; movable: boolean }[] = [];
        for (const [id, v] of vars) {
            live.push({ id, x: v.x.value(), y: v.y.value(), w: v.w, h: v.h, movable: true });
        }
        for (const f of this.fixed) {
            live.push({ id: f.id, x: f.x, y: f.y, w: f.w, h: f.h, movable: false });
        }

        let infeasible = false;
        if (enforceNoOverlap) {
            for (let iter = 0; iter < maxIter; iter++) {
                let nudged = false;
                for (let i = 0; i < live.length; i++) {
                    for (let j = i + 1; j < live.length; j++) {
                        const a = live[i];
                        const b = live[j];
                        if (!a.movable && !b.movable) continue;
                        if (!aabbOverlap(a, b)) continue;

                        const dx =
                            Math.min(a.x + a.w, b.x + b.w) -
                            Math.max(a.x, b.x);
                        const dy =
                            Math.min(a.y + a.h, b.y + b.h) -
                            Math.max(a.y, b.y);

                        // Prefer the axis with the smaller overlap (smaller nudge).
                        const axis = dy <= dx ? "y" : "x";
                        // Pick movable target — if both, pick the one with smaller
                        // area (labels/formulas move before bodies).
                        let mover = a;
                        let other = b;
                        if (!a.movable) {
                            mover = b;
                            other = a;
                        } else if (b.movable && a.w * a.h > b.w * b.h) {
                            mover = b;
                            other = a;
                        }

                        if (axis === "y") {
                            if (
                                mover.y + mover.h / 2 >=
                                other.y + other.h / 2
                            ) {
                                mover.y += dy + 1;
                            } else {
                                mover.y -= dy + 1;
                            }
                        } else {
                            if (
                                mover.x + mover.w / 2 >=
                                other.x + other.w / 2
                            ) {
                                mover.x += dx + 1;
                            } else {
                                mover.x -= dx + 1;
                            }
                        }

                        // Clamp back into canvas after nudge.
                        if (mover.x < 0) {
                            mover.x = 0;
                            clamped.add(mover.id);
                        }
                        if (mover.y < 0) {
                            mover.y = 0;
                            clamped.add(mover.id);
                        }
                        if (mover.x + mover.w > canvasW) {
                            mover.x = canvasW - mover.w;
                            clamped.add(mover.id);
                        }
                        if (mover.y + mover.h > canvasH) {
                            mover.y = canvasH - mover.h;
                            clamped.add(mover.id);
                        }
                        relaxed.add(mover.id);
                        nudged = true;
                    }
                }
                if (!nudged) break;
                if (iter === maxIter - 1) {
                    // Check one more time — if still overlapping, mark infeasible.
                    for (let i = 0; i < live.length; i++) {
                        for (let j = i + 1; j < live.length; j++) {
                            if (aabbOverlap(live[i], live[j])) {
                                infeasible = true;
                                warnings.push(
                                    `Unresolved overlap: ${live[i].id} / ${live[j].id}`,
                                );
                            }
                        }
                    }
                }
            }
        }

        const positions = new Map<string, Point>();
        for (const bb of live) {
            if (bb.movable) {
                positions.set(bb.id, { x: bb.x, y: bb.y });
            }
        }

        return {
            positions,
            relaxed: Array.from(relaxed),
            clamped: Array.from(clamped),
            warnings,
            infeasible,
        };
    }
}
