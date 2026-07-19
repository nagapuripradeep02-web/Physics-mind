-- Pilot: shorten the default free trial from 14 → 7 days (founder 2026-07-19).
-- The marketing site (viditra.co) and the app join/setup pages now promise "one week
-- free"; start_trial() inserts a teacher_profiles row WITHOUT specifying trial_days, so
-- new signups inherit this column default. Changing the default is the single lever that
-- makes the enforced trial match the promise for all future signups.
--
-- Forward-only: pilot_20260711_wave0_profiles_layouts.sql is already applied and stays
-- immutable (default 14 in history). This migration supersedes it.
--
-- Scope: FUTURE signups only. Existing teacher rows keep whatever trial_days they were
-- given at signup (never retroactively shorten a promised trial). Pilot-professor rows
-- with the special trial_days = 90 term are untouched.
--
-- Run against the pilot project (jqbnmltsupnnbuvqgkix), NOT dev.

alter table public.teacher_profiles
  alter column trial_days set default 7;

comment on column public.teacher_profiles.trial_days is
  'Free-trial length in days. Default 7 (one week) since 2026-07-19. Founder sets a longer value for special terms (pilot professors: 90). Never retroactively shortened.';
