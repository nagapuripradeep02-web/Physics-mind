#!/usr/bin/env python3
"""
propose_formulas.py — tag each card with the formulas it uses.

    python3 answer-book/tools/propose_formulas.py mathematics            # report only
    python3 answer-book/tools/propose_formulas.py mathematics --write    # write the key
    python3 answer-book/tools/propose_formulas.py mathematics --find "2 sinθ cosθ"

The formula sheet (answer-book/formulas/<subject>.json) owns the wording of every
formula a paper's answers use. This tool fills in the other half — which cards use
which — by searching each card's WRITTEN LINES for the signatures the registry
authors under `match`.

It proposes; a person confirms. `--write` is for a run whose report has been read.

Why substring matching over a normalised string, and not a line-for-line compare:
a formula almost never appears on a card as its own line. It appears inside worked
arithmetic, with the card's own variables, in plain Unicode on one card and as TeX
on the next. So both the card and the signature are flattened hard — TeX commands
unwrapped, greek names turned into their letters, superscripts spelled `^2`, every
space and BRACKET removed, lowercased — and then compared as plain substrings. That
is why a signature should be the DISTINCTIVE core of a formula ("2sinθcosθ"), not
a whole line.

--find is the authoring loop: it shows which cards contain a candidate signature
and how they write it, which is the only reliable way to choose one.

A formula that matches nothing fails the build (it would be a row no student could
ever earn), so a zero here is the signal to fix the signature — or to drop a
formula this paper's cards never actually use.
"""
import json, re, sys, glob, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # answer-book/

GREEK = {
    'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ', 'epsilon': 'ε', 'theta': 'θ',
    'lambda': 'λ', 'mu': 'μ', 'nu': 'ν', 'pi': 'π', 'rho': 'ρ', 'sigma': 'σ', 'tau': 'τ',
    'phi': 'φ', 'psi': 'ψ', 'omega': 'ω',
}
# Multi-character runs FIRST: '⁻¹' is one exponent, and mapping each character on
# its own turns Sin⁻¹ into "sin^-^1" on one side and "sin^-1" on the other.
SUP_RUNS = {'⁻¹': '^-1', '⁻²': '^-2', '⁻³': '^-3', '⁻ⁿ': '^-n'}
SUP = {'⁰': '^0', '¹': '^1', '²': '^2', '³': '^3', '⁴': '^4', 'ⁿ': '^n', '⁻': '^-',
       'ˣ': '^x', 'ʸ': '^y', 'ᶻ': '^z', 'ᵏ': '^k', 'ᵐ': '^m', 'ⁱ': '^i', 'ʲ': '^j', 'ᵃ': '^a', 'ᵇ': '^b'}
TEX = {
    r'\therefore': '∴', r'\because': '∵', r'\cdot': '·', r'\times': '×', r'\div': '/',
    r'\Rightarrow': '⇒', r'\rightarrow': '→', r'\to': '→', r'\in': '∈', r'\pm': '±',
    r'\mp': '∓', r'\le': '≤', r'\ge': '≥', r'\ne': '≠', r'\infty': '∞', r'\circ': '°',
    r'\angle': '∠', r'\perp': '⊥', r'\cup': '∪', r'\cap': '∩', r'\subseteq': '⊆',
}

def _unwrap(pat, src, repl):
    """One non-nested \\cmd{...} unwrap, applied until it stops changing."""
    for _ in range(6):
        new = re.sub(pat, repl, src)
        if new == src:
            break
        src = new
    return src

def flatten(text: str) -> str:
    t = text
    # TeX scaffolding that carries no meaning for a match
    t = re.sub(r'\\(left|right|big|Big|bigg|Bigg|displaystyle|limits|quad|qquad|mathrm|mathbf|nolimits)\b', ' ', t)
    t = re.sub(r'\\[!,;:>]', ' ', t)
    t = t.replace('\\ ', ' ').replace('\\\\', ' ')
    t = _unwrap(r'\\text(?:rm|bf|it)?\{([^{}]*)\}', t, r'\1')
    t = _unwrap(r'\\operatorname\*?\{([^{}]*)\}', t, r'\1')
    # Grouping braces after ^ or _ go first, so the fraction unwrap below (which
    # cannot see through a nested brace) reaches \dfrac{e^{x} + e^{-x}}{2}.
    t = _unwrap(r'([\^_])\{([^{}]*)\}', t, r'\1\2')
    t = _unwrap(r'\\(?:d?frac)\{([^{}]*)\}\{([^{}]*)\}', t, r'(\1)/(\2)')
    t = _unwrap(r'\\sqrt\{([^{}]*)\}', t, r'√(\1)')
    t = _unwrap(r'\\overline\{([^{}]*)\}', t, r'\1')
    for k, v in TEX.items():
        t = t.replace(k, v)
    t = re.sub(r'\\([A-Za-z]+)', r'\1', t)          # \cos → cos, \theta → theta
    for name, letter in GREEK.items():
        t = re.sub(name, letter, t, flags=re.I)
    for k, v in SUP_RUNS.items():
        t = t.replace(k, v)
    for k, v in SUP.items():
        t = t.replace(k, v)
    t = t.replace('−', '-').replace('–', '-').replace('—', '-').replace('‐', '-')
    t = t.replace('∣', '|')
    # EVERY bracket goes, and that is the load-bearing line. \dfrac{n(n+1)(2n+1)}{6}
    # unwraps to "(n(n+1)(2n+1))/(6)" while the same formula typed by hand reads
    # "n(n+1)(2n+1)/6" — one wrapping paren apart, and never a substring of the
    # other. Half the formulas scored zero on the first authoring run for exactly
    # that. Grouping is scaffolding here, not meaning, and the signatures are
    # distinctive without it. Bars stay: |a × b| IS meaning.
    t = re.sub(r'[\s{}$&()\[\]]+', '', t)
    t = t.lower()
    # '⁻' and 'ˣ' each become their own caret; e⁻ˣ must read e^-x, not e^-^x.
    t = t.replace('^-^', '^-').replace('^^', '^')
    return t

