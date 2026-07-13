-- supabase_2026-07-13_seed_gauss_law_magnetism_clusters_migration.sql
-- Seeds confusion_cluster_registry with 5 clusters for
-- gauss_law_magnetism.json — Ch.5 concept #3 of the founder's 2026-07-12
-- Socratic->straightforward rebuild batch (field_3d, gauss_law_magnetism
-- scenario). Authored 2026-07-13 by alex:json_author per architect skeleton
-- §6 (S3/S5 candidate clusters) + physics_author's drill-down trigger
-- phrases (verbatim, §9 of the physics block).
--
-- Migration is AUTHORED, NOT APPLIED — quality_auditor's pre-run step
-- applies it (json_author is forbidden from apply_migration). Drill-down
-- itself is DEFERRED (Rule 18, 2026-06-10 directive) — the
-- confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase per the
-- documented false-FAIL scar (memory: auditor-cluster-registry-false-fail).
-- Do not let the auditor re-route json_author to "fix" this. No state in
-- this concept currently carries has_prebuilt_deep_dive (declared exception,
-- skeleton §5) — these clusters are recorded for a FUTURE S3/S5 revival only.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real student-voice phrasings (lowercase,
-- idiomatic, no textbook prose), verbatim from the physics block.
-- status='pending_review' per the current cluster-registry convention.
--
-- Candidate cluster_ids (architect skeleton §6, physics block §9):
--   STATE_3 — monopole_enclosure_confusion · lines_inside_the_magnet · cutting_magnet_isolates_pole
--   STATE_5 — two_gauss_laws_conflation · flux_vs_field_zero

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 monopole_enclosure_confusion deep-dive ───────────────────
(
  'monopole_enclosure_confusion',
  'gauss_law_magnetism',
  'STATE_3',
  'Why isn''t the flux positive around just the north pole?',
  'Student expects a surface wrapped tightly around ONE pole to behave like a surface wrapped around an isolated positive electric charge — enclosing a "source" should give a positive net flux. The sim shrinks the Gaussian surface onto the north pole alone (exactly where the student expects a positive reading) and instead shows the tally staying balanced: every one of the 12 rendered loops that pokes outward near the pole tip also pokes back inward through the magnet''s own body, still inside that same small surface. There is no magnetic monopole — no isolated magnetic "charge" a surface can trap — so the crossing-parity argument (equal in and out per closed loop) holds even at this smallest, most source-like-looking enclosure.',
  ARRAY[
    'why isnt the flux positive around just the north pole',
    'if I only wrap the north end doesnt it have to be positive',
    'shouldnt one pole alone act like a positive charge',
    'why does zero still happen when I shrink the surface',
    'isnt the north pole a source of field lines by itself'
  ],
  'pending_review'
),
-- ─── STATE_3 lines_inside_the_magnet deep-dive ────────────────────────
(
  'lines_inside_the_magnet',
  'gauss_law_magnetism',
  'STATE_3',
  'Does the field line really continue INSIDE the solid magnet?',
  'Student pictures magnetic field lines as existing only in the empty space around a magnet, since that is the region iron filings or a compass can actually probe — the idea that a field line "keeps going" through solid iron feels physically odd. The sim makes the internal return path explicit and visible: a bright tube runs S→N through the magnet''s own body (drawn just in front of the opaque body so it stays visible), with a tracer dot riding it exactly like the external tracers ride the outside arcs. The field does not stop at the magnet''s surface — B is continuous everywhere, including inside the material — and it is precisely this internal segment that closes each external arc into one unbroken loop, which is the mechanism behind "no monopole" (M3).',
  ARRAY[
    'does the field line really go through the magnet',
    'I thought field lines only exist outside the magnet',
    'whats happening to the line once it enters the metal',
    'why does the line keep going once it hits the pole',
    'is there field inside a solid bar magnet'
  ],
  'pending_review'
),
-- ─── STATE_3 cutting_magnet_isolates_pole deep-dive ───────────────────
(
  'cutting_magnet_isolates_pole',
  'gauss_law_magnetism',
  'STATE_3',
  'What if I cut the magnet in half — do I get a lone north pole?',
  'Student reasons that since the surface can be shrunk arbitrarily close around just the north tip, physically CUTTING the magnet there should isolate a true single pole, contradicting the no-monopole claim. Cutting a bar magnet at the middle does not isolate a pole — it creates two SHORTER complete magnets, each instantly growing its own new south pole at the cut face (the atomic-scale current loops throughout the material realign at every scale, so any piece, however small, is again a dipole). This is the compass-needle secondary anchor the concept opens with: snap the needle in two and each piece is again a full magnet with both a north and a south end. There is no scale at which cutting produces an isolated pole, which is the physical reason the crossing-tally argument (S3) never breaks down, no matter how tightly the surface is drawn.',
  ARRAY[
    'what if I cut the magnet in half at the middle',
    'if I saw the magnet apart do I get a lone north',
    'why cant I ever get just one pole by breaking it',
    'does cutting a magnet ever give a single charge like pole',
    'if you keep cutting forever do you eventually get one pole'
  ],
  'pending_review'
),
-- ─── STATE_5 two_gauss_laws_conflation deep-dive ──────────────────────
(
  'two_gauss_laws_conflation',
  'gauss_law_magnetism',
  'STATE_5',
  'Why does the electric Gauss law have charge over epsilon-nought, but the magnetic one doesn''t have an equivalent term?',
  'Student has just learned the electric Gauss law ∮E·dA = q_enc/ε₀ and expects every Gauss law to follow the same template — "enclosed source divided by a constant" — so a magnetic version with no right-hand-side term at all feels like an incomplete or arbitrarily different rule rather than a genuinely different physical fact. The template only applies when the field HAS a real point source to enclose: an electric field line starts and ends on a charge (an open ray, one end anchored), so a charge inside a surface leaves a permanent one-way imbalance of crossings. A magnetic field line has no such anchor point anywhere — it is a closed loop with both "ends" the same point — so there is no magnetic charge q_m to write into a right-hand side; the honest magnetic law is simply zero, not "q_m over some constant" with q_m always happening to be zero.',
  ARRAY[
    'why does the electric one have charge over epsilon but the magnetic one doesnt',
    'shouldnt magnetism have its own version of q over epsilon nought',
    'whats the magnetic equivalent of enclosed charge',
    'why is there no q_m in the magnetic law',
    'are these two laws really saying different things'
  ],
  'pending_review'
),
-- ─── STATE_5 flux_vs_field_zero deep-dive ─────────────────────────────
(
  'flux_vs_field_zero',
  'gauss_law_magnetism',
  'STATE_5',
  'If the net magnetic flux is zero, does that mean the magnetic field itself is zero outside the magnet?',
  'Student conflates "net flux through the surface is zero" with "the field is zero everywhere on the surface" — but the sim''s own field lines are clearly visible, non-zero, and crossing the surface at multiple points simultaneously, which seems to contradict a zero reading. Net flux zero means the SUM of outward crossings and inward crossings balances to zero — it says nothing about the field being weak or absent at any single point on the surface. In S2/S3/S4/S6 the live tally can show a healthy nonzero count on each side (for example +6 out and −6 in) that still sums to a net of zero; the field is very much present and nonzero at every one of those crossing points, it just contributes equally in both directions when totalled over the whole closed surface.',
  ARRAY[
    'if net flux is zero does that mean B is zero outside',
    'net flux zero but the field isnt zero right',
    'how can flux be zero when I can clearly see field lines',
    'does zero flux mean no field at all',
    'whats the difference between the field being zero and the flux being zero'
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
