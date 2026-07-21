-- pilot_feedback v2 — per-state feedback targeting (feedback widget "About" select).
-- APPLY TO THE PILOT PROJECT (physicsmind-pilot / jqbnmltsupnnbuvqgkix), NOT the dev project.
-- state_id becomes the teacher's explicit selection; current_state_id keeps the
-- ambient auto-captured state so the old meaning isn't lost.

alter table pilot_feedback add column current_state_id text;
comment on column pilot_feedback.state_id is 'teacher-selected target state (null = whole simulation)';
comment on column pilot_feedback.current_state_id is 'state on screen at send time (auto-captured)';
