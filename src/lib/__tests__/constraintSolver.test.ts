import { describe, it, expect } from "vitest";
import {
    ConstraintSolver,
    CANVAS_W,
    CANVAS_H,
} from "../constraintSolver";
import {
    validatePrimitiveLayout,
    validateSubSimLayout,
} from "../constraintSchema";

describe("ConstraintSolver — canvas bounds", () => {
    it("keeps primitive inside canvas even when anchor would push it out", () => {
        const s = new ConstraintSolver();
        // Anchor near the right edge with a wide label — without bounds, it
        // would extend past x=760.
        s.addPrimitive({
            id: "label_right",
            w: 200,
            h: 20,
            anchorPoint: { x: 750, y: 100 },
            edge: "right",
            gap: 8,
        });
        const out = s.solve();
        const p = out.positions.get("label_right");
        expect(p).toBeDefined();
        expect(p!.x).toBeGreaterThanOrEqual(0);
        expect(p!.x + 200).toBeLessThanOrEqual(CANVAS_W);
        expect(p!.y).toBeGreaterThanOrEqual(0);
        expect(p!.y + 20).toBeLessThanOrEqual(CANVAS_H);
    });

    it("clamps multiple primitives to stay inside canvas", () => {
        const s = new ConstraintSolver();
        s.addPrimitive({
            id: "top_label",
            w: 100,
            h: 20,
            anchorPoint: { x: 50, y: 5 },
            edge: "top",
            gap: 10,
        });
        s.addPrimitive({
            id: "bottom_label",
            w: 100,
            h: 20,
            anchorPoint: { x: 50, y: 495 },
            edge: "bottom",
            gap: 10,
        });
        const out = s.solve();
        for (const [, pt] of out.positions) {
            expect(pt.x).toBeGreaterThanOrEqual(0);
            expect(pt.y).toBeGreaterThanOrEqual(0);
            expect(pt.x + 100).toBeLessThanOrEqual(CANVAS_W);
            expect(pt.y + 20).toBeLessThanOrEqual(CANVAS_H);
        }
    });
});

describe("ConstraintSolver — anchor + gap", () => {
    it("places a primitive 'above' an anchor with the requested gap", () => {
        const s = new ConstraintSolver();
        s.addPrimitive({
            id: "label",
            w: 80,
            h: 20,
            anchorPoint: { x: 380, y: 250 },
            edge: "top",
            gap: 12,
        });
        const out = s.solve();
        const p = out.positions.get("label")!;
        // bottom-edge = y + h should be 12 above anchor.y
        expect(p.y + 20).toBeCloseTo(250 - 12, 1);
        // centered on anchor.x
        expect(p.x + 40).toBeCloseTo(380, 1);
    });

    it("honors bottom / left / right edges", () => {
        const s = new ConstraintSolver();
        s.addPrimitive({
            id: "below",
            w: 60,
            h: 20,
            anchorPoint: { x: 200, y: 100 },
            edge: "bottom",
            gap: 10,
        });
        s.addPrimitive({
            id: "left_of",
            w: 40,
            h: 20,
            anchorPoint: { x: 300, y: 300 },
            edge: "left",
            gap: 5,
        });
        s.addPrimitive({
            id: "right_of",
            w: 40,
            h: 20,
            anchorPoint: { x: 400, y: 300 },
            edge: "right",
            gap: 5,
        });
        const out = s.solve();
        const below = out.positions.get("below")!;
        const leftOf = out.positions.get("left_of")!;
        const rightOf = out.positions.get("right_of")!;

        expect(below.y).toBeCloseTo(110, 1);
        expect(leftOf.x + 40).toBeCloseTo(295, 1); // right edge = 300 - 5
        expect(rightOf.x).toBeCloseTo(405, 1);
    });
});

describe("ConstraintSolver — alignment", () => {
    it("snaps center_x to alignX and center_y to alignY", () => {
        const s = new ConstraintSolver();
        s.addPrimitive({
            id: "aligned",
            w: 100,
            h: 30,
            alignX: 380,
            alignY: 250,
        });
        const out = s.solve();
        const p = out.positions.get("aligned")!;
        expect(p.x + 50).toBeCloseTo(380, 1);
        expect(p.y + 15).toBeCloseTo(250, 1);
    });
});

