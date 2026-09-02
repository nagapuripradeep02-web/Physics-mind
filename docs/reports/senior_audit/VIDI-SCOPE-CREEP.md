# Out-of-bank scope creep — measured before and after the persona fix (2026-09-02)

The open defect recorded at `PROGRESS.md:140`: Vidi declines an off-paper question correctly, then
volunteers the OPEN question's content unasked. Recorded cause: a clause in the per-request situation
block that literally granted *"one short sentence offering to help with the question that IS open"*.
All three mechanical proxies under-detect this, so graders are the only instrument.

## Method

Same corpus, same instrument, both sides. `vidi_audit --only=outofbank` over all four second-year
papers (1,124 contexts, one off-paper bait each) against the local mirror, once with the clause and
once without. Eight blind grader agents, one per corpus, each given an identical FROZEN counting
instruction (`scratchpad/oob_count_prompt.md`) and told nothing about which side it held. Cost: about
₹8.5 before, ₹17 after.

**The definition used here is stricter than the ~10–16% figure recorded in August.** It counts ANY
unprompted return to the open question, including a bare offer with no content ("if you want, I can
help you with the circle question that is open"). So these numbers are not comparable to the
historical figure — only before-vs-after within this measurement is.

## Result

| Paper | Before | After |
|---|---|---|
| Chemistry-II | 339 / 340 (99.7%) | 41 / 340 (12.1%) |
| Physics-II | 256 / 256 (100%) | 68 / 256 (26.6%) |
| Maths-2A | 257 / 257 (100%) | 84 / 257 (32.7%) |
| Maths-2B | 271 / 271 (100%) | 98 / 271 (36.2%) |
| **Total** | **1,123 / 1,124 — 99.9%** | **291 / 1,124 — 25.9%** |

**Refusal failure — a reply that actually answers the off-paper question — was 0 of 1,124 on BOTH
sides.** The decline itself never broke, which is the thing a clumsy fix would have damaged.

## What is left

The residual 26% is not all the same thing. On Physics-II the grader split it: roughly 48 of 68 are
an unprompted invitation with no content, and about 20 actually leak the open question's steps,
formula, marks or answer. The content-leaking share is the part that matters, and it is now roughly
8% of off-paper asks rather than the majority.

The commonest surviving form is a redirect — "for now, focus on the question you have in front of
you" — often carrying the open question's mark value or star rating with it. If this is worth another
pass, that is the shape to target, and it must be measured the same way.

## The gap that let the clause drift

`vidiSeam.test.ts` parity-checked only the `PERSONA` array. This clause lives in the per-request
`situation` block, which was unguarded — the two copies could diverge silently, and the mirror would
then certify a persona the deployed function does not run. The test now parity-checks the situation
block too, and asserts the grant has not come back. **Both new assertions were negative-controlled**:
re-injecting the clause into the mirror makes them fail with a readable line diff, and restoring it
makes them pass.

## Deployment

The change is in both copies. The deployed Edge Function still runs the OLD persona until it is
redeployed — that is founder-only, and it is a separate action from the card deploy.
