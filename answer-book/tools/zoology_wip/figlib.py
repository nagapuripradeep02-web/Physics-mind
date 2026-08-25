"""Shared helpers for the Periplaneta figure generators (unit 7 pilot).
All paths use ABSOLUTE commands so mirror() can flip them."""
import math, re, json, io

def f(v):
    s = f"{v:.1f}"
    return s[:-2] if s.endswith('.0') else s

def stroke(id_, d, w=None, pen=None, wipe=None):
    e = {"type": "stroke", "id": id_, "d": d, "ms": 0}
    if pen: e["pen"] = pen
    if wipe: e["wipe"] = wipe
    if w: e["w"] = w
    return e

def label(id_, x, y, text, sm=True, em=False):
    e = {"type": "label", "id": id_, "x": x, "y": y, "text": text, "ms": 0}
    if em: e["em"] = True
    elif sm: e["sm"] = True
    return e

def pause(id_, caption):
    assert len(caption) <= 64, (caption, len(caption))
    return {"type": "pause", "id": id_, "caption": caption}

def leader(id_, x1, y1, x2, y2, w=1.4):
    return stroke(id_, f"M {f(x1)} {f(y1)} L {f(x2)} {f(y2)}", w=w)

def line(x1, y1, x2, y2):
    return f"M {f(x1)} {f(y1)} L {f(x2)} {f(y2)}"

def poly(pts, close=False):
    d = "M " + " L ".join(f"{f(x)} {f(y)}" for x, y in pts)
    return d + (" Z" if close else "")

def ellipse(cx, cy, rx, ry):
    return (f"M {f(cx-rx)} {f(cy)} A {f(rx)} {f(ry)} 0 1 0 {f(cx+rx)} {f(cy)} "
            f"A {f(rx)} {f(ry)} 0 1 0 {f(cx-rx)} {f(cy)}")

def circle(cx, cy, r):
    return ellipse(cx, cy, r, r)

def arrow_head(tx, ty, fx, fy, size=7):
    """V-shaped head at tip (tx,ty) for a line arriving from (fx,fy)."""
    ang = math.atan2(ty - fy, tx - fx)
    a1 = ang + math.radians(150); a2 = ang - math.radians(150)
    return (f"M {f(tx + size*math.cos(a1))} {f(ty + size*math.sin(a1))} L {f(tx)} {f(ty)} "
            f"L {f(tx + size*math.cos(a2))} {f(ty + size*math.sin(a2))}")

