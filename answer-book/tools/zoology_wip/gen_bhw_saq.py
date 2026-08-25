# -*- coding: utf-8 -*-
"""Unit 6 (bhw) SAQ cards — book SAQ chapter 9 (qno 43-49) + Star Q 183-187."""
from bhwlib import *

W = []

# ── 43 ───────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_tobacco_adverse_effects", "SAQ", "43", "SAQ 43",
    "What are the adverse effects of tobacco?",
    "2014 ap:2016 ts:2017 ts:2019 ap:2019 ts:2022",
    [{"label": "How tobacco is used", "marks": 1},
     {"label": "Effect on blood and heart", "marks": 1},
     {"label": "Diseases caused", "marks": 1},
     {"label": "Cancers", "marks": 1}],
    [
        step("s1_use", "text", "How tobacco is used", 1, mark_note="Forms",
             lines=T("Tobacco is used in three ways. It is smoked, it is "
                     "chewed as gutkha, and it is taken as snuff.",
                     "Tobacco contains nicotine, which is an alkaloid."),
             why="The harm changes with the way tobacco enters the body, so naming the three forms first sets up the different effects described in the rest of the answer.",
             cm=["Writing only about smoking. Chewing and snuff are two more forms and carry marks.",
                 "Leaving out nicotine. It is the substance behind most of the effects."],
             tip="Three ways in: smoked, chewed, snuffed. One substance behind them: nicotine.",
             margin="Two short lines. Name all three forms and the alkaloid."),
        step("s2_blood", "text", "Effect on blood and heart", 1, mark_note="Blood",
             lines=T("Smoking increases the carbon monoxide level in the "
                     "blood and reduces the oxygen level, so less oxygen "
                     "reaches the tissues.",
                     "Nicotine stimulates the adrenal gland to release "
                     "adrenaline and noradrenaline. These hormones raise "
                     "the blood pressure and the heart rate."),
             why="Two different substances do two different things here — carbon monoxide changes what the blood carries, nicotine changes what the heart does — and the examiner expects both routes.",
             cm=["Writing that nicotine reduces the oxygen. Carbon monoxide does that.",
                 "Naming the hormones without saying what they do. State the rise in blood pressure and heart rate."],
             tip="Carbon monoxide works on the blood, nicotine works through the adrenal gland on the heart.",
             margin="Two lines, one for each substance. Keep them separate."),
        step("s3_diseases", "text", "Diseases caused", 1, mark_note="Diseases",
             lines=T("Long use of tobacco causes bronchitis and emphysema "
                     "in the lungs.",
                     "It also causes coronary heart disease and gastric "
                     "ulcers."),
             why="The diseases fall into two sets, the breathing set and the heart and stomach set, and grouping them that way makes all four easy to recall in order.",
             cm=["Writing 'lung problems' instead of naming bronchitis and emphysema.",
                 "Leaving out the gastric ulcer, which is not a breathing disease and is often forgotten."],
             tip="Two in the chest, two below it: bronchitis and emphysema, then heart disease and gastric ulcer.",
             margin="Four named diseases in two short lines. Names carry the mark, not descriptions."),
        step("s4_cancer", "boxed_final", "Cancers", 1, mark_note="Cancers",
             lines=B("Cancer of throat, lungs and urinary bladder",
                     "Tobacco increases the chance of cancer of the throat, "
                     "of the lungs and of the urinary bladder.",
                     "The urinary bladder is affected because the harmful "
                     "substances of tobacco leave the body in the urine."),
             why="Three cancers are asked and the third one surprises students, so the reason it happens — the waste leaves through the urine — is worth one line.",
             cm=["Naming only lung cancer. Three sites are expected.",
                 "Writing that tobacco causes cancer of the liver. The syllabus names throat, lungs and urinary bladder."],
             tip="Where the smoke goes and where the waste goes: throat and lungs, then urinary bladder.",
             margin="Three named sites in a box, then one line on the bladder. This is the closing mark."),
    ],
    "This is a list question and the marks follow the list, so write named items in short lines and never a single long paragraph."))

