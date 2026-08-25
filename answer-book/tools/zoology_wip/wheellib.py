# -*- coding: utf-8 -*-
"""Exam-standard life-cycle wheel + parasite stage glyphs for unit 6 (bhw).

A wheel is simple stage shapes at COMPUTED elliptical positions joined by
curved arrows with separate arrowhead strokes, numbered in the label itself
("3. Precystic stage").  The centre of the ring stays EMPTY — the book's
plates draw the host's organs there, which no student can reproduce.
"""
import math
from figlib import (stroke, label, pause, poly, ellipse, circle, catmull,
                    arrow_head, label_w, f, finger, mirror)


# ── glyphs ───────────────────────────────────────────────────────────────────

def g_blob(p, x, y, r=16, seed=0.0, nuc=True, spiky=0.0):
    """Irregular amoeba outline (+ a nucleus dot)."""
    pts = []
    for k in range(12):
        a = 2 * math.pi * k / 12
        rr = r * (1 + (0.17 + spiky) * math.sin(3 * a + seed) + (0.09 + spiky) * math.cos(5 * a + seed))
        pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
    pts.append(pts[0])
    out = [stroke(p + '_out', poly(catmull(pts, 5)))]
    if nuc:
        out.append(stroke(p + '_nuc', circle(x - 3, y + 2, 4.2), w=1.4))
    return out


def g_two_blobs(p, x, y, r=12):
    """Binary fission: two blobs still joined by a waist."""
    out = g_blob(p + 'a', x - r + 1, y - 3, r=r, seed=0.7)
    out += g_blob(p + 'b', x + r - 1, y + 3, r=r, seed=2.1)
    return out


def g_oval(p, x, y, rx=12, ry=17, granules=3, bars=1):
    out = [stroke(p + '_out', ellipse(x, y, rx, ry))]
    for i in range(granules):
        a = 1.1 + i * 2.1
        out.append(stroke(p + '_gr%d' % i,
                          circle(x + rx * 0.45 * math.cos(a), y + ry * 0.45 * math.sin(a), 2.6), w=1.3))
    for i in range(bars):
        out.append(stroke(p + '_bar%d' % i,
                          poly([(x - 6, y + 9 + 4 * i), (x + 6, y + 7 + 4 * i)]), w=3.0))
    return out


def g_cyst(p, x, y, r=16, n=4, wall=True):
    """Round cyst: thick wall (two circles) + n nuclei."""
    out = [stroke(p + '_out', circle(x, y, r))]
    if wall:
        out.append(stroke(p + '_wall', circle(x, y, r - 3.6), w=1.4))
    for i in range(n):
        a = math.pi / 4 + i * 2 * math.pi / max(n, 1)
        cx, cy = x + r * 0.46 * math.cos(a), y + r * 0.46 * math.sin(a)
        out.append(stroke(p + '_n%d' % i, circle(cx, cy, 3.4), w=1.4))
    return out


def g_liver_cell(p, x, y, r=17):
    """A liver cell: a straight-sided cell with its OWN nucleus, so it never
    reads as another red blood cell."""
    pts = []
    for k in range(6):
        a = math.pi / 6 + 2 * math.pi * k / 6
        pts.append((x + r * 1.15 * math.cos(a), y + r * 0.95 * math.sin(a)))
    return [stroke(p + '_cell', poly(pts + [pts[0]])),
            stroke(p + '_hn', circle(x + r * 0.55, y - r * 0.4, 3.4), w=1.4)]


def g_signet(p, x, y, r=17):
    """Signet ring stage: RBC outline + a ring whose vacuole pushes the
    nucleus to ONE side."""
    return [stroke(p + '_rbc', circle(x, y, r)),
            stroke(p + '_ring', circle(x - 1, y + 1, r * 0.55), w=1.5),
            stroke(p + '_nuc', circle(x + r * 0.55 - 1, y + 1, 3.4), w=1.5)]


def g_schizont(p, x, y, r=17, n=10):
    out = [stroke(p + '_out', circle(x, y, r))]
    for i in range(n):
        a = 2 * math.pi * i / n + 0.3
        rr = r * (0.4 if i % 2 else 0.68)
        out.append(stroke(p + '_m%d' % i, circle(x + rr * math.cos(a), y + rr * math.sin(a), 2.9), w=1.3))
    return out


