-- Answer Book — Vidi chat history (2026-09-19)
--
-- WHAT THIS FIXES
-- ---------------
-- Until now a Vidi conversation existed only in page memory: `recentMsgs` in
-- notebook.js, capped at 12 turns, cleared on every question change and dead on
-- reload. The student's QUESTIONS were landing in ai_usage_log, but only as a
-- side effect of the cost ledger — Vidi's own replies were never stored at all
-- (the ledger keeps `reply_chars`, a length, because a cost row needs nothing
-- more). So half of every conversation was already gone, and the half we kept
-- carried session_id but never device_id, which meant it could not be joined to
-- the student's own progress, plan or events.
--
-- These two tables are the first place a whole conversation is kept, owned by
-- the device that had it. The ledger keeps doing its job unchanged; nothing
-- here replaces it, and ai_usage_log stays the rate-limit and spend source of
-- truth (answerbook-vidi-chat reads it for all four guards).
--
-- RETENTION, AND WHY SAVED CHATS SIT OUTSIDE IT (founder, 2026-09-19)
-- ------------------------------------------------------------------
-- Unsaved chats are kept to the NEWER of two limits: 30 days, and the newest 30
-- PER SUBJECT. A student bookmarks a chat to keep it past that, and a saved chat
-- is then exempt from BOTH — it never ages out, and it never occupies a slot in
-- the 30. The cap counts unsaved rows only.
--
-- PER SUBJECT, not per device (founder, 2026-09-19 — this REPLACES the per-device
-- cap written earlier the same day, and the "show every subject" decision that
-- went with it). A paper is how a student actually works: they revise Maths 2A
-- this week and Botany 2 next, and each paper is its own exam. A device-wide cap
-- let a fortnight on one paper silently evict everything they had asked about
-- another — work they would come back to only at revision time, when it is gone.
-- Subject here means the PAPER: mathematics_2a and mathematics_2b are two
-- subjects, not one, because they are two exams.
--
-- The 30-DAY rule is per chat by construction — a row ages on its own clock — so
-- it needs nothing to be "per subject"; it already is. Only the CAP had to move.
--
-- That exemption is the whole point and it is deliberate: if saving a chat
-- consumed one of the 30, then saving would silently evict a DIFFERENT chat the
-- student never chose to lose — an outcome nobody could predict from the button
-- they pressed. Saving must only ever add safety, never trade it.
--
-- UNSAVING RE-ENTERS THE LIST AS NEW (founder, 2026-09-19). The obvious reading
-- of the rule above is that unsaving a two-month-old chat deletes it on the next
-- prune. That is NOT what happens. Unsaving puts the chat back at the top of the
-- unsaved list, and the oldest unsaved chat drops off to make room — so the
-- student gets what they actually meant ("stop protecting this, treat it like
-- any other recent chat") instead of a deletion they never asked for.
--
-- That is what `retain_from` is for. The retention clock runs from it, and
-- unsaving resets it to now(); `last_at` keeps the TRUE time of the last message.
-- So an unsaved chat jumps to the TOP of the list — ordering and grouping both
-- read retain_from — while the date printed on that row still reads "3 Sep",
-- because the date comes from last_at. POSITION says how recently the student
-- reached for the chat; the DATE says when the conversation actually happened.
-- Both are true at once, and neither has to lie for the other to work.
--
-- Do not collapse the two columns back into one. Order by last_at and a rescued
-- chat sinks out of sight; label by retain_from and a two-week-old conversation
-- claims to be from today.
--
-- DELETING is separate, deliberate and immediate: a student who knows they do
-- not need a chat removes it themselves (ab_chat_delete), saved or not, without
-- waiting for any clock. It is the only irreversible action here, so the UI
-- confirms before calling it.
--
-- PRIVACY. Same posture as ab_devices/ab_progress/ab_plans: the device id is an
-- unguessable random UUID minted in the browser, not an identity. What is new
-- here is that these rows hold FREE TEXT a student wrote, which the other three
-- tables do not. Two things follow. (1) Nothing but the answerbook Edge
-- Functions on the service role may read them — RLS on, no policies, as below.
-- (2) A shared device is a shared history: identity is still the browser, so
-- two students on one phone see one list. Signed-in students are separated by
-- ab_account_devices; anonymous ones are not. That is a known limit, not an
-- oversight — do not widen access here to work around it.

-- ── 1. the conversations ────────────────────────────────────────────────────
-- One row per conversation. A conversation is scoped to ONE question, because
-- that is how Vidi is scoped: the thread is cleared when the student opens a
-- different question, so a new question is genuinely a new conversation. The
-- catalog/plan conversation has no question, hence the nullable column.
--
-- subject / unit / title are DENORMALISED from the bank on purpose: the history
-- list must render from one query, and the bank is a static build artifact the
-- database cannot join to. They are display copy, never a source of truth.
create table if not exists ab_chats (
    chat_id     uuid primary key default gen_random_uuid(),
    device_id   uuid not null references ab_devices(device_id) on delete cascade,
    -- null = the catalog conversation (study plan, onboarding), which belongs to
    -- the student rather than to any one question.
    question_id text,
    subject     text,
    unit        text,
    title       text,
    -- The bookmark. See the retention note above: this exempts the row from both
    -- limits, so it is the one column here a student changes deliberately.
    saved       boolean not null default false,
    started_at  timestamptz not null default now(),
    -- DISPLAY clock: when the last message was really written. This is the date
    -- PRINTED on the row, never the sort key, so a conversation never claims to
    -- be newer than it is.
    last_at     timestamptz not null default now(),
    -- RETENTION + ORDER clock: when this chat's 30 days start counting, and where
    -- it sits in the list. Normally the same moment as last_at; unsaving resets it
    -- to now(), which both rescues the chat and floats it to the top. See header.
    retain_from timestamptz not null default now(),
    msg_count   int not null default 0
);

-- Subject leads both indexes because it now leads every query: the list a student
-- sees is one subject's chats, and the cap counts within one subject. The list
-- adds `saved` because saved chats are grouped above the rest.
create index if not exists ab_chats_device_idx on ab_chats (device_id, subject, saved, retain_from desc);
create index if not exists ab_chats_prune_idx  on ab_chats (device_id, subject, retain_from desc) where not saved;

-- ── 2. the messages ─────────────────────────────────────────────────────────
-- Both sides, in full. The 500-character clip that the live history window
-- applies (index.ts:564) is a PROMPT-BUDGET decision and belongs at the point
-- the prompt is built — never here. Storage keeps what was actually said, so a
-- student rereading an old answer sees all of it.
create table if not exists ab_chat_messages (
    id         bigserial primary key,
    chat_id    uuid not null references ab_chats(chat_id) on delete cascade,
    role       text not null check (role in ('student', 'vidi')),
    body       text not null,
    created_at timestamptz not null default now()
);

create index if not exists ab_chat_messages_chat_idx on ab_chat_messages (chat_id, created_at);

-- RLS on, NO policies — identical posture to the P2 tables: every path in and
-- out goes through an answerbook Edge Function on the service role, and the page
-- ships no Supabase key at all. These rows hold student free text, so if a
-- policy is ever added it must key on device_id and stay deny-by-default.
alter table ab_chats         enable row level security;
alter table ab_chat_messages enable row level security;

comment on table ab_chats is
    'Answer Book: one Vidi conversation, owned by a device. saved = bookmarked, exempt from BOTH retention limits. 2026-09-19.';
comment on table ab_chat_messages is
    'Answer Book: every turn of a Vidi conversation, student and Vidi, stored in full. 2026-09-19.';
comment on column ab_chats.subject is
    'The PAPER, as the bank writes it (mathematics_2a, physics_2, botany_2 — 2a and 2b are two subjects, two exams). Not display copy: it scopes the list a student sees AND partitions the newest-30 cap, so one paper can never evict another. Null = the catalog/plan conversation, which forms its own partition.';
comment on column ab_chats.saved is
    'Bookmarked by the student. Exempt from the 30-day sweep AND from the newest-30 cap (the cap counts unsaved rows only).';
comment on column ab_chats.retain_from is
    'Retention clock AND list order. Unsaving sets it to now(), so the chat is rescued from the prune and floats to the top of the list, while the date shown on the row still comes from last_at. Never print this to a student.';
comment on column ab_chats.last_at is
    'The true time of the last message — the date PRINTED on a row. Never the sort key: ordering is retain_from, so a just-unsaved chat sits at the top still showing its real date.';

-- ── 3. appending a turn ─────────────────────────────────────────────────────
-- ONE call per exchange: the Edge Function has the student's text and Vidi's
-- reply in hand at the same moment (index.ts, right where it writes the ledger
-- row), so writing them together keeps the pair atomic — a thread can never end
-- up holding a question with no answer.
--
-- p_chat null starts a conversation; the caller passes back the returned id for
-- every later turn. The device must already exist (answerbook-sync mints it), so
-- a chat for an unknown device is refused rather than silently orphaned.
create or replace function ab_chat_append(
    p_device      uuid,
    p_chat        uuid,           -- null = start a new conversation
    p_question_id text,
    p_subject     text,
    p_unit        text,
    p_title       text,
    p_student     text,
    p_vidi        text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_chat   uuid;
    v_exists boolean;
begin
    if p_device is null then
        return jsonb_build_object('ok', false, 'error', 'device_required');
    end if;
    if coalesce(p_student, '') = '' then
        return jsonb_build_object('ok', false, 'error', 'empty_turn');
    end if;

    select true into v_exists from ab_devices where device_id = p_device;
    if v_exists is null then
        return jsonb_build_object('ok', false, 'error', 'unknown_device');
    end if;

    -- An unknown or foreign chat id starts a fresh conversation rather than
    -- failing: the client's id can be stale (a pruned chat, a cleared browser),
    -- and losing one turn is worse than losing the thread it belonged to. The
    -- device_id match is what stops a guessed id writing into someone else's.
    if p_chat is not null then
        select chat_id into v_chat
        from ab_chats
        where chat_id = p_chat and device_id = p_device;
    end if;

    if v_chat is null then
        insert into ab_chats (device_id, question_id, subject, unit, title)
        values (p_device, p_question_id, p_subject, p_unit, p_title)
        returning chat_id into v_chat;
    end if;

    insert into ab_chat_messages (chat_id, role, body)
    values (v_chat, 'student', p_student);

    -- Vidi's reply is optional only so a refusal or an outage still records what
    -- the student asked — that question is the more valuable half to us.
    if coalesce(p_vidi, '') <> '' then
        insert into ab_chat_messages (chat_id, role, body)
        values (v_chat, 'vidi', p_vidi);
    end if;

    -- Both clocks move on a real turn: the conversation genuinely happened now,
    -- so it is both the newest to display and the newest to keep. They only ever
    -- diverge on an unsave.
    update ab_chats
    set last_at     = now(),
        retain_from = now(),
        msg_count   = (select count(*) from ab_chat_messages where chat_id = v_chat),
        -- A title only ever fills in: the first turn of a conversation may arrive
        -- before the page knows the question (the catalog case), never after.
        title     = coalesce(title, p_title)
    where chat_id = v_chat;

    return jsonb_build_object('ok', true, 'chat_id', v_chat);
end;
$$;

-- ── 4. the bookmark ─────────────────────────────────────────────────────────
-- device_id is in the WHERE clause, not just the lookup: a guessed chat id must
-- not let one device bookmark — or unbookmark — another's conversation.
create or replace function ab_chat_save(
    p_device uuid,
    p_chat   uuid,
    p_saved  boolean
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_want boolean := coalesce(p_saved, false);
    v_hit  int;
begin
    -- UNSAVING restarts the retention clock (founder, 2026-09-19): the chat
    -- rejoins the unsaved list as its newest member, and the oldest unsaved chat
    -- drops off at the next prune to make room. Without this line, unsaving an
    -- old chat would delete it — which is not what the student pressed.
    --
    -- SAVING leaves retain_from alone: a saved row is exempt from both limits, so
    -- its clock is not read, and preserving it means a save-then-unsave with
    -- nothing in between does not quietly rescue a chat that was already stale.
    update ab_chats
    set saved       = v_want,
        retain_from = case when v_want then retain_from else now() end
    where chat_id = p_chat and device_id = p_device;

    get diagnostics v_hit = row_count;
    if v_hit = 0 then
        return jsonb_build_object('ok', false, 'error', 'not_found');
    end if;
    return jsonb_build_object('ok', true, 'saved', v_want);
end;
$$;

-- ── 4b. deleting a chat ─────────────────────────────────────────────────────
-- The student's own delete: immediate, irreversible, and allowed on a SAVED chat
-- too — "I know I do not need this" outranks "I once kept this". Messages go by
-- cascade. device_id is in the WHERE clause for the same reason as above: a
-- guessed chat id must not delete another device's conversation.
--
-- There is no soft delete and no undo. That is a deliberate choice for a table
-- holding a student's own words: when they say remove it, it is removed. The
-- confirm therefore belongs in the UI, before this is ever called.
create or replace function ab_chat_delete(
    p_device uuid,
    p_chat   uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_hit int;
begin
    delete from ab_chats
    where chat_id = p_chat and device_id = p_device;

    get diagnostics v_hit = row_count;
    if v_hit = 0 then
        return jsonb_build_object('ok', false, 'error', 'not_found');
    end if;
    return jsonb_build_object('ok', true, 'deleted', p_chat);
end;
$$;

-- ── 5. the prune ────────────────────────────────────────────────────────────
-- Run on a schedule (or from the nightly job). Both deletes carry `not saved`,
-- which is the founder's rule of 2026-09-19 expressed twice — once per limit.
-- Neither clause may be relaxed to "saved is null" or dropped for tidiness:
-- together they are the only thing standing between a bookmarked conversation
-- and deletion.
--
-- Messages go by cascade, so this never has to touch ab_chat_messages directly.
-- Caps are arguments, not literals, so policy stays with the caller.
create or replace function ab_prune_chats(
    p_days int default 30,
    p_keep int default 30
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_aged   int;
    v_capped int;
begin
    -- (a) too old. Ages on retain_from, never last_at — so a conversation the
    -- student reopened stays, and so does one they just unsaved, however old the
    -- messages in it are.
    delete from ab_chats
    where not saved
      and retain_from < now() - make_interval(days => p_days);
    get diagnostics v_aged = row_count;

    -- (b) too many. The row_number partitions by device AND SUBJECT, and counts
    -- UNSAVED rows only — so a device with 40 saved chats and 5 unsaved ones
    -- loses nothing, and a fortnight spent on Maths 2A cannot evict a single
    -- Botany 2 chat. Ranking by retain_from is what makes a just-unsaved chat
    -- arrive at rank 1 and push the oldest unsaved one in ITS OWN subject over
    -- the cap, rather than falling off itself.
    --
    -- A null subject (the catalog/plan conversation) forms its own partition, so
    -- those keep their own 30 and never compete with a paper's chats.
    delete from ab_chats c
    using (
        select chat_id,
               row_number() over (partition by device_id, subject order by retain_from desc) as rn
        from ab_chats
        where not saved
    ) r
    where c.chat_id = r.chat_id
      and r.rn > p_keep;
    get diagnostics v_capped = row_count;

    return jsonb_build_object('ok', true, 'aged_out', v_aged, 'over_cap', v_capped);
end;
$$;