# ── 44 ───────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_adolescence_vulnerable", "SAQ", "43", "SAQ 44",
    "Why is adolescence considered a vulnerable phase?",
    "ap:2015 ap:2018 ap:2022",
    [{"label": "What adolescence is", "marks": 1},
     {"label": "Changes in this phase", "marks": 2},
     {"label": "Why it is vulnerable", "marks": 1}],
    [
        step("s1_what", "text", "What adolescence is", 1, mark_note="Identity",
             lines=T("Adolescence is the period of life between about 12 "
                     "and 18 years of age.",
                     "It is the bridge between childhood and adulthood, and "
                     "during it a child becomes mature."),
             why="The answer needs a fixed span before it can argue anything, and the phrase 'bridge between childhood and adulthood' is the sentence the examiner looks for first.",
             cm=["Giving the wrong age span. The syllabus gives about 12 to 18 years.",
                 "Starting with the drugs. Define the phase first."],
             tip="Twelve to eighteen: the bridge from child to adult.",
             margin="Two lines. The age span and the word bridge carry this mark."),
        step("s2_changes", "text", "Changes in this phase", 2, mark_note="Changes",
             lines=T("Many biological changes take place in this period. "
                     "The body grows quickly and the reproductive organs "
                     "become mature.",
                     "Many behavioural changes take place at the same time. "
                     "The adolescent wants an identity of his or her own, "
                     "is curious about new things, and is strongly "
                     "influenced by friends of the same age.",
                     "The mind and the body are therefore changing together "
                     "over a short period."),
             why="Vulnerability comes from two kinds of change happening at once, so the answer must show the body changes and the behaviour changes side by side rather than one alone.",
             cm=["Writing only about the body. The behavioural changes carry half of this mark.",
                 "Writing that adolescents are careless. Describe the changes, not a judgement of the person."],
             tip="Two changes at once: the body matures and the behaviour changes in the same few years.",
             margin="Two groups of change, one short block each. This is the biggest part: two marks."),
        step("s3_why", "boxed_final", "Why it is vulnerable", 1, mark_note="Conclusion",
             lines=B("Rapid mental and psychological change",
                     "Because so much mental and psychological development "
                     "happens in this short period, an adolescent can be "
                     "led easily into the use of tobacco, drugs and alcohol.",
                     "For this reason adolescence is said to be a "
                     "vulnerable phase in the life of an individual."),
             why="The question word is 'why', so the last step has to close the argument: fast change plus outside influence is what makes this phase easy to damage.",
             cm=["Ending without using the word vulnerable.",
                 "Blaming the adolescent. The answer explains the phase, not the person."],
             tip="Fast change plus strong influence equals a phase that is easy to damage.",
             margin="One closing sentence that uses the word vulnerable. Do not add new facts here."),
    ],
    "The examiner marks the closing sentence: the answer must end by saying WHY the phase is vulnerable, not merely describe adolescence."))

# ── 45 ───────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_prevention_tda_abuse", "SAQ", "43", "SAQ 45",
    "'Prevention is better than cure'. Justify with regard to TDA abuse.",
    "ts:2015 ts:2016 ts:2018 ap:2018",
    [{"label": "What TDA means", "marks": 1},
     {"label": "Home and school", "marks": 1},
     {"label": "Peers and education", "marks": 1},
     {"label": "Professional help", "marks": 1}],
    [
        step("s1_tda", "text", "What TDA means", 1, mark_note="Meaning",
             lines=T("TDA means tobacco, drugs and alcohol.",
                     "Once a person becomes addicted to any of these, the "
                     "cure is long, costly and often incomplete.",
                     "Stopping the habit before it starts is therefore "
                     "easier than curing it, so the saying 'prevention is "
                     "better than cure' holds true for TDA abuse."),
             why="The saying only becomes an argument once the difficulty of the cure is stated, so the opening step must say why curing an addiction is hard.",
             cm=["Writing only the full form of TDA. The reason prevention is better is part of this mark.",
                 "Listing the measures here. They belong in the steps that follow."],
             tip="TDA is tobacco, drugs and alcohol. Cure is slow and uncertain, so prevention wins.",
             margin="Full form first, then two lines of justification."),
        step("s2_home", "text", "Home and school", 1, mark_note="Measure 1",
             lines=T("Avoid undue parental pressure. Every child has its "
                     "own choices and capacity, and parents should not "
                     "force a child to perform beyond it or compare the "
                     "child with others in studies and games.",
                     "Parents and teachers have a responsibility to advise "
                     "and counsel a child who is likely to fall into TDA "
                     "abuse."),
             why="Most first use begins at home or at school, so the first measures name the two adults closest to the child and what each one should change.",
             cm=["Writing 'parents should take care' with no measure named. Name the pressure and the counselling.",
                 "Writing that the child should be punished. Counselling, not punishment, is the measure."],
             tip="The two nearest adults: parents ease the pressure, teachers give the counselling.",
             margin="Two named measures, one short block each."),
        step("s3_peers", "text", "Peers and education", 1, mark_note="Measure 2",
             lines=T("Seek help from peers. If classmates see someone "
                     "falling into TDA abuse, they should bring it to the "
                     "notice of the parents or the teachers.",
                     "Education and counselling must be continuous. "
                     "Children should be taught about TDA at every level in "
                     "the form of regular lessons."),
             why="Friends usually notice the change first, and steady teaching keeps the message going, so these two measures cover the gap the adults at home cannot see.",
             cm=["Writing that friends should keep the matter secret. They should inform an adult.",
                 "Treating education as a single talk. The measure is continuous teaching."],
             tip="Friends report early, lessons keep repeating: both work before the habit forms.",
             margin="Two more named measures. Keep each to two lines."),
        step("s4_help", "boxed_final", "Professional help", 1, mark_note="Measure 3",
             lines=B("Psychologists, psychiatrists, rehabilitation",
                     "Seek professional and medical help. Qualified "
                     "psychologists and psychiatrists, and de-addiction and "
                     "rehabilitation programmes, are available.",
                     "With this help a person can come out of the habit and "
                     "return to a normal life."),
             why="The last measure is the one used when prevention has already failed, and naming the trained people shows the student knows help exists beyond the family.",
             cm=["Writing 'go to a doctor' with nobody named. Name the psychologist, the psychiatrist and the programmes.",
                 "Ending without saying the person can recover."],
             tip="When prevention fails, trained help follows: psychologist, psychiatrist, rehabilitation.",
             margin="Name the three kinds of help in the box, then one closing line."),
    ],
    "Five named measures are printed in the book and the marks follow the count, so write them as separate named points rather than a paragraph."))