def catmull(pts, n=8):
    """Catmull-Rom spline through pts, n samples per segment. Returns list of points."""
    P = [pts[0]] + list(pts) + [pts[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i-1], P[i], P[i+1], P[i+2]
        for k in range(n):
            t = k / n
            t2, t3 = t*t, t*t*t
            x = 0.5*((2*p1[0]) + (-p0[0]+p2[0])*t + (2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2 + (-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3)
            y = 0.5*((2*p1[1]) + (-p0[1]+p2[1])*t + (2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2 + (-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)
            out.append((x, y))
    out.append(pts[-1])
    return out

def offset(samples, hw):
    """Left and right offset polylines of a sampled centerline (hw = half width)."""
    L, R = [], []
    n = len(samples)
    for i, (x, y) in enumerate(samples):
        x0, y0 = samples[max(i-1, 0)]; x1, y1 = samples[min(i+1, n-1)]
        dx, dy = x1 - x0, y1 - y0
        m = math.hypot(dx, dy) or 1
        nx, ny = -dy / m, dx / m
        L.append((x + nx*hw, y + ny*hw)); R.append((x - nx*hw, y - ny*hw))
    return L, R

def tube(ctrl, hw, n=8):
    """Two edge paths (d strings) of a tube along a Catmull-Rom centerline."""
    s = catmull(ctrl, n)
    L, R = offset(s, hw)
    return poly(L), poly(R)

def scallop(cx, cy, rx, ry, n=8, bulge=1.25, phase=0.0):
    """Lobed blob: n OUTWARD-bulging arcs around an ellipse (a rounded acinar gland lobe).

    sweep-flag is 1: the points run clockwise on screen (SVG y is down), so a
    clockwise arc bows AWAY from the centre. sweep 0 bows inward and turns every
    vertex into a spike — that was the starburst bug in the pilot figures."""
    pts = []
    for k in range(n):
        a = phase + 2*math.pi*k/n
        pts.append((cx + rx*math.cos(a), cy + ry*math.sin(a)))
    d = f"M {f(pts[0][0])} {f(pts[0][1])}"
    for k in range(n):
        x1, y1 = pts[(k+1) % n]
        x0, y0 = pts[k]
        r = math.hypot(x1-x0, y1-y0) / 2 * bulge
        d += f" A {f(r)} {f(r)} 0 0 1 {f(x1)} {f(y1)}"
    return d

def finger(bx, by, tx, ty, hw=4.0):
    """One finger-like diverticulum: two parallel sides + a ROUNDED tip cap.

    Open at the base (bx,by) because the finger merges into the gut wall. Used
    for the hepatic caecae — pointed lens shapes read as spikes, not fingers."""
    ux, uy = tx - bx, ty - by
    m = math.hypot(ux, uy) or 1
    ux, uy = ux/m, uy/m
    nx, ny = -uy, ux
    return (f"M {f(bx - nx*hw)} {f(by - ny*hw)} L {f(tx - nx*hw)} {f(ty - ny*hw)} "
            f"A {f(hw)} {f(hw)} 0 0 1 {f(tx + nx*hw)} {f(ty + ny*hw)} "
            f"L {f(bx + nx*hw)} {f(by + ny*hw)}")

_TOK = re.compile(r'([MLHVCSQTAZ])|(-?\d*\.?\d+)')
def mirror(d, cx):
    """Mirror an absolute-command path about x = cx (flips arc sweep)."""
    toks = _TOK.findall(d)
    out = []
    cmd = None; nums = []
    def flush():
        nonlocal nums
        if cmd is None: return
        if cmd == 'A':
            for i in range(0, len(nums), 7):
                rx, ry, rot, la, sw, x, y = nums[i:i+7]
                out.append(f"A {f(rx)} {f(ry)} {f(-rot)} {int(la)} {1-int(sw)} {f(2*cx-x)} {f(y)}")
        elif cmd == 'Z':
            out.append('Z')
        elif cmd in 'H':
            for v in nums: out.append(f"H {f(2*cx-v)}")
        elif cmd in 'V':
            for v in nums: out.append(f"V {f(v)}")
        else:
            for i in range(0, len(nums), 2):
                x, y = nums[i], nums[i+1]
                out.append(f"{cmd if i == 0 else ''} {f(2*cx-x)} {f(y)}".strip())
        nums = []
    for c, num in toks:
        if c:
            flush(); cmd = c; nums = []
            if c == 'Z': flush(); cmd = None
        else:
            nums.append(float(num))
    flush()
    return ' '.join(out)

def mirror_el(e, cx, suffix='_r'):
    e2 = dict(e); e2['id'] = e['id'] + suffix; e2['d'] = mirror(e['d'], cx)
    return e2

def bez_pt(p0, p1, p2, p3, t):
    u = 1 - t
    return (u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0],
            u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1])

def x_at_y(p0, p1, p2, p3, y):
    """x on a monotone-in-y cubic at height y (bisection)."""
    lo, hi = 0.0, 1.0
    for _ in range(40):
        mid = (lo + hi) / 2
        if bez_pt(p0, p1, p2, p3, mid)[1] < y: lo = mid
        else: hi = mid
    return bez_pt(p0, p1, p2, p3, (lo+hi)/2)[0]

def path_len(d):
    """Approximate length of an absolute path (M/L/Q/C/A/Z) — sanity only."""
    toks = _TOK.findall(d)
    cmd = None; nums = []; cur = (0, 0); start = (0, 0); L = 0.0
    def use():
        nonlocal L, cur, start, nums
        if cmd == 'M':
            for i in range(0, len(nums), 2):
                p = (nums[i], nums[i+1])
                if i == 0: cur = p; start = p
                else: L += math.dist(cur, p); cur = p
        elif cmd == 'L':
            for i in range(0, len(nums), 2):
                p = (nums[i], nums[i+1]); L += math.dist(cur, p); cur = p
        elif cmd == 'Q':
            for i in range(0, len(nums), 4):
                c = (nums[i], nums[i+1]); p = (nums[i+2], nums[i+3])
                prev = cur
                for k in range(1, 25):
                    t = k/24; u = 1-t
                    q = (u*u*cur[0]+2*u*t*c[0]+t*t*p[0], u*u*cur[1]+2*u*t*c[1]+t*t*p[1])
                    L += math.dist(prev, q); prev = q
                cur = p
        elif cmd == 'C':
            for i in range(0, len(nums), 6):
                c1 = (nums[i], nums[i+1]); c2 = (nums[i+2], nums[i+3]); p = (nums[i+4], nums[i+5])
                prev = cur
                for k in range(1, 25):
                    q = bez_pt(cur, c1, c2, p, k/24); L += math.dist(prev, q); prev = q
                cur = p
        elif cmd == 'A':
            for i in range(0, len(nums), 7):
                p = (nums[i+5], nums[i+6]); rx = nums[i]
                L += max(math.dist(cur, p), (math.pi * rx if math.dist(cur, p) < 1 else 1.2*math.dist(cur, p)))
                cur = p
        elif cmd == 'Z':
            L += math.dist(cur, start); cur = start
        nums = []
    for c, num in toks:
        if c:
            use(); cmd = c
            if c == 'Z': use(); cmd = None
        else:
            nums.append(float(num))
    use()
    return L

_WIDTHS = {}
try:
    import os as _os
    _p = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'label_widths.json')
    _WIDTHS = json.load(io.open(_p, encoding='utf-8'))
except Exception:
    pass


def label_w(text, sm=False, em=False):
    """Width of a rendered Kalam label.

    Kalam is proportional and per-char width runs 6.7-9.9 u at 17px depending on
    the letters, so a uniform estimate is wrong in BOTH directions: it clipped
    'Basement membrane' and false-failed 'Ventral longitudinal trunk'. Prefer the
    MEASURED width (label_widths.json, dumped by measure.mjs from the real render);
    fall back to the observed worst case for a string never rendered yet."""
    size = 25 if em else (17 if sm else 22)
    hit = _WIDTHS.get(f'{size}|{text}')
    if hit is not None:
        return hit
    return len(text) * (14.5 if em else (9.9 if sm else 12.8))


def check(elems, width, height, name):
    """Author-side sanity: stroke length cap, label bounds, label clearance."""
    bad = []
    labs = []
    for e in elems:
        if e['type'] == 'stroke':
            L = path_len(e['d'])
            if L > 660: bad.append(f"{name}: stroke {e['id']} ~{L:.0f} u (>650)")
        elif e['type'] == 'label':
            w = label_w(e['text'], sm=e.get('sm', False), em=e.get('em', False))
            h = 25 if e.get('em') else (17 if e.get('sm') else 22)
            x0, x1 = e['x'], e['x'] + w
            if x0 < 0 or x1 > width or e['y'] < 20 or e['y'] > height - 2:
                bad.append(f"{name}: label {e['id']} out of bounds ({x0:.0f}-{x1:.0f}, y {e['y']}) canvas {width}x{height}")
            labs.append((e['id'], x0, x1, e['y'], h))
    for i in range(len(labs)):
        for j in range(i+1, len(labs)):
            a, b = labs[i], labs[j]
            if a[1] < b[2] and b[1] < a[2]:
                if abs(a[3] - b[3]) < 40:
                    bad.append(f"{name}: labels {a[0]} / {b[0]} vertical gap {abs(a[3]-b[3])} < 40 with horizontal overlap")
    pauses = [i for i, e in enumerate(elems) if e['type'] == 'pause']
    if not pauses or pauses[0] != 0: bad.append(f"{name}: first element must be a pause")
    for i in pauses:
        if i == len(elems) - 1 or (i > 0 and elems[i-1]['type'] == 'pause'):
            bad.append(f"{name}: bad pause position at {i}")
    ids = [e['id'] for e in elems]
    if len(ids) != len(set(ids)): bad.append(f"{name}: duplicate ids " + str([i for i in ids if ids.count(i) > 1]))
    return bad
