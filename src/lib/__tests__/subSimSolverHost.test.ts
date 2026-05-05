import { describe, it, expect } from "vitest";
import {
    solveSubSimLayout,
    resolveAnchorPoint,
} from "../subSimSolverHost";

describe("solveSubSimLayout — no-op by default (Phase 2 gate)", () => {
    it("does not mutate the config when the flag is off", () => {
        const config = {
            default_variables: { m: 2, g: 9.8 },
            states: {
                STATE_3_DD1: {
                    scene_composition: [
                        {
                            id: "label_one",
                            type: "label",
                            text: "Normal force",
                            anchor: "block.top_center",
                            edge: "top",
                            gap: 12,
                        },
                    ],
                },
            },
        };
        const before = JSON.stringify(config);
        const out = solveSubSimLayout(config);
        expect(out.ran).toBe(false);
        expect(JSON.stringify(config)).toBe(before);
    });

    it("runs when enabled and annotates primitives with _solverPosition", () => {
        const config = {
            default_variables: { m: 2, g: 9.8 },
            states: {
                STATE_3_DD1: {
                    scene_composition: [
                        {
                            id: "block",
                            type: "body",
                            position: { x: 200, y: 300 },
                            width: 60,
                            height: 60,
                        },
                        {
                            id: "N_label",
                            type: "label",
                            text: "N",
                            font_size: 16,
                            anchor: "block.top",
                            edge: "top",
                            gap: 14,
                        },
                        {
                            id: "caption",
                            type: "annotation",
                            text: "The floor pushes up equal to weight.",
                            anchor: "block.bottom",
                            edge: "bottom",
                            gap: 16,
                        },
                    ],
                },
            },
        };
        const out = solveSubSimLayout(config, { enabled: true });
        expect(out.ran).toBe(true);
        expect(out.statesTouched).toBe(1);
        expect(out.primitivesResolved).toBe(2);

        const scene = config.states.STATE_3_DD1
            .scene_composition as unknown as Array<Record<string, unknown>>;
        const labelPrim = scene.find((p) => p.id === "N_label");
        const annotPrim = scene.find((p) => p.id === "caption");
        expect(labelPrim?._solverPosition).toBeDefined();
        expect(annotPrim?._solverPosition).toBeDefined();

        const labelPos = labelPrim?._solverPosition as {
            x: number;
            y: number;
        };
        expect(labelPos.x).toBeGreaterThan(0);
        expect(labelPos.x).toBeLessThan(760);
        expect(labelPos.y).toBeGreaterThan(0);
        expect(labelPos.y).toBeLessThan(500);
    });

    it("respects the SUB_SIM_SOLVER_ENABLED env flag", () => {
        const prior = process.env.SUB_SIM_SOLVER_ENABLED;
        process.env.SUB_SIM_SOLVER_ENABLED = "1";
        try {
            const config = {
                default_variables: {},
                states: {
                    S: {
                        scene_composition: [
                            {
                                id: "lbl",
                                type: "label",
                                text: "hi",
                                anchor: "MAIN_ZONE.center",
                                edge: "top",
                            },
                        ],
                    },
                },
            };
            const out = solveSubSimLayout(config);
            expect(out.ran).toBe(true);
        } finally {
            if (prior == null) {
                delete process.env.SUB_SIM_SOLVER_ENABLED;
            } else {
                process.env.SUB_SIM_SOLVER_ENABLED = prior;
            }
        }
    });

    it("skips primitives whose type is not solver-targeted", () => {
        const config = {
            default_variables: {},
            states: {
                S: {
                    scene_composition: [
                        {
                            id: "v1",
                            type: "vector", // not in SOLVER_TARGETED
                            anchor: "MAIN_ZONE.center",
                        },
                    ],
                },
            },
        };
        const out = solveSubSimLayout(config, { enabled: true });
        expect(out.primitivesResolved).toBe(0);
        const scene = config.states.S.scene_composition as unknown as Array<
            Record<string, unknown>
        >;
        expect(scene[0]._solverPosition).toBeUndefined();
    });

    it("records a warning when anchor is unresolvable", () => {
        const config = {
            default_variables: {},
            states: {
                S: {
                    scene_composition: [
                        {
                            id: "orphan",
                            type: "label",
                            text: "nope",
                            anchor: "missing_body.top",
                        },
                    ],
                },
            },
        };
        const out = solveSubSimLayout(config, { enabled: true });
        expect(out.warnings.some((w) => w.includes("Unresolved anchor"))).toBe(true);
    });
});