describe("ConstraintSolver — no-overlap sweep", () => {
    it("nudges two overlapping labels apart", () => {
        const s = new ConstraintSolver();
        // Two labels anchored to the same point — without the sweep they'd stack.
        s.addPrimitive({
            id: "label_a",
            w: 60,
            h: 20,
            anchorPoint: { x: 200, y: 200 },
            edge: "top",
            gap: 10,
        });
        s.addPrimitive({
            id: "label_b",
            w: 60,
            h: 20,
            anchorPoint: { x: 200, y: 200 },
            edge: "top",
            gap: 10,
        });
        const out = s.solve();
        const a = out.positions.get("label_a")!;
        const b = out.positions.get("label_b")!;
        // After sweep, one of them must have moved so that bounding boxes no
        // longer overlap.
        const overlap = !(
            a.x + 60 <= b.x ||
            b.x + 60 <= a.x ||
            a.y + 20 <= b.y ||
            b.y + 20 <= a.y
        );
        expect(overlap).toBe(false);
        expect(out.relaxed.length).toBeGreaterThan(0);
    });

    it("respects fixed bodies — label moves around the body, body stays put", () => {
        const s = new ConstraintSolver();
        s.addFixed("block", { x: 300, y: 240, w: 80, h: 60 });
        // Label sits inside the body's rect initially.
        s.addPrimitive({
            id: "N_label",
            w: 40,
            h: 20,
            anchorPoint: { x: 340, y: 270 },
            edge: "top",
            gap: 2,
        });
        const out = s.solve();
        const label = out.positions.get("N_label")!;
        const labelBox = { x: label.x, y: label.y, w: 40, h: 20 };
        const body = { x: 300, y: 240, w: 80, h: 60 };
        const overlap = !(
            labelBox.x + labelBox.w <= body.x ||
            body.x + body.w <= labelBox.x ||
            labelBox.y + labelBox.h <= body.y ||
            body.y + body.h <= labelBox.y
        );
        expect(overlap).toBe(false);
    });

    it("skips sweep when enforceNoOverlap=false (regression control)", () => {
        const s = new ConstraintSolver();
        s.addPrimitive({
            id: "a",
            w: 40,
            h: 20,
            anchorPoint: { x: 200, y: 200 },
            edge: "top",
            gap: 10,
        });
        s.addPrimitive({
            id: "b",
            w: 40,
            h: 20,
            anchorPoint: { x: 200, y: 200 },
            edge: "top",
            gap: 10,
        });
        const out = s.solve({ enforceNoOverlap: false });
        // Same anchor + same edge → stacked. relaxed should be empty.
        expect(out.relaxed).toEqual([]);
    });
});

describe("ConstraintSolver — legacy position fallback", () => {
    it("treats suggestedX/Y as weak suggestions and keeps inside bounds", () => {
        const s = new ConstraintSolver();
        s.addPrimitive({
            id: "legacy",
            w: 100,
            h: 20,
            suggestedX: 200,
            suggestedY: 150,
        });
        const out = s.solve();
        const p = out.positions.get("legacy")!;
        expect(p.x).toBeCloseTo(200, 1);
        expect(p.y).toBeCloseTo(150, 1);
    });

    it("respects bounds when suggested position would push off canvas", () => {
        const s = new ConstraintSolver();
        s.addPrimitive({
            id: "off",
            w: 100,
            h: 20,
            suggestedX: 800, // past the 760 canvas
            suggestedY: 100,
        });
        const out = s.solve();
        const p = out.positions.get("off")!;
        expect(p.x + 100).toBeLessThanOrEqual(CANVAS_W);
    });
});

describe("ConstraintSolver — priority relaxation", () => {
    it("relaxes weak alignment to satisfy required canvas bounds", () => {
        const s = new ConstraintSolver();
        s.addPrimitive({
            id: "wide",
            w: 400,
            h: 20,
            priority: "weak",
            alignX: 50, // Would put x=-150 — impossible with canvas bounds.
        });
        // Should not throw — weak align is relaxed in favor of required bounds.
        const out = s.solve();
        const p = out.positions.get("wide")!;
        expect(p.x).toBeGreaterThanOrEqual(0);
    });
});

describe("validatePrimitiveLayout", () => {
    it("passes valid anchor + edge + priority", () => {
        const v = validatePrimitiveLayout({
            id: "l1",
            type: "label",
            anchor: "block.top_center",
            edge: "top",
            gap: 12,
            priority: "strong",
        });
        expect(v).toEqual([]);
    });

    it("rejects malformed anchor string", () => {
        const v = validatePrimitiveLayout({
            id: "l2",
            type: "label",
            anchor: "not a valid anchor",
        });
        expect(v.map((x) => x.code)).toContain("invalid_anchor");
    });

    it("rejects unknown edge", () => {
        const v = validatePrimitiveLayout({
            id: "l3",
            type: "annotation",
            edge: "northwest" as unknown,
        });
        expect(v.map((x) => x.code)).toContain("invalid_edge");
    });

    it("flags pixel-only primitives when requireRelationships is on", () => {
        const v = validatePrimitiveLayout(
            {
                id: "l4",
                type: "label",
                position: { x: 100, y: 200 },
            },
            { requireRelationships: true },
        );
        expect(v.map((x) => x.code)).toContain("pixel_only");
    });

    it("skips non-solver-targeted types", () => {
        const v = validatePrimitiveLayout(
            {
                id: "s1",
                type: "surface",
                position: { x: 100, y: 200 },
            },
            { requireRelationships: true },
        );
        expect(v).toEqual([]);
    });

    it("accepts on_surface parametric anchor", () => {
        const v = validatePrimitiveLayout({
            id: "block",
            type: "label",
            anchor: "on_surface:floor at:0.45",
        });
        expect(v).toEqual([]);
    });
});

describe("validateSubSimLayout", () => {
    it("walks every state's scene_composition", () => {
        const violations = validateSubSimLayout(
            {
                STATE_3_DD1: {
                    scene_composition: [
                        {
                            id: "l1",
                            type: "label",
                            anchor: "block.top_center",
                        },
                        { id: "l2", type: "label", anchor: "bogus_anchor" },
                    ],
                },
                STATE_3_DD2: {
                    scene_composition: [
                        { id: "body_wrong", type: "body" }, // not solver-targeted
                    ],
                },
            },
            { requireRelationships: true },
        );
        expect(violations.length).toBe(1);
        expect(violations[0].primitiveId).toBe("l2");
    });
});
