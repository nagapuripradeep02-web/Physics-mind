-- The Solutions-tab solver writes the working as an answer sheet (LaTeX lines,
-- founder 2026-09-11). Two additions, both re-runnable:
--   answer_tex  a question without options keeps its final value as written,
--               $-wrapped, so the page can typeset it;
--   ask         "Solve it" and "Explain each step" are two answers to one
--               question, so the ask is part of the cache key (the fingerprint
--               hashes it) and the similarity lookup filters on it.
alter table public.ep_solve_cache add column if not exists answer_tex text;
comment on column public.ep_solve_cache.answer_tex is 'The final value as the model wrote it, $-wrapped LaTeX; null when the question has options or the label is unsure.';

alter table public.ep_solve_cache add column if not exists ask text not null default 'solve';
comment on column public.ep_solve_cache.ask is 'solve | explain — the ask this working answers; part of the fingerprint.';

drop function if exists public.ep_solve_lookup(text, text, real);
create or replace function public.ep_solve_lookup(p_subject text, p_text text, p_min real default 0.85, p_ask text default 'solve')
returns table (fingerprint text, sim real)
language sql
security definer
set search_path = public
as $$
    select c.fingerprint, similarity(c.question_text, p_text) as sim
      from ep_solve_cache c
     where c.subject = p_subject
       and c.ask = p_ask
       and c.disputed = false
       and c.question_text % p_text
       and similarity(c.question_text, p_text) >= p_min
     order by sim desc
     limit 1
$$;
revoke all on function public.ep_solve_lookup(text, text, real, text) from public, anon, authenticated;
comment on function public.ep_solve_lookup(text, text, real, text) is 'EAPCET finder: the nearest cached transcript of the same subject and ask by trigram similarity (default 0.85). ep-solve then requires every number in the question to match before it serves the cached answer.';
