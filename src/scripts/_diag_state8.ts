// Diagnose the streaming-quality regression: compare OLD (structured) vs NEW
// (NDJSON streaming) brain on the exact failing query.
// Run: npx tsx --env-file=.env.local src/scripts/_diag_state8.ts
import { runProfessorTurn, runProfessorTurnStream } from '../lib/voiceProfessor/professorBrain';
import type { Beat } from '../lib/voiceProfessor/operations';

const Q = 'Please explain me state 8, drag and drag the fields so that I can understand well what you are explaining me.';

function fmt(beats: Beat[]) {
    beats.forEach((b, i) => {
        const ops = b.ops
            .map((o) => (o.op === 'set_state' ? `state:${o.state}` : o.op === 'set_param' ? `param:${o.param}=${o.value}` : o.op))
            .join(', ');
        console.log(`  beat ${i + 1}: "${b.say.slice(0, 90)}"`);
        console.log(`           ops=[${ops}]`);
    });
}

async function main() {
    console.log('Q:', Q, '\n(currentState=STATE_7)\n');

    console.log('===== OLD — runProfessorTurn (structured output) =====');
    const oldR = await runProfessorTurn({ conceptId: 'magnetic_force_moving_charge', intent: 'doubt', transcript: Q, currentState: 'STATE_7', history: [] });
    fmt(oldR.beats);
    console.log(`  -> beats=${oldR.beats.length} fallback=${oldR.fallbackUsed} dropped=${oldR.droppedOps}\n`);

    console.log('===== NEW — runProfessorTurnStream (NDJSON) =====');
    const newBeats: Beat[] = [];
    const tail = await runProfessorTurnStream(
        { conceptId: 'magnetic_force_moving_charge', intent: 'doubt', transcript: Q, currentState: 'STATE_7', history: [] },
        (b) => newBeats.push(b),
    );
    fmt(newBeats);
    console.log(`  -> beats=${newBeats.length} fallback=${tail.fallbackUsed} dropped=${tail.droppedOps}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
