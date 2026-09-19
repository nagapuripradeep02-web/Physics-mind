-- Answer Book — run the chat-history prune every night (2026-09-19)
--
-- supabase_2026_09_19_answerbook_chat_history.sql WROTE the retention rules and
-- proved them; nothing CALLED them. A retention policy nothing invokes is not a
-- policy, it is a comment: chats would accumulate for ever and the 30-day
-- promise printed at the bottom of the student's own history list would be
-- false. This is the line that makes it true.
--
-- WHY pg_cron AND NOT A SCHEDULED EDGE FUNCTION
-- ---------------------------------------------
-- ab_prune_chats is pure SQL over two tables. A scheduled function would add a
-- deploy, a network hop and a second place to look when it stops running, to
-- invoke a statement the database can run by itself. pg_cron keeps the policy,
-- the implementation and the schedule in one place.
--
-- The alternative that was NOT taken: pruning opportunistically from the
-- chat_list endpoint. It needs no infrastructure, but it ties cleanup to
-- traffic — a device that stops asking is never swept, and the student who
-- opens their history on a busy evening pays for everyone else's deletions.
--
-- 21:30 UTC = 03:00 IST, the quietest hour for this book's students. Timing does
-- not affect WHAT is deleted: the 30 days are measured against retain_from as an
-- exact timestamp, not as calendar days. It only decides when a chat quietly
-- stops existing, which should not be while someone is reading it.
--
-- Arguments are passed explicitly even though they are the function's defaults,
-- so the policy is legible HERE — at the place a reader looks to find out what
-- the site actually promises — and can be changed without touching the function.
--
-- To see what it has been doing:
--   select start_time, status, return_message
--   from cron.job_run_details
--   where jobid = (select jobid from cron.job where jobname = 'answerbook-prune-chats')
--   order by start_time desc limit 14;

create extension if not exists pg_cron;

-- Re-running this migration must not leave two jobs pruning the same tables.
-- cron.schedule() on an existing NAME updates it in place on pg_cron 1.4+, but
-- this is explicit rather than version-dependent.
select cron.unschedule('answerbook-prune-chats')
where exists (select 1 from cron.job where jobname = 'answerbook-prune-chats');

select cron.schedule(
    'answerbook-prune-chats',
    '30 21 * * *',
    $$select ab_prune_chats(30, 30);$$
);