def g_cluster(p, x, y, n=7, r=15, er=4.0):
    """Freed merozoites / daughter amoebae: n small ovals in a loose group."""
    out = []
    for i in range(n):
        a = 2 * math.pi * i / n + 0.2
        rr = 0 if i == 0 else r * 0.72
        out.append(stroke(p + '_c%d' % i, ellipse(x + rr * math.cos(a), y + rr * math.sin(a), er, er * 1.35), w=1.5))
    return out


def g_sickle(p, x, y, L=26, w=7, tilt=-0.5):
    """Sickle / spindle sporozoite: swollen in the middle, pointed at both
    ends, drawn as two arcs meeting at the tips."""
    ux, uy = math.cos(tilt), math.sin(tilt)
    nx, ny = -uy, ux
    ax, ay = x - ux * L / 2, y - uy * L / 2
    bx, by = x + ux * L / 2, y + uy * L / 2
    c1 = (x + nx * w, y + ny * w)
    c2 = (x + nx * w * 0.34, y + ny * w * 0.34)
    d1 = "M %s %s Q %s %s %s %s" % (f(ax), f(ay), f(c1[0] + nx * 3), f(c1[1] + ny * 3), f(bx), f(by))
    d2 = "M %s %s Q %s %s %s %s" % (f(ax), f(ay), f(c2[0]), f(c2[1]), f(bx), f(by))
    return [stroke(p + '_a', d1), stroke(p + '_b', d2)]


def g_sickles(p, x, y, n=3, L=24):
    """A few free sporozoites, fanned apart so they never read as one scribble."""
    out = []
    place = [(-11, -11, -0.75), (0, 0, -0.5), (11, 11, -0.25)][:n]
    for i, (dx, dy, t) in enumerate(place):
        out += g_sickle(p + '%d' % i, x + dx, y + dy, L=L, w=6, tilt=t)
    return out


def g_worm(p, x, y, L=34, amp=6.0, hw=3.0, vert=True):
    """A larva: a wavy body drawn as two parallel edges."""
    n = 16
    top, bot = [], []
    for i in range(n + 1):
        t = i / n
        if vert:
            cx = x + amp * math.sin(t * 2.4 * math.pi)
            cy = y - L / 2 + L * t
            dx, dy = amp * 2.4 * math.pi * math.cos(t * 2.4 * math.pi) / L, 1.0
        else:
            cx = x - L / 2 + L * t
            cy = y + amp * math.sin(t * 2.4 * math.pi)
            dx, dy = 1.0, amp * 2.4 * math.pi * math.cos(t * 2.4 * math.pi) / L
        m = math.hypot(dx, dy) or 1
        nx, ny = -dy / m, dx / m
        top.append((cx + nx * hw, cy + ny * hw))
        bot.append((cx - nx * hw, cy - ny * hw))
    return [stroke(p + '_a', poly(top)), stroke(p + '_b', poly(bot))]


def g_sheathed(p, x, y, L=34):
    """Microfilaria inside its loose cuticular sheath."""
    out = g_worm(p + '_l', x, y, L=L, amp=5.0, hw=2.4)
    out.append(stroke(p + '_sh', ellipse(x, y, 11, L / 2 + 3), w=1.3))
    return out


def g_egg(p, x, y, rx=13, ry=17, inner=None):
    """Mammillated egg: oval shell with a bumpy protein coat."""
    out = [stroke(p + '_sh', ellipse(x, y, rx - 2.5, ry - 2.5))]
    pts = []
    n = 9
    for k in range(n):
        a = 2 * math.pi * k / n
        pts.append((x + rx * math.cos(a), y + ry * math.sin(a)))
    d = "M %s %s" % (f(pts[0][0]), f(pts[0][1]))
    for k in range(n):
        x1, y1 = pts[(k + 1) % n]
        x0, y0 = pts[k]
        r = math.hypot(x1 - x0, y1 - y0) / 2 * 1.55
        d += " A %s %s 0 0 1 %s %s" % (f(r), f(r), f(x1), f(y1))
    out.append(stroke(p + '_coat', d, w=1.5))
    if inner == 'larva':
        out.append(stroke(p + '_lv', "M %s %s C %s %s %s %s %s %s C %s %s %s %s %s %s" % (
            f(x - 6), f(y + 7), f(x + 8), f(y + 7), f(x + 8), f(y - 7), f(x - 5), f(y - 6),
            f(x - 9), f(y - 5), f(x - 8), f(y + 2), f(x - 4), f(y + 2)), w=1.6))
    elif inner == 'coil':
        out.append(stroke(p + '_lv', ellipse(x, y, 6.0, 4.2), w=1.6))
    return out


