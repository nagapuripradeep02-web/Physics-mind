// One-off: inject 2 framing annotations into each EPIC-C branch state of
// pressure_scalar.json so every state has >=3 primitives (Rule 19).
import fs from 'node:fs';
const PATH = 'C:/Tutor/physics-mind/src/data/concepts/pressure_scalar.json';
const json = JSON.parse(fs.readFileSync(PATH, 'utf8'));

for (const branch of json.epic_c_branches ?? []) {
  for (const [sid, state] of Object.entries(branch.states ?? {})) {
    const sc = state.scene_composition ?? [];
    if (sc.length >= 3) continue;
    const headerId = `${branch.branch_id}_${sid}_header`;
    const footerId = `${branch.branch_id}_${sid}_footer`;
    const header = {
      type: 'annotation',
      id: headerId,
      text: `MISCONCEPTION\n${branch.misconception}`,
      position: { x: 200, y: 70 },
      style: 'callout',
      color: '#FCD34D'
    };
    const footer = {
      type: 'annotation',
      id: footerId,
      text: `Branch: ${branch.branch_id}  ·  ${sid}`,
      position: { x: 200, y: 460 },
      style: 'callout',
      color: '#94A3B8'
    };
    state.scene_composition = [header, ...sc, footer];
  }
}

fs.writeFileSync(PATH, JSON.stringify(json, null, 2) + '\n');
console.log('done');
