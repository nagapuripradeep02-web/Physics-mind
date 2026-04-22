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
