-- supabase_2026-08-01_seed_bond_polarity_dipole_moment_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for
-- bond_polarity_dipole_moment.json — Class 11 Chemistry Ch.4 "Chemical
-- Bonding and Molecular Structure" §4.4, authored against the bonding_scene
-- field_3d scenario. chapter:4, section:"4.4",
-- prerequisites:["vsepr_molecular_shapes"]. Desk 1, concept 1 of 2 in the
-- Phase-0 bonding wave.
--
-- Authored 2026-08-01 by alex:json_author, using chemistry_author's
-- drill-down trigger phrasings VERBATIM
-- (docs/skeletons/bond_polarity_dipole_moment_chemistry_block.md §5):
--   STATE_4 — vector_addition_of_bond_dipoles, shape_decides_polarity,
--             bent_vs_linear_water;
--   STATE_5 — tetrahedral_cancellation_3d, symmetry_and_zero_dipole,
--             ccl4_vs_chcl3_contrast (bridges STATE_6).
--
-- Migration is AUTHORED, NOT APPLIED — per the json_author role contract,
-- the SQL is left for quality_auditor's pre-run step / the founder to apply.
-- Drill-down itself is DEFERRED (Rule 18, 2026-06-10 directive): the button
-- routes to a feedback form until analytics flag a state; child states are
-- hand-authored only after real confusion data exists. Chemistry additionally
-- registers at SITE #1 ONLY (src/data/concepts/chemistry/, per
-- docs/CHEMISTRY_ARCHITECTURE.md §7) — this migration therefore contains NO
-- concept_panel_config / CONCEPT_RENDERER_MAP / VALID_CONCEPT_IDS row: those
-- five sites are FORBIDDEN for chemistry ids until the chemistry serving path
-- lands (Gate 8b is all-or-nothing).
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive picks (architect skeleton §5, metadata only, Rule 18):
-- STATE_4 (the primary aha — where the vector-addition abstraction bites,
-- "why does bending change anything?") and STATE_5 (the 3D cancellation —
-- the concept's diamond state and the most-asked exam picture, CCl4 vs
-- CHCl3). Both states carry a drill_downs array in the concept JSON
-- referencing these cluster_ids.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_4 vector_addition_of_bond_dipoles deep-dive ─────────────────
(
  'vector_addition_of_bond_dipoles',
  'bond_polarity_dipole_moment',
  'STATE_4',
  'Why do you add the two bond arrows as vectors instead of just adding their lengths?',
  'Student treats dipole moment like a plain number (a length to add or subtract) rather than a quantity with a direction, so "1.51 D plus 1.51 D should be 3.02 D, not 1.85 D" feels like a contradiction. A bond dipole is a VECTOR: it has a magnitude (how polar the bond is) AND a direction (which atom is delta-minus). Adding two vectors means placing them head to tail, or equivalently summing their components along each axis — not adding their lengths. When two bond dipoles point in exactly opposite directions (linear CO2, or water opened flat), their vector sum is the DIFFERENCE of equal magnitudes, which is zero, however long each individual arrow is. When they point at an angle to each other (bent water), the sum is somewhere between zero and the arithmetic total, and the exact value depends on that angle through simple trigonometry. The direction of every arrow matters exactly as much as its length, because the sum genuinely depends on both.',
  ARRAY[
    'why do you add the arrows instead of just adding the numbers',
    'if both bonds are polar why doesnt the total just get bigger',
    'how do two arrows pointing different ways add up to a smaller number',
    'is adding dipole arrows the same as adding forces',
    'why does the direction of the arrow matter if the bond is polar either way'
  ],
  'pending_review'
),
-- ─── STATE_4 shape_decides_polarity deep-dive ──────────────────────────
(
  'shape_decides_polarity',
  'bond_polarity_dipole_moment',
  'STATE_4',
  'If the bonds themselves did not change, why does bending the molecule make it polar?',
  'Student reasons that "the atoms are the same, the bonds are the same, so nothing about the molecule should change" — treating polarity as a property that lives entirely in the bonds. Each individual bond dipole''s MAGNITUDE depends only on which two atoms are joined and their electronegativity difference — it genuinely does not change when the molecule bends. What changes is the ANGLE between the two bond vectors, and a vector sum is angle-dependent even when every individual vector''s length is fixed: two arrows of the same length pointing in exactly opposite directions cancel to zero, while the same two arrows tipped toward each other add to something nonzero. Bending a molecule does not touch a single bond''s polarity; it changes only the geometric relationship between the two bond vectors, and that relationship is exactly what a vector sum is sensitive to. This is the whole reason molecular shape, not bond identity alone, decides molecular polarity.',
  ARRAY[
    'so the bonds dont decide if the molecule is polar, the shape does',
    'why does bending the molecule change anything if the bonds stayed the same',
    'can two molecules with the same bonds have totally different polarity',
    'does changing the shape without changing the atoms really change the dipole',
    'why do we care about the 3d shape and not just which atoms are attached'
  ],
  'pending_review'
),
-- ─── STATE_4 bent_vs_linear_water deep-dive ────────────────────────────
(
  'bent_vs_linear_water',
  'bond_polarity_dipole_moment',
  'STATE_4',
  'What would water look like, and behave like, if it were a straight line instead of bent?',
  'Student has just watched water bend from a linear 180-degree opening pose to its real 104.5-degree shape and wants the counterfactual made concrete: what if it had stayed straight? If water were linear like carbon dioxide, its two O-H bond dipoles would point in exactly opposite directions and cancel completely, leaving a molecular dipole moment of exactly zero — the same picture STATE_3 already showed for CO2. A hypothetical linear water would then behave very differently from real water: with no permanent dipole, it would not attract other water molecules as strongly (weaker hydrogen bonding, so a much lower boiling point), it would be far worse at dissolving ionic compounds like salt (no strong dipole to surround and stabilise the ions), and it would not show the surface tension or capillary rise real water shows. The 104.5-degree bend is forced by water''s own two lone pairs pushing the bonding pairs together (the VSEPR lone-pair-repels-more-than-bond-pair result), and that bend is the entire reason water''s dipole moment is 1.85 D instead of zero.',
  ARRAY[
    'what would water look like if it were a straight line instead of bent',
    'why isnt water shaped like carbon dioxide if both have two bonds',
    'if water were linear would it still be able to dissolve salt',
    'whats actually pushing the hydrogens apart to make the bent shape',
    'why does 104.5 degrees matter so much for waters polarity'
  ],
  'pending_review'
),
-- ─── STATE_5 tetrahedral_cancellation_3d deep-dive ─────────────────────
(
  'tetrahedral_cancellation_3d',
  'bond_polarity_dipole_moment',
  'STATE_5',
  'How can four arrows pointing in different directions in three dimensions add up to exactly zero?',
  'Student can follow a two-arrow cancellation on paper but a four-arrow, three-dimensional cancellation resists the same intuition — nothing on a flat page shows four things pointing in genuinely different directions summing to nothing. Four identical vectors drawn from a common centre toward the four vertices of a regular tetrahedron sum to EXACTLY zero — this is a geometric fact about the tetrahedron''s symmetry, independent of how long the vectors are (only their common magnitude and the ideal 109.5-degree spacing matter). Unlike the linear two-arrow case, this cancellation cannot be verified by eye from one static picture, because from most viewing angles the four arrows visually overlap or foreshorten in ways that hide the true 3D relationship. Rotating the whole molecule and checking that no leftover, unpaired-looking arrow ever appears from ANY angle is the only honest way to confirm the sum stays zero — which is exactly what the spin control lets a student test for themselves, rather than take on faith.',
  ARRAY[
    'how can four arrows in different directions add up to exactly zero',
    'i can see two arrows cancel on paper, how do i see four cancel in 3d',
    'do all four bonds have to point at exactly the same angle to cancel',
    'why doesnt spinning the molecule ever show a leftover arrow',
    'is the 3d cancellation just a coincidence for this particular shape'
  ],
  'pending_review'
),
-- ─── STATE_5 symmetry_and_zero_dipole deep-dive ────────────────────────
(
  'symmetry_and_zero_dipole',
  'bond_polarity_dipole_moment',
  'STATE_5',
  'Does every symmetric molecule automatically have zero dipole moment?',
  'Student wants to generalise the CO2 and CCl4 results into a rule they can apply without redoing the vector sum every time, but is unsure exactly how much symmetry is required. The general rule: any molecule whose peripheral bonds are all IDENTICAL (same two atoms, same bond dipole magnitude) and arranged in a sufficiently symmetric geometry — linear AB2, trigonal planar AB3, tetrahedral AB4, and a few higher-symmetry shapes — has its bond-dipole vectors sum to exactly zero, because the symmetric arrangement guarantees no single direction is preferred over any other. This requires BOTH conditions at once: the bonds must be chemically identical, and the geometry must be the ideal symmetric one (not merely "roughly balanced"). It fails the moment either condition breaks — one different peripheral atom (STATE_6''s single chlorine-to-hydrogen swap) or a distorted, non-ideal angle both leave a nonzero resultant. There is no shortcut that skips checking both conditions; a molecule that looks superficially symmetric but has even one different bond is NOT guaranteed zero.',
  ARRAY[
    'does every symmetric molecule automatically have zero dipole moment',
    'what exactly counts as symmetric enough to cancel',
    'if all four bonds are identical, does the molecule have to be nonpolar',
    'why does symmetry matter more than how polar each bond is',
    'is there a shortcut to know a molecule is nonpolar without doing the vector math'
  ],
  'pending_review'
),
-- ─── STATE_5 ccl4_vs_chcl3_contrast deep-dive (bridges STATE_6) ────────
(
  'ccl4_vs_chcl3_contrast',
  'bond_polarity_dipole_moment',
  'STATE_5',
  'Why does replacing just one chlorine out of four suddenly make the molecule polar?',
  'Student expects that changing one atom out of four should barely move the answer — "three out of four chlorines are still the same, so it should still be roughly zero" — and is surprised that carbon tetrachloride''s exact zero becomes chloroform''s clearly nonzero 1.04 D from a single substitution. With four identical C-Cl bonds, the tetrahedral symmetry guarantees an EXACT cancellation (STATE_5''s own result) — the four vectors were never "almost" zero, they were exactly zero because of the symmetry, not because the individual bond moments happened to be small. Replacing one chlorine with a hydrogen breaks that symmetry completely: now one of the four bond vectors has a different magnitude (and a different chemical identity) than the other three, so the exact-cancellation guarantee no longer applies at all. The three unchanged C-Cl vectors, which used to be exactly balanced against the fourth C-Cl vector, now have only three of themselves plus one C-H vector to sum — and that sum is no longer forced to zero by any symmetry argument, leaving a real resultant along the one different bond''s axis. It is not that "a little bit of asymmetry gives a little bit of dipole" — symmetry is all-or-nothing, so breaking it even slightly (one atom out of four) removes the entire cancellation guarantee at once.',
  ARRAY[
    'why does swapping just one chlorine for hydrogen suddenly make it polar',
    'doesnt replacing one atom out of four barely change anything',
    'why cant the other three chlorines still cancel out on their own',
    'how much of the dipole comes from the one different bond versus the shape',
    'if i swapped a different chlorine instead of that one, would i get the same answer'
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
