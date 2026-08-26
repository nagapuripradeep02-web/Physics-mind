# REPAIR DESIGN — lines_and_planes_in_space (B1 + B2 + B3 + minors)
Architect artifact, 2026-08-22. Applies to:
`src/data/concepts/mathematics/lines_and_planes_in_space.json`

Scope: states, order, arcs, physics, rings, and the documented camera couplings
(S2 entry == S7 entry; S5 ease target == S8 entry) are PRESERVED. No state added or removed.

Timing model (verified against build_review_site.ts ~857-872, ~1111-1155):
dur = max(1400, round(chars/5.5/(150*rate)*60000)); GAP 280;
timelineTotal = max(narrationEnd, duration*1000).
Reproduces the auditor's eight narration-end figures exactly at rate 0.9.

Sync contract used throughout:
(i)  at rate 0.9 every event lands inside its narrating sentence's window;
(ii) at 0.7/1.1 the screen never CONTRADICTS the sentence being spoken
     (an event falsifying an earlier claim must not fire before that claim ends at 0.7;
      an announced action may lag its announcement at 1.1);
(iii) last motion >= narration end at 0.7; `duration` = last-motion end.

NOTE: the vg region consumes no cue time -- vgRevealFrac reads o.reveal_at_ms directly.
Every vg reveal is an absolute constant while narration scales 1/rate. Verified independently.

## STATE_1 - lever: loop + extend (narration UNCHANGED, 52 w)
- animate lambda: was -3.5->3.5 @4000+13000
  now  -3.5->3.5 @4000+9000 (linear); 3.5->-3.5 @13000+9000 (linear)
- add animate_loop_ms: 22000
- duration: 20 -> 23
- eye_capture_ms 12000 unchanged (lambda = 2.72 now; re-baseline expected)

## STATE_2 - lever: trim + re-budget (55 -> 49 w)
FINAL TEXT:
- s2_1 "To name a plane, use a perpendicular direction: the normal."
- s2_2 "A vector in the plane gives a zero dot product, or scalar product, with the normal."
- s2_3 "Tip it out of the plane: the reading leaves zero."
- s2_4 unchanged
Schedule:
- test_v_inplane reveal/hide: 6500/11200 -> 4800/15300
- aux_a sweep: 0->1 @6500+4000  ->  0->1 @4800+10450
- test_v_offplane reveal: 11150 -> 15250 (grow 0)
- aux_b: 0->1 @11200+2800 -> 0->1 @15300+3000;
         add 1->0.62 @18600+3400; 0.62->1 @22300+4400
- duration: 18 -> 27

