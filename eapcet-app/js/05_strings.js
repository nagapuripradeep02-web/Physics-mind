/* Every word a student reads, in one place. Rule 41: plain, literal English a
 * Class-11 student with textbook English reads without asking. The build runs
 * the Answer Book idiom scan over this file and refuses to build on a hit.
 *
 * Functions take the numbers they print so the sentence and the number can
 * never disagree. Nothing here is markdown; the page prints it as typed. */
var STR = {
  brand: 'Viditra',
  product: 'EAPCET Physics',
  tagline: 'Real past questions. Find where you go wrong.',

  door_title: 'Pick a subject',
  door_sub: 'Every question is a real TG EAPCET question from 2021 to 2025, with its official key.',
  door_physics: 'Physics',
  door_physics_sub: '30 chapters',
  door_chemistry: 'Chemistry',
  door_maths: 'Mathematics',
  door_soon: 'Being built',

  chapters_title: 'Physics',
  chapters_sub: 'Pick a chapter. Ten real questions, about twelve minutes. Then you see what kind of mistake you make.',
  share_line: function (pct, perExam) {
    return pct + '% of the physics questions asked · about ' + perExam + ' in every exam';
  },
  badge_untested: 'Not tested yet',
  badge_closed: 'Not enough verified questions yet',
  badge_never: 'Asked once in 26 exams. Not enough to test.',
  badge_weak: function (type, score, total) { return 'Weak: ' + STR.type_name[type] + ' (' + score + '/' + total + ')'; },
  badge_strong: function (type) { return 'Strong now: ' + STR.type_name[type]; },
  badge_score: function (score, total) { return 'Last run ' + score + '/' + total; },
  dev_open: 'Test build: unverified questions are shown. Do not give this build to a student.',

  run_head: function (chapter) { return 'Let’s find your mistakes and weaknesses in ' + chapter + '.'; },
  run_intro: 'Ten real past questions. Answer each one, then tell me what happened. There is no skipping.',
  run_resume: 'You left this run in the middle. It continues from where you stopped.',
  run_closed: 'This chapter is not ready yet. Its questions are still being verified.',
  run_progress: function (i, n) { return 'Question ' + i + ' of ' + n; },
  option_label: function (n) { return '(' + n + ')'; },

  correct: 'Correct.',
  wrong: function (picked, key) { return 'You picked (' + picked + '). The key says (' + key + ').'; },
  probe_correct_q: 'Were you sure?',
  probe_sure: 'I was sure',
  probe_guessed: 'I guessed',
  probe_wrong_q: 'What happened?',
  probe_concept: 'I did not know the concept',
  probe_calculation: 'I knew it, my calculation slipped',
  probe_application: 'I could not see how to apply it',
  probe_time: 'I guessed or ran out of time',

  type_name: { concept: 'concept', calculation: 'calculation', application: 'application', time: 'time' },
  bar_label: { concept: 'Concept', application: 'Application', calculation: 'Calculation', time: 'Guess or time' },

  result_title: 'Your result',
  result_score: function (score, total) { return score + ' out of ' + total + ' correct'; },
  result_guessed: function (n) { return n === 1 ? '1 of them was a guess' : n + ' of them were guesses'; },
  result_hist_title: 'Where the wrong answers came from',
  result_timing: function (sec, exam) {
    return 'You took about ' + sec + ' seconds a question. The exam gives ' + exam + '.';
  },
  weakness: {
    concept: function (ch) { return 'In ' + ch + ', most of your wrong answers came from not knowing the concept. Learn the concept first, then the questions.'; },
    calculation: function (ch) { return 'In ' + ch + ', you know the concepts. Your calculation slips. Work each step on paper until three in a row are right.'; },
    application: function (ch) { return 'In ' + ch + ', you know the concepts but could not see which one the question needed. Read each question for the idea it is testing.'; },
    time: function (ch) { return 'In ' + ch + ', you guessed or ran out of time on most wrong answers. Practise the same kind of question with a clock.'; }
  },
  no_weakness: 'Fewer than two wrong answers, so there is no weakness to name yet. Run it again for a second look.',
  all_correct: 'All ten correct. Run it again with fresh questions to be sure.',
  wrong_list_title: 'Your wrong answers',
  guessed_list_title: 'Check these too. You guessed right.',
  wrong_row: function (n, picked, key) { return 'Q' + n + ' — you picked (' + picked + '), the key says (' + key + ')'; },
  guessed_row: function (n, key) { return 'Q' + n + ' — the key is (' + key + ')'; },
  see_solution: 'See the worked solution',
  run_again: 'Run it again',
  back_chapters: 'All chapters',
  back_subjects: 'Subjects',

  /* the fix screen (paid) */
  fix_not_built: 'The worked solution for this question is not in this build yet.',
  fix_loading: 'Opening the worked solution…',
  fix_offline: 'Could not reach the server. Check your connection and try again.',
  fix_missing: 'This question has no verified worked solution yet. It will come with the next release.',
  fix_key: function (key) { return 'The official key is (' + key + ').'; },
  fix_you_picked: function (picked) { return 'You picked (' + picked + ').'; },
  fix_approach_title: 'The idea',
  fix_steps_title: 'The worked solution',
  fix_why: 'why?',
  fix_mistakes_title: 'Common mistakes on this question',
  fix_your_mistake: 'This one leads to the option you picked:',
  fix_mistake_option: function (n) { return 'leads to (' + n + ')'; },
  fix_cards_title: 'The concept, from the Answer Book',
  fix_try_again: 'Try a similar question',
  fix_try_another: 'Try another one',
  fix_sibling_head: 'A similar question from the same chapter.',
  fix_sibling_none: 'No unseen similar question is left in this chapter.',
  fix_sibling_solution: 'See its worked solution',
  fix_streak: function (n, need) { return n + ' of ' + need + ' correct and sure in a row.'; },
  fix_streak_reset: 'The streak starts again. Correct and sure, three in a row, makes this strong.',
  fix_streak_none: 'A guessed question does not count toward a streak. It still helps to see the working.',
  fix_strong: function (type) { return 'Strong now: ' + STR.type_name[type] + '. Three correct and sure in a row.'; },
  try_again: 'Try again',

  /* the chat panel */
  chat_title: 'Ask about this solution',
  chat_placeholder: 'Ask about a step, or write in Telugu',
  chat_send: 'Ask',
  chat_ai_tag: 'AI answer — check it against the worked solution above',
  chat_thinking: 'One moment…',
  chat_down: 'Could not get an answer just now. The worked solution above still works.',
  chat_offline: 'Questions to Vidi need a connection. The worked solution above still works.',
  chat_chip_why: 'Why this step?',
  chat_chip_mistake: 'Which mistake did I make?',
  chat_chip_idea: 'Explain the idea in one line',
  chat_ask_why: function (n) { return 'Why is step ' + n + ' done this way?'; },
  chat_ask_mistake: 'Which mistake did I most likely make, and where in my working?',
  chat_ask_idea: 'Explain the idea behind this question in one line.',

  /* the lock wall and the unlock page */
  lock_title: 'The worked solutions are part of the paid plan.',
  lock_body: 'Every chapter’s diagnosis stays free. The plan opens the worked solution for every question, the common mistakes, a similar question to retry, and Vidi to ask.',
  lock_price: function (inr, days) { return '₹' + inr + ' for ' + days + ' days'; },
  lock_price_soon: 'The plan is not open for payment yet.',
  lock_pay: function (inr) { return 'Unlock for ₹' + inr; },
  lock_signin: 'Already paid on another phone? Sign in',
  lock_back: 'Back to the result',
  lock_offline: 'Could not check your plan. Check your connection and try again.',
  unlock_title: 'Unlock the worked solutions',
  unlock_includes_title: 'What the plan opens',
  unlock_includes: [
    'The worked solution for every question in every open chapter, checked against the official key by two independent readers',
    'The common mistakes on each question, and which option each one leads to',
    'A similar past question to retry, until three in a row are right',
    'Vidi, to ask about any step, in English or Telugu'
  ],
  unlock_free_line: 'The ten-question run and the diagnosis stay free on every chapter.',
  unlock_paid_until: function (date) { return 'Your plan is active until ' + date + '.'; },
  unlock_signed_in: function (email) { return 'Signed in as ' + email + '. Your plan works on every phone you sign in on.'; },
  unlock_signin_note: 'Sign in with Google and the plan follows you to any phone or laptop. Paying without signing in works on this phone only.',
  unlock_signin: 'Sign in with Google',
  unlock_signout: 'Sign out',
  unlock_back: 'Back to the chapters',
  pay_opening: 'Opening the payment page…',
  pay_failed: 'Could not open the payment page just now. Please try again in a moment.',
  pay_waiting: 'Payment received? This page checks for it every few seconds.',
  pay_done: 'Your plan is active. Opening the worked solution…',

  team_marked: 'This phone is marked as a team phone. Its visits are not counted as a student.',
  team_unmarked: 'This phone is no longer marked as a team phone.'
};