# ── 46 ───────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_hypertrophy_hyperplasia", "SAQ", "44", "SAQ 46",
    "Distinguish between hypertrophy and hyperplasia with an example for each.",
    "ap:2020 ts:2020",
    [{"label": "Hypertrophy with example", "marks": 2},
     {"label": "Hyperplasia with example", "marks": 2}],
    [
        step("s1_hypertrophy", "text", "Hypertrophy", 2, mark_note="Hypertrophy",
             lines=T("Hypertrophy: some parasites cause an abnormal "
                     "increase in the SIZE of the host cell. The cell grows "
                     "until it finally ruptures.",
                     "The number of cells does not change; each cell simply "
                     "becomes bigger.",
                     "Example: Plasmodium inside a red blood cell makes the "
                     "cell grow to almost double its normal size, and the "
                     "cell finally bursts."),
             why="Hypertrophy is a change in size only, so the answer states that the cell number stays the same — that single line is what separates it from hyperplasia.",
             cm=["Writing that the number of cells increases. That is hyperplasia.",
                 "Giving Fasciola as the example. Fasciola is the hyperplasia example."],
             tip="Trophy means growth of one cell: hypertrophy is a bigger cell, same number.",
             margin="Definition, the size-not-number line, then the example. Two marks, so give all three."),
        step("s2_hyperplasia", "boxed_final", "Hyperplasia", 2, mark_note="Hyperplasia",
             lines=B("Size increases vs number increases",
                     "Hyperplasia: some parasites cause an increase in the "
                     "size of an organ by increasing the NUMBER of its "
                     "cells. This causes inconvenience or death to the host.",
                     "Example: Fasciola hepatica lives in the bile ducts of "
                     "sheep. It increases the number of cells of the duct "
                     "wall, and the thickened wall blocks the passage of "
                     "bile."),
             why="Hyperplasia is a change in number, and the harm comes from the extra cells thickening a wall and blocking a passage, which is why the bile duct is the example that is set.",
             cm=["Writing that the cells become larger. In hyperplasia they become more numerous.",
                 "Naming Fasciola without saying what is blocked. The blocked bile duct is the harm."],
             tip="Plasia means forming: hyperplasia is more cells, hypertrophy is bigger cells.",
             margin="Definition, then the example with the blocked duct. Two marks."),
    ],
    "A 'distinguish' question is marked on the contrast, so use the words SIZE and NUMBER plainly in the two halves."))

# ── 47 ───────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_opioids", "SAQ", "44", "SAQ 47",
    "Write short notes on Opioids.",
    "",
    [{"label": "What opioids are", "marks": 1},
     {"label": "Morphine", "marks": 2},
     {"label": "Heroin", "marks": 1}],
    [
        step("s1_what", "text", "What opioids are", 1, mark_note="Identity",
             lines=T("Opioids are drugs obtained from the poppy plant, "
                     "Papaver somniferum.",
                     "They bind to specific receptors of the central "
                     "nervous system and of the alimentary canal."),
             why="Both facts are needed before the two named drugs: one plant is the source of the whole group, and the receptors explain why the group acts on the brain and the gut.",
             cm=["Naming the wrong plant. Opioids come from Papaver somniferum, not from Cannabis sativa.",
                 "Leaving out the receptors. The binding site is part of the definition."],
             tip="One plant, two receptor sites: poppy, then brain and gut.",
             margin="Two lines: the source plant and the receptors. Then take the two drugs one at a time."),
        step("s2_morphine", "text", "Morphine", 2, mark_note="Morphine",
             lines=T("Morphine is produced from the dried latex of the "
                     "unripe fruits of the poppy plant.",
                     "It is a colourless crystal or a white crystalline "
                     "powder. It is taken orally or by injection.",
                     "It is an effective sedative and pain killer, so it is "
                     "used for surgery patients and for people who suffer "
                     "from painful illness."),
             why="Morphine carries the larger part of this answer because it has a medical use, so its source, its form, how it is taken and what it is used for are all marked.",
             cm=["Writing that morphine is made from heroin. Heroin is made FROM morphine.",
                 "Leaving out the medical use. The sedative and pain-killing use is part of the mark."],
             tip="Morphine is the medicine of the group: sedative and pain killer from the dried latex.",
             margin="Four facts in three lines: source, form, route, use. Two marks sit here."),
        step("s3_heroin", "boxed_final", "Heroin", 1, mark_note="Heroin",
             lines=B("Heroin = diacetyl morphine, also called smack",
                     "Heroin is produced from morphine by acetylation. "
                     "Chemically it is diacetyl morphine.",
                     "It is a white bitter powder and is taken by snorting "
                     "or by injection.",
                     "Heroin depresses the body and slows down the body "
                     "functions."),
             why="Heroin is morphine changed by one chemical step, so writing that step is what shows the two drugs belong to one family rather than being unrelated.",
             cm=["Writing that heroin comes straight from the poppy plant. It is made from morphine.",
                 "Writing that heroin excites the body. It depresses and slows the body functions."],
             tip="Add acetyl to morphine and you get heroin, the street name of which is smack.",
             margin="The chemical name in the box, then three short lines. One mark."),
    ],
    "'Short notes' still means named headings, so write Morphine and Heroin as separate labelled points."))

