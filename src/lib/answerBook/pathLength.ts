/**
 * pathLength.ts — length of an SVG path in figure units, for the answer-book
 * figure pacing tools (`pace_figures.ts` fills `ms` from it; `check_figure_pace.ts`
 * gates on it). Self-contained: M L H V C S Q T A Z, absolute and relative.
 * Curves are sampled (24 points per cubic/quadratic, 48 per arc); arcs go
 * through the endpoint→center conversion of SVG 1.1 §F.6.5. Accuracy is well
 * inside the pace band the gate allows.
 */

type Pt = { x: number; y: number };

function tokenize(d: string): { cmd: string; nums: number[] }[] {
    const out: { cmd: string; nums: number[] }[] = [];
    const re = /([MLHVCSQTAZmlhvcsqtaz])|(-?\d*\.?\d+(?:e[-+]?\d+)?)/g;
    let m: RegExpExecArray | null;
    let cur: { cmd: string; nums: number[] } | null = null;
    while ((m = re.exec(d)) !== null) {
        if (m[1]) { cur = { cmd: m[1], nums: [] }; out.push(cur); }
        else if (cur) cur.nums.push(parseFloat(m[2]));
    }
    return out;
}

function dist(a: Pt, b: Pt): number { return Math.hypot(b.x - a.x, b.y - a.y); }

function cubicLen(p0: Pt, p1: Pt, p2: Pt, p3: Pt): number {
    let len = 0, prev = p0;
    for (let i = 1; i <= 24; i++) {
        const t = i / 24, u = 1 - t;
        const p = {
            x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
            y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
        };
        len += dist(prev, p); prev = p;
    }
    return len;
}

function quadLen(p0: Pt, p1: Pt, p2: Pt): number {
    let len = 0, prev = p0;
    for (let i = 1; i <= 24; i++) {
        const t = i / 24, u = 1 - t;
        const p = { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
        len += dist(prev, p); prev = p;
    }
    return len;
}

function arcLen(p0: Pt, rx: number, ry: number, phiDeg: number, large: number, sweep: number, p1: Pt): number {
    if (rx === 0 || ry === 0) return dist(p0, p1);
    rx = Math.abs(rx); ry = Math.abs(ry);
    const phi = (phiDeg * Math.PI) / 180, cos = Math.cos(phi), sin = Math.sin(phi);
    const dx = (p0.x - p1.x) / 2, dy = (p0.y - p1.y) / 2;
    const x1 = cos * dx + sin * dy, y1 = -sin * dx + cos * dy;
    const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
    if (lambda > 1) { rx *= Math.sqrt(lambda); ry *= Math.sqrt(lambda); }
    const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
    const den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
    let coef = den === 0 ? 0 : Math.sqrt(Math.max(0, num / den));
    if (large === sweep) coef = -coef;
    const cx1 = coef * (rx * y1) / ry, cy1 = coef * (-ry * x1) / rx;
    const cx = cos * cx1 - sin * cy1 + (p0.x + p1.x) / 2;
    const cy = sin * cx1 + cos * cy1 + (p0.y + p1.y) / 2;
    const ang = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    const t1 = ang(1, 0, (x1 - cx1) / rx, (y1 - cy1) / ry);
    let dt = ang((x1 - cx1) / rx, (y1 - cy1) / ry, (-x1 - cx1) / rx, (-y1 - cy1) / ry);
    if (!sweep && dt > 0) dt -= 2 * Math.PI;
    if (sweep && dt < 0) dt += 2 * Math.PI;
    let len = 0, prev = p0;
    const N = 48;
    for (let i = 1; i <= N; i++) {
        const t = t1 + (dt * i) / N;
        const ex = rx * Math.cos(t), ey = ry * Math.sin(t);
        const p = { x: cos * ex - sin * ey + cx, y: sin * ex + cos * ey + cy };
        len += dist(prev, p); prev = p;
    }
    return len;
}

export function pathLength(d: string): number {
    let len = 0;
    let cur: Pt = { x: 0, y: 0 }, start: Pt = { x: 0, y: 0 };
    let lastC: Pt | null = null, lastQ: Pt | null = null;
    for (const seg of tokenize(d)) {
        const rel = seg.cmd === seg.cmd.toLowerCase();
        const c = seg.cmd.toUpperCase();
        const n = seg.nums;
        const P = (x: number, y: number): Pt => (rel ? { x: cur.x + x, y: cur.y + y } : { x, y });
        if (c === 'Z') { len += dist(cur, start); cur = start; lastC = lastQ = null; continue; }
        let i = 0;
        let first = true;
        while (i < n.length) {
            if (c === 'M') {
                const p = P(n[i], n[i + 1]); i += 2;
                if (first) { cur = p; start = p; } else { len += dist(cur, p); cur = p; }   // implicit L after M
                lastC = lastQ = null;
            } else if (c === 'L') {
                const p = P(n[i], n[i + 1]); i += 2; len += dist(cur, p); cur = p; lastC = lastQ = null;
            } else if (c === 'H') {
                const p = rel ? { x: cur.x + n[i], y: cur.y } : { x: n[i], y: cur.y }; i += 1;
                len += dist(cur, p); cur = p; lastC = lastQ = null;
            } else if (c === 'V') {
                const p = rel ? { x: cur.x, y: cur.y + n[i] } : { x: cur.x, y: n[i] }; i += 1;
                len += dist(cur, p); cur = p; lastC = lastQ = null;
            } else if (c === 'C') {
                const p1: Pt = P(n[i], n[i + 1]), p2: Pt = P(n[i + 2], n[i + 3]), p3: Pt = P(n[i + 4], n[i + 5]); i += 6;
                len += cubicLen(cur, p1, p2, p3); cur = p3; lastC = p2; lastQ = null;
            } else if (c === 'S') {
                const p1: Pt = lastC ? { x: 2 * cur.x - lastC.x, y: 2 * cur.y - lastC.y } : cur;
                const p2 = P(n[i], n[i + 1]), p3: Pt = P(n[i + 2], n[i + 3]); i += 4;
                len += cubicLen(cur, p1, p2, p3); cur = p3; lastC = p2; lastQ = null;
            } else if (c === 'Q') {
                const p1: Pt = P(n[i], n[i + 1]), p2: Pt = P(n[i + 2], n[i + 3]); i += 4;
                len += quadLen(cur, p1, p2); cur = p2; lastQ = p1; lastC = null;
            } else if (c === 'T') {
                const p1: Pt = lastQ ? { x: 2 * cur.x - lastQ.x, y: 2 * cur.y - lastQ.y } : cur;
                const p2 = P(n[i], n[i + 1]); i += 2;
                len += quadLen(cur, p1, p2); cur = p2; lastQ = p1; lastC = null;
            } else if (c === 'A') {
                const rx = n[i], ry = n[i + 1], rot = n[i + 2], large = n[i + 3], sweep = n[i + 4];
                const p = P(n[i + 5], n[i + 6]); i += 7;
                len += arcLen(cur, rx, ry, rot, large, sweep, p); cur = p; lastC = lastQ = null;
            } else {
                break;
            }
            first = false;
        }
    }
    return len;
}

/** The authoring pace rule: ms for a stroke of length L at `speed` units/second, clamped. */
export function paceMs(L: number, speed: number, minMs = 300, maxMs = 4500): number {
    const ms = Math.round(((L / speed) * 1000) / 10) * 10;
    return Math.max(minMs, Math.min(maxMs, ms));
}
