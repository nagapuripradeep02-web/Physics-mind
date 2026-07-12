-- 2026-07-12: lock teacher_profiles against client writes (trial self-extension fix).
-- APPLY TO THE PILOT PROJECT (physicsmind-pilot / jqbnmltsupnnbuvqgkix), NOT the dev project.
--
-- Why: profiles_update_own (wave-0) allowed UPDATE on ALL columns of the teacher's own
-- row — including trial_days / trial_started_at, exactly the columns the client-side
-- trial gate reads (pm-auth.js). Any signed-in teacher could self-extend their trial
-- from the browser console with the shipped anon key.
--
-- The pilot client never updates teacher_profiles: it SELECTs the row (profile gate)
-- and creates it via start_trial() (security definer, runs as owner). So client write
-- access is dropped entirely. Founder edits ("trial_days = 90 for pilot professors")
-- stay on the service role / dashboard, which bypasses both RLS and these grants.

drop policy if exists profiles_update_own on public.teacher_profiles;
revoke insert, update, delete on public.teacher_profiles from anon, authenticated;

-- select stays granted to authenticated (profiles_select_own limits it to the own row).