# ── 48 ───────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_cannabinoids", "SAQ", "44", "SAQ 48",
    "Write short notes on Cannabinoids.",
    "",
    [{"label": "Source", "marks": 1},
     {"label": "Products", "marks": 1},
     {"label": "How they are taken", "marks": 1},
     {"label": "Effect on the body", "marks": 1}],
    [
        step("s1_source", "text", "Source", 1, mark_note="Source",
             lines=T("Cannabinoids are drugs obtained from the hemp plant, "
                     "Cannabis sativa.",
                     "The flower tips, the leaves and the resin of the "
                     "plant are the parts used."),
             why="The parts of the plant used are what decide which product is made, so naming the flower tips, leaves and resin sets up the list of products in the next step.",
             cm=["Naming Papaver somniferum. That plant gives the opioids, not the cannabinoids.",
                 "Writing that the roots are used. The flower tips, leaves and resin are used."],
             tip="One plant, three parts: flower tips, leaves and resin of Cannabis sativa.",
             margin="Two lines: the plant name and the parts used."),
        step("s2_products", "text", "Products", 1, mark_note="Products",
             lines=T("These parts are used in different combinations to "
                     "produce marijuana, hashish, charas and ganja."),
             why="Four named products come from one plant, and the list itself is the mark, so the names must be written out rather than summed up as 'various drugs'.",
             cm=["Writing 'various drugs are produced' with no names. The four names carry the mark.",
                 "Adding cocaine or heroin to this list. They come from other plants."],
             tip="Four from one plant: marijuana, hashish, charas, ganja.",
             margin="One line with all four names. Nothing else is needed here."),
        step("s3_taken", "text", "How they are taken", 1, mark_note="Route",
             lines=T("Cannabinoids are taken orally or by inhalation.",
                     "Some sportspersons take these drugs to change their "
                     "performance, which is why they are banned in sports "
                     "and games."),
             why="The route of entry and the misuse in sport are two separate asked facts, and the ban follows directly from the misuse.",
             cm=["Writing that they are only smoked. They are taken orally as well.",
                 "Leaving out the ban in sports, which is a commonly asked line."],
             tip="Two routes in, one reason for the ban: oral or inhaled, misused in sport.",
             margin="Two lines: the routes, then the misuse and the ban."),
        step("s4_effect", "boxed_final", "Effect on the body", 1, mark_note="Effect",
             lines=B("Cardiovascular system is affected",
                     "Cannabinoids act on the central nervous system.",
                     "The cardiovascular system is affected, so the heart "
                     "and the blood vessels are damaged by regular use."),
             why="The syllabus names the cardiovascular system as the target, and that single named system is the closing mark of this answer.",
             cm=["Writing that cannabinoids act like testosterone. That is the anabolic steroids.",
                 "Writing only 'they are harmful'. Name the system affected."],
             tip="Cannabinoids hit the nerves and the heart, not the muscles.",
             margin="Name the system in the box, then one line. This is the closing mark."),
    ],
    "The named products and the named system carry the marks here; general statements about harm score nothing."))

