"""unicode_to_katex.py — turn a Unicode-maths answer line into (plain Unicode | KaTeX).

    from unicode_to_katex import convert, tex
    convert("I = ∫₀^(π/2) sin⁴x dx")   ->  ('katex', r'I = \int _{0}^{\pi /2} \sin ^{4}x dx')
    convert("A = ∫₀^1 (x² − x³) dx")    ->  ('plain', 'A = ∫₀¹ (x² − x³) dx')

Written for Maths-2B Definite Integrals (2026-09-13), where 174 working lines
wrote limits and fractional powers as ASCII (`∫₀^(π/2)`, `(16 − x²)^(5/2)`) and
the page printed the carets. The rule it implements, decided once:

  · a `^X` / `^(…)` whose every character has a Unicode superscript becomes one,
    and the line stays in the handwriting;
  · anything else (every π limit, every fractional power) makes the WHOLE line
    KaTeX — fractions stay inline with "/" so the width barely changes;
  · English words become \\text{} only from a WHITELIST (EN); a single letter is
    always a variable.

It is deterministic, which is what lets an expansion reuse it: author the full
working in the same Unicode shorthand, convert it, and every spine line the
expansion left alone produces byte-identical TeX, so mark_expansion.py still
anchors it in ink.

Scars — each was caught only by reading output, never by the compile or the
letters-and-digits fidelity check:
  · a root over a function closed before its bracket: √sin(π/2−x);
  · "ab²" and the "f" of "Let f(x)" read as English words;
  · a function name after θ (sin²θcos⁴θ) was left bare, so KaTeX drew c·o·s as
    three variables — a function is now declined only after an ASCII letter.
So after converting a batch: compile every line through KaTeX, compare the
letters and digits, READ the lines with roots, prose or adjacent functions,
and run sweep_typeset_width.mjs on the built page.
"""
import re
SUP = {"k":"ᵏ",'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
       'a':'ᵃ','b':'ᵇ','c':'ᶜ','n':'ⁿ','m':'ᵐ','x':'ˣ','y':'ʸ','t':'ᵗ','−':'⁻','+':'⁺'}
SUPREV = {v:k for k,v in SUP.items()}
SUB = {'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','₋':'-','ₐ':'a','ₓ':'x','ₙ':'n'}
FUNCS = ['cosec','Tan⁻¹','Sin⁻¹','Cos⁻¹','sinh⁻¹','cosh⁻¹','Tanh⁻¹','sin','cos','tan','sec','cot','log']
TEXFN = {'sin':r'\sin','cos':r'\cos','tan':r'\tan','sec':r'\sec','cot':r'\cot','log':r'\log','cosec':r'\operatorname{cosec}',
         'Tan⁻¹':r'\operatorname{Tan}^{-1}','Sin⁻¹':r'\operatorname{Sin}^{-1}','Cos⁻¹':r'\operatorname{Cos}^{-1}',
         'sinh⁻¹':r'\sinh^{-1}','cosh⁻¹':r'\cosh^{-1}','Tanh⁻¹':r'\operatorname{Tanh}^{-1}'}
SYM = {'π':r'\pi ','θ':r'\theta ','α':r'\alpha ','β':r'\beta ','λ':r'\lambda ','·':r'\cdot ','×':r'\times ','−':'-','⇒':r'\Rightarrow ',
       '∴':r'\therefore ','∵':r'\because ','…':r'\dots ','≤':r'\le ','≥':r'\ge ','→':r'\to ','±':r'\pm ','≠':r'\neq ','∞':r'\infty ',
       '∫':r'\int ','{':r'\{','}':r'\}','%':r'\%','≡':r'\equiv ','′':"'"}
EN = {'given','solution','hence','general','required','particular','therefore','when','is','odd','even','let','by','or','and','we','know','required','area','put','adding','also','so','here','standard','formula','since','then','with','at','the','of','from','to','for','gives','now','take','both','subtract','divide','multiply','in','on','as','it','this','that','lies','between','where','are','be','an'}
MATHWORDS = {'dx','dt','dy','dθ','du','dv','sin','cos','tan','sec','cot','log','cosec','Tan','Sin','Cos','sinh','cosh','Tanh','e'}

def try_unicode(t):
    """Replace ^X where X is one char with a superscript form; ^(…) where every char has one."""
    def rep(m):
        body = m.group(1) or m.group(2)
        if all(ch in SUP for ch in body): return ''.join(SUP[ch] for ch in body)
        return m.group(0)
    return re.sub(r'\^\(([^()]*)\)|\^([0-9a-zA-Zπ])', rep, t)

