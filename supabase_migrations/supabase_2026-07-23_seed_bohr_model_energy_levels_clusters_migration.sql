-- supabase_2026-07-23_seed_bohr_model_energy_levels_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters (3 per has_prebuilt_deep_dive
-- state: STATE_3, STATE_6, STATE_7) for bohr_model_energy_levels.json — the
-- FIRST chemistry concept through the pipeline (Wave 1, 2026-07-23).
-- Authored by json_author per chemistry_author's physics-block-equivalent
-- (bohr_chem_block.md) §5 drill-down phrasings + §6 cluster names.
--
-- NOT APPLIED — chemistry drill-down serving is deferred (Phase 2.5 vertical
-- slice; docs/CHEMISTRY_ARCHITECTURE.md §7). Authored now so the founder can
-- apply it via Supabase MCP apply_migration when the chemistry drill-down
-- path activates. Idempotent on re-run (ON CONFLICT upsert, matches the
-- current_not_vector / friction_static_kinetic precedent).
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
-- trigger_examples, status, created_at, updated_at.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'bohr_continuous_vs_quantised_energy',
  'bohr_model_energy_levels',
  'STATE_3',
  'Why can''t the electron have any energy it wants?',
  'Student expects electron energy to be continuous (like a ramp) and cannot accept that only discrete rungs exist — the PRIMARY misconception this concept confronts.',
  ARRAY[
    'why cant the electron have any energy it wants',
    'isnt energy supposed to be continuous like everything else',
    'who decided only these specific energies are allowed',
    'why are there gaps the electron cant be in',
    'does the electron ever exist between two levels for a moment'
  ],
  'pending_review'
),
(
  'bohr_electron_between_levels',
  'bohr_model_energy_levels',
  'STATE_3',
  'What happens to the electron while it is jumping?',
  'Student asks about the transition itself — whether the electron has a transient in-between energy or position during a quantum jump.',
  ARRAY[
    'what happens to the electron while its jumping',
    'is there a tiny time when its between n=2 and n=3',
    'does the electron pass through the space in between',
    'where exactly is the electron mid-jump',
    'if it snaps instantly does it ever have in-between energy'
  ],
  'pending_review'
),
(
  'bohr_ladder_vs_ramp_model',
  'bohr_model_energy_levels',
  'STATE_3',
  'Why is it a ladder and not a slide?',
  'Student wants the physical/analogy justification for why atomic energy behaves like discrete steps rather than a smooth ramp.',
  ARRAY[
    'why is it a ladder and not a slide',
    'so the atom is basically stairs not a ramp',
    'why cant the spacing be smooth like a ramp',
    'is the ladder analogy exact or just for teaching',
    'why do real atoms behave like discrete steps'
  ],
  'pending_review'
),
(
  'bohr_line_spectrum_fingerprint',
  'bohr_model_energy_levels',
  'STATE_6',
  'Why does each element have its own set of lines?',
  'After the PRIMARY aha (every line = one exact gap), student generalizes to asking why the fingerprint is element-specific and how it is used to identify substances.',
  ARRAY[
    'why does each element have its own set of lines',
    'how can you identify a gas just from its light',
    'is the line pattern always the same for hydrogen',
    'why is it called a fingerprint',
    'can two different elements ever have the same lines'
  ],
  'pending_review'
),
(
  'bohr_why_not_rainbow',
  'bohr_model_energy_levels',
  'STATE_6',
  'Why doesn''t the gas make all the colours like the filament?',
  'Student re-asks the STATE_1 hook question after seeing the mechanism, probing why quantisation specifically prevents a continuous spectrum from a gas.',
  ARRAY[
    'why doesnt the gas make all the colours like the filament',
    'why only 4 lines and not a full spectrum',
    'the gas has electrons too so why not a rainbow',
    'whats different about the gas that stops the rainbow',
    'why is there darkness between the lines instead of colour'
  ],
  'pending_review'
),
(
  'bohr_gap_count_vs_line_count',
  'bohr_model_energy_levels',
  'STATE_6',
  'Why are there more possible gaps than lines shown here?',
  'Student notices the ladder has more level-pairs (gaps) than the 4 painted lines and asks about the visible/UV-IR split and which gaps are shown.',
  ARRAY[
    'why are there more possible gaps than lines shown here',
    'how many lines should hydrogen actually have',
    'do all the gaps produce visible lines or just some',
    'why does the number of lines match the number of drops',
    'if there are 6 levels why arent there more lines'
  ],
  'pending_review'
),
(
  'bohr_ev_joule_conversion',
  'bohr_model_energy_levels',
  'STATE_7',
  'Why use electron-volts instead of joules?',
  'Student questions the unit choice (eV) used throughout the ledger and wants the joule-equivalent / conversion rationale.',
  ARRAY[
    'why use electron-volts instead of joules',
    'how do I convert eV to joules',
    'whats the actual joule value of 1.89 eV',
    'why does this use eV but other formulas use joules',
    'is eV a real unit or just a shortcut'
  ],
  'pending_review'
),
(
  'bohr_wavelength_energy_inverse',
  'bohr_model_energy_levels',
  'STATE_7',
  'Shouldn''t more energy give a longer wavelength?',
  'The STATE_7 misconception_watch target — student expects a DIRECT (not inverse) relationship between gap size and wavelength.',
  ARRAY[
    'why does bigger energy mean smaller wavelength',
    'shouldnt more energy give a longer wave',
    'why is it 1240 divided by delta E and not multiplied',
    'why does a bigger jump give a shorter wavelength',
    'does energy and wavelength always move opposite each other'
  ],
  'pending_review'
),
(
  'bohr_frequency_vs_wavelength',
  'bohr_model_energy_levels',
  'STATE_7',
  'What''s the difference between frequency and wavelength here?',
  'Student conflates ν and λ inside the ΔE = hν = hc/λ formula and wants the relationship (through c) spelled out.',
  ARRAY[
    'whats the difference between frequency and wavelength here',
    'why do we need both nu and lambda',
    'does higher frequency mean higher energy or lower',
    'how are frequency and wavelength related through c',
    'which one actually decides the colour, frequency or wavelength'
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
