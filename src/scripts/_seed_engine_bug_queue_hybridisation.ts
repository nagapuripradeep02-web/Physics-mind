/**
 * Seed the defect classes found building the HYBRID-ORBITAL capability on the
 * `orbital_shapes` scenario + the concept `hybridisation_sp_sp2_sp3` (2026-07-29).
 *
 * Founder-approved for application ("dont forget the engine bug queue table to
 * add the new arrived issues").
 *
 * Provenance, honestly stated: TWO of these were found BEFORE any renderer code
 * existed, by settling the physics headlessly (the sign convention, and the
 * camera reuse). FIVE were found by building the page and looking at frames —
 * THE EYE reported 35 deterministic checks, 35 passed, 0 failed on frames
 * containing three of them. Not one of the seven was caught by tsc, the
 * validators, check:renderer-syntax, or the concept's own 26-check headless gate.
 *
 * Most rows are `subject_neutral`: they are field_3d engine classes a physics
 * concept on the same renderer can hit tomorrow. Filing them under chemistry
 * would hide them from exactly the person who needs them.
 *
 * TWO RECURRENCES are handled as updates rather than new rows, because filing a
 * duplicate would hide the fact that a standing rule FAILED AGAIN:
 *   - the backtick-in-renderer-comment class, whose own note already read
 *     "recorded despite the guard existing because it cost two build cycles",
 *     and which cost two more cycles this session. Rules have now failed twice;
 *     the row is escalated to ask for a mechanical gate.
 *   - the same-family-fusion class, whose rule prescribes a silhouette cue and
 *     explicitly rejects lowering enclosure. On hybrids the silhouette cue was
 *     NECESSARY BUT NOT SUFFICIENT, which the rule did not anticipate.
 *
 * ALSO REPORTS a pre-existing data defect: the backtick class exists TWICE under
 * two names (`renderer_backtick_in_comment_terminates_template_literal` /
 * `backtick_in_renderer_comment_terminates_emitted_template_literal`). A scar
 * list with duplicate classes under-counts its own recurrences, which is the one
 * number it exists to get right. Reported, not silently merged — a founder call.
 *
 * IDEMPOTENT: any bug_class already present is skipped, so a re-run cannot duplicate.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_hybridisation.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'chemistry-p4-hybridisation-2026-07-29';
const CONCEPT = 'hybridisation_sp_sp2_sp3';
const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';

type Row = {
    bug_class: string;
    title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
    owner_cluster: string;
    status: 'OPEN' | 'FIXED';
    subject: 'physics' | 'chemistry' | 'subject_neutral';
    root_cause: string;
    prevention_rule: string;
    probe_type: 'js_eval' | 'manual';
    probe_logic: string;
    fixed_in_files: string[];
};

const ROWS: Row[] = [
    {
        bug_class: 'superposed_orbital_sign_convention_inverts_the_taught_direction',
        title: 'The natural way to write a hybrid orbital puts 82.5% of the electron BEHIND the atom, and every gate passes',
        severity: 'CRITICAL',
        owner_cluster: 'alex:chemistry_author',
        status: 'FIXED',
        subject: 'chemistry',
        root_cause:
            'A hybrid is psi_h = c_s psi_2s + c_p psi_2p, and the relative SIGN of the two terms decides which side the big lobe points. R_20 is NEGATIVE for rho > 2 — across most of the bonding region — so the natural-looking +c_s makes the s and p terms cancel in FRONT and add BEHIND. Measured hemisphere probability for sp3: 17.5% front / 82.5% back with +c_s, exactly inverted with -c_s. The wrong convention renders perfectly, is normalised, is orthonormal, produces the correct 109.47 degree angle, and every caption about it stays literally true — while the sim teaches the inverse of directional bonding, and therefore the inverse of why hybrid orbitals bond better than the orbitals they came from.',
        prevention_rule:
            'For ANY orbital built as a superposition, the relative sign is a load-bearing physical decision, not a normalisation detail — settle it explicitly and record which convention was chosen and why. Settle it by HEMISPHERE PROBABILITY (integrate |psi|^2 over each half-space), NEVER by a tip radius: the back tip of a hybrid is genuinely LONGER than the front tip at the 90% contour under BOTH conventions, so the radius comparison points the wrong way and looks like evidence. General form: when a wavefunction is a sum of terms with different radial functions, check where the probability actually IS before trusting any geometric proxy for it. Same defect family as the node_count clover — geometry correct, orientation wrong, every gate green.',
        probe_type: 'js_eval',
        probe_logic:
            'npm run check:hybrid-orbitals asserts OS_HYB_SIGN === -1 AND that |psi| at rho=3 is larger along the lobe axis than against it (section 2 of the gate). Independent re-derivation: docs/concepts/chemistry/hybrid_sign.js prints the hemisphere split for both conventions.',
        fixed_in_files: [RENDERER, 'src/scripts/check_hybrid_orbitals.ts'],
    },
    {
        bug_class: 'solved_camera_reused_on_a_different_geometry_foreshortens_a_taught_element_to_zero',
        title: 'The shipped p_set camera foreshortens an sp3 lobe to exactly 0.000 — one of four vanishes behind the nucleus under a caption counting four',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        status: 'FIXED',
        subject: 'subject_neutral',
        root_cause:
            'orbital_shapes ships SOLVED per-mode cameras, and the obvious move for a new 3D arrangement is to reuse the one that already frames a similar object. The p_set camera (az 45 / el 35.26, the (1,1,1) view) is the swept optimum for THREE mutually perpendicular 2p orbitals. Applied to a tetrahedral sp3 set it is the worst possible camera: one of the four hybrid axes IS the (1,1,1) direction, so that lobe points exactly down the view axis and foreshortens to 0.000 — invisible behind the nucleus, under a caption that asks the student to count four. This is the VSEPR methane-fourth-bond defect reproduced verbatim, one concept later, by reuse rather than by authoring.',
        prevention_rule:
            'A solved camera is solved FOR A SPECIFIC ARRANGEMENT and does not transfer to a different one — re-solve per geometry, never inherit. Solve it as a measurable quantity with a correct answer: sweep azimuth x elevation, impose a hard floor on foreshortening (every element the narration counts projects at >= 0.45 of its length), maximise the minimum pairwise SCREEN separation of the elements, and require the WHOLE object to fit the safe box, not just its tips. Then sanity-check the camera you were tempted to reuse and record what it scores — if it scores zero, that number belongs in the commit message, because the next person will be tempted the same way.',
        probe_type: 'manual',
        probe_logic:
            'docs/concepts/chemistry/hybrid_camera2.js re-runs the sweep and prints the rejection check: the p_set camera applied to sp3 reports minForeshorten 0.000. Any new hybrid/molecular arrangement must be run through it before a state authors a camera.',
        fixed_in_files: [RENDERER],
    },
    {
        bug_class: 'field3d_growth_beat_gated_on_a_renderer_specific_field_silently_noops',
        title: 'bloom_at_ms did nothing on every hybrid state because the growth beat was gated on l === 2',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        status: 'FIXED',
        subject: 'subject_neutral',
        root_cause:
            'The bloom growth beat was dispatched as `if (aOrb.l === 2 && os.bloom_at_ms != null)` — correct when the only bloomable thing was the d clover. A hybrid orbital has no `l` field at all (it is a superposition, not an eigenstate of one l), so the condition was silently false and three states rendered their sets at full size from frame one while their narration described a set assembling. The authored value was present, valid, schema-conformant and completely discarded.',
        prevention_rule:
            'Gate a BEHAVIOUR on the behaviour being requested (`os.bloom_at_ms != null`), not on an incidental property of the object that happened to be true for the first consumer. When adding a new object KIND to an existing scenario, grep every dispatch that tests a type-ish field (`l ===`, `kind ===`, `axis`) and decide explicitly whether the new kind belongs — a missing branch there is invisible: no error, no warning, valid JSON, green gates, and a state that simply does not move. Same family as concept_json_duplicate_key_silently_discards_authored_value: the authoring was right and the delivery was dropped. Verify an authored beat ARRIVED by watching it, not by seeing it in the file.',
        probe_type: 'manual',
        probe_logic:
            'For any state authoring a growth cue, compare two dense frames inside the cue window: they must differ. THE EYE dumps these; a state whose declared assemble beat is a no-op shows byte-identical dense frames from t=0 while the caption claims motion.',
        fixed_in_files: [RENDERER],
    },
    {
        bug_class: 'field3d_label_outlives_the_surface_it_names',
        title: 'The "2s" label kept naming an orbital whose surface had already faded to nothing',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        status: 'FIXED',
        subject: 'subject_neutral',
        root_cause:
            'Orbital name labels were gated on set MEMBERSHIP (is this orbital in the active list?) while the surface they name is gated on OPACITY. During a hybrid morph the 2s orbital is consumed and its sphere alpha ramps to zero, but the orbital stays in the active list, so the sprite sat in empty space beside a finished sp hybrid, labelling an object that is no longer on screen. A student reading the frame is told there is a 2s there.',
        prevention_rule:
            'A label is a CLAIM about something visible. Gate every name/annotation on the EFFECTIVE VISIBILITY of its referent (its resolved alpha or growth factor), never on membership in a list, and drive both from the SAME progress variable so they cannot drift apart. Whenever a beat CONSUMES or removes an element, ask what else was pointing at it — labels, arcs, readouts, legend rows, HUD lines. This is the naming half of the same rule as gate-a-label-on-the-physical-condition-it-asserts.',
        probe_type: 'manual',
        probe_logic:
            'Read the frozen frame of every state containing a consume/fade beat: no text sprite may sit beside empty space. On this concept, STATE_2 frozen.',
        fixed_in_files: [RENDERER],
    },
    {
        bug_class: 'field3d_axis_label_lands_on_the_nucleus_when_its_axis_faces_the_camera',
        title: 'The x-axis letter sat on top of the nucleus in four states at once, because every solved camera looks down an axis',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        status: 'FIXED',
        subject: 'subject_neutral',
        root_cause:
            'Axis labels are parked at (axis direction) x (axis length). An axis pointing at the camera projects to a POINT at the origin, so its label lands exactly on the nucleus glyph — a Rule 34d collision — while carrying no orientation information in that pose, since a foreshortened axis shows no direction. It went unnoticed because it is correct for every camera that does NOT look down an axis; the hybrid cameras all do, by construction, so it fired on four states simultaneously the moment the new capability landed.',
        prevention_rule:
            'Hide an axis label (and consider the axis itself) when its direction aligns with the state camera beyond ~0.975 — it is unreadable and colliding, not informative. Resolve the alignment against the STATE own authored camera vector, not the live camera, which is still easing in on the first frame and would make the label flicker in and out under a freeze pin. Sibling of field3d_name_label_parked_on_its_own_axis_collides_with_the_axis_letter: that one is text-vs-text, this one is text-vs-scene-object, and a screen-space avoider for the first does not fix the second.',
        probe_type: 'manual',
        probe_logic:
            'For each state, dot the (spun) axis directions with PM_osCutN; any |dot| > 0.975 must have a hidden label. Visible in the frozen frame as a letter printed over the nucleus.',
        fixed_in_files: [RENDERER],
    },
    {
        bug_class: 'countability_metric_that_ignores_the_back_lobes_under_calls_fusion',
        title: 'A legibility metric measured only the front lobes and scored "marginal" a picture that renders as a featureless ball',
        severity: 'MAJOR',
        owner_cluster: 'alex:chemistry_author',
        status: 'FIXED',
        subject: 'subject_neutral',
        root_cause:
            'Countability was solved BEFORE authoring — the right instinct — using a union-silhouette waist ratio between adjacent lobes, which scored four sp3 hybrids at 0.808 ("marginal but the best available"). The picture still rendered as a fuzzy ball. The metric took the union over the FRONT lobes only, and each hybrid also carries a BACK lobe that sits precisely in the angular gap between its neighbours fronts. The very region the metric was measuring as empty is the region the back lobes fill. A quantitative pre-check produced a confident number for the wrong union and licensed an authoring decision it did not support.',
        prevention_rule:
            'A legibility metric must take the union over EVERY element that will be drawn, including the ones the mental model treats as secondary (back lobes, ghosts, node discs, scaffolding). State explicitly what the union covers when recording the number. And treat a pre-render metric as a screening tool that can only REJECT: passing it is not evidence the frame reads, so a "marginal" score is a prediction to go and check in pixels, never a licence to author past it.',
        probe_type: 'manual',
        probe_logic:
            'docs/concepts/chemistry/hybrid_waist.js computes the ratio. When re-using it, confirm the union includes back lobes for any orbital family that has them.',
        fixed_in_files: [RENDERER, 'src/data/concepts/chemistry/hybridisation_sp_sp2_sp3.json'],
    },
    {
        bug_class: 'state_inherits_a_camera_solved_for_a_different_enclosure_contour',
        title: 'The opening state framed 36% smaller than every other state, so the apparatus jumped scale at the first click',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        status: 'FIXED',
        subject: 'subject_neutral',
        root_cause:
            'STATE_1 authored no camera and inherited the scenario default for its mode (p_set, dist 8.22), which was solved for orbitals drawn at the 90% contour. The state authors enclosure 0.5, where the same orbitals are 36% smaller (308 pm tips vs 483), so the opening picture sat small in a mostly empty canvas while every other state framed at dist 6.0. The apparatus visibly changed scale at the very first click — a Rule 32d home-pose break in the one transition where the student is still learning what they are looking at.',
        prevention_rule:
            'A default camera is solved together with an enclosure/scale assumption. If a state overrides the contour, the framing distance is no longer valid — rescale it by the ratio of the outer radii, or author the camera explicitly. When a concept mixes contours across states, check that the SUBJECT subtends a comparable fraction of the canvas in all of them; identical camera distances do not mean identical framing when the object size changes underneath.',
        probe_type: 'manual',
        probe_logic:
            'Compare the frozen frames of all states side by side: the apparatus must occupy a comparable fraction of the canvas. On this concept, STATE_1 vs STATE_5.',
        fixed_in_files: ['src/data/concepts/chemistry/hybridisation_sp_sp2_sp3.json'],
    },
];

async function main(): Promise<void> {
    const classes = ROWS.map((r) => r.bug_class);
    const { data: existing, error: exErr } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class')
        .in('bug_class', classes);
    if (exErr) throw new Error(`pre-check failed: ${exErr.message}`);
    const present = new Set((existing ?? []).map((r) => r.bug_class as string));

    const toInsert = ROWS.filter((r) => !present.has(r.bug_class)).map((r) => ({
        ...r,
        row_type: 'incident',
        concepts_affected: [CONCEPT],
        discovered_in_session: SESSION,
    }));

    if (present.size > 0) {
        console.log(`↷ already present, skipping ${present.size}: ${[...present].join(', ')}`);
    }
    if (toInsert.length > 0) {
        const { data, error } = await supabaseAdmin
            .from('engine_bug_queue')
            .insert(toInsert)
            .select('bug_class,status,severity,owner_cluster,subject');
        if (error) throw new Error(`insert failed: ${error.message}`);
        console.log(`✅ inserted ${data?.length ?? 0} row(s):`);
        for (const r of data ?? []) {
            console.log(`   [${r.status}/${r.severity}] ${r.subject} · ${r.owner_cluster} — ${r.bug_class}`);
        }
    } else {
        console.log('Nothing new to insert.');
    }

    // ── RECURRENCE 1: the backtick class. Its own note already recorded that it
    //    cost two build cycles DESPITE the guard existing. It cost two more this
    //    session, in two separate comments. A prose rule has now failed twice, so
    //    the row is escalated to ask for the mechanical gate instead of a third
    //    restatement of "do not do this".
    await recordRecurrence(
        'backtick_in_renderer_comment_terminates_emitted_template_literal',
        'Never use backticks anywhere inside a renderer template literal — including in COMMENTS, which is where it keeps happening, because a comment feels like a place where syntax does not matter. RECURRED TWICE MORE on 2026-07-29 while writing hybrid-orbital comments (`main` and `l`), each costing a build cycle. tsc reports a misleading TS1005 hundreds of lines from the real site; check:renderer-syntax localises it correctly and MUST be run after every renderer edit. ESCALATION OWED: this rule has now failed on three separate sessions. It is trivially machine-checkable — scan the emitted template body for an unescaped backtick and fail with the line number — and a prose rule that has failed three times should be replaced by that check rather than restated a fourth time.',
        [RENDERER],
    );

    // ── RECURRENCE 2: same-family fusion. The existing rule prescribes a
    //    silhouette cue and explicitly rejects lowering the enclosure. On hybrids
    //    the silhouette cue was NECESSARY BUT NOT SUFFICIENT — which the rule as
    //    written does not admit is possible, so a reader following it exactly
    //    would have stopped at the Fresnel pass and shipped a ball.
    await recordRecurrence(
        'field3d_uniform_translucent_same_family_surfaces_fuse_with_no_silhouette_cue',
        'When N translucent surfaces of the same family overlap in one frame, countability requires a per-surface SILHOUETTE cue (Fresnel-weighted alpha, rim darkening, or an outline). It is NOT obtainable by solving the camera, NOT by lowering opacity alone, and NEVER by shrinking the surfaces — which would lie about a magnitude the HUD is printing (Rule 29). RECURRED 2026-07-29 on hybrid orbitals, where the shading cue proved NECESSARY BUT NOT SUFFICIENT: four sp3 hybrids each carry a BACK lobe that sits exactly in the angular gap between its neighbours fronts, so the union fills space near-spherically no matter how each surface is shaded. The additional lever that worked is OMISSION: draw only the front lobe, cut at the surface own waist and capped at the nucleus, so every drawn vertex still stands on the real contour and nothing is shrunk or displaced. An omission is only acceptable if it is DECLARED — the concept state that reveals the back lobe turns the omission off and shows exactly what the earlier states left out. Never let a caption in an omitting state claim the whole object.',
        [RENDERER],
    );

    // ── DATA DEFECT, reported not silently fixed: the backtick class exists twice.
    const { data: dupes, error: dErr } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class,subject,concepts_affected')
        .or('bug_class.ilike.%backtick%');
    if (dErr) throw new Error(`dupe check failed: ${dErr.message}`);
    if ((dupes ?? []).length > 1) {
        console.log('\n⚠ PRE-EXISTING DATA DEFECT — the backtick class is filed TWICE under two names:');
        for (const d of dupes ?? []) console.log(`     ${d.bug_class}  (${d.subject})  concepts=${JSON.stringify(d.concepts_affected)}`);
        console.log('   A scar list with duplicate classes under-counts its own recurrences, which is the');
        console.log('   one number it exists to get right. Merging is a FOUNDER call — not done here.');
    }
}

async function recordRecurrence(bugClass: string, newRule: string, files: string[]): Promise<void> {
    const { data: cur, error } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('id,concepts_affected,fixed_in_files')
        .eq('bug_class', bugClass)
        .maybeSingle();
    if (error) throw new Error(`${bugClass} read failed: ${error.message}`);
    if (!cur) { console.log(`⚠ ${bugClass} not found — skipping recurrence update.`); return; }
    const concepts: string[] = cur.concepts_affected ?? [];
    if (concepts.includes(CONCEPT)) { console.log(`↷ ${bugClass} already records ${CONCEPT}.`); return; }
    const cf: string[] = cur.fixed_in_files ?? [];
    const { error: upErr } = await supabaseAdmin
        .from('engine_bug_queue')
        .update({
            concepts_affected: [...concepts, CONCEPT],
            fixed_in_files: [...new Set([...cf, ...files])],
            prevention_rule: newRule,
        })
        .eq('id', cur.id);
    if (upErr) throw new Error(`${bugClass} update failed: ${upErr.message}`);
    console.log(`✅ ${bugClass}: recorded recurrence on ${CONCEPT} + strengthened prevention_rule.`);
}

main().catch((e) => {
    console.error('❌', e instanceof Error ? e.message : e);
    process.exit(1);
});
