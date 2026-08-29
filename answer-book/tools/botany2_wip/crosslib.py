# -*- coding: utf-8 -*-
"""crosslib.py — shared parts for the genetics cross diagrams.

Five of Unit 9's figures are the same drawing with different letters: a parent line,
gametes, a Punnett square and a ratio. Hand-placing each one is how labels end up
colliding, so every position here is COMPUTED from the measured Kalam width of the text
that goes in it (docs/patterns/answer_book.md: "compute placements with a script for
anything radial or repeated").
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'zoology_wip'))
import figlib as F


def w(text, em=False):
    return F.label_w(text, sm=not em, em=em)


def centred(id_, cx, y, text, em=False):
    """A label whose CENTRE is at cx. figlib labels anchor at their left edge."""
    return F.label(id_, round(cx - w(text, em) / 2), y, text, sm=not em, em=em)


def gamete(id_, cx, cy, text, r=17):
    """A circled gamete: the ring, then the letters centred in it."""
    return [F.stroke(id_ + '_o', F.circle(cx, cy, r), w=1.8),
            centred(id_ + '_t', cx, cy + 5, text)]


def arrow(id_, x1, y1, x2, y2, wt=1.6):
    return [F.stroke(id_, F.line(x1, y1, x2, y2), w=wt),
            F.stroke(id_ + '_h', F.arrow_head(x2, y2, x1, y1, size=6))]


def square(pfx, x0, y0, cw, ch, cols, rows, cells, head_gap=14):
    """A Punnett square. `cells` is a row-major list of strings, len == len(rows)*len(cols).

    Column heads sit ABOVE the grid, row heads to its LEFT, each centred on its lane —
    so a two-letter head and a four-letter head both land in the middle of their column.
    """
    nC, nR = len(cols), len(rows)
    W, H = cw * nC, ch * nR
    out = [F.stroke(f'{pfx}_box_t', F.line(x0, y0, x0 + W, y0), w=1.8),
           F.stroke(f'{pfx}_box_b', F.line(x0, y0 + H, x0 + W, y0 + H), w=1.8),
           F.stroke(f'{pfx}_box_l', F.line(x0, y0, x0, y0 + H), w=1.8),
           F.stroke(f'{pfx}_box_r', F.line(x0 + W, y0, x0 + W, y0 + H), w=1.8)]
    for i in range(1, nC):
        out.append(F.stroke(f'{pfx}_v{i}', F.line(x0 + i * cw, y0, x0 + i * cw, y0 + H), w=1.4))
    for i in range(1, nR):
        out.append(F.stroke(f'{pfx}_h{i}', F.line(x0, y0 + i * ch, x0 + W, y0 + i * ch), w=1.4))
    for i, ctext in enumerate(cols):
        out.append(centred(f'{pfx}_ch{i}', x0 + (i + 0.5) * cw, y0 - head_gap, ctext))
    for i, rtext in enumerate(rows):
        out.append(F.label(f'{pfx}_rh{i}', round(x0 - w(rtext) - 12), y0 + (i + 0.5) * ch + 5, rtext))
    for i, ctext in enumerate(cells):
        r, c = divmod(i, nC)
        out.append(centred(f'{pfx}_c{i}', x0 + (c + 0.5) * cw, y0 + (r + 0.5) * ch + 5, ctext))
    return out


def check(fig, name):
    return F.check(fig['elements'], fig['width'], fig['height'], name)


def box(pfx, cx, y, text, bw=None, bh=36, pad=28):
    """A labelled flow-chart box, centred on cx, top edge at y. Width is taken from the
    MEASURED text width plus padding unless given, so a box can never be narrower than
    the words in it."""
    bw = bw or (w(text) + pad * 2)
    x0, x1 = cx - bw / 2, cx + bw / 2
    return [F.stroke(f'{pfx}_t', F.line(x0, y, x1, y), w=1.8),
            F.stroke(f'{pfx}_b', F.line(x0, y + bh, x1, y + bh), w=1.8),
            F.stroke(f'{pfx}_l', F.line(x0, y, x0, y + bh), w=1.8),
            F.stroke(f'{pfx}_r', F.line(x1, y, x1, y + bh), w=1.8),
            centred(f'{pfx}_x', cx, y + bh / 2 + 5, text)], bw