# ── 49 ───────────────────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_entamoeba_pathogenicity", "SAQ", "44", "SAQ 49",
    "Write a short note on the pathogenicity of Entamoeba histolytica.",
    "",
    [{"label": "Ulcers in the intestine", "marks": 1},
     {"label": "Amoebic dysentery", "marks": 1},
     {"label": "Extra-intestinal amoebiasis", "marks": 1},
     {"label": "Carriers", "marks": 1}],
    [
        step("s1_ulcers", "text", "Ulcers in the intestine", 1, mark_note="Ulcers",
             lines=T("The trophozoites of Entamoeba histolytica live in the "
                     "mucous and submucous layers of the large intestine.",
                     "They secrete the enzyme histolysin, which digests the "
                     "tissue of the intestinal wall and forms ulcers."),
             why="Every later symptom starts at the ulcer, so the answer opens with the enzyme that makes it — the damage is chemical, not mechanical.",
             cm=["Writing that the parasite eats the intestinal wall. It secretes histolysin, which digests the tissue.",
                 "Naming the small intestine. The ulcers form in the large intestine."],
             tip="Histolysin means tissue-dissolving, and that is what makes the ulcer.",
             margin="Two lines: where it lives, then the enzyme and the ulcer."),
        step("s2_dysentery", "text", "Amoebic dysentery", 1, mark_note="Dysentery",
             lines=T("The ulcers ooze blood cells, cellular debris and "
                     "bacteria into the gut.",
                     "The patient passes stools with blood and mucus, and "
                     "has bowel irregularity and abdominal pain.",
                     "This condition is called intestinal amoebiasis or "
                     "amoebic dysentery."),
             why="The symptoms follow straight from the ulcer, so writing them in that order shows cause and effect instead of a memorised list.",
             cm=["Calling the condition diarrhoea. Blood and mucus in the stool make it dysentery.",
                 "Leaving out the name of the condition. Both names carry the mark."],
             tip="Ulcer leaks, so the stool carries blood and mucus: that is amoebic dysentery.",
             margin="What leaks, what the patient passes, then the name. Three short lines."),
        step("s3_extra", "text", "Extra-intestinal amoebiasis", 1, mark_note="Spread",
             lines=T("Sometimes the trophozoites enter the blood stream "
                     "from the ulcers.",
                     "They reach the liver, the lungs, the heart, the "
                     "kidneys and the brain, and cause abscesses in those "
                     "organs.",
                     "This is called extra-intestinal or secondary "
                     "amoebiasis, and it leads to severe conditions."),
             why="The parasite becomes dangerous only when it leaves the gut, so the route through the blood and the organs it reaches are marked separately from the dysentery.",
             cm=["Writing that the parasite crawls to the liver. It travels in the blood stream.",
                 "Naming only the liver. Five organs are listed in the syllabus."],
             tip="Out of the gut and into the blood: liver, lungs, heart, kidneys, brain.",
             margin="The route, the organs, then the name. Three lines."),
        step("s4_carriers", "boxed_final", "Carriers", 1, mark_note="Carriers",
             lines=B("Carriers pass cysts without symptoms",
                     "Some infected people show no symptoms at all.",
                     "Their stools still contain the tetranucleate cysts, "
                     "so they spread the infection to others.",
                     "Such people are called carriers or asymptomatic cyst "
                     "passers."),
             why="A carrier spreads the disease while looking healthy, which is why the last mark is kept for this point rather than for another symptom.",
             cm=["Writing that carriers are mildly ill. A carrier shows no symptoms.",
                 "Leaving out the cysts. The cyst in the stool is what makes a carrier infectious."],
             tip="No symptoms, but cysts in the stool: that is a carrier.",
             margin="The term in the box, then three short lines. Closing mark."),
    ],
    "Pathogenicity means the damage done, so the answer must move from the ulcer to the dysentery to the spread — a description of the parasite scores nothing here."))

# ── 183 (Star Q, SAQ) ────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_parasitic_adaptations", "SAQ", "66", "Star Q 183",
    "What is the need for parasites to develop special adaptations? Mention some special adaptations developed by the parasites.",
    "ts:2019",
    [{"label": "The need", "marks": 1},
     {"label": "Attachment and covering", "marks": 1},
     {"label": "Reproduction and lost organs", "marks": 1},
     {"label": "Life cycles and cysts", "marks": 1}],
    [
        step("s1_need", "text", "The need", 1, mark_note="Need",
             lines=T("A parasite depends on its host for food and for "
                     "shelter.",
                     "The host resists the parasite with its defence system "
                     "and with its digestive juices.",
                     "Parasites have therefore evolved special adaptations "
                     "that let them stay in the host, resist its defences "
                     "and reach a new host."),
             why="The adaptations only make sense once the pressure is named, so the first step states the two problems a parasite meets — the host's defence system and its digestive juices.",
             cm=["Writing that the parasite needs adaptations to move about. It needs them to stay in the host and resist its defences.",
                 "Leaving out the host's defence system, which is the reason the adaptations exist."],
             tip="Two problems for a parasite: the host's defences and the host's digestive juices.",
             margin="Three short lines. State the need before listing anything."),
        step("s2_attach", "text", "Attachment and covering", 1, mark_note="Adaptation 1",
             lines=T("Organs of attachment are developed, such as hooks, "
                     "suckers and the rostellum. They hold the parasite in "
                     "place inside the host.",
                     "A tough protective covering is developed. Ascaris has "
                     "a thick cuticle and Fasciola has a tegument, which "
                     "withstand the digestive juices of the host.",
                     "Some parasites produce anti-enzymes that neutralise "
                     "the digestive juices. Example: Taenia."),
             why="These three adaptations answer the same problem, staying alive inside a gut that digests food, so they are grouped together with a named example each.",
             cm=["Naming the hooks and suckers without saying what they do.",
                 "Giving no example. Every named adaptation should carry an example."],
             tip="Hold on, cover up, cancel out: hooks and suckers, cuticle and tegument, anti-enzymes.",
             margin="Three named adaptations with an example each. Two lines is enough for each."),
        step("s3_repro", "text", "Reproduction and lost organs", 1, mark_note="Adaptation 2",
             lines=T("A very high reproductive capacity is developed, "
                     "because only a few of the young reach a new host. "
                     "Taenia has 700 to 900 proglottids, and each one "
                     "produces about 3500 eggs.",
                     "Sense organs and organs that are no longer used are "
                     "lost, because a parasite inside a host does not need "
                     "them."),
             why="A parasite loses what it does not use and multiplies what it does, so these two adaptations are opposite sides of the same pressure and are easiest to remember as a pair.",
             cm=["Giving the numbers without the name. The Taenia count is the marked example.",
                 "Writing that the parasite grows more sense organs. Unused organs are lost."],
             tip="More eggs, fewer organs: reproduction goes up, unused structures go away.",
             margin="Two adaptations, one with the Taenia numbers. Two short blocks."),
        step("s4_cycles", "boxed_final", "Life cycles and cysts", 1, mark_note="Adaptation 3",
             lines=B("Complex cycles, resistant cysts, changing antigens",
                     "Complex life cycles with many larval stages are "
                     "developed, so the parasite can pass through more than "
                     "one host. Example: Fasciola.",
                     "Resistant cysts are formed, which survive outside the "
                     "host until a new host takes them in. Example: "
                     "Entamoeba.",
                     "The surface antigens are changed, so the host's "
                     "immune response and vaccines become less effective. "
                     "Example: Plasmodium and HIV."),
             why="The last three adaptations all deal with reaching a NEW host and surviving the immune response, which is the second half of the problem stated at the start.",
             cm=["Writing that the parasite hides from vaccines. Write what happens: the surface antigens change.",
                 "Naming the adaptations without examples. Fasciola, Entamoeba and Plasmodium are the named ones."],
             tip="Getting to the next host: many stages, a resistant cyst, and a changing coat.",
             margin="Three named adaptations in the box, each with its example. Closing mark."),
    ],
    "The question has two halves and both are marked, so state the need in full before starting the list of adaptations."))

