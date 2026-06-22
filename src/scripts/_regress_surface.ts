/* Throwaway regression: prove the data-driven control surface accepts every
 * authored magnetic op exactly as before (no ops silently dropped). */
import fs from "fs";
import path from "path";
import { getConceptMoves } from "@/lib/voiceProfessor/professorBrain";

const CID = "magnetic_force_moving_charge";
const bundle = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "src", "data", "voice_professor", `${CID}.json`), "utf-8"),
) as { moves: Array<{ move_id: string; sequence: Array<{ ops?: unknown[] }> }> };

const authored = new Map<string, { beats: number; ops: number }>();
for (const m of bundle.moves) {
    authored.set(m.move_id, {
        beats: m.sequence.length,
        ops: m.sequence.reduce((n, b) => n + (b.ops?.length ?? 0), 0),
    });
}

const validated = getConceptMoves(CID);
let ok = true;
console.log(`Loaded ${validated.length} validated moves for ${CID}\n`);
for (const v of validated) {
    const a = authored.get(v.move_id)!;
    const vOps = v.beats.reduce((n, b) => n + b.ops.length, 0);
    const pass = v.beats.length === a.beats && vOps === a.ops;
    if (!pass) ok = false;
    console.log(
        `${pass ? "✓" : "✗"} ${v.move_id}: beats ${v.beats.length}/${a.beats}, ops ${vOps}/${a.ops}`,
    );
}
// every authored move must survive
if (validated.length !== bundle.moves.length) { ok = false; console.log(`✗ move count ${validated.length}/${bundle.moves.length}`); }
console.log(`\n${ok ? "PASS — no authored op dropped; magnetic surface intact." : "FAIL — surface dropped authored ops."}`);
process.exit(ok ? 0 : 1);
