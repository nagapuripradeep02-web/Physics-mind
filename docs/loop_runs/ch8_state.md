# ch8 loop state
updated: 2026-07-24 (created at Ch.8 kickoff — trial system replicated from ch7, Amendment 5 parallel-safe)
review_port: 8088
regression_sample: magnetisation_and_intensity, bar_magnet_as_dipole
next: displacement_current
done: (none)
parked: (none)
in_flight: (none)
engine_commits: (none yet)
chapter_map (founder-approved 2026-07-24): displacement_current, em_wave_propagation, electromagnetic_spectrum
notes: KICKOFF (2026-07-24) — Ch.8 Electromagnetic Waves, 3-concept core map (NCERT Ch.8). Trial system replicated from ch7 branch: founder-proxy + field3d-surgeon agents, CHAPTER_LOOP.md (with Amendment 4 token discipline + Amendment 5 parallel-safety), scripts/ch8_loop.ps1 wrapper. All three concepts need a NEW field_3d scenario_type built in-loop via field3d-surgeon (ch8's renderer is clean master, no scenarios for these).
notes: PARALLEL-SAFETY (Amendment 5) — this loop shares the dev Supabase (dxwpkjfypzxrzgbevfnx) with the ch7 loop. (1) Cache-clear is SCOPED: `npm run cache:clear:scoped -- <id>` (never the unconditional 4-table wipe). (2) field_3d regression sample = magnetisation_and_intensity + bar_magnet_as_dipole (DISJOINT from ch7's faraday_law_induction + capacitance) so the two loops never re-seed the same baseline at once. Both verified baseline-locked field_3d on this branch.
notes: START GATE — the ch8 wrapper (scripts/ch8_loop.ps1) does NOT launch its first session until ch7_state.md shows lc_oscillations on its done: line (ensures the next ch7 session reads Amendment 5 and uses scoped clears), so no ch8 concept ever overlaps a ch7 session doing unconditional full-table wipes.
notes: TRIAL CONSTRAINTS HOLD — no visual:approve, no tts, no PILOT_CONCEPTS, no deploy, NO DB writes to engine_bug_queue (scars are files in docs/loop_runs/ch8/_engine/scar_candidates.sql, pending founder ruling), no merge to master. review port 8088 (ch7 uses 8087 — distinct so the two review servers don't collide).
notes: displacement_current (Ch.8 #1, NCERT §8.2) — Maxwell's correction to Ampère's law: a charging capacitor has NO conduction current between the plates yet B still circulates → the changing E-flux (displacement current I_d = ε₀ dΦ_E/dt) is the missing source. Universal anchor (Rule 35): any charging capacitor (a camera flash, a touchscreen) — never country-specific. Likely a NEW field_3d scenario showing conduction current in the wire + displacement current between the plates + the Ampèrian loop enclosing each. Resume: cache:clear:scoped displacement_current → dispatch architect.
