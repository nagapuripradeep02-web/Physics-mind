// Throwaway brain verification — calls runProfessorTurn directly (bypasses the
// auth-gated HTTP route). Proves the resolve-then-narrate + hybrid fast-path.
// Run: npx tsx --env-file=.env.local src/scripts/_test_brain.ts
import { runProfessorTurn } from '../lib/voiceProfessor/professorBrain';

async function show(label: string, transcript: string, history: { role: 'student' | 'professor'; text: string }[] = []) {
    const r = await runProfessorTurn({
        conceptId: 'magnetic_force_moving_charge',
        intent: 'doubt',
        transcript,
        currentState: 'STATE_1',
        history,
    });
    const ops = r.beats.flatMap((b) => b.ops.map((o) => (o.op === 'set_state' ? `set_state:${o.state}` : o.op === 'set_param' ? `set_param:${o.param}=${o.value}` : o.op)));
    console.log('\n=== ' + label + ' ===');
    console.log('transcript:', transcript);
    console.log('beats:', r.beats.length, '| fallbackUsed:', r.fallbackUsed, '| droppedOps:', r.droppedOps);
    console.log('ops:', ops.join('  '));
    console.log('say[0]:', (r.beats[0]?.say ?? '').slice(0, 160));
}

async function main() {
    await show('HERO — state ref + manipulation (generative)', 'explain state seven and can you control a few parameters');
    await show('FAST-PATH — known doubt, no manipulation', 'why is it a circle');
    await show('OUT-OF-SCOPE — should deflect gracefully', "what is the charge's own magnetic field");
    await show(
        'ESCALATION — asked before + still confused (expect pause/set_speed ops)',
        "i still don't understand why it becomes a circle, slow down please",
        [
            { role: 'student', text: 'why is it a circle' },
            { role: 'professor', text: 'Because the force is always perpendicular to the velocity, it keeps turning the particle into a circle.' },
        ],
    );
    console.log('\nDONE');
}

main().catch((e) => { console.error(e); process.exit(1); });
