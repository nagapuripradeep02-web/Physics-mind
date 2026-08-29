"""Inject a generated figure into a question file's diagram step.
usage: python inject_fig.py <figs.json> <question.json> <step_id> <fig_id>"""
import json, io, sys

figs_path, q_path, step_id, fig_id = sys.argv[1:5]
figs = json.load(io.open(figs_path, encoding='utf-8'))
q = json.load(io.open(q_path, encoding='utf-8'))
fig = figs[fig_id]
hit = 0
for st in q['answer']['steps']:
    if st['id'] == step_id:
        st['figure'] = fig
        hit += 1
if hit != 1:
    raise SystemExit(f'step {step_id} matched {hit} times in {q_path}')
io.open(q_path, 'w', encoding='utf-8').write(json.dumps(q, indent=2, ensure_ascii=False) + '\n')
drawn = len([e for e in fig['elements'] if e['type'] != 'pause'])
phases = len([e for e in fig['elements'] if e['type'] == 'pause'])
print(f'{q_path}: {fig_id} -> {step_id} ({drawn} drawn, {phases} phases)')
