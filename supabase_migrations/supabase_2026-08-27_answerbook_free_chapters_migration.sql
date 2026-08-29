-- Answer Book: FOUR fixed free chapters, one per subject (founder, 2026-08-27).
--
-- Supersedes the P3 model of one free chapter per DEVICE, claimed by an explicit
-- tap (ab_claim_free + the ab_entitlements_one_free partial unique index). That
-- let a student unlock any single chapter anywhere in the book; the launch model
-- is the opposite — the SAME four chapters are open to everyone, chosen because
-- each one shows what the product actually does.
--
-- Chosen on the data: of the first five chapters of each subject, these are the
-- only ones carrying long answers, short answers AND live-drawn diagrams
-- together, so a student sampling any subject sees a full-length answer written
-- out and a figure draw itself.
--
--   physics-4         Motion in a Plane        29 Qs · 2 LAQ · 10 SAQ ·  6 diagrams
--   chemistry-3       Chemical Bonding         25 Qs · 3 LAQ · 12 SAQ ·  7 diagrams
--   mathematics-4     Addition of Vectors      21 Qs · 0 LAQ · 10 SAQ ·  3 diagrams
--   mathematics_1b-3  The Straight Line        44 Qs · 12 LAQ · 11 SAQ · 12 diagrams
--
-- mathematics-4 carries no long answer — a deliberate founder choice over
-- mathematics-5 (Product of Vectors, 8 LAQ but only 2 diagrams). If the Maths-1A
-- sample ever reads thin, mathematics-5 is the swap and this is the only place
-- that has to change.
--
-- ab_claim_free and ab_entitlements_one_free are deliberately LEFT IN PLACE and
-- unused — dormant, not dropped, so the per-device free slot can come back
-- without a rebuild.

alter table ab_content
    add column if not exists free boolean not null default false;

comment on column ab_content.free is
    'Answer Book: this chapter is free for EVERY device, no entitlement row needed. Four of them, one per subject (2026-08-27).';

-- Set exactly these four, and clear any other row, so re-running this migration
-- is the whole truth rather than an addition to whatever was there before.
update ab_content
   set free = (unit_key in ('physics-4', 'chemistry-3', 'mathematics-4', 'mathematics_1b-3'));

-- A free chapter that does not exist would be silently un-free, and the student
-- would meet a paywall on the one chapter we promised. Fail loudly instead.
do $$
declare
    v_missing text;
begin
    select string_agg(k, ', ')
      into v_missing
      from unnest(array['physics-4', 'chemistry-3', 'mathematics-4', 'mathematics_1b-3']) as k
     where not exists (select 1 from ab_content c where c.unit_key = k);
    if v_missing is not null then
        raise exception 'ab_content is missing free chapter(s): % — run content:push first', v_missing;
    end if;
end $$;
