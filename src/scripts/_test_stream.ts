// Streaming brain harness — proves beats arrive INCREMENTALLY (first beat << total).
// Run: npx tsx --env-file=.env.local src/scripts/_test_stream.ts
import { runProfessorTurnStream } from '../lib/voiceProfessor/professorBrain';

async function run(label: string, transcript: string, intent: 'doubt' | 'explain_whole' = 'doubt') {
    const t0 = Date.now();
    let n = 0;
    let first = -1;
    console.log(`\n=== ${label} ===`);
    console.log(`Q: ${transcript || '(walkthrough)'}`);
    const tail = await runProfessorTurnStream(
        { conceptId: 'magnetic_force_moving_charge', intent, transcript, currentState: 'STATE_1', history: [] },
        (beat) => {
            n += 1;
            if (first < 0) first = Date.now() - t0;
            const ops = beat.ops
                .map((o) => (o.op === 'set_state' ? `state:${o.state}` : o.op === 'set_param' ? `param:${o.param}=${o.value}` : o.op))
                .join(',');
            console.log(`  [+${Date.now() - t0}ms] beat ${n}: "${beat.say.slice(0, 68)}" | ops=[${ops}]`);
        },
    );
    const total = Date.now() - t0;
    console.log(`  -> first beat +${first}ms | total ${total}ms | beats=${n} | fallback=${tail.fallbackUsed} | dropped=${tail.droppedOps}`);
}

async function main() {
    await run('GENERATIVE (manipulation → streams many beats)', 'explain what happens to the path as I increase the angle');
    await run('FAST-PATH (reviewed cluster → 1 beat, instant)', 'why is it a circle');
    await run('WALKTHROUGH (explain whole)', '', 'explain_whole');
    console.log('\nDONE');
}
main().catch((e) => { console.error(e); process.exit(1); });