def card_text(q) -> str:
    """Every written line of the card, flattened into one searchable string."""
    parts = []
    for s in q['answer']['steps']:
        for key in ('lines', 'lines_compact'):
            for l in (s.get(key) or []):
                parts.append(l if isinstance(l, str) else l.get('text', ''))
    for c in (q.get('cuts') or []):
        for cs in (c.get('steps') or {}).values():
            for l in (cs.get('lines') or []):
                parts.append(l if isinstance(l, str) else l.get('text', ''))
    return '\n'.join(flatten(p) for p in parts)

def find(subject: str, needle: str, limit: int = 12):
    """--find: how many of this paper's cards contain a candidate signature, and
    what the surrounding written text looks like. The authoring loop: a formula the
    report scores 0 is almost always spelled differently on the page than in the
    signature, and this is how to see which."""
    pat = flatten(needle)
    print(f'signature: {needle!r}\n flattened: {pat!r}\n')
    n = 0
    for path in sorted(glob.glob(os.path.join(ROOT, 'questions', '*.json'))):
        q = json.load(open(path, encoding='utf-8'))
        if q.get('subject') != subject:
            continue
        for s in q['answer']['steps']:
            for l in (s.get('lines') or []):
                raw = l if isinstance(l, str) else l.get('text', '')
                if pat and pat in flatten(raw):
                    n += 1
                    if n <= limit:
                        print(f'  {q["question_id"]}  u{q["unit"]["number"]}\n      {raw[:120]}')
                    break
            else:
                continue
            break
    print(f'\n  {n} card(s)')

def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    subject = sys.argv[1]
    if '--find' in sys.argv:
        return find(subject, sys.argv[sys.argv.index('--find') + 1])
    write = '--write' in sys.argv

    sheet_path = os.path.join(ROOT, 'formulas', f'{subject}.json')
    sheet = json.load(open(sheet_path, encoding='utf-8'))
    formulas = [(ch['number'], f) for ch in sheet['chapters'] for f in ch['formulas']]
    sigs = {f['id']: [flatten(m) for m in f['match']] for _, f in formulas}
    names = {f['id']: f['name'] for _, f in formulas}
    chapter_of = {f['id']: n for n, f in formulas}

    cards = []
    for path in sorted(glob.glob(os.path.join(ROOT, 'questions', '*.json'))):
        q = json.load(open(path, encoding='utf-8'))
        if q.get('subject') == subject:
            cards.append((path, q))

    hits = {fid: [] for fid in sigs}
    per_card = {}
    for path, q in cards:
        hay = card_text(q)
        found = [fid for fid, pats in sigs.items() if any(p in hay for p in pats)]
        found.sort(key=lambda fid: (chapter_of[fid], fid))
        per_card[q['question_id']] = found
        for fid in found:
            hits[fid].append(q['question_id'])

    print(f'{subject}: {len(cards)} cards · {len(sigs)} formulas\n')
    dead = []
    for ch in sheet['chapters']:
        print(f'  chapter {ch["number"]}')
        for f in ch['formulas']:
            n = len(hits[f['id']])
            flag = '  ← NO CARD' if n == 0 else ''
            print(f'    {n:4d}  {f["id"]:<44} {names[f["id"]][:40]}{flag}')
            if n == 0:
                dead.append(f['id'])
    tagged = sum(1 for v in per_card.values() if v)
    print(f'\n  {tagged} cards tagged · {len(cards) - tagged} use none')
    if dead:
        print(f'\n  ✗ {len(dead)} formula(s) match no card — the build will refuse these:')
        for fid in dead:
            print(f'      {fid}')

    if write:
        if dead:
            sys.exit('\nrefusing to write while a formula matches no card — fix the signatures first')
        changed = 0
        for path, q in cards:
            want = per_card[q['question_id']]
            if q.get('formulas') == want:
                continue
            # Rebuild in key order so `formulas` lands after insider_note, never
            # at the end of a file whose last key is `answer`.
            out = {}
            for k, v in q.items():
                if k == 'formulas':
                    continue
                out[k] = v
                if k == 'insider_note':
                    out['formulas'] = want
            if 'formulas' not in out:
                out['formulas'] = want
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
            changed += 1
        print(f'\n  wrote `formulas` into {changed} card(s)')

if __name__ == '__main__':
    main()
