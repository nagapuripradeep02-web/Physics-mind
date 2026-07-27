-- supabase_2026-07-22_seed_ac_voltage_resistor_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for ac_voltage_resistor.json —
-- the NEW field_3d 'ac_resistor' scenario (Class 12 Ch.7 §7.2 AC Voltage
-- Applied to a Resistor), the first concept of the Ch.7 Alternating Current
-- map. Engine delta landed in-loop (docs/loop_runs/ch7_engine_log.md,
-- Stage 1b, commit 6b97ede) before this file was authored.
--
-- Authored 2026-07-22 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases (verbatim, physics block §5).
--
-- Migration is AUTHORED, NOT APPLIED — quality_auditor's pre-run step
-- applies it (json_author is forbidden from apply_migration). Drill-down
-- itself is DEFERRED (Rule 18, 2026-06-10 directive) — the
-- confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase per the
-- documented false-FAIL scar (memory: auditor-cluster-registry-false-fail).
-- Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real student-voice phrasings (lowercase,
-- idiomatic, no textbook prose), verbatim from the physics block §5.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive states + clusters (architect skeleton §5):
--   STATE_2 — the chapter's baseline, every later Ch.7 concept leans on it —
--             why_v_i_in_phase, ohms_law_ac_validity, peak_current_from_peak_voltage
--   STATE_6 — historically THE stuck point of AC (rms meaning; students who
--             can compute im/root2 without knowing what it means) —
--             rms_vs_average_confusion, mains_rating_meaning, why_not_peak_value
--   STATE_7 — the mathematical abstraction (why root two exactly;
--             square-mean-root order) — why_root_two, square_mean_root_order,
--             average_power_half_peak_power

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 why_v_i_in_phase deep-dive ────────────────────────────────
(
  'why_v_i_in_phase',
  'ac_voltage_resistor',
  'STATE_2',
  'Why do voltage and current peak at exactly the same instant for a resistor?',
  'Student expects some delay between voltage and current, importing intuition from inductors and capacitors before ever meeting them, or simply assuming "cause must precede effect" the way it does in mechanics. For a resistor there is no such delay: i(t) = v(t)/R is a purely ALGEBRAIC relationship evaluated at the SAME instant t — no derivative, no integral, nothing that could introduce a time offset. Whatever v(t) is doing right now, i(t) is R times smaller and doing the identical thing right now. STATE_2''s three cursor samples make this concrete and numeric (zero volts gives zero amps, five volts gives one amp, ten volts gives two amps, all at the SAME sampled instant), and the full i-trace then sweeps in locked onto the v-trace, peak-with-peak and zero-with-zero. The phase lag/lead this student is anticipating is real physics — but it belongs to an inductor or a capacitor, siblings later in this chapter, never to a pure resistor.',
  ARRAY[
    'why do v and i peak at the same time',
    'why is there no delay between voltage and current here',
    'shouldnt current lag behind voltage a little',
    'why do they hit zero together',
    'is it always in phase or just for a resistor'
  ],
  'pending_review'
),
-- ─── STATE_2 ohms_law_ac_validity deep-dive ────────────────────────────
(
  'ohms_law_ac_validity',
  'ac_voltage_resistor',
  'STATE_2',
  'Does Ohm''s law even work for AC, or is v = IR only a DC law?',
  'Student learned Ohm''s law on steady DC circuits and now assumes it silently stops applying the moment the voltage starts changing with time, treating v = IR as if it were a special DC-only rule rather than an instant-by-instant statement about a resistor''s behaviour. It is neither: for an ideal resistor, R is a fixed material property that does not care whether v is constant or swinging through a sine wave — at every single frozen instant, i(t) = v(t)/R holds exactly, because that is simply what "resistor" means. STATE_2''s narration frames this directly ("Ohm''s law... holds at every instant"), and the sim proves it live: drag the resistance slider mid-sweep and the current trace rescales in lockstep with i = v/R, at every point along the whole continuously-varying curve, not just at some averaged or steady value. AC does not break Ohm''s law; it simply gives v(t) more to do each instant, and i(t) dutifully follows.',
  ARRAY[
    'does ohms law even work for ac',
    'i thought v equals ir was only for dc',
    'why can i use v over r when voltage keeps changing',
    'does r change as the voltage swings',
    'is this the same ohms law from before'
  ],
  'pending_review'
),
-- ─── STATE_2 peak_current_from_peak_voltage deep-dive ──────────────────
(
  'peak_current_from_peak_voltage',
  'ac_voltage_resistor',
  'STATE_2',
  'Is peak current always just peak voltage divided by resistance?',
  'Student is unsure whether the peak-to-peak relationship im = vm/R is a special-case shortcut or a genuinely reliable formula, partly because "peak" sounds like it might need its own separate derivation rather than falling straight out of the same i = v/R law used everywhere else. It is not a shortcut — it is the SAME instantaneous law evaluated at the one particular instant when v(t) happens to equal its maximum value vm (sin(ωt) = 1). Since i(t) = v(t)/R holds at every instant, it holds at that instant too, giving im = vm/R directly, no extra physics required. This is also exactly why doubling vm doubles im in direct proportion (R unchanged) — the same linear relationship that governs every other instant of the cycle. The one caveat worth flagging: im (the PEAK current) is a different, larger number than Irms (the rms current, im/√2) — a distinction STATE_6 and STATE_7 develop in full.',
  ARRAY[
    'how do i get peak current from peak voltage',
    'is im just vm divided by r',
    'why is peak current not the same as rms current',
    'if vm doubles does im double too',
    'whats the difference between i and im'
  ],
  'pending_review'
),
-- ─── STATE_6 rms_vs_average_confusion deep-dive ────────────────────────
(
  'rms_vs_average_confusion',
  'ac_voltage_resistor',
  'STATE_6',
  'Isn''t rms just another name for the average — why isn''t rms zero too?',
  'Student conflates two very different summary numbers because both are called "some kind of average" in casual speech: the plain (arithmetic) time-average of i(t), which STATE_5 already showed is EXACTLY zero for a symmetric AC current, and the root-mean-square, which is never zero. The two differ because of what happens BEFORE the averaging step. The plain average sums signed values, so the positive and negative halves of the cycle cancel each other out completely — that cancellation is real, and it is exactly why an averaging meter is useless for rating AC (STATE_5''s whole point). The rms recipe SQUARES every value first (STATE_7''s recipe: square, then mean, then root); squaring erases the sign before any cancellation can happen, so the average of the squared values is a genuinely positive, nonzero number that survives the root step intact. Rms and the plain average are not two names for the same thing — they answer two different questions, and only rms answers "how much heating power does this deliver".',
  ARRAY[
    'isnt rms just another name for average',
    'why isnt rms zero if average current is zero',
    'why do we need rms if average already exists',
    'is rms the same as mean value',
    'why not just say average power instead of rms'
  ],
  'pending_review'
),
-- ─── STATE_6 mains_rating_meaning deep-dive ────────────────────────────
(
  'mains_rating_meaning',
  'ac_voltage_resistor',
  'STATE_6',
  'Is my region''s mains rating the peak voltage or something else?',
  'Student assumes the single number printed near a wall socket, or on an appliance''s nameplate, must be describing the biggest voltage the supply ever reaches — the intuitive meaning of "rated at" in everyday language. It is not: every mains and appliance rating in use anywhere is an RMS value, the DC-equivalent voltage that would deliver the SAME average heating power to a resistor. The true instantaneous peak of the sine wave is √2 times HIGHER than that rated number, reached only for an instant twice every cycle, and back down to zero (or negative) the rest of the time. STATE_6''s twin-compare beat makes the gap concrete with real numbers: a supply "rated" at 7.07 V rms is genuinely swinging all the way up to a 10.0 V peak and down to a −10.0 V trough — the DC twin dialled to that peak visibly out-glows the AC heater, and only winding the dial back down to 7.07 V restores the match. This is also why insulation and breakdown ratings on real equipment are sized for the higher PEAK, even though the headline "operating voltage" number quoted everywhere is rms.',
  ARRAY[
    'is 230 volts the peak or something else',
    'why is my socket rated less than the actual peak voltage',
    'whats the real peak voltage of my wall socket',
    'why does the nameplate not show the peak value',
    'so the number on the appliance isnt the max voltage'
  ],
  'pending_review'
),
-- ─── STATE_6 why_not_peak_value deep-dive ──────────────────────────────
(
  'why_not_peak_value',
  'ac_voltage_resistor',
  'STATE_6',
  'Wouldn''t peak voltage be the more honest number to rate things by?',
  'Student reasons that since the peak is the biggest, most extreme value the supply ever reaches, it should be the "safest" or most informative number to publish — closer to an everyday worst-case-rating instinct (like a bridge''s maximum load) than to what an electrical rating is actually FOR. The rating that matters for heating, lighting, and everyday power delivery is not "how extreme does it get" but "how much steady, continuous power does this deliver on average" — and that number is the rms value, because ⟨p⟩ = Vrms·Irms = Irms²R is the exact DC-equivalent power a resistor experiences. Rating by the peak would badly OVERSTATE the delivered power: a heater "rated" at the 10.0 V peak would need only 7.07 V rms to actually reach that peak, so quoting 10.0 V as if it were the steady operating voltage would mislead every power calculation downstream. The 0.707 (1/√2) factor itself is not arbitrary — it falls straight out of ⟨sin²ωt⟩ = ½, the exact geometric fact STATE_7 and STATE_8 derive from first principles.',
  ARRAY[
    'why dont we just rate everything by the peak voltage',
    'wouldnt peak voltage be the honest number to use',
    'why does the peak overheat things if we dont rate by it',
    'if peak is higher why isnt that the danger number',
    'why does 0.707 show up instead of 1'
  ],
  'pending_review'
),
-- ─── STATE_7 why_root_two deep-dive ────────────────────────────────────
(
  'why_root_two',
  'ac_voltage_resistor',
  'STATE_7',
  'Where does the square root of two actually come from?',
  'Student sees √2 appear in Irms = im/√2 and treats it as an unexplained magic constant specific to this one concept, rather than recognising it falls straight out of a general trigonometric fact. The chain is short and exact: ⟨i²(t)⟩ = ⟨im²sin²(ωt)⟩ = im²·⟨sin²(ωt)⟩, and ⟨sin²(ωt)⟩ = ½ for ANY pure sinusoid, regardless of its amplitude, frequency, or what physical quantity it represents (STATE_8 proves this geometrically, by folding the humps of a sin² curve flush into its troughs). So ⟨i²⟩ = im²/2 exactly, and taking the square root to undo the earlier squaring gives Irms = im/√2 — the √2 is simply √(1/½) turned the right way up, a pure consequence of averaging a squared sinusoid, with nothing resistor-specific about it at all. The same √2 would appear identically for the rms of any sinusoidal voltage, current, or field.',
  ARRAY[
    'where does root 2 come from',
    'why divide by root 2 and not just 2',
    'why square root at the end',
    'is root 2 always the number or does it change',
    'why not just take the average of i directly'
  ],
  'pending_review'
),
-- ─── STATE_7 square_mean_root_order deep-dive ──────────────────────────
(
  'square_mean_root_order',
  'ac_voltage_resistor',
  'STATE_7',
  'Does the order of squaring, averaging, and rooting actually matter?',
  'Student assumes "square, mean, root" is just a fixed-but-arbitrary sequence of steps to memorise, rather than an order that is mechanically FORCED by what each step does to the information in the signal. Averaging FIRST is fatal: the raw current i(t) is symmetric about zero, so a plain time-average collapses it to exactly zero (STATE_5''s own result) — averaging destroys the magnitude information before squaring ever gets a chance to rescue it, since squaring a single already-averaged zero just gives zero again. Squaring FIRST is what saves the calculation: it makes every instantaneous value non-negative BEFORE any averaging happens, so the average of THOSE squared values is a genuinely meaningful, strictly positive number (im²/2, watched settling live on STATE_7''s re-tasked meter). Only once that positive mean quantity exists does taking its square root make sense, to undo the earlier squaring and return the answer to the original current-like units. Reorder the steps and the whole calculation breaks — this is a mechanical, non-negotiable sequence, not a stylistic convention.',
  ARRAY[
    'why square first instead of averaging first',
    'does the order square mean root actually matter',
    'what if i average before squaring',
    'why not root then mean',
    'why cant i skip the squaring step'
  ],
  'pending_review'
),
-- ─── STATE_7 average_power_half_peak_power deep-dive ───────────────────
(
  'average_power_half_peak_power',
  'ac_voltage_resistor',
  'STATE_7',
  'Why is average power always exactly half the peak power?',
  'Student either doubts the "exactly half" claim (assuming it must be an approximation, or specific to the particular numbers used in this sim) or cannot see why it should be true at all. It is exact, and it is universal for any resistor under any sinusoidal AC supply, for the same reason √2 is universal: ⟨p(t)⟩ = ⟨vm·im·sin²(ωt)⟩ = vm·im·⟨sin²(ωt)⟩ = vm·im·(½) = ½·p_peak, and that middle step, ⟨sin²(ωt)⟩ = ½, is a pure geometric fact about the sine function''s own shape — it does not depend on vm, im, R, or the frequency at all (STATE_8''s fold-and-flatten proof makes the "exactly", not "approximately", explicit: the humps above the half-line rotate 180° about each half-crossing and land flush in the troughs, with no leftover gap or overlap). Change the peak voltage, the resistance, or the frequency, and the peak power changes — but the RATIO of average power to peak power stays locked at exactly one half, always, for a resistor.',
  ARRAY[
    'why is average power exactly half the peak power',
    'is half peak power always true for any resistor',
    'why not use peak power for heating calculations',
    'does half only work because of sin squared',
    'why does average power need irms and not im'
  ],
  'pending_review'
)
ON CONFLICT (cluster_id) DO UPDATE
SET concept_id        = EXCLUDED.concept_id,
    state_id          = EXCLUDED.state_id,
    label             = EXCLUDED.label,
    description       = EXCLUDED.description,
    trigger_examples  = EXCLUDED.trigger_examples,
    status            = EXCLUDED.status,
    updated_at        = now();