## STATE_3 - lever: trim s3_4 + re-budget + terminal q drift (54 -> 47 w)
FINAL TEXT:
- s3_4 "That perpendicular is the distance. Now replace the point with a line."
Schedule:
- aux_a: -2.2->1.6 @2500+9500 -> @2500+9000; 1.6->0 @12000+3500 -> @11500+2600
- perp reveal: 15450 -> 14150 (grow 0)
- cmp hide: 15500 -> 14200
- q: add offset {along:[0,1,0], zero:1.19, knob:"q_height"} (clone STATE_9's own q entry)
     animate q_height 1.19->2.2 @15500+6000; 2.2->1.19 @21800+6700
- eye_capture_ms: 17500 -> 15200
- duration: 20 -> 29

## STATE_4 - lever: trim s4_4 + re-budget + terminal lift drift (55 -> 51 w)
FINAL TEXT:
- s4_4 "A line meets a plane once, or never. Two lines can do a third thing."
Schedule:
- aux_a slide: 0->0.55 @2000+6000 -> @1500+10500
- Lpar ghost_at / par_tag reveal / arc_par hide / X_par hide: 9500 -> 12000 (all four)
  (par_tag POSITION untouched -- verified correct)
- Lcut reveal: 9500 -> 12050 (+800 grow)
- aux_b descent: 1.4->0 @10500+4500 -> @12900+4600
- X_live reveal/hide: 10300/15000 -> 13300/17500
- X reveal: 15000 -> 17500 (windows stay disjoint)
- terminal: aux_b 0->0.5 @18500+6000; 0.5->0 @24800+6200
- eye_capture_ms: 17500 -> 18200
- duration: 20 -> 31
ALSO update prose notes citing "9.5 s" -> 12.0 s and "15 s" -> 17.5 s
in the Lpar / X / misconception_watch note text.

## STATE_5 - lever: trim incl. s5_6 DELETION + slower ease (55 -> 47 w, 6 -> 5 sentences)
FINAL TEXT:
- s5_2 "On the ground, one passes above the other, and they never touch."   (12 w)
- s5_4 "Not parallel, and never meeting: these are skew lines."             (9 w, glow M2)
- s5_5 "The true gap runs between their nearest points."                    (8 w, glow common_perp)
- s5_6 DELETED (its content is STATE_6's opening job; S6's title carries it)
- s5_1, s5_3 unchanged
Schedule:
- camera_steps: {at 5000, az -38, el 56, dist 9.5, ease 12000} -> ease 22900
                {at 20000, ease 0} -> {at 28200, ease 0}
- duration: 21 -> 28
Everything else untouched (entry pose, grow times, perp-before-marker ordering).

## STATE_6 - lever: trim + split rotation ramp (54 -> 47 w)
FINAL TEXT:
- s6_3 "Turn one direction past ninety: the reading rises, then falls back to sixty-five."
- s6_4 "The angle between two lines is the smaller one, never above ninety."
- s6_1, s6_2 unchanged
Schedule:
- aux_a: 0->1.5 @1500+3500 -> @1500+4000
         1.5->-1.5 @5000+4000 -> @5500+5000
         -1.5->0 @9000+1500 -> @10500+3200
- theta hold: 69.3846 @0+10500 -> @0+13700
- theta ramp: 69.3846->115 @10500+9000  REPLACED BY
              69.3846->90 @13700+3600 ; 90->115 @17300+12400
- duration: 22 -> 30
- eye_capture_ms 15000 (mid-rise; re-baseline expected)

## STATE_7 - lever: trim s7_4 + re-budget arcs + terminal radial pull (47 -> 39 w)
FINAL TEXT:
- s7_4 "Measure to the normal, then subtract from ninety."
Schedule:
- arc_normal reveal/grow: 8000/2500 -> 7100/2000
- arc_normal_tag reveal: 8000 -> 9100
- arc_plane reveal/grow: 12000/3000 -> 12100/2000
- arc_plane_tag reveal: 12000 -> 14100
- camera_steps: {at 0, az140, el26, dist 8.0, ease 1800}
                ADD {at 14300, az140, el26, dist 8.85, ease 9400}
                {at 17000, ease 0} -> {at 24000, ease 0}
- duration: 19 -> 24
B3 REPLACEMENT POSITIONS (screen-perpendicular clearance, not radial):
- arc_normal_tag "55.0deg" position -> [1.379818, 0.455831, 0.298285]
    = apex + 0.900*b1hat + 0.500*nhat
    worst screen gap 15.6 px at entry, 14.1 px at dist 8.85
- arc_plane_tag "35.0deg" position -> [1.428782, -1.022028, 0.923360]
    = apex + 0.950*shat - 0.925*fhat + 0.100*nhat
    worst screen gap 16.1 px at entry, 14.6 px at dist 8.85
  (the wedge interior is unusable: at the required 1.66 wu radius the bisector
   lands 0.05 wu from the normal_part segment)
Arcs, radii, readouts, controls:[] all UNCHANGED.
Replace both tag `note` fields with this arithmetic.

## STATE_8 - lever: trim + re-budget + B1 token drop + terminal push-in (55 -> 47 w)
FINAL TEXT:
- s8_1 "The two lines return, with the gap already drawn."   (9 w)
- s8_5 "Next, every number becomes a control."               (6 w)
- s8_2, s8_3, s8_4 unchanged
Schedule:
- value_readouts: ["numerator_triple_product","cross_norm","skew_distance"] -> ["skew_distance"]   (B1)
- cross_vec reveal/grow: 3000/3000 -> 5200/2600
- common_perp, a2_minus_a1: unchanged at 1000
- aux_a slide: 0->1 @8500+7000 -> @11700+7000
- ADD camera_mode "steps", camera_steps:
    [{at 19200, az -38, el 56, dist 8.8, ease 10800}, {at 30300, ease 0}]
  (push-IN, not pull-back: pull-back is forbidden here -- the d1xd2 / a2-a1 label gap
   is 13.5 px, only 1.5 px above the 12 px bar; push-in grows it to ~14.6 px)
- eye_capture_ms: 17500 -> 19000
- duration: 20 -> 30

## STATE_9 - NO CHANGE (explore; already loops).

## B1 DECISION (recorded)
Drop numerator_triple_product and cross_norm from STATE_8 value_readouts rather than
pulling cross_vec to 1000. Pulling it would destroy the build-then-slide beat that IS
s8_2/s8_3, and delaying common_perp breaks s8_1's premise plus S5->S8 home-pose continuity.
With both tokens gone, no number can name d1xd2 before it is drawn -- the scar's failure
mode becomes unrepresentable rather than merely rescheduled.
WHEN delta-12 lands (per-vector readout gating): restore both tokens, gated on
cross_vec / a2_minus_a1 arrivals.

## ENGINE ITEMS -- NOT fixable at schedule level (do not attempt in JSON)
1. vg scenario_cue support: per-sentence sync at every Speed rate is impossible with
   absolute reveal_at_ms. Route vg reveal/animate anchors through cueTriggerMs so
   SET_CUE_TIME drives them, authored ms as THE EYE's deterministic fallback.
   Rule 40: platform file, land on master separately, `git log --all -S` first.
2. delta-12 (existing OPEN MAJOR vg_common_perpendicular_publishes_all_three_readouts...).
3. lambda_label producer gap (existing row) -- still inert, untouched.
4. angle_arcs[].label has no consumer -- a vg_lp_arc_label pool would retire the
   size-0 point-tag workaround entirely.