# ── 184 (Star Q, SAQ) ────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_addiction_dependence", "SAQ", "66", "Star Q 184",
    "Distinguish between addiction and dependence.",
    "ts:2017",
    [{"label": "Addiction", "marks": 2}, {"label": "Dependence", "marks": 2}],
    [
        step("s1_addiction", "text", "Addiction", 2, mark_note="Addiction",
             lines=T("Addiction is a psychological attachment to certain "
                     "effects of a drug, such as euphoria.",
                     "Tobacco, drugs and alcohol are addictive by nature, "
                     "and repeated use raises the tolerance level of the "
                     "receptors in the body.",
                     "The receptors then respond only to a higher dose, so "
                     "the person takes more and more of the drug. Even a "
                     "single use of tobacco, drugs or alcohol can be the "
                     "start of addiction.",
                     "Without guidance or counselling a person moves from "
                     "addiction to dependence."),
             why="Addiction sits in the mind and is driven by rising tolerance, so the answer follows one chain: attachment, tolerance, higher dose, more intake.",
             cm=["Writing that addiction is a physical need. That is dependence.",
                 "Leaving out tolerance. The rising tolerance is what forces the dose up."],
             tip="Addiction is in the mind: the person wants the effect and needs a bigger dose each time.",
             margin="One chain in four short lines: attachment, tolerance, higher dose, dependence."),
        step("s2_dependence", "boxed_final", "Dependence", 2, mark_note="Dependence",
             lines=B("Addiction is mental, dependence is bodily",
                     "Dependence is the tendency of the BODY to show a "
                     "characteristic unpleasant condition, called the "
                     "withdrawal syndrome, when the regular dose of the "
                     "drug or alcohol is stopped suddenly.",
                     "The withdrawal syndrome shows anxiety, shakiness "
                     "(tremors), nausea and sweating.",
                     "These signs are relieved when the drug is taken "
                     "again, so the person continues to use it.",
                     "Dependence leads a patient to ignore all social "
                     "norms."),
             why="Dependence is tested by stopping the drug: the body reacts, and that reaction is what proves the need is physical rather than mental.",
             cm=["Writing that dependence is the wish to feel good. That is addiction.",
                 "Naming the withdrawal syndrome without listing its signs. The four signs are marked."],
             tip="Stop the drug and see: if the body reacts, that is dependence.",
             margin="Definition, the four signs, then the relief and the result. Two marks."),
    ],
    "The contrast is mind against body — say psychological for addiction and body for dependence, and list the withdrawal signs."))

