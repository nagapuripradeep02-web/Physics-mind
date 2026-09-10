import json, io, os, sys, statistics as st
sys.argv=['x']; os.environ.setdefault('DS_PROBE_OUT','jee_main_2026_09_10')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ds_probe as P
J='jm2024-'
# hand grades after reading the crops and the model's closing lines
HAND = {(J+'01-feb-shift-1_che_q74','off'):3, (J+'06-apr-shift-1_che_q77','off'):1,
        (J+'29-jan-shift-2_che_q64','low'):2, (J+'29-jan-shift-2_che_q64','max'):2,
        (J+'30-jan-shift-1_che_q75','low'):4, (J+'30-jan-shift-1_che_q75','high'):4, (J+'30-jan-shift-1_che_q75','max'):4,
        (J+'01-feb-shift-2_che_q87','low'):'2', (J+'01-feb-shift-2_che_q87','high'):'2', (J+'01-feb-shift-2_che_q87','max'):'2',  # 1.93e5 C, exam integer = 2
        (J+'04-apr-shift-2_mat_q02','low'):1, (J+'04-apr-shift-2_mat_q08','off'):2, (J+'31-jan-shift-2_mat_q03','low'):2,
        (J+'09-apr-shift-2_phy_q48','high'):4, (J+'29-jan-shift-2_phy_q57','off'):'2'}
DISPUTED = {(J+'01-feb-shift-1_che_q74','low'), (J+'01-feb-shift-1_che_q74','high'), (J+'01-feb-shift-1_che_q74','max')}  # Pauling dEN puts ClF3 (0.82) below SO2 (0.86); key says option 3
EXCLUDED = {J+'09-apr-shift-2_che_q70'}  # crop cut off the reactant structure (extraction defect)
qs={q['id']:q for q in json.load(io.open(os.path.join(P.OUT,'sample.json'),encoding='utf-8'))}
rows=[json.loads(l) for l in io.open(os.path.join(P.OUT,'results.jsonl'),encoding='utf-8') if '"error"' not in l]
def verdict(r,q):
    k=(r['id'],r['cond'])
    if r['id'] in EXCLUDED: return 'excluded'
    if k in DISPUTED: return 'disputed'
    got = HAND[k] if k in HAND else P.grade(r,q)[0]
    if got is None: return 'noanswer'
    return 'right' if str(got)==str(q['answer']) else 'wrong'
conds=['off','low','high','max']
print('%-10s %-5s %5s %5s %5s %5s | %7s %7s | %6s %6s | %9s %9s' % ('subject','mode','n','right','wrong','disp','think','out','avg s','p95 s','$/q offpk','$/q peak'))
tot={c:dict(n=0,right=0,wrong=0,disp=0,cost_off=0,cost_pk=0,think=[],lat=[]) for c in conds}
wrongs=[]
for s in ('physics','chemistry','maths'):
    for c in conds:
        rs=[r for r in rows if r['cond']==c and qs[r['id']]['subject']==s and r['id'] not in EXCLUDED]
        v=[verdict(r,qs[r['id']]) for r in rs]
        n=len(rs); right=v.count('right'); wrong=v.count('wrong')+v.count('noanswer'); disp=v.count('disputed')
        think=[r['usage'].get('completion_tokens_details',{}).get('reasoning_tokens',0) for r in rs]
        out=[r['usage']['completion_tokens'] for r in rs]
        lat=[r['ms']/1000 for r in rs]
        co=sum(P.cost_usd(r['usage'],'off') for r in rs)/n; cp=sum(P.cost_usd(r['usage'],'peak') for r in rs)/n
        print('%-10s %-5s %5d %5d %5d %5d | %7.0f %7.0f | %6.1f %6.1f | %9.5f %9.5f' % (s,c,n,right,wrong,disp,st.mean(think),st.mean(out),st.mean(lat),sorted(lat)[int(0.95*(n-1))],co,cp))
        t=tot[c]; t['n']+=n; t['right']+=right; t['wrong']+=wrong; t['disp']+=disp; t['cost_off']+=co*n; t['cost_pk']+=cp*n; t['think']+=think; t['lat']+=lat
        for r,vv in zip(rs,v):
            if vv in ('wrong','noanswer'): wrongs.append((s,c,r['id'].replace(J,''),qs[r['id']]['answer'],vv))
    print()
print('TOTAL per mode (of %d questions):' % (tot['off']['n']))
for c in conds:
    t=tot[c]; n=t['n']
    print('  %-5s right %3d  wrong %2d  disputed %d  | think avg %5.0f | p95 %5.1f s | per 600 q: $%.2f off-peak / $%.2f peak' % (c,t['right'],t['wrong'],t['disp'],st.mean(t['think']),sorted(t['lat'])[int(0.95*(n-1))],t['cost_off']/n*600,t['cost_pk']/n*600))
print('\nmodel errors:')
for w in wrongs: print('  ',w)
