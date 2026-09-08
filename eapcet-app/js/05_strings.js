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

  fix_not_built: 'The worked solution for this question is not in this build yet.',

  team_marked: 'This phone is marked as a team phone. Its visits are not counted as a student.',
  team_unmarked: 'This phone is no longer marked as a team phone.'
};
