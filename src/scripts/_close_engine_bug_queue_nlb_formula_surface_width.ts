/**
 * engine_bug_queue — CLOSE the two #nlb_formula width/wrap rows (field3d_surgeon,
 * 2026-08-08). Routed as ONE dispatch because the MODERATE row is a consequence of
 * the MAJOR one: a fixed 340 px cap forced the wrap, and the wrap landed mid-clause.
 *
 *   1. nlb_formula_surface_max_width_is_a_340px_literal_so_a_two_accumulator_stamp_
 *      wraps_beside_an_empty_canvas                                        (MAJOR)
 *   2. nlb_formula_surface_wraps_mid_clause_when_two_checkpoint_stamps_coexist
 *                                                                      (MODERATE)
 *
 * Both diagnoses CONFIRMED against the PRE-fix renderer and re-measured after.
 * One premise of row 1 is CORRECTED on measurement (the "about 860 px of empty
 * canvas" is the width of the widest possible stamp, not free canvas — see below).
 *
 * UPDATE (never a duplicate INSERT): bug_class is the upsert key.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_close_engine_bug_queue_nlb_formula_surface_width.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUG_WIDTH =
    'nlb_formula_surface_max_width_is_a_340px_literal_so_a_two_accumulator_stamp_wraps_beside_an_empty_canvas';
const BUG_CLAUSE =
    'nlb_formula_surface_wraps_mid_clause_when_two_checkpoint_stamps_coexist';

const WIDTH_ROOT =
    ' [FIXED 2026-08-08, field3d_surgeon] Diagnosis CONFIRMED (the literal, the 5 display lines, the'
    + ' severed symbol, the orphaned middot all reproduced against the PRE-fix renderer). ONE PREMISE'
    + ' CORRECTED ON MEASUREMENT: the "about 860 px of empty canvas" is not free canvas — 861.94 px is'
    + ' the natural width of the widest stamp a three-accumulator capture could emit. The apparatus'
    + ' right edge, measured pixel-by-pixel on an overlay-free capture at 1280x720, sits at x = 843'
    + ' (STATE_1-4) and 812 (STATE_5), and the surface anchors its right edge at 1258 — so the band'
    + ' actually free beside the apparatus is 415 px, i.e. 401 px after a 14 px clearance, not 860.'
    + ' REMEDY: nlbFitFormula() derives max-width per STATE ENTRY as'
    + ' round(innerWidth - 22 - 14 - nlbApparatusRightPx()), floored at the old 340 literal so the'
    + ' derivation may only ever GROW the surface (a concept whose apparatus reaches further right'
    + ' would otherwise get a NARROWER cap than it shipped with and start wrapping inside an approved'
    + ' baseline). nlbApparatusRightPx() projects the world bounding box of every VISIBLE object in'
    + ' the nlbIndex registry (sprites through the existing nlbSpriteRectPx ink solver), because in'
    + ' several states the rightmost ink is the thin h = 0 reference LINE, not the slab. Measured'
    + ' agreement with the pixel truth: computed 844-846 vs 843 measured on STATE_2/3/4/5.'
    + ' RESULT (measured, 5 states x 3 viewports): cap 371-400 at 1280x720, 473-510 at 1600x900,'
    + ' 574-619 at 1920x1080. STATE_5 goes from 2 wrapped lines to 1. STATE_2 goes 5 -> 4 -> 3 display'
    + ' lines as the viewport grows, so the filed "5 lines to 3" IS delivered at 1920x1080, the size a'
    + ' teacher full-screens on; at 1280x720 it stays 5 lines because the space genuinely is not there'
    + ' (see the prevention rule). STATE_1 and STATE_4 render byte-identical rects (331.56x63.78 and'
    + ' 297.61x95.67), i.e. the change touches only content that was actually wrapping.'
    + ' RULE 36: the cap is a per-STATE measurement, never per frame — the apparatus moves inside a'
    + ' state, and a per-frame re-measure would re-round a fractional width under sub-pixel layout and'
    + ' could move one wrapped word between two identical frozen frames. Per frame there is exactly'
    + ' one integer compare against innerWidth (so a full-screen still re-fits). Rewind-verified: pin'
    + ' 3000 -> 9000 -> 3000 -> 9000 on STATE_1 and STATE_2 returns an IDENTICAL cap (371 / 375),'
    + ' max-width and surface rect every time.';

const WIDTH_PREVENTION =
    ' IMPLEMENTED 2026-08-08, plus the arithmetic the clause needs to be read against. At 1280x720 a'
    + ' two-checkpoint two-accumulator stamp needs 487.61 px (flag) and 514.86 px (start) on one line,'
    + ' against 398-401 px free beside the apparatus — so 1 + nCheckpoints display lines is'
    + ' GEOMETRICALLY unreachable at that size, and shortening the labels does not rescue it: the two'
    + ' clauses ALONE measure about 379 px, so "flag:"/"start:" heads still give 427.22/403.84 px and'
    + ' even a bare "A:" head gives 405.36 px. The three ways to close that last 100 px are all worse'
    + ' than the wrap: widening past the free band overlaps the incline tip (the current widest line'
    + ' already leaves only 15 px of clearance, measured), shrinking the font needs 17.1 px — a 22%'
    + ' cut in the ONE formula surface, against Rule 34b "one idea, one equation, big and readable",'
    + ' and it would make the surface change size between states (Rule 32d) — and shortening the stamp'
    + ' text is a content decision that also breaks the latched stamp this concept teaches its PRIMARY'
    + ' aha with. So the honest rule is: a maximum-line-count clause is only meaningful together with'
    + ' the viewport it is asserted at. At 1600x900 and above the clause holds by construction.';

const WIDTH_PROBE =
    'js_eval over the cached sim, per state, after SET_STATE. (1) Read window.PM_nlbFmlCapPx and'
    + ' window.PM_nlbAppRightPx (both published by nlbFitFormula) and assert'
    + ' PM_nlbFmlCapPx === Math.max(340, Math.round(innerWidth - 36 - PM_nlbAppRightPx)) — i.e. the'
    + ' width is derived, never a literal. (2) Assert getComputedStyle("#nlb_formula").maxWidth equals'
    + ' PM_nlbFmlCapPx + "px". (3) NO-COLLISION: assert'
    + ' #nlb_formula.getBoundingClientRect().left >= PM_nlbAppRightPx at the state s widest stamp.'
    + ' (4) Reconstruct the visual lines with Range rects and assert no line begins with a middot or'
    + ' an equals sign and no line ends with an equals sign.';

const CLAUSE_ROOT =
    ' [FIXED 2026-08-08, field3d_surgeon] Diagnosis CONFIRMED. REMEDY: nlbStampClauses(). Each element'
    + ' of the capture list is one CLAUSE (symbol, equals, value, unit); its own spaces become'
    + ' non-breaking, and the middot separator is glued to the clause it FOLLOWS with one ordinary'
    + ' space after it — so the only break opportunities left inside a stamp are AFTER a middot, i.e.'
    + ' at clause boundaries. A narrow surface can still wrap; it can no longer separate a value from'
    + ' its symbol, at any width, and it can no longer start a line with the separator. Measured after'
    + ' the fix over 5 states x 3 viewports (1280x720, 1600x900, 1920x1080): 0 lines beginning with a'
    + ' middot or an equals sign, 0 lines ending with an equals sign. PIXEL-NEUTRAL where nothing was'
    + ' wrapping: NBSP has the same advance as a space in this font stack (measured 27 px for both'
    + ' "x x" forms at 22 px Cambria Math) and the separator keeps exactly one space-advance on each'
    + ' side of the middot (the surface is white-space:pre-line, which already collapsed the authored'
    + ' double spaces to one) — confirmed end-to-end by kinetic_energy_definition, the only other'
    + ' stamped concept in the fleet, whose 12 H2 frames report IDENTICAL percentages to the digit'
    + ' before and after. The AUTHORED text (formula_overlay / formula_lines) is deliberately'
    + ' untouched, and the stamp firing, dwell and text are unchanged.';

const CLAUSE_PREVENTION =
    ' ENGINE HALF IMPLEMENTED 2026-08-08 (nlbStampClauses + the derived width nlbFitFormula). The'
    + ' AUTHORING half stands and is now quantified: at 1280x720 the two clauses of a two-accumulator'
    + ' capture measure about 379 px against 398-401 px of free canvas, so no head at all fits on that'
    + ' line and short labels cannot buy the line back — the display-line count of the sibling row s'
    + ' probe (at most 1 + nCheckpoints) holds at 1600x900 and above and cannot hold at 1280x720. A'
    + ' skeleton that asserts a maximum line count must therefore name the VIEWPORT it asserts it at,'
    + ' and count the interpolated characters of the worst SIMULTANEOUS case against the MEASURED free'
    + ' band beside the apparatus (window.PM_nlbAppRightPx), not against the authored formula alone.';

const CLAUSE_PROBE =
    'js_eval, per state authoring checkpoints: drive one full loop and, on every frame, reconstruct'
    + ' the VISUAL lines of #nlb_formula with Range client rects. Assert no line begins with a middot'
    + ' or an equals sign, and no line ends with an equals sign (the symbol/value severing this row'
    + ' names). Separately assert the display-line count never exceeds 1 + (total clauses across all'
    + ' latched stamps) — and, at viewports >= 1600 px wide, never exceeds 1 + number of checkpoints.'
    + ' (SUPERSEDES the unconditional "never exceeds 1 + number of checkpoints": at 1280x720 that is'
    + ' geometrically unreachable for a two-checkpoint two-accumulator state, which is the impossible'
    + ' filed constraint the sibling row warns about.)';

const FILES = ['src/lib/renderers/field_3d_renderer.ts'];

async function closeRow(
    bugClass: string, rootSuffix: string, preventionSuffix: string, probe: string,
): Promise<void> {
    const { data: row, error: readErr } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class, status, root_cause, prevention_rule, fixed_in_files')
        .eq('bug_class', bugClass)
        .maybeSingle();
    if (readErr) throw new Error(`read failed (${bugClass}): ${readErr.message}`);
    if (!row) throw new Error(`row not found — refusing to INSERT a duplicate for ${bugClass}`);
    if (row.status === 'FIXED') { console.log(`already FIXED — ${bugClass}`); return; }

    const { error } = await supabaseAdmin
        .from('engine_bug_queue')
        .update({
            status: 'FIXED',
            fixed_at: new Date().toISOString(),
            fixed_in_files: FILES,
            root_cause: (row.root_cause ?? '') + rootSuffix,
            prevention_rule: (row.prevention_rule ?? '') + preventionSuffix,
            probe_logic: probe,
        })
        .eq('bug_class', bugClass);
    if (error) throw new Error(`update failed (${bugClass}): ${error.message}`);
    console.log(`✅ CLOSED (FIXED) ${bugClass}`);
}

async function main(): Promise<void> {
    await closeRow(BUG_WIDTH, WIDTH_ROOT, WIDTH_PREVENTION, WIDTH_PROBE);
    await closeRow(BUG_CLAUSE, CLAUSE_ROOT, CLAUSE_PREVENTION, CLAUSE_PROBE);
}

main().catch((err) => { console.error('💥 close failed:', err instanceof Error ? err.stack : err); process.exit(1); });
