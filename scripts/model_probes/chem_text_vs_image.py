"""Vision or reasoning? The chemistry items DeepSeek V4.1 Flash missed from the PHOTO, re-asked as TYPED TEXT
(structures as names / SMILES). Solved from text = the picture reading failed; still wrong = the chemistry did.
Two controls are questions that were already pure text in the photo (a miss there is reasoning by construction).

usage: python scripts/model_probes/chem_text_vs_image.py     -> docs/reports/model_probes/data/chem_text_vs_image/results.jsonl
"""
import io, json, os, sys, time, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); ONLY = set(sys.argv[1:]); sys.argv = ['x']
import ds_probe as P

OUT = os.path.join(P.REPO, 'docs', 'reports', 'model_probes', 'data', 'chem_text_vs_image')
ITEMS = [
 dict(id='jm2024-08-apr-shift-1_che_q73', kind='structure', key=1, photo_answer='3 at every level',
      text='Which of the following are aromatic?\nA. A bicyclic C10H10 hydrocarbon: two fused six-membered rings, with exactly four C=C bonds in total (two in each ring) and a single bond at the ring fusion.\nB. Styrene (vinylbenzene).\nC. [10]Annulene (cyclodeca-1,3,5,7,9-pentaene).\nD. [14]Annulene.\n(1) B and D only (2) A and C only (3) A and B only (4) C and D only'),
 dict(id='jm2024-30-jan-shift-2_che_q86', kind='structure', key='4', photo_answer='8 at every level',
      text='Number of geometrical isomers possible for the compound with SMILES [2H]C=C(C)CC(=CC)CC(C)=C[2H] (i.e. CHD=C(CH3)-CH2-C(=CH-CH3)-CH2-C(CH3)=CHD) is/are ______.'),
 dict(id='jm2024-30-jan-shift-1_che_q65', kind='structure', key=1, photo_answer='4 (read option 4 as benzene) at every level',
      text='Which of the following molecule/species is most stable?\n(1) cyclopropenyl cation\n(2) cyclopentadienyl cation\n(3) cyclopropenyl anion\n(4) cyclohexa-1,3-diene'),
 dict(id='jm2024-31-jan-shift-2_che_q63', kind='structure', key=1, photo_answer='2 at every level',
      text='Identify A and B in the reaction sequence: bromobenzene --(conc. HNO3)--> A --(i) NaOH (ii) HCl--> B\n(1) A = 1-bromo-2,4,6-trinitrobenzene, B = 2,4,6-trinitrophenol\n(2) A = 1-bromo-4-nitrobenzene, B = 2-bromo-5-nitrophenol\n(3) A = 1-bromo-2,4-dinitrobenzene, B = 2-bromo-5-nitro-1,3-benzenediol\n(4) A = nitrobenzene, B = 4-nitrophenol'),
 dict(id='jm2024-09-apr-shift-2_che_q88', kind='text-control', key='4', photo_answer='5 at high/max',
      text='Number of compounds from the following which cannot undergo Friedel-Crafts reactions is: ____\ntoluene, nitrobenzene, xylene, cumene, aniline, chlorobenzene, m-nitroaniline, m-dinitrobenzene'),
 dict(id='jm2024-29-jan-shift-1_che_q89', kind='text-control', key='3', photo_answer='4 at low/max',
      text='Number of compounds which give positive Fehling\'s test from the following is ____:\nacetaldehyde, benzaldehyde, methanal, acetophenone, 4-nitrobenzaldehyde, cyclohexanecarbaldehyde, acetone, benzophenone'),
]
ASK = 'Please solve this question\n\n'


def call(key, text, effort):
    body = {'model': P.MODEL, 'max_tokens': 32000, 'messages': [{'role': 'user', 'content': ASK + text}],
            'thinking': {'type': 'enabled'}, 'reasoning_effort': effort}
    req = urllib.request.Request('https://api.deepseek.com/chat/completions', data=json.dumps(body).encode(),
                                 headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
    t = time.time()
    with urllib.request.urlopen(req, timeout=600) as r:
        j = json.load(r)
    m = j['choices'][0]['message']
    return {'content': m.get('content'), 'usage': j['usage'], 'ms': int((time.time() - t) * 1000), 'finish': j['choices'][0].get('finish_reason')}


def main():
    os.makedirs(OUT, exist_ok=True)
    key = P.key()
    out = io.open(os.path.join(OUT, 'results.jsonl'), 'a', encoding='utf-8')
    for it in ITEMS:
        if ONLY and not any(it['id'].endswith(o) for o in ONLY):
            continue
        for effort in ('high', 'high'):   # two draws per item
            r = call(key, it['text'], effort)
            row = dict(it, cond=effort, **r)
            out.write(json.dumps(row, ensure_ascii=False) + '\n'); out.flush()
            tail = (r['content'] or '')[-160:].replace('\n', ' ')
            print('%-34s key=%-3s finish=%-6s tok=%5d photo:%-40s | %s' % (it['id'].replace('jm2024-', ''), it['key'], r['finish'], r['usage']['completion_tokens'], it['photo_answer'], tail))


if __name__ == '__main__':
    main()