def g_star(p, x, y, r=13, n=8):
    """Exflagellation: a body with n lashing flagella-like threads."""
    out = [stroke(p + '_out', circle(x, y, r))]
    d = ""
    for i in range(n):
        a = 2 * math.pi * i / n + 0.2
        d += " M %s %s L %s %s" % (f(x + r * math.cos(a)), f(y + r * math.sin(a)),
                                   f(x + (r + 11) * math.cos(a)), f(y + (r + 11) * math.sin(a)))
    out.append(stroke(p + '_fl', d.strip(), w=1.4))
    return out


def g_cone(p, x, y, r=15):
    """Female gamete with the fertilization cone."""
    return [stroke(p + '_out', "M %s %s A %s %s 0 1 1 %s %s L %s %s Z" % (
        f(x - r * 0.55), f(y - r * 0.83), f(r), f(r), f(x - r * 0.55), f(y + r * 0.83),
        f(x + r + 8), f(y))),
        stroke(p + '_nuc', circle(x - 4, y, 3.6), w=1.4)]


def g_threads(p, x, y, n=4, L=24):
    """Free male gametes: n thin threads."""
    d = ""
    for i in range(n):
        yy = y - (n - 1) * 4 / 2 + i * 4.5
        d += " M %s %s Q %s %s %s %s" % (f(x - L / 2), f(yy), f(x), f(yy - 7 + 3.5 * (i % 2)), f(x + L / 2), f(yy))
    return [stroke(p + '_th', d.strip(), w=1.5)]


def g_ookinete(p, x, y, L=32, w=6.5, tilt=-0.6):
    """Elongated motile ookinete (a longer, blunter spindle than a sporozoite)."""
    ux, uy = math.cos(tilt), math.sin(tilt)
    nx, ny = -uy, ux
    ax, ay = x - ux * L / 2, y - uy * L / 2
    bx, by = x + ux * L / 2, y + uy * L / 2
    d = ("M %s %s Q %s %s %s %s Q %s %s %s %s" %
         (f(ax), f(ay), f(x + nx * w), f(y + ny * w), f(bx), f(by),
          f(x - nx * w), f(y - ny * w), f(ax), f(ay)))
    return [stroke(p + '_out', d), stroke(p + '_nuc', circle(x, y, 3.4), w=1.4)]


def g_oocyst(p, x, y, r=16, wall=True):
    """Oocyst sitting on a short section of the crop wall."""
    out = [stroke(p + '_out', circle(x, y, r))]
    for i in range(7):
        a = 2 * math.pi * i / 7 + 0.4
        out.append(stroke(p + '_g%d' % i, circle(x + r * 0.52 * math.cos(a), y + r * 0.52 * math.sin(a), 2.8), w=1.3))
    if wall:
        out.append(stroke(p + '_wall', poly([(x - r - 9, y + r + 4), (x + r + 9, y + r + 4)]), w=1.4))
    return out


def g_coiled_pair(p, x, y, r=15):
    """Two adult worms coiled together (Wuchereria in a lymph vessel)."""
    d1 = ("M %s %s C %s %s %s %s %s %s C %s %s %s %s %s %s" %
          (f(x - r), f(y - r * 0.5), f(x - r * 0.2), f(y - r * 1.5), f(x + r * 0.6), f(y - r * 0.2),
           f(x + r), f(y + r * 0.4), f(x + r * 0.4), f(y + r * 1.4), f(x - r * 0.6), f(y + r * 0.9),
           f(x - r), f(y + r * 0.2)))
    d2 = ("M %s %s C %s %s %s %s %s %s C %s %s %s %s %s %s" %
          (f(x - r * 0.9), f(y + r * 0.7), f(x - r * 0.1), f(y + r * 1.4), f(x + r * 0.7), f(y + r * 0.3),
           f(x + r * 0.9), f(y - r * 0.5), f(x + r * 0.3), f(y - r * 1.4), f(x - r * 0.7), f(y - r * 0.8),
           f(x - r * 0.95), f(y - r * 0.1)))
    return [stroke(p + '_w1', d1), stroke(p + '_w2', d2, w=1.6)]