# ── 185 (Star Q, SAQ) ────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_sporozoite_structure", "SAQ", "67", "Star Q 185",
    "Describe the structure of sporozoite of Plasmodium vivax.",
    "",
    [{"label": "Shape and size", "marks": 1},
     {"label": "Diagram", "marks": 2},
     {"label": "Internal parts", "marks": 1}],
    [
        step("s1_shape", "text", "Shape and size", 1, mark_note="Shape",
             lines=T("The structure of the sporozoite of Plasmodium was "
                     "studied by Garnham.",
                     "The sporozoite is sickle shaped. It is swollen in the "
                     "middle and pointed at both ends.",
                     "Its length is about 15 microns and its width is about "
                     "1 micron."),
             why="Shape and size are the two facts that identify the stage, and the sickle shape is what a student is asked to draw, so it is stated before anything inside is described.",
             cm=["Calling the sporozoite round. The round stage is the schizont.",
                 "Giving the size in millimetres. It is about 15 microns long."],
             tip="Sickle shaped, swollen in the middle, pointed at both ends, about 15 microns long.",
             margin="Three short lines: who studied it, the shape, the size."),
        step("s2_diagram", "diagram", "Diagram — sporozoite", 2, mark_note="Diagram",
             why="The parts sit in a fixed order from the tip backwards — apical cup, then the organelles, then the nucleus — so drawing them in that order fixes the internal plan in the memory.",
             cm=["Drawing the nucleus at the pointed anterior tip. The apical cup is at the tip; the nucleus lies behind the middle.",
                 "Drawing a round cell. The sporozoite is long and sickle shaped.",
                 "Leaving the pellicle unlabelled. It is the outer covering and carries a mark."],
             tip="Draw one long curved body first, then fill it from the tip backwards: cup, organelles, Golgi, nucleus.",
             margin="Label the apical cup, secretory organelles, pellicle, Golgi complex, nucleus, mitochondrion and microtubules."),
        step("s3_parts", "boxed_final", "Internal parts", 1, mark_note="Parts",
             lines=B("Apical cup with secretory organelles at the front",
                     "The body is covered by a pellicle, which carries "
                     "microtubules. These help the wriggling movement of "
                     "the sporozoite.",
                     "The cytoplasm contains a Golgi complex, endoplasmic "
                     "reticulum, mitochondria and a nucleus.",
                     "Convoluted tubules of unknown function are present.",
                     "An apical cup at the anterior end holds a pair of "
                     "secretory organelles. They produce a cytolytic "
                     "enzyme, which helps the sporozoite to enter the liver "
                     "cells."),
             why="The apical cup is the working end of the sporozoite: its enzyme opens the liver cell, which is the first event of the whole cycle in man.",
             cm=["Writing that the microtubules are inside the nucleus. They lie in the pellicle.",
                 "Leaving out the cytolytic enzyme. It is what lets the sporozoite enter the liver cell."],
             tip="The front end does the work: apical cup, two secretory organelles, one enzyme that opens the liver cell.",
             margin="Name every part in order from the outside in. The enzyme line is the closing mark."),
    ],
    "This is a structure question with a printed figure, so the labels carry most of the credit — the apical cup and the pellicle are the ones most often missed."))

# ── 186 (Star Q, SAQ) ────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_wuchereria_pathogenicity", "SAQ", "67", "Star Q 186",
    "Explain the pathogenicity of Wuchereria bancrofti in man.",
    "ts:2022",
    [{"label": "The worm and its place", "marks": 1},
     {"label": "Light infection", "marks": 1},
     {"label": "Heavy infection", "marks": 1},
     {"label": "Elephantiasis", "marks": 1}],
    [
        step("s1_worm", "text", "The worm and its place", 1, mark_note="Identity",
             lines=T("Wuchereria bancrofti is commonly called the filarial "
                     "worm.",
                     "The adult worms live coiled in the lymph vessels of "
                     "man, so every effect of this parasite falls on the "
                     "lymphatic system."),
             why="Every symptom in this answer comes from a blocked or inflamed lymph vessel, so naming the habitat first makes the rest of the answer follow on its own.",
             cm=["Writing that the worm lives in the blood vessels. The adult lives in the lymph vessels.",
                 "Confusing the adult with the microfilaria. The microfilaria is the larva in the blood."],
             tip="Adults in the lymph vessels, so the damage is lymphatic from start to finish.",
             margin="Two lines: the common name and the place it lives."),
        step("s2_light", "text", "Light infection", 1, mark_note="Light",
             lines=T("A light infection causes filarial fever, headache and "
                     "depression.",
                     "These are the first signs and they can be mistaken "
                     "for an ordinary fever."),
             why="The disease is graded by the number of worms, so the answer separates a light infection from a heavy one instead of describing one single illness.",
             cm=["Skipping the light infection and going straight to elephantiasis.",
                 "Writing that a light infection causes swelling. Swelling belongs to a heavy infection."],
             tip="Few worms, few signs: fever, headache and depression only.",
             margin="One short block. Do not spend more than two lines here."),
        step("s3_heavy", "text", "Heavy infection", 1, mark_note="Heavy",
             lines=T("A heavy infection inflames the lymph vessels and the "
                     "lymph glands. Inflammation of the lymph vessels is "
                     "called lymphangitis and inflammation of the lymph "
                     "glands is called lymphadenitis.",
                     "The dead worms clog the lymph vessels and the lymph "
                     "glands, so the lymph cannot drain and the affected "
                     "part swells."),
             why="The blockage is what turns the disease from a fever into a swelling, and the two named inflammations are the terms this chapter asks for again as a separate question.",
             cm=["Swapping the two terms. Lymphangitis is the vessels and lymphadenitis is the glands.",
                 "Writing that the living worms block the vessels. The dead worms clog them."],
             tip="Vessels and glands both inflame, then dead worms block them and the lymph cannot drain.",
             margin="Two lines: the two named inflammations, then the blockage and the swelling."),
        step("s4_elephantiasis", "boxed_final", "Elephantiasis", 1, mark_note="End result",
             lines=B("Elephantiasis is the final condition",
                     "Fibrous tissue collects near the swollen parts.",
                     "The sweat glands break down and the skin becomes "
                     "thick and rough.",
                     "This final condition is called elephantiasis. The "
                     "legs, the arms, the scrotum and the breasts are the "
                     "parts usually affected."),
             why="Elephantiasis is the end of the chain, not a separate disease, so it is written last and is described by the three changes that produce it.",
             cm=["Writing that elephantiasis appears at once. It is the end of a long, heavy infection.",
                 "Naming the condition without describing the fibrous tissue and the rough skin."],
             tip="Block, swell, harden: the swelling turns fibrous and the skin turns rough.",
             margin="Name the condition in the box, then three short lines. Closing mark."),
    ],
    "The answer is graded light to heavy to final, so keep the three stages separate — merging them loses two of the four marks."))

