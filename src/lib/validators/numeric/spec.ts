/**
 * THE CALCULATOR — check registry (Category N, "numeric").
 *
 * Mirrors src/lib/validators/visual/spec.ts: the SHAPE of a result is identical
 * (check_id / category / state_id / passed / evidence / bug_class) so both gates
 * print and aggregate the same way, but the id / category / bug_class unions are
 * their own. Widening `VisualCheckId` to carry numeric ids would couple two gates
 * that have no reason to know about each other.
 *
 * Registration is static, exactly as it is for the visual gate: add the id to
 * NumericCheckId, add a spec to NUMERIC_CHECKS, and build every result through
 * `mkResult` so category and bug_class can never drift from the spec.
 */

export type NumericCategory = 'N';

export type NumericCheckId =
    | 'N0_readings_present'
    | 'N1_readout_matches_formula'
    | 'N1_readout_unit_matches'
    | 'N2_sum_identity'
    | 'N2_constant_stable'
    | 'N2_ohm_closure'
    | 'N3_slider_moves_readout'
    | 'N3_slider_direction';

export type NumericBugClass =
    | 'state_paints_no_readable_numbers'
    | 'displayed_value_disagrees_with_declared_formula'
    | 'displayed_unit_disagrees_with_declared_unit'
    | 'displayed_values_violate_their_own_sum_identity'
    | 'constant_changes_value_between_states'
    | 'displayed_v_i_r_violate_ohms_law'
    | 'slider_does_not_change_any_readout'
    | 'slider_moves_readout_in_the_wrong_direction';

export interface NumericCheckSpec {
    id: NumericCheckId;
    category: NumericCategory;
    name: string;
    /** What must hold for the check to pass. */
    passCriterion: string;
    bugClass: NumericBugClass;
}

export const NUMERIC_CHECKS: Record<NumericCheckId, NumericCheckSpec> = {
    N0_readings_present: {
        id: 'N0_readings_present',
        category: 'N',
        name: 'State paints at least one readable number',
        passCriterion:
            'At least one "symbol = value" reading for a DECLARED symbol is harvested from DOM, '
            + 'canvas or sprite text. Coverage telemetry, not a defect check: a purely pictorial '
            + 'state is correct by design (Rule 24), so zero readings is a SKIP.',
        bugClass: 'state_paints_no_readable_numbers',
    },
    N1_readout_matches_formula: {
        id: 'N1_readout_matches_formula',
        category: 'N',
        name: 'Displayed value matches the concept\'s own declared formula',
        passCriterion:
            'The painted number equals the value obtained by evaluating the concept\'s declared '
            + 'computed_output / derived expression in this state\'s scope, within 1% or half the '
            + 'last displayed decimal place, whichever is looser.',
        bugClass: 'displayed_value_disagrees_with_declared_formula',
    },
    N1_readout_unit_matches: {
        id: 'N1_readout_unit_matches',
        category: 'N',
        name: 'Displayed unit matches the declared unit',
        passCriterion: 'The unit painted beside the value is the declared unit, or a recognised SI-prefixed form of it.',
        bugClass: 'displayed_unit_disagrees_with_declared_unit',
    },
    N2_sum_identity: {
        id: 'N2_sum_identity',
        category: 'N',
        name: 'Displayed totals equal the sum of their displayed parts',
        passCriterion:
            'Where a declared expression is a pure sum/difference of other displayed symbols, the '
            + 'painted total equals the painted parts. A bookkeeping identity over painted numbers '
            + 'only — no model involved.',
        bugClass: 'displayed_values_violate_their_own_sum_identity',
    },
    N2_constant_stable: {
        id: 'N2_constant_stable',
        category: 'N',
        name: 'A declared constant paints the same value in every state',
        passCriterion: 'A variable declared with `constant` shows an identical value wherever it appears.',
        bugClass: 'constant_changes_value_between_states',
    },
    N2_ohm_closure: {
        id: 'N2_ohm_closure',
        category: 'N',
        name: 'Painted V, I and R satisfy V = I·R',
        passCriterion:
            'Where one state paints voltage, current and resistance together in base units, the '
            + 'three numbers close Ohm\'s law. Needs no JSON — it works even where the concept '
            + 'delegates its physics to the renderer.',
        bugClass: 'displayed_v_i_r_violate_ohms_law',
    },
    N3_slider_moves_readout: {
        id: 'N3_slider_moves_readout',
        category: 'N',
        name: 'A slider that a readout depends on actually moves it',
        passCriterion:
            'Dragging the slider changes at least one painted number that the declared physics says '
            + 'depends on it. Only asserted when such a dependency exists, so a purely visual '
            + 'control is never failed.',
        bugClass: 'slider_does_not_change_any_readout',
    },
    N3_slider_direction: {
        id: 'N3_slider_direction',
        category: 'N',
        name: 'A readout moves in the physically correct direction',
        passCriterion:
            'The sign of the change in the painted number matches the sign obtained by evaluating '
            + 'the declared expression at the same two slider values.',
        bugClass: 'slider_moves_readout_in_the_wrong_direction',
    },
};

/** Same field layout as visual/spec.ts CheckResult, with numeric-specific unions. */
export interface NumericCheckResult {
    check_id: NumericCheckId;
    category: NumericCategory;
    state_id: string;
    passed: boolean;
    /** Required when passed=false. Skips pass with an explicit "Skipped — ..." string. */
    evidence: string;
    bug_class: NumericBugClass;
}

export interface NumericGateResult {
    check_results: NumericCheckResult[];
    cost_usd: number;
    duration_ms: number;
}

/** Build a result from the spec so category / bug_class can never drift. */
export function mkResult(
    id: NumericCheckId,
    stateId: string,
    passed: boolean,
    evidence: string,
): NumericCheckResult {
    const spec = NUMERIC_CHECKS[id];
    return { check_id: id, category: spec.category, state_id: stateId, passed, evidence, bug_class: spec.bugClass };
}

/**
 * A skip is a PASS carrying its reason — THE EYE's fail-open doctrine
 * (pixelGate.ts:14). The orchestrator counts these separately so the SKIP census
 * measures how much declared physics is machine-checkable today.
 */
export function mkSkip(id: NumericCheckId, stateId: string, reason: string): NumericCheckResult {
    return mkResult(id, stateId, true, `Skipped — ${reason}`);
}

export function isSkip(r: NumericCheckResult): boolean {
    return r.passed && r.evidence.startsWith('Skipped — ');
}

export function formatCheckError(result: NumericCheckResult): string {
    const spec = NUMERIC_CHECKS[result.check_id];
    return `[${result.check_id} ${spec.name}] (${result.state_id}) ${result.evidence}`;
}