def balanced(s, i, o='(', c=')'):
    d=0
    for j in range(i, len(s)):
        if s[j]==o: d+=1
        elif s[j]==c:
            d-=1
            if d==0: return j
    return -1

def tex(t):
    out=[]; i=0; n=len(t)
    while i<n:
        ch=t[i]
        # ^(…)  or ^X
        if ch=='^':
            if i+1<n and t[i+1]=='(':
                j=balanced(t,i+1); inner=t[i+2:j]; out.append('^{'+tex(inner)+'}'); i=j+1; continue
            out.append('^{'+tex(t[i+1])+'}'); i+=2; continue
        # _(…)
        if ch=='_' and i+1<n and t[i+1]=='(':
            j=balanced(t,i+1); out.append('_{'+tex(t[i+2:j])+'}'); i=j+1; continue
        # run of subscripts
        if ch in SUB:
            j=i
            while j<n and t[j] in SUB: j+=1
            out.append('_{'+''.join(SUB[c] for c in t[i:j])+'}'); i=j; continue
        # run of superscripts
        if ch in SUPREV:
            j=i
            while j<n and t[j] in SUPREV: j+=1
            out.append('^{'+''.join(SUPREV[c].replace('−','-') for c in t[i:j])+'}'); i=j; continue
        # √
        if ch=='√':
            if i+1<n and t[i+1]=='(':
                j=balanced(t,i+1); out.append(r'\sqrt{'+tex(t[i+2:j])+'}'); i=j+1; continue
            mf=re.match(r'(sin|cos|tan|sec|cot)\(', t[i+1:])
            if mf:
                j=balanced(t, i+1+len(mf.group(1)))
                out.append(r'\sqrt{'+tex(t[i+1:j+1])+'}'); i=j+1; continue
            m=re.match(r'(sin|cos|tan|sec)?[A-Za-z0-9θ]+', t[i+1:])
            if m:
                out.append(r'\sqrt{'+tex(m.group(0))+'}'); i+=1+len(m.group(0)); continue
        # functions
        hit=None
        for f in FUNCS:
            if t.startswith(f,i) and not (i>0 and t[i-1].isascii() and t[i-1].isalpha()): hit=f; break
        if hit:
            out.append(TEXFN[hit]+' '); i+=len(hit); continue
        # abbreviations the answers use as words
        ab=re.match(r'(D\.E\.?|I\.F\.?)', t[i:])
        if ab and not (i>0 and t[i-1].isalpha()):
            lead = ' ' if ''.join(out).strip() else ''
            out.append(r'\text{'+lead+ab.group(0)+' }'); i+=len(ab.group(0)); continue
        # English word runs -> \text
        m=re.match(r'[A-Za-z]{2,}', t[i:])
        if m and m.group(0).lower() in EN and not (i>0 and t[i-1].isalpha()) \
                and not (i+len(m.group(0))<n and t[i+len(m.group(0))].isalpha()):
            # a run of WHITELISTED English words only; a single letter is always a variable
            m2=re.match(r"(?:[A-Za-z]{2,}[ ,:]*)+", t[i:])
            ws=re.findall(r"[A-Za-z]{2,}[ ,:]*", m2.group(0))
            keep=''
            for w in ws:
                if re.match(r'[A-Za-z]+', w).group(0).lower() in EN: keep+=w
                else: break
            lead = ' ' if ''.join(out).strip() else ''
            out.append(r'\text{'+lead+keep.rstrip()+' }'); i+=len(keep.rstrip()); continue
        if ch in SYM: out.append(SYM[ch]); i+=1; continue
        if ch==' ': out.append(r'\ ' if (out and out[-1].startswith(r'\text')) else ' '); i+=1; continue
        out.append(ch); i+=1
    res = ''.join(out).replace('  ',' ')
    # adjacent prose runs are one run: "\text{Given }\ \text{ D.E }" -> "\text{Given D.E }"
    while True:
        m = re.sub(r'\\text\{([^}]*?) ?\}\\ \\text\{ ?([^}]*)\}', lambda g: '\\text{'+g.group(1)+' '+g.group(2)+'}', res, count=1)
        if m == res: break
        res = m
    return res

def convert(t):
    u = try_unicode(t)
    if '^' not in u and '_(' not in u: return ('plain', u)
    return ('katex', tex(t).strip())

def norm(s):
    s = ''.join(SUPREV.get(c, SUB.get(c, c)) for c in s)
    return re.sub(r'[\s^_(){}\[\]√−\-|\\]', '', s.replace('−','-'))