describe("solver registers force_arrow / vector / angle_arc as fixed obstacles", () => {
    it("nudges a label off a force_arrow it would otherwise overlap", () => {
        // Force arrow originates at block.top_center (200, 270), points up
        // (math direction 90° = canvas up) for 20 units * scale 5 = 100px.
        // Arrow spans roughly (192, 162) → (208, 278) after 8px padding.
        // The label anchored at block.top_center with gap=14 would land at
        // y ≈ 256, which is inside the arrow bbox — solver should nudge.
        const config = {
            default_variables: {},
            states: {
                S: {
                    scene_composition: [
                        {
                            id: "block",
                            type: "body",
                            position: { x: 200, y: 300 },
                            width: 60,
                            height: 60,
                        },
                        {
                            id: "N_arrow",
                            type: "force_arrow",
                            origin_anchor: "block.top_center",
                            magnitude: 20,
                            direction_deg: 90,
                            scale_pixels_per_unit: 5,
                        },
                        {
                            id: "N_label",
                            type: "label",
                            text: "Normal",
                            font_size: 14,
                            anchor: "block.top_center",
                            edge: "top",
                            gap: 14,
                        },
                    ],
                },
            },
        };
        const out = solveSubSimLayout(config, { enabled: true });
        expect(out.ran).toBe(true);

        const scene = config.states.S.scene_composition as unknown as Array<
            Record<string, unknown>
        >;
        const labelPrim = scene.find((p) => p.id === "N_label");
        const labelPos = labelPrim?._solverPosition as
            | { x: number; y: number }
            | undefined;
        expect(labelPos).toBeDefined();

        // Arrow bbox is x=192..208, padded from the line at x=200. The
        // label's natural anchor position is x=200 (centred on block.top),
        // so without obstacle registration its centre would land smack on
        // the arrow. After solving, the centre should be pushed clear of
        // the arrow's right edge (208) by at least one label half-width.
        // (Symmetric: it could equally have been pushed left past 192;
        // the solver picks `>=` first which sends it right.)
        const lp = labelPos as { x: number; y: number };
        const clearedRight = lp.x > 208 + 8;
        const clearedLeft = lp.x < 192 - 8;
        expect(clearedRight || clearedLeft).toBe(true);
    });

    it("registers a vector with literal from/to as a fixed obstacle", () => {
        const config = {
            default_variables: {},
            states: {
                S: {
                    scene_composition: [
                        {
                            id: "v1",
                            type: "vector",
                            from: { x: 100, y: 100 },
                            to: { x: 300, y: 100 },
                        },
                        {
                            id: "lbl",
                            type: "label",
                            text: "X",
                            font_size: 14,
                            anchor: "MAIN_ZONE.center", // ~(245, 270) — clear of the vector
                            edge: "top",
                        },
                    ],
                },
            },
        };
        const out = solveSubSimLayout(config, { enabled: true });
        expect(out.ran).toBe(true);
        // Sanity: no obstacle-registration warnings for resolvable vectors.
        expect(
            out.warnings.some((w) =>
                w.includes("Could not register vector v1"),
            ),
        ).toBe(false);
    });

    it("registers an angle_arc with vertex_anchor as a fixed obstacle", () => {
        const config = {
            default_variables: { theta: 30 },
            states: {
                S: {
                    scene_composition: [
                        {
                            id: "block",
                            type: "body",
                            position: { x: 200, y: 300 },
                            width: 60,
                            height: 60,
                        },
                        {
                            id: "arc1",
                            type: "angle_arc",
                            vertex_anchor: "block.bottom",
                            radius: 30,
                            angle_value_expr: "theta",
                        },
                        {
                            id: "lbl",
                            type: "label",
                            text: "θ",
                            font_size: 14,
                            anchor: "MAIN_ZONE.center",
                            edge: "top",
                        },
                    ],
                },
            },
        };
        const out = solveSubSimLayout(config, { enabled: true });
        expect(out.ran).toBe(true);
        expect(
            out.warnings.some((w) =>
                w.includes("Could not register angle_arc arc1"),
            ),
        ).toBe(false);
    });

    it("emits a warning when force_arrow magnitude_expr cannot be resolved", () => {
        const config = {
            default_variables: { m: 2, g: 9.8 },
            states: {
                S: {
                    scene_composition: [
                        {
                            id: "block",
                            type: "body",
                            position: { x: 200, y: 300 },
                            width: 60,
                            height: 60,
                        },
                        {
                            id: "F_complex",
                            type: "force_arrow",
                            origin_body_id: "block",
                            // Compound expression server-side eval can't handle.
                            magnitude_expr: "m * g * sin(theta)",
                            direction_deg: 0,
                        },
                    ],
                },
            },
        };
        const out = solveSubSimLayout(config, { enabled: true });
        expect(out.ran).toBe(true);
        expect(
            out.warnings.some((w) =>
                w.includes("Could not register force_arrow F_complex"),
            ),
        ).toBe(true);
    });
});

describe("resolveAnchorPoint (server-side port of PM_resolveAnchor)", () => {
    const bodies = {
        block: { cx: 200, cy: 300, w: 60, h: 40 },
    };
    const surfaces = {
        floor: { x0: 30, y0: 400, x1: 430, y1: 400 },
        incline: { x0: 100, y0: 400, x1: 300, y1: 300 }, // 45° down-to-right
    };

    it("resolves zone anchors to match PM_ZONES centers", () => {
        expect(resolveAnchorPoint("MAIN_ZONE.center", {}, {})).toEqual({
            x: 30 + 430 / 2,
            y: 80 + 380 / 2,
        });
    });

    it("resolves body anchors", () => {
        expect(resolveAnchorPoint("block.top", bodies, {})).toEqual({
            x: 200,
            y: 280,
        });
        expect(resolveAnchorPoint("block.bottom", bodies, {})).toEqual({
            x: 200,
            y: 320,
        });
        expect(resolveAnchorPoint("block.left", bodies, {})).toEqual({
            x: 170,
            y: 300,
        });
    });

    it("resolves surface mid-point", () => {
        expect(resolveAnchorPoint("floor.mid", {}, surfaces)).toEqual({
            x: 230,
            y: 400,
        });
    });

    it("resolves parametric on_surface at:t", () => {
        const p = resolveAnchorPoint("on_surface:incline at:0.5", {}, surfaces);
        expect(p).toEqual({ x: 200, y: 350 });
    });

    it("returns null for unknown anchors", () => {
        expect(resolveAnchorPoint("unknown.nowhere", {}, {})).toBeNull();
    });
});