# ── 187 (Star Q, SAQ) ────────────────────────────────────────────────────────
W.append(card(
    "ts_ipe_z1_bhw_pneumonia", "SAQ", "67", "Star Q 187",
    "Write short notes on pneumonia and its prophylaxis.",
    "ts:2022",
    [{"label": "The disease and its cause", "marks": 1},
     {"label": "Mode of infection", "marks": 1},
     {"label": "Symptoms", "marks": 1},
     {"label": "Prophylaxis", "marks": 1}],
    [
        step("s1_cause", "text", "The disease and its cause", 1, mark_note="Cause",
             lines=T("Pneumonia is a bacterial disease of the lungs.",
                     "It is caused by the gram positive bacteria "
                     "Streptococcus pneumoniae and by Haemophilus "
                     "influenzae.",
                     "These bacteria infect the alveoli of the lungs."),
             why="The site of the infection is the alveoli, and that single fact explains both the symptom and the treatment written later in the answer.",
             cm=["Writing that pneumonia is a viral disease. It is bacterial.",
                 "Naming the bacteria without the site. The alveoli are where they settle."],
             tip="Two bacteria, one site: Streptococcus and Haemophilus in the alveoli.",
             margin="Three short lines: the disease, the two bacteria, the site."),
        step("s2_mode", "text", "Mode of infection", 1, mark_note="Spread",
             lines=T("The infection spreads when a healthy person inhales "
                     "the aerosols, that is the fine droplets, released by "
                     "an infected person while coughing or sneezing.",
                     "Sharing utensils with an infected person can also "
                     "pass on the infection."),
             why="The route decides the prevention, so naming the droplets here is what makes masks and boiled utensils the obvious measures at the end.",
             cm=["Writing that pneumonia spreads through water. It spreads through droplets in the air.",
                 "Leaving out the shared utensils, which is why boiled utensils appear in the prophylaxis."],
             tip="It travels in the air and on shared utensils, so masks and boiling stop it.",
             margin="Two lines, one route each."),
        step("s3_symptoms", "text", "Symptoms", 1, mark_note="Symptoms",
             lines=T("The infected alveoli fill with fluid, so the exchange "
                     "of gases is reduced.",
                     "The patient has severe difficulty in breathing, with "
                     "fever, cough and pain in the chest.",
                     "The lips and the finger nails may turn grey to blue "
                     "in a severe case."),
             why="The breathing difficulty is not a separate fact: it follows straight from fluid filling the alveoli, so the two lines are written as cause and effect.",
             cm=["Writing the symptoms without the fluid in the alveoli. The fluid is the reason for them.",
                 "Writing that pneumonia causes loose motions. It is a lung disease."],
             tip="Fluid in the alveoli means less gas exchange, so breathing becomes hard.",
             margin="Three short lines: the fluid, the breathing, the severe signs."),
        step("s4_prophylaxis", "boxed_final", "Prophylaxis", 1, mark_note="Prevention",
             lines=B("Masks, boiled utensils, vaccines, antibiotics",
                     "Use masks, so the droplets are not inhaled.",
                     "Use boiled utensils, so the bacteria on shared "
                     "utensils are killed.",
                     "Vaccines are available and give protection.",
                     "Antibiotics are used to treat a patient who has "
                     "already been infected."),
             why="Prophylaxis means stopping the disease before it starts, so the first three measures are preventive and the antibiotic is added last as treatment, not prevention.",
             cm=["Listing only antibiotics. Antibiotics treat; masks, boiled utensils and vaccines prevent.",
                 "Writing 'keep clean' with no measure named."],
             tip="Block the route, then build the defence: masks and boiling first, vaccine next, antibiotic last.",
             margin="Four named measures in the box, one line each. Closing mark."),
    ],
    "Prophylaxis is a separate mark from treatment, so name the preventive measures first and keep antibiotics to the end.",
    "SPELLING CORRECTED: the book prints the bacterial names as 'streptococcus pneumonia' and 'Haemophilus influenza'; the accepted binomials are Streptococcus pneumoniae and Haemophilus influenzae, which is what this card writes. ADDED BEYOND THE BOOK: the fluid-filled alveoli, the chest pain and the grey-to-blue lips and nails are standard NCERT and are not printed in this book's answer."))

report(W)