def g_coil_one(p, x, y, r=14):
    """A single coiled young worm."""
    return [stroke(p + '_w', "M %s %s C %s %s %s %s %s %s C %s %s %s %s %s %s" % (
        f(x - r), f(y - r * 0.4), f(x - r * 0.1), f(y - r * 1.5), f(x + r * 0.8), f(y - r * 0.3),
        f(x + r * 0.9), f(y + r * 0.5), f(x + r * 0.4), f(y + r * 1.4), f(x - r * 0.7), f(y + r * 0.9),
        f(x - r * 0.9), f(y + r * 0.1)), w=2.3)]


def g_pair_ma_fe(p, x, y, r=19):
    """Male (short, hooked tail) beside female (long, straight tail)."""
    return [stroke(p + '_m', "M %s %s C %s %s %s %s %s %s C %s %s %s %s %s %s" % (
        f(x - 12), f(y - r), f(x - 17), f(y - r * 0.3), f(x - 8), f(y + r * 0.3), f(x - 12), f(y + r * 0.75),
        f(x - 16), f(y + r * 1.05), f(x - 22), f(y + r * 0.7), f(x - 19), f(y + r * 0.35)), w=2.3),
        stroke(p + '_f', "M %s %s C %s %s %s %s %s %s" % (
            f(x + 12), f(y - r * 1.15), f(x + 18), f(y - r * 0.3), f(x + 7), f(y + r * 0.4),
            f(x + 13), f(y + r * 1.15)), w=2.3)]


# ── the wheel ────────────────────────────────────────────────────────────────

def wheel(cx, cy, rx, ry, n, start_deg=-90):
    """n angles evenly spaced, clockwise from the top."""
    return [math.radians(start_deg + 360.0 * k / n) for k in range(n)]


def pt(cx, cy, rx, ry, a):
    return cx + rx * math.cos(a), cy + ry * math.sin(a)


def wheel_arrows(p, cx, cy, rx, ry, angles, pad=0.24, bulge=1.0):
    """A curved arrow from each stage to the next, arrowhead as its own stroke."""
    out = []
    n = len(angles)
    for k in range(n):
        a0, a1 = angles[k], angles[(k + 1) % n]
        if a1 <= a0:
            a1 += 2 * math.pi
        s, e = a0 + pad, a1 - pad
        pts = []
        m = 12
        for i in range(m + 1):
            a = s + (e - s) * i / m
            pts.append((cx + rx * bulge * math.cos(a), cy + ry * bulge * math.sin(a)))
        out.append(stroke('%s_ar%d' % (p, k), poly(pts[:-1]), w=1.6))
        out.append(stroke('%s_ah%d' % (p, k), arrow_head(pts[-1][0], pts[-1][1], pts[-3][0], pts[-3][1], size=8), w=1.6))
    return out


def wheel_labels(p, cx, cy, rx, ry, angles, names, pad=30, W=520, H=384, dy=None):
    out = []
    for i, (a, name) in enumerate(zip(angles, names)):
        lx = cx + (rx + pad) * math.cos(a)
        ly = cy + (ry + pad) * math.sin(a)
        w = label_w(name, sm=True)
        ca, sa = math.cos(a), math.sin(a)
        if ca > 0.35:
            x = lx
        elif ca < -0.35:
            x = lx - w
        else:
            x = lx - w / 2
        x = max(4, min(W - w - 4, x))
        y = ly + (14 if sa > 0.35 else (-8 if sa < -0.35 else 4))
        if dy and i in dy:
            y += dy[i]
        y = max(22, min(H - 4, y))
        out.append(label('%s_l%d' % (p, i), round(x, 1), round(y, 1), name))
    return out
